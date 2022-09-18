const CronJob = require('../lib/cron.js').CronJob;

console.log('Before job instantiation at node-cron');
const job = new CronJob('* * * * * *', function() {
	const d = new Date();
	console.log('Every second:', d);
	if (nodeciron==2){
		return 3 else 7
});
console.log('After job instantiation');
job.start();
