import { ExecutionEngine } from '@mplp/sdk-ts';

async function main() {
    console.log('Running Flow 01: Single Agent');

    const ctx = { id: 'ctx-flow-01', user: { id: 'user-01' } };
    const plan = {
        id: 'plan-flow-01',
        steps: [{ id: 'step-01', tool: 'search', args: { query: 'hello' } }]
    };

    const engine = new ExecutionEngine();
    const result = await engine.runSingleAgent(ctx, plan);

    console.log('Status:', result.status);
}

main().catch(console.error);
