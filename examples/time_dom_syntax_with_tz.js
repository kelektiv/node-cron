const CronJob = require('../lib/cron.js').CronJob;

console.log('first');
const job = new CronJob(
	'0 0 9 4 * *',
	function() {
		console.log('message');
	},
	null,
	true,
	'America/New_York'
);
console.log('second');
