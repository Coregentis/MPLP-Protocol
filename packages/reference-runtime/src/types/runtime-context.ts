import type { CoordinationContext } from "@mplp/coordination";
import type { MplpEvent } from "@mplp/coordination";

export interface RuntimeIds {
    runId: string;
    projectId?: string;
    correlationId?: string;
}

export interface RuntimeOptions {
    maxRetries?: number;
    snapshotEveryStep?: boolean;
}

export interface RuntimeContext {
    ids: RuntimeIds;
    coordination: CoordinationContext;
    events: MplpEvent[];
    options?: RuntimeOptions;
}
