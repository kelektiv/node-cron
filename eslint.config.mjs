import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import jest from 'eslint-plugin-jest';
import js from '@eslint/js';

export default [
	// using .mjs for module support as TypeScript Eslint configs are still experimental
	{
		name: 'Eslint config file',
		files: ['eslint.config.mjs'],
		// ...tseslint.configs.disableTypeChecked,
		// ...js.configs.recommended,

		languageOptions: {
			sourceType: 'module',
			parserOptions: {
				// project: 'package.json'
			}
		}
	},

	{
		name: 'general project rules',
		files: ['**/*.ts'],

		plugins: {
			'@typescript-eslint': tseslint.plugin
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
			// contains all of recommended, recommended-type-checked, and strict
			...tseslint.configs.strictTypeChecked.rules,
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
			],
			// this is set to warn because it wasn't caught before the eslint migration in 11/2024
			'@typescript-eslint/restrict-template-expressions': 'warn',
			'capitalized-comments': ['error', 'never']
		}
	},

	{
		name: 'test rules',
		files: ['tests/**/*.ts'],

		...jest.configs['flat/recommended'],
		...jest.configs['flat/style'],

		plugins: {
			jest
		},

		rules: {
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/unbound-method': 'off',
			'jest/no-done-callback': 'off'
		}
	},

	// Prettier plugin which should be last
	eslintPluginPrettierRecommended
];
