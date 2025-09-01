/**
 * Trace模块Mapper实现
 * 
 * @description 实现Schema-TypeScript双向映射，遵循双重命名约定
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-trace.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 * @coverage 100%字段映射覆盖 (85+字段)
 * @pattern 基于Context、Plan、Role、Confirm模块的IDENTICAL映射模式
 */

import {
  TraceEntityData,
  TraceType,
  Severity,
  EventType,
  EventCategory,
  ErrorType,
  CorrelationType,
  MonitoringProvider,
  ExportFormat,
  IndexingStrategy,
  SearchableField,
  TraceOperation,
  PublishedEvent,
  SubscribedEvent,
  TraceSchema,
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceQueryFilter,
  // 以下类型用于类型注解，使用下划线前缀避免ESLint警告
  EventObject as _EventObject,
  EventSource as _EventSource,
  ContextSnapshot as _ContextSnapshot,
  Environment as _Environment,
  CallStackFrame as _CallStackFrame,
  ErrorInformation as _ErrorInformation,
  StackFrame as _StackFrame,
  RecoveryAction as _RecoveryAction,
  DecisionLog as _DecisionLog,
  DecisionOption as _DecisionOption,
  DecisionCriterion as _DecisionCriterion,
  Correlation as _Correlation,
  AuditTrail as _AuditTrail,
  AuditEvent as _AuditEvent,
  ComplianceSettings as _ComplianceSettings,
  PerformanceMetrics as _PerformanceMetrics,
  MetricsData as _MetricsData,
  HealthStatus as _HealthStatus,
  AlertingConfig as _AlertingConfig,
  MonitoringIntegration as _MonitoringIntegration,
  IntegrationEndpoints as _IntegrationEndpoints,
  SamplingConfig as _SamplingConfig,
  VersionHistory as _VersionHistory,
  VersionRecord as _VersionRecord,
  AutoVersioning as _AutoVersioning,
  SearchMetadata as _SearchMetadata,
  SearchIndex as _SearchIndex,
  AutoIndexing as _AutoIndexing,
  EventIntegration as _EventIntegration,
  EventBusConnection as _EventBusConnection,
  EventRouting as _EventRouting,
  TraceDetails as _TraceDetails,
  Timestamp as _Timestamp
} from '../..';
import { UUID } from '../../../../shared/types';



/**
 * Trace模块Mapper类
 *
 * @description 提供Schema-TypeScript双向映射功能，TraceSchema接口从types.ts导入
 */

/**
 * Trace模块Mapper类
 *
 * @description 提供Schema-TypeScript双向映射功能
 */
export class TraceMapper {
  
  /**
   * 将TypeScript实体数据转换为Schema格式
   * 
   * @param entity - TypeScript格式的实体数据
   * @returns Schema格式的数据
   */
  static toSchema(entity: TraceEntityData): TraceSchema {
    return {
      // 核心协议字段映射
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      trace_id: entity.traceId,
      context_id: entity.contextId,
      plan_id: entity.planId,
      task_id: entity.taskId,
      
      // 追踪核心字段映射
      trace_type: entity.traceType,
      severity: entity.severity,
      event: {
        type: entity.event.type,
        name: entity.event.name,
        description: entity.event.description,
        category: entity.event.category,
        source: {
          component: entity.event.source.component,
          module: entity.event.source.module,
          function: entity.event.source.function,
          line_number: entity.event.source.lineNumber
        },
        data: entity.event.data
      },
      
      // 可选核心字段映射
      context_snapshot: entity.contextSnapshot ? {
        variables: entity.contextSnapshot.variables,
        environment: entity.contextSnapshot.environment ? {
          os: entity.contextSnapshot.environment.os,
          platform: entity.contextSnapshot.environment.platform,
          runtime_version: entity.contextSnapshot.environment.runtimeVersion,
          environment_variables: entity.contextSnapshot.environment.environmentVariables
        } : undefined,
        call_stack: entity.contextSnapshot.callStack?.map((frame: _CallStackFrame) => ({
          function: frame.function,
          file: frame.file,
          line: frame.line,
          arguments: frame.arguments
        }))
      } : undefined,
      
      error_information: entity.errorInformation ? {
        error_code: entity.errorInformation.errorCode,
        error_message: entity.errorInformation.errorMessage,
        error_type: entity.errorInformation.errorType,
        stack_trace: entity.errorInformation.stackTrace?.map((frame: _StackFrame) => ({
          file: frame.file,
          function: frame.function,
          line: frame.line,
          column: frame.column
        })),
        recovery_actions: entity.errorInformation.recoveryActions?.map((action: _RecoveryAction) => ({
          action: action.action,
          description: action.description,
          parameters: action.parameters
        }))
      } : undefined,
      
      decision_log: entity.decisionLog ? {
        decision_point: entity.decisionLog.decisionPoint,
        options_considered: entity.decisionLog.optionsConsidered.map((option: _DecisionOption) => ({
          option: option.option,
          score: option.score,
          rationale: option.rationale,
          risk_factors: option.riskFactors
        })),
        selected_option: entity.decisionLog.selectedOption,
        decision_criteria: entity.decisionLog.decisionCriteria?.map((criterion: _DecisionCriterion) => ({
          criterion: criterion.criterion,
          weight: criterion.weight,
          evaluation: criterion.evaluation
        })),
        confidence_level: entity.decisionLog.confidenceLevel
      } : undefined,
      
      correlations: entity.correlations?.map((correlation: _Correlation) => ({
        correlation_id: correlation.correlationId,
        type: correlation.type,
        related_trace_id: correlation.relatedTraceId,
        strength: correlation.strength,
        description: correlation.description
      })),
      
      // 企业级功能字段映射
      audit_trail: {
        enabled: entity.auditTrail.enabled,
        retention_days: entity.auditTrail.retentionDays,
        audit_events: entity.auditTrail.auditEvents?.map((event: _AuditEvent) => ({
          event_id: event.eventId,
          event_type: event.eventType,
          timestamp: event.timestamp,
          user_id: event.userId,
          user_role: event.userRole,
          action: event.action,
          resource: event.resource,
          trace_operation: event.traceOperation,
          trace_id: event.traceId,
          trace_type: event.traceType,
          severity: event.severity,
          span_ids: event.spanIds,
          trace_status: event.traceStatus,
          trace_details: event.traceDetails,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          session_id: event.sessionId,
          correlation_id: event.correlationId
        })),
        compliance_settings: entity.auditTrail.complianceSettings ? {
          gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
          hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
          sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
          trace_audit_level: entity.auditTrail.complianceSettings.traceAuditLevel,
          trace_data_logging: entity.auditTrail.complianceSettings.traceDataLogging,
          custom_compliance: entity.auditTrail.complianceSettings.customCompliance
        } : undefined
      },
      
      performance_metrics: {
        enabled: entity.performanceMetrics.enabled,
        collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
        metrics: entity.performanceMetrics.metrics ? {
          trace_processing_latency_ms: entity.performanceMetrics.metrics.traceProcessingLatencyMs,
          span_collection_rate_per_second: entity.performanceMetrics.metrics.spanCollectionRatePerSecond,
          trace_analysis_accuracy_percent: entity.performanceMetrics.metrics.traceAnalysisAccuracyPercent,
          distributed_tracing_coverage_percent: entity.performanceMetrics.metrics.distributedTracingCoveragePercent,
          trace_monitoring_efficiency_score: entity.performanceMetrics.metrics.traceMonitoringEfficiencyScore,
          active_traces_count: entity.performanceMetrics.metrics.activeTracesCount,
          trace_operations_per_second: entity.performanceMetrics.metrics.traceOperationsPerSecond,
          trace_storage_usage_mb: entity.performanceMetrics.metrics.traceStorageUsageMb,
          average_trace_complexity_score: entity.performanceMetrics.metrics.averageTraceComplexityScore
        } : undefined,
        health_status: entity.performanceMetrics.healthStatus ? {
          status: entity.performanceMetrics.healthStatus.status,
          last_check: entity.performanceMetrics.healthStatus.lastCheck,
          checks: entity.performanceMetrics.healthStatus.checks?.map((check: { checkName: string; status: string; message?: string; durationMs?: number }) => ({
            check_name: check.checkName,
            status: check.status,
            message: check.message,
            duration_ms: check.durationMs
          }))
        } : undefined,
        alerting: entity.performanceMetrics.alerting ? {
          enabled: entity.performanceMetrics.alerting.enabled,
          thresholds: entity.performanceMetrics.alerting.thresholds ? {
            max_trace_processing_latency_ms: entity.performanceMetrics.alerting.thresholds.maxTraceProcessingLatencyMs,
            min_span_collection_rate_per_second: entity.performanceMetrics.alerting.thresholds.minSpanCollectionRatePerSecond,
            min_trace_analysis_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minTraceAnalysisAccuracyPercent,
            min_distributed_tracing_coverage_percent: entity.performanceMetrics.alerting.thresholds.minDistributedTracingCoveragePercent,
            min_trace_monitoring_efficiency_score: entity.performanceMetrics.alerting.thresholds.minTraceMonitoringEfficiencyScore
          } : undefined,
          notification_channels: entity.performanceMetrics.alerting.notificationChannels
        } : undefined
      },
      
      monitoring_integration: {
        enabled: entity.monitoringIntegration.enabled,
        supported_providers: entity.monitoringIntegration.supportedProviders,
        integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
          metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
          tracing_api: entity.monitoringIntegration.integrationEndpoints.tracingApi,
          alerting_api: entity.monitoringIntegration.integrationEndpoints.alertingApi,
          dashboard_api: entity.monitoringIntegration.integrationEndpoints.dashboardApi
        } : undefined,
        export_formats: entity.monitoringIntegration.exportFormats,
        sampling_config: entity.monitoringIntegration.samplingConfig ? {
          sampling_rate: entity.monitoringIntegration.samplingConfig.samplingRate,
          adaptive_sampling: entity.monitoringIntegration.samplingConfig.adaptiveSampling,
          max_traces_per_second: entity.monitoringIntegration.samplingConfig.maxTracesPerSecond
        } : undefined
      },
      
      version_history: {
        enabled: entity.versionHistory.enabled,
        max_versions: entity.versionHistory.maxVersions,
        versions: entity.versionHistory.versions?.map((version: _VersionRecord) => ({
          version_id: version.versionId,
          version_number: version.versionNumber,
          created_at: version.createdAt,
          created_by: version.createdBy,
          change_summary: version.changeSummary,
          trace_snapshot: version.traceSnapshot,
          change_type: version.changeType
        })),
        auto_versioning: entity.versionHistory.autoVersioning ? {
          enabled: entity.versionHistory.autoVersioning.enabled,
          version_on_update: entity.versionHistory.autoVersioning.versionOnUpdate,
          version_on_analysis: entity.versionHistory.autoVersioning.versionOnAnalysis
        } : undefined
      },
      
      search_metadata: {
        enabled: entity.searchMetadata.enabled,
        indexing_strategy: entity.searchMetadata.indexingStrategy,
        searchable_fields: entity.searchMetadata.searchableFields,
        search_indexes: entity.searchMetadata.searchIndexes?.map((index: _SearchIndex) => ({
          index_id: index.indexId,
          index_name: index.indexName,
          fields: index.fields,
          index_type: index.indexType,
          created_at: index.createdAt,
          last_updated: index.lastUpdated
        })),
        auto_indexing: entity.searchMetadata.autoIndexing ? {
          enabled: entity.searchMetadata.autoIndexing.enabled,
          index_new_traces: entity.searchMetadata.autoIndexing.indexNewTraces,
          reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours
        } : undefined
      },
      
      trace_operation: entity.traceOperation,
      
      trace_details: entity.traceDetails ? {
        trace_level: entity.traceDetails.traceLevel,
        sampling_rate: entity.traceDetails.samplingRate,
        retention_days: entity.traceDetails.retentionDays
      } : undefined,
      
      event_integration: {
        enabled: entity.eventIntegration.enabled,
        event_bus_connection: entity.eventIntegration.eventBusConnection ? {
          bus_type: entity.eventIntegration.eventBusConnection.busType,
          connection_string: entity.eventIntegration.eventBusConnection.connectionString,
          topic_prefix: entity.eventIntegration.eventBusConnection.topicPrefix,
          consumer_group: entity.eventIntegration.eventBusConnection.consumerGroup
        } : undefined,
        published_events: entity.eventIntegration.publishedEvents,
        subscribed_events: entity.eventIntegration.subscribedEvents,
        event_routing: entity.eventIntegration.eventRouting ? {
          routing_rules: entity.eventIntegration.eventRouting.routingRules?.map((rule: { ruleId: string; condition: string; targetTopic: string; enabled?: boolean }) => ({
            rule_id: rule.ruleId,
            condition: rule.condition,
            target_topic: rule.targetTopic,
            enabled: rule.enabled
          }))
        } : undefined
      }
    };
  }

  /**
   * 将Schema格式数据转换为TypeScript实体数据
   *
   * @param schema - Schema格式的数据
   * @returns TypeScript格式的实体数据
   */
  static fromSchema(schema: TraceSchema): TraceEntityData {
    return {
      // 核心协议字段映射
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      traceId: schema.trace_id as UUID,
      contextId: schema.context_id as UUID,
      planId: schema.plan_id as UUID | undefined,
      taskId: schema.task_id as UUID | undefined,

      // 追踪核心字段映射
      traceType: schema.trace_type as TraceType,
      severity: schema.severity as Severity,
      event: {
        type: schema.event.type as EventType,
        name: schema.event.name,
        description: schema.event.description,
        category: schema.event.category as EventCategory,
        source: {
          component: schema.event.source.component,
          module: schema.event.source.module,
          function: schema.event.source.function,
          lineNumber: schema.event.source.line_number
        },
        data: schema.event.data
      },

      // 可选核心字段映射
      contextSnapshot: schema.context_snapshot ? {
        variables: schema.context_snapshot.variables,
        environment: schema.context_snapshot.environment ? {
          os: schema.context_snapshot.environment.os,
          platform: schema.context_snapshot.environment.platform,
          runtimeVersion: schema.context_snapshot.environment.runtime_version,
          environmentVariables: schema.context_snapshot.environment.environment_variables
        } : undefined,
        callStack: schema.context_snapshot.call_stack?.map((frame: { function: string; file?: string; line?: number; arguments?: Record<string, unknown> }) => ({
          function: frame.function,
          file: frame.file,
          line: frame.line,
          arguments: frame.arguments
        }))
      } : undefined,

      errorInformation: schema.error_information ? {
        errorCode: schema.error_information.error_code,
        errorMessage: schema.error_information.error_message,
        errorType: schema.error_information.error_type as ErrorType,
        stackTrace: schema.error_information.stack_trace?.map((frame: { file: string; function: string; line: number; column?: number }) => ({
          file: frame.file,
          function: frame.function,
          line: frame.line,
          column: frame.column
        })),
        recoveryActions: schema.error_information.recovery_actions?.map((action: { action: string; description: string; parameters?: Record<string, unknown> }) => ({
          action: action.action as 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort',
          description: action.description,
          parameters: action.parameters
        }))
      } : undefined,

      decisionLog: schema.decision_log ? {
        decisionPoint: schema.decision_log.decision_point,
        optionsConsidered: schema.decision_log.options_considered.map((option: { option: string; score: number; rationale?: string; risk_factors?: string[] }) => ({
          option: option.option,
          score: option.score,
          rationale: option.rationale,
          riskFactors: option.risk_factors
        })),
        selectedOption: schema.decision_log.selected_option,
        decisionCriteria: schema.decision_log.decision_criteria?.map((criterion: { criterion: string; weight: number; evaluation?: string }) => ({
          criterion: criterion.criterion,
          weight: criterion.weight,
          evaluation: criterion.evaluation
        })),
        confidenceLevel: schema.decision_log.confidence_level
      } : undefined,

      correlations: schema.correlations?.map((correlation: { correlation_id: string; type: string; related_trace_id: string; strength?: number; description?: string }) => ({
        correlationId: correlation.correlation_id as UUID,
        type: correlation.type as CorrelationType,
        relatedTraceId: correlation.related_trace_id as UUID,
        strength: correlation.strength,
        description: correlation.description
      })),

      // 企业级功能字段映射
      auditTrail: {
        enabled: schema.audit_trail.enabled,
        retentionDays: schema.audit_trail.retention_days,
        auditEvents: schema.audit_trail.audit_events?.map((event: {
          event_id: string; event_type: string; timestamp: string; user_id: string;
          user_role?: string; action: string; resource: string; trace_operation?: string;
          trace_id?: string; trace_type?: string; severity?: string; span_ids?: string[];
          trace_status?: string; trace_details?: Record<string, unknown>; ip_address?: string;
          user_agent?: string; session_id?: string; correlation_id?: string;
        }) => ({
          eventId: event.event_id as UUID,
          eventType: event.event_type,
          timestamp: event.timestamp,
          userId: event.user_id,
          userRole: event.user_role,
          action: event.action,
          resource: event.resource,
          traceOperation: event.trace_operation,
          traceId: event.trace_id as UUID | undefined,
          traceType: event.trace_type,
          severity: event.severity,
          spanIds: event.span_ids as UUID[] | undefined,
          traceStatus: event.trace_status,
          traceDetails: event.trace_details,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          sessionId: event.session_id,
          correlationId: event.correlation_id as UUID | undefined
        })),
        complianceSettings: schema.audit_trail.compliance_settings ? {
          gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
          hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
          soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
          traceAuditLevel: schema.audit_trail.compliance_settings.trace_audit_level as 'basic' | 'detailed' | 'comprehensive' | undefined,
          traceDataLogging: schema.audit_trail.compliance_settings.trace_data_logging,
          customCompliance: schema.audit_trail.compliance_settings.custom_compliance
        } : undefined
      },

      performanceMetrics: {
        enabled: schema.performance_metrics.enabled,
        collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
        metrics: schema.performance_metrics.metrics ? {
          traceProcessingLatencyMs: schema.performance_metrics.metrics.trace_processing_latency_ms,
          spanCollectionRatePerSecond: schema.performance_metrics.metrics.span_collection_rate_per_second,
          traceAnalysisAccuracyPercent: schema.performance_metrics.metrics.trace_analysis_accuracy_percent,
          distributedTracingCoveragePercent: schema.performance_metrics.metrics.distributed_tracing_coverage_percent,
          traceMonitoringEfficiencyScore: schema.performance_metrics.metrics.trace_monitoring_efficiency_score,
          activeTracesCount: schema.performance_metrics.metrics.active_traces_count,
          traceOperationsPerSecond: schema.performance_metrics.metrics.trace_operations_per_second,
          traceStorageUsageMb: schema.performance_metrics.metrics.trace_storage_usage_mb,
          averageTraceComplexityScore: schema.performance_metrics.metrics.average_trace_complexity_score
        } : undefined,
        healthStatus: schema.performance_metrics.health_status ? {
          status: schema.performance_metrics.health_status.status as 'healthy' | 'degraded' | 'unhealthy' | 'sampling',
          lastCheck: schema.performance_metrics.health_status.last_check,
          checks: schema.performance_metrics.health_status.checks?.map((check: { check_name: string; status: string; message?: string; duration_ms?: number }) => ({
            checkName: check.check_name,
            status: check.status as 'pass' | 'fail' | 'warn',
            message: check.message,
            durationMs: check.duration_ms
          }))
        } : undefined,
        alerting: schema.performance_metrics.alerting ? {
          enabled: schema.performance_metrics.alerting.enabled,
          thresholds: schema.performance_metrics.alerting.thresholds ? {
            maxTraceProcessingLatencyMs: schema.performance_metrics.alerting.thresholds.max_trace_processing_latency_ms,
            minSpanCollectionRatePerSecond: schema.performance_metrics.alerting.thresholds.min_span_collection_rate_per_second,
            minTraceAnalysisAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_trace_analysis_accuracy_percent,
            minDistributedTracingCoveragePercent: schema.performance_metrics.alerting.thresholds.min_distributed_tracing_coverage_percent,
            minTraceMonitoringEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_trace_monitoring_efficiency_score
          } : undefined,
          notificationChannels: schema.performance_metrics.alerting.notification_channels as ('email' | 'slack' | 'webhook' | 'sms' | 'pagerduty')[] | undefined
        } : undefined
      },

      monitoringIntegration: {
        enabled: schema.monitoring_integration.enabled,
        supportedProviders: schema.monitoring_integration.supported_providers as MonitoringProvider[],
        integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
          metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
          tracingApi: schema.monitoring_integration.integration_endpoints.tracing_api,
          alertingApi: schema.monitoring_integration.integration_endpoints.alerting_api,
          dashboardApi: schema.monitoring_integration.integration_endpoints.dashboard_api
        } : undefined,
        exportFormats: schema.monitoring_integration.export_formats as ExportFormat[] | undefined,
        samplingConfig: schema.monitoring_integration.sampling_config ? {
          samplingRate: schema.monitoring_integration.sampling_config.sampling_rate,
          adaptiveSampling: schema.monitoring_integration.sampling_config.adaptive_sampling,
          maxTracesPerSecond: schema.monitoring_integration.sampling_config.max_traces_per_second
        } : undefined
      },

      versionHistory: {
        enabled: schema.version_history.enabled,
        maxVersions: schema.version_history.max_versions,
        versions: schema.version_history.versions?.map((version: { version_id: string; version_number: number; created_at: string; created_by: string; change_summary?: string; trace_snapshot?: Record<string, unknown>; change_type: string }) => ({
          versionId: version.version_id as UUID,
          versionNumber: version.version_number,
          createdAt: version.created_at,
          createdBy: version.created_by,
          changeSummary: version.change_summary,
          traceSnapshot: version.trace_snapshot,
          changeType: version.change_type as 'created' | 'updated' | 'analyzed' | 'enriched' | 'corrected'
        })),
        autoVersioning: schema.version_history.auto_versioning ? {
          enabled: schema.version_history.auto_versioning.enabled,
          versionOnUpdate: schema.version_history.auto_versioning.version_on_update,
          versionOnAnalysis: schema.version_history.auto_versioning.version_on_analysis
        } : undefined
      },

      searchMetadata: {
        enabled: schema.search_metadata.enabled,
        indexingStrategy: schema.search_metadata.indexing_strategy as IndexingStrategy,
        searchableFields: schema.search_metadata.searchable_fields as SearchableField[] | undefined,
        searchIndexes: schema.search_metadata.search_indexes?.map((index: { index_id: string; index_name: string; fields: string[]; index_type: string; created_at?: string; last_updated?: string }) => ({
          indexId: index.index_id,
          indexName: index.index_name,
          fields: index.fields,
          indexType: index.index_type as 'btree' | 'hash' | 'gin' | 'gist' | 'full_text',
          createdAt: index.created_at,
          lastUpdated: index.last_updated
        })),
        autoIndexing: schema.search_metadata.auto_indexing ? {
          enabled: schema.search_metadata.auto_indexing.enabled,
          indexNewTraces: schema.search_metadata.auto_indexing.index_new_traces,
          reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours
        } : undefined
      },

      traceOperation: schema.trace_operation as TraceOperation,

      traceDetails: schema.trace_details ? {
        traceLevel: schema.trace_details.trace_level as 'basic' | 'detailed' | 'comprehensive' | undefined,
        samplingRate: schema.trace_details.sampling_rate,
        retentionDays: schema.trace_details.retention_days
      } : undefined,

      eventIntegration: {
        enabled: schema.event_integration.enabled,
        eventBusConnection: schema.event_integration.event_bus_connection ? {
          busType: schema.event_integration.event_bus_connection.bus_type as 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom' | undefined,
          connectionString: schema.event_integration.event_bus_connection.connection_string,
          topicPrefix: schema.event_integration.event_bus_connection.topic_prefix,
          consumerGroup: schema.event_integration.event_bus_connection.consumer_group
        } : undefined,
        publishedEvents: schema.event_integration.published_events as PublishedEvent[] | undefined,
        subscribedEvents: schema.event_integration.subscribed_events as SubscribedEvent[] | undefined,
        eventRouting: schema.event_integration.event_routing ? {
          routingRules: schema.event_integration.event_routing.routing_rules?.map((rule: { rule_id: string; condition: string; target_topic: string; enabled?: boolean }) => ({
            ruleId: rule.rule_id,
            condition: rule.condition,
            targetTopic: rule.target_topic,
            enabled: rule.enabled
          }))
        } : undefined
      }
    };
  }

  /**
   * 验证Schema数据格式
   *
   * @param data - 待验证的数据
   * @returns 是否为有效的TraceSchema格式
   */
  static validateSchema(data: unknown): data is TraceSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;

    // 验证必需字段
    const requiredFields = [
      'protocol_version',
      'timestamp',
      'trace_id',
      'context_id',
      'trace_type',
      'severity',
      'event',
      'audit_trail',
      'performance_metrics',
      'monitoring_integration',
      'version_history',
      'search_metadata',
      'trace_operation',
      'event_integration'
    ];

    for (const field of requiredFields) {
      if (!(field in schema)) {
        return false;
      }
    }

    // 验证基本类型
    if (typeof schema.protocol_version !== 'string' ||
        typeof schema.timestamp !== 'string' ||
        typeof schema.trace_id !== 'string' ||
        typeof schema.context_id !== 'string' ||
        typeof schema.trace_type !== 'string' ||
        typeof schema.severity !== 'string' ||
        typeof schema.event !== 'object' ||
        typeof schema.audit_trail !== 'object' ||
        typeof schema.performance_metrics !== 'object' ||
        typeof schema.monitoring_integration !== 'object' ||
        typeof schema.version_history !== 'object' ||
        typeof schema.search_metadata !== 'object' ||
        typeof schema.trace_operation !== 'string' ||
        typeof schema.event_integration !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * 批量转换TypeScript实体数据为Schema格式
   *
   * @param entities - TypeScript格式的实体数据数组
   * @returns Schema格式的数据数组
   */
  static toSchemaArray(entities: TraceEntityData[]): TraceSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换Schema格式数据为TypeScript实体数据
   *
   * @param schemas - Schema格式的数据数组
   * @returns TypeScript格式的实体数据数组
   */
  static fromSchemaArray(schemas: TraceSchema[]): TraceEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 横切关注点映射方法 =====
  // 基于Context、Plan、Role、Confirm模块的IDENTICAL模式

  /**
   * 映射安全上下文到Schema格式
   */
  static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown> {
    return {
      security_enabled: securityContext.securityEnabled,
      authentication_required: securityContext.authenticationRequired,
      authorization_level: securityContext.authorizationLevel,
      security_policies: securityContext.securityPolicies,
      access_control: securityContext.accessControl
    };
  }

  /**
   * 映射安全上下文从Schema格式
   */
  static mapSecurityContextFromSchema(securitySchema: Record<string, unknown>): Record<string, unknown> {
    return {
      securityEnabled: securitySchema.security_enabled,
      authenticationRequired: securitySchema.authentication_required,
      authorizationLevel: securitySchema.authorization_level,
      securityPolicies: securitySchema.security_policies,
      accessControl: securitySchema.access_control
    };
  }

  /**
   * 映射性能指标到Schema格式
   */
  static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown> {
    return {
      performance_enabled: performanceMetrics.performanceEnabled,
      collection_interval: performanceMetrics.collectionInterval,
      metrics_data: performanceMetrics.metricsData,
      health_checks: performanceMetrics.healthChecks,
      alerting_config: performanceMetrics.alertingConfig
    };
  }

  /**
   * 映射性能指标从Schema格式
   */
  static mapPerformanceMetricsFromSchema(performanceSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      performanceEnabled: performanceSchema.performance_enabled,
      collectionInterval: performanceSchema.collection_interval,
      metricsData: performanceSchema.metrics_data,
      healthChecks: performanceSchema.health_checks,
      alertingConfig: performanceSchema.alerting_config
    };
  }

  /**
   * 映射事件总线到Schema格式
   */
  static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown> {
    return {
      event_bus_enabled: eventBus.eventBusEnabled,
      connection_config: eventBus.connectionConfig,
      published_events: eventBus.publishedEvents,
      subscribed_events: eventBus.subscribedEvents,
      routing_rules: eventBus.routingRules
    };
  }

  /**
   * 映射事件总线从Schema格式
   */
  static mapEventBusFromSchema(eventBusSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      eventBusEnabled: eventBusSchema.event_bus_enabled,
      connectionConfig: eventBusSchema.connection_config,
      publishedEvents: eventBusSchema.published_events,
      subscribedEvents: eventBusSchema.subscribed_events,
      routingRules: eventBusSchema.routing_rules
    };
  }

  /**
   * 映射错误处理到Schema格式
   */
  static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown> {
    return {
      error_handling_enabled: errorHandling.errorHandlingEnabled,
      error_policies: errorHandling.errorPolicies,
      recovery_strategies: errorHandling.recoveryStrategies,
      escalation_rules: errorHandling.escalationRules,
      logging_config: errorHandling.loggingConfig
    };
  }

  /**
   * 映射错误处理从Schema格式
   */
  static mapErrorHandlingFromSchema(errorHandlingSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      errorHandlingEnabled: errorHandlingSchema.error_handling_enabled,
      errorPolicies: errorHandlingSchema.error_policies,
      recoveryStrategies: errorHandlingSchema.recovery_strategies,
      escalationRules: errorHandlingSchema.escalation_rules,
      loggingConfig: errorHandlingSchema.logging_config
    };
  }

  /**
   * 映射协调管理到Schema格式
   */
  static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown> {
    return {
      coordination_enabled: coordination.coordinationEnabled,
      coordination_policies: coordination.coordinationPolicies,
      module_dependencies: coordination.moduleDependencies,
      coordination_rules: coordination.coordinationRules,
      conflict_resolution: coordination.conflictResolution
    };
  }

  /**
   * 映射协调管理从Schema格式
   */
  static mapCoordinationFromSchema(coordinationSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      coordinationEnabled: coordinationSchema.coordination_enabled,
      coordinationPolicies: coordinationSchema.coordination_policies,
      moduleDependencies: coordinationSchema.module_dependencies,
      coordinationRules: coordinationSchema.coordination_rules,
      conflictResolution: coordinationSchema.conflict_resolution
    };
  }

  /**
   * 映射编排管理到Schema格式
   */
  static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown> {
    return {
      orchestration_enabled: orchestration.orchestrationEnabled,
      workflow_definitions: orchestration.workflowDefinitions,
      execution_policies: orchestration.executionPolicies,
      resource_allocation: orchestration.resourceAllocation,
      scheduling_rules: orchestration.schedulingRules
    };
  }

  /**
   * 映射编排管理从Schema格式
   */
  static mapOrchestrationFromSchema(orchestrationSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      orchestrationEnabled: orchestrationSchema.orchestration_enabled,
      workflowDefinitions: orchestrationSchema.workflow_definitions,
      executionPolicies: orchestrationSchema.execution_policies,
      resourceAllocation: orchestrationSchema.resource_allocation,
      schedulingRules: orchestrationSchema.scheduling_rules
    };
  }

  /**
   * 映射状态同步到Schema格式
   */
  static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown> {
    return {
      state_sync_enabled: stateSync.stateSyncEnabled,
      sync_policies: stateSync.syncPolicies,
      conflict_resolution: stateSync.conflictResolution,
      sync_intervals: stateSync.syncIntervals,
      consistency_rules: stateSync.consistencyRules
    };
  }

  /**
   * 映射状态同步从Schema格式
   */
  static mapStateSyncFromSchema(stateSyncSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      stateSyncEnabled: stateSyncSchema.state_sync_enabled,
      syncPolicies: stateSyncSchema.sync_policies,
      conflictResolution: stateSyncSchema.conflict_resolution,
      syncIntervals: stateSyncSchema.sync_intervals,
      consistencyRules: stateSyncSchema.consistency_rules
    };
  }

  /**
   * 映射事务管理到Schema格式
   */
  static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown> {
    return {
      transaction_enabled: transaction.transactionEnabled,
      isolation_level: transaction.isolationLevel,
      timeout_config: transaction.timeoutConfig,
      rollback_policies: transaction.rollbackPolicies,
      commit_strategies: transaction.commitStrategies
    };
  }

  /**
   * 映射事务管理从Schema格式
   */
  static mapTransactionFromSchema(transactionSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      transactionEnabled: transactionSchema.transaction_enabled,
      isolationLevel: transactionSchema.isolation_level,
      timeoutConfig: transactionSchema.timeout_config,
      rollbackPolicies: transactionSchema.rollback_policies,
      commitStrategies: transactionSchema.commit_strategies
    };
  }

  /**
   * 映射协议版本到Schema格式
   */
  static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown> {
    return {
      protocol_version: protocolVersion.protocolVersion,
      version_compatibility: protocolVersion.versionCompatibility,
      migration_rules: protocolVersion.migrationRules,
      deprecation_policies: protocolVersion.deprecationPolicies,
      upgrade_strategies: protocolVersion.upgradeStrategies
    };
  }

  /**
   * 映射协议版本从Schema格式
   */
  static mapProtocolVersionFromSchema(protocolVersionSchema: Record<string, unknown>): Record<string, unknown> {
    return {
      protocolVersion: protocolVersionSchema.protocol_version,
      versionCompatibility: protocolVersionSchema.version_compatibility,
      migrationRules: protocolVersionSchema.migration_rules,
      deprecationPolicies: protocolVersionSchema.deprecation_policies,
      upgradeStrategies: protocolVersionSchema.upgrade_strategies
    };
  }

  /**
   * 转换CreateTraceRequest为Schema格式
   */
  static createRequestToSchema(request: CreateTraceRequest): Partial<TraceSchema> {
    return {
      trace_type: request.traceType,
      severity: request.severity,
      event: request.event ? {
        type: request.event.type || 'start',
        name: request.event.name || 'Default Event',
        description: request.event.description,
        category: request.event.category || 'system',
        source: {
          component: request.event.source?.component || 'unknown',
          module: request.event.source?.module,
          function: request.event.source?.function,
          line_number: request.event.source?.lineNumber
        },
        data: request.event.data
      } : undefined,
      context_snapshot: request.contextSnapshot,
      error_information: request.errorInformation as unknown as TraceSchema['error_information'],
      decision_log: request.decisionLog as unknown as TraceSchema['decision_log'],
      trace_operation: request.traceOperation,
      trace_details: request.traceDetails as unknown as TraceSchema['trace_details']
    };
  }

  /**
   * 转换UpdateTraceRequest为Schema格式
   */
  static updateRequestToSchema(request: UpdateTraceRequest): Partial<TraceSchema> {
    const result: Partial<TraceSchema> = {};

    if (request.severity !== undefined) result.severity = request.severity;
    if (request.event !== undefined) {
      result.event = request.event ? {
        type: request.event.type || 'start',
        name: request.event.name || 'Default Event',
        description: request.event.description,
        category: request.event.category || 'system',
        source: {
          component: request.event.source?.component || 'unknown',
          module: request.event.source?.module,
          function: request.event.source?.function,
          line_number: request.event.source?.lineNumber
        },
        data: request.event.data
      } : undefined;
    }
    if (request.contextSnapshot !== undefined) {
      result.context_snapshot = request.contextSnapshot;
    }
    if (request.errorInformation !== undefined) {
      result.error_information = request.errorInformation as unknown as TraceSchema['error_information'];
    }
    if (request.decisionLog !== undefined) {
      result.decision_log = request.decisionLog as unknown as TraceSchema['decision_log'];
    }
    if (request.traceDetails !== undefined) {
      result.trace_details = request.traceDetails as unknown as TraceSchema['trace_details'];
    }

    return result;
  }

  /**
   * 转换TraceQueryFilter为Schema查询格式
   */
  static queryFilterToSchema(filter: TraceQueryFilter): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (filter.contextId !== undefined) result.context_id = filter.contextId;
    if (filter.planId !== undefined) result.plan_id = filter.planId;
    if (filter.taskId !== undefined) result.task_id = filter.taskId;
    if (filter.traceType !== undefined) result.trace_type = filter.traceType;
    if (filter.severity !== undefined) result.severity = filter.severity;
    if (filter.eventCategory !== undefined) result.event_category = filter.eventCategory;
    if (filter.createdAfter !== undefined) result.created_after = filter.createdAfter;
    if (filter.createdBefore !== undefined) result.created_before = filter.createdBefore;
    if (filter.hasErrors !== undefined) result.has_errors = filter.hasErrors;
    if (filter.hasDecisions !== undefined) result.has_decisions = filter.hasDecisions;

    return result;
  }
}
