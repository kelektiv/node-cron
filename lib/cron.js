var exports,
		spawn = require('child_process').spawn,
		moment = require('moment-timezone'),
		CronParser = require('cron-parser');

function command2function(cmd) {
	switch (typeof cmd) {
		case 'string':
			var args = cmd.split(' ');
			var command = args.shift();

			cmd = spawn.bind(undefined, command, args);
			break;
		case 'object':
			var command = cmd && cmd.command;
			if (command) {
				var args = cmd.args;
				var options = cmd.options;

				cmd = spawn.bind(undefined, command, args, options);
			}
			break;
	}

	return cmd
}

function CronJob(cronTime, onTick, onComplete, startNow, timeZone, context) {
	if (typeof cronTime != "string" && arguments.length == 1) {
		onTick = cronTime.onTick;
		onComplete = cronTime.onComplete;
		context = cronTime.context;
		startNow = cronTime.start;
		timeZone = cronTime.timeZone;
		cronTime = cronTime.cronTime;
	}


	this.context = (context || this);
	this._callbacks = [];
	this.onComplete = command2function(onComplete);
	setTime.call(this, cronTime);
	addCallback.call(this, command2function(onTick));

	if (startNow) start.call(this);

	return this;
}

CronJob.prototype.setTime = setTime = function(cronTime) {
	var self = this;
	self.realDate = (cronTime instanceof Date);
	self.cronTime = {
		syntax: cronTime,
		next: function() {
			var date;

			if (!self.realDate) {
				console.log(this.syntax);
				date = moment(CronParser.parseExpression(this.syntax).next());
			} else {
				date = moment(this.syntax);

				if (self.zone)
					date = date.utcOffset(self.zone);
			}

			return date;
		}
	};
}

CronJob.prototype.addCallback = addCallback = function(callback) {
	if (typeof callback == 'function') this._callbacks.push(callback);
}

CronJob.prototype.getTimeout = function() {
	var timeout = 1000 + (this.cronTime.next() - moment());
	console.log('timeout: ' + timeout);

	return timeout;
}

CronJob.prototype.start = start = function() {
	if (this.running) return;

	var MAXDELAY = 2147483647; // The maximum number of milliseconds setTimeout will wait.
	var self = this;
	var timeout = this.getTimeout();
	var remaining = 0;

	if (this.realDate)
		this.runOnce = true;

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
			self.running = false;

			//start before calling back so the callbacks have the ability to stop the cron job
			if (!(self.runOnce)) self.start();

			for (var i = (self._callbacks.length - 1); i >= 0; i--)
				self._callbacks[i].call(self.context, self.onComplete);
		}
	}

	if (timeout >= 0) {
		this.running = true;

		// Don't try to sleep more than MAXDELAY ms at a time.

		if (timeout > MAXDELAY) {
			remaining = timeout - MAXDELAY;
			timeout = MAXDELAY;
		}

		this._timeout = setTimeout(callbackWrapper, timeout);
	} else {
		this.stop();
	}
}

/**
 * Stop the cronjob.
 */
CronJob.prototype.stop = function() {
	if (this._timeout)
		clearTimeout(this._timeout);
	this.running = false;
	if (typeof this.onComplete == 'function') this.onComplete();
}

if (exports) {
	exports.job = function(cronTime, onTick, onComplete) {
		return new CronJob(cronTime, onTick, onComplete);
	}

	exports.CronJob = CronJob;
}
