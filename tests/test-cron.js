var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var cron = require('../lib/cron');

/* eslint-disable no-new */

describe('cron', function() {
	it('should run every second (* * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(1000);
		job.stop();
		clock.restore();

		expect(c).to.eql(1);
	});

	it('should run second with oncomplete (* * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(1);
				done();
			},
			true
		);

		clock.tick(1000);
		clock.restore();
		job.stop();
	});

	it('should fire every 60 min', function() {
		var m60 = 60 * 60 * 1000;
		var clock = sinon.useFakeTimers();
		var l = [];
		var job = new cron.CronJob(
			'00 30 * * * *',
			function() {
				l.push(Math.floor(Date.now() / 60000));
			},
			null,
			true
		);

		clock.tick(m60 * 10);

		expect(l.length).to.eql(10);
		for (var i = 0; i < l.length; i++) {
			expect(l[i] % 30).to.eql(0);
		}

		job.stop();
		clock.restore();
	});

	it('should use standard cron no-seconds syntax (* * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(1000); // tick second

		clock.tick(59 * 1000); // tick minute

		job.stop();
		clock.restore();

		expect(c).to.eql(1);
	});

	it('should run every second for 5 seconds (* * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		for (var i = 0; i < 5; i++) clock.tick(1000);

		clock.restore();
		job.stop();

		expect(c).to.eql(5);
	});

	it('should run every second for 5 seconds with oncomplete (* * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(5);
				done();
			},
			true
		);

		for (var i = 0; i < 5; i++) clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should run every second for 5 seconds (*/1 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'*/1 * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		for (var i = 0; i < 5; i++) clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(5);
	});

	// ensure that this is running on the second second
	it('should run every 2 seconds for 1 seconds (*/2 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'*/2 * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(0);
	});

	it('should run every 2 seconds for 5 seconds (*/2 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'*/2 * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		for (var i = 0; i < 5; i++) clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(2);
	});

	it('should run every second for 5 seconds with oncomplete (*/1 * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'*/1 * * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(5);
				done();
			},
			true
		);

		for (var i = 0; i < 5; i++) clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should run every 45 minutes for 2 hours (0 */45 * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0 */45 * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(4); // 0 and 45
	});

	it('should run every 45 minutes for 2 hours with oncomplete (0 */45 * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0 */45 * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(4); // 0 and 45
				done();
			},
			true
		);

		for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);

		clock.restore();
		job.stop();
	});

	it('should run every 45 minutes for 2 hours (0 0,45 * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0 0,45 * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(4); // 0 and 45
	});

	it('should run every 45 minutes for 2 hours with oncomplete (0 0,45 * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0 0,45 * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(4); // 0 and 45
				done();
			},
			true
		);

		for (var i = 0; i < 2; i++) clock.tick(60 * 60 * 1000);

		clock.restore();
		job.stop();
	});

	it('should run every second for a range ([start]-[end] * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0-8 * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(10000); // run for 10 seconds

		clock.restore();
		job.stop();
		expect(c).to.eql(8);
	});

	it('should run every second for a range with oncomplete ([start]-[end] * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'0-8 * * * * *',
			function() {
				c++;
			},
			function() {
				expect(c).to.eql(8);
				done();
			},
			true
		);

		clock.tick(10000);

		clock.restore();
		job.stop();
	});

	it('should run every second (* * * * * *) using the object constructor', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run every second with oncomplete (* * * * * *) using the object constructor', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function(done) {
				c++;
			},
			onComplete: function() {
				expect(c).to.eql(1);
				done();
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should start and stop job', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				c++;
				this.stop();
			},
			function() {
				expect(c).to.eql(1);

				clock.restore();
				done();
			}
		);
		job.start();

		clock.tick(1000);
	});

	it('should run on a specific date', function() {
		var c = 0;
		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var s = d.getSeconds() + 1;
		d.setSeconds(s);

		var job = new cron.CronJob(
			d,
			function() {
				var t = new Date();
				expect(t.getSeconds()).to.eql(d.getSeconds());
				c++;
			},
			null,
			true
		);
		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run on a specific date with oncomplete', function(done) {
		var c = 0;
		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var s = d.getSeconds() + 1;
		d.setSeconds(s);

		var job = new cron.CronJob(
			d,
			function() {
				var t = new Date();
				expect(t.getSeconds()).to.eql(d.getSeconds());
				c++;
			},
			function() {
				expect(c).to.eql(1);
				done();
			},
			true
		);
		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	describe('with timezone', function() {
		it('should run a job using cron syntax', function() {
			var clock = sinon.useFakeTimers();

			var c = 0;

			var moment = require('moment-timezone');
			var zone = 'America/Chicago';

			// New Orleans time
			var t = moment();
			t.tz(zone);

			// Current time
			var d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = 'America/Los_Angeles';
				t.tz(zone);
			}
			expect(d.hours()).to.not.eql(t.hours());

			// If t = 59s12m then t.setSeconds(60)
			// becones 00s13m so we're fine just doing
			// this and no testRun callback.
			t.add(1, 's');
			// Run a job designed to be executed at a given
			// time in `zone`, making sure that it is a different
			// hour than local time.
			var job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
				function() {
					c++;
				},
				null,
				true,
				zone
			);

			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should run a job using a date', function() {
			var c = 0;

			var moment = require('moment-timezone');
			var zone = 'America/Chicago';

			// New Orleans time
			var t = moment();
			t.tz(zone);

			// Current time
			var d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = 'America/Los_Angeles';
				t.tz(zone);
			}
			expect(d.hours()).to.not.eql(t.hours());

			d.add(1, 's');
			var clock = sinon.useFakeTimers(d._d.getTime());

			var job = new cron.CronJob(
				d._d,
				function() {
					c++;
				},
				null,
				true,
				zone
			);

			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should test if timezone is valid.', function() {
			expect(function() {
				new cron.CronJob({
					cronTime: '* * * * * *',
					onTick: function() {},
					timeZone: 'fake/timezone'
				});
			}).to.throw(Error);
		});
	});

	it('should wait and not fire immediately', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var d = new Date().getTime() + 31 * 86400 * 1000;

		var job = cron.job(new Date(d), function() {
			c++;
		});
		job.start();

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(0);
	});

	it('should start, change time, start again', function() {
		var c = 0;
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		});

		job.start();
		clock.tick(1000);

		job.stop();
		var time = cron.time('*/2 * * * * *');
		job.setTime(time);
		job.start();

		clock.tick(4000);

		clock.restore();
		job.stop();
		expect(c).to.eql(3);
	});

	it('should start, change time, exception', function() {
		var c = 0;
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		});

		var time = new Date();
		job.start();

		clock.tick(1000);

		job.stop();
		expect(function() {
			job.setTime(time);
		}).to.throw(Error);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should scope onTick to running job', function() {
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				expect(job).to.be.instanceOf(cron.CronJob);
				expect(job).to.eql(this);
			},
			null,
			true
		);

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should scope onTick to object', function() {
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob(
			'* * * * * *',
			function() {
				expect(this.hello).to.eql('world');
				expect(job).to.not.eql(this);
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
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				expect(this.hello).to.eql('world');
				expect(job).to.not.eql(this);
			},
			start: true,
			context: { hello: 'world' }
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should not get into an infinite loop on invalid times', function() {
		var clock = sinon.useFakeTimers();

		var invalid1 = new cron.CronJob(
			'* 60 * * * *',
			function() {
				expect.ok(true);
			},
			null,
			true
		);
		var invalid2 = new cron.CronJob(
			'* * 24 * * *',
			function() {
				expect.ok(true);
			},
			null,
			true
		);

		clock.tick(1000);

		// assert that it gets here
		invalid1.stop();
		invalid2.stop();

		clock.restore();
	});

	it('should test start of month', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob(
			'0 0 0 1 * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(1001);
		expect(c).to.eql(1);

		clock.tick(2678399001);
		expect(c).to.eql(1);

		clock.tick(2678400001); // jump over 2 firsts
		clock.restore();
		job.stop();

		expect(c).to.eql(3);
	});

	it('should not fire if time was adjusted back', function() {
		var c = 0;
		var clock = sinon.useFakeTimers({
			toFake: ['setTimeout']
		});

		var job = new cron.CronJob(
			'0 * * * * *',
			function() {
				c++;
			},
			null,
			true
		);

		clock.tick(60000);
		expect(c).to.eql(0);

		clock.restore();
		job.stop();
	});

	it('should run every day', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '59 59 3 * * *',
			onTick: function() {
				c++;
			},
			start: true,
			timeZone: 'America/Los_Angeles'
		});

		var twoWeeks = 14 * 24 * 60 * 60 * 1000;
		clock.tick(twoWeeks);

		clock.restore();
		job.stop();
		expect(c).to.eql(14);
	});

	it('should run every 2 hours between hours', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '0 2-6/2 * * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		clock.tick(2 * 60 * 1000);
		expect(c).to.eql(1);
		clock.tick(2 * 60 * 1000);
		expect(c).to.eql(2);
		clock.tick(2 * 60 * 1000);
		expect(c).to.eql(3);
		clock.tick(2 * 60 * 1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(3);
	});

	it('should run every minute', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '00 * * * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		clock.tick(60 * 1000);
		expect(c).to.eql(1);
		clock.tick(60 * 1000);
		expect(c).to.eql(2);

		clock.restore();
		job.stop();
		expect(c).to.eql(2);
	});

	it('should run every day', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '00 30 00 * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		var day = 24 * 60 * 60 * 1000;
		clock.tick(day);
		expect(c).to.eql(1);
		clock.tick(day);
		expect(c).to.eql(2);
		clock.tick(day);
		expect(c).to.eql(3);
		clock.tick(5 * day);

		clock.restore();
		job.stop();
		expect(c).to.eql(8);
	});

	it('should trigger onTick at midnight', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '00 * * * * *',
			onTick: function() {
				c++;
			},
			start: true,
			timeZone: 'UTC'
		});

		clock.tick(1000); // move clock 1 second
		expect(c).to.eql(1);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run every day UTC', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '00 30 00 * * *',
			onTick: function() {
				c++;
			},
			start: true,
			timeZone: 'UTC'
		});

		var day = 24 * 60 * 60 * 1000;
		clock.tick(day);
		expect(c).to.eql(1);
		clock.tick(day);
		expect(c).to.eql(2);
		clock.tick(day);
		expect(c).to.eql(3);
		clock.tick(5 * day);

		clock.restore();
		job.stop();
		expect(c).to.eql(8);
	});

	// from https://github.com/kelektiv/node-cron/issues/180#issuecomment-154108131
	it('should run once not double', function() {
		var c = 0;
		var d = new Date(2015, 1, 1, 1, 1, 41, 0);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob({
			cronTime: '* * * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		var minute = 60 * 1000;
		clock.tick(minute);
		expect(c).to.eql(1);
		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run every second monday');

	describe('with utcOffset', function() {
		it('should run a job using cron syntax with number format utcOffset', function() {
			var clock = sinon.useFakeTimers();
			var c = 0;

			var moment = require('moment-timezone');

			// Current time
			var t = moment();

			// UTC Offset decreased by an hour
			var utcOffset = t.utcOffset() - 60;

			var job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
				function() {
					c++;
				},
				null,
				true,
				null,
				null,
				null,
				utcOffset
			);

			// tick 1 sec before an hour
			clock.tick(1000 * 60 * 60 - 1);
			expect(c).to.eql(0);

			clock.tick(1);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should run a job using cron syntax with string format utcOffset', function() {
			var clock = sinon.useFakeTimers();
			var c = 0;

			var moment = require('moment-timezone');

			// Current time
			var t = moment();

			// UTC Offset decreased by an hour (string format '(+/-)HH:mm')
			var utcOffset = t.utcOffset() - 60;
			var utcOffsetString = utcOffset > 0 ? '+' : '-';
			utcOffsetString += ('0' + Math.floor(Math.abs(utcOffset) / 60)).slice(-2);
			utcOffsetString += ':';
			utcOffsetString += ('0' + (utcOffset % 60)).slice(-2);

			var job = new cron.CronJob(
				t.seconds() + ' ' + t.minutes() + ' ' + t.hours() + ' * * *',
				function() {
					c++;
				},
				null,
				true,
				null,
				null,
				null,
				utcOffsetString
			);

			// tick 1 sec before an hour
			clock.tick(1000 * 60 * 60 - 1);
			expect(c).to.eql(0);

			// tick 1 sec
			clock.tick(1);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should run a job using cron syntax with number format utcOffset that is 0', function() {
			var clock = sinon.useFakeTimers();
			var c = 0;

			var job = new cron.CronJob(
				'* * * * * *',
				function() {
					c++;
				},
				null,
				true,
				null,
				null,
				null,
				0
			);

			clock.tick(999);
			expect(c).to.eql(0);

			clock.tick(1);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should be able to detect out of range days of month and fix them', function() {
			var ct = new cron.CronTime('* * 32 FEB *');
			expect(ct.dayOfMonth['32']).to.eql(undefined);
			expect(ct.dayOfMonth['2']).to.eql(true);
		});
	});
});
