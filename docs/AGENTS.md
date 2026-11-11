# Agent conventions

## Stack

Nuxt 4, Nuxt UI 4, Tailwind CSS 4, `@nuxtjs/i18n` (it at the root, en under `/en`), Nuxt SEO, Nuxt A11y, VueUse. Static site built with `nuxt generate` and served by an assets-only Cloudflare Worker (`wrangler.jsonc`).

## Checks

Before a commit: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:i18n`, `pnpm fallow:dead-code`. CI runs the same.

## Shared files

`eslint.config.mjs`, `.githooks/commit-msg` and `scripts/check-i18n-keys.mjs` carry a version number and are shared with the other projects started from `nuxt-template`: change them there first, bump the version, add a line to `architecture/shared-files.md`, then copy.
