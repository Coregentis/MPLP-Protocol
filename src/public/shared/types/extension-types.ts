/**
 * MPLP Extension Types - Extension模块类型定义
 * 
 * 提供Extension模块相关的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

import { UUID, Timestamp } from './index';

// ===== Extension基础类型 =====

/**
 * 扩展类型枚举
 */
export type ExtensionType = 
  | 'plugin'        // 插件扩展
  | 'middleware'    // 中间件扩展
  | 'hook'          // 钩子扩展
  | 'adapter'       // 适配器扩展
  | 'integration'   // 集成扩展
  | 'custom';       // 自定义扩展

/**
 * 扩展状态枚举
 */
export type ExtensionStatus = 'active' | 'inactive' | 'disabled' | 'error' | 'loading' | 'uninstalled';

/**
 * 扩展优先级枚举
 */
export type ExtensionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 生命周期阶段枚举
 */
export type LifecycleStage = 'install' | 'activate' | 'execute' | 'deactivate' | 'uninstall';

/**
 * 钩子类型枚举
 */
export type HookType = 'before' | 'after' | 'around' | 'error' | 'finally';

/**
 * 权限级别枚举
 */
export type PermissionLevel = 'read' | 'write' | 'execute' | 'admin' | 'system';

/**
 * 兼容性级别枚举
 */
export type CompatibilityLevel = 'full' | 'partial' | 'limited' | 'incompatible';

// ===== Extension接口定义 =====

/**
 * Extension创建请求
 */
export interface CreateExtensionRequest {
  name: string;
  extensionType: ExtensionType;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  dependencies?: DependencyData[];
  configuration?: ExtensionConfigurationData;
  permissions?: PermissionData[];
  metadata?: Record<string, unknown>;
}

/**
 * Extension更新请求
 */
export interface UpdateExtensionRequest {
  name?: string;
  version?: string;
  description?: string;
  status?: ExtensionStatus;
  configuration?: ExtensionConfigurationData;
  permissions?: PermissionData[];
  metadata?: Record<string, unknown>;
}

/**
 * Extension查询参数
 */
export interface ExtensionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  extensionType?: ExtensionType;
  status?: ExtensionStatus;
  priority?: ExtensionPriority;
  author?: string;
  keywords?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Extension数据接口
 */
export interface ExtensionData {
  extensionId: UUID;
  name: string;
  extensionType: ExtensionType;
  version: string;
  description?: string;
  status: ExtensionStatus;
  priority: ExtensionPriority;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords: string[];
  dependencies: DependencyData[];
  configuration: ExtensionConfigurationData;
  permissions: PermissionData[];
  lifecycle_hooks: LifecycleHookData[];
  compatibility: CompatibilityData;
  installation_info: InstallationInfoData;
  runtime_info?: RuntimeInfoData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 依赖数据接口
 */
export interface DependencyData {
  name: string;
  version_range: string;
  type: 'required' | 'optional' | 'development';
  source?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 扩展配置数据接口
 */
export interface ExtensionConfigurationData {
  schema?: Record<string, unknown>;
  default_values?: Record<string, unknown>;
  current_values?: Record<string, unknown>;
  validationRules?: {
    rule_name: string;
    rule_expression: string;
    error_message: string;
  }[];
  environment_variables?: {
    name: string;
    required: boolean;
    default_value?: string;
    description?: string;
  }[];
}

/**
 * 权限数据接口
 */
export interface PermissionData {
  resource: string;
  level: PermissionLevel;
  description?: string;
  justification?: string;
  granted_at?: Timestamp;
  expires_at?: Timestamp;
}

/**
 * 生命周期钩子数据接口
 */
export interface LifecycleHookData {
  hook_id: UUID;
  stage: LifecycleStage;
  hook_type: HookType;
  handler_function: string;
  priority: number;
  timeoutMs?: number;
  retryCount?: number;
  conditions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * 兼容性数据接口
 */
export interface CompatibilityData {
  mplp_version_range: string;
  node_version_range?: string;
  os_requirements?: string[];
  architecture_requirements?: string[];
  compatibility_level: CompatibilityLevel;
  known_issues?: {
    issue_id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    workaround?: string;
  }[];
}

/**
 * 安装信息数据接口
 */
export interface InstallationInfoData {
  installed_at: Timestamp;
  installed_by: UUID;
  installation_method: 'manual' | 'package_manager' | 'marketplace' | 'git' | 'url';
  installation_source?: string;
  installation_path?: string;
  checksum?: string;
  signature?: string;
  verification_status: 'verified' | 'unverified' | 'failed';
}

/**
 * 运行时信息数据接口
 */
export interface RuntimeInfoData {
  last_activated_at?: Timestamp;
  last_deactivated_at?: Timestamp;
  execution_count: number;
  total_execution_time_ms: number;
  average_execution_time_ms: number;
  error_count: number;
  last_error?: {
    timestamp: Timestamp;
    message: string;
    stack_trace?: string;
  };
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
}

/**
 * 扩展执行请求
 */
export interface ExtensionExecutionRequest {
  extensionId: UUID;
  method: string;
  parameters?: Record<string, unknown>;
  context?: Record<string, unknown>;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 扩展执行结果
 */
export interface ExtensionExecutionResult {
  execution_id: UUID;
  extensionId: UUID;
  method: string;
  success: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  execution_time_ms: number;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 扩展市场数据接口
 */
export interface ExtensionMarketplaceData {
  marketplace_id: string;
  name: string;
  display_name: string;
  description: string;
  icon_url?: string;
  screenshots?: string[];
  download_count: number;
  rating: number;
  review_count: number;
  latest_version: string;
  supported_versions: string[];
  categories: string[];
  tags: string[];
  publisher: {
    name: string;
    verified: boolean;
    contact_email?: string;
  };
  pricing: {
    type: 'free' | 'paid' | 'freemium' | 'subscription';
    price?: number;
    currency?: string;
    billing_period?: 'monthly' | 'yearly' | 'one_time';
  };
  published_at: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 扩展统计数据接口
 */
export interface ExtensionStatistics {
  total_extensions: number;
  active_extensions: number;
  inactive_extensions: number;
  extensions_by_type: Record<ExtensionType, number>;
  extensions_by_status: Record<ExtensionStatus, number>;
  total_executions: number;
  total_execution_time_ms: number;
  average_execution_time_ms: number;
  error_rate: number;
  most_used_extensions: {
    extensionId: UUID;
    name: string;
    execution_count: number;
  }[];
}
