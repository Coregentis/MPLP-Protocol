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
