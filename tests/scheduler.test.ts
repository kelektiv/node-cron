import sinon from 'sinon';
import { CronJob, Scheduler, scheduler } from '../src';

describe('Scheduler', () => {
	let callback: jest.Mock;
	let localScheduler: Scheduler;

	beforeEach(() => {
		callback = jest.fn();
		localScheduler = new Scheduler();
		scheduler.clear();
	});

	afterEach(() => {
		expect.hasAssertions();
		localScheduler.clear();
		scheduler.clear();
		sinon.restore();
	});

	describe('schedule', () => {
		it('should create and register a job', () => {
			const job = localScheduler.schedule({
				name: 'test-job',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});

			expect(job.name).toBe('test-job');
			expect(localScheduler.getJob('test-job')).toBe(job);
			expect(localScheduler.getJobNames()).toEqual(['test-job']);
		});

		it('should throw when scheduling a duplicate name', () => {
			localScheduler.schedule({
				name: 'dup',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});

			expect(() =>
				localScheduler.schedule({
					name: 'dup',
					cronTime: '* * * * * *',
					onTick: callback,
					start: false
				})
			).toThrow('Job "dup" is already registered');
		});
	});

	describe('register', () => {
		it('should register an existing job explicitly', () => {
			const job = new CronJob('* * * * * *', callback, null, false);

			localScheduler.register('my-job', job);

			expect(job.name).toBe('my-job');
			expect(localScheduler.getJob('my-job')).toBe(job);
		});

		it('should throw on name mismatch', () => {
			const job = new CronJob(
				'* * * * * *',
				callback,
				null,
				false,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				'other-name'
			);

			expect(() => localScheduler.register('my-job', job)).toThrow(
				'Job name mismatch'
			);
		});

		it('should not auto-register jobs with a name only', () => {
			new CronJob(
				'* * * * * *',
				callback,
				null,
				false,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				'standalone'
			);

			expect(localScheduler.getJob('standalone')).toBeUndefined();
		});
	});

	describe('instance isolation', () => {
		it('should keep registries independent between instances', () => {
			const other = new Scheduler();

			localScheduler.schedule({
				name: 'local',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});

			expect(localScheduler.getJobNames()).toEqual(['local']);
			expect(other.getJobNames()).toEqual([]);

			other.clear();
		});
	});

	describe('execution tracking', () => {
		it('should track executions and use job.lastDate() for lastExecution', () => {
			const clock = sinon.useFakeTimers();

			localScheduler.schedule({
				name: 'counter',
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});

			expect(localScheduler.getJobInfo('counter').executions).toBe(0);
			expect(localScheduler.getJobInfo('counter').lastExecution).toBeNull();
			expect(localScheduler.getPending()).toEqual(['counter']);

			clock.tick(1000);

			const info = localScheduler.getJobInfo('counter');
			expect(callback).toHaveBeenCalledTimes(1);
			expect(info.executions).toBe(1);
			expect(info.lastExecution).toBeInstanceOf(Date);
			expect(localScheduler.getPending()).toEqual([]);

			localScheduler.stop('counter');
		});
	});

	describe('lifecycle', () => {
		it('should start and stop individual jobs', () => {
			const job = localScheduler.schedule({
				name: 'lifecycle',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});

			expect(job.isActive).toBe(false);
			localScheduler.start('lifecycle');
			expect(job.isActive).toBe(true);
			localScheduler.stop('lifecycle');
			expect(job.isActive).toBe(false);
		});

		it('should startAll and stopAll', () => {
			localScheduler.schedule({
				name: 'a',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});
			localScheduler.schedule({
				name: 'b',
				cronTime: '* * * * * *',
				onTick: callback,
				start: false
			});

			localScheduler.startAll();
			expect(localScheduler.getActiveJobs().sort()).toEqual(['a', 'b']);

			localScheduler.stopAll();
			expect(localScheduler.getInactiveJobs().sort()).toEqual(['a', 'b']);
		});

		it('should unregister without stopping the job', () => {
			const job = localScheduler.schedule({
				name: 'detach',
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});

			localScheduler.unregister('detach');

			expect(localScheduler.getJob('detach')).toBeUndefined();
			expect(job.isActive).toBe(true);

			job.stop();
		});

		it('should remove by stopping and unregistering', () => {
			const job = localScheduler.schedule({
				name: 'remove-me',
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});

			localScheduler.remove('remove-me');

			expect(localScheduler.getJob('remove-me')).toBeUndefined();
			expect(job.isActive).toBe(false);
		});

		it('should clear all jobs', () => {
			localScheduler.schedule({
				name: 'x',
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});
			localScheduler.schedule({
				name: 'y',
				cronTime: '* * * * * *',
				onTick: callback,
				start: true
			});

			localScheduler.clear();

			expect(localScheduler.getJobNames()).toEqual([]);
		});
	});

	describe('queries', () => {
		it('should return next execution dates', () => {
			localScheduler.schedule({
				name: 'next',
				cronTime: '0 * * * * *',
				onTick: callback,
				start: false
			});

			const next = localScheduler.nextJobs(2);
			expect(next.get('next')).toHaveLength(2);
		});

		it('should throw getJobInfo for unknown job', () => {
			expect(() => localScheduler.getJobInfo('missing')).toThrow(
				'Job "missing" not found'
			);
		});
	});
});
