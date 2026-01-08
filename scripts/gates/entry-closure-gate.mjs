#!/usr/bin/env node

/**
 * Gate 1: Entry Anchors & Closure Gate
 * Ensures three-entry mutual links remain intact
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');

let failCount = 0;
const failures = [];

console.log('=== Gate 1: Entry Anchors & Closure ===\n');

// Check 1: Website /what-is-mplp
console.log('Check 1.1: Website /what-is-mplp anchor links');
const websitePage = fs.readFileSync(path.join(ROOT, 'MPLP_website/app/what-is-mplp/page.tsx'), 'utf8');

if (!websitePage.includes('docs.mplp.io/docs/reference/entrypoints')) {
    failures.push('Website /what-is-mplp missing link to Docs entrypoints');
    failCount++;
}
if (!websitePage.includes('github.com/Coregentis/MPLP-Protocol')) {
    failures.push('Website /what-is-mplp missing link to Repo');
    failCount++;
}
if (!websitePage.includes('/assets/geo/mplp-entity.json')) {
    failures.push('Website /what-is-mplp missing link to entity card');
    failCount++;
}

// Check 2: Docs entrypoints
console.log('Check 1.2: Docs entrypoints anchor links');
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

// Check 3: Repo README
console.log('Check 1.3: Repo README anchor closure');
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

console.log(`\nChecked: 9 anchor links`);
console.log(`Failures: ${failCount}`);

if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n❌ Gate 1 FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate 1 PASSED');
    process.exit(0);
}
