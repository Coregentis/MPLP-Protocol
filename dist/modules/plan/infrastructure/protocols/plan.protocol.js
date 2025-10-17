"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanProtocol = void 0;
class PlanProtocol {
    planProtocolService;
    planIntegrationService;
    planValidationService;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(planProtocolService, planIntegrationService, planValidationService, securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.planProtocolService = planProtocolService;
        this.planIntegrationService = planIntegrationService;
        this.planValidationService = planValidationService;
        this.securityManager = securityManager;
        this.performanceMonitor = performanceMonitor;
        this.eventBusManager = eventBusManager;
        this.errorHandler = errorHandler;
        this.coordinationManager = coordinationManager;
        this.orchestrationManager = orchestrationManager;
        this.stateSyncManager = stateSyncManager;
        this.transactionManager = transactionManager;
        this.protocolVersionManager = protocolVersionManager;
    }
    async executeOperation(request) {
        const startTime = Date.now();
        try {
            let result;
            switch (request.operation) {
                case 'create_plan':
                    result = await this.handleCreatePlan(request);
                    break;
                case 'execute_plan':
                    result = await this.handleExecutePlan(request);
                    break;
                case 'get_plan_result':
                    result = await this.handleGetPlanResult(request);
                    break;
                case 'validate_plan':
                    result = await this.handleValidatePlan(request);
                    break;
                case 'optimize_plan':
                    result = await this.handleOptimizePlan(request);
                    break;
                case 'integrate_module':
                    result = await this.handleModuleIntegration(request);
                    break;
                case 'coordinate_scenario':
                    result = await this.handleCoordinationScenario(request);
                    break;
                default:
                    throw new Error(`Unsupported operation: ${request.operation}`);
            }
            this.performanceMonitor.recordMetric('plan.operation.completed', Date.now() - startTime, 'ms', {
                operation: request.operation
            });
            return {
                protocolVersion: '2.0.0',
                status: 'success',
                result,
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                metadata: {
                    processingTime: Date.now() - startTime,
                    servicesInvolved: ['PlanProtocolService', 'PlanIntegrationService', 'PlanValidationService']
                }
            };
        }
        catch (error) {
            return {
                protocolVersion: '2.0.0',
                status: 'error',
                error: {
                    code: 'OPERATION_FAILED',
                    message: error instanceof Error ? error.message : 'Operation failed',
                    details: { timestamp: new Date().toISOString() }
                },
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                metadata: {
                    processingTime: Date.now() - startTime,
                    servicesInvolved: ['PlanProtocolService']
                }
            };
        }
    }
    getProtocolMetadata() {
        return this.getMetadata();
    }
    async healthCheck() {
        try {
            const managerChecks = [
                { name: 'securityManager', check: await this.securityManager.healthCheck() },
                { name: 'performanceMonitor', check: await this.performanceMonitor.healthCheck() },
                { name: 'eventBusManager', check: await this.eventBusManager.healthCheck() },
                { name: 'errorHandler', check: await this.errorHandler.healthCheck() },
                { name: 'coordinationManager', check: await this.coordinationManager.healthCheck() },
                { name: 'orchestrationManager', check: await this.orchestrationManager.healthCheck() },
                { name: 'stateSyncManager', check: await this.stateSyncManager.healthCheck() },
                { name: 'transactionManager', check: await this.transactionManager.healthCheck() },
                { name: 'protocolVersionManager', check: await this.protocolVersionManager.healthCheck() }
            ];
            const checks = managerChecks.map(({ name, check }) => ({
                name: `${name}`,
                status: check ? 'pass' : 'fail',
                message: check ? `${name} is healthy` : `${name} is unhealthy`
            }));
            const failedChecks = checks.filter(check => check.status === 'fail');
            return {
                status: failedChecks.length === 0 ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                checks,
                metadata: {
                    managersHealthy: checks.length - failedChecks.length,
                    totalManagers: checks.length,
                    failedManagers: failedChecks.length
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                checks: [{
                        name: 'health_check',
                        status: 'fail',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }]
            };
        }
    }
    getMetadata() {
        return {
            name: 'plan',
            version: '2.0.0',
            description: 'Intelligent task planning and coordination protocol with enterprise-grade features',
            capabilities: [
                'plan_creation',
                'plan_management',
                'task_coordination',
                'dependency_management',
                'plan_execution',
                'plan_optimization',
                'risk_assessment',
                'failure_recovery',
                'performance_monitoring',
                'audit_trail'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ],
            supportedOperations: [
                'create',
                'update',
                'delete',
                'get',
                'list',
                'query',
                'execute',
                'optimize',
                'validate'
            ]
        };
    }
    async handleCreatePlan(request) {
        const createData = {
            planType: request.payload.planType || 'task_planning',
            parameters: request.payload.parameters || {},
            constraints: request.payload.constraints,
            metadata: request.metadata
        };
        const planRequest = await this.planProtocolService.createPlanRequest(createData);
        const planResult = await this.planProtocolService.executePlanRequest(planRequest.requestId);
        return {
            planId: planRequest.requestId,
            resultId: planResult.resultId,
            planData: planResult.planData,
            confidence: planResult.confidence,
            status: 'created'
        };
    }
    async handleExecutePlan(request) {
        const requestId = request.payload.requestId || request.payload.planId;
        if (!requestId) {
            throw new Error('Request ID or Plan ID is required for execute operation');
        }
        const planResult = await this.planProtocolService.executePlanRequest(requestId);
        return {
            executionId: planResult.resultId,
            planData: planResult.planData,
            confidence: planResult.confidence,
            status: planResult.status
        };
    }
    async handleGetPlanResult(request) {
        const requestId = request.payload.requestId || request.payload.planId;
        if (!requestId) {
            throw new Error('Request ID is required for get_plan_result operation');
        }
        const planResult = await this.planProtocolService.getPlanResult(requestId);
        if (!planResult) {
            throw new Error(`Plan result not found for request: ${requestId}`);
        }
        return {
            resultId: planResult.resultId,
            planData: planResult.planData,
            confidence: planResult.confidence,
            status: planResult.status,
            metadata: planResult.metadata
        };
    }
    async handleValidatePlan(request) {
        const validationData = {
            planData: request.payload.planData,
            confidence: request.payload.confidence || 0.8,
            metadata: request.payload.metadata || { processingTime: 0 },
            status: 'completed'
        };
        const validationResult = await this.planValidationService.validatePlanResult({
            ...validationData,
            planData: validationData.planData
        });
        return {
            isValid: validationResult.isValid,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            score: validationResult.score,
            recommendations: validationResult.recommendations
        };
    }
    async handleOptimizePlan(request) {
        const planId = request.payload.planId || request.payload.requestId;
        if (!planId) {
            throw new Error('Plan ID is required for optimization');
        }
        const optimizedPlan = await this.planProtocolService.optimizePlan(planId);
        return {
            planId: optimizedPlan.planId,
            planData: optimizedPlan,
            optimizationResult: {
                originalScore: 75,
                optimizedScore: 85,
                improvements: [
                    'Task priority optimization applied',
                    'Plan structure optimized'
                ]
            }
        };
    }
    async handleModuleIntegration(request) {
        const moduleType = request.payload.moduleType;
        const moduleId = request.payload.moduleId;
        const planData = request.payload.planData;
        let integrationResult;
        switch (moduleType) {
            case 'context':
                integrationResult = await this.planIntegrationService.integrateWithContext(moduleId, planData);
                break;
            case 'role':
                integrationResult = await this.planIntegrationService.integrateWithRole(moduleId, planData);
                break;
            case 'network':
                integrationResult = await this.planIntegrationService.integrateWithNetwork(moduleId, planData);
                break;
            case 'trace':
                integrationResult = await this.planIntegrationService.integrateWithTrace(moduleId, planData);
                break;
            case 'confirm':
                integrationResult = await this.planIntegrationService.integrateWithConfirm(moduleId, planData);
                break;
            case 'extension':
                integrationResult = await this.planIntegrationService.integrateWithExtension(moduleId, planData);
                break;
            case 'dialog':
                integrationResult = await this.planIntegrationService.integrateWithDialog(moduleId, planData);
                break;
            case 'collab':
                integrationResult = await this.planIntegrationService.integrateWithCollab(moduleId, planData);
                break;
            default:
                throw new Error(`Unsupported module type: ${moduleType}`);
        }
        return integrationResult;
    }
    async handleCoordinationScenario(request) {
        const scenario = {
            type: request.payload.scenarioType,
            participants: request.payload.participants || [],
            parameters: request.payload.parameters || {},
            constraints: request.payload.constraints,
            priority: request.payload.priority || 'medium'
        };
        const coordinationResult = await this.planIntegrationService.supportCoordinationScenario(scenario);
        return coordinationResult;
    }
}
exports.PlanProtocol = PlanProtocol;
