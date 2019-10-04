// TypeScript Version: 3.5.2

interface CronJobOptions {
	cronTime: string | Date | CronTime;
	onTick: () => void;
	onComplete?: () => void;
	context?: any;
	startNow?: boolean;
	timeZone?: string;
	runOnInit?: boolean;
	utcOffset?: number;
	unrefTimeout?: any;
}

interface CronTimeOptions {
	time: string | Date;
	zone?: string;
	utcOffset?: number;
}

export declare function job<T>(
	cronTime: string | Date | CronTime,
	onTick: () => void,
	onComplete?: () => void,
	context?: any,
	startNow?: boolean,
	timeZone?: string,
	runOnInit?: boolean,
	utcOffset?: number,
	unrefTimeout?: any): T;
export declare function time<T>(cronTime: string | Date, timeZone: string): T;
export declare function sendAt<T>(cronTime: string | Date): T;
export declare function timeout<T>(cronTime: string | Date): T;

declare class CronTime {
	constructor(time: string | Date, zone?: string, utcOffset?: number);

	_verifyParse(): void;

	sendAt<T>(i: number): T;

	getTimeout(): void;

	toString(): void;

	toJSON(): void;

	_getNextDateFrom(start: string | Date, zone: string): void;

	_findDST(date: string | Date): void;

	_wcOrAll(type: number): void;

	_hasAll(type: number): void;

	_parse(): void;

	_parseField(field: string, type: number, constraints: number[]): void;


}

declare class CronJob {
	constructor(
		cronTime: string | Date | CronTime,
		onTick: () => void,
		onComplete?: () => void,
		context?: any,
		startNow?: boolean,
		timeZone?: string,
		runOnInit?: boolean,
		utcOffset?: number,
		unrefTimeout?: any,
	);

	constructor(CronJobOptions: CronJobOptions);

	addCallback(): void;

	setTime(time: string | CronTime): void;

	nextDate(): void;

	fireOnTick(): void;

	start(): void;

	lastDate(): void;

	stop(): void;

}

export { CronJob, CronTime };
