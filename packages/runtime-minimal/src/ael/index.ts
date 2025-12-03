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

import type { RuntimeContext } from "../types/runtime-context";
import type { MplpEvent } from "@mplp/coordination";

export interface ActionExecutionLayer {
    executeAction(params: {
        module: string;
        stepId?: string;
        input: unknown;
        context: RuntimeContext;
    }): Promise<{
        output: unknown;
        events?: MplpEvent[];
    }>;
}

/**
 * InMemoryAEL
 *
 * Reference implementation used for tests and examples.
 * It does NOT call any real external systems.
 */
export class InMemoryAEL implements ActionExecutionLayer {
    async executeAction(params: {
        module: string;
        stepId?: string;
        input: unknown;
        context: RuntimeContext;
    }): Promise<{ output: unknown; events?: MplpEvent[] }> {
        // For now, simply echo the input as output.
        return {
            output: params.input,
            events: []
        };
    }
}
