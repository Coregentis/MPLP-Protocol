export type NdjsonLine = string;

export interface EventSink<TEvent extends object> {
    /** Append a single event record (non-blocking semantics are allowed). */
    append(event: TEvent): void | Promise<void>;
}

export interface NdjsonSink {
    /** Append a pre-serialized NDJSON line. */
    appendLine(line: NdjsonLine): void | Promise<void>;
}

/**
 * Non-executable default sink for tests/spec demos.
 * Stores events in memory only.
 */
export class MemoryEventSink<TEvent extends object> implements EventSink<TEvent> {
    readonly events: TEvent[] = [];
    append(event: TEvent) {
        this.events.push(event);
    }
}
