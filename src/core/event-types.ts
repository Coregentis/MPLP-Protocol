/**
 * 事件类型定义
 * @description 定义系统中使用的事件类型和数据结构
 * @author MPLP Team
 * @version 1.0.1
 */

/**
 * 基础事件类型枚举
 */
export enum EventType {
  // 系统事件
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_ERROR = 'system.error',
  
  // 用户事件
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_ACTION = 'user.action',
  
  // 数据事件
  DATA_CREATED = 'data.created',
  DATA_UPDATED = 'data.updated',
  DATA_DELETED = 'data.deleted',
  
  // 工作流事件
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  
  // 模块事件
  MODULE_LOADED = 'module.loaded',
  MODULE_UNLOADED = 'module.unloaded',
  MODULE_ERROR = 'module.error',
  
  // 缓存事件
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',
  CACHE_CLEARED = 'cache.cleared',
  
  // 网络事件
  REQUEST_STARTED = 'request.started',
  REQUEST_COMPLETED = 'request.completed',
  REQUEST_FAILED = 'request.failed'
}

/**
 * 事件数据基础接口
 */
export interface EventData {
  timestamp: string;
  source: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

/**
 * 系统事件数据
 */
export interface SystemEventData extends EventData {
  type: 'startup' | 'shutdown' | 'error';
  version?: string;
  environment?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * 用户事件数据
 */
export interface UserEventData extends EventData {
  userId: string;
  sessionId?: string;
  action?: string;
  details?: Record<string, any>;
}

/**
 * 数据事件数据
 */
export interface DataEventData extends EventData {
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
}

/**
 * 工作流事件数据
 */
export interface WorkflowEventData extends EventData {
  workflowId: string;
  workflowType: string;
  status: 'started' | 'completed' | 'failed';
  stageId?: string;
  result?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * 模块事件数据
 */
export interface ModuleEventData extends EventData {
  moduleName: string;
  moduleVersion: string;
  operation: 'load' | 'unload' | 'error';
  dependencies?: string[];
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * 缓存事件数据
 */
export interface CacheEventData extends EventData {
  key: string;
  operation: 'hit' | 'miss' | 'set' | 'delete' | 'clear';
  ttl?: number;
  size?: number;
  pattern?: string;
}

/**
 * 网络请求事件数据
 */
export interface RequestEventData extends EventData {
  requestId: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * 性能事件数据
 */
export interface PerformanceEventData extends EventData {
  operation: string;
  duration: number;
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

/**
 * 安全事件数据
 */
export interface SecurityEventData extends EventData {
  eventType: 'authentication' | 'authorization' | 'intrusion' | 'audit';
  userId?: string;
  resource?: string;
  action?: string;
  result: 'success' | 'failure';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

/**
 * 业务事件数据
 */
export interface BusinessEventData extends EventData {
  domain: string;
  aggregate: string;
  aggregateId: string;
  eventVersion: number;
  payload: Record<string, any>;
}

/**
 * 事件类型到数据类型的映射
 */
export type EventTypeDataMap = {
  [EventType.SYSTEM_STARTUP]: SystemEventData;
  [EventType.SYSTEM_SHUTDOWN]: SystemEventData;
  [EventType.SYSTEM_ERROR]: SystemEventData;
  [EventType.USER_LOGIN]: UserEventData;
  [EventType.USER_LOGOUT]: UserEventData;
  [EventType.USER_ACTION]: UserEventData;
  [EventType.DATA_CREATED]: DataEventData;
  [EventType.DATA_UPDATED]: DataEventData;
  [EventType.DATA_DELETED]: DataEventData;
  [EventType.WORKFLOW_STARTED]: WorkflowEventData;
  [EventType.WORKFLOW_COMPLETED]: WorkflowEventData;
  [EventType.WORKFLOW_FAILED]: WorkflowEventData;
  [EventType.MODULE_LOADED]: ModuleEventData;
  [EventType.MODULE_UNLOADED]: ModuleEventData;
  [EventType.MODULE_ERROR]: ModuleEventData;
  [EventType.CACHE_HIT]: CacheEventData;
  [EventType.CACHE_MISS]: CacheEventData;
  [EventType.CACHE_CLEARED]: CacheEventData;
  [EventType.REQUEST_STARTED]: RequestEventData;
  [EventType.REQUEST_COMPLETED]: RequestEventData;
  [EventType.REQUEST_FAILED]: RequestEventData;
};

/**
 * 事件处理器类型
 */
export type EventHandler<T extends EventData = EventData> = (data: T) => void | Promise<void>;

/**
 * 事件过滤器类型
 */
export type EventFilter<T extends EventData = EventData> = (data: T) => boolean;

/**
 * 事件转换器类型
 */
export type EventTransformer<T extends EventData = EventData, R extends EventData = EventData> = (data: T) => R;
