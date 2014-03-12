var testCase = require('nodeunit').testCase,
    cron = require('../lib/cron');

module.exports = testCase({
  'test second (* * * * * *)': function(assert) {
    assert.expect(1);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
    }, null, true);
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  },
  'test second with oncomplete (* * * * * *)': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob('* * * * * *', function(done) {
      assert.ok(true);
    }, function () {
      assert.ok(true);
      assert.done();
    }, true);
    setTimeout(function() {
      c.stop();
    }, 1250);
  },
  'test every second for 5 seconds (* * * * * *)': function(assert) {
    assert.expect(5);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
    }, null, true);
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 5250);
  },
  'test standard cron no-seconds syntax doesnt send on seconds (* * * * *)': function(assert) {
    assert.expect(0);
    // Delay test from running at minute boundary
    var prepDate = new Date();
    if (prepDate.getSeconds() >= 55) {
      setTimeout(testRun, 5000);
    } else {
      testRun();
    }

    function testRun() {
      var c = new cron.CronJob('* * * * *', function() {
        assert.ok(true);
      }, null, true);
      setTimeout(function() {
        c.stop();
        assert.done();
      }, 5250);
    }
  },
  'test every second for 5 seconds with oncomplete (* * * * * *)': function(assert) {
    assert.expect(6);
    var c = new cron.CronJob('* * * * * *', function(done) {
      assert.ok(true);
    }, function() {
      assert.ok(true);
      assert.done();
    }, true);
    setTimeout(function() {
      c.stop();
    }, 5250);
  },
  'test every 1 second for 5 seconds (*/1 * * * * *)': function(assert) {
    assert.expect(5);
    var c = new cron.CronJob('*/1 * * * * *', function() {
      assert.ok(true);
    }, null, true);
    setTimeout(function() {
      assert.done();
      c.stop();
    }, 5250);
  },
  'test every 1 second for 5 seconds with oncomplete (*/1 * * * * *)': function(assert) {
    assert.expect(6);
    var c = new cron.CronJob('*/1 * * * * *', function(done) {
      assert.ok(true);
    }, function() {
      assert.ok(true);
      assert.done();
    }, true);
    setTimeout(function() {
      c.stop();
    }, 5250);
  },
  'test every second for a range ([start]-[end] * * * * *)': function(assert) {
    assert.expect(5);
    var prepDate = new Date();
    if ((54 - prepDate.getSeconds()) <= 0) {
      setTimeout(testRun, (60000 - (prepDate.getSeconds()*1000)) + 1000);
    } else {
      testRun();
    }

    function testRun() {
      var d = new Date();
      var s = d.getSeconds()+2;
      var e = s + 6; //end value is inclusive
      var c = new cron.CronJob(s + '-' + e +' * * * * *', function() {
        assert.ok(true);
      }, null, true);
      setTimeout(function() {
        c.stop();
        assert.done();
      }, 6250);
    }
  },
  'test every second for a range with oncomplete ([start]-[end] * * * * *)': function(assert) {
    assert.expect(6);
    var prepDate = new Date();
    if ((54 - prepDate.getSeconds()) <= 0) {
      setTimeout(testRun, (60000 - (prepDate.getSeconds()*1000)) + 1000);
    } else {
      testRun();
    }

    function testRun() {
      var d = new Date();
      var s = d.getSeconds()+2;
      var e = s + 6; //end value is inclusive
      var c = new cron.CronJob(s + '-' + e +' * * * * *', function() {
        assert.ok(true);
      }, function() {
        assert.ok(true);
        assert.done();
      }, true);
      setTimeout(function() {
        c.stop();
      }, 6250);
    }
  },
  'test second (* * * * * *) object constructor': function(assert) {
    assert.expect(1);
    var c = new cron.CronJob({
      cronTime: '* * * * * *',
      onTick: function() {
        assert.ok(true);
      },
      start: true
    });
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  },
  'test second with oncomplete (* * * * * *) object constructor': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob({
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
    setTimeout(function() {
      c.stop();
    }, 1250);
  },
  'test start/stop': function(assert) {
    assert.expect(1);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
      this.stop();
    });
    c.start();
    setTimeout(function() {
      assert.done();
    }, 3250);
  },
  'test specifying a specific date': function(assert) {
    assert.expect(2);
    var prepDate = new Date();
    if ((58 - prepDate.getSeconds()) <= 0) {
      setTimeout(testRun, (60000 - (prepDate.getSeconds()*1000)) + 1000);
    } else {
      testRun();
    }

    function testRun() {
      var d = new Date();
      var s = d.getSeconds()+1;
      d.setSeconds(s);
      var c = new cron.CronJob(d, function() {
        var t = new Date();
        assert.equal(t.getSeconds(), d.getSeconds());
        assert.ok(true);
      }, null, true);
      setTimeout(function() {
        c.stop();
        assert.done();
      }, 2250);
    }
  },
  'test specifying a specific date with oncomplete': function(assert) {
    assert.expect(3);
    var prepDate = new Date();
    if ((58 - prepDate.getSeconds()) <= 0) {
      setTimeout(testRun, (60000 - (prepDate.getSeconds()*1000)) + 1000);
    } else {
      testRun();
    }

    function testRun() {
      var d = new Date();
      var s = d.getSeconds()+1;
      d.setSeconds(s);
      var c = new cron.CronJob(d, function() {
        var t = new Date();
        assert.equal(t.getSeconds(), d.getSeconds());
        assert.ok(true);
      }, function() {
        assert.ok(true);
        assert.done();
      }, true);
      setTimeout(function() {
        c.stop();
      }, 2250);
    }
  },
  'test a job with a string and a given time zone': function (assert) {
    assert.expect(3);

    var time = require("time");
    var zone = "America/Chicago";

    // New Orleans time
    var t = new time.Date();
    t.setTimezone(zone);

    // Current time
    d = new Date();

    // If current time is New Orleans time, switch to Los Angeles..
    if (t.getHours() === d.getHours()) {
      zone = "America/Los_Angeles";
      t.setTimezone(zone);
    }
    assert.notEqual(d.getHours(), t.getHours());
    assert.ok(!(Date instanceof time.Date));

    // If t = 59s12m then t.setSeconds(60)
    // becones 00s13m so we're fine just doing
    // this and no testRun callback.
    t.setSeconds(t.getSeconds()+1);
    // Run a job designed to be executed at a given 
    // time in `zone`, making sure that it is a different
    // hour than local time.
    var c = new cron.CronJob(t.getSeconds() + ' ' + t.getMinutes() + ' ' + t.getHours() +  ' * * *', function(){
      assert.ok(true);
    }, undefined, true, zone);

    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  },
  'test a job with a date and a given time zone': function (assert) {
    assert.expect(3);

    var time = require("time");
    var zone = "America/Chicago";

    // New Orleans time
    var t = new time.Date();
    t.setTimezone(zone);

    // Current time
    d = new Date();

    // If current time is New Orleans time, switch to Los Angeles..
    if (t.getHours() === d.getHours()) {
      zone = "America/Los_Angeles";
      t.setTimezone(zone);
    }
    assert.notEqual(d.getHours(), t.getHours());
    assert.ok(!(Date instanceof time.Date));

    if ((56 - t.getSeconds()) <= 0) {
      setTimeout(testRun, (60000 - (t.getSeconds()*1000)) + 1000);
    } else {
      testRun();
    }

    function testRun() {
      var s = d.getSeconds()+2;
      d.setSeconds(s);
      var c = new cron.CronJob(d, function() {
        assert.ok(true);
      }, null, false, zone);
      setTimeout(function() {
        c.stop();
        assert.done();
      }, 2250);
			c.start();
    }
  },
  'test dates fire only once': function(assert) {
    assert.expect(1);
    var count = 0;
    var d = new Date().getTime() + 1000;
    var job = cron.job(new Date(d), function() { 
      count++;
    }); 
    job.start();
    setTimeout(function() {
      job.stop();
      assert.equal(count, 1);
      assert.done();
    }, 5250);
  },
  'test long wait should not fire immediately': function(assert) {
    assert.expect(1);
    var count = 0;
    var d = new Date().getTime() + 31 * 86400 * 1000;
    var job = cron.job(new Date(d), function() {
      assert.ok(false);
    });
    job.start();
    setTimeout(function() {
      job.stop();
      assert.ok(true);
      assert.done();
    }, 250);
  },
  'test start, change time, start again': function(assert) {
    assert.expect(3);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
    });
    var time = cron.time('*/2 * * * * *');
    c.start();
    setTimeout(function() {
      c.stop();
      c.setTime(time);
      c.start();
      setTimeout(function() {
        c.stop();
        assert.done();
      }, 4250);
    }, 1250);
  },
  'test start, change time, excpetion': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
    });
    var time = new Date();
    c.start();
    setTimeout(function() {
      c.stop();
      assert.throws(function() {
        c.setTime(time);
      });
      assert.done();
    }, 1250);
  },
  'test cronjob scoping': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
      assert.ok(c instanceof cron.CronJob);
    }, null, true);
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  },
  'test non-cronjob scoping': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob('* * * * * *', function() {
      assert.ok(true);
      assert.equal(this.hello, 'world');
    }, null, true, null, {'hello':'world'});
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  },
  'test non-cronjob scoping inside object': function(assert) {
    assert.expect(2);
    var c = new cron.CronJob({
      cronTime: '* * * * * *',
      onTick: function() {
        assert.ok(true);
        assert.equal(this.hello, 'world');
      },
      start: true,
      context: {hello: 'world'}
    });
    setTimeout(function() {
      c.stop();
      assert.done();
    }, 1250);
  }
});
