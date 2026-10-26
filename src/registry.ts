import { CronJob } from './job';
import { CronOnCompleteCommand } from './types/cron.types';

interface RegistryEntry<
	OC extends CronOnCompleteCommand | null = null,
	C = null
> {
	job: CronJob<OC, C>;
	createdAt: Date;
	executions: number;
}

class JobRegistry {
	private _jobs = new Map<string, RegistryEntry<any, any>>();

	register<OC extends CronOnCompleteCommand | null = null, C = null>(
		name: string,
		job: CronJob<OC, C>
	): void {
		if (this._jobs.has(name)) {
			throw new Error(`Job "${name}" is already registered`);
		}

		this._jobs.set(name, {
			job,
			createdAt: new Date(),
			executions: 0
		});
	}

	incrementExecutions(name: string): void {
		const entry = this._jobs.get(name);
		if (entry) entry.executions++;
	}

	getAll(): Map<string, RegistryEntry<any, any>> {
		return new Map(this._jobs);
	}

	get(name: string): RegistryEntry<any, any> | undefined {
		return this._jobs.get(name);
	}

	has(name: string): boolean {
		return this._jobs.has(name);
	}

	remove(name: string): boolean {
		return this._jobs.delete(name);
	}

	clear(): void {
		this._jobs.clear();
	}
}

export { JobRegistry };
export type { RegistryEntry };
