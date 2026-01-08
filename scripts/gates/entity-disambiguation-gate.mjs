#!/usr/bin/env node

/**
 * Gate 2: Entity Card & JSON-LD Disambiguation Gate
 * Ensures entity disambiguation signals remain intact
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');

let failCount = 0;
const failures = [];

console.log('=== Gate 2: Entity Card & JSON-LD Disambiguation ===\n');

// Check 1: Entity card version consistency
console.log('Check 2.1: Entity card version consistency');
const repoEntity = JSON.parse(fs.readFileSync(path.join(ROOT, 'governance/entity/entity.json'), 'utf8'));
const websiteEntity = JSON.parse(fs.readFileSync(path.join(ROOT, 'MPLP_website/public/assets/geo/mplp-entity.json'), 'utf8'));

if (repoEntity.protocol_version !== websiteEntity.protocol_version) {
    failures.push(`Entity card protocol_version mismatch: repo=${repoEntity.protocol_version}, website=${websiteEntity.protocol_version}`);
    failCount++;
}
if (repoEntity.schema_bundle_version !== websiteEntity.schema_bundle_version) {
    failures.push(`Entity card schema_bundle_version mismatch: repo=${repoEntity.schema_bundle_version}, website=${websiteEntity.schema_bundle_version}`);
    failCount++;
}

// Check 2: JSON-LD DefinedTerm
console.log('Check 2.2: JSON-LD DefinedTerm disambiguation');
const jsonLd = fs.readFileSync(path.join(ROOT, 'MPLP_website/components/seo/site-json-ld.tsx'), 'utf8');

if (!jsonLd.includes('DefinedTerm')) {
    failures.push('JSON-LD missing DefinedTerm');
    failCount++;
}
if (!jsonLd.includes('disambiguatingDescription')) {
    failures.push('JSON-LD missing disambiguatingDescription');
    failCount++;
}
if (!jsonLd.includes('not a software license')) {
    failures.push('JSON-LD disambiguatingDescription missing "not a software license"');
    failCount++;
}
if (!jsonLd.includes('/assets/geo/mplp-entity.json')) {
    failures.push('JSON-LD missing link to entity card');
    failCount++;
}

// Check 3: Footer disambiguation
console.log('Check 2.3: Footer disambiguation text');
const footer = fs.readFileSync(path.join(ROOT, 'MPLP_website/components/layout/footer.tsx'), 'utf8');

if (!footer.includes('MPLP') || !footer.includes('Multi-Agent Lifecycle Protocol') || !footer.includes('not a license')) {
    failures.push('Footer missing disambiguation text');
    failCount++;
}

console.log(`\nChecked: 7 disambiguation signals`);
console.log(`Failures: ${failCount}`);

if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    console.log('\n❌ Gate 2 FAILED');
    process.exit(1);
} else {
    console.log('\n✅ Gate 2 PASSED');
    process.exit(0);
}
