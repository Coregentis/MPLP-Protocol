"use strict";
/**
 * Role模块适配器
 *
 * @description 基于Context、Plan、Confirm模块的企业级标准，提供Role模块的统一访问接口和外部系统集成 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @integration 统一L3管理器注入模式，与Context/Plan/Confirm模块IDENTICAL架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModuleAdapter = void 0;
const role_controller_1 = require("../../api/controllers/role.controller");
const role_management_service_1 = require("../../application/services/role-management.service");
const role_repository_1 = require("../repositories/role.repository");
const database_role_repository_1 = require("../repositories/database-role.repository");
const role_protocol_1 = require("../protocols/role.protocol");
const role_logger_service_1 = require("../services/role-logger.service");
const role_cache_service_1 = require("../services/role-cache.service");
const role_performance_service_1 = require("../services/role-performance.service");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Role模块适配器
 *
 * @description 基于Context、Plan、Confirm模块的企业级标准，提供Role模块的统一访问接口和外部系统集成
 * @pattern 企业级RBAC安全中心，统一L3管理器注入模式
 */
class RoleModuleAdapter {
    constructor(config = {}) {
        this.initialized = false;
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: true,
            enableSecurity: true,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000, // 5分钟
            securityLevel: 'enterprise',
            auditLevel: 'comprehensive',
            ...config
        };
        // 初始化统一日志服务
        this.logger = (0, role_logger_service_1.createRoleLogger)({
            level: role_logger_service_1.LogLevel.INFO,
            enableConsole: this.config.enableLogging,
            enableStructured: true,
            module: 'RoleAdapter',
            environment: process.env.NODE_ENV || 'development'
        });
        // 初始化缓存服务
        this.cacheService = (0, role_cache_service_1.createRoleCacheService)({
            maxSize: this.config.maxCacheSize,
            defaultTTL: Math.floor(this.config.cacheTimeout / 1000), // 转换为秒
            enableMetrics: this.config.enableMetrics,
            enablePrewarming: this.config.enableCaching,
            evictionPolicy: 'lru',
            compressionEnabled: false,
            persistenceEnabled: false,
            cleanupInterval: 60000 // 1分钟
        }, {
            enabled: this.config.enableCaching,
            strategies: ['popular_roles', 'permission_cache'],
            batchSize: 50,
            intervalMs: 300000 // 5分钟
        });
        // 初始化性能监控服务
        this.performanceService = (0, role_performance_service_1.createRolePerformanceService)({
            enabled: this.config.enableMetrics,
            collectionInterval: 30000, // 30秒
            retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
            alertThresholds: {
                'permission_check_latency_ms': 10,
                'role_operation_latency_ms': 100,
                'memory_usage_mb': 256,
                'error_rate_percent': 5,
                'cache_hit_rate_percent': 80
            },
            benchmarkEnabled: true,
            realTimeAlertsEnabled: this.config.enableMetrics,
            detailedTracing: this.config.enableLogging,
            optimizationEnabled: true
        });
    }
    /**
     * 初始化Role模块适配器
     * @description 基于Context/Plan/Confirm模块的企业级标准初始化流程
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            // ===== 步骤1: 初始化9个L3横切关注点管理器 =====
            await this.initializeCrossCuttingConcerns();
            // ===== 步骤2: 初始化仓库层 =====
            await this.initializeRepository();
            // ===== 步骤3: 初始化应用服务层 =====
            await this.initializeService();
            // ===== 步骤4: 初始化协议层 =====
            await this.initializeProtocol();
            // ===== 步骤5: 初始化API控制器层 =====
            await this.initializeController();
            // ===== 步骤6: 执行健康检查 =====
            await this.performHealthCheck();
            this.initialized = true;
            if (this.config.enableLogging) {
                this.logger.info('Role模块适配器初始化完成 - 企业级RBAC安全中心', {
                    securityLevel: this.config.securityLevel,
                    auditLevel: this.config.auditLevel,
                    repositoryType: this.config.repositoryType,
                    enableCaching: this.config.enableCaching,
                    enableMetrics: this.config.enableMetrics
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Role模块适配器初始化失败', error instanceof Error ? error : undefined, {
                errorMessage
            });
            throw new Error(`Role module adapter initialization failed: ${errorMessage}`);
        }
    }
    /**
     * 初始化9个L3横切关注点管理器
     * @description 与Context/Plan/Confirm模块使用IDENTICAL的初始化模式
     */
    async initializeCrossCuttingConcerns() {
        // 创建所有9个L3管理器实例的简化版本
        this.securityManager = new cross_cutting_concerns_1.MLPPSecurityManager();
        this.performanceMonitor = new cross_cutting_concerns_1.MLPPPerformanceMonitor();
        this.eventBusManager = new cross_cutting_concerns_1.MLPPEventBusManager();
        this.errorHandler = new cross_cutting_concerns_1.MLPPErrorHandler();
        this.coordinationManager = new cross_cutting_concerns_1.MLPPCoordinationManager();
        this.orchestrationManager = new cross_cutting_concerns_1.MLPPOrchestrationManager();
        this.stateSyncManager = new cross_cutting_concerns_1.MLPPStateSyncManager();
        this.transactionManager = new cross_cutting_concerns_1.MLPPTransactionManager();
        this.protocolVersionManager = new cross_cutting_concerns_1.MLPPProtocolVersionManager();
    }
    /**
     * 初始化仓库层
     */
    async initializeRepository() {
        switch (this.config.repositoryType) {
            case 'memory':
                this.repository = new role_repository_1.MemoryRoleRepository();
                break;
            case 'database': {
                // 创建数据库客户端实现
                const dbClient = this.createDatabaseClient();
                const dbConfig = {
                    host: process.env.MPLP_DB_HOST || 'localhost',
                    port: parseInt(process.env.MPLP_DB_PORT || '3306'),
                    database: process.env.MPLP_DB_NAME || 'mplp_roles',
                    username: process.env.MPLP_DB_USER || 'mplp_user',
                    password: process.env.MPLP_DB_PASSWORD || 'mplp_password',
                    ssl: process.env.MPLP_DB_SSL === 'true',
                    connectionTimeout: 30000,
                    maxConnections: 10,
                    minConnections: 2
                };
                this.repository = new database_role_repository_1.DatabaseRoleRepository(dbClient, dbConfig);
                break;
            }
            case 'file':
                // 创建文件仓库实现（简化版）
                this.repository = new role_repository_1.MemoryRoleRepository(); // 临时使用内存仓库
                console.warn('File repository not fully implemented, using memory repository as fallback');
                break;
            default:
                throw new Error(`Unsupported repository type: ${this.config.repositoryType}`);
        }
    }
    /**
     * 初始化应用服务层
     */
    async initializeService() {
        this.service = new role_management_service_1.RoleManagementService(this.repository);
    }
    /**
     * 初始化协议层
     */
    async initializeProtocol() {
        this.protocol = new role_protocol_1.RoleProtocol(this.service, 
        // 注入所有9个L3横切关注点管理器
        this.securityManager, this.performanceMonitor, this.eventBusManager, this.errorHandler, this.coordinationManager, this.orchestrationManager, this.stateSyncManager, this.transactionManager, this.protocolVersionManager);
    }
    /**
     * 初始化API控制器层
     */
    async initializeController() {
        this.controller = new role_controller_1.RoleController(this.service);
    }
    /**
     * 执行健康检查
     */
    async performHealthCheck() {
        const healthStatus = await this.protocol.healthCheck();
        if (healthStatus.status !== 'healthy') {
            throw new Error(`Role module health check failed: ${JSON.stringify(healthStatus)}`);
        }
    }
    /**
     * 获取Role控制器
     */
    getRoleController() {
        this.ensureInitialized();
        return this.controller;
    }
    /**
     * 获取Role服务
     */
    getRoleService() {
        this.ensureInitialized();
        return this.service;
    }
    /**
     * 获取Role协议
     */
    getRoleProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    /**
     * 获取Role仓库
     */
    getRoleRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    /**
     * 获取安全管理器
     */
    getSecurityManager() {
        this.ensureInitialized();
        return this.securityManager;
    }
    /**
     * 获取性能监控器
     */
    getPerformanceMonitor() {
        this.ensureInitialized();
        return this.performanceMonitor;
    }
    /**
     * 获取事件总线管理器
     */
    getEventBusManager() {
        this.ensureInitialized();
        return this.eventBusManager;
    }
    /**
     * 获取协调管理器
     */
    getCoordinationManager() {
        this.ensureInitialized();
        return this.coordinationManager;
    }
    /**
     * 获取模块健康状态
     */
    async getHealthStatus() {
        try {
            this.ensureInitialized();
            const protocolHealth = await this.protocol.healthCheck();
            return {
                status: protocolHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    initialized: this.initialized,
                    config: this.config,
                    protocolHealth: protocolHealth,
                    module: 'role',
                    type: 'enterprise_rbac_security_center'
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    initialized: this.initialized,
                    module: 'role'
                }
            };
        }
    }
    /**
     * 销毁适配器
     */
    async destroy() {
        if (!this.initialized) {
            return;
        }
        try {
            // 清理资源
            // 横切关注点管理器的清理将在未来实现
            this.initialized = false;
            // 销毁缓存服务
            await this.cacheService.destroy();
            // 销毁性能监控服务
            await this.performanceService.destroy();
            if (this.config.enableLogging) {
                this.logger.info('Role模块适配器已销毁');
            }
        }
        catch (error) {
            this.logger.error('Role模块适配器销毁失败', error instanceof Error ? error : undefined, {
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * 获取缓存统计信息
     */
    getCacheMetrics() {
        this.ensureInitialized();
        return this.cacheService.getMetrics();
    }
    /**
     * 获取缓存健康状态
     */
    getCacheHealth() {
        this.ensureInitialized();
        return this.cacheService.getHealthStatus();
    }
    /**
     * 执行缓存预热
     */
    async warmupCache(data) {
        this.ensureInitialized();
        await this.cacheService.warmup(data);
        this.logger.info('Cache warmup initiated', {
            rolesCount: data.roles?.length || 0,
            permissionsCount: data.permissions?.length || 0,
            statisticsCount: data.statistics?.length || 0
        });
    }
    /**
     * 清空缓存
     */
    async clearCache() {
        this.ensureInitialized();
        await this.cacheService.clear();
        this.logger.info('Cache cleared manually');
    }
    /**
     * 按标签删除缓存
     */
    async clearCacheByTags(tags) {
        this.ensureInitialized();
        const deletedCount = await this.cacheService.deleteByTags(tags);
        this.logger.info('Cache cleared by tags', { tags, deletedCount });
        return deletedCount;
    }
    /**
     * 获取性能统计信息
     */
    getPerformanceStats() {
        this.ensureInitialized();
        return this.performanceService.getPerformanceStats();
    }
    /**
     * 获取性能健康状态
     */
    getPerformanceHealth() {
        this.ensureInitialized();
        return this.performanceService.getHealthStatus();
    }
    /**
     * 获取未解决的性能告警
     */
    getPerformanceAlerts() {
        this.ensureInitialized();
        return this.performanceService.getUnresolvedAlerts();
    }
    /**
     * 解决性能告警
     */
    async resolvePerformanceAlert(alertId) {
        this.ensureInitialized();
        const resolved = await this.performanceService.resolveAlert(alertId);
        if (resolved) {
            this.logger.info('Performance alert resolved', { alertId });
        }
        else {
            this.logger.warn('Failed to resolve performance alert', { alertId });
        }
        return resolved;
    }
    /**
     * 重置性能基准
     */
    resetPerformanceBenchmarks() {
        this.ensureInitialized();
        this.performanceService.resetBenchmarks();
        this.logger.info('Performance benchmarks reset');
    }
    /**
     * 优化权限检查操作
     */
    async optimizePermissionCheck(operation, context) {
        this.ensureInitialized();
        return this.performanceService.optimizePermissionCheck(operation, context);
    }
    /**
     * 确保适配器已初始化
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Role module adapter not initialized. Call initialize() first.');
        }
    }
    /**
     * 创建数据库客户端
     */
    createDatabaseClient() {
        // 简化的数据库客户端实现（生产环境应使用真实的数据库连接池）
        return {
            async query(sql, params) {
                console.log(`Database Query: ${sql}`, params);
                // 在生产环境中，这里应该连接到真实的数据库
                // 当前返回模拟数据用于演示
                return [];
            },
            async execute(sql, params) {
                console.log(`Database Execute: ${sql}`, params);
                // 在生产环境中，这里应该执行真实的数据库操作
                return { affectedRows: 1, insertId: `role-${Date.now()}` };
            },
            async transaction(callback) {
                console.log('Starting database transaction');
                // 在生产环境中，这里应该开启真实的数据库事务
                return await callback(this);
            },
            async close() {
                console.log('Closing database connection');
                // 在生产环境中，这里应该关闭数据库连接
            }
        };
    }
}
exports.RoleModuleAdapter = RoleModuleAdapter;
//# sourceMappingURL=role-module.adapter.js.map