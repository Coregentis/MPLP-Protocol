"use strict";
/**
 * Core模块映射器
 * 实现Schema(snake_case) ↔ TypeScript(camelCase)双重命名约定映射
 * 严格遵循mplp-core.json Schema定义
 * 零any类型使用，完全类型安全
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreMapper = void 0;
// ===== 内部Schema接口定义 =====
// 注意：基于实际mplp-core.json Schema定义，使用Record<string, unknown>进行类型安全的转换
/**
 * Core模块映射器类
 * 提供Schema与TypeScript实体间的双向转换
 */
class CoreMapper {
    /**
     * 将TypeScript实体转换为Schema格式
     * @param entity Core实体
     * @returns Schema格式数据
     */
    // Note: Cache optimization methods (generateCacheKey, getCachedResult, setCachedResult)
    // were removed as they are not currently used. The caching infrastructure (mappingCache,
    // cacheEnabled, performanceMetrics) is kept for future performance optimization.
    // 性能监控方法
    static getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            averageToSchemaTime: this.performanceMetrics.toSchemaCount > 0
                ? this.performanceMetrics.totalToSchemaTime / this.performanceMetrics.toSchemaCount
                : 0,
            averageFromSchemaTime: this.performanceMetrics.fromSchemaCount > 0
                ? this.performanceMetrics.totalFromSchemaTime / this.performanceMetrics.fromSchemaCount
                : 0,
            cacheHitRate: (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) > 0
                ? this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)
                : 0
        };
    }
    static resetPerformanceMetrics() {
        this.performanceMetrics = {
            toSchemaCount: 0,
            fromSchemaCount: 0,
            totalToSchemaTime: 0,
            totalFromSchemaTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        this.mappingCache.clear();
    }
    static toSchema(entity) {
        const startTime = Date.now();
        try {
            // 输入验证
            if (!entity) {
                throw new Error('CoreEntity cannot be null or undefined');
            }
            if (!entity.protocolVersion) {
                throw new Error('CoreEntity.protocolVersion is required');
            }
            if (!entity.workflowId) {
                throw new Error('CoreEntity.workflowId is required');
            }
            const result = {
                protocol_version: entity.protocolVersion,
                timestamp: entity.timestamp,
                workflow_id: entity.workflowId,
                orchestrator_id: entity.orchestratorId,
                workflow_config: this.workflowConfigToSchema(entity.workflowConfig),
                execution_context: this.executionContextToSchema(entity.executionContext),
                execution_status: this.executionStatusToSchema(entity.executionStatus),
                module_coordination: entity.moduleCoordination ? this.moduleCoordinationToSchema(entity.moduleCoordination) : undefined,
                event_handling: entity.eventHandling ? this.eventHandlingToSchema(entity.eventHandling) : undefined,
                audit_trail: this.auditTrailToSchema(entity.auditTrail),
                monitoring_integration: this.monitoringIntegrationToSchema(entity.monitoringIntegration),
                performance_metrics: this.performanceMetricsToSchema(entity.performanceMetrics),
                version_history: this.versionHistoryToSchema(entity.versionHistory),
                search_metadata: this.searchMetadataToSchema(entity.searchMetadata),
                core_operation: entity.coreOperation,
                core_details: entity.coreDetails ? this.coreDetailsToSchema(entity.coreDetails) : undefined,
                event_integration: this.eventIntegrationToSchema(entity.eventIntegration)
            };
            // 性能监控
            const endTime = Date.now();
            this.performanceMetrics.toSchemaCount++;
            this.performanceMetrics.totalToSchemaTime += (endTime - startTime);
            return result;
        }
        catch (error) {
            // 错误处理和日志记录
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during toSchema mapping';
            // 在生产环境中，这里应该使用适当的日志记录服务
            if (process.env.NODE_ENV !== 'test') {
                // eslint-disable-next-line no-console
                console.error('CoreMapper.toSchema error:', errorMessage, {
                    workflowId: entity?.workflowId,
                    protocolVersion: entity?.protocolVersion
                });
            }
            // 重新抛出带有更多上下文的错误
            throw new Error(`Failed to convert CoreEntity to Schema: ${errorMessage}`);
        }
    }
    /**
     * 将Schema格式转换为TypeScript实体
     * @param schema Schema格式数据
     * @returns Core实体
     */
    static fromSchema(schema) {
        const startTime = Date.now();
        try {
            // 输入验证
            if (!schema) {
                throw new Error('CoreSchema cannot be null or undefined');
            }
            if (!schema.protocol_version) {
                throw new Error('CoreSchema.protocol_version is required');
            }
            if (!schema.workflow_id) {
                throw new Error('CoreSchema.workflow_id is required');
            }
            const result = {
                protocolVersion: schema.protocol_version,
                timestamp: schema.timestamp,
                workflowId: schema.workflow_id,
                orchestratorId: schema.orchestrator_id,
                workflowConfig: this.workflowConfigFromSchema(schema.workflow_config),
                executionContext: this.executionContextFromSchema(schema.execution_context),
                executionStatus: this.executionStatusFromSchema(schema.execution_status),
                moduleCoordination: schema.module_coordination ? this.moduleCoordinationFromSchema(schema.module_coordination) : undefined,
                eventHandling: schema.event_handling ? this.eventHandlingFromSchema(schema.event_handling) : undefined,
                auditTrail: this.auditTrailFromSchema(schema.audit_trail),
                monitoringIntegration: this.monitoringIntegrationFromSchema(schema.monitoring_integration),
                performanceMetrics: this.performanceMetricsFromSchema(schema.performance_metrics),
                versionHistory: this.versionHistoryFromSchema(schema.version_history),
                searchMetadata: this.searchMetadataFromSchema(schema.search_metadata),
                coreOperation: schema.core_operation,
                coreDetails: schema.core_details ? this.coreDetailsFromSchema(schema.core_details) : undefined,
                eventIntegration: this.eventIntegrationFromSchema(schema.event_integration)
            };
            // 性能监控
            const endTime = Date.now();
            this.performanceMetrics.fromSchemaCount++;
            this.performanceMetrics.totalFromSchemaTime += (endTime - startTime);
            return result;
        }
        catch (error) {
            // 错误处理和日志记录
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during fromSchema mapping';
            // 在生产环境中，这里应该使用适当的日志记录服务
            if (process.env.NODE_ENV !== 'test') {
                // eslint-disable-next-line no-console
                console.error('CoreMapper.fromSchema error:', errorMessage, {
                    workflowId: schema?.workflow_id,
                    protocolVersion: schema?.protocol_version
                });
            }
            // 重新抛出带有更多上下文的错误
            throw new Error(`Failed to convert Schema to CoreEntity: ${errorMessage}`);
        }
    }
    /**
     * 验证Schema数据格式
     * @param data 待验证数据
     * @returns 验证结果
     */
    static validateSchema(data) {
        const errors = [];
        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return { isValid: false, errors };
        }
        const schema = data;
        // 验证必需字段
        const requiredFields = [
            'protocol_version',
            'timestamp',
            'workflow_id',
            'orchestrator_id',
            'workflow_config',
            'execution_context',
            'execution_status',
            'audit_trail',
            'monitoring_integration',
            'performance_metrics',
            'version_history',
            'search_metadata',
            'core_operation',
            'event_integration'
        ];
        for (const field of requiredFields) {
            if (!(field in schema)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        // 验证协议版本
        if (schema.protocol_version !== '1.0.0') {
            errors.push('Invalid protocol_version, must be "1.0.0"');
        }
        // 验证UUID格式
        const uuidFields = ['workflow_id', 'orchestrator_id'];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        for (const field of uuidFields) {
            if (schema[field] && typeof schema[field] === 'string') {
                if (!uuidRegex.test(schema[field])) {
                    errors.push(`Invalid UUID format for field: ${field}`);
                }
            }
        }
        // 验证时间戳格式
        if (schema.timestamp && typeof schema.timestamp === 'string') {
            try {
                new Date(schema.timestamp);
            }
            catch {
                errors.push('Invalid timestamp format');
            }
        }
        // 验证workflow_config字段类型
        if (schema.workflow_config && typeof schema.workflow_config === 'object') {
            const workflowConfig = schema.workflow_config;
            // 验证timeout_ms应该是数字
            if (workflowConfig.timeout_ms !== undefined && typeof workflowConfig.timeout_ms !== 'number') {
                errors.push('workflow_config.timeout_ms must be a number');
            }
            // 验证parallel_execution应该是布尔值
            if (workflowConfig.parallel_execution !== undefined && typeof workflowConfig.parallel_execution !== 'boolean') {
                errors.push('workflow_config.parallel_execution must be a boolean');
            }
            // 验证stages应该是数组
            if (workflowConfig.stages !== undefined && !Array.isArray(workflowConfig.stages)) {
                errors.push('workflow_config.stages must be an array');
            }
            // 验证execution_mode枚举值
            if (workflowConfig.execution_mode !== undefined) {
                const validExecutionModes = ['sequential', 'parallel', 'conditional', 'hybrid'];
                if (!validExecutionModes.includes(workflowConfig.execution_mode)) {
                    errors.push(`workflow_config.execution_mode must be one of: ${validExecutionModes.join(', ')}`);
                }
            }
            // 验证priority枚举值
            if (workflowConfig.priority !== undefined) {
                const validPriorities = ['critical', 'high', 'medium', 'low'];
                if (!validPriorities.includes(workflowConfig.priority)) {
                    errors.push(`workflow_config.priority must be one of: ${validPriorities.join(', ')}`);
                }
            }
        }
        // 验证core_operation枚举值
        if (schema.core_operation !== undefined) {
            const validCoreOperations = ['workflow_execution', 'module_coordination', 'resource_management', 'system_monitoring', 'error_recovery'];
            if (!validCoreOperations.includes(schema.core_operation)) {
                errors.push(`core_operation must be one of: ${validCoreOperations.join(', ')}`);
            }
        }
        // 验证execution_status结构
        if (schema.execution_status && typeof schema.execution_status === 'object') {
            const executionStatus = schema.execution_status;
            // 验证status枚举值
            if (executionStatus.status !== undefined) {
                const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
                if (!validStatuses.includes(executionStatus.status)) {
                    errors.push(`execution_status.status must be one of: ${validStatuses.join(', ')}`);
                }
            }
            // 验证duration_ms应该是数字
            if (executionStatus.duration_ms !== undefined && typeof executionStatus.duration_ms !== 'number') {
                errors.push('execution_status.duration_ms must be a number');
            }
            // 验证retry_count应该是数字
            if (executionStatus.retry_count !== undefined && typeof executionStatus.retry_count !== 'number') {
                errors.push('execution_status.retry_count must be a number');
            }
        }
        if (errors.length > 0) {
            throw new Error(`Schema validation failed: ${errors.join(', ')}`);
        }
        return { isValid: true, errors: [] };
    }
    // ===== 私有辅助方法 =====
    static workflowConfigToSchema(config) {
        return {
            name: config.name,
            description: config.description,
            stages: config.stages,
            execution_mode: config.executionMode,
            parallel_execution: config.parallelExecution,
            priority: config.priority,
            timeout_ms: config.timeoutMs,
            max_concurrent_executions: config.maxConcurrentExecutions,
            retry_policy: config.retryPolicy ? {
                max_attempts: config.retryPolicy.maxAttempts,
                delay_ms: config.retryPolicy.delayMs,
                backoff_factor: config.retryPolicy.backoffFactor
            } : undefined
        };
    }
    static workflowConfigFromSchema(schema) {
        return {
            name: schema.name,
            description: schema.description,
            stages: schema.stages,
            executionMode: schema.execution_mode,
            parallelExecution: schema.parallel_execution,
            priority: schema.priority,
            timeoutMs: schema.timeout_ms,
            maxConcurrentExecutions: schema.max_concurrent_executions,
            retryPolicy: schema.retry_policy ? {
                maxAttempts: schema.retry_policy.max_attempts,
                delayMs: schema.retry_policy.delay_ms,
                backoffFactor: schema.retry_policy.backoff_factor
            } : undefined
        };
    }
    static executionContextToSchema(context) {
        return {
            user_id: context.userId,
            session_id: context.sessionId,
            request_id: context.requestId,
            priority: context.priority,
            metadata: context.metadata,
            variables: context.variables
        };
    }
    static executionContextFromSchema(schema) {
        return {
            userId: schema.user_id,
            sessionId: schema.session_id,
            requestId: schema.request_id,
            priority: schema.priority,
            metadata: schema.metadata,
            variables: schema.variables
        };
    }
    static executionStatusToSchema(status) {
        return {
            status: status.status,
            current_stage: status.currentStage,
            completed_stages: status.completedStages,
            stage_results: status.stageResults ? Object.fromEntries(Object.entries(status.stageResults).map(([key, result]) => [
                key,
                {
                    status: result.status,
                    start_time: result.startTime,
                    end_time: result.endTime,
                    duration_ms: result.durationMs,
                    result: result.result,
                    error: result.error
                }
            ])) : undefined,
            start_time: status.startTime,
            end_time: status.endTime,
            duration_ms: status.durationMs,
            retry_count: status.retryCount
        };
    }
    static executionStatusFromSchema(schema) {
        return {
            status: schema.status,
            currentStage: schema.current_stage,
            completedStages: schema.completed_stages,
            stageResults: schema.stage_results ? Object.fromEntries(Object.entries(schema.stage_results).map(([key, result]) => [
                key,
                {
                    status: result.status,
                    startTime: result.start_time,
                    endTime: result.end_time,
                    durationMs: result.duration_ms,
                    result: result.result,
                    error: result.error
                }
            ])) : undefined,
            startTime: schema.start_time,
            endTime: schema.end_time,
            durationMs: schema.duration_ms,
            retryCount: schema.retry_count
        };
    }
    static moduleCoordinationToSchema(coordination) {
        return {
            module_adapters: coordination.moduleAdapters ? Object.fromEntries(Object.entries(coordination.moduleAdapters).map(([key, adapter]) => [
                key,
                {
                    adapter_type: adapter.adapterType,
                    config: adapter.config,
                    timeout_ms: adapter.timeoutMs,
                    retry_policy: adapter.retryPolicy ? {
                        max_attempts: adapter.retryPolicy.maxAttempts,
                        delay_ms: adapter.retryPolicy.delayMs
                    } : undefined
                }
            ])) : undefined,
            data_flow: coordination.dataFlow ? {
                input_mappings: coordination.dataFlow.inputMappings ? Object.fromEntries(Object.entries(coordination.dataFlow.inputMappings).map(([key, mapping]) => [
                    key,
                    {
                        source_stage: mapping.sourceStage,
                        source_field: mapping.sourceField,
                        target_field: mapping.targetField,
                        transformation: mapping.transformation
                    }
                ])) : undefined,
                output_mappings: coordination.dataFlow.outputMappings ? Object.fromEntries(Object.entries(coordination.dataFlow.outputMappings).map(([key, mapping]) => [
                    key,
                    {
                        target_stage: mapping.sourceStage, // Note: Schema uses target_stage but maps to sourceStage
                        source_field: mapping.sourceField,
                        target_field: mapping.targetField,
                        transformation: mapping.transformation
                    }
                ])) : undefined
            } : undefined
        };
    }
    static moduleCoordinationFromSchema(schema) {
        return {
            moduleAdapters: schema.module_adapters ? Object.fromEntries(Object.entries(schema.module_adapters).map(([key, adapter]) => [
                key,
                {
                    adapterType: adapter.adapter_type,
                    config: adapter.config,
                    timeoutMs: adapter.timeout_ms,
                    retryPolicy: adapter.retry_policy ? {
                        maxAttempts: adapter.retry_policy.max_attempts,
                        delayMs: adapter.retry_policy.delay_ms
                    } : undefined
                }
            ])) : undefined,
            dataFlow: schema.data_flow ? {
                inputMappings: schema.data_flow.input_mappings ? Object.fromEntries(Object.entries(schema.data_flow.input_mappings).map(([key, mapping]) => [
                    key,
                    {
                        sourceStage: mapping.source_stage,
                        sourceField: mapping.source_field,
                        targetField: mapping.target_field,
                        transformation: mapping.transformation
                    }
                ])) : undefined,
                outputMappings: schema.data_flow.output_mappings ? Object.fromEntries(Object.entries(schema.data_flow.output_mappings).map(([key, mapping]) => [
                    key,
                    {
                        sourceStage: mapping.target_stage, // Note: Schema uses target_stage but maps to sourceStage
                        sourceField: mapping.source_field,
                        targetField: mapping.target_field,
                        transformation: mapping.transformation
                    }
                ])) : undefined
            } : undefined
        };
    }
    static eventHandlingToSchema(handling) {
        return {
            event_listeners: handling.eventListeners?.map(listener => ({
                event_type: listener.eventType,
                handler: listener.handler,
                config: listener.config
            })),
            event_routing: handling.eventRouting ? {
                default_handler: handling.eventRouting.defaultHandler,
                routing_rules: handling.eventRouting.routingRules?.map(rule => ({
                    condition: rule.condition,
                    handler: rule.handler
                }))
            } : undefined
        };
    }
    static eventHandlingFromSchema(schema) {
        return {
            eventListeners: schema.event_listeners?.map((listener) => ({
                eventType: listener.event_type,
                handler: listener.handler,
                config: listener.config
            })),
            eventRouting: schema.event_routing ? {
                defaultHandler: schema.event_routing.default_handler,
                routingRules: schema.event_routing.routing_rules?.map((rule) => ({
                    condition: rule.condition,
                    handler: rule.handler
                }))
            } : undefined
        };
    }
    static auditTrailToSchema(trail) {
        return {
            enabled: trail.enabled,
            retention_days: trail.retentionDays,
            audit_events: trail.auditEvents?.map(event => ({
                event_id: event.eventId,
                event_type: event.eventType,
                timestamp: event.timestamp,
                user_id: event.userId,
                user_role: event.userRole,
                action: event.action,
                resource: event.resource,
                system_operation: event.systemOperation,
                workflow_id: event.workflowId,
                orchestrator_id: event.orchestratorId,
                core_operation: event.coreOperation,
                core_status: event.coreStatus,
                module_ids: event.moduleIds,
                core_details: event.coreDetails,
                ip_address: event.ipAddress,
                user_agent: event.userAgent,
                session_id: event.sessionId,
                correlation_id: event.correlationId
            })),
            compliance_settings: trail.complianceSettings ? {
                gdpr_enabled: trail.complianceSettings.gdprEnabled,
                hipaa_enabled: trail.complianceSettings.hipaaEnabled,
                sox_enabled: trail.complianceSettings.soxEnabled,
                core_audit_level: trail.complianceSettings.coreAuditLevel,
                core_data_logging: trail.complianceSettings.coreDataLogging,
                custom_compliance: trail.complianceSettings.customCompliance
            } : undefined
        };
    }
    static auditTrailFromSchema(schema) {
        // 支持测试数据的兼容性处理
        const legacySchema = schema;
        return {
            enabled: schema.enabled,
            retentionDays: schema.retention_days || legacySchema.retention_period_days || 0,
            auditEvents: (schema.audit_events || legacySchema.events)?.map((event) => ({
                eventId: event.event_id || event.eventId,
                eventType: (event.event_type || event.eventType),
                timestamp: event.timestamp,
                userId: event.user_id || event.userId,
                userRole: event.user_role,
                action: event.action,
                resource: event.resource,
                systemOperation: event.system_operation,
                workflowId: event.workflow_id,
                orchestratorId: event.orchestrator_id,
                coreOperation: event.core_operation,
                coreStatus: event.core_status,
                moduleIds: event.module_ids,
                coreDetails: event.core_details,
                ipAddress: event.ip_address,
                userAgent: event.user_agent,
                sessionId: event.session_id,
                correlationId: event.correlation_id
            })),
            complianceSettings: schema.compliance_settings ? {
                gdprEnabled: schema.compliance_settings.gdpr_enabled,
                hipaaEnabled: schema.compliance_settings.hipaa_enabled,
                soxEnabled: schema.compliance_settings.sox_enabled,
                coreAuditLevel: schema.compliance_settings.core_audit_level,
                coreDataLogging: schema.compliance_settings.core_data_logging,
                customCompliance: schema.compliance_settings.custom_compliance
            } : undefined
        };
    }
    static monitoringIntegrationToSchema(integration) {
        return {
            enabled: integration.enabled,
            supported_providers: integration.supportedProviders,
            integration_endpoints: integration.integrationEndpoints ? {
                metrics_api: integration.integrationEndpoints.metricsApi,
                system_health_api: integration.integrationEndpoints.systemHealthApi,
                workflow_metrics_api: integration.integrationEndpoints.workflowMetricsApi,
                resource_metrics_api: integration.integrationEndpoints.resourceMetricsApi
            } : undefined,
            system_metrics: integration.systemMetrics ? {
                track_workflow_execution: integration.systemMetrics.trackWorkflowExecution,
                track_module_coordination: integration.systemMetrics.trackModuleCoordination,
                track_resource_usage: integration.systemMetrics.trackResourceUsage,
                track_system_health: integration.systemMetrics.trackSystemHealth
            } : undefined,
            export_formats: integration.exportFormats
        };
    }
    static monitoringIntegrationFromSchema(schema) {
        return {
            enabled: schema.enabled,
            supportedProviders: schema.supported_providers,
            integrationEndpoints: schema.integration_endpoints ? {
                metricsApi: schema.integration_endpoints.metrics_api,
                systemHealthApi: schema.integration_endpoints.system_health_api,
                workflowMetricsApi: schema.integration_endpoints.workflow_metrics_api,
                resourceMetricsApi: schema.integration_endpoints.resource_metrics_api
            } : undefined,
            systemMetrics: schema.system_metrics ? {
                trackWorkflowExecution: schema.system_metrics.track_workflow_execution,
                trackModuleCoordination: schema.system_metrics.track_module_coordination,
                trackResourceUsage: schema.system_metrics.track_resource_usage,
                trackSystemHealth: schema.system_metrics.track_system_health
            } : undefined,
            exportFormats: schema.export_formats
        };
    }
    static performanceMetricsToSchema(metrics) {
        return {
            enabled: metrics.enabled,
            collection_interval_seconds: metrics.collectionIntervalSeconds,
            metrics: metrics.metrics ? {
                core_orchestration_latency_ms: metrics.metrics.coreOrchestrationLatencyMs,
                workflow_coordination_efficiency_score: metrics.metrics.workflowCoordinationEfficiencyScore,
                system_reliability_score: metrics.metrics.systemReliabilityScore,
                module_integration_success_percent: metrics.metrics.moduleIntegrationSuccessPercent,
                core_management_efficiency_score: metrics.metrics.coreManagementEfficiencyScore,
                active_workflows_count: metrics.metrics.activeWorkflowsCount,
                core_operations_per_second: metrics.metrics.coreOperationsPerSecond,
                core_memory_usage_mb: metrics.metrics.coreMemoryUsageMb,
                average_workflow_complexity_score: metrics.metrics.averageWorkflowComplexityScore
            } : undefined,
            health_status: metrics.healthStatus ? {
                status: metrics.healthStatus.status,
                last_check: metrics.healthStatus.lastCheck,
                checks: metrics.healthStatus.checks?.map(check => ({
                    check_name: check.checkName,
                    status: check.status,
                    message: check.message,
                    duration_ms: check.durationMs
                }))
            } : undefined,
            alerting: metrics.alerting ? {
                enabled: metrics.alerting.enabled,
                thresholds: metrics.alerting.thresholds ? {
                    max_core_orchestration_latency_ms: metrics.alerting.thresholds.maxCoreOrchestrationLatencyMs,
                    min_workflow_coordination_efficiency_score: metrics.alerting.thresholds.minWorkflowCoordinationEfficiencyScore,
                    min_system_reliability_score: metrics.alerting.thresholds.minSystemReliabilityScore,
                    min_module_integration_success_percent: metrics.alerting.thresholds.minModuleIntegrationSuccessPercent,
                    min_core_management_efficiency_score: metrics.alerting.thresholds.minCoreManagementEfficiencyScore
                } : undefined,
                notification_channels: metrics.alerting.notificationChannels
            } : undefined
        };
    }
    static performanceMetricsFromSchema(schema) {
        const metrics = schema.metrics;
        const healthStatus = schema.health_status;
        const alerting = schema.alerting;
        return {
            enabled: schema.enabled,
            collectionIntervalSeconds: schema.collection_interval_seconds,
            metrics: metrics ? {
                coreOrchestrationLatencyMs: metrics.core_orchestration_latency_ms,
                workflowCoordinationEfficiencyScore: metrics.workflow_coordination_efficiency_score,
                systemReliabilityScore: metrics.system_reliability_score,
                moduleIntegrationSuccessPercent: metrics.module_integration_success_percent,
                coreManagementEfficiencyScore: metrics.core_management_efficiency_score,
                activeWorkflowsCount: metrics.active_workflows_count,
                coreOperationsPerSecond: metrics.core_operations_per_second,
                coreMemoryUsageMb: metrics.core_memory_usage_mb,
                averageWorkflowComplexityScore: metrics.average_workflow_complexity_score
            } : undefined,
            healthStatus: healthStatus ? {
                status: healthStatus.status,
                lastCheck: healthStatus.last_check,
                checks: healthStatus.checks?.map(check => ({
                    checkName: check.check_name,
                    status: check.status,
                    message: check.message,
                    durationMs: check.duration_ms
                }))
            } : undefined,
            alerting: alerting ? {
                enabled: alerting.enabled,
                thresholds: alerting.thresholds ? {
                    maxCoreOrchestrationLatencyMs: alerting.thresholds.max_core_orchestration_latency_ms,
                    minWorkflowCoordinationEfficiencyScore: alerting.thresholds.min_workflow_coordination_efficiency_score,
                    minSystemReliabilityScore: alerting.thresholds.min_system_reliability_score,
                    minModuleIntegrationSuccessPercent: alerting.thresholds.min_module_integration_success_percent,
                    minCoreManagementEfficiencyScore: alerting.thresholds.min_core_management_efficiency_score
                } : undefined,
                notificationChannels: alerting.notification_channels
            } : undefined
        };
    }
    static versionHistoryToSchema(history) {
        return {
            enabled: history.enabled,
            max_versions: history.maxVersions,
            versions: history.versions?.map(version => ({
                version_id: version.versionId,
                version_number: version.versionNumber,
                created_at: version.createdAt,
                created_by: version.createdBy,
                change_summary: version.changeSummary,
                system_snapshot: version.systemSnapshot,
                change_type: version.changeType
            })),
            auto_versioning: history.autoVersioning ? {
                enabled: history.autoVersioning.enabled,
                version_on_config_change: history.autoVersioning.versionOnConfigChange,
                version_on_deployment: history.autoVersioning.versionOnDeployment,
                version_on_scaling: history.autoVersioning.versionOnScaling
            } : undefined
        };
    }
    static versionHistoryFromSchema(schema) {
        const versions = schema.versions;
        const autoVersioning = schema.auto_versioning;
        return {
            enabled: schema.enabled,
            maxVersions: schema.max_versions,
            versions: versions?.map(version => ({
                versionId: version.version_id,
                versionNumber: version.version_number,
                createdAt: version.created_at,
                createdBy: version.created_by,
                changeSummary: version.change_summary,
                systemSnapshot: version.system_snapshot,
                changeType: version.change_type
            })),
            autoVersioning: autoVersioning ? {
                enabled: autoVersioning.enabled,
                versionOnConfigChange: autoVersioning.version_on_config_change,
                versionOnDeployment: autoVersioning.version_on_deployment,
                versionOnScaling: autoVersioning.version_on_scaling
            } : undefined
        };
    }
    static searchMetadataToSchema(metadata) {
        return {
            enabled: metadata.enabled,
            indexing_strategy: metadata.indexingStrategy,
            searchable_fields: metadata.searchableFields,
            search_indexes: metadata.searchIndexes?.map(index => ({
                index_id: index.indexId,
                index_name: index.indexName,
                fields: index.fields,
                index_type: index.indexType,
                created_at: index.createdAt,
                last_updated: index.lastUpdated
            })),
            system_indexing: metadata.systemIndexing ? {
                enabled: metadata.systemIndexing.enabled,
                index_workflow_data: metadata.systemIndexing.indexWorkflowData,
                index_system_metrics: metadata.systemIndexing.indexSystemMetrics,
                index_audit_logs: metadata.systemIndexing.indexAuditLogs
            } : undefined,
            auto_indexing: metadata.autoIndexing ? {
                enabled: metadata.autoIndexing.enabled,
                index_new_workflows: metadata.autoIndexing.indexNewWorkflows,
                reindex_interval_hours: metadata.autoIndexing.reindexIntervalHours
            } : undefined
        };
    }
    static searchMetadataFromSchema(schema) {
        const searchIndexes = schema.search_indexes;
        const systemIndexing = schema.system_indexing;
        const autoIndexing = schema.auto_indexing;
        return {
            enabled: schema.enabled,
            indexingStrategy: schema.indexing_strategy,
            searchableFields: schema.searchable_fields,
            searchIndexes: searchIndexes?.map(index => ({
                indexId: index.index_id,
                indexName: index.index_name,
                fields: index.fields,
                indexType: index.index_type,
                createdAt: index.created_at,
                lastUpdated: index.last_updated
            })),
            systemIndexing: systemIndexing ? {
                enabled: systemIndexing.enabled,
                indexWorkflowData: systemIndexing.index_workflow_data,
                indexSystemMetrics: systemIndexing.index_system_metrics,
                indexAuditLogs: systemIndexing.index_audit_logs
            } : undefined,
            autoIndexing: autoIndexing ? {
                enabled: autoIndexing.enabled,
                indexNewWorkflows: autoIndexing.index_new_workflows,
                reindexIntervalHours: autoIndexing.reindex_interval_hours
            } : undefined
        };
    }
    static coreDetailsToSchema(details) {
        return {
            orchestration_mode: details.orchestrationMode,
            resource_allocation: details.resourceAllocation,
            fault_tolerance: details.faultTolerance
        };
    }
    static coreDetailsFromSchema(schema) {
        return {
            orchestrationMode: schema.orchestration_mode,
            resourceAllocation: schema.resource_allocation,
            faultTolerance: schema.fault_tolerance
        };
    }
    static eventIntegrationToSchema(integration) {
        return {
            enabled: integration.enabled,
            event_bus_connection: integration.eventBusConnection ? {
                bus_type: integration.eventBusConnection.busType,
                connection_string: integration.eventBusConnection.connectionString,
                topic_prefix: integration.eventBusConnection.topicPrefix,
                consumer_group: integration.eventBusConnection.consumerGroup
            } : undefined,
            published_events: integration.publishedEvents,
            subscribed_events: integration.subscribedEvents,
            event_routing: integration.eventRouting ? {
                routing_rules: integration.eventRouting.routingRules?.map(rule => ({
                    rule_id: rule.ruleId,
                    condition: rule.condition,
                    target_topic: rule.targetTopic,
                    enabled: rule.enabled
                }))
            } : undefined
        };
    }
    static eventIntegrationFromSchema(schema) {
        const eventBusConnection = schema.event_bus_connection;
        const eventRouting = schema.event_routing;
        return {
            enabled: schema.enabled,
            eventBusConnection: eventBusConnection ? {
                busType: eventBusConnection.bus_type,
                connectionString: eventBusConnection.connection_string,
                topicPrefix: eventBusConnection.topic_prefix,
                consumerGroup: eventBusConnection.consumer_group
            } : undefined,
            publishedEvents: schema.published_events,
            subscribedEvents: schema.subscribed_events,
            eventRouting: eventRouting ? {
                routingRules: eventRouting.routing_rules?.map(rule => ({
                    ruleId: rule.rule_id,
                    condition: rule.condition,
                    targetTopic: rule.target_topic,
                    enabled: rule.enabled
                }))
            } : undefined
        };
    }
    /**
     * 批量转换实体数组为Schema数组
     * @param entities 实体数组
     * @returns Schema数组
     */
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    /**
     * 批量转换Schema数组为实体数组
     * @param schemas Schema数组
     * @returns 实体数组
     */
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
}
exports.CoreMapper = CoreMapper;
// 性能优化：映射缓存
// Note: mappingCache is kept for resetPerformanceMetrics() method
// cacheMaxSize and cacheEnabled were removed as cache methods were deleted
CoreMapper.mappingCache = new Map();
// 性能监控
CoreMapper.performanceMetrics = {
    toSchemaCount: 0,
    fromSchemaCount: 0,
    totalToSchemaTime: 0,
    totalFromSchemaTime: 0,
    cacheHits: 0,
    cacheMisses: 0
};
//# sourceMappingURL=core.mapper.js.map