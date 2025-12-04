/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { Context, Plan, Confirm, Trace } from "@mplp/core";
export interface CoordinationContextIds {
    runId: string;
    projectId?: string;
    correlationId?: string;
}
export interface CoordinationContext {
    ids: CoordinationContextIds;
    context?: Context;
    plan?: Plan;
    confirm?: Confirm;
    trace?: Trace;
    metadata?: Record<string, unknown>;
}
