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
 * Network Module Core Protocol: Describes the minimal required semantics (Core Profile) for the topology and node collection of a multi-agent collaboration network.
 */
export interface Network {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the network. */
    network_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this network belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Network name. */
    name: string;
    /** [PROTOCOL-CORE] Brief description of the network. */
    description?: string;
    /** [PROTOCOL-CORE] Network topology type. */
    topology_type: 'single_node' | 'hub_spoke' | 'mesh' | 'hierarchical' | 'hybrid' | 'other';
    /** [PROTOCOL-CORE] Network lifecycle status. */
    status: 'draft' | 'provisioning' | 'active' | 'degraded' | 'maintenance' | 'retired';
    /** [PROTOCOL-CORE] Collection of core nodes in the network. */
    nodes?: any[];
    /** [PROTOCOL-CORE] Trace reference associated with this network. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events related to this network. */
    events?: any[];
}
