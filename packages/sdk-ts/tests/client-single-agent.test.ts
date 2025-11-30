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
