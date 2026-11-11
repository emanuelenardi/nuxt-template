// Script version: 5 (shared by the projects: keep the copies identical and bump this number on every change)
// Checks the i18n/locales/*.json files of the project (another folder with `--locales-directory <path>`,
// e.g. a Nuxt layer's):
//   1. no key is written twice in the same object of a locale file: JSON.parse keeps only the last
//      one, so the first value would be lost without any warning
//   2. every literal t('...') / $t('...') key in app/, server/ and shared/ (or the folders given by
//      `--source-directory <path>`, repeatable) exists in the default locale
//      (it.json, or the first file when there is no it.json); template-literal keys are not checked
//   3. with two or more locale files, every locale has the same keys as all the others, except the
//      keys under a `--default-locale-only <prefix>` (repeatable), which only the default locale has
//      (e.g. `--default-locale-only admin.` for an Italian-only back office)
// Exits with 1 when any of these fails. It also warns, without failing, about the keys of the
// default locale that no source file seems to use: a key built at runtime can't be found for sure.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

/** The values that follow every occurrence of a repeatable `--<name> <value>` argument */
function optionValues(name) {
  return process.argv
    .flatMap((argument, index) => argument === name && process.argv[index + 1] ? [process.argv[index + 1]] : [])
}

const ROOT = process.cwd()
const LOCALES_DIRECTORY = join(ROOT, optionValues('--locales-directory')[0] ?? join('i18n', 'locales'))
const sourceDirectoryOptions = optionValues('--source-directory')
const SOURCE_DIRECTORIES = sourceDirectoryOptions.length > 0 ? sourceDirectoryOptions : ['app', 'server', 'shared']
const SOURCE_EXTENSIONS = new Set(['.vue', '.ts'])
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.nuxt', '.output'])
const DEFAULT_LOCALE = 'it'

/** The key prefixes only the default locale translates, from `--default-locale-only <prefix>` */
const defaultLocaleOnlyPrefixes = optionValues('--default-locale-only')

// Literal-key calls only; template-literal and variable keys can't be resolved statically
const CALL_PATTERN = /\$?\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g
// Any quoted dotted string: a key can also be passed around before reaching t() (labelKey: '...')
const QUOTED_KEY_PATTERN = /['"`]([a-zA-Z][\w-]*(?:\.[\w-]+)+)['"`]/g
// The fixed start of a key built at runtime: `status.${value}`, 'status.' + value, or one with the
// variable inside a segment, `bracket.level${level}.name`
const DYNAMIC_PREFIX_PATTERN = /['"`]([a-zA-Z][\w-]*\.(?:[\w-]+\.)*[\w-]*)(?:\$\{|['"]\s*\+)/g

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

/**
 * Lists the keys written twice in the same object, with their lines. A small scanner over the
 * JSON text, since JSON.parse drops the duplicates before anything can see them
 */
function findDuplicateKeys(text) {
  const duplicates = []
  // One entry per open object or array: the keys seen so far (objects only) and the key it sits under
  const stack = []
  let pendingKey
  let line = 1
  let index = 0
  while (index < text.length) {
    const character = text[index]
    if (character === '\n') line += 1
    if (character === '"') {
      let end = index + 1
      while (text[end] !== '"') end += text[end] === '\\' ? 2 : 1
      const value = JSON.parse(text.slice(index, end + 1))
      let next = end + 1
      while (/\s/.test(text[next])) next += 1
      const scope = stack.at(-1)
      if (text[next] === ':' && scope?.keys) {
        if (scope.keys.has(value)) {
          const path = [...stack.map(entry => entry.name).filter(Boolean), value].join('.')
          duplicates.push({ path, firstLine: scope.keys.get(value), secondLine: line })
        } else {
          scope.keys.set(value, line)
        }
        pendingKey = value
      }
      index = end + 1
      continue
    }
    if (character === '{' || character === '[') {
      stack.push({ name: pendingKey, keys: character === '{' ? new Map() : undefined })
      pendingKey = undefined
    } else if (character === '}' || character === ']') {
      stack.pop()
    } else if (character === ',') {
      pendingKey = undefined
    }
    index += 1
  }
  return duplicates
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
  console.error(`No locale file found in ${LOCALES_DIRECTORY.slice(ROOT.length + 1)}.`)
  process.exit(2)
}

const textByLocale = new Map(localeFiles.map(file => [
  basename(file, '.json'),
  readFileSync(join(LOCALES_DIRECTORY, file), 'utf8')
]))
const keysByLocale = new Map([...textByLocale].map(([locale, text]) => [
  locale,
  flattenKeys(JSON.parse(text))
]))
const defaultLocale = keysByLocale.has(DEFAULT_LOCALE) ? DEFAULT_LOCALE : keysByLocale.keys().next().value
const defaultKeys = keysByLocale.get(defaultLocale)

// Keys written twice in the same object
const duplicatesByLocale = new Map()
for (const [locale, text] of textByLocale) {
  const duplicates = findDuplicateKeys(text)
  if (duplicates.length > 0) duplicatesByLocale.set(locale, duplicates)
}

// Literal keys used in the code but missing from the default locale, and every key the code seems
// to use, for the unused-key warning
const missingInDefault = new Map()
const usedKeys = new Set()
const dynamicPrefixes = new Set()
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
    for (const match of content.matchAll(QUOTED_KEY_PATTERN)) usedKeys.add(match[1])
    for (const match of content.matchAll(DYNAMIC_PREFIX_PATTERN)) dynamicPrefixes.add(match[1])
  }
}
const unusedKeys = sortedList([...defaultKeys].filter(key =>
  !usedKeys.has(key) && ![...dynamicPrefixes].some(prefix => key.startsWith(prefix))))

// Keys that some locales have and others lack
const missingByLocale = new Map()
if (keysByLocale.size > 1) {
  const isTranslated = key => !defaultLocaleOnlyPrefixes.some(prefix => key.startsWith(prefix))
  const allKeys = new Set([...keysByLocale.values()].flatMap(keys => [...keys].filter(isTranslated)))
  for (const [locale, keys] of keysByLocale) {
    const missing = sortedList([...allKeys].filter(key => !keys.has(key)))
    if (missing.length > 0) missingByLocale.set(locale, missing)
  }
}

if (unusedKeys.length > 0) {
  console.warn(`Warning: ${unusedKeys.length} key(s) of ${defaultLocale}.json no source file seems to use`
    + ' (a key built at runtime can\'t be found for sure):\n')
  for (const key of unusedKeys) console.warn(`  ${key}`)
  console.warn('')
}

for (const [locale, duplicates] of duplicatesByLocale) {
  console.error(`${duplicates.length} key(s) written twice in ${locale}.json (only the last value is kept):\n`)
  for (const duplicate of duplicates) {
    console.error(`  ${duplicate.path}: lines ${duplicate.firstLine} and ${duplicate.secondLine}`)
  }
  console.error('')
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

if (duplicatesByLocale.size > 0 || missingInDefault.size > 0 || missingByLocale.size > 0) process.exit(1)

const localeNames = [...keysByLocale.keys()].join(', ')
const parityNote = keysByLocale.size > 1
  ? `all locales have the same keys (${localeNames})`
  : `single locale (${localeNames}), parity check skipped`
console.log(`No duplicate keys; all literal t() keys exist in ${defaultLocale}.json; ${parityNote}.`)
