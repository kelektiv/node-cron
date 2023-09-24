import { DateTime } from 'luxon';
import { CronTime } from './time';

export { CronJob } from './job';
export { CronTime } from './time';

export const time = (
	source: string | Date | DateTime,
	zone?: string,
	utcOffset?: string | number
): CronTime => new CronTime(source, zone, utcOffset);

export const sendAt = (cronTime: string | Date | DateTime): DateTime =>
	time(cronTime).sendAt();

export const timeout = (cronTime: string | Date | DateTime): number =>
	time(cronTime).getTimeout();
