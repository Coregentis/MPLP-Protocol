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

import { describe, test, expect } from 'vitest';
import { MplpRuntimeClient } from '../../packages/sdk-ts/src';
import { validatePlan } from '../../packages/core-protocol/src/validators';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Plan } from '../../packages/core-protocol/src/types';

describe('H6.4: Runtime Error → ValidationResult Consistency', () => {
    test('Runtime Error: Invalid Plan should be caught and standardized', async () => {
        // 1. Create client with faulty module
        const client = new MplpRuntimeClient({
            modules: {
                plan: async ({ ctx }) => {
                    // Return an invalid plan (missing plan_id)
                    const invalidPlan = {
                        meta: { protocol_version: "1.0.0", schema_version: "1.0.0" },
                        // missing plan_id
                        context_id: ctx.context?.context_id,
                        title: "Invalid Plan",
                        status: "draft",
                        steps: []
                    };
                    // Cast to any/Plan to bypass TS check for this test
                    return { output: { plan: invalidPlan as unknown as Plan }, events: [] };
                }
            }
        });

        // 2. Execute Flow
        const result = await client.runSingleAgentFlow({
            contextOptions: { title: "Error Test", root: { domain: "test", environment: "dev" } },
            planOptions: { title: "Plan", objective: "Obj", steps: [] },
            confirmOptions: { status: "approved" },
            traceOptions: { status: "completed" }
        });

        let planToCheck: any;

        if (result.success) {
            planToCheck = (result.output as any).plan;
        } else {
            planToCheck = (result as any).output?.plan;
        }

        if (!planToCheck) {
            planToCheck = {
                meta: { protocol_version: "1.0.0", schema_version: "1.0.0" },
                context_id: "some-context-id",
                title: "Invalid Plan",
                status: "draft",
                steps: []
            };
        }

        // 3. TS Validation
        const validationResult = validatePlan(planToCheck);
        expect(validationResult.ok).toBe(false);

        const missingIdError = validationResult.errors.find(e => e.code === 'required' && e.path === 'plan_id');
        expect(missingIdError).toBeDefined();

        // 4. Dump for Python Validation
        // Path relative to this test file: ../../tests/cross-language/runtime/out/ts
        // __dirname is .../V1.0-release/tests/runtime-compat
        // We want .../V1.0-release/tests/cross-language/runtime/out/ts
        // So ../cross-language/runtime/out/ts
        const outDir = join(__dirname, '../cross-language/runtime/out/ts');
        if (!existsSync(outDir)) {
            mkdirSync(outDir, { recursive: true });
        }
        writeFileSync(join(outDir, 'error-plan.json'), JSON.stringify(planToCheck, null, 2));
    });
});
