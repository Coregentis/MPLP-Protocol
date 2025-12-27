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
/**
 * Flow contract defining the structure of an MPLP coordination flow.
 * FlowContract is the abstract schema for orchestrating module sequences.
 */
export interface FlowContract<TOutput = unknown> {
    /**
     * Unique flow identifier
     */
    id: string;
    /**
     * Human-readable flow name
     */
    name: string;
    /**
     * Flow description
     */
    description?: string;
    /**
     * Flow version (e.g., "1.0.0")
     */
    version: string;
    /**
     * Ordered list of module identifiers in the flow
     */
    modules: string[];
}
/**
 * Single Agent Flow output structure
 */
export interface SingleAgentFlowOutput {
    context: Record<string, unknown>;
    plan: Record<string, unknown>;
    confirm: Record<string, unknown>;
    trace: Record<string, unknown>;
}
/**
 * The canonical Single Agent Flow Contract.
 * Defines the standard 4-module flow: Context → Plan → Confirm → Trace
 */
export declare const SingleAgentFlowContract: FlowContract<SingleAgentFlowOutput>;
//# sourceMappingURL=flow-contract.d.ts.map