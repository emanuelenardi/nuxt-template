// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

// Config version: 2 (shared by the projects: keep the shared part identical and bump this number on every change)
// Indent, semi, quotes, comma-dangle and brace-style come from `eslint.config.stylistic` in nuxt.config.ts
export default withNuxt(
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      'eqeqeq': ['error', 'always'],
      'no-debugger': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      // Destructures with 4+ names go multiline
      '@stylistic/object-curly-newline': ['error', {
        ObjectPattern: {
          minProperties: 4,
          multiline: true,
          consistent: true
        }
      }],
      // Long strings, comments, URLs and Tailwind class lists are not wrapped to fit
      '@stylistic/max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreComments: true,
        ignorePattern: 'class\\s*=\\s*"'
      }],
      // Tags with 3+ attributes go one per line
      'vue/max-attributes-per-line': ['error', {
        singleline: { max: 2 },
        multiline: { max: 1 }
      }]
    }
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    // Root config files load before the aliases exist, so they stay out
    files: [
      'app/**/*.{ts,vue}',
      'server/**/*.ts',
      'shared/**/*.ts',
      'test/**/*.ts'
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '^\\.{1,2}/',
          message: 'Use a Nuxt alias (~/, ~~/, #shared/) instead of a relative path.'
        }]
      }]
    }
  },
  betterTailwindcss.configs['correctness-error'],
  {
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-concatenated-classes': 'error',
      // `size-[18px]` is written `size-4.5`
      'better-tailwindcss/enforce-canonical-classes': 'error'
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        rootFontSize: 16,
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    }
  }
  // Project-specific blocks go below this line
)
