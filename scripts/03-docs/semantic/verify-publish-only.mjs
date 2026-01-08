#!/usr/bin/env node
/**
 * MPLP Protocol — Publish-Only Workspace Verification Script
 * 
 * This script verifies that packages/npm/* workspaces are in a clean,
 * publish-ready state with only dist/ artifacts (no stale src/).
 * 
 * Governance: OPS_GOVERNANCE_LOG.md 2025-12-26
 * Rule: publish-only workspace is artifact-only; no source-of-truth code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const NPM_PACKAGES_DIR = path.join(ROOT, 'packages/npm');

// Packages that are expected to exist in packages/npm/
// NOTE: validator is NOT included - it's CI-only internal tool (see OPS_GOVERNANCE_LOG.md)
const EXPECTED_PACKAGES = [
    'compliance',
    'coordination',
    'core',
    'devtools',
    'integration-llm-http',
    'integration-storage-fs',
    'integration-storage-kv',
    'integration-tools-generic',
    'modules',
    'runtime-minimal',
    'schema',
    'sdk-ts'
    // 'validator' - EXCLUDED: CI-only, non-publication per 2025-12-26 governance
];

let errors = [];
let warnings = [];

console.log('🔍 Verifying publish-only workspaces...\n');

for (const pkgName of EXPECTED_PACKAGES) {
    const pkgDir = path.join(NPM_PACKAGES_DIR, pkgName);

    if (!fs.existsSync(pkgDir)) {
        warnings.push(`⚠️  Package directory missing: ${pkgName}`);
        continue;
    }

    const pkgJsonPath = path.join(pkgDir, 'package.json');
    const distDir = path.join(pkgDir, 'dist');
    const srcDir = path.join(pkgDir, 'src');

    // Check 1: package.json exists
    if (!fs.existsSync(pkgJsonPath)) {
        errors.push(`❌ ${pkgName}: Missing package.json`);
        continue;
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

    // Check 2: dist/ exists
    if (!fs.existsSync(distDir)) {
        errors.push(`❌ ${pkgName}: Missing dist/ directory`);
    }

    // Check 3: main/types point to dist/
    if (pkgJson.main && !pkgJson.main.startsWith('dist/')) {
        errors.push(`❌ ${pkgName}: main does not point to dist/ (${pkgJson.main})`);
    }
    if (pkgJson.types && !pkgJson.types.startsWith('dist/')) {
        errors.push(`❌ ${pkgName}: types does not point to dist/ (${pkgJson.types})`);
    }

    // Check 4: exports point to dist/
    if (pkgJson.exports && pkgJson.exports['.']) {
        const exp = pkgJson.exports['.'];
        if (exp.import && !exp.import.includes('dist/')) {
            errors.push(`❌ ${pkgName}: exports.import does not point to dist/`);
        }
        if (exp.types && !exp.types.includes('dist/')) {
            errors.push(`❌ ${pkgName}: exports.types does not point to dist/`);
        }
    }

    // Check 5: src/ MUST NOT exist (strong governance mode - BLOCKING)
    if (fs.existsSync(srcDir)) {
        errors.push(`❌ ${pkgName}: src/ exists (FORBIDDEN in publish-only workspace)`);
    }

    // Check 6: build script with tsc - WARNING only
    // NOTE: This is a transitional state. Publish-only packages should eventually
    // not have build scripts (dist should be synced from sources).
    // See OPS_GOVERNANCE_LOG.md for governance decision.
    if (pkgJson.scripts?.build && pkgJson.scripts.build.includes('tsc')) {
        warnings.push(`⚠️  ${pkgName}: has tsc build script (consider removing - dist should be synced)`);
    }

    console.log(`✅ ${pkgName}: verified`);
}

console.log('\n--- Summary ---');

if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(e));
    console.log(`\n❌ Verification FAILED with ${errors.length} error(s)`);
    process.exit(1);
} else {
    console.log(`\n✅ Verification PASSED (${warnings.length} warning(s))`);
    process.exit(0);
}
