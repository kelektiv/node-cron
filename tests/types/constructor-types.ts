import { CronJob, CronTime } from '../../src';

const expression = '* * * * *';
const onTick = () => {};

// CronTime: timezone and UTC offset are mutually exclusive.
new CronTime(expression);
new CronTime(expression, 'America/Argentina/Buenos_Aires');
new CronTime(expression, 'America/Argentina/Buenos_Aires', undefined);
new CronTime(expression, 'America/Argentina/Buenos_Aires', null);
new CronTime(expression, null, 0);
new CronTime(expression, undefined, 0);
new CronTime(expression, null, null);
new CronTime(expression, undefined, undefined);

// @ts-expect-error A named timezone and numeric UTC offset cannot be combined.
new CronTime(expression, 'America/Argentina/Buenos_Aires', -180);

// CronJob positional constructor: timezone and UTC offset are mutually exclusive.
new CronJob(expression, onTick);
new CronJob(expression, onTick, null, false, 'America/Argentina/Buenos_Aires');
new CronJob(
	expression,
	onTick,
	null,
	false,
	'America/Argentina/Buenos_Aires',
	undefined,
	false,
	undefined
);
new CronJob(expression, onTick, null, false, null, undefined, false, -180);
new CronJob(expression, onTick, null, false, undefined, undefined, false, -180);
new CronJob(expression, onTick, null, false, null, undefined, false, null);
new CronJob(expression, onTick, null, false, undefined, undefined, false, undefined);

// @ts-expect-error A named timezone and numeric UTC offset cannot be combined.
new CronJob(
	expression,
	onTick,
	null,
	false,
	'America/Argentina/Buenos_Aires',
	undefined,
	false,
	-180
);
