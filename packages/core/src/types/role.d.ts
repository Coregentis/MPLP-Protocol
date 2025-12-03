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
 * Role Module Core Protocol: Describes the minimal required semantics (Core Profile) for capability declarations, permission declarations, and behavioral identity models in multi-agent systems.
 */
export interface Role {
    /** [PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.). */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Role. */
    role_id: any;
    /** [PROTOCOL-CORE] Human-readable name of the role (e.g., 'planner', 'reviewer', 'executor'). */
    name: string;
    /** [PROTOCOL-CORE] Detailed description of the role function, for humans and Agents. */
    description?: string;
    /** [PROTOCOL-CORE] List of capability/permission tags possessed by the role (e.g., 'plan.create', 'confirm.approve'). */
    capabilities?: string[];
    /** [PROTOCOL-CORE] Role creation time (ISO 8601). */
    created_at?: string;
    /** [PROTOCOL-CORE] Role last update time (ISO 8601). */
    updated_at?: string;
    /** [PROTOCOL-CORE] Audit trace reference associated with this role. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this role (creation, permission changes, deactivation, etc.). */
    events?: any[];
}
