/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
