var CronDate = Date;
try {
  CronDate = require("time").Date;
} catch(e) {
  //no time module...leave CronDate alone. :)
}


function CronTime(source, zone) {
  this.source = source;
  this.zone   = zone;

  this.second     = {};
  this.minute     = {};
  this.hour       = {};
  this.dayOfWeek  = {};
  this.dayOfMonth = {};
  this.month      = {};

  if ((this.source instanceof Date) || (this.source instanceof CronDate)) {
    this.source = new CronDate(this.source);
    this.realDate = true;
  } else {
    this._parse();
  }
};

CronTime.map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
CronTime.constraints = [ [0, 59], [0, 59], [0, 23], [1, 31], [0, 11], [1, 7] ];
CronTime.aliases = {
    jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
    sun:1, mon:2, tue:3, wed:4, thu:5, fri:6, sat:7
};


CronTime.prototype = {
  /**
   * calculates the next send time
   */
  sendAt: function() {
    var date = (this.source instanceof CronDate) ? this.source : new CronDate();
    if (this.zone && date.setTimezone)
      date.setTimezone(this.zone);
    
    //add 1 second so next time isn't now (can cause timeout to be 0)
    date.setSeconds(date.getSeconds() + 1);
    
    if (this.realDate) {
      return date;
    }
    return this._getNextDateFrom(date);
  },

  /**
   * Get the number of seconds in the future at which to fire our callbacks.
   */
  getTimeout: function() {
    return Math.max(-1, this.sendAt().getTime() - CronDate.now());
  },

  /** 
   * writes out a cron string
   */
  toString: function() {
    return this.toJSON().join(' ');
  },

  /**
   * Json representation of the parsed cron syntax.
   */
  toJSON: function() {
    return [
      this._wcOrAll('second'), 
      this._wcOrAll('minute'), 
      this._wcOrAll('hour'), 
      this._wcOrAll('dayOfMonth'), 
      this._wcOrAll('month'), 
      this._wcOrAll('dayOfWeek')
    ];
  },

  /**
   * get next date that matches parsed cron time
   */
  _getNextDateFrom: function(start) {
    var date = new CronDate(start);
    if (this.zone && date.setTimezone)
      date.setTimezone(start.getTimezone());
    
    //sanity check
    var i = 1000;
    while(--i) {
      var diff = date - start;
      
      if (!(date.getMonth() in this.month)) {
        date.setMonth(date.getMonth()+1);
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        continue;
      }

      if (!(date.getDate() in this.dayOfMonth)) {
        date.setDate(date.getDate()+1);
        date.setHours(0);
        date.setMinutes(0);
        continue;
      }

      if (!(date.getDay()+1 in this.dayOfWeek)) {
        date.setDate(date.getDate()+1);
        date.setHours(0);
        date.setMinutes(0);
        continue;
      }
      
      if (!(date.getHours() in this.hour)) {
        date.setHours(date.getHours() == 23 && diff > 24*60*60*1000 ? 0 : date.getHours()+1);
        date.setMinutes(0);
        continue;
      }
      
      if (!(date.getMinutes() in this.minute)) {
        date.setMinutes(date.getMinutes() == 59 && diff > 60*60*1000 ? 0 : date.getMinutes()+1);
        date.setSeconds(0);
        continue;
      }
      
      if (!(date.getSeconds() in this.second)) {
        date.setSeconds(date.getSeconds() == 59 && diff > 60*1000 ? 0 : date.getSeconds()+1);
        continue;
      }
      
      break;
    }
    
    return date;
  },

  /**
   * wildcard, or all params in array (for to string)
   */
  _wcOrAll: function(type) {
    if(this._hasAll(type)) return '*';

    var all = [];
    for(var time in this[type]) {
      all.push(time);
    }

    return all.join(',');
  },

  /**
   */
  _hasAll: function(type) {
    var constrain = CronTime.constraints[CronTime.map.indexOf(type)];

    for(var i = constrain[0], n = constrain[1]; i < n; i++) {
      if(!(i in this[type])) return false;
    }

    return true;
  },


  /**
   * Parse the cron syntax.
   */
  _parse: function() {
    var aliases = CronTime.aliases,
    source = this.source.replace(/[a-z]{1,3}/ig, function(alias){
      alias = alias.toLowerCase();

      if (alias in aliases) {
        return aliases[alias];
      }

      throw new Error('Unknown alias: ' + alias);
    }),
    split = source.replace(/^\s\s*|\s\s*$/g, '').split(/\s+/),
    cur, len = 6;
    
    while (len--) {
      cur = split[len] || '*';
      this._parseField(cur, CronTime.map[len], CronTime.constraints[len]);
    }
  },

  /**
   * Parse a field from the cron syntax.
   */
  _parseField: function(field, type, constraints) {
    var rangePattern = /(\d+?)(?:-(\d+?))?(?:\/(\d+?))?(?:,|$)/g,
    typeObj = this[type],
    diff, pointer,
    low = constraints[0],
    high = constraints[1];

    // * is a shortcut to [lower-upper] range
    field = field.replace(/\*/g,  low + '-' + high);

    if (field.match(rangePattern)) {
      field.replace(rangePattern, function($0, lower, upper, step) {
                      step = parseInt(step) || 1;

                      // Positive integer higher than constraints[0]
                      lower = Math.max(low, ~~Math.abs(lower));

                      // Positive integer lower than constraints[1]
                      upper = upper ? Math.min(high, ~~Math.abs(upper)) : lower;

                      // Count from the lower barrier to the upper
                      pointer = lower;

                      do {
                          typeObj[pointer] = true
                          pointer += step;
                      } while(pointer <= upper);

                    });
    } else {
      throw new Error('Field (' + field + ') cannot be parsed');
    }
  }
};



function CronJob(cronTime, onTick, onComplete, start, timeZone) {
  if (typeof cronTime != "string" && arguments.length == 1) {
    //crontime is an object...
    onTick = cronTime.onTick;
    onComplete = cronTime.onComplete;
    start = cronTime.start;
    timeZone = cronTime.timeZone;
    cronTime = cronTime.cronTime;
  }

  if (timeZone && !(CronDate.prototype.setTimezone)) console.log('You specified a Timezone but have not included the `time` module. Timezone functionality is disabled. Please install the `time` module to use Timezones in your application.');

  this._callbacks = [];
  this.onComplete = onComplete;
  this.cronTime   = new CronTime(cronTime, timeZone);

  this.addCallback(onTick);

  if (start) this.start();

  return this;
}

CronJob.prototype = {
  /**
   * Add a method to fire onTick
   */
  addCallback: function(callback) {
    //only functions
    if(typeof callback == 'function') this._callbacks.push(callback);
  },

  /**
   * Fire all callbacks registered.
   */
  _callback: function() {
    for (var i = (this._callbacks.length - 1); i >= 0; i--) { 

      //send this so the callback can call this.stop();
      this._callbacks[i].call(this, this.onComplete);
    }
  },


  /**
   * Start the cronjob.
   */
  start: function() {
    if(this.running) return;

    var MAXDELAY = 2147483647; // The maximum number of milliseconds setTimeout will wait.
    var self = this;
    var timeout = this.cronTime.getTimeout();
    var remaining = 0;

    if (this.cronTime.realDate) this.runOnce = true;

    // The callback wrapper checks if it needs to sleep another period or not
    // and does the real callback logic when it's time.

    function callbackWrapper() {

      // If there is sleep time remaining, calculate how long and go to sleep
      // again. This processing might make us miss the deadline by a few ms
      // times the number of sleep sessions. Given a MAXDELAY of almost a
      // month, this should be no issue.

      if (remaining) {
        if (remaining > MAXDELAY) {
          remaining -= MAXDELAY;
          timeout = MAXDELAY;
        } else {
          timeout = remaining;
          remaining = 0;
        }

        self._timeout = setTimeout(callbackWrapper, timeout);
      } else {

        // We have arrived at the correct point in time.

        self.running = false;

        //start before calling back so the callbacks have the ability to stop the cron job
        if (!(self.runOnce)) self.start();

        self._callback();
      }
    }

    if (timeout >= 0) {
      this.running = true;

      // Don't try to sleep more than MAXDELAY ms at a time.

      if (timeout > MAXDELAY) {
        remaining = timeout - MAXDELAY;
        console.log('WARNING: timeout specified (' + timeout + ') was greater than the max of ' + MAXDELAY + '.');
        timeout = MAXDELAY;
      }

      this._timeout = setTimeout(callbackWrapper, timeout);
    } else {
      this.stop();
    }
  },

  /**
   * Stop the cronjob.
   */
  stop: function()
  {
    clearTimeout(this._timeout);
    this.running = false;
    if (this.onComplete) this.onComplete();
  }
};


exports.job = function(cronTime, onTick, onComplete) {
  return new CronJob(cronTime, onTick, onComplete);
}

exports.time = function(cronTime, timeZone) {
  return new CronTime(cronTime, timeZone);
}

exports.sendAt = function(cronTime) {
  return exports.time(cronTime).sendAt();
}

exports.timeout = function(cronTime) {
  return exports.time(cronTime).getTimeout();
}


exports.CronJob = CronJob;
exports.CronTime = CronTime;

