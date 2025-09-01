/**
 * 横切关注点共享类型定义
 * 
 * @description 所有横切关注点管理器共享的类型定义
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */

// ===== 基础类型 =====

/**
 * 管理器状态枚举
 */
export type ManagerStatus = 'initializing' | 'active' | 'degraded' | 'inactive' | 'error';

/**
 * 优先级枚举
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 操作结果接口
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * 基础管理器接口
 */
export interface BaseManager {
  /**
   * 健康检查
   */
  healthCheck(): Promise<boolean>;

  /**
   * 获取管理器状态
   */
  getStatus?(): ManagerStatus;

  /**
   * 初始化管理器
   */
  initialize?(config?: Record<string, unknown>): Promise<void>;

  /**
   * 关闭管理器
   */
  shutdown?(): Promise<void>;
}

// ===== 安全相关类型 =====

/**
 * 认证方法枚举
 */
export type AuthenticationMethod = 'password' | 'token' | 'oauth' | 'certificate' | 'biometric';

/**
 * 权限级别枚举
 */
export type PermissionLevel = 'none' | 'read' | 'write' | 'execute' | 'admin' | 'owner';

/**
 * 安全事件类型
 */
export type SecurityEventType = 
  | 'authentication_success'
  | 'authentication_failure'
  | 'authorization_granted'
  | 'authorization_denied'
  | 'session_created'
  | 'session_expired'
  | 'permission_changed'
  | 'security_violation';

// ===== 性能相关类型 =====

/**
 * 指标类型枚举
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * 性能告警级别
 */
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

/**
 * 性能阈值配置
 */
export interface PerformanceThreshold {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: number;
  alertLevel: AlertLevel;
  description?: string;
}

// ===== 事件相关类型 =====

/**
 * 事件类型枚举
 */
export type EventType = 
  | 'system'
  | 'user'
  | 'security'
  | 'performance'
  | 'error'
  | 'coordination'
  | 'workflow'
  | 'state_change'
  | 'transaction';

/**
 * 事件优先级
 */
export type EventPriority = 'immediate' | 'high' | 'normal' | 'low' | 'background';

/**
 * 事件过滤器
 */
export interface EventFilter {
  types?: EventType[];
  sources?: string[];
  priorities?: EventPriority[];
  startTime?: string;
  endTime?: string;
  tags?: Record<string, string>;
}

// ===== 错误相关类型 =====

/**
 * 错误分类枚举
 */
export type ErrorCategory = 
  | 'system'
  | 'network'
  | 'security'
  | 'validation'
  | 'business'
  | 'integration'
  | 'performance'
  | 'configuration';

/**
 * 错误严重程度
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical' | 'fatal';

/**
 * 错误恢复策略
 */
export type RecoveryStrategy = 'retry' | 'fallback' | 'circuit_breaker' | 'manual' | 'ignore';

// ===== 协调相关类型 =====

/**
 * 协调模式枚举
 */
export type CoordinationMode = 'synchronous' | 'asynchronous' | 'event_driven' | 'workflow_based';

/**
 * 协调状态
 */
export type CoordinationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'timeout';

// ===== 编排相关类型 =====

/**
 * 工作流类型
 */
export type WorkflowType = 'sequential' | 'parallel' | 'conditional' | 'loop' | 'event_driven';

/**
 * 步骤执行模式
 */
export type StepExecutionMode = 'blocking' | 'non_blocking' | 'async' | 'fire_and_forget';

// ===== 状态同步相关类型 =====

/**
 * 同步策略枚举
 */
export type SyncStrategy = 'immediate' | 'batched' | 'scheduled' | 'event_triggered' | 'manual';

/**
 * 冲突解决策略
 */
export type ConflictResolution = 'last_write_wins' | 'first_write_wins' | 'merge' | 'manual' | 'version_based';

// ===== 事务相关类型 =====

/**
 * 事务隔离级别
 */
export type IsolationLevel = 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';

/**
 * 事务传播行为
 */
export type PropagationBehavior = 'required' | 'requires_new' | 'supports' | 'not_supported' | 'never' | 'mandatory';

// ===== 版本相关类型 =====

/**
 * 版本兼容性级别
 */
export type CompatibilityLevel = 'major' | 'minor' | 'patch' | 'incompatible';

/**
 * 版本策略
 */
export type VersioningStrategy = 'semantic' | 'date_based' | 'sequential' | 'custom';

// ===== 配置相关类型 =====

/**
 * 配置源枚举
 */
export type ConfigSource = 'file' | 'environment' | 'database' | 'remote' | 'memory';

/**
 * 配置更新策略
 */
export type ConfigUpdateStrategy = 'immediate' | 'scheduled' | 'manual' | 'on_restart';

// ===== 监控相关类型 =====

/**
 * 监控级别
 */
export type MonitoringLevel = 'none' | 'basic' | 'detailed' | 'comprehensive' | 'debug';

/**
 * 健康检查类型
 */
export type HealthCheckType = 'liveness' | 'readiness' | 'startup' | 'custom';

/**
 * 健康检查结果
 */
export interface HealthCheckResult {
  type: HealthCheckType;
  status: 'pass' | 'fail' | 'warn';
  timestamp: string;
  duration: number;
  message?: string;
  details?: Record<string, unknown>;
}

// ===== 通用工具类型 =====

/**
 * 时间窗口配置
 */
export interface TimeWindow {
  start: string;
  end: string;
  duration?: number;
  timezone?: string;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize?: number;
  strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
  keyPrefix?: string;
}

// ===== 导出所有类型 =====
// 注意：使用具名导出避免与其他模块类型冲突
