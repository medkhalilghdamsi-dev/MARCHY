#!/usr/bin/env node
/**
 * Static CSS ownership audit for the stylesheets imported by src/styles.css.
 * Reports repeated selectors by file and at-rule context. It does not decide
 * whether a duplicate is safe to remove; inspect declarations and browser
 * computed styles before changing the cascade.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entryPath = path.join(root, 'src/styles.css')
const entry = await readFile(entryPath, 'utf8')
const imports = [...entry.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
const records = new Map()

function findBlockEnd(source, openIndex) {
  let depth = 1
  let quote = ''
  let comment = false
  for (let index = openIndex + 1; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]
    if (comment) {
      if (char === '*' && next === '/') { comment = false; index += 1 }
      continue
    }
    if (quote) {
      if (char === '\\') { index += 1; continue }
      if (char === quote) quote = ''
      continue
    }
    if (char === '/' && next === '*') { comment = true; index += 1; continue }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  throw new Error('Unclosed CSS block')
}

function splitSelectors(header) {
  const selectors = []
  let start = 0
  let parens = 0
  let brackets = 0
  let quote = ''
  for (let index = 0; index < header.length; index += 1) {
    const char = header[index]
    if (quote) {
      if (char === '\\') index += 1
      else if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '(') parens += 1
    if (char === ')') parens -= 1
    if (char === '[') brackets += 1
    if (char === ']') brackets -= 1
    if (char === ',' && parens === 0 && brackets === 0) {
      selectors.push(header.slice(start, index).trim())
      start = index + 1
    }
  }
  selectors.push(header.slice(start).trim())
  return selectors.filter(Boolean)
}

function scan(source, file, context = []) {
  let cursor = 0
  while (cursor < source.length) {
    const open = source.indexOf('{', cursor)
    const statementEnd = source.indexOf(';', cursor)
    if (statementEnd !== -1 && (open === -1 || statementEnd < open)) {
      cursor = statementEnd + 1
      continue
    }
    if (open === -1) break
    const close = findBlockEnd(source, open)
    const header = source.slice(cursor, open).replace(/\/\*[\s\S]*?\*\//g, '').trim()
    const body = source.slice(open + 1, close)
    const line = source.slice(0, cursor).split('\n').length
    cursor = close + 1
    if (!header) continue

    if (/^@(media|supports|container|layer|scope)\b/i.test(header)) {
      scan(body, file, [...context, header.replace(/\s+/g, ' ')])
      continue
    }
    if (header.startsWith('@')) continue

    const scope = context.join(' > ') || 'global'
    for (const selector of splitSelectors(header)) {
      if (!selector || selector.startsWith('/*')) continue
      const key = scope + ' :: ' + selector.replace(/\s+/g, ' ')
      const matches = records.get(key) || []
      matches.push({ file, line })
      records.set(key, matches)
    }
  }
}

for (const importedPath of imports) {
  const absolutePath = path.resolve(path.dirname(entryPath), importedPath)
  const relativePath = path.relative(root, absolutePath).split(path.sep).join('/')
  const source = await readFile(absolutePath, 'utf8')
  scan(source, relativePath)
}

const crossFile = []
const repeatedInFile = []
for (const [key, owners] of records) {
  const uniqueOwners = [...new Set(owners.map((owner) => owner.file))]
  const locations = owners.map(({ file, line }) => `${file}:${line}`)
  if (uniqueOwners.length > 1) crossFile.push({ selector: key, files: uniqueOwners, locations })
  if (owners.length > uniqueOwners.length) repeatedInFile.push({ selector: key, occurrences: owners.length, files: uniqueOwners, locations })
}
crossFile.sort((a, b) => b.files.length - a.files.length || a.selector.localeCompare(b.selector))
repeatedInFile.sort((a, b) => b.occurrences - a.occurrences || a.selector.localeCompare(b.selector))

console.log('MARCHY CSS ownership audit')
console.log(`Stylesheets scanned: ${imports.length}`)
console.log(`Selector/context entries: ${records.size}`)
console.log(`Cross-file duplicate selector/context entries: ${crossFile.length}`)
console.log(`Repeated selector/context entries within files: ${repeatedInFile.length}`)
if (crossFile.length) {
  console.log('\nCross-file overlaps (inspect before migrating):')
  for (const item of crossFile) console.log(`- ${item.selector}\n  ${item.locations.join(', ')}`)
}
if (repeatedInFile.length) {
  console.log('\nRepeated blocks within a stylesheet (may be responsive refinements):')
  for (const item of repeatedInFile) console.log(`- ${item.selector} (${item.occurrences} blocks)\n  ${item.files.join(', ')}`)
}
console.log('\nThis report is a static ownership aid, not a visual-regression or computed-cascade test.')
