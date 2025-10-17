"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_MODULE_INFO = exports.DEFAULT_PLAN_MODULE_OPTIONS = exports.createPlanModule = exports.PlanModuleManager = void 0;
exports.initializePlanModule = initializePlanModule;
const plan_module_adapter_1 = require("./infrastructure/adapters/plan-module.adapter");
const plan_entity_1 = require("./domain/entities/plan.entity");
async function initializePlanModule(options = {}) {
    const adapterConfig = {
        enableLogging: options.enableLogging,
        enableCaching: options.enableCaching,
        enableMetrics: options.enableMetrics,
        repositoryType: options.repositoryType,
        maxCacheSize: options.maxCacheSize,
        cacheTimeout: options.cacheTimeout,
        enableOptimization: options.enableOptimization,
        enableRiskAssessment: options.enableRiskAssessment,
        enableFailureRecovery: options.enableFailureRecovery
    };
    const adapterResult = await (0, plan_module_adapter_1.createPlanModuleAdapter)(adapterConfig);
    const createPlan = async (data) => {
        return await adapterResult.adapter.createPlan(data);
    };
    const getPlan = async (planId) => {
        return await adapterResult.adapter.getPlan(planId);
    };
    const updatePlan = async (planId, updates) => {
        return await adapterResult.adapter.updatePlan(planId, updates);
    };
    const deletePlan = async (planId) => {
        return await adapterResult.adapter.deletePlan(planId);
    };
    const moduleInfo = adapterResult.adapter.getModuleInfo();
    return {
        planEntity: plan_entity_1.PlanEntity,
        planRepository: adapterResult.repository,
        planService: adapterResult.service,
        planProtocol: adapterResult.protocol,
        planAdapter: adapterResult.adapter,
        createPlan,
        getPlan,
        updatePlan,
        deletePlan,
        moduleInfo
    };
}
class PlanModuleManager {
    static instance = null;
    static options = {};
    static async getInstance(options = {}) {
        if (!this.instance) {
            this.options = { ...this.options, ...options };
            this.instance = await initializePlanModule(this.options);
        }
        return this.instance;
    }
    static reset() {
        this.instance = null;
        this.options = {};
    }
    static isInitialized() {
        return this.instance !== null;
    }
    static async getHealthStatus() {
        if (!this.instance) {
            return {
                status: 'unhealthy',
                components: {},
                timestamp: new Date().toISOString()
            };
        }
        return await this.instance.planAdapter.healthCheck();
    }
}
exports.PlanModuleManager = PlanModuleManager;
exports.createPlanModule = initializePlanModule;
exports.DEFAULT_PLAN_MODULE_OPTIONS = {
    enableLogging: true,
    enableCaching: false,
    enableMetrics: false,
    repositoryType: 'memory',
    maxCacheSize: 1000,
    cacheTimeout: 300000,
    enableOptimization: true,
    enableRiskAssessment: true,
    enableFailureRecovery: true
};
exports.PLAN_MODULE_INFO = {
    name: 'plan',
    version: '1.0.0',
    description: 'MPLP智能任务规划协调模块',
    layer: 'L2',
    status: 'implementing',
    features: [
        '智能任务规划',
        '计划执行管理',
        '任务协调',
        '依赖管理',
        '计划优化',
        '风险评估',
        '故障恢复',
        '性能监控',
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
