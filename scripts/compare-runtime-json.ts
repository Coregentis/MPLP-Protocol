/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

const RUNTIME_OUT_TS_DIR = path.join(__dirname, '../tests/cross-language/runtime/out/ts');
const RUNTIME_OUT_PY_DIR = path.join(__dirname, '../tests/cross-language/runtime/out/py');

// Fields to ignore during comparison (auto-generated or timestamps)
const IGNORE_PATHS = new Set([
    'context_id',
    'plan_id',
    'confirm_id',
    'trace_id',
    'step_id',
    'span_id',
    'target_id',
    'meta.created_at',
    'meta.updated_at',
    'requested_at',
    'started_at',
    'finished_at',
    'root_span.span_id',
    'root_span.trace_id',
    'root_span.context_id',
    // Trace events might have timestamps or IDs
    'events'
]);

// Helper to normalize object for comparison
function normalize(obj: any, parentPath = ''): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map((item, index) => normalize(item, `${parentPath}[${index}]`));
    }

    if (typeof obj === 'object') {
        const newObj: any = {};
        const keys = Object.keys(obj).sort();

        for (const key of keys) {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;

            // Check if path should be ignored
            if (IGNORE_PATHS.has(currentPath) || IGNORE_PATHS.has(key)) {
                continue;
            }

            // Special handling for meta
            if (key === 'meta') {
                newObj[key] = normalize(obj[key], 'meta');
                continue;
            }

            newObj[key] = normalize(obj[key], currentPath);
        }
        return newObj;
    }

    return obj;
}

function deepCompare(obj1: any, obj2: any, path = ''): string[] {
    const diffs: string[] = [];

    if (obj1 === obj2) return diffs;

    if (typeof obj1 !== typeof obj2) {
        diffs.push(`${path}: Type mismatch (${typeof obj1} vs ${typeof obj2})`);
        return diffs;
    }

    if (obj1 === null || obj2 === null) {
        diffs.push(`${path}: Value mismatch (${obj1} vs ${obj2})`);
        return diffs;
    }

    if (Array.isArray(obj1)) {
        if (obj1.length !== obj2.length) {
            diffs.push(`${path}: Array length mismatch (${obj1.length} vs ${obj2.length})`);
        }
        for (let i = 0; i < Math.min(obj1.length, obj2.length); i++) {
            diffs.push(...deepCompare(obj1[i], obj2[i], `${path}[${i}]`));
        }
        return diffs;
    }

    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        const allKeys = new Set([...keys1, ...keys2]);

        for (const key of allKeys) {
            if (!keys1.includes(key)) {
                diffs.push(`${path}.${key}: Missing in TS`);
                continue;
            }
            if (!keys2.includes(key)) {
                diffs.push(`${path}.${key}: Missing in Py`);
                continue;
            }

            diffs.push(...deepCompare(obj1[key], obj2[key], `${path}.${key}`));
        }
        return diffs;
    }

    if (obj1 !== obj2) {
        diffs.push(`${path}: Value mismatch ('${obj1}' vs '${obj2}')`);
    }

    return diffs;
}

function main() {
    console.log('🚀 Comparing Runtime JSON: TS vs Python...');

    const files = ['context.json', 'plan.json', 'confirm.json', 'trace.json'];
    let allEquivalent = true;

    for (const file of files) {
        const tsPath = path.join(RUNTIME_OUT_TS_DIR, file);
        const pyPath = path.join(RUNTIME_OUT_PY_DIR, file);

        if (!fs.existsSync(tsPath) || !fs.existsSync(pyPath)) {
            console.error(`❌ Missing file: ${file}`);
            allEquivalent = false;
            continue;
        }

        const tsJson = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
        const pyJson = JSON.parse(fs.readFileSync(pyPath, 'utf-8'));

        const tsNorm = normalize(tsJson);
        const pyNorm = normalize(pyJson);

        const diffs = deepCompare(tsNorm, pyNorm, file);

        if (diffs.length === 0) {
            console.log(`✅ ${file}: EQUIVALENT`);
        } else {
            console.error(`❌ ${file}: DIFFERENCES FOUND`);
            diffs.forEach(d => console.error(`   - ${d}`));
            allEquivalent = false;
        }
    }

    if (allEquivalent) {
        console.log('\n✨ Runtime JSON: TS vs Py – EQUIVALENT');
        process.exit(0);
    } else {
        console.error('\n❌ Runtime JSON comparison failed');
        process.exit(1);
    }
}

main();
