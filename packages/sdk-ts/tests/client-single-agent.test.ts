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

import { describe, it, expect } from 'vitest';
import { MplpRuntimeClient } from '../src/client/runtime-client';
import { SingleAgentFlowOutput } from '@mplp/coordination';

describe('MplpRuntimeClient', () => {
    it('should run a single agent flow with default builders', async () => {
        const client = new MplpRuntimeClient();

        const result = await client.runSingleAgentFlow({
            contextOptions: {
                title: 'Integration Test',
                root: { domain: 'test', environment: 'ci' }
            },
            planOptions: {
                title: 'Test Plan',
                objective: 'Verify Client',
                steps: [{ description: 'Do something' }]
            },
            confirmOptions: {
                status: 'approved'
            },
            traceOptions: {
                status: 'completed'
            }
        });

        expect(result.success).toBe(true);
        if (result.success) {
            const output = result.output as SingleAgentFlowOutput;
            expect(output.context.title).toBe('Integration Test');
            expect(output.plan.title).toBe('Test Plan');
            expect(output.confirm.status).toBe('approved');
            expect(output.trace.status).toBe('completed');
        }
    });
});
