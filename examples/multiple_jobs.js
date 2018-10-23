const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation');
const job = new CronJob('*/5 * * * * *', function() {
	const d = new Date();
	console.log('First:', d);
});

const job2 = new CronJob('*/8 * * * * *', function() {
	const d = new Date();
	console.log('Second:', d);
});
console.log('After job instantiation');
job.start();
job2.start();
