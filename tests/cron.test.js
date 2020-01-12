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
				function() {
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
				function() {
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
				function() {
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

		it('should run every second for a range ([start]-[end] * * * * *)', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'0-8 * * * * *',
				callback,
				function() {
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
				onComplete: function() {
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
				function() {
					l.push(Math.floor(Date.now() / 60000));
				},
				null,
				true
			);

			clock.tick(m60 * 10);

			expect(l.length).toBe(10);
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

		it('should run every 45 minutes for 2 hours (0 */45 * * * *)', done => {
			const callback = jest.fn();
			const job = new cron.CronJob(
				'0 */45 * * * *',
				callback,
				function() {
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

	it('should start and stop job', done => {
		const callback = jest.fn();
		const job = new cron.CronJob(
			'* * * * * *',
			function() {
				callback();
				this.stop();
			},
			function() {
				expect(callback).toHaveBeenCalledTimes(1);
				clock.restore();
				done();
			},
			true
		);
		clock.tick(1000);
		job.stop();
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
				function() {
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
				function() {
					var t = new Date();
					expect(t.getSeconds()).toBe(d.getSeconds());
					callback();
				},
				function() {
					expect(callback).toHaveBeenCalledTimes(1);
					done();
				},
				true
			);
			clock.tick(1000);
			clock.restore();
			job.stop();
		});

		it('should wait and not fire immediately', function() {
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
	});

	describe('with timezone', () => {
		it('should run a job using cron syntax', function() {
			const callback = jest.fn();
			const moment = require('moment-timezone');
			let zone = 'America/Chicago';

			// New Orleans time
			const t = moment();
			t.tz(zone);

			// Current time
			const d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = 'America/Los_Angeles';
				t.tz(zone);
			}
			expect(d.hours()).not.toBe(t.hours());

			// If t = 59s12m then t.setSeconds(60)
			// becomes 00s13m so we're fine just doing
			// this and no testRun callback.
			t.add(1, 's');
			// Run a job designed to be executed at a given
			// time in `zone`, making sure that it is a different
			// hour than local time.
			const job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
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

		it('should run a job using a date', function() {
			const moment = require('moment-timezone');
			let zone = 'America/Chicago';
			// New Orleans time
			const t = moment();
			t.tz(zone);
			// Current time
			const d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = 'America/Los_Angeles';
				t.tz(zone);
			}

			expect(d.hours()).not.toBe(t.hours());
			d.add(1, 'second');
			const clock = sinon.useFakeTimers(d.valueOf());
			const callback = jest.fn();
			const job = new cron.CronJob(d._d, callback, null, true, zone);
			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should test if timezone is valid.', function() {
			expect(function() {
				// eslint-disable-next-line no-new
				new cron.CronJob({
					cronTime: '* * * * * *',
					onTick: function() {},
					timeZone: 'fake/timezone'
				});
			}).toThrow();
		});
	});

	it('should start, change time, start again', function() {
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

	it('should start, change time, exception', function() {
		const callback = jest.fn();
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', callback);

		var time = new Date();
		job.start();

		clock.tick(1000);

		job.stop();
		expect(function() {
			job.setTime(time);
		}).toThrow();

		clock.restore();
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should scope onTick to running job', function() {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob(
			'* * * * * *',
			function() {
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

	it('should scope onTick to object', function() {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob(
			'* * * * * *',
			function() {
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

	it('should scope onTick to object within contstructor object', function() {
		const clock = sinon.useFakeTimers();

		const job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
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

	it('should not get into an infinite loop on invalid times', function() {
		expect(function() {
			new cron.CronJob(
				'* 60 * * * *',
				function() {
					expect.ok(true);
				},
				null,
				true
			);
		}).toThrow();

		expect(function() {
			new cron.CronJob(
				'* * 24 * * *',
				function() {
					expect.ok(true);
				},
				null,
				true
			);
		}).toThrow();
	});

	it('should test start of month', function() {
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

	it('should not fire if time was adjusted back', function() {
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

	it('should run every day', function() {
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

	it('should run every 2 hours between hours', function() {
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

	it('should run every minute', function() {
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

	it('should run every day', function() {
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

	it('should trigger onTick at midnight', function() {
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

	it('should run every day UTC', function() {
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
	it('should run once not double', function() {
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

	describe('with utcOffset', function() {
		it('should run a job using cron syntax with number format utcOffset', function() {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();

			const moment = require('moment-timezone');

			// Current time
			const t = moment();

			// UTC Offset decreased by an hour
			const utcOffset = t.utcOffset() - 60;

			const job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
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

		it('should run a job using cron syntax with string format utcOffset', function() {
			const clock = sinon.useFakeTimers();
			const callback = jest.fn();

			const moment = require('moment-timezone');

			// Current time
			const t = moment();

			// UTC Offset decreased by an hour (string format '(+/-)HH:mm')
			const utcOffset = t.utcOffset() - 60;
			let utcOffsetString = utcOffset > 0 ? '+' : '-';
			utcOffsetString += ('0' + Math.floor(Math.abs(utcOffset) / 60)).slice(-2);
			utcOffsetString += ':';
			utcOffsetString += ('0' + (utcOffset % 60)).slice(-2);

			var job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
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

		it('should run a job using cron syntax with number format utcOffset that is 0', function() {
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

		it('should be able to detect out of range days of month', function() {
			expect(function() {
				new cron.CronTime('* * 32 FEB *');
			}).toThrow();
		});
	});
});
