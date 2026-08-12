import sinon from 'sinon';
import { CronJob } from '../src';

describe('randomizedDelaySec behavior', () => {
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

	it('should not add any delay when randomizedDelaySec is not set', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(1000);

		const clock = sinon.useFakeTimers();
		job.start();

		clock.tick(999);
		expect(callback).toHaveBeenCalledTimes(0);

		clock.tick(1);
		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
	});

	it('should delay execution by a random amount within randomizedDelaySec', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			randomizedDelaySec: 10
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(1000);
		sinon.stub(Math, 'random').returns(0.5);

		const clock = sinon.useFakeTimers();
		job.start();

		// base (1000ms) + jitter (0.5 * 10 * 1000 = 5000ms) = 6000ms
		clock.tick(5999);
		expect(callback).toHaveBeenCalledTimes(0);

		clock.tick(1);
		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
	});

	it('should apply a fresh random delay on each execution cycle', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			randomizedDelaySec: 10
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(1000);
		const randomStub = sinon.stub(Math, 'random');
		randomStub.onCall(0).returns(0.2); // first cycle: 1000 + 2000 = 3000ms
		randomStub.onCall(1).returns(0.8); // second cycle: 1000 + 8000 = 9000ms

		const clock = sinon.useFakeTimers();
		job.start();

		clock.tick(3000);
		expect(callback).toHaveBeenCalledTimes(1);

		clock.tick(8999);
		expect(callback).toHaveBeenCalledTimes(1);

		clock.tick(1);
		expect(callback).toHaveBeenCalledTimes(2);

		job.stop();
	});

	it('should treat randomizedDelaySec of 0 the same as unset', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			randomizedDelaySec: 0
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(1000);

		const clock = sinon.useFakeTimers();
		job.start();

		clock.tick(999);
		expect(callback).toHaveBeenCalledTimes(0);

		clock.tick(1);
		expect(callback).toHaveBeenCalledTimes(1);

		job.stop();
	});
});
