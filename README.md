A NodeJS fork of [jamespadolsey's](http://github.com/jamespadolsey) [cron.js](http://github.com/jamespadolsey/cron.js).

Usage:

    var cron = require('cron'), sys = require('sys');
    new cron.CronJob('* * * * * *', function(){
        sys.puts('You will see this message every second');
    });
    
Available Cron patterns:

    Asterisk. E.g. *
    Ranges. E.g. 1-3,5
    Steps. E.g. */2
    
[Read up on cron patterns here](http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm).

Another example:

    var cron = require('cron'), sys = require('sys');
    new CronJob('00 30 11 * * 2-6', function(){
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
    });

Install:

    make install

Uninstall:

    make uninstall