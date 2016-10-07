var chai = require('chai'),
	expect = chai.expect,
		cron = require('../lib/cron');

describe('crontime', function() {
	it('should test stars (* * * * * *)', function() {
		expect(function() {
			new cron.CronTime('* * * * * *');
		}).to.not.throw(Error);
	});

	it('should test digit (0 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test multi digits (08 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test all digits (08 8 8 8 8 5)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test too many digits (08 8 8 8 8 5)', function() {
		expect(function() {
			new cron.CronTime('08 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test standard cron format (* * * * *)', function() {
		expect(function() {
			new cron.CronTime('* * * * *');
		}).to.not.throw(Error);
	});

	it('should test standard cron format (8 8 8 8 5)', function() {
		var standard = new cron.CronTime('8 8 8 8 5');
		var extended = new cron.CronTime('0 8 8 8 8 5');

		expect(standard.dayOfWeek).to.deep.eql(extended.dayOfWeek);
		expect(standard.month).to.deep.eql(extended.month);
		expect(standard.dayOfMonth).to.deep.eql(extended.dayOfMonth);
		expect(standard.hour).to.deep.eql(extended.hour);
		expect(standard.minute).to.deep.eql(extended.minute);
		expect(standard.second).to.deep.eql(extended.second);
	});

	it('should test hyphen (0-10 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0-10 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test multi hyphens (0-10 0-10 * * * *)', function() {
		expect(function() {
			new cron.CronTime('0-10 0-10 * * * *');
		}).to.not.throw(Error);
	});

	it('should test all hyphens (0-10 0-10 0-10 0-10 0-10 0-1)', function() {
		expect(function() {
			new cron.CronTime('0-10 0-10 0-10 0-10 0-10 0-1');
		}).to.not.throw(Error);
	});

	it('should test comma (0,10 * * * * *)', function() {
		expect(function() {
			new cron.CronTime('0,10 * * * * *');
		}).to.not.throw(Error);
	});

	it('should test multi commas (0,10 0,10 * * * *)', function() {
		expect(function() {
			new cron.CronTime('0,10 0,10 * * * *');
		}).to.not.throw(Error);
	});

	it('should test all commas (0,10 0,10 0,10 0,10 0,10 0,1)', function() {
		expect(function() {
			new cron.CronTime('0,10 0,10 0,10 0,10 0,10 0,1');
		}).to.not.throw(Error);
	});

	it('should test alias (* * * * jan *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan *');
		}).to.not.throw(Error);
	});

	it('should test multi aliases (* * * * jan,feb *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan,feb *');
		}).to.not.throw(Error);
	});

	it('should test all aliases (* * * * jan,feb mon,tue)', function() {
		expect(function() {
			new cron.CronTime('* * * * jan,feb mon,tue');
		}).to.not.throw(Error);
	});

	it('should test every second monday (* * * * * mon/2)');

	it('should test unknown alias (* * * * jar *)', function() {
		expect(function() {
			new cron.CronTime('* * * * jar *');
		}).to.throw(Error);
	});

	it('should test unknown alias - short (* * * * j *)', function() {
		expect(function() {
			new cron.CronTime('* * * * j *');
		}).to.throw(Error);
	});

	it('should test Date', function() {
		var d = new Date();
		var ct = new cron.CronTime(d);
		expect(ct.source.isSame(d.getTime())).to.be.true
	});

	it('should test day roll-over', function() {
		var numHours = 24;
		var ct = new cron.CronTime('0 0 17 * * *');

		for (var hr = 0; hr < numHours; hr++) {
			var start = new Date(2012, 3, 16, hr, 30, 30);
			var next = ct._getNextDateFrom(start);

			expect(next - start).to.be.lt(24*60*60*1000);
			expect(next).to.be.gt(start);
		}
	});

	it('should test illegal repetition syntax', function() {
		expect(function(){
			new cron.CronTime('* * /4 * * *');
		}).to.throw(Error);
	});

	it('should test next date', function() {
		var ct = new cron.CronTime('0 0 */4 * * *');

		var nextDate = new Date();
		nextDate.setHours(23);
		var nextdt = ct._getNextDateFrom(nextDate);

		expect(nextdt).to.be.gt(nextDate);
		expect(nextdt.hours() % 4).to.eql(0);
	});

	it('should test next date from invalid date', function() {
		var ct = new cron.CronTime('0 0 * * * *');
		var nextDate = new Date('My invalid date string');
		var nextdt = ct._getNextDateFrom(nextDate);

		expect(nextdt.toString()).to.eql('Invalid date');
	});

	it('should test next real date', function() {
		var ct = new cron.CronTime(new Date());

		var nextDate = new Date();
		nextDate.setMonth(nextDate.getMonth()+1);
		expect(nextDate).to.be.gt(ct.source);
		var nextdt = ct._getNextDateFrom(nextDate);
		expect(nextdt.isSame(nextDate)).to.be.true;
	});

	it('should test next month selection');

	describe('should throw an exception because `L` not supported', function() {

		it('(* * * L * *)', function() {
			expect(function() {
				new cron.CronTime('* * * L * *');
			}).to.throw(Error);

		});

		it('(* * * * * L)', function() {
			expect(function() {
				new cron.CronTime('* * * * * L');
			}).to.throw(Error);
		});
	});
});
