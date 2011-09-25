node-cron
=========

Originally this projet was a NodeJS fork of [James Padolsey's][jamespadolsey] [cron.js](http://github.com/jamespadolsey/cron.js).

After [Craig Condon][spiceapps] made some updates and changes to the code base this has evolved to something that has a bit of both. The cron syntax parsing is mostly James' while using timeout instead of interval is Craig's.

Additionally, this library goes beyond the basic cron syntax and allows you to supply a Date object. This will be used as the trigger for your callback. Cron syntax is still an acceptable CronTime format.

Usage:
==========

    var cronJob = require('cron');
    cronJob('* * * * * *', function(){
        console.log('You will see this message every second');
    });
    

Available Cron patterns:
==========

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2
    
[Read up on cron patterns here](http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm).

Another example
==========

    var cronJob = require('cron');
   cronJob('00 30 11 * * 2-6', function(){
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
    });

How to check if a cron pattern is valid:
==========

		try {
			cronJob('invalid cron pattern', function() {
				console.log('this should not be printed');
			})
		} catch(ex) {
			console.log("cron pattern not valid");
		}

Install
==========
    From source: `sudo npm install`
    From npm: `sudo npm install cron`

Contributors
===========

* [James Padolsey][jamespadolsey]
* [Craig Condon][spiceapps]
* [Finn Herpich][errorprone]
* [cliftonc][cliftonc]
* [neyric][neyric]
* [humanchimp][humanchimp]

License
==========

MIT


[jamespadolsey]:http://github.com/jamespadolsey
[spiceapps]:http://github.com/spiceapps
[cliftonc]:http://github.com/cliftonc
[neyric]:http://github.com/neyric
[humanchimp]:http://github.com/humanchimp
[errorprone]:http://github.com/ErrorProne
