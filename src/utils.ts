import { Ranges } from './types/cron.types';

export const getRecordKeys = <K extends Ranges[keyof Ranges]>(
	record: Record<K, boolean>
) => {
	return Object.keys(record) as unknown as (keyof typeof record)[];
};
