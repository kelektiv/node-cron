// regression test, drafted by TimeWraith: Raven Archivist's reproduction, rerun by code before it was accepted.
// failed on kelektiv/node-cron@d78efd34af3c at 2027-04-03T15:00:00.000Z, 2027-04-03T15:00:00.000Z. Run with TZ=America/Los_Angeles.

class RetrySetupError extends Error {}
async function clockJumpTrace(schedule, direction) {
	if (
		typeof jest.advanceTimersByTimeAsync !== 'function' ||
		typeof globalThis.performance?.now !== 'function'
	)
		throw new RetrySetupError('Virtual elapsed clock unavailable');
	const shifts = { none: 0, forward: 3600000, backward: -3600000 };
	if (!Object.hasOwn(shifts, direction))
		throw new RetrySetupError('Unknown wall clock shift');
	const start = Date.now();
	const origin = performance.now();
	const elapsed = () => performance.now() - origin;
	const trace = [];
	try {
		schedule(() => {
			if (trace.length < 8) trace.push(elapsed());
		}, 10);
		await jest.advanceTimersByTimeAsync(4);
		if (direction !== 'none') jest.setSystemTime(start + 4 + shifts[direction]);
		if (elapsed() !== 4 || Date.now() !== start + 4 + shifts[direction])
			throw new RetrySetupError(
				'Runner cannot independently control wall and elapsed time'
			);
		await jest.advanceTimersByTimeAsync(27);
		if (elapsed() !== 31)
			throw new RetrySetupError('Elapsed clock did not advance as requested');
		return trace;
	} finally {
		jest.clearAllTimers();
		jest.setSystemTime(start);
	}
}
async function clockJumps(schedule) {
	const control = await clockJumpTrace(schedule, 'none');
	if (control.length !== 1 || control[0] !== 10)
		throw new RetrySetupError('Unshifted timer must fire once at 10 ms');
	return {
		forward: await clockJumpTrace(schedule, 'forward'),
		backward: await clockJumpTrace(schedule, 'backward')
	};
}
async function atClock(shiftMs, fn) {
	const real = Date.now();
	try {
		jest.setSystemTime(real + shiftMs);
		return await fn();
	} finally {
		jest.setSystemTime(real);
	}
}
async function expiryTrace(create, isExpired) {
	if (typeof jest.advanceTimersByTimeAsync !== 'function')
		throw new RetrySetupError('Async fake timers unavailable');
	const start = Date.now();
	try {
		const item = await create(start + 1000);
		const states = [];
		for (const step of [999, 1, 1]) {
			await jest.advanceTimersByTimeAsync(step);
			const expired = await isExpired(item);
			if (typeof expired !== 'boolean')
				throw new RetrySetupError('Expiry check must return a boolean');
			states.push(expired);
		}
		return states;
	} finally {
		jest.clearAllTimers();
		jest.setSystemTime(start);
	}
}
async function timerTrace(schedule) {
	if (typeof jest.advanceTimersByTimeAsync !== 'function')
		throw new RetrySetupError('Async fake timers unavailable');
	const start = Date.now();
	const trace = [];
	try {
		schedule(() => {
			if (trace.length < 8) trace.push(Date.now() - start);
		}, 10);
		await jest.advanceTimersByTimeAsync(31);
		return trace;
	} finally {
		jest.clearAllTimers();
		jest.setSystemTime(start);
	}
}
async function retryCalls(schedule, cancel) {
	if (typeof jest.advanceTimersByTimeAsync !== 'function')
		throw new RetrySetupError('Async fake timers unavailable');
	let calls = 0;
	const stop = schedule(() => {
		calls += 1;
	}, 10);
	if (typeof stop !== 'function')
		throw new RetrySetupError(
			'Retry adapter must return a cancellation function'
		);
	await jest.advanceTimersByTimeAsync(9);
	if (calls !== 0)
		throw new RetrySetupError('Retry fired before the cancellation step');
	if (cancel) await stop();
	await jest.advanceTimersByTimeAsync(11);
	return calls;
}
async function cancelledRetry(schedule) {
	const start = Date.now();
	try {
		if ((await retryCalls(schedule, false)) !== 1)
			throw new RetrySetupError('Uncancelled retry must fire once');
		jest.clearAllTimers();
		jest.setSystemTime(start);
		return await retryCalls(schedule, true);
	} finally {
		jest.clearAllTimers();
		jest.setSystemTime(start);
	}
}

function print(..._args: unknown[]): void {}
function check(cond: unknown, msg?: string): void {
	const rule = String(msg || 'check');
	expect({ rule, holds: Boolean(cond) }).toEqual({ rule, holds: true });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(p: string): Promise<any> {
	return require('../' + String(p).replace(/^\/+/, ''));
}

test('getNextDateFrom returns a time before start inside a repeated DST hour when the system clock is befo', async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(1806764400000));
	const now = new Date(1806764400000); // the same `now` the probe had
	try {
		const m = await load('src/time');
		const z = 'Australia/Lord_Howe';
		const s = new Date();
		const call = () =>
			new m.CronTime('0 */15 * * * *')
				.getNextDateFrom(new Date(s.getTime()), z)
				.toMillis();
		const a = call();
		const b = await atClock(-30 * 86400000, async () => call());
		check(b === a && b > s.getTime(), 'clock independent and after start');
	} finally {
		jest.useRealTimers();
	}
}, 60000);

test('getNextDateFrom returns a time before start inside a repeated DST hour (through the public API)', async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(1806764400000));
	const now = new Date(1806764400000); // the same `now` the probe had
	try {
		const j = await load('src/job');
		const job = new j.CronJob(
			'0 */15 * * * *',
			() => {},
			null,
			false,
			'Australia/Lord_Howe'
		);
		const r = await atClock(-30 * 86400000, async () =>
			job.nextDates(4000).map(d => d.toMillis())
		);
		let bad = 0;
		for (let i = 1; i < r.length; i++) if (r[i] <= r[i - 1]) bad++;
		check(bad === 0, 'nextDates strictly increasing');
	} finally {
		jest.useRealTimers();
	}
}, 60000);
