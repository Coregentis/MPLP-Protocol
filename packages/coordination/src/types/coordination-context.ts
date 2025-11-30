import type { Context, Plan, Confirm, Trace } from "@mplp/core-protocol";

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
