var testCase = require('nodeunit').testCase,
		sinon = require('sinon'),
    cron = require('../lib/cron');

module.exports = testCase({
	'test second (* * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(1);

		var job = new cron.CronJob('* * * * * *', function() {
			assert.ok(true);
		}, null, true);
		clock.tick(1000);
		job.stop();

		clock.restore();
		assert.done();
	},
	'test second with oncomplete (* * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(2);
		var job = new cron.CronJob('* * * * * *', function(done) {
			assert.ok(true);
		}, function () {
			assert.ok(true);
			assert.done();
		}, true);
		clock.tick(1000);
		clock.restore();
		job.stop();
	},
	'test standard cron no-seconds syntax doesnt send on seconds (* * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(1);

		var job = new cron.CronJob('* * * * *', function() {
			assert.ok(true);
		}, null, true);

		clock.tick(1000); //tick second

		clock.tick(59 * 1000); //tick minute

		job.stop();
		clock.restore();
		assert.done();
	},
	'test every second for 5 seconds (* * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(5);

		var job = new cron.CronJob('* * * * * *', function() {
			assert.ok(true);
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test every second for 5 seconds with oncomplete (* * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(6);
		var job = new cron.CronJob('* * * * * *', function(done) {
			assert.ok(true);
		}, function() {
			assert.ok(true);
			assert.done();
		}, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
	},
	'test every 1 second for 5 seconds (*/1 * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(5);

		var job = new cron.CronJob('*/1 * * * * *', function() {
			assert.ok(true);
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test every 1 second for 5 seconds with oncomplete (*/1 * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(6);
		var job = new cron.CronJob('*/1 * * * * *', function(done) {
			assert.ok(true);
		}, function() {
			assert.ok(true);
			assert.done();
		}, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
	},
	'test every second for a range ([start]-[end] * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(5);

		var job = new cron.CronJob('0-5 * * * * *', function() {
			assert.ok(true);
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test every second for a range with oncomplete ([start]-[end] * * * * *)': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(6);

		var job = new cron.CronJob('0-5 * * * * *', function() {
			assert.ok(true);
		}, function() {
			assert.ok(true);
			assert.done();
		}, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
	},
	'test second (* * * * * *) object constructor': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(1);

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				assert.ok(true);
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test second with oncomplete (* * * * * *) object constructor': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(2);

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function(done) {
				assert.ok(true);
			},
			onComplete: function () {
				assert.ok(true);
				assert.done();
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	},
	'test start/stop': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(1);

		var job = new cron.CronJob('* * * * * *', function() {
			clock.restore();
			assert.ok(true);
			this.stop();
			assert.done();
		});
		job.start();

		clock.tick(1001);
	},
	'test specifying a date': function(assert) {
		assert.expect(1);

		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var job = new cron.CronJob(d, function() {
			var t = new Date();
			assert.equal(t.getSeconds(), d.getSeconds()+1);
		}, null, true);
		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test specifying a date with oncomplete': function(assert) {
		assert.expect(2);

		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var job = new cron.CronJob(d, function() {
			var t = new Date();
			assert.equal(t.getSeconds(), d.getSeconds()+1);
		}, function() {
			assert.ok(true);
			assert.done();
		}, true);
		clock.tick(1000);

		clock.restore();
		job.stop();
	},
  'test a job with a date and a given time zone': function (assert) {
		assert.expect(2);

		var moment = require("moment-timezone");
		var zone = "America/Chicago";

		// New Orleans time
		var t = moment();
		t.tz(zone);

		// Current time
		d = moment();

		// If current time is New Orleans time, switch to Los Angeles..
		if (t.hours() === d.hours()) {
			zone = "America/Los_Angeles";
			t.tz(zone);
		}
		assert.notEqual(d.hours(), t.hours());

		d.add(1, 's');
		var clock = sinon.useFakeTimers(d._d.getTime());

		var job = new cron.CronJob(d._d, function() {
			assert.ok(true);
		}, null, true, zone);

		clock.tick(1000);
		clock.restore();
		job.stop();
		assert.done();
	},
	'test long wait should not fire immediately': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(0);

		var d = new Date().getTime() + 31 * 86400 * 1000;

		var job = cron.job(new Date(d), function() {
			assert.ok(false);
		});
		job.start();

		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test start, change time, start again': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(3);

		var job = new cron.CronJob('* * * * * *', function() {
			assert.ok(true);
		});

		var time = '*/2 * * * * ';
		job.start();

		clock.tick(1000);

		job.stop();
		job.setTime(time);
		job.start();

		clock.tick(4000);

		clock.restore();
		job.stop();
		assert.done();
  },
	'test cronjob scoping': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(3);

		var job = new cron.CronJob('* * * * * *', function() {
			assert.ok(true);
			assert.ok(job instanceof cron.CronJob);
			assert.ok(job === this);
		}, null, true);

		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test non-cronjob scoping': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(3);

		var job = new cron.CronJob('* * * * * *', function() {
			assert.ok(true);
			assert.equal(this.hello, 'world');
			assert.ok(job !== this);
		}, null, true, null, {'hello':'world'});

		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test non-cronjob scoping inside object': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(3);

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				assert.ok(true);
				assert.equal(this.hello, 'world');
				assert.ok(job !== this);
			},
			start: true,
			context: {hello: 'world'}
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
		assert.done();
	},
	'test avoid infinite loop on invalid time': function(assert) {
		var clock = sinon.useFakeTimers();

		assert.expect(1);

		var invalid1 = new cron.CronJob('* 60 * * * *', function() {
			assert.ok(true);
		}, null, true);
		var invalid2 = new cron.CronJob('* * 24 * * *', function() {
			assert.ok(true);
		}, null, true);

		clock.tick(1000);

		// assert that it gets here
		assert.ok(true);
		invalid1.stop();
		invalid2.stop();

		clock.restore();
		assert.done();
	}
});
