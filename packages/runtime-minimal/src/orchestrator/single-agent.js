"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSingleAgentFlow = runSingleAgentFlow;
const modules_registry_1 = require("../registry/modules-registry");
async function runSingleAgentFlow(params) {
    const { flow, runtimeContext, modules, vsl, emitEvent } = params;
    let ctx = { ...runtimeContext };
    const localEmit = (event) => {
        ctx.events.push(event);
        if (emitEvent)
            emitEvent(event);
    };
    try {
        await vsl.saveSnapshot(ctx.ids.runId, ctx);
        for (const step of flow.steps) {
            const handler = (0, modules_registry_1.getModuleHandler)(modules, step.module);
            if (!handler) {
                return {
                    success: false,
                    context: ctx,
                    error: {
                        code: "MODULE_NOT_REGISTERED",
                        message: `No handler registered for module "${step.module}"`
                    }
                };
            }
            localEmit({
                id: `${ctx.ids.runId}:${step.module}:start`,
                kind: "pipeline.stage",
                timestamp: new Date().toISOString(),
                runId: ctx.ids.runId,
                module: step.module,
                payload: {
                    stage: step.module,
                    status: "started"
                }
            });
            const result = await handler({
                input: step.input,
                ctx: ctx.coordination,
                emitEvent: localEmit
            });
            if (step.module === "context") {
                ctx.coordination.context = result.output.context;
            }
            else if (step.module === "plan") {
                ctx.coordination.plan = result.output.plan;
            }
            else if (step.module === "confirm") {
                ctx.coordination.confirm = result.output.confirm;
            }
            else if (step.module === "trace") {
                ctx.coordination.trace = result.output.trace;
            }
            if (result.events && result.events.length > 0) {
                await vsl.appendEvents(ctx.ids.runId, result.events);
                ctx.events.push(...result.events);
            }
            localEmit({
                id: `${ctx.ids.runId}:${step.module}:completed`,
                kind: "pipeline.stage",
                timestamp: new Date().toISOString(),
                runId: ctx.ids.runId,
                module: step.module,
                payload: {
                    stage: step.module,
                    status: "completed"
                }
            });
            await vsl.saveSnapshot(ctx.ids.runId, ctx);
        }
        const output = {
            context: ctx.coordination.context,
            plan: ctx.coordination.plan,
            confirm: ctx.coordination.confirm,
            trace: ctx.coordination.trace
        };
        return {
            success: true,
            context: ctx,
            output
        };
    }
    catch (err) {
        localEmit({
            id: `${ctx.ids.runId}:runtime:error`,
            kind: "runtime.error",
            timestamp: new Date().toISOString(),
            runId: ctx.ids.runId,
            payload: {
                code: "RUNTIME_EXCEPTION",
                message: String(err?.message ?? err),
                stack: err?.stack
            }
        });
        return {
            success: false,
            context: ctx,
            error: {
                code: "RUNTIME_EXCEPTION",
                message: String(err?.message ?? err)
            }
        };
    }
}
