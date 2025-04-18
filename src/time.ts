import { DateTime, Zone } from 'luxon';

import {
	ALIASES,
	CONSTRAINTS,
	PARSE_DEFAULTS,
	PRESETS,
	RE_RANGE,
	RE_WILDCARDS,
	TIME_UNITS,
	TIME_UNITS_LEN,
	TIME_UNITS_MAP
} from './constants';
import { CronError, ExclusiveParametersError } from './errors';
import {
	CronJobParams,
	Ranges,
	TimeUnit,
	TimeUnitField
} from './types/cron.types';

type CustomZone = Zone & {
	zoneName?: string;
	fixed?: string;
};

type CustomDateTime = Omit<DateTime, 'zone'> & {
	zone: CustomZone;
};

export class CronTime {
	source: string | DateTime;
	timeZone?: string;
	utcOffset?: number;
	realDate = false;

	private second: TimeUnitField<'second'> = {};
	private minute: TimeUnitField<'minute'> = {};
	private hour: TimeUnitField<'hour'> = {};
	private dayOfMonth: TimeUnitField<'dayOfMonth'> = {};
	private month: TimeUnitField<'month'> = {};
	private dayOfWeek: TimeUnitField<'dayOfWeek'> = {};

	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: CronJobParams['timeZone'],
		utcOffset?: null
	);
	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: null,
		utcOffset?: CronJobParams['utcOffset']
	);
	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: CronJobParams['timeZone'],
		utcOffset?: CronJobParams['utcOffset']
	) {
		// runtime check for JS users
		if (timeZone != null && utcOffset != null) {
			throw new ExclusiveParametersError('timeZone', 'utcOffset');
		}

		if (timeZone) {
			const dt = DateTime.fromObject({}, { zone: timeZone });
			if (!dt.isValid) {
				throw new CronError('Invalid timezone.');
			}

			this.timeZone = timeZone;
		}

		if (utcOffset != null) {
			this.utcOffset = utcOffset;
		}

		if (timeZone == null && utcOffset == null) {
			const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			this.timeZone = systemTimezone;
		}

		if (source instanceof Date || source instanceof DateTime) {
			this.source =
				source instanceof Date ? DateTime.fromJSDate(source) : source;
			this.realDate = true;
		} else {
			this.source = source;
			this._parse(this.source);
		}
	}

	static validateCronExpression(cronExpression: string): {
		valid: boolean;
		error?: CronError;
	} {
		try {
			new CronTime(cronExpression);
			return {
				valid: true
			};
		} catch (error: any) {
			return {
				valid: false,
				error
			};
		}
	}

	private _getWeekDay(date: DateTime) {
		return date.weekday === 7 ? 0 : date.weekday;
	}

	/**
	 * calculate the "next" scheduled time
	 */
	sendAt(): DateTime;
	sendAt(i: number): DateTime[];
	sendAt(i?: number): DateTime | DateTime[] {
		let date =
			this.realDate && this.source instanceof DateTime
				? this.source
				: DateTime.utc();

		if (this.timeZone) {
			date = date.setZone(this.timeZone);
		}

		if (this.utcOffset !== undefined) {
			const sign = this.utcOffset < 0 ? '-' : '+';

			const offsetHours = Math.trunc(this.utcOffset / 60);
			const offsetHoursStr = String(Math.abs(offsetHours)).padStart(2, '0');

			const offsetMins = Math.abs(this.utcOffset - offsetHours * 60);
			const offsetMinsStr = String(offsetMins).padStart(2, '0');

			const utcZone = `UTC${sign}${offsetHoursStr}:${offsetMinsStr}`;

			date = date.setZone(utcZone);

			if (!date.isValid) {
				throw new CronError('ERROR: You specified an invalid UTC offset.');
			}
		}

		if (this.realDate) {
			if (DateTime.local() > date) {
				throw new CronError('WARNING: Date in past. Will never be fired.');
			}

			return date;
		}

		if (i === undefined || isNaN(i) || i < 0) {
			const nextDate = this.getNextDateFrom(date);
			// just get the next scheduled time
			return nextDate;
		} else {
			// return the next schedule times
			const dates: DateTime[] = [];
			for (; i > 0; i--) {
				date = this.getNextDateFrom(date);
				dates.push(date);
			}

			return dates;
		}
	}

	/**
	 * get the number of milliseconds in the future at which to fire our callbacks.
	 *
	 * Can return a negative value when `sendAt` took too long to execute.
	 * This is then handled in `CronJob` to execute the job immediately or skip
	 * this execution based on the `threshold` option.
	 *
	 * We could instead call DateTime.local before `sendAt` to get the current time, but
	 * then the calculated timeout would be offset by the time it takes to execute `sendAt`.
	 *
	 * As such it is better to handle negative timeouts by executing the job immediately.
	 */
	getTimeout() {
		return this.sendAt().toMillis() - DateTime.local().toMillis();
	}

	/**
	 * writes out a cron string
	 */
	toString() {
		return this.toJSON().join(' ');
	}

	/**
	 * json representation of the parsed cron syntax.
	 */
	toJSON() {
		return TIME_UNITS.map(unit => {
			return this._wcOrAll(unit);
		});
	}

	/**
	 * get next date matching the specified cron time.
	 *
	 * Algorithm:
	 * - Start with a start date and a parsed CronTime.
	 * - Within the loop:
	 *   - If we can't find an execution time within 8 years, throw an exception.
	 *   - Find the next month to run at.
	 *   - Find the next day of the month to run at.
	 *   - Find the next day of the week to run at.
	 *   - Find the next hour to run at.
	 *   - Find the next minute to run at.
	 *   - Find the next second to run at.
	 *   - Check that the chosen time does not equal the current execution.
	 * - Return the selected date object.
	 */
	getNextDateFrom(
		start: Date | CustomDateTime,
		timeZone?: string | CustomZone
	): DateTime {
		if (start instanceof Date) {
			start = DateTime.fromJSDate(start);
		}
		if (timeZone) {
			start = start.setZone(timeZone);
		} else {
			timeZone = start.zone.zoneName ?? start.zone.fixed;
		}
		// make a clone in UTC so we can manipulate it as if there were no time zones
		let date = DateTime.fromFormat(
			`${start.year}-${start.month}-${start.day} ${start.hour}:${start.minute}:${start.second}`,
			'yyyy-M-d H:m:s',
			{
				zone: 'UTC'
			}
		);
		const firstDate = date.toMillis();
		if (!this.realDate) {
			if (date.millisecond > 0) {
				date = date.set({ millisecond: 0, second: date.second + 1 });
			}
		}

		if (!date.isValid) {
			throw new CronError('ERROR: You specified an invalid date.');
		}

		/**
		 * maximum match interval is 8 years:
		 * crontab has '* * 29 2 *' and we are on 1 March 2096:
		 * next matching time will be 29 February 2104
		 * source: https://github.com/cronie-crond/cronie/blob/0d669551680f733a4bdd6bab082a0b3d6d7f089c/src/cronnext.c#L401-L403
		 */
		const maxMatch = DateTime.now().plus({ years: 8 });
		// determine next date
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			// hard stop if the current date is after the maximum match interval
			if (date > maxMatch) {
				throw new CronError(
					`Something went wrong. No execution date was found in the next 8 years.
							Please provide the following string if you would like to help debug:
							Time Zone: ${
								timeZone?.toString() ?? '""'
							} - Cron String: ${this.source.toString()} - UTC offset: ${
								date.offset
							} - current Date: ${DateTime.local().toString()}`
				);
			}

			if (
				!(date.month in this.month) &&
				Object.keys(this.month).length !== 12
			) {
				date = date.plus({ month: 1 });
				date = date.set({ day: 1, hour: 0, minute: 0, second: 0 });

				continue;
			}

			if (
				(!(date.day in this.dayOfMonth) &&
					Object.keys(this.dayOfMonth).length !== 31 &&
					!(
						this._getWeekDay(date) in this.dayOfWeek &&
						Object.keys(this.dayOfWeek).length !== 7
					)) ||
				(!(this._getWeekDay(date) in this.dayOfWeek) &&
					Object.keys(this.dayOfWeek).length !== 7 &&
					!(
						date.day in this.dayOfMonth &&
						Object.keys(this.dayOfMonth).length !== 31
					))
			) {
				date = date.plus({ days: 1 });
				date = date.set({ hour: 0, minute: 0, second: 0 });

				continue;
			}

			if (!(date.hour in this.hour) && Object.keys(this.hour).length !== 24) {
				// only allow the hour to be 24 if a day hasn't passed yet since we started calculating the new time
				// otherwise we'll be changing the day here even though we already determined the correct day

				date = date.plus({ hour: 1 });
				date = date.set({ minute: 0, second: 0 });

				continue;
			}

			if (
				!(date.minute in this.minute) &&
				Object.keys(this.minute).length !== 60
			) {
				date = date.plus({ minute: 1 });
				date = date.set({ second: 0 });

				continue;
			}

			// respond to the previous date being checked by advancing a second
			// just like when we advance seconds normally
			if (
				date.toMillis() === firstDate ||
				(!(date.second in this.second) &&
					Object.keys(this.second).length !== 60)
			) {
				date = date.plus({ second: 1 });

				continue;
			}

			break;
		}

		// handle cases where time jumps forward due to Daylight Savings

		const expectedHour = date.hour;
		const expectedMinute = date.minute;

		date = DateTime.fromFormat(
			`${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}`,
			'yyyy-M-d H:m:s',
			{
				zone: timeZone
			}
		);
		const nonDSTReferenceDate = DateTime.fromFormat(
			`${date.year}-1-1 0:0:0`,
			'yyyy-M-d H:m:s',
			{ zone: timeZone }
		);

		// if the hour or minute is different from expected and
		// if date we assume to not be under daylight savings has a different offset
		// rewind until just after the offset
		if (
			(expectedHour !== date.hour || expectedMinute !== date.minute) &&
			nonDSTReferenceDate.offset !== date.offset
		) {
			while (date.minus({ minute: 1 }).offset !== nonDSTReferenceDate.offset) {
				date = date.minus({ minute: 1 });
			}
			return date;
		}

		// handle cases where time jumps back due to Daylight Savings (ambiguous times)

		// daylight savings jumps are either 60 or 30 minutes
		const hourTestDate = date.minus({ hour: 1 });
		const twoHourTestDate = date.minus({ hour: 2 });
		// if the previous hour is the same as this hour we are in an ambiguous time
		// jump back to the earlier hour as long as it's not in the past
		if (
			(hourTestDate.hour === date.hour ||
				twoHourTestDate.hour === hourTestDate.hour) &&
			hourTestDate > start
		) {
			date = hourTestDate;
		}
		// similar for half hour jumps
		const halfHourTestDate = date.minus({ minute: 30 });
		if (
			(halfHourTestDate.minute === date.minute ||
				hourTestDate.minute === halfHourTestDate.minute) &&
			halfHourTestDate > start
		) {
			date = halfHourTestDate;
		}

		return date;
	}

	/**
	 * wildcard, or all params in array (for to string)
	 */
	private _wcOrAll(unit: TimeUnit) {
		if (this._hasAll(unit)) {
			return '*';
		}

		const all = [];
		for (const time in this[unit]) {
			all.push(time);
		}

		return all.join(',');
	}

	private _hasAll(unit: TimeUnit) {
		const constraints = CONSTRAINTS[unit];
		const low = constraints[0];
		const high =
			unit === TIME_UNITS_MAP.DAY_OF_WEEK ? constraints[1] - 1 : constraints[1];

		for (let i = low, n = high; i < n; i++) {
			if (!(i in this[unit])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * parse the cron syntax into something useful for selecting the next execution time.
	 *
	 * Algorithm:
	 * - Replace preset
	 * - Replace aliases in the source.
	 * - Trim string and split for processing.
	 * - Loop over split options (ms -> month):
	 *   - Get the value (or default) in the current position.
	 *   - Parse the value.
	 */
	private _parse(source: string) {
		source = source.toLowerCase();

		if (Object.keys(PRESETS).includes(source)) {
			source = PRESETS[source as keyof typeof PRESETS];
		}

		source = source.replace(/[a-z]{1,3}/gi, (alias: string) => {
			if (Object.keys(ALIASES).includes(alias)) {
				return ALIASES[alias as keyof typeof ALIASES].toString();
			}

			throw new CronError(`Unknown alias: ${alias}`);
		});

		const units = source.trim().split(/\s+/);

		// seconds are optional
		if (units.length < TIME_UNITS_LEN - 1) {
			throw new CronError('Too few fields');
		}

		if (units.length > TIME_UNITS_LEN) {
			throw new CronError('Too many fields');
		}

		const unitsLen = units.length;
		for (const unit of TIME_UNITS) {
			const i = TIME_UNITS.indexOf(unit);
			// if the split source string doesn't contain all digits,
			// assume defaults for first n missing digits.
			// this adds support for 5-digit standard cron syntax
			const cur =
				units[i - (TIME_UNITS_LEN - unitsLen)] ?? PARSE_DEFAULTS[unit];
			this._parseField(cur, unit);
		}
	}

	/**
	 * parse individual field from the cron syntax provided.
	 *
	 * Algorithm:
	 * - Split field by commas and check for wildcards to ensure proper user.
	 * - Replace wildcard values with <low>-<high> boundaries.
	 * - Split field by commas and then iterate over ranges inside field.
	 *   - If range matches pattern then map over matches using replace (to parse the range by the regex pattern)
	 *   - Starting with the lower bounds of the range iterate by step up to the upper bounds and toggle the CronTime field value flag on.
	 */

	private _parseField(value: string, unit: TimeUnit) {
		const typeObj = this[unit] as TimeUnitField<typeof unit>;
		let pointer: Ranges[typeof unit];

		const constraints = CONSTRAINTS[unit];
		const low = constraints[0];
		const high = constraints[1];

		const fields = value.split(',');
		fields.forEach(field => {
			const wildcardIndex = field.indexOf('*');
			if (wildcardIndex !== -1 && wildcardIndex !== 0) {
				throw new CronError(
					`Field (${field}) has an invalid wildcard expression`
				);
			}
		});

		// "*" is a shortcut to [low-high] range for the field
		value = value.replace(RE_WILDCARDS, `${low}-${high}`);

		// commas separate information, so split based on those
		const allRanges = value.split(',');

		for (const range of allRanges) {
			const match = [...range.matchAll(RE_RANGE)][0];
			if (match?.[1] !== undefined) {
				const [, mLower, mUpper, mStep] = match;
				let lower = parseInt(mLower, 10);
				let upper = mUpper !== undefined ? parseInt(mUpper, 10) : undefined;

				const wasStepDefined = mStep !== undefined;
				const step = parseInt(mStep ?? '1', 10);
				if (step === 0) {
					throw new CronError(`Field (${unit}) has a step of zero`);
				}

				if (upper !== undefined && lower > upper) {
					throw new CronError(`Field (${unit}) has an invalid range`);
				}

				const isOutOfRange =
					lower < low ||
					(upper !== undefined && upper > high) ||
					(upper === undefined && lower > high);

				if (isOutOfRange) {
					throw new CronError(`Field value (${value}) is out of range`);
				}

				// positive integer higher than constraints[0]
				lower = Math.min(Math.max(low, ~~Math.abs(lower)), high);

				// positive integer lower than constraints[1]
				if (upper !== undefined) {
					upper = Math.min(high, ~~Math.abs(upper));
				} else {
					// if step is provided, the default upper range is the highest value
					upper = wasStepDefined ? high : lower;
				}

				// count from the lower barrier to the upper
				// forcing type cast here since we checked above that
				// we are between constraint bounds
				pointer = lower as typeof pointer;

				do {
					typeObj[pointer] = true; // mutates the field objects values inside CronTime
					pointer += step;
				} while (pointer <= upper);

				// merge day 7 into day 0 (both Sunday), and remove day 7
				// since we work with day-of-week 0-6 under the hood
				if (unit === 'dayOfWeek') {
					if (!typeObj[0] && !!typeObj[7]) typeObj[0] = typeObj[7];
					delete typeObj[7];
				}
			} else {
				throw new CronError(`Field (${unit}) cannot be parsed`);
			}
		}
	}
}
