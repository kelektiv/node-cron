const CronJob = require('../dist').CronJob;

try {
	new CronJob('NOT VALID', () => {
		console.log("shouldn't get printed");
	});
} catch (e) {
	console.log('omg err', e);
}
