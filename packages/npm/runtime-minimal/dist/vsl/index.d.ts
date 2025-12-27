/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
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
export declare class InMemoryVSL implements ValueStateLayer {
    private snapshots;
    private events;
    saveSnapshot(runId: string, context: RuntimeContext): Promise<void>;
    loadSnapshot(runId: string): Promise<RuntimeContext | null>;
    appendEvents(runId: string, newEvents: MplpEvent[]): Promise<void>;
    getEvents(runId: string): Promise<MplpEvent[]>;
}
