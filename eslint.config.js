import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const ABSENCE_RULES = [
  {
    selector: 'TSUnionType:has(> TSNullKeyword):has(> TSUndefinedKeyword)',
    message: 'One form of absence per value: never "X | null | undefined" (AGENTS.md golden rule 20).',
  },
  {
    selector: 'TSInterfaceDeclaration:not([id.name=/^Api.*Body$/]) > TSInterfaceBody > TSPropertySignature[optional=true] > TSTypeAnnotation TSUnionType:has(> TSNullKeyword)',
    message: 'One form of absence per value: never an optional and nullable property "?: X | null", except in an Api…Body partial-update contract (AGENTS.md golden rule 20).',
  },
  {
    selector: 'TSTypeLiteral > TSPropertySignature[optional=true] > TSTypeAnnotation TSUnionType:has(> TSNullKeyword)',
    message: 'One form of absence per value: never an optional and nullable property "?: X | null" (AGENTS.md golden rule 20).',
  },
  {
    selector: ':matches(Identifier, AssignmentPattern)[optional=true] > TSTypeAnnotation TSUnionType:has(> TSNullKeyword)',
    message: 'One form of absence per value: never an optional and nullable parameter "?: X | null" (AGENTS.md golden rule 20).',
  },
]

const HTML_SINK_RULES = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'No raw HTML: render text with React (user content such as feedback must never be injected). Only SvgCard may inject the escaped card SVG.',
  },
  {
    selector: "AssignmentExpression > MemberExpression.left[property.name=/^(innerHTML|outerHTML)$/]",
    message: 'No innerHTML / outerHTML assignment: render text with React.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'No insertAdjacentHTML: render text with React.',
  },
  {
    selector: "CallExpression[callee.name='eval'], NewExpression[callee.name='Function']",
    message: 'No eval / new Function.',
  },
]

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
    rules: {
      eqeqeq: ['error', 'always'],
      'no-restricted-syntax': ['error', ...ABSENCE_RULES, ...HTML_SINK_RULES],
    },
  },
  {
    files: ['src/shared/components/ui/SvgCard.tsx'],
    rules: {
      'no-restricted-syntax': ['error', ...ABSENCE_RULES, ...HTML_SINK_RULES.slice(1)],
    },
  },
])
