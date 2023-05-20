function CronJob(CronTime, spawn) {
  function fnWrap(cmd) {
    let command;
    let args;

    if (typeof cmd === 'string') {
      args = cmd.split(' ');
      command = args.shift();

      return spawn.bind(undefined, command, args);
    }

    if (Array.isArray(cmd)) {
      command = cmd.command;
      if (command) {
        args = cmd.args;
        const options = cmd.options;

        return spawn.bind(undefined, command, args, options);
      }
    }

    return cmd;
  }

  function CJ(options) {
    const {
      cronTime,
      onTick,
      onComplete,
      startNow,
      timeZone,
      context,
      runOnInit,
      utcOffset,
      unrefTimeout,
    } = options;

    let _cronTime = cronTime;
    let argCount = Object.values(options).filter((val) => val !== undefined).length;

    if (typeof cronTime !== 'string' && argCount === 1) {
      // crontime is an object...
      _cronTime = cronTime.cronTime;
      this.context = cronTime.context || this;
      this.onComplete = fnWrap(cronTime.onComplete);
      this.unrefTimeout = cronTime.unrefTimeout;
      addCallback.call(this, fnWrap(cronTime.onTick));
      startNow = cronTime.start || cronTime.startNow || cronTime.startJob;
      timeZone = cronTime.timeZone;
      runOnInit = cronTime.runOnInit;
      utcOffset = cronTime.utcOffset;
    } else {
      this.context = context || this;
      this.onComplete = fnWrap(onComplete);
      this.unrefTimeout = unrefTimeout;
      addCallback.call(this, fnWrap(onTick));
    }

    this.cronTime = new CronTime(_cronTime, timeZone, utcOffset);

    if (runOnInit) {
      this.lastExecution = new Date();
      fireOnTick.call(this);
    }

    if (startNow) {
      start.call(this);
    }

    return this;
  }

  const addCallback = (callback) => {
    if (typeof callback === 'function') {
      this._callbacks.push(callback);
    }
  };
  CJ.prototype.addCallback = addCallback;

  CJ.prototype.setTime = function (time) {
    if (typeof time !== 'object') {
      throw new Error('time must be an instance of CronTime.');
    }
    const wasRunning = this.running;
    this.stop();
    this.cronTime = time;
    if (wasRunning) this.start();
  };

  CJ.prototype.nextDate = function () {
    return this.cronTime.sendAt();
  };

  const fireOnTick = function () {
    for (let i = this._callbacks.length - 1; i >= 0; i--) {
      this._callbacks[i].call(this.context, this.onComplete);
    }
  };
  CJ.prototype.fireOnTick = fireOnTick;

  CJ.prototype.nextDates = function (i) {
    return this.cronTime.sendAt(i);
  };

  const start = function () {
    if (this.running) {
      return;
    }

    const MAXDELAY = 2147483647;
    const self = this;
    let timeout = this.cronTime.getTimeout();
    let remaining = 0;
    let startTime;

    if (this.cronTime.realDate) {
      this.runOnce = true;
    }

    function _setTimeout(timeout) {
      startTime = Date.now();
      self._timeout = setTimeout(callbackWrapper, timeout);
      if (self.unrefTimeout && typeof self._timeout.unref === 'function') {
        self._timeout.unref();
      }
    }

    function callbackWrapper() {
      const diff = startTime + timeout - Date.now();

      if (diff > 0) {
        let newTimeout = self.cronTime.getTimeout();

        if (newTimeout > diff) {
          newTimeout = diff;
        }

        remaining += newTimeout;
      }

      self.lastExecution = new Date();
      if (remaining) {
        if (remaining > MAXDELAY) {
          remaining -= MAXDELAY;
          timeout = MAXDELAY;
        } else {
          timeout = remaining;
          remaining = 0;
        }

        _setTimeout(timeout);
      } else {
        self.running = false;

        if (!self.runOnce) {
          self.start();
        }

        self.fireOnTick();
      }
    }

    if (timeout >= 0) {
      this.running = true;

      if (timeout > MAXDELAY) {
        remaining = timeout - MAXDELAY;
        timeout = MAXDELAY;
      }

      _setTimeout(timeout);
    } else {
      this.stop();
    }
  };

  CJ.prototype.start = start;

  CJ.prototype.lastDate = function () {
    return this.lastExecution;
  };

  CJ.prototype.stop = function () {
    if (this._timeout) clearTimeout(this._timeout);
    this.running = false;
    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  };

  return CJ;
}

module.exports = CronJob;
