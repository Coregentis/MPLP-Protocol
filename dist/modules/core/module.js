"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CORE_MODULE_CONFIG = void 0;
exports.initializeCoreModule = initializeCoreModule;
exports.createCoreModuleConfig = createCoreModuleConfig;
exports.validateCoreModuleConfig = validateCoreModuleConfig;
exports.quickInitializeCoreModule = quickInitializeCoreModule;
exports.initializeCoreModuleForDevelopment = initializeCoreModuleForDevelopment;
exports.initializeCoreModuleForProduction = initializeCoreModuleForProduction;
exports.initializeCoreModuleForTesting = initializeCoreModuleForTesting;
const core_module_adapter_1 = require("./infrastructure/adapters/core-module.adapter");
const core_controller_1 = require("./api/controllers/core.controller");
async function initializeCoreModule(options = {}) {
    const adapterConfig = {
        enableLogging: options.enableLogging ?? true,
        enableCaching: options.enableCaching ?? false,
        enableMetrics: options.enableMetrics ?? false,
        repositoryType: options.repositoryType ?? 'memory',
        maxCacheSize: options.maxCacheSize ?? 1000,
        cacheTimeout: options.cacheTimeout ?? 300000,
        enableCoordination: options.enableCoordination ?? true,
        enableReservedInterfaces: options.enableReservedInterfaces ?? true
    };
    const moduleAdapter = new core_module_adapter_1.CoreModuleAdapter(adapterConfig);
    await new Promise(resolve => setTimeout(resolve, 100));
    const components = moduleAdapter.getComponents();
    const coreController = new core_controller_1.CoreController(components.managementService, components.orchestrationService, components.resourceService, components.monitoringService);
    const healthCheck = async () => {
        return await moduleAdapter.getHealthStatus();
    };
    const shutdown = async () => {
        if (adapterConfig.enableLogging) {
            console.log('Shutting down Core module...');
        }
    };
    const getStatistics = async () => {
        const stats = await components.managementService.getWorkflowStatistics();
        return {
            ...stats,
            resourceUtilization: 50
        };
    };
    const getModuleInfo = () => {
        return moduleAdapter.getModuleInfo();
    };
    return {
        coreController,
        managementService: components.managementService,
        monitoringService: components.monitoringService,
        orchestrationService: components.orchestrationService,
        resourceService: components.resourceService,
        reservedInterfacesService: components.reservedInterfacesService,
        coordinator: components.coordinator,
        repository: components.repository,
        protocol: components.protocol,
        moduleAdapter,
        healthCheck,
        shutdown,
        getStatistics,
        getModuleInfo
    };
}
function createCoreModuleConfig(preset) {
    switch (preset) {
        case 'development':
            return {
                enableLogging: true,
                enableCaching: false,
                enableMetrics: true,
                repositoryType: 'memory',
                enableCoordination: true,
                enableReservedInterfaces: true
            };
        case 'production':
            return {
                enableLogging: true,
                enableCaching: true,
                enableMetrics: true,
                repositoryType: 'database',
                maxCacheSize: 10000,
                cacheTimeout: 600000,
                enableCoordination: true,
                enableReservedInterfaces: true
            };
        case 'testing':
            return {
                enableLogging: false,
                enableCaching: false,
                enableMetrics: false,
                repositoryType: 'memory',
                enableCoordination: false,
                enableReservedInterfaces: false
            };
        default:
            throw new Error(`Unknown preset: ${preset}`);
    }
}
function validateCoreModuleConfig(options) {
    const errors = [];
    const warnings = [];
    if (options.repositoryType && !['memory', 'database', 'file'].includes(options.repositoryType)) {
        errors.push(`Invalid repository type: ${options.repositoryType}`);
    }
    if (options.enableCaching && options.maxCacheSize && options.maxCacheSize < 100) {
        warnings.push('Cache size is very small, consider increasing it for better performance');
    }
    if (options.cacheTimeout && options.cacheTimeout < 60000) {
        warnings.push('Cache timeout is very short, consider increasing it');
    }
    if (options.repositoryType === 'database' && !options.dataSource) {
        warnings.push('Database repository selected but no data source provided');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
exports.DEFAULT_CORE_MODULE_CONFIG = {
    enableLogging: true,
    enableCaching: false,
    enableMetrics: false,
    repositoryType: 'memory',
    maxCacheSize: 1000,
    cacheTimeout: 300000,
    enableCoordination: true,
    enableReservedInterfaces: true
};
async function quickInitializeCoreModule() {
    return await initializeCoreModule(exports.DEFAULT_CORE_MODULE_CONFIG);
}
async function initializeCoreModuleForDevelopment() {
    return await initializeCoreModule(createCoreModuleConfig('development'));
}
async function initializeCoreModuleForProduction(dataSource) {
    const config = createCoreModuleConfig('production');
    if (dataSource) {
        config.dataSource = dataSource;
    }
    return await initializeCoreModule(config);
}
async function initializeCoreModuleForTesting() {
    return await initializeCoreModule(createCoreModuleConfig('testing'));
}
