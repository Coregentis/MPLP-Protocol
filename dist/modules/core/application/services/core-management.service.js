"use strict";
/**
 * Core管理服务
 * 实现Core模块的核心业务逻辑
 * 遵循DDD应用服务模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreManagementService = void 0;
const core_entity_1 = require("../../domain/entities/core.entity");
/**
 * Core管理服务类
 * 提供工作流创建、执行、监控等核心功能
 */
class CoreManagementService {
    constructor(coreRepository) {
        this.coreRepository = coreRepository;
    }
    /**
     * 创建新的工作流
     * @param data 工作流创建数据
     * @returns 创建的Core实体
     */
    async createWorkflow(data) {
        const workflowId = data.workflowId;
        const timestamp = new Date().toISOString();
        // 创建默认的执行状态
        const executionStatus = {
            status: 'created',
            currentStage: data.workflowConfig.stages[0],
            completedStages: [],
            stageResults: {},
            startTime: timestamp,
            retryCount: 0
        };
        // 创建默认的审计追踪
        const auditTrail = {
            enabled: true,
            retentionDays: 90,
            auditEvents: [{
                    eventId: `audit-${Date.now()}`,
                    eventType: 'workflow_started',
                    timestamp,
                    userId: data.executionContext.userId || 'system',
                    action: 'create_workflow',
                    resource: `workflow:${workflowId}`,
                    workflowId,
                    orchestratorId: data.orchestratorId,
                    coreOperation: data.coreOperation,
                    coreStatus: 'created'
                }],
            complianceSettings: {
                gdprEnabled: false,
                hipaaEnabled: false,
                soxEnabled: false,
                coreAuditLevel: 'basic',
                coreDataLogging: true
            }
        };
        // 创建默认的监控集成
        const monitoringIntegration = {
            enabled: true,
            supportedProviders: ['prometheus', 'grafana'],
            systemMetrics: {
                trackWorkflowExecution: true,
                trackModuleCoordination: true,
                trackResourceUsage: true,
                trackSystemHealth: true
            },
            exportFormats: ['prometheus']
        };
        // 创建默认的性能指标配置
        const performanceMetrics = {
            enabled: true,
            collectionIntervalSeconds: 60,
            metrics: {
                coreOrchestrationLatencyMs: 0,
                workflowCoordinationEfficiencyScore: 10,
                systemReliabilityScore: 10,
                moduleIntegrationSuccessPercent: 100,
                coreManagementEfficiencyScore: 10,
                activeWorkflowsCount: 1,
                coreOperationsPerSecond: 0,
                coreMemoryUsageMb: 0,
                averageWorkflowComplexityScore: 5
            },
            healthStatus: {
                status: 'healthy',
                lastCheck: timestamp,
                checks: [{
                        checkName: 'workflow_creation',
                        status: 'pass',
                        message: 'Workflow created successfully',
                        durationMs: 10
                    }]
            }
        };
        // 创建默认的版本历史
        const versionHistory = {
            enabled: true,
            maxVersions: 50,
            versions: [{
                    versionId: `version-${Date.now()}`,
                    versionNumber: 1,
                    createdAt: timestamp,
                    createdBy: data.executionContext.userId || 'system',
                    changeSummary: 'Initial workflow creation',
                    changeType: 'system_initialized'
                }],
            autoVersioning: {
                enabled: true,
                versionOnConfigChange: true,
                versionOnDeployment: true,
                versionOnScaling: false
            }
        };
        // 创建默认的搜索元数据
        const searchMetadata = {
            enabled: true,
            indexingStrategy: 'hybrid',
            searchableFields: ['workflow_id', 'orchestrator_id', 'workflow_config', 'execution_status'],
            systemIndexing: {
                enabled: true,
                indexWorkflowData: true,
                indexSystemMetrics: true,
                indexAuditLogs: true
            },
            autoIndexing: {
                enabled: true,
                indexNewWorkflows: true,
                reindexIntervalHours: 24
            }
        };
        // 创建默认的事件集成
        const eventIntegration = {
            enabled: true,
            publishedEvents: ['workflow_executed', 'module_coordinated', 'system_recovered'],
            subscribedEvents: ['context_updated', 'plan_executed', 'confirm_approved'],
            eventRouting: {
                routingRules: [{
                        ruleId: 'default-routing',
                        condition: 'event.type === "workflow_started"',
                        targetTopic: 'core.workflow.events',
                        enabled: true
                    }]
            }
        };
        // 创建Core实体
        const coreEntity = new core_entity_1.CoreEntity({
            protocolVersion: '1.0.0',
            timestamp,
            workflowId,
            orchestratorId: data.orchestratorId,
            workflowConfig: data.workflowConfig,
            executionContext: data.executionContext,
            executionStatus,
            auditTrail,
            monitoringIntegration,
            performanceMetrics,
            versionHistory,
            searchMetadata,
            coreOperation: data.coreOperation,
            coreDetails: data.coreDetails,
            eventIntegration
        });
        // 保存到仓储
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    /**
     * 根据ID获取工作流
     * @param workflowId 工作流ID
     * @returns Core实体或null
     */
    async getWorkflowById(workflowId) {
        return await this.coreRepository.findById(workflowId);
    }
    /**
     * 更新工作流状态
     * @param workflowId 工作流ID
     * @param status 新状态
     * @returns 更新后的Core实体
     */
    async updateWorkflowStatus(workflowId, status) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        // 更新执行状态
        const updatedStatus = {
            ...coreEntity.executionStatus,
            status,
            endTime: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined
        };
        coreEntity.updateExecutionStatus(updatedStatus);
        // 添加审计事件
        coreEntity.addAuditEvent({
            eventId: `audit-${Date.now()}`,
            eventType: status === 'completed' ? 'workflow_completed' : 'workflow_failed',
            timestamp: new Date().toISOString(),
            userId: coreEntity.executionContext.userId || 'system',
            action: 'update_workflow_status',
            resource: `workflow:${workflowId}`,
            workflowId,
            orchestratorId: coreEntity.orchestratorId,
            coreOperation: coreEntity.coreOperation,
            coreStatus: status
        });
        // 保存更新
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    /**
     * 更新当前执行阶段
     * @param workflowId 工作流ID
     * @param stage 新阶段
     * @returns 更新后的Core实体
     */
    async updateCurrentStage(workflowId, stage) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        // 更新执行状态
        const updatedStatus = {
            ...coreEntity.executionStatus,
            currentStage: stage,
            completedStages: coreEntity.executionStatus.completedStages || []
        };
        // 如果当前阶段不在已完成列表中，添加前一个阶段到已完成列表
        if (coreEntity.executionStatus.currentStage &&
            updatedStatus.completedStages &&
            !updatedStatus.completedStages.includes(coreEntity.executionStatus.currentStage)) {
            updatedStatus.completedStages.push(coreEntity.executionStatus.currentStage);
        }
        coreEntity.updateExecutionStatus(updatedStatus);
        // 添加审计事件
        coreEntity.addAuditEvent({
            eventId: `audit-${Date.now()}`,
            eventType: 'workflow_started',
            timestamp: new Date().toISOString(),
            userId: coreEntity.executionContext.userId || 'system',
            action: 'update_current_stage',
            resource: `workflow:${workflowId}`,
            workflowId,
            orchestratorId: coreEntity.orchestratorId,
            coreOperation: coreEntity.coreOperation,
            coreStatus: 'stage_updated',
            coreDetails: { currentStage: stage, previousStage: coreEntity.executionStatus.currentStage }
        });
        // 保存更新
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    /**
     * 删除工作流
     * @param workflowId 工作流ID
     * @returns 是否删除成功
     */
    async deleteWorkflow(workflowId) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            return false;
        }
        // 添加审计事件
        coreEntity.addAuditEvent({
            eventId: `audit-${Date.now()}`,
            eventType: 'workflow_failed', // 使用最接近的事件类型
            timestamp: new Date().toISOString(),
            userId: coreEntity.executionContext.userId || 'system',
            action: 'delete_workflow',
            resource: `workflow:${workflowId}`,
            workflowId,
            orchestratorId: coreEntity.orchestratorId,
            coreOperation: coreEntity.coreOperation,
            coreStatus: 'deleted'
        });
        // 保存最后的审计记录
        await this.coreRepository.save(coreEntity);
        // 删除工作流
        return await this.coreRepository.delete(workflowId);
    }
    /**
     * 获取所有工作流
     * @returns 所有Core实体列表
     */
    async getAllWorkflows() {
        return await this.coreRepository.findAll();
    }
    /**
     * 根据状态获取工作流
     * @param status 工作流状态
     * @returns 匹配状态的Core实体列表
     */
    async getWorkflowsByStatus(status) {
        return await this.coreRepository.findByStatus(status);
    }
    /**
     * 获取工作流统计信息
     * @returns 统计信息
     */
    async getWorkflowStatistics() {
        const allWorkflows = await this.coreRepository.findAll();
        const totalWorkflows = allWorkflows.length;
        const activeWorkflows = allWorkflows.filter((w) => w.isWorkflowInProgress()).length;
        const completedWorkflows = allWorkflows.filter((w) => w.isWorkflowCompleted()).length;
        const failedWorkflows = allWorkflows.filter((w) => w.isWorkflowFailed()).length;
        const completedWithDuration = allWorkflows.filter((w) => w.isWorkflowCompleted() && w.getWorkflowDuration());
        const averageDuration = completedWithDuration.length > 0
            ? completedWithDuration.reduce((sum, w) => sum + (w.getWorkflowDuration() || 0), 0) / completedWithDuration.length
            : 0;
        return {
            totalWorkflows,
            activeWorkflows,
            completedWorkflows,
            failedWorkflows,
            averageDuration
        };
    }
    /**
     * 执行工作流
     * @param workflowId 工作流ID
     * @returns 执行后的Core实体
     */
    async executeWorkflow(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        // 更新执行状态
        entity.executionStatus = {
            ...entity.executionStatus,
            status: 'running',
            startTime: new Date().toISOString()
        };
        return await this.coreRepository.save(entity);
    }
    /**
     * 获取工作流状态
     * @param workflowId 工作流ID
     * @returns 工作流状态信息
     */
    async getWorkflowStatus(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        return {
            workflowId,
            status: entity.executionStatus.status || 'created',
            currentStage: entity.executionStatus.currentStage,
            progress: entity.executionStatus.completedStages?.length || 0,
            startTime: entity.executionStatus.startTime,
            endTime: entity.executionStatus.endTime
        };
    }
    /**
     * 暂停工作流
     * @param workflowId 工作流ID
     * @returns 暂停后的Core实体
     */
    async pauseWorkflow(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        entity.executionStatus = {
            ...entity.executionStatus,
            status: 'paused'
        };
        return await this.coreRepository.save(entity);
    }
    /**
     * 恢复工作流
     * @param workflowId 工作流ID
     * @returns 恢复后的Core实体
     */
    async resumeWorkflow(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        entity.executionStatus = {
            ...entity.executionStatus,
            status: 'running'
        };
        return await this.coreRepository.save(entity);
    }
    /**
     * 取消工作流
     * @param workflowId 工作流ID
     * @returns 取消后的Core实体
     */
    async cancelWorkflow(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        entity.executionStatus = {
            ...entity.executionStatus,
            status: 'cancelled',
            endTime: new Date().toISOString()
        };
        return await this.coreRepository.save(entity);
    }
}
exports.CoreManagementService = CoreManagementService;
//# sourceMappingURL=core-management.service.js.map