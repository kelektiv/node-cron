var cron = require('./src/cron'),
sys = require('sys');

new cron.CronJob('00 * * * * *', function(){
    sys.puts(new Date() + ' You will see this message when the seconds are zero');
});

new cron.CronJob('*/5 * * * * *', function(){
    sys.puts(new Date() + ' You will see this message every five seconds ');
});

new cron.CronJob('10-20 * * * * *', function(){
    sys.puts(new Date() + ' You will see this message from seconds ten through twenty ');
});

try {
    new cron.CronJob('*/2 * * * j sun-sat', function(){
        sys.puts(new Date() + ' You will see this message every two seconds, and validates that the aliases work.');
    });
} catch(ex) {
    sys.puts("cron pattern not valid: ", ex.message);
}

new cron.CronJob('*/2 * * * jan-dec sun-sat', function(){
  sys.puts(new Date() + ' You will see this message every two seconds, and validates that the aliases work.');
});

// How to check if a cron pattern is valid
try {
	new cron.CronTime('invalid cron pattern', function() {
		sys.puts('this should not be printed');
	})
} catch(ex) {
	sys.puts("cron pattern not valid: ", ex.message);
}
