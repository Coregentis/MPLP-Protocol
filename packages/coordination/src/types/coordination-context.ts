/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
