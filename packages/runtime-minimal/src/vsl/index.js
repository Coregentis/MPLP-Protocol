"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryVSL = void 0;
/**
 * InMemoryVSL
 *
 * Simple in-memory implementation for reference and tests.
 */
class InMemoryVSL {
    constructor() {
        this.snapshots = new Map();
        this.events = new Map();
    }
    async saveSnapshot(runId, context) {
        this.snapshots.set(runId, { ...context });
    }
    async loadSnapshot(runId) {
        return this.snapshots.get(runId) ?? null;
    }
    async appendEvents(runId, newEvents) {
        const existing = this.events.get(runId) ?? [];
        this.events.set(runId, existing.concat(newEvents));
    }
    async getEvents(runId) {
        return this.events.get(runId) ?? [];
    }
}
exports.InMemoryVSL = InMemoryVSL;
