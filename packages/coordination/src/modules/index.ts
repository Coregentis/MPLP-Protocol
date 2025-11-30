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
