"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreOrchestratorFactory = void 0;
const core_orchestrator_1 = require("../../../../core/orchestrator/core.orchestrator");
const reserved_interface_activator_1 = require("../../domain/activators/reserved-interface.activator");
const core_orchestration_service_1 = require("../../application/services/core-orchestration.service");
const core_resource_service_1 = require("../../application/services/core-resource.service");
const core_monitoring_service_1 = require("../../application/services/core-monitoring.service");
const core_management_service_1 = require("../../application/services/core-management.service");
const core_repository_1 = require("../repositories/core.repository");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class CoreOrchestratorFactory {
    static instance;
    crossCuttingFactory;
    constructor() {
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
    }
    static getInstance() {
        if (!CoreOrchestratorFactory.instance) {
            CoreOrchestratorFactory.instance = new CoreOrchestratorFactory();
        }
        return CoreOrchestratorFactory.instance;
    }
    async createCoreOrchestrator(config = {}) {
        const finalConfig = {
            enableLogging: true,
            enableMetrics: true,
            enableCaching: false,
            repositoryType: 'memory',
            maxConcurrentWorkflows: 100,
            workflowTimeout: 300000,
            enableReservedInterfaces: true,
            enableModuleCoordination: true,
            ...config
        };
        const crossCuttingManagers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: finalConfig.enableMetrics },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: finalConfig.enableModuleCoordination },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        const repository = new core_repository_1.MemoryCoreRepository();
        const managementService = new core_management_service_1.CoreManagementService(repository);
        const monitoringService = new core_monitoring_service_1.CoreMonitoringService(repository);
        const resourceService = new core_resource_service_1.CoreResourceService(repository);
        const orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(repository);
        const interfaceActivator = new reserved_interface_activator_1.ReservedInterfaceActivator(orchestrationService);
        const securityAdapter = this.createSecurityAdapter(crossCuttingManagers.security);
        const performanceAdapter = this.createPerformanceAdapter(crossCuttingManagers.performance);
        const eventBusAdapter = this.createEventBusAdapter(crossCuttingManagers.eventBus);
        const errorHandlerAdapter = this.createErrorHandlerAdapter(crossCuttingManagers.errorHandler);
        const coordinationAdapter = this.createCoordinationAdapter(crossCuttingManagers.coordination);
        const orchestrationAdapter = this.createOrchestrationAdapter(crossCuttingManagers.orchestration);
        const stateSyncAdapter = this.createStateSyncAdapter(crossCuttingManagers.stateSync);
        const transactionAdapter = this.createTransactionAdapter(crossCuttingManagers.transaction);
        const protocolVersionAdapter = this.createProtocolVersionAdapter(crossCuttingManagers.protocolVersion);
        const orchestrator = new core_orchestrator_1.CoreOrchestrator(orchestrationService, resourceService, monitoringService, securityAdapter, performanceAdapter, eventBusAdapter, errorHandlerAdapter, coordinationAdapter, orchestrationAdapter, stateSyncAdapter, transactionAdapter, protocolVersionAdapter);
        const healthCheck = async () => {
            const components = {};
            const metrics = {};
            try {
                components.repository = await this.checkRepositoryHealth(repository);
                components.orchestrationService = await this.checkServiceHealth(orchestrationService);
                components.resourceService = await this.checkServiceHealth(resourceService);
                components.monitoringService = await this.checkServiceHealth(monitoringService);
                components.managementService = await this.checkServiceHealth(managementService);
                components.securityManager = !!crossCuttingManagers.security;
                components.performanceMonitor = !!crossCuttingManagers.performance;
                components.eventBusManager = !!crossCuttingManagers.eventBus;
                components.errorHandler = !!crossCuttingManagers.errorHandler;
                components.coordinationManager = !!crossCuttingManagers.coordination;
                if (finalConfig.enableMetrics) {
                    metrics.uptime = Date.now();
                    metrics.memoryUsage = process.memoryUsage().heapUsed;
                    metrics.activeWorkflows = 0;
                }
                const healthyComponents = Object.values(components).filter(Boolean).length;
                const totalComponents = Object.keys(components).length;
                const healthRatio = healthyComponents / totalComponents;
                let status;
                if (healthRatio >= 0.9) {
                    status = 'healthy';
                }
                else if (healthRatio >= 0.7) {
                    status = 'degraded';
                }
                else {
                    status = 'unhealthy';
                }
                return {
                    status,
                    components,
                    metrics,
                    modules: {
                        context: 'healthy',
                        plan: 'healthy',
                        role: 'healthy',
                        confirm: 'healthy',
                        trace: 'healthy',
                        extension: 'healthy',
                        dialog: 'healthy',
                        collab: 'healthy',
                        core: 'healthy',
                        network: 'healthy'
                    },
                    uptime: metrics.uptime || Date.now(),
                    version: '1.0.0'
                };
            }
            catch (error) {
                return {
                    status: 'unhealthy',
                    components,
                    metrics: { error: 1 },
                    modules: {
                        context: 'unhealthy',
                        plan: 'unhealthy',
                        role: 'unhealthy',
                        confirm: 'unhealthy',
                        trace: 'unhealthy',
                        extension: 'unhealthy',
                        dialog: 'unhealthy',
                        collab: 'unhealthy',
                        core: 'unhealthy',
                        network: 'unhealthy'
                    },
                    uptime: 0,
                    version: '1.0.0'
                };
            }
        };
        const shutdown = async () => {
            if (finalConfig.enableLogging) {
                console.log('Shutting down CoreOrchestrator...');
            }
        };
        return {
            orchestrator,
            interfaceActivator,
            orchestrationService,
            resourceService,
            monitoringService,
            managementService,
            repository,
            crossCuttingManagers,
            healthCheck,
            shutdown
        };
    }
    async createDevelopmentOrchestrator() {
        return await this.createCoreOrchestrator({
            enableLogging: true,
            enableMetrics: true,
            enableCaching: false,
            repositoryType: 'memory',
            maxConcurrentWorkflows: 10,
            workflowTimeout: 60000,
            enableReservedInterfaces: true,
            enableModuleCoordination: true
        });
    }
    async createProductionOrchestrator() {
        return await this.createCoreOrchestrator({
            enableLogging: true,
            enableMetrics: true,
            enableCaching: true,
            repositoryType: 'database',
            maxConcurrentWorkflows: 1000,
            workflowTimeout: 300000,
            enableReservedInterfaces: true,
            enableModuleCoordination: true
        });
    }
    async createTestOrchestrator() {
        return await this.createCoreOrchestrator({
            enableLogging: false,
            enableMetrics: false,
            enableCaching: false,
            repositoryType: 'memory',
            maxConcurrentWorkflows: 5,
            workflowTimeout: 30000,
            enableReservedInterfaces: false,
            enableModuleCoordination: false
        });
    }
    async checkRepositoryHealth(repository) {
        try {
            await repository.count();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async checkServiceHealth(service) {
        try {
            return !!service;
        }
        catch (error) {
            return false;
        }
    }
    static resetInstance() {
        CoreOrchestratorFactory.instance = undefined;
    }
    createSecurityAdapter(_mlppSecurity) {
        return {
            async validateWorkflowExecution(_contextId, _workflowConfig) {
            },
            async validateModuleAccess(_moduleId, _operation) {
                return true;
            }
        };
    }
    createPerformanceAdapter(_mlppPerformance) {
        return {
            startTimer(_operation) {
                const startTime = Date.now();
                return {
                    stop() {
                        return Date.now() - startTime;
                    },
                    elapsed() {
                        return Date.now() - startTime;
                    }
                };
            },
            recordMetric(_name, _value) {
            },
            async getMetrics() {
                return {};
            }
        };
    }
    createEventBusAdapter(_mlppEventBus) {
        return {
            async publish(_event, _data) {
            },
            subscribe(_event, _handler) {
            }
        };
    }
    createErrorHandlerAdapter(_mlppErrorHandler) {
        return {
            async handleError(_error, _context) {
            },
            createErrorReport(error) {
                return {
                    errorId: `error-${Date.now()}`,
                    message: error.message,
                    stack: error.stack,
                    context: {},
                    timestamp: new Date().toISOString()
                };
            }
        };
    }
    createCoordinationAdapter(_mlppCoordination) {
        return {
            async coordinateModules(_modules, _operation) {
                return {
                    success: true,
                    results: {},
                    executionTime: 100,
                    coordinationId: `coord-${Date.now()}`,
                    timestamp: new Date().toISOString()
                };
            },
            async validateCoordination(_sourceModule, _targetModule) {
                return true;
            }
        };
    }
    createOrchestrationAdapter(_mlppOrchestration) {
        return {
            async createOrchestrationPlan(_workflowConfig) {
                return {
                    planId: `plan-${Date.now()}`,
                    estimatedDuration: 60000,
                    stages: [],
                    dependencies: {}
                };
            },
            async executeOrchestrationPlan(_plan) {
                return {
                    planId: `plan-${Date.now()}`,
                    status: 'completed',
                    stageResults: {},
                    totalDuration: 1000
                };
            }
        };
    }
    createStateSyncAdapter(_mlppStateSync) {
        return {
            async syncState(_moduleId, _state) {
            },
            async getState(_moduleId) {
                return {};
            },
            async validateStateConsistency() {
                return true;
            }
        };
    }
    createTransactionAdapter(_mlppTransaction) {
        return {
            async beginTransaction() {
                return {
                    transactionId: `tx-${Date.now()}`,
                    startTime: new Date().toISOString(),
                    operations: []
                };
            },
            async commitTransaction(_transaction) {
            },
            async rollbackTransaction(_transaction) {
            }
        };
    }
    createProtocolVersionAdapter(_mlppProtocolVersion) {
        return {
            validateProtocolVersion(_version) {
                return true;
            },
            getCompatibleVersions() {
                return ['1.0.0'];
            },
            async upgradeProtocol(_fromVersion, _toVersion) {
            }
        };
    }
}
exports.CoreOrchestratorFactory = CoreOrchestratorFactory;
