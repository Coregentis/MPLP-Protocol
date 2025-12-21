/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
export interface ToolInvocation {
    toolName: string;
    payload: unknown;
}

export interface ToolInvocationResult {
    toolName: string;
    success: boolean;
    output?: unknown;
    errorMessage?: string;
}

export interface ToolExecutor {
    invoke(
        invocation: ToolInvocation
    ): Promise<ToolInvocationResult>;
}
