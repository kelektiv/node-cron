import { SpawnOptions } from 'child_process';
import { DateTime } from 'luxon';

export interface CronJobParams {
	cronTime: string | Date | DateTime;
	onTick: CronCommand;
	onComplete?: CronCommand | null | undefined;
	start?: boolean | undefined;
	timeZone?: string | undefined;
	context?: any;
	runOnInit?: boolean | undefined;
	utcOffset?: string | number | undefined;
	unrefTimeout?: boolean | undefined;
}

export type CronCommand =
	| (() => void)
	| string
	| {
			command: string;
			args?: ReadonlyArray<string> | undefined;
			options?: SpawnOptions | undefined;
	  };
