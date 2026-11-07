# Testing

- Unit tests with Vitest in `test/unit/*.test.ts`, on pure modules: no Nuxt runtime and no auto-imports, so tested files import what they use (`import { ICONS } from './icons'` in utilities).
- The Nuxt aliases `~`, `~~` and `#shared` resolve through `vitest.config.ts`.
- `pnpm test:coverage` measures every `.ts` file under `app/`, `server/` and `shared/`.
- Component tests (`@nuxt/test-utils`) and Playwright are added per project when a real mount or a browser flow is needed.
