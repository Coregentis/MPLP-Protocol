"use strict";
/**
 * CoreOrchestrator统一入口
 *
 * @description 提供CoreOrchestrator的统一初始化、配置和管理接口
 * @version 1.0.0
 * @layer 模块层 - 统一入口
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的统一入口模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CORE_ORCHESTRATOR_CONFIG = void 0;
exports.initializeCoreOrchestrator = initializeCoreOrchestrator;
exports.quickInitializeCoreOrchestrator = quickInitializeCoreOrchestrator;
exports.initializeProductionCoreOrchestrator = initializeProductionCoreOrchestrator;
exports.initializeTestCoreOrchestrator = initializeTestCoreOrchestrator;
exports.createCoreOrchestratorConfig = createCoreOrchestratorConfig;
exports.validateCoreOrchestratorConfig = validateCoreOrchestratorConfig;
const tslib_1 = require("tslib");
const core_orchestrator_factory_1 = require("./infrastructure/factories/core-orchestrator.factory");
/**
 * 初始化CoreOrchestrator
 *
 * @description 创建并配置CoreOrchestrator实例，返回统一的访问接口
 */
async function initializeCoreOrchestrator(options = {}) {
    // 1. 获取工厂实例
    const factory = core_orchestrator_factory_1.CoreOrchestratorFactory.getInstance();
    // 2. 根据环境选择配置
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
    // 3. 应用自定义选项
    if (options.enableLogging !== undefined || options.enableMetrics !== undefined) {
        // 如果有自定义选项，重新创建配置
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
    // 4. 创建统计信息函数
    const getStatistics = async () => {
        const workflowStats = await factoryResult.managementService.getWorkflowStatistics();
        return {
            activeWorkflows: workflowStats.activeWorkflows,
            completedWorkflows: workflowStats.completedWorkflows,
            failedWorkflows: workflowStats.failedWorkflows,
            averageExecutionTime: workflowStats.averageDuration,
            resourceUtilization: 50, // 简化实现
            moduleCoordinationCount: 0, // TODO: 实现实际的协调计数
            interfaceActivationCount: 0 // TODO: 实现实际的激活计数
        };
    };
    // 5. 创建模块信息函数
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
/**
 * 快速初始化CoreOrchestrator（使用默认配置）
 */
async function quickInitializeCoreOrchestrator() {
    return await initializeCoreOrchestrator({
        environment: 'development',
        enableLogging: true,
        enableMetrics: true,
        enableReservedInterfaces: true,
        enableModuleCoordination: true
    });
}
/**
 * 初始化生产环境CoreOrchestrator
 */
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
/**
 * 初始化测试环境CoreOrchestrator
 */
async function initializeTestCoreOrchestrator() {
    return await initializeCoreOrchestrator({
        environment: 'testing',
        enableLogging: false,
        enableMetrics: false,
        enableReservedInterfaces: false,
        enableModuleCoordination: false
    });
}
/**
 * 创建CoreOrchestrator配置预设
 */
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
/**
 * 验证CoreOrchestrator配置
 */
function validateCoreOrchestratorConfig(options) {
    const errors = [];
    const warnings = [];
    // 验证并发工作流数量
    if (options.maxConcurrentWorkflows !== undefined && options.maxConcurrentWorkflows < 1) {
        errors.push('maxConcurrentWorkflows must be at least 1');
    }
    if (options.maxConcurrentWorkflows && options.maxConcurrentWorkflows > 10000) {
        warnings.push('maxConcurrentWorkflows is very high, consider system resources');
    }
    // 验证工作流超时
    if (options.workflowTimeout && options.workflowTimeout < 1000) {
        warnings.push('workflowTimeout is very short, workflows may timeout prematurely');
    }
    // 验证环境配置
    if (options.environment === 'production' && !options.enableMetrics) {
        warnings.push('Metrics should be enabled in production environment');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
// ===== 便捷导出 =====
/**
 * CoreOrchestrator默认配置
 */
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
// 导出核心类型和接口
tslib_1.__exportStar(require("../../core/orchestrator/core.orchestrator"), exports);
tslib_1.__exportStar(require("./domain/activators/reserved-interface.activator"), exports);
tslib_1.__exportStar(require("./infrastructure/factories/core-orchestrator.factory"), exports);
//# sourceMappingURL=orchestrator.js.map