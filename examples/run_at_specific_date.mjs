import { CronJob } from '../dist/index.js';

console.log('Before job instantiation');
const date = new Date();
date.setSeconds(date.getSeconds() + 2);
const job = new CronJob(date, function () {
	const d = new Date();
	console.log('Specific date:', date, ', onTick at:', d);
});
console.log('After job instantiation');
job.start();
