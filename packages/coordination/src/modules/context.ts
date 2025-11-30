import type { Context } from "@mplp/core-protocol";
import type { ModuleHandler } from "./index";

export interface ContextModuleInput {
    // e.g. seed data or partial context
    initial?: Partial<Context>;
}

export interface ContextModuleOutput {
    context: Context;
}

export type ContextModuleHandler = ModuleHandler<ContextModuleInput, ContextModuleOutput>;
