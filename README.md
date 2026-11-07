# Nuxt Template

Starting point for static Nuxt sites: Nuxt UI, i18n (it, en), Nuxt SEO, Nuxt A11y, VueUse, Vitest, ESLint with the Tailwind canonical-class rule, Fallow, a gitmoji commit hook, and CI that deploys to an assets-only Cloudflare Worker.

## After "Use this template"

1. Rename `nuxt-template` in `package.json`, `wrangler.jsonc` and `WORKER_NAME` in `.github/workflows/ci.yml`.
2. Set `site.url` and `site.name` in `nuxt.config.ts` and `site.name` in the locale files.
3. Add the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets to the repository.
4. `pnpm install` (also activates the commit hook).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm generate` | Static site in `.output/public` |
| `pnpm deploy` | Generate and deploy with Wrangler |
| `pnpm lint`, `pnpm typecheck`, `pnpm test` | Checks |
| `pnpm check:i18n` | Translation keys exist and match across locales |
| `pnpm fallow:dead-code` | Unused files, exports and dependencies |
