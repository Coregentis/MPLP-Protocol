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
import * as fs from 'fs';
import * as path from 'path';
import { createContext } from '../../../packages/sdk-ts/src/builders/context-builder';
import { createPlan } from '../../../packages/sdk-ts/src/builders/plan-builder';
import { createConfirm } from '../../../packages/sdk-ts/src/builders/confirm-builder';
import { appendTrace } from '../../../packages/sdk-ts/src/builders/trace-builder';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUT_DIR = path.join(__dirname, 'out/ts');

describe('Cross-Language Builders - TypeScript', () => {
    test('should generate JSON from canonical fixture', () => {
        // Ensure output directory exists
        if (!fs.existsSync(OUT_DIR)) {
            fs.mkdirSync(OUT_DIR, { recursive: true });
        }

        // Load input fixture
        const inputPath = path.join(FIXTURES_DIR, 'single-agent-input.json');
        const input = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

        // Build Context with all optional fields
        const context = createContext({
            title: input.title,
            root: input.root,
            owner_role: input.owner_role,
            tags: input.tags,
            language: input.language,
            constraints: input.constraints
        });

        // Build Plan  
        const plan = createPlan(context, {
            title: input.plan.title,
            objective: input.plan.objective,
            steps: input.plan.steps
        });

        // Build Confirm
        const confirm = createConfirm(plan, {
            status: input.confirm.status as any,
            requestedByRole: input.confirm.reviewer,
            reason: input.confirm.reason
        });

        // Build Trace
        const trace = appendTrace(context, plan, {
            status: 'running'
        });

        // Assemble result
        const result = {
            context,
            plan,
            confirm,
            trace
        };

        // Write to output
        const outputPath = path.join(OUT_DIR, 'single-agent.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

        // Assertions
        expect(fs.existsSync(outputPath)).toBe(true);
        expect(result.context).toBeDefined();
        expect(result.plan).toBeDefined();
        expect(result.confirm).toBeDefined();
        expect(result.trace).toBeDefined();

        // Verify ID relationships
        expect(result.plan.context_id).toBe(result.context.context_id);
        expect(result.confirm.target_id).toBe(result.plan.plan_id);
        expect(result.trace.context_id).toBe(result.context.context_id);
    });
});
