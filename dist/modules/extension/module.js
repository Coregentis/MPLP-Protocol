"use strict";
/**
 * Extension模块主入口
 *
 * @description Extension模块的主要入口点，实现IMLPPProtocol接口和模块初始化
 * @version 1.0.0
 * @layer 模块层 - 主入口
 * @pattern MPLP协议实现 + 模块初始化 + 依赖注入
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionModule = void 0;
exports.createExtensionModule = createExtensionModule;
exports.initializeExtensionModule = initializeExtensionModule;
const extension_management_service_1 = require("./application/services/extension-management.service");
const extension_repository_1 = require("./infrastructure/repositories/extension.repository");
/**
 * Extension模块类
 * 实现MPLP协议接口，提供扩展管理的完整功能
 */
class ExtensionModule {
    constructor() {
        // 模块状态
        this.isInitialized = false;
        this.moduleOptions = {};
        this.initializationTime = 0;
    }
    // ============================================================================
    // IMLPPProtocol接口实现
    // ============================================================================
    /**
     * 初始化Extension模块
     * @param config - 模块配置
     */
    async initialize(config) {
        if (this.isInitialized) {
            // Module is already initialized
            return;
        }
        try {
            // 解析配置
            this.moduleOptions = this.parseConfiguration(config);
            // 初始化仓储层
            await this.initializeRepository();
            // 初始化服务层
            await this.initializeServices();
            // 初始化横切关注点
            if (this.moduleOptions.enableCrossCuttingConcerns !== false) {
                await this.initializeCrossCuttingConcerns();
            }
            // 标记为已初始化
            this.isInitialized = true;
            this.initializationTime = Date.now();
            // Module initialized successfully
            // 记录初始化指标
            if (this.moduleOptions.enableMetrics) {
                await this.recordInitializationMetrics();
            }
        }
        catch (error) {
            // Failed to initialize module
            throw new Error(`Extension module initialization failed: ${error.message}`);
        }
    }
    /**
     * 关闭Extension模块
     */
    async shutdown() {
        if (!this.isInitialized) {
            // Module is not initialized
            return;
        }
        try {
            // Shutting down module...
            // 清理资源
            await this.cleanupResources();
            // 重置状态
            this.isInitialized = false;
            this.extensionManagementService = undefined;
            this.extensionRepository = undefined;
            // Module shutdown completed
        }
        catch (error) {
            // Error during shutdown
            throw new Error(`Extension module shutdown failed: ${error.message}`);
        }
    }
    /**
     * 获取模块元数据
     */
    getMetadata() {
        return {
            name: 'Extension',
            version: '1.0.0',
            description: 'MPLP Extension Management Module - Enterprise-grade extension lifecycle management',
            author: 'MPLP Development Team',
            dependencies: [
                'mplp-coordination',
                'mplp-error-handling',
                'mplp-event-bus',
                'mplp-orchestration',
                'mplp-performance',
                'mplp-protocol-version',
                'mplp-security',
                'mplp-state-sync',
                'mplp-transaction'
            ]
        };
    }
    /**
     * 执行协议操作
     */
    async executeOperation(request) {
        const timestamp = new Date().toISOString();
        try {
            switch (request.operation) {
                case 'create_extension': {
                    const createResult = await this.createExtension(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: createResult
                    };
                }
                case 'get_extension': {
                    const getResult = await this.getExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: getResult
                    };
                }
                case 'list_extensions': {
                    const listResult = await this.listExtensions(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: listResult
                    };
                }
                default:
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'error',
                        success: false,
                        error: `Unsupported operation: ${request.operation}`
                    };
            }
        }
        catch (error) {
            return {
                protocolVersion: request.protocolVersion,
                timestamp,
                requestId: request.requestId,
                status: 'error',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 获取协议元数据
     */
    getProtocolMetadata() {
        return {
            name: 'extension',
            version: '1.0.0',
            description: 'MPLP Extension Management Protocol - Multi-Agent Protocol Lifecycle Platform Extension Management',
            capabilities: [
                'extension-lifecycle-management',
                'plugin-coordination',
                'ai-driven-recommendations',
                'security-validation',
                'performance-monitoring',
                'cross-cutting-concerns-integration',
                'distributed-extension-management',
                'enterprise-grade-features'
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
            ],
            supportedOperations: [
                'create_extension',
                'update_extension',
                'delete_extension',
                'get_extension',
                'list_extensions',
                'activate_extension',
                'deactivate_extension',
                'query_extensions',
                'get_health_status'
            ]
        };
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        if (!this.isInitialized) {
            return {
                status: 'unhealthy',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: false,
                    repository: 'disconnected'
                },
                checks: [
                    {
                        name: 'initialization',
                        status: 'fail',
                        message: 'Module not initialized'
                    }
                ]
            };
        }
        try {
            // 检查核心服务
            if (!this.extensionManagementService) {
                checks.push({
                    name: 'extension_management_service',
                    status: 'fail',
                    message: 'ExtensionManagementService not available'
                });
            }
            else {
                checks.push({
                    name: 'extension_management_service',
                    status: 'pass',
                    message: 'ExtensionManagementService operational'
                });
            }
            // 检查仓储连接
            if (!this.extensionRepository) {
                checks.push({
                    name: 'repository',
                    status: 'fail',
                    message: 'ExtensionRepository not available'
                });
            }
            else {
                checks.push({
                    name: 'repository',
                    status: 'pass',
                    message: 'ExtensionRepository connected'
                });
            }
            // 执行服务健康检查
            const serviceHealthStatus = this.extensionManagementService
                ? await this.extensionManagementService.getHealthStatus()
                : { status: 'unhealthy' };
            const isHealthy = serviceHealthStatus.status === 'healthy';
            return {
                status: isHealthy ? 'healthy' : 'degraded',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: true,
                    repository: 'connected',
                    service: serviceHealthStatus.status,
                    uptime: Date.now() - this.initializationTime,
                    crossCuttingConcerns: this.moduleOptions.enableCrossCuttingConcerns ? 'enabled' : 'disabled'
                },
                checks
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: this.isInitialized,
                    repository: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                checks: [
                    {
                        name: 'health_check',
                        status: 'fail',
                        message: error instanceof Error ? error.message : 'Health check failed'
                    }
                ]
            };
        }
    }
    /**
     * 获取模块版本
     */
    getVersion() {
        return '1.0.0';
    }
    // ============================================================================
    // 公共API方法
    // ============================================================================
    /**
     * 获取扩展管理服务
     * @returns ExtensionManagementService实例
     */
    getExtensionManagementService() {
        if (!this.isInitialized || !this.extensionManagementService) {
            throw new Error('Extension module is not initialized');
        }
        return this.extensionManagementService;
    }
    /**
     * 获取横切关注点服务 (现已集成到ExtensionManagementService中)
     * @returns ExtensionManagementService实例
     */
    getCrossCuttingConcernsService() {
        return this.getExtensionManagementService();
    }
    /**
     * 创建扩展的便捷方法
     * @param request - 创建扩展请求
     * @returns Promise<ExtensionEntityData> - 创建的扩展数据
     */
    async createExtension(request) {
        const service = this.getExtensionManagementService();
        // 构建完整的创建请求
        const fullRequest = {
            ...request,
            compatibility: {
                mplpVersion: '1.0.0',
                requiredModules: [],
                dependencies: [],
                conflicts: []
            },
            configuration: {
                schema: {},
                currentConfig: {},
                defaultConfig: {},
                validationRules: []
            },
            security: {
                sandboxEnabled: true,
                resourceLimits: {
                    maxMemory: 100 * 1024 * 1024, // 100MB
                    maxCpu: 50, // 50%
                    maxFileSize: 10 * 1024 * 1024, // 10MB
                    maxNetworkConnections: 10,
                    allowedDomains: [],
                    blockedDomains: [],
                    allowedHosts: [],
                    allowedPorts: [80, 443],
                    protocols: ['http', 'https']
                },
                codeSigning: {
                    required: false,
                    trustedSigners: []
                },
                permissions: {
                    fileSystem: { read: [], write: [], execute: [] },
                    network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                    database: { read: [], write: [], admin: [] },
                    api: { endpoints: [], methods: [], rateLimit: 100 }
                }
            },
            metadata: {
                author: { name: 'Unknown' },
                license: { type: 'MIT' },
                keywords: [],
                category: 'general',
                screenshots: []
            }
        };
        return await service.createExtension(fullRequest);
    }
    /**
     * 获取扩展的便捷方法
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionEntityData | null> - 扩展数据或null
     */
    async getExtension(extensionId) {
        const service = this.getExtensionManagementService();
        return await service.getExtensionById(extensionId);
    }
    /**
     * 激活扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否激活成功
     */
    async activateExtension(extensionId, userId) {
        const service = this.getExtensionManagementService();
        return await service.activateExtension({ extensionId, userId });
    }
    /**
     * 停用扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否停用成功
     */
    async deactivateExtension(extensionId, userId) {
        const service = this.getExtensionManagementService();
        return await service.deactivateExtension(extensionId, userId);
    }
    /**
     * 更新扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param updateData - 更新数据
     * @returns Promise<ExtensionEntityData | null> - 更新后的扩展数据或null
     */
    async updateExtension(extensionId, updateData) {
        const service = this.getExtensionManagementService();
        try {
            const result = await service.updateExtension({
                extensionId,
                ...updateData
            });
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return null;
            }
            throw error;
        }
    }
    /**
     * 列出扩展的便捷方法
     * @param options - 查询选项
     * @returns Promise<{extensions: ExtensionEntityData[], totalCount: number, hasMore: boolean}> - 扩展列表
     */
    async listExtensions(options = {}) {
        const service = this.getExtensionManagementService();
        return await service.listExtensions(options);
    }
    /**
     * 删除扩展的便捷方法
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否删除成功
     */
    async deleteExtension(extensionId) {
        const service = this.getExtensionManagementService();
        return await service.deleteExtension(extensionId);
    }
    /**
     * 获取活动扩展的便捷方法
     * @param contextId - 可选的上下文ID过滤
     * @returns Promise<ExtensionEntityData[]> - 活动扩展数组
     */
    async getActiveExtensions(contextId) {
        const service = this.getExtensionManagementService();
        return await service.getActiveExtensions(contextId);
    }
    // ============================================================================
    // 私有初始化方法
    // ============================================================================
    /**
     * 解析配置
     */
    parseConfiguration(config) {
        const defaultOptions = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: true,
            repositoryType: 'memory',
            extensionRetentionDays: 90,
            maxExtensionsPerContext: 100,
            enablePerformanceMonitoring: true,
            enableSecurityValidation: true,
            enableEventPublishing: true,
            enableCrossCuttingConcerns: true
        };
        return { ...defaultOptions, ...config };
    }
    /**
     * 初始化仓储层
     */
    async initializeRepository() {
        switch (this.moduleOptions.repositoryType) {
            case 'memory':
                this.extensionRepository = new extension_repository_1.ExtensionRepository();
                break;
            case 'database':
                // TODO: 实现数据库仓储
                throw new Error('Database repository not implemented yet');
            case 'file':
                // TODO: 实现文件仓储
                throw new Error('File repository not implemented yet');
            default:
                throw new Error(`Unknown repository type: ${this.moduleOptions.repositoryType}`);
        }
        // Repository initialized
    }
    /**
     * 初始化服务层
     */
    async initializeServices() {
        if (!this.extensionRepository) {
            throw new Error('Repository must be initialized before services');
        }
        // 初始化扩展管理服务
        this.extensionManagementService = new extension_management_service_1.ExtensionManagementService(this.extensionRepository);
        // Services initialized successfully
    }
    /**
     * 初始化横切关注点 (现已集成到ExtensionManagementService中)
     */
    async initializeCrossCuttingConcerns() {
        // 横切关注点现已集成到ExtensionManagementService中，无需单独初始化
        // console.log('[ExtensionModule] Cross-cutting concerns integrated into ExtensionManagementService');
    }
    /**
     * 记录初始化指标
     */
    async recordInitializationMetrics() {
        // TODO: 实现指标记录
        // Initialization metrics recorded
    }
    /**
     * 清理资源
     */
    async cleanupResources() {
        // TODO: 实现资源清理逻辑
        // Resources cleaned up
    }
}
exports.ExtensionModule = ExtensionModule;
// ============================================================================
// 模块工厂函数
// ============================================================================
/**
 * 创建Extension模块实例
 * @param options - 模块配置选项
 * @returns ExtensionModule实例
 */
function createExtensionModule(_options) {
    return new ExtensionModule();
}
/**
 * 初始化Extension模块的便捷函数
 * @param options - 模块配置选项
 * @returns Promise<ExtensionModule> - 初始化后的模块实例
 */
async function initializeExtensionModule(options) {
    const module = createExtensionModule(options);
    await module.initialize(options);
    return module;
}
// ============================================================================
// 默认导出
// ============================================================================
exports.default = ExtensionModule;
//# sourceMappingURL=module.js.map