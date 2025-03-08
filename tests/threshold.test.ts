/*
	This file tests the threshold behavior of CronJob by simulating negative timeouts using stubs.
	The tests verify that a job is executed immediately or skipped based on the threshold, and that log messages correctly report the behavior.
*/

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
		warnSpy.mockRestore();
		sinon.restore();
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
			.returns(-50)
			.onCall(1)
			.returns(1000);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		job.start();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Executing job "test-job"')
		);
		job.stop();
	});

	it('should skip job if negative timeout exceeds threshold', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			threshold: 100,
			name: 'test-job'
		});

		sinon.stub(job.cronTime, 'getTimeout').returns(-200);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		job.start();

		expect(callback).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Skipping execution for job "test-job"')
		);
		job.stop();
	});

	it('should use default threshold of 250ms if not specified', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false,
			name: 'test-job'
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(-100)
			.onCall(1)
			.returns(1000);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		job.start();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Executing job "test-job"')
		);
		job.stop();
	});

	it('should properly identify unnamed jobs in logs', () => {
		const job = CronJob.from({
			cronTime: '* * * * * *',
			onTick: callback,
			start: false
		});

		sinon
			.stub(job.cronTime, 'getTimeout')
			.onCall(0)
			.returns(-75)
			.onCall(1)
			.returns(1000);
		sinon.stub(job.cronTime, 'source').value('test-cron');

		job.start();

		expect(callback).toHaveBeenCalledTimes(1);
		const logMessage = warnSpy.mock.calls[0][0];
		// For unnamed jobs, the log should not include a quoted job name
		expect(logMessage).not.toMatch(/job\s+".+"/);
		job.stop();
	});
});
