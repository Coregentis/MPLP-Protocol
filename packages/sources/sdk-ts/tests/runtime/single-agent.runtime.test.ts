import { describe, it, expect } from 'vitest';
import { ExecutionEngine } from '@mplp/runtime';
import { Context, Plan } from '@mplp/types';
import contextJson from '../fixtures/flow_01/context.json';
import planJson from '../fixtures/flow_01/plan.json';

describe('Runtime: Single Agent Flow', () => {
    it('should execute a single agent plan successfully', async () => {
        const context = contextJson as unknown as Context;
        const plan = planJson as unknown as Plan;

        const engine = new ExecutionEngine();
        const result = await engine.runSingleAgent(context, plan);

        expect(result).toBeDefined();
        expect(result.status).toBe('completed');
        expect(result.artifacts).toBeDefined();
    });
});
