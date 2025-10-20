"use strict";
/**
 * Dialog Module Configuration
 * @description Dialog模块依赖注入配置和模块导出
 * @version 1.0.0
 */
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
/**
 * Dialog模块依赖注入容器
 */
class DialogModuleContainer {
    constructor(config) {
        this._protocolFactory = null;
        this._services = new Map();
        this._initialized = false;
        this._config = config;
    }
    /**
     * 初始化模块容器
     */
    async initialize() {
        if (this._initialized) {
            throw new Error('DialogModuleContainer is already initialized');
        }
        // 初始化协议工厂
        if (this._config.enableProtocol) {
            this._protocolFactory = dialog_protocol_factory_1.DialogProtocolFactory.getInstance(this._config.protocolConfig);
        }
        // 注册核心服务
        await this._registerCoreServices();
        // 注册应用服务
        await this._registerApplicationServices();
        // 注册基础设施服务
        await this._registerInfrastructureServices();
        // 注册API服务
        await this._registerApiServices();
        this._initialized = true;
        // TODO: 使用统一的日志系统替代console.log
        // console.log('[DialogModule] Container initialized successfully');
    }
    /**
     * 获取服务实例
     * @param serviceName 服务名称
     * @returns 服务实例
     */
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
    /**
     * 获取协议实例
     * @param instanceId 实例ID
     * @returns 协议实例
     */
    getProtocolInstance(instanceId) {
        if (!this._protocolFactory) {
            return null;
        }
        return this._protocolFactory.getProtocolInstance(instanceId);
    }
    /**
     * 获取协议实例（企业级标准接口）
     */
    getProtocol() {
        return this._protocolFactory?.getProtocolInstance('default') || null;
    }
    /**
     * 检查模块是否已初始化
     */
    isInitialized() {
        return this._initialized;
    }
    /**
     * 创建协议实例
     * @param instanceId 实例ID
     * @returns 协议实例
     */
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
    /**
     * 获取模块组件
     * @returns 模块组件
     */
    getComponents() {
        return {
            controller: this._services.get('dialogController'),
            service: this._services.get('dialogManagementService'),
            mapper: dialog_mapper_1.DialogMapper,
            moduleAdapter: this._services.get('dialogAdapter'),
            commandHandler: this._services.get('dialogManagementService'), // 使用service作为commandHandler
            queryHandler: this._services.get('dialogManagementService'), // 使用service作为queryHandler
            webSocketHandler: this._services.get('webSocketHandler'),
            domainService: this._services.get('domainService')
        };
    }
    /**
     * 销毁模块
     */
    async destroy() {
        // 清理协议工厂
        if (this._protocolFactory) {
            // TODO: 实现协议工厂清理
            this._protocolFactory = null;
        }
        // 清理服务
        this._services.clear();
        // 标记为未初始化
        this._initialized = false;
    }
    /**
     * 获取模块健康状态
     * @returns 健康状态
     */
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        const services = {};
        const protocols = {};
        // 检查服务健康状态
        for (const [serviceName] of this._services) {
            try {
                // TODO: 实现服务健康检查接口
                services[serviceName] = 'healthy';
            }
            catch (error) {
                services[serviceName] = 'unhealthy';
            }
        }
        // 检查协议健康状态
        if (this._protocolFactory) {
            try {
                const factoryHealth = await this._protocolFactory.healthCheck();
                Object.assign(protocols, factoryHealth.instances);
            }
            catch (error) {
                protocols['factory'] = 'critical';
            }
        }
        // 确定整体健康状态
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
    /**
     * 关闭模块容器
     */
    async shutdown() {
        // 关闭协议工厂
        if (this._protocolFactory) {
            await this._protocolFactory.cleanup();
        }
        // 清理服务
        this._services.clear();
        this._initialized = false;
        // TODO: 使用统一的日志系统替代console.log
        // console.log('[DialogModule] Container shutdown successfully');
    }
    // ===== 私有服务注册方法 =====
    /**
     * 注册核心服务
     */
    async _registerCoreServices() {
        // 注册Mapper
        this._services.set('dialogMapper', new dialog_mapper_1.DialogMapper());
        // TODO: 等待CoreOrchestrator激活核心服务注册
        // 预期功能：注册核心业务服务和领域服务
    }
    /**
     * 注册应用服务
     */
    async _registerApplicationServices() {
        // 创建仓库适配器
        const dialogRepository = new dialog_adapter_1.DialogAdapter();
        this._services.set('dialogRepository', dialogRepository);
        // 创建应用服务
        const dialogManagementService = new dialog_management_service_1.DialogManagementService(dialogRepository, {} // 等待CoreOrchestrator激活
        );
        this._services.set('dialogManagementService', dialogManagementService);
        // 创建领域服务
        const domainService = {
            validateDialogCreation: (_dialogData) => ({
                isValid: true,
                violations: [],
                recommendations: []
            }),
            calculateDialogComplexity: (_dialogData) => 0.5, // 返回0-1之间的复杂度分数
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
        // 创建WebSocket处理器
        let connectionCount = 0;
        const connections = new Map();
        const webSocketHandler = {
            addConnection: async (connection) => {
                connectionCount++;
                connections.set(connection.id, connection);
                // TODO: 等待CoreOrchestrator激活WebSocket连接管理
            },
            removeConnection: async (connectionId) => {
                if (connections.has(connectionId)) {
                    connections.delete(connectionId);
                    connectionCount = Math.max(0, connectionCount - 1);
                }
                // TODO: 等待CoreOrchestrator激活WebSocket连接管理
            },
            getStatus: async () => ({
                connections: connectionCount,
                totalConnections: connectionCount,
                activeConnections: connectionCount,
                connectionHealth: 'healthy'
            }),
            broadcastMessage: async (message) => {
                // 向所有连接广播消息
                const messageStr = JSON.stringify(message);
                for (const connection of connections.values()) {
                    connection.send(messageStr);
                }
            },
            handleMessage: async (_connection, _message) => {
                // TODO: 等待CoreOrchestrator激活WebSocket消息处理
                // 预期功能：处理来自客户端的WebSocket消息
            },
            broadcast: async (message) => {
                // 向所有连接广播消息
                const messageStr = JSON.stringify(message);
                for (const connection of connections.values()) {
                    connection.send(messageStr);
                }
            }
        };
        this._services.set('webSocketHandler', webSocketHandler);
    }
    /**
     * 注册基础设施服务
     */
    async _registerInfrastructureServices() {
        // 注册适配器
        const dialogAdapter = new dialog_adapter_1.DialogAdapter();
        await dialogAdapter.initialize(); // 初始化适配器
        this._services.set('dialogAdapter', dialogAdapter);
        // TODO: 等待CoreOrchestrator激活基础设施服务注册
        // 预期功能：注册数据库、缓存、消息队列等基础设施服务
    }
    /**
     * 注册API服务
     */
    async _registerApiServices() {
        // 获取应用服务
        const dialogManagementService = this._services.get('dialogManagementService');
        // 创建控制器
        const dialogController = new dialog_controller_1.DialogController(dialogManagementService);
        this._services.set('dialogController', dialogController);
        // TODO: 等待CoreOrchestrator激活API服务注册
        // 预期功能：注册路由、中间件、API文档等
    }
}
exports.DialogModuleContainer = DialogModuleContainer;
/**
 * Dialog模块类
 * 模块的主要入口点
 */
class DialogModule {
    constructor(config) {
        this._config = config;
        this._container = new DialogModuleContainer(config);
    }
    /**
     * 初始化模块
     */
    async initialize() {
        await this._container.initialize();
        // TODO: 使用统一的日志系统替代console.log
        // console.log('[DialogModule] Module initialized successfully');
    }
    /**
     * 获取模块容器
     * @returns 依赖注入容器
     */
    getContainer() {
        return this._container;
    }
    /**
     * 获取模块配置
     * @returns 模块配置
     */
    getConfig() {
        return this._config;
    }
    /**
     * 更新模块配置
     * @param newConfig 新配置
     */
    async updateConfig(newConfig) {
        this._config = { ...this._config, ...newConfig };
        // TODO: 重新配置容器和服务
    }
    /**
     * 关闭模块
     */
    async shutdown() {
        await this._container.shutdown();
        // TODO: 使用统一的日志系统替代console.log
        // console.log('[DialogModule] Module shutdown successfully');
    }
}
exports.DialogModule = DialogModule;
/**
 * 创建默认Dialog模块配置
 * @param environment 环境
 * @returns 默认配置
 */
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
/**
 * 创建Dialog模块
 * @param options - 模块配置选项
 * @returns Promise<DialogModuleCreationResult> - 初始化结果
 */
async function createDialogModule(options = {}) {
    const startTime = Date.now();
    try {
        // 准备模块配置
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
        // 创建模块容器
        const container = new DialogModuleContainer(config);
        // 初始化模块
        await container.initialize();
        const endTime = Date.now();
        const initializationTime = endTime - startTime;
        return {
            success: true,
            module: container,
            performance: {
                initializationTime,
                memoryUsage: process.memoryUsage().heapUsed,
                componentCount: 10 // 估算的组件数量
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
/**
 * 默认导出：创建Dialog模块函数
 */
exports.default = createDialogModule;
// ===== 企业级标准接口 =====
/**
 * 创建Dialog模块组件
 */
function createDialogModuleComponents() {
    // 创建WebSocket处理器
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
            // TODO: 等待CoreOrchestrator激活WebSocket消息处理
        },
        broadcast: async (message) => {
            const messageStr = JSON.stringify(message);
            for (const connection of connections.values()) {
                connection.send(messageStr);
            }
        }
    };
    // 创建领域服务
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
    // 创建模块适配器
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
        // MPLP模块集成接口
        setContextModuleInterface: (_contextInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setPlanModuleInterface: (_planInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setRoleModuleInterface: (_roleInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setConfirmModuleInterface: (_confirmInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setTraceModuleInterface: (_traceInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setExtensionModuleInterface: (_extensionInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setCoreModuleInterface: (_coreInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setCollabModuleInterface: (_collabInterface) => {
            // TODO: 等待CoreOrchestrator激活
        },
        setNetworkModuleInterface: (_networkInterface) => {
            // TODO: 等待CoreOrchestrator激活
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
/**
 * 企业级Dialog模块初始化函数
 * @description 基于Context、Plan、Role、Confirm模块的企业级标准
 */
async function initializeDialogModule() {
    // 创建模块容器
    const container = new DialogModuleContainer(createDefaultDialogModuleConfig());
    await container.initialize();
    // 获取核心组件
    const dialogManagementService = container.getService('dialogManagementService');
    const dialogController = container.getService('dialogController');
    // 创建企业级组件
    const components = createDialogModuleComponents();
    return {
        // 核心组件
        controller: dialogController,
        commandHandler: dialogManagementService,
        queryHandler: dialogManagementService,
        repository: container.getService('dialogRepository'),
        protocol: container.getProtocol(),
        moduleAdapter: components.moduleAdapter,
        webSocketHandler: components.webSocketHandler,
        domainService: components.domainService,
        // 模块生命周期方法
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
//# sourceMappingURL=module.js.map