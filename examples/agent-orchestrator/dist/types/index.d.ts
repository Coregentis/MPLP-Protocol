/**
 * @fileoverview Type definitions for Agent Orchestrator Platform
 * @version 1.1.0-beta
 */
export type { ApplicationConfig } from '@mplp/core';
export { Logger as MPLPLogger } from '@mplp/core';
export type { IAgent, AgentStatus, AgentCapability } from '@mplp/agent-builder';
export interface AgentConfig {
    name: string;
    capabilities: string[];
    [key: string]: unknown;
}
export type { WorkflowDefinition, WorkflowStatus } from '@mplp/orchestrator';
/**
 * Orchestrator platform status
 */
export type OrchestratorStatus = 'stopped' | 'initializing' | 'initialized' | 'starting' | 'running' | 'stopping' | 'error';
/**
 * Agent deployment strategy
 */
export declare enum DeploymentStrategy {
    SINGLE = "single",
    REPLICATED = "replicated",
    DISTRIBUTED = "distributed",
    LOAD_BALANCED = "load_balanced"
}
/**
 * Workflow execution mode
 */
export declare enum ExecutionMode {
    SEQUENTIAL = "sequential",
    PARALLEL = "parallel",
    CONDITIONAL = "conditional",
    EVENT_DRIVEN = "event_driven"
}
/**
 * Agent orchestrator configuration
 */
export interface AgentOrchestratorConfig {
    name: string;
    version: string;
    description?: string;
    agents: AgentDeploymentConfig[];
    workflows: WorkflowConfig[];
    orchestration: OrchestrationConfig;
    monitoring: MonitoringConfig;
    scaling: ScalingConfig;
    security: SecurityConfig;
}
/**
 * Agent deployment configuration
 */
export interface AgentDeploymentConfig {
    id: string;
    name: string;
    type: string;
    strategy: DeploymentStrategy;
    replicas: number;
    config: AgentConfig;
    resources: ResourceConfig;
    healthCheck: HealthCheckConfig;
    dependencies: string[];
}
/**
 * Resource configuration
 */
export interface ResourceConfig {
    cpu: number;
    memory: number;
    storage: number;
    network: NetworkConfig;
}
/**
 * Network configuration
 */
export interface NetworkConfig {
    ports: PortConfig[];
    protocols: string[];
    security: NetworkSecurityConfig;
}
/**
 * Port configuration
 */
export interface PortConfig {
    name: string;
    port: number;
    protocol: 'tcp' | 'udp' | 'http' | 'https';
    exposed: boolean;
}
/**
 * Network security configuration
 */
export interface NetworkSecurityConfig {
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    firewall: FirewallConfig;
}
/**
 * Firewall configuration
 */
export interface FirewallConfig {
    enabled: boolean;
    rules: FirewallRule[];
}
/**
 * Firewall rule
 */
export interface FirewallRule {
    name: string;
    action: 'allow' | 'deny';
    source: string;
    destination: string;
    port?: number;
    protocol?: string;
}
/**
 * Health check configuration
 */
export interface HealthCheckConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    endpoint?: string;
    command?: string;
}
/**
 * Workflow configuration
 */
export interface WorkflowConfig {
    id: string;
    name: string;
    description?: string;
    mode: ExecutionMode;
    steps: WorkflowStep[];
    triggers: WorkflowTrigger[];
    conditions: WorkflowCondition[];
    timeout: number;
    retries: number;
}
/**
 * Workflow step
 */
export interface WorkflowStep {
    id: string;
    name: string;
    agentId: string;
    action: string;
    parameters: Record<string, unknown>;
    timeout: number;
    retries: number;
    onSuccess?: string;
    onFailure?: string;
    conditions?: WorkflowCondition[];
}
/**
 * Workflow trigger
 */
export interface WorkflowTrigger {
    id: string;
    name: string;
    type: 'event' | 'schedule' | 'manual' | 'webhook';
    config: TriggerConfig;
    enabled: boolean;
}
/**
 * Trigger configuration
 */
export interface TriggerConfig {
    event?: string;
    schedule?: string;
    webhook?: WebhookConfig;
    conditions?: WorkflowCondition[];
}
/**
 * Webhook configuration
 */
export interface WebhookConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    authentication?: WebhookAuth;
}
/**
 * Webhook authentication
 */
export interface WebhookAuth {
    type: 'basic' | 'bearer' | 'api_key';
    credentials: Record<string, string>;
}
/**
 * Workflow condition
 */
export interface WorkflowCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
    value: unknown;
    logicalOperator?: 'and' | 'or';
}
/**
 * Orchestration configuration
 */
export interface OrchestrationConfig {
    maxConcurrentWorkflows: number;
    maxConcurrentAgents: number;
    resourceAllocation: ResourceAllocationConfig;
    failureHandling: FailureHandlingConfig;
    communication: CommunicationConfig;
}
/**
 * Resource allocation configuration
 */
export interface ResourceAllocationConfig {
    strategy: 'fair' | 'priority' | 'resource_based' | 'custom';
    priorities: Record<string, number>;
    limits: ResourceLimits;
}
/**
 * Resource limits
 */
export interface ResourceLimits {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
}
/**
 * Failure handling configuration
 */
export interface FailureHandlingConfig {
    strategy: 'retry' | 'failover' | 'circuit_breaker' | 'custom';
    retryPolicy: RetryPolicy;
    circuitBreaker: CircuitBreakerConfig;
    failover: FailoverConfig;
}
/**
 * Retry policy
 */
export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;
    jitter: boolean;
}
/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
}
/**
 * Failover configuration
 */
export interface FailoverConfig {
    enabled: boolean;
    strategy: 'active_passive' | 'active_active' | 'round_robin';
    healthCheckInterval: number;
    switchoverTimeout: number;
}
/**
 * Communication configuration
 */
export interface CommunicationConfig {
    protocol: 'http' | 'grpc' | 'websocket' | 'message_queue';
    serialization: 'json' | 'protobuf' | 'avro';
    compression: boolean;
    encryption: boolean;
    messageQueue: MessageQueueConfig;
}
/**
 * Message queue configuration
 */
export interface MessageQueueConfig {
    type: 'redis' | 'rabbitmq' | 'kafka' | 'sqs';
    connection: Record<string, unknown>;
    topics: TopicConfig[];
}
/**
 * Topic configuration
 */
export interface TopicConfig {
    name: string;
    partitions: number;
    replication: number;
    retention: number;
}
/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
    enabled: boolean;
    metrics: MetricsConfig;
    logging: LoggingConfig;
    alerting: AlertingConfig;
    tracing: TracingConfig;
}
/**
 * Metrics configuration
 */
export interface MetricsConfig {
    enabled: boolean;
    interval: number;
    retention: number;
    exporters: MetricsExporter[];
}
/**
 * Metrics exporter
 */
export interface MetricsExporter {
    type: 'prometheus' | 'influxdb' | 'datadog' | 'custom';
    config: Record<string, unknown>;
}
/**
 * Logging configuration
 */
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    outputs: LogOutput[];
    rotation: LogRotationConfig;
}
/**
 * Log output
 */
export interface LogOutput {
    type: 'console' | 'file' | 'syslog' | 'elasticsearch';
    config: Record<string, unknown>;
}
/**
 * Log rotation configuration
 */
export interface LogRotationConfig {
    enabled: boolean;
    maxSize: number;
    maxFiles: number;
    maxAge: number;
}
/**
 * Alerting configuration
 */
export interface AlertingConfig {
    enabled: boolean;
    rules: AlertRule[];
    channels: AlertChannel[];
}
/**
 * Alert rule
 */
export interface AlertRule {
    name: string;
    condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    threshold: number;
    duration: number;
    channels: string[];
}
/**
 * Alert channel
 */
export interface AlertChannel {
    name: string;
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: Record<string, unknown>;
}
/**
 * Tracing configuration
 */
export interface TracingConfig {
    enabled: boolean;
    sampler: TracingSampler;
    exporters: TracingExporter[];
}
/**
 * Tracing sampler
 */
export interface TracingSampler {
    type: 'always' | 'never' | 'probability' | 'rate_limiting';
    config: Record<string, unknown>;
}
/**
 * Tracing exporter
 */
export interface TracingExporter {
    type: 'jaeger' | 'zipkin' | 'otlp';
    config: Record<string, unknown>;
}
/**
 * Scaling configuration
 */
export interface ScalingConfig {
    enabled: boolean;
    strategy: 'manual' | 'horizontal' | 'vertical' | 'predictive';
    horizontal: HorizontalScalingConfig;
    vertical: VerticalScalingConfig;
    predictive: PredictiveScalingConfig;
}
/**
 * Horizontal scaling configuration
 */
export interface HorizontalScalingConfig {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
    scaleUpCooldown: number;
    scaleDownCooldown: number;
}
/**
 * Vertical scaling configuration
 */
export interface VerticalScalingConfig {
    minCPU: number;
    maxCPU: number;
    minMemory: number;
    maxMemory: number;
    scalingFactor: number;
}
/**
 * Predictive scaling configuration
 */
export interface PredictiveScalingConfig {
    algorithm: 'linear_regression' | 'arima' | 'neural_network';
    lookbackPeriod: number;
    forecastPeriod: number;
    confidence: number;
}
/**
 * Security configuration
 */
export interface SecurityConfig {
    authentication: AuthenticationConfig;
    authorization: AuthorizationConfig;
    encryption: EncryptionConfig;
    audit: AuditConfig;
}
/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
    enabled: boolean;
    providers: AuthProvider[];
    tokenExpiry: number;
    refreshTokens: boolean;
}
/**
 * Authentication provider
 */
export interface AuthProvider {
    name: string;
    type: 'local' | 'oauth2' | 'saml' | 'ldap';
    config: Record<string, unknown>;
}
/**
 * Authorization configuration
 */
export interface AuthorizationConfig {
    enabled: boolean;
    model: 'rbac' | 'abac' | 'custom';
    roles: Role[];
    policies: Policy[];
}
/**
 * Role definition
 */
export interface Role {
    name: string;
    permissions: string[];
    inherits?: string[];
}
/**
 * Policy definition
 */
export interface Policy {
    name: string;
    effect: 'allow' | 'deny';
    actions: string[];
    resources: string[];
    conditions?: PolicyCondition[];
}
/**
 * Policy condition
 */
export interface PolicyCondition {
    field: string;
    operator: string;
    value: unknown;
}
/**
 * Encryption configuration
 */
export interface EncryptionConfig {
    enabled: boolean;
    algorithm: string;
    keyManagement: KeyManagementConfig;
    dataEncryption: DataEncryptionConfig;
}
/**
 * Key management configuration
 */
export interface KeyManagementConfig {
    provider: 'local' | 'aws_kms' | 'azure_kv' | 'hashicorp_vault';
    rotation: boolean;
    rotationInterval: number;
}
/**
 * Data encryption configuration
 */
export interface DataEncryptionConfig {
    atRest: boolean;
    inTransit: boolean;
    inMemory: boolean;
}
/**
 * Audit configuration
 */
export interface AuditConfig {
    enabled: boolean;
    events: string[];
    storage: AuditStorageConfig;
    retention: number;
}
/**
 * Audit storage configuration
 */
export interface AuditStorageConfig {
    type: 'file' | 'database' | 'elasticsearch' | 's3';
    config: Record<string, unknown>;
}
/**
 * System metrics
 */
export interface SystemMetrics {
    agents: AgentMetrics;
    workflows: WorkflowMetrics;
    resources: ResourceMetrics;
    performance: PerformanceMetrics;
    timestamp: string;
}
/**
 * Agent metrics
 */
export interface AgentMetrics {
    total: number;
    running: number;
    stopped: number;
    error: number;
    deployments: Record<string, number>;
}
/**
 * Workflow metrics
 */
export interface WorkflowMetrics {
    total: number;
    running: number;
    completed: number;
    failed: number;
    averageExecutionTime: number;
}
/**
 * Resource metrics
 */
export interface ResourceMetrics {
    cpu: ResourceUsage;
    memory: ResourceUsage;
    storage: ResourceUsage;
    network: NetworkUsage;
}
/**
 * Resource usage
 */
export interface ResourceUsage {
    used: number;
    available: number;
    percentage: number;
}
/**
 * Network usage
 */
export interface NetworkUsage {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
}
//# sourceMappingURL=index.d.ts.map