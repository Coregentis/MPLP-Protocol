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
