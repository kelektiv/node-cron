import { spawn } from 'child_process';
import { ExclusiveParametersError } from './errors';
import { CronTime } from './time';
import {
	CronCallback,
	CronCommand,
	CronContext,
	CronJobParams
} from './types/cron.types';

export class CronJob<C = null> {
	cronTime: CronTime;
	running = false;
	unrefTimeout = false;
	lastExecution: Date | null = null;
	runOnce = false;
	context: CronContext<C>;
	onComplete?: CronCallback<C>;

	private _timeout?: NodeJS.Timeout;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _callbacks: ((...args: any) => void)[] = [];

	constructor(
		cronTime: CronJobParams<C>['cronTime'],
		onTick: CronJobParams<C>['onTick'],
		onComplete?: CronJobParams<C>['onComplete'],
		start?: CronJobParams<C>['start'],
		timeZone?: CronJobParams<C>['timeZone'],
		context?: CronJobParams<C>['context'],
		runOnInit?: CronJobParams<C>['runOnInit'],
		utcOffset?: null,
		unrefTimeout?: CronJobParams<C>['unrefTimeout']
	);
	constructor(
		cronTime: CronJobParams<C>['cronTime'],
		onTick: CronJobParams<C>['onTick'],
		onComplete?: CronJobParams<C>['onComplete'],
		start?: CronJobParams<C>['start'],
		timeZone?: null,
		context?: CronJobParams<C>['context'],
		runOnInit?: CronJobParams<C>['runOnInit'],
		utcOffset?: CronJobParams<C>['utcOffset'],
		unrefTimeout?: CronJobParams<C>['unrefTimeout']
	);
	constructor(
		cronTime: CronJobParams<C>['cronTime'],
		onTick: CronJobParams<C>['onTick'],
		onComplete?: CronJobParams<C>['onComplete'],
		start?: CronJobParams<C>['start'],
		timeZone?: CronJobParams<C>['timeZone'],
		context?: CronJobParams<C>['context'],
		runOnInit?: CronJobParams<C>['runOnInit'],
		utcOffset?: CronJobParams<C>['utcOffset'],
		unrefTimeout?: CronJobParams<C>['unrefTimeout']
	) {
		this.context = (context ?? this) as CronContext<C>;

		// runtime check for JS users
		if (timeZone != null && utcOffset != null) {
			throw new ExclusiveParametersError('timeZone', 'utcOffset');
		}

		if (timeZone != null) {
			this.cronTime = new CronTime(cronTime, timeZone, null);
		} else if (utcOffset != null) {
			this.cronTime = new CronTime(cronTime, null, utcOffset);
		} else {
			this.cronTime = new CronTime(cronTime, timeZone, utcOffset);
		}

		if (unrefTimeout != null) {
			this.unrefTimeout = unrefTimeout;
		}

		if (onComplete != null) {
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

	static from<C = null>(params: CronJobParams<C>) {
		// runtime check for JS users
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (params.timeZone != null && params.utcOffset != null) {
			throw new ExclusiveParametersError('timeZone', 'utcOffset');
		}

		if (params.timeZone != null) {
			return new CronJob<C>(
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
		} else if (params.utcOffset != null) {
			return new CronJob<C>(
				params.cronTime,
				params.onTick,
				params.onComplete,
				params.start,
				null,
				params.context,
				params.runOnInit,
				params.utcOffset,
				params.unrefTimeout
			);
		} else {
			return new CronJob<C>(
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
	}

	private _fnWrap(cmd: CronCommand<C>) {
		switch (typeof cmd) {
			case 'function': {
				return cmd;
			}

			case 'string': {
				const [command, ...args] = cmd.split(' ');

				return spawn.bind(undefined, command ?? cmd, args, {});
			}

			case 'object': {
				return spawn.bind(
					undefined,
					cmd.command,
					cmd.args ?? [],
					cmd.options ?? {}
				);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	addCallback(callback: (...args: any) => void) {
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
		for (const callback of this._callbacks) {
			callback.call(this.context, this.onComplete);
		}
	}

	nextDates(i?: number) {
		return this.cronTime.sendAt(i ?? 0);
	}

	start() {
		if (this.running) {
			return;
		}

		const MAXDELAY = 2147483647; // The maximum number of milliseconds setTimeout will wait.
		let timeout = this.cronTime.getTimeout();
		let remaining = 0;
		let startTime: number;

		const setCronTimeout = (t: number) => {
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

				setCronTimeout(timeout);
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

			setCronTimeout(timeout);
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
			this.onComplete.call(this.context);
		}
	}
}
