import { CronJob } from '../dist/index.js';

console.log('Before job instantiation');
const job = new CronJob('* * * * * *', function () {
	const d = new Date();
	console.log('Every second:', d);
});
console.log('After job instantiation');
job.start();
console.log('is job active? ', job.isActive);
