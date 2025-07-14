/**
 * MPLP模块集成接口定义
 * 
 * @version v1.1.0
 * @created 2025-07-10T13:00:00+08:00
 * @updated 2025-07-18T11:30:00+08:00
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 */

import { ITraceAdapter, AdapterHealth, FailureReport, RecoverySuggestion } from './trace-adapter.interface';
import { IPlanAdapter } from './plan-adapter.interface';
import { IConfirmAdapter } from './confirm-adapter.interface';
import { DependencyContainer } from '../core/dependency-container';

/**
 * Context管理器接口
 */
export interface IContextManager {
  /**
   * 创建上下文
   * @param contextData 上下文数据
   * @returns 上下文ID
   */
  createContext(contextData: Record<string, unknown>): Promise<string>;
  
  /**
   * 获取上下文
   * @param contextId 上下文ID
   * @returns 上下文数据
   */
  getContext(contextId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 更新上下文
   * @param contextId 上下文ID
   * @param contextData 上下文数据
   * @returns 是否更新成功
   */
  updateContext(contextId: string, contextData: Record<string, unknown>): Promise<boolean>;
  
  /**
   * 验证上下文是否存在
   * @param contextId 上下文ID
   * @returns 是否存在
   */
  validateContextExists(contextId: string): Promise<boolean>;
  
  /**
   * 更新上下文状态
   * @param contextId 上下文ID
   * @param updates 状态更新
   * @returns 是否更新成功
   */
  updateContextState(contextId: string, updates: Record<string, unknown>): Promise<boolean>;
  
  /**
   * 获取上下文状态
   * @param contextId 上下文ID
   * @returns 上下文状态
   */
  getContextState(contextId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 获取管理器状态
   * @returns 状态信息
   */
  getStatus(): {
    total_contexts: number;
    active_contexts: number;
    is_initialized: boolean;
  };
}

/**
 * Role管理器接口
 */
export interface IRoleManager {
  /**
   * 创建角色
   * @param roleData 角色数据
   * @returns 角色ID
   */
  createRole(roleData: Record<string, unknown>): Promise<string>;
  
  /**
   * 获取角色
   * @param roleId 角色ID
   * @returns 角色数据
   */
  getRole(roleId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 更新角色
   * @param roleId 角色ID
   * @param roleData 角色数据
   * @returns 是否更新成功
   */
  updateRole(roleId: string, roleData: Record<string, unknown>): Promise<boolean>;
  
  /**
   * 分配角色给用户
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 是否分配成功
   */
  assignRoleToUser(userId: string, roleId: string): Promise<boolean>;
  
  /**
   * 撤销用户角色
   * @param userId 用户ID
   * @param roleId 角色ID
   * @returns 是否撤销成功
   */
  revokeRoleFromUser(userId: string, roleId: string): Promise<boolean>;
  
  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param resource 资源
   * @param action 操作
   * @returns 是否有权限
   */
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  
  /**
   * 获取用户角色
   * @param userId 用户ID
   * @returns 角色ID列表
   */
  getUserRoles(userId: string): Promise<string[]>;
  
  /**
   * 获取管理器状态
   * @returns 状态信息
   */
  getStatus(): {
    total_roles: number;
    total_users: number;
    is_initialized: boolean;
  };
}

/**
 * 追踪管理器接口
 */
export interface ITraceManager {
  /**
   * 设置追踪适配器
   * @param adapter 追踪适配器
   */
  setAdapter(adapter: ITraceAdapter): void;
  
  /**
   * 获取当前设置的追踪适配器
   * @returns 追踪适配器
   */
  getAdapter(): ITraceAdapter;
  
  /**
   * 记录追踪数据
   * @param data 追踪数据
   * @returns 追踪ID
   */
  recordTrace(data: Record<string, unknown>): Promise<string>;
  
  /**
   * 获取追踪数据
   * @param traceId 追踪ID
   * @returns 追踪数据
   */
  getTrace(traceId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 查询追踪数据
   * @param filter 过滤条件
   * @returns 追踪数据列表
   */
  queryTraces(filter: Record<string, unknown>): Promise<Array<Record<string, unknown>>>;
  
  /**
   * 报告故障信息
   * @param failure 故障报告
   * @returns 故障ID
   */
  reportFailure(failure: FailureReport): Promise<string>;
  
  /**
   * 获取故障恢复建议
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]>;
  
  /**
   * 检测开发问题
   * @returns 开发问题列表及置信度
   */
  detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }>;
  
  /**
   * 配置同步选项
   * @param options 同步选项
   */
  configureSyncOptions(options: {
    intervalMs?: number;
    batchSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }): void;
  
  /**
   * 获取管理器状态
   * @returns 状态信息
   */
  getStatus(): {
    total_traces: number;
    pending_traces: number;
    adapter_status: string;
    is_syncing: boolean;
  };
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  checkAdapterHealth(): Promise<AdapterHealth | null>;
}

/**
 * Plan模块集成接口
 */
export interface IPlanManager {
  /**
   * 创建计划
   * @param planData 计划数据
   * @returns 计划ID
   */
  createPlan(planData: Record<string, unknown>): Promise<string>;
  
  /**
   * 获取计划
   * @param planId 计划ID
   * @returns 计划数据
   */
  getPlan(planId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 更新计划
   * @param planId 计划ID
   * @param planData 计划数据
   * @returns 是否更新成功
   */
  updatePlan(planId: string, planData: Record<string, unknown>): Promise<boolean>;
  
  /**
   * 获取适配器
   * @returns 计划适配器
   */
  getAdapter(): IPlanAdapter;
}

/**
 * Confirm模块集成接口
 */
export interface IConfirmManager {
  /**
   * 创建确认
   * @param confirmData 确认数据
   * @returns 确认ID
   */
  createConfirmation(confirmData: Record<string, unknown>): Promise<string>;
  
  /**
   * 获取确认
   * @param confirmId 确认ID
   * @returns 确认数据
   */
  getConfirmation(confirmId: string): Promise<Record<string, unknown> | null>;
  
  /**
   * 更新确认
   * @param confirmId 确认ID
   * @param confirmData 确认数据
   * @returns 是否更新成功
   */
  updateConfirmation(confirmId: string, confirmData: Record<string, unknown>): Promise<boolean>;
  
  /**
   * 验证确认是否存在
   * @param confirmId 确认ID
   * @returns 是否存在
   */
  validateConfirmationExists(confirmId: string): Promise<boolean>;
  
  /**
   * 获取适配器
   * @returns 确认适配器
   */
  getAdapter(): IConfirmAdapter;
}

/**
 * 扩展管理器接口
 */
export interface IExtensionManager {
  /**
   * 加载扩展
   * @param extensionId 扩展ID
   * @returns 是否加载成功
   */
  loadExtension(extensionId: string): Promise<boolean>;
  
  /**
   * 卸载扩展
   * @param extensionId 扩展ID
   * @returns 是否卸载成功
   */
  unloadExtension(extensionId: string): Promise<boolean>;
  
  /**
   * 获取已加载的扩展列表
   * @returns 扩展ID列表
   */
  getLoadedExtensions(): string[];
  
  /**
   * 调用扩展方法
   * @param extensionId 扩展ID
   * @param methodName 方法名
   * @param params 参数
   * @returns 方法调用结果
   */
  callExtensionMethod(
    extensionId: string, 
    methodName: string, 
    params: Record<string, unknown>
  ): Promise<unknown>;
} 

/**
 * 模块集成接口
 */
export interface IModuleIntegration {
  /**
   * 初始化模块
   * @param container 依赖注入容器
   */
  initialize(container: DependencyContainer): Promise<void>;
  
  /**
   * 启动模块
   */
  start(): Promise<void>;
  
  /**
   * 停止模块
   */
  stop(): Promise<void>;
  
  /**
   * 获取模块名称
   * @returns 模块名称
   */
  getName(): string;
  
  /**
   * 获取模块版本
   * @returns 模块版本
   */
  getVersion(): string;
  
  /**
   * 获取模块状态
   * @returns 模块状态
   */
  getStatus(): Record<string, unknown>;
  
  /**
   * 获取模块配置
   * @returns 模块配置
   */
  getConfig(): Record<string, unknown>;
}

/**
 * 模块配置接口
 */
export interface ModuleConfig {
  /**
   * 模块版本
   */
  version?: string;
  
  /**
   * 模块依赖
   */
  dependencies?: string[];
  
  /**
   * 模块提供的接口
   */
  interfaces?: string[];
  
  /**
   * 模块配置选项
   */
  options?: Record<string, unknown>;
  
  /**
   * 模块初始化超时时间（毫秒）
   */
  initTimeoutMs?: number;
  
  /**
   * 是否自动启动
   */
  autoStart?: boolean;
}

/**
 * 模块信息接口
 */
export interface ModuleInfo {
  /**
   * 模块名称
   */
  name: string;
  
  /**
   * 模块版本
   */
  version: string;
  
  /**
   * 模块依赖
   */
  dependencies: string[];
  
  /**
   * 模块提供的接口
   */
  interfaces: string[];
  
  /**
   * 是否已初始化
   */
  isInitialized: boolean;
  
  /**
   * 是否已启动
   */
  isStarted: boolean;
  
  /**
   * 注册时间
   */
  registrationTime: string;
  
  /**
   * 初始化时间
   */
  initializationTime?: string;
  
  /**
   * 启动时间
   */
  startTime?: string;
  
  /**
   * 停止时间
   */
  stopTime?: string;
  
  /**
   * 错误信息
   */
  error?: {
    message: string;
    stack?: string;
    timestamp: string;
  };
}

/**
 * 模块生命周期事件数据
 */
export interface ModuleLifecycleEventData {
  /**
   * 模块名称
   */
  moduleName: string;
  
  /**
   * 事件类型
   */
  eventType: 'registered' | 'initialized' | 'started' | 'stopped' | 'error';
  
  /**
   * 时间戳
   */
  timestamp: string;
  
  /**
   * 额外数据
   */
  data?: Record<string, unknown>;
} 