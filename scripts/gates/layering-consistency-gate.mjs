#!/usr/bin/env node

/**
 * Gate 4: Layering Consistency Gate
 * Ensures L1-L4 architecture naming is not confused with interoperability levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');

let failCount = 0;
const failures = [];

console.log('=== Gate 4: Layering Consistency ===\n');

// Check 1: README has L1-L4 architecture
console.log('Check 4.1: README has L1-L4 architecture layers');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

if (!readme.includes('L1') || !readme.includes('L2') || !readme.includes('L3') || !readme.includes('L4')) {
    failures.push('README missing L1-L4 architecture layers');
    failCount++;
}

// Check 2: Interoperability levels use IL prefix (not L prefix)
console.log('Check 4.2: Interoperability levels use IL prefix');
if (readme.includes('Interoperability Levels') && !readme.includes('IL1')) {
    failures.push('README has Interoperability Levels but missing IL prefix');
    failCount++;
}

// Check 3: No direct L1/L2/L3 usage in interoperability context
console.log('Check 4.3: No L-prefix in interoperability context');
const interopSection = readme.match(/## Interoperability.*?(?=##|$)/s);
if (interopSection && interopSection[0].match(/\bL[123]\b/)) {
    // Only fail if L1/L2/L3 appears WITHOUT IL prefix in interop section
    if (!interopSection[0].includes('IL1') || !interopSection[0].includes('IL2') || !interopSection[0].includes('IL3')) {
        failures.push('Interoperability section uses L-prefix without IL prefix');
        failCount++;
    }
}

console.log(`\nChecked: 3 layering consistency signals`);
console.log(`Failures: ${failCount}`);

if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n❌ Gate 4 FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate 4 PASSED');
    process.exit(0);
}
