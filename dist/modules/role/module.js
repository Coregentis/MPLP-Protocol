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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_MODULE_METADATA = exports.ROLE_MODULE_VERSION = void 0;
exports.initializeRoleModule = initializeRoleModule;
exports.createDefaultRoleModule = createDefaultRoleModule;
exports.createDevelopmentRoleModule = createDevelopmentRoleModule;
exports.createProductionRoleModule = createProductionRoleModule;
const role_module_adapter_1 = require("./infrastructure/adapters/role-module.adapter");
const role_logger_service_1 = require("./infrastructure/services/role-logger.service");
async function initializeRoleModule(options = {}) {
    try {
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
        const roleModuleAdapter = new role_module_adapter_1.RoleModuleAdapter(adapterConfig);
        await roleModuleAdapter.initialize();
        const roleController = roleModuleAdapter.getRoleController();
        const roleManagementService = roleModuleAdapter.getRoleService();
        const roleRepository = roleModuleAdapter.getRoleRepository();
        const roleProtocol = roleModuleAdapter.getRoleProtocol();
        const healthCheck = async () => {
            return await roleModuleAdapter.getHealthStatus();
        };
        const shutdown = async () => {
            await roleModuleAdapter.destroy();
        };
        const getStatistics = async () => {
            return await roleManagementService.getRoleStatistics();
        };
        const getComplexityDistribution = async () => {
            return await roleManagementService.getComplexityDistribution();
        };
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
        cacheTimeout: 60000
    });
}
async function createProductionRoleModule() {
    return await initializeRoleModule({
        enableLogging: false,
        enableCaching: true,
        enableMetrics: true,
        enableSecurity: true,
        repositoryType: 'database',
        securityLevel: 'enterprise',
        auditLevel: 'comprehensive',
        maxCacheSize: 5000,
        cacheTimeout: 600000
    });
}
exports.ROLE_MODULE_VERSION = '1.0.0';
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
__exportStar(require("./types"), exports);
__exportStar(require("./api/controllers/role.controller"), exports);
__exportStar(require("./api/dto/role.dto"), exports);
__exportStar(require("./api/mappers/role.mapper"), exports);
__exportStar(require("./application/services/role-management.service"), exports);
__exportStar(require("./domain/entities/role.entity"), exports);
__exportStar(require("./domain/repositories/role-repository.interface"), exports);
__exportStar(require("./infrastructure/repositories/role.repository"), exports);
__exportStar(require("./infrastructure/protocols/role.protocol"), exports);
__exportStar(require("./infrastructure/adapters/role-module.adapter"), exports);
