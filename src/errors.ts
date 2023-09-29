export class ExclusiveParametersError extends Error {
	constructor(param1: string, param2: string) {
		super(`You can't specify both ${param1} and ${param2}`);
	}
}
