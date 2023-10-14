<p align="center">
  <img src="logo.svg" alt="Node Cron Alarm Clock Star Logo" width="150">
</p>

# node-cron

**node-cron** is a robust tool for running jobs (functions or commands) on schedules defined using the cron syntax. Perfect for tasks like data backups, notifications, and many more!


[![Version](https://badgen.net/npm/v/cron?icon=npm)](https://badgen.net/npm/v/cron)
[![Build Status](https://badgen.net/github/status/kelektiv/node-cron?icon=github)](https://badgen.net/github/status/kelektiv/node-cron)
[![Build Checks](https://badgen.net/github/checks/kelektiv/node-cron?icon=github)](https://badgen.net/github/checks/kelektiv/node-cron)
[![Dependency Status](https://badgen.net/david/dep/kelektiv/node-cron)](https://badgen.net/david/dev/kelektiv/node-cron)
[![Code Coverage](https://badgen.net/codecov/c/github/kelektiv/node-cron?icon=codecov)](https://badgen.net/codecov/c/github/kelektiv/node-cron)
[![Known Vulnerabilities](https://snyk.io/test/github/kelektiv/node-cron/badge.svg)](https://snyk.io/test/github/kelektiv/node-cron)
[![Minified size](https://badgen.net/bundlephobia/min/cron)](https://badgen.net/bundlephobia/min/cron)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/cron)](https://badgen.net/bundlephobia/minzip/cron)
[![monthly downloads](https://badgen.net/npm/dm/cron?icon=npm)](https://badgen.net/npm/dm/cron)

Table of Contents
-----------------
1. [Introduction](#node-cron)
   - [Logo](#node-cron)
   - [Overview](#node-cron)
   - [Badges](#node-cron)
2. [Features](#-features)
   - [Overview](#-features)
3. [Installation](#-installation)
4. [Migration](#-migrating-from-v2-to-v3)
   - [Migrating from v2 to v3](#-migrating-from-v2-to-v3)
5. [Basic Usage](#-basic-usage)
   - [Code Example](#-basic-usage)
   - [Note](#-basic-usage)
6. [Cron Patterns](#cron-patterns)
   - [Cron Syntax Overview](#cron-patterns)
   - [Supported Ranges](#supported-ranges)
7. [Gotchas](#gotchas)
8. [API](#api)
   - [General Parameters](#general-parameters)
   - [CronJob Class](#cronjob-class)
     - [Constructor](#constructor)
     - [Methods](#methods)
   - [CronTime Class](#crontime-class)
     - [Constructor](#constructor)
9. [Community](#-community)
   - [Join the Community](#-community)
10. [Contributing](#-contributing)
    - [General Contribution](#-contributing)
    - [Submitting Bugs/Issues](#-submitting-bugsissues)
11. [Acknowledgements](#-acknowledgements)
    - [Community Effort](#-acknowledgements)
    - [Special Thanks](#-acknowledgements)
12. [License](#license)

## 🌟 Features

- execute a function whenever your scheduled job triggers
- execute a job external to the javascript process (like a system command) using `child_process`
- use a Date or Luxon DateTime object instead of cron syntax as the trigger for your callback
- use an additional slot for seconds (leaving it off will default to 0 and match the Unix behavior)



## 🚀 Installation

```bash
npm install cron
```

## 🔄 Migrating from v2 to v3

With the introduction of TypeScript in version 3 and alignment with UNIX cron patterns, a few changes have been made:

<details>
  <summary>Migrating from v2 to v3</summary>

### Month & day-of-week indexing changes

- **Month Indexing:** Changed from `0-11` to `1-12`. Increment all numeric months by 1.

- **Day-of-Week Indexing:** Support added for `7` as Sunday.

### Adjustments in `CronJob`

- The constructor no longer accepts an object as its first and only params. Use `CronJob.from(argsObject)` instead.
- Callbacks are now called in the order they were registered.
- `nextDates(count?: number)` now always returns an array (empty if no argument is provided). Use `nextDate()` instead for a single date.

### Removed methods

- removed `job()` method in favor of `new CronJob(...args)` / `CronJob.from(argsObject)`

- removed `time()` method in favor of `new CronTime()`

</details>

## 🛠 Basic Usage

```javascript
import { CronJob } from 'cron';
const job = new CronJob(
	'* * * * * *',
	function () {
		console.log('You will see this message every second');
	},
	null,
	true,
	'America/Los_Angeles'
);
// job.start() is optional here because of the fourth parameter set to true.
```

> **Note:** In the example above, the fourth parameter to `CronJob()` starts the job automatically. If not provided or set to falsy, you must explicitly start the job using `job.start()`.


For more advanced examples, check the [examples directory](https://github.com/kelektiv/node-cron/tree/main/examples).


## Cron Patterns
Cron patterns are the backbone of this library. Familiarize yourself with the syntax:

```
- `*` Asterisks: Any value
- `1-3,5` Ranges: Ranges and individual values
- `*/2` Steps: Every two units
```

Detailed patterns and explanations are available at [crontab.org](http://crontab.org). This library provides second-level granularity unlike many other cron libraries. Tools like [crontab.guru](https://crontab.guru/) can help in constructing patterns but remember to account for the seconds field.


### Supported Ranges

Here's a quick reference to the UNIX Cron format this library uses, plus an added second field:


```
field          allowed values
-----          --------------
second         0-59
minute         0-59
hour           0-23
day of month   1-31
month          1-12 (or names, see below)
day of week    0-7 (0 or 7 is Sunday, or use names)
```

> Names can also be used for the 'month' and 'day of week' fields. Use the first three letters of the particular day or month (case does not matter). Ranges and lists of names are allowed.  
> Examples: "mon,wed,fri", "jan-mar".

## Gotchas

- Both JS `Date` and Luxon `DateTime` objects don't guarantee millisecond precision due to computation delays. This module excludes millisecond precision for standard cron syntax but allows execution date specification through JS `Date` or Luxon `DateTime` objects. However, specifying a precise future execution time, such as adding a millisecond to the current time, may not always work due to these computation delays. It's observed that delays less than 4-5 ms might lead to inconsistencies. While we could limit all date granularity to seconds, we've chosen to allow greater precision but advise users of potential issues.

- Using arrow functions for `onTick` binds them to the parent's `this` context. As a result, they won't have access to the cronjob's `this` context. You can read a little more in issue [GH-47](https://github.com/kelektiv/node-cron/issues/47#issuecomment-459762775)

## API

### General Parameters

- `sendAt`: Indicates when a `CronTime` will execute.
  ```
  Example: 
  let time = cron.sendAt('0 0 * * *');
  console.log(`The job will run at: ${time}`);
  ```

- `timeout`: Indicates when the next timeout occurs.
  ```
  Example: 
  let timeLeft = cron.timeout();
  console.log(`The next timeout is in: ${timeLeft}ms`);
  ```

### CronJob Class

#### Constructor

`constructor(cronTime, onTick, onComplete, start, timeZone, context, runOnInit, utcOffset, unrefTimeout)`:

  - `cronTime`: [REQUIRED] - The time to fire off your job. Can be cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.
    ```
    Example:
    const job = new CronJob('0 0 * * *', () => {
      console.log('Job executed!');
    });
    ```

  - `onTick`: [REQUIRED] - Function to execute at the specified time. If provided, `onTick` can also receive an `onComplete` callback and might invoke it after its execution.
    ```
    Example:
    const onTickFunction = () => { console.log('Tick!'); };
    ```

  - `onComplete`: [OPTIONAL] - Invoked when the job is halted with `job.stop()`. It might also be triggered by `onTick` post its run.

  - `start`: [OPTIONAL] - Determines if the job should commence before constructor exit. Default is `false`.

  - `timeZone`: [OPTIONAL] - Sets the execution time zone. Default is local time. Check valid formats in the [Luxon documentation](https://github.com/moment/luxon/blob/master/docs/zones.md#specifying-a-zone).

  - `context`: [OPTIONAL] - Execution context for the onTick method.

  - `runOnInit`: [OPTIONAL] - Instantly triggers the `onTick` function post initialization. Default is `false`.

  - `utcOffset`: [OPTIONAL] - Specifies time zone offset in minutes. Cannot co-exist with `timeZone`.

  - `unrefTimeout`: [OPTIONAL] - Useful for controlling event loop behavior. More details [here](https://nodejs.org/api/timers.html#timers_timeout_unref).

#### Methods

- `from` (static): Create a new CronJob object providing arguments as an object.

- `start`: Initiates the job.
  
- `stop`: Halts the job.

- `setTime`: Modifies the time for the `CronJob`. Parameter must be a `CronTime`.

- `lastDate`: Provides the last execution date.

- `nextDate`: Indicates the subsequent date that will activate an `onTick`.

- `nextDates(count)`: Supplies an array of upcoming dates that will initiate an `onTick`.

- `fireOnTick`: Allows modification of the `onTick` calling behavior.

- `addCallback`: Permits addition of `onTick` callbacks.

### CronTime Class

#### Constructor

`constructor(time, zone, utcOffset)`:

  - `time`: [REQUIRED] - The time to initiate your job. Accepts cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.

  - `zone`: [OPTIONAL] - Equivalent to `timeZone` from `CronJob` parameters.

  - `utcOffset`: [OPTIONAL] - Analogous to `utcOffset` from `CronJob` parameters.



## 🤝 Community

Join the [Discord server](https://discord.gg/yyKns29zch)! Here you can discuss issues and get help in a more casual forum than GitHub.

## 🌍 Contributing

This project is looking for help! If you're interested in helping with the project, please take a look at our [contributing documentation](https://github.com/kelektiv/node-cron/blob/main/CONTRIBUTING.md).

### 🐛 Submitting Bugs/Issues

Please have a look at our [contributing documentation](https://github.com/kelektiv/node-cron/blob/main/CONTRIBUTING.md), it contains all the information you need to know before submitting an issue.

## 🙏 Acknowledgements

This is a community effort project. In the truest sense, this project started as an open source project from [cron.js](http://github.com/padolsey/cron.js) and grew into something else. Other people have contributed code, time, and oversight to the project. At this point there are too many to name here so we'll just say thanks.

Special thanks to [Hiroki Horiuchi](https://github.com/horiuchi), [Lundarl Gholoi](https://github.com/winup) and [koooge](https://github.com/koooge) for their work on the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) typings before they were imported in v2.4.0.

## License

MIT
