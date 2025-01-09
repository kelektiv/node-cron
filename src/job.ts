import { spawn } from 'child_process';
import { CronError, ExclusiveParametersError } from './errors';
import { CronTime } from './time';
import {
	CronCallback,
	CronCommand,
	CronContext,
	CronJobParams,
	CronOnCompleteCallback,
	CronOnCompleteCommand,
	WithOnComplete
} from './types/cron.types';

export class CronJob<OC extends CronOnCompleteCommand | null = null, C = null> {
	cronTime: CronTime;
	running = false;
	unrefTimeout = false;
	lastExecution: Date | null = null;
	runOnce = false;
	context: CronContext<C>;
	onComplete?: WithOnComplete<OC> extends true
		? CronOnCompleteCallback
		: undefined;
	waitForCompletion = false;
	errorHandler?: CronJobParams<OC, C>['errorHandler'];

	private _isCallbackRunning = false;
	private _timeout?: NodeJS.Timeout;
	private _callbacks: CronCallback<C, WithOnComplete<OC>>[] = [];

	get isCallbackRunning() {
		return this._isCallbackRunning;
	}

	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: CronJobParams<OC, C>['timeZone'],
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: null,
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler']
	);
	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: null,
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: CronJobParams<OC, C>['utcOffset'],
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler']
	);
	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: CronJobParams<OC, C>['timeZone'],
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: CronJobParams<OC, C>['utcOffset'],
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler']
	) {
		this.context = (context ?? this) as CronContext<C>;
		this.waitForCompletion = Boolean(waitForCompletion);

		this.errorHandler = errorHandler;

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
			// casting to the correct type since we just made sure that WithOnComplete<OC> = true
			this.onComplete = this._fnWrap(
				onComplete
			) as WithOnComplete<OC> extends true ? CronOnCompleteCallback : undefined;
		}

		if (this.cronTime.realDate) {
			this.runOnce = true;
		}

		this.addCallback(this._fnWrap(onTick));

		if (runOnInit) {
			this.lastExecution = new Date();
			void this.fireOnTick();
		}

		if (start) this.start();
	}

	static from<OC extends CronOnCompleteCommand | null = null, C = null>(
		params: CronJobParams<OC, C>
	) {
		// runtime check for JS users
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (params.timeZone != null && params.utcOffset != null) {
			throw new ExclusiveParametersError('timeZone', 'utcOffset');
		}

		if (params.timeZone != null) {
			return new CronJob<OC, C>(
				params.cronTime,
				params.onTick,
				params.onComplete,
				params.start,
				params.timeZone,
				params.context,
				params.runOnInit,
				params.utcOffset,
				params.unrefTimeout,
				params.waitForCompletion,
				params.errorHandler
			);
		} else if (params.utcOffset != null) {
			return new CronJob<OC, C>(
				params.cronTime,
				params.onTick,
				params.onComplete,
				params.start,
				null,
				params.context,
				params.runOnInit,
				params.utcOffset,
				params.unrefTimeout,
				params.waitForCompletion,
				params.errorHandler
			);
		} else {
			return new CronJob<OC, C>(
				params.cronTime,
				params.onTick,
				params.onComplete,
				params.start,
				params.timeZone,
				params.context,
				params.runOnInit,
				params.utcOffset,
				params.unrefTimeout,
				params.waitForCompletion,
				params.errorHandler
			);
		}
	}

	private _fnWrap(cmd: CronCommand<C, boolean>): CronCallback<C, boolean> {
		switch (typeof cmd) {
			case 'function': {
				return cmd;
			}

			case 'string': {
				const [command, ...args] = cmd.split(' ');

				return spawn.bind(undefined, command ?? cmd, args, {}) as () => void;
			}

			case 'object': {
				return spawn.bind(
					undefined,
					cmd.command,
					cmd.args ?? [],
					cmd.options ?? {}
				) as () => void;
			}
		}
	}

	addCallback(callback: CronCallback<C, WithOnComplete<OC>>) {
		if (typeof callback === 'function') {
			this._callbacks.push(callback);
		}
	}

	setTime(time: CronTime) {
		if (!(time instanceof CronTime)) {
			throw new CronError('time must be an instance of CronTime.');
		}

		const wasRunning = this.running;
		this.stop();

		this.cronTime = time;
		if (time.realDate) this.runOnce = true;

		if (wasRunning) this.start();
	}

	nextDate() {
		return this.cronTime.sendAt();
	}

	async fireOnTick() {
		// skip job if previous callback is still running
		if (this.waitForCompletion && this._isCallbackRunning) return;

		this._isCallbackRunning = true;

		try {
			for (const callback of this._callbacks) {
				const result = callback.call(
					this.context,
					this.onComplete as WithOnComplete<OC> extends true
						? CronOnCompleteCallback
						: never
				);

				if (this.waitForCompletion) await result;
			}
		} catch (error) {
			if (this.errorHandler != null) this.errorHandler(error);
			else console.error('[Cron] error in callback', error);
		} finally {
			this._isCallbackRunning = false;
		}
	}

	nextDates(i?: number) {
		return this.cronTime.sendAt(i ?? 0);
	}

	start() {
		if (this.running) return;

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
				this.lastExecution = new Date();

				this.running = false;

				// start before calling back so the callbacks have the ability to stop the cron job
				if (!this.runOnce) this.start();

				void this.fireOnTick();
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

	private async _executeOnComplete() {
		if (typeof this.onComplete !== 'function') return;

		try {
			await this.onComplete.call(this.context);
		} catch (error) {
			console.error('[Cron] error in onComplete callback:', error);
		}
	}

	private async _waitForJobCompletion() {
		while (this._isCallbackRunning) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	/**
	 * Stop the cronjob.
	 */
	stop() {
		if (this._timeout) clearTimeout(this._timeout);
		this.running = false;

		if (!this.waitForCompletion) {
			void this._executeOnComplete();
			return;
		}

		void Promise.resolve().then(async () => {
			await this._waitForJobCompletion();
			await this._executeOnComplete();
		});
	}
}
