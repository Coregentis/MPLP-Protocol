/**
 * Extension模块测试数据工厂
 * 基于mplp-extension.json Schema生成符合企业级标准的测试数据
 * 
 * @version v1.0.0
 * @created 2025-08-10T14:50:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * @naming_convention 双重命名约定 - Schema层(snake_case) ↔ TypeScript层(camelCase)
 * @zero_any_policy 严格遵循 - 0个any类型，完全类型安全
 */

import { v4 as uuidv4 } from 'uuid';

// 基于mplp-extension.json Schema的严格类型定义 (Schema层 - snake_case)
export interface ExtensionProtocolSchema {
  protocol_version: string;
  timestamp: string;
  extension_id: string;
  context_id: string;
  name: string;
  display_name: string;
  description: string;
  version: string;
  extension_type: 'plugin' | 'adapter' | 'connector' | 'middleware' | 'hook' | 'transformer';
  status: 'installed' | 'active' | 'inactive' | 'disabled' | 'error' | 'updating' | 'uninstalling';
  compatibility: ExtensionCompatibilitySchema;
  configuration: ExtensionConfigurationSchema;
  extension_points: ExtensionPointSchema[];
  api_extensions: ApiExtensionSchema[];
  event_subscriptions: EventSubscriptionSchema[];
  lifecycle: ExtensionLifecycleSchema;
  security: ExtensionSecuritySchema;
  metadata: ExtensionMetadataSchema;
}

// 兼容性配置Schema层类型
export interface ExtensionCompatibilitySchema {
  mplp_version: string;
  required_modules: RequiredModuleSchema[];
  dependencies: ExtensionDependencySchema[];
  conflicts: ExtensionConflictSchema[];
}

export interface RequiredModuleSchema {
  module: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';
  min_version?: string;
  max_version?: string;
}

export interface ExtensionDependencySchema {
  extension_id: string;
  name: string;
  version_range: string;
  optional?: boolean;
}

export interface ExtensionConflictSchema {
  extension_id: string;
  name: string;
  reason: string;
}

// 配置Schema层类型
export interface ExtensionConfigurationSchema {
  schema: Record<string, unknown>;
  current_config: Record<string, unknown>;
  default_config?: Record<string, unknown>;
  validation_rules?: ValidationRuleSchema[];
}

export interface ValidationRuleSchema {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// 扩展点Schema层类型
export interface ExtensionPointSchema {
  point_id: string;
  name: string;
  type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
  target_module: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system';
  event_name: string;
  execution_order: number;
  enabled: boolean;
  handler: HandlerSchema;
  conditions?: ConditionsSchema;
}

export interface HandlerSchema {
  function_name: string;
  parameters?: Record<string, unknown>;
  timeout_ms?: number;
  retry_policy?: RetryPolicySchema;
}

export interface RetryPolicySchema {
  max_retries?: number;
  retry_delay_ms?: number;
  backoff_strategy?: 'fixed' | 'exponential' | 'linear';
}

export interface ConditionsSchema {
  when?: string;
  required_permissions?: string[];
  context_filters?: Record<string, unknown>;
}

// API扩展Schema层类型
export interface ApiExtensionSchema {
  endpoint_id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
  description?: string;
  handler: string;
  middleware?: string[];
  authentication_required: boolean;
  required_permissions?: string[];
  rate_limit?: RateLimitSchema;
  request_schema?: Record<string, unknown>;
  response_schema?: Record<string, unknown>;
}

export interface RateLimitSchema {
  requests_per_minute?: number;
  burst_size?: number;
}

// 事件订阅Schema层类型
export interface EventSubscriptionSchema {
  subscription_id: string;
  event_pattern: string;
  source_module: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'system' | '*';
  handler: string;
  filter_conditions?: Record<string, unknown>;
  delivery_guarantees: 'at_least_once' | 'at_most_once' | 'exactly_once';
  dead_letter_queue?: boolean;
}

// 生命周期Schema层类型
export interface ExtensionLifecycleSchema {
  install_date: string;
  last_update?: string;
  activation_count: number;
  error_count: number;
  last_error?: LastErrorSchema;
  performance_metrics?: PerformanceMetricsSchema;
  health_check?: HealthCheckSchema;
}

export interface LastErrorSchema {
  timestamp?: string;
  error_type?: string;
  message?: string;
  stack_trace?: string;
}

export interface PerformanceMetricsSchema {
  average_execution_time_ms?: number;
  total_executions?: number;
  success_rate?: number;
  memory_usage_mb?: number;
}

export interface HealthCheckSchema {
  endpoint?: string;
  interval_seconds?: number;
  timeout_ms?: number;
  failure_threshold?: number;
}

// 安全Schema层类型
export interface ExtensionSecuritySchema {
  sandbox_enabled: boolean;
  resource_limits: ResourceLimitsSchema;
  code_signing?: CodeSigningSchema;
  permissions?: PermissionSchema[];
}

export interface ResourceLimitsSchema {
  max_memory_mb?: number;
  max_cpu_percent?: number;
  max_file_size_mb?: number;
  network_access?: boolean;
  file_system_access?: 'none' | 'read_only' | 'sandbox' | 'full';
}

export interface CodeSigningSchema {
  required?: boolean;
  signature?: string;
  certificate?: string;
  timestamp?: string;
}

export interface PermissionSchema {
  permission: string;
  justification: string;
  approved: boolean;
  approved_by?: string;
  approval_date?: string;
}

// 元数据Schema层类型
export interface ExtensionMetadataSchema {
  author?: string;
  organization?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  support_contact?: string;
  keywords?: string[];
  categories?: string[];
  screenshots?: ScreenshotSchema[];
}

export interface ScreenshotSchema {
  url: string;
  caption?: string;
}

/**
 * Extension测试数据工厂 - 创建符合Schema的完整测试数据
 * 严格遵循双重命名约定：返回Schema层(snake_case)格式的数据
 * 
 * @param overrides 覆盖默认值的部分属性
 */
export function createTestExtensionSchemaData(overrides?: Partial<ExtensionProtocolSchema>): ExtensionProtocolSchema {
  const currentTime = new Date().toISOString();
  
  const defaultData: ExtensionProtocolSchema = {
    protocol_version: '1.0.1',
    timestamp: currentTime,
    extension_id: uuidv4(),
    context_id: uuidv4(),
    name: 'test-extension',
    display_name: 'Test Extension Display',
    description: 'Test extension for TDD development',
    version: '1.0.0',
    extension_type: 'plugin',
    status: 'installed',
    compatibility: {
      mplp_version: '1.0.0',
      required_modules: [
        {
          module: 'context',
          min_version: '1.0.0'
        }
      ],
      dependencies: [],
      conflicts: []
    },
    configuration: {
      schema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' }
        }
      },
      current_config: {
        enabled: true
      },
      default_config: {
        enabled: false
      },
      validation_rules: [
        {
          rule: 'required',
          message: 'Configuration is required',
          severity: 'error'
        }
      ]
    },
    extension_points: [
      {
        point_id: `point-${uuidv4()}`,
        name: 'test-hook',
        type: 'hook',
        target_module: 'context',
        event_name: 'context.created',
        execution_order: 1,
        enabled: true,
        handler: {
          function_name: 'handleContextCreated',
          timeout_ms: 5000
        }
      }
    ],
    api_extensions: [
      {
        endpoint_id: `endpoint-${uuidv4()}`,
        path: '/api/test',
        method: 'GET',
        description: 'Test API endpoint',
        handler: 'testHandler',
        authentication_required: true,
        required_permissions: ['test:read']
      }
    ],
    event_subscriptions: [
      {
        subscription_id: `sub-${uuidv4()}`,
        event_pattern: 'context.*',
        source_module: 'context',
        handler: 'handleContextEvents',
        delivery_guarantees: 'at_least_once'
      }
    ],
    lifecycle: {
      install_date: currentTime,
      activation_count: 0,
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 50.0,
        total_executions: 100,
        success_rate: 0.95,
        memory_usage_mb: 10.5
      }
    },
    security: {
      sandbox_enabled: true,
      resource_limits: {
        max_memory_mb: 100,
        max_cpu_percent: 20,
        network_access: false,
        file_system_access: 'sandbox'
      },
      permissions: [
        {
          permission: 'context:read',
          justification: 'Required for extension functionality',
          approved: true
        }
      ]
    },
    metadata: {
      author: 'MPLP Test Team',
      organization: 'MPLP Project',
      license: 'MIT',
      keywords: ['test', 'extension', 'plugin'],
      categories: ['testing']
    }
  };

  // 应用覆盖值 (严格类型安全，符合Zero Technical Debt要求)
  return { ...defaultData, ...overrides };
}

/**
 * 创建最小化的测试数据 - 仅包含必需字段
 */
export function createMinimalTestExtensionSchemaData(): Partial<ExtensionProtocolSchema> {
  const currentTime = new Date().toISOString();
  
  return {
    protocol_version: '1.0.1',
    timestamp: currentTime,
    extension_id: uuidv4(),
    context_id: uuidv4(),
    name: 'minimal-test-extension',
    extension_type: 'plugin',
    status: 'installed',
    version: '1.0.0'
  };
}

/**
 * 创建用于错误测试的无效数据
 */
export function createInvalidExtensionSchemaData(): Partial<ExtensionProtocolSchema> {
  return {
    protocol_version: '1.0.1',
    timestamp: new Date().toISOString(),
    extension_id: 'invalid-uuid', // 无效UUID格式
    context_id: `ctx-${uuidv4()}`,
    name: 'invalid@name!', // 包含非法字符
    extension_type: 'invalid_type' as 'plugin', // 无效的扩展类型
    status: 'invalid_status' as 'installed', // 无效状态
    version: 'invalid-version' // 无效版本格式
  };
}