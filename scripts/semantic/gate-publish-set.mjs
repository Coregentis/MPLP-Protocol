/**
 * Gate: Verify Publish Set contains only PUBLIC packages
 * 
 * This script is a MANDATORY gate before any npm publish.
 * It produces evidence artifacts for the release chain.
 * 
 * Reference: METHOD-SDKR-08 Section 6.4
 * 
 * Usage:
 *   node scripts/semantic/gate-publish-set.mjs
 * 
 * Output:
 *   artifacts/release/publish-set.json
 *   artifacts/release/publish-gate-report.json
 * 
 * Exit codes:
 *   0 = PASS (all packages in publish set are PUBLIC)
 *   1 = FAIL (blocked packages found in publish flow)
 * 
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

const PACKAGES_DIR = join(ROOT_DIR, 'packages', 'npm');
const OUTPUT_DIR = join(ROOT_DIR, 'artifacts', 'release');

/**
 * Read and parse package.json for a package
 */
function readPackageJson(pkgDir) {
    const pkgJsonPath = join(pkgDir, 'package.json');
    if (!existsSync(pkgJsonPath)) {
        return null;
    }
    return JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
}

/**
 * Determine if a package is blocked from publishing
 */
function isBlocked(pkgJson) {
    return {
        isPrivate: pkgJson.private === true,
        isCiOnly: pkgJson.mplp?.ci_only === true,
        isPublishBlocked: pkgJson.mplp?.publishBlocked === true
    };
}

/**
 * Main gate function
 */
function gatePublishSet() {
    console.log('='.repeat(60));
    console.log('MPLP Publish Gate - METHOD-SDKR-08 Section 6.4');
    console.log('='.repeat(60));

    if (!existsSync(PACKAGES_DIR)) {
        console.error(`FATAL: Packages directory not found: ${PACKAGES_DIR}`);
        process.exit(1);
    }

    const packages = readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    console.log(`\nScanning ${packages.length} packages in ${PACKAGES_DIR}...\n`);

    const publishSet = [];
    const blocked = [];
    const errors = [];

    for (const pkg of packages) {
        const pkgDir = join(PACKAGES_DIR, pkg);
        const pkgJson = readPackageJson(pkgDir);

        if (!pkgJson) {
            errors.push({ package: pkg, error: 'No package.json found' });
            continue;
        }

        const blockReasons = isBlocked(pkgJson);
        const isBlockedPackage = blockReasons.isPrivate || blockReasons.isCiOnly || blockReasons.isPublishBlocked;

        if (isBlockedPackage) {
            blocked.push({
                name: pkgJson.name,
                version: pkgJson.version,
                path: pkg,
                reason: blockReasons
            });
            console.log(`  [BLOCKED] ${pkgJson.name} - ${JSON.stringify(blockReasons)}`);
        } else {
            publishSet.push({
                name: pkgJson.name,
                version: pkgJson.version,
                path: pkg
            });
            console.log(`  [PUBLIC]  ${pkgJson.name}@${pkgJson.version}`);
        }
    }

    // Check for violations: if --check-specific is passed, verify those packages
    const specificPackages = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
    const violations = [];

    if (specificPackages.length > 0) {
        for (const specified of specificPackages) {
            const blockedMatch = blocked.find(b => b.name === specified || b.path === specified);
            if (blockedMatch) {
                violations.push(blockedMatch);
            }
        }
    }

    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        gate: 'METHOD-SDKR-08-6.4',
        summary: {
            totalPackages: packages.length,
            publishableCount: publishSet.length,
            blockedCount: blocked.length,
            errorCount: errors.length,
            violationCount: violations.length
        },
        publishSet: publishSet.map(p => ({ name: p.name, version: p.version })),
        blocked: blocked.map(b => ({ name: b.name, reason: b.reason })),
        violations,
        errors,
        status: violations.length === 0 && errors.length === 0 ? 'PASS' : 'FAIL'
    };

    // Write outputs
    writeFileSync(
        join(OUTPUT_DIR, 'publish-gate-report.json'),
        JSON.stringify(report, null, 2)
    );
    writeFileSync(
        join(OUTPUT_DIR, 'publish-set.json'),
        JSON.stringify(publishSet, null, 2)
    );

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('GATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total packages:   ${packages.length}`);
    console.log(`  Publishable:      ${publishSet.length}`);
    console.log(`  Blocked:          ${blocked.length}`);
    console.log(`  Errors:           ${errors.length}`);
    console.log(`  Violations:       ${violations.length}`);
    console.log('');
    console.log(`  Output: ${OUTPUT_DIR}/`);
    console.log('');

    if (violations.length > 0) {
        console.error('❌ GATE FAIL: Blocked packages in publish flow!');
        console.error('   Violations:', violations.map(v => v.name).join(', '));
        console.error('');
        console.error('   This gate is NOT waivable.');
        console.error('   See: METHOD-SDKR-08 Section 6.3');
        process.exit(1);
    }

    if (errors.length > 0) {
        console.error('❌ GATE FAIL: Errors during scan!');
        console.error('   Errors:', errors.map(e => `${e.package}: ${e.error}`).join('; '));
        process.exit(1);
    }

    console.log('✅ GATE PASS: All packages in Publish Set are PUBLIC.');
    console.log('');
    console.log('   Publish Set:', publishSet.map(p => p.name).join(', '));
    process.exit(0);
}

// Run
gatePublishSet();
