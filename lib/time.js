const CONSTRAINTS = [
	[0, 59],
	[0, 59],
	[0, 23],
	[1, 31],
	[0, 11],
	[0, 6]
];
const MONTH_CONSTRAINTS = [
	31,
	29, // support leap year...not perfect
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
const PARSE_DEFAULTS = ['0', '*', '*', '*', '*', '*'];
const ALIASES = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11,
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
const TIME_UNITS = [
	'second',
	'minute',
	'hour',
	'dayOfMonth',
	'month',
	'dayOfWeek'
];
const TIME_UNITS_LEN = TIME_UNITS.length;
const PRESETS = {
	'@yearly': '0 0 0 1 0 *',
	'@monthly': '0 0 0 1 * *',
	'@weekly': '0 0 0 * * 0',
	'@daily': '0 0 0 * * *',
	'@hourly': '0 0 * * * *',
	'@minutely': '0 * * * * *',
	'@secondly': '* * * * * *',
	'@weekdays': '0 0 0 * * 1-5',
	'@weekends': '0 0 0 * * 0,6'
};
const RE_WILDCARDS = /\*/g;
const RE_RANGE = /^(\d+)(?:-(\d+))?(?:\/(\d+))?$/g;

function CronTime(luxon) {
	function CT(source, zone, utcOffset) {
		this.source = source;

		if (zone) {
			const dt = luxon.DateTime.fromObject({}, { zone });
			if (dt.invalid) {
				throw new Error('Invalid timezone.');
			}

			this.zone = zone;
		}

		if (typeof utcOffset !== 'undefined') {
			this.utcOffset = utcOffset;
		}

		const that = this;
		TIME_UNITS.forEach(timeUnit => {
			that[timeUnit] = {};
		});

		if (this.source instanceof Date || this.source instanceof luxon.DateTime) {
			if (this.source instanceof Date) {
				this.source = luxon.DateTime.fromJSDate(this.source);
			}
			this.realDate = true;
		} else {
			this._parse(this.source);
			this._verifyParse();
		}
	}

	CT.prototype = {
		/*
		 * Ensure that the syntax parsed correctly and correct the specified values if needed.
		 */
		_verifyParse: function () {
			const months = Object.keys(this.month);
			const dom = Object.keys(this.dayOfMonth);
			let ok = false;

			/* if a dayOfMonth is not found in all months, we only need to fix the last
                 wrong month  to prevent infinite loop */
			let lastWrongMonth = NaN;
			for (let i = 0; i < months.length; i++) {
				const m = months[i];
				const con = MONTH_CONSTRAINTS[parseInt(m, 10)];

				for (let j = 0; j < dom.length; j++) {
					const day = dom[j];
					if (day <= con) {
						ok = true;
					}
				}

				if (!ok) {
					// save the month in order to be fixed if all months fails (infinite loop)
					lastWrongMonth = m;
					console.warn(`Month '${m}' is limited to '${con}' days.`);
				}
			}

			// infinite loop detected (dayOfMonth is not found in all months)
			if (!ok) {
				const notOkCon = MONTH_CONSTRAINTS[parseInt(lastWrongMonth, 10)];
				for (let k = 0; k < dom.length; k++) {
					const notOkDay = dom[k];
					if (notOkDay > notOkCon) {
						delete this.dayOfMonth[notOkDay];
						const fixedDay = Number(notOkDay) % notOkCon;
						this.dayOfMonth[fixedDay] = true;
					}
				}
			}
		},

		/**
		 * Calculate the "next" scheduled time
		 */
		sendAt: function (i) {
			let date = this.realDate ? this.source : luxon.DateTime.local();
			if (this.zone) {
				date = date.setZone(this.zone);
			}

			if (typeof this.utcOffset !== 'undefined') {
				let offset =
					this.utcOffset >= 60 || this.utcOffset <= -60
						? this.utcOffset / 60
						: this.utcOffset;
				offset = parseInt(offset);

				let utcZone = 'UTC';
				if (offset < 0) {
					utcZone += offset;
				} else if (offset > 0) {
					utcZone += `+${offset}`;
				}

				date = date.setZone(utcZone);

				if (date.invalid) {
					throw new Error('ERROR: You specified an invalid UTC offset.');
				}
			}

			if (this.realDate) {
				if (luxon.DateTime.local() > date) {
					throw new Error('WARNING: Date in past. Will never be fired.');
				}

				return date;
			}

			if (isNaN(i) || i < 0) {
				// just get the next scheduled time
				return this._getNextDateFrom(date);
			} else {
				// return the next schedule times
				const dates = [];
				for (; i > 0; i--) {
					date = this._getNextDateFrom(date);
					dates.push(date);
				}

				return dates;
			}
		},

		/**
		 * Get the number of milliseconds in the future at which to fire our callbacks.
		 */
		getTimeout: function () {
			return Math.max(-1, this.sendAt() - luxon.DateTime.local());
		},

		/**
		 * writes out a cron string
		 */
		toString: function () {
			return this.toJSON().join(' ');
		},

		/**
		 * Json representation of the parsed cron syntax.
		 */
		toJSON: function () {
			const self = this;
			return TIME_UNITS.map(function (timeName) {
				return self._wcOrAll(timeName);
			});
		},

		getNextDateFrom: function (start, zone) {
			return this._getNextDateFrom(start, zone);
		},

		/**
		 * Get next date matching the specified cron time.
		 *
		 * Algorithm:
		 * - Start with a start date and a parsed crontime.
		 * - Loop until 5 seconds have passed, or we found the next date.
		 * - Within the loop:
		 *   - If it took longer than 5 seconds to select a date, throw an exception.
		 *   - Find the next month to run at.
		 *   - Find the next day of the month to run at.
		 *   - Find the next day of the week to run at.
		 *   - Find the next hour to run at.
		 *   - Find the next minute to run at.
		 *   - Find the next second to run at.
		 *   - Check that the chosen time does not equal the current execution.
		 * - Return the selected date object.
		 */
		_getNextDateFrom: function (start, zone) {
			if (start instanceof Date) {
				start = luxon.DateTime.fromJSDate(start);
			}
			let date = start;
			const firstDate = start.toMillis();
			if (zone) {
				date = date.setZone(zone);
			}
			if (!this.realDate) {
				if (date.millisecond > 0) {
					date = date.set({ millisecond: 0, second: date.second + 1 });
				}
			}

			if (date.invalid) {
				throw new Error('ERROR: You specified an invalid date.');
			}

			/**
			 * maximum match interval is 8 years:
			 * crontab has '* * 29 2 *' and we are on 1 March 2096:
			 * next matching time will be 29 February 2104
			 * source: https://github.com/cronie-crond/cronie/blob/0d669551680f733a4bdd6bab082a0b3d6d7f089c/src/cronnext.c#L401-L403
			 */
			const maxMatch = luxon.DateTime.now().plus({ years: 8 });

			// determine next date
			while (true) {
				const diff = date - start;

				// hard stop if the current date is after the maximum match interval
				if (date > maxMatch) {
					throw new Error(
						`Something went wrong. No execution date was found in the next 8 years.
							Please provide the following string if you would like to help debug:
							Time Zone: ${zone || '""'} - Cron String: ${this} - UTC offset: ${date.offset}
							- current Date: ${luxon.DateTime.local().toString()}`
					);
				}

				if (
					!(date.month - 1 in this.month) &&
					Object.keys(this.month).length !== 12
				) {
					date = date.plus({ months: 1 });
					date = date.set({ day: 1, hour: 0, minute: 0, second: 0 });

					if (this._forwardDSTJump(0, 0, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}
					continue;
				}

				if (
					!(date.day in this.dayOfMonth) &&
					Object.keys(this.dayOfMonth).length !== 31 &&
					!(
						date.getWeekDay() in this.dayOfWeek &&
						Object.keys(this.dayOfWeek).length !== 7
					)
				) {
					date = date.plus({ days: 1 });
					date = date.set({ hour: 0, minute: 0, second: 0 });

					if (this._forwardDSTJump(0, 0, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}
					continue;
				}

				if (
					!(date.getWeekDay() in this.dayOfWeek) &&
					Object.keys(this.dayOfWeek).length !== 7 &&
					!(
						date.day in this.dayOfMonth &&
						Object.keys(this.dayOfMonth).length !== 31
					)
				) {
					date = date.plus({ days: 1 });
					date = date.set({ hour: 0, minute: 0, second: 0 });
					if (this._forwardDSTJump(0, 0, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}
					continue;
				}

				if (!(date.hour in this.hour) && Object.keys(this.hour).length !== 24) {
					const expectedHour =
						date.hour === 23 && diff > 86400000 ? 0 : date.hour + 1;
					const expectedMinute = date.minute; // expect no change.

					date = date.set({ hour: expectedHour });
					date = date.set({ minute: 0, second: 0 });

					// When this is the case, Asking luxon to go forward by 1 hour actually made us go forward by more hours...
					// This indicates that somewhere between these two time points, a forward DST adjustment has happened.
					// When this happens, the job should be scheduled to execute as though the time has come when the jump is made.
					// Therefore, the job should be scheduled on the first tick after the forward jump.
					if (this._forwardDSTJump(expectedHour, expectedMinute, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}
					// backwards jumps do not seem to have any problems (i.e. double activations),
					// so they need not be handled in a similar way.

					continue;
				}

				if (
					!(date.minute in this.minute) &&
					Object.keys(this.minute).length !== 60
				) {
					const expectedMinute =
						date.minute === 59 && diff > 3600000 ? 0 : date.minute + 1;
					const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);

					date = date.set({ minute: expectedMinute });
					date = date.set({ second: 0 });

					// Same case as with hours: DST forward jump.
					// This must be accounted for if a minute increment pushed us to a jumping point.
					if (this._forwardDSTJump(expectedHour, expectedMinute, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}

					continue;
				}

				if (
					!(date.second in this.second) &&
					Object.keys(this.second).length !== 60
				) {
					const expectedSecond =
						date.second === 59 && diff > 60000 ? 0 : date.second + 1;
					const expectedMinute = date.minute + (expectedSecond === 60);
					const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);

					date = date.set({ second: expectedSecond });

					// Seconds can cause it too, imagine 21:59:59 -> 23:00:00.
					if (this._forwardDSTJump(expectedHour, expectedMinute, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}

					continue;
				}

				if (date.toMillis() === firstDate) {
					const expectedSecond = date.second + 1;
					const expectedMinute = date.minute + (expectedSecond === 60);
					const expectedHour = date.hour + (expectedMinute === 60 ? 1 : 0);

					date = date.set({ second: expectedSecond });

					// Same as always.
					if (this._forwardDSTJump(expectedHour, expectedMinute, date)) {
						const [done, newDate] = this._findPreviousDSTJump(date);
						date = newDate;
						if (done) break;
					}

					continue;
				}

				break;
			}

			return date;
		},

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
		_findPreviousDSTJump: function (date) {
			/** @type number */
			let expectedMinute, expectedHour, actualMinute, actualHour;
			/** @type DateTime */
			let maybeJumpingPoint = date;

			// representing one day of backwards checking. If this is hit, the input must be wrong.
			const iterationLimit = 60 * 24;
			let iteration = 0;
			do {
				if (++iteration > iterationLimit) {
					throw new Error(
						`ERROR: This DST checking related function assumes the input DateTime (${date.toISO()}) is within 24 hours of a DST jump.`
					);
				}

				expectedMinute = maybeJumpingPoint.minute - 1;
				expectedHour = maybeJumpingPoint.hour;

				if (expectedMinute < 0) {
					expectedMinute += 60;
					expectedHour = (expectedHour + 24 - 1) % 24; // Subtract 1 hour, but we must account for the -1 case.
				}

				maybeJumpingPoint = maybeJumpingPoint.minus({ minute: 1 });

				actualMinute = maybeJumpingPoint.minute;
				actualHour = maybeJumpingPoint.hour;
			} while (expectedMinute === actualMinute && expectedHour === actualHour);

			// Setting the seconds and milliseconds to zero is necessary for two reasons:
			// Firstly, the range checking function needs the earliest moment after the jump.
			// Secondly, this DateTime may be used for scheduling jobs, if there existed a job in the skipped range.
			const afterJumpingPoint = maybeJumpingPoint
				.plus({ minute: 1 }) // back to the first minute _after_ the jump
				.set({ seconds: 0, millisecond: 0 });

			// Get the lower bound of the range to check as well. This only has to be accurate down to minutes.
			const beforeJumpingPoint = afterJumpingPoint.minus({ second: 1 });

			if (
				date.month in this.month &&
				date.day in this.dayOfMonth &&
				date.getWeekDay() in this.dayOfWeek
			) {
				return [
					this._checkTimeInSkippedRange(beforeJumpingPoint, afterJumpingPoint),
					afterJumpingPoint
				];
			}

			// no valid time in the range for sure, units that didn't change from the skip mismatch.
			return [false, afterJumpingPoint];
		},

		/**
		 * Given 2 DateTimes, which represent 1 second before and immediately after a DST forward jump,
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
		_checkTimeInSkippedRange: function (beforeJumpingPoint, afterJumpingPoint) {
			// start by getting the first minute & hour inside the skipped range.
			const startingMinute = (beforeJumpingPoint.minute + 1) % 60;
			const startingHour =
				(beforeJumpingPoint.hour + (startingMinute === 0)) % 24;

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
		},

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
		_checkTimeInSkippedRangeSingleHour: function (startMinute, endMinute) {
			for (let minute = startMinute; minute < endMinute; ++minute) {
				if (minute in this.minute) return true;
			}

			// Unless the very last second of the jump matched, there is no match.
			return endMinute in this.minute && 0 in this.second;
		},

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
		_checkTimeInSkippedRangeMultiHour: function (
			startHour,
			startMinute,
			endHour,
			endMinute
		) {
			if (startHour >= endHour) {
				throw new Error(
					`ERROR: This DST checking related function assumes the forward jump starting hour (${startHour}) is less than the end hour (${endHour})`
				);
			}

			/** @type number[] */
			const firstHourMinuteRange = Array.from(
				{ length: 60 - startMinute },
				(_, k) => startMinute + k
			);
			/** @type {number[]} The final minute is not contained on purpose. Every minute in this range represents one for which any second is valid. */
			const lastHourMinuteRange = Array.from(
				{ length: endMinute },
				(_, k) => k
			);
			/** @type number[] */
			const middleHourMinuteRange = Array.from({ length: 60 }, (_, k) => k);

			/** @type (number) => number[] */
			const selectRange = forHour => {
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
			return (
				endHour in this.hour && endMinute in this.minute && 0 in this.second
			);
		},
		/**
		 * Given expected and actual hours and minutes, report if a DST forward jump occurred.
		 *
		 * This is the case when the expected is smaller than the acutal.
		 *
		 * It is not sufficient to check only hours, because some parts of the world apply DST by shifting in minutes.
		 * Better to account for it by checking minutes too, before an Australian of Lord Howe Island call us.
		 * @param expectedHour
		 * @param expectedMinute
		 * @param {DateTime} actualDate
		 */
		_forwardDSTJump: function (expectedHour, expectedMinute, actualDate) {
			const actualHour = actualDate.hour;
			const actualMinute = actualDate.minute;

			const hoursJumped = expectedHour % 24 < actualHour;
			const minutesJumped = expectedMinute % 60 < actualMinute;

			return hoursJumped || minutesJumped;
		},

		/**
		 * wildcard, or all params in array (for to string)
		 */
		_wcOrAll: function (type) {
			if (this._hasAll(type)) {
				return '*';
			}

			const all = [];
			for (const time in this[type]) {
				all.push(time);
			}

			return all.join(',');
		},

		_hasAll: function (type) {
			const constraints = CONSTRAINTS[TIME_UNITS.indexOf(type)];

			for (let i = constraints[0], n = constraints[1]; i < n; i++) {
				if (!(i in this[type])) {
					return false;
				}
			}

			return true;
		},

		/*
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
		_parse: function (source) {
			source = source.toLowerCase();

			if (source in PRESETS) {
				source = PRESETS[source];
			}

			source = source.replace(/[a-z]{1,3}/gi, alias => {
				if (alias in ALIASES) {
					return ALIASES[alias];
				}

				throw new Error(`Unknown alias: ${alias}`);
			});

			const units = source.trim().split(/\s+/);

			// seconds are optional
			if (units.length < TIME_UNITS_LEN - 1) {
				throw new Error('Too few fields');
			}

			if (units.length > TIME_UNITS_LEN) {
				throw new Error('Too many fields');
			}

			const unitsLen = units.length;
			for (let i = 0; i < TIME_UNITS_LEN; i++) {
				// If the split source string doesn't contain all digits,
				// assume defaults for first n missing digits.
				// This adds support for 5-digit standard cron syntax
				const cur = units[i - (TIME_UNITS_LEN - unitsLen)] || PARSE_DEFAULTS[i];
				this._parseField(cur, TIME_UNITS[i], CONSTRAINTS[i]);
			}
		},

		/*
		 * Parse individual field from the cron syntax provided.
		 *
		 * Algorithm:
		 * - Split field by commas aand check for wildcards to ensure proper user.
		 * - Replace wildcard values with <low>-<high> boundaries.
		 * - Split field by commas and then iterate over ranges inside field.
		 *   - If range matches pattern then map over matches using replace (to parse the range by the regex pattern)
		 *   - Starting with the lower bounds of the range iterate by step up to the upper bounds and toggle the CronTime field value flag on.
		 */
		_parseField: function (value, type, constraints) {
			const typeObj = this[type];
			let pointer;
			const low = constraints[0];
			const high = constraints[1];

			const fields = value.split(',');
			fields.forEach(field => {
				const wildcardIndex = field.indexOf('*');
				if (wildcardIndex !== -1 && wildcardIndex !== 0) {
					throw new Error(
						`Field (${field}) has an invalid wildcard expression`
					);
				}
			});

			// * is a shortcut to [low-high] range for the field
			value = value.replace(RE_WILDCARDS, `${low}-${high}`);

			// commas separate information, so split based on those
			const allRanges = value.split(',');

			for (let i = 0; i < allRanges.length; i++) {
				if (allRanges[i].match(RE_RANGE)) {
					allRanges[i].replace(RE_RANGE, ($0, lower, upper, step) => {
						lower = parseInt(lower, 10);
						upper = upper !== undefined ? parseInt(upper, 10) : undefined;

						const wasStepDefined = !isNaN(parseInt(step, 10));
						if (step === '0') {
							throw new Error(`Field (${type}) has a step of zero`);
						}
						step = parseInt(step, 10) || 1;

						if (upper !== undefined && lower > upper) {
							throw new Error(`Field (${type}) has an invalid range`);
						}

						const outOfRangeError =
							lower < low ||
							(upper !== undefined && upper > high) ||
							(upper === undefined && lower > high);

						if (outOfRangeError) {
							throw new Error(`Field value (${value}) is out of range`);
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
						pointer = lower;

						do {
							typeObj[pointer] = true; // mutates the field objects values inside CronTime
							pointer += step;
						} while (pointer <= upper);
					});
				} else {
					throw new Error(`Field (${type}) cannot be parsed`);
				}
			}
		}
	};

	return CT;
}

module.exports = CronTime;
