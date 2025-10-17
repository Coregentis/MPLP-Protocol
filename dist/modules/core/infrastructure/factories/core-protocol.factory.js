"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreProtocolFactory = void 0;
const core_protocol_1 = require("../protocols/core.protocol");
const core_repository_1 = require("../repositories/core.repository");
const core_management_service_1 = require("../../application/services/core-management.service");
const core_monitoring_service_1 = require("../../application/services/core-monitoring.service");
const core_orchestration_service_1 = require("../../application/services/core-orchestration.service");
const core_resource_service_1 = require("../../application/services/core-resource.service");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class CoreProtocolFactory {
    static instance;
    crossCuttingFactory;
    constructor() {
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
    }
    static getInstance() {
        if (!CoreProtocolFactory.instance) {
            CoreProtocolFactory.instance = new CoreProtocolFactory();
        }
        return CoreProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        const repository = config.customRepository || this.createRepository(config.repositoryType || 'memory');
        const managementService = new core_management_service_1.CoreManagementService(repository);
        const monitoringService = new core_monitoring_service_1.CoreMonitoringService(repository);
        const orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(repository);
        const resourceService = new core_resource_service_1.CoreResourceService(repository);
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    async createProtocolWithServices(managementService, monitoringService, orchestrationService, resourceService, repository, config = {}) {
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    async createLightweightProtocol(config = {}) {
        const repository = new core_repository_1.MemoryCoreRepository();
        const managementService = new core_management_service_1.CoreManagementService(repository);
        const monitoringService = new core_monitoring_service_1.CoreMonitoringService(repository);
        const orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(repository);
        const resourceService = new core_resource_service_1.CoreResourceService(repository);
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: false },
            performance: { enabled: false },
            eventBus: { enabled: false },
            errorHandler: { enabled: true },
            coordination: { enabled: false },
            orchestration: { enabled: false },
            stateSync: { enabled: false },
            transaction: { enabled: false },
            protocolVersion: { enabled: true }
        });
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
            errors.push(`Invalid repository type: ${config.repositoryType}`);
        }
        if (config.customRepository && config.repositoryType) {
            warnings.push('Both customRepository and repositoryType provided. customRepository will be used.');
        }
        if (config.enableCaching && !config.enableMetrics) {
            warnings.push('Caching enabled without metrics. Consider enabling metrics for better monitoring.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    getSupportedRepositoryTypes() {
        return ['memory', 'database', 'file'];
    }
    getDefaultConfig() {
        return {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory'
        };
    }
    createRepository(type) {
        switch (type) {
            case 'memory':
                return new core_repository_1.MemoryCoreRepository();
            case 'database':
                throw new Error('Database repository not implemented yet');
            case 'file':
                throw new Error('File repository not implemented yet');
            default:
                throw new Error(`Unsupported repository type: ${type}`);
        }
    }
    static resetInstance() {
        CoreProtocolFactory.instance = undefined;
    }
}
exports.CoreProtocolFactory = CoreProtocolFactory;
