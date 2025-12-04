/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * Collab Module Core Protocol: Describes the minimal required semantics (Core Profile) for multi-agent / multi-role collaboration sessions.
 */
export interface Collab {
    /** [PROTOCOL-CORE] Protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the collaboration session. */
    collab_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this collaboration session belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Collaboration session title. */
    title: string;
    /** [PROTOCOL-CORE] Description of the purpose/goal of the collaboration. */
    purpose: string;
    /** [PROTOCOL-CORE] Collaboration mode (broadcast, round_robin, orchestrated, etc.). */
    mode: 'broadcast' | 'round_robin' | 'orchestrated' | 'swarm' | 'pair';
    /** [PROTOCOL-CORE] Collaboration session status. */
    status: 'draft' | 'active' | 'suspended' | 'completed' | 'cancelled';
    /** [PROTOCOL-CORE] List of roles/Agents participating in the collaboration. */
    participants: any[];
    /** [PROTOCOL-CORE] Creation time (ISO 8601). */
    created_at: string;
    /** [PROTOCOL-CORE] Last update time (ISO 8601). */
    updated_at?: string;
    /** [PROTOCOL-CORE] Trace reference bound to this collaboration session. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this collaboration. */
    events?: any[];
}
