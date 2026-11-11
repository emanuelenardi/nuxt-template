# Shared files

What each version of the versioned files shared with the other projects changed, so a project's copy can be compared against the template's by version number alone. Add a line here whenever a version is bumped.

## `scripts/check-i18n-keys.mjs`

| Version | First in | What changed | Updating from the previous version |
|---|---|---|---|
| 1 | upkeep, 2026-09-17 | A one-off audit, not in `package.json` and not numbered yet: every literal `t('...')` / `$t('...')` key in `app/`, `server/` and `shared/` must exist in `i18n/locales/it.json`. | — |
| 2 | upkeep and portfolio, 2026-11-04 | Becomes `pnpm check:i18n`: reads every file in `i18n/locales/` (default locale `it.json`, or the first file without one), checks that every locale has the same keys, and exits with 1 on any problem. | Can fail where v1 passed: locales with different keys. |
| 3 | nuxt-template, 2026-11-07 | No change in behaviour: the `// scripts\check-i18n-keys.mjs` path header is gone, so the copies are identical in every project. | Drop-in. |
| 4 | nuxt-template, 2026-11-07 | Fails on a key written twice in the same object of a locale file (`JSON.parse` silently keeps the last one). Warns, without failing, about default-locale keys no source file seems to use, counting quoted dotted strings and the fixed start of keys built at runtime. Adds `--default-locale-only <prefix>` (repeatable) for keys only the default locale has, such as an Italian-only back office. | Can fail where v3 passed: duplicate keys. Without the new option, the parity check is unchanged. |
| 5 | HarpoLab, 2026-11-09; nuxt-template, 2026-11-11 | Adds `--locales-directory <path>` and `--source-directory <path>` (repeatable), for locales and sources in Nuxt layers or a second app. | Drop-in: without the options, it reads the same folders as v4. |
