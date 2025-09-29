export const CONSTRAINTS = Object.freeze({
	second: [0, 59],
	minute: [0, 59],
	hour: [0, 23],
	dayOfMonth: [1, 31],
	month: [1, 12],
	dayOfWeek: [0, 7]
} as const);
export const PARSE_DEFAULTS = Object.freeze({
	second: '0',
	minute: '*',
	hour: '*',
	dayOfMonth: '*',
	month: '*',
	dayOfWeek: '*'
} as const);
export const ALIASES = Object.freeze({
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	may: 5,
	jun: 6,
	jul: 7,
	aug: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dec: 12,
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
	l: 'l'
} as const);
export const TIME_UNITS_MAP = Object.freeze({
	SECOND: 'second',
	MINUTE: 'minute',
	HOUR: 'hour',
	DAY_OF_MONTH: 'dayOfMonth',
	MONTH: 'month',
	DAY_OF_WEEK: 'dayOfWeek'
} as const);
export const TIME_UNITS = Object.freeze(Object.values(TIME_UNITS_MAP)) as [
	'second',
	'minute',
	'hour',
	'dayOfMonth',
	'month',
	'dayOfWeek'
];
export const TIME_UNITS_LEN: number = TIME_UNITS.length;
export const PRESETS = Object.freeze({
	'@yearly': '0 0 0 1 1 *',
	'@monthly': '0 0 0 1 * *',
	'@weekly': '0 0 0 * * 0',
	'@daily': '0 0 0 * * *',
	'@hourly': '0 0 * * * *',
	'@minutely': '0 * * * * *',
	'@secondly': '* * * * * *',
	'@weekdays': '0 0 0 * * 1-5',
	'@weekends': '0 0 0 * * 0,6'
} as const);
export const RE_WILDCARDS = /\*/g;
export const RE_RANGE = /^(\d+)(?:-(\d+))?(?:\/(\d+))?$/g;
export const RE_QUESTIONMARK = /\?/g;
export const RE_L = /[lL]/g;
