"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModuleAdapter = void 0;
const core_repository_1 = require("../repositories/core.repository");
const core_management_service_1 = require("../../application/services/core-management.service");
const core_monitoring_service_1 = require("../../application/services/core-monitoring.service");
const core_orchestration_service_1 = require("../../application/services/core-orchestration.service");
const core_resource_service_1 = require("../../application/services/core-resource.service");
const core_reserved_interfaces_service_1 = require("../../application/services/core-reserved-interfaces.service");
const core_services_coordinator_1 = require("../../application/coordinators/core-services-coordinator");
const core_protocol_factory_1 = require("../factories/core-protocol.factory");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class CoreModuleAdapter {
    config;
    initialized = false;
    repository;
    managementService;
    monitoringService;
    orchestrationService;
    resourceService;
    reservedInterfacesService;
    coordinator;
    protocol;
    crossCuttingFactory;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(config = {}) {
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000,
            enableCoordination: true,
            enableReservedInterfaces: true,
            ...config
        };
        this.initialize();
    }
    async initialize() {
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: this.config.enableMetrics },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: this.config.enableCoordination },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        this.securityManager = managers.security;
        this.performanceMonitor = managers.performance;
        this.eventBusManager = managers.eventBus;
        this.errorHandler = managers.errorHandler;
        this.coordinationManager = managers.coordination;
        this.orchestrationManager = managers.orchestration;
        this.stateSyncManager = managers.stateSync;
        this.transactionManager = managers.transaction;
        this.protocolVersionManager = managers.protocolVersion;
        this.repository = new core_repository_1.MemoryCoreRepository();
        this.managementService = new core_management_service_1.CoreManagementService(this.repository);
        this.monitoringService = new core_monitoring_service_1.CoreMonitoringService(this.repository);
        this.orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(this.repository);
        this.resourceService = new core_resource_service_1.CoreResourceService(this.repository);
        if (this.config.enableReservedInterfaces) {
            this.reservedInterfacesService = new core_reserved_interfaces_service_1.CoreReservedInterfacesService();
        }
        if (this.config.enableCoordination) {
            this.coordinator = new core_services_coordinator_1.CoreServicesCoordinator(this.managementService, this.monitoringService, this.orchestrationService, this.resourceService, this.repository, this.config.enableLogging ? console : undefined);
        }
        await this.initializeProtocol();
    }
    async initializeProtocol() {
        const protocolFactory = core_protocol_factory_1.CoreProtocolFactory.getInstance();
        this.protocol = await protocolFactory.createProtocol({
            enableLogging: this.config.enableLogging,
            enableCaching: this.config.enableCaching,
            enableMetrics: this.config.enableMetrics,
            repositoryType: this.config.repositoryType
        });
        this.initialized = true;
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('CoreModuleAdapter not initialized. Please wait for initialization to complete.');
        }
    }
    getComponents() {
        this.ensureInitialized();
        return {
            repository: this.repository,
            managementService: this.managementService,
            monitoringService: this.monitoringService,
            orchestrationService: this.orchestrationService,
            resourceService: this.resourceService,
            reservedInterfacesService: this.reservedInterfacesService,
            coordinator: this.coordinator,
            protocol: this.protocol,
            adapter: this
        };
    }
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    getManagementService() {
        this.ensureInitialized();
        return this.managementService;
    }
    getCoordinator() {
        this.ensureInitialized();
        if (!this.coordinator) {
            throw new Error('Coordinator not enabled. Set enableCoordination: true in config.');
        }
        return this.coordinator;
    }
    getReservedInterfacesService() {
        this.ensureInitialized();
        if (!this.reservedInterfacesService) {
            throw new Error('Reserved interfaces not enabled. Set enableReservedInterfaces: true in config.');
        }
        return this.reservedInterfacesService;
    }
    getProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    async createWorkflow(data) {
        this.ensureInitialized();
        return await this.managementService.createWorkflow(data);
    }
    async createWorkflowWithCoordination(params) {
        this.ensureInitialized();
        if (!this.coordinator) {
            throw new Error('Coordinator not enabled');
        }
        return await this.coordinator.createWorkflowWithFullCoordination(params);
    }
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        try {
            this.ensureInitialized();
            const components = {
                repository: await this.checkRepositoryHealth(),
                managementService: true,
                monitoringService: true,
                orchestrationService: true,
                resourceService: true,
                coordinator: !!this.coordinator,
                protocol: !!this.protocol,
                crossCuttingConcerns: !!this.crossCuttingFactory
            };
            const healthyCount = Object.values(components).filter(Boolean).length;
            const totalCount = Object.keys(components).length;
            let status;
            if (healthyCount === totalCount) {
                status = 'healthy';
            }
            else if (healthyCount > totalCount / 2) {
                status = 'degraded';
            }
            else {
                status = 'unhealthy';
            }
            return {
                status,
                components,
                timestamp
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                components: {
                    repository: false,
                    managementService: false,
                    monitoringService: false,
                    orchestrationService: false,
                    resourceService: false,
                    coordinator: false,
                    protocol: false,
                    crossCuttingConcerns: false
                },
                timestamp
            };
        }
    }
    getModuleInfo() {
        return {
            name: 'core',
            version: '1.0.0',
            description: 'MPLP核心工作流协调和执行模块',
            layer: 'L2',
            status: 'implementing',
            features: [
                '工作流管理',
                '执行协调',
                '资源管理',
                '性能监控',
                '模块协作',
                '预留接口',
                '服务协调',
                '审计追踪',
                '版本历史',
                '搜索索引',
                '缓存策略',
                '事件集成'
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
            ]
        };
    }
    async checkRepositoryHealth() {
        try {
            await this.repository.count();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CoreModuleAdapter = CoreModuleAdapter;
