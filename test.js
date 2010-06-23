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