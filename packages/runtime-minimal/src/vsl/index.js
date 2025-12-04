/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
"use strict";
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
