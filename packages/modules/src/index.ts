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
 * MPLP v1.0 Module Interfaces & Helpers
 * 
 * This package contains the 10 core module interfaces:
 * - Context, Plan, Confirm, Trace (L1)
 * - Role, Dialog, Collab, Extension, Core, Network (L2)
 * 
 * Plus execution profiles (SA/MAP) and module dependency matrix.
 */

import type {
    Context,
    Plan,
    Confirm,
    Trace,
    Role,
    Dialog,
    Collab,
    Extension,
    Core as CoreModule,
    Network
} from '@mplp/core';

// Re-export core types for module interfaces
export type {
    Context,
    Plan,
    Confirm,
    Trace,
    Role,
    Dialog,
    Collab,
    Extension,
    CoreModule,
    Network
};

/**
 * Module Handler interface
 * Each module must implement this for coordination
 */
export interface ModuleHandler<TInput = any, TOutput = any> {
    handle(input: TInput): Promise<TOutput>;
}

/**
 * Single-Agent Profile Configuration
 */
export interface SingleAgentProfile {
    name: 'sa' | 'SA';
    requiredModules: string[];
    optionalModules?: string[];
}

/**
 * Multi-Agent Profile (MAP) Configuration
 */
export interface MultiAgentProfile {
    name: 'map' | 'MAP';
    requiredModules: string[];
    optionalModules?: string[];
    coordinationStrategy: 'turn-taking' | 'broadcast' | 'leader-follower';
}

/**
 * Module Dependency Matrix
 */
export const MODULE_DEPENDENCIES = {
    context: [],
    plan: ['context'],
    confirm: ['plan'],
    trace: ['context', 'plan'],
    role: ['context'],
    dialog: ['context'],
    collab: ['context', 'network'],
    extension: [],
    core: [],
    network: []
} as const;

/**
 * Standard execution profiles
 */
export const PROFILES = {
    SA: {
        name: 'SA',
        requiredModules: ['context', 'plan', 'confirm', 'trace'],
        optionalModules: ['role', 'dialog', 'extension']
    } as SingleAgentProfile,

    MAP: {
        name: 'MAP',
        requiredModules: ['context', 'plan', 'trace', 'collab', 'network'],
        optionalModules: ['confirm', 'role', 'dialog'],
        coordinationStrategy: 'turn-taking'
    } as MultiAgentProfile
} as const;
