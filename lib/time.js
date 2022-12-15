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
			const dt = luxon.DateTime.fromObject({}, { zone: zone });
			if (dt.invalid) {
				throw new Error('Invalid timezone.');
			}

			this.zone = zone;
		}

		if (typeof utcOffset !== 'undefined') {
			this.utcOffset = utcOffset;
		}

		var that = this;
		TIME_UNITS.map(timeUnit => {
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
			var months = Object.keys(this.month);
			var dom = Object.keys(this.dayOfMonth);
			var ok = false;

			/* if a dayOfMonth is not found in all months, we only need to fix the last
                 wrong month  to prevent infinite loop */
			var lastWrongMonth = NaN;
			for (var i = 0; i < months.length; i++) {
				var m = months[i];
				var con = MONTH_CONSTRAINTS[parseInt(m, 10)];

				for (var j = 0; j < dom.length; j++) {
					var day = dom[j];
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
				var notOkCon = MONTH_CONSTRAINTS[parseInt(lastWrongMonth, 10)];
				for (var k = 0; k < dom.length; k++) {
					var notOkDay = dom[k];
					if (notOkDay > notOkCon) {
						delete this.dayOfMonth[notOkDay];
						var fixedDay = Number(notOkDay) % notOkCon;
						this.dayOfMonth[fixedDay] = true;
					}
				}
			}
		},

		/**
		 * Calculate the "next" scheduled time
		 */
		sendAt: function (i) {
			var date = this.realDate ? this.source : luxon.DateTime.local();
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
				var dates = [];
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
			var self = this;
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
			var date = start;
			var firstDate = start.toMillis();
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

			// it shouldn't take more than 5 seconds to find the next execution time
			// being very generous with this. Throw error if it takes too long to find the next time to protect from
			// infinite loop.
			var timeout = Date.now() + 5000;
			// determine next date
			while (true) {
				var diff = date - start;
				console.log(date.toISO());

				// hard stop if the current date is after the expected execution
				if (Date.now() > timeout) {
					throw new Error(
						`Something went wrong. It took over five seconds to find the next execution time for the cron job.
							Please refer to the canonical issue (https://github.com/kelektiv/node-cron/issues/467) and provide the following string if you would like to help debug:
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
					const expectedHour = date.hour + (expectedMinute === 60);

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
					const expectedHour = date.hour + (expectedMinute === 60);

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
					const expectedHour = date.hour + (expectedMinute === 60);

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
		 * A pair is returned, whose first is a boolean representing if an acceptable time was found inside the jump,
		 * and whose second is a DateTime representing the first millisecond after the jump.
		 * @param date
		 */
		_findPreviousDSTJump: function (date) {
			/** @type number */
			let expectedMinute, expectedHour, actualMinute, actualHour;
			/** @type DateTime */
			let maybeJumpingPoint;
			do {
				expectedMinute = date.minute - 1;
				expectedHour = date.hour - 1;

				if (expectedMinute < 0) expectedMinute += 60;
				if (expectedHour < 0) expectedHour += 60;

				maybeJumpingPoint = date.minus({ minute: 1 });

				actualMinute = maybeJumpingPoint.minute;
				actualHour = maybeJumpingPoint.hour;
			} while (expectedMinute === actualMinute && expectedHour === actualHour);

			const afterJumpingPoint = maybeJumpingPoint
				.plus({ minute: 1 }) // back to the first minute _after_ the jump
				.set({ seconds: 0, millisecond: 0 }); // and set seconds and MS to zero.
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
			// start by getting the first minute inside the skipped range.
			const startingMinute = (beforeJumpingPoint.minute + 1) % 60;
			const startingHour =
				(beforeJumpingPoint.hour + (startingMinute === 0)) % 24;

			// construct ranges to inspect. Using these, all possible seconds in the skipped range are checked.
			const minuteRange = [];
			const hourRange = [];

			// build the minute range. The jump is assumed to be at least 1 minute,
			// so if the start and end minutes are equal, then there must be at least 1 hour of skipped time.
			if (startingMinute === afterJumpingPoint.minute) {
				minuteRange.push(...Array.from({ length: 60 }, (v, k) => k));
			} else {
				// we need a range inclusive to both numbers, possibly wrapping around the hour mark.
				let minute = startingMinute;
				minuteRange.push(minute);
				while (minute !== afterJumpingPoint.minute) {
					minute = (minute + 1) % 60;
					minuteRange.push(minute); // ordered so that the afterJumpingPoint minute itself is also inserted.
				}
			}

			if (startingHour === afterJumpingPoint.hour) {
				// assumed that the jump is less than 24 hours, so this must be the only hour.
				hourRange.push(startingHour);
			} else {
				// we need a range inclusive to both numbers, possibly wrapping around the day mark.
				// If a day wrap-around actually happens, other assumptions have been broken, but at least there won't be an infinite loop here.
				let hour = startingHour;
				hourRange.push(hour);
				while (hour !== afterJumpingPoint.hour) {
					hour = (hour + 1) % 24;
					hourRange.push(hour);
				}
			}

			console.log('minute range', minuteRange);
			console.log('hour range', hourRange);

			for (const h of hourRange) {
				if (!(h in this.hour)) continue; // hour mismatch, not a valid time.

				// edge case: Imagine a 30 minutes range from (x):45 to (x+1):15.
				// With just a double for loop, we would explore (x):58, (x):59, !!(x):00!!, which is outside the skipped zone.
				// Use a lower bound if we are in the first hour, as extra condition for the inner loop to avoid this.
				let minuteLowerBound;
				if (h === startingHour) {
					minuteLowerBound = startingMinute;
				} else {
					minuteLowerBound = 0;
				}

				for (
					let m = 0;
					m < minuteRange.length && minuteRange[m] >= minuteLowerBound;
					m++
				) {
					if (!(m in this.minute)) continue; // minute mismatch, not a valid time.

					for (let s = 0; s < 60; s++) {
						if (s in this.second) {
							// full match, we have a valid time inside the range.
							return true;
						}
					}
				}
			}

			// there is nothing in the range.
			return false;
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

			console.log('hours diff? ', expectedHour, actualHour, hoursJumped);

			return hoursJumped || minutesJumped;
		},

		/**
		 * wildcard, or all params in array (for to string)
		 */
		_wcOrAll: function (type) {
			if (this._hasAll(type)) {
				return '*';
			}

			var all = [];
			for (var time in this[type]) {
				all.push(time);
			}

			return all.join(',');
		},

		_hasAll: function (type) {
			var constraints = CONSTRAINTS[TIME_UNITS.indexOf(type)];

			for (var i = constraints[0], n = constraints[1]; i < n; i++) {
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

			var units = source.trim().split(/\s+/);

			// seconds are optional
			if (units.length < TIME_UNITS_LEN - 1) {
				throw new Error('Too few fields');
			}

			if (units.length > TIME_UNITS_LEN) {
				throw new Error('Too many fields');
			}

			var unitsLen = units.length;
			for (var i = 0; i < TIME_UNITS_LEN; i++) {
				// If the split source string doesn't contain all digits,
				// assume defaults for first n missing digits.
				// This adds support for 5-digit standard cron syntax
				var cur = units[i - (TIME_UNITS_LEN - unitsLen)] || PARSE_DEFAULTS[i];
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
			var typeObj = this[type];
			var pointer;
			var low = constraints[0];
			var high = constraints[1];

			var fields = value.split(',');
			fields.forEach(field => {
				var wildcardIndex = field.indexOf('*');
				if (wildcardIndex !== -1 && wildcardIndex !== 0) {
					throw new Error(
						`Field (${field}) has an invalid wildcard expression`
					);
				}
			});

			// * is a shortcut to [low-high] range for the field
			value = value.replace(RE_WILDCARDS, `${low}-${high}`);

			// commas separate information, so split based on those
			var allRanges = value.split(',');

			for (var i = 0; i < allRanges.length; i++) {
				if (allRanges[i].match(RE_RANGE)) {
					allRanges[i].replace(RE_RANGE, ($0, lower, upper, step) => {
						lower = parseInt(lower, 10);
						upper = parseInt(upper, 10) || undefined;

						const wasStepDefined = !isNaN(parseInt(step, 10));
						if (step === '0') {
							throw new Error(`Field (${type}) has a step of zero`);
						}
						step = parseInt(step, 10) || 1;

						if (upper && lower > upper) {
							throw new Error(`Field (${type}) has an invalid range`);
						}

						const outOfRangeError =
							lower < low ||
							(upper && upper > high) ||
							(!upper && lower > high);

						if (outOfRangeError) {
							throw new Error(`Field value (${value}) is out of range`);
						}

						// Positive integer higher than constraints[0]
						lower = Math.min(Math.max(low, ~~Math.abs(lower)), high);

						// Positive integer lower than constraints[1]
						if (upper) {
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
