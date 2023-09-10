import { spawn } from 'child_process';
import * as luxon from 'luxon';
import { CronCommand } from 'types/interfaces';

export const CronTime = require('./time')(luxon);
export const CronJob = require('./job')(CronTime, spawn);

/**
 * Extend Luxon DateTime
 */
// TODO: move to private function in time.js (prototype mutation bad)
luxon.DateTime.prototype['getWeekDay'] = function () {
	return this.weekday === 7 ? 0 : this.weekday;
};

export const job = (
	cronTime: string | Date | luxon.DateTime,
	onTick: () => void,
	onComplete?: CronCommand | null,
	start?: boolean,
	timeZone?: string,
	context?: any,
	runOnInit?: boolean,
	utcOffset?: string | number,
	unrefTimeout?: boolean
): typeof CronJob =>
	new CronJob(
		cronTime,
		onTick,
		onComplete,
		start,
		timeZone,
		context,
		runOnInit,
		utcOffset,
		unrefTimeout
	);

export const time = (cronTime, timeZone) => new CronTime(cronTime, timeZone);

export const sendAt = cronTime => exports.time(cronTime).sendAt();

export const timeout = cronTime => exports.time(cronTime).getTimeout();
