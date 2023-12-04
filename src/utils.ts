import { Ranges } from './types/cron.types';
import { ExclusiveParametersError } from './errors';
import { CronJobParams, CronOnCompleteCommand } from './types/cron.types';
import { ExclusiveTimezoneOrUtcOffset } from './types/utils'

export const getRecordKeys = <K extends Ranges[keyof Ranges]>(
	record: Partial<Record<K, boolean>>
) => {
	return Object.keys(record) as unknown as (keyof typeof record)[];
};


export const getExclusiveTimezoneOrUtcOffset = <OC extends CronOnCompleteCommand, C>(
    timeZone?: CronJobParams<OC, C>['timeZone'],
    utcOffset?: CronJobParams<OC, C>['utcOffset']
): { timeZone: string | null | undefined, utcOffset: number | null | undefined } => {
    if (timeZone != null && utcOffset != null) {
        throw new ExclusiveParametersError('timeZone', 'utcOffset');
    }

    return {
        timeZone: timeZone ?? null,
        utcOffset: utcOffset ?? null
    };
};