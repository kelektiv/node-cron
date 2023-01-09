/* eslint-disable no-new */
const sinon = require('sinon');
const luxon = require('luxon');
const cron = require('../lib/cron');

describe('crontime', () => {
	it('should test stars (* * * * * *)', () => {
		expect(() => {
			new cron.CronTime('* * * * * *');
		}).not.toThrow();
	});

	it('should test digit (0 * * * * *)', () => {
		expect(() => {
			new cron.CronTime('0 * * * * *');
		}).not.toThrow();
	});

	it('should test multi digits (08 * * * * *)', () => {
		expect(() => {
			new cron.CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test all digits (08 8 8 8 8 5)', () => {
		expect(() => {
			new cron.CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test too many digits (08 8 8 8 8 5)', () => {
		expect(() => {
			new cron.CronTime('08 * * * * *');
		}).not.toThrow();
	});

	it('should test standard cron format (* * * * *)', () => {
		expect(() => {
			new cron.CronTime('* * * * *');
		}).not.toThrow();
	});

	it('should test standard cron format (8 8 8 8 5)', () => {
		const standard = new cron.CronTime('8 8 8 8 5');
		const extended = new cron.CronTime('0 8 8 8 8 5');

		expect(standard.dayOfWeek).toEqual(extended.dayOfWeek);
		expect(standard.month).toEqual(extended.month);
		expect(standard.dayOfMonth).toEqual(extended.dayOfMonth);
		expect(standard.hour).toEqual(extended.hour);
		expect(standard.minute).toEqual(extended.minute);
		expect(standard.second).toEqual(extended.second);
	});

	it('should test hyphen (0-10 * * * * *)', () => {
		expect(() => {
			new cron.CronTime('0-10 * * * * *');
		}).not.toThrow();
	});

	it('should test multi hyphens (0-10 0-10 * * * *)', () => {
		expect(() => {
			new cron.CronTime('0-10 0-10 * * * *');
		}).not.toThrow();
	});

	it('should test all hyphens (0-10 0-10 1-10 1-10 0-6 0-1)', () => {
		expect(() => {
			new cron.CronTime('0-10 0-10 1-10 1-10 0-6 0-1');
		}).not.toThrow();
	});

	it('should test comma (0,10 * * * * *)', () => {
		expect(() => {
			new cron.CronTime('0,10 * * * * *');
		}).not.toThrow();
	});

	it('should test multi commas (0,10 0,10 * * * *)', () => {
		expect(() => {
			new cron.CronTime('0,10 0,10 * * * *');
		}).not.toThrow();
	});

	it('should test all commas (0,10 0,10 1,10 1,10 0,6 0,1)', () => {
		expect(() => {
			new cron.CronTime('0,10 0,10 1,10 1,10 0,6 0,1');
		}).not.toThrow();
	});

	it('should test alias (* * * * jan *)', () => {
		expect(() => {
			new cron.CronTime('* * * * jan *');
		}).not.toThrow();
	});

	it('should test multi aliases (* * * * jan,feb *)', () => {
		expect(() => {
			new cron.CronTime('* * * * jan,feb *');
		}).not.toThrow();
	});

	it('should test all aliases (* * * * jan,feb mon,tue)', () => {
		expect(() => {
			new cron.CronTime('* * * * jan,feb mon,tue');
		}).not.toThrow();
	});

	it('should test unknown alias (* * * * jar *)', () => {
		expect(() => {
			new cron.CronTime('* * * * jar *');
		}).toThrow();
	});

	it('should test unknown alias - short (* * * * j *)', () => {
		expect(() => {
			new cron.CronTime('* * * * j *');
		}).toThrow();
	});

	it('should test too few fields', () => {
		expect(() => {
			new cron.CronTime('* * * *', null, null);
		}).toThrow();
	});

	it('should test too many fields', () => {
		expect(() => {
			new cron.CronTime('* * * * * * *', null, null);
		}).toThrow();
	});

	it('should test out of range values', () => {
		expect(() => {
			new cron.CronTime('* * * * 1234', null, null);
		}).toThrow();
	});

	it('should test invalid wildcard expression', () => {
		expect(() => {
			new cron.CronTime('* * * * 0*');
		}).toThrow();
	});

	it('should test invalid step', () => {
		expect(() => {
			new cron.CronTime('* * * 1/0 *');
		}).toThrow();
	});

	it('should test invalid range', () => {
		expect(() => {
			new cron.CronTime('* 2-1 * * *');
		}).toThrow();
	});

	it('should test Date', () => {
		const d = new Date();
		const ct = new cron.CronTime(d);
		expect(ct.source.toMillis()).toEqual(d.getTime());
	});

	it('should test day roll-over', () => {
		const numHours = 24;
		const ct = new cron.CronTime('0 0 17 * * *');

		for (let hr = 0; hr < numHours; hr++) {
			const start = new Date(2012, 3, 16, hr, 30, 30);
			const next = ct._getNextDateFrom(start);
			expect(next - start).toBeLessThan(24 * 60 * 60 * 1000);
			expect(next.toMillis()).toBeGreaterThan(start.getTime());
		}
	});

	it('should test illegal repetition syntax', () => {
		expect(() => {
			new cron.CronTime('* * /4 * * *');
		}).toThrow();
	});

	it('should test next date', () => {
		const ct = new cron.CronTime('0 0 */4 * * *');

		const nextDate = new Date();
		nextDate.setHours(23);
		const nextdt = ct._getNextDateFrom(nextDate);

		expect(nextdt.toMillis()).toBeGreaterThan(nextDate.getTime());
		expect(nextdt.hour % 4).toEqual(0);
	});

	it('should throw an exception because next date is invalid', () => {
		const ct = new cron.CronTime('0 0 * * * *');
		const nextDate = new Date('My invalid date string');
		try {
			ct._getNextDateFrom(nextDate);
		} catch (e) {
			expect(e.message).toEqual('ERROR: You specified an invalid date.');
		}
	});

	it('should test next real date', () => {
		const initialDate = new Date();
		initialDate.setDate(initialDate.getDate() + 1); // In other case date will be in the past
		const ct = new cron.CronTime(initialDate);

		const nextDate = new Date();
		nextDate.setMonth(nextDate.getMonth() + 1);
		expect(nextDate.getTime()).toBeGreaterThan(ct.source.toMillis());
		const nextdt = ct.sendAt(0);
		// there shouldn't be a "next date" when using a real date.
		// execution happens once
		// so the return should be the date passed in unless explicitly reset
		expect(nextdt < nextDate).toBeTruthy();
		expect(nextdt.toMillis()).toEqual(initialDate.getTime());
	});

	describe('presets', () => {
		it('should parse @secondly', () => {
			const cronTime = new cron.CronTime('@secondly');
			expect(cronTime.toString()).toEqual('* * * * * *');
		});

		it('should parse @minutely', () => {
			const cronTime = new cron.CronTime('@minutely');
			expect(cronTime.toString()).toEqual('0 * * * * *');
		});

		it('should parse @hourly', () => {
			const cronTime = new cron.CronTime('@hourly');
			expect(cronTime.toString()).toEqual('0 0 * * * *');
		});

		it('should parse @daily', () => {
			const cronTime = new cron.CronTime('@daily');
			expect(cronTime.toString()).toEqual('0 0 0 * * *');
		});

		it('should parse @weekly', () => {
			const cronTime = new cron.CronTime('@weekly');
			expect(cronTime.toString()).toEqual('0 0 0 * * 0');
		});

		it('should parse @weekdays', () => {
			const cronTime = new cron.CronTime('@weekdays');
			expect(cronTime.toString()).toEqual('0 0 0 * * 1,2,3,4,5');
		});

		it('should parse @weekends', () => {
			const cronTime = new cron.CronTime('@weekends');
			expect(cronTime.toString()).toEqual('0 0 0 * * 0,6');
		});

		it('should parse @monthly', () => {
			const cronTime = new cron.CronTime('@monthly');
			expect(cronTime.toString()).toEqual('0 0 0 1 * *');
		});

		it('should parse @yearly', () => {
			const cronTime = new cron.CronTime('@yearly');
			expect(cronTime.toString()).toEqual('0 0 0 1 0 *');
		});
	});

	describe('should throw an exception because `L` not supported', () => {
		it('(* * * L * *)', () => {
			expect(() => {
				new cron.CronTime('* * * L * *');
			}).toThrow();
		});

		it('(* * * * * L)', () => {
			expect(() => {
				new cron.CronTime('* * * * * L');
			}).toThrow();
		});
	});

	it('should strip off millisecond', () => {
		const cronTime = new cron.CronTime('0 */10 * * * *');
		const x = cronTime._getNextDateFrom(new Date('2018-08-10T02:20:00.999Z'));
		expect(x.toMillis()).toEqual(
			new Date('2018-08-10T02:30:00.000Z').getTime()
		);
	});

	it('should strip off millisecond (2)', () => {
		const cronTime = new cron.CronTime('0 */10 * * * *');
		const x = cronTime._getNextDateFrom(new Date('2018-08-10T02:19:59.999Z'));
		expect(x.toMillis()).toEqual(
			new Date('2018-08-10T02:20:00.000Z').getTime()
		);
	});

	it('should generete the right next days when cron is set to every minute', () => {
		const cronTime = new cron.CronTime('* * * * *');
		const min = 60000;
		let previousDate = new Date(Date.UTC(2018, 5, 3, 0, 0));
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime._getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toEqual(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});

	it('should generete the right next days when cron is set to every 15 min', () => {
		const cronTime = new cron.CronTime('*/15 * * * *');
		const min = 60000 * 15;
		let previousDate = new Date(Date.UTC(2016, 6, 3, 0, 0));
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime._getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toEqual(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});
	it('should work around time zone changes that shifts time back (1)', () => {
		const d = new Date('10-7-2018');
		// America/Sao_Paulo has a time zone change around NOV 3 2018.
		const cronTime = new cron.CronTime('0 0 9 4 * *');
		const nextDate = cronTime._getNextDateFrom(d, 'America/Sao_Paulo');
		expect(nextDate.valueOf()).toEqual(
			luxon.DateTime.fromISO('2018-11-04T09:00:00.000-02:00').valueOf()
		);
	});
	it('should work around time zone changes that shifts time back (2)', () => {
		// Asia/Amman DST ends in  26 - OCT-2018 (-1 to hours)
		const currentDate = luxon.DateTime.fromISO('2018-10-25T23:00', {
			zone: 'Asia/Amman'
		});
		const cronTime = new cron.CronTime('0 0 * * *');
		const nextDate = cronTime._getNextDateFrom(currentDate, 'Asia/Amman');
		const expectedDate = luxon.DateTime.fromISO('2018-10-26T00:00+03:00', {
			zone: 'Asia/Amman'
		});
		expect(nextDate - expectedDate).toEqual(0);
	});
	it('should work around time zone changes that shifts time forward', () => {
		// Asia/Amman DST starts in  30-March-2018 (+1 to hours)
		let currentDate = luxon.DateTime.fromISO('2018-03-29T23:00', {
			zone: 'Asia/Amman'
		});
		const cronTime = new cron.CronTime('* * * * *');
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime._getNextDateFrom(currentDate, 'Asia/Amman');
			expect(nextDate - currentDate).toEqual(1000 * 60);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for * * * * *', () => {
		const cronTime = new cron.CronTime('* * * * *');
		let currentDate = luxon.DateTime.local().set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime._getNextDateFrom(currentDate);
			expect(nextDate - currentDate).toEqual(1000 * 60);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for 0 0 9 * * *', () => {
		const cronTime = new cron.CronTime('0 0 9 * * *');
		let currentDate = luxon.DateTime.local()
			.setZone('utc')
			.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
		for (let i = 0; i < 100; i++) {
			const nextDate = cronTime._getNextDateFrom(currentDate);
			expect(nextDate - currentDate).toEqual(1000 * 60 * 60 * 24);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for 0 0 * * * with a time zone', () => {
		const cronTime = new cron.CronTime('0 * * * *');
		let currentDate = luxon.DateTime.fromISO('2018-11-02T23:00', {
			zone: 'America/Sao_Paulo'
		}).set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime._getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate - currentDate).toEqual(1000 * 60 * 60);
			currentDate = nextDate;
		}
	});
	it('should generate the right  N next days for */3 * * * * with a time zone', () => {
		const cronTime = new cron.CronTime('*/3 * * * *');
		let currentDate = luxon.DateTime.fromISO('2018-11-02T23:00', {
			zone: 'America/Sao_Paulo'
		}).set({ second: 0, millisecond: 0 });
		for (let i = 0; i < 25; i++) {
			const nextDate = cronTime._getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate - currentDate).toEqual(1000 * 60 * 3);
			currentDate = nextDate;
		}
	});
	it('should generete the right next day when cron is set to every 15 min in Feb', () => {
		const cronTime = new cron.CronTime('*/15 * * FEB *');
		const previousDate = new Date(Date.UTC(2018, 3, 0, 0, 0));
		const nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toEqual(
			new Date(Date.UTC(2019, 1, 1, 0, 0)).valueOf()
		);
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (1)', () => {
		const cronTime = new cron.CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 3, 21, 0, 0));
		const nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.toMillis()).toEqual(
			new Date(Date.UTC(2019, 3, 25, 8, 0)).getTime()
		);
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (2)', () => {
		const cronTime = new cron.CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 3, 26, 0, 0));
		const nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.toMillis()).toEqual(
			new Date(Date.UTC(2019, 4, 1, 8, 0)).getTime()
		);
	});
	it('should generate the right next day when cron is set to both day of the month and day of the week (3)', () => {
		const cronTime = new cron.CronTime('0 8 1 * 4');
		const previousDate = new Date(Date.UTC(2019, 7, 1, 7, 59));
		const nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toEqual(
			new Date(Date.UTC(2019, 7, 1, 8, 0)).valueOf()
		);
	});

	it('should accept 0 as a valid UTC offset', () => {
		const clock = sinon.useFakeTimers();

		const cronTime = new cron.CronTime('0 11 * * *', null, 0);
		const expected = luxon.DateTime.local().plus({ hours: 11 }).toSeconds();
		const actual = cronTime.sendAt().toSeconds();

		expect(actual).toEqual(expected);

		clock.restore();
	});

	it('should accept -120 as a valid UTC offset', () => {
		const clock = sinon.useFakeTimers();

		const cronTime = new cron.CronTime('0 11 * * *', null, -120);
		const expected = luxon.DateTime.local().plus({ hours: 13 }).toSeconds();
		const actual = cronTime.sendAt().toSeconds();

		expect(actual).toEqual(expected);

		clock.restore();
	});

	it('should accept 4 as a valid UTC offset', () => {
		const clock = sinon.useFakeTimers();

		const cronTime = new cron.CronTime('0 11 * * *', null, 5);
		const expected = luxon.DateTime.local().plus({ hours: 6 }).toSeconds();
		const actual = cronTime.sendAt().toSeconds();

		expect(actual).toEqual(expected);

		clock.restore();
	});

	it('should detect real date in the past', () => {
		const clock = sinon.useFakeTimers();

		const d = new Date();
		clock.tick(1000);
		const time = new cron.CronTime(d);
		expect(() => {
			time.sendAt();
		}).toThrow();
		clock.restore();
	});
});
