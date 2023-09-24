import { spawn } from 'child_process';
import { CronTime } from './time';
import { CronCommand, CronJobParams } from './types/cron.types';

export class CronJob {
	cronTime: CronTime;
	running: boolean = false;
	unrefTimeout: boolean = false;
	lastExecution: Date | null = null;
	runOnce: boolean = false;

	context: any;
	onComplete?: (...args: any) => any;

	private _timeout?: NodeJS.Timeout;
	private _callbacks: ((...args: any) => any)[] = [];

	constructor(
		cronTime: CronJobParams['cronTime'],
		onTick: CronJobParams['onTick'],
		onComplete?: CronJobParams['onComplete'],
		start?: CronJobParams['start'],
		timeZone?: CronJobParams['timeZone'],
		context?: CronJobParams['context'],
		runOnInit?: CronJobParams['runOnInit'],
		utcOffset?: CronJobParams['utcOffset'],
		unrefTimeout?: CronJobParams['unrefTimeout']
	) {
		let argCount = 0;
		for (let i = 0; i < arguments.length; i++) {
			if (arguments[i] !== undefined) {
				argCount++;
			}
		}

		this.context = context || this;
		this.cronTime = new CronTime(cronTime, timeZone, utcOffset);

		if (unrefTimeout !== undefined) {
			this.unrefTimeout = unrefTimeout;
		}

		if (onComplete !== null && onComplete !== undefined) {
			this.onComplete = this._fnWrap(onComplete);
		}

		if (this.cronTime.realDate) {
			this.runOnce = true;
		}

		this.addCallback(this._fnWrap(onTick));

		if (runOnInit) {
			this.lastExecution = new Date();
			this.fireOnTick();
		}

		if (start) this.start();
	}

	static from(params: CronJobParams) {
		return new CronJob(
			params.cronTime,
			params.onTick,
			params.onComplete,
			params.start,
			params.timeZone,
			params.context,
			params.runOnInit,
			params.utcOffset,
			params.unrefTimeout
		);
	}

	private _fnWrap(cmd: CronCommand | string) {
		switch (typeof cmd) {
			case 'function': {
				return cmd;
			}

			case 'string': {
				const [command, ...args] = cmd.split(' ');

				return spawn.bind(undefined, command ?? cmd, args);
			}

			case 'object': {
				const command = cmd && cmd.command;

				const args = cmd.args;
				const options = cmd.options;

				return spawn.bind(undefined, command, args ?? [], options ?? {});
			}
		}
	}

	addCallback(callback: (...args: any) => any) {
		if (typeof callback === 'function') {
			this._callbacks.push(callback);
		}
	}

	setTime(time: CronTime) {
		if (!(time instanceof CronTime)) {
			throw new Error('time must be an instance of CronTime.');
		}
		const wasRunning = this.running;
		this.stop();
		this.cronTime = time;
		if (wasRunning) this.start();
	}

	nextDate() {
		return this.cronTime.sendAt();
	}

	fireOnTick() {
		for (let callback of this._callbacks) {
			callback.call(this.context, this.onComplete);
		}
	}

	nextDates(i: number) {
		return this.cronTime.sendAt(i || 0);
	}

	start() {
		if (this.running) {
			return;
		}

		const MAXDELAY = 2147483647; // The maximum number of milliseconds setTimeout will wait.
		let timeout = this.cronTime.getTimeout();
		let remaining = 0;
		let startTime: number;

		const _setTimeout = (t: number) => {
			startTime = Date.now();
			this._timeout = setTimeout(callbackWrapper, t);
			if (this.unrefTimeout && typeof this._timeout.unref === 'function') {
				this._timeout.unref();
			}
		};

		// The callback wrapper checks if it needs to sleep another period or not
		// and does the real callback logic when it's time.
		const callbackWrapper = () => {
			const diff = startTime + timeout - Date.now();

			if (diff > 0) {
				let newTimeout = this.cronTime.getTimeout();

				if (newTimeout > diff) {
					newTimeout = diff;
				}

				remaining += newTimeout;
			}

			// If there is sleep time remaining, calculate how long and go to sleep
			// again. This processing might make us miss the deadline by a few ms
			// times the number of sleep sessions. Given a MAXDELAY of almost a
			// month, this should be no issue.
			this.lastExecution = new Date();
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

				this.running = false;

				// start before calling back so the callbacks have the ability to stop the cron job
				if (!this.runOnce) {
					this.start();
				}

				this.fireOnTick();
			}
		};

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
	}

	lastDate() {
		return this.lastExecution;
	}

	/**
	 * Stop the cronjob.
	 */
	stop() {
		if (this._timeout) clearTimeout(this._timeout);
		this.running = false;
		if (typeof this.onComplete === 'function') {
			this.onComplete();
		}
	}
}
