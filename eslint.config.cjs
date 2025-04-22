// File: ./eslint.config.cjs
const tsPlugin = require('@typescript-eslint/eslint-plugin'); // TypeScript linting rules
const tsParser = require('@typescript-eslint/parser'); // TypeScript parsing support for ESLint
const reactHooks = require('eslint-plugin-react-hooks'); // Enforce React Hooks rules
const reactRefresh = require('eslint-plugin-react-refresh'); // Rules for React Refresh
const globals = require('globals'); // Browser global variables
const simpleImportSort = require('eslint-plugin-simple-import-sort'); // Sort imports for better readability
const prettierPlugin = require('eslint-plugin-prettier'); // Integrate Prettier rules with ESLint

module.exports = [
   {
      ignores: ['dist'], // Ignore the dist folder during linting
   },
   {
      files: ['**/*.{js,jsx,ts,tsx}'], // Apply rules to all JS, JSX, TS, and TSX files
      languageOptions: {
         ecmaVersion: 2020, // Support for modern ECMAScript syntax
         globals: {
            ...globals.browser,
            React: 'readonly',
         }, // Use browser global variables
         parser: tsParser, // Use TypeScript parser
         parserOptions: {
            ecmaFeatures: {
               jsx: true,
            },
            ecmaVersion: 2020,
            sourceType: 'module',
         },
      },
      plugins: {
         '@typescript-eslint': tsPlugin, // Enable TypeScript linting
         'react-hooks': reactHooks, // Enable React Hooks linting
         'react-refresh': reactRefresh, // Enable React Refresh linting
         'simple-import-sort': simpleImportSort, // Enable import sorting
         'prettier': prettierPlugin, // Enable Prettier integration
      },
      rules: {
         // Base ESLint rules
         'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
         'no-console': 'warn', // Warn for console statements
         'no-debugger': 'error', // Disallow the use of debugger statements
         'eqeqeq': ['error', 'always'], // Enforce strict equality comparison

         // TypeScript rules
         ...tsPlugin.configs.recommended.rules, // Apply recommended TypeScript rules
         '@typescript-eslint/no-unused-vars': 'warn', // Change unused vars from error to warning
         '@typescript-eslint/no-explicit-any': 'warn', // Warn for explicit any types

         // React Hooks rules
         ...reactHooks.configs.recommended.rules, // Apply recommended React Hooks rules

         // Prettier rules
         // 'prettier/prettier': 'warn',

         // Custom rules
         'simple-import-sort/imports': 'error', // Sort imports alphabetically and by group
         'simple-import-sort/exports': 'error', // Sort exports alphabetically
         'react-hooks/rules-of-hooks': 'error', // Enforce React Hooks rules of hooks
         'react-hooks/exhaustive-deps': 'warn', // Warn for missing dependencies in useEffect
         //  'assgine': 'warn',
         'react-refresh/only-export-components': [
            'warn',
            {
               allowConstantExport: true, // Allow constant components to be exported
            },
         ],
      },
   },
];
