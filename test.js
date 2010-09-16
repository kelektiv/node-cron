var cron = require('cron'),
sys = require('sys');

new cron.CronJob('00 * * * * *', function(){
    sys.puts('You will see this message when the seconds are zero');
});

new cron.CronJob('*/5 * * * * *', function(){
    sys.puts('You will see this message every five seconds');
});

new cron.CronJob('10-20 * * * * *', function(){
    sys.puts('You will see this message from seconds ten through twenty');
});

// How to check if a cron pattern is valid
try {
	new cron.CronTime('invalid cron pattern', function() {
		sys.puts('this should not be printed');
	})
} catch(ex) {
	sys.puts("cron pattern not valid: ", ex.message);
}
