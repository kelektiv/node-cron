import sinon from 'sinon';

import { CronJob } from '../src';

describe('suspend/resume handling (#671)', () => {
	let callback: jest.Mock;

	beforeEach(() => {
		callback = jest.fn();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should not arm a single setTimeout for a long wait', () => {
		const job = CronJob.from({
			cronTime: '0 13 * * *',
			onTick: callback,
			start: false
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(3600000);

		const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

		job.start();

		expect(setTimeoutSpy).toHaveBeenCalled();
		const delays = setTimeoutSpy.mock.calls.map(call => Number(call[1]));
		// the wait must be slept in short chunks, never as one long
		// setTimeout that a system suspend would pause for its whole
		// remaining duration
		expect(Math.max(...delays)).toBeLessThan(3600000);
		expect(Math.max(...delays)).toBeLessThanOrEqual(60000);

		job.stop();
		setTimeoutSpy.mockRestore();
	});

	it('should fire promptly after resume when a suspend spans the deadline', () => {
		const job = CronJob.from({
			cronTime: '0 13 * * *',
			onTick: callback,
			start: false
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(3600000);

		// fake only the timers: the wall clock (Date.now) keeps its own
		// timeline, which this test advances manually to simulate a
		// suspend, during which timers are paused while wall time
		// moves forward
		const clock = sinon.useFakeTimers({
			toFake: ['setTimeout', 'clearTimeout']
		});

		let wallNow = 1700000000000;
		sinon.stub(Date, 'now').callsFake(() => wallNow);

		job.start();

		// timers advance one chunk while the machine is awake; the job
		// is not due yet
		clock.tick(60000);
		expect(callback).not.toHaveBeenCalled();

		// the machine suspends past the deadline and then resumes: wall
		// time is now past the scheduled time, while the timer that was
		// pending when it suspended only had a short chunk left to run
		wallNow += 3660000;
		clock.tick(60000);

		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
		clock.restore();
	});

	it('should still fire at the scheduled wall-clock time after a suspend that ends before the deadline', () => {
		const job = CronJob.from({
			cronTime: '0 13 * * *',
			onTick: callback,
			start: false
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(3600000);

		const clock = sinon.useFakeTimers({
			toFake: ['setTimeout', 'clearTimeout']
		});

		let wallNow = 1700000000000;
		sinon.stub(Date, 'now').callsFake(() => wallNow);

		job.start();

		clock.tick(60000);
		expect(callback).not.toHaveBeenCalled();

		// the machine suspends for 50 minutes and resumes 10 minutes
		// before the deadline; the pending chunk timer fires after the
		// resume and the remaining wait is recomputed from the wall
		// clock instead of trusting the paused timer
		wallNow += 3000000;
		clock.tick(60000);
		expect(callback).not.toHaveBeenCalled();

		// the wall clock reaches the deadline; only one more chunk of
		// timer time is needed for the job to fire on schedule
		wallNow += 600000;
		clock.tick(60000);

		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
		clock.restore();
	});
});
