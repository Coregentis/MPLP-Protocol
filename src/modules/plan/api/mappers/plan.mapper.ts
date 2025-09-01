/**
 * Plan模块Schema-TypeScript映射器
 * 基于 src/schemas/core-modules/mplp-plan.json 实际Schema实现
 * 严格遵循双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 *
 * @description 实现Schema-TypeScript双向映射，遵循双重命名约定
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-plan.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 * @coverage 100%字段映射覆盖，包含9个横切关注点
 */

import { toCamelCase, toSnakeCase } from '../../../../shared/utils';

// ===== Schema类型定义 =====

export interface PlanTaskSchema {
  task_id: string;
  name: string;
  description?: string;
  type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
  status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  assignee?: {
    user_id?: string;
    role?: string;
    team?: string;
  };
  estimated_effort?: {
    value: number;
    unit: 'hours' | 'days' | 'story_points';
  };
  actual_effort?: {
    value: number;
    unit: 'hours' | 'days' | 'story_points';
  };
  resources_required?: Array<{
    resource_type: string;
    amount: number;
    unit: string;
    availability: 'required' | 'preferred' | 'optional';
  }>;
  acceptance_criteria?: Array<{
    id: string;
    description: string;
    type: 'functional' | 'non_functional' | 'quality';
    status: 'pending' | 'met' | 'not_met';
    verification_method?: 'manual' | 'automated' | 'review';
  }>;
  sub_tasks?: Array<PlanTaskSchema>; // 递归引用
  metadata?: {
    tags?: string[];
    category?: string;
    source?: string;
    complexity_score?: number;
    risk_level?: string;
    automation_level?: string;
    retry_count?: number;
    max_retry_count?: number;
    intervention_required?: boolean;
    intervention_reason?: string;
    intervention_requested_at?: string;
    rollback_reason?: string;
    rollback_target?: string;
    skip_reason?: string;
    skip_dependents?: boolean;
  };
}

export interface PlanResourceConstraintsSchema {
  [resourceType: string]: {
    amount: number;
    unit: string;
    availability: 'required' | 'preferred' | 'optional';
  };
}

export interface PlanOptimizationParametersSchema {
  [parameterName: string]: string | number | boolean;
}

export interface PlanMetadataSchema {
  [key: string]: string | number | boolean | null | undefined;
}

export interface PlanAuditEventDetailsSchema {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

// ===== Schema接口定义 (snake_case) =====

export interface PlanSchema {
  // 核心协议字段
  protocol_version: string;
  timestamp: string;
  plan_id: string;
  context_id: string;
  
  // 计划基础字段
  name: string;
  description?: string;
  status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  
  // 时间线字段
  timeline?: {
    start_date?: string;
    end_date?: string;
    estimated_duration: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    };
    actual_duration?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    };
  };
  
  // 任务管理字段
  tasks: Array<{
    task_id: string;
    name: string;
    description?: string;
    type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
    status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    assignee?: {
      user_id?: string;
      role?: string;
      team?: string;
    };
    estimated_effort?: {
      value: number;
      unit: 'hours' | 'days' | 'story_points';
    };
    actual_effort?: {
      value: number;
      unit: 'hours' | 'days' | 'story_points';
    };
    resources_required?: Array<{
      resource_type: string;
      amount: number;
      unit: string;
      availability: 'required' | 'preferred' | 'optional';
    }>;
    acceptance_criteria?: Array<{
      id: string;
      description: string;
      type: 'functional' | 'non_functional' | 'quality';
      status: 'pending' | 'met' | 'not_met';
      verification_method?: 'manual' | 'automated' | 'review';
    }>;
    sub_tasks?: Array<PlanTaskSchema>; // 递归引用
    metadata?: {
      tags?: string[];
      category?: string;
      source?: string;
      complexity_score?: number;
      risk_level?: string;
      automation_level?: string;
      retry_count?: number;
      max_retry_count?: number;
      intervention_required?: boolean;
      intervention_reason?: string;
      intervention_requested_at?: string;
      rollback_reason?: string;
      rollback_target?: string;
      skip_reason?: string;
      skip_dependents?: boolean;
    };
  }>;
  
  // 依赖管理字段
  dependencies?: Array<{
    id: string;
    source_task_id: string;
    target_task_id: string;
    dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    lag?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days';
    };
    criticality: 'blocking' | 'important' | 'nice_to_have';
    condition?: string;
  }>;
  
  // 里程碑字段
  milestones?: Array<{
    id: string;
    name: string;
    description?: string;
    target_date: string;
    status: 'upcoming' | 'at_risk' | 'achieved' | 'missed';
    success_criteria?: Array<{
      metric: string;
      target_value: string | number | boolean;
      actual_value?: string | number | boolean;
      status: 'pending' | 'achieved' | 'not_achieved';
    }>;
  }>;
  
  // 优化配置字段
  optimization?: {
    strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
    constraints?: {
      max_duration?: {
        value: number;
        unit: 'hours' | 'days' | 'weeks';
      };
      max_cost?: number;
      min_quality?: number;
      available_resources?: PlanResourceConstraintsSchema;
    };
    parameters?: PlanOptimizationParametersSchema;
  };
  
  // 风险评估字段
  risk_assessment?: {
    overall_risk_level?: 'low' | 'medium' | 'high' | 'critical';
    risks?: Array<{
      id: string;
      name: string;
      description?: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      category: 'technical' | 'resource' | 'schedule' | 'scope' | 'external';
      probability?: number;
      impact?: number;
      status: 'identified' | 'mitigated' | 'accepted' | 'closed';
      mitigation_plan?: string;
    }>;
  };
  
  // 故障解决器字段
  failure_resolver?: {
    enabled: boolean;
    strategies: Array<'retry' | 'rollback' | 'skip' | 'manual_intervention'>;
    retry_config?: {
      max_attempts: number;
      delay_ms: number;
      backoff_factor?: number;
      max_delay_ms?: number;
    };
    rollback_config?: {
      enabled: boolean;
      checkpoint_frequency?: number;
      max_rollback_depth?: number;
    };
    manual_intervention_config?: {
      timeout_ms?: number;
      escalation_levels?: string[];
      approval_required?: boolean;
    };
    notification_channels?: string[];
    performance_thresholds?: {
      max_execution_time_ms?: number;
      max_memory_usage_mb?: number;
      max_cpu_usage_percent?: number;
    };
  };
  
  // 配置管理字段
  configuration?: {
    auto_scheduling_enabled?: boolean;
    dependency_validation_enabled?: boolean;
    risk_monitoring_enabled?: boolean;
    failure_recovery_enabled?: boolean;
    performance_tracking_enabled?: boolean;
    notification_settings?: {
      enabled: boolean;
      channels?: string[];
      events?: string[];
      task_completion?: boolean;
    };
    optimization_settings?: {
      enabled: boolean;
      strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
      auto_reoptimize?: boolean;
    };
    timeout_settings?: {
      default_task_timeout_ms?: number;
      plan_execution_timeout_ms?: number;
      dependency_resolution_timeout_ms?: number;
    };
    parallel_execution_limit?: number;
  };
  
  // 基础元数据字段
  metadata?: PlanMetadataSchema;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  
  // 审计跟踪字段 (必需)
  audit_trail: {
    enabled: boolean;
    retention_days: number;
    audit_events?: Array<{
      event_id: string;
      event_type: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'task_added' | 'task_removed' | 'dependency_changed';
      timestamp: string;
      user_id: string;
      user_role?: string;
      action: string;
      resource: string;
      plan_operation?: string;
      plan_id?: string;
      plan_name?: string;
      plan_status?: string;
      task_ids?: string[];
      execution_stage?: string;
      plan_details?: PlanAuditEventDetailsSchema;
      old_value?: PlanAuditEventDetailsSchema;
      new_value?: PlanAuditEventDetailsSchema;
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
      correlation_id?: string;
    }>;
    compliance_settings?: {
      gdpr_enabled?: boolean;
      hipaa_enabled?: boolean;
      sox_enabled?: boolean;
      plan_audit_level?: 'basic' | 'detailed' | 'comprehensive';
      plan_data_logging?: boolean;
      custom_compliance?: string[];
    };
  };
  
  // 监控集成字段 (必需)
  monitoring_integration: {
    enabled: boolean;
    supported_providers: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
    integration_endpoints?: {
      metrics_api?: string;
      plan_execution_api?: string;
      task_metrics_api?: string;
      resource_metrics_api?: string;
    };
    plan_metrics?: {
      track_execution_progress?: boolean;
      track_task_performance?: boolean;
      track_resource_usage?: boolean;
      track_failure_recovery?: boolean;
    };
    export_formats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
  };
  
  // 性能指标字段 (必需)
  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: {
      plan_execution_latency_ms?: number;
      task_completion_rate_percent?: number;
      plan_optimization_score?: number;
      dependency_resolution_accuracy_percent?: number;
      plan_execution_efficiency_score?: number;
      active_plans_count?: number;
      plan_operations_per_second?: number;
      plan_memory_usage_mb?: number;
      average_plan_complexity_score?: number;
    };
    health_status?: {
      status: 'healthy' | 'degraded' | 'unhealthy' | 'blocked';
      last_check: string;
      checks?: Array<{
        check_name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration_ms?: number;
      }>;
    };
    alerting?: {
      enabled?: boolean;
      thresholds?: {
        max_plan_execution_latency_ms?: number;
        min_task_completion_rate_percent?: number;
        min_plan_optimization_score?: number;
        min_dependency_resolution_accuracy_percent?: number;
        min_plan_execution_efficiency_score?: number;
      };
      notification_channels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
    };
  };
  
  // 版本历史字段 (必需)
  version_history: {
    enabled: boolean;
    max_versions: number;
    versions?: Array<{
      version_id: string;
      version_number: number;
      created_at: string;
      created_by: string;
      change_summary?: string;
      plan_snapshot?: PlanMetadataSchema;
      change_type: 'plan_created' | 'configuration_updated' | 'tasks_modified' | 'dependencies_changed' | 'execution_optimized';
    }>;
    auto_versioning?: {
      enabled?: boolean;
      version_on_config_change?: boolean;
      version_on_task_change?: boolean;
      version_on_dependency_change?: boolean;
    };
  };
  
  // 搜索元数据字段 (必需)
  search_metadata: {
    enabled: boolean;
    indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchable_fields?: Array<'plan_id' | 'plan_name' | 'plan_status' | 'task_ids' | 'execution_stage' | 'plan_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
    search_indexes?: Array<{
      index_id: string;
      index_name: string;
      fields: string[];
      index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
      created_at: string;
      last_updated: string;
    }>;
    plan_indexing?: {
      enabled?: boolean;
      index_plan_data?: boolean;
      index_performance_metrics?: boolean;
      index_audit_logs?: boolean;
    };
    auto_indexing?: {
      enabled?: boolean;
      index_new_plans?: boolean;
      reindex_interval_hours?: number;
    };
  };
  
  // 缓存策略字段 (必需)
  caching_policy: {
    enabled: boolean;
    cache_strategy: 'lru' | 'lfu' | 'ttl' | 'adaptive';
    cache_levels?: Array<{
      level: string;
      backend: 'memory' | 'redis' | 'memcached' | 'database';
      ttl_seconds: number;
      max_size_mb?: number;
      eviction_policy?: 'lru' | 'lfu' | 'random' | 'ttl';
    }>;
    cache_warming?: {
      enabled?: boolean;
      strategies?: string[];
    };
  };
  
  // 事件集成字段 (必需)
  event_integration: {
    enabled: boolean;
    event_bus_connection?: {
      bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
      connection_string?: string;
      topic_prefix?: string;
      consumer_group?: string;
    };
    published_events?: Array<'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'plan_task_added' | 'plan_task_removed' | 'plan_dependency_changed'>;
    subscribed_events?: Array<'context_updated' | 'confirm_approved' | 'trace_completed' | 'role_assigned' | 'extension_activated' | 'dialog_started' | 'network_connected' | 'collab_coordinated' | 'orchestration_executed' | 'coordination_synchronized' | 'eventbus_message_published' | 'statesync_sync_completed' | 'transaction_committed' | 'protocolversion_version_checked' | 'errorhandling_error_occurred' | 'security_authentication_attempted' | 'performance_metric_collected'>;
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

// ===== TypeScript类型定义 =====

export interface PlanTaskData {
  taskId: string;
  name: string;
  description?: string;
  type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
  status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  assignee?: {
    userId?: string;
    role?: string;
    team?: string;
  };
  estimatedEffort?: {
    value: number;
    unit: 'hours' | 'days' | 'story_points';
  };
  actualEffort?: {
    value: number;
    unit: 'hours' | 'days' | 'story_points';
  };
  resourcesRequired?: Array<{
    resourceType: string;
    amount: number;
    unit: string;
    availability: 'required' | 'preferred' | 'optional';
  }>;
  acceptanceCriteria?: Array<{
    id: string;
    description: string;
    type: 'functional' | 'non_functional' | 'quality';
    status: 'pending' | 'met' | 'not_met';
    verificationMethod?: 'manual' | 'automated' | 'review';
  }>;
  subTasks?: Array<PlanTaskData>; // 递归引用
  metadata?: {
    tags?: string[];
    category?: string;
    source?: string;
    complexityScore?: number;
    riskLevel?: string;
    automationLevel?: string;
    retryCount?: number;
    maxRetryCount?: number;
    interventionRequired?: boolean;
    interventionReason?: string;
    interventionRequestedAt?: Date;
    rollbackReason?: string;
    rollbackTarget?: string;
    skipReason?: string;
    skipDependents?: boolean;
  };
}

export interface PlanResourceConstraints {
  [resourceType: string]: {
    amount: number;
    unit: string;
    availability: 'required' | 'preferred' | 'optional';
  };
}

export interface PlanOptimizationParameters {
  [parameterName: string]: string | number | boolean;
}

export interface PlanMetadata {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export interface PlanAuditEventDetails {
  [key: string]: string | number | boolean | Date | string[] | null | undefined;
}

// ===== TypeScript接口定义 (camelCase) =====

export interface PlanEntityData {
  // 核心协议字段
  protocolVersion: string;
  timestamp: Date;
  planId: string;
  contextId: string;

  // 计划基础字段
  name: string;
  description?: string;
  status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority?: 'critical' | 'high' | 'medium' | 'low';

  // AI服务结果字段 (整合自PlanResultEntity)
  confidence?: number;
  resultId?: string;
  planData?: Record<string, unknown>;

  // 时间线字段
  timeline?: {
    startDate?: Date;
    endDate?: Date;
    estimatedDuration: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    };
    actualDuration?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    };
  };

  // 任务管理字段
  tasks: Array<{
    taskId: string;
    name: string;
    description?: string;
    type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
    status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    assignee?: {
      userId?: string;
      role?: string;
      team?: string;
    };
    estimatedEffort?: {
      value: number;
      unit: 'hours' | 'days' | 'story_points';
    };
    actualEffort?: {
      value: number;
      unit: 'hours' | 'days' | 'story_points';
    };
    resourcesRequired?: Array<{
      resourceType: string;
      amount: number;
      unit: string;
      availability: 'required' | 'preferred' | 'optional';
    }>;
    acceptanceCriteria?: Array<{
      id: string;
      description: string;
      type: 'functional' | 'non_functional' | 'quality';
      status: 'pending' | 'met' | 'not_met';
      verificationMethod?: 'manual' | 'automated' | 'review';
    }>;
    subTasks?: Array<PlanTaskData>; // 递归引用
    metadata?: {
      tags?: string[];
      category?: string;
      source?: string;
      complexityScore?: number;
      riskLevel?: string;
      automationLevel?: string;
      retryCount?: number;
      maxRetryCount?: number;
      interventionRequired?: boolean;
      interventionReason?: string;
      interventionRequestedAt?: Date;
      rollbackReason?: string;
      rollbackTarget?: string;
      skipReason?: string;
      skipDependents?: boolean;
    };
  }>;

  // 依赖管理字段
  dependencies?: Array<{
    id: string;
    sourceTaskId: string;
    targetTaskId: string;
    dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    lag?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days';
    };
    criticality: 'blocking' | 'important' | 'nice_to_have';
    condition?: string;
  }>;

  // 里程碑字段
  milestones?: Array<{
    id: string;
    name: string;
    description?: string;
    targetDate: Date;
    status: 'upcoming' | 'at_risk' | 'achieved' | 'missed';
    successCriteria?: Array<{
      metric: string;
      targetValue: string | number | boolean;
      actualValue?: string | number | boolean;
      status: 'pending' | 'achieved' | 'not_achieved';
    }>;
  }>;

  // 优化配置字段
  optimization?: {
    strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
    constraints?: {
      maxDuration?: {
        value: number;
        unit: 'hours' | 'days' | 'weeks';
      };
      maxCost?: number;
      minQuality?: number;
      availableResources?: PlanResourceConstraints;
    };
    parameters?: PlanOptimizationParameters;
  };

  // 风险评估字段
  riskAssessment?: {
    overallRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
    risks?: Array<{
      id: string;
      name: string;
      description?: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      category: 'technical' | 'resource' | 'schedule' | 'scope' | 'external';
      probability?: number;
      impact?: number;
      status: 'identified' | 'mitigated' | 'accepted' | 'closed';
      mitigationPlan?: string;
    }>;
  };

  // 故障解决器字段
  failureResolver?: {
    enabled: boolean;
    strategies: Array<'retry' | 'rollback' | 'skip' | 'manual_intervention'>;
    retryConfig?: {
      maxAttempts: number;
      delayMs: number;
      backoffFactor?: number;
      maxDelayMs?: number;
    };
    rollbackConfig?: {
      enabled: boolean;
      checkpointFrequency?: number;
      maxRollbackDepth?: number;
    };
    manualInterventionConfig?: {
      timeoutMs?: number;
      escalationLevels?: string[];
      approvalRequired?: boolean;
    };
    notificationChannels?: string[];
    performanceThresholds?: {
      maxExecutionTimeMs?: number;
      maxMemoryUsageMb?: number;
      maxCpuUsagePercent?: number;
    };
  };

  // 配置管理字段
  configuration?: {
    autoSchedulingEnabled?: boolean;
    dependencyValidationEnabled?: boolean;
    riskMonitoringEnabled?: boolean;
    failureRecoveryEnabled?: boolean;
    performanceTrackingEnabled?: boolean;
    notificationSettings?: {
      enabled: boolean;
      channels?: string[];
      events?: string[];
      taskCompletion?: boolean;
    };
    optimizationSettings?: {
      enabled: boolean;
      strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
      autoReoptimize?: boolean;
    };
    timeoutSettings?: {
      defaultTaskTimeoutMs?: number;
      planExecutionTimeoutMs?: number;
      dependencyResolutionTimeoutMs?: number;
    };
    parallelExecutionLimit?: number;
  };

  // 基础元数据字段
  metadata?: PlanMetadata;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  // 审计跟踪字段 (必需)
  auditTrail: {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: Array<{
      eventId: string;
      eventType: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'task_added' | 'task_removed' | 'dependency_changed';
      timestamp: Date;
      userId: string;
      userRole?: string;
      action: string;
      resource: string;
      planOperation?: string;
      planId?: string;
      planName?: string;
      planStatus?: string;
      taskIds?: string[];
      executionStage?: string;
      planDetails?: PlanAuditEventDetails;
      oldValue?: PlanAuditEventDetails;
      newValue?: PlanAuditEventDetails;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      correlationId?: string;
    }>;
    complianceSettings?: {
      gdprEnabled?: boolean;
      hipaaEnabled?: boolean;
      soxEnabled?: boolean;
      planAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
      planDataLogging?: boolean;
      customCompliance?: string[];
    };
  };

  // 监控集成字段 (必需)
  monitoringIntegration: {
    enabled: boolean;
    supportedProviders: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
    integrationEndpoints?: {
      metricsApi?: string;
      planExecutionApi?: string;
      taskMetricsApi?: string;
      resourceMetricsApi?: string;
    };
    planMetrics?: {
      trackExecutionProgress?: boolean;
      trackTaskPerformance?: boolean;
      trackResourceUsage?: boolean;
      trackFailureRecovery?: boolean;
    };
    exportFormats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
  };

  // 性能指标字段 (必需)
  performanceMetrics: {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: {
      planExecutionLatencyMs?: number;
      taskCompletionRatePercent?: number;
      planOptimizationScore?: number;
      dependencyResolutionAccuracyPercent?: number;
      planExecutionEfficiencyScore?: number;
      activePlansCount?: number;
      planOperationsPerSecond?: number;
      planMemoryUsageMb?: number;
      averagePlanComplexityScore?: number;
    };
    healthStatus?: {
      status: 'healthy' | 'degraded' | 'unhealthy' | 'blocked';
      lastCheck: Date;
      checks?: Array<{
        checkName: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        durationMs?: number;
      }>;
    };
    alerting?: {
      enabled?: boolean;
      thresholds?: {
        maxPlanExecutionLatencyMs?: number;
        minTaskCompletionRatePercent?: number;
        minPlanOptimizationScore?: number;
        minDependencyResolutionAccuracyPercent?: number;
        minPlanExecutionEfficiencyScore?: number;
      };
      notificationChannels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
    };
  };

  // 版本历史字段 (必需)
  versionHistory: {
    enabled: boolean;
    maxVersions: number;
    versions?: Array<{
      versionId: string;
      versionNumber: number;
      createdAt: Date;
      createdBy: string;
      changeSummary?: string;
      planSnapshot?: PlanMetadata;
      changeType: 'plan_created' | 'configuration_updated' | 'tasks_modified' | 'dependencies_changed' | 'execution_optimized';
    }>;
    autoVersioning?: {
      enabled?: boolean;
      versionOnConfigChange?: boolean;
      versionOnTaskChange?: boolean;
      versionOnDependencyChange?: boolean;
    };
  };

  // 搜索元数据字段 (必需)
  searchMetadata: {
    enabled: boolean;
    indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchableFields?: Array<'plan_id' | 'plan_name' | 'plan_status' | 'task_ids' | 'execution_stage' | 'plan_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
    searchIndexes?: Array<{
      indexId: string;
      indexName: string;
      fields: string[];
      indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
      createdAt: Date;
      lastUpdated: Date;
    }>;
    planIndexing?: {
      enabled?: boolean;
      indexPlanData?: boolean;
      indexPerformanceMetrics?: boolean;
      indexAuditLogs?: boolean;
    };
    autoIndexing?: {
      enabled?: boolean;
      indexNewPlans?: boolean;
      reindexIntervalHours?: number;
    };
  };

  // 缓存策略字段 (必需)
  cachingPolicy: {
    enabled: boolean;
    cacheStrategy: 'lru' | 'lfu' | 'ttl' | 'adaptive';
    cacheLevels?: Array<{
      level: string;
      backend: 'memory' | 'redis' | 'memcached' | 'database';
      ttlSeconds: number;
      maxSizeMb?: number;
      evictionPolicy?: 'lru' | 'lfu' | 'random' | 'ttl';
    }>;
    cacheWarming?: {
      enabled?: boolean;
      strategies?: string[];
    };
  };

  // 事件集成字段 (必需)
  eventIntegration: {
    enabled: boolean;
    eventBusConnection?: {
      busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
      connectionString?: string;
      topicPrefix?: string;
      consumerGroup?: string;
    };
    publishedEvents?: Array<'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'plan_task_added' | 'plan_task_removed' | 'plan_dependency_changed'>;
    subscribedEvents?: Array<'context_updated' | 'confirm_approved' | 'trace_completed' | 'role_assigned' | 'extension_activated' | 'dialog_started' | 'network_connected' | 'collab_coordinated' | 'orchestration_executed' | 'coordination_synchronized' | 'eventbus_message_published' | 'statesync_sync_completed' | 'transaction_committed' | 'protocolversion_version_checked' | 'errorhandling_error_occurred' | 'security_authentication_attempted' | 'performance_metric_collected'>;
    eventRouting?: {
      routingRules?: Array<{
        ruleId: string;
        condition: string;
        targetTopic: string;
        enabled?: boolean;
      }>;
    };
  };
}

// ===== 核心映射类 =====

export class PlanMapper {
  /**
   * TypeScript实体 → Schema格式
   * 严格遵循双重命名约定：camelCase → snake_case
   */
  static toSchema(entity: PlanEntityData): PlanSchema {
    return {
      // 核心协议字段映射
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp instanceof Date ? entity.timestamp.toISOString() : entity.timestamp,
      plan_id: entity.planId,
      context_id: entity.contextId,

      // 计划基础字段映射
      name: entity.name,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,

      // 时间线字段映射
      timeline: entity.timeline ? {
        start_date: entity.timeline.startDate?.toISOString(),
        end_date: entity.timeline.endDate?.toISOString(),
        estimated_duration: entity.timeline.estimatedDuration,
        actual_duration: entity.timeline.actualDuration,
      } : undefined,

      // 任务管理字段映射
      tasks: entity.tasks.map(task => ({
        task_id: task.taskId,
        name: task.name,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ? {
          user_id: task.assignee.userId,
          role: task.assignee.role,
          team: task.assignee.team,
        } : undefined,
        estimated_effort: task.estimatedEffort,
        actual_effort: task.actualEffort,
        resources_required: task.resourcesRequired?.map(resource => ({
          resource_type: resource.resourceType,
          amount: resource.amount,
          unit: resource.unit,
          availability: resource.availability,
        })),
        acceptance_criteria: task.acceptanceCriteria?.map(criteria => ({
          id: criteria.id,
          description: criteria.description,
          type: criteria.type,
          status: criteria.status,
          verification_method: criteria.verificationMethod,
        })),
        sub_tasks: task.subTasks?.map(subTask => this.mapTaskToSchema(subTask)),
        metadata: task.metadata ? {
          tags: task.metadata.tags,
          category: task.metadata.category,
          source: task.metadata.source,
          complexity_score: task.metadata.complexityScore,
          risk_level: task.metadata.riskLevel,
          automation_level: task.metadata.automationLevel,
          retry_count: task.metadata.retryCount,
          max_retry_count: task.metadata.maxRetryCount,
          intervention_required: task.metadata.interventionRequired,
          intervention_reason: task.metadata.interventionReason,
          intervention_requested_at: task.metadata.interventionRequestedAt?.toISOString(),
          rollback_reason: task.metadata.rollbackReason,
          rollback_target: task.metadata.rollbackTarget,
          skip_reason: task.metadata.skipReason,
          skip_dependents: task.metadata.skipDependents,
        } : undefined,
      })),

      // 依赖管理字段映射
      dependencies: entity.dependencies?.map(dep => ({
        id: dep.id,
        source_task_id: dep.sourceTaskId,
        target_task_id: dep.targetTaskId,
        dependency_type: dep.dependencyType,
        lag: dep.lag,
        criticality: dep.criticality,
        condition: dep.condition,
      })),

      // 里程碑字段映射
      milestones: entity.milestones?.map(milestone => ({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        target_date: milestone.targetDate.toISOString(),
        status: milestone.status,
        success_criteria: milestone.successCriteria?.map(criteria => ({
          metric: criteria.metric,
          target_value: criteria.targetValue,
          actual_value: criteria.actualValue,
          status: criteria.status,
        })),
      })),

      // 优化配置字段映射
      optimization: entity.optimization ? {
        strategy: entity.optimization.strategy,
        constraints: entity.optimization.constraints ? {
          max_duration: entity.optimization.constraints.maxDuration,
          max_cost: entity.optimization.constraints.maxCost,
          min_quality: entity.optimization.constraints.minQuality,
          available_resources: entity.optimization.constraints.availableResources ?
            this.mapResourceConstraintsToSchema(entity.optimization.constraints.availableResources) : undefined,
        } : undefined,
        parameters: entity.optimization.parameters ?
          this.mapOptimizationParametersToSchema(entity.optimization.parameters) : undefined,
      } : undefined,

      // 风险评估字段映射
      risk_assessment: entity.riskAssessment ? {
        overall_risk_level: entity.riskAssessment.overallRiskLevel,
        risks: entity.riskAssessment.risks?.map(risk => ({
          id: risk.id,
          name: risk.name,
          description: risk.description,
          level: risk.level,
          category: risk.category,
          probability: risk.probability,
          impact: risk.impact,
          status: risk.status,
          mitigation_plan: risk.mitigationPlan,
        })),
      } : undefined,

      // 故障解决器字段映射
      failure_resolver: entity.failureResolver ? {
        enabled: entity.failureResolver.enabled,
        strategies: entity.failureResolver.strategies,
        retry_config: entity.failureResolver.retryConfig ? {
          max_attempts: entity.failureResolver.retryConfig.maxAttempts,
          delay_ms: entity.failureResolver.retryConfig.delayMs,
          backoff_factor: entity.failureResolver.retryConfig.backoffFactor,
          max_delay_ms: entity.failureResolver.retryConfig.maxDelayMs,
        } : undefined,
        rollback_config: entity.failureResolver.rollbackConfig ? {
          enabled: entity.failureResolver.rollbackConfig.enabled,
          checkpoint_frequency: entity.failureResolver.rollbackConfig.checkpointFrequency,
          max_rollback_depth: entity.failureResolver.rollbackConfig.maxRollbackDepth,
        } : undefined,
        manual_intervention_config: entity.failureResolver.manualInterventionConfig ? {
          timeout_ms: entity.failureResolver.manualInterventionConfig.timeoutMs,
          escalation_levels: entity.failureResolver.manualInterventionConfig.escalationLevels,
          approval_required: entity.failureResolver.manualInterventionConfig.approvalRequired,
        } : undefined,
        notification_channels: entity.failureResolver.notificationChannels,
        performance_thresholds: entity.failureResolver.performanceThresholds ? {
          max_execution_time_ms: entity.failureResolver.performanceThresholds.maxExecutionTimeMs,
          max_memory_usage_mb: entity.failureResolver.performanceThresholds.maxMemoryUsageMb,
          max_cpu_usage_percent: entity.failureResolver.performanceThresholds.maxCpuUsagePercent,
        } : undefined,
      } : undefined,

      // 配置管理字段映射
      configuration: entity.configuration ? {
        auto_scheduling_enabled: entity.configuration.autoSchedulingEnabled,
        dependency_validation_enabled: entity.configuration.dependencyValidationEnabled,
        risk_monitoring_enabled: entity.configuration.riskMonitoringEnabled,
        failure_recovery_enabled: entity.configuration.failureRecoveryEnabled,
        performance_tracking_enabled: entity.configuration.performanceTrackingEnabled,
        notification_settings: entity.configuration.notificationSettings ? {
          enabled: entity.configuration.notificationSettings.enabled,
          channels: entity.configuration.notificationSettings.channels,
          events: entity.configuration.notificationSettings.events,
          task_completion: entity.configuration.notificationSettings.taskCompletion,
        } : undefined,
        optimization_settings: entity.configuration.optimizationSettings ? {
          enabled: entity.configuration.optimizationSettings.enabled,
          strategy: entity.configuration.optimizationSettings.strategy,
          auto_reoptimize: entity.configuration.optimizationSettings.autoReoptimize,
        } : undefined,
        timeout_settings: entity.configuration.timeoutSettings ? {
          default_task_timeout_ms: entity.configuration.timeoutSettings.defaultTaskTimeoutMs,
          plan_execution_timeout_ms: entity.configuration.timeoutSettings.planExecutionTimeoutMs,
          dependency_resolution_timeout_ms: entity.configuration.timeoutSettings.dependencyResolutionTimeoutMs,
        } : undefined,
        parallel_execution_limit: entity.configuration.parallelExecutionLimit,
      } : undefined,

      // 基础元数据字段映射
      metadata: entity.metadata ? this.mapMetadataToSchema(entity.metadata) : undefined,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,

      // 审计跟踪字段映射 (必需)
      audit_trail: {
        enabled: entity.auditTrail.enabled,
        retention_days: entity.auditTrail.retentionDays,
        audit_events: entity.auditTrail.auditEvents?.map(event => ({
          event_id: event.eventId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          user_id: event.userId,
          user_role: event.userRole,
          action: event.action,
          resource: event.resource,
          plan_operation: event.planOperation,
          plan_id: event.planId,
          plan_name: event.planName,
          plan_status: event.planStatus,
          task_ids: event.taskIds,
          execution_stage: event.executionStage,
          plan_details: event.planDetails ? this.mapAuditEventDetailsToSchema(event.planDetails) : undefined,
          old_value: event.oldValue ? this.mapAuditEventDetailsToSchema(event.oldValue) : undefined,
          new_value: event.newValue ? this.mapAuditEventDetailsToSchema(event.newValue) : undefined,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          session_id: event.sessionId,
          correlation_id: event.correlationId,
        })),
        compliance_settings: entity.auditTrail.complianceSettings ? {
          gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
          hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
          sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
          plan_audit_level: entity.auditTrail.complianceSettings.planAuditLevel,
          plan_data_logging: entity.auditTrail.complianceSettings.planDataLogging,
          custom_compliance: entity.auditTrail.complianceSettings.customCompliance,
        } : undefined,
      },

      // 监控集成字段映射 (必需)
      monitoring_integration: {
        enabled: entity.monitoringIntegration.enabled,
        supported_providers: entity.monitoringIntegration.supportedProviders,
        integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
          metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
          plan_execution_api: entity.monitoringIntegration.integrationEndpoints.planExecutionApi,
          task_metrics_api: entity.monitoringIntegration.integrationEndpoints.taskMetricsApi,
          resource_metrics_api: entity.monitoringIntegration.integrationEndpoints.resourceMetricsApi,
        } : undefined,
        plan_metrics: entity.monitoringIntegration.planMetrics ? {
          track_execution_progress: entity.monitoringIntegration.planMetrics.trackExecutionProgress,
          track_task_performance: entity.monitoringIntegration.planMetrics.trackTaskPerformance,
          track_resource_usage: entity.monitoringIntegration.planMetrics.trackResourceUsage,
          track_failure_recovery: entity.monitoringIntegration.planMetrics.trackFailureRecovery,
        } : undefined,
        export_formats: entity.monitoringIntegration.exportFormats,
      },

      // 性能指标字段映射 (必需) - 继续在下一个编辑中
      performance_metrics: {
        enabled: entity.performanceMetrics.enabled,
        collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
        metrics: entity.performanceMetrics.metrics ? {
          plan_execution_latency_ms: entity.performanceMetrics.metrics.planExecutionLatencyMs,
          task_completion_rate_percent: entity.performanceMetrics.metrics.taskCompletionRatePercent,
          plan_optimization_score: entity.performanceMetrics.metrics.planOptimizationScore,
          dependency_resolution_accuracy_percent: entity.performanceMetrics.metrics.dependencyResolutionAccuracyPercent,
          plan_execution_efficiency_score: entity.performanceMetrics.metrics.planExecutionEfficiencyScore,
          active_plans_count: entity.performanceMetrics.metrics.activePlansCount,
          plan_operations_per_second: entity.performanceMetrics.metrics.planOperationsPerSecond,
          plan_memory_usage_mb: entity.performanceMetrics.metrics.planMemoryUsageMb,
          average_plan_complexity_score: entity.performanceMetrics.metrics.averagePlanComplexityScore,
        } : undefined,
        health_status: entity.performanceMetrics.healthStatus ? {
          status: entity.performanceMetrics.healthStatus.status,
          last_check: entity.performanceMetrics.healthStatus.lastCheck.toISOString(),
          checks: entity.performanceMetrics.healthStatus.checks?.map(check => ({
            check_name: check.checkName,
            status: check.status,
            message: check.message,
            duration_ms: check.durationMs,
          })),
        } : undefined,
        alerting: entity.performanceMetrics.alerting ? {
          enabled: entity.performanceMetrics.alerting.enabled,
          thresholds: entity.performanceMetrics.alerting.thresholds ? {
            max_plan_execution_latency_ms: entity.performanceMetrics.alerting.thresholds.maxPlanExecutionLatencyMs,
            min_task_completion_rate_percent: entity.performanceMetrics.alerting.thresholds.minTaskCompletionRatePercent,
            min_plan_optimization_score: entity.performanceMetrics.alerting.thresholds.minPlanOptimizationScore,
            min_dependency_resolution_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minDependencyResolutionAccuracyPercent,
            min_plan_execution_efficiency_score: entity.performanceMetrics.alerting.thresholds.minPlanExecutionEfficiencyScore,
          } : undefined,
          notification_channels: entity.performanceMetrics.alerting.notificationChannels,
        } : undefined,
      },

      // 版本历史字段映射 (必需)
      version_history: {
        enabled: entity.versionHistory.enabled,
        max_versions: entity.versionHistory.maxVersions,
        versions: entity.versionHistory.versions?.map(version => ({
          version_id: version.versionId,
          version_number: version.versionNumber,
          created_at: version.createdAt.toISOString(),
          created_by: version.createdBy,
          change_summary: version.changeSummary,
          plan_snapshot: version.planSnapshot ? this.mapMetadataToSchema(version.planSnapshot) : undefined,
          change_type: version.changeType,
        })),
        auto_versioning: entity.versionHistory.autoVersioning ? {
          enabled: entity.versionHistory.autoVersioning.enabled,
          version_on_config_change: entity.versionHistory.autoVersioning.versionOnConfigChange,
          version_on_task_change: entity.versionHistory.autoVersioning.versionOnTaskChange,
          version_on_dependency_change: entity.versionHistory.autoVersioning.versionOnDependencyChange,
        } : undefined,
      },

      // 搜索元数据字段映射 (必需)
      search_metadata: {
        enabled: entity.searchMetadata.enabled,
        indexing_strategy: entity.searchMetadata.indexingStrategy,
        searchable_fields: entity.searchMetadata.searchableFields,
        search_indexes: entity.searchMetadata.searchIndexes?.map(index => ({
          index_id: index.indexId,
          index_name: index.indexName,
          fields: index.fields,
          index_type: index.indexType,
          created_at: index.createdAt.toISOString(),
          last_updated: index.lastUpdated.toISOString(),
        })),
        plan_indexing: entity.searchMetadata.planIndexing ? {
          enabled: entity.searchMetadata.planIndexing.enabled,
          index_plan_data: entity.searchMetadata.planIndexing.indexPlanData,
          index_performance_metrics: entity.searchMetadata.planIndexing.indexPerformanceMetrics,
          index_audit_logs: entity.searchMetadata.planIndexing.indexAuditLogs,
        } : undefined,
        auto_indexing: entity.searchMetadata.autoIndexing ? {
          enabled: entity.searchMetadata.autoIndexing.enabled,
          index_new_plans: entity.searchMetadata.autoIndexing.indexNewPlans,
          reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours,
        } : undefined,
      },

      // 缓存策略字段映射 (必需)
      caching_policy: {
        enabled: entity.cachingPolicy.enabled,
        cache_strategy: entity.cachingPolicy.cacheStrategy,
        cache_levels: entity.cachingPolicy.cacheLevels?.map(level => ({
          level: level.level,
          backend: level.backend,
          ttl_seconds: level.ttlSeconds,
          max_size_mb: level.maxSizeMb,
          eviction_policy: level.evictionPolicy,
        })),
        cache_warming: entity.cachingPolicy.cacheWarming ? {
          enabled: entity.cachingPolicy.cacheWarming.enabled,
          strategies: entity.cachingPolicy.cacheWarming.strategies,
        } : undefined,
      },

      // 事件集成字段映射 (必需)
      event_integration: {
        enabled: entity.eventIntegration.enabled,
        event_bus_connection: entity.eventIntegration.eventBusConnection ? {
          bus_type: entity.eventIntegration.eventBusConnection.busType,
          connection_string: entity.eventIntegration.eventBusConnection.connectionString,
          topic_prefix: entity.eventIntegration.eventBusConnection.topicPrefix,
          consumer_group: entity.eventIntegration.eventBusConnection.consumerGroup,
        } : undefined,
        published_events: entity.eventIntegration.publishedEvents,
        subscribed_events: entity.eventIntegration.subscribedEvents,
        event_routing: entity.eventIntegration.eventRouting ? {
          routing_rules: entity.eventIntegration.eventRouting.routingRules?.map(rule => ({
            rule_id: rule.ruleId,
            condition: rule.condition,
            target_topic: rule.targetTopic,
            enabled: rule.enabled,
          })),
        } : undefined,
      },
    };
  }

  /**
   * Schema格式 → TypeScript实体
   * 严格遵循双重命名约定：snake_case → camelCase
   */
  static fromSchema(schema: PlanSchema): PlanEntityData {
    return {
      // 核心协议字段映射
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      planId: schema.plan_id,
      contextId: schema.context_id,

      // 计划基础字段映射
      name: schema.name,
      description: schema.description,
      status: schema.status,
      priority: schema.priority,

      // 时间线字段映射
      timeline: schema.timeline ? {
        startDate: schema.timeline.start_date ? new Date(schema.timeline.start_date) : undefined,
        endDate: schema.timeline.end_date ? new Date(schema.timeline.end_date) : undefined,
        estimatedDuration: schema.timeline.estimated_duration,
        actualDuration: schema.timeline.actual_duration,
      } : undefined,

      // 任务管理字段映射
      tasks: schema.tasks.map(task => ({
        taskId: task.task_id,
        name: task.name,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ? {
          userId: task.assignee.user_id,
          role: task.assignee.role,
          team: task.assignee.team,
        } : undefined,
        estimatedEffort: task.estimated_effort,
        actualEffort: task.actual_effort,
        resourcesRequired: task.resources_required?.map(resource => ({
          resourceType: resource.resource_type,
          amount: resource.amount,
          unit: resource.unit,
          availability: resource.availability,
        })),
        acceptanceCriteria: task.acceptance_criteria?.map(criteria => ({
          id: criteria.id,
          description: criteria.description,
          type: criteria.type,
          status: criteria.status,
          verificationMethod: criteria.verification_method,
        })),
        subTasks: task.sub_tasks?.map(subTask => this.mapTaskFromSchema(subTask)),
        metadata: task.metadata ? {
          tags: task.metadata.tags,
          category: task.metadata.category,
          source: task.metadata.source,
          complexityScore: task.metadata.complexity_score,
          riskLevel: task.metadata.risk_level,
          automationLevel: task.metadata.automation_level,
          retryCount: task.metadata.retry_count,
          maxRetryCount: task.metadata.max_retry_count,
          interventionRequired: task.metadata.intervention_required,
          interventionReason: task.metadata.intervention_reason,
          interventionRequestedAt: task.metadata.intervention_requested_at ? new Date(task.metadata.intervention_requested_at) : undefined,
          rollbackReason: task.metadata.rollback_reason,
          rollbackTarget: task.metadata.rollback_target,
          skipReason: task.metadata.skip_reason,
          skipDependents: task.metadata.skip_dependents,
        } : undefined,
      })),

      // 依赖管理字段映射
      dependencies: schema.dependencies?.map(dep => ({
        id: dep.id,
        sourceTaskId: dep.source_task_id,
        targetTaskId: dep.target_task_id,
        dependencyType: dep.dependency_type,
        lag: dep.lag,
        criticality: dep.criticality,
        condition: dep.condition,
      })),

      // 里程碑字段映射
      milestones: schema.milestones?.map(milestone => ({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        targetDate: new Date(milestone.target_date),
        status: milestone.status,
        successCriteria: milestone.success_criteria?.map(criteria => ({
          metric: criteria.metric,
          targetValue: criteria.target_value,
          actualValue: criteria.actual_value,
          status: criteria.status,
        })),
      })),

      // 优化配置字段映射
      optimization: schema.optimization ? {
        strategy: schema.optimization.strategy,
        constraints: schema.optimization.constraints ? {
          maxDuration: schema.optimization.constraints.max_duration,
          maxCost: schema.optimization.constraints.max_cost,
          minQuality: schema.optimization.constraints.min_quality,
          availableResources: schema.optimization.constraints.available_resources ?
            this.mapResourceConstraintsFromSchema(schema.optimization.constraints.available_resources) : undefined,
        } : undefined,
        parameters: schema.optimization.parameters ?
          this.mapOptimizationParametersFromSchema(schema.optimization.parameters) : undefined,
      } : undefined,

      // 基础元数据字段映射
      metadata: schema.metadata ? this.mapMetadataFromSchema(schema.metadata) : undefined,
      createdAt: schema.created_at ? new Date(schema.created_at) : undefined,
      updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
      createdBy: schema.created_by,
      updatedBy: schema.updated_by,

      // 审计跟踪字段映射 (必需)
      auditTrail: {
        enabled: schema.audit_trail.enabled,
        retentionDays: schema.audit_trail.retention_days,
        auditEvents: schema.audit_trail.audit_events?.map(event => ({
          eventId: event.event_id,
          eventType: event.event_type,
          timestamp: new Date(event.timestamp),
          userId: event.user_id,
          userRole: event.user_role,
          action: event.action,
          resource: event.resource,
          planOperation: event.plan_operation,
          planId: event.plan_id,
          planName: event.plan_name,
          planStatus: event.plan_status,
          taskIds: event.task_ids,
          executionStage: event.execution_stage,
          planDetails: event.plan_details ? this.mapAuditEventDetailsFromSchema(event.plan_details) : undefined,
          oldValue: event.old_value ? this.mapAuditEventDetailsFromSchema(event.old_value) : undefined,
          newValue: event.new_value ? this.mapAuditEventDetailsFromSchema(event.new_value) : undefined,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          sessionId: event.session_id,
          correlationId: event.correlation_id,
        })),
        complianceSettings: schema.audit_trail.compliance_settings ? {
          gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
          hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
          soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
          planAuditLevel: schema.audit_trail.compliance_settings.plan_audit_level,
          planDataLogging: schema.audit_trail.compliance_settings.plan_data_logging,
          customCompliance: schema.audit_trail.compliance_settings.custom_compliance,
        } : undefined,
      },

      // 监控集成字段映射 (必需)
      monitoringIntegration: {
        enabled: schema.monitoring_integration.enabled,
        supportedProviders: schema.monitoring_integration.supported_providers,
        integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
          metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
          planExecutionApi: schema.monitoring_integration.integration_endpoints.plan_execution_api,
          taskMetricsApi: schema.monitoring_integration.integration_endpoints.task_metrics_api,
          resourceMetricsApi: schema.monitoring_integration.integration_endpoints.resource_metrics_api,
        } : undefined,
        planMetrics: schema.monitoring_integration.plan_metrics ? {
          trackExecutionProgress: schema.monitoring_integration.plan_metrics.track_execution_progress,
          trackTaskPerformance: schema.monitoring_integration.plan_metrics.track_task_performance,
          trackResourceUsage: schema.monitoring_integration.plan_metrics.track_resource_usage,
          trackFailureRecovery: schema.monitoring_integration.plan_metrics.track_failure_recovery,
        } : undefined,
        exportFormats: schema.monitoring_integration.export_formats,
      },

      // 性能指标字段映射 (必需)
      performanceMetrics: {
        enabled: schema.performance_metrics.enabled,
        collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
        metrics: schema.performance_metrics.metrics ? {
          planExecutionLatencyMs: schema.performance_metrics.metrics.plan_execution_latency_ms,
          taskCompletionRatePercent: schema.performance_metrics.metrics.task_completion_rate_percent,
          planOptimizationScore: schema.performance_metrics.metrics.plan_optimization_score,
          dependencyResolutionAccuracyPercent: schema.performance_metrics.metrics.dependency_resolution_accuracy_percent,
          planExecutionEfficiencyScore: schema.performance_metrics.metrics.plan_execution_efficiency_score,
          activePlansCount: schema.performance_metrics.metrics.active_plans_count,
          planOperationsPerSecond: schema.performance_metrics.metrics.plan_operations_per_second,
          planMemoryUsageMb: schema.performance_metrics.metrics.plan_memory_usage_mb,
          averagePlanComplexityScore: schema.performance_metrics.metrics.average_plan_complexity_score,
        } : undefined,
        healthStatus: schema.performance_metrics.health_status ? {
          status: schema.performance_metrics.health_status.status,
          lastCheck: new Date(schema.performance_metrics.health_status.last_check),
          checks: schema.performance_metrics.health_status.checks?.map(check => ({
            checkName: check.check_name,
            status: check.status,
            message: check.message,
            durationMs: check.duration_ms,
          })),
        } : undefined,
        alerting: schema.performance_metrics.alerting ? {
          enabled: schema.performance_metrics.alerting.enabled,
          thresholds: schema.performance_metrics.alerting.thresholds ? {
            maxPlanExecutionLatencyMs: schema.performance_metrics.alerting.thresholds.max_plan_execution_latency_ms,
            minTaskCompletionRatePercent: schema.performance_metrics.alerting.thresholds.min_task_completion_rate_percent,
            minPlanOptimizationScore: schema.performance_metrics.alerting.thresholds.min_plan_optimization_score,
            minDependencyResolutionAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_dependency_resolution_accuracy_percent,
            minPlanExecutionEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_plan_execution_efficiency_score,
          } : undefined,
          notificationChannels: schema.performance_metrics.alerting.notification_channels,
        } : undefined,
      },

      // 版本历史字段映射 (必需)
      versionHistory: {
        enabled: schema.version_history.enabled,
        maxVersions: schema.version_history.max_versions,
        versions: schema.version_history.versions?.map(version => ({
          versionId: version.version_id,
          versionNumber: version.version_number,
          createdAt: new Date(version.created_at),
          createdBy: version.created_by,
          changeSummary: version.change_summary,
          planSnapshot: version.plan_snapshot ? this.mapMetadataFromSchema(version.plan_snapshot) : undefined,
          changeType: version.change_type,
        })),
        autoVersioning: schema.version_history.auto_versioning ? {
          enabled: schema.version_history.auto_versioning.enabled,
          versionOnConfigChange: schema.version_history.auto_versioning.version_on_config_change,
          versionOnTaskChange: schema.version_history.auto_versioning.version_on_task_change,
          versionOnDependencyChange: schema.version_history.auto_versioning.version_on_dependency_change,
        } : undefined,
      },

      // 搜索元数据字段映射 (必需)
      searchMetadata: {
        enabled: schema.search_metadata.enabled,
        indexingStrategy: schema.search_metadata.indexing_strategy,
        searchableFields: schema.search_metadata.searchable_fields,
        searchIndexes: schema.search_metadata.search_indexes?.map(index => ({
          indexId: index.index_id,
          indexName: index.index_name,
          fields: index.fields,
          indexType: index.index_type,
          createdAt: new Date(index.created_at),
          lastUpdated: new Date(index.last_updated),
        })),
        planIndexing: schema.search_metadata.plan_indexing ? {
          enabled: schema.search_metadata.plan_indexing.enabled,
          indexPlanData: schema.search_metadata.plan_indexing.index_plan_data,
          indexPerformanceMetrics: schema.search_metadata.plan_indexing.index_performance_metrics,
          indexAuditLogs: schema.search_metadata.plan_indexing.index_audit_logs,
        } : undefined,
        autoIndexing: schema.search_metadata.auto_indexing ? {
          enabled: schema.search_metadata.auto_indexing.enabled,
          indexNewPlans: schema.search_metadata.auto_indexing.index_new_plans,
          reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours,
        } : undefined,
      },

      // 缓存策略字段映射 (必需)
      cachingPolicy: {
        enabled: schema.caching_policy.enabled,
        cacheStrategy: schema.caching_policy.cache_strategy,
        cacheLevels: schema.caching_policy.cache_levels?.map(level => ({
          level: level.level,
          backend: level.backend,
          ttlSeconds: level.ttl_seconds,
          maxSizeMb: level.max_size_mb,
          evictionPolicy: level.eviction_policy,
        })),
        cacheWarming: schema.caching_policy.cache_warming ? {
          enabled: schema.caching_policy.cache_warming.enabled,
          strategies: schema.caching_policy.cache_warming.strategies,
        } : undefined,
      },

      // 事件集成字段映射 (必需)
      eventIntegration: {
        enabled: schema.event_integration.enabled,
        eventBusConnection: schema.event_integration.event_bus_connection ? {
          busType: schema.event_integration.event_bus_connection.bus_type,
          connectionString: schema.event_integration.event_bus_connection.connection_string,
          topicPrefix: schema.event_integration.event_bus_connection.topic_prefix,
          consumerGroup: schema.event_integration.event_bus_connection.consumer_group,
        } : undefined,
        publishedEvents: schema.event_integration.published_events,
        subscribedEvents: schema.event_integration.subscribed_events,
        eventRouting: schema.event_integration.event_routing ? {
          routingRules: schema.event_integration.event_routing.routing_rules?.map(rule => ({
            ruleId: rule.rule_id,
            condition: rule.condition,
            targetTopic: rule.target_topic,
            enabled: rule.enabled,
          })),
        } : undefined,
      },
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is PlanSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;

    // 验证必需字段
    const requiredFields = [
      'protocol_version', 'timestamp', 'plan_id', 'context_id', 'name', 'status', 'tasks',
      'audit_trail', 'monitoring_integration', 'performance_metrics', 'version_history',
      'search_metadata', 'caching_policy', 'event_integration'
    ];

    for (const field of requiredFields) {
      if (!(field in schema)) {
        return false;
      }
    }

    // 验证协议版本
    if (schema.protocol_version !== '1.0.0') {
      return false;
    }

    // 验证状态枚举
    const validStatuses = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(schema.status as string)) {
      return false;
    }

    // 验证任务数组
    if (!Array.isArray(schema.tasks)) {
      return false;
    }

    return true;
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: PlanEntityData[]): PlanSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript实体数组
   */
  static fromSchemaArray(schemas: PlanSchema[]): PlanEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 辅助映射方法 =====

  /**
   * 任务数据映射到Schema (递归处理子任务)
   */
  private static mapTaskToSchema(task: PlanTaskData): PlanTaskSchema {
    return {
      task_id: task.taskId,
      name: task.name,
      description: task.description,
      type: task.type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee ? {
        user_id: task.assignee.userId,
        role: task.assignee.role,
        team: task.assignee.team,
      } : undefined,
      estimated_effort: task.estimatedEffort,
      actual_effort: task.actualEffort,
      resources_required: task.resourcesRequired?.map(resource => ({
        resource_type: resource.resourceType,
        amount: resource.amount,
        unit: resource.unit,
        availability: resource.availability,
      })),
      acceptance_criteria: task.acceptanceCriteria?.map(criteria => ({
        id: criteria.id,
        description: criteria.description,
        type: criteria.type,
        status: criteria.status,
        verification_method: criteria.verificationMethod,
      })),
      sub_tasks: task.subTasks?.map(subTask => this.mapTaskToSchema(subTask)),
      metadata: task.metadata ? {
        tags: task.metadata.tags,
        category: task.metadata.category,
        source: task.metadata.source,
        complexity_score: task.metadata.complexityScore,
        risk_level: task.metadata.riskLevel,
        automation_level: task.metadata.automationLevel,
        retry_count: task.metadata.retryCount,
        max_retry_count: task.metadata.maxRetryCount,
        intervention_required: task.metadata.interventionRequired,
        intervention_reason: task.metadata.interventionReason,
        intervention_requested_at: task.metadata.interventionRequestedAt?.toISOString(),
        rollback_reason: task.metadata.rollbackReason,
        rollback_target: task.metadata.rollbackTarget,
        skip_reason: task.metadata.skipReason,
        skip_dependents: task.metadata.skipDependents,
      } : undefined,
    };
  }

  /**
   * Schema任务数据映射到TypeScript (递归处理子任务)
   */
  private static mapTaskFromSchema(task: PlanTaskSchema): PlanTaskData {
    return {
      taskId: task.task_id,
      name: task.name,
      description: task.description,
      type: task.type,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee ? {
        userId: task.assignee.user_id,
        role: task.assignee.role,
        team: task.assignee.team,
      } : undefined,
      estimatedEffort: task.estimated_effort,
      actualEffort: task.actual_effort,
      resourcesRequired: task.resources_required?.map((resource) => ({
        resourceType: resource.resource_type,
        amount: resource.amount,
        unit: resource.unit,
        availability: resource.availability,
      })),
      acceptanceCriteria: task.acceptance_criteria?.map((criteria) => ({
        id: criteria.id,
        description: criteria.description,
        type: criteria.type,
        status: criteria.status,
        verificationMethod: criteria.verification_method,
      })),
      subTasks: task.sub_tasks?.map((subTask) => this.mapTaskFromSchema(subTask)),
      metadata: task.metadata ? {
        tags: task.metadata.tags,
        category: task.metadata.category,
        source: task.metadata.source,
        complexityScore: task.metadata.complexity_score,
        riskLevel: task.metadata.risk_level,
        automationLevel: task.metadata.automation_level,
        retryCount: task.metadata.retry_count,
        maxRetryCount: task.metadata.max_retry_count,
        interventionRequired: task.metadata.intervention_required,
        interventionReason: task.metadata.intervention_reason,
        interventionRequestedAt: task.metadata.intervention_requested_at ? new Date(task.metadata.intervention_requested_at) : undefined,
        rollbackReason: task.metadata.rollback_reason,
        rollbackTarget: task.metadata.rollback_target,
        skipReason: task.metadata.skip_reason,
        skipDependents: task.metadata.skip_dependents,
      } : undefined,
    };
  }

  /**
   * 资源约束映射到Schema
   */
  private static mapResourceConstraintsToSchema(constraints: PlanResourceConstraints): PlanResourceConstraintsSchema {
    const result: PlanResourceConstraintsSchema = {};
    for (const [resourceType, constraint] of Object.entries(constraints)) {
      result[resourceType] = {
        amount: constraint.amount,
        unit: constraint.unit,
        availability: constraint.availability,
      };
    }
    return result;
  }

  /**
   * Schema资源约束映射到TypeScript
   */
  private static mapResourceConstraintsFromSchema(constraints: PlanResourceConstraintsSchema): PlanResourceConstraints {
    const result: PlanResourceConstraints = {};
    for (const [resourceType, constraint] of Object.entries(constraints)) {
      result[resourceType] = {
        amount: constraint.amount,
        unit: constraint.unit,
        availability: constraint.availability,
      };
    }
    return result;
  }

  /**
   * 优化参数映射到Schema
   */
  private static mapOptimizationParametersToSchema(parameters: PlanOptimizationParameters): PlanOptimizationParametersSchema {
    return { ...parameters };
  }

  /**
   * Schema优化参数映射到TypeScript
   */
  private static mapOptimizationParametersFromSchema(parameters: PlanOptimizationParametersSchema): PlanOptimizationParameters {
    return { ...parameters };
  }

  /**
   * 元数据映射到Schema
   */
  private static mapMetadataToSchema(metadata: PlanMetadata): PlanMetadataSchema {
    const result: PlanMetadataSchema = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Schema元数据映射到TypeScript
   */
  private static mapMetadataFromSchema(metadata: PlanMetadataSchema): PlanMetadata {
    const result: PlanMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * 审计事件详情映射到Schema
   */
  private static mapAuditEventDetailsToSchema(details: PlanAuditEventDetails): PlanAuditEventDetailsSchema {
    const result: PlanAuditEventDetailsSchema = {};
    for (const [key, value] of Object.entries(details)) {
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Schema审计事件详情映射到TypeScript
   */
  private static mapAuditEventDetailsFromSchema(details: PlanAuditEventDetailsSchema): PlanAuditEventDetails {
    const result: PlanAuditEventDetails = {};
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // ===== 横切关注点映射方法 (9个L3管理器) =====

  /**
   * 通用对象转换为snake_case (横切关注点映射)
   */
  private static objectToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key);
      if (Array.isArray(value)) {
        result[snakeKey] = value.map(item =>
          typeof item === 'object' && item !== null ? this.objectToSnakeCase(item as Record<string, unknown>) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[snakeKey] = this.objectToSnakeCase(value as Record<string, unknown>);
      } else {
        result[snakeKey] = value;
      }
    }
    return result;
  }

  /**
   * 通用对象转换为camelCase (横切关注点映射)
   */
  private static objectToCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key);
      if (Array.isArray(value)) {
        result[camelKey] = value.map(item =>
          typeof item === 'object' && item !== null ? this.objectToCamelCase(item as Record<string, unknown>) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[camelKey] = this.objectToCamelCase(value as Record<string, unknown>);
      } else {
        result[camelKey] = value;
      }
    }
    return result;
  }

  /**
   * 1. 安全上下文映射到Schema (SecurityManager)
   */
  static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(securityContext);
  }

  /**
   * 1. Schema安全上下文映射到TypeScript (SecurityManager)
   */
  static mapSecurityContextFromSchema(securityContext: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(securityContext);
  }

  /**
   * 2. 性能指标映射到Schema (PerformanceMonitor)
   */
  static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(performanceMetrics);
  }

  /**
   * 2. Schema性能指标映射到TypeScript (PerformanceMonitor)
   */
  static mapPerformanceMetricsFromSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(performanceMetrics);
  }

  /**
   * 3. 事件总线映射到Schema (EventBusManager)
   */
  static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(eventBus);
  }

  /**
   * 3. Schema事件总线映射到TypeScript (EventBusManager)
   */
  static mapEventBusFromSchema(eventBus: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(eventBus);
  }

  /**
   * 4. 错误处理映射到Schema (ErrorHandler)
   */
  static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(errorHandling);
  }

  /**
   * 4. Schema错误处理映射到TypeScript (ErrorHandler)
   */
  static mapErrorHandlingFromSchema(errorHandling: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(errorHandling);
  }

  /**
   * 5. 协调管理映射到Schema (CoordinationManager)
   */
  static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(coordination);
  }

  /**
   * 5. Schema协调管理映射到TypeScript (CoordinationManager)
   */
  static mapCoordinationFromSchema(coordination: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(coordination);
  }

  /**
   * 6. 编排管理映射到Schema (OrchestrationManager)
   */
  static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(orchestration);
  }

  /**
   * 6. Schema编排管理映射到TypeScript (OrchestrationManager)
   */
  static mapOrchestrationFromSchema(orchestration: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(orchestration);
  }

  /**
   * 7. 状态同步映射到Schema (StateSyncManager)
   */
  static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(stateSync);
  }

  /**
   * 7. Schema状态同步映射到TypeScript (StateSyncManager)
   */
  static mapStateSyncFromSchema(stateSync: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(stateSync);
  }

  /**
   * 8. 事务管理映射到Schema (TransactionManager)
   */
  static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(transaction);
  }

  /**
   * 8. Schema事务管理映射到TypeScript (TransactionManager)
   */
  static mapTransactionFromSchema(transaction: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(transaction);
  }

  /**
   * 9. 协议版本映射到Schema (ProtocolVersionManager)
   */
  static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(protocolVersion);
  }

  /**
   * 9. Schema协议版本映射到TypeScript (ProtocolVersionManager)
   */
  static mapProtocolVersionFromSchema(protocolVersion: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(protocolVersion);
  }
}
