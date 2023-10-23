import { ExclusiveParametersError } from '../../src/errors';

export function isCronError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error instanceof ExclusiveParametersError ||
			error.message === 'time must be an instance of CronTime.' ||
			error.message === 'Invalid timezone.' ||
			error.message === 'ERROR: You specified an invalid UTC offset.' ||
			error.message === 'WARNING: Date in past. Will never be fired.' ||
			error.message === 'ERROR: You specified an invalid date.' ||
			error.message.startsWith(
				'ERROR: This DST checking related function assumes the input DateTime'
			) ||
			error.message.startsWith(
				'ERROR: This DST checking related function assumes the forward jump starting hour'
			) ||
			error.message.startsWith('Unknown alias:') ||
			error.message === 'Too few fields' ||
			error.message === 'Too many fields' ||
			error.message.endsWith('has an invalid wildcard expression') ||
			error.message.endsWith('has a step of zero') ||
			error.message.endsWith('has an invalid range') ||
			error.message.endsWith('is out of range') ||
			error.message.endsWith('cannot be parsed'))
	);
}
