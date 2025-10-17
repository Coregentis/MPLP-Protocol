"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CORE_ORCHESTRATOR_CONFIG = void 0;
exports.initializeCoreOrchestrator = initializeCoreOrchestrator;
exports.quickInitializeCoreOrchestrator = quickInitializeCoreOrchestrator;
exports.initializeProductionCoreOrchestrator = initializeProductionCoreOrchestrator;
exports.initializeTestCoreOrchestrator = initializeTestCoreOrchestrator;
exports.createCoreOrchestratorConfig = createCoreOrchestratorConfig;
exports.validateCoreOrchestratorConfig = validateCoreOrchestratorConfig;
const core_orchestrator_factory_1 = require("./infrastructure/factories/core-orchestrator.factory");
async function initializeCoreOrchestrator(options = {}) {
    const factory = core_orchestrator_factory_1.CoreOrchestratorFactory.getInstance();
    let factoryResult;
    if (options.customConfig) {
        factoryResult = await factory.createCoreOrchestrator(options.customConfig);
    }
    else {
        switch (options.environment) {
            case 'production':
                factoryResult = await factory.createProductionOrchestrator();
                break;
            case 'testing':
                factoryResult = await factory.createTestOrchestrator();
                break;
            case 'development':
            default:
                factoryResult = await factory.createDevelopmentOrchestrator();
                break;
        }
    }
    if (options.enableLogging !== undefined || options.enableMetrics !== undefined) {
        const customConfig = {
            enableLogging: options.enableLogging,
            enableMetrics: options.enableMetrics,
            enableCaching: options.enableCaching,
            maxConcurrentWorkflows: options.maxConcurrentWorkflows,
            workflowTimeout: options.workflowTimeout,
            enableReservedInterfaces: options.enableReservedInterfaces,
            enableModuleCoordination: options.enableModuleCoordination
        };
        factoryResult = await factory.createCoreOrchestrator(customConfig);
    }
    const getStatistics = async () => {
        const workflowStats = await factoryResult.managementService.getWorkflowStatistics();
        return {
            activeWorkflows: workflowStats.activeWorkflows,
            completedWorkflows: workflowStats.completedWorkflows,
            failedWorkflows: workflowStats.failedWorkflows,
            averageExecutionTime: workflowStats.averageDuration,
            resourceUtilization: 50,
            moduleCoordinationCount: 0,
            interfaceActivationCount: 0
        };
    };
    const getModuleInfo = () => {
        return {
            name: 'CoreOrchestrator',
            version: '1.0.0',
            description: 'MPLP生态系统中央协调器 - L3执行层核心组件',
            layer: 'L3',
            status: 'active',
            capabilities: [
                '工作流编排',
                '模块协调',
                '预留接口激活',
                '资源管理',
                '性能监控',
                '事务管理',
                '状态同步',
                '事件总线协调',
                '安全验证',
                '错误处理'
            ],
            supportedModules: [
                'context', 'plan', 'role', 'confirm', 'trace',
                'extension', 'dialog', 'collab', 'network'
            ]
        };
    };
    return {
        orchestrator: factoryResult.orchestrator,
        interfaceActivator: factoryResult.interfaceActivator,
        healthCheck: factoryResult.healthCheck,
        shutdown: factoryResult.shutdown,
        getStatistics,
        getModuleInfo
    };
}
async function quickInitializeCoreOrchestrator() {
    return await initializeCoreOrchestrator({
        environment: 'development',
        enableLogging: true,
        enableMetrics: true,
        enableReservedInterfaces: true,
        enableModuleCoordination: true
    });
}
async function initializeProductionCoreOrchestrator() {
    return await initializeCoreOrchestrator({
        environment: 'production',
        enableLogging: true,
        enableMetrics: true,
        enableCaching: true,
        maxConcurrentWorkflows: 1000,
        workflowTimeout: 300000,
        enableReservedInterfaces: true,
        enableModuleCoordination: true
    });
}
async function initializeTestCoreOrchestrator() {
    return await initializeCoreOrchestrator({
        environment: 'testing',
        enableLogging: false,
        enableMetrics: false,
        enableReservedInterfaces: false,
        enableModuleCoordination: false
    });
}
function createCoreOrchestratorConfig(preset) {
    switch (preset) {
        case 'minimal':
            return {
                environment: 'development',
                enableLogging: false,
                enableMetrics: false,
                enableCaching: false,
                maxConcurrentWorkflows: 5,
                workflowTimeout: 30000,
                enableReservedInterfaces: false,
                enableModuleCoordination: false
            };
        case 'standard':
            return {
                environment: 'development',
                enableLogging: true,
                enableMetrics: true,
                enableCaching: false,
                maxConcurrentWorkflows: 50,
                workflowTimeout: 120000,
                enableReservedInterfaces: true,
                enableModuleCoordination: true
            };
        case 'enterprise':
            return {
                environment: 'production',
                enableLogging: true,
                enableMetrics: true,
                enableCaching: true,
                maxConcurrentWorkflows: 1000,
                workflowTimeout: 300000,
                enableReservedInterfaces: true,
                enableModuleCoordination: true
            };
        default:
            throw new Error(`Unknown preset: ${preset}`);
    }
}
function validateCoreOrchestratorConfig(options) {
    const errors = [];
    const warnings = [];
    if (options.maxConcurrentWorkflows !== undefined && options.maxConcurrentWorkflows < 1) {
        errors.push('maxConcurrentWorkflows must be at least 1');
    }
    if (options.maxConcurrentWorkflows && options.maxConcurrentWorkflows > 10000) {
        warnings.push('maxConcurrentWorkflows is very high, consider system resources');
    }
    if (options.workflowTimeout && options.workflowTimeout < 1000) {
        warnings.push('workflowTimeout is very short, workflows may timeout prematurely');
    }
    if (options.environment === 'production' && !options.enableMetrics) {
        warnings.push('Metrics should be enabled in production environment');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
exports.DEFAULT_CORE_ORCHESTRATOR_CONFIG = {
    environment: 'development',
    enableLogging: true,
    enableMetrics: true,
    enableCaching: false,
    maxConcurrentWorkflows: 100,
    workflowTimeout: 300000,
    enableReservedInterfaces: true,
    enableModuleCoordination: true
};
__exportStar(require("../../core/orchestrator/core.orchestrator"), exports);
__exportStar(require("./domain/activators/reserved-interface.activator"), exports);
__exportStar(require("./infrastructure/factories/core-orchestrator.factory"), exports);
