const CronJob = require('../lib/cron.js').CronJob;

console.log('first');
const job = new CronJob(
	'0 0 9 4 * *',
	function() {
		console.log('message');
	},
	null,
	true,
	null,
	null,
	null,
	-360, // UTC-6, represented in minutes
);
console.log('second');
