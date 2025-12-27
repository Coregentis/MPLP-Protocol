import { ExecutionEngine } from '@mplp/sdk-ts';

async function main() {
    console.log('Running Flow 02: Multi-Agent Coordination');

    const ctx = { id: 'ctx-flow-02', user: { id: 'user-01' }, state: { mode: 'multi-agent' } };
    const plan = {
        id: 'plan-flow-02',
        steps: [
            { id: 'step-01', tool: 'delegate', args: { agent: 'researcher', task: 'search' } },
            { id: 'step-02', tool: 'delegate', args: { agent: 'writer', task: 'summarize' } }
        ]
    };

    const engine = new ExecutionEngine();
    const result = await engine.runSingleAgent(ctx, plan);

    console.log('Status:', result.status);
    console.log('Coordination: Simulated delegation to researcher and writer.');
}

main().catch(console.error);
