import { SpawnOptions } from 'child_process';
import { DateTime } from 'luxon';
import { CONSTRAINTS, TIME_UNITS_MAP } from '../constants';
import { IntRange } from './utils';

/**
 * Main interfaces / types
 */

export interface CronJobParams {
	cronTime: string | Date | DateTime;
	onTick: CronCommand;
	onComplete?: CronCommand | null | undefined;
	start?: boolean | undefined;
	timeZone?: string | undefined;
	context?: any;
	runOnInit?: boolean | undefined;
	utcOffset?: string | number | undefined;
	unrefTimeout?: boolean | undefined;
}

export type CronCommand =
	| (() => void)
	| string
	| {
			command: string;
			args?: ReadonlyArray<string> | undefined;
			options?: SpawnOptions | undefined;
	  };

/**
 * Time units & Ranges
 */

export type TimeUnit = (typeof TIME_UNITS_MAP)[keyof typeof TIME_UNITS_MAP];

export type Ranges = {
	second: SecondRange;
	minute: MinuteRange;
	hour: HourRange;
	dayOfMonth: DayOfMonthRange;
	month: MonthRange;
	dayOfWeek: DayOfWeekRange;
};

export type SecondRange = IntRange<
	(typeof CONSTRAINTS)['second'][0],
	(typeof CONSTRAINTS)['second'][1]
>;
export type MinuteRange = IntRange<
	(typeof CONSTRAINTS)['minute'][0],
	(typeof CONSTRAINTS)['minute'][1]
>;
export type HourRange = IntRange<
	(typeof CONSTRAINTS)['hour'][0],
	(typeof CONSTRAINTS)['hour'][1]
>;
export type DayOfMonthRange = IntRange<
	(typeof CONSTRAINTS)['dayOfMonth'][0],
	(typeof CONSTRAINTS)['dayOfMonth'][1]
>;
export type MonthRange = IntRange<
	(typeof CONSTRAINTS)['month'][0],
	(typeof CONSTRAINTS)['month'][1]
>;
export type DayOfWeekRange = IntRange<
	(typeof CONSTRAINTS)['dayOfWeek'][0],
	(typeof CONSTRAINTS)['dayOfWeek'][1]
>;
