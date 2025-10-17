export type ManagerStatus = 'initializing' | 'active' | 'degraded' | 'inactive' | 'error';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export interface OperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}
export interface BaseManager {
    healthCheck(): Promise<boolean>;
    getStatus?(): ManagerStatus;
    initialize?(config?: Record<string, unknown>): Promise<void>;
    shutdown?(): Promise<void>;
}
export type AuthenticationMethod = 'password' | 'token' | 'oauth' | 'certificate' | 'biometric';
export type PermissionLevel = 'none' | 'read' | 'write' | 'execute' | 'admin' | 'owner';
export type SecurityEventType = 'authentication_success' | 'authentication_failure' | 'authorization_granted' | 'authorization_denied' | 'session_created' | 'session_expired' | 'permission_changed' | 'security_violation';
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
export interface PerformanceThreshold {
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
    value: number;
    alertLevel: AlertLevel;
    description?: string;
}
export type EventType = 'system' | 'user' | 'security' | 'performance' | 'error' | 'coordination' | 'workflow' | 'state_change' | 'transaction';
export type EventPriority = 'immediate' | 'high' | 'normal' | 'low' | 'background';
export interface EventFilter {
    types?: EventType[];
    sources?: string[];
    priorities?: EventPriority[];
    startTime?: string;
    endTime?: string;
    tags?: Record<string, string>;
}
export type ErrorCategory = 'system' | 'network' | 'security' | 'validation' | 'business' | 'integration' | 'performance' | 'configuration';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical' | 'fatal';
export type RecoveryStrategy = 'retry' | 'fallback' | 'circuit_breaker' | 'manual' | 'ignore';
export type CoordinationMode = 'synchronous' | 'asynchronous' | 'event_driven' | 'workflow_based';
export type CoordinationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export type WorkflowType = 'sequential' | 'parallel' | 'conditional' | 'loop' | 'event_driven';
export type StepExecutionMode = 'blocking' | 'non_blocking' | 'async' | 'fire_and_forget';
export type SyncStrategy = 'immediate' | 'batched' | 'scheduled' | 'event_triggered' | 'manual';
export type ConflictResolution = 'last_write_wins' | 'first_write_wins' | 'merge' | 'manual' | 'version_based';
export type IsolationLevel = 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';
export type PropagationBehavior = 'required' | 'requires_new' | 'supports' | 'not_supported' | 'never' | 'mandatory';
export type CompatibilityLevel = 'major' | 'minor' | 'patch' | 'incompatible';
export type VersioningStrategy = 'semantic' | 'date_based' | 'sequential' | 'custom';
export type ConfigSource = 'file' | 'environment' | 'database' | 'remote' | 'memory';
export type ConfigUpdateStrategy = 'immediate' | 'scheduled' | 'manual' | 'on_restart';
export type MonitoringLevel = 'none' | 'basic' | 'detailed' | 'comprehensive' | 'debug';
export type HealthCheckType = 'liveness' | 'readiness' | 'startup' | 'custom';
export interface HealthCheckResult {
    type: HealthCheckType;
    status: 'pass' | 'fail' | 'warn';
    timestamp: string;
    duration: number;
    message?: string;
    details?: Record<string, unknown>;
}
export interface TimeWindow {
    start: string;
    end: string;
    duration?: number;
    timezone?: string;
}
export interface PaginationConfig {
    page: number;
    limit: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors?: string[];
}
export interface CacheConfig {
    enabled: boolean;
    ttl: number;
    maxSize?: number;
    strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
    keyPrefix?: string;
}
//# sourceMappingURL=types.d.ts.map