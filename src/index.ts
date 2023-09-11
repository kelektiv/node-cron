import { spawn } from 'child_process';
import * as luxon from 'luxon';
import { CronTime } from './time';
import { CronCommand } from './types/interfaces';

export { CronTime } from './time';
export const CronJob = require('./job')(CronTime, spawn);

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
