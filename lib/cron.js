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

  this.map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  this.constraints = [[0,59],[0,59],[0,23],[1,31],[0,11],[1,7]];
  this.aliases = {
    jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
    sun:1,mon:2,tue:3,wed:4,thu:5,fri:6,sat:7
  };

  this.second = {};
  this.minute = {};
  this.hour = {};
  this.dayOfMonth = {};
  this.month = {};
  this.dayOfWeek = {};

  this._parse();

};

CronTime.prototype = {
  _parse: function() {

    var aliases = this.aliases,
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
      this._parseField(cur, this.map[len], this.constraints[len]);
    }

  },
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


function CronJob(cronTime, event, oncomplete) {

  if (!(this instanceof CronJob)) {
    return new CronJob(cronTime, event);
  }

  this.events = [event];
  this.cronTime = new CronTime(cronTime);
  this.now = {};
  this.initiated = false;
  this.oncomplete = oncomplete;

  this.clock();

}

CronJob.prototype = {

  addEvent: function(event) {
    this.events.push(event);
  },

  runEvents: function() {
    for (var i = -1, l = this.events.length; ++i < l; ) {
      if (typeof this.events[i] === 'function') {
        this.events[i](this.oncomplete);
      }
    }
  },

  clock: function() {

    var date = new Date,
    now = this.now,
    self = this,
    cronTime = this.cronTime,
    i;

    if (!this.initiated) {
      // Make sure we start the clock precisely ON the 0th millisecond
      setTimeout(function(){
                   self.initiated = true;
                   self.clock();
                 }, Math.ceil(+date / 1000) * 1000 - +date);
      return;
    }

    this.timer = this.timer || setInterval(function(){self.clock();}, 1000);

    now.second = date.getSeconds();
    now.minute = date.getMinutes();
    now.hour = date.getHours();
    now.dayOfMonth = date.getDate();
    now.month = date.getMonth();
    now.dayOfWeek = date.getDay() + 1;

    for (i in now) {
      if (!(now[i] in cronTime[i])) {
        return;
      }
    }

    this.runEvents();

  }

};

exports.CronJob = CronJob;
exports.CronTime = CronTime;
