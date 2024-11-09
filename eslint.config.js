import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import jest from 'eslint-plugin-jest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [
	...compat.extends(
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:@typescript-eslint/strict',
		'plugin:prettier/recommended'
	),
	{
		plugins: {
			'@typescript-eslint': typescriptEslintEslintPlugin
		},

		languageOptions: {
			globals: {
				...globals.node
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'module',

			parserOptions: {
				project: 'tsconfig.json'
			}
		},

		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_'
				}
			],

			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: ['typeLike'],
					format: ['PascalCase']
				},
				{
					selector: ['variableLike', 'function'],
					format: ['camelCase'],
					leadingUnderscore: 'allow'
				},
				{
					selector: ['variable'],
					format: ['camelCase', 'UPPER_CASE']
				},
				{
					selector: 'variable',
					types: ['boolean'],
					format: ['PascalCase'],
					prefix: ['is', 'should', 'has', 'can', 'did', 'was', 'will']
				}
			]
		}
	},
	...compat
		.extends('plugin:jest/recommended', 'plugin:jest/style')
		.map(config => ({
			...config,
			files: ['tests/**/*.ts']
		})),
	{
		files: ['tests/**/*.ts'],

		plugins: {
			jest
		},

		rules: {
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'jest/no-done-callback': 'off'
		}
	}
];
