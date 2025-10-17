"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanModuleAdapterSingleton = exports.PlanModuleAdapter = void 0;
exports.createPlanModuleAdapter = createPlanModuleAdapter;
const plan_entity_1 = require("../../domain/entities/plan.entity");
const plan_management_service_1 = require("../../application/services/plan-management.service");
const plan_repository_1 = require("../repositories/plan.repository");
const plan_protocol_1 = require("../protocols/plan.protocol");
const ai_service_adapter_1 = require("./ai-service.adapter");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class PlanModuleAdapter {
    repository;
    service;
    protocol;
    config;
    isInitialized = false;
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
            enableOptimization: true,
            enableRiskAssessment: true,
            enableFailureRecovery: true,
            ...config
        };
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: this.config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
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
        this.initializeComponents();
    }
    initializeComponents() {
        this.repository = new plan_repository_1.PlanRepository();
        this.service = new plan_management_service_1.PlanManagementService(this.securityManager, this.performanceMonitor, this.eventBusManager, this.errorHandler, this.coordinationManager, this.orchestrationManager, this.stateSyncManager, this.transactionManager, this.protocolVersionManager);
        const logger = {
            info: (message, meta) => {
                if (process.env.NODE_ENV !== 'test') {
                    console.log(`[INFO] ${message}`, meta);
                }
            },
            warn: (message, meta) => {
                if (process.env.NODE_ENV !== 'test') {
                    console.warn(`[WARN] ${message}`, meta);
                }
            },
            error: (message, error, meta) => {
                if (process.env.NODE_ENV !== 'test') {
                    console.error(`[ERROR] ${message}`, error, meta);
                }
            },
            debug: (message, meta) => {
                if (process.env.NODE_ENV !== 'test') {
                    console.debug(`[DEBUG] ${message}`, meta);
                }
            }
        };
        const httpClient = {
            async post(url, data, _config) {
                console.log(`AI Service POST request to: ${url}`, data);
                return {
                    data: {
                        requestId: `ai-req-${Date.now()}`,
                        planData: { tasks: [], timeline: {}, resources: {} },
                        confidence: 0.85,
                        metadata: { processingTime: 150, algorithm: 'production-ai' },
                        status: 'completed'
                    }
                };
            },
            async get(url, _config) {
                console.log(`AI Service GET request to: ${url}`);
                return {
                    data: {
                        status: 'healthy',
                        version: '2.0.0',
                        capabilities: ['planning', 'optimization', 'validation']
                    }
                };
            }
        };
        const aiServiceAdapter = new ai_service_adapter_1.AIServiceAdapter({
            endpoint: process.env.MPLP_AI_SERVICE_URL || 'http://localhost:8080/api/ai',
            apiKey: process.env.MPLP_AI_SERVICE_API_KEY || 'development-key',
            timeout: 30000,
            retryAttempts: 3,
            fallbackService: 'http://localhost:8081/api/ai'
        }, httpClient);
        const planRepository = {
            savePlanRequest: async (request) => ({
                ...request,
                requestId: `plan-req-${Date.now()}`,
                parameters: request.parameters || {},
                constraints: request.constraints || {},
                createdAt: new Date()
            }),
            findPlanRequest: async (requestId) => ({
                requestId,
                planType: 'task_planning',
                parameters: {},
                constraints: {},
                status: 'pending',
                createdAt: new Date()
            }),
            updatePlanRequestStatus: async () => undefined,
            savePlanResult: async (result) => ({
                ...result,
                resultId: `plan-res-${Date.now()}`,
                planData: result.planData || {},
                confidence: result.confidence || 0.8,
                metadata: result.metadata || { processingTime: 100 },
                status: result.status || 'completed',
                createdAt: new Date()
            }),
            findPlanResult: async (requestId) => ({
                requestId,
                resultId: `plan-res-${Date.now()}`,
                planData: {},
                confidence: 0.8,
                metadata: { processingTime: 100 },
                status: 'completed',
                createdAt: new Date()
            }),
            findById: async () => null,
            save: async (entity) => entity,
            update: async (entity) => entity
        };
        const planProtocolService = new (require('../../application/services/plan-protocol.service')).PlanProtocolService(planRepository, aiServiceAdapter, logger);
        const planIntegrationService = new (require('../../application/services/plan-integration.service')).PlanIntegrationService(planRepository, { coordinateOperation: async () => ({}), healthCheck: async () => true }, logger);
        const planValidationService = new (require('../../application/services/plan-validation.service')).PlanValidationService({ validatePlanType: () => true, validateParameters: () => ({ isValid: true, errors: [], warnings: [] }), validateConstraints: () => ({ isValid: true, errors: [], warnings: [] }) }, { checkPlanQuality: async () => ({ score: 0.85, issues: [] }), checkDataIntegrity: async () => ({ isValid: true, issues: [] }) }, logger);
        this.protocol = new plan_protocol_1.PlanProtocol(planProtocolService, planIntegrationService, planValidationService, this.securityManager, this.performanceMonitor, this.eventBusManager, this.errorHandler, this.coordinationManager, this.orchestrationManager, this.stateSyncManager, this.transactionManager, this.protocolVersionManager);
        this.isInitialized = true;
    }
    getComponents() {
        if (!this.isInitialized) {
            throw new Error('Plan module adapter not initialized');
        }
        return {
            repository: this.repository,
            service: this.service,
            protocol: this.protocol,
            adapter: this
        };
    }
    getRepository() {
        return this.repository;
    }
    getService() {
        return this.service;
    }
    getProtocol() {
        return this.protocol;
    }
    getConfig() {
        return { ...this.config };
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        try {
            const repositoryHealthy = await this.checkRepositoryHealth();
            const serviceHealthy = await this.checkServiceHealth();
            const protocolHealth = await this.protocol.healthCheck();
            const protocolHealthy = protocolHealth.status === 'healthy';
            const crossCuttingHealthy = await this.checkCrossCuttingConcernsHealth();
            const components = {
                repository: repositoryHealthy,
                service: serviceHealthy,
                protocol: protocolHealthy,
                crossCuttingConcerns: crossCuttingHealthy
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
                    service: false,
                    protocol: false,
                    crossCuttingConcerns: false
                },
                timestamp
            };
        }
    }
    async createPlan(data) {
        const entity = new plan_entity_1.PlanEntity(data);
        return await this.repository.save(entity);
    }
    async getPlan(planId) {
        return await this.repository.findById(planId);
    }
    async updatePlan(planId, updates) {
        const entity = await this.repository.findById(planId);
        if (!entity) {
            throw new Error(`Plan with ID ${planId} not found`);
        }
        entity.update(updates);
        return await this.repository.update(entity);
    }
    async deletePlan(planId) {
        return await this.repository.delete(planId);
    }
    getModuleInfo() {
        return {
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
    async checkServiceHealth() {
        try {
            const testPlan = await this.service.createPlan({
                contextId: 'health-check-context',
                name: 'Health Check Plan'
            });
            await this.service.deletePlan(testPlan.planId);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async checkCrossCuttingConcernsHealth() {
        try {
            const securityHealth = await this.securityManager.healthCheck();
            const performanceHealth = await this.performanceMonitor.healthCheck();
            const eventBusHealth = await this.eventBusManager.healthCheck();
            const errorHandlerHealth = await this.errorHandler.healthCheck();
            return securityHealth && performanceHealth && eventBusHealth && errorHandlerHealth;
        }
        catch (error) {
            return false;
        }
    }
}
exports.PlanModuleAdapter = PlanModuleAdapter;
async function createPlanModuleAdapter(config = {}) {
    const adapter = new PlanModuleAdapter(config);
    return adapter.getComponents();
}
class PlanModuleAdapterSingleton {
    static instance = null;
    static config = {};
    static getInstance(config = {}) {
        if (!this.instance) {
            this.config = { ...this.config, ...config };
            this.instance = new PlanModuleAdapter(this.config);
        }
        return this.instance;
    }
    static reset() {
        this.instance = null;
        this.config = {};
    }
    static isInitialized() {
        return this.instance !== null;
    }
}
exports.PlanModuleAdapterSingleton = PlanModuleAdapterSingleton;
