/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { MplpRuntimeClient } from '../packages/sdk-ts/src';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function main() {
    console.log('🚀 Dumping Runtime Single Agent Flow Output...');

    const client = new MplpRuntimeClient();

    // 1. Execute Flow
    const result = await client.runSingleAgentFlow({
        contextOptions: {
            title: "Runtime Compat Test",
            root: { domain: "test", environment: "ci" }
        },
        planOptions: {
            title: "Test Plan",
            objective: "Verify compatibility",
            steps: [{ description: "Step 1" }]
        },
        confirmOptions: {
            status: "approved"
        },
        traceOptions: {
            status: "completed"
        }
    });

    if (!result.success) {
        console.error('❌ Flow failed:', result.error);
        process.exit(1);
    }

    const { context, plan, confirm, trace } = result.output as any;

    // 2. Write JSONs
    const outDir = join(__dirname, '../tests/cross-language/runtime/out/ts');
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }

    writeFileSync(join(outDir, 'context.json'), JSON.stringify(context, null, 2));
    writeFileSync(join(outDir, 'plan.json'), JSON.stringify(plan, null, 2));
    writeFileSync(join(outDir, 'confirm.json'), JSON.stringify(confirm, null, 2));
    writeFileSync(join(outDir, 'trace.json'), JSON.stringify(trace, null, 2));

    console.log(`✅ Dumped 4 JSON files to ${outDir}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
