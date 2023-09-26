import { CronJob } from '../src';

// XXX: SEE README GOTCHAS ABOUT WHY THIS COULD BE IN THE PAST!
const d = new Date();
d.setMilliseconds(d.getMilliseconds() + 1);

console.log('Before job instantiation');
const job = new CronJob(
	d,
	() => {
		const d2 = new Date();
		console.log('Tick @:', d2);
	},
	() => {
		console.log('complete');
	}
);
console.log('After job instantiation');
job.start();
