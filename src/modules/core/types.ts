/**
 * Core模块类型定义
 * 基于mplp-core.json Schema的TypeScript类型定义
 * 遵循双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 */

// ===== 基础类型定义 =====

export type UUID = string;
export type Timestamp = string;
export type Version = string;

// 枚举定义（用于测试和代码中的常量访问）
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ExecutionMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  HYBRID = 'hybrid'
}

// 类型别名（用于接口定义）
export type PriorityType = Priority;
export type ExecutionModeType = ExecutionMode;

// 枚举定义（用于测试和代码中的常量访问）
export enum WorkflowStage {
  CONTEXT = 'context',
  PLAN = 'plan',
  CONFIRM = 'confirm',
  TRACE = 'trace',
  ROLE = 'role',
  EXTENSION = 'extension',
  COLLAB = 'collab',
  DIALOG = 'dialog',
  NETWORK = 'network'
}

export enum WorkflowStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  RUNNING = 'in_progress', // 别名，用于向后兼容
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum StageStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// 类型别名（用于接口定义，支持字符串字面量）
export type WorkflowStageType =
  | 'context'
  | 'plan'
  | 'confirm'
  | 'trace'
  | 'role'
  | 'extension'
  | 'collab'
  | 'dialog'
  | 'network';

export type WorkflowStatusType =
  | 'created'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type StageStatusType =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';



export type CoreOperation =
  | 'workflow_execution'
  | 'module_coordination'
  | 'resource_management'
  | 'system_monitoring'
  | 'error_recovery';

export type OrchestrationMode = 
  | 'centralized'
  | 'distributed'
  | 'hybrid';

export type ResourceAllocation = 
  | 'static'
  | 'dynamic'
  | 'adaptive';

export type FaultTolerance = 
  | 'none'
  | 'basic'
  | 'advanced';

// ===== 重试策略类型 =====

export interface RetryPolicy {
  maxAttempts: number;
  delayMs: number;
  backoffFactor?: number;
}

// ===== 工作流配置类型 =====

export interface WorkflowConfig {
  name?: string;
  description?: string;
  stages: WorkflowStageType[];
  executionMode: ExecutionModeType;
  parallelExecution: boolean;
  timeoutMs?: number;
  maxConcurrentExecutions?: number;
  retryPolicy?: RetryPolicy;
  priority: PriorityType;
}

// ===== 执行上下文类型 =====

export interface ExecutionContext {
  userId?: string;
  sessionId?: UUID;
  requestId?: UUID;
  priority?: PriorityType;
  metadata?: Record<string, unknown>;
  variables?: Record<string, unknown>;
}

// ===== 阶段结果类型 =====

export interface StageResult {
  status: StageStatusType;
  startTime?: Timestamp;
  endTime?: Timestamp;
  durationMs?: number;
  result?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ===== 执行状态类型 =====

export interface ExecutionStatus {
  status: WorkflowStatusType;
  currentStage?: WorkflowStageType;
  completedStages?: WorkflowStageType[];
  stageResults?: Record<string, StageResult>;
  startTime?: Timestamp;
  endTime?: Timestamp;
  durationMs?: number;
  retryCount?: number;
}

// ===== 模块适配器类型 =====

export interface ModuleAdapter {
  adapterType: string;
  config?: Record<string, unknown>;
  timeoutMs?: number;
  retryPolicy?: {
    maxAttempts: number;
    delayMs: number;
  };
}

// ===== 数据流映射类型 =====

export interface DataMapping {
  sourceStage: WorkflowStageType;
  sourceField: string;
  targetField: string;
  transformation?: string;
}

export interface DataFlow {
  inputMappings?: Record<string, DataMapping>;
  outputMappings?: Record<string, DataMapping>;
}

// ===== 模块协调类型 =====

export interface ModuleCoordination {
  moduleAdapters?: Record<string, ModuleAdapter>;
  dataFlow?: DataFlow;
}

// ===== 事件处理类型 =====

export type EventType = 
  | 'workflow_created'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'workflow_cancelled'
  | 'stage_started'
  | 'stage_completed'
  | 'stage_failed'
  | 'module_connected'
  | 'module_disconnected'
  | 'data_transferred';

export interface EventListener {
  eventType: EventType;
  handler: string;
  config?: Record<string, unknown>;
}

export interface EventRouting {
  defaultHandler?: string;
  routingRules?: Array<{
    condition: string;
    handler: string;
  }>;
}

export interface EventHandling {
  eventListeners?: EventListener[];
  eventRouting?: EventRouting;
}

// ===== 核心详细配置类型 =====

export interface CoreDetails {
  orchestrationMode?: OrchestrationMode;
  resourceAllocation?: ResourceAllocation;
  faultTolerance?: FaultTolerance;
}

// ===== 审计追踪类型 =====

export type AuditEventType = 
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'module_coordinated'
  | 'resource_allocated'
  | 'system_recovered'
  | 'cluster_scaled'
  | 'configuration_changed'
  | 'orchestration_updated';

export interface AuditEvent {
  eventId: UUID;
  eventType: AuditEventType;
  timestamp: Timestamp;
  userId: string;
  userRole?: string;
  action: string;
  resource: string;
  systemOperation?: string;
  workflowId?: UUID;
  orchestratorId?: UUID;
  coreOperation?: string;
  coreStatus?: string;
  moduleIds?: string[];
  coreDetails?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

export type ComplianceLevel = 'basic' | 'detailed' | 'comprehensive';

export interface ComplianceSettings {
  gdprEnabled?: boolean;
  hipaaEnabled?: boolean;
  soxEnabled?: boolean;
  coreAuditLevel?: ComplianceLevel;
  coreDataLogging?: boolean;
  customCompliance?: string[];
}

export interface AuditTrail {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: ComplianceSettings;
}

// ===== 监控集成类型 =====

export type MonitoringProvider = 
  | 'prometheus'
  | 'grafana'
  | 'datadog'
  | 'new_relic'
  | 'elastic_apm'
  | 'custom';

export interface IntegrationEndpoints {
  metricsApi?: string;
  systemHealthApi?: string;
  workflowMetricsApi?: string;
  resourceMetricsApi?: string;
}

export interface SystemMetrics {
  trackWorkflowExecution?: boolean;
  trackModuleCoordination?: boolean;
  trackResourceUsage?: boolean;
  trackSystemHealth?: boolean;
}

export type ExportFormat = 'prometheus' | 'opentelemetry' | 'custom';

export interface MonitoringIntegration {
  enabled: boolean;
  supportedProviders: MonitoringProvider[];
  integrationEndpoints?: IntegrationEndpoints;
  systemMetrics?: SystemMetrics;
  exportFormats?: ExportFormat[];
}

// ===== 性能指标类型 =====

export interface PerformanceMetrics {
  coreOrchestrationLatencyMs?: number;
  workflowCoordinationEfficiencyScore?: number;
  systemReliabilityScore?: number;
  moduleIntegrationSuccessPercent?: number;
  coreManagementEfficiencyScore?: number;
  activeWorkflowsCount?: number;
  coreOperationsPerSecond?: number;
  coreMemoryUsageMb?: number;
  averageWorkflowComplexityScore?: number;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'critical';
export type CheckStatus = 'pass' | 'fail' | 'warn';

export interface HealthCheck {
  checkName: string;
  status: CheckStatus;
  message?: string;
  durationMs?: number;
}

export interface HealthStatusInfo {
  status?: HealthStatus;
  lastCheck?: Timestamp;
  checks?: HealthCheck[];
}

export interface AlertingThresholds {
  maxCoreOrchestrationLatencyMs?: number;
  minWorkflowCoordinationEfficiencyScore?: number;
  minSystemReliabilityScore?: number;
  minModuleIntegrationSuccessPercent?: number;
  minCoreManagementEfficiencyScore?: number;
}

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';

export interface Alerting {
  enabled?: boolean;
  thresholds?: AlertingThresholds;
  notificationChannels?: NotificationChannel[];
}

export interface PerformanceMetricsConfig {
  enabled: boolean;
  collectionIntervalSeconds: number;
  metrics?: PerformanceMetrics;
  healthStatus?: HealthStatusInfo;
  alerting?: Alerting;
}

// ===== 版本历史类型 =====

export type ChangeType =
  | 'system_initialized'
  | 'configuration_updated'
  | 'workflow_deployed'
  | 'cluster_scaled'
  | 'recovery_executed';

export interface VersionHistoryEntry {
  versionId: UUID;
  versionNumber: number;
  createdAt: Timestamp;
  createdBy: string;
  changeSummary?: string;
  systemSnapshot?: Record<string, unknown>;
  changeType: ChangeType;
}

export interface AutoVersioning {
  enabled?: boolean;
  versionOnConfigChange?: boolean;
  versionOnDeployment?: boolean;
  versionOnScaling?: boolean;
}

export interface VersionHistory {
  enabled: boolean;
  maxVersions: number;
  versions?: VersionHistoryEntry[];
  autoVersioning?: AutoVersioning;
}

// ===== 搜索元数据类型 =====

export type IndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';

export type SearchableField =
  | 'workflow_id'
  | 'orchestrator_id'
  | 'workflow_config'
  | 'execution_status'
  | 'system_metrics'
  | 'audit_logs'
  | 'metadata';

export type IndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';

export interface SearchIndex {
  indexId: string;
  indexName: string;
  fields: string[];
  indexType: IndexType;
  createdAt: Timestamp;
  lastUpdated?: Timestamp;
}

export interface SystemIndexing {
  enabled?: boolean;
  indexWorkflowData?: boolean;
  indexSystemMetrics?: boolean;
  indexAuditLogs?: boolean;
}

export interface AutoIndexing {
  enabled?: boolean;
  indexNewWorkflows?: boolean;
  reindexIntervalHours?: number;
}

export interface SearchMetadata {
  enabled: boolean;
  indexingStrategy: IndexingStrategy;
  searchableFields?: SearchableField[];
  searchIndexes?: SearchIndex[];
  systemIndexing?: SystemIndexing;
  autoIndexing?: AutoIndexing;
}

// ===== 事件集成类型 =====

export type BusType = 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';

export interface EventBusConnection {
  busType?: BusType;
  connectionString?: string;
  topicPrefix?: string;
  consumerGroup?: string;
}

export type PublishedEvent =
  | 'system_started'
  | 'system_stopped'
  | 'workflow_executed'
  | 'workflow_failed'
  | 'module_coordinated'
  | 'resource_allocated'
  | 'system_recovered'
  | 'cluster_scaled';

export type SubscribedEvent =
  | 'context_updated'
  | 'plan_executed'
  | 'confirm_approved'
  | 'trace_completed'
  | 'role_assigned'
  | 'extension_activated'
  | 'dialog_started'
  | 'network_connected';

export interface EventRoutingRule {
  ruleId: string;
  condition: string;
  targetTopic: string;
  enabled?: boolean;
}

export interface EventRoutingConfig {
  routingRules?: EventRoutingRule[];
}

export interface EventIntegration {
  enabled: boolean;
  eventBusConnection?: EventBusConnection;
  publishedEvents?: PublishedEvent[];
  subscribedEvents?: SubscribedEvent[];
  eventRouting?: EventRoutingConfig;
}

// ===== 主要实体类型 =====

export interface CoreEntity {
  protocolVersion: Version;
  timestamp: Timestamp;
  workflowId: UUID;
  orchestratorId: UUID;
  workflowConfig: WorkflowConfig;
  executionContext: ExecutionContext;
  executionStatus: ExecutionStatus;
  moduleCoordination?: ModuleCoordination;
  eventHandling?: EventHandling;
  auditTrail: AuditTrail;
  monitoringIntegration: MonitoringIntegration;
  performanceMetrics: PerformanceMetricsConfig;
  versionHistory: VersionHistory;
  searchMetadata: SearchMetadata;
  coreOperation: CoreOperation;
  coreDetails?: CoreDetails;
  eventIntegration: EventIntegration;
}

// ===== Schema映射类型 =====

export interface CoreSchema {
  protocol_version: string;
  timestamp: string;
  workflow_id: string;
  orchestrator_id: string;
  workflow_config: {
    name?: string;
    description?: string;
    stages: string[];
    execution_mode: string;
    parallel_execution: boolean;
    priority: string;
    timeout_ms?: number;
    max_concurrent_executions?: number;
    retry_policy?: {
      max_attempts: number;
      delay_ms: number;
      backoff_factor?: number;
    };
  };
  execution_context: {
    user_id?: string;
    session_id?: string;
    request_id?: string;
    priority?: string;
    metadata?: Record<string, unknown>;
    variables?: Record<string, unknown>;
  };
  execution_status: {
    status: string;
    current_stage?: string;
    completed_stages?: string[];
    stage_results?: Record<string, {
      status: string;
      start_time?: string;
      end_time?: string;
      duration_ms?: number;
      result?: Record<string, unknown>;
      error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
    }>;
    start_time?: string;
    end_time?: string;
    duration_ms?: number;
    retry_count?: number;
  };
  module_coordination?: {
    module_adapters?: Record<string, {
      adapter_type: string;
      config?: Record<string, unknown>;
      timeout_ms?: number;
      retry_policy?: {
        max_attempts: number;
        delay_ms: number;
      };
    }>;
    data_flow?: {
      input_mappings?: Record<string, {
        source_stage: string;
        source_field: string;
        target_field: string;
        transformation?: string;
      }>;
      output_mappings?: Record<string, {
        target_stage: string;
        source_field: string;
        target_field: string;
        transformation?: string;
      }>;
    };
  };
  event_handling?: {
    event_listeners?: Array<{
      event_type: string;
      handler: string;
      config?: Record<string, unknown>;
    }>;
    event_routing?: {
      default_handler?: string;
      routing_rules?: Array<{
        condition: string;
        handler: string;
      }>;
    };
  };
  audit_trail: {
    enabled: boolean;
    retention_days: number;
    audit_events?: Array<{
      event_id: string;
      event_type: string;
      timestamp: string;
      user_id: string;
      user_role?: string;
      action: string;
      resource: string;
      system_operation?: string;
      workflow_id?: string;
      orchestrator_id?: string;
      core_operation?: string;
      core_status?: string;
      module_ids?: string[];
      core_details?: Record<string, unknown>;
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
      correlation_id?: string;
    }>;
    compliance_settings?: {
      gdpr_enabled?: boolean;
      hipaa_enabled?: boolean;
      sox_enabled?: boolean;
      core_audit_level?: string;
      core_data_logging?: boolean;
      custom_compliance?: string[];
    };
  };
  monitoring_integration: {
    enabled: boolean;
    supported_providers: string[];
    integration_endpoints?: {
      metrics_api?: string;
      system_health_api?: string;
      workflow_metrics_api?: string;
      resource_metrics_api?: string;
    };
    system_metrics?: {
      track_workflow_execution?: boolean;
      track_module_coordination?: boolean;
      track_resource_usage?: boolean;
      track_system_health?: boolean;
    };
    export_formats?: string[];
  };
  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: {
      core_orchestration_latency_ms?: number;
      workflow_coordination_efficiency_score?: number;
      system_reliability_score?: number;
      module_integration_success_percent?: number;
      core_management_efficiency_score?: number;
      active_workflows_count?: number;
      core_operations_per_second?: number;
      core_memory_usage_mb?: number;
      average_workflow_complexity_score?: number;
    };
    health_status?: {
      status?: string;
      last_check?: string;
      checks?: Array<{
        check_name: string;
        status: string;
        message?: string;
        duration_ms?: number;
      }>;
    };
    alerting?: {
      enabled?: boolean;
      thresholds?: {
        max_core_orchestration_latency_ms?: number;
        min_workflow_coordination_efficiency_score?: number;
        min_system_reliability_score?: number;
        min_module_integration_success_percent?: number;
        min_core_management_efficiency_score?: number;
      };
      notification_channels?: string[];
    };
  };
  version_history: {
    enabled: boolean;
    max_versions: number;
    versions?: Array<{
      version_id: string;
      version_number: number;
      created_at: string;
      created_by: string;
      change_summary?: string;
      system_snapshot?: Record<string, unknown>;
      change_type: string;
    }>;
    auto_versioning?: {
      enabled?: boolean;
      version_on_config_change?: boolean;
      version_on_deployment?: boolean;
      version_on_scaling?: boolean;
    };
  };
  search_metadata: {
    enabled: boolean;
    indexing_strategy: string;
    searchable_fields?: string[];
    search_indexes?: Array<{
      index_id: string;
      index_name: string;
      fields: string[];
      index_type: string;
      created_at: string;
      last_updated?: string;
    }>;
    system_indexing?: {
      enabled?: boolean;
      index_workflow_data?: boolean;
      index_system_metrics?: boolean;
      index_audit_logs?: boolean;
    };
    auto_indexing?: {
      enabled?: boolean;
      index_new_workflows?: boolean;
      reindex_interval_hours?: number;
    };
  };
  core_operation: string;
  core_details?: {
    orchestration_mode?: string;
    resource_allocation?: string;
    fault_tolerance?: string;
  };
  event_integration: {
    enabled: boolean;
    event_bus_connection?: {
      bus_type?: string;
      connection_string?: string;
      topic_prefix?: string;
      consumer_group?: string;
    };
    published_events?: string[];
    subscribed_events?: string[];
    event_routing?: {
      routing_rules?: Array<{
        rule_id: string;
        condition: string;
        target_topic: string;
        enabled?: boolean;
      }>;
    };
  };
}
