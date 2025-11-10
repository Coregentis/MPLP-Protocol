/**
 * AI Coordination Example - Type Definitions
 * Comprehensive type system for multi-agent AI coordination
 */
export interface IAgent {
    readonly id: string;
    readonly name: string;
    readonly type: AgentType;
    readonly capabilities: AgentCapability[];
    readonly status: AgentStatus;
    initialize(): Promise<void>;
    process(task: Task): Promise<TaskResult>;
    communicate(message: AgentMessage): Promise<AgentResponse>;
    shutdown(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
}
export type AgentType = 'planner' | 'creator' | 'reviewer' | 'publisher' | 'coordinator';
export type AgentCapability = 'content_planning' | 'content_creation' | 'content_review' | 'content_publishing' | 'task_coordination' | 'decision_making' | 'conflict_resolution' | 'quality_assessment' | 'multi_language' | 'ai_integration';
export type AgentStatus = 'initializing' | 'ready' | 'busy' | 'error' | 'shutdown';
export interface Task {
    readonly id: string;
    readonly type: TaskType;
    readonly priority: TaskPriority;
    readonly requirements: TaskRequirements;
    readonly context: TaskContext;
    readonly deadline?: Date;
    readonly dependencies?: string[];
}
export type TaskType = 'content_creation' | 'content_review' | 'content_publishing' | 'decision_making' | 'conflict_resolution' | 'quality_assessment';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export interface TaskRequirements {
    readonly topic?: string;
    readonly length?: number;
    readonly style?: ContentStyle;
    readonly languages?: string[];
    readonly channels?: PublishingChannel[];
    readonly quality_threshold?: number;
    readonly custom_requirements?: Record<string, unknown>;
}
export type ContentStyle = 'professional' | 'casual' | 'technical' | 'creative' | 'formal' | 'conversational';
export type PublishingChannel = 'blog' | 'social_media' | 'newsletter' | 'documentation' | 'marketing' | 'internal';
export interface TaskContext {
    readonly user_id?: string;
    readonly session_id?: string;
    readonly workflow_id?: string;
    readonly metadata?: Record<string, unknown>;
}
export interface TaskResult {
    readonly task_id: string;
    readonly agent_id: string;
    readonly status: TaskResultStatus;
    readonly output?: unknown;
    readonly quality_score?: number;
    readonly execution_time?: number;
    readonly error?: string;
    readonly metadata?: Record<string, unknown>;
    readonly execution_metadata?: {
        readonly total_execution_time: number;
        readonly coordination_rounds: number;
    };
    readonly coordination_metrics?: {
        readonly quality_score: number;
        readonly workflow_efficiency: number;
    };
}
export type TaskResultStatus = 'success' | 'partial_success' | 'failure' | 'timeout' | 'cancelled';
export interface AgentMessage {
    readonly id: string;
    readonly from: string;
    readonly to: string | string[];
    readonly type: MessageType;
    readonly content: unknown;
    readonly timestamp: Date;
    readonly priority: MessagePriority;
    readonly requires_response?: boolean;
}
export type MessageType = 'task_assignment' | 'task_result' | 'decision_request' | 'decision_response' | 'conflict_notification' | 'status_update' | 'coordination_request' | 'information_sharing';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';
export interface AgentResponse {
    readonly message_id: string;
    readonly agent_id: string;
    readonly content: unknown;
    readonly timestamp: Date;
    readonly status: ResponseStatus;
}
export type ResponseStatus = 'success' | 'error' | 'timeout' | 'rejected';
export interface DecisionRequest {
    readonly id: string;
    readonly question: string;
    readonly options: DecisionOption[];
    readonly participants: string[];
    readonly criteria: DecisionCriteria;
    readonly timeout?: number;
    readonly strategy: DecisionStrategy;
}
export interface DecisionOption {
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly metadata?: Record<string, unknown>;
}
export interface DecisionCriteria {
    readonly [criterion: string]: number;
}
export type DecisionStrategy = 'consensus' | 'majority' | 'weighted' | 'expertise_based' | 'unanimous';
export interface DecisionResult {
    readonly decision_id: string;
    readonly chosen_option: string;
    readonly confidence: number;
    readonly reasoning: string;
    readonly votes: Record<string, string>;
    readonly execution_time: number;
}
export interface MemoryEntry {
    readonly id: string;
    readonly key: string;
    readonly value: unknown;
    readonly type: MemoryType;
    readonly timestamp: Date;
    readonly ttl?: number;
    readonly tags?: string[];
    readonly metadata?: Record<string, unknown>;
}
export type MemoryType = 'knowledge' | 'context' | 'preference' | 'history' | 'cache' | 'temporary';
export interface KnowledgeGraph {
    readonly nodes: KnowledgeNode[];
    readonly edges: KnowledgeEdge[];
}
export interface KnowledgeNode {
    readonly id: string;
    readonly type: string;
    readonly properties: Record<string, unknown>;
}
export interface KnowledgeEdge {
    readonly from: string;
    readonly to: string;
    readonly type: string;
    readonly weight?: number;
    readonly properties?: Record<string, unknown>;
}
export interface CoordinationConfig {
    readonly decision_engine: DecisionEngineConfig;
    readonly consensus_manager: ConsensusManagerConfig;
    readonly conflict_resolver: ConflictResolverConfig;
    readonly shared_memory: SharedMemoryConfig;
    readonly communication: CommunicationConfig;
}
export interface DecisionEngineConfig {
    readonly strategy: DecisionStrategy;
    readonly timeout: number;
    readonly min_agreement: number;
    readonly max_iterations: number;
}
export interface ConsensusManagerConfig {
    readonly threshold: number;
    readonly max_rounds: number;
    readonly convergence_criteria: number;
}
export interface ConflictResolverConfig {
    readonly strategies: string[];
    readonly escalation_threshold: number;
    readonly escalation_handler: string;
}
export interface SharedMemoryConfig {
    readonly persistence: boolean;
    readonly sync_interval: number;
    readonly conflict_resolution: string;
    readonly max_entries: number;
}
export interface CommunicationConfig {
    readonly message_bus_type: string;
    readonly event_dispatcher_async: boolean;
    readonly protocol_handler_timeout: number;
    readonly max_message_size: number;
}
export interface CoordinationEvent {
    readonly type: CoordinationEventType;
    readonly source: string;
    readonly data: unknown;
    readonly timestamp: Date;
}
export type CoordinationEventType = 'agent_registered' | 'agent_unregistered' | 'task_started' | 'task_completed' | 'decision_requested' | 'decision_made' | 'conflict_detected' | 'conflict_resolved' | 'consensus_reached' | 'coordination_failed';
export interface Metrics {
    readonly consensus_rate: number;
    readonly decision_time: number;
    readonly conflict_resolution_rate: number;
    readonly task_completion_rate: number;
    readonly quality_score: number;
}
export interface PerformanceMetrics {
    readonly total_tasks: number;
    readonly successful_tasks: number;
    readonly failed_tasks: number;
    readonly average_execution_time: number;
    readonly peak_memory_usage: number;
    readonly cpu_usage: number;
}
export declare class CoordinationError extends Error {
    readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, code: string, details?: Record<string, unknown>);
}
export declare class AgentError extends Error {
    readonly agentId: string;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, agentId: string, code: string, details?: Record<string, unknown>);
}
export declare class DecisionError extends Error {
    readonly decisionId: string;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, decisionId: string, code: string, details?: Record<string, unknown>);
}
export interface OrchestrationMetrics {
    totalAgents: number;
    activeWorkflows: number;
    completedTasks: number;
    averageExecutionTime: number;
    successRate: number;
    resourceUtilization: number;
}
export interface WorkflowDefinition {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly steps: WorkflowStep[];
    readonly triggers: WorkflowTrigger[];
    readonly metadata?: Record<string, unknown>;
}
export interface WorkflowStep {
    readonly id: string;
    readonly name: string;
    readonly agentType: AgentType;
    readonly action: string;
    readonly inputs: Record<string, unknown>;
    readonly outputs: Record<string, unknown>;
    readonly dependencies?: string[];
    readonly timeout?: number;
}
export interface WorkflowTrigger {
    readonly type: 'event' | 'schedule' | 'manual';
    readonly condition: string;
    readonly parameters?: Record<string, unknown>;
}
export interface DistributedDeployment {
    readonly nodeId: string;
    readonly nodeType: 'coordinator' | 'worker' | 'hybrid';
    readonly capacity: number;
    readonly currentLoad: number;
    readonly status: 'online' | 'offline' | 'maintenance';
    readonly lastHeartbeat: Date;
}
export interface MonitoringData {
    readonly timestamp: Date;
    readonly agentMetrics: Map<string, AgentMetrics>;
    readonly systemMetrics: SystemMetrics;
    readonly workflowMetrics: WorkflowMetrics;
}
export interface AgentMetrics {
    readonly agentId: string;
    readonly tasksProcessed: number;
    readonly averageResponseTime: number;
    readonly errorRate: number;
    readonly resourceUsage: ResourceUsage;
}
export interface SystemMetrics {
    readonly cpuUsage: number;
    readonly memoryUsage: number;
    readonly networkLatency: number;
    readonly diskUsage: number;
}
export interface WorkflowMetrics {
    readonly workflowId: string;
    readonly executionTime: number;
    readonly stepsCompleted: number;
    readonly stepsTotal: number;
    readonly successRate: number;
}
export interface ResourceUsage {
    readonly cpu: number;
    readonly memory: number;
    readonly network: number;
    readonly storage: number;
}
//# sourceMappingURL=index.d.ts.map