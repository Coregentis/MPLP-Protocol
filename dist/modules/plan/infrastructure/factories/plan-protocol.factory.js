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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanProtocolFactory = void 0;
const plan_protocol_1 = require("../protocols/plan.protocol");
const factory_1 = require("../../../../core/protocols/cross-cutting-concerns/factory");
class PlanProtocolFactory {
    static instance;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!PlanProtocolFactory.instance) {
            PlanProtocolFactory.instance = new PlanProtocolFactory();
        }
        return PlanProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = factory_1.CrossCuttingConcernsFactory.getInstance();
        const managers = crossCuttingFactory.createManagers({
            security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
            performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? false) },
            eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
            errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
            coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
            orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
            stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
            transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
            protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
        });
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
        const planRepository = {
            savePlanRequest: async (request) => ({
                ...request,
                requestId: request.requestId || `plan-req-${Date.now()}`,
                planType: request.planType,
                parameters: request.parameters || {},
                constraints: request.constraints || {},
                status: request.status || 'pending',
                createdAt: request.createdAt || new Date(),
                updatedAt: request.updatedAt
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
        const aiServiceAdapter = {
            executePlanning: async () => ({ requestId: '', planData: {}, confidence: 0.8, metadata: { processingTime: 100 }, status: 'completed' }),
            optimizePlan: async () => ({ requestId: '', planData: {}, confidence: 0.8, metadata: { processingTime: 100 }, status: 'completed' }),
            validatePlan: async () => ({ isValid: true, violations: [], recommendations: [] }),
            getServiceInfo: () => ({ name: 'Mock AI Service', version: '1.0.0', capabilities: [], supportedAlgorithms: [], maxRequestSize: 1024, averageResponseTime: 100 }),
            healthCheck: async () => true
        };
        const { PlanProtocolService } = await Promise.resolve().then(() => __importStar(require('../../application/services/plan-protocol.service')));
        const planProtocolService = new PlanProtocolService(planRepository, aiServiceAdapter, logger);
        const { PlanIntegrationService } = await Promise.resolve().then(() => __importStar(require('../../application/services/plan-integration.service')));
        const { PlanValidationService } = await Promise.resolve().then(() => __importStar(require('../../application/services/plan-validation.service')));
        const planIntegrationService = new PlanIntegrationService(planRepository, { coordinateOperation: async () => ({}), healthCheck: async () => true }, logger);
        const planValidationService = new PlanValidationService({ validatePlanType: () => true, validateParameters: () => ({ isValid: true, errors: [], warnings: [] }), validateConstraints: () => ({ isValid: true, errors: [], warnings: [] }) }, { checkPlanQuality: async () => ({ score: 0.85, issues: [] }), checkDataIntegrity: async () => ({ isValid: true, issues: [] }) }, logger);
        this.protocol = new plan_protocol_1.PlanProtocol(planProtocolService, planIntegrationService, planValidationService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    getProtocolMetadata() {
        return {
            name: 'plan',
            version: '1.0.0',
            description: 'MPLP Plan Protocol - Intelligent Task Planning and Coordination',
            capabilities: [
                'plan_creation',
                'plan_management',
                'task_coordination',
                'plan_execution',
                'plan_optimization',
                'plan_validation',
                'resource_allocation',
                'risk_management',
                'milestone_tracking',
                'progress_monitoring'
            ],
            dependencies: [
                'context',
                'confirm',
                'trace',
                'role',
                'extension'
            ],
            supportedOperations: [
                'create',
                'get',
                'update',
                'delete',
                'execute',
                'optimize',
                'validate',
                'healthCheck'
            ]
        };
    }
    async getHealthStatus() {
        if (!this.protocol) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                checks: [
                    {
                        name: 'protocol_instance',
                        status: 'fail',
                        message: 'Protocol not initialized'
                    }
                ],
                metadata: {
                    protocolName: 'plan',
                    version: '1.0.0'
                }
            };
        }
        return await this.protocol.healthCheck();
    }
    reset() {
        this.protocol = null;
    }
    async destroy() {
        if (this.protocol) {
            this.protocol = null;
        }
    }
    getCurrentProtocol() {
        return this.protocol;
    }
    isInitialized() {
        return this.protocol !== null;
    }
    static async create(config = {}) {
        const factory = PlanProtocolFactory.getInstance();
        return await factory.createProtocol(config);
    }
    static getDefaultConfig() {
        return {
            enableLogging: true,
            enableMetrics: true,
            enableCaching: true,
            repositoryType: 'memory',
            crossCuttingConcerns: {
                security: { enabled: true },
                performance: { enabled: true },
                eventBus: { enabled: true },
                errorHandler: { enabled: true },
                coordination: { enabled: true },
                orchestration: { enabled: true },
                stateSync: { enabled: true },
                transaction: { enabled: true },
                protocolVersion: { enabled: true }
            }
        };
    }
    static getDevelopmentConfig() {
        return {
            enableLogging: true,
            enableMetrics: false,
            enableCaching: false,
            repositoryType: 'memory',
            crossCuttingConcerns: {
                security: { enabled: false },
                performance: { enabled: false },
                eventBus: { enabled: true },
                errorHandler: { enabled: true },
                coordination: { enabled: true },
                orchestration: { enabled: true },
                stateSync: { enabled: false },
                transaction: { enabled: false },
                protocolVersion: { enabled: true }
            }
        };
    }
    static getProductionConfig() {
        return {
            enableLogging: true,
            enableMetrics: true,
            enableCaching: true,
            repositoryType: 'database',
            crossCuttingConcerns: {
                security: { enabled: true },
                performance: { enabled: true },
                eventBus: { enabled: true },
                errorHandler: { enabled: true },
                coordination: { enabled: true },
                orchestration: { enabled: true },
                stateSync: { enabled: true },
                transaction: { enabled: true },
                protocolVersion: { enabled: true }
            }
        };
    }
}
exports.PlanProtocolFactory = PlanProtocolFactory;
