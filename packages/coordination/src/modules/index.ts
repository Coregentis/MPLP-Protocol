/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { CoordinationContext } from "../types/coordination-context";
import type { MplpEvent } from "../events";

export interface ModuleExecutionResult<TOutput> {
    output: TOutput;
    events?: MplpEvent[];
}

export type EmitEvent = (event: MplpEvent) => void;

/**
 * Generic module handler signature.
 * This is a pure contract; L3 will implement the actual behavior.
 */
export interface ModuleHandler<TInput, TOutput> {
    (params: {
        input: TInput;
        ctx: CoordinationContext;
        emitEvent?: EmitEvent;
    }): ModuleExecutionResult<TOutput> | Promise<ModuleExecutionResult<TOutput>>;
}

export * from "./context";
export * from "./plan";
export * from "./confirm";
export * from "./trace";
export * from "./role";
export * from "./extension";
export * from "./dialog";
export * from "./collab";
export * from "./core";
export * from "./network";
