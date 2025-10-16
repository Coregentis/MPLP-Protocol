/**
 * Trace模块类型定义
 * 
 * @description 基于mplp-trace.json Schema的完整TypeScript类型定义
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-trace.json
 * @naming_convention TypeScript层使用camelCase
 * @coverage 100%Schema字段覆盖 (85+字段)
 */

import { UUID } from '../../shared/types';

// 重新导出UUID类型
export type { UUID };

// 本地类型定义
export type Timestamp = string;

// ===== 基础枚举类型 =====

/**
 * 追踪类型枚举
 */
export type TraceType = 
  | 'execution'
  | 'monitoring'
  | 'audit'
  | 'performance'
  | 'error'
  | 'decision';

/**
 * 严重程度枚举
 */
export type Severity =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'critical';

// 为了向后兼容，添加TraceSeverity别名
export type TraceSeverity = Severity;

/**
 * 事件类型枚举
 */
export type EventType = 
  | 'start'
  | 'progress'
  | 'checkpoint'
  | 'completion'
  | 'failure'
  | 'timeout'
  | 'interrupt';

/**
 * 事件类别枚举
 */
export type EventCategory = 
  | 'system'
  | 'user'
  | 'external'
  | 'automatic';

/**
 * 错误类型枚举
 */
export type ErrorType = 
  | 'system'
  | 'business'
  | 'validation'
  | 'network'
  | 'timeout'
  | 'security';

/**
 * 恢复操作枚举
 */
export type RecoveryActionType = 
  | 'retry'
  | 'fallback'
  | 'escalate'
  | 'ignore'
  | 'abort';

/**
 * 关联类型枚举
 */
export type CorrelationType = 
  | 'causation'
  | 'temporal'
  | 'spatial'
  | 'logical';

/**
 * 监控提供商枚举
 */
export type MonitoringProvider = 
  | 'prometheus'
  | 'grafana'
  | 'datadog'
  | 'new_relic'
  | 'elastic_apm'
  | 'jaeger'
  | 'zipkin'
  | 'custom';

/**
 * 导出格式枚举
 */
export type ExportFormat = 
  | 'opentelemetry'
  | 'jaeger'
  | 'zipkin'
  | 'prometheus'
  | 'custom';

/**
 * 索引策略枚举
 */
export type IndexingStrategy = 
  | 'full_text'
  | 'keyword'
  | 'semantic'
  | 'hybrid';

/**
 * 可搜索字段枚举
 */
export type SearchableField = 
  | 'trace_id'
  | 'context_id'
  | 'trace_type'
  | 'severity'
  | 'event'
  | 'tags'
  | 'metadata'
  | 'performance_metrics';

/**
 * 追踪操作枚举
 */
export type TraceOperation =
  | 'start'
  | 'record'
  | 'analyze'
  | 'export'
  | 'archive'
  | 'update';

/**
 * 发布事件枚举
 */
export type PublishedEvent = 
  | 'trace_created'
  | 'trace_updated'
  | 'trace_analyzed'
  | 'trace_correlated'
  | 'trace_archived';

/**
 * 订阅事件枚举
 */
export type SubscribedEvent = 
  | 'context_updated'
  | 'plan_executed'
  | 'confirm_approved'
  | 'system_alert';

// ===== 复杂对象接口 =====

/**
 * 事件源信息
 */
export interface EventSource {
  component: string;
  module?: string;
  function?: string;
  lineNumber?: number;
}

/**
 * 事件对象
 */
export interface EventObject {
  type: EventType;
  name: string;
  description?: string;
  category: EventCategory;
  source: EventSource;
  data?: Record<string, unknown>;
}

/**
 * 环境信息
 */
export interface Environment {
  os?: string;
  platform?: string;
  runtimeVersion?: string;
  environmentVariables?: Record<string, string>;
}

/**
 * 调用栈帧
 */
export interface CallStackFrame {
  function: string;
  file?: string;
  line?: number;
  arguments?: Record<string, unknown>;
}

/**
 * 上下文快照
 */
export interface ContextSnapshot {
  variables?: Record<string, unknown>;
  environment?: Environment;
  callStack?: CallStackFrame[];
}

/**
 * 堆栈帧
 */
export interface StackFrame {
  file: string;
  function: string;
  line: number;
  column?: number;
}

/**
 * 恢复操作
 */
export interface RecoveryAction {
  action: RecoveryActionType;
  description: string;
  parameters?: Record<string, unknown>;
}

/**
 * 错误信息
 */
export interface ErrorInformation {
  errorCode: string;
  errorMessage: string;
  errorType: ErrorType;
  stackTrace?: StackFrame[];
  recoveryActions?: RecoveryAction[];
}

/**
 * 决策选项
 */
export interface DecisionOption {
  option: string;
  score: number;
  rationale?: string;
  riskFactors?: string[];
}

/**
 * 决策标准
 */
export interface DecisionCriterion {
  criterion: string;
  weight: number;
  evaluation?: string;
}

/**
 * 决策日志
 */
export interface DecisionLog {
  decisionPoint: string;
  optionsConsidered: DecisionOption[];
  selectedOption: string;
  decisionCriteria?: DecisionCriterion[];
  confidenceLevel?: number;
}

/**
 * 关联关系
 */
export interface Correlation {
  correlationId: UUID;
  type: CorrelationType;
  relatedTraceId: UUID;
  strength?: number;
  description?: string;
}

/**
 * 审计事件
 */
export interface AuditEvent {
  eventId: UUID;
  eventType: string;
  timestamp: Timestamp;
  userId: string;
  userRole?: string;
  action: string;
  resource: string;
  traceOperation?: string;
  traceId?: UUID;
  traceType?: string;
  severity?: string;
  spanIds?: UUID[];
  traceStatus?: string;
  traceDetails?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

/**
 * 合规设置
 */
export interface ComplianceSettings {
  gdprEnabled?: boolean;
  hipaaEnabled?: boolean;
  soxEnabled?: boolean;
  traceAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
  traceDataLogging?: boolean;
  customCompliance?: string[];
}

/**
 * 审计追踪
 */
export interface AuditTrail {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: ComplianceSettings;
}

/**
 * 指标数据
 */
export interface MetricsData {
  traceProcessingLatencyMs?: number;
  spanCollectionRatePerSecond?: number;
  traceAnalysisAccuracyPercent?: number;
  distributedTracingCoveragePercent?: number;
  traceMonitoringEfficiencyScore?: number;
  activeTracesCount?: number;
  traceOperationsPerSecond?: number;
  traceStorageUsageMb?: number;
  averageTraceComplexityScore?: number;
}

/**
 * 健康检查
 */
export interface HealthCheck {
  checkName: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  durationMs?: number;
}

/**
 * 健康状态
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'sampling';
  lastCheck?: Timestamp;
  checks?: HealthCheck[];
}

/**
 * 告警阈值
 */
export interface AlertingThresholds {
  maxTraceProcessingLatencyMs?: number;
  minSpanCollectionRatePerSecond?: number;
  minTraceAnalysisAccuracyPercent?: number;
  minDistributedTracingCoveragePercent?: number;
  minTraceMonitoringEfficiencyScore?: number;
}

/**
 * 告警配置
 */
export interface AlertingConfig {
  enabled?: boolean;
  thresholds?: AlertingThresholds;
  notificationChannels?: ('email' | 'slack' | 'webhook' | 'sms' | 'pagerduty')[];
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  enabled: boolean;
  collectionIntervalSeconds: number;
  metrics?: MetricsData;
  healthStatus?: HealthStatus;
  alerting?: AlertingConfig;
}

/**
 * 集成端点
 */
export interface IntegrationEndpoints {
  metricsApi?: string;
  tracingApi?: string;
  alertingApi?: string;
  dashboardApi?: string;
}

/**
 * 采样配置
 */
export interface SamplingConfig {
  samplingRate?: number;
  adaptiveSampling?: boolean;
  maxTracesPerSecond?: number;
}

/**
 * 监控集成
 */
export interface MonitoringIntegration {
  enabled: boolean;
  supportedProviders: MonitoringProvider[];
  integrationEndpoints?: IntegrationEndpoints;
  exportFormats?: ExportFormat[];
  samplingConfig?: SamplingConfig;
}

/**
 * 版本记录
 */
export interface VersionRecord {
  versionId: UUID;
  versionNumber: number;
  createdAt: Timestamp;
  createdBy: string;
  changeSummary?: string;
  traceSnapshot?: Record<string, unknown>;
  changeType: 'created' | 'updated' | 'analyzed' | 'enriched' | 'corrected';
}

/**
 * 自动版本控制
 */
export interface AutoVersioning {
  enabled?: boolean;
  versionOnUpdate?: boolean;
  versionOnAnalysis?: boolean;
}

/**
 * 版本历史
 */
export interface VersionHistory {
  enabled: boolean;
  maxVersions: number;
  versions?: VersionRecord[];
  autoVersioning?: AutoVersioning;
}

/**
 * 搜索索引
 */
export interface SearchIndex {
  indexId: string;
  indexName: string;
  fields: string[];
  indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
}

/**
 * 自动索引
 */
export interface AutoIndexing {
  enabled?: boolean;
  indexNewTraces?: boolean;
  reindexIntervalHours?: number;
}

/**
 * 搜索元数据
 */
export interface SearchMetadata {
  enabled: boolean;
  indexingStrategy: IndexingStrategy;
  searchableFields?: SearchableField[];
  searchIndexes?: SearchIndex[];
  autoIndexing?: AutoIndexing;
}

/**
 * 事件总线连接
 */
export interface EventBusConnection {
  busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
  connectionString?: string;
  topicPrefix?: string;
  consumerGroup?: string;
}

/**
 * 事件路由规则
 */
export interface EventRoutingRule {
  ruleId: string;
  condition: string;
  targetTopic: string;
  enabled?: boolean;
}

/**
 * 事件路由
 */
export interface EventRouting {
  routingRules?: EventRoutingRule[];
}

/**
 * 事件集成
 */
export interface EventIntegration {
  enabled: boolean;
  eventBusConnection?: EventBusConnection;
  publishedEvents?: PublishedEvent[];
  subscribedEvents?: SubscribedEvent[];
  eventRouting?: EventRouting;
}

/**
 * 追踪详细配置
 */
export interface TraceDetails {
  traceLevel?: 'basic' | 'detailed' | 'comprehensive';
  samplingRate?: number;
  retentionDays?: number;
}

// ===== 主要实体接口 =====

/**
 * Trace实体数据接口 (TypeScript层，camelCase)
 */
export interface TraceEntityData {
  // 核心协议字段
  protocolVersion: string;
  timestamp: Timestamp;
  traceId: UUID;
  contextId: UUID;
  planId?: UUID;
  taskId?: UUID;

  // 追踪核心字段
  traceType: TraceType;
  severity: Severity;
  event: EventObject;

  // 可选核心字段
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  correlations?: Correlation[];

  // 企业级功能字段
  auditTrail: AuditTrail;
  performanceMetrics: PerformanceMetrics;
  monitoringIntegration: MonitoringIntegration;
  versionHistory: VersionHistory;
  searchMetadata: SearchMetadata;
  traceOperation: TraceOperation;
  traceDetails?: TraceDetails;
  eventIntegration: EventIntegration;

  // 新增重构字段
  spans?: SpanEntity[];
  statistics?: TraceStatistics;
  containsSensitiveData?: boolean;
}

// ===== 新增重构相关接口 =====

/**
 * 开始追踪数据接口
 */
export interface StartTraceData {
  name: string;
  type: TraceType;
  contextId: UUID;
  parentTraceId?: UUID;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
  collectionConfig?: DataCollectionConfig;
}

/**
 * 结束追踪数据接口
 */
export interface EndTraceData {
  endTime?: Date;
  finalStatus?: 'completed' | 'error' | 'cancelled';
}

/**
 * 跨度数据接口
 */
export interface SpanData {
  parentSpanId?: string;
  operationName: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  tags?: Record<string, string>;
  logs?: LogEntry[];
  status?: 'active' | 'completed' | 'error';
}

/**
 * 跨度实体接口
 */
export interface SpanEntity {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: Record<string, string>;
  logs: LogEntry[];
  status: 'active' | 'completed' | 'error';
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, unknown>;
}

/**
 * 追踪查询接口
 */
export interface TraceQuery {
  contextId?: UUID;
  traceType?: TraceType | TraceType[];
  severity?: Severity | Severity[];
  startTime?: Date;
  endTime?: Date;
  tags?: Record<string, string>;
  limit?: number;
  offset?: number;
}

/**
 * 追踪统计接口
 */
export interface TraceStatistics {
  totalSpans: number;
  totalDuration: number;
  averageSpanDuration: number;
  errorCount: number;
  successRate: number;
  criticalPath: string[];
  bottlenecks: string[];
}

/**
 * 数据收集配置接口
 */
export interface DataCollectionConfig {
  samplingRate?: number;
  enableMetrics?: boolean;
  enableLogs?: boolean;
  bufferSize?: number;
}

/**
 * 数据收集器接口
 */
export interface IDataCollector {
  startCollection(traceId: string, config: DataCollectionConfig): Promise<void>;
  stopCollection(traceId: string): Promise<void>;
}

/**
 * 日志记录器接口
 */
export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

// ===== 分析相关接口 =====

/**
 * 追踪性能分析结果接口
 */
export interface TracePerformanceAnalysis {
  traceId: string;
  timestamp: string;
  performance: {
    totalDuration: number;
    spanCount: number;
    averageSpanDuration: number;
    slowestOperations: Array<{operation: string, duration: number}>;
    fastestOperations: Array<{operation: string, duration: number}>;
  };
  bottlenecks: {
    criticalPath: string[];
    performanceBottlenecks: string[];
    resourceBottlenecks: string[];
  };
  recommendations: string[];
}

/**
 * 追踪趋势分析接口
 */
export interface TraceTrends {
  timeRange: TimeRange;
  totalTraces: number;
  trends: {
    volumeTrend: { trend: string; change: number };
    performanceTrend: { trend: string; change: number };
    errorRateTrend: { trend: string; change: number };
    durationTrend: { trend: string; change: number };
  };
  insights: {
    peakHours: string[];
    commonPatterns: string[];
    performanceRegression: boolean;
  };
}

/**
 * 时间范围接口
 */
export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

/**
 * 追踪过滤器接口
 */
export interface TraceFilters {
  contextId?: string;
  traceType?: TraceType;
  severity?: Severity;
}

/**
 * 追踪异常接口
 */
export interface TraceAnomaly {
  type: 'performance' | 'error' | 'volume';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
  affectedTraces: string[];
}

/**
 * 分析报告类型
 */
export type AnalysisReportType = 'performance' | 'availability' | 'error_analysis' | 'capacity_planning';

/**
 * 报告参数接口
 */
export interface ReportParams {
  timeRange: TimeRange;
  filters?: TraceFilters;
  includeDetails?: boolean;
}

/**
 * 分析报告接口
 */
export interface AnalysisReport {
  reportType: AnalysisReportType;
  generatedAt: string;
  data: Record<string, unknown>;
}

/**
 * 实时指标接口
 */
export interface RealtimeMetrics {
  timestamp: string;
  metrics: {
    activeTraces: number;
    completedTraces: number;
    errorTraces: number;
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
  };
  alerts: Alert[];
}

/**
 * 警报接口
 */
export interface Alert {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// ===== 安全相关接口 =====

/**
 * 追踪安全审计接口
 */
export interface TraceSecurityAudit {
  auditId: string;
  timeRange: TimeRange;
  startTime: Date;
  endTime: Date;
  securityFindings: SecurityFinding[];
  complianceFindings: ComplianceFinding[];
  overallScore: number;
  recommendations: string[];
}

/**
 * 安全发现接口
 */
export interface SecurityFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

/**
 * 合规发现接口
 */
export interface ComplianceFinding {
  id: string;
  standard: ComplianceStandard;
  violation: string;
  severity: 'low' | 'medium' | 'high';
  remediation: string;
}

/**
 * 合规标准类型
 */
export type ComplianceStandard = 'GDPR' | 'HIPAA' | 'SOX';

/**
 * 合规结果接口
 */
export interface ComplianceResult {
  compliant: boolean;
  findings: string[];
  score: number;
}

/**
 * 数据保留策略接口
 */
export interface DataRetentionPolicy {
  name: string;
  retentionPeriod: number; // milliseconds
  archiveBeforeDelete: boolean;
}

/**
 * 数据保留结果接口
 */
export interface DataRetentionResult {
  totalProcessed: number;
  archived: number;
  deleted: number;
  errors: Array<{
    traceId: string;
    error: string;
  }>;
}

// ===== 操作相关接口 =====

/**
 * 创建Trace请求接口
 */
export interface CreateTraceRequest {
  contextId: UUID;
  planId?: UUID;
  taskId?: UUID;
  traceType: TraceType;
  severity: Severity;
  event: Partial<EventObject>;
  contextSnapshot?: Partial<ContextSnapshot>;
  errorInformation?: Partial<ErrorInformation>;
  decisionLog?: Partial<DecisionLog>;
  traceOperation: TraceOperation;
  traceDetails?: Partial<TraceDetails>;
}

/**
 * 更新Trace请求接口
 */
export interface UpdateTraceRequest {
  traceId: UUID;
  severity?: Severity;
  event?: Partial<EventObject>;
  contextSnapshot?: Partial<ContextSnapshot>;
  errorInformation?: Partial<ErrorInformation>;
  decisionLog?: Partial<DecisionLog>;
  correlations?: Partial<Correlation>[];
  traceDetails?: Partial<TraceDetails>;
}

/**
 * Trace查询过滤器
 */
export interface TraceQueryFilter {
  traceType?: TraceType | TraceType[];
  severity?: Severity | Severity[];
  contextId?: UUID;
  planId?: UUID;
  taskId?: UUID;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  eventCategory?: EventCategory;
  hasErrors?: boolean;
  hasDecisions?: boolean;
}

/**
 * Trace执行结果
 */
export interface TraceExecutionResult {
  success: boolean;
  traceId?: UUID;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    processingTime: number;
    correlationsFound: number;
    metricsCollected: number;
  };
}

/**
 * Trace分析结果
 */
export interface TraceAnalysisResult {
  traceId: UUID;
  analysisType: 'performance' | 'error' | 'decision' | 'correlation';
  results: {
    insights: string[];
    recommendations: string[];
    anomalies: string[];
    patterns: string[];
  };
  confidence: number;
  analysisTime: number;
}

/**
 * Trace验证结果
 */
export interface TraceValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

// ===== 协议相关接口导出 =====

/**
 * 协议元数据接口
 */
export interface ProtocolMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  supportedOperations: string[];
  crossCuttingConcerns: Record<string, boolean>;
}

/**
 * 协议健康状态接口
 */
export interface ProtocolHealthStatus {
  status: string;
  timestamp: string;
  details?: Record<string, unknown>;
  error?: string;
}

// ===== Schema驱动的扩展类型定义 =====

/**
 * Schema完整事件类型 (基于mplp-trace.json)
 */
export type SchemaEventType = 'start' | 'progress' | 'checkpoint' | 'completion' | 'failure' | 'timeout' | 'interrupt';
export type SchemaEventCategory = 'system' | 'user' | 'external' | 'automatic';

/**
 * 关联信息 (Schema: correlations)
 */
export interface TraceCorrelation {
  correlationId: string;
  type: 'causation' | 'temporal' | 'spatial' | 'logical';
  relatedTraceId: string;
  strength?: number;
  description?: string;
}

/**
 * Schema扩展类型定义 (基于mplp-trace.json的完整Schema)
 */
export type SchemaTraceType = 'execution' | 'monitoring' | 'audit' | 'performance' | 'error' | 'decision';
export type SchemaSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type SchemaErrorType = 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';
export type SchemaRecoveryAction = 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';
export type SchemaCorrelationType = 'causation' | 'temporal' | 'spatial' | 'logical';
export type SchemaAuditEventType = 'trace_created' | 'trace_updated' | 'trace_analyzed' | 'trace_archived' | 'trace_deleted' | 'span_created' | 'span_completed' | 'metrics_collected';
export type SchemaHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'sampling';
export type SchemaCheckStatus = 'pass' | 'fail' | 'warn';
export type SchemaNotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
export type SchemaMonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'jaeger' | 'zipkin' | 'custom';
export type SchemaExportFormat = 'opentelemetry' | 'jaeger' | 'zipkin' | 'prometheus' | 'custom';
export type SchemaEventBusType = 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
export type SchemaIndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
export type SchemaIndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';
export type SchemaSearchableField = 'trace_id' | 'context_id' | 'trace_type' | 'severity' | 'event' | 'tags' | 'metadata' | 'performance_metrics';
export type SchemaTraceLevel = 'basic' | 'detailed' | 'comprehensive';
export type SchemaChangeType = 'created' | 'updated' | 'analyzed' | 'enriched' | 'corrected';

// ===== Schema接口 (snake_case) =====

/**
 * Trace模块Schema接口 (snake_case)
 *
 * @description 基于mplp-trace.json实际Schema定义，用于Mapper类
 */
export interface TraceSchema {
  // 核心协议字段
  protocol_version: string;
  timestamp: string;
  trace_id: string;
  context_id: string;
  plan_id?: string;
  task_id?: string;

  // 追踪核心字段
  trace_type: string;
  severity: string;
  event: {
    type: string;
    name: string;
    description?: string;
    category: string;
    source: {
      component: string;
      module?: string;
      function?: string;
      line_number?: number;
    };
    data?: Record<string, unknown>;
  };

  // 可选核心字段
  context_snapshot?: {
    variables?: Record<string, unknown>;
    environment?: {
      os?: string;
      platform?: string;
      runtime_version?: string;
      environment_variables?: Record<string, string>;
    };
    call_stack?: Array<{
      function: string;
      file?: string;
      line?: number;
      arguments?: Record<string, unknown>;
    }>;
  };

  error_information?: {
    error_code: string;
    error_message: string;
    error_type: string;
    stack_trace?: Array<{
      file: string;
      function: string;
      line: number;
      column?: number;
    }>;
    recovery_actions?: Array<{
      action: string;
      description: string;
      parameters?: Record<string, unknown>;
    }>;
  };

  decision_log?: {
    decision_point: string;
    options_considered: Array<{
      option: string;
      score: number;
      rationale?: string;
      risk_factors?: string[];
    }>;
    selected_option: string;
    decision_criteria?: Array<{
      criterion: string;
      weight: number;
      evaluation?: string;
    }>;
    confidence_level?: number;
  };

  correlations?: Array<{
    correlation_id: string;
    type: string;
    related_trace_id: string;
    strength?: number;
    description?: string;
  }>;

  // 企业级功能字段
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
      trace_operation?: string;
      trace_id?: string;
      trace_type?: string;
      severity?: string;
      span_ids?: string[];
      trace_status?: string;
      trace_details?: Record<string, unknown>;
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
      correlation_id?: string;
    }>;
    compliance_settings?: {
      gdpr_enabled?: boolean;
      hipaa_enabled?: boolean;
      sox_enabled?: boolean;
      trace_audit_level?: string;
      trace_data_logging?: boolean;
      custom_compliance?: string[];
    };
  };

  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: {
      trace_processing_latency_ms?: number;
      span_collection_rate_per_second?: number;
      trace_analysis_accuracy_percent?: number;
      distributed_tracing_coverage_percent?: number;
      trace_monitoring_efficiency_score?: number;
      active_traces_count?: number;
      trace_operations_per_second?: number;
      trace_storage_usage_mb?: number;
      average_trace_complexity_score?: number;
    };
    health_status?: {
      status: string;
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
        max_trace_processing_latency_ms?: number;
        min_span_collection_rate_per_second?: number;
        min_trace_analysis_accuracy_percent?: number;
        min_distributed_tracing_coverage_percent?: number;
        min_trace_monitoring_efficiency_score?: number;
      };
      notification_channels?: string[];
    };
  };

  monitoring_integration: {
    enabled: boolean;
    supported_providers: string[];
    integration_endpoints?: {
      metrics_api?: string;
      tracing_api?: string;
      alerting_api?: string;
      dashboard_api?: string;
    };
    export_formats?: string[];
    sampling_config?: {
      sampling_rate?: number;
      adaptive_sampling?: boolean;
      max_traces_per_second?: number;
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
      trace_snapshot?: Record<string, unknown>;
      change_type: string;
    }>;
    auto_versioning?: {
      enabled?: boolean;
      version_on_update?: boolean;
      version_on_analysis?: boolean;
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
      created_at?: string;
      last_updated?: string;
    }>;
    auto_indexing?: {
      enabled?: boolean;
      index_new_traces?: boolean;
      reindex_interval_hours?: number;
    };
  };

  trace_operation: string;

  trace_details?: {
    trace_level?: string;
    sampling_rate?: number;
    retention_days?: number;
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

// ===== 协议工厂类型 =====

/**
 * Trace协议工厂配置类型
 * @description 基于mplp-trace.json Schema的工厂配置
 */
export interface TraceProtocolFactoryConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';

  // 基于Schema的Trace特定配置
  traceConfiguration?: {
    maxTraces?: number;
    defaultTraceType?: TraceType;
    retentionPeriodDays?: number;
    compressionEnabled?: boolean;
    indexingEnabled?: boolean;
  };

  // 基于Schema的监控配置
  monitoringConfiguration?: {
    enabled?: boolean;
    samplingRate?: number;
    alertThresholds?: {
      errorRate?: number;
      latencyP99Ms?: number;
      throughputRps?: number;
    };
    exportInterval?: number;
  };

  // 基于Schema的性能监控配置
  performanceMetrics?: {
    enabled?: boolean;
    collectionIntervalSeconds?: number;
    traceCreationLatencyThresholdMs?: number;
    traceQueryLatencyThresholdMs?: number;
    storageEfficiencyThreshold?: number;
  };

  // 横切关注点配置
  crossCuttingConcerns?: {
    security?: { enabled: boolean };
    performance?: { enabled: boolean };
    eventBus?: { enabled: boolean };
    errorHandler?: { enabled: boolean };
    coordination?: { enabled: boolean };
    orchestration?: { enabled: boolean };
    stateSync?: { enabled: boolean };
    transaction?: { enabled: boolean };
    protocolVersion?: { enabled: boolean };
  };
}

// ===== 缺失的类型导出 =====

// 为了向后兼容，添加缺失的类型别名
// export type TraceEntityData = TraceEntity; // 注释掉，因为已经有接口定义
export type TraceOperationResult = {
  success: boolean;
  traceId?: UUID;
  error?: string;
  metadata?: Record<string, unknown>;
};

// TraceStatistics interface moved to line 668 to avoid duplication

// 注释：重复的类型定义已删除，使用文件前面的定义
