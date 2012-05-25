node-cron
=========

[![Build Status](https://secure.travis-ci.org/ncb000gt/node-cron.png)](http://travis-ci.org/#!/ncb000gt/node-cron) 

Originally this project was a NodeJS fork of [James Padolsey's][jamespadolsey] [cron.js](http://github.com/padolsey/cron.js).

After [Craig Condon][crcn] made some updates and changes to the code base this has evolved to something that has a bit of both. The cron syntax parsing is mostly James' while using timeout instead of interval is Craig's.

Additionally, this library goes beyond the basic cron syntax and allows you to supply a Date object. This will be used as the trigger for your callback. Cron syntax is still an acceptable CronTime format.

Usage (basic cron usage):
==========

    var cronJob = require('cron').CronJob;
    new cronJob('* * * * * *', function(){
        console.log('You will see this message every second');
    }, null, true, "America/Los_Angeles");
    

Available Cron patterns:
==========

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2
    
[Read up on cron patterns here](http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm).

Another cron example
==========

    var cronJob = require('cron').CronJob;
    var job = new cronJob('00 30 11 * * 2-6', function(){
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
      }, function () {
        // This function is executed when the job stops
      }, 
      true /* Start the job right now */,
      timeZone /* Time zone of this job. */
    );

Another example with Date
==========

    var cronJob = require('cron').CronJob;
    var job = new cronJob(new Date(), function(){
        //runs once at the specified date.
      }, function () {
        // This function is executed when the job stops
      }, 
      true /* Start the job right now */,
      timeZone /* Time zone of this job. */
    );

For good measure
==========

    var cronJob = require('cron').CronJob;
    var job = new cronJob({
      cronTime: '00 30 11 * * 2-6',
      onTick: function() {
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
      },
      start: false,
      timeZone: "America/Los_Angeles"
    });
    job.start();


How to check if a cron pattern is valid:
==========

		try {
			new cronJob('invalid cron pattern', function() {
				console.log('this should not be printed');
			})
		} catch(ex) {
			console.log("cron pattern not valid");
		}


Install
==========

    From source: `npm install`
    From npm: `npm install cron`

If you want to specify timezones, you'll need to install the [time](https://github.com/TooTallNate/node-time) module or place an entry for it in your package.json file.

    `npm install time`


API
==========

Parameter Based

`CronJob`

  * `constructor(cronTime, onTick, onComplete, start)` - Of note, the first parameter here can be a JSON object that has the below names and associated types (see examples above).
    * `cronTime` - [REQUIRED] - The time to fire off your job. This can be in the form of cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.
    * `onTick` - [REQUIRED] - The function to fire at the specified time.
    * `onComplete` - [OPTIONAL] - A function that will fire when the job is complete, when it is stopped.
    * `start` - [OPTIONAL] - Specifies whether to start the job after just before exiting the constructor.
  * `start` - Runs your job.
  * `stop` - Stops your job.

`CronTime`

  * `constructor(time)`
    * `time` - [REQUIRED] - The time to fire off your job. This can be in the form of cron syntax or a JS [Date](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date) object.

Contributors
===========

* [Romain Beauxis][toots]
* [James Padolsey][jamespadolsey]
* [Craig Condon][crcn]
* [Finn Herpich][errorprone]
* [cliftonc][cliftonc]
* [neyric][neyric]
* [humanchimp][humanchimp]
* [danhbear][danhbear]

License
==========

MIT


[toots]:http://github.com/toots
[jamespadolsey]:http://github.com/padolsey
[crcn]:http://github.com/crcn
[cliftonc]:http://github.com/cliftonc
[neyric]:http://github.com/neyric
[humanchimp]:http://github.com/humanchimp
[errorprone]:http://github.com/ErrorProne
[danhbear]:http://github.com/danhbear
