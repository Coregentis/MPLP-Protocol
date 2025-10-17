"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabModule = void 0;
const collab_management_service_1 = require("./application/services/collab-management.service");
const collab_coordination_service_1 = require("./domain/services/collab-coordination.service");
const collab_repository_impl_1 = require("./infrastructure/repositories/collab.repository.impl");
const collab_module_adapter_1 = require("./infrastructure/adapters/collab-module.adapter");
const collab_protocol_factory_1 = require("./infrastructure/factories/collab-protocol.factory");
const collab_controller_1 = require("./api/controllers/collab.controller");
const cross_cutting_concerns_1 = require("../../core/protocols/cross-cutting-concerns");
class CollabModule {
    static instance;
    collabRepository;
    collabCoordinationService;
    collabManagementService;
    collabModuleAdapter;
    collabProtocol;
    collabController;
    _securityManager;
    _performanceMonitor;
    _eventBusManager;
    _errorHandler;
    _coordinationManager;
    _orchestrationManager;
    _stateSyncManager;
    _transactionManager;
    _protocolVersionManager;
    config;
    constructor() {
        this.initializeConfig();
        this.initializeL3Managers();
        this.initializeServices();
    }
    static getInstance() {
        if (!CollabModule.instance) {
            CollabModule.instance = new CollabModule();
        }
        return CollabModule.instance;
    }
    initializeConfig() {
        this.config = {
            maxParticipants: 100,
            defaultCoordinationType: 'distributed',
            defaultDecisionMaking: 'consensus',
            performanceThresholds: {
                maxCoordinationLatency: 1000,
                minSuccessRate: 0.95,
                maxErrorRate: 0.05
            },
            auditSettings: {
                enabled: true,
                retentionDays: 365
            }
        };
    }
    initializeL3Managers() {
        this._securityManager = new cross_cutting_concerns_1.MLPPSecurityManager();
        this._performanceMonitor = new cross_cutting_concerns_1.MLPPPerformanceMonitor();
        this._eventBusManager = new cross_cutting_concerns_1.MLPPEventBusManager();
        this._errorHandler = new cross_cutting_concerns_1.MLPPErrorHandler();
        this._coordinationManager = new cross_cutting_concerns_1.MLPPCoordinationManager();
        this._orchestrationManager = new cross_cutting_concerns_1.MLPPOrchestrationManager();
        this._stateSyncManager = new cross_cutting_concerns_1.MLPPStateSyncManager();
        this._transactionManager = new cross_cutting_concerns_1.MLPPTransactionManager();
        this._protocolVersionManager = new cross_cutting_concerns_1.MLPPProtocolVersionManager();
    }
    initializeServices() {
        this.collabRepository = new collab_repository_impl_1.CollabRepositoryImpl();
        this.collabCoordinationService = new collab_coordination_service_1.CollabCoordinationService();
        const mockMemberManager = {};
        const mockTaskAllocator = {};
        const mockLogger = {};
        this.collabManagementService = new collab_management_service_1.CollabManagementService(this.collabRepository, mockMemberManager, mockTaskAllocator, mockLogger);
    }
    async initializeInfrastructure() {
        this.collabModuleAdapter = new collab_module_adapter_1.CollabModuleAdapter(this.collabManagementService);
        const protocolFactory = collab_protocol_factory_1.CollabProtocolFactory.getInstance();
        const protocolConfig = collab_protocol_factory_1.CollabProtocolFactory.getDefaultConfig();
        this.collabProtocol = await protocolFactory.createProtocol(protocolConfig);
        this.collabController = new collab_controller_1.CollabController(this.collabManagementService);
    }
    getCollabManagementService() {
        return this.collabManagementService;
    }
    getCollabCoordinationService() {
        return this.collabCoordinationService;
    }
    getCollabRepository() {
        return this.collabRepository;
    }
    getCollabModuleAdapter() {
        return this.collabModuleAdapter;
    }
    getCollabProtocol() {
        return this.collabProtocol;
    }
    getCollabController() {
        return this.collabController;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    async start() {
        await this.initializeInfrastructure();
    }
    async stop() {
    }
    async restart() {
        await this.stop();
        await this.start();
    }
    async healthCheck() {
        try {
            const protocolHealth = await this.collabProtocol.healthCheck();
            return {
                status: protocolHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: protocolHealth,
                    config: this.config,
                    services: {
                        managementService: 'healthy',
                        coordinationService: 'healthy',
                        repository: 'healthy'
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
}
exports.CollabModule = CollabModule;
exports.default = CollabModule;
