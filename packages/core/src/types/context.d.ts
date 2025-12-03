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
 * Context Module Core Protocol: Describes the context resources and their minimal required semantics (Core Profile) for a multi-agent collaboration project/session.
 */
export interface Context {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata (version, source, cross-cutting tags, etc.). */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Context. */
    context_id: any;
    /** [PROTOCOL-CORE] Context root node definition (business domain, environment, entry point resources, etc.). */
    root: {
        [key: string]: any;
    };
    /** [PROTOCOL-CORE] Context title, used for human and Agent identification of the project/session. */
    title: string;
    /** [PROTOCOL-CORE] Brief summary of the Context (background, scope, etc.). */
    summary?: string;
    /** [PROTOCOL-CORE] Current lifecycle status of the Context. */
    status: 'draft' | 'active' | 'suspended' | 'archived' | 'closed';
    /** [PROTOCOL-CORE] List of tags for classification and retrieval. */
    tags?: string[];
    /** [PROTOCOL-CORE] Primary working language of the Context (e.g., en, zh-CN). */
    language?: string;
    /** [PROTOCOL-CORE] Identifier of the primary owner role (should correspond to role_id in Role module). */
    owner_role?: string;
    /** [PROTOCOL-CORE] Key constraints for the Context, such as security boundaries, compliance requirements, budget, or deadlines. */
    constraints?: {
        [key: string]: any;
    };
    /** [PROTOCOL-CORE] Context creation time (ISO 8601). */
    created_at?: string;
    /** [PROTOCOL-CORE] Context last update time (ISO 8601). */
    updated_at?: string;
    /** [PROTOCOL-CORE] Main Trace reference bound to this Context (for global tracing). */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this Context (creation, status change, archiving, etc.). */
    events?: any[];
}
