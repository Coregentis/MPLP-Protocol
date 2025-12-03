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

import { describe, test, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import {
    validateContext,
    validatePlan,
    validateConfirm,
    validateTrace
} from '../../../packages/core-protocol/src/validators';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const OUT_DIR = join(__dirname, 'out/ts');

// Ensure output directory exists
if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
}

describe('Cross-Language Validation - TypeScript', () => {
    const fixtures = [
        'context_missing_required.json',
        'plan_step_missing_id.json',
        'confirm_invalid_enum.json',
        'context_invalid_uuid.json',
        'context_invalid_datetime.json',
        'context_extra_forbidden.json'
    ];

    fixtures.forEach(fixture => {
        test(`should validate ${fixture} and generate result`, () => {
            const path = join(FIXTURES_DIR, fixture);
            const content = readFileSync(path, 'utf-8');
            const data = JSON.parse(content);

            let result;

            // Determine which validator to use based on filename or content
            if (fixture.startsWith('context')) {
                result = validateContext(data);
            } else if (fixture.startsWith('plan')) {
                result = validatePlan(data);
            } else if (fixture.startsWith('confirm')) {
                result = validateConfirm(data);
            } else if (fixture.startsWith('trace')) {
                result = validateTrace(data);
            } else {
                throw new Error(`Unknown fixture type: ${fixture}`);
            }

            // Write result to file
            const outPath = join(OUT_DIR, fixture);
            writeFileSync(outPath, JSON.stringify(result, null, 2));

            // Basic assertions
            expect(result).toBeDefined();
            expect(result.ok).toBe(false); // All fixtures should be invalid
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
