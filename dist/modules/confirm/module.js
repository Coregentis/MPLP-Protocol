"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmModuleInfo = void 0;
exports.initializeConfirmModule = initializeConfirmModule;
exports.quickInitializeConfirmModule = quickInitializeConfirmModule;
exports.developmentInitializeConfirmModule = developmentInitializeConfirmModule;
exports.productionInitializeConfirmModule = productionInitializeConfirmModule;
exports.testInitializeConfirmModule = testInitializeConfirmModule;
exports.getConfirmModuleInfo = getConfirmModuleInfo;
exports.validateConfirmModuleOptions = validateConfirmModuleOptions;
const confirm_module_adapter_1 = require("./infrastructure/adapters/confirm-module.adapter");
async function initializeConfirmModule(options = {}) {
    try {
        const adapterConfig = {
            enableLogging: options.enableLogging ?? true,
            enableCaching: options.enableCaching ?? false,
            enableMetrics: options.enableMetrics ?? false,
            repositoryType: options.repositoryType ?? 'memory',
            maxCacheSize: options.maxCacheSize ?? 1000,
            cacheTimeout: options.cacheTimeout ?? 300000
        };
        const confirmModuleAdapter = new confirm_module_adapter_1.ConfirmModuleAdapter(adapterConfig);
        await new Promise(resolve => setTimeout(resolve, 100));
        const confirmController = confirmModuleAdapter.getController();
        const confirmManagementService = confirmModuleAdapter.getService();
        const confirmRepository = confirmModuleAdapter.getRepository();
        const healthCheck = async () => {
            return await confirmModuleAdapter.healthCheck();
        };
        const shutdown = async () => {
            await confirmModuleAdapter.shutdown();
        };
        const getStatistics = () => {
            return confirmModuleAdapter.getStatistics();
        };
        if (adapterConfig.enableLogging) {
            void 'Confirm module initialized successfully';
            void adapterConfig;
        }
        return {
            confirmController,
            confirmManagementService,
            confirmRepository,
            confirmModuleAdapter,
            healthCheck,
            shutdown,
            getStatistics
        };
    }
    catch (error) {
        const errorMessage = `Failed to initialize Confirm module: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (options.enableLogging !== false) {
            void errorMessage;
        }
        throw new Error(errorMessage);
    }
}
async function quickInitializeConfirmModule() {
    return await initializeConfirmModule({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
    });
}
async function developmentInitializeConfirmModule() {
    return await initializeConfirmModule({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'memory',
        maxCacheSize: 500,
        cacheTimeout: 60000
    });
}
async function productionInitializeConfirmModule() {
    return await initializeConfirmModule({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'database',
        maxCacheSize: 10000,
        cacheTimeout: 300000
    });
}
async function testInitializeConfirmModule() {
    return await initializeConfirmModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
    });
}
exports.ConfirmModuleInfo = {
    name: 'Confirm',
    version: '1.0.0',
    description: 'MPLP Confirm Module - Multi-Agent Protocol Lifecycle Platform Approval Workflow Management',
    author: 'MPLP Team',
    license: 'MIT',
    dependencies: {
        'typescript': '^5.0.0'
    },
    features: [
        'Enterprise approval workflow management',
        'Risk assessment and compliance tracking',
        'Multi-step approval processes',
        'Delegation and escalation support',
        'Audit trail and compliance reporting',
        'Decision support and AI integration',
        'Performance monitoring and analytics',
        'Event-driven architecture',
        'Cross-cutting concerns integration',
        'Protocol-based communication'
    ],
    capabilities: [
        'approval_workflow_management',
        'risk_assessment',
        'compliance_tracking',
        'audit_trail',
        'decision_support',
        'escalation_management',
        'notification_system',
        'performance_monitoring',
        'ai_integration'
    ],
    supportedOperations: [
        'create',
        'approve',
        'reject',
        'delegate',
        'escalate',
        'update',
        'delete',
        'get',
        'list',
        'query'
    ],
    crossCuttingConcerns: [
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
function getConfirmModuleInfo() {
    return exports.ConfirmModuleInfo;
}
function validateConfirmModuleOptions(options) {
    const errors = [];
    if (options.repositoryType && !['memory', 'database', 'file'].includes(options.repositoryType)) {
        errors.push('Invalid repository type. Must be one of: memory, database, file');
    }
    if (options.maxCacheSize && options.maxCacheSize <= 0) {
        errors.push('Max cache size must be greater than 0');
    }
    if (options.cacheTimeout && options.cacheTimeout <= 0) {
        errors.push('Cache timeout must be greater than 0');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
