"use strict";
/**
 * Core API控制器
 * 提供Core模块的HTTP API接口
 * 遵循RESTful API设计原则
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreController = void 0;
const core_mapper_1 = require("../mappers/core.mapper");
const types_1 = require("../../types");
/**
 * Core API控制器类
 * 处理所有Core模块相关的HTTP请求
 */
class CoreController {
    constructor(coreManagementService, coreOrchestrationService, _coreResourceService, _coreMonitoringService) {
        this.coreManagementService = coreManagementService;
        this.coreOrchestrationService = coreOrchestrationService;
        this._coreResourceService = _coreResourceService;
        this._coreMonitoringService = _coreMonitoringService;
        // Explicitly mark services as intentionally unused - Reserved for future API endpoints
        void this._coreResourceService;
        void this._coreMonitoringService;
    }
    // ===== 工作流管理API =====
    /**
     * 创建工作流
     * POST /api/core/workflows
     */
    async createWorkflow(request) {
        try {
            const coreEntity = await this.coreManagementService.createWorkflow({
                workflowId: request.workflowId,
                orchestratorId: request.orchestratorId,
                workflowConfig: {
                    ...request.workflowConfig,
                    executionMode: request.workflowConfig.executionMode || types_1.ExecutionMode.SEQUENTIAL,
                    parallelExecution: request.workflowConfig.parallelExecution || false,
                    priority: request.workflowConfig.priority || types_1.Priority.MEDIUM
                },
                executionContext: request.executionContext,
                coreOperation: request.coreOperation,
                coreDetails: request.coreDetails ? {
                    orchestrationMode: request.coreDetails.orchestrationMode,
                    resourceAllocation: request.coreDetails.resourceAllocation,
                    faultTolerance: request.coreDetails.faultTolerance
                } : undefined
            });
            const coreDto = this.entityToDto(coreEntity);
            return {
                success: true,
                data: coreDto
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * 获取工作流
     * GET /api/core/workflows/:workflowId
     */
    async getWorkflow(workflowId) {
        try {
            const coreEntity = await this.coreManagementService.getWorkflowById(workflowId);
            if (!coreEntity) {
                return {
                    success: false,
                    error: `Workflow not found: ${workflowId}`
                };
            }
            const coreDto = this.entityToDto(coreEntity);
            return {
                success: true,
                data: coreDto
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * 更新工作流状态
     * PUT /api/core/workflows/:workflowId/status
     */
    async updateWorkflowStatus(workflowId, request) {
        try {
            const coreEntity = await this.coreManagementService.updateWorkflowStatus(workflowId, request.status);
            const coreDto = this.entityToDto(coreEntity);
            return {
                success: true,
                data: coreDto
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * 删除工作流
     * DELETE /api/core/workflows/:workflowId
     */
    async deleteWorkflow(workflowId) {
        try {
            const deleted = await this.coreManagementService.deleteWorkflow(workflowId);
            return {
                success: deleted
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * 获取所有工作流
     * GET /api/core/workflows
     */
    async getAllWorkflows() {
        try {
            const coreEntities = await this.coreManagementService.getAllWorkflows();
            const coreDtos = coreEntities.map(entity => this.entityToDto(entity));
            return {
                success: true,
                data: coreDtos
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // ===== 工作流编排API =====
    /**
     * 执行工作流
     * POST /api/core/orchestration/execute
     */
    async executeWorkflow(request) {
        try {
            const result = await this.coreOrchestrationService.executeWorkflow({
                workflowId: request.workflowId,
                contextId: request.contextId,
                stages: request.stages,
                executionMode: request.executionMode,
                priority: request.priority,
                timeout: request.timeout,
                metadata: request.metadata
            });
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // ===== 私有辅助方法 =====
    /**
     * 将实体转换为DTO
     */
    entityToDto(entity) {
        // 使用映射器进行转换
        const schema = core_mapper_1.CoreMapper.toSchema(entity);
        return {
            protocolVersion: schema.protocol_version,
            timestamp: schema.timestamp,
            workflowId: schema.workflow_id,
            orchestratorId: schema.orchestrator_id,
            workflowConfig: {
                name: schema.workflow_config.name || 'Default Workflow',
                description: schema.workflow_config.description,
                stages: schema.workflow_config.stages,
                executionMode: schema.workflow_config.execution_mode,
                parallelExecution: schema.workflow_config.parallel_execution,
                priority: schema.workflow_config.priority,
                timeoutMs: schema.workflow_config.timeout_ms,
                maxConcurrentExecutions: schema.workflow_config.max_concurrent_executions,
                retryPolicy: schema.workflow_config.retry_policy ? {
                    maxAttempts: schema.workflow_config.retry_policy.max_attempts,
                    delayMs: schema.workflow_config.retry_policy.delay_ms,
                    backoffFactor: schema.workflow_config.retry_policy.backoff_factor
                } : undefined
            },
            executionContext: {
                userId: schema.execution_context.user_id,
                sessionId: schema.execution_context.session_id,
                requestId: schema.execution_context.request_id,
                priority: schema.execution_context.priority,
                metadata: schema.execution_context.metadata,
                variables: schema.execution_context.variables
            },
            executionStatus: {
                status: schema.execution_status.status,
                currentStage: schema.execution_status.current_stage,
                completedStages: schema.execution_status.completed_stages,
                stageResults: schema.execution_status.stage_results ? Object.fromEntries(Object.entries(schema.execution_status.stage_results).map(([key, result]) => [
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
                startTime: schema.execution_status.start_time,
                endTime: schema.execution_status.end_time,
                durationMs: schema.execution_status.duration_ms,
                retryCount: schema.execution_status.retry_count
            },
            auditTrail: {
                enabled: schema.audit_trail.enabled,
                retentionDays: schema.audit_trail.retention_days
            },
            monitoringIntegration: {
                enabled: schema.monitoring_integration.enabled,
                supportedProviders: schema.monitoring_integration.supported_providers,
                exportFormats: schema.monitoring_integration.export_formats
            },
            performanceMetrics: {
                enabled: schema.performance_metrics.enabled,
                collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds
            },
            versionHistory: {
                enabled: schema.version_history.enabled,
                maxVersions: schema.version_history.max_versions
            },
            searchMetadata: {
                enabled: schema.search_metadata.enabled,
                indexingStrategy: schema.search_metadata.indexing_strategy
            },
            coreOperation: schema.core_operation,
            eventIntegration: {
                enabled: schema.event_integration.enabled
            }
        };
    }
}
exports.CoreController = CoreController;
//# sourceMappingURL=core.controller.js.map