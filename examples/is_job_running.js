const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation');
const job = new CronJob('* * * * * *', function() {
	const d = new Date();
	console.log('Every second:', d);
});
console.log('After job instantiation');
job.start();
console.log('is job running? ', job.running);
