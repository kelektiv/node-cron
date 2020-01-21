node-cron
=

[![Build Status](https://travis-ci.org/kelektiv/node-cron.svg?branch=master)](https://travis-ci.org/kelektiv/node-cron)
[![Dependency Status](https://david-dm.org/ncb000gt/node-cron.svg)](https://david-dm.org/ncb000gt/node-cron)

Cron is a tool that allows you to execute _something_ on a schedule. This is
typically done using the cron syntax. We allow you to execute a function
whenever your scheduled job triggers. We also allow you to execute a job
external to the javascript process using `child_process`. Additionally, this
library goes beyond the basic cron syntax and allows you to 
supply a Date object. This will be used as the trigger for your callback. Cron 
syntax is still an acceptable CronTime format. Although the Cron patterns 
supported here extend on the standard Unix format to support seconds digits, 
leaving it off will default to 0 and match the Unix behavior.


Installation
==

    npm install cron


If You Are Submitting Bugs/Issues
==

Because we can't magically know what you are doing to expose an issue, it is
best if you provide a snippet of code. This snippet need not include your secret
sauce, but it must replicate the issue you are describing. The issues that get
closed without resolution tend to be the ones without code examples. Thanks.


Versions and Backwards compatibility breaks:
==

As goes with semver, breaking backwards compatibility should be explicit in the
versioning of your library. As such, we'll upgrade the version of this module
in accordance with breaking changes (I'm not always great about doing it this
way so if you notice that there are breaking changes that haven't been bumped
appropriately please let me know).


Usage (basic cron usage):
==

```javascript
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');
job.start();
```

Note - You need to explicitly start a job in order to make it run. This gives a
little more control over running your jobs.

There are more examples available in this repository at:
[/examples](https://github.com/kelektiv/node-cron/tree/master/examples)


Available Cron patterns:
==

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2

[Read up on cron patterns here](http://crontab.org). Note the examples in the
link have five fields, and 1 minute as the finest granularity, but this library
has six fields, with 1 second as the finest granularity.

There are tools that help when constructing your cronjobs. You might find
something like https://crontab.guru/ or https://cronjob.xyz/ helpful. But,
note that these don't necessarily accept the exact same syntax as this
library, for instance, it doesn't accept the `seconds` field, so keep that in
mind.


Cron Ranges
==

When specifying your cron values you'll need to make sure that your values fall
within the ranges. For instance, some cron's use a 0-7 range for the day of
week where both 0 and 7 represent Sunday. We do not. And that is an optimisation. 

 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11 (Jan-Dec)
 * Day of Week: 0-6 (Sun-Sat)


Gotchas
==

* Millisecond level granularity in JS or moment date objects.
    Because computers take time to do things, there may be some delay in execution.
    This should be on the order of milliseconds. This module doesn't allow MS level
    granularity for the regular cron syntax, but _does_ allow you to specify a real
    date of execution in either a javascript date object or a moment object.
		When this happens you may find that you aren't able to execute a job that
		_should_ run in the future like with `new Date().setMilliseconds(new
		Date().getMilliseconds() + 1)`. This is due to those cycles of execution
		above. This wont be the same for everyone because of compute speed. When I
		tried it locally I saw that somewhere around the 4-5 ms mark was where I got
		consistent ticks using real dates, but anything less than that would result
		in an exception. This could be really confusing. We could restrict the
		granularity for all dates to seconds, but felt that it wasn't a huge problem
		so long as you were made aware. If this becomes more of an issue, We can
		revisit it.
* Arrow Functions for `onTick`
    Arrow functions get their `this` context from their parent scope. Thus, if you use them, you will not get
    the `this` context of the cronjob. You can read a little more in this ticket [GH-40](https://github.com/kelektiv/node-cron/issues/47#issuecomment-459762775)


API
==

Parameter Based

* `job` - shortcut to `new cron.CronJob()`.
* `time` - shortcut to `new cron.CronTime()`.
* `sendAt` - tells you when a `CronTime` will be run.
* `timeout` - tells you when the next timeout is.
* `CronJob`
  * `constructor(cronTime, onTick, onComplete, start, timezone, context,
	runOnInit, unrefTimeout)` - Of note, the first parameter here can be a JSON object that
	has the below names and associated types (see examples above).
    * `cronTime` - [REQUIRED] - The time to fire off your job. This can be in
		the form of cron syntax or a JS
		[Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.
    * `onTick` - [REQUIRED] - The function to fire at the specified time. If an
		`onComplete` callback was provided, `onTick` will receive it as an argument.
		`onTick` may call `onComplete` when it has finished its work.
    * `onComplete` - [OPTIONAL] - A function that will fire when the job is
		stopped with `job.stop()`, and may also be called by `onTick` at the end of each run.
    * `start` - [OPTIONAL] - Specifies whether to start the job just before
		exiting the constructor. By default this is set to false. If left at default
		you will need to call `job.start()` in order to start the job (assuming
		`job` is the variable you set the cronjob to). This does not immediately
		fire your `onTick` function, it just gives you more control over the
		behavior of your jobs.
    * `timeZone` - [OPTIONAL] - Specify the timezone for the execution. This
		will modify the actual time relative to your timezone. If the timezone is
		invalid, an error is thrown. You can check all timezones available at
		[Moment Timezone Website](http://momentjs.com/timezone/). Probably don't use
		both.
		`timeZone` and `utcOffset` together or weird things may happen.
    * `context` - [OPTIONAL] - The context within which to execute the onTick
		method. This defaults to the cronjob itself allowing you to call
		`this.stop()`. However, if you change this you'll have access to the
		functions and values within your context object.
    * `runOnInit` - [OPTIONAL] - This will immediately fire your `onTick`
		function as soon as the requisite initialization has happened. This option
		is set to `false` by default for backwards compatibility.
    * `utcOffset` - [OPTIONAL] - This allows you to specify the offset of your
		timezone rather than using the `timeZone` param. Probably don't use both
		`timeZone` and `utcOffset` together or weird things may happen.
    * `unrefTimeout` - [OPTIONAL] - If you have code that keeps the event loop
		running and want to stop the node process when that finishes regardless of
		the state of your cronjob, you can do so making use of this parameter. This
		is off by default and cron will run as if it needs to control the event
		loop. For more information take a look at
		[timers#timers_timeout_unref](https://nodejs.org/api/timers.html#timers_timeout_unref)
		from the NodeJS docs.
  * `start` - Runs your job.
  * `stop` - Stops your job.
  * `setTime` - Stops and changes the time for the `CronJob`. Param must be a `CronTime`.
  * `lastDate` - Tells you the last execution date.
  * `nextDates` - Provides an array of the next set of dates that will trigger an `onTick`.
  * `fireOnTick` - Allows you to override the `onTick` calling behavior. This
	matters so only do this if you have a really good reason to do so.
  * `addCallback` - Allows you to add `onTick` callbacks.
* `CronTime`
  * `constructor(time)`
    * `time` - [REQUIRED] - The time to fire off your job. This can be in the
		form of cron syntax or a JS
		[Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date)
		object.


Contributions
==

This is a community effort project. In the truest sense, this project started as
an open source project from [cron.js](http://github.com/padolsey/cron.js) and
grew into something else. Other people have contributed code, time, and
oversight to the project. At this point there are too many to name here so I'll
just say thanks.


License
==

MIT
