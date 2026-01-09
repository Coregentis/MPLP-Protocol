import {
    RuntimeExecutionEvent,
    ToolExecutionPayload,
    FileUpdateEvent,
    FileUpdatePayload,
    SAEvent,
    MAPEvent,
    UUID,
    ISO8601
} from "./events";
import { EventSink } from "./sinks";

export interface RuntimeSkeletonConfig {
    protocol_version: string;
    /** event_id generator */
    newEventId(): UUID;
    /** timestamp generator */
    now(): ISO8601;
}

/**
 * Profile-14-Golden Runtime Reference Skeleton
 *
 * - Non-executable: does NOT call models, does NOT run tools, does NOT write files.
 * - Emits evidence events only, per Capability Matrix (A/D/E/H/J).
 * - Strictly bound to MPLP v1.0 JSON Schemas.
 */
export class RuntimeReferenceSkeleton {
    constructor(
        private readonly cfg: RuntimeSkeletonConfig,
        private readonly sinks: {
            execution: EventSink<RuntimeExecutionEvent>;
            fs: EventSink<FileUpdateEvent>;
            sa: EventSink<SAEvent>;
            map: EventSink<MAPEvent>;
        }
    ) { }

    /** 
     * Begin a run: emits RuntimeExecutionEvent(status=running). 
     * Maps to GF-01/GF-05 execution boundary.
     */
    async beginRun(executionId: UUID, role?: string): Promise<void> {
        const ev: RuntimeExecutionEvent = {
            event_id: this.cfg.newEventId(),
            event_type: "execution_started",
            event_family: "runtime_execution",
            timestamp: this.cfg.now(),
            execution_id: executionId,
            executor_kind: "agent", // Top-level run is usually an agent
            executor_role: role,
            status: "running"
        };
        await this.sinks.execution.append(ev);
    }

    /** 
     * End a run: emits RuntimeExecutionEvent(status=completed/failed). 
     */
    async endRun(executionId: UUID, status: "completed" | "failed" | "cancelled", payload?: Record<string, any>): Promise<void> {
        const ev: RuntimeExecutionEvent = {
            event_id: this.cfg.newEventId(),
            event_type: "execution_completed",
            event_family: "runtime_execution",
            timestamp: this.cfg.now(),
            execution_id: executionId,
            executor_kind: "agent",
            status: status,
            payload
        };
        await this.sinks.execution.append(ev);
    }

    /** 
     * Emit a tool evidence event. 
     * Uses RuntimeExecutionEvent with executor_kind='tool' and ToolExecutionPayload.
     */
    async emitToolEvent(executionId: UUID, payload: ToolExecutionPayload): Promise<void> {
        const ev: RuntimeExecutionEvent = {
            event_id: this.cfg.newEventId(),
            event_type: "tool_invocation",
            event_family: "runtime_execution",
            timestamp: this.cfg.now(),
            execution_id: executionId,
            executor_kind: "tool",
            status: payload.status === "succeeded" ? "completed" : payload.status === "failed" ? "failed" : "running",
            payload: payload as unknown as Record<string, any>
        };
        await this.sinks.execution.append(ev);
    }

    /** 
     * Emit a file update evidence event. 
     * Uses FileUpdateEvent (external_integration).
     */
    async emitFileUpdateEvent(payload: FileUpdatePayload): Promise<void> {
        const ev: FileUpdateEvent = {
            event_id: this.cfg.newEventId(),
            event_type: "file_update",
            event_family: "external_integration",
            timestamp: this.cfg.now(),
            payload: payload
        };
        await this.sinks.fs.append(ev);
    }

    /** Emit SA profile evidence. */
    async emitSAEvent(saId: UUID, type: SAEvent["event_type"], contextId?: UUID): Promise<void> {
        const ev: SAEvent = {
            event_id: this.cfg.newEventId(),
            event_type: type,
            timestamp: this.cfg.now(),
            sa_id: saId,
            context_id: contextId
        };
        await this.sinks.sa.append(ev);
    }

    /** Emit MAP profile evidence. */
    async emitMAPEvent(sessionId: UUID, type: MAPEvent["event_type"]): Promise<void> {
        const ev: MAPEvent = {
            event_id: this.cfg.newEventId(),
            event_type: type,
            timestamp: this.cfg.now(),
            session_id: sessionId
        };
        await this.sinks.map.append(ev);
    }
}
