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

import {
    RuntimeContext,
    runSingleAgentFlow,
    RuntimeResult,
    InMemoryAEL,
    InMemoryVSL,
    RuntimeModuleRegistry,
    ValueStateLayer,
    ActionExecutionLayer
} from "@mplp/runtime-minimal";
import { SingleAgentFlowContract } from "@mplp/coordination";
import { createContext, CreateContextOptions } from "../builders/context-builder";
import { createPlan, CreatePlanOptions } from "../builders/plan-builder";
import { createConfirm, CreateConfirmOptions } from "../builders/confirm-builder";
import { appendTrace, AppendTraceOptions } from "../builders/trace-builder";
import { v4 as uuidv4 } from "uuid";

export interface MplpRuntimeClientOptions {
    modules?: RuntimeModuleRegistry;
    vsl?: ValueStateLayer;
    ael?: ActionExecutionLayer;
}

export interface RunSingleAgentFlowInput {
    contextOptions: CreateContextOptions;
    planOptions: CreatePlanOptions;
    confirmOptions: CreateConfirmOptions;
    traceOptions: AppendTraceOptions;
}

export class MplpRuntimeClient {
    private modules: RuntimeModuleRegistry;
    private vsl: ValueStateLayer;
    private ael: ActionExecutionLayer;

    constructor(options: MplpRuntimeClientOptions = {}) {
        this.modules = options.modules || {};
        this.vsl = options.vsl || new InMemoryVSL();
        this.ael = options.ael || new InMemoryAEL();
    }

    async runSingleAgentFlow(input: RunSingleAgentFlowInput): Promise<RuntimeResult> {
        const runId = uuidv4();

        // Default handlers that use the builders and provided options
        const defaultModules: RuntimeModuleRegistry = {
            context: async () => {
                const context = createContext(input.contextOptions);
                return { output: { context }, events: [] };
            },
            plan: async ({ ctx }) => {
                if (!ctx.context) throw new Error("Context missing in coordination state");
                const plan = createPlan(ctx.context, input.planOptions);
                return { output: { plan }, events: [] };
            },
            confirm: async ({ ctx }) => {
                if (!ctx.plan) throw new Error("Plan missing in coordination state");
                const confirm = createConfirm(ctx.plan, input.confirmOptions);
                return { output: { confirm }, events: [] };
            },
            trace: async ({ ctx }) => {
                if (!ctx.context || !ctx.plan) throw new Error("Context or Plan missing in coordination state");
                const trace = appendTrace(ctx.context, ctx.plan, input.traceOptions);
                return { output: { trace }, events: [] };
            }
        };

        // Merge modules: User provided modules override defaults
        // This allows partial overriding (e.g. use default context/plan, but custom confirm)
        const modules: RuntimeModuleRegistry = {
            ...defaultModules,
            ...this.modules
        };

        const runtimeContext: RuntimeContext = {
            ids: { runId },
            coordination: {
                ids: { runId },
                metadata: {}
            },
            events: []
        };

        return await runSingleAgentFlow({
            flow: SingleAgentFlowContract,
            runtimeContext,
            modules,
            vsl: this.vsl
        });
    }
}
