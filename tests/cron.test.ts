import { DateTime } from 'luxon';
import sinon from 'sinon';
import { CronJob, CronTime } from '../src';

describe('cron', () => {
	let callback: jest.Mock;

	beforeEach(() => {
		callback = jest.fn();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		expect.hasAssertions();
		sinon.restore();
	});

	it('should not stop job if sendAt takes time to complete (#962)', () => {
		const EVERY = 5;
		const TICK = EVERY * 1000;
		const DELAY = 350;

		const job = CronJob.from({
			cronTime: `*/${EVERY} * * * * *`,
			onTick: callback,
			start: false,
			threshold: 350
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(TICK)
			.onCall(1)
			.returns(-DELAY);

		const clock = sinon.useFakeTimers();

		// mock console.warn to avoid poluting tests with the warning
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

		job.start();

		clock.tick(TICK);
		expect(job.isActive).toBe(true);

		job.stop();
		warnSpy.mockRestore();
	});

	describe('with seconds', () => {
		it('should run every second (* * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('* * * * * *', callback, null, true);

			expect(callback).not.toHaveBeenCalled();
			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run second with onComplete (* * * * * *)', done => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob(
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
		});

		it('should use standard cron no-seconds syntax (* * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('* * * * *', callback, null, true);

			clock.tick(1000); // tick second

			clock.tick(59 * 1000); // tick minute

			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run every second for 5 seconds (* * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('* * * * * *', callback, null, true);
			for (let i = 0; i < 5; i++) {
				clock.tick(1000);
			}
			job.stop();
			expect(callback).toHaveBeenCalledTimes(5);
		});

		it('should run every second for 5 seconds with onComplete (* * * * * *)', done => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob(
				'* * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(5);
					done();
				},
				true
			);

			for (let i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
		});

		it('should run every second for 5 seconds (*/1 * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('*/1 * * * * *', callback, null, true);
			for (let i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(5);
		});

		it('should run every 2 seconds for 1 seconds (*/2 * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('*/2 * * * * *', callback, null, true);
			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(0);
		});

		it('should run every 2 seconds for 5 seconds (*/2 * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('*/2 * * * * *', callback, null, true);
			for (let i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(2);
		});

		it('should run every second for 5 seconds with onComplete (*/1 * * * * *)', done => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob(
				'*/1 * * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(5);
					done();
				},
				true
			);
			for (let i = 0; i < 5; i++) clock.tick(1000);
			job.stop();
		});

		it('should run every second for a range ([start]-[end] * * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('0-8 * * * * *', callback, null, true);
			clock.tick(10000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(8);
		});

		it('should run every second for a range ([start]-[end] * * * * *) with onComplete', done => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob(
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
		});

		it('should default to full range when upper range not provided (1/2 * * * * *)', done => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob(
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
		});

		it('should run every second (* * * * * *) using the object constructor', () => {
			const clock = sinon.useFakeTimers();
			const job = CronJob.from({
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});
			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run every second with onComplete (* * * * * *) using the object constructor', done => {
			const clock = sinon.useFakeTimers();
			const job = CronJob.from({
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
		});
	});

	describe('with minutes', () => {
		it('should fire every 60 min', () => {
			const clock = sinon.useFakeTimers();
			const m60 = 60 * 60 * 1000;
			const l: number[] = [];
			const job = new CronJob(
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
		});

		it('should run every 45 minutes for 2 hours (0 */45 * * * *)', () => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob('0 */45 * * * *', callback, null, true);
			for (let i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(4);
		});

		it('should run every 45 minutes for 2 hours (0 */45 * * * *) with onComplete', done => {
			const clock = sinon.useFakeTimers();
			const job = new CronJob(
				'0 */45 * * * *',
				callback,
				() => {
					expect(callback).toHaveBeenCalledTimes(4);
					done();
				},
				true
			);
			for (let i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);
			job.stop();
		});
	});

	it('should start and stop job from outside', done => {
		const clock = sinon.useFakeTimers();
		const job = new CronJob(
			'* * * * * *',
			function () {
				callback();
			},
			() => {
				expect(callback).toHaveBeenCalledTimes(1);
				done();
			},
			true
		);
		clock.tick(1000);
		job.stop();
	});

	it('should start and stop job from inside (default context)', done => {
		const clock = sinon.useFakeTimers();
		new CronJob(
			'* * * * * *',
			function () {
				callback();
				this.stop();
			},
			() => {
				expect(callback).toHaveBeenCalledTimes(1);
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
			const job = new CronJob(
				d,
				() => {
					const t = new Date();
					expect(t.getSeconds()).toBe(d.getSeconds());
					callback();
				},
				null,
				true
			);
			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run on a specific date and call onComplete from onTick', async () => {
			const d = new Date();
			const clock = sinon.useFakeTimers(d.getTime());
			d.setSeconds(d.getSeconds() + 1);

			await new Promise<void>(resolve => {
				const job = new CronJob(
					d,
					onComplete => {
						const t = new Date();
						expect(t.getSeconds()).toBe(d.getSeconds());
						void onComplete();
					},
					() => {
						callback();
						resolve();
					},
					true
				);
				clock.tick(1000);
				job.stop();
			});

			// onComplete is called 2 times: once in onTick() & once when calling job.stop()
			expect(callback).toHaveBeenCalledTimes(2);
		});

		it('should run on a specific date and call onComplete from onTick using the object constructor', async () => {
			const d = new Date();
			const clock = sinon.useFakeTimers(d.getTime());
			d.setSeconds(d.getSeconds() + 1);

			await new Promise<void>(resolve => {
				const job = CronJob.from({
					cronTime: d,
					onTick: onComplete => {
						const t = new Date();
						expect(t.getSeconds()).toBe(d.getSeconds());
						void onComplete();
					},
					onComplete: function () {
						callback();
						resolve();
					} as () => void,
					start: true
				});
				clock.tick(1000);
				job.stop();
			});

			// onComplete is called 2 times: once in onTick() & once when calling job.stop()
			expect(callback).toHaveBeenCalledTimes(2);
		});

		it("should not be able to call onComplete from onTick if if wasn't provided", () => {
			expect.assertions(4);
			const d = new Date();
			const clock = sinon.useFakeTimers(d.getTime());
			d.setSeconds(d.getSeconds() + 1);

			const job = new CronJob(
				d,
				onComplete => {
					const t = new Date();
					expect(onComplete).toBeUndefined();
					try {
						// @ts-expect-error should be a TS warning and throw
						onComplete();
					} catch (e) {
						// we make sure this isn't skipped with `expect.assertions()`
						// at the beginning of the test
						// eslint-disable-next-line jest/no-conditional-expect
						expect(e).toBeInstanceOf(TypeError);
					}
					expect(onComplete).toBeUndefined();
					expect(t.getSeconds()).toBe(d.getSeconds());
				},
				null,
				true
			);
			clock.tick(1000);
			job.stop();
		});

		it('should wait and not fire immediately', () => {
			const clock = sinon.useFakeTimers();

			const d = new Date().getTime() + 31 * 86400 * 1000;

			const job = new CronJob(new Date(d), callback);
			job.start();

			clock.tick(1000);

			job.stop();
			expect(callback).toHaveBeenCalledTimes(0);
		});

		it('should wait but fire on init', () => {
			const clock = sinon.useFakeTimers();

			const d = new Date().getTime() + 31 * 86400 * 1000;

			const job = CronJob.from({
				cronTime: new Date(d),
				onTick: callback,
				runOnInit: true
			});

			expect(callback).toHaveBeenCalledTimes(1);

			job.start();

			clock.tick(1000);

			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should fire on init but not run until started', () => {
			const clock = sinon.useFakeTimers();

			const job = CronJob.from({
				cronTime: '* * * * * *',
				onTick: callback,
				runOnInit: true
			});

			expect(callback).toHaveBeenCalledTimes(1);

			job.start();

			clock.tick(3500);

			job.stop();
			expect(callback).toHaveBeenCalledTimes(4);
		});
	});

	describe('with timezone', () => {
		it('should run a job using cron syntax with a timezone', () => {
			const clock = sinon.useFakeTimers();
			let zone = 'America/Chicago';
			// new Orleans time
			let t = DateTime.local().setZone(zone);
			// current time
			const d = DateTime.local();

			// if current time is New Orleans time, switch to Los Angeles..
			if (t.hour === d.hour) {
				zone = 'America/Los_Angeles';
				t = t.setZone(zone);
			}
			expect(d.hour).not.toBe(t.hour);

			// if t = 59s12m then t.setSeconds(60)
			// becomes 00s13m so we're fine just doing
			// this and no testRun callback.
			t = t.plus({ seconds: 1 });
			// run a job designed to be executed at a given
			// time in `zone`, making sure that it is a different
			// hour than local time.
			const job = new CronJob(
				`${t.second} ${t.minute} ${t.hour} * * *`,
				callback,
				null,
				true,
				zone
			);

			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using cron syntax with a "UTC+HH:mm" offset as timezone', () => {
			const clock = sinon.useFakeTimers();

			// current time
			const d = DateTime.local();

			// current time with zone offset
			let zone = 'UTC+5:30';
			let t = DateTime.local().setZone(zone);

			// if current offset is UTC+5:30, switch to UTC+6:30..
			if (t.hour === d.hour && t.minute === d.minute) {
				zone = 'UTC+6:30';
				t = t.setZone(zone);
			}
			expect(`${d.hour}:${d.minute}`).not.toBe(`${t.hour}:${t.minute}`);

			// if t = 59s12m then t.setSeconds(60)
			// becomes 00s13m so we're fine just doing
			// this and no testRun callback.
			t = t.plus({ seconds: 1 });
			// run a job designed to be executed at a given
			// time in `zone`, making sure that it is a different
			// hour than local time.
			const job = new CronJob(
				`${t.second} ${t.minute} ${t.hour} * * *`,
				callback,
				null,
				true,
				zone
			);

			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using a date', () => {
			let zone = 'America/Chicago';
			// new Orleans time
			let t = DateTime.local().setZone(zone);
			// current time
			let d = DateTime.local();

			// if current time is New Orleans time, switch to Los Angeles..
			if (t.hour === d.hour) {
				zone = 'America/Los_Angeles';
				t = t.setZone(zone);
			}

			expect(d.hour).not.toBe(t.hour);
			d = d.plus({ seconds: 1 });
			const clock = sinon.useFakeTimers(d.valueOf());
			const job = new CronJob(d.toJSDate(), callback, null, true, zone);
			clock.tick(1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		// this test requires setting the TZ env variable
		// to Europe/Paris to run correctly on CI
		it('should use system timezone by default (issue #971)', () => {
			const d = DateTime.fromISO('2025-03-28T00:00:00', {
				zone: 'Europe/Paris'
			}).toJSDate();
			const clock = sinon.useFakeTimers(d.getTime());
			const job = CronJob.from({
				cronTime: '1 0 * * *',
				onTick: callback,
				start: true
			});
			clock.tick(60 * 60 * 1000);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should test if timezone is valid.', () => {
			expect(() => {
				CronJob.from({
					cronTime: '* * * * * *',
					onTick: () => {},
					timeZone: 'fake/timezone'
				});
			}).toThrow();
		});
	});

	describe('onTick scoping', () => {
		it('should scope onTick to running job', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob(
				'* * * * * *',
				function () {
					expect(job).toBeInstanceOf(CronJob);
					expect(job).toEqual(this);
				},
				null,
				true
			);

			clock.tick(1000);

			job.stop();
		});

		it('should scope onTick to running job using the object constructor', () => {
			const clock = sinon.useFakeTimers();

			const job = CronJob.from({
				cronTime: '* * * * * *',
				onTick: function () {
					expect(job).toBeInstanceOf(CronJob);
					expect(job).toEqual(this);
				},
				start: true
			});

			clock.tick(1000);

			job.stop();
		});

		it('should scope onTick to object', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob(
				'* * * * * *',
				function () {
					expect(this.hello).toBe('world');
					expect(job).not.toEqual(this);
				},
				null,
				true,
				null,
				{ hello: 'world' }
			);

			clock.tick(1000);

			job.stop();
		});

		it('should scope onTick to object using the object constructor', () => {
			const clock = sinon.useFakeTimers();

			const job = CronJob.from({
				cronTime: '* * * * * *',
				onTick: function () {
					expect(this.hello).toBe('world');
					expect(job).not.toEqual(this);
				},
				start: true,
				context: { hello: 'world' }
			});

			clock.tick(1000);

			job.stop();
		});
	});

	it('should not get into an infinite loop on invalid times', () => {
		expect(() => {
			new CronJob('* 60 * * * *', () => {}, null, true);
		}).toThrow();

		expect(() => {
			new CronJob('* * 24 * * *', () => {}, null, true);
		}).toThrow();

		expect(() => {
			new CronJob('0 0 30 FEB *', callback, null, true);
		}).toThrow();
	});

	it('should not get into an infinite loop when using uncommon offsets', () => {
		const job = new CronJob(
			'* * * * * *',
			function () {},
			null,
			true,
			null,
			null,
			true,
			-4
		);
		expect(job.isActive).toBe(true);
		job.stop();
	});

	it('should not throw if at least one time is valid', () => {
		expect(() => {
			const job = new CronJob('0 0 30 JAN,FEB *', callback, null, true);
			job.stop();
		}).not.toThrow();
	});

	it('should test start of month', () => {
		const d = DateTime.fromISO('2024-12-31T23:59:59', {
			zone: 'Europe/Paris'
		}).toJSDate();
		const clock = sinon.useFakeTimers(d.getTime());

		const job = new CronJob('0 0 0 1 * *', callback, null, true);

		// first millisecond of January
		clock.tick(1001);
		expect(callback).toHaveBeenCalledTimes(1);
		// 2 ms less than 28 days; last millisecond of February
		clock.tick(28 * 24 * 60 * 60 * 1000 - 2);
		expect(callback).toHaveBeenCalledTimes(1);

		// 1 ms more than 31 days; jump over 2 firsts
		clock.tick(31 * 24 * 60 * 60 * 1000 + 1);
		job.stop();

		expect(callback).toHaveBeenCalledTimes(3);
	});

	it('should not fire if time was adjusted back', () => {
		const clock = sinon.useFakeTimers({
			toFake: ['setTimeout']
		});

		const job = new CronJob('0 * * * * *', callback, null, true);

		clock.tick(60000);
		expect(callback).toHaveBeenCalledTimes(0);

		job.stop();
	});

	it('should run every day at 3:59:59', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: '59 59 3 * * *',
			onTick: callback,
			start: true,
			timeZone: 'America/Los_Angeles'
		});

		const twoWeeks = 14 * 24 * 60 * 60 * 1000;
		clock.tick(twoWeeks);

		job.stop();
		expect(callback).toHaveBeenCalledTimes(14);
	});

	it('should run every 2 hours between hours', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
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

		job.stop();
		expect(callback).toHaveBeenCalledTimes(3);
	});

	it('should run every minute', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: '00 * * * * *',
			onTick: callback,
			start: true
		});

		clock.tick(60 * 1000);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(60 * 1000);
		expect(callback).toHaveBeenCalledTimes(2);

		job.stop();
		expect(callback).toHaveBeenCalledTimes(2);
	});

	it('should run every day at 12:30', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
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

		job.stop();
		expect(callback).toHaveBeenCalledTimes(8);
	});

	it('should trigger onTick at midnight', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: '00 * * * * *',
			onTick: callback,
			start: true,
			timeZone: 'UTC'
		});

		clock.tick(1000); // move clock 1 second
		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should run every day UTC', () => {
		const d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: '00 30 00 * * *',
			onTick: callback,
			start: true,
			timeZone: 'UTC'
		});

		const day = 24 * 60 * 60 * 1000;
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(1);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(2);
		clock.tick(day);
		expect(callback).toHaveBeenCalledTimes(3);
		clock.tick(5 * day);

		job.stop();
		expect(callback).toHaveBeenCalledTimes(8);
	});

	// from https://github.com/kelektiv/node-cron/issues/180#issuecomment-154108131
	it('should run once not double', () => {
		const d = new Date(2015, 1, 1, 1, 1, 41, 0);
		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: '* * * * *',
			onTick: callback,
			start: true
		});

		const minute = 60 * 1000;
		clock.tick(minute);
		expect(callback).toHaveBeenCalledTimes(1);
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	/**
	 * maximum match interval is 8 years:
	 * crontab has '* * 29 2 *' and we are on 1 March 2096:
	 * next matching time will be 29 February 2104
	 * source: https://github.com/cronie-crond/cronie/blob/0d669551680f733a4bdd6bab082a0b3d6d7f089c/src/cronnext.c#L401-L403
	 */
	it('should work correctly for max match interval', () => {
		const d = DateTime.fromISO('2096-03-01T00:00:00', {
			zone: 'Europe/Paris'
		}).toJSDate();

		const clock = sinon.useFakeTimers(d.getTime());

		const job = CronJob.from({
			cronTime: ' * * 29 2 *',
			onTick: callback,
			start: true
		});

		// 7 years, 11 months and 27 days
		const almostEightYears = 2919 * 24 * 60 * 60 * 1000;
		clock.tick(almostEightYears);
		expect(callback).toHaveBeenCalledTimes(0);

		// tick by 1 day
		clock.tick(24 * 60 * 60 * 1000);
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	describe('with utcOffset', () => {
		it('should run a job using cron syntax with number format utcOffset', () => {
			const clock = sinon.useFakeTimers();
			// current time
			const t = DateTime.local();
			// uTC Offset decreased by an hour
			const utcOffset = t.offset - 60;

			const job = new CronJob(
				`${t.second} ${t.minute} ${t.hour} * * *`,
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
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using cron syntax with numeric format utcOffset with minute support', () => {
			const clock = sinon.useFakeTimers();
			// current time
			const t = DateTime.local();

			// uTC Offset decreased by 45 minutes
			const utcOffset = t.offset - 45;
			const job = new CronJob(
				`${t.second} ${t.minute} ${t.hour} * * *`,
				callback,
				null,
				true,
				null,
				null,
				null,
				utcOffset
			);

			// tick 1 sec before 45 minutes
			clock.tick(1000 * 45 * 60 - 1);
			expect(callback).toHaveBeenCalledTimes(0);

			clock.tick(1);
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should run a job using cron syntax with number format utcOffset that is 0', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob(
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
			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should be able to detect out of range days of month', () => {
			expect(() => {
				new CronTime('* * 32 FEB *');
			}).toThrow();
		});
	});

	describe('setTime', () => {
		it('should start, change time, start again', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob('* * * * * *', callback);

			job.start();
			clock.tick(1000);

			const time = new CronTime('*/2 * * * * *');
			job.setTime(time);

			clock.tick(4000);

			job.stop();
			expect(callback).toHaveBeenCalledTimes(3);
		});

		it('should start, stop, change time, not start again', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob('* * * * * *', callback);

			job.start();
			clock.tick(1000);

			job.stop();
			const time = new CronTime('*/2 * * * * *');
			job.setTime(time);

			clock.tick(4000);

			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should setTime with invalid object', () => {
			const job = new CronJob('* * * * * *', callback);
			expect(() => {
				// @ts-expect-error time parameter cannot be undefined
				job.setTime(undefined);
			}).toThrow();
		});

		it('should start, change time, exception', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob('* * * * * *', callback);

			const time = new Date();
			job.start();

			clock.tick(1000);

			expect(() => {
				// @ts-expect-error time parameter but be an instance of CronTime
				job.setTime(time);
			}).toThrow();

			job.stop();
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should create recurring job, setTime with actual date, start and run once (#739)', () => {
			const clock = sinon.useFakeTimers();

			const job = new CronJob('0 0 20 * * *', callback);

			const startDate = new Date(Date.now() + 5000);
			job.setTime(new CronTime(startDate));

			job.start();

			clock.tick(5000);

			expect(callback).toHaveBeenCalledTimes(1);

			clock.tick(60000);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(job.isActive).toBe(false);
		});
	});

	describe('nextDate(s)', () => {
		it('should give the next date to run at', () => {
			sinon.useFakeTimers();
			const job = new CronJob('* * * * * *', callback);
			const d = Date.now();

			expect(job.nextDate().toMillis()).toEqual(d + 1000);
		});

		it('should give the next 5 dates to run at', () => {
			sinon.useFakeTimers();
			const job = new CronJob('* * * * * *', callback);
			const d = Date.now();

			expect(job.nextDates(5).map(d => d.toMillis())).toEqual([
				d + 1000,
				d + 2000,
				d + 3000,
				d + 4000,
				d + 5000
			]);
		});

		it('should give an empty array when called without argument', () => {
			const job = new CronJob('* * * * * *', callback);
			expect(job.nextDates()).toHaveLength(0);
		});
	});

	it('should automatically setup a new timeout if we roll past the max timeout delay', () => {
		const clock = sinon.useFakeTimers();
		const d = new Date();
		d.setMilliseconds(2147485647 * 2); // mAXDELAY in `job.js` + 2000.
		const job = new CronJob(d, callback);
		job.start();
		clock.tick(2147483648);
		expect(callback).toHaveBeenCalledTimes(0);
		clock.tick(2147489648);
		expect(callback).toHaveBeenCalledTimes(1);
		job.stop();
	});

	it('should give the correct last execution date', () => {
		const clock = sinon.useFakeTimers();
		const job = new CronJob('* * * * * *', callback);
		job.start();
		clock.tick(1000);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(job.lastDate()?.getTime()).toBe(1000);
		job.stop();
	});

	it('should give the correct last execution date for intervals greater than 25 days (#710)', () => {
		const clock = sinon.useFakeTimers();

		const job = new CronJob('0 0 0 1 * *', callback); // at 00:00 on day-of-month 1.
		job.start();

		// tick one tick before nextDate()
		clock.tick(job.nextDate().toMillis() - 1);

		expect(callback).toHaveBeenCalledTimes(0);
		expect(job.lastDate()?.getTime()).toBeUndefined();

		job.stop();
	});

	it('should throw when providing both exclusive parameters timeZone and utcOffset', () => {
		expect(() => {
			// @ts-expect-error testing runtime exception
			new CronJob(
				`* * * * *`,
				function () {},
				null,
				true,
				'America/Chicago',
				null,
				null,
				120
			);
		}).toThrow();
	});

	it('should throw when providing both exclusive parameters timeZone and utcOffset using the object constructor', () => {
		expect(() => {
			// @ts-expect-error testing runtime exception
			CronJob.from({
				cronTime: '* * * * * *',
				onTick: function () {},
				timeZone: 'America/Chicago',
				utcOffset: 120
			});
		}).toThrow();
	});

	it('should support async callback', () => {
		const clock = sinon.useFakeTimers();
		const job = new CronJob(
			'* * * * * *',
			async function () {
				await new Promise<void>(resolve => {
					setTimeout(() => {
						callback();
						resolve();
					}, 500);
				});
			},
			null,
			true
		);
		clock.tick(1500);
		job.stop();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should catch errors every time, if errorHandler is provided', () => {
		const clock = sinon.useFakeTimers();
		const errorFunc = jest.fn().mockImplementation(() => {
			throw Error('Exception');
		});
		const handlerFunc = jest.fn();
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: errorFunc,
			errorHandler: handlerFunc,
			start: true
		});
		clock.tick(1000);
		expect(errorFunc).toHaveBeenCalledTimes(1);
		expect(handlerFunc).toHaveBeenCalledTimes(1);
		expect(handlerFunc).toHaveBeenLastCalledWith(new Error('Exception'));
		clock.tick(1000);
		expect(errorFunc).toHaveBeenCalledTimes(2);
		expect(handlerFunc).toHaveBeenCalledTimes(2);
		expect(handlerFunc).toHaveBeenLastCalledWith(new Error('Exception'));

		job.stop();
	});

	it('should log errors if errorHandler is NOT provided', () => {
		const errorFunc = jest.fn().mockImplementation(() => {
			throw Error('Exception');
		});
		console.error = jest.fn();
		CronJob.from({
			cronTime: '* * * * * *',
			onTick: errorFunc,
			runOnInit: true
		});
		expect(console.error).toHaveBeenCalled();
	});

	describe('waitForCompletion and job status tracking', () => {
		it('should wait for async job completion when waitForCompletion is true', async () => {
			const clock = sinon.useFakeTimers();
			let isJobCompleted = false;

			const job = new CronJob(
				'*/2 * * * * *',
				async () => {
					expect(job.isCallbackRunning).toBe(true);
					await new Promise<void>(resolve => {
						setTimeout(() => {
							callback();
							isJobCompleted = true;
							resolve();
						}, 1000);
					});
				},
				null,
				true,
				null,
				null,
				false,
				null,
				false,
				true // waitForCompletion: true
			);

			expect(job.isCallbackRunning).toBe(false);

			// first execution
			await clock.tickAsync(2000);
			expect(job.isCallbackRunning).toBe(true);

			// wait for job completion
			await clock.tickAsync(500);
			expect(isJobCompleted).toBe(false);
			expect(job.isCallbackRunning).toBe(true);

			await clock.tickAsync(1000);
			expect(isJobCompleted).toBe(true);
			expect(job.isCallbackRunning).toBe(false);

			job.stop();
		});

		it('should not wait for job completion when waitForCompletion is false', () => {
			const clock = sinon.useFakeTimers();
			let isJobCompleted = false;

			const job = new CronJob(
				'* * * * * *',
				() => {
					setTimeout(() => {
						callback();
						isJobCompleted = true;
					}, 500);
				},
				null,
				true,
				null,
				null,
				false,
				null,
				false,
				false // waitForCompletion: false
			);

			expect(job.isCallbackRunning).toBe(false);

			// first execution
			clock.tick(1000);
			expect(isJobCompleted).toBe(false);
			expect(job.isCallbackRunning).toBe(false);

			job.stop();
		});

		it('should track multiple running jobs correctly', async () => {
			const clock = sinon.useFakeTimers();
			const executionOrder: number[] = [];
			let started = 0;

			const job = new CronJob(
				'* * * * * *',
				async () => {
					started++;
					await new Promise<void>(resolve => {
						setTimeout(() => {
							callback();
							resolve();
						}, 1500);
					});
					const jobNumber = executionOrder.length + 1;
					executionOrder.push(jobNumber);
				},
				null,
				true,
				null,
				null,
				false,
				null,
				false,
				true // waitForCompletion: true
			);

			await clock.tickAsync(3500);

			expect(started).toBe(2);
			expect(executionOrder).toEqual([1]);
			job.stop();
		});

		it('should handle stop() correctly while job is running', async () => {
			const clock = sinon.useFakeTimers();
			let isJobCompleted = false;

			const job = new CronJob(
				'* * * * * *',
				async () => {
					await new Promise<void>(resolve => {
						setTimeout(() => {
							callback();
							isJobCompleted = true;
							resolve();
						}, 500);
					});
				},
				null,
				true,
				null,
				null,
				false,
				null,
				false,
				true // waitForCompletion: true
			);

			await clock.tickAsync(1000);
			expect(job.isCallbackRunning).toBe(true);

			job.stop();
			await clock.tickAsync(500);

			expect(isJobCompleted).toBe(true);
			expect(job.isCallbackRunning).toBe(false);
			expect(job.isActive).toBe(false);
		});
	});

	describe('Daylight Saving Time', () => {
		// https://github.com/kelektiv/node-cron/issues/919
		it('should not get into an infinite loop on Lisbon DST forward jump', () => {
			const d = DateTime.fromISO('2024-03-30T00:59:59', {
				zone: 'Europe/Lisbon'
			}).toJSDate();
			const clock = sinon.useFakeTimers(d.getTime());

			const job = new CronJob(
				'0 1 30 3 *',
				callback,
				null,
				true,
				'Europe/Lisbon'
			);

			clock.tick(1000);
			expect(callback).toHaveBeenCalledTimes(1);

			job.stop();
		});

		it('should not get into an infinite loop on Paris DST forward jump', () => {
			const d = DateTime.fromISO('2024-03-31T01:59:59', {
				zone: 'Europe/Paris'
			}).toJSDate();
			const clock = sinon.useFakeTimers(d.getTime());

			const job = new CronJob(
				'0 2 31 3 *',
				callback,
				null,
				true,
				'Europe/Paris'
			);

			clock.tick(1000);
			expect(callback).toHaveBeenCalledTimes(1);

			job.stop();
		});

		it('should still execute at the desired interval when the time changes back one hour', () => {
			// there are two instances of 2 am. Setting to an earlier time so it is not ambiguous
			// see https://moment.github.io/luxon/#/zones?id=ambiguous-times
			const d = DateTime.fromISO('2024-04-07T01:45:00.000', {
				zone: 'Australia/Melbourne'
			}).toJSDate();
			const clock = sinon.useFakeTimers(d.getTime());

			const job = new CronJob(
				'*/30 * * * *',
				callback,
				null,
				true,
				'Australia/Melbourne'
			);

			clock.tick(1000 * 60 * 60 * 3);

			expect(callback).toHaveBeenCalledTimes(6);

			job.stop();
		});
	});
});
