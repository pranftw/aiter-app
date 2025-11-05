import js from '@eslint/js';
import * as ts from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  react.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      'indent': ['error', 2],
      'no-mixed-spaces-and-tabs': 'error',
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];