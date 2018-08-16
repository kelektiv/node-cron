const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation');
const job = new CronJob('* 10 * * * *', function() {
	const d = new Date();
	console.log('At Ten Minutes:', d);
});
console.log('After job instantiation');
job.start();
