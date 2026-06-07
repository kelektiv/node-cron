import { DateTime } from 'luxon';
import { CronJob } from './job';
import { JobRegistry } from './registry';
import { CronJobParams, CronOnCompleteCommand } from './types/cron.types';

export type ScheduleParams<
	OC extends CronOnCompleteCommand | null = null,
	C = null
> = CronJobParams<OC, C> & { name: string };

class Scheduler {
	private registry = new JobRegistry();

	/**
	 * creates a CronJob and registers it under the given name.
	 */
	schedule<OC extends CronOnCompleteCommand | null = null, C = null>(
		params: ScheduleParams<OC, C>
	): CronJob<OC, C> {
		const shouldStart = params.start ?? false;
		const shouldRunOnInit = params.runOnInit ?? false;
		const job = CronJob.from({ ...params, start: false, runOnInit: false });
		this.register(params.name, job);

		if (shouldRunOnInit) {
			job.lastExecution = new Date();
			void job.fireOnTick();
		}

		if (shouldStart) job.start();

		return job;
	}

	/**
	 * registers an existing CronJob. Registration is opt-in and never automatic.
	 */
	register<OC extends CronOnCompleteCommand | null = null, C = null>(
		name: string,
		job: CronJob<OC, C>
	): this {
		if (job.name != null && job.name !== name) {
			throw new Error(
				`Job name mismatch: expected "${name}", got "${job.name}"`
			);
		}

		job.name = name;
		this.registry.register(name, job);
		job.addCallback(() => this.registry.incrementExecutions(name));
		return this;
	}

	/**
	 * removes a job from the registry without stopping it.
	 */
	unregister(name: string): this {
		this.registry.remove(name);
		return this;
	}

	/**
	 * returns all registered job names.
	 */
	getJobNames(): string[] {
		return [...this.registry.getAll().keys()];
	}

	/**
	 * returns a specific job by name.
	 */
	getJob(name: string): CronJob | undefined {
		return this.registry.get(name)?.job;
	}

	/**
	 * returns detailed information about a specific job by name.
	 */
	getJobInfo(name: string) {
		const entry = this.registry.get(name);
		if (!entry) throw new Error(`Job "${name}" not found`);
		return {
			name,
			executions: entry.executions,
			lastExecution: entry.job.lastDate(),
			isActive: entry.job.isActive,
			nextExecution: entry.job.nextDate(),
			createdAt: entry.createdAt
		};
	}

	/**
	 * returns names of jobs that are currently active (running).
	 */
	getActiveJobs(): string[] {
		return [...this.registry.getAll().entries()]
			.filter(([, entry]) => entry.job.isActive)
			.map(([name]) => name);
	}

	/**
	 * returns names of jobs that are currently inactive (stopped).
	 */
	getInactiveJobs(): string[] {
		return [...this.registry.getAll().entries()]
			.filter(([, entry]) => !entry.job.isActive)
			.map(([name]) => name);
	}

	/**
	 * returns names of jobs that have never been executed.
	 */
	getPending(): string[] {
		return [...this.registry.getAll().entries()]
			.filter(([, entry]) => entry.job.lastDate() === null)
			.map(([name]) => name);
	}

	/**
	 * returns the next execution dates for all registered jobs.
	 */
	nextJobs(count = 1): Map<string, DateTime | DateTime[]> {
		const result = new Map<string, DateTime | DateTime[]>();

		for (const [name, entry] of this.registry.getAll()) {
			result.set(name, entry.job.nextDates(count));
		}

		return result;
	}

	start(name: string): this {
		const entry = this.registry.get(name);
		if (!entry) throw new Error(`Job "${name}" not found`);
		entry.job.start();
		return this;
	}

	stop(name: string): this {
		const entry = this.registry.get(name);
		if (!entry) throw new Error(`Job "${name}" not found`);
		entry.job.stop();
		return this;
	}

	startAll(): this {
		for (const { job } of this.registry.getAll().values()) job.start();
		return this;
	}

	stopAll(): this {
		for (const { job } of this.registry.getAll().values()) job.stop();
		return this;
	}

	/**
	 * stops a job and removes it from the registry.
	 */
	remove(name: string): this {
		const entry = this.registry.get(name);
		if (entry) {
			entry.job.stop();
			this.registry.remove(name);
		}
		return this;
	}

	clear(): this {
		for (const { job } of this.registry.getAll().values()) job.stop();
		this.registry.clear();
		return this;
	}
}

const scheduler = new Scheduler();

export { Scheduler, scheduler };
