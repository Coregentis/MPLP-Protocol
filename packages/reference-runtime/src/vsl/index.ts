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
