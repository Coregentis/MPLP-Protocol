"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreManagementService = void 0;
const core_entity_1 = require("../../domain/entities/core.entity");
class CoreManagementService {
    coreRepository;
    constructor(coreRepository) {
        this.coreRepository = coreRepository;
    }
    async createWorkflow(data) {
        const workflowId = data.workflowId;
        const timestamp = new Date().toISOString();
        const executionStatus = {
            status: 'created',
            currentStage: data.workflowConfig.stages[0],
            completedStages: [],
            stageResults: {},
            startTime: timestamp,
            retryCount: 0
        };
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
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    async getWorkflowById(workflowId) {
        return await this.coreRepository.findById(workflowId);
    }
    async updateWorkflowStatus(workflowId, status) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        const updatedStatus = {
            ...coreEntity.executionStatus,
            status,
            endTime: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined
        };
        coreEntity.updateExecutionStatus(updatedStatus);
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
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    async updateCurrentStage(workflowId, stage) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        const updatedStatus = {
            ...coreEntity.executionStatus,
            currentStage: stage,
            completedStages: coreEntity.executionStatus.completedStages || []
        };
        if (coreEntity.executionStatus.currentStage &&
            updatedStatus.completedStages &&
            !updatedStatus.completedStages.includes(coreEntity.executionStatus.currentStage)) {
            updatedStatus.completedStages.push(coreEntity.executionStatus.currentStage);
        }
        coreEntity.updateExecutionStatus(updatedStatus);
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
        await this.coreRepository.save(coreEntity);
        return coreEntity;
    }
    async deleteWorkflow(workflowId) {
        const coreEntity = await this.coreRepository.findById(workflowId);
        if (!coreEntity) {
            return false;
        }
        coreEntity.addAuditEvent({
            eventId: `audit-${Date.now()}`,
            eventType: 'workflow_failed',
            timestamp: new Date().toISOString(),
            userId: coreEntity.executionContext.userId || 'system',
            action: 'delete_workflow',
            resource: `workflow:${workflowId}`,
            workflowId,
            orchestratorId: coreEntity.orchestratorId,
            coreOperation: coreEntity.coreOperation,
            coreStatus: 'deleted'
        });
        await this.coreRepository.save(coreEntity);
        return await this.coreRepository.delete(workflowId);
    }
    async getAllWorkflows() {
        return await this.coreRepository.findAll();
    }
    async getWorkflowsByStatus(status) {
        return await this.coreRepository.findByStatus(status);
    }
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
    async executeWorkflow(workflowId) {
        const entity = await this.coreRepository.findById(workflowId);
        if (!entity) {
            throw new Error('Workflow not found');
        }
        entity.executionStatus = {
            ...entity.executionStatus,
            status: 'running',
            startTime: new Date().toISOString()
        };
        return await this.coreRepository.save(entity);
    }
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
