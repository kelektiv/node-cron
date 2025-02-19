import { DateTime } from 'luxon';
import { CronTime } from './time';

export { CronJob } from './job';
export { CronTime } from './time';

export {
	CronCallback,
	CronCommand,
	CronContext,
	CronJobParams,
	CronOnCompleteCallback,
	CronOnCompleteCommand,
	Ranges,
	TimeUnit
} from './types/cron.types';

export const sendAt = (cronTime: string | Date | DateTime): DateTime =>
	new CronTime(cronTime).sendAt();

export const timeout = (cronTime: string | Date | DateTime): number =>
	new CronTime(cronTime).getTimeout();

export const isCronTimeValid = (
	cronTime: string | Date | DateTime
): boolean => {
	try {
		new CronTime(cronTime);
		return true;
	} catch (_) {
		return false;
	}
};
