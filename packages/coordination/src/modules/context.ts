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
