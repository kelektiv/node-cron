import sinon from 'sinon';
import { CronJob } from '../src';

describe('threshold behavior', () => {
	let callback: jest.Mock;
	let warnSpy: jest.SpyInstance;

	beforeEach(() => {
		callback = jest.fn();
		warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		sinon.restore();
		warnSpy.mockRestore();
	});

	it('should call the callback the correct amount of times', () => {
		const EVERY = 5;
		const TICK = EVERY * 1000;
		const DELAY = 350;

		const job = CronJob.from({
			cronTime: `*/${EVERY} * * * * *`,
			onTick: callback,
			start: false,
			threshold: 350
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(TICK)
			.onCall(1)
			.returns(-DELAY)
			// => 1st assertion (delay simulated)
			.onCall(2)
			.returns(TICK)
			.onCall(3)
			.returns(TICK)
			// => 2nd assertion (no delay simulated)
			.onCall(4)
			.returns(-DELAY)
			.onCall(5)
			.returns(TICK);
		// => 3rd assertion (delay simulated)
		// => 4th assertion (scheduled during the previous iteration)

		const clock = sinon.useFakeTimers();

		job.start();

		clock.tick(TICK);
		// 2 calls: 1 from the initial scheduled execution, 1 from the immediate execution
		expect(callback).toHaveBeenCalledTimes(2);

		clock.tick(TICK);
		// 1 call: no delay simulated
		expect(callback).toHaveBeenCalledTimes(3);

		clock.tick(TICK);
		// 2 calls: 1 from the scheduled execution, 1 from the immediate execution
		expect(callback).toHaveBeenCalledTimes(5);

		clock.tick(TICK);
		// 1 call: no delay simulated
		expect(callback).toHaveBeenCalledTimes(6);

		expect(job.isActive).toBe(true);
		job.stop();
	});

	it('should execute job immediately on start if negative timeout is within threshold', () => {
		const job = CronJob.from({
			cronTime: '*/5 * * * * *',
			onTick: callback,
			start: false,
			threshold: 300,
			name: 'test-job'
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(-100)
			.onCall(1)
			.returns(5000);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		expect(callback).toHaveBeenCalledTimes(1);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 100ms');
		expect(message).toContain('Executing immediately');

		job.stop();
	});

	it('should execute job immediately if negative timeout is within threshold', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			threshold: 300,
			name: 'test-job'
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(1000)
			.onCall(1)
			.returns(-50);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		// 2 calls: 1 from the initial scheduled execution, 1 from the immediate execution
		expect(callback).toHaveBeenCalledTimes(2);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 50ms');
		expect(message).toContain('Executing immediately');

		job.stop();
	});

	it('should skip immediate execution if negative timeout exceeds threshold', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			threshold: 100,
			name: 'test-job'
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(1000)
			.onCall(1)
			.returns(-200);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		// 1 call from the initial scheduled execution
		expect(callback).toHaveBeenCalledTimes(1);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 200ms');
		expect(message).toContain('Skipping execution as it exceeds threshold');

		job.stop();
	});

	it('should use 250ms as default threshold', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			name: 'test-job'
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(1000)
			.onCall(1)
			.returns(-250);
		sinon.stub(job.cronTime, 'source').value('test-cron-expression');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		expect(callback).toHaveBeenCalledTimes(2);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 250ms');
		expect(message).toContain('Executing immediately');

		job.stop();
	});

	it('should properly identify named jobs in logs', () => {
		const jobName = 'test-named-job';
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			threshold: 250,
			name: jobName
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(1000)
			.onCall(1)
			.returns(-500);
		sinon.stub(job.cronTime, 'source').value('test-cron-expression');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		expect(callback).toHaveBeenCalledTimes(1);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 500ms');
		expect(message).toContain(`job "${jobName}" with cron expression`);
		expect(message).toContain('test-cron-expression');

		job.stop();
	});

	it('should properly identify unnamed jobs in logs', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			threshold: 250
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(1000)
			.onCall(1)
			.returns(-500);
		sinon.stub(job.cronTime, 'source').value('test-cron-expression');

		const clock = sinon.useFakeTimers();
		job.start();
		clock.tick(1000);

		expect(callback).toHaveBeenCalledTimes(1);
		const message = warnSpy.mock.calls[0][0];
		expect(message).toContain('Missed execution deadline by 500ms');
		expect(message).toContain('for job with cron expression');
		expect(message).toContain('test-cron-expression');

		job.stop();
	});
});
