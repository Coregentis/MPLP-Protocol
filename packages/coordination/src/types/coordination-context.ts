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
