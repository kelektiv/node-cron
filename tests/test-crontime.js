var testCase = require('nodeunit').testCase,
    cron = require('../lib/cron');

module.exports = testCase({
        'test stars (* * * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('* * * * * *');
            });
            assert.done();
        },
        'test digit (0 * * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0 * * * * *');
            });
            assert.done();
        },
        'test multi digits (08 * * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('08 * * * * *');
            });
            assert.done();
        },
        'test all digits (08 8 8 8 8 5)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('08 * * * * *');
            });
            assert.done();
        },
        'test too many digits (08 8 8 8 8 5)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('08 * * * * *');
            });
            assert.done();
        },
        'test hyphen (0-10 * * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0-10 * * * * *');
            });
            assert.done();
        },
        'test multi hyphens (0-10 0-10 * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0-10 0-10 * * * *');
            });
            assert.done();
        },
        'test all hyphens (0-10 0-10 0-10 0-10 0-10 0-1)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0-10 0-10 0-10 0-10 0-10 0-1');
            });
            assert.done();
        },
        'test comma (0,10 * * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0,10 * * * * *');
            });
            assert.done();
        },
        'test multi commas (0,10 0,10 * * * *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0,10 0,10 * * * *');
            });
            assert.done();
        },
        'test all commas (0,10 0,10 0,10 0,10 0,10 0,1)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('0,10 0,10 0,10 0,10 0,10 0,1');
            });
            assert.done();
        },
        'test alias (* * * * jan *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('* * * * jan *');
            });
            assert.done();
        },
        'test multi aliases (* * * * jan,feb *)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('* * * * jan,feb *');
            });
            assert.done();
        },
        'test all aliases (* * * * jan,feb mon,tue)': function(assert) {
            assert.expect(1);
            assert.doesNotThrow(function() {
                new cron.CronTime('* * * * jan,feb mon,tue');
            });
            assert.done();
        },
        'test unknown alias (* * * * jar *)': function(assert) {
            assert.expect(1);
            assert.throws(function() {
                new cron.CronTime('* * * * jar *');
            });
            assert.done();
        },
        'test unknown alias - short (* * * * j *)': function(assert) {
            assert.expect(1);
            assert.throws(function() {
                new cron.CronTime('* * * * j *');
            });
            assert.done();
        }


});
