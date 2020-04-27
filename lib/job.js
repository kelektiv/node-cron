function CronJob(CronTime, spawn) {
	function fnWrap(cmd) {
		var command;
		var args;

		switch (typeof cmd) {
			case 'string':
				args = cmd.split(' ');
				command = args.shift();

				return spawn.bind(undefined, command, args);

			case 'object':
				command = cmd && cmd.command;
				if (command) {
					args = cmd.args;
					var options = cmd.options;

					return spawn.bind(undefined, command, args, options);
				}
				break;
		}

		return cmd;
	}

	function CJ(
		cronTime,
		onTick,
		onComplete,
		startNow,
		timeZone,
		context,
		runOnInit,
		utcOffset,
		unrefTimeout
	) {
		var _cronTime = cronTime;
		var argCount = 0;
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i] !== undefined) {
				argCount++;
			}
		}

		if (typeof cronTime !== 'string' && argCount === 1) {
			// crontime is an object...
			onTick = cronTime.onTick;
			onComplete = cronTime.onComplete;
			context = cronTime.context;
			startNow = cronTime.start || cronTime.startNow || cronTime.startJob;
			timeZone = cronTime.timeZone;
			runOnInit = cronTime.runOnInit;
			_cronTime = cronTime.cronTime;
			utcOffset = cronTime.utcOffset;
			unrefTimeout = cronTime.unrefTimeout;
		}

		this.context = context || this;
		this._callbacks = [];
		this.onComplete = fnWrap(onComplete);
		this.cronTime = new CronTime(_cronTime, timeZone, utcOffset);
		this.unrefTimeout = unrefTimeout;

		addCallback.call(this, fnWrap(onTick));

		if (runOnInit) {
			this.lastExecution = new Date();
			fireOnTick.call(this);
		}

		if (startNow) {
			start.call(this);
		}

		return this;
	}

	var addCallback = function (callback) {
		if (typeof callback === 'function') {
			this._callbacks.push(callback);
		}
	};
	CJ.prototype.addCallback = addCallback;

	CJ.prototype.setTime = function (time) {
		if (typeof time !== 'object') {
			// crontime is an object...
			throw new Error('time must be an instance of CronTime.');
		}
		this.stop();
		this.cronTime = time;
		this.start();
	};

	CJ.prototype.nextDate = function () {
		return this.cronTime.sendAt();
	};

	var fireOnTick = function () {
		for (var i = this._callbacks.length - 1; i >= 0; i--) {
			this._callbacks[i].call(this.context, this.onComplete);
		}
	};
	CJ.prototype.fireOnTick = fireOnTick;

	CJ.prototype.nextDates = function (i) {
		return this.cronTime.sendAt(i);
	};

	var start = function () {
		if (this.running) {
			return;
		}

		var MAXDELAY = 2147483647; // The maximum number of milliseconds setTimeout will wait.
		var self = this;
		var timeout = this.cronTime.getTimeout();
		var remaining = 0;
		var startTime;

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

		// The callback wrapper checks if it needs to sleep another period or not
		// and does the real callback logic when it's time.
		function callbackWrapper() {
			var diff = startTime + timeout - Date.now();

			if (diff > 0) {
				var newTimeout = self.cronTime.getTimeout();

				if (newTimeout > diff) {
					newTimeout = diff;
				}

				remaining += newTimeout;
			}

			// If there is sleep time remaining, calculate how long and go to sleep
			// again. This processing might make us miss the deadline by a few ms
			// times the number of sleep sessions. Given a MAXDELAY of almost a
			// month, this should be no issue.
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
				// We have arrived at the correct point in time.

				self.running = false;

				// start before calling back so the callbacks have the ability to stop the cron job
				if (!self.runOnce) {
					self.start();
				}

				self.fireOnTick();
			}
		}

		if (timeout >= 0) {
			this.running = true;

			// Don't try to sleep more than MAXDELAY ms at a time.

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

	/**
	 * Stop the cronjob.
	 */
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
