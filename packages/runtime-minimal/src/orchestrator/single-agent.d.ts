/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { FlowContract, MplpEvent } from "@mplp/coordination";
import type { SingleAgentFlowOutput } from "@mplp/coordination";
import type { RuntimeContext } from "../types/runtime-context";
import type { RuntimeResult } from "../types/runtime-result";
import type { RuntimeModuleRegistry } from "../registry/modules-registry";
import type { ValueStateLayer } from "../vsl";
export interface SingleAgentRunParams {
    flow: FlowContract<SingleAgentFlowOutput>;
    runtimeContext: RuntimeContext;
    modules: RuntimeModuleRegistry;
    vsl: ValueStateLayer;
    emitEvent?: (event: MplpEvent) => void;
}
export declare function runSingleAgentFlow(params: SingleAgentRunParams): Promise<RuntimeResult<SingleAgentFlowOutput>>;
