const { CronTime } = require('./lib/cron');

const schedule = new CronTime(
	'{"second": "0", "hour": "16", "minute": "15","dayOfWeek": "fri", "month": "jan"}'
);

console.log(schedule);
