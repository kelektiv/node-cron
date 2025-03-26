/* eslint-disable jest/no-standalone-expect */
import { fc, test } from '@fast-check/jest';
import { CronJob } from '../src/job';
import { CronError } from '../src/errors';

/**
 * fuzzing might result in an infinite loop in our code, so Jest will simply timeout.
 * experimental worker implementation of ```@fast-check/jest``` could help detect that issue
 * that would be better as it would also give the counter-example that causes the bug
 * but since it is still experimental, simply uncomment the log line in testCronJob
 * function, so you can see the input causing the infinite loop.
 */
function testCronJob(
	{
		cronTime,
		start,
		timeZone,
		runOnInit,
		utcOffset,
		unrefTimeout,
		tzOrOffset
	}: {
		cronTime: string;
		start: boolean;
		timeZone: string;
		runOnInit: boolean;
		utcOffset: number;
		unrefTimeout: boolean;
		tzOrOffset: boolean;
	},
	checkError: (err: unknown) => boolean
) {
	// console.debug(
	// 	`${cronTime} | ${start} | ${timeZone} | ${runOnInit} | ${utcOffset} | ${unrefTimeout} | ${tzOrOffset}`
	// );
	try {
		const job = new CronJob(
			cronTime,
			function () {},
			null,
			start,
			(tzOrOffset ? timeZone : null) as typeof tzOrOffset extends true
				? string
				: null,
			null,
			runOnInit,
			(tzOrOffset ? null : utcOffset) as typeof tzOrOffset extends true
				? null
				: number,
			unrefTimeout
		);

		expect(job.isActive).toBe(start);
		job.stop();
		expect(job.isActive).toBe(false);

		expect(job.cronTime.source).toBe(cronTime);
	} catch (error) {
		const isOk = checkError(error);
		if (!isOk) {
			console.error(error);
			console.error(
				'Make sure the relevant code is using an instance of CronError (or derived) when throwing.'
			);
		}
		expect(isOk).toBe(true);
	}
}

test.prop(
	{
		cronTime: fc.stringMatching(/^(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ){5,6}$/),
		start: fc.boolean(),
		timeZone: fc.stringMatching(
			/^((?:Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])|(Africa\/Abidjan|Asia\/Singapore|Australia\/Sydney|CET|EST|Europe\/Paris|America\/New_York))$/
		),
		runOnInit: fc.boolean(),
		utcOffset: fc.integer(),
		unrefTimeout: fc.boolean(),
		tzOrOffset: fc.boolean()
	},
	{ numRuns: 100_000 }
)(
	'CronJob should behave as expected and not error unexpectedly (with matching inputs)',
	params => {
		testCronJob(params, err => err instanceof CronError);
	}
);

test.prop(
	{
		cronTime: fc.string(),
		start: fc.boolean(),
		timeZone: fc.string(),
		runOnInit: fc.boolean(),
		utcOffset: fc.integer(),
		unrefTimeout: fc.boolean(),
		tzOrOffset: fc.boolean()
	},
	{ numRuns: 100_000 }
)(
	'CronJob should behave as expected and not error unexpectedly (with random inputs)',
	params => {
		testCronJob(params, err => err instanceof CronError);
	}
);

test.prop(
	{
		cronTime: fc.anything(),
		start: fc.anything(),
		timeZone: fc.anything(),
		runOnInit: fc.anything(),
		utcOffset: fc.anything(),
		unrefTimeout: fc.anything(),
		tzOrOffset: fc.boolean()
	},
	{ numRuns: 100_000 }
)(
	'CronJob should behave as expected and not error unexpectedly (with anything inputs)',
	params => {
		testCronJob(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
			params as any,
			err => err instanceof CronError || err instanceof TypeError
		);
	}
);
