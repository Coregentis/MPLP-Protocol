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

const fs = require('fs');
const path = require('path');

const IGNORED_FIELDS = [
    'context_id',
    'plan_id',
    'confirm_id',
    'trace_id',
    'step_id',
    'span_id',
    'created_at',
    'requested_at',
    'started_at',
    'finished_at',
    'updated_at'
];

function normalizeJSON(obj, pathStr = '') {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item, i) => normalizeJSON(item, `${pathStr}[${i}]`));
    }

    if (typeof obj === 'object') {
        const normalized = {};
        for (const key of Object.keys(obj)) {
            if (IGNORED_FIELDS.includes(key)) {
                continue;
            }
            normalized[key] = normalizeJSON(obj[key], pathStr ? `${pathStr}.${key}` : key);
        }
        return normalized;
    }

    return obj;
}

const tsPath = path.join(__dirname, '../tests/cross-language/builders/out/ts/single-agent.json');
const pyPath = path.join(__dirname, '../tests/cross-language/builders/out/py/single-agent.json');

const tsData = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
const pyData = JSON.parse(fs.readFileSync(pyPath, 'utf-8'));

const tsNorm = normalizeJSON(tsData);
const pyNorm = normalizeJSON(pyData);

console.log("TS Normalized:", JSON.stringify(tsNorm, null, 2));
console.log("\nPY Normalized:", JSON.stringify(pyNorm, null, 2));

console.log("\nAre they equal?", JSON.stringify(tsNorm) === JSON.stringify(pyNorm));
