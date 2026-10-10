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

export { Scheduler, scheduler } from './scheduler';
export type { ScheduleParams } from './scheduler';
export type { RegistryEntry } from './registry';

export const sendAt = (cronTime: string | Date | DateTime): DateTime =>
	new CronTime(cronTime).sendAt();

export const timeout = (cronTime: string | Date | DateTime): number =>
	new CronTime(cronTime).getTimeout();

export const validateCronExpression = CronTime.validateCronExpression;
