/* eslint-disable no-new */
const sinon = require('sinon');
const cron = require('../lib/cron');

describe('cron', () => {
	let clock;

	beforeEach(() => {
		clock = sinon.useFakeTimers();
	});

	describe('with seconds', () => {
		it('should run every second (* * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('* * * * * *', callback, null, true);

			expect(callback).not.toBeCalled();
			clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run second with oncomplete (* * * * * *)', done => {
			const callback = jest.fn();

			const job = new cron.CronJob(
				'* * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(1);
					done();
				},
				true
			);

			clock.tick(1000);
			job.stop();
			clock.restore();
		});

		it('should use standard cron no-seconds syntax (* * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('* * * * *', callback, null, true);

			clock.tick(1000); // tick second

			clock.tick(59 * 1000); // tick minute

			job.stop();
			clock.restore();

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run every second for 5 seconds (* * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('* * * * * *', callback, null, true);
			for (var i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(5);
		});

		it('should run every second for 5 seconds with oncomplete (* * * * * *)', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'* * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(5);
					done();
				},
				true
			);
			for (var i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			clock.restore();
		});

		it('should run every second for 5 seconds (*/1 * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('*/1 * * * * *', callback, null, true);
			for (var i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(5);
		});

		it('should run every 2 seconds for 1 seconds (*/2 * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('*/2 * * * * *', callback, null, true);
			clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(0);
		});

		it('should run every 2 seconds for 5 seconds (*/2 * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('*/2 * * * * *', callback, null, true);
			for (var i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(2);
		});

		it('should run every second for 5 seconds with oncomplete (*/1 * * * * *)', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'*/1 * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(5);
					done();
				},
				true
			);
			for (var i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			clock.restore();
		});

		it('should run every second for a range ([start]-[end] * * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('0-8 * * * * *', callback, null, true);
			clock.tick(10000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(8);
		});

		it('should run every second for a range ([start]-[end] * * * * *) with onComplete', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'0-8 * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(8);
					done();
				},
				true
			);
			clock.tick(10000);
			job.stop();
			clock.restore();
		});

		it('should default to full range when upper range not provided (1/2 * * * * *)', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'1/2 * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(30);
					done();
				},
				true
			);
			clock.tick(1000 * 60);
			job.stop();
			clock.restore();
		});

		it('should run every second (* * * * * *) using the object constructor', () => {
			const callback = jest.fn();
			const job = new cron.CronJob({
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});
			clock.tick(1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run every second with oncomplete (* * * * * *) using the object constructor', done => {
			const callback = jest.fn();
			const job = new cron.CronJob({
				cronTime: '* * * * * *',
				onTick: callback,
				onComplete: () => {
					expect(callback).toHaveBeenCalledTimes(1);
					done();
				},
				start: true
			});
			clock.tick(1000);
			job.stop();
			clock.restore();
		});
	});

	describe('with minutes', () => {
		it('should fire every 60 min', () => {
			const m60 = 60 * 60 * 1000;
			const l = [];
			const job = new cron.CronJob(
				'00 30 * * * *',
				() => {
					l.push(Math.floor(Date.now() / 60000));
				},
				null,
				true
			);

			clock.tick(m60 * 10);

			expect(l).toHaveLength(10);
			expect(l.every(i => i % 30 === 0)).toBe(true);

			job.stop();
			clock.restore();
		});

		it('should run every 45 minutes for 2 hours (0 */45 * * * *)', () => {
			const callback = jest.fn();
			const job = new cron.CronJob('0 */45 * * * *', callback, null, true);
			for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);
			job.stop();
			clock.restore();
			expect(callback).toHaveBeenCalledTimes(4);
		});

		it('should run every 45 minutes for 2 hours (0 */45 * * * *) with onComplete', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'0 */45 * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(4);
					done();
				},
				true
			);
			for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);
			job.stop();
			clock.restore();
		});
	});

	it('should start and stop job from outside', done => {
		const callback = jest.fn();
		const job = new cron.CronJob(
			'* * * * * *',
			function () {
				callback();
			},
			() => {
				expect(callback).toHaveBeenCalledTimes(1);
				clock.restore();
				done();
			},
			true
		);
		clock.tick(1000);
		job.stop();
	});

	it('should start and stop job from inside (default context)', done => {
		const callback = jest.fn();
		new cron.CronJob(
			'* * * * * *',
			function () {
				callback();
				this.stop();
			},
			() => {
				expect(callback).toHaveBeenCalledTimes(1);
				clock.restore();
				done();
			},
			true
		);
		clock.tick(1000);
	});

	describe('with date', () => {
		it('should run on a specific date', () => {
			const d = new Date();
			const clock = sinon.useFakeTimers(d.getTime());
			const s = d.getSeconds() + 1;
			d.setSeconds(s);
			const callback = jest.fn();
			const job = new cron.CronJob(
				d,
				() => {
					var t = new Date();
					expect(t.getSeconds()).toBe(d.getSeconds());
					callback();
				},
				null,
				true
			);
			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run on a specific date with oncomplete', done => {
			const d = new Date();
			const clock = sinon.useFakeTimers(d.getTime());
			const s = d.getSeconds() + 1;
			d.setSeconds(s);
			const callback = jest.fn();
			const job = new cron.CronJob(
				d,
				() => {
					var t = new Date();
					expect(t.getSeconds()).toBe(d.getSeconds());
					callback();
				},
				() => {
					expect(callback).toHaveBeenCalledTimes(1);
					done();
				},
				true
			);
			clock.tick(1000);
			clock.restore();
			job.stop();
		});

		it('should wait and not fire immediately', () => {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();

			const d = new Date().getTime() + 31 * 86400 * 1000;

			var job = cron.job(new Date(d), callback);
			job.start();

			clock.tick(1000);

			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(0);
		});

		it('should wait but fire on init', () => {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();

			const d = new Date().getTime() + 31 * 86400 * 1000;

			var job = cron.job({
				cronTime: new Date(d),
				onTick: callback,
				runOnInit: true
			});

			expect(callback).toHaveBeenCalledTimes(1);

			job.start();

			clock.tick(1000);

			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});
	});

	describe('with timezone', () => {
		it('should run a job using cron syntax', () => {
			const callback = jest.fn();
			const luxon = require('luxon');
			let zone = 'America/Chicago';
			// New Orleans time
			let t = luxon.DateTime.local().setZone(zone);
			// Current time
			const d = luxon.DateTime.local();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hour === d.hour) {
				zone = 'America/Los_Angeles';
				t = t.setZone(zone);
			}
			expect(d.hour).not.toBe(t.hour);

			// If t = 59s12m then t.setSeconds(60)
			// becomes 00s13m so we're fine just doing
			// this and no testRun callback.
			t = t.plus({ seconds: 1 });
			// Run a job designed to be executed at a given
			// time in `zone`, making sure that it is a different
			// hour than local time.
			const job = new cron.CronJob(
				t.second + ' ' + t.minute + ' ' + t.hour + ' * * *',
				callback,
				null,
				true,
				zone
			);

			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using a date', () => {
			const luxon = require('luxon');
			let zone = 'America/Chicago';
			// New Orleans time
			let t = luxon.DateTime.local().setZone(zone);
			// Current time
			let d = luxon.DateTime.local();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hour === d.hour) {
				zone = 'America/Los_Angeles';
				t = t.setZone(zone);
			}

			expect(d.hour).not.toBe(t.hour);
			d = d.plus({ seconds: 1 });
			const clock = sinon.useFakeTimers(d.valueOf());
			const callback = jest.fn();
			const job = new cron.CronJob(d.toJSDate(), callback, null, true, zone);
			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should test if timezone is valid.', () => {
			expect(() => {
				// eslint-disable-next-line no-new
				new cron.CronJob({
					cronTime: '* * * * * *',
					onTick: () => {},
					timeZone: 'fake/timezone'
				});
			}).toThrow();
		});
	});

	it('should start, change time, start again', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob('* * * * * *', callback);

		job.start();
		clock.tick(1000);

		job.stop();
		const time = cron.time('*/2 * * * * *');
		job.setTime(time);
		job.start();

		clock.tick(4000);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(3);
	});

	it('should setTime with invalid object', () => {
		const callback = jest.fn();
		const job = new cron.CronJob('* * * * * *', callback);
		expect(() => {
			job.setTime(undefined);
		}).toThrow();
	});

	it('should start, change time, exception', () => {
		const callback = jest.fn();
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', callback);

		var time = new Date();
		job.start();

		clock.tick(1000);

		job.stop();
		expect(() => {
			job.setTime(time);
		}).toThrow();

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should scope onTick to running job', () => {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob(
			'* * * * * *',
			function () {
				expect(job).toBeInstanceOf(cron.CronJob);
				expect(job).toEqual(this);
			},
			null,
			true
		);

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should scope onTick to object', () => {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob(
			'* * * * * *',
			function () {
				expect(this.hello).toEqual('world');
				expect(job).not.toEqual(this);
			},
			null,
			true,
			null,
			{ hello: 'world' }
		);

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should scope onTick to object within constructor object', () => {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function () {
				expect(this.hello).toEqual('world');
				expect(job).not.toEqual(this);
			},
			start: true,
			context: { hello: 'world' }
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should not get into an infinite loop on invalid times', () => {
		expect(() => {
			new cron.CronJob(
				'* 60 * * * *',
				() => {
					expect.ok(true);
				},
				null,
				true
			);
		}).toThrow();

		expect(() => {
			new cron.CronJob(
				'* * 24 * * *',
				() => {
					expect.ok(true);
				},
				null,
				true
			);
		}).toThrow();
	});

	it('should test start of month', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob('0 0 0 1 * *', callback, null, true);

		clock.tick(1001);
		expect(callback).toHaveBeenCalledTimes(1);

		clock.tick(2678399001);
		expect(callback).toHaveBeenCalledTimes(1);

		clock.tick(2678400001); // jump over 2 firsts
		clock.restore();
		job.stop();

		expect(callback).toHaveBeenCalledTimes(3);
	});

	it('should not fire if time was adjusted back', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers({
			toFake: ['setTimeout']
		});

		const job = new cron.CronJob('0 * * * * *', callback, null, true);

		clock.tick(60000);
		expect(callback).toHaveBeenCalledTimes(0);

		clock.restore();
		job.stop();
	});

	it('should run every day', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '59 59 3 * * *',
			onTick: callback,
			start: true,
			timeZone: 'America/Los_Angeles'
		});

		var twoWeeks = 14 * 24 * 60 * 60 * 1000;
		clock.tick(twoWeeks);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(14);
	});

	it('should run every 2 hours between hours', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '0 2-6/2 * * * *',
			onTick: callback,
			start: true
		});

		clock.tick(2 * 60 * 1000);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(2 * 60 * 1000);
		expect(callback).toHaveBeenCalledTimes(2);
		clock.tick(2 * 60 * 1000);
		expect(callback).toHaveBeenCalledTimes(3);
		clock.tick(2 * 60 * 1000);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(3);
	});

	it('should run every minute', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '00 * * * * *',
			onTick: callback,
			start: true
		});

		clock.tick(60 * 1000);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(60 * 1000);
		expect(callback).toHaveBeenCalledTimes(2);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(2);
	});

	it('should run every day at 12:30', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '00 30 00 * * *',
			onTick: callback,
			start: true
		});

		const day = 24 * 60 * 60 * 1000;
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(2);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(3);
		clock.tick(5 * day);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(8);
	});

	it('should trigger onTick at midnight', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '00 * * * * *',
			onTick: callback,
			start: true,
			timeZone: 'UTC'
		});

		clock.tick(1000); // move clock 1 second
		expect(callback).toHaveBeenCalledTimes(1);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should run every day UTC', () => {
		const callback = jest.fn();
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '00 30 00 * * *',
			onTick: callback,
			start: true,
			timeZone: 'UTC'
		});

		var day = 24 * 60 * 60 * 1000;
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(2);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(3);
		clock.tick(5 * day);

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(8);
	});

	// from https://github.com/kelektiv/node-cron/issues/180#issuecomment-154108131
	it('should run once not double', () => {
		const callback = jest.fn();
		const d = new Date(2015, 1, 1, 1, 1, 41, 0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new cron.CronJob({
			cronTime: '* * * * *',
			onTick: callback,
			start: true
		});

		var minute = 60 * 1000;
		clock.tick(minute);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	describe('with utcOffset', () => {
		it('should run a job using cron syntax with number format utcOffset', () => {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();
			const luxon = require('luxon');
			// Current time
			const t = luxon.DateTime.local();
			// UTC Offset decreased by an hour
			const utcOffset = t.offset - 60;

			const job = new cron.CronJob(
				t.second + ' ' + t.minute + ' ' + t.hour + ' * * *',
				callback,
				null,
				true,
				null,
				null,
				null,
				utcOffset
			);

			// tick 1 sec before an hour
			clock.tick(1000 * 60 * 60 - 1);
			expect(callback).toHaveBeenCalledTimes(0);

			clock.tick(1);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using cron syntax with string format utcOffset', () => {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();
			const luxon = require('luxon');
			// Current time
			const t = luxon.DateTime.local();
			// UTC Offset decreased by an hour (string format '(+/-)HH:mm')
			const utcOffset = t.offset - 60;
			let utcOffsetString = utcOffset > 0 ? '+' : '-';
			utcOffsetString += ('0' + Math.floor(Math.abs(utcOffset) / 60)).slice(-2);
			utcOffsetString += ':';
			utcOffsetString += ('0' + (utcOffset % 60)).slice(-2);

			var job = new cron.CronJob(
				t.second + ' ' + t.minute + ' ' + t.hour + ' * * *',
				callback,
				null,
				true,
				null,
				null,
				null,
				utcOffsetString
			);

			// tick 1 sec before an hour
			clock.tick(1000 * 60 * 60 - 1);
			expect(callback).toHaveBeenCalledTimes(0);

			// tick 1 sec
			clock.tick(1);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using cron syntax with number format utcOffset that is 0', () => {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();

			const job = new cron.CronJob(
				'* * * * * *',
				callback,
				null,
				true,
				null,
				null,
				null,
				0
			);

			clock.tick(999);
			expect(callback).toHaveBeenCalledTimes(0);

			clock.tick(1);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should be able to detect out of range days of month', () => {
			expect(() => {
				new cron.CronTime('* * 32 FEB *');
			}).toThrow();
		});
	});

	it('should give the next date to run at', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers();
		const job = new cron.CronJob('* * * * * *', callback);
		const d = Date.now();

		expect(job.nextDate().toMillis()).toEqual(d + 1000);

		clock.restore();
	});

	it('should give the next dates to run at', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers();
		const job = new cron.CronJob('* * * * * *', callback);
		const d = Date.now();

		expect(job.nextDates(5).map(d => d.toMillis())).toEqual([
			d + 1000,
			d + 2000,
			d + 3000,
			d + 4000,
			d + 5000
		]);

		clock.restore();
	});

	it('should automatically setup a new timeout if we roll past the max timeout delay', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers();
		const d = new Date();
		d.setMilliseconds(2147485647 * 2); // MAXDELAY in `job.js` + 2000.
		const job = new cron.CronJob(d, callback);
		job.start();
		clock.tick(2147483648);
		expect(callback).toHaveBeenCalledTimes(0);
		clock.tick(2147489648);
		expect(callback).toHaveBeenCalledTimes(1);
		job.stop();
		clock.restore();
	});

	it('should give the last execution date', () => {
		const callback = jest.fn();
		const clock = sinon.useFakeTimers();
		const job = new cron.CronJob('* * * * * *', callback);
		job.start();
		clock.tick(1000);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(job.lastDate().getTime()).toEqual(1000);
		job.stop();
		clock.restore();
	});
});
