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
 * Plan Module Core Protocol: Describes the plan objects and their lifecycle minimal required semantics (Core Profile) in multi-agent collaboration.
 */
export interface Plan {
    /** [PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.). */
    meta: any;
    /** [PROTOCOL-CORE] Global unique identifier for the Plan. */
    plan_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this Plan belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Plan title (brief description for humans and Agents). */
    title: string;
    /** [PROTOCOL-CORE] Description of the objective to be achieved by the Plan. */
    objective: string;
    /** [PROTOCOL-CORE] Status of the Plan in its lifecycle. */
    status: 'draft' | 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
    /** [PROTOCOL-CORE] List of core steps decomposed from the Plan. */
    steps: any[];
    /** [PROTOCOL-CORE] Main execution trace reference associated with this Plan. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly associated with this Plan (changes, approvals, status transitions, etc.). */
    events?: any[];
}
