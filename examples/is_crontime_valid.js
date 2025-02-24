import { validateCronExpression } from '../src';

console.log('is valid? ', validateCronExpression('NOT VALID').valid);
