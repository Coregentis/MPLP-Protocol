"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MplpRuntimeClient = void 0;
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const runtime_minimal_1 = require("@mplp/runtime-minimal");
const coordination_1 = require("@mplp/coordination");
const context_builder_1 = require("../builders/context-builder");
const plan_builder_1 = require("../builders/plan-builder");
const confirm_builder_1 = require("../builders/confirm-builder");
const trace_builder_1 = require("../builders/trace-builder");
const uuid_1 = require("uuid");
class MplpRuntimeClient {
    constructor(options = {}) {
        this.modules = options.modules || {};
        this.vsl = options.vsl || new runtime_minimal_1.InMemoryVSL();
        this.ael = options.ael || new runtime_minimal_1.InMemoryAEL();
    }
    async runSingleAgentFlow(input) {
        const runId = (0, uuid_1.v4)();
        // Default handlers that use the builders and provided options
        const defaultModules = {
            context: async () => {
                const context = (0, context_builder_1.createContext)(input.contextOptions);
                return { output: { context }, events: [] };
            },
            plan: async ({ ctx }) => {
                if (!ctx.context)
                    throw new Error("Context missing in coordination state");
                const plan = (0, plan_builder_1.createPlan)(ctx.context, input.planOptions);
                return { output: { plan }, events: [] };
            },
            confirm: async ({ ctx }) => {
                if (!ctx.plan)
                    throw new Error("Plan missing in coordination state");
                const confirm = (0, confirm_builder_1.createConfirm)(ctx.plan, input.confirmOptions);
                return { output: { confirm }, events: [] };
            },
            trace: async ({ ctx }) => {
                if (!ctx.context || !ctx.plan)
                    throw new Error("Context or Plan missing in coordination state");
                const trace = (0, trace_builder_1.appendTrace)(ctx.context, ctx.plan, input.traceOptions);
                return { output: { trace }, events: [] };
            }
        };
        // Merge modules: User provided modules override defaults
        // This allows partial overriding (e.g. use default context/plan, but custom confirm)
        const modules = {
            ...defaultModules,
            ...this.modules
        };
        const runtimeContext = {
            ids: { runId },
            coordination: {
                ids: { runId },
                metadata: {}
            },
            events: []
        };
        return await (0, runtime_minimal_1.runSingleAgentFlow)({
            flow: coordination_1.SingleAgentFlowContract,
            runtimeContext,
            modules,
            vsl: this.vsl
        });
    }
}
exports.MplpRuntimeClient = MplpRuntimeClient;
