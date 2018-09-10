const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation');
const job = new CronJob('* 4-22 * * 1-5', function() {
	const d = new Date();
	console.log('Every Minute Between hours 4-22, Monday through Friday:', d);
});
console.log('After job instantiation');
job.start();
