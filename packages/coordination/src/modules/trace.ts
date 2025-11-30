import type { Trace } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface TraceModuleInput {
    traceId?: string;
    parentSpanId?: string;
}

export interface TraceModuleOutput {
    trace: Trace;
}

export type TraceModuleHandler = ModuleHandler<TraceModuleInput, TraceModuleOutput>;
