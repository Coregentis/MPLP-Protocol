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
exports.ROLE_MODULE_EVENTS = exports.ROLE_MODULE_ERROR_CODES = exports.ROLE_MODULE_CONSTANTS = exports.ROLE_MODULE_METADATA = exports.ROLE_MODULE_VERSION = exports.createProductionRoleModule = exports.createDevelopmentRoleModule = exports.createDefaultRoleModule = exports.initializeRoleModule = exports.RoleProtocolFactory = exports.RoleMapper = exports.RoleProtocol = exports.MemoryRoleRepository = exports.UnifiedSecurityAPI = exports.RoleAuditService = exports.RoleSecurityService = exports.RoleManagementService = exports.RoleController = exports.RoleEntity = exports.RoleModuleAdapter = exports.AlertLevel = exports.PerformanceMetricType = exports.LogLevel = exports.createRolePerformanceService = exports.RolePerformanceService = exports.createRoleLogger = exports.RoleLoggerService = exports.createRoleCacheService = exports.RoleCacheService = void 0;
__exportStar(require("./api/controllers/role.controller"), exports);
__exportStar(require("./api/dto/role.dto"), exports);
__exportStar(require("./api/mappers/role.mapper"), exports);
__exportStar(require("./application/services/role-management.service"), exports);
__exportStar(require("./domain/entities/role.entity"), exports);
__exportStar(require("./domain/repositories/role-repository.interface"), exports);
__exportStar(require("./infrastructure/repositories/role.repository"), exports);
__exportStar(require("./infrastructure/protocols/role.protocol"), exports);
__exportStar(require("./infrastructure/factories/role-protocol.factory"), exports);
var role_cache_service_1 = require("./infrastructure/services/role-cache.service");
Object.defineProperty(exports, "RoleCacheService", { enumerable: true, get: function () { return role_cache_service_1.RoleCacheService; } });
Object.defineProperty(exports, "createRoleCacheService", { enumerable: true, get: function () { return role_cache_service_1.createRoleCacheService; } });
var role_logger_service_1 = require("./infrastructure/services/role-logger.service");
Object.defineProperty(exports, "RoleLoggerService", { enumerable: true, get: function () { return role_logger_service_1.RoleLoggerService; } });
Object.defineProperty(exports, "createRoleLogger", { enumerable: true, get: function () { return role_logger_service_1.createRoleLogger; } });
var role_performance_service_1 = require("./infrastructure/services/role-performance.service");
Object.defineProperty(exports, "RolePerformanceService", { enumerable: true, get: function () { return role_performance_service_1.RolePerformanceService; } });
Object.defineProperty(exports, "createRolePerformanceService", { enumerable: true, get: function () { return role_performance_service_1.createRolePerformanceService; } });
var role_logger_service_2 = require("./infrastructure/services/role-logger.service");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return role_logger_service_2.LogLevel; } });
var role_performance_service_2 = require("./infrastructure/services/role-performance.service");
Object.defineProperty(exports, "PerformanceMetricType", { enumerable: true, get: function () { return role_performance_service_2.PerformanceMetricType; } });
Object.defineProperty(exports, "AlertLevel", { enumerable: true, get: function () { return role_performance_service_2.AlertLevel; } });
var role_module_adapter_1 = require("./infrastructure/adapters/role-module.adapter");
Object.defineProperty(exports, "RoleModuleAdapter", { enumerable: true, get: function () { return role_module_adapter_1.RoleModuleAdapter; } });
__exportStar(require("./module"), exports);
var role_entity_1 = require("./domain/entities/role.entity");
Object.defineProperty(exports, "RoleEntity", { enumerable: true, get: function () { return role_entity_1.RoleEntity; } });
var role_controller_1 = require("./api/controllers/role.controller");
Object.defineProperty(exports, "RoleController", { enumerable: true, get: function () { return role_controller_1.RoleController; } });
var role_management_service_1 = require("./application/services/role-management.service");
Object.defineProperty(exports, "RoleManagementService", { enumerable: true, get: function () { return role_management_service_1.RoleManagementService; } });
var role_security_service_1 = require("./application/services/role-security.service");
Object.defineProperty(exports, "RoleSecurityService", { enumerable: true, get: function () { return role_security_service_1.RoleSecurityService; } });
var role_audit_service_1 = require("./application/services/role-audit.service");
Object.defineProperty(exports, "RoleAuditService", { enumerable: true, get: function () { return role_audit_service_1.RoleAuditService; } });
var unified_security_api_service_1 = require("./application/services/unified-security-api.service");
Object.defineProperty(exports, "UnifiedSecurityAPI", { enumerable: true, get: function () { return unified_security_api_service_1.UnifiedSecurityAPI; } });
var role_repository_1 = require("./infrastructure/repositories/role.repository");
Object.defineProperty(exports, "MemoryRoleRepository", { enumerable: true, get: function () { return role_repository_1.MemoryRoleRepository; } });
var role_protocol_1 = require("./infrastructure/protocols/role.protocol");
Object.defineProperty(exports, "RoleProtocol", { enumerable: true, get: function () { return role_protocol_1.RoleProtocol; } });
var role_mapper_1 = require("./api/mappers/role.mapper");
Object.defineProperty(exports, "RoleMapper", { enumerable: true, get: function () { return role_mapper_1.RoleMapper; } });
var role_protocol_factory_1 = require("./infrastructure/factories/role-protocol.factory");
Object.defineProperty(exports, "RoleProtocolFactory", { enumerable: true, get: function () { return role_protocol_factory_1.RoleProtocolFactory; } });
var module_1 = require("./module");
Object.defineProperty(exports, "initializeRoleModule", { enumerable: true, get: function () { return module_1.initializeRoleModule; } });
Object.defineProperty(exports, "createDefaultRoleModule", { enumerable: true, get: function () { return module_1.createDefaultRoleModule; } });
Object.defineProperty(exports, "createDevelopmentRoleModule", { enumerable: true, get: function () { return module_1.createDevelopmentRoleModule; } });
Object.defineProperty(exports, "createProductionRoleModule", { enumerable: true, get: function () { return module_1.createProductionRoleModule; } });
Object.defineProperty(exports, "ROLE_MODULE_VERSION", { enumerable: true, get: function () { return module_1.ROLE_MODULE_VERSION; } });
Object.defineProperty(exports, "ROLE_MODULE_METADATA", { enumerable: true, get: function () { return module_1.ROLE_MODULE_METADATA; } });
exports.ROLE_MODULE_CONSTANTS = {
    MODULE_NAME: 'Role',
    MODULE_TYPE: 'enterprise_rbac_security_center',
    PROTOCOL_VERSION: '1.0.0',
    SUPPORTED_REPOSITORY_TYPES: ['memory', 'database', 'file'],
    SUPPORTED_SECURITY_LEVELS: ['basic', 'standard', 'enterprise'],
    SUPPORTED_AUDIT_LEVELS: ['basic', 'detailed', 'comprehensive'],
    DEFAULT_CACHE_SIZE: 1000,
    DEFAULT_CACHE_TIMEOUT: 300000,
    DEFAULT_SECURITY_LEVEL: 'enterprise',
    DEFAULT_AUDIT_LEVEL: 'comprehensive',
    SUPPORTED_OPERATIONS: [
        'create', 'update', 'delete', 'get', 'getByName', 'list', 'listByContext',
        'listByType', 'search', 'checkPermission', 'addPermission', 'removePermission',
        'activate', 'deactivate', 'getStatistics', 'getComplexityDistribution', 'bulkCreate'
    ],
    CROSS_CUTTING_CONCERNS: [
        'security', 'performance', 'events', 'errors', 'coordination',
        'orchestration', 'stateSync', 'transactions', 'versioning'
    ]
};
exports.ROLE_MODULE_ERROR_CODES = {
    ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
    ROLE_ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INVALID_ROLE_TYPE: 'INVALID_ROLE_TYPE',
    INVALID_ROLE_STATUS: 'INVALID_ROLE_STATUS',
    REPOSITORY_ERROR: 'REPOSITORY_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
    HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
    ADAPTER_NOT_INITIALIZED: 'ADAPTER_NOT_INITIALIZED'
};
exports.ROLE_MODULE_EVENTS = {
    ROLE_CREATED: 'role_created',
    ROLE_UPDATED: 'role_updated',
    ROLE_DELETED: 'role_deleted',
    ROLE_ACTIVATED: 'role_activated',
    ROLE_DEACTIVATED: 'role_deactivated',
    PERMISSION_GRANTED: 'permission_granted',
    PERMISSION_REVOKED: 'permission_revoked',
    ROLE_ASSIGNED: 'role_assigned',
    ROLE_REVOKED: 'role_revoked',
    ACCESS_GRANTED: 'access_granted',
    ACCESS_DENIED: 'access_denied',
    SECURITY_ALERT: 'security_alert'
};
exports.default = {
    name: 'Role Module',
    version: '1.0.0',
    description: 'Enterprise-grade RBAC Security Center',
    type: 'mplp_coordination_layer_module',
    constants: exports.ROLE_MODULE_CONSTANTS,
    errorCodes: exports.ROLE_MODULE_ERROR_CODES,
    events: exports.ROLE_MODULE_EVENTS
};
