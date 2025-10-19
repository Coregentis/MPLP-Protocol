/**
 * Role模块主入口
 *
 * @description Role模块的统一导出入口，基于Context、Plan、Confirm模块的企业级标准 - 企业级RBAC安全中心
 * @version 1.0.0
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */
export * from './api/controllers/role.controller';
export * from './api/dto/role.dto';
export * from './api/mappers/role.mapper';
export * from './application/services/role-management.service';
export * from './domain/entities/role.entity';
export * from './domain/repositories/role-repository.interface';
export * from './infrastructure/repositories/role.repository';
export * from './infrastructure/protocols/role.protocol';
export * from './infrastructure/factories/role-protocol.factory';
export { RoleCacheService, createRoleCacheService } from './infrastructure/services/role-cache.service';
export { RoleLoggerService, createRoleLogger } from './infrastructure/services/role-logger.service';
export { RolePerformanceService, createRolePerformanceService } from './infrastructure/services/role-performance.service';
export type { CacheEntry, CacheMetrics, RoleCacheConfig, CacheWarmupStrategy } from './infrastructure/services/role-cache.service';
export type { LogEntry, LoggerConfig } from './infrastructure/services/role-logger.service';
export { LogLevel } from './infrastructure/services/role-logger.service';
export type { RolePerformanceMetric, PerformanceAlert, OperationTrace, PerformanceBenchmark, RolePerformanceConfig } from './infrastructure/services/role-performance.service';
export { PerformanceMetricType, AlertLevel } from './infrastructure/services/role-performance.service';
export { RoleModuleAdapter } from './infrastructure/adapters/role-module.adapter';
export * from './module';
export type { UUID, RoleType, RoleStatus, Permission, PermissionConditions, RoleInheritance, RoleDelegation, RoleAttributes, ValidationRules, AuditSettings, Agent, PerformanceMetrics, MonitoringIntegration, VersionHistory, SearchMetadata, EventIntegration, AuditTrail, RoleProtocolFactoryConfig } from './types';
export { RoleEntity } from './domain/entities/role.entity';
export { RoleController } from './api/controllers/role.controller';
export { RoleManagementService } from './application/services/role-management.service';
export { RoleSecurityService } from './application/services/role-security.service';
export { RoleAuditService } from './application/services/role-audit.service';
export { UnifiedSecurityAPI } from './application/services/unified-security-api.service';
export { MemoryRoleRepository } from './infrastructure/repositories/role.repository';
export { RoleProtocol } from './infrastructure/protocols/role.protocol';
export { RoleMapper } from './api/mappers/role.mapper';
export { RoleProtocolFactory } from './infrastructure/factories/role-protocol.factory';
export { initializeRoleModule, createDefaultRoleModule, createDevelopmentRoleModule, createProductionRoleModule, ROLE_MODULE_VERSION, ROLE_MODULE_METADATA } from './module';
export type { IRoleRepository } from './domain/repositories/role-repository.interface';
export type { RoleModuleOptions, RoleModuleResult } from './module';
export type { RoleModuleAdapterConfig } from './infrastructure/adapters/role-module.adapter';
export type { CreateRoleRequestDTO, UpdateRoleRequestDTO, RoleResponseDTO, RoleQueryFilterDTO, PaginationParamsDTO, RoleSortOptionsDTO, CheckPermissionRequestDTO, BulkOperationResultDTO, RoleStatisticsDTO, RoleComplexityDistributionDTO } from './api/dto/role.dto';
export type { ApiResponse } from './api/controllers/role.controller';
export type { PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions, BulkOperationResult } from './domain/repositories/role-repository.interface';
export type { CreateRoleRequest, UpdateRoleRequest, AssignRoleRequest } from './application/services/role-management.service';
/**
 * Role模块常量
 */
export declare const ROLE_MODULE_CONSTANTS: {
    MODULE_NAME: string;
    MODULE_TYPE: string;
    PROTOCOL_VERSION: string;
    SUPPORTED_REPOSITORY_TYPES: readonly ["memory", "database", "file"];
    SUPPORTED_SECURITY_LEVELS: readonly ["basic", "standard", "enterprise"];
    SUPPORTED_AUDIT_LEVELS: readonly ["basic", "detailed", "comprehensive"];
    DEFAULT_CACHE_SIZE: number;
    DEFAULT_CACHE_TIMEOUT: number;
    DEFAULT_SECURITY_LEVEL: string;
    DEFAULT_AUDIT_LEVEL: string;
    SUPPORTED_OPERATIONS: readonly ["create", "update", "delete", "get", "getByName", "list", "listByContext", "listByType", "search", "checkPermission", "addPermission", "removePermission", "activate", "deactivate", "getStatistics", "getComplexityDistribution", "bulkCreate"];
    CROSS_CUTTING_CONCERNS: readonly ["security", "performance", "events", "errors", "coordination", "orchestration", "stateSync", "transactions", "versioning"];
};
/**
 * Role模块错误代码
 */
export declare const ROLE_MODULE_ERROR_CODES: {
    readonly ROLE_NOT_FOUND: "ROLE_NOT_FOUND";
    readonly ROLE_ALREADY_EXISTS: "ROLE_ALREADY_EXISTS";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly INVALID_ROLE_TYPE: "INVALID_ROLE_TYPE";
    readonly INVALID_ROLE_STATUS: "INVALID_ROLE_STATUS";
    readonly REPOSITORY_ERROR: "REPOSITORY_ERROR";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INITIALIZATION_ERROR: "INITIALIZATION_ERROR";
    readonly HEALTH_CHECK_FAILED: "HEALTH_CHECK_FAILED";
    readonly ADAPTER_NOT_INITIALIZED: "ADAPTER_NOT_INITIALIZED";
};
/**
 * Role模块事件类型
 */
export declare const ROLE_MODULE_EVENTS: {
    readonly ROLE_CREATED: "role_created";
    readonly ROLE_UPDATED: "role_updated";
    readonly ROLE_DELETED: "role_deleted";
    readonly ROLE_ACTIVATED: "role_activated";
    readonly ROLE_DEACTIVATED: "role_deactivated";
    readonly PERMISSION_GRANTED: "permission_granted";
    readonly PERMISSION_REVOKED: "permission_revoked";
    readonly ROLE_ASSIGNED: "role_assigned";
    readonly ROLE_REVOKED: "role_revoked";
    readonly ACCESS_GRANTED: "access_granted";
    readonly ACCESS_DENIED: "access_denied";
    readonly SECURITY_ALERT: "security_alert";
};
/**
 * Role模块默认导出
 *
 * @description 提供Role模块的主要功能和配置
 */
declare const _default: {
    name: string;
    version: string;
    description: string;
    type: string;
    constants: {
        MODULE_NAME: string;
        MODULE_TYPE: string;
        PROTOCOL_VERSION: string;
        SUPPORTED_REPOSITORY_TYPES: readonly ["memory", "database", "file"];
        SUPPORTED_SECURITY_LEVELS: readonly ["basic", "standard", "enterprise"];
        SUPPORTED_AUDIT_LEVELS: readonly ["basic", "detailed", "comprehensive"];
        DEFAULT_CACHE_SIZE: number;
        DEFAULT_CACHE_TIMEOUT: number;
        DEFAULT_SECURITY_LEVEL: string;
        DEFAULT_AUDIT_LEVEL: string;
        SUPPORTED_OPERATIONS: readonly ["create", "update", "delete", "get", "getByName", "list", "listByContext", "listByType", "search", "checkPermission", "addPermission", "removePermission", "activate", "deactivate", "getStatistics", "getComplexityDistribution", "bulkCreate"];
        CROSS_CUTTING_CONCERNS: readonly ["security", "performance", "events", "errors", "coordination", "orchestration", "stateSync", "transactions", "versioning"];
    };
    errorCodes: {
        readonly ROLE_NOT_FOUND: "ROLE_NOT_FOUND";
        readonly ROLE_ALREADY_EXISTS: "ROLE_ALREADY_EXISTS";
        readonly PERMISSION_DENIED: "PERMISSION_DENIED";
        readonly INVALID_ROLE_TYPE: "INVALID_ROLE_TYPE";
        readonly INVALID_ROLE_STATUS: "INVALID_ROLE_STATUS";
        readonly REPOSITORY_ERROR: "REPOSITORY_ERROR";
        readonly VALIDATION_ERROR: "VALIDATION_ERROR";
        readonly INITIALIZATION_ERROR: "INITIALIZATION_ERROR";
        readonly HEALTH_CHECK_FAILED: "HEALTH_CHECK_FAILED";
        readonly ADAPTER_NOT_INITIALIZED: "ADAPTER_NOT_INITIALIZED";
    };
    events: {
        readonly ROLE_CREATED: "role_created";
        readonly ROLE_UPDATED: "role_updated";
        readonly ROLE_DELETED: "role_deleted";
        readonly ROLE_ACTIVATED: "role_activated";
        readonly ROLE_DEACTIVATED: "role_deactivated";
        readonly PERMISSION_GRANTED: "permission_granted";
        readonly PERMISSION_REVOKED: "permission_revoked";
        readonly ROLE_ASSIGNED: "role_assigned";
        readonly ROLE_REVOKED: "role_revoked";
        readonly ACCESS_GRANTED: "access_granted";
        readonly ACCESS_DENIED: "access_denied";
        readonly SECURITY_ALERT: "security_alert";
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map