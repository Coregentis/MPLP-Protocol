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
import { RuntimeResult, RuntimeModuleRegistry, ValueStateLayer, ActionExecutionLayer } from "@mplp/runtime-minimal";
import { CreateContextOptions } from "../builders/context-builder";
import { CreatePlanOptions } from "../builders/plan-builder";
import { CreateConfirmOptions } from "../builders/confirm-builder";
import { AppendTraceOptions } from "../builders/trace-builder";
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
export declare class MplpRuntimeClient {
    private modules;
    private vsl;
    private ael;
    constructor(options?: MplpRuntimeClientOptions);
    runSingleAgentFlow(input: RunSingleAgentFlowInput): Promise<RuntimeResult>;
}
