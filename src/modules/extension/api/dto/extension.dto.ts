/**
 * Extension模块API层数据传输对象 (DTO)
 * 
 * 严格遵循MPLP模块标准化规则和双重命名约定
 * - API层使用camelCase命名
 * - 与Schema层(snake_case)通过Mapper进行转换
 * 
 * @version 1.0.0
 * @created 2025-08-10
 * @compliance 模块标准化规则 - API层DTO (MANDATORY)
 * @compliance 双重命名约定 - camelCase (MANDATORY)
 */

import { UUID, Timestamp, Version, Priority } from '../../../../public/shared/types';

// ===== 基础DTO接口 =====

/**
 * Extension创建请求DTO (API层 - camelCase)
 */
export interface CreateExtensionRequestDto {
  contextId: UUID;
  name: string;
  displayName?: string;
  description?: string;
  version: Version;
  extensionType: ExtensionTypeDto;
  compatibility?: ExtensionCompatibilityDto;
  configuration?: ExtensionConfigurationDto;
  extensionPoints?: ExtensionPointDto[];
  apiExtensions?: ApiExtensionDto[];
  eventSubscriptions?: EventSubscriptionDto[];
  security?: ExtensionSecurityDto;
  metadata?: ExtensionMetadataDto;
}

/**
 * Extension更新请求DTO (API层 - camelCase)
 */
export interface UpdateExtensionRequestDto {
  extensionId: UUID;
  displayName?: string;
  description?: string;
  status?: ExtensionStatusDto;
  configuration?: ExtensionConfigurationDto;
  security?: ExtensionSecurityDto;
  metadata?: ExtensionMetadataDto;
}

/**
 * Extension查询请求DTO (API层 - camelCase)
 */
export interface ExtensionQueryRequestDto {
  contextId?: UUID;
  extensionType?: ExtensionTypeDto;
  status?: ExtensionStatusDto;
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Extension响应DTO (API层 - camelCase)
 */
export interface ExtensionResponseDto {
  extensionId: UUID;
  contextId: UUID;
  protocolVersion: Version;
  name: string;
  displayName?: string;
  description?: string;
  version: Version;
  extensionType: ExtensionTypeDto;
  status: ExtensionStatusDto;
  compatibility?: ExtensionCompatibilityDto;
  configuration?: ExtensionConfigurationDto;
  extensionPoints?: ExtensionPointDto[];
  apiExtensions?: ApiExtensionDto[];
  eventSubscriptions?: EventSubscriptionDto[];
  lifecycle?: ExtensionLifecycleDto;
  security?: ExtensionSecurityDto;
  metadata?: ExtensionMetadataDto;
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== 枚举类型DTO =====

/**
 * 扩展类型DTO (API层 - camelCase)
 */
export type ExtensionTypeDto = 
  | 'plugin'
  | 'adapter'
  | 'connector'
  | 'middleware'
  | 'hook'
  | 'transformer';

/**
 * 扩展状态DTO (API层 - camelCase)
 */
export type ExtensionStatusDto = 
  | 'installed'
  | 'active'
  | 'inactive'
  | 'disabled'
  | 'error'
  | 'updating'
  | 'uninstalling';

// ===== 复杂对象DTO =====

/**
 * 扩展兼容性DTO (API层 - camelCase)
 */
export interface ExtensionCompatibilityDto {
  mplpVersion: string;
  requiredModules?: RequiredModuleDto[];
  dependencies?: ExtensionDependencyDto[];
  conflicts?: ExtensionConflictDto[];
}

/**
 * 必需模块DTO (API层 - camelCase)
 */
export interface RequiredModuleDto {
  module: ModuleNameDto;
  minVersion?: Version;
  maxVersion?: Version;
}

/**
 * 模块名称DTO (API层 - camelCase)
 */
export type ModuleNameDto = 
  | 'context'
  | 'plan'
  | 'confirm'
  | 'trace'
  | 'role'
  | 'extension';

/**
 * 扩展依赖DTO (API层 - camelCase)
 */
export interface ExtensionDependencyDto {
  extensionId: UUID;
  name: string;
  versionRange: string;
  optional?: boolean;
}

/**
 * 扩展冲突DTO (API层 - camelCase)
 */
export interface ExtensionConflictDto {
  extensionId: UUID;
  name: string;
  reason: string;
}

/**
 * 扩展配置DTO (API层 - camelCase)
 */
export interface ExtensionConfigurationDto {
  schema: Record<string, unknown>;
  currentConfig: Record<string, unknown>;
  defaultConfig?: Record<string, unknown>;
  validationRules?: ValidationRuleDto[];
}

/**
 * 验证规则DTO (API层 - camelCase)
 */
export interface ValidationRuleDto {
  rule: string;
  level: ValidationLevelDto;
  message: string;
}

/**
 * 验证级别DTO (API层 - camelCase)
 */
export type ValidationLevelDto = 'error' | 'warning' | 'info';

/**
 * 扩展点DTO (API层 - camelCase)
 */
export interface ExtensionPointDto {
  pointId: UUID;
  name: string;
  type: ExtensionPointTypeDto;
  targetModule: ModuleNameDto;
  eventName?: string;
  executionOrder: number;
  enabled: boolean;
  parameters?: Record<string, unknown>;
}

/**
 * 扩展点类型DTO (API层 - camelCase)
 */
export type ExtensionPointTypeDto = 'hook' | 'filter' | 'action' | 'listener';

/**
 * API扩展DTO (API层 - camelCase)
 */
export interface ApiExtensionDto {
  endpointId: UUID;
  path: string;
  method: HttpMethodDto;
  description: string;
  handler: string;
  middleware?: string[];
  authenticationRequired: boolean;
  rateLimit?: RateLimitDto;
}

/**
 * HTTP方法DTO (API层 - camelCase)
 */
export type HttpMethodDto = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 速率限制DTO (API层 - camelCase)
 */
export interface RateLimitDto {
  requestsPerMinute: number;
  burstLimit: number;
}

/**
 * 事件订阅DTO (API层 - camelCase)
 */
export interface EventSubscriptionDto {
  subscriptionId: UUID;
  eventPattern: string;
  sourceModule: ModuleNameDto;
  handler: string;
  filterConditions?: Record<string, unknown>;
  deliveryGuarantees: DeliveryGuaranteesDto;
  deadLetterQueue?: boolean;
}

/**
 * 交付保证DTO (API层 - camelCase)
 */
export type DeliveryGuaranteesDto = 'at_most_once' | 'at_least_once' | 'exactly_once';

/**
 * 扩展生命周期DTO (API层 - camelCase)
 */
export interface ExtensionLifecycleDto {
  installDate: Timestamp;
  lastUpdate?: Timestamp;
  activationCount: number;
  errorCount: number;
  lastError?: string;
  autoStart: boolean;
  loadPriority: number;
  hooks?: LifecycleHooksDto;
}

/**
 * 生命周期钩子DTO (API层 - camelCase)
 */
export interface LifecycleHooksDto {
  onInstall?: string;
  onActivate?: string;
  onDeactivate?: string;
  onUninstall?: string;
  onUpdate?: string;
}

/**
 * 扩展安全DTO (API层 - camelCase)
 */
export interface ExtensionSecurityDto {
  sandboxEnabled: boolean;
  resourceLimits: ResourceLimitsDto;
  permissions: PermissionDto[];
  codeSignature?: CodeSignatureDto;
}

/**
 * 资源限制DTO (API层 - camelCase)
 */
export interface ResourceLimitsDto {
  maxMemoryMb?: number;
  maxCpuPercent?: number;
  maxFileSizeMb?: number;
  maxNetworkConnections?: number;
}

/**
 * 权限DTO (API层 - camelCase)
 */
export interface PermissionDto {
  name: string;
  description: string;
  required: boolean;
}

/**
 * 代码签名DTO (API层 - camelCase)
 */
export interface CodeSignatureDto {
  algorithm: string;
  signature: string;
  certificate: string;
  timestamp: Timestamp;
}

/**
 * 扩展元数据DTO (API层 - camelCase)
 */
export interface ExtensionMetadataDto {
  author?: string;
  organization?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  keywords?: string[];
  category?: string;
}

// ===== 操作结果DTO =====

/**
 * Extension操作结果DTO (API层 - camelCase)
 */
export interface ExtensionOperationResultDto {
  success: boolean;
  extensionId?: UUID;
  message?: string;
  errors?: string[];
  data?: ExtensionResponseDto;
}

/**
 * Extension列表结果DTO (API层 - camelCase)
 */
export interface ExtensionListResultDto {
  success: boolean;
  extensions: ExtensionResponseDto[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}
