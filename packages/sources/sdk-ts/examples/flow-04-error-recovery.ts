import { ExecutionEngine } from '@mplp/sdk-ts';

async function main() {
    console.log('Running Flow 04: Error Recovery');

    const ctx = { id: 'ctx-flow-04', user: { id: 'user-01' } };
    const plan = {
        id: 'plan-flow-04',
        steps: [
            { id: 'step-01', tool: 'fail_tool', args: {} }
        ]
    };

    const engine = new ExecutionEngine();
    const result = await engine.runSingleAgent(ctx, plan);

    console.log('Status:', result.status);
    console.log('Resilience: Error detected and recovery strategy applied (simulated).');
}

main().catch(console.error);
