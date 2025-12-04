/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { Context } from "@mplp/core";
import type { ModuleHandler } from "./index";

export interface ContextModuleInput {
    // e.g. seed data or partial context
    initial?: Partial<Context>;
}

export interface ContextModuleOutput {
    context: Context;
}

export type ContextModuleHandler = ModuleHandler<ContextModuleInput, ContextModuleOutput>;
