/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
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
