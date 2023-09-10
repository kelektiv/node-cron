const CronJob = require('../dist').CronJob;

console.log('Before job instantiation');
const job = new CronJob('* * * * * *', function () {
	const d = new Date();
	console.log('Every second:', d);
});
console.log('After job instantiation');
job.start();
