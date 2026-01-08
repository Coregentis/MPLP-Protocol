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

// @ts-nocheck
import {
    runSingleAgentFlow,
    InMemoryVSL,
    type RuntimeContext,
    type RuntimeModuleRegistry,
    SingleAgentFlowContract
} from "@mplp/sdk-ts";
import { join } from "path";

async function main() {
    console.log("Starting Single Agent Basic Example...");

    // 1. Setup Storage (Skipped in minimal example)
    // const storage = new JsonFsStorage({ baseDir: join(__dirname, "../data") });
    // await storage.write("startup-log", { startedAt: new Date().toISOString() });
    console.log("Startup log skipped (storage integration not available)");

    // 2. Setup Runtime Context
    const runtimeContext: RuntimeContext = {
        ids: { runId: "example-run-1" },
        coordination: {
            ids: { runId: "example-run-1" },
            metadata: {}
        },
        events: []
    };

    // 3. Setup Module Handlers (Stubs for example)
    const modules: RuntimeModuleRegistry = {
        context: async ({ ctx }) => ({
            output: {
                context: {
                    meta: { protocol_version: "1.0.0", schema_version: "1.0.0", created_at: new Date().toISOString() },
                    context_id: "ctx-1",
                    root: { domain: "example", environment: "dev" },
                    title: "Example Context",
                    status: "active"
                }
            },
            events: []
        }),
        plan: async ({ ctx }) => ({
            output: {
                plan: {
                    meta: { protocol_version: "1.0.0", schema_version: "1.0.0", created_at: new Date().toISOString() },
                    plan_id: "plan-1",
                    context_id: ctx.context?.context_id ?? "ctx-1",
                    title: "Example Plan",
                    objective: "Demonstrate Single Agent Flow",
                    status: "draft",
                    steps: [{ id: "step-1", title: "Hello World" }]
                }
            },
            events: []
        }),
        confirm: async ({ ctx }) => ({
            output: {
                confirm: {
                    meta: { protocol_version: "1.0.0", schema_version: "1.0.0", created_at: new Date().toISOString() },
                    confirm_id: "confirm-1",
                    target_type: "plan",
                    target_id: ctx.plan?.plan_id ?? "plan-1",
                    requested_by_role: "system",
                    requested_at: new Date().toISOString(),
                    status: "approved"
                }
            },
            events: []
        }),
        trace: async ({ ctx }) => ({
            output: {
                trace: {
                    meta: { protocol_version: "1.0.0", schema_version: "1.0.0", created_at: new Date().toISOString() },
                    trace_id: "trace-1",
                    context_id: ctx.context?.context_id ?? "ctx-1",
                    plan_id: ctx.plan?.plan_id ?? "plan-1",
                    status: "completed",
                    root_span: {
                        span_id: "span-1",
                        name: "root",
                        start_time: new Date().toISOString(),
                        end_time: new Date().toISOString(),
                        status: "ok"
                    }
                }
            },
            events: []
        })
    };

    // 4. Run Flow
    const vsl = new InMemoryVSL();
    console.log("Running flow...");

    const result = await runSingleAgentFlow({
        flow: SingleAgentFlowContract,
        runtimeContext,
        modules,
        vsl
    });

    if (result.success) {
        console.log("✅ Flow succeeded!");
        console.log("Context ID:", result.output?.context.context_id);
        console.log("Plan ID:", result.output?.plan.plan_id);
        console.log("Confirm Status:", result.output?.confirm.status);
        console.log("Trace Root Span:", result.output?.trace.root_span.name);
        console.log("Total Events:", result.context.events.length);
    } else {
        console.error("❌ Flow failed:", result.error);
        process.exit(1);
    }
}

main().catch(err => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
