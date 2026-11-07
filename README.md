# Nuxt Template

A starting point for static, bilingual Nuxt sites, with the tooling already wired up. Every page is prerendered with `nuxt generate`, and the output is served by an **assets-only Cloudflare Worker**: no server code, no Pages.

It collects the setup that kept being copied by hand between projects: lint rules, the commit hook, CI, i18n checks, dead-code detection and the docs layout. Every new project starts from the same settled version.

## What's inside

| Area | Tools |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) with the `app/` source root, TypeScript |
| UI | [Nuxt UI 4](https://ui.nuxt.com) and Tailwind CSS 4; Lucide, Simple Icons and Circle Flags icon sets |
| i18n | [`@nuxtjs/i18n`](https://i18n.nuxtjs.org): Italian at the root, English under `/en` |
| SEO | [Nuxt SEO](https://nuxtseo.com): sitemap, robots, canonical and hreflang links, schema.org |
| Accessibility | [Nuxt A11y](https://github.com/nuxt/a11y): axe checks in dev |
| Utilities | [VueUse](https://vueuse.org) |
| Quality | ESLint (`@nuxt/eslint` plus `eslint-plugin-better-tailwindcss`), `vue-tsc`, [Fallow](https://fallow.tools) |
| Tests | [Vitest](https://vitest.dev) with v8 coverage |
| Deploy | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) to an assets-only Worker, from GitHub Actions |

Requirements: Node 26 (pinned to 26.13.0 through `volta`) and pnpm 12.

## Getting started

```sh
gh repo create my-site --template emanuelenardi/nuxt-template --private --clone
cd my-site
pnpm install   # also runs nuxt prepare and activates the commit hook
pnpm dev
```

Then make it yours:

1. Replace `nuxt-template` with the project name in `package.json`, in `name` of `wrangler.jsonc` and in `WORKER_NAME` of `.github/workflows/ci.yml`.
2. Set `site.url` and `site.name` in `nuxt.config.ts`, and `site.name` in `i18n/locales/*.json`.
3. Pick the theme colors in `app/app.config.ts` and the tokens in `app/assets/css/main.css`.
4. Replace the `YYYY-MM-DD` date in `docs/PROGRESS.md`.
5. For deploys, add the repository secrets described in [Deploy](#deploy).

## Project structure

```
app/
├── app.vue              UApp with the Nuxt UI locale, <html lang>, default description
├── error.vue            translated 404 and generic error page, noindex
├── app.config.ts        Nuxt UI colors
├── assets/css/main.css  Tailwind, Nuxt UI and the @theme tokens
├── layouts/default.vue  header with the language switch and color mode, footer
├── pages/index.vue
└── utils/icons.ts       ICONS: every icon name of the app
i18n/locales/            it.json, en.json
scripts/
└── check-i18n-keys.mjs  translation key check
test/unit/               Vitest unit tests
docs/                    project documentation (see below)
.githooks/commit-msg     commit message format
.github/workflows/ci.yml checks and deploy
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm dev:clean` | Clears the Nuxt caches (`nuxt cleanup`), then starts the dev server |
| `pnpm generate` | Prerenders the site into `.output/public` |
| `pnpm preview` | Serves the generated output locally |
| `pnpm deploy` | Generates and deploys with Wrangler from your machine |
| `pnpm lint` / `pnpm lint:fix` | ESLint, with a content-based cache |
| `pnpm typecheck` | `nuxt typecheck` (vue-tsc) |
| `pnpm test` / `pnpm test:watch` | Vitest, once or in watch mode |
| `pnpm test:coverage` | Vitest with v8 coverage over `app/`, `server/` and `shared/` |
| `pnpm check:i18n` | Translation keys exist and match across locales |
| `pnpm fallow:dead-code` | Unused files, exports and dependencies |
| `pnpm fallow:dupes` | Duplicated code |
| `pnpm fallow:health` | Complexity score, hotspots and refactoring targets |
| `pnpm fallow:audit` / `pnpm fallow:security` | Full audit / security candidates |

## Conventions

### Lint rules

`eslint.config.mjs` extends the `@nuxt/eslint` config. The stylistic defaults are set in `nuxt.config.ts`: 2-space indent, single quotes, no semicolons, no trailing commas, `1tbs` braces. On top of that it adds:

- **No relative imports** in `app/`, `server/`, `shared/` and `test/`: use the Nuxt aliases `~/`, `~~/` and `#shared/`.
- **Canonical Tailwind classes**: `size-[18px]` must be written `size-4.5`, `text-xl leading-normal` must be `text-xl/normal`. Classes inside Nuxt UI `:ui` objects are checked too.
- **At most 2 attributes on a single-line Vue tag**: from 3 attributes on, one per line.
- **Multi-line destructures** from 4 names on.
- **100-character lines**. Strings, comments, URLs and `class` lists are exempt.
- **Fixed block order** in Vue files: `<script>`, `<template>`, `<style>`.
- `eqeqeq`, and `any` as a warning (allowed in tests).

Lint warnings are treated as errors.

### Icons

Every icon name lives in `ICONS` in `app/utils/icons.ts`, written out in full (`'i-lucide-arrow-right'`), so the Nuxt Icon scan bundles it. Components write `:icon="ICONS.arrowRight"` and never repeat a raw `i-…` string. A unit test checks that every name uses the dash form.

### i18n

Every visible string goes through `t()`, with keys in both `it.json` and `en.json`. `pnpm check:i18n` fails when a literal `t('…')` key is missing from the default locale, or when the locales don't have the same keys. Keys built from template literals can't be checked statically.

### Commit messages

The hook in `.githooks/commit-msg` enforces this format:

```
<type>(<scope>)?!?: <gitmoji> <description>

feat(menu): ✨ add the language switch
fix: 🐛 keep the locale on the error page
feat!: 💥 rename the content collections
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore`, `ci`, `revert`.
- **Emoji:** any of the 75 [gitmojis](https://gitmoji.dev/), not tied to the type.
- **Breaking changes** (`!`) must use 💥.
- Merge, revert, fixup and squash commits pass untouched.

## Testing

Unit tests live in `test/unit/*.test.ts` and run in a plain Node environment. There is no Nuxt runtime and no auto-imports, so a tested file imports what it uses. The `~`, `~~` and `#shared` aliases resolve through `vitest.config.ts`.

Component tests (`@nuxt/test-utils`) and Playwright are left out on purpose. Add them in a project when a real mount or a browser flow is worth it.

## CI and deploy

`.github/workflows/ci.yml` runs on every push and on manual runs.

| Job | When | What it does |
|---|---|---|
| `ci` | every push | Translation keys, dead code, lint (with a cached result), typecheck, tests |
| `cloudflare-access` | pushes to `main`, manual runs | Checks in seconds that the Cloudflare token is valid, belongs to the account, can manage Workers and, if set, that the custom domain is attached |
| `deploy` | after both pass | `pnpm run generate`, then `wrangler deploy` |

A newer push cancels a superseded run on other branches, but never a run on `main`, which may be deploying. Node comes from `volta.node` in `package.json`, so CI and local work run the same version.

### Deploy

Add two repository secrets (*Settings → Secrets and variables → Actions*):

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`: an **Account API token** with *Workers Scripts: Edit*. User API tokens are rejected by the access check.

`wrangler.jsonc` describes an assets-only Worker, with no `main` script:

- 404s are answered by `404.html`.
- URLs drop the trailing slash.
- The first deploy creates the Worker on `<name>.<account>.workers.dev`.

For a custom domain, uncomment the `routes`, `workers_dev` and `preview_urls` lines in `wrangler.jsonc`, and set `WORKER_HOSTNAME` in the workflow.

## Documentation layout

`docs/` follows the same taxonomy in every project:

| File | Purpose |
|---|---|
| `README.md` | Index and reading order |
| `AGENTS.md` | Conventions for AI agents working in the repo |
| `PROGRESS.md` | Curated history and architecture decisions (ADRs) |
| `CHANGELOG.md` | Raw commit trail, newest first |
| `BACKLOG.md` | Committed, ranked work (P1–P3, effort) |
| `TODO.md` | Loose observations and open questions |
| `architecture/` | One doc per concern (routes, state, data, testing, i18n) |
| `audits/` | Dated reports, named `YYYY-MM-DD-name.md` |

`CLAUDE.md` at the root points agents to `docs/AGENTS.md`.

## Shared files across projects

Three files carry a version number in their header and are meant to stay identical across every project started from this template:

- `eslint.config.mjs` (the part above `// Project-specific blocks go below this line`)
- `.githooks/commit-msg`
- `scripts/check-i18n-keys.mjs`

To change one: edit it here first, bump its version, then copy it into each project. Projects only add their own blocks (generated-file ignores, project CSS classes, per-file overrides) below the marker line.

## Known limitations

- **Generated OG images are off** (`ogImage: false`). Nuxt OG Image needs `@nuxt/fonts` 1.0, while Nuxt UI 4.12 still brings 0.14. Pages can set `og:image` by hand until then.
- **Static only.** For server routes, switch the Nitro preset to `cloudflare_module`, give `wrangler.jsonc` a `main` and the bindings, and deploy with `nuxt build`.

## License

[MIT](./LICENSE). The app skeleton started from the official [Nuxt UI starter template](https://github.com/nuxt-ui-templates/starter).
