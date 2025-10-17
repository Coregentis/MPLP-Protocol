"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogModule = exports.DialogModuleContainer = void 0;
exports.createDefaultDialogModuleConfig = createDefaultDialogModuleConfig;
exports.createDialogModule = createDialogModule;
exports.initializeDialogModule = initializeDialogModule;
const dialog_protocol_factory_1 = require("./infrastructure/factories/dialog-protocol.factory");
const dialog_management_service_1 = require("./application/services/dialog-management.service");
const dialog_adapter_1 = require("./infrastructure/adapters/dialog.adapter");
const dialog_controller_1 = require("./api/controllers/dialog.controller");
const dialog_mapper_1 = require("./api/mappers/dialog.mapper");
class DialogModuleContainer {
    _config;
    _protocolFactory = null;
    _services = new Map();
    _initialized = false;
    constructor(config) {
        this._config = config;
    }
    async initialize() {
        if (this._initialized) {
            throw new Error('DialogModuleContainer is already initialized');
        }
        if (this._config.enableProtocol) {
            this._protocolFactory = dialog_protocol_factory_1.DialogProtocolFactory.getInstance(this._config.protocolConfig);
        }
        await this._registerCoreServices();
        await this._registerApplicationServices();
        await this._registerInfrastructureServices();
        await this._registerApiServices();
        this._initialized = true;
    }
    getService(serviceName) {
        if (!this._initialized) {
            throw new Error('DialogModuleContainer is not initialized');
        }
        const service = this._services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        return service;
    }
    getProtocolInstance(instanceId) {
        if (!this._protocolFactory) {
            return null;
        }
        return this._protocolFactory.getProtocolInstance(instanceId);
    }
    getProtocol() {
        return this._protocolFactory?.getProtocolInstance('default') || null;
    }
    isInitialized() {
        return this._initialized;
    }
    async createProtocolInstance(instanceId) {
        if (!this._protocolFactory) {
            throw new Error('Protocol factory is not enabled');
        }
        return await this._protocolFactory.createProtocolInstance({
            instanceId,
            protocolVersion: '1.0.0',
            customCapabilities: [],
            integrationConfig: {
                enabledModules: this._config.integrationConfig.enabledModules,
                orchestrationScenarios: this._config.integrationConfig.orchestrationScenarios,
                adapterSettings: {}
            }
        });
    }
    getComponents() {
        return {
            controller: this._services.get('dialogController'),
            service: this._services.get('dialogManagementService'),
            mapper: dialog_mapper_1.DialogMapper,
            moduleAdapter: this._services.get('dialogAdapter'),
            commandHandler: this._services.get('dialogManagementService'),
            queryHandler: this._services.get('dialogManagementService'),
            webSocketHandler: this._services.get('webSocketHandler'),
            domainService: this._services.get('domainService')
        };
    }
    async destroy() {
        if (this._protocolFactory) {
            this._protocolFactory = null;
        }
        this._services.clear();
        this._initialized = false;
    }
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        const services = {};
        const protocols = {};
        for (const [serviceName] of this._services) {
            try {
                services[serviceName] = 'healthy';
            }
            catch (error) {
                services[serviceName] = 'unhealthy';
            }
        }
        if (this._protocolFactory) {
            try {
                const factoryHealth = await this._protocolFactory.healthCheck();
                Object.assign(protocols, factoryHealth.instances);
            }
            catch (error) {
                protocols['factory'] = 'critical';
            }
        }
        const allStatuses = [...Object.values(services), ...Object.values(protocols)];
        const unhealthyCount = allStatuses.filter(s => s === 'unhealthy' || s === 'critical').length;
        const overallStatus = unhealthyCount === 0 ? 'healthy' :
            unhealthyCount < allStatuses.length / 2 ? 'degraded' : 'unhealthy';
        return {
            status: overallStatus,
            services,
            protocols,
            timestamp
        };
    }
    async shutdown() {
        if (this._protocolFactory) {
            await this._protocolFactory.cleanup();
        }
        this._services.clear();
        this._initialized = false;
    }
    async _registerCoreServices() {
        this._services.set('dialogMapper', new dialog_mapper_1.DialogMapper());
    }
    async _registerApplicationServices() {
        const dialogRepository = new dialog_adapter_1.DialogAdapter();
        this._services.set('dialogRepository', dialogRepository);
        const dialogManagementService = new dialog_management_service_1.DialogManagementService(dialogRepository, {});
        this._services.set('dialogManagementService', dialogManagementService);
        const domainService = {
            validateDialogCreation: (_dialogData) => ({
                isValid: true,
                violations: [],
                recommendations: []
            }),
            calculateDialogComplexity: (_dialogData) => 0.5,
            optimizeDialogStrategy: (dialogData) => ({
                optimizedStrategy: dialogData,
                improvements: [],
                performanceGain: 0
            }),
            assessDialogQuality: (_dialogData) => ({
                score: 0.8,
                factors: ['participant_engagement', 'message_quality', 'response_time'],
                recommendations: ['improve_response_time', 'enhance_content_quality']
            }),
            validateDialogUpdate: (_dialogId, _updateData) => ({
                isValid: true,
                violations: [],
                recommendations: []
            }),
            validateDialogDeletion: (_dialogId) => ({
                isValid: true,
                violations: [],
                recommendations: []
            })
        };
        this._services.set('domainService', domainService);
        let connectionCount = 0;
        const connections = new Map();
        const webSocketHandler = {
            addConnection: async (connection) => {
                connectionCount++;
                connections.set(connection.id, connection);
            },
            removeConnection: async (connectionId) => {
                if (connections.has(connectionId)) {
                    connections.delete(connectionId);
                    connectionCount = Math.max(0, connectionCount - 1);
                }
            },
            getStatus: async () => ({
                connections: connectionCount,
                totalConnections: connectionCount,
                activeConnections: connectionCount,
                connectionHealth: 'healthy'
            }),
            broadcastMessage: async (message) => {
                const messageStr = JSON.stringify(message);
                for (const connection of connections.values()) {
                    connection.send(messageStr);
                }
            },
            handleMessage: async (_connection, _message) => {
            },
            broadcast: async (message) => {
                const messageStr = JSON.stringify(message);
                for (const connection of connections.values()) {
                    connection.send(messageStr);
                }
            }
        };
        this._services.set('webSocketHandler', webSocketHandler);
    }
    async _registerInfrastructureServices() {
        const dialogAdapter = new dialog_adapter_1.DialogAdapter();
        await dialogAdapter.initialize();
        this._services.set('dialogAdapter', dialogAdapter);
    }
    async _registerApiServices() {
        const dialogManagementService = this._services.get('dialogManagementService');
        const dialogController = new dialog_controller_1.DialogController(dialogManagementService);
        this._services.set('dialogController', dialogController);
    }
}
exports.DialogModuleContainer = DialogModuleContainer;
class DialogModule {
    _container;
    _config;
    constructor(config) {
        this._config = config;
        this._container = new DialogModuleContainer(config);
    }
    async initialize() {
        await this._container.initialize();
    }
    getContainer() {
        return this._container;
    }
    getConfig() {
        return this._config;
    }
    async updateConfig(newConfig) {
        this._config = { ...this._config, ...newConfig };
    }
    async shutdown() {
        await this._container.shutdown();
    }
}
exports.DialogModule = DialogModule;
function createDefaultDialogModuleConfig(environment = 'development') {
    return {
        environment,
        enableProtocol: true,
        enableIntegration: true,
        enableOrchestration: true,
        protocolConfig: {
            environment,
            enableLogging: environment === 'development',
            enableMetrics: true,
            enableHealthCheck: true,
            dependencies: {},
            features: {
                intelligentControl: true,
                criticalThinking: true,
                knowledgeSearch: true,
                multimodal: true,
                collaboration: true
            }
        },
        serviceConfig: {
            enableCaching: true,
            enableMetrics: true,
            enableTracing: true,
            maxConcurrentDialogs: 100,
            defaultTimeout: 30000
        },
        integrationConfig: {
            enabledModules: ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'core', 'collab', 'network'],
            orchestrationScenarios: [
                'intelligent_dialog_start',
                'multimodal_dialog_processing',
                'dialog_quality_monitoring',
                'collaborative_dialog_sync',
                'dialog_security_audit'
            ],
            crossCuttingConcerns: [
                'security',
                'performance',
                'eventBus',
                'errorHandling',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ]
        }
    };
}
async function createDialogModule(options = {}) {
    const startTime = Date.now();
    try {
        const config = {
            environment: 'development',
            enableProtocol: true,
            enableIntegration: true,
            enableOrchestration: true,
            protocolConfig: {
                environment: 'development',
                enableLogging: true,
                enableMetrics: options.performanceMetricsEnabled ?? true,
                enableHealthCheck: options.healthCheckEnabled ?? true,
                dependencies: {
                    database: null,
                    cache: null,
                    messageQueue: null,
                    monitoring: null
                },
                features: {
                    intelligentControl: options.enableIntelligentControl ?? false,
                    criticalThinking: options.enableCriticalThinking ?? false,
                    knowledgeSearch: options.enableKnowledgeSearch ?? false,
                    multimodal: options.enableMultiModal ?? false,
                    collaboration: true
                }
            },
            serviceConfig: {
                enableCaching: true,
                enableMetrics: options.performanceMetricsEnabled ?? true,
                enableTracing: true,
                maxConcurrentDialogs: options.maxConcurrentDialogs ?? 100,
                defaultTimeout: options.defaultTimeout ?? 30000
            },
            integrationConfig: {
                enabledModules: ['context', 'plan', 'role', 'confirm', 'trace', 'extension'],
                orchestrationScenarios: [
                    'dialog_lifecycle_management',
                    'participant_coordination',
                    'capability_orchestration',
                    'strategy_adaptation',
                    'context_integration',
                    'performance_optimization',
                    'security_enforcement',
                    'event_processing',
                    'version_management',
                    'search_coordination',
                    'multimodal_dialog_processing',
                    'dialog_quality_monitoring',
                    'collaborative_dialog_sync',
                    'dialog_security_audit'
                ],
                crossCuttingConcerns: [
                    'security',
                    'performance',
                    'eventBus',
                    'errorHandling',
                    'coordination',
                    'orchestration',
                    'stateSync',
                    'transaction',
                    'protocolVersion'
                ]
            }
        };
        const container = new DialogModuleContainer(config);
        await container.initialize();
        const endTime = Date.now();
        const initializationTime = endTime - startTime;
        return {
            success: true,
            module: container,
            performance: {
                initializationTime,
                memoryUsage: process.memoryUsage().heapUsed,
                componentCount: 10
            }
        };
    }
    catch (error) {
        const endTime = Date.now();
        const initializationTime = endTime - startTime;
        return {
            success: false,
            module: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            performance: {
                initializationTime,
                memoryUsage: process.memoryUsage().heapUsed,
                componentCount: 0
            }
        };
    }
}
exports.default = createDialogModule;
function createDialogModuleComponents() {
    let connectionCount = 0;
    const connections = new Map();
    const webSocketHandler = {
        addConnection: async (connection) => {
            connectionCount++;
            connections.set(connection.id, connection);
        },
        removeConnection: async (connectionId) => {
            if (connections.has(connectionId)) {
                connections.delete(connectionId);
                connectionCount = Math.max(0, connectionCount - 1);
            }
        },
        getStatus: async () => ({
            connections: connectionCount,
            totalConnections: connectionCount,
            activeConnections: connectionCount,
            connectionHealth: 'healthy',
            status: 'active',
            subscriptions: 0,
            uptime: Date.now()
        }),
        broadcastMessage: async (message) => {
            const messageStr = JSON.stringify(message);
            for (const connection of connections.values()) {
                connection.send(messageStr);
            }
        },
        handleMessage: async (_connection, _message) => {
        },
        broadcast: async (message) => {
            const messageStr = JSON.stringify(message);
            for (const connection of connections.values()) {
                connection.send(messageStr);
            }
        }
    };
    const domainService = {
        validateDialogCreation: (_dialogData) => ({
            isValid: true,
            violations: [],
            recommendations: []
        }),
        calculateDialogComplexity: (_dialogData) => ({
            score: 0.5,
            factors: ['participant_count', 'capability_complexity', 'strategy_depth'],
            recommendations: ['optimize_participant_management', 'simplify_capabilities']
        }),
        assessDialogQuality: (_dialogData) => ({
            score: 0.8,
            factors: ['participant_engagement', 'message_quality', 'response_time'],
            recommendations: ['improve_response_time', 'enhance_content_quality']
        }),
        validateDialogUpdate: (_dialogId, _updateData) => ({
            isValid: true,
            violations: [],
            recommendations: []
        }),
        validateDialogDeletion: (_dialogId) => ({
            isValid: true,
            violations: [],
            recommendations: []
        })
    };
    const moduleAdapter = {
        name: 'dialog',
        version: '1.0.0',
        isInitialized: () => true,
        getHealthStatus: async () => ({
            status: 'healthy',
            details: { initialized: true, timestamp: new Date().toISOString() }
        }),
        getStatistics: async () => ({
            totalDialogs: 0,
            activeDialogs: 0,
            endedDialogs: 0
        }),
        setContextModuleInterface: (_contextInterface) => {
        },
        setPlanModuleInterface: (_planInterface) => {
        },
        setRoleModuleInterface: (_roleInterface) => {
        },
        setConfirmModuleInterface: (_confirmInterface) => {
        },
        setTraceModuleInterface: (_traceInterface) => {
        },
        setExtensionModuleInterface: (_extensionInterface) => {
        },
        setCoreModuleInterface: (_coreInterface) => {
        },
        setCollabModuleInterface: (_collabInterface) => {
        },
        setNetworkModuleInterface: (_networkInterface) => {
        },
        getModuleInterfaceStatus: () => ({
            initialized: true,
            interfaces: ['IDialogManagement', 'IDialogQuery', 'IDialogWebSocket'],
            status: 'active',
            context: 'pending',
            plan: 'pending',
            role: 'pending',
            confirm: 'pending',
            trace: 'pending',
            extension: 'pending',
            core: 'pending',
            collab: 'pending',
            network: 'pending'
        })
    };
    return {
        webSocketHandler,
        domainService,
        moduleAdapter
    };
}
async function initializeDialogModule() {
    const container = new DialogModuleContainer(createDefaultDialogModuleConfig());
    await container.initialize();
    const dialogManagementService = container.getService('dialogManagementService');
    const dialogController = container.getService('dialogController');
    const components = createDialogModuleComponents();
    return {
        controller: dialogController,
        commandHandler: dialogManagementService,
        queryHandler: dialogManagementService,
        repository: container.getService('dialogRepository'),
        protocol: container.getProtocol(),
        moduleAdapter: components.moduleAdapter,
        webSocketHandler: components.webSocketHandler,
        domainService: components.domainService,
        isModuleInitialized: () => container.isInitialized(),
        getHealthStatus: async () => ({
            status: 'healthy',
            details: {
                initialized: container.isInitialized(),
                services: ['dialogManagementService', 'dialogController', 'dialogRepository'],
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }),
        getStatistics: async () => {
            const stats = await dialogManagementService.getDialogStatistics();
            return {
                ...stats,
                uptime: Date.now(),
                memoryUsage: process.memoryUsage().heapUsed
            };
        },
        getVersionInfo: () => ({
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            name: 'Dialog Module',
            dependencies: ['mplp-core', 'mplp-security', 'mplp-performance', 'mplp-eventbus']
        }),
        getComponents: () => ({
            controller: dialogController,
            commandHandler: dialogManagementService,
            queryHandler: dialogManagementService,
            managementService: dialogManagementService,
            repository: container.getService('dialogRepository'),
            protocol: container.getProtocol(),
            moduleAdapter: components.moduleAdapter,
            webSocketHandler: components.webSocketHandler,
            domainService: components.domainService
        }),
        destroy: async () => {
            await container.destroy();
        }
    };
}
