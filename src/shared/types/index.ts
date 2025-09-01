/**
 * MPLP共享类型定义
 * 
 * @description 所有模块共享的TypeScript类型定义
 * @version 1.0.0
 * @architecture 支持L1-L3分层架构的统一类型系统
 */

// ===== 基础类型 =====

/**
 * UUID v4类型
 */
export type UUID = string;

/**
 * ISO 8601时间戳类型
 */
export type Timestamp = string;

/**
 * 语义化版本号类型
 */
export type Version = string;

/**
 * 优先级枚举
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 状态枚举
 */
export type Status = 'active' | 'inactive' | 'suspended' | 'completed' | 'terminated';

// ===== MPLP协议类型 =====

/**
 * MPLP模块名称类型
 */
export type MLPPModuleName = 
  | 'context' 
  | 'plan' 
  | 'confirm' 
  | 'trace' 
  | 'role' 
  | 'extension' 
  | 'core' 
  | 'collab' 
  | 'dialog' 
  | 'network';

/**
 * 协议层级类型
 */
export type ProtocolLayer = 'L1' | 'L2' | 'L3';

/**
 * L1基础设施组件类型
 */
export type L1Component = 'security' | 'performance' | 'events' | 'storage';

/**
 * L3管理器类型
 */
export type L3ManagerType = 
  | 'security'
  | 'performance'
  | 'eventBus'
  | 'errorHandler'
  | 'coordination'
  | 'orchestration'
  | 'stateSync'
  | 'transaction'
  | 'protocolVersion';

// ===== 通用数据结构 =====

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

/**
 * 元数据接口
 */
export interface Metadata {
  [key: string]: unknown;
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 查询过滤器接口
 */
export interface QueryFilter {
  [key: string]: unknown;
}

/**
 * 操作结果接口
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Metadata;
  };
  metadata?: Metadata;
}

// ===== 配置类型 =====

/**
 * 模块配置接口
 */
export interface ModuleConfig {
  enabled: boolean;
  version: Version;
  dependencies: MLPPModuleName[];
  settings: Metadata;
}

/**
 * 环境配置类型
 */
export type Environment = 'development' | 'testing' | 'staging' | 'production';

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// ===== 事件类型 =====

/**
 * 基础事件接口
 */
export interface BaseEvent {
  id: UUID;
  type: string;
  timestamp: Timestamp;
  source: MLPPModuleName;
  payload: Metadata;
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = Metadata> = (event: BaseEvent & { payload: T }) => Promise<void> | void;

// ===== 错误类型 =====

/**
 * MPLP错误基类
 */
export interface MLPPError {
  code: string;
  message: string;
  module: MLPPModuleName;
  timestamp: Timestamp;
  details?: Metadata;
  stack?: string;
}

/**
 * 错误严重程度类型
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ===== 性能类型 =====

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Timestamp;
  tags?: Record<string, string>;
}

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Timestamp;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }>;
}

// ===== 安全类型 =====

/**
 * 权限类型
 */
export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';

/**
 * 角色接口
 */
export interface Role {
  id: UUID;
  name: string;
  permissions: Permission[];
  description?: string;
}

/**
 * 用户接口
 */
export interface User {
  id: UUID;
  username: string;
  email: string;
  roles: Role[];
  metadata?: Metadata;
}

// ===== 工具类型 =====

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 必需字段类型
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可选字段类型
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 键值对类型
 */
export type KeyValuePair<K extends string | number | symbol = string, V = unknown> = {
  [key in K]: V;
};

// ===== 导出所有类型 =====
// 注意：其他类型模块待实现
// export * from './context-types';
// export * from './protocol-types';
// export * from './schema-types';
