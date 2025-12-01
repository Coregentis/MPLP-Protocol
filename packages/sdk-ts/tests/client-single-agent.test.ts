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
