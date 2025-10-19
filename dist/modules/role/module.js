"use strict";
/**
 * Role模块初始化
 *
 * @description Role模块的统一初始化和配置管理，基于Context、Plan、Confirm模块的企业级标准 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_MODULE_METADATA = exports.ROLE_MODULE_VERSION = void 0;
exports.initializeRoleModule = initializeRoleModule;
exports.createDefaultRoleModule = createDefaultRoleModule;
exports.createDevelopmentRoleModule = createDevelopmentRoleModule;
exports.createProductionRoleModule = createProductionRoleModule;
const tslib_1 = require("tslib");
const role_module_adapter_1 = require("./infrastructure/adapters/role-module.adapter");
const role_logger_service_1 = require("./infrastructure/services/role-logger.service");
/**
 * 初始化Role模块
 *
 * @description 创建和配置Role模块的所有组件，基于Context、Plan、Confirm模块的企业级标准
 * @param options - 模块配置选项
 * @returns Promise<RoleModuleResult> - 初始化结果
 */
async function initializeRoleModule(options = {}) {
    try {
        // 准备适配器配置
        const adapterConfig = {
            enableLogging: options.enableLogging ?? true,
            enableCaching: options.enableCaching ?? false,
            enableMetrics: options.enableMetrics ?? true,
            enableSecurity: options.enableSecurity ?? true,
            repositoryType: options.repositoryType ?? 'memory',
            maxCacheSize: options.maxCacheSize ?? 1000,
            cacheTimeout: options.cacheTimeout ?? 300000,
            securityLevel: options.securityLevel ?? 'enterprise',
            auditLevel: options.auditLevel ?? 'comprehensive'
        };
        // 创建模块适配器
        const roleModuleAdapter = new role_module_adapter_1.RoleModuleAdapter(adapterConfig);
        // 初始化适配器
        await roleModuleAdapter.initialize();
        // 获取核心组件
        const roleController = roleModuleAdapter.getRoleController();
        const roleManagementService = roleModuleAdapter.getRoleService();
        const roleRepository = roleModuleAdapter.getRoleRepository();
        const roleProtocol = roleModuleAdapter.getRoleProtocol();
        // 创建健康检查函数
        const healthCheck = async () => {
            return await roleModuleAdapter.getHealthStatus();
        };
        // 创建关闭函数
        const shutdown = async () => {
            await roleModuleAdapter.destroy();
        };
        // 创建统计信息函数
        const getStatistics = async () => {
            return await roleManagementService.getRoleStatistics();
        };
        // 创建复杂度分布函数
        const getComplexityDistribution = async () => {
            return await roleManagementService.getComplexityDistribution();
        };
        // 执行初始化后的健康检查
        const initialHealthCheck = await healthCheck();
        if (initialHealthCheck.status !== 'healthy') {
            throw new Error(`Role module initialization health check failed: ${JSON.stringify(initialHealthCheck)}`);
        }
        if (options.enableLogging !== false) {
            const logger = (0, role_logger_service_1.createRoleLogger)({
                level: role_logger_service_1.LogLevel.INFO,
                enableStructured: true,
                environment: process.env.NODE_ENV || 'development'
            });
            logger.info('Role模块初始化成功 - 企业级RBAC安全中心', {
                features: ['角色管理', '权限控制', '安全审计', '统计分析'],
                securityLevel: adapterConfig.securityLevel,
                auditLevel: adapterConfig.auditLevel,
                repositoryType: adapterConfig.repositoryType,
                moduleVersion: '1.0.0',
                initializationTime: new Date().toISOString()
            });
        }
        return {
            roleController,
            roleManagementService,
            roleRepository,
            roleProtocol,
            roleModuleAdapter,
            healthCheck,
            shutdown,
            getStatistics,
            getComplexityDistribution
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const logger = (0, role_logger_service_1.createRoleLogger)({
            level: role_logger_service_1.LogLevel.ERROR,
            enableStructured: true,
            environment: process.env.NODE_ENV || 'development'
        });
        logger.error('Role模块初始化失败', error instanceof Error ? error : undefined, {
            errorMessage,
            timestamp: new Date().toISOString(),
            moduleVersion: '1.0.0'
        });
        throw new Error(`Role module initialization failed: ${errorMessage}`);
    }
}
/**
 * 创建默认Role模块实例
 *
 * @description 使用默认配置创建Role模块实例，适用于快速开始和测试
 * @returns Promise<RoleModuleResult> - 默认配置的Role模块实例
 */
async function createDefaultRoleModule() {
    return await initializeRoleModule({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        enableSecurity: true,
        repositoryType: 'memory',
        securityLevel: 'enterprise',
        auditLevel: 'comprehensive'
    });
}
/**
 * 创建开发环境Role模块实例
 *
 * @description 使用开发环境优化配置创建Role模块实例
 * @returns Promise<RoleModuleResult> - 开发环境配置的Role模块实例
 */
async function createDevelopmentRoleModule() {
    return await initializeRoleModule({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        enableSecurity: false,
        repositoryType: 'memory',
        securityLevel: 'basic',
        auditLevel: 'basic',
        maxCacheSize: 500,
        cacheTimeout: 60000 // 1分钟
    });
}
/**
 * 创建生产环境Role模块实例
 *
 * @description 使用生产环境优化配置创建Role模块实例
 * @returns Promise<RoleModuleResult> - 生产环境配置的Role模块实例
 */
async function createProductionRoleModule() {
    return await initializeRoleModule({
        enableLogging: false,
        enableCaching: true,
        enableMetrics: true,
        enableSecurity: true,
        repositoryType: 'database', // 生产环境应使用数据库
        securityLevel: 'enterprise',
        auditLevel: 'comprehensive',
        maxCacheSize: 5000,
        cacheTimeout: 600000 // 10分钟
    });
}
/**
 * Role模块版本信息
 */
exports.ROLE_MODULE_VERSION = '1.0.0';
/**
 * Role模块元数据
 */
exports.ROLE_MODULE_METADATA = {
    name: 'Role Module',
    version: exports.ROLE_MODULE_VERSION,
    description: 'Enterprise-grade RBAC Security Center',
    type: 'mplp_coordination_layer_module',
    capabilities: [
        'role_management',
        'permission_control',
        'security_audit',
        'inheritance_delegation',
        'agent_management',
        'team_configuration',
        'statistics_analysis',
        'bulk_operations',
        'search_filtering',
        'monitoring_integration'
    ],
    dependencies: [
        'MLPPSecurityManager',
        'MLPPPerformanceMonitor',
        'MLPPEventBusManager',
        'MLPPErrorHandler',
        'MLPPCoordinationManager',
        'MLPPOrchestrationManager',
        'MLPPStateSyncManager',
        'MLPPTransactionManager',
        'MLPPProtocolVersionManager'
    ],
    supportedOperations: [
        'create', 'update', 'delete', 'get', 'getByName', 'list', 'listByContext',
        'listByType', 'search', 'checkPermission', 'addPermission', 'removePermission',
        'activate', 'deactivate', 'getStatistics', 'getComplexityDistribution', 'bulkCreate'
    ],
    crossCuttingConcerns: {
        security: true,
        performance: true,
        events: true,
        errors: true,
        coordination: true,
        orchestration: true,
        stateSync: true,
        transactions: true,
        versioning: true
    }
};
// 导出所有核心类型和接口
tslib_1.__exportStar(require("./types"), exports);
tslib_1.__exportStar(require("./api/controllers/role.controller"), exports);
tslib_1.__exportStar(require("./api/dto/role.dto"), exports);
tslib_1.__exportStar(require("./api/mappers/role.mapper"), exports);
tslib_1.__exportStar(require("./application/services/role-management.service"), exports);
tslib_1.__exportStar(require("./domain/entities/role.entity"), exports);
tslib_1.__exportStar(require("./domain/repositories/role-repository.interface"), exports);
tslib_1.__exportStar(require("./infrastructure/repositories/role.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/protocols/role.protocol"), exports);
tslib_1.__exportStar(require("./infrastructure/adapters/role-module.adapter"), exports);
//# sourceMappingURL=module.js.map