<p align="center">
    <img src="logo.svg" alt="Node Cron Alarm Clock Star Logo" width="100" />
</p>

# node-cron

[![Version](https://badgen.net/npm/v/cron?icon=npm)](https://badgen.net/npm/v/cron)
[![Build Status](https://badgen.net/github/status/kelektiv/node-cron?icon=github)](https://badgen.net/github/status/kelektiv/node-cron)
[![Build Checks](https://badgen.net/github/checks/kelektiv/node-cron?icon=github)](https://badgen.net/github/checks/kelektiv/node-cron)
[![Dependency Status](https://badgen.net/david/dep/kelektiv/node-cron)](https://badgen.net/david/dev/kelektiv/node-cron)
[![Code Coverage](https://badgen.net/codecov/c/github/kelektiv/node-cron?icon=codecov)](https://badgen.net/codecov/c/github/kelektiv/node-cron)
[![Known Vulnerabilities](https://snyk.io/test/github/kelektiv/node-cron/badge.svg)](https://snyk.io/test/github/kelektiv/node-cron)
[![Minified size](https://badgen.net/bundlephobia/min/cron)](https://badgen.net/bundlephobia/min/cron)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/cron)](https://badgen.net/bundlephobia/minzip/cron)
[![monthly downloads](https://badgen.net/npm/dm/cron?icon=npm)](https://badgen.net/npm/dm/cron) 

Cron is a tool that allows you to execute _something_ on a schedule. This is typically done using the cron syntax. We allow you to:

- execute a function whenever your scheduled job triggers
- execute a job external to the javascript process using `child_process`
- use a Date object instead of cron syntax as the trigger for your callback 
- use an additional slot for seconds (leaving it off will default to 0 and match the Unix behavior)

## Installation 

```
npm install cron 
```

## Versions and Backwards compatibility breaks

As goes with semver, breaking backwards compatibility should be explicit in the versioning of your library. As such, we'll upgrade the version of this module in accordance with breaking changes (We're not always great about doing it this way so if you notice that there are breaking changes that haven't been bumped appropriately please let us know). 

## Usage (basic cron usage)

```javascript
var CronJob = require('cron').CronJob;
var job = new CronJob(
    '* * * * * *',
    function() {
        console.log('You will see this message every second');
    },
    null,
    true,
    'America/Los_Angeles'
);
// job.start() - See note below when to use this
``` 

Note - In the example above, the 4th parameter of `CronJob()` automatically starts the job on initialization. If this parameter is falsy or not provided, the job needs to be explicitly started using `job.start()`.

There are more examples available in this repository at: [/examples](https://github.com/kelektiv/node-cron/tree/main/examples) 

## Available Cron patterns

```
Asterisks e.g. *
Ranges e.g. 1-3,5
Steps e.g. */2
```

[Read up on cron patterns here](http://crontab.org). Note the examples in the link have five fields, and 1 minute as the finest granularity, but this library has six fields, with 1 second as the finest granularity. 

There are tools that help when constructing your cronjobs. You might find something like https://crontab.guru/ or https://cronjob.xyz/ helpful. But, note that these don't necessarily accept the exact same syntax as this library, for instance, it doesn't accept the `seconds` field, so keep that in mind. 

### Cron Ranges 

When specifying your cron values you'll need to make sure that your values fall within the ranges. For instance, some cron's use a 0-7 range for the day of week where both 0 and 7 represent Sunday. We do not. And that is an optimisation. 

- Seconds: 0-59
- Minutes: 0-59
- Hours: 0-23
- Day of Month: 1-31
- Months: 0-11 (Jan-Dec) <-- currently different from Unix `cron`!
- Day of Week: 0-6 (Sun-Sat) 

## Gotchas 

- Months are indexed as 0-11 instead of 1-12. This is different from Unix `cron` and is planned to updated to match Unix `cron` in v3.0.0 of `node-cron`.
- Millisecond level granularity in JS `Date` or Luxon `DateTime` objects: Because computers take time to do things, there may be some delay in execution. This should be on the order of milliseconds. This module doesn't allow MS level granularity for the regular cron syntax, but _does_ allow you to specify a real date of execution in either a javascript `Date` object or a Luxon `DateTime` object. When this happens you may find that you aren't able to execute a job that _should_ run in the future like with `new Date().setMilliseconds(new Date().getMilliseconds() + 1)`. This is due to those cycles of execution above. This wont be the same for everyone because of compute speed. When we tried it locally we saw that somewhere around the 4-5 ms mark was where we got consistent ticks using real dates, but anything less than that would result in an exception. This could be really confusing. We could restrict the granularity for all dates to seconds, but felt that it wasn't a huge problem so long as you were made aware. If this becomes more of an issue, We can revisit it.
- Arrow Functions for `onTick`: Arrow functions get their `this` context from their parent scope. Thus, if you use them, you will not get the `this` context of the cronjob. You can read a little more in issue [GH-47](https://github.com/kelektiv/node-cron/issues/47#issuecomment-459762775) 

## API 

Parameter Based 

- `job` - shortcut to `new cron.CronJob()`.
- `time` - shortcut to `new cron.CronTime()`.
- `sendAt` - tells you when a `CronTime` will be run.
- `timeout` - tells you when the next timeout is.
- `CronJob`
    - `constructor(cronTime, onTick, onComplete, start, timeZone, context, runOnInit, utcOffset, unrefTimeout)` - Of note, the first parameter here can be a JSON object that has the below names and associated types (see examples above).
        - `cronTime` - [REQUIRED] - The time to fire off your job. This can be in the form of cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.
        - `onTick` - [REQUIRED] - The function to fire at the specified time. If an `onComplete` callback was provided, `onTick` will receive it as an argument. `onTick` may call `onComplete` when it has finished its work.
        - `onComplete` - [OPTIONAL] - A function that will fire when the job is stopped with `job.stop()`, and may also be called by `onTick` at the end of each run.
        - `start` - [OPTIONAL] - Specifies whether to start the job just before exiting the constructor. By default this is set to false. If left at default you will need to call `job.start()` in order to start the job (assuming `job` is the variable you set the cronjob to). This does not immediately fire your `onTick` function, it just gives you more control over the behavior of your jobs.
        - `timeZone` - [OPTIONAL] - Specify the time zone for the execution. This will modify the actual time relative to your time zone. If the time zone is invalid, an error is thrown. By default (if this is omitted) the local time zone will be used. You can check all time zones available at [Moment Timezone Website](http://momentjs.com/timezone/). Probably don't use both `timeZone` and `utcOffset` together or weird things may happen.
        - `context` - [OPTIONAL] - The context within which to execute the onTick method. This defaults to the cronjob itself allowing you to call `this.stop()`. However, if you change this you'll have access to the functions and values within your context object.
        - `runOnInit` - [OPTIONAL] - This will immediately fire your `onTick` function as soon as the requisite initialization has happened. This option is set to `false` by default for backwards compatibility.
        - `utcOffset` - [OPTIONAL] - This allows you to specify the offset of your time zone rather than using the `timeZone` param. This should be an integer amount representing the number of minutes offset (like `120` for +2 hours or `-90` for -1.5 hours) Probably don't use both `timeZone` and `utcOffset` together or weird things may happen.
        - `unrefTimeout` - [OPTIONAL] - If you have code that keeps the event loop running and want to stop the node process when that finishes regardless of the state of your cronjob, you can do so making use of this parameter. This is off by default and cron will run as if it needs to control the event loop. For more information take a look at [timers#timers_timeout_unref](https://nodejs.org/api/timers.html#timers_timeout_unref)       from the NodeJS docs.
    - `start` - Runs your job.
    - `stop` - Stops your job.
    - `setTime` - Stops and changes the time for the `CronJob`. Param must be a `CronTime`.
    - `lastDate` - Tells you the last execution date.
    - `nextDates` - Provides an array of the next set of dates that will trigger an `onTick`.
    - `fireOnTick` - Allows you to override the `onTick` calling behavior. This matters so only do this if you have a really good reason to do so.
    - `addCallback` - Allows you to add `onTick` callbacks.
- `CronTime`
    - `constructor(time)`
        - `time` - [REQUIRED] - The time to fire off your job. This can be in the form of cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date)       object. 

## Community

Join the [Discord server](https://discord.gg/yyKns29zch)! Here you can discuss issues and get help in a more casual forum than GitHub.

## Contributing

### Looking for maintainers/contributors

This project is looking for help! If you're interested in helping with the project please reach out to me (ncb000gt) on [Twitter](https://twitter.com/ncb000gt). We'd love for it to continue on, but it needs a lot of attention. You can also join the [Discord server](https://discord.gg/yyKns29zch) to learn more about what needs to be done.

### Submitting Bugs/Issues

Before submitting a bug, please search the existing issues, [Discord](https://discord.gg/yyKns29zch) conversations, and the web to see if someone else has run into the same issue before.

Because we can't magically know what you are doing to expose an issue, it is best if you provide a snippet of code. This snippet need not include your secret sauce, but it must replicate the issue you are describing. The issues that get closed without resolution tend to be the ones without code examples. Thanks.

### Acknowledgements

This is a community effort project. In the truest sense, this project started as an open source project from [cron.js](http://github.com/padolsey/cron.js) and grew into something else. Other people have contributed code, time, and oversight to the project. At this point there are too many to name here so We'll just say thanks. 

## License 

MIT
