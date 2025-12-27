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
    invoke(invocation: ToolInvocation): Promise<ToolInvocationResult>;
}
