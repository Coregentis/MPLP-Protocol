/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * MPLP Event interface for protocol-level observability.
 * Events are part of the 3-Physical/12-Logical event model.
 */
export interface MplpEvent {
    /** Event type identifier (e.g., "context.created", "plan.approved") */
    type: string;
    /** ISO 8601 timestamp when event was created */
    timestamp: string;
    /** Run identifier this event belongs to */
    runId: string;
    /** Optional module that emitted the event */
    module?: string;
    /** Event payload data */
    payload?: Record<string, unknown>;
}

/**
 * Flow contract defining the structure of an MPLP coordination flow.
 */
export interface FlowContract<TOutput = unknown> {
    id: string;
    name: string;
    description?: string;
    version: string;
    modules: string[];
}

/**
 * Single Agent Flow output structure.
 */
export interface SingleAgentFlowOutput {
    context: Record<string, unknown>;
    plan: Record<string, unknown>;
    confirm: Record<string, unknown>;
    trace: Record<string, unknown>;
}

/**
 * The canonical Single Agent Flow Contract.
 */
export const SingleAgentFlowContract: FlowContract<SingleAgentFlowOutput> = {
    id: 'single-agent-flow',
    name: 'SingleAgentFlow',
    description: 'Standard 4-module single agent flow: Context → Plan → Confirm → Trace',
    version: '1.0.0',
    modules: ['context', 'plan', 'confirm', 'trace']
};

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

/** Context module handler type. */
export type ContextModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{ context: Record<string, unknown> }>>;

/** Plan module handler type. */
export type PlanModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{ plan: Record<string, unknown> }>>;

/** Confirm module handler type. */
export type ConfirmModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{ confirm: Record<string, unknown> }>>;

/** Trace module handler type. */
export type TraceModuleHandler = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<{ trace: Record<string, unknown> }>>;

/** Generic module handler type. */
export type ModuleHandler<TOutput = unknown> = (params: {
    ctx: ModuleHandlerContext;
}) => Promise<ModuleHandlerResult<TOutput>>;

/** Create an MPLP event with current timestamp. */
export function createMplpEvent(
    type: string,
    runId: string,
    payload?: Record<string, unknown>,
    module?: string
): MplpEvent {
    return {
        type,
        timestamp: new Date().toISOString(),
        runId,
        module,
        payload
    };
}
