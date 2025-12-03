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

import { describe, it, expect } from "vitest";

import { SingleAgentFlowContract } from "@mplp/coordination";
import {
    runSingleAgentFlow
} from "../src/orchestrator/single-agent";
import { InMemoryVSL } from "../src/vsl";
import type { RuntimeContext } from "../src/types/runtime-context";
import type {
    ContextModuleHandler,
    PlanModuleHandler,
    ConfirmModuleHandler,
    TraceModuleHandler
} from "@mplp/coordination";

const contextHandler: ContextModuleHandler = async ({ ctx }) => ({
    output: {
        context: {
            meta: {
                protocol_version: "1.0.0",
                schema_version: "1.0.0",
                created_at: new Date().toISOString()
            },
            context_id: "00000000-0000-0000-0000-000000000001",
            root: { domain: "test", environment: "test" },
            title: "Test Context",
            status: "active"
        }
    },
    events: []
});

const planHandler: PlanModuleHandler = async ({ ctx }) => ({
    output: {
        plan: {
            meta: {
                protocol_version: "1.0.0",
                schema_version: "1.0.0",
                created_at: new Date().toISOString()
            },
            plan_id: "00000000-0000-0000-0000-000000000002",
            context_id: ctx.context?.context_id ?? "",
            steps: []
        }
    },
    events: []
});

const confirmHandler: ConfirmModuleHandler = async ({ ctx }) => ({
    output: {
        confirm: {
            meta: {
                protocol_version: "1.0.0",
                schema_version: "1.0.0",
                created_at: new Date().toISOString()
            },
            confirm_id: "00000000-0000-0000-0000-000000000003",
            plan_id: ctx.plan?.plan_id ?? "",
            status: "approved"
        }
    },
    events: []
});

const traceHandler: TraceModuleHandler = async ({ ctx }) => ({
    output: {
        trace: {
            meta: {
                protocol_version: "1.0.0",
                schema_version: "1.0.0",
                created_at: new Date().toISOString()
            },
            trace_id: "00000000-0000-0000-0000-000000000004",
            context_id: ctx.context?.context_id ?? "",
            plan_id: ctx.plan?.plan_id ?? "",
            confirm_id: ctx.confirm?.confirm_id ?? "",
            entries: []
        }
    },
    events: []
});

describe("Reference Runtime �?Single Agent Flow", () => {
    it("should execute SingleAgentFlowContract successfully", async () => {
        const vsl = new InMemoryVSL();

        const runtimeContext: RuntimeContext = {
            ids: { runId: "run-1" },
            coordination: {
                ids: { runId: "run-1" },
                metadata: {}
            },
            events: []
        };

        const modules = {
            context: contextHandler,
            plan: planHandler,
            confirm: confirmHandler,
            trace: traceHandler
        };

        const result = await runSingleAgentFlow({
            flow: SingleAgentFlowContract,
            runtimeContext,
            modules,
            vsl
        });

        expect(result.success).toBe(true);
        expect(result.output?.context).toBeDefined();
        expect(result.output?.plan).toBeDefined();
        expect(result.output?.confirm).toBeDefined();
        expect(result.output?.trace).toBeDefined();

        const events = await vsl.getEvents("run-1");
        expect(Array.isArray(events)).toBe(true);
    });
});
