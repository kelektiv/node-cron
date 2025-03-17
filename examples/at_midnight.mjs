import { CronJob } from '../dist/index.js';

console.log('Before job instantiation');
const job = new CronJob('00 00 00 * * *', function () {
	const d = new Date();
	console.log('Midnight:', d);
});
console.log('After job instantiation');
job.start();
