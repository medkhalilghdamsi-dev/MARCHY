import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const entry = path.join(root, 'src/styles.css');
if (!fs.existsSync(entry)) {
  console.error('Run audit:css from the repository root (src/styles.css was not found).');
  process.exit(1);
}

function findClose(source, open) {
  let depth = 1, quote = '', comment = false;
  for (let i = open + 1; i < source.length; i += 1) {
    const c = source[i], n = source[i + 1];
    if (comment) { if (c === '*' && n === '/') { comment = false; i += 1; } continue; }
    if (quote) { if (c === '\\\\') { i += 1; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '*') { comment = true; i += 1; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth += 1;
    if (c === '}' && --depth === 0) return i;
  }
  return -1;
}
function selectorsOf(header) {
  const out = []; let start = 0, round = 0, square = 0, quote = '';
  for (let i = 0; i < header.length; i += 1) {
    const c = header[i];
    if (quote) { if (c === quote && header[i - 1] !== '\\\\') quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(') round++; if (c === ')') round--;
    if (c === '[') square++; if (c === ']') square--;
    if (c === ',' && round === 0 && square === 0) { out.push(header.slice(start, i).trim()); start = i + 1; }
  }
  out.push(header.slice(start).trim());
  return out.filter(Boolean);
}
function scan(source, file, contexts, map) {
  let i = 0;
  while (i < source.length) {
    while (/\s/.test(source[i] ?? '') || source.startsWith('/*', i)) {
      if (source.startsWith('/*', i)) { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; }
      else i++;
    }
    const start = i; let quote = '', round = 0, square = 0;
    while (i < source.length) {
      const c = source[i];
      if (quote) { if (c === quote && source[i - 1] !== '\\\\') quote = ''; i++; continue; }
      if (c === '"' || c === "'") { quote = c; i++; continue; }
      if (c === '(') round++; if (c === ')') round--;
      if (c === '[') square++; if (c === ']') square--;
      if (round === 0 && square === 0 && (c === '{' || c === ';' || c === '}')) break;
      if (c === '/' && source[i + 1] === '*') { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; continue; }
      i++;
    }
    if (i >= source.length) break;
    const header = source.slice(start, i).trim();
    if (source[i] === ';' || source[i] === '}') { i++; continue; }
    const close = findClose(source, i);
    if (close < 0) { console.warn('Unclosed CSS block:', file, header); break; }
    const body = source.slice(i + 1, close);
    if (header.startsWith('@')) {
      if (!/@(keyframes|-webkit-keyframes|font-face|page|property)\b/i.test(header)) scan(body, file, [...contexts, header], map);
    } else {
      const line = source.slice(0, start).split('\n').length;
      for (const selector of selectorsOf(header)) {
        const records = map.get(selector) ?? [];
        records.push({ file, line, context: contexts.join(' → ') || 'global' });
        map.set(selector, records);
      }
    }
    i = close + 1;
  }
}
const imports = [...fs.readFileSync(entry, 'utf8').matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]\)?[^;]*;/g)]
  .map(m => m[1]).filter(p => p.startsWith('.'))
  .map(p => path.resolve(path.dirname(entry), p)).filter(fs.existsSync);
const inventory = new Map();
for (const file of imports) scan(fs.readFileSync(file, 'utf8'), path.relative(root, file), [], inventory);
const repeated = [...inventory].filter(([, rows]) => rows.length > 1).sort((a,b) => b[1].length-a[1].length);
const occurrences = [...inventory.values()].reduce((n, rows) => n + rows.length, 0);
console.log('MARCHY CSS cascade inventory');
console.log(`Files: ${imports.length} | selector occurrences: ${occurrences} | unique selectors: ${inventory.size} | repeated selectors: ${repeated.length}`);
console.log('Repeated selectors are review candidates, not automatic defects. Inspect media/state context and import order before editing.\n');
for (const [selector, rows] of repeated) {
  console.log(`${rows.length}× ${selector}`);
  for (const row of rows) console.log(`  ${row.file}:${row.line} [${row.context}]`);
}
