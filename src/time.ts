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
	 * Calculate the "next" scheduled time
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
			console.log(`sendAt about to return ${nextDate.toUTC().toISOTime()}`);
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
	 * Get the number of milliseconds in the future at which to fire our callbacks.
	 */
	getTimeout() {
		const timeOut = Math.max(
			-1,
			this.sendAt().toMillis() - DateTime.utc().toMillis()
		);
		console.log(`getTimeout about to return ${timeOut}`);
		return timeOut;
	}

	/**
	 * writes out a cron string
	 */
	toString() {
		return this.toJSON().join(' ');
	}

	/**
	 * Json representation of the parsed cron syntax.
	 */
	toJSON() {
		return TIME_UNITS.map(unit => {
			return this._wcOrAll(unit);
		});
	}

	/**
	 * Get next date matching the specified cron time.
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
	getNextDateFrom(start: Date | DateTime, timeZone?: string | Zone) {
		if (start instanceof Date) {
			start = DateTime.fromJSDate(start);
		}
		let date = start;
		const firstDate = start.toMillis();
		if (timeZone) {
			date = date.setZone(timeZone);
		}
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
		let offset = date.offset;

		const prettyPrintTime = (time: any) => {
			// return '';
			return JSON.stringify(Object.keys(time).map(key => parseInt(key)));
		};
		// console.log(`
		// 	getNextDateFrom ${date.month} ${prettyPrintTime(this.month)} ${date.day} ${prettyPrintTime(this.dayOfMonth)} ${this._getWeekDay(date)} ${prettyPrintTime(this.dayOfWeek)} ${date.hour} ${prettyPrintTime(this.hour)} ${date.minute} ${prettyPrintTime(this.minute)} ${date.second} ${prettyPrintTime(this.second)}
		// `);

		// determine next date
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			const diff = date.toMillis() - start.toMillis();
			// console.log(date.toISOTime(), date.toUTC().toISOTime());

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
				date = date.plus({ months: 1 });
				date = date.set({ day: 1, hour: 0, minute: 0, second: 0 });

				// if (offset !== date.offset) {
				// 	offset = date.offset;
				// 	const DSTJumpTime = this._findDSTJumpTime(date);
				// 	date = newDate;
				// 	if (isDone) break;
				// }
				continue;
			}

			if (
				!(date.day in this.dayOfMonth) &&
				Object.keys(this.dayOfMonth).length !== 31 &&
				!(
					this._getWeekDay(date) in this.dayOfWeek &&
					Object.keys(this.dayOfWeek).length !== 7
				)
			) {
				const preDayChangeDate = date;
				date = date.plus({ days: 1 });
				date = date.set({ hour: 0, minute: 0, second: 0 });

				if (offset !== date.offset) {
					offset = date.offset;
					if (
						date.hour - preDayChangeDate.hour > 1 ||
						(date.hour === 1 && preDayChangeDate.hour === 23)
					) {
						// We skipped past a valid execution time and must execute immediately
						break;
					}
				}
				continue;
			}

			if (
				!(this._getWeekDay(date) in this.dayOfWeek) &&
				Object.keys(this.dayOfWeek).length !== 7 &&
				!(
					date.day in this.dayOfMonth &&
					Object.keys(this.dayOfMonth).length !== 31
				)
			) {
				const preDayChangeDate = date;
				date = date.plus({ days: 1 });
				date = date.set({ hour: 0, minute: 0, second: 0 });
				if (offset !== date.offset) {
					offset = date.offset;
					if (
						date.hour - preDayChangeDate.hour > 1 ||
						(date.hour === 1 && preDayChangeDate.hour === 23)
					) {
						// We skipped past a valid execution time and must execute immediately
						break;
					}
				}
				continue;
			}

			// Assume DST changes will always happen on the same day

			if (!(date.hour in this.hour) && Object.keys(this.hour).length !== 24) {
				// Only allow the hour to be 24 if a day hasn't passed yet since we started calculating the new time
				// Otherwise we'll be changing the day here even though we already determined the correct day
				// const expectedHour =
				// 	date.hour === 23 && diff > 86400000 ? 0 : date.hour + 1;
				const preHourChangeDate = date;
				// date = date.set({ hour: expectedHour });
				date = date.plus({ hour: 1 });
				date = date.set({ minute: 0, second: 0 });

				// When this is the case, asking Luxon to go forward by 1 hour actually made us go forward by more hours...
				// This indicates that somewhere between these two time points, a forward DST adjustment has happened.
				// When this happens, the job should be scheduled to execute as though the time has come when the jump is made.
				// Therefore, the job should be scheduled on the first tick after the forward jump.
				if (offset !== date.offset) {
					offset = date.offset;
					if (
						date.hour - preHourChangeDate.hour > 1 ||
						// Need to check if the hour wrapped because an hour change could push us into a new day
						(date.hour === 1 && preHourChangeDate.hour === 23)
					) {
						// We skipped past a valid execution time and must execute immediately
						break;
					}
					// TODO: case where we go back an hour
				}
				// When turning the time back, without this check a job would not execute until an hour after the time change
				// if (this._backwardDSTJump(expectedHour, expectedMinute, date)) {
				// }
				continue;
			}

			if (
				!(date.minute in this.minute) &&
				Object.keys(this.minute).length !== 60
			) {
				// const expectedMinute =
				// 	date.minute === 59 && diff > 3600000 ? 0 : date.minute + 1;
				// const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);
				const preMinuteChangeDate = date;
				// date = date.set({ minute: expectedMinute });
				date = date.plus({ minute: 1 });
				date = date.set({ second: 0 });

				// console.log(
				// 	`changing time forward one minute, pre-time: ${preMinuteChangeDate.hour}:${preMinuteChangeDate.minute}, post-time: ${date.hour}:${date.minute}`
				// );
				// Same case as with hours: DST forward jump.
				// This must be accounted for if a minute increment pushed us to a jumping point.
				if (offset !== date.offset) {
					console.log(
						`minute offset change detected, pre-time: ${preMinuteChangeDate.hour}:${preMinuteChangeDate.minute}, post-time: ${date.hour}:${date.minute}`
					);
					offset = date.offset;
					if (
						preMinuteChangeDate.minute - date.minute > 1 ||
						preMinuteChangeDate.hour - date.hour > 1 ||
						(date.hour === 1 && preMinuteChangeDate.hour === 23)
					) {
						// We skipped past a valid execution time and must execute immediately
						break;
					}
					if (preMinuteChangeDate.hour === date.hour) {
						// If we don't execute we will miss a valid execution
						break;
					}
				}

				continue;
			}

			if (
				!(date.second in this.second) &&
				Object.keys(this.second).length !== 60
			) {
				const expectedSecond =
					date.second === 59 && diff > 60000 ? 0 : date.second + 1;
				const expectedMinute = date.minute + (expectedSecond === 60 ? 1 : 0);
				const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);

				const preSecondChangeDate = date;
				date = date.set({ second: expectedSecond });

				// Seconds can cause it too, imagine 21:59:59 -> 23:00:00.
				if (offset !== date.offset) {
					offset = date.offset;
					if (
						preSecondChangeDate.minute - date.minute > 1 ||
						preSecondChangeDate.hour - date.hour > 1 ||
						(date.hour === 1 && preSecondChangeDate.hour === 23)
					) {
						// We skipped past a valid execution time and must execute immediately
						break;
					}
				}

				continue;
			}

			if (date.toMillis() === firstDate) {
				const expectedSecond = date.second + 1;
				const expectedMinute = date.minute + (expectedSecond === 60 ? 1 : 0);
				const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);

				date = date.set({ second: expectedSecond });

				// Same as always.
				if (offset !== date.offset) {
					const preSecondChangeDate = date;
					offset = date.offset;
					// const DSTJumpTime = this._findDSTJumpTime(date);
					// if (DSTJumpTime.hour !== date.hour && DSTJumpTime.hour in this.hour) {
					// 	// We skipped past a valid execution time and must execute immediately
					// 	break;
					// }
				}

				continue;
			}

			break;
		}
		console.log(`getNextDateFrom returning date ${date.toUTC().toISOTime()}`);

		return date;
	}

	/**
	 * Search backwards in time 1 minute at a time, to detect a DST forward jump.
	 * When the jump is found, the range of the jump is investigated to check for acceptable cron times.
	 *
	 * A pair is returned, whose first is a boolean representing if an acceptable time was found inside the jump,
	 * and whose second is a DateTime representing the first millisecond after the jump.
	 *
	 * The input date is expected to be decently close to a DST jump.
	 * Up to a day in the past is checked before an error is thrown.
	 * @param date
	 * @return [boolean, DateTime]
	 */
	private _findDSTJumpTime(date: DateTime): DateTime {
		console.log(`_findDSTJumpTime with ${date}`);
		/** @type number */
		// let expectedMinute, expectedHour, actualMinute, actualHour;
		/** @type DateTime */
		// let maybeJumpingPoint = date;

		// Representing one day of forward or backward checking in minutes. If this is hit, the input must be wrong.
		// Extra iteration is to account for off by one error
		const iterationLimit = 60 * 24 + 1;
		let iteration = 0;
		let offset = date.offset;
		// Check for a forward jump
		// let forwardIterationLimitExceeded, backwardIterationLimitExceeded;
		while (iteration < iterationLimit && offset === date.offset) {
			date = date.minus({ minute: 1 });
			iteration++;
		}
		if (iteration >= iterationLimit) {
			throw new CronError(
				`ERROR: This DST checking related function assumes the input DateTime (${
					date.toISO() ?? date.toMillis()
				}) is within 24 hours of a DST jump.`
			);
		}
		return date;

		// do {
		// 	if (++iteration > iterationLimit) {
		// 		forwardIterationLimitExceeded = true;
		// 		break;
		// 		// throw new CronError(errorMessage);
		// 	}

		// 	expectedMinute = maybeJumpingPoint.minute - 1;
		// 	expectedHour = maybeJumpingPoint.hour;

		// 	if (expectedMinute < 0) {
		// 		expectedMinute += 60;
		// 		expectedHour = (expectedHour + 24 - 1) % 24; // Subtract 1 hour, but we must account for the -1 case.
		// 	}

		// 	maybeJumpingPoint = maybeJumpingPoint.minus({ minute: 1 });

		// 	actualMinute = maybeJumpingPoint.minute;
		// 	actualHour = maybeJumpingPoint.hour;
		// } while (expectedMinute === actualMinute && expectedHour === actualHour);

		// // Setting the seconds and milliseconds to zero is necessary for two reasons:
		// // Firstly, the range checking function needs the earliest moment after the jump.
		// // Secondly, this DateTime may be used for scheduling jobs, if there existed a job in the skipped range.
		// const forwardAfterJumpingPoint = maybeJumpingPoint
		// 	.plus({ minute: 1 }) // back to the first minute _after_ the jump
		// 	.set({ second: 0, millisecond: 0 });

		// // Get the lower bound of the range to check as well. This only has to be accurate down to minutes.
		// const forwardBeforeJumpingPoint = forwardAfterJumpingPoint.minus({
		// 	second: 1
		// });

		// // Check for a backward jump
		// maybeJumpingPoint = date;
		// iteration = 0;
		// do {
		// 	if (++iteration > iterationLimit) {
		// 		backwardIterationLimitExceeded = true;
		// 		break;
		// 		// throw new CronError(errorMessage);
		// 	}

		// 	expectedMinute = maybeJumpingPoint.minute + 1;
		// 	expectedHour = maybeJumpingPoint.hour;

		// 	if (expectedMinute > 59) {
		// 		expectedMinute -= 60;
		// 		expectedHour = (expectedHour + 1) % 24; // Add 1 hour, but we must account for the 25 case.
		// 	}

		// 	maybeJumpingPoint = maybeJumpingPoint.plus({ minute: 1 });

		// 	actualMinute = maybeJumpingPoint.minute;
		// 	actualHour = maybeJumpingPoint.hour;
		// } while (expectedMinute === actualMinute && expectedHour === actualHour);

		// // Setting the seconds and milliseconds to zero is necessary for two reasons:
		// // Firstly, the range checking function needs the earliest moment after the jump.
		// // Secondly, this DateTime may be used for scheduling jobs, if there existed a job in the skipped range.
		// const backwardAfterJumpingPoint = maybeJumpingPoint
		// 	.plus({ minute: 1 }) // back to the first minute _after_ the jump
		// 	.set({ second: 0, millisecond: 0 });

		// // Get the lower bound of the range to check as well. This only has to be accurate down to minutes.
		// const backwardBeforeJumpingPoint = backwardAfterJumpingPoint.minus({
		// 	second: 1
		// });

		// if (forwardIterationLimitExceeded || backwardIterationLimitExceeded) {
		// 	throw new CronError(errorMessage);
		// }

		// if (
		// 	date.month in this.month &&
		// 	date.day in this.dayOfMonth &&
		// 	this._getWeekDay(date) in this.dayOfWeek
		// ) {
		// 	return [
		// 		this._checkTimeInSkippedRange(
		// 			forwardBeforeJumpingPoint,
		// 			forwardAfterJumpingPoint
		// 		),
		// 		forwardAfterJumpingPoint
		// 	];
		// }

		// if (
		// 	date.month in this.month &&
		// 	date.day in this.dayOfMonth &&
		// 	this._getWeekDay(date) in this.dayOfWeek
		// ) {
		// 	return [
		// 		this._checkTimeInSkippedRange(
		// 			backwardBeforeJumpingPoint,
		// 			backwardAfterJumpingPoint
		// 		),
		// 		backwardAfterJumpingPoint
		// 	];
		// }

		// // No valid time in the range for sure, units that didn't change from the skip mismatch.
		// return [false, maybeJumpingPoint];
	}

	/**
	 * Given 2 DateTimes, which represent 1 second before and immediately after a DST forward or backward jump,
	 * checks if a time in the skipped range would have been a valid CronJob time.
	 *
	 * Could technically work with just one of these values, extracting the other by adding or subtracting seconds.
	 * However, this couples the input DateTime to actually being tied to a DST jump,
	 * which would make the function harder to test.
	 * This way the logic just tests a range of minutes and hours, regardless if there are skipped time points underneath.
	 *
	 * Assumes the DST jump started no earlier than 0:00 and jumped forward by at least 1 minute, to at most 23:59.
	 * i.e. The day is assumed constant, but the jump is not assumed to be an hour long.
	 * Empirically, it is almost always one hour, but very, very rarely 30 minutes.
	 *
	 * Assumes dayOfWeek, dayOfMonth and month match all match, so only the hours, minutes and seconds are to be checked.
	 * @param {DateTime} beforeJumpingPoint
	 * @param {DateTime} afterJumpingPoint
	 * @returns {boolean}
	 */
	private _checkTimeInSkippedRange(
		beforeJumpingPoint: DateTime,
		afterJumpingPoint: DateTime
	) {
		// start by getting the first minute & hour inside the skipped range.
		const startingMinute = (beforeJumpingPoint.minute + 1) % 60;
		const startingHour =
			(beforeJumpingPoint.hour + (startingMinute === 0 ? 1 : 0)) % 24;

		const hourRangeSize = afterJumpingPoint.hour - startingHour + 1;
		const isHourJump = startingMinute === 0 && afterJumpingPoint.minute === 0;

		// There exist DST jumps other than 1 hour long, and the function is built to deal with it.
		// It may be overkill to assume some cases, but it shouldn't cost much at runtime.
		// https://en.wikipedia.org/wiki/Daylight_saving_time_by_country
		if (hourRangeSize === 2 && isHourJump) {
			// Exact 1 hour jump, most common real-world case.
			// There is no need to check minutes and seconds, as any value would suffice.
			return startingHour in this.hour;
		} else if (hourRangeSize === 1) {
			// less than 1 hour jump, rare but does exist.
			return (
				startingHour in this.hour &&
				this._checkTimeInSkippedRangeSingleHour(
					startingMinute,
					afterJumpingPoint.minute
				)
			);
		} else {
			// non-round or multi-hour jump. (does not exist in the real world at the time of writing)
			return this._checkTimeInSkippedRangeMultiHour(
				startingHour,
				startingMinute,
				afterJumpingPoint.hour,
				afterJumpingPoint.minute
			);
		}
	}

	/**
	 * Component of checking if a CronJob time existed in a DateTime range skipped by DST.
	 * This subroutine makes a further assumption that the skipped range is fully contained in one hour,
	 * and that all other larger units are valid for the job.
	 *
	 * for example a jump from 02:00:00 to 02:30:00, but not from 02:00:00 to 03:00:00.
	 * @see _checkTimeInSkippedRange
	 *
	 * This is done by checking if any minute in startMinute - endMinute is valid, excluding endMinute.
	 * For endMinute, there is only a match if the 0th second is a valid time.
	 */
	private _checkTimeInSkippedRangeSingleHour(
		startMinute: number,
		endMinute: number
	) {
		for (let minute = startMinute; minute < endMinute; ++minute) {
			if (minute in this.minute) return true;
		}

		// If the very last second of the jump matched, there is no match.
		return endMinute in this.minute && 0 in this.second;
	}

	/**
	 * Component of checking if a CronJob time existed in a DateTime range skipped by DST.
	 * This subroutine assumes the jump touches at least 2 hours, but the jump does not necessarily fully contain these hours.
	 *
	 * @see _checkTimeInSkippedRange
	 *
	 * This is done by defining the minutes to check for the first and last hour,
	 * and checking all 60 minutes for any hours in between them.
	 *
	 * If any hour x minute combination is a valid time, true is returned.
	 * The endMinute x endHour combination is only checked with the 0th second, since the rest would be out of the range.
	 *
	 * @param startHour {number}
	 * @param startMinute {number}
	 * @param endHour {number}
	 * @param endMinute {number}
	 */
	private _checkTimeInSkippedRangeMultiHour(
		startHour: number,
		startMinute: number,
		endHour: number,
		endMinute: number
	) {
		if (startHour >= endHour) {
			throw new CronError(
				`ERROR: This DST checking related function assumes the forward jump starting hour (${startHour}) is less than the end hour (${endHour})`
			);
		}

		/** @type number[] */
		const firstHourMinuteRange = Array.from(
			{ length: 60 - startMinute },
			(_, k) => startMinute + k
		);
		/** @type {number[]} The final minute is not contained on purpose. Every minute in this range represents one for which any second is valid. */
		const lastHourMinuteRange = Array.from({ length: endMinute }, (_, k) => k);
		/** @type number[] */
		const middleHourMinuteRange = Array.from({ length: 60 }, (_, k) => k);

		/** @type (number) => number[] */
		const selectRange = (forHour: number) => {
			if (forHour === startHour) {
				return firstHourMinuteRange;
			} else if (forHour === endHour) {
				return lastHourMinuteRange;
			} else {
				return middleHourMinuteRange;
			}
		};

		// Include the endHour: Selecting the right range still ensures no values outside the skip are checked.
		for (let hour = startHour; hour <= endHour; ++hour) {
			if (!(hour in this.hour)) continue;

			// The hour matches, so if the minute is in the range, we have a match!
			const usingRange = selectRange(hour);

			for (const minute of usingRange) {
				// All minutes in any of the selected ranges represent minutes which are fully contained in the jump,
				// So we need not check the seconds. If the minute is in there, it is a match.
				if (minute in this.minute) return true;
			}
		}

		// The endMinute of the endHour was not checked in the loop, because only the 0th second of it is in the range.
		// Arriving here means no match was found yet, but this final check may turn up as a match.
		return endHour in this.hour && endMinute in this.minute && 0 in this.second;
	}

	/**
	 * Given expected and actual hours and minutes, report if a DST forward or backward jump occurred.
	 *
	 * This is the case when the expected time (algorithm) is smaller than the actual (Luxon).
	 *
	 * It is not sufficient to check only hours, because some parts of the world apply DST by shifting in minutes.
	 * Better to account for it by checking minutes too, before an Australian of Lord Howe Island call us.
	 * @param expectedHour
	 * @param expectedMinute
	 * @param {DateTime} actualDate
	 */
	// private _DSTJumpOccurred(
	// 	expectedHour: number,
	// 	expectedMinute: number,
	// 	actualDate: DateTime,
	// 	triggerType?: string,
	// 	triggerValue?: number
	// ) {
	// 	const actualHour = actualDate.hour;
	// 	const actualMinute = actualDate.minute;

	// 	const didHoursJump = expectedHour % 24 < actualHour;
	// 	const didMinutesJump = expectedMinute % 60 < actualMinute;
	// 	console.log(
	// 		`_DSTJumpOccurred with ${expectedHour} ${actualHour} ${expectedMinute} ${actualMinute} ${didHoursJump || didMinutesJump} ${triggerType} ${triggerValue}`
	// 	);

	// 	return didHoursJump || didMinutesJump;
	// }

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
	 * Parse the cron syntax into something useful for selecting the next execution time.
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
			// If the split source string doesn't contain all digits,
			// assume defaults for first n missing digits.
			// This adds support for 5-digit standard cron syntax
			const cur =
				units[i - (TIME_UNITS_LEN - unitsLen)] ?? PARSE_DEFAULTS[unit];
			this._parseField(cur, unit);
		}
	}

	/**
	 * Parse individual field from the cron syntax provided.
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

				// Positive integer higher than constraints[0]
				lower = Math.min(Math.max(low, ~~Math.abs(lower)), high);

				// Positive integer lower than constraints[1]
				if (upper !== undefined) {
					upper = Math.min(high, ~~Math.abs(upper));
				} else {
					// If step is provided, the default upper range is the highest value
					upper = wasStepDefined ? high : lower;
				}

				// Count from the lower barrier to the upper
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
