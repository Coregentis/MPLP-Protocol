/**
 * Role模块主入口
 * 
 * @description Role模块的统一导出入口，基于Context、Plan、Confirm模块的企业级标准 - 企业级RBAC安全中心
 * @version 1.0.0
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 ===== (MANDATORY SECTION)

// API层 (MANDATORY)
export * from './api/controllers/role.controller';
export * from './api/dto/role.dto';
export * from './api/mappers/role.mapper';

// 应用层 (MANDATORY)
export * from './application/services/role-management.service';

// 领域层 (MANDATORY)
export * from './domain/entities/role.entity';
export * from './domain/repositories/role-repository.interface';

// 基础设施层 (MANDATORY)
export * from './infrastructure/repositories/role.repository';
export * from './infrastructure/protocols/role.protocol';
export * from './infrastructure/factories/role-protocol.factory';

// ===== 服务层导出 ===== (ENHANCED SERVICES)
export { RoleCacheService, createRoleCacheService } from './infrastructure/services/role-cache.service';
export { RoleLoggerService, createRoleLogger } from './infrastructure/services/role-logger.service';
export { RolePerformanceService, createRolePerformanceService } from './infrastructure/services/role-performance.service';
export type {
  CacheEntry,
  CacheMetrics,
  RoleCacheConfig,
  CacheWarmupStrategy
} from './infrastructure/services/role-cache.service';
export type {
  LogEntry,
  LoggerConfig
} from './infrastructure/services/role-logger.service';
export { LogLevel } from './infrastructure/services/role-logger.service';
export type {
  RolePerformanceMetric,
  PerformanceAlert,
  OperationTrace,
  PerformanceBenchmark,
  RolePerformanceConfig
} from './infrastructure/services/role-performance.service';
export { PerformanceMetricType, AlertLevel } from './infrastructure/services/role-performance.service';

// ===== 适配器导出 ===== (MANDATORY SECTION)
export { RoleModuleAdapter } from './infrastructure/adapters/role-module.adapter';

// ===== 模块集成 ===== (MANDATORY SECTION)
export * from './module';

// ===== 类型定义导出 ===== (MANDATORY SECTION)
export type {
  UUID,
  RoleType,
  RoleStatus,
  Permission,
  PermissionConditions,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  ValidationRules,
  AuditSettings,
  Agent,
  PerformanceMetrics,
  MonitoringIntegration,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  AuditTrail,
  RoleProtocolFactoryConfig
} from './types';

// ===== 便捷导出 ===== (CONVENIENCE SECTION)

// 主要类导出
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

// 模块初始化函数导出
export {
  initializeRoleModule,
  createDefaultRoleModule,
  createDevelopmentRoleModule,
  createProductionRoleModule,
  ROLE_MODULE_VERSION,
  ROLE_MODULE_METADATA
} from './module';

// 接口导出
export type { IRoleRepository } from './domain/repositories/role-repository.interface';
export type {
  RoleModuleOptions,
  RoleModuleResult
} from './module';
export type {
  RoleModuleAdapterConfig
} from './infrastructure/adapters/role-module.adapter';

// DTO导出
export type {
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  RoleResponseDTO,
  RoleQueryFilterDTO,
  PaginationParamsDTO,
  RoleSortOptionsDTO,
  CheckPermissionRequestDTO,
  BulkOperationResultDTO,
  RoleStatisticsDTO,
  RoleComplexityDistributionDTO
} from './api/dto/role.dto';

// API响应类型导出
export type { ApiResponse } from './api/controllers/role.controller';

// 仓库接口导出
export type {
  PaginationParams,
  PaginatedResult,
  RoleQueryFilter,
  RoleSortOptions,
  BulkOperationResult
} from './domain/repositories/role-repository.interface';

// 服务请求类型导出
export type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest
} from './application/services/role-management.service';

// ===== 模块常量导出 ===== (CONSTANTS SECTION)

/**
 * Role模块常量
 */
export const ROLE_MODULE_CONSTANTS = {
  MODULE_NAME: 'Role',
  MODULE_TYPE: 'enterprise_rbac_security_center',
  PROTOCOL_VERSION: '1.0.0',
  SUPPORTED_REPOSITORY_TYPES: ['memory', 'database', 'file'] as const,
  SUPPORTED_SECURITY_LEVELS: ['basic', 'standard', 'enterprise'] as const,
  SUPPORTED_AUDIT_LEVELS: ['basic', 'detailed', 'comprehensive'] as const,
  DEFAULT_CACHE_SIZE: 1000,
  DEFAULT_CACHE_TIMEOUT: 300000, // 5分钟
  DEFAULT_SECURITY_LEVEL: 'enterprise',
  DEFAULT_AUDIT_LEVEL: 'comprehensive',
  SUPPORTED_OPERATIONS: [
    'create', 'update', 'delete', 'get', 'getByName', 'list', 'listByContext',
    'listByType', 'search', 'checkPermission', 'addPermission', 'removePermission',
    'activate', 'deactivate', 'getStatistics', 'getComplexityDistribution', 'bulkCreate'
  ] as const,
  CROSS_CUTTING_CONCERNS: [
    'security', 'performance', 'events', 'errors', 'coordination',
    'orchestration', 'stateSync', 'transactions', 'versioning'
  ] as const
};

/**
 * Role模块错误代码
 */
export const ROLE_MODULE_ERROR_CODES = {
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
} as const;

/**
 * Role模块事件类型
 */
export const ROLE_MODULE_EVENTS = {
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
} as const;

// ===== 默认导出 ===== (DEFAULT EXPORT SECTION)

/**
 * Role模块默认导出
 *
 * @description 提供Role模块的主要功能和配置
 */
export default {
  // 模块信息
  name: 'Role Module',
  version: '1.0.0',
  description: 'Enterprise-grade RBAC Security Center',
  type: 'mplp_coordination_layer_module',

  // 常量
  constants: ROLE_MODULE_CONSTANTS,
  errorCodes: ROLE_MODULE_ERROR_CODES,
  events: ROLE_MODULE_EVENTS
};
