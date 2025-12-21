/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { ToolExecutor, ToolInvocation, ToolInvocationResult } from "./types";
export type ToolHandler = (payload: unknown) => Promise<unknown> | unknown;
export interface ToolRegistry {
    [toolName: string]: ToolHandler;
}
export declare class InMemoryToolExecutor implements ToolExecutor {
    private readonly registry;
    constructor(registry?: ToolRegistry);
    invoke(invocation: ToolInvocation): Promise<ToolInvocationResult>;
}
