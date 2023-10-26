export class CronError extends Error {}

export class ExclusiveParametersError extends CronError {
	constructor(param1: string, param2: string) {
		super(`You can't specify both ${param1} and ${param2}`);
	}
}
