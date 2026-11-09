// Compares the files marked "// @shared <name> v<number>" in every project under Coding/ with the
// canonical copies in this repo. Usage:
//   node scripts/shared-status.mjs                      table of every marked file
//   node scripts/shared-status.mjs --write <name> <dir>  copy the canonical file into one project
//                                                       (add --force to overwrite local changes)
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const codingRoot = resolve(templateRoot, '..', '..')
// Old or throwaway projects that should not get the shared pieces
const SKIPPED_PROJECTS = ['MagicTheGathering/league', 'personal/experiments', 'personal/HarpoLab-layers']
const MARKER = /^\/\/ @shared (\S+) v(\d+)\b/
// The first-line path comment some repos require ("// shared\utils\timeSince.ts")
const PATH_HEADER = /^\/\/ (app|server|shared|scripts|test)\\\S+$/

function trackedFiles(projectRoot) {
  const output = execFileSync('git', ['ls-files', '*.ts', '*.vue', '*.css', '*.mjs'], {
    cwd: projectRoot,
    encoding: 'utf8'
  })
  return output.split('\n').filter(Boolean)
}

// Name, version and comparable content of a marked file, or null when it carries no marker
function readMarked(path) {
  const lines = readFileSync(path, 'utf8').replace(/\r/g, '').split('\n')
  const pathHeader = PATH_HEADER.test(lines[0]) ? lines[0] : null
  const body = pathHeader ? lines.slice(1) : lines
  const marker = body[0]?.match(MARKER)
  if (!marker) {
    return null
  }
  return {
    name: marker[1],
    version: marker[2],
    pathHeader,
    content: body.join('\n')
  }
}

function markedFiles(projectRoot) {
  const files = []
  for (const file of trackedFiles(projectRoot)) {
    const marked = readMarked(join(projectRoot, file))
    if (marked) {
      files.push({ ...marked, file })
    }
  }
  return files
}

function status(copy, canonical) {
  if (!canonical) {
    return 'no canonical copy'
  }
  if (Number(copy.version) < Number(canonical.version)) {
    return `outdated (canonical v${canonical.version})`
  }
  if (Number(copy.version) > Number(canonical.version)) {
    return 'newer than canonical'
  }
  return copy.content === canonical.content ? 'up to date' : 'changed locally'
}

// Every git repo with a nuxt.config.ts two levels under Coding/ (owner folder, then project)
function projects() {
  const found = []
  for (const owner of readdirSync(codingRoot, { withFileTypes: true })) {
    if (!owner.isDirectory() || owner.name.startsWith('.')) {
      continue
    }
    for (const project of readdirSync(join(codingRoot, owner.name), { withFileTypes: true })) {
      const projectRoot = join(codingRoot, owner.name, project.name)
      const name = `${owner.name}/${project.name}`
      const isProject = project.isDirectory()
        && existsSync(join(projectRoot, 'nuxt.config.ts'))
        && existsSync(join(projectRoot, '.git'))
      if (isProject && projectRoot !== templateRoot && !SKIPPED_PROJECTS.includes(name)) {
        found.push({ name, root: projectRoot })
      }
    }
  }
  return found
}

const canonicalByName = new Map(markedFiles(templateRoot).map(file => [file.name, file]))
const argumentsList = process.argv.slice(2)

if (argumentsList[0] === '--write') {
  const name = argumentsList[1]
  const projectRoot = resolve(argumentsList[2] ?? '')
  const force = argumentsList.includes('--force')
  const canonical = canonicalByName.get(name)
  if (!canonical) {
    console.error(`No canonical "${name}" in ${templateRoot}`)
    process.exit(1)
  }
  const copies = markedFiles(projectRoot).filter(file => file.name === name)
  if (copies.length === 0) {
    console.error(`${projectRoot} has no file marked "@shared ${name}": copy it in by hand the first time`)
    process.exit(1)
  }
  for (const copy of copies) {
    const state = status(copy, canonical)
    if (state === 'changed locally' && !force) {
      console.error(`${copy.file}: changed locally, not overwritten (add --force)`)
      process.exitCode = 1
      continue
    }
    const header = copy.pathHeader ? `${copy.pathHeader}\n` : ''
    writeFileSync(join(projectRoot, copy.file), header + canonical.content)
    console.log(`${copy.file}: v${copy.version} -> v${canonical.version}`)
  }
} else {
  const rows = []
  for (const project of projects()) {
    for (const copy of markedFiles(project.root)) {
      rows.push([project.name, copy.name, `v${copy.version}`, status(copy, canonicalByName.get(copy.name)), copy.file])
    }
  }
  console.log(`Canonical: ${relative(codingRoot, templateRoot)}`)
  for (const [name, canonical] of canonicalByName) {
    console.log(`  ${name} v${canonical.version}`)
  }
  console.log('')
  const widths = [0, 1, 2, 3].map(column => Math.max(...rows.map(row => row[column].length), 8))
  for (const row of rows) {
    console.log(row.map((cell, column) => column < 4 ? cell.padEnd(widths[column]) : cell).join('  '))
  }
  if (rows.length === 0) {
    console.log('No project has a marked file yet.')
  }
}
