/**
 * MPLP Extension模块类型定义
 * 
 * @version v1.0.1
 * @created 2025-07-10T14:30:00+08:00
 * @compliance 10/10 Schema合规性 - 完全匹配Schema定义
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== Extension协议主接口 (Schema根节点) =====

/**
 * Extension协议主接口
 * 完全符合extension-protocol.json Schema规范
 */
export interface ExtensionProtocol {
  // Schema必需字段
  protocol_version: Version;
  timestamp: Timestamp;
  extension_id: UUID;
  context_id: UUID;
  name: string;
  display_name?: string;
  description?: string;
  version: Version;
  type: ExtensionType;                 // 修改: extension_type -> type (符合Schema)
  status: ExtensionStatus;
  compatibility: ExtensionCompatibility;
  configuration: ExtensionConfiguration;
  extension_points?: ExtensionPoint[];
  api_extensions?: ApiExtension[];
  event_subscriptions?: EventSubscription[]; // 添加: 缺失的event_subscriptions字段
  lifecycle?: ExtensionLifecycle;            // 添加: 缺失的lifecycle字段
  security?: ExtensionSecurity;              // 修改: security_policies -> security
  metadata?: ExtensionMetadata;
}

// ===== 基础枚举类型 (Schema定义) =====

/**
 * 扩展类型 (Schema定义)
 */
export type ExtensionType = 'plugin' | 'adapter' | 'connector' | 'middleware' | 'hook' | 'transformer';

/**
 * 扩展状态 (Schema定义)
 */
export type ExtensionStatus = 'installed' | 'active' | 'inactive' | 'disabled' | 'error' | 'updating' | 'uninstalling';

// ===== 兼容性管理 (Schema定义) =====

/**
 * 扩展兼容性 (Schema定义)
 */
export interface ExtensionCompatibility {
  mplp_version: string;
  required_modules?: RequiredModule[];
  dependencies?: ExtensionDependency[];
  conflicts?: ExtensionConflict[];
}

/**
 * 必需模块 (Schema定义)
 */
export interface RequiredModule {
  module: ModuleName;
  min_version?: Version;
  max_version?: Version;
}

/**
 * 模块名称 (Schema定义)
 */
export type ModuleName = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';

/**
 * 扩展依赖 (Schema定义)
 */
export interface ExtensionDependency {
  extension_id: UUID;
  name: string;
  version_range: string;
  optional?: boolean;
}

/**
 * 扩展冲突 (Schema定义)
 */
export interface ExtensionConflict {
  extension_id: UUID;
  name: string;
  reason: string;
}

// ===== 配置管理 (Schema定义) =====

/**
 * 扩展配置 (Schema定义)
 */
export interface ExtensionConfiguration {
  schema: Record<string, unknown>;
  current_config: Record<string, unknown>;
  default_config?: Record<string, unknown>;
  validation_rules?: ValidationRule[];
}

/**
 * 验证规则 (Schema定义)
 */
export interface ValidationRule {
  rule: string;
  message: string;
  severity: ValidationSeverity;
}

/**
 * 验证严重性 (Schema定义)
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

// ===== 扩展点机制 (Schema定义) =====

/**
 * 扩展点 (Schema定义)
 */
export interface ExtensionPoint {
  point_id: UUID;
  name: string;
  type: ExtensionPointType;
  target_module: TargetModule;
  event_name?: string;
  execution_order: number;
  enabled: boolean;
  handler: ExtensionHandler;
  conditions?: ExtensionConditions;
}

/**
 * 扩展点类型 (Schema定义)
 */
export type ExtensionPointType = 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';

/**
 * 目标模块 (Schema定义)
 */
export type TargetModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system';

/**
 * 扩展处理器 (Schema定义)
 */
export interface ExtensionHandler {
  function_name: string;
  parameters?: Record<string, unknown>;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
}

/**
 * 重试策略 (Schema定义)
 */
export interface RetryPolicy {
  max_retries?: number;
  retry_delay_ms?: number;
  backoff_strategy?: BackoffStrategy;
}

/**
 * 退避策略 (Schema定义)
 */
export type BackoffStrategy = 'fixed' | 'exponential' | 'linear';

/**
 * 扩展条件 (Schema定义)
 */
export interface ExtensionConditions {
  when?: string;
  required_permissions?: string[];
  context_filters?: Record<string, unknown>;
}

// ===== API扩展 (Schema定义) =====

/**
 * API扩展 (Schema定义)
 */
export interface ApiExtension {
  endpoint_id: UUID;
  path: string;
  method: HttpMethod;
  description?: string;
  handler: string;
  middleware?: string[];
  authentication_required: boolean;
  required_permissions?: string[];
  rate_limit?: RateLimit;
  request_schema?: Record<string, unknown>;
  response_schema?: Record<string, unknown>;
}

/**
 * HTTP方法 (Schema定义)
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * 速率限制 (Schema定义)
 */
export interface RateLimit {
  requests_per_minute: number;
  burst_size?: number;
}

// ===== 事件订阅 (Schema定义) =====

/**
 * 事件订阅 (Schema定义)
 */
export interface EventSubscription {
  subscription_id: UUID;
  event_pattern: string;
  source_module: EventSource;
  handler: string;
  filter_conditions?: Record<string, unknown>;
  delivery_guarantees: DeliveryGuarantee;
  dead_letter_queue?: boolean;
}

/**
 * 事件源 (Schema定义)
 */
export type EventSource = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system' | '*';

/**
 * 传递保证 (Schema定义)
 */
export type DeliveryGuarantee = 'at_least_once' | 'at_most_once' | 'exactly_once';

// ===== 生命周期 (Schema定义) =====

/**
 * 扩展生命周期 (Schema定义)
 */
export interface ExtensionLifecycle {
  install_date: Timestamp;
  last_update?: Timestamp;
  activation_count: number;
  error_count: number;
  last_error?: ExtensionError;
  performance_metrics?: ExtensionPerformanceMetrics;
  health_check?: ExtensionHealthCheck;
}

/**
 * 扩展错误 (Schema定义)
 */
export interface ExtensionError {
  timestamp: Timestamp;
  error_type: string;
  message: string;
  stack_trace?: string;
}

/**
 * 扩展性能指标 (Schema定义)
 */
export interface ExtensionPerformanceMetrics {
  average_execution_time_ms: number;
  total_executions: number;
  success_rate: number;
  memory_usage_mb: number;
}

/**
 * 扩展健康检查 (Schema定义)
 */
export interface ExtensionHealthCheck {
  endpoint?: string;
  interval_seconds?: number;
  timeout_ms?: number;
  failure_threshold?: number;
}

// ===== 安全 (Schema定义) =====

/**
 * 扩展安全 (Schema定义)
 */
export interface ExtensionSecurity {
  sandbox_enabled: boolean;
  resource_limits: ExtensionResourceLimits;
  code_signing?: CodeSigning;
  permissions?: ExtensionPermission[];
}

/**
 * 扩展资源限制 (Schema定义)
 */
export interface ExtensionResourceLimits {
  max_memory_mb?: number;
  max_cpu_percent?: number;
  max_file_size_mb?: number;
  network_access?: boolean;
  file_system_access?: FileSystemAccess;
}

/**
 * 文件系统访问 (Schema定义)
 */
export type FileSystemAccess = 'none' | 'read_only' | 'sandbox' | 'full';

/**
 * 代码签名 (Schema定义)
 */
export interface CodeSigning {
  required?: boolean;
  signature?: string;
  certificate?: string;
  timestamp?: Timestamp;
}

/**
 * 扩展权限 (Schema定义)
 */
export interface ExtensionPermission {
  permission: string;
  justification: string;
  approved: boolean;
  approved_by?: string;
  approval_date?: Timestamp;
}

// ===== 元数据 (Schema定义) =====

/**
 * 扩展元数据 (Schema定义)
 */
export interface ExtensionMetadata {
  author?: string;
  organization?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  support_contact?: string;
  keywords?: string[];
  categories?: string[];
  screenshots?: ExtensionScreenshot[];
}

/**
 * 扩展截图 (Schema定义)
 */
export interface ExtensionScreenshot {
  url: string;
  caption?: string;
}

// ===== API接口类型 =====

/**
 * 安装扩展请求 (API接口)
 */
export interface InstallExtensionRequest {
  context_id: UUID;
  name: string;
  source: string;
  version?: Version;
  configuration?: Record<string, unknown>;
  auto_activate?: boolean;
  force_install?: boolean;
  skip_dependency_check?: boolean;
}

/**
 * 更新扩展请求 (API接口)
 */
export interface UpdateExtensionRequest {
  extension_id: UUID;
  display_name?: string;
  description?: string;
  status?: ExtensionStatus;
  configuration?: Partial<ExtensionConfiguration>;
  extension_points?: ExtensionPoint[];
  api_extensions?: ApiExtension[];
  event_subscriptions?: EventSubscription[];
  security?: Partial<ExtensionSecurity>;
  metadata?: Partial<ExtensionMetadata>;
}

/**
 * 更新配置请求 (API接口)
 */
export interface UpdateConfigurationRequest {
  extension_id: UUID;
  configuration: Record<string, unknown>;
  validate_only?: boolean;
}

/**
 * 扩展激活请求 (API接口)
 */
export interface ExtensionActivationRequest {
  extension_id: UUID;
  activate: boolean;
  force?: boolean;
}

/**
 * 扩展搜索条件 (API接口)
 */
export interface ExtensionSearchCriteria {
  extension_ids?: UUID[];
  context_ids?: UUID[];
  names?: string[];
  types?: ExtensionType[];
  statuses?: ExtensionStatus[];
  categories?: string[];
  authors?: string[];
  keywords?: string[];
  installed_after?: Timestamp;
  installed_before?: Timestamp;
}

/**
 * 扩展安装结果 (API接口)
 */
export interface ExtensionInstallResult {
  success: boolean;
  extension_id?: UUID;
  message: string;
  warnings?: string[];
  conflicts?: Array<{
    extension_id: UUID;
    name: string;
    reason: string;
  }>;
}

/**
 * 扩展统计 (API接口)
 */
export interface ExtensionStatistics {
  total_extensions: number;
  active_extensions: number;
  failed_extensions: number;
  total_api_calls: number;
  average_response_time: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

/**
 * 扩展事件 (API接口)
 */
export interface ExtensionEvent {
  event_type: string;
  extension_id: UUID;
  timestamp: Timestamp;
  data: Record<string, unknown>;
}

/**
 * 扩展执行上下文 (API接口)
 */
export interface ExtensionExecutionContext {
  execution_id: UUID;
  extension_id: UUID;
  point_id?: UUID;
  context_id: UUID;
  start_time: Timestamp;
  timeout_ms: number;
  parameters: Record<string, unknown>;
  user_id?: string;
  session_id?: string;
  trace_id?: string;
}

/**
 * 扩展执行结果 (API接口)
 */
export interface ExtensionExecutionResult {
  execution_id: UUID;
  extension_id: UUID;
  success: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  execution_time_ms: number;
  memory_usage_mb?: number;
}

// ===== 生命周期管理 =====

/**
 * 扩展生命周期事件 (生命周期)
 */
export type ExtensionLifecycleEvent = 'installing' | 'installed' | 'starting' | 'started' | 'stopping' | 'stopped' | 'updating' | 'updated' | 'uninstalling' | 'uninstalled' | 'error';

/**
 * 生命周期处理器 (生命周期)
 */
export interface LifecycleHandler {
  event: ExtensionLifecycleEvent;
  handler_function: string;
  timeout_ms?: number;
  required?: boolean;
}

/**
 * 扩展操作 (生命周期)
 */
export type ExtensionOperation = 'install' | 'uninstall' | 'activate' | 'deactivate' | 'update' | 'configure' | 'execute' | 'health_check';

/**
 * 扩展安装源 (生命周期)
 */
export type InstallationSource = 'registry' | 'local_file' | 'git_repository' | 'url' | 'marketplace';

// ===== 配置类型 =====

/**
 * 扩展配置 (配置接口)
 */
export interface ExtensionManagerConfiguration {
  registry_enabled: boolean;
  auto_update_enabled: boolean;
  security_scanning_enabled: boolean;
  performance_monitoring_enabled: boolean;
  sandbox_enabled: boolean;
  allowed_extension_types: ExtensionType[];
  resource_limits: ResourceLimits;
  security_settings: SecuritySettings;
  marketplace_settings?: MarketplaceSettings;
}

/**
 * 资源限制 (配置接口)
 */
export interface ResourceLimits {
  max_memory_mb: number;
  max_cpu_percent: number;
  max_disk_mb: number;
  max_network_requests_per_minute: number;
  max_execution_time_ms: number;
}

/**
 * 安全设置 (配置接口)
 */
export interface SecuritySettings {
  code_signing_required: boolean;
  sandbox_isolation_enabled: boolean;
  permission_system_enabled: boolean;
  audit_logging_enabled: boolean;
  trusted_publishers: string[];
  blocked_extensions: UUID[];
}

/**
 * 市场设置 (配置接口)
 */
export interface MarketplaceSettings {
  enabled: boolean;
  marketplace_url: string;
  auto_discovery_enabled: boolean;
  trusted_sources: string[];
  update_check_interval_hours: number;
}

// ===== 常量和错误 =====

/**
 * 扩展常量
 */
export const EXTENSION_CONSTANTS = {
  PROTOCOL_VERSION: '1.0.1' as const,
  DEFAULT_EXTENSION_TYPE: 'plugin' as ExtensionType,
  DEFAULT_EXTENSION_STATUS: 'installed' as ExtensionStatus,
  DEFAULT_TARGET_MODULE: 'system' as TargetModule,
  DEFAULT_ENFORCEMENT_LEVEL: 'moderate' as string,
  DEFAULT_MATURITY_LEVEL: 'beta' as string,
  DEFAULT_SUPPORT_LEVEL: 'community' as string,
  MAX_NAME_LENGTH: 64,
  MAX_DISPLAY_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_HANDLER_TIMEOUT_MS: 5000,
  DEFAULT_RETRY_DELAY_MS: 1000,
  MAX_RETRY_ATTEMPTS: 3,
  DEFAULT_RATE_LIMIT_RPM: 60,
  DEFAULT_RETENTION_DAYS: 30,
  DEFAULT_MAX_MEMORY_MB: 256,
  DEFAULT_MAX_CPU_PERCENT: 50
} as const;

/**
 * 扩展错误代码
 */
export enum ExtensionErrorCode {
  EXTENSION_NOT_FOUND = 'EXTENSION_NOT_FOUND',
  EXTENSION_ALREADY_EXISTS = 'EXTENSION_ALREADY_EXISTS',
  INVALID_EXTENSION_DATA = 'INVALID_EXTENSION_DATA',
  EXTENSION_LOAD_FAILED = 'EXTENSION_LOAD_FAILED',
  EXTENSION_START_FAILED = 'EXTENSION_START_FAILED',
  EXTENSION_STOP_FAILED = 'EXTENSION_STOP_FAILED',
  DEPENDENCY_NOT_FOUND = 'DEPENDENCY_NOT_FOUND',
  DEPENDENCY_VERSION_MISMATCH = 'DEPENDENCY_VERSION_MISMATCH',
  EXTENSION_CONFLICT_DETECTED = 'EXTENSION_CONFLICT_DETECTED',
  CONFIGURATION_VALIDATION_FAILED = 'CONFIGURATION_VALIDATION_FAILED',
  HANDLER_EXECUTION_FAILED = 'HANDLER_EXECUTION_FAILED',
  HANDLER_TIMEOUT_EXCEEDED = 'HANDLER_TIMEOUT_EXCEEDED',
  SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  INSTALLATION_FAILED = 'INSTALLATION_FAILED',
  UNINSTALLATION_FAILED = 'UNINSTALLATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ===== 导出默认值 =====
export const PROTOCOL_VERSION = EXTENSION_CONSTANTS.PROTOCOL_VERSION;
export const DEFAULT_EXTENSION_TYPE: ExtensionType = EXTENSION_CONSTANTS.DEFAULT_EXTENSION_TYPE;
export const DEFAULT_EXTENSION_STATUS: ExtensionStatus = EXTENSION_CONSTANTS.DEFAULT_EXTENSION_STATUS;
export const DEFAULT_TARGET_MODULE: TargetModule = EXTENSION_CONSTANTS.DEFAULT_TARGET_MODULE;

// ===== 向后兼容性支持 =====

/**
 * @deprecated 使用type代替，保持与Schema一致
 */
export type { ExtensionType as ExtensionTypeDeprecated };

/**
 * @deprecated 使用ExtensionHandler代替，保持与Schema一致
 */
export type ExtensionPointHandler = ExtensionHandler;

/**
 * @deprecated 使用ValidationRule代替，保持与Schema一致
 */
export type ConfigValidationRule = ValidationRule;

/**
 * @deprecated 使用ExtensionSecurity代替，保持与Schema一致
 */
export type SecurityPolicy = Partial<ExtensionSecurity>;

/**
 * @deprecated 使用ExtensionPerformanceMetrics代替，保持与Schema一致
 */
export type PerformanceMonitor = {
  enabled: boolean;
  metrics: any[];
  thresholds: any[];
  alerting?: any;
}; 