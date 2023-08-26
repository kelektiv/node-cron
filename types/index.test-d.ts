import * as luxon from 'luxon';
import { expectType } from 'tsd';
import * as cron from '..';

const CronJob = cron.CronJob;
const CronTime = cron.CronTime;

const DateTime = luxon.DateTime;

const timeZone = 'America/Los_Angeles';

// basic cron usage
const job = new CronJob(
  '* * * * * *',
  () => {},
  null,
  true
);

// using factory function with parameters object
expectType<cron.CronJob>(cron.job({
  cronTime: '00 30 11 * * 1-5',
  onTick: () => {},
  start: false,
  timeZone: 'America/Los_Angeles'
}));

// with timezone
new CronJob(
  '* * * * * *',
  () => {},
  null,
  true,
  timeZone
);

// with onComplete
new CronJob(
  '00 30 11 * * 1-5',
  () => {},
  () => {},
  true,
  timeZone
);

// with Date
new CronJob(
  new Date(),
  () => {},
  null,
  true,
  timeZone
);

// with Luxon DateTime
new CronJob(
  DateTime.local(),
  () => {},
  null,
  true,
  timeZone
);

// with system commands
new CronJob(
  '00 30 11 * * 1-5',
  'ls',
  { command: 'ls', args: ['./'] },
  true,
  timeZone
);

// check function return types
expectType<Date>(job.lastDate());
expectType<luxon.DateTime>(job.nextDates());
expectType<luxon.DateTime | luxon.DateTime[]>(job.nextDates(1));
expectType<boolean | undefined>(job.running);
job.setTime(new CronTime('00 30 11 * * 1-2'));
job.start();
job.stop();

// check cronTime format
new CronTime('* * * * * *');
new CronTime(new Date());
new CronTime(DateTime.local());
