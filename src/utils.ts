import { ExclusiveParametersError } from './errors';
import { Ranges } from './types/cron.types';

export const getRecordKeys = <K extends Ranges[keyof Ranges]>(
	record: Partial<Record<K, boolean>>
) => {
	return Object.keys(record) as unknown as (keyof typeof record)[];
};

export const getTimeZoneAndOffset = (
	timeZone?: string | null,
	utcOffset?: number | null
) => {
	if (timeZone != null && utcOffset != null) {
		throw new ExclusiveParametersError('timeZone', 'utcOffset');
	}

	if (timeZone != null) {
		return { timeZone, utcOffset: null };
	} else if (utcOffset != null) {
		return { timeZone: null, utcOffset };
	} else {
		return { timeZone: null, utcOffset: null };
	}
};
