import { CronJob } from '../dist/index.js';

console.log('Before job instantiation');
const job = new CronJob('0 */10 * * * *', function () {
	const d = new Date();
	console.log('Every Tenth Minute:', d);
});
console.log('After job instantiation');
job.start();
