export class CronError extends Error {}

export class ExclusiveParametersError extends CronError {
	constructor(param1: string, param2: string) {
		super(`You can't specify both ${param1} and ${param2}`);
	}
}

/*
 * runtime guard ensuring `timeZone` and `utcOffset` are not both provided.
 *
 * `timeZone` and `utcOffset` are mutually exclusive: TypeScript users get this
 * enforced at compile time via the discriminated `CronJobParams` union, but
 * plain JavaScript users (or `// @ts-ignore`d call sites) need a runtime check
 * as well. Centralizing it here keeps the `CronJob` constructor, `CronJob.from`,
 * and `CronTime` constructor all throwing the same error for the same input.
 */
export const assertExclusiveTimeZoneAndUtcOffset = (
	timeZone?: string | null,
	utcOffset?: number | null
): void => {
	if (timeZone != null && utcOffset != null) {
		throw new ExclusiveParametersError('timeZone', 'utcOffset');
	}
};
