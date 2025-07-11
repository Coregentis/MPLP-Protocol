/**
 * Extension模块主入口
 * 
 * @version 1.0.1
 * @created 2025-07-10T15:00:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 * @author MPLP开发团队
 */

// ================== 类型导出 ==================
export type {
  // 基础类型
  ExtensionType,
  ExtensionStatus,
  ExtensionPointType,
  TargetModule,
  HttpMethod,
  BackoffStrategy,
  ValidationSeverity,  // 使用ValidationSeverity代替Severity
  Priority,
  DeliveryGuarantee,
  FileSystemAccess,
  EventSource,

  // 核心接口
  ExtensionCompatibility,
  ValidationRule,
  ExtensionConfiguration,
  RetryPolicy,
  ExtensionHandler,
  ExtensionConditions,
  ExtensionPoint,
  RateLimit,
  ApiExtension,
  EventSubscription,
  ExtensionError,
  ExtensionPerformanceMetrics,
  ExtensionHealthCheck,
  ExtensionLifecycle,
  ExtensionResourceLimits,
  CodeSigning,
  ExtensionPermission,
  ExtensionSecurity,
  ExtensionScreenshot,
  ExtensionMetadata,
  ExtensionProtocol,

  // 服务接口
  InstallExtensionRequest,
  UpdateExtensionRequest,
  UpdateConfigurationRequest,
  ExtensionActivationRequest,
  ExtensionSearchCriteria,
  ExtensionInstallResult,
  ExtensionStatistics,
  ExtensionEvent,
  ExtensionExecutionContext,
  ExtensionExecutionResult
} from './types';

// ================== 枚举和常量导出 ==================
export {
  ExtensionErrorCode,
  ExtensionOperation,
  EXTENSION_CONSTANTS
} from './types';

// ================== 类导出 ==================
export { ExtensionService } from './extension-service';
export { ExtensionManager } from './extension-manager';
export { ExtensionController } from './extension-controller';

// ================== 导入所需类型用于内部使用 ==================
import { 
  ExtensionService 
} from './extension-service';
import { 
  ExtensionManager 
} from './extension-manager';
import { 
  ExtensionController 
} from './extension-controller';
import {
  InstallExtensionRequest,
  UpdateConfigurationRequest,
  ExtensionActivationRequest,
  ExtensionProtocol,
  ExtensionPoint,
  EXTENSION_CONSTANTS
} from './types';

// ================== 模块常量 ==================

/**
 * Extension模块信息
 */
export const EXTENSION_MODULE_INFO = {
  name: 'extension',
  version: '1.0.1',
  description: 'MPLP Extension Module - 扩展机制和插件管理',
  author: 'MPLP开发团队',
  dependencies: ['context', 'trace', 'role'],
  capabilities: [
    'extension_installation',
    'extension_management',
    'extension_execution',
    'api_extensions',
    'event_subscriptions',
    'performance_monitoring',
    'security_sandbox',
    'health_checks'
  ],
  performance_targets: {
    extension_call_time_ms: 50,
    health_check_time_ms: 10,
    concurrent_extensions: 100,
    memory_limit_mb: 512
  }
} as const;

/**
 * Extension模块默认配置
 */
export const DEFAULT_EXTENSION_CONFIG = {
  // 扩展管理配置
  max_concurrent_extensions: 100,
  health_check_interval: 60,
  default_timeout_ms: 30000,
  performance_monitoring_enabled: true,
  sandbox_enabled: true,
  extension_storage_path: './extensions',

  // 安全配置
  default_resource_limits: {
    max_memory_mb: 256,
    max_cpu_percent: 50,
    max_file_size_mb: 100,
    network_access: false,
    file_system_access: 'sandbox' as const
  },

  // 性能配置
  max_execution_time_ms: 30000,
  max_retry_attempts: 3,
  health_check_timeout_ms: 5000,
  metrics_collection_interval_ms: 5000,

  // API配置
  api_rate_limit: {
    requests_per_minute: 1000,
    burst_size: 100
  }
} as const;

/**
 * Extension模块支持的扩展点
 */
export const EXTENSION_POINTS = {
  // Context模块扩展点
  CONTEXT_BEFORE_CREATE: 'context.before_create',
  CONTEXT_AFTER_CREATE: 'context.after_create',
  CONTEXT_BEFORE_UPDATE: 'context.before_update',
  CONTEXT_AFTER_UPDATE: 'context.after_update',
  CONTEXT_BEFORE_DELETE: 'context.before_delete',
  CONTEXT_AFTER_DELETE: 'context.after_delete',

  // Plan模块扩展点
  PLAN_BEFORE_CREATE: 'plan.before_create',
  PLAN_AFTER_CREATE: 'plan.after_create',
  PLAN_BEFORE_EXECUTE: 'plan.before_execute',
  PLAN_AFTER_EXECUTE: 'plan.after_execute',
  PLAN_ON_TASK_START: 'plan.on_task_start',
  PLAN_ON_TASK_COMPLETE: 'plan.on_task_complete',
  PLAN_ON_TASK_ERROR: 'plan.on_task_error',

  // Confirm模块扩展点
  CONFIRM_BEFORE_REQUEST: 'confirm.before_request',
  CONFIRM_AFTER_APPROVAL: 'confirm.after_approval',
  CONFIRM_AFTER_REJECTION: 'confirm.after_rejection',
  CONFIRM_ON_TIMEOUT: 'confirm.on_timeout',

  // Trace模块扩展点
  TRACE_BEFORE_COLLECT: 'trace.before_collect',
  TRACE_AFTER_COLLECT: 'trace.after_collect',
  TRACE_ON_ERROR: 'trace.on_error',
  TRACE_ON_PERFORMANCE_ALERT: 'trace.on_performance_alert',

  // Role模块扩展点
  ROLE_BEFORE_PERMISSION_CHECK: 'role.before_permission_check',
  ROLE_AFTER_PERMISSION_CHECK: 'role.after_permission_check',
  ROLE_ON_ACCESS_DENIED: 'role.on_access_denied',

  // 系统扩展点
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_HEALTH_CHECK: 'system.health_check'
} as const;

// ================== 工厂函数 ==================

/**
 * 创建Extension服务实例
 */
export function createExtensionService(): ExtensionService {
  return new ExtensionService();
}

/**
 * 创建Extension管理器实例
 */
export function createExtensionManager(config?: any): ExtensionManager {
  const mergedConfig = {
    ...DEFAULT_EXTENSION_CONFIG,
    ...config
  };
  
  return new ExtensionManager(mergedConfig);
}

/**
 * 创建Extension控制器实例
 */
export function createExtensionController(extensionManager: ExtensionManager): ExtensionController {
  return new ExtensionController(extensionManager);
}

/**
 * 创建完整的Extension模块实例
 * 包含服务、管理器和控制器
 */
export function createExtensionModule(config?: any) {
  const manager = createExtensionManager(config);
  const controller = createExtensionController(manager);
  const service = manager['extensionService']; // 内部访问

  return {
    manager,
    controller,
    service,
    info: EXTENSION_MODULE_INFO,
    config: {
      ...DEFAULT_EXTENSION_CONFIG,
      ...config
    }
  };
}

// ================== 扩展辅助函数 ==================

/**
 * 验证扩展名称格式
 */
export function validateExtensionName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const namePattern = /^[a-zA-Z0-9_-]+$/;
  const maxLength = EXTENSION_CONSTANTS.MAX_NAME_LENGTH;

  return namePattern.test(name) && name.length <= maxLength;
}

/**
 * 验证扩展版本格式
 */
export function validateExtensionVersion(version: string): boolean {
  if (!version || typeof version !== 'string') {
    return false;
  }

  const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  
  return versionPattern.test(version);
}

/**
 * 创建安装请求
 */
export function createInstallRequest(
  name: string,
  source: string,
  options: Partial<InstallExtensionRequest> = {}
): InstallExtensionRequest {
  return {
    context_id: options.context_id || '', // 需要提供context_id
    name,
    source,
    version: options.version,
    configuration: options.configuration,
    auto_activate: options.auto_activate || false,
    force_install: options.force_install || false,
    skip_dependency_check: options.skip_dependency_check || false
  };
}

/**
 * 创建激活请求
 */
export function createActivationRequest(
  extension_id: string,
  activate: boolean,
  force = false
): ExtensionActivationRequest {
  return {
    extension_id,
    activate,
    force
  };
}

/**
 * 创建配置更新请求
 */
export function createConfigurationUpdateRequest(
  extension_id: string,
  configuration: Record<string, unknown>,
  validate_only = false
): UpdateConfigurationRequest {
  return {
    extension_id,
    configuration,
    validate_only
  };
}

/**
 * 扩展注册表
 * 管理扩展和扩展点的注册
 */
export class ExtensionRegistry {
  private extensions: Map<string, ExtensionProtocol> = new Map();
  private extensionPoints: Map<string, ExtensionPoint[]> = new Map();

  /**
   * 注册扩展
   */
  public registerExtension(extension: ExtensionProtocol): void {
    this.extensions.set(extension.extension_id, extension);
    
    // 注册扩展点
    if (extension.extension_points) {
      for (const point of extension.extension_points) {
        this.registerExtensionPoint(point);
      }
    }
  }

  /**
   * 注销扩展
   */
  public unregisterExtension(extensionId: string): void {
    const extension = this.extensions.get(extensionId);
    if (extension) {
      // 注销扩展点
      if (extension.extension_points) {
        for (const point of extension.extension_points) {
          this.unregisterExtensionPoint(point.name);
        }
      }
      
      this.extensions.delete(extensionId);
    }
  }

  /**
   * 获取扩展
   */
  public getExtension(extensionId: string): ExtensionProtocol | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * 获取所有扩展
   */
  public getAllExtensions(): ExtensionProtocol[] {
    return Array.from(this.extensions.values());
  }

  /**
   * 获取扩展点
   */
  public getExtensionPoints(pointName: string): ExtensionPoint[] {
    return this.extensionPoints.get(pointName) || [];
  }

  /**
   * 注册扩展点
   */
  private registerExtensionPoint(point: ExtensionPoint): void {
    const points = this.extensionPoints.get(point.name) || [];
    points.push(point);
    
    // 按执行顺序排序
    points.sort((a, b) => a.execution_order - b.execution_order);
    
    this.extensionPoints.set(point.name, points);
  }

  /**
   * 注销扩展点
   */
  private unregisterExtensionPoint(pointName: string): void {
    this.extensionPoints.delete(pointName);
  }
}

// ================== 模块元数据 ==================

/**
 * Extension模块元数据
 */
export const EXTENSION_MODULE_METADATA = {
  // 基本信息
  ...EXTENSION_MODULE_INFO,
  
  // 配置选项
  configuration_schema: {
    type: 'object',
    properties: {
      max_concurrent_extensions: { type: 'number', minimum: 1 },
      health_check_interval: { type: 'number', minimum: 10 },
      default_timeout_ms: { type: 'number', minimum: 1000 },
      performance_monitoring_enabled: { type: 'boolean' },
      sandbox_enabled: { type: 'boolean' },
      extension_storage_path: { type: 'string' }
    }
  },

  // API端点
  api_endpoints: [
    'POST /extensions',
    'GET /extensions',
    'GET /extensions/:id',
    'DELETE /extensions/:id',
    'POST /extensions/:id/activate',
    'POST /extensions/:id/deactivate',
    'PUT /extensions/:id/configuration',
    'GET /extensions/:id/health',
    'GET /extensions/statistics',
    'GET /extensions/manager/status',
    'GET /extensions/manager/metrics'
  ],

  // 支持的扩展类型
  supported_extension_types: [
    'plugin',
    'adapter', 
    'connector',
    'middleware',
    'hook',
    'transformer'
  ],

  // 扩展点列表
  extension_points: Object.values(EXTENSION_POINTS),

  // 性能指标
  performance_metrics: [
    'extension_call_time_ms',
    'health_check_time_ms',
    'memory_usage_mb',
    'cpu_usage_percent',
    'active_extensions_count',
    'failed_extensions_count',
    'total_api_calls',
    'average_response_time_ms'
  ]
} as const;

// ================== 默认导出 ==================

/**
 * Extension模块默认导出
 */
export default {
  // 工厂函数
  createExtensionService,
  createExtensionManager,
  createExtensionController,
  createExtensionModule,

  // 辅助函数
  validateExtensionName,
  validateExtensionVersion,
  createInstallRequest,
  createActivationRequest,
  createConfigurationUpdateRequest,

  // 类
  ExtensionService,
  ExtensionManager,
  ExtensionController,
  ExtensionRegistry,

  // 常量和配置
  EXTENSION_MODULE_INFO,
  EXTENSION_MODULE_METADATA,
  DEFAULT_EXTENSION_CONFIG,
  EXTENSION_POINTS,
  EXTENSION_CONSTANTS
}; 