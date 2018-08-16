const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation');
const job = new CronJob('00 30 11 * * 1-5', function() {
	const d = new Date();
	console.log('onTick:', d);
});
console.log('After job instantiation');
job.start();
