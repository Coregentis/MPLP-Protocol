#!/usr/bin/env node

/**
 * Gate 1A: Repo + Docs Entry Closure Gate
 * Ensures Repo/Docs outbound links to Website and each other are intact
 * 
 * Note: This is Gate 1A - Repo+Docs side only.
 * Gate 1B (Website → Docs/Repo) runs in the Website repository.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');

let failCount = 0;
const failures = [];

console.log('=== Gate 1A: Repo + Docs Entry Closure ===\n');

// Check 1: Docs entrypoints → Website + Repo links
console.log('Check 1.1: Docs entrypoints anchor links');
const docsEntrypoints = fs.readFileSync(path.join(ROOT, 'docs/docs/reference/entrypoints.md'), 'utf8');

if (!docsEntrypoints.includes('www.mplp.io/what-is-mplp')) {
    failures.push('Docs entrypoints missing link to Website /what-is-mplp');
    failCount++;
}
if (!docsEntrypoints.includes('mplp.io/assets/geo/mplp-entity.json')) {
    failures.push('Docs entrypoints missing link to entity card');
    failCount++;
}
if (!docsEntrypoints.includes('github.com/Coregentis/MPLP-Protocol')) {
    failures.push('Docs entrypoints missing link to Repo');
    failCount++;
}

// Check 2: Repo README → Website + Docs links
console.log('Check 1.2: Repo README anchor closure');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

if (!readme.includes('www.mplp.io/what-is-mplp')) {
    failures.push('README missing link to Website /what-is-mplp');
    failCount++;
}
if (!readme.includes('docs.mplp.io/docs/reference/entrypoints')) {
    failures.push('README missing link to Docs entrypoints');
    failCount++;
}
if (!readme.includes('./schemas/v2/')) {
    failures.push('README missing link to schemas');
    failCount++;
}

console.log(`\nChecked: 6 anchor links (Repo + Docs → Website/Repo)`);
console.log(`Failures: ${failCount}`);

if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n❌ Gate 1A FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate 1A PASSED');
    process.exit(0);
}
