A NodeJS fork of [jamespadolsey's](http://github.com/jamespadolsey) [cron.js](http://github.com/jamespadolsey/cron.js).

Usage:
==========

    var cron = require('cron'), sys = require('sys');
    new cron.CronJob('* * * * * *', function(){
        sys.puts('You will see this message every second');
    });
    
Available Cron patterns:
==========

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2
    
[Read up on cron patterns here](http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm).

Another example
==========

    var cron = require('cron'), sys = require('sys');
    new CronJob('00 30 11 * * 2-6', function(){
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
    });

How to check if a cron pattern is valid:
==========

		try {
			new cron.CronTime('invalid cron pattern', function() {
				sys.puts('this should not be printed');
			})
		} catch(ex) {
			sys.puts("cron pattern not valid");
		}

Install
==========
    From source: `sudo npm install`
    From npm: `sudo npm install cron`

Contributors
===========

* Nick Campbell
* Finn Herpich
* James Padolsey
* cliftonc
* Finn
* neyric
* humanchimp

License
==========

This is under a dual license, MIT and GPL. However, the author of cron.js hasn't specified which version of the GPL, once I know I'll update this project and the packaging files.


Trademarks?
============

Node.js™ is an official trademark of Joyent. This module is not formally related to or endorsed by the official Joyent Node.js open source or commercial project