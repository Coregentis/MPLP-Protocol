"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextModuleInfo = exports.ContextModuleFactory = exports.ContextModulePresets = void 0;
exports.initializeContextModule = initializeContextModule;
const context_module_adapter_1 = require("./infrastructure/adapters/context-module.adapter");
async function initializeContextModule(options = {}) {
    try {
        const adapterConfig = {
            enableLogging: options.enableLogging ?? true,
            enableCaching: options.enableCaching ?? false,
            enableMetrics: options.enableMetrics ?? false,
            repositoryType: options.repositoryType ?? 'memory',
            maxCacheSize: options.maxCacheSize ?? 1000,
            cacheTimeout: options.cacheTimeout ?? 300000
        };
        const contextModuleAdapter = new context_module_adapter_1.ContextModuleAdapter(adapterConfig);
        await contextModuleAdapter.initialize();
        const contextController = contextModuleAdapter.getController();
        const contextManagementService = contextModuleAdapter.getService();
        const contextRepository = contextModuleAdapter.getRepository();
        const healthCheck = async () => {
            const health = await contextModuleAdapter.healthCheck();
            return health.status === 'healthy';
        };
        const shutdown = async () => {
            await contextModuleAdapter.shutdown();
        };
        const getStatistics = async () => {
            return await contextModuleAdapter.getStatistics();
        };
        if (adapterConfig.enableLogging) {
            void 'Context module initialized successfully';
            void adapterConfig;
        }
        return {
            contextController,
            contextManagementService,
            contextRepository,
            contextModuleAdapter,
            healthCheck,
            shutdown,
            getStatistics
        };
    }
    catch (error) {
        const errorMessage = `Failed to initialize Context module: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (options.enableLogging !== false) {
            void errorMessage;
        }
        throw new Error(errorMessage);
    }
}
exports.ContextModulePresets = {
    development: () => ({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        repositoryType: 'memory',
        maxCacheSize: 100,
        cacheTimeout: 60000
    }),
    testing: () => ({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory',
        maxCacheSize: 50,
        cacheTimeout: 30000
    }),
    production: () => ({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'database',
        maxCacheSize: 10000,
        cacheTimeout: 600000
    }),
    highPerformance: () => ({
        enableLogging: false,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'memory',
        maxCacheSize: 50000,
        cacheTimeout: 1800000
    })
};
class ContextModuleFactory {
    static async createForDevelopment() {
        return await initializeContextModule(exports.ContextModulePresets.development());
    }
    static async createForTesting() {
        return await initializeContextModule(exports.ContextModulePresets.testing());
    }
    static async createForProduction() {
        return await initializeContextModule(exports.ContextModulePresets.production());
    }
    static async createForHighPerformance() {
        return await initializeContextModule(exports.ContextModulePresets.highPerformance());
    }
    static async createWithCustomConfig(options) {
        return await initializeContextModule(options);
    }
}
exports.ContextModuleFactory = ContextModuleFactory;
exports.default = initializeContextModule;
exports.ContextModuleInfo = {
    name: 'Context',
    version: '1.0.0',
    description: 'MPLP Context Module - Multi-Agent Protocol Lifecycle Platform Context Management',
    author: 'MPLP Team',
    license: 'MIT',
    dependencies: {
        'typescript': '^5.0.0'
    },
    features: [
        'Context lifecycle management',
        'Shared state management',
        'Access control and permissions',
        'Audit trail and compliance',
        'Performance monitoring',
        'Version history',
        'Search and indexing',
        'Caching and synchronization',
        'Error handling and recovery',
        'Integration endpoints',
        'Event-driven architecture'
    ],
    architecture: {
        layer: 'L2 Coordination Layer',
        pattern: 'Domain-Driven Design (DDD)',
        concerns: [
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
    }
};
