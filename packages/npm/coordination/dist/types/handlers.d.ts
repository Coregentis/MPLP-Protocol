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
import type { MplpEvent } from './event';
/**
 * Module handler context passed to each module during flow execution.
 */
export interface ModuleHandlerContext {
    context?: Record<string, unknown>;
    plan?: Record<string, unknown>;
    confirm?: Record<string, unknown>;
    trace?: Record<string, unknown>;
}
/**
 * Module handler result returned by each module.
 */
export interface ModuleHandlerResult<T = unknown> {
    output: T;
    events?: MplpEvent[];
}
/**
 * Context module handler type.
 * Produces the initial context for a flow.
 */
export type ContextModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{
    context: Record<string, unknown>;
}>>;
/**
 * Plan module handler type.
 * Produces a plan based on context.
 */
export type PlanModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{
    plan: Record<string, unknown>;
}>>;
/**
 * Confirm module handler type.
 * Confirms or modifies the plan.
 */
export type ConfirmModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{
    confirm: Record<string, unknown>;
}>>;
/**
 * Trace module handler type.
 * Records the execution trace.
 */
export type TraceModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{
    trace: Record<string, unknown>;
}>>;
/**
 * Generic module handler type.
 */
export type ModuleHandler<TOutput = unknown> = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<TOutput>>;
//# sourceMappingURL=handlers.d.ts.map