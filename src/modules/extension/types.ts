/**
 * MPLP Extension模块类型定义
 * 
 * @version v1.1.0
 * @created 2025-07-10T14:30:00+08:00
 * @updated 2025-08-13T07:00:00+08:00
 * @compliance extension-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/development-standards.mdc - Schema驱动开发原则
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== Extension协议主接口 (Schema根节点) =====

/**
 * Extension协议主接口
 * 完全符合extension-protocol.json Schema规范
 * @schema extension-protocol.json
 */
export interface ExtensionProtocol {
  // Schema必需字段
  protocolVersion: Version;           // 协议版本
  timestamp: Timestamp;                // 消息时间戳
  extensionId: UUID;                  // 扩展唯一标识符
  contextId: UUID;                    // 关联的上下文ID
  name: string;                        // 扩展名称
  version: Version;                    // 扩展版本号
  type: ExtensionType;                 // 扩展类型
  status: ExtensionStatus;             // 扩展状态
  
  // Schema可选字段
  displayName?: string;               // 扩展显示名称
  description?: string;                // 扩展详细描述
  compatibility?: ExtensionCompatibility; // 兼容性信息
  configuration?: ExtensionConfiguration; // 配置信息
  extensionPoints?: ExtensionPoint[]; // 扩展点定义
  apiExtensions?: ApiExtension[];     // API扩展定义
  eventSubscriptions?: EventSubscription[]; // 事件订阅
  lifecycle?: ExtensionLifecycle;      // 生命周期信息
  security?: ExtensionSecurity;        // 安全设置
  metadata?: ExtensionMetadata;        // 元数据
}

// ===== 基础枚举类型 (Schema定义) =====

/**
 * 扩展类型 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_type
 */
export type ExtensionType = 'plugin' | 'adapter' | 'connector' | 'middleware' | 'hook' | 'transformer';

/**
 * 扩展状态 (Schema定义)
 * @schema extension-protocol.json#/properties/status
 */
export type ExtensionStatus = 'installed' | 'active' | 'inactive' | 'disabled' | 'error' | 'updating' | 'uninstalling';

// ===== 兼容性管理 (Schema定义) =====

/**
 * 扩展兼容性 (Schema定义)
 * @schema extension-protocol.json#/properties/compatibility
 */
export interface ExtensionCompatibility {
  mplp_version: string;                // 兼容的MPLP版本范围
  required_modules?: RequiredModule[]; // 必需的模块
  dependencies?: ExtensionDependency[]; // 扩展依赖
  conflicts?: ExtensionConflict[];     // 扩展冲突
}

/**
 * 必需模块 (Schema定义)
 * @schema extension-protocol.json#/properties/compatibility/properties/required_modules/items
 */
export interface RequiredModule {
  module: ModuleName;                  // 模块名称
  min_version?: Version;               // 最低版本
  max_version?: Version;               // 最高版本
}

/**
 * 模块名称 (Schema定义)
 * @schema extension-protocol.json#/properties/compatibility/properties/required_modules/items/properties/module
 */
export type ModuleName = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';

/**
 * 扩展依赖 (Schema定义)
 * @schema extension-protocol.json#/properties/compatibility/properties/dependencies/items
 */
export interface ExtensionDependency {
  extensionId: UUID;                  // 依赖扩展ID
  name: string;                        // 依赖扩展名称
  version_range: string;               // 版本范围
  optional?: boolean;                  // 是否可选
}

/**
 * 扩展冲突 (Schema定义)
 * @schema extension-protocol.json#/properties/compatibility/properties/conflicts/items
 */
export interface ExtensionConflict {
  extensionId: UUID;                  // 冲突扩展ID
  name: string;                        // 冲突扩展名称
  reason: string;                      // 冲突原因
}

// ===== 配置管理 (Schema定义) =====

/**
 * 扩展配置 (Schema定义)
 * @schema extension-protocol.json#/properties/configuration
 */
export interface ExtensionConfiguration {
  schema: Record<string, unknown>;     // 配置参数的JSON Schema定义
  current_config: Record<string, unknown>; // 当前配置值
  default_config?: Record<string, unknown>; // 默认配置值
  validationRules?: ValidationRule[]; // 验证规则
}

/**
 * 验证规则 (Schema定义)
 * @schema extension-protocol.json#/properties/configuration/properties/validation_rules/items
 */
export interface ValidationRule {
  rule: string;                        // 规则表达式
  message: string;                     // 错误消息
  severity: ValidationSeverity;        // 严重程度
}

/**
 * 验证严重性 (Schema定义)
 * @schema extension-protocol.json#/properties/configuration/properties/validation_rules/items/properties/severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

// ===== 扩展点机制 (Schema定义) =====

/**
 * 扩展点 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items
 */
export interface ExtensionPoint {
  point_id: UUID;                      // 扩展点ID
  name: string;                        // 扩展点名称
  type: ExtensionPointType;            // 扩展点类型
  target_module: TargetModule;         // 目标模块
  event_name?: string;                 // 事件名称
  execution_order: number;             // 执行顺序
  enabled: boolean;                    // 是否启用
  handler: ExtensionHandler;           // 处理器
  conditions?: ExtensionConditions;    // 条件
}

/**
 * 扩展点类型 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/type
 */
export type ExtensionPointType = 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';

/**
 * 目标模块 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/target_module
 */
export type TargetModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system';

/**
 * 扩展处理器 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/handler
 */
export interface ExtensionHandler {
  function_name: string;               // 函数名称
  parameters?: Record<string, unknown>; // 参数
  timeoutMs?: number;                 // 超时时间(毫秒)
  retry_policy?: RetryPolicy;          // 重试策略
}

/**
 * 重试策略 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/handler/properties/retry_policy
 */
export interface RetryPolicy {
  max_retries?: number;                // 最大重试次数
  retry_delay_ms?: number;             // 重试延迟(毫秒)
  backoff_strategy?: BackoffStrategy;  // 退避策略
}

/**
 * 退避策略 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/handler/properties/retry_policy/properties/backoff_strategy
 */
export type BackoffStrategy = 'fixed' | 'exponential' | 'linear';

/**
 * 扩展条件 (Schema定义)
 * @schema extension-protocol.json#/properties/extension_points/items/properties/conditions
 */
export interface ExtensionConditions {
  when?: string;                       // 条件表达式
  required_permissions?: string[];     // 所需权限
  context_filters?: Record<string, unknown>; // 上下文过滤器
}

// ===== API扩展 (Schema定义) =====

/**
 * API扩展 (Schema定义)
 * @schema extension-protocol.json#/properties/api_extensions/items
 */
export interface ApiExtension {
  endpoint_id: UUID;                   // 端点ID
  path: string;                        // 路径
  method: HttpMethod;                  // HTTP方法
  description?: string;                // 描述
  handler: string;                     // 处理器
  middleware?: string[];               // 中间件
  authentication_required: boolean;    // 是否需要认证
  required_permissions?: string[];     // 所需权限
  rate_limit?: RateLimit;              // 速率限制
  request_schema?: Record<string, unknown>; // 请求Schema
  response_schema?: Record<string, unknown>; // 响应Schema
}

/**
 * HTTP方法 (Schema定义)
 * @schema extension-protocol.json#/properties/api_extensions/items/properties/method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * 速率限制 (Schema定义)
 * @schema extension-protocol.json#/properties/api_extensions/items/properties/rate_limit
 */
export interface RateLimit {
  requests_per_minute: number;         // 每分钟请求数
  burst_size?: number;                 // 突发大小
}

// ===== 事件订阅 (Schema定义) =====

/**
 * 事件订阅 (Schema定义)
 * @schema extension-protocol.json#/properties/event_subscriptions/items
 */
export interface EventSubscription {
  subscription_id: UUID;               // 订阅ID
  event_pattern: string;               // 事件模式
  source_module: EventSource;          // 源模块
  handler: string;                     // 处理器
  filter_conditions?: Record<string, unknown>; // 过滤条件
  delivery_guarantees: DeliveryGuarantee; // 传递保证
  dead_letter_queue?: boolean;         // 死信队列
}

/**
 * 事件源 (Schema定义)
 * @schema extension-protocol.json#/properties/event_subscriptions/items/properties/source_module
 */
export type EventSource = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system' | '*';

/**
 * 传递保证 (Schema定义)
 * @schema extension-protocol.json#/properties/event_subscriptions/items/properties/delivery_guarantees
 */
export type DeliveryGuarantee = 'at_least_once' | 'at_most_once' | 'exactly_once';

// ===== 生命周期 (Schema定义) =====

/**
 * 扩展生命周期 (Schema定义)
 * @schema extension-protocol.json#/properties/lifecycle
 */
export interface ExtensionLifecycle {
  install_date: Timestamp;             // 安装日期
  last_update?: Timestamp;             // 最后更新时间
  activation_count: number;            // 激活次数
  error_count: number;                 // 错误次数
  last_error?: ExtensionError;         // 最后错误
  performanceMetrics?: ExtensionPerformanceMetrics; // 性能指标
  health_check?: ExtensionHealthCheck; // 健康检查
}

/**
 * 扩展错误 (Schema定义)
 * @schema extension-protocol.json#/properties/lifecycle/properties/last_error
 */
export interface ExtensionError {
  timestamp: Timestamp;                // 错误时间
  error_type: string;                  // 错误类型
  message: string;                     // 错误消息
  stack_trace?: string;                // 堆栈跟踪
}

/**
 * 扩展性能指标 (Schema定义)
 * @schema extension-protocol.json#/properties/lifecycle/properties/performance_metrics
 */
export interface ExtensionPerformanceMetrics {
  average_execution_time_ms: number;   // 平均执行时间(毫秒)
  total_executions: number;            // 总执行次数
  success_rate: number;                // 成功率
  memory_usage_mb: number;             // 内存使用(MB)
}

/**
 * 扩展健康检查 (Schema定义)
 * @schema extension-protocol.json#/properties/lifecycle/properties/health_check
 */
export interface ExtensionHealthCheck {
  endpoint?: string;                   // 健康检查端点
  interval_seconds?: number;           // 检查间隔(秒)
  timeoutMs?: number;                 // 超时时间(毫秒)
  failure_threshold?: number;          // 失败阈值
}

// ===== 安全设置 (Schema定义) =====

/**
 * 扩展安全设置 (Schema定义)
 * @schema extension-protocol.json#/properties/security
 */
export interface ExtensionSecurity {
  sandbox_enabled: boolean;            // 是否启用沙箱
  resource_limits: ExtensionResourceLimits; // 资源限制
  code_signing?: CodeSigning;          // 代码签名
  permissions?: ExtensionPermission[]; // 权限
}

/**
 * 扩展资源限制 (Schema定义)
 * @schema extension-protocol.json#/properties/security/properties/resource_limits
 */
export interface ExtensionResourceLimits {
  max_memory_mb?: number;              // 最大内存(MB)
  max_cpu_percent?: number;            // 最大CPU使用率(%)
  max_file_size_mb?: number;           // 最大文件大小(MB)
  network_access?: boolean;            // 网络访问
  file_system_access?: FileSystemAccess; // 文件系统访问
}

/**
 * 文件系统访问 (Schema定义)
 * @schema extension-protocol.json#/properties/security/properties/resource_limits/properties/file_system_access
 */
export type FileSystemAccess = 'none' | 'read_only' | 'sandbox' | 'full';

/**
 * 代码签名 (Schema定义)
 * @schema extension-protocol.json#/properties/security/properties/code_signing
 */
export interface CodeSigning {
  required?: boolean;                  // 是否必需
  signature?: string;                  // 签名
  certificate?: string;                // 证书
  timestamp?: Timestamp;               // 时间戳
}

/**
 * 扩展权限 (Schema定义)
 * @schema extension-protocol.json#/properties/security/properties/permissions/items
 */
export interface ExtensionPermission {
  permission: string;                  // 权限名称
  justification: string;               // 权限理由
  approved: boolean;                   // 是否已批准
  approved_by?: string;                // 批准人
  approval_date?: Timestamp;           // 批准日期
}

// ===== 元数据 (Schema定义) =====

/**
 * 扩展元数据 (Schema定义)
 * @schema extension-protocol.json#/properties/metadata
 */
export interface ExtensionMetadata {
  author?: string;                     // 作者
  organization?: string;               // 组织
  license?: string;                    // 许可证
  homepage?: string;                   // 主页
  repository?: string;                 // 代码仓库
  documentation?: string;              // 文档
  support_contact?: string;            // 支持联系方式
  keywords?: string[];                 // 关键词
  categories?: string[];               // 分类
  screenshots?: ExtensionScreenshot[]; // 截图
}

/**
 * 扩展截图 (Schema定义)
 * @schema extension-protocol.json#/properties/metadata/properties/screenshots/items
 */
export interface ExtensionScreenshot {
  url: string;                         // URL
  caption?: string;                    // 标题
}

// ===== 请求和响应类型 =====
// 注意：以下类型为API实现类型，非Schema直接定义

/**
 * 安装扩展请求
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface InstallExtensionRequest {
  contextId: UUID;
  name: string;
  source: string;
  version?: Version;
  configuration?: Record<string, unknown>;
  auto_activate?: boolean;
  force_install?: boolean;
  skip_dependency_check?: boolean;
}

/**
 * 更新扩展请求
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface UpdateExtensionRequest {
  extensionId: UUID;
  displayName?: string;
  description?: string;
  status?: ExtensionStatus;
  configuration?: Partial<ExtensionConfiguration>;
  extensionPoints?: ExtensionPoint[];
  apiExtensions?: ApiExtension[];
  eventSubscriptions?: EventSubscription[];
  security?: Partial<ExtensionSecurity>;
  metadata?: Partial<ExtensionMetadata>;
}

/**
 * 更新配置请求
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface UpdateConfigurationRequest {
  extensionId: UUID;
  configuration: Record<string, unknown>;
  validate_only?: boolean;
}

/**
 * 扩展激活请求
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionActivationRequest {
  extensionId: UUID;
  activate: boolean;
  force?: boolean;
}

/**
 * 扩展搜索条件
 * @note 此接口为API实现类型，非Schema直接定义
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
 * 扩展安装结果
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionInstallResult {
  success: boolean;
  extensionId?: UUID;
  message: string;
  warnings?: string[];
  conflicts?: Array<{
    extensionId: UUID;
    name: string;
    reason: string;
  }>;
}

/**
 * 扩展统计信息
 * @note 此接口为API实现类型，非Schema直接定义
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
 * 扩展事件
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionEvent {
  event_type: string;
  extensionId: UUID;
  timestamp: Timestamp;
  data: Record<string, unknown>;
}

/**
 * 扩展执行上下文
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionExecutionContext {
  execution_id: UUID;
  extensionId: UUID;
  point_id?: UUID;
  contextId: UUID;
  start_time: Timestamp;
  timeoutMs: number;
  parameters: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  traceId?: string;
}

/**
 * 扩展执行结果
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionExecutionResult {
  execution_id: UUID;
  extensionId: UUID;
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

/**
 * 扩展健康状态
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ExtensionHealthStatus {
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  is_healthy: boolean;
  last_check: Timestamp;
  details: {
    message: string;
    checks: Array<{
      name: string;
      status: 'passed' | 'failed' | 'warning';
      message?: string;
    }>;
  };
  metrics?: {
    response_time_ms: number;
    memory_usage_mb?: number;
    cpu_usage_percent?: number;
    uptime_seconds?: number;
  };
}

/**
 * 扩展生命周期事件
 * @note 此类型为API实现类型，非Schema直接定义
 */
export type ExtensionLifecycleEvent = 'installing' | 'installed' | 'starting' | 'started' | 'stopping' | 'stopped' | 'updating' | 'updated' | 'uninstalling' | 'uninstalled' | 'error';

/**
 * 生命周期处理器
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface LifecycleHandler {
  event: ExtensionLifecycleEvent;
  handler_function: string;
  timeoutMs?: number;
  required?: boolean;
}

/**
 * 扩展操作
 * @note 此类型为API实现类型，非Schema直接定义
 */
export type ExtensionOperation = 
  | 'install' 
  | 'uninstall' 
  | 'activate' 
  | 'deactivate' 
  | 'update' 
  | 'configure' 
  | 'execute' 
  | 'health_check'
  | 'register_extension_point'
  | 'unregister_extension_point'
  | 'check_compatibility';

/**
 * 安装来源
 * @note 此类型为API实现类型，非Schema直接定义
 */
export type InstallationSource = 'registry' | 'local_file' | 'git_repository' | 'url' | 'marketplace';

/**
 * 扩展管理器配置
 * @note 此接口为API实现类型，非Schema直接定义
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
 * 资源限制
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface ResourceLimits {
  max_memory_mb: number;
  max_cpu_percent: number;
  max_disk_mb: number;
  max_network_requests_per_minute: number;
  max_execution_time_ms: number;
}

/**
 * 安全设置
 * @note 此接口为API实现类型，非Schema直接定义
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
 * 市场设置
 * @note 此接口为API实现类型，非Schema直接定义
 */
export interface MarketplaceSettings {
  enabled: boolean;
  marketplace_url: string;
  auto_discovery_enabled: boolean;
  trusted_sources: string[];
  update_check_interval_hours: number;
}

/**
 * 扩展错误代码
 * @note 此枚举为API实现类型，非Schema直接定义
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

/**
 * 扩展更新结果
 * @schema extension-protocol.json#/definitions/ExtensionUpdateResult
 */
export interface ExtensionUpdateResult {
  /**
   * 操作是否成功
   */
  success: boolean;
  
  /**
   * 更新后的扩展数据（成功时）
   */
  data?: ExtensionProtocol;
  
  /**
   * 错误信息（失败时）
   */
  error?: {
    /**
     * 错误代码
     */
    code: string;
    
    /**
     * 错误消息
     */
    message: string;
  };
}

// ===== 类型别名 (简化使用) =====

/**
 * 扩展点处理器别名
 * @note 此类型别名为API实现类型，非Schema直接定义
 */
export type ExtensionPointHandler = ExtensionHandler;

/**
 * 配置验证规则别名
 * @note 此类型别名为API实现类型，非Schema直接定义
 */
export type ConfigValidationRule = ValidationRule;

/**
 * 安全策略别名
 * @note 此类型别名为API实现类型，非Schema直接定义
 */
export type SecurityPolicy = Partial<ExtensionSecurity>;

/**
 * 性能监控配置
 * @note 此类型为API实现类型，非Schema直接定义
 */
export type PerformanceMonitor = {
  enabled: boolean;
  metrics: unknown[];
  thresholds: unknown[];
  alerting?: unknown;
}; 