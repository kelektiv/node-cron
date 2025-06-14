import { DateTime } from 'luxon';
import sinon from 'sinon';
import { CronTime, validateCronExpression } from '../src';
import { CronError } from '../src/errors';

describe('crontime', () => {
	afterEach(() => {
		expect.hasAssertions();
		sinon.restore();
	});

	it('should test stars (* * * * * *)', () => {
		expect(() => {
			new CronTime('* * * * * *');
		}).not.toThrow();
	});

	it('should test digit (0 * * * * *)', () => {
		expect(() => {
			new CronTime('0 * * * * *');
		}).not.toThrow();
	});

	it('should test multi digits (08 * * * * *)', () => {
		expect(() => {
			new CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test all digits (08 8 8 8 8 5)', () => {
		expect(() => {
			new CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test too many digits (08 8 8 8 8 5)', () => {
		expect(() => {
			new CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test standard cron format (* * * * *)', () => {
		expect(() => {
			new CronTime('* * * * *');
		}).not.toThrow();
	});

	it('should test standard cron format (8 8 8 8 5)', () => {
		const standard = new CronTime('8 8 8 8 5');
		const extended = new CronTime('0 8 8 8 8 5');

		// @ts-expect-error deleting for comparaison purposes
		delete standard.source;
		// @ts-expect-error deleting for comparaison purposes
		delete extended.source;

		expect(extended).toEqual(standard);
	});

	it('should test hyphen (0-10 * * * * *)', () => {
		expect(() => {
			new CronTime('0-10 * * * * *');
		}).not.toThrow();
	});

	it('should test multi hyphens (0-10 0-10 * * * *)', () => {
		expect(() => {
			new CronTime('0-10 0-10 * * * *');
		}).not.toThrow();
	});

	it('should test all hyphens (0-10 0-10 1-10 1-10 1-7 0-1)', () => {
		expect(() => {
			new CronTime('0-10 0-10 1-10 1-10 1-7 0-1');
		}).not.toThrow();
	});

	it('should accept all valid ranges (0-59 0-59 0-23 1-31 1-12 0-7)', () => {
		expect(() => {
			new CronTime('0-59 0-59 0-23 1-31 1-12 0-7');
		}).not.toThrow();
	});

	it('should test comma (0,10 * * * * *)', () => {
		expect(() => {
			new CronTime('0,10 * * * * *');
		}).not.toThrow();
	});

	it('should test multi commas (0,10 0,10 * * * *)', () => {
		expect(() => {
			new CronTime('0,10 0,10 * * * *');
		}).not.toThrow();
	});

	it('should test all commas (0,10 0,10 1,10 1,10 1,7 0,1)', () => {
		expect(() => {
			new CronTime('0,10 0,10 1,10 1,10 1,7 0,1');
		}).not.toThrow();
	});

	it('should test alias (* * * * jan *)', () => {
		expect(() => {
			new CronTime('* * * * jan *');
		}).not.toThrow();
	});

	it('should test multi aliases (* * * * jan,feb *)', () => {
		expect(() => {
			new CronTime('* * * * jan,feb *');
		}).not.toThrow();
	});

	it('should test all aliases (* * * * jan,feb mon,tue)', () => {
		expect(() => {
			new CronTime('* * * * jan,feb mon,tue');
		}).not.toThrow();
	});

	it('should test unknown alias (* * * * jar *)', () => {
		expect(() => {
			new CronTime('* * * * jar *');
		}).toThrow();
	});

	it('should test unknown alias - short (* * * * j *)', () => {
		expect(() => {
			new CronTime('* * * * j *');
		}).toThrow();
	});

	it('should be case-insensitive for aliases (* * * * JAN,FEB MON,TUE)', () => {
		expect(() => {
			new CronTime('* * * * JAN,FEB MON,TUE', null, null);
		}).not.toThrow();
	});

	it('should test too few fields', () => {
		expect(() => {
			new CronTime('* * * *', null, null);
		}).toThrow();
	});

	it('should test too many fields', () => {
		expect(() => {
			new CronTime('* * * * * * *', null, null);
		}).toThrow();
	});

	it('should return the same object with 0 & 7 as Sunday (except "source" prop)', () => {
		const sunday0 = new CronTime('* * * * 0', null, null);
		const sunday7 = new CronTime('* * * * 7', null, null);

		// @ts-expect-error deleting for comparison purposes
		delete sunday0.source;
		// @ts-expect-error deleting for comparison purposes
		delete sunday7.source;

		expect(sunday7).toEqual(sunday0);
	});

	describe('should test out of range values', () => {
		it('should test out of range minute', () => {
			expect(() => {
				new CronTime('-1 * * * *', null, null);
			}).toThrow();
			expect(() => {
				new CronTime('60 * * * *', null, null);
			}).toThrow();
		});

		it('should test out of range hour', () => {
			expect(() => {
				new CronTime('* -1 * * *', null, null);
			}).toThrow();
			expect(() => {
				new CronTime('* 24 * * *', null, null);
			}).toThrow();
		});

		it('should test out of range day-of-month', () => {
			expect(() => {
				new CronTime('* * 0 * *', null, null);
			}).toThrow();
			expect(() => {
				new CronTime('* * 32 * *', null, null);
			}).toThrow();
		});

		it('should test out of range month', () => {
			expect(() => {
				new CronTime('* * * 0 *', null, null);
			}).toThrow();
			expect(() => {
				new CronTime('* * * 13 *', null, null);
			}).toThrow();
		});

		it('should test out of range day-of-week', () => {
			expect(() => {
				new CronTime('* * * * -1', null, null);
			}).toThrow();
			expect(() => {
				new CronTime('* * * * 8', null, null);
			}).toThrow();
		});
	});

	it('should test invalid wildcard expression', () => {
		expect(() => {
			new CronTime('* * * * 0*');
		}).toThrow();
	});

	it('should test invalid step', () => {
		expect(() => {
			new CronTime('* * * 1/ *');
		}).toThrow();

		expect(() => {
			new CronTime('* * * 1/0 *');
		}).toThrow();

		expect(() => {
			new CronTime('* * * 1/00 *');
		}).toThrow();
	});

	it('should test invalid range', () => {
		expect(() => {
			new CronTime('* 2-1 * * *');
		}).toThrow();

		expect(() => {
			new CronTime('* 2-0 * * *');
		}).toThrow();

		expect(() => {
			new CronTime('* 2- * * *');
		}).toThrow();
	});

	it('should test Date', () => {
		const d = new Date();
		const ct = new CronTime(d);
		expect(ct.source).toBeInstanceOf(DateTime);
		expect((ct.source as DateTime).toMillis()).toEqual(d.getTime());
	});

	it('should test day roll-over', () => {
		const numHours = 24;
		const ct = new CronTime('0 0 17 * * *');

		for (let hr = 0; hr < numHours; hr++) {
			const start = new Date(2012, 3, 16, hr, 30, 30);
			const next = ct.getNextDateFrom(start);
			expect(next.toMillis() - start.getTime()).toBeLessThan(
				24 * 60 * 60 * 1000
			);
			expect(next.toMillis()).toBeGreaterThan(start.getTime());
		}
	});

	it('should test illegal repetition syntax', () => {
		expect(() => {
			new CronTime('* * /4 * * *');
		}).toThrow();
	});

	it('should test next date', () => {
		const ct = new CronTime('0 0 */4 * * *');

		const nextDate = new Date();
		nextDate.setHours(23);
		const nextdt = ct.getNextDateFrom(nextDate);

		expect(nextdt.toMillis()).toBeGreaterThan(nextDate.getTime());
		expect(nextdt.hour % 4).toBe(0);
	});

	it('should throw an exception because next date is invalid', () => {
		const ct = new CronTime('0 0 * * * *');
		const nextDate = new Date('My invalid date string');

		expect(() => {
			ct.getNextDateFrom(nextDate);
		}).toThrow('ERROR: You specified an invalid date.');
	});

	it('should test next real date', () => {
		const initialDate = new Date();
		initialDate.setDate(initialDate.getDate() + 1); // in other case date will be in the past
		const ct = new CronTime(initialDate);

		const nextDate = new Date();
		nextDate.setMonth(nextDate.getMonth() + 1);
		expect(ct.source).toBeInstanceOf(DateTime);
		expect(nextDate.getTime()).toBeGreaterThan(
			(ct.source as DateTime).toMillis()
		);
		const nextDt = ct.sendAt();
		// there shouldn't be a "next date" when using a real date.
		// execution happens once
		// so the return should be the date passed in unless explicitly reset
		expect(nextDt.toMillis() < nextDate.getTime()).toBeTruthy();
		expect(nextDt.toMillis()).toEqual(initialDate.getTime());
	});

	describe('presets', () => {
		it('should parse @secondly', () => {
			const cronTime = new CronTime('@secondly');
			expect(cronTime.toString()).toBe('* * * * * *');
		});

		it('should parse @minutely', () => {
			const cronTime = new CronTime('@minutely');
			expect(cronTime.toString()).toBe('0 * * * * *');
		});

		it('should parse @hourly', () => {
			const cronTime = new CronTime('@hourly');
			expect(cronTime.toString()).toBe('0 0 * * * *');
		});

		it('should parse @daily', () => {
			const cronTime = new CronTime('@daily');
			expect(cronTime.toString()).toBe('0 0 0 * * *');
		});

		it('should parse @weekly', () => {
			const cronTime = new CronTime('@weekly');
			expect(cronTime.toString()).toBe('0 0 0 * * 0');
		});

		it('should parse @weekdays', () => {
			const cronTime = new CronTime('@weekdays');
			expect(cronTime.toString()).toBe('0 0 0 * * 1,2,3,4,5');
		});

		it('should parse @weekends', () => {
			const cronTime = new CronTime('@weekends');
			expect(cronTime.toString()).toBe('0 0 0 * * 0,6');
		});

		it('should parse @monthly', () => {
			const cronTime = new CronTime('@monthly');
			expect(cronTime.toString()).toBe('0 0 0 1 * *');
		});

		it('should parse @yearly', () => {
			const cronTime = new CronTime('@yearly');
			expect(cronTime.toString()).toBe('0 0 0 1 1 *');
		});
	});

	describe('should throw an exception because `L` not supported', () => {
		it('(* * * L * *)', () => {
			expect(() => {
				new CronTime('* * * L * *');
			}).toThrow();
		});

		it('(* * * * * L)', () => {
			expect(() => {
				new CronTime('* * * * * L');
			}).toThrow();
		});
	});

	it('should strip off millisecond', () => {
		const cronTime = new CronTime('0 */10 * * * *');
		const x = cronTime.getNextDateFrom(new Date('2018-08-10T02:20:00.999Z'));
		expect(x.toMillis()).toEqual(
			new Date('2018-08-10T02:30:00.000Z').getTime()
		);
	});

	it('should strip off millisecond (2)', () => {
		const cronTime = new CronTime('0 */10 * * * *');
		const x = cronTime.getNextDateFrom(new Date('2018-08-10T02:19:59.999Z'));
		expect(x.toMillis()).toEqual(
			new Date('2018-08-10T02:20:00.000Z').getTime()
		);
	});

	it('should expose getNextDateFrom as a public function', () => {
		const cronTime = new CronTime('0 */10 * * * *');
		cronTime.getNextDateFrom = jest.fn();

		const testDate = new Date('2018-08-10T02:19:59.999Z');
		const testTimezone = 'Asia/Amman';
		cronTime.getNextDateFrom(testDate, testTimezone);

		expect(cronTime.getNextDateFrom).toHaveBeenCalledWith(
			testDate,
			testTimezone
		);
	});

	it('should generate the right next days when cron is set to every minute', () => {
		const cronTime = new CronTime('* * * * *');
		const min = 60000;
		let previousDate = DateTime.fromMillis(Date.UTC(2018, 5, 3, 0, 0));
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime.getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toEqual(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});

	it('should generate the right next days when cron is set to every 15 min', () => {
		const cronTime = new CronTime('*/15 * * * *');
		const min = 60000 * 15;
		let previousDate = DateTime.fromMillis(Date.UTC(2016, 6, 3, 0, 0));
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime.getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toEqual(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});
	it('should work around offset changes that shift time back (1)', () => {
		const d = new Date('10-7-2018');
		// america/Sao_Paulo has a offset change around NOV 3 2018.
		const cronTime = new CronTime('0 0 9 4 * *');
		const nextDate = cronTime.getNextDateFrom(d, 'America/Sao_Paulo');
		expect(nextDate.setZone('America/Sao_Paulo').toISO()).toEqual(
			'2018-11-04T09:00:00.000-02:00'
		);
	});
	it('should work around offset changes that shift time back (2)', () => {
		// asia/Amman DST ends in  26 - OCT-2018 (-1 to hours)
		const currentDate = DateTime.fromISO('2018-10-25T23:00', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('0 0 * * *');
		const nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
		const expectedDate = DateTime.fromISO('2018-10-26T00:00+03:00', {
			zone: 'Asia/Amman'
		});
		expect(nextDate.toMillis() - expectedDate.toMillis()).toBe(0);
	});
	it('should work around offset changes that shifts time forward', () => {
		// asia/Amman DST starts in  30-March-2018 (+1 to hours)
		let currentDate = DateTime.fromISO('2018-03-29T23:00', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('* * * * *');
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
			expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(1000 * 60);
			currentDate = nextDate;
		}
	});
	it('should not execute immediately if conditions have not been met during forward DST jump', () => {
		// europe/Paris DST starts at 30 Mar 2025, 02:00 (+1 to hours)
		let currentDate = DateTime.fromISO('2025-03-30T01:59', {
			zone: 'Europe/Paris'
		});
		const cronTime = new CronTime('20 4 * * *');
		const nextDate = cronTime.getNextDateFrom(currentDate, 'Europe/Paris');
		expect(nextDate.toString()).toEqual(
			DateTime.fromISO('2025-03-30T04:20', { zone: 'Europe/Paris' }).toString()
		);
	});
	it('Should schedule jobs inside offset changes when started exactly one month before, for monthly jobs', () => {
		// there is a DST jump on March 9 at midnight
		let currentDate = DateTime.fromISO('2025-02-09T00:30:00', {
			zone: 'Cuba'
		});
		const cronTime = new CronTime('0 0 9 * *');
		let nextDate = cronTime.getNextDateFrom(currentDate, 'Cuba');
		expect(nextDate.toISO()).toEqual(
			// 28 days minus half an hour since we jump forward
			DateTime.fromMillis(
				currentDate.toMillis() + 1000 * 60 * 60 * 24 * 28 - 1000 * 60 * 30,
				{ zone: 'Cuba' }
			).toISO()
		);
	});
	it('Should schedule jobs inside offset changes that shifts time forward to the end of the shift, for weekly jobs', () => {
		let currentDate = DateTime.fromISO('2018-03-29T23:15', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('30 0 * * 5'); // the next 0:30 is March 30th, but it will jump from 0:00 to 1:00.
		let nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			1000 * 60 * 45
		); // 45 minutes is 30T00:00, which jumps to 1:00 which is past the trigger of 0:30.
		// the next one should just be at 0:30 again. i.e. a week minus 30 minutes.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			3600000 * 24 * 7 - 60000 * 30
		);
		// the next one is again at 0:30, but now we're 'back to normal' with weekly offsets.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			1000 * 3600 * 24 * 7
		);
	});
	it('Should schedule jobs inside offset changes that shifts the time forward to the end of the shift, for daily jobs', () => {
		let currentDate = DateTime.fromISO('2018-03-29T23:45', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('30 0 * * *'); // the next 0:30 is March 30th, but it will jump from 0:00 to 1:00.
		let nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			1000 * 60 * 15
		); // 15 minutes is 30T00:00, which jumps to 1:00 which is past the trigger of 0:30.
		// the next one is tomorrow at 0:30, so 23h30m.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			1000 * 3600 * 24 - 1000 * 60 * 30
		);
		// back to normal.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
			1000 * 3600 * 24
		);
	});
	it('Should schedule jobs inside offset changes that shifts the time forward to the end of the shift, for hourly jobs', () => {
		let currentDate = DateTime.fromISO('2018-03-29T23:45', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('30 * * * *'); // the next 0:30 is March 30th, but it will jump from 0:00 to 1:00.
		let nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
		// 15 minutes is 30T00:00, which jumps to 1:00 which is past the trigger of 0:30.
		expect(nextDate.toISO()).toEqual(
			currentDate.plus({ milliseconds: 1000 * 60 * 15 }).toISO()
		);
		// the next one is at 1:30, so 30m.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toISO()).toEqual(
			currentDate.plus({ milliseconds: 1000 * 60 * 30 }).toISO()
		);
		// back to normal.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toISO()).toEqual(
			currentDate.plus({ milliseconds: 1000 * 60 * 60 }).toISO()
		);
	});
	it('Should schedule jobs inside offset changes that shifts the time forward to the end of the shift, for minutely jobs', () => {
		let currentDate = DateTime.fromISO('2018-03-29T23:59', {
			zone: 'Asia/Amman'
		});
		const cronTime = new CronTime('* * * * *'); // the next minute is 0:00 is March 30th, but it will jump from 0:00 to 1:00.
		let nextDate = cronTime.getNextDateFrom(currentDate, 'Asia/Amman');
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(1000 * 60);
		// the next one is at 1:01:00, this should still be 60 seconds in the future.
		currentDate = nextDate;
		nextDate = cronTime.getNextDateFrom(currentDate);
		expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(1000 * 60);
	});
	it('should generate the right N next days for * * * * *', () => {
		const cronTime = new CronTime('* * * * *');
		let currentDate = DateTime.local().set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime.getNextDateFrom(currentDate);
			expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(1000 * 60);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for 0 0 9 * * *', () => {
		const cronTime = new CronTime('0 0 9 * * *');
		let currentDate = DateTime.local()
			.setZone('utc')
			.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime.getNextDateFrom(currentDate);
			expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
				1000 * 60 * 60 * 24
			);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for 0 0 * * * with a time zone', () => {
		const cronTime = new CronTime('0 * * * *');
		let currentDate = DateTime.fromISO('2018-11-02T23:00', {
			zone: 'America/Sao_Paulo'
		}).set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime.getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
				1000 * 60 * 60
			);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for */3 * * * * with a time zone', () => {
		const cronTime = new CronTime('*/3 * * * *');
		let currentDate = DateTime.fromISO('2018-11-02T23:00', {
			zone: 'America/Sao_Paulo'
		}).set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime.getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate.toMillis() - currentDate.toMillis()).toEqual(
				1000 * 60 * 3
			);
			currentDate = nextDate;
		}
	});
	it('should test valid range of months (*/15 * * 7-12 *)', () => {
		const cronTime = new CronTime('*/15 * * 7-12 *');
		const previousDate1 = new Date(Date.UTC(2018, 3, 0, 0, 0));
		const nextDate1 = cronTime.getNextDateFrom(previousDate1, 'UTC');
		expect(nextDate1.toJSDate().toUTCString()).toEqual(
			new Date(Date.UTC(2018, 6, 1, 0, 0)).toUTCString()
		);
		const previousDate2 = new Date(Date.UTC(2018, 8, 0, 0, 0));
		const nextDate2 = cronTime.getNextDateFrom(previousDate2, 'UTC');
		expect(nextDate2.toJSDate().toUTCString()).toEqual(
			new Date(Date.UTC(2018, 8, 0, 0, 15)).toUTCString()
		);
	});
	it('should generate the right next day when cron is set to every 15 min in Feb', () => {
		const cronTime = new CronTime('*/15 * * FEB *');
		const previousDate = new Date(Date.UTC(2018, 3, 0, 0, 0));
		const nextDate = cronTime.getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.toISO()).toEqual('2019-02-01T00:00:00.000Z');
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (1)', () => {
		const cronTime = new CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 3, 21, 0, 0));
		const nextDate = cronTime.getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.toMillis()).toEqual(
			new Date(Date.UTC(2019, 3, 25, 8, 0)).getTime()
		);
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (2)', () => {
		const cronTime = new CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 3, 26, 0, 0));
		const nextDate = cronTime.getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.toMillis()).toEqual(
			new Date(Date.UTC(2019, 4, 1, 8, 0)).getTime()
		);
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (3)', () => {
		const cronTime = new CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 7, 1, 7, 59));
		const nextDate = cronTime.getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toEqual(
			new Date(Date.UTC(2019, 7, 1, 8, 0)).valueOf()
		);
	});

	it('should accept 0 as a valid UTC offset', () => {
		sinon.useFakeTimers();
		const cronTime = new CronTime('0 11 * * *', null, 0);
		const expected = DateTime.local().plus({ hours: 11 }).toSeconds();
		const actual = cronTime.sendAt().toSeconds();
		expect(actual).toEqual(expected);
	});

	it('should accept -120 as a valid UTC offset', () => {
		sinon.useFakeTimers();
		const cronTime = new CronTime('0 11 * * *', null, -120);
		const expected = DateTime.local().plus({ hours: 13 }).toSeconds();
		const actual = cronTime.sendAt().toSeconds();
		expect(actual).toEqual(expected);
	});

	it('should detect real date in the past', () => {
		const clock = sinon.useFakeTimers();
		const d = new Date();
		clock.tick(1000);
		const time = new CronTime(d);
		expect(() => {
			time.sendAt();
		}).toThrow();
	});

	it('should throw when providing both exclusive parameters timeZone and utcOffset', () => {
		expect(() => {
			// @ts-expect-error testing runtime exception
			new CronTime('* * * * *', 'Asia/Amman', 120);
		}).toThrow();
	});
});

describe('validateCronExpression', () => {
	it('should return true for valid cron expressions', () => {
		const validExpressions = [
			'* * * * *',
			'0 0 * * *',
			'0 0 1 1 *',
			'*/5 * * * *'
		];

		validExpressions.forEach(expression => {
			const validation = validateCronExpression(expression);
			expect(validation.valid).toBe(true);
			expect(validation.error).toBeUndefined();
		});
	});

	it('should return false for invalid cron expressions', () => {
		const invalidExpressions = [
			'* * * *',
			'60 * * * *',
			'* * * * * * *',
			'invalid cron'
		];

		invalidExpressions.forEach(expression => {
			const validation = validateCronExpression(expression);
			expect(validation.valid).toBe(false);
			expect(validation.error).toBeInstanceOf(CronError);
		});
	});
});
