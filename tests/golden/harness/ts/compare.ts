/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2026 Bangshi Beijing Network Technology Limited Company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { isEqual } from 'lodash'; // Assuming lodash is available or implement simple deep equal

// Since we might not have lodash installed, let's implement a simple deep compare
// that supports ignoring paths.

export interface DiffItem {
    path: string;
    message: string;
}

const IGNORED_PATHS = new Set([
    'context_id', 'plan_id', 'confirm_id', 'trace_id', 'step_id', 'span_id', 'target_id', 'role_id',
    'meta.created_at', 'meta.updated_at', 'requested_at', 'started_at', 'finished_at', 'timestamp',
    'root_span.trace_id', 'root_span.span_id', 'root_span.context_id',
    'run_id', 'correlation_id'
]);

// Helper to check if path should be ignored
// Supports exact match or suffix match for nested properties
function isIgnored(path: string): boolean {
    if (IGNORED_PATHS.has(path)) return true;
    // Check suffixes for nested properties like "steps[0].step_id" -> ends with "step_id"
    // But we need to be careful. "step_id" is in set.
    // "steps[0].step_id" ends with ".step_id" or "step_id"?
    // Let's iterate set.
    for (const ignored of IGNORED_PATHS) {
        if (path === ignored) return true;
        if (path.endsWith('.' + ignored)) return true;
        if (path.endsWith('[' + ignored + ']')) return true; // unlikely
    }
    return false;
}

export function deepCompare(actual: any, expected: any, path: string = ''): DiffItem[] {
    const diffs: DiffItem[] = [];

    if (isIgnored(path)) return diffs;

    if (actual === expected) return diffs;

    if (typeof actual !== typeof expected) {
        diffs.push({ path, message: `Type mismatch: expected ${typeof expected}, got ${typeof actual}` });
        return diffs;
    }

    if (Array.isArray(actual) && Array.isArray(expected)) {
        if (actual.length !== expected.length) {
            diffs.push({ path, message: `Array length mismatch: expected ${expected.length}, got ${actual.length}` });
        }

        const len = Math.min(actual.length, expected.length);
        for (let i = 0; i < len; i++) {
            const currentPath = path ? `${path}[${i}]` : `[${i}]`;
            diffs.push(...deepCompare(actual[i], expected[i], currentPath));
        }
        return diffs;
    }

    if (typeof actual === 'object' && actual !== null && expected !== null) {
        const actualKeys = Object.keys(actual);
        const expectedKeys = Object.keys(expected);

        // Check for missing keys
        for (const key of expectedKeys) {
            if (!actualKeys.includes(key)) {
                const currentPath = path ? `${path}.${key}` : key;
                if (!isIgnored(currentPath)) {
                    diffs.push({ path: currentPath, message: `Missing key` });
                }
            }
        }

        // Check for extra keys? Golden suite says: "Extra Keys: ALLOWED UNLESS additionalProperties: false"
        // We assume allowed by default for comparison, unless strictly enforced by schema validation.
        // So we only compare keys present in expected.

        for (const key of expectedKeys) {
            if (actualKeys.includes(key)) {
                const currentPath = path ? `${path}.${key}` : key;
                diffs.push(...deepCompare(actual[key], expected[key], currentPath));
            }
        }
        return diffs;
    }

    // Primitive mismatch
    if (actual !== expected) {
        diffs.push({ path, message: `Value mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}` });
    }

    return diffs;
}
