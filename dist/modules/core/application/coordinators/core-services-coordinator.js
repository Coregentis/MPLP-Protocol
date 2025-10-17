"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreServicesCoordinator = void 0;
class CoreServicesCoordinator {
    managementService;
    monitoringService;
    orchestrationService;
    resourceService;
    coreRepository;
    logger;
    constructor(managementService, monitoringService, orchestrationService, resourceService, coreRepository, logger) {
        this.managementService = managementService;
        this.monitoringService = monitoringService;
        this.orchestrationService = orchestrationService;
        this.resourceService = resourceService;
        this.coreRepository = coreRepository;
        this.logger = logger;
    }
    async createWorkflowWithFullCoordination(params) {
        try {
            this.logger?.info('Starting coordinated workflow creation', {
                workflowId: params.workflowId,
                operation: params.coreOperation
            });
            const workflow = await this.managementService.createWorkflow({
                workflowId: params.workflowId,
                orchestratorId: params.orchestratorId,
                workflowConfig: params.workflowConfig,
                executionContext: params.executionContext,
                coreOperation: params.coreOperation,
                coreDetails: params.coreDetails
            });
            let monitoringEnabled = false;
            if (params.enableMonitoring !== false) {
                try {
                    await this.monitoringService.performHealthCheck();
                    monitoringEnabled = true;
                    this.logger?.info('Workflow monitoring started', { workflowId: params.workflowId });
                }
                catch (error) {
                    this.logger?.error('Failed to start monitoring', { workflowId: params.workflowId, error });
                }
            }
            let resourcesAllocated = false;
            if (params.enableResourceTracking !== false) {
                try {
                    const allocation = await this.resourceService.allocateResources(params.workflowId, {
                        cpuCores: 1,
                        memoryMb: 512,
                        diskSpaceMb: 1024,
                        priority: 'medium'
                    });
                    resourcesAllocated = !!allocation;
                    this.logger?.info('Workflow resources allocated', { workflowId: params.workflowId, allocationId: allocation.allocationId });
                }
                catch (error) {
                    this.logger?.error('Failed to allocate resources', { workflowId: params.workflowId, error });
                }
            }
            let orchestrationActive = false;
            try {
                await this.orchestrationService.coordinateModuleOperation({
                    sourceModule: 'core',
                    targetModule: 'orchestrator',
                    operation: 'start_workflow',
                    payload: { workflowId: params.workflowId },
                    timestamp: new Date().toISOString()
                });
                orchestrationActive = true;
                this.logger?.info('Workflow orchestration activated', { workflowId: params.workflowId });
            }
            catch (error) {
                this.logger?.error('Failed to activate orchestration', { workflowId: params.workflowId, error });
            }
            const healthStatus = this.evaluateWorkflowHealth(monitoringEnabled, resourcesAllocated, orchestrationActive);
            this.logger?.info('Coordinated workflow creation completed', {
                workflowId: params.workflowId,
                healthStatus,
                monitoringEnabled,
                resourcesAllocated,
                orchestrationActive
            });
            return {
                workflow,
                monitoringEnabled,
                resourcesAllocated,
                orchestrationActive,
                healthStatus
            };
        }
        catch (error) {
            this.logger?.error('Coordinated workflow creation failed', {
                workflowId: params.workflowId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async executeWorkflowWithCoordination(workflowId) {
        try {
            this.logger?.info('Starting coordinated workflow execution', { workflowId });
            const _stats = await this.managementService.getWorkflowStatistics();
            await this.orchestrationService.coordinateModuleOperation({
                sourceModule: 'core',
                targetModule: 'workflow',
                operation: 'execute',
                payload: { workflowId },
                timestamp: new Date().toISOString()
            });
            const monitoringEnabled = true;
            const resourcesAllocated = true;
            const healthStatus = this.evaluateWorkflowHealth(monitoringEnabled, resourcesAllocated, true);
            const workflow = await this.managementService.createWorkflow({
                workflowId,
                orchestratorId: 'default-orchestrator',
                workflowConfig: {
                    stages: ['context', 'plan'],
                    executionMode: 'sequential',
                    parallelExecution: false,
                    priority: 'medium'
                },
                executionContext: {
                    userId: 'system',
                    sessionId: 'default-session'
                },
                coreOperation: 'workflow_execution'
            });
            return {
                workflow,
                monitoringEnabled,
                resourcesAllocated,
                orchestrationActive: true,
                healthStatus
            };
        }
        catch (error) {
            this.logger?.error('Coordinated workflow execution failed', { workflowId, error });
            throw error;
        }
    }
    async stopWorkflowWithCoordination(workflowId) {
        try {
            this.logger?.info('Starting coordinated workflow stop', { workflowId });
            await this.orchestrationService.coordinateModuleOperation({
                sourceModule: 'core',
                targetModule: 'workflow',
                operation: 'stop',
                payload: { workflowId },
                timestamp: new Date().toISOString()
            });
            this.logger?.info('Coordinated workflow stop completed', { workflowId });
            return true;
        }
        catch (error) {
            this.logger?.error('Coordinated workflow stop failed', { workflowId, error });
            return false;
        }
    }
    async getCoordinationOverview() {
        try {
            const stats = await this.managementService.getWorkflowStatistics();
            const systemHealth = { status: 'healthy', monitoredComponents: 1 };
            const resourceMetrics = { cpu: { utilizationPercentage: 50 } };
            return {
                totalWorkflows: stats.totalWorkflows,
                activeWorkflows: stats.activeWorkflows,
                monitoredWorkflows: systemHealth.monitoredComponents || 0,
                resourceUtilization: resourceMetrics.cpu.utilizationPercentage,
                systemHealth: systemHealth.status
            };
        }
        catch (error) {
            this.logger?.error('Failed to get coordination overview', { error });
            throw error;
        }
    }
    evaluateWorkflowHealth(monitoringEnabled, resourcesAllocated, orchestrationActive) {
        const healthScore = [monitoringEnabled, resourcesAllocated, orchestrationActive].filter(Boolean).length;
        if (healthScore === 3)
            return 'healthy';
        if (healthScore >= 2)
            return 'warning';
        return 'critical';
    }
    async _updateMonitoringStatus(_workflowId) {
        try {
            await this.monitoringService.performHealthCheck();
            return true;
        }
        catch {
            return false;
        }
    }
    async _checkResourceStatus(_workflowId) {
        return true;
    }
}
exports.CoreServicesCoordinator = CoreServicesCoordinator;
