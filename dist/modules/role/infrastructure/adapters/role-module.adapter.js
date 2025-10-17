"use strict";
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
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class RoleModuleAdapter {
    config;
    initialized = false;
    logger;
    cacheService;
    performanceService;
    repository;
    service;
    controller;
    protocol;
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
            enableMetrics: true,
            enableSecurity: true,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000,
            securityLevel: 'enterprise',
            auditLevel: 'comprehensive',
            ...config
        };
        this.logger = (0, role_logger_service_1.createRoleLogger)({
            level: role_logger_service_1.LogLevel.INFO,
            enableConsole: this.config.enableLogging,
            enableStructured: true,
            module: 'RoleAdapter',
            environment: process.env.NODE_ENV || 'development'
        });
        this.cacheService = (0, role_cache_service_1.createRoleCacheService)({
            maxSize: this.config.maxCacheSize,
            defaultTTL: Math.floor(this.config.cacheTimeout / 1000),
            enableMetrics: this.config.enableMetrics,
            enablePrewarming: this.config.enableCaching,
            evictionPolicy: 'lru',
            compressionEnabled: false,
            persistenceEnabled: false,
            cleanupInterval: 60000
        }, {
            enabled: this.config.enableCaching,
            strategies: ['popular_roles', 'permission_cache'],
            batchSize: 50,
            intervalMs: 300000
        });
        this.performanceService = (0, role_performance_service_1.createRolePerformanceService)({
            enabled: this.config.enableMetrics,
            collectionInterval: 30000,
            retentionPeriod: 24 * 60 * 60 * 1000,
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
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            await this.initializeCrossCuttingConcerns();
            await this.initializeRepository();
            await this.initializeService();
            await this.initializeProtocol();
            await this.initializeController();
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
    async initializeCrossCuttingConcerns() {
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
    async initializeRepository() {
        switch (this.config.repositoryType) {
            case 'memory':
                this.repository = new role_repository_1.MemoryRoleRepository();
                break;
            case 'database': {
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
                this.repository = new role_repository_1.MemoryRoleRepository();
                console.warn('File repository not fully implemented, using memory repository as fallback');
                break;
            default:
                throw new Error(`Unsupported repository type: ${this.config.repositoryType}`);
        }
    }
    async initializeService() {
        this.service = new role_management_service_1.RoleManagementService(this.repository);
    }
    async initializeProtocol() {
        this.protocol = new role_protocol_1.RoleProtocol(this.service, this.securityManager, this.performanceMonitor, this.eventBusManager, this.errorHandler, this.coordinationManager, this.orchestrationManager, this.stateSyncManager, this.transactionManager, this.protocolVersionManager);
    }
    async initializeController() {
        this.controller = new role_controller_1.RoleController(this.service);
    }
    async performHealthCheck() {
        const healthStatus = await this.protocol.healthCheck();
        if (healthStatus.status !== 'healthy') {
            throw new Error(`Role module health check failed: ${JSON.stringify(healthStatus)}`);
        }
    }
    getRoleController() {
        this.ensureInitialized();
        return this.controller;
    }
    getRoleService() {
        this.ensureInitialized();
        return this.service;
    }
    getRoleProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    getRoleRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    getSecurityManager() {
        this.ensureInitialized();
        return this.securityManager;
    }
    getPerformanceMonitor() {
        this.ensureInitialized();
        return this.performanceMonitor;
    }
    getEventBusManager() {
        this.ensureInitialized();
        return this.eventBusManager;
    }
    getCoordinationManager() {
        this.ensureInitialized();
        return this.coordinationManager;
    }
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
    async destroy() {
        if (!this.initialized) {
            return;
        }
        try {
            this.initialized = false;
            await this.cacheService.destroy();
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
    getCacheMetrics() {
        this.ensureInitialized();
        return this.cacheService.getMetrics();
    }
    getCacheHealth() {
        this.ensureInitialized();
        return this.cacheService.getHealthStatus();
    }
    async warmupCache(data) {
        this.ensureInitialized();
        await this.cacheService.warmup(data);
        this.logger.info('Cache warmup initiated', {
            rolesCount: data.roles?.length || 0,
            permissionsCount: data.permissions?.length || 0,
            statisticsCount: data.statistics?.length || 0
        });
    }
    async clearCache() {
        this.ensureInitialized();
        await this.cacheService.clear();
        this.logger.info('Cache cleared manually');
    }
    async clearCacheByTags(tags) {
        this.ensureInitialized();
        const deletedCount = await this.cacheService.deleteByTags(tags);
        this.logger.info('Cache cleared by tags', { tags, deletedCount });
        return deletedCount;
    }
    getPerformanceStats() {
        this.ensureInitialized();
        return this.performanceService.getPerformanceStats();
    }
    getPerformanceHealth() {
        this.ensureInitialized();
        return this.performanceService.getHealthStatus();
    }
    getPerformanceAlerts() {
        this.ensureInitialized();
        return this.performanceService.getUnresolvedAlerts();
    }
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
    resetPerformanceBenchmarks() {
        this.ensureInitialized();
        this.performanceService.resetBenchmarks();
        this.logger.info('Performance benchmarks reset');
    }
    async optimizePermissionCheck(operation, context) {
        this.ensureInitialized();
        return this.performanceService.optimizePermissionCheck(operation, context);
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Role module adapter not initialized. Call initialize() first.');
        }
    }
    createDatabaseClient() {
        return {
            async query(sql, params) {
                console.log(`Database Query: ${sql}`, params);
                return [];
            },
            async execute(sql, params) {
                console.log(`Database Execute: ${sql}`, params);
                return { affectedRows: 1, insertId: `role-${Date.now()}` };
            },
            async transaction(callback) {
                console.log('Starting database transaction');
                return await callback(this);
            },
            async close() {
                console.log('Closing database connection');
            }
        };
    }
}
exports.RoleModuleAdapter = RoleModuleAdapter;
