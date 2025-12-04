/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import type { Context, Plan, Confirm, Trace } from "@mplp/core";

export interface CoordinationContextIds {
    runId: string;           // Unique id for this MPLP run
    projectId?: string;      // Optional project / workspace id
    correlationId?: string;  // For tracing across systems
}

export interface CoordinationContext {
    ids: CoordinationContextIds;

    // Optional "current" protocol objects:
    context?: Context;
    plan?: Plan;
    confirm?: Confirm;
    trace?: Trace;

    // Free-form metadata, not protocol-critical:
    metadata?: Record<string, unknown>;
}
