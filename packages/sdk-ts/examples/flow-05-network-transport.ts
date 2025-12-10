import { ExecutionEngine } from '@mplp/sdk-ts';

async function main() {
    console.log('Running Flow 05: Network Transport');

    const ctx = { id: 'ctx-flow-05', user: { id: 'user-01' } };
    const plan = {
        id: 'plan-flow-05',
        steps: [
            { id: 'step-01', tool: 'broadcast', args: { message: 'hello network' } }
        ]
    };

    const engine = new ExecutionEngine();
    const result = await engine.runSingleAgent(ctx, plan);

    console.log('Status:', result.status);
    console.log('Network: Event broadcasted to mesh (simulated).');
}

main().catch(console.error);
