import { validateCronExpression } from '../dist/index.js';

console.log('is valid? ', validateCronExpression('NOT VALID').valid);
