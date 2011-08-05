var testCase = require('nodeunit').testCase,
    cron = require('../lib/cron');

module.exports = testCase({
        'test second (* * * * * *)': function(assert) {
            assert.expect(1);
            new cron.CronJob('* * * * * *', function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 1000);
        },
        'test second with oncomplete (* * * * * *)': function(assert) {
            assert.expect(1);
            new cron.CronJob('* * * * * *', function(done) {
                done();
            }, function () {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 1000);
        },
        'test every second for 5 seconds (* * * * * *)': function(assert) {
            assert.expect(5);
            new cron.CronJob('* * * * * *', function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 5000);
        },
        'test every second for 5 seconds with oncomplete (* * * * * *)': function(assert) {
            assert.expect(5);
            new cron.CronJob('* * * * * *', function(done) {
                done();
            }, function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 5000);
        },
        'test every 1 second for 5 seconds (*/1 * * * * *)': function(assert) {
            assert.expect(5);
            new cron.CronJob('*/1 * * * * *', function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 5000);
        },
        'test every 1 second for 5 seconds with oncomplete (*/1 * * * * *)': function(assert) {
            assert.expect(5);
            new cron.CronJob('*/1 * * * * *', function(done) {
                done();
            }, function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 5000);
        },
        'test every second for a range ([start]-[end] * * * * *)': function(assert) {
            assert.expect(5);
            var d = new Date();
            var s = d.getSeconds()+2;
            var e = s + 4; //end value is inclusive
            new cron.CronJob(s + '-' + e +' * * * * *', function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 7000);
        },
        'test every second for a range with oncomplete ([start]-[end] * * * * *)': function(assert) {
            assert.expect(5);
            var d = new Date();
            var s = d.getSeconds()+2;
            var e = s + 4; //end value is inclusive
            new cron.CronJob(s + '-' + e +' * * * * *', function(done) {
                done();
            }, function() {
                assert.ok(true);
            });
            setTimeout(function() {
                assert.done();
            }, 7000);
        }
});
