/**
 * STRICT SCHEMA MIRROR
 * This file is a strict TypeScript representation of the MPLP v1.0 JSON Schemas.
 * Any change here MUST be reflected in schemas/v2/ and vice-versa.
 */

export type ISO8601 = string;
export type UUID = string;

/**
 * @schemaRef schemas/v2/events/mplp-event-core.schema.json
 */
export interface EventCore {
    event_id: UUID;
    event_type: string;
    event_family:
    | "import_process"
    | "intent"
    | "delta_intent"
    | "impact_analysis"
    | "compensation_plan"
    | "methodology"
    | "reasoning_graph"
    | "pipeline_stage"
    | "graph_update"
    | "runtime_execution"
    | "cost_budget"
    | "external_integration";
    timestamp: ISO8601;
    project_id?: UUID;
    payload?: Record<string, any>;
}

/**
 * @schemaRef schemas/v2/events/mplp-runtime-execution-event.schema.json
 */
export interface RuntimeExecutionEvent extends EventCore {
    event_family: "runtime_execution";
    execution_id: UUID;
    executor_kind: "agent" | "tool" | "llm" | "worker" | "external";
    executor_role?: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    // Payload is generic in schema, but we can bind specific payloads for tools
    payload?: ToolExecutionPayload | Record<string, any>;
}

/**
 * @schemaRef schemas/v2/integration/mplp-tool-event.schema.json
 * Note: This schema defines the payload structure for tool executions.
 */
export interface ToolExecutionPayload {
    tool_id: string;
    tool_kind: "formatter" | "linter" | "test_runner" | "generator" | "other";
    invocation_id: UUID;
    status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
    started_at?: ISO8601;
    completed_at?: ISO8601;
    exit_code?: number;
    output_summary?: string;
    args?: string[];
    working_directory?: string;
}

/**
 * @schemaRef schemas/v2/integration/mplp-file-update-event.schema.json
 * Note: This schema defines the payload structure for file updates.
 */
export interface FileUpdatePayload {
    file_path: string;
    change_type: "created" | "modified" | "deleted" | "renamed";
    workspace_root?: string;
    change_summary?: string;
    timestamp: ISO8601;
    lines_added?: number;
    lines_removed?: number;
    previous_path?: string;
    encoding?: string;
    language?: string;
}

/**
 * Wrapper for File Update events using External Integration family
 */
export interface FileUpdateEvent extends EventCore {
    event_family: "external_integration";
    event_type: "file_update";
    payload: FileUpdatePayload;
}

/**
 * @schemaRef schemas/v2/events/mplp-sa-event.schema.json
 */
export interface SAEvent {
    event_id: UUID;
    event_type:
    | "SAInitialized"
    | "SAContextLoaded"
    | "SAPlanEvaluated"
    | "SAStepStarted"
    | "SAStepCompleted"
    | "SAStepFailed"
    | "SATraceEmitted"
    | "SACompleted";
    timestamp: ISO8601;
    sa_id: UUID;
    context_id?: UUID;
    plan_id?: UUID;
    trace_id?: UUID;
    payload?: Record<string, any>;
}

/**
 * @schemaRef schemas/v2/events/mplp-map-event.schema.json
 */
export interface MAPEvent {
    event_id: UUID;
    event_type:
    | "MAPSessionStarted"
    | "MAPRolesAssigned"
    | "MAPTurnDispatched"
    | "MAPTurnCompleted"
    | "MAPBroadcastSent"
    | "MAPBroadcastReceived"
    | "MAPConflictDetected"
    | "MAPConflictResolved"
    | "MAPSessionCompleted";
    timestamp: ISO8601;
    session_id: UUID;
    initiator_role?: string;
    target_roles?: string[];
    payload?: Record<string, any>;
}
