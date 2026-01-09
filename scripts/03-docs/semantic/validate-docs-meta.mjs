#!/usr/bin/env node

/**
 * Docs Meta Validation Gate v1
 * Validates docs-seo-manifest.json for Entity Alignment
 * 
 * Gate v1 Rules:
 * - FAIL: Canonical not in docs.mplp.io domain
 * - FAIL: Formative pages without noindex
 * - WARN: Missing description
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_PATH = path.resolve(__dirname, '../../../docs-governance/outputs/docs-seo-manifest.json');

// Load manifest
if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ FAIL: Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

let failCount = 0;
let warnCount = 0;
const failures = [];
const warnings = [];

console.log('=== Docs Meta Validation Gate v1 ===\n');

// Gate v1.1: Canonical domain check
console.log('Gate v1.1: Canonical Domain Check');
manifest.pages.forEach(page => {
    if (page.canonical && !page.canonical.startsWith('https://docs.mplp.io')) {
        failures.push({
            gate: 'v1.1',
            page: page.path,
            issue: `Canonical not in docs.mplp.io domain: ${page.canonical}`,
        });
        failCount++;
    }
});

if (failCount === 0) {
    console.log('✓ PASS: All canonicals in correct domain\n');
} else {
    console.log(`❌ FAIL: ${failCount} pages with incorrect canonical domain\n`);
}

// Gate v1.2: Formative noindex check
console.log('Gate v1.2: Formative Noindex Check');
const formativeCount = manifest.pages.filter(p =>
    p.doc_profile === 'formative' ||
    p.normativity === 'formative' ||
    p.lifecycle_status === 'formative'
).length;

const formativeNoindexCount = manifest.pages.filter(p => {
    const isFormative = p.doc_profile === 'formative' ||
        p.normativity === 'formative' ||
        p.lifecycle_status === 'formative';
    return isFormative && p.robots && p.robots.includes('noindex');
}).length;

manifest.pages.forEach(page => {
    const isFormative = page.doc_profile === 'formative' ||
        page.normativity === 'formative' ||
        page.lifecycle_status === 'formative';

    if (isFormative && (!page.robots || !page.robots.includes('noindex'))) {
        failures.push({
            gate: 'v1.2',
            page: page.path,
            issue: `Formative page without noindex: robots="${page.robots}"`,
        });
        failCount++;
    }
});

console.log(`Formative pages: ${formativeCount}`);
console.log(`With noindex: ${formativeNoindexCount}`);

if (formativeCount === 0) {
    console.log('✓ PASS: No formative pages (check skipped)\n');
} else if (formativeCount === formativeNoindexCount) {
    console.log('✓ PASS: All formative pages have noindex\n');
} else {
    console.log(`❌ FAIL: ${formativeCount - formativeNoindexCount} formative pages missing noindex\n`);
}

// WARN: Missing description
console.log('Gate v1.3: Missing Description (WARN)');
const missingDesc = manifest.pages.filter(p => !p.description);
warnCount = missingDesc.length;

if (warnCount > 0) {
    console.log(`⚠ WARN: ${warnCount} pages missing description`);
    console.log(`  See: docs-governance/outputs/missing-description.pages.txt\n`);
} else {
    console.log('✓ PASS: All pages have description\n');
}

// Summary
console.log('=== Gate v1 Summary ===');
console.log(`Total pages: ${manifest.pages.length}`);
console.log(`Failures: ${failCount}`);
console.log(`Warnings: ${warnCount}`);

if (failures.length > 0) {
    console.log('\n=== Failure Details ===');
    failures.slice(0, 10).forEach(f => {
        console.log(`[${f.gate}] ${f.page}`);
        console.log(`  ${f.issue}`);
    });
    if (failures.length > 10) {
        console.log(`\n... and ${failures.length - 10} more failures`);
    }
}

if (failCount > 0) {
    console.log('\n❌ Gate v1 FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate v1 PASSED');
    process.exit(0);
}
