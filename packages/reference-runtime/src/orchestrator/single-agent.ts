import type { FlowContract, MplpEvent } from "@mplp/coordination";
import type { SingleAgentFlowOutput } from "@mplp/coordination";
import type { RuntimeContext } from "../types/runtime-context";
import type { RuntimeResult } from "../types/runtime-result";
import type { RuntimeModuleRegistry } from "../registry/modules-registry";
import { getModuleHandler } from "../registry/modules-registry";
import type { ValueStateLayer } from "../vsl";
import type { EmitEvent } from "@mplp/coordination";

export interface SingleAgentRunParams {
    flow: FlowContract<SingleAgentFlowOutput>;
    runtimeContext: RuntimeContext;
    modules: RuntimeModuleRegistry;
    vsl: ValueStateLayer;
    emitEvent?: (event: MplpEvent) => void;
}

export async function runSingleAgentFlow(
    params: SingleAgentRunParams
): Promise<RuntimeResult<SingleAgentFlowOutput>> {
    const { flow, runtimeContext, modules, vsl, emitEvent } = params;
    let ctx = { ...runtimeContext };

    const localEmit: EmitEvent = (event) => {
        ctx.events.push(event);
        if (emitEvent) emitEvent(event);
    };

    try {
        await vsl.saveSnapshot(ctx.ids.runId, ctx);

        for (const step of flow.steps) {
            const handler: any = getModuleHandler(modules, step.module);
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
            } as any);

            const result = await handler({
                input: step.input,
                ctx: ctx.coordination,
                emitEvent: localEmit
            });

            if (step.module === "context") {
                ctx.coordination.context = (result as any).output.context;
            } else if (step.module === "plan") {
                ctx.coordination.plan = (result as any).output.plan;
            } else if (step.module === "confirm") {
                ctx.coordination.confirm = (result as any).output.confirm;
            } else if (step.module === "trace") {
                ctx.coordination.trace = (result as any).output.trace;
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
            } as any);

            await vsl.saveSnapshot(ctx.ids.runId, ctx);
        }

        const output: SingleAgentFlowOutput = {
            context: ctx.coordination.context!,
            plan: ctx.coordination.plan!,
            confirm: ctx.coordination.confirm!,
            trace: ctx.coordination.trace!
        };

        return {
            success: true,
            context: ctx,
            output
        };
    } catch (err: any) {
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
        } as any);

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
