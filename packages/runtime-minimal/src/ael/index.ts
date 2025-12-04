/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
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
