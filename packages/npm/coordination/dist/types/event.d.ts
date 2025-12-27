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
 * MPLP Event interface for protocol-level observability.
 * Events are part of the 3-Physical/12-Logical event model.
 */
export interface MplpEvent {
    /**
     * Event type identifier (e.g., "context.created", "plan.approved")
     */
    type: string;
    /**
     * ISO 8601 timestamp when event was created
     */
    timestamp: string;
    /**
     * Run identifier this event belongs to
     */
    runId: string;
    /**
     * Optional module that emitted the event
     */
    module?: string;
    /**
     * Event payload data
     */
    payload?: Record<string, unknown>;
}
/**
 * Create an MPLP event with current timestamp
 */
export declare function createMplpEvent(type: string, runId: string, payload?: Record<string, unknown>, module?: string): MplpEvent;
//# sourceMappingURL=event.d.ts.map