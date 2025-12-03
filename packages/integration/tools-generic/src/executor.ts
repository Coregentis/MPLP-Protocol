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

import type {
    ToolExecutor,
    ToolInvocation,
    ToolInvocationResult
} from "./types";

export type ToolHandler = (payload: unknown) => Promise<unknown> | unknown;

export interface ToolRegistry {
    [toolName: string]: ToolHandler;
}

export class InMemoryToolExecutor implements ToolExecutor {
    constructor(private readonly registry: ToolRegistry = {}) { }

    async invoke(
        invocation: ToolInvocation
    ): Promise<ToolInvocationResult> {
        const handler = this.registry[invocation.toolName];
        if (!handler) {
            return {
                toolName: invocation.toolName,
                success: false,
                errorMessage: "Tool not registered"
            };
        }

        try {
            const output = await handler(invocation.payload);
            return {
                toolName: invocation.toolName,
                success: true,
                output
            };
        } catch (err: any) {
            return {
                toolName: invocation.toolName,
                success: false,
                errorMessage: String(err?.message ?? err)
            };
        }
    }
}
