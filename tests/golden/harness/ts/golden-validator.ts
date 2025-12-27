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

import { GoldenFlowDefinition, GoldenInvariant } from './loader';
import { deepCompare, DiffItem } from './compare';
import { getValueNodesByPath } from './path-utils';
import {
    validateContext, validatePlan, validateConfirm, validateTrace
} from '../../../../packages/sources/sdk-ts/src/core/validators';

// Legacy single-value path getter (kept for eq() rule)
function getValueByPath(obj: any, path: string): any {
    const normalized = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalized.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
    }
    return current;
}

export interface GoldenResult {
    flowId: string;
    success: boolean;
    diffs: DiffItem[];
}

export async function validateGoldenFlow(
    def: GoldenFlowDefinition,
    runtimeOutput: {
        context?: any;
        plan?: any;
        confirm?: any;
        trace?: any;
        events?: any[];
    }
): Promise<GoldenResult> {
    const diffs: DiffItem[] = [];

    // 1. Schema Validation
    if (runtimeOutput.context) {
        const res = validateContext(runtimeOutput.context);
        if (!res.ok) diffs.push({ path: 'context', message: `Schema Validation Failed: ${JSON.stringify(res.errors)}` });
    }
    if (runtimeOutput.plan) {
        const res = validatePlan(runtimeOutput.plan);
        if (!res.ok) diffs.push({ path: 'plan', message: `Schema Validation Failed: ${JSON.stringify(res.errors)}` });
    }
    if (runtimeOutput.confirm) {
        const res = validateConfirm(runtimeOutput.confirm);
        if (!res.ok) diffs.push({ path: 'confirm', message: `Schema Validation Failed: ${JSON.stringify(res.errors)}` });
    }
    if (runtimeOutput.trace) {
        const res = validateTrace(runtimeOutput.trace);
        if (!res.ok) diffs.push({ path: 'trace', message: `Schema Validation Failed: ${JSON.stringify(res.errors)}` });
    }

    // 2. Structural Comparison against Expected
    if (def.expected.context && runtimeOutput.context) {
        diffs.push(...deepCompare(runtimeOutput.context, def.expected.context, 'context'));
    }
    if (def.expected.plan && runtimeOutput.plan) {
        diffs.push(...deepCompare(runtimeOutput.plan, def.expected.plan, 'plan'));
    }
    if (def.expected.confirm && runtimeOutput.confirm) {
        diffs.push(...deepCompare(runtimeOutput.confirm, def.expected.confirm, 'confirm'));
    }
    if (def.expected.trace && runtimeOutput.trace) {
        diffs.push(...deepCompare(runtimeOutput.trace, def.expected.trace, 'trace'));
    }
    if (def.expected.events && runtimeOutput.events) {
        diffs.push(...deepCompare(runtimeOutput.events, def.expected.events, 'events'));
    }

    // 3. Invariant Checks with Wildcard Path Support
    const allInvariants = [...def.globalInvariants, ...(def.expected.invariants || [])];

    const rootObj = {
        context: runtimeOutput.context,
        plan: runtimeOutput.plan,
        confirm: runtimeOutput.confirm,
        trace: runtimeOutput.trace,
        events: runtimeOutput.events
    };

    for (const inv of allInvariants) {
        const scope = inv.scope;
        if (!scope || !rootObj[scope as keyof typeof rootObj]) continue;

        const targetObj = rootObj[scope as keyof typeof rootObj];

        // Use getValueNodesByPath to support wildcard paths like steps[*].description
        const nodes = getValueNodesByPath(targetObj, inv.path);

        if (nodes.length === 0) {
            // Path not found - this might be expected for optional fields
            continue;
        }

        for (const node of nodes) {
            const { path: nodePath, value: val } = node;
            let passed = true;
            let errorMsg = '';

            if (inv.rule === 'uuid-v4') {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (typeof val !== 'string' || !uuidRegex.test(val)) {
                    passed = false;
                    errorMsg = `Expected UUID v4, got ${val}`;
                }
            } else if (inv.rule === 'non-empty-string') {
                if (typeof val !== 'string' || val.trim().length === 0) {
                    passed = false;
                    errorMsg = `Expected non-empty string`;
                }
            } else if (inv.rule === 'exists') {
                if (val === undefined || val === null) {
                    passed = false;
                    errorMsg = `Expected value to exist`;
                }
            } else if (inv.rule === 'iso-datetime') {
                if (typeof val !== 'string' || isNaN(Date.parse(val))) {
                    passed = false;
                    errorMsg = `Expected ISO datetime, got ${val}`;
                }
            } else if (inv.rule.startsWith('eq(')) {
                const arg = inv.rule.slice(3, -1);
                let expectedVal: any;
                if (arg.startsWith('"') && arg.endsWith('"')) {
                    expectedVal = arg.slice(1, -1);
                } else {
                    expectedVal = getValueByPath(rootObj, arg);
                }

                if (val !== expectedVal) {
                    passed = false;
                    errorMsg = `Expected ${expectedVal}, got ${val}`;
                }
            } else if (inv.rule.startsWith('min-length(')) {
                // New rule: min-length(N) - for arrays or strings
                const match = inv.rule.match(/^min-length\((\d+)\)$/);
                if (match) {
                    const minLen = Number(match[1]);
                    const actualLen = Array.isArray(val) ? val.length :
                        typeof val === 'string' ? val.length :
                            null;
                    if (actualLen === null || actualLen < minLen) {
                        passed = false;
                        errorMsg = `Expected min length ${minLen}, got ${actualLen ?? 'non-array/string'}`;
                    }
                } else {
                    passed = false;
                    errorMsg = `Invalid min-length rule syntax: ${inv.rule}`;
                }
            } else if (inv.rule.startsWith('enum(')) {
                // New rule: enum(val1,val2,val3)
                const match = inv.rule.match(/^enum\((.+)\)$/);
                if (match) {
                    const enumVals = match[1].split(',').map(v => v.trim()).filter(Boolean);
                    if (!enumVals.includes(val)) {
                        passed = false;
                        errorMsg = `Expected one of [${enumVals.join(', ')}], got '${val}'`;
                    }
                } else {
                    passed = false;
                    errorMsg = `Invalid enum rule syntax: ${inv.rule}`;
                }
            } else if (inv.rule === 'positive-integer') {
                // New rule: positive-integer
                if (typeof val !== 'number' || !Number.isInteger(val) || val <= 0) {
                    passed = false;
                    errorMsg = `Expected positive integer, got '${val}' (type: ${typeof val})`;
                }
            }

            if (!passed) {
                diffs.push({
                    path: `${scope}.${nodePath}`,
                    message: `Invariant ${inv.id} failed: ${errorMsg}`
                });
            }
        }
    }

    return {
        flowId: def.flowId,
        success: diffs.length === 0,
        diffs
    };
}
