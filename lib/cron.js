/**
 * cron.js
 * ---
 * VERSION 0.1
 * ---
 * @author James Padolsey
 * ---
 * Dual licensed under the MIT and GPL licenses.
 *    - http://www.opensource.org/licenses/mit-license.php
 *    - http://www.gnu.org/copyleft/gpl.html
 */


function CronTime(time) {

  this.source = time;

  this.second     = {};
  this.minute     = {};
  this.hour       = {};
  this.dayOfWeek  = {};
  this.dayOfMonth = {};
  this.month      = {};

  this._parse();

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

  sendAt: function(start) {

    var date = start ? start : new Date();

    //add 1 second so next time isn't now (can cause timeout to be 0)
    date.setSeconds(date.getSeconds() + 1);
    
    while(1)
    {
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
        continue;
      }

      if(!(date.getSeconds() in this.second)) {
        date.setSeconds(date.getSeconds()+1);
        continue;
      }

      break;
    }


    return date;
  },

  /**
   */


  timeout: function()
  {
    return Math.max(0, this.sendAt().getTime() - Date.now());
  },


  /**
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
   */

  _parseField: function(field, type, constraints) {

    var rangePattern = /(\d+?)(?:-(\d+?))?(?:\/(\d+?))?(?:,|$)/g,
    typeObj = this[type],
    diff,
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



function CronJob(cronTime, onComplete) {

  this._callbacks = [];
  this.cronTime   = new CronTime(cronTime);

  this.addCallback(onComplete);

  this.start();
}

CronJob.prototype = {


  /**
   */

  addCallback: function(callback) {

    //only functions
    if(typeof callback == 'function') this._callbacks.push(callback);
  },

  /**
   */

  _callback: function() {

    for (var i = this._callbacks.length; i--;) { 

      //send this so the callback can call this.stop();
      this._callbacks[i].call(this);
    }
  },


  /**
   */

  start: function() {

    if(this.running) return;
    this.running = true;  


    this._timeout = setTimeout(function(self)
    {
        
      self.running = false;
      
      //start before calling back so the callbacks have the ability to stop the cron job
      self.start();

      self._callback();


    }, this.cronTime.timeout(), this);

  },

  /**
   */


  stop: function()
  {
    clearTimeout(this._timeout);
  }

};


module.exports = function(cronTime, onComplete)
{
  return new CronJob(cronTime, onComplete);
}

exports.CronJob = CronJob;
exports.CronTime = CronTime;

