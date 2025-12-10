import { ExecutionEngine } from '@mplp/sdk-ts';

async function main() {
    console.log('Running Flow 03: Risk Confirmation');

    const ctx = { id: 'ctx-flow-03', user: { id: 'user-01' }, state: { risk_level: 'high' } };
    const plan = {
        id: 'plan-flow-03',
        steps: [
            { id: 'step-01', tool: 'delete_database', args: { target: 'prod' }, risk: 'high' }
        ]
    };

    const engine = new ExecutionEngine();
    const result = await engine.runSingleAgent(ctx, plan);

    console.log('Status:', result.status);
    console.log('Governance: Risk gate triggered. Action simulated.');
}

main().catch(console.error);
