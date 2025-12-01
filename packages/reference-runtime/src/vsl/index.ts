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

import type { RuntimeContext } from "../types/runtime-context";
import type { MplpEvent } from "@mplp/coordination";

export interface ValueStateLayer {
    saveSnapshot(runId: string, context: RuntimeContext): Promise<void>;
    loadSnapshot(runId: string): Promise<RuntimeContext | null>;
    appendEvents(runId: string, events: MplpEvent[]): Promise<void>;
    getEvents(runId: string): Promise<MplpEvent[]>;
}

/**
 * InMemoryVSL
 *
 * Simple in-memory implementation for reference and tests.
 */
export class InMemoryVSL implements ValueStateLayer {
    private snapshots = new Map<string, RuntimeContext>();
    private events = new Map<string, MplpEvent[]>();

    async saveSnapshot(runId: string, context: RuntimeContext): Promise<void> {
        this.snapshots.set(runId, { ...context });
    }

    async loadSnapshot(runId: string): Promise<RuntimeContext | null> {
        return this.snapshots.get(runId) ?? null;
    }

    async appendEvents(runId: string, newEvents: MplpEvent[]): Promise<void> {
        const existing = this.events.get(runId) ?? [];
        this.events.set(runId, existing.concat(newEvents));
    }

    async getEvents(runId: string): Promise<MplpEvent[]> {
        return this.events.get(runId) ?? [];
    }
}
