const CronJob = require('../lib/cron.js').CronJob;

const job = new CronJob(
	'0 * * * * *',
	function() {
		console.log('Date: ', new Date());
	},
	null,
	true
);

console.log('System TZ next 5: ', job.nextDates(5));

const jobUTC = new CronJob(
	'0 * * * * *',
	function() {
		console.log('Date: ', new Date());
	},
	null,
	true,
	'UTC'
);

console.log('UTC next 5: ', jobUTC.nextDates(5));
