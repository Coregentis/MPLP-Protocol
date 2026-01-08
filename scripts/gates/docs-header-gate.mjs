#!/usr/bin/env node

/**
 * Gate 3: Docs Identity Header Injection Gate
 * Ensures Docs identity headers remain injected
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');

let failCount = 0;
const failures = [];

console.log('=== Gate 3: Docs Identity Header Injection ===\n');

// Check 1: Component exists
console.log('Check 3.1: DocIdentityHeader component exists');
const headerComponent = path.join(ROOT, 'docs/src/components/DocIdentityHeader.tsx');
if (!fs.existsSync(headerComponent)) {
    failures.push('DocIdentityHeader component missing');
    failCount++;
}

// Check 2: Swizzled injection point exists
console.log('Check 3.2: DocItem/Content swizzle exists');
const docItemContent = path.join(ROOT, 'docs/src/theme/DocItem/Content/index.tsx');
if (!fs.existsSync(docItemContent)) {
    failures.push('DocItem/Content swizzle missing');
    failCount++;
} else {
    const content = fs.readFileSync(docItemContent, 'utf8');
    if (!content.includes('DocIdentityHeader')) {
        failures.push('DocItem/Content missing DocIdentityHeader import/usage');
        failCount++;
    }
}

// Check 3: Build output contains truth source text
console.log('Check 3.3: Build output contains truth source text');
const buildDir = path.join(ROOT, 'docs/build/docs');
if (fs.existsSync(buildDir)) {
    try {
        const result = execSync(`grep -r "Repository schemas and tests are authoritative" "${buildDir}" | wc -l`, { encoding: 'utf8' });
        const count = parseInt(result.trim());
        console.log(`  Found truth source text in ${count} pages`);
        if (count < 50) {
            failures.push(`Truth source text found in only ${count} pages (expected >50)`);
            failCount++;
        }
    } catch (e) {
        failures.push('Failed to check build output for truth source text');
        failCount++;
    }
} else {
    console.log('  ⚠ Build directory not found, skipping build output check');
}

console.log(`\nChecked: 3 identity header signals`);
console.log(`Failures: ${failCount}`);

if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n❌ Gate 3 FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate 3 PASSED');
    process.exit(0);
}
