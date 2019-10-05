var cron = require('../lib/cron');
var moment = require('moment-timezone');
var sinon = require('sinon');

/* eslint-disable no-new */

describe('crontime', function() {
	test('should test stars (* * * * * *)', function() {
		expect(function() {
			new cron.CronTime('* * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test digit (0 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test multi digits (08 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test all digits (08 8 8 8 8 5)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test too many digits (08 8 8 8 8 5)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test standard cron format (* * * * *)', function() {
		expect(function() {
			new cron.CronTime('* * * * *');
		}).not.toThrowError(Error);
	});

	test('should test standard cron format (8 8 8 8 5)', function() {
		var standard = new cron.CronTime('8 8 8 8 5');
		var extended = new cron.CronTime('0 8 8 8 8 5');

		expect(standard.dayOfWeek).toEqual(extended.dayOfWeek);
		expect(standard.month).toEqual(extended.month);
		expect(standard.dayOfMonth).toEqual(extended.dayOfMonth);
		expect(standard.hour).toEqual(extended.hour);
		expect(standard.minute).toEqual(extended.minute);
		expect(standard.second).toEqual(extended.second);
	});

	test('should test hyphen (0-10 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0-10 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test multi hyphens (0-10 0-10 * * * *)', function() {
		expect(function() {
			new cron.CronTime('0-10 0-10 * * * *');
		}).not.toThrowError(Error);
	});

	test('should test all hyphens (0-10 0-10 0-10 0-10 0-10 0-1)', function() {
		expect(function() {
			new cron.CronTime('0-10 0-10 0-10 0-10 0-10 0-1');
		}).not.toThrowError(Error);
	});

	test('should test comma (0,10 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0,10 * * * * *');
		}).not.toThrowError(Error);
	});

	test('should test multi commas (0,10 0,10 * * * *)', function() {
		expect(function() {
			new cron.CronTime('0,10 0,10 * * * *');
		}).not.toThrowError(Error);
	});

	test('should test all commas (0,10 0,10 0,10 0,10 0,10 0,1)', function() {
		expect(function() {
			new cron.CronTime('0,10 0,10 0,10 0,10 0,10 0,1');
		}).not.toThrowError(Error);
	});

	test('should test alias (* * * * jan *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan *');
		}).not.toThrowError(Error);
	});

	test('should test multi aliases (* * * * jan,feb *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan,feb *');
		}).not.toThrowError(Error);
	});

	test('should test all aliases (* * * * jan,feb mon,tue)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan,feb mon,tue');
		}).not.toThrowError(Error);
	});

	test.todo('should test every second monday (* * * * * mon/2)');

	test('should test unknown alias (* * * * jar *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jar *');
		}).toThrowError(Error);
	});

	test('should test unknown alias - short (* * * * j *)', function() {
		expect(function() {
			new cron.CronTime('* * * * j *');
		}).toThrowError(Error);
	});

	test('should test Date', function() {
		var d = new Date();
		var ct = new cron.CronTime(d);
		expect(ct.source.isSame(d.getTime())).toBe(true);
	});

	test('should test day roll-over', function() {
		var numHours = 24;
		var ct = new cron.CronTime('0 0 17 * * *');

		for (var hr = 0; hr < numHours; hr++) {
			var start = new Date(2012, 3, 16, hr, 30, 30);
			var next = ct._getNextDateFrom(start);

			expect(next - start).toBeLessThan(24 * 60 * 60 * 1000);
			expect(next._d.getTime() / 1000).toBeGreaterThan(start.getTime() / 1000);
		}
	});

	test('should test illegal repetition syntax', function() {
		expect(function() {
			new cron.CronTime('* * /4 * * *');
		}).toThrowError(Error);
	});

	test('should test next date', function() {
		var ct = new cron.CronTime('0 0 */4 * * *');

		var nextDate = new Date();
		nextDate.setHours(23);
		var nextdt = ct._getNextDateFrom(nextDate);

		expect(nextdt._d.getTime() / 1000).toBeGreaterThan(
			nextDate.getTime() / 1000
		);
		expect(nextdt.hours() % 4).toBe(0);
	});

	test('should throw an exception because next date is invalid', function() {
		var ct = new cron.CronTime('0 0 * * * *');
		var nextDate = new Date('My invalid date string');
		try {
			ct._getNextDateFrom(nextDate);
		} catch (e) {
			expect(e.message).toBe('ERROR: You specified an invalid date.');
		}
	});

	test('should test next real date', function() {
		var initialDate = new Date();
		var ct = new cron.CronTime(initialDate);

		var nextDate = new Date();
		nextDate.setMonth(nextDate.getMonth() + 1);
		expect(nextDate.getTime() / 1000).toBeGreaterThan(
			ct.source._d.getTime() / 1000
		);
		var nextdt = ct.sendAt(0);
		// there shouldn't be a "next date" when using a real date.
		// execution happens once
		// so the return should be the date passed in unless explicitly reset
		expect(nextdt.isBefore(nextDate)).toBe(true);
		expect(nextdt.isSame(initialDate)).toBe(true);
	});

	test.todo('should test next month selection');

	describe('should throw an exception because `L` not supported', function() {
		test('(* * * L * *)', function() {
			expect(function() {
				new cron.CronTime('* * * L * *');
			}).toThrowError(Error);
		});

		test('(* * * * * L)', function() {
			expect(function() {
				new cron.CronTime('* * * * * L');
			}).toThrowError(Error);
		});
	});

	test('should strip off millisecond', function() {
		var cronTime = new cron.CronTime('0 */10 * * * *');
		var x = cronTime._getNextDateFrom(new Date('2018-08-10T02:20:00.999Z'));
		expect(x.toISOString()).toBe('2018-08-10T02:30:00.000Z');
	});

	test('should strip off millisecond (2)', function() {
		var cronTime = new cron.CronTime('0 */10 * * * *');
		var x = cronTime._getNextDateFrom(new Date('2018-08-10T02:19:59.999Z'));
		expect(x.toISOString()).toBe('2018-08-10T02:20:00.000Z');
	});

	test('should generete the right next days when cron is set to every minute', function() {
		var cronTime = new cron.CronTime('* * * * *');
		var min = 60000;
		var previousDate = new Date(Date.UTC(2018, 5, 3, 0, 0));
		for (var i = 0; i < 25; i++) {
			var nextDate = cronTime._getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toBe(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});

	test('should generete the right next days when cron is set to every 15 min', function() {
		var cronTime = new cron.CronTime('*/15 * * * *');
		var min = 60000 * 15;
		var previousDate = new Date(Date.UTC(2016, 6, 3, 0, 0));
		for (var i = 0; i < 25; i++) {
			var nextDate = cronTime._getNextDateFrom(previousDate);
			expect(nextDate.valueOf()).toBe(previousDate.valueOf() + min);
			previousDate = nextDate;
		}
	});

	test('should work around time zone changes that shifts time back (1)', function() {
		var d = new Date('10-7-2018');
		// America/Sao_Paulo has a time zone change around NOV 3 2018.
		var cronTime = new cron.CronTime('0 0 9 4 * *');
		var nextDate = cronTime._getNextDateFrom(d, 'America/Sao_Paulo');
		expect(nextDate.valueOf()).toBe(
			moment('2018-11-04T09:00:00.000-02:00').valueOf()
		);
	});

	test('should work around time zone changes that shifts time back (2)', function() {
		// Asia/Amman DST ends in  26 - OCT-2018 (-1 to hours)
		var d = moment.tz('2018-10-25T23:00', 'Asia/Amman');
		var cronTime = new cron.CronTime('0 0 * * *');
		var nextDate = cronTime._getNextDateFrom(d, 'Asia/Amman');
		expect(nextDate - moment.tz('2018-10-26T00:00', 'Asia/Amman')).toBe(0);
	});

	test('should work around time zone changes that shifts time forward', function() {
		// Asia/Amman DST starts in  30-March-2018 (+1 to hours)
		var currentDate = moment.tz('2018-03-29T23:00', 'Asia/Amman');
		var cronTime = new cron.CronTime('* * * * *');
		for (var i = 0; i < 100; i++) {
			var nextDate = cronTime._getNextDateFrom(currentDate, 'Asia/Amman');
			expect(nextDate - currentDate).toBe(1000 * 60);
			currentDate = nextDate;
		}
	});

	test('should generate the right  N next days for * * * * *', function() {
		var cronTime = new cron.CronTime('* * * * *');
		var currentDate = moment()
			.seconds(0)
			.milliseconds(0);
		for (var i = 0; i < 100; i++) {
			var nextDate = cronTime._getNextDateFrom(currentDate);
			expect(nextDate - currentDate).toBe(1000 * 60);
			currentDate = nextDate;
		}
	});

	test('should generate the right  N next days for 0 0 9 * * *', function() {
		var cronTime = new cron.CronTime('0 0 9 * * *');
		var currentDate = moment()
			.utc()
			.seconds(0)
			.milliseconds(0)
			.hours(9)
			.minutes(0);
		for (var i = 0; i < 100; i++) {
			var nextDate = cronTime._getNextDateFrom(currentDate);
			expect(nextDate - currentDate).toBe(1000 * 60 * 60 * 24);
			currentDate = nextDate;
		}
	});

	test('should generate the right  N next days for 0 0 * * * with a time zone', function() {
		var cronTime = new cron.CronTime('0 * * * *');
		var currentDate = moment
			.tz('2018-11-02T23:00', 'America/Sao_Paulo')
			.seconds(0)
			.milliseconds(0);
		for (var i = 0; i < 25; i++) {
			var nextDate = cronTime._getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate - currentDate).toBe(1000 * 60 * 60);
			currentDate = nextDate;
		}
	});

	test('should generate the right  N next days for */3 * * * * with a time zone', function() {
		var cronTime = new cron.CronTime('*/3 * * * *');
		var currentDate = moment
			.tz('2018-11-02T23:00', 'America/Sao_Paulo')
			.seconds(0)
			.milliseconds(0);
		for (var i = 0; i < 25; i++) {
			var nextDate = cronTime._getNextDateFrom(
				currentDate,
				'America/Sao_Paulo'
			);
			expect(nextDate - currentDate).toBe(1000 * 60 * 3);
			currentDate = nextDate;
		}
	});

	test('should generete the right next day when cron is set to every 15 min in Feb', function() {
		var cronTime = new cron.CronTime('*/15 * * FEB *');
		var previousDate = new Date(Date.UTC(2018, 3, 0, 0, 0));
		var nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toBe(
			new Date(Date.UTC(2019, 1, 1, 0, 0)).valueOf()
		);
	});

	test('should generate the right next day when cron is set to both day of the month and day of the week (1)', function() {
		var cronTime = new cron.CronTime('0 8 1 * 4');
		var previousDate = new Date(Date.UTC(2019, 3, 22, 0, 0));
		var nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toBe(
			new Date(Date.UTC(2019, 3, 25, 8, 0)).valueOf()
		);
	});

	test('should generate the right next day when cron is set to both day of the month and day of the week (2)', function() {
		var cronTime = new cron.CronTime('0 8 1 * 4');
		var previousDate = new Date(Date.UTC(2019, 3, 26, 0, 0));
		var nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toBe(
			new Date(Date.UTC(2019, 4, 1, 8, 0)).valueOf()
		);
	});

	test('should generate the right next day when cron is set to both day of the month and day of the week (3)', function() {
		var cronTime = new cron.CronTime('0 8 1 * 4');
		var previousDate = new Date(Date.UTC(2019, 7, 1, 7, 59));
		var nextDate = cronTime._getNextDateFrom(previousDate, 'UTC');
		expect(nextDate.valueOf()).toBe(
			new Date(Date.UTC(2019, 7, 1, 8, 0)).valueOf()
		);
	});

	test('should accept 0 as a valid UTC offset', function() {
		var clock = sinon.useFakeTimers();

		var cronTime = new cron.CronTime('0 11 * * *', null, 0);
		var expected = moment()
			.add(11, 'hours')
			.unix();
		var actual = cronTime.sendAt().unix();

		expect(actual).toBe(expected);

		clock.restore();
	});

	test('should accept -120 as a valid UTC offset', function() {
		var clock = sinon.useFakeTimers();

		var cronTime = new cron.CronTime('0 11 * * *', null, -120);
		var expected = moment()
			.add(13, 'hours')
			.unix();
		var actual = cronTime.sendAt().unix();

		expect(actual).toBe(expected);

		clock.restore();
	});
});
