import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';

const ROOT = process.cwd();
const TARGETS = ['src/Island.jsx', 'src/main.js', 'README.md'];
const conflictRe = /^(<<<<<<<|=======|>>>>>>>)/m;

let failed = false;

for (const rel of TARGETS) {
  const full = path.join(ROOT, rel);
  const content = fs.readFileSync(full, 'utf8');

  if (conflictRe.test(content)) {
    console.error(`[FAIL] Conflict markers found in ${rel}`);
    failed = true;
  } else {
    console.log(`[OK] No conflict markers in ${rel}`);
  }

  if (rel.endsWith('Island.jsx')) {
    const braceBalance = [...content].reduce((acc, ch) => {
      if (ch === '{') return acc + 1;
      if (ch === '}') return acc - 1;
      return acc;
    }, 0);

    if (braceBalance !== 0) {
      console.error(`[FAIL] Unbalanced braces in ${rel}: ${braceBalance}`);
      failed = true;
    } else {
      console.log(`[OK] Basic brace balance check passed for ${rel}`);
    }

    try {
      parse(content, {
        sourceType: 'module',
        plugins: ['jsx']
      });
      console.log(`[OK] Babel parse check passed for ${rel}`);
    } catch (err) {
      const where = err?.loc ? `${err.loc.line}:${err.loc.column}` : 'unknown location';
      console.error(`[FAIL] Babel parse failed for ${rel} at ${where}: ${err.message}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('[OK] Source sanity checks passed');
