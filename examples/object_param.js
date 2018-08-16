const CronJob = require('../lib/cron.js').CronJob;

let isRunning = false;
console.log('Before job instantiation');
const job = new CronJob({
	cronTime: '* * * * * *',
	onTick: function() {
		const d = new Date();
		console.log('Check every second:', d, ', isRunning: ', isRunning);

		if (!isRunning) {
			isRunning = true;

			setTimeout(function() {
				console.log('Long running onTick complete:', new Date());
				isRunning = false;
			}, 3000);
			console.log('setTimeout triggered:', new Date());
		}
	}
});
console.log('After job instantiation');
job.start();
