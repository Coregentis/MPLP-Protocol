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
