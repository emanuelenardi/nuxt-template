import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests on pure modules: no Nuxt runtime and no auto-imports, so tested files import explicitly
export default defineConfig({
  resolve: {
    // The Nuxt aliases, which plain Vitest does not know
    alias: {
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Every source file counts, not only the ones a test loads; .vue files are not measured
      include: [
        'app/**/*.ts',
        'server/**/*.ts',
        'shared/**/*.ts'
      ],
      exclude: ['**/*.d.ts']
    }
  }
})
