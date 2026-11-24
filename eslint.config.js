import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/core/domain/**',
      'src/core/logic/**',
      'src/core/services/**',
      'src/features/planning/**',
      'src/features/recipeBuilder/**',
      'src/shared/components/**',
      'src/shared/hooks/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSUnionType:has(> TSNullKeyword):has(> TSUndefinedKeyword)',
          message: 'One form of absence per value: never "X | null | undefined" (AGENTS.md golden rule 20).',
        },
        {
          selector: 'TSPropertySignature[optional=true] > TSTypeAnnotation TSUnionType:has(> TSNullKeyword)',
          message: 'One form of absence per value: never an optional and nullable property "?: X | null" (AGENTS.md golden rule 20).',
        },
        {
          selector: ':matches(Identifier, AssignmentPattern)[optional=true] > TSTypeAnnotation TSUnionType:has(> TSNullKeyword)',
          message: 'One form of absence per value: never an optional and nullable parameter "?: X | null" (AGENTS.md golden rule 20).',
        },
      ],
    },
  },
])
