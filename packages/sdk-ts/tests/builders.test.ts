import { describe, it, expect } from 'vitest';
import { createContext } from '../src/builders/context-builder';
import { createPlan } from '../src/builders/plan-builder';
import { createConfirm } from '../src/builders/confirm-builder';
import { appendTrace } from '../src/builders/trace-builder';

describe('SDK Builders', () => {
    it('should build a valid Context', () => {
        const context = createContext({
            title: 'Test Context',
            root: { domain: 'test', environment: 'dev' }
        });
        expect(context.context_id).toBeDefined();
        expect(context.title).toBe('Test Context');
        expect(context.status).toBe('active');
    });

    it('should build a valid Plan', () => {
        const context = createContext({
            title: 'Test Context',
            root: { domain: 'test', environment: 'dev' }
        });
        const plan = createPlan(context, {
            title: 'Test Plan',
            objective: 'Test Objective',
            steps: [{ description: 'Step 1' }]
        });
        expect(plan.plan_id).toBeDefined();
        expect(plan.context_id).toBe(context.context_id);
        expect(plan.steps).toHaveLength(1);
    });

    it('should build a valid Confirm', () => {
        const context = createContext({
            title: 'Test Context',
            root: { domain: 'test', environment: 'dev' }
        });
        const plan = createPlan(context, {
            title: 'Test Plan',
            objective: 'Test Objective',
            steps: [{ description: 'Step 1' }]
        });
        const confirm = createConfirm(plan, {
            status: 'approved'
        });
        expect(confirm.confirm_id).toBeDefined();
        expect(confirm.target_id).toBe(plan.plan_id);
        expect(confirm.status).toBe('approved');
    });

    it('should build a valid Trace', () => {
        const context = createContext({
            title: 'Test Context',
            root: { domain: 'test', environment: 'dev' }
        });
        const plan = createPlan(context, {
            title: 'Test Plan',
            objective: 'Test Objective',
            steps: [{ description: 'Step 1' }]
        });
        const trace = appendTrace(context, plan, {
            status: 'completed'
        });
        expect(trace.trace_id).toBeDefined();
        expect(trace.context_id).toBe(context.context_id);
        expect(trace.status).toBe('completed');
    });
});
