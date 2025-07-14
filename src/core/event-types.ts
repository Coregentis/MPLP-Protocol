/**
 * MPLP事件类型定义
 * 
 * 定义系统中所有可能的事件类型，确保事件发布和订阅的类型安全。
 * 
 * @version v1.1.0
 * @created 2025-07-15T12:00:00+08:00
 * @updated 2025-07-18T10:00:00+08:00
 */

/**
 * 事件类型枚举
 */
export enum EventType {
  // 模块生命周期事件
  MODULE_REGISTERED = 'module:registered',
  MODULE_INITIALIZED = 'module:initialized',
  MODULE_STARTED = 'module:started',
  MODULE_STOPPED = 'module:stopped',
  
  // 依赖图事件
  DEPENDENCY_GRAPH_GENERATED = 'dependency:graphGenerated',
  DEPENDENCY_CYCLE_DETECTED = 'dependency:cycleDetected',
  DEPENDENCY_ANALYSIS_COMPLETED = 'dependency:analysisCompleted',
  DEPENDENCY_VALIDATION_FAILED = 'dependency:validationFailed',
  
  // Context模块事件
  CONTEXT_CREATED = 'context:created',
  CONTEXT_UPDATED = 'context:updated',
  CONTEXT_DELETED = 'context:deleted',
  CONTEXT_STATE_CHANGED = 'context:stateChanged',
  
  // Plan模块事件
  PLAN_CREATED = 'plan:created',
  PLAN_UPDATED = 'plan:updated',
  PLAN_EXECUTED = 'plan:executed',
  TASK_STARTED = 'task:started',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  
  // Confirm模块事件
  APPROVAL_REQUESTED = 'approval:requested',
  APPROVAL_GRANTED = 'approval:granted',
  APPROVAL_REJECTED = 'approval:rejected',
  
  // Trace模块事件
  TRACE_RECORDED = 'trace:recorded',
  TRACE_SYNCED = 'trace:synced',
  TRACE_ANALYZED = 'trace:analyzed',
  
  // Role模块事件
  ROLE_CREATED = 'role:created',
  ROLE_UPDATED = 'role:updated',
  ROLE_DELETED = 'role:deleted',
  PERMISSION_CHECKED = 'permission:checked',
  
  // Extension模块事件
  EXTENSION_REGISTERED = 'extension:registered',
  EXTENSION_LOADED = 'extension:loaded',
  EXTENSION_UNLOADED = 'extension:unloaded',
  
  // 系统事件
  SYSTEM_ERROR = 'system:error',
  SYSTEM_WARNING = 'system:warning',
  SYSTEM_INFO = 'system:info',
  
  // 依赖注入事件
  DI_CONTAINER_INITIALIZED = 'di:containerInitialized',
  DI_SERVICE_REGISTERED = 'di:serviceRegistered',
  DI_SERVICE_RESOLVED = 'di:serviceResolved',
  DI_CIRCULAR_DEPENDENCY = 'di:circularDependency'
}

/**
 * 事件数据接口
 */
export interface EventData {
  timestamp: string;
  [key: string]: any;
}

/**
 * 模块注册事件数据
 */
export interface ModuleRegisteredEventData extends EventData {
  module: string;
  interfaces: string[];
}

/**
 * 依赖图生成事件数据
 */
export interface DependencyGraphGeneratedEventData extends EventData {
  nodeCount: number;
  relationCount: number;
  isValid: boolean;
  moduleCount?: number;
  analysisTime?: number;
}

/**
 * 循环依赖检测事件数据
 */
export interface DependencyCycleDetectedEventData extends EventData {
  cycles: string[][];
}

/**
 * 依赖分析完成事件数据
 */
export interface DependencyAnalysisCompletedEventData extends EventData {
  moduleCount: number;
  nodeCount: number;
  relationCount: number;
  cohesionMetrics: Record<string, number>;
  couplingMetrics: Record<string, number>;
  analysisTime: number;
}

/**
 * 依赖验证失败事件数据
 */
export interface DependencyValidationFailedEventData extends EventData {
  violations: string[];
  cycles?: string[][];
}

/**
 * 依赖注入容器初始化事件数据
 */
export interface DIContainerInitializedEventData extends EventData {
  containerName?: string;
  registrationCount: number;
  isRoot: boolean;
}

/**
 * 依赖注入服务注册事件数据
 */
export interface DIServiceRegisteredEventData extends EventData {
  serviceToken: string;
  isSingleton: boolean;
  dependencyCount: number;
}

/**
 * 依赖注入服务解析事件数据
 */
export interface DIServiceResolvedEventData extends EventData {
  serviceToken: string;
  resolutionTime: number;
  dependencyDepth: number;
}

/**
 * 依赖注入循环依赖事件数据
 */
export interface DICircularDependencyEventData extends EventData {
  cycle: string[];
}

/**
 * 事件数据类型映射
 */
export interface EventDataMap {
  [EventType.MODULE_REGISTERED]: ModuleRegisteredEventData;
  [EventType.DEPENDENCY_GRAPH_GENERATED]: DependencyGraphGeneratedEventData;
  [EventType.DEPENDENCY_CYCLE_DETECTED]: DependencyCycleDetectedEventData;
  [EventType.DEPENDENCY_ANALYSIS_COMPLETED]: DependencyAnalysisCompletedEventData;
  [EventType.DEPENDENCY_VALIDATION_FAILED]: DependencyValidationFailedEventData;
  [EventType.DI_CONTAINER_INITIALIZED]: DIContainerInitializedEventData;
  [EventType.DI_SERVICE_REGISTERED]: DIServiceRegisteredEventData;
  [EventType.DI_SERVICE_RESOLVED]: DIServiceResolvedEventData;
  [EventType.DI_CIRCULAR_DEPENDENCY]: DICircularDependencyEventData;
  [key: string]: EventData;
}

/**
 * 事件处理函数类型
 */
export type EventHandler<T extends EventData = EventData> = (data: T) => void; 