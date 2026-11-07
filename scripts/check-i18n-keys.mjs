// Script version: 3 (shared by the projects: keep the copies identical and bump this number on every change)
// Checks the i18n/locales/*.json files of the project:
//   1. every literal t('...') / $t('...') key in app/, server/ and shared/ exists in the default locale
//      (it.json, or the first file when there is no it.json); template-literal keys are not checked
//   2. with two or more locale files, every locale has the same keys as all the others
// With a single locale file, only the first check runs. Exits with 1 when anything is wrong.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const ROOT = process.cwd()
const LOCALES_DIRECTORY = join(ROOT, 'i18n', 'locales')
const SOURCE_DIRECTORIES = ['app', 'server', 'shared']
const SOURCE_EXTENSIONS = new Set(['.vue', '.ts'])
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.nuxt', '.output'])
const DEFAULT_LOCALE = 'it'

// Literal-key calls only; template-literal and variable keys can't be resolved statically
const CALL_PATTERN = /\$?\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g

function flattenKeys(object, prefix = '', keys = new Set()) {
  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value, fullKey, keys)
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

function listSourceFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(entry)) continue
    const fullPath = join(directory, entry)
    if (statSync(fullPath).isDirectory()) {
      listSourceFiles(fullPath, files)
    } else if (SOURCE_EXTENSIONS.has(extname(fullPath))) {
      files.push(fullPath)
    }
  }
  return files
}

function sortedList(items) {
  return [...items].sort()
}

const localeFiles = readdirSync(LOCALES_DIRECTORY)
  .filter(file => file.endsWith('.json'))
  .sort()

if (localeFiles.length === 0) {
  console.error('No locale file found in i18n/locales.')
  process.exit(2)
}

const keysByLocale = new Map(localeFiles.map(file => [
  basename(file, '.json'),
  flattenKeys(JSON.parse(readFileSync(join(LOCALES_DIRECTORY, file), 'utf8')))
]))
const defaultLocale = keysByLocale.has(DEFAULT_LOCALE) ? DEFAULT_LOCALE : keysByLocale.keys().next().value
const defaultKeys = keysByLocale.get(defaultLocale)

// Literal keys used in the code but missing from the default locale
const missingInDefault = new Map()
for (const directory of SOURCE_DIRECTORIES) {
  let files
  try {
    files = listSourceFiles(join(ROOT, directory))
  } catch {
    continue
  }
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    for (const match of content.matchAll(CALL_PATTERN)) {
      const key = match[1]
      if (defaultKeys.has(key)) continue
      if (!missingInDefault.has(key)) missingInDefault.set(key, new Set())
      missingInDefault.get(key).add(file.slice(ROOT.length + 1))
    }
  }
}

// Keys that some locales have and others lack
const missingByLocale = new Map()
if (keysByLocale.size > 1) {
  const allKeys = new Set([...keysByLocale.values()].flatMap(keys => [...keys]))
  for (const [locale, keys] of keysByLocale) {
    const missing = sortedList([...allKeys].filter(key => !keys.has(key)))
    if (missing.length > 0) missingByLocale.set(locale, missing)
  }
}

if (missingInDefault.size > 0) {
  console.error(`${missingInDefault.size} key(s) used in the code but missing from ${defaultLocale}.json:\n`)
  for (const key of sortedList(missingInDefault.keys())) {
    console.error(`  ${key}`)
    for (const file of sortedList(missingInDefault.get(key))) console.error(`    - ${file}`)
  }
}

for (const [locale, missing] of missingByLocale) {
  console.error(`\n${missing.length} key(s) missing from ${locale}.json:\n`)
  for (const key of missing) console.error(`  ${key}`)
}

if (missingInDefault.size > 0 || missingByLocale.size > 0) process.exit(1)

const localeNames = [...keysByLocale.keys()].join(', ')
const parityNote = keysByLocale.size > 1
  ? `all locales have the same keys (${localeNames})`
  : `single locale (${localeNames}), parity check skipped`
console.log(`All literal t() keys exist in ${defaultLocale}.json; ${parityNote}.`)
