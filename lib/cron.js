function CronTime(time) {
  this.source = time;

  this.second     = {};
  this.minute     = {};
  this.hour       = {};
  this.dayOfWeek  = {};
  this.dayOfMonth = {};
  this.month      = {};

  if (!(this.source instanceof Date)) {
    this._parse();
  } else {
    this.realDate = true;
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
    var date = (this.source instanceof Date) ? this.source : new Date();

    //add 1 second so next time isn't now (can cause timeout to be 0)
    date.setSeconds(date.getSeconds() + 1);
    
    if (!(this.realDate)) {
      var i = 1000;

      //sanity check
      while(--i) {
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
          date.setHours(date.getHours()+1);
          date.setMinutes(0);
          continue;
        }

        if (!(date.getMinutes() in this.minute)) {
          date.setMinutes(date.getMinutes()+1);
          date.setSeconds(0);
          continue;
        }

        if(!(date.getSeconds() in this.second)) {
          date.setSeconds(date.getSeconds()+1);
          continue;
        }

        break;
      }
    }

    return date;
  },

  /**
   * Get the number of seconds in the future at which to fire our callbacks.
   */
  getTimeout: function() {
    return Math.max(-1, this.sendAt().getTime() - Date.now());
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



function CronJob(cronTime, onTick, onComplete, start) {
  if (typeof cronTime != "string" && arguments.length == 1) {
    //crontime is an object...
    onTick = cronTime.onTick;
    onComplete = cronTime.onComplete;
    start = cronTime.start;
    cronTime = cronTime.cronTime;
  }

  this._callbacks = [];
  this.onComplete = onComplete;
  this.cronTime   = new CronTime(cronTime);

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
    var timeout = this.cronTime.getTimeout();

    if (timeout >= 0) {
      this.running = true;
      this._timeout = setTimeout(function(self) {
            self.running = false;

            //start before calling back so the callbacks have the ability to stop the cron job
            self.start();

            self._callback();
          }, timeout, this);
    } else {
      this.running = false;
    }
  },

  /**
   * Stop the cronjob.
   */
  stop: function()
  {
    clearTimeout(this._timeout);
    this.running = false;
    //if (this.onComplete) this.onComplete();
  }
};


exports.job = function(cronTime, onTick, onComplete) {
  return new CronJob(cronTime, onTick, onComplete);
}

exports.time = function(cronTime) {
  return new CronTime(cronTime);
}

exports.sendAt = function(cronTime) {
  return exports.time(cronTime).sendAt();
}

exports.timeout = function(cronTime) {
  return exports.time(cronTime).getTimeout();
}


exports.CronJob = CronJob;
exports.CronTime = CronTime;

