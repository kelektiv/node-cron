/**
 * Exemplo simples do Scheduler.
 *
 * Para testes isolados com validação automática, veja:
 *   examples/scheduler/
 *
 * Rodar todos: node examples/scheduler/run-all.mjs
 */

import { scheduler } from '../dist/index.js';

const MAX = 5;
let n = 0;

scheduler.schedule({
	name: 'example',
	cronTime: '*/2 * * * * *',
	onTick() {
		n++;
		console.log(`[${n}/${MAX}]`, scheduler.getJobInfo('example'));
		if (n >= MAX) {
			scheduler.remove('exemplo');
			process.exit(0);
		}
	},
	start: true,
	timeZone: 'America/Sao_Paulo'
});

process.on('SIGINT', () => {
	scheduler.clear();
	process.exit(0);
});

console.log('Jobs:', scheduler.getJobNames());
