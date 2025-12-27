/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
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
import type { Context, Plan, Confirm, Trace, Role, Dialog, Collab, Extension, Core as CoreModule, Network } from '@mplp/core';
export type { Context, Plan, Confirm, Trace, Role, Dialog, Collab, Extension, CoreModule, Network };
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
export declare const MODULE_DEPENDENCIES: {
    readonly context: readonly [];
    readonly plan: readonly ["context"];
    readonly confirm: readonly ["plan"];
    readonly trace: readonly ["context", "plan"];
    readonly role: readonly ["context"];
    readonly dialog: readonly ["context"];
    readonly collab: readonly ["context", "network"];
    readonly extension: readonly [];
    readonly core: readonly [];
    readonly network: readonly [];
};
/**
 * Standard execution profiles
 */
export declare const PROFILES: {
    readonly SA: SingleAgentProfile;
    readonly MAP: MultiAgentProfile;
};
