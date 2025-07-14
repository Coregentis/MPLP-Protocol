/**
 * MPLP Context模块导出接口
 * 
 * Context模块负责上下文和全局状态管理
 * 所有导出类型都严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.3
 * @updated 2025-07-16T13:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

// 引入类型
import type { IContextRepository, IContextValidator } from './context-service';
import type { ContextManagerConfig } from './context-manager';
import { ContextService } from './context-service';
import { ContextManager } from './context-manager';
import { ContextController } from './context.controller';

// ===== 基础类型重新导出 =====
export type {
  UUID,
  Timestamp,
  Version,
  Priority
} from './types';

// ===== 核心协议接口 =====
export type {
  ContextProtocol
} from './types';

// ===== 状态和枚举类型 =====
export type {
  ContextStatus,
  ContextLifecycleStage,
  ResourceStatus,
  DependencyType,
  DependencyStatus,
  GoalStatus,
  ComparisonOperator,
  PrincipalType,
  ContextAction,
  PolicyType,
  PolicyEnforcement,
  NotificationChannel,
  NotificationEvent,
  StorageBackend
} from './types';

// ===== 结构化数据类型 =====
export type {
  SharedState,
  ResourceManagement,
  AllocatedResource,
  ResourceRequirement,
  ContextDependency,
  ContextGoal,
  SuccessCriterion,
  AccessControl,
  ContextOwner,
  ContextPermission,
  AccessPolicy,
  PolicyRule,
  ContextConfiguration,
  TimeoutSettings,
  NotificationSettings,
  PersistenceSettings,
  RetentionPolicy
} from './types';

// ===== 请求和响应类型 =====
export type {
  CreateContextRequest,
  UpdateContextRequest,
  BatchContextRequest,
  BatchContextOperation,
  ContextResponse,
  BatchContextResponse,
  ContextFilter,
  ContextOperationResult
} from './types';

// ===== 错误处理类 =====
export {
  ContextError,
  ValidationError,
  AccessDeniedError,
  ResourceAllocationError,
  DependencyResolutionError,
  ConfigurationError,
  InternalError
} from './types';

// ===== 服务层 =====
export {
  ContextService,
  type IContextRepository,
  type IContextValidator,
  type ContextEventData
} from './context-service';

// ===== 管理器层 =====
export {
  ContextManager,
  type ContextManagerConfig,
  type ContextSession,
  type ContextStatistics,
  type ContextManagerEventData
} from './context-manager';

// ===== 控制器层 =====
export {
  ContextController
} from './context.controller';

// ===== 模块常量 =====
export const CONTEXT_MODULE_INFO = {
  name: 'Context',
  version: '1.0.3',
  description: 'MPLP Context Module - Context and Global State Management',
  schema_version: '1.0.1',
  schema_path: 'src/schemas/context-protocol.json',
  compliance: '100% Schema compliant'
} as const;

// ===== 默认配置 =====
export const DEFAULT_CONTEXT_CONFIG = {
  timeout_settings: {
    default_timeout: 300,
    max_timeout: 3600,
    cleanup_timeout: 60
  },
  persistence: {
    enabled: true,
    storage_backend: 'database' as const
  },
  notification_settings: {
    enabled: false
  }
} as const;

// ===== 模块实用工具 =====

/**
 * 创建默认Context创建请求
 */
export function createDefaultContextRequest(name: string, description?: string): import('./types').CreateContextRequest {
  return {
    name,
    description,
    shared_state: {
      variables: {},
      resources: {
        allocated: {},
        requirements: {}
      },
      dependencies: [],
      goals: []
    },
    configuration: DEFAULT_CONTEXT_CONFIG
  };
}

/**
 * 验证Context协议对象的基本完整性
 */
export function validateContextProtocol(context: import('./types').ContextProtocol): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必需字段
  if (!context.protocol_version) errors.push('Missing protocol_version');
  if (!context.timestamp) errors.push('Missing timestamp');
  if (!context.context_id) errors.push('Missing context_id');
  if (!context.name) errors.push('Missing name');
  if (!context.status) errors.push('Missing status');
  if (!context.lifecycle_stage) errors.push('Missing lifecycle_stage');
  if (!context.shared_state) errors.push('Missing shared_state');
  if (!context.access_control) errors.push('Missing access_control');
  if (!context.configuration) errors.push('Missing configuration');

  // 检查枚举值
  const validStatuses: import('./types').ContextStatus[] = ['active', 'suspended', 'completed', 'terminated'];
  if (context.status && !validStatuses.includes(context.status)) {
    errors.push(`Invalid status: ${context.status}`);
  }

  const validStages: import('./types').ContextLifecycleStage[] = ['planning', 'executing', 'monitoring', 'completed'];
  if (context.lifecycle_stage && !validStages.includes(context.lifecycle_stage)) {
    errors.push(`Invalid lifecycle_stage: ${context.lifecycle_stage}`);
  }

  // 检查共享状态结构
  if (context.shared_state) {
    if (!context.shared_state.variables) errors.push('Missing shared_state.variables');
    if (!context.shared_state.resources) errors.push('Missing shared_state.resources');
    if (!context.shared_state.dependencies) errors.push('Missing shared_state.dependencies');
    if (!context.shared_state.goals) errors.push('Missing shared_state.goals');
  }

  // 检查访问控制结构
  if (context.access_control) {
    if (!context.access_control.owner) errors.push('Missing access_control.owner');
    if (!context.access_control.permissions) errors.push('Missing access_control.permissions');
  }

  // 检查配置结构
  if (context.configuration) {
    if (!context.configuration.timeout_settings) errors.push('Missing configuration.timeout_settings');
    if (!context.configuration.persistence) errors.push('Missing configuration.persistence');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查Context是否处于活跃状态
 */
export function isContextActive(context: import('./types').ContextProtocol): boolean {
  return context.status === 'active' && context.lifecycle_stage !== 'completed';
}

/**
 * 检查Context是否已完成
 */
export function isContextCompleted(context: import('./types').ContextProtocol): boolean {
  return context.status === 'completed' || context.lifecycle_stage === 'completed';
}

/**
 * 获取Context的人类可读状态描述
 */
export function getContextStatusDescription(context: import('./types').ContextProtocol): string {
  const statusDescriptions: Record<import('./types').ContextStatus, string> = {
    active: '活跃',
    suspended: '暂停',
    completed: '已完成',
    terminated: '已终止'
  };

  const stageDescriptions: Record<import('./types').ContextLifecycleStage, string> = {
    planning: '规划中',
    executing: '执行中',
    monitoring: '监控中',
    completed: '已完成'
  };

  const status = statusDescriptions[context.status] || context.status;
  const stage = stageDescriptions[context.lifecycle_stage] || context.lifecycle_stage;

  return `${status} (${stage})`;
}

/**
 * 创建默认Context配置
 * 
 * @returns 默认Context配置
 */
export function createDefaultContextConfig() {
  return DEFAULT_CONTEXT_CONFIG;
}

/**
 * 创建Context模块
 * 
 * @param options 模块选项
 * @returns Context模块实例
 */
export async function createContextModule(options: {
  dataSource: any;
  config: any;
  redisClient?: any;
  socketServer?: any;
  tracePilotAdapter?: any;
}) {
  const { dataSource, config, redisClient, socketServer, tracePilotAdapter } = options;
  
  // 导入所需类
  const { ContextService } = await import('./context-service');
  const { ContextManager } = await import('./context-manager');
  const { ContextController } = await import('./context.controller');
  
  // 创建必要的依赖项
  const contextRepository: IContextRepository = {
    // 简单的存储库实现，实际项目中应该使用真实的存储库
    save: async (context: any) => {},
    findById: async (id: string) => null,
    findByFilter: async (filter: any) => [],
    update: async (id: string, updates: any) => {},
    delete: async (id: string) => {},
    exists: async (id: string) => false,
    count: async (filter?: any) => 0,
    getContextHistory: async (contextId: string, options: {
      limit: number;
      offset: number;
      startTime?: string;
      endTime?: string;
      pathFilter?: string;
    }) => {
      return [];
    }
  };
  
  const contextValidator: IContextValidator = {
    // 简单的验证器实现，实际项目中应该使用真实的验证器
    validateCreate: async (request: any) => ({ valid: true }),
    validateUpdate: async (request: any) => ({ valid: true }),
    validateSchema: async (context: any) => ({ valid: true }),
    validateBatch: async (request: any) => ({ valid: true })
  };
  
  // 创建服务实例
  const contextService = new ContextService(
    contextRepository,
    contextValidator
  );
  
  // 创建管理器实例
  const contextManager = new ContextManager(
    contextRepository,
    contextValidator,
    config
  );
  
  // 创建控制器实例
  const contextController = new ContextController(contextService);
  
  // 创建WebSocket处理器（如果提供了socketServer）
  if (socketServer) {
    // 这里可以初始化WebSocket处理
  }
  
  // 返回模块实例
  return {
    service: contextService,
    manager: contextManager,
    controller: contextController,
    router: contextController.getRouter() // 使用公共方法获取路由器
  };
}

/**
 * 计算Context的近似大小(字节)
 */
export function calculateContextSize(context: import('./types').ContextProtocol): number {
  try {
    return JSON.stringify(context).length;
  } catch {
    return 0;
  }
}

/**
 * 生成Context摘要信息
 */
export function generateContextSummary(context: import('./types').ContextProtocol): {
  id: string;
  name: string;
  status: string;
  created: string;
  variables_count: number;
  goals_count: number;
  dependencies_count: number;
  size_bytes: number;
} {
  return {
    id: context.context_id,
    name: context.name,
    status: getContextStatusDescription(context),
    created: context.timestamp,
    variables_count: Object.keys(context.shared_state.variables).length,
    goals_count: context.shared_state.goals.length,
    dependencies_count: context.shared_state.dependencies.length,
    size_bytes: calculateContextSize(context)
  };
} 