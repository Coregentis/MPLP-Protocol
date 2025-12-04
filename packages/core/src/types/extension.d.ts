/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * Extension Module Core Protocol: Describes the minimal required semantics (Core Profile) for the MPLP plugin system, capability injection, and protocol enhancement points.
 */
export interface Extension {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Extension. */
    extension_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this Extension belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Extension name (human-readable). */
    name: string;
    /** [PROTOCOL-CORE] Extension type classification. */
    extension_type: 'capability' | 'policy' | 'integration' | 'transformation' | 'validation' | 'other';
    /** [PROTOCOL-CORE] Extension version (SemVer format). */
    version: string;
    /** [PROTOCOL-CORE] Extension status. */
    status: 'registered' | 'active' | 'inactive' | 'deprecated';
    /** [PROTOCOL-CORE] Extension configuration object (L2 safe, implementation details excluded). */
    config?: {
        [key: string]: any;
    };
    /** [PROTOCOL-CORE] Trace reference bound to this Extension. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this Extension. */
    events?: any[];
}
