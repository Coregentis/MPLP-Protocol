/**
 * MPLP Context模块类型定义
 * 
 * Context模块负责上下文管理和全局状态维护
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

// ===== 基础类型定义 =====
export type UUID = string;
export type Timestamp = string;
export type Version = string;
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// ===== Context协议主接口 (Schema: ContextProtocol) =====
/**
 * Context协议主接口
 * 
 * @schema_path #/properties
 * @required protocol_version, timestamp, context_id, name, status, lifecycle_stage, shared_state, access_control, configuration
 */
export interface ContextProtocol {
  /** 协议版本 - Schema: #/properties/protocol_version */
  protocol_version: Version;
  
  /** 时间戳 - Schema: #/properties/timestamp */
  timestamp: Timestamp;
  
  /** 上下文唯一标识符 - Schema: #/properties/context_id */
  context_id: UUID;
  
  /** 上下文名称 - Schema: #/properties/name */
  name: string;
  
  /** 上下文描述 - Schema: #/properties/description */
  description?: string;
  
  /** 上下文状态 - Schema: #/properties/status */
  status: ContextStatus;
  
  /** 生命周期阶段 - Schema: #/properties/lifecycle_stage */
  lifecycle_stage: ContextLifecycleStage;
  
  /** 共享状态 - Schema: #/properties/shared_state */
  shared_state: SharedState;
  
  /** 访问控制 - Schema: #/properties/access_control */
  access_control: AccessControl;
  
  /** 配置信息 - Schema: #/properties/configuration */
  configuration: ContextConfiguration;
}

// ===== 状态和阶段枚举 (Schema定义) =====

/**
 * 上下文状态枚举
 * @schema_path #/properties/status/enum
 */
export type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';

/**
 * 生命周期阶段枚举
 * @schema_path #/properties/lifecycle_stage/enum
 */
export type ContextLifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';

// ===== 共享状态结构 (Schema: shared_state) =====

/**
 * 共享状态主结构
 * @schema_path #/properties/shared_state
 * @required variables, resources, dependencies, goals
 */
export interface SharedState {
  /** 共享变量 - Schema: #/properties/shared_state/properties/variables */
  variables: Record<string, unknown>;
  
  /** 资源管理 - Schema: #/properties/shared_state/properties/resources */
  resources: ResourceManagement;
  
  /** 依赖关系 - Schema: #/properties/shared_state/properties/dependencies */
  dependencies: ContextDependency[];
  
  /** 目标列表 - Schema: #/properties/shared_state/properties/goals */
  goals: ContextGoal[];
}

/**
 * 资源管理
 * @schema_path #/properties/shared_state/properties/resources
 * @required allocated, requirements
 */
export interface ResourceManagement {
  /** 已分配资源 - Schema: #/properties/shared_state/properties/resources/properties/allocated */
  allocated: Record<string, AllocatedResource>;
  
  /** 资源需求 - Schema: #/properties/shared_state/properties/resources/properties/requirements */
  requirements: Record<string, ResourceRequirement>;
}

/**
 * 已分配资源
 * @schema_path #/properties/shared_state/properties/resources/properties/allocated/additionalProperties
 * @required type, amount, unit, status
 */
export interface AllocatedResource {
  /** 资源类型 - Schema: type */
  type: string;
  
  /** 资源数量 - Schema: amount */
  amount: number;
  
  /** 计量单位 - Schema: unit */
  unit: string;
  
  /** 资源状态 - Schema: status */
  status: ResourceStatus;
}

/**
 * 资源状态枚举
 * @schema_path #/properties/shared_state/properties/resources/properties/allocated/additionalProperties/properties/status/enum
 */
export type ResourceStatus = 'available' | 'allocated' | 'exhausted';

/**
 * 资源需求
 * @schema_path #/properties/shared_state/properties/resources/properties/requirements/additionalProperties
 * @required minimum, unit
 */
export interface ResourceRequirement {
  /** 最小需求 - Schema: minimum */
  minimum: number;
  
  /** 最佳需求 - Schema: optimal */
  optimal?: number;
  
  /** 最大需求 - Schema: maximum */
  maximum?: number;
  
  /** 计量单位 - Schema: unit */
  unit: string;
}

/**
 * 上下文依赖
 * @schema_path #/properties/shared_state/properties/dependencies/items
 * @required id, type, name, status
 */
export interface ContextDependency {
  /** 依赖ID - Schema: id */
  id: UUID;
  
  /** 依赖类型 - Schema: type */
  type: DependencyType;
  
  /** 依赖名称 - Schema: name */
  name: string;
  
  /** 依赖版本 - Schema: version */
  version?: Version;
  
  /** 依赖状态 - Schema: status */
  status: DependencyStatus;
}

/**
 * 依赖类型枚举
 * @schema_path #/properties/shared_state/properties/dependencies/items/properties/type/enum
 */
export type DependencyType = 'context' | 'plan' | 'external';

/**
 * 依赖状态枚举
 * @schema_path #/properties/shared_state/properties/dependencies/items/properties/status/enum
 */
export type DependencyStatus = 'pending' | 'resolved' | 'failed';

/**
 * 上下文目标
 * @schema_path #/properties/shared_state/properties/goals/items
 * @required id, name, priority, status
 */
export interface ContextGoal {
  /** 目标ID - Schema: id */
  id: UUID;
  
  /** 目标名称 - Schema: name */
  name: string;
  
  /** 目标描述 - Schema: description */
  description?: string;
  
  /** 目标优先级 - Schema: priority */
  priority: Priority;
  
  /** 目标状态 - Schema: status */
  status: GoalStatus;
  
  /** 成功标准 - Schema: success_criteria */
  success_criteria?: SuccessCriterion[];
}

/**
 * 目标状态枚举
 * @schema_path #/properties/shared_state/properties/goals/items/properties/status/enum
 */
export type GoalStatus = 'defined' | 'active' | 'achieved' | 'abandoned';

/**
 * 成功标准
 * @schema_path #/properties/shared_state/properties/goals/items/properties/success_criteria/items
 * @required metric, operator, value
 */
export interface SuccessCriterion {
  /** 指标名称 - Schema: metric */
  metric: string;
  
  /** 比较操作符 - Schema: operator */
  operator: ComparisonOperator;
  
  /** 比较值 - Schema: value */
  value: string | number | boolean;
  
  /** 计量单位 - Schema: unit */
  unit?: string;
}

/**
 * 比较操作符枚举
 * @schema_path #/properties/shared_state/properties/goals/items/properties/success_criteria/items/properties/operator/enum
 */
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';

// ===== 访问控制结构 (Schema: access_control) =====

/**
 * 访问控制主结构
 * @schema_path #/properties/access_control
 * @required owner, permissions
 */
export interface AccessControl {
  /** 拥有者信息 - Schema: #/properties/access_control/properties/owner */
  owner: ContextOwner;
  
  /** 权限列表 - Schema: #/properties/access_control/properties/permissions */
  permissions: ContextPermission[];
  
  /** 策略列表 - Schema: #/properties/access_control/properties/policies */
  policies?: AccessPolicy[];
}

/**
 * 上下文拥有者
 * @schema_path #/properties/access_control/properties/owner
 * @required user_id, role
 */
export interface ContextOwner {
  /** 用户ID - Schema: user_id */
  user_id: string;
  
  /** 用户角色 - Schema: role */
  role: string;
}

/**
 * 上下文权限
 * @schema_path #/properties/access_control/properties/permissions/items
 * @required principal, principal_type, resource, actions
 */
export interface ContextPermission {
  /** 主体标识 - Schema: principal */
  principal: string;
  
  /** 主体类型 - Schema: principal_type */
  principal_type: PrincipalType;
  
  /** 资源标识 - Schema: resource */
  resource: string;
  
  /** 允许的操作 - Schema: actions */
  actions: ContextAction[];
  
  /** 条件约束 - Schema: conditions */
  conditions?: Record<string, unknown>;
}

/**
 * 主体类型枚举
 * @schema_path #/properties/access_control/properties/permissions/items/properties/principal_type/enum
 */
export type PrincipalType = 'user' | 'role' | 'group';

/**
 * 上下文操作枚举
 * @schema_path #/properties/access_control/properties/permissions/items/properties/actions/items/enum
 */
export type ContextAction = 'read' | 'write' | 'execute' | 'delete' | 'admin';

/**
 * 访问策略
 * @schema_path #/properties/access_control/properties/policies/items
 * @required id, name, type, rules, enforcement
 */
export interface AccessPolicy {
  /** 策略ID - Schema: id */
  id: UUID;
  
  /** 策略名称 - Schema: name */
  name: string;
  
  /** 策略类型 - Schema: type */
  type: PolicyType;
  
  /** 策略规则 - Schema: rules */
  rules: PolicyRule[];
  
  /** 执行方式 - Schema: enforcement */
  enforcement: PolicyEnforcement;
}

/**
 * 策略类型枚举
 * @schema_path #/properties/access_control/properties/policies/items/properties/type/enum
 */
export type PolicyType = 'security' | 'compliance' | 'operational';

/**
 * 策略规则 (通用对象)
 * @schema_path #/properties/access_control/properties/policies/items/properties/rules/items
 */
export interface PolicyRule {
  [key: string]: unknown;
}

/**
 * 策略执行方式枚举
 * @schema_path #/properties/access_control/properties/policies/items/properties/enforcement/enum
 */
export type PolicyEnforcement = 'strict' | 'advisory' | 'disabled';

// ===== 配置结构 (Schema: configuration) =====

/**
 * 上下文配置主结构
 * @schema_path #/properties/configuration
 * @required timeout_settings, persistence
 */
export interface ContextConfiguration {
  /** 超时设置 - Schema: #/properties/configuration/properties/timeout_settings */
  timeout_settings: TimeoutSettings;
  
  /** 通知设置 - Schema: #/properties/configuration/properties/notification_settings */
  notification_settings?: NotificationSettings;
  
  /** 持久化设置 - Schema: #/properties/configuration/properties/persistence */
  persistence: PersistenceSettings;
}

/**
 * 超时设置
 * @schema_path #/properties/configuration/properties/timeout_settings
 * @required default_timeout, max_timeout
 */
export interface TimeoutSettings {
  /** 默认超时时间 - Schema: default_timeout */
  default_timeout: number;
  
  /** 最大超时时间 - Schema: max_timeout */
  max_timeout: number;
  
  /** 清理超时时间 - Schema: cleanup_timeout */
  cleanup_timeout?: number;
}

/**
 * 通知设置
 * @schema_path #/properties/configuration/properties/notification_settings
 * @required enabled
 */
export interface NotificationSettings {
  /** 是否启用通知 - Schema: enabled */
  enabled: boolean;
  
  /** 通知渠道 - Schema: channels */
  channels?: NotificationChannel[];
  
  /** 通知事件 - Schema: events */
  events?: NotificationEvent[];
}

/**
 * 通知渠道枚举
 * @schema_path #/properties/configuration/properties/notification_settings/properties/channels/items/enum
 */
export type NotificationChannel = 'email' | 'webhook' | 'sms' | 'push';

/**
 * 通知事件枚举
 * @schema_path #/properties/configuration/properties/notification_settings/properties/events/items/enum
 */
export type NotificationEvent = 'created' | 'updated' | 'completed' | 'failed' | 'timeout';

/**
 * 持久化设置
 * @schema_path #/properties/configuration/properties/persistence
 * @required enabled, storage_backend
 */
export interface PersistenceSettings {
  /** 是否启用持久化 - Schema: enabled */
  enabled: boolean;
  
  /** 存储后端 - Schema: storage_backend */
  storage_backend: StorageBackend;
  
  /** 保留策略 - Schema: retention_policy */
  retention_policy?: RetentionPolicy;
}

/**
 * 存储后端枚举
 * @schema_path #/properties/configuration/properties/persistence/properties/storage_backend/enum
 */
export type StorageBackend = 'memory' | 'database' | 'file' | 'redis';

/**
 * 保留策略
 * @schema_path #/properties/configuration/properties/persistence/properties/retention_policy
 */
export interface RetentionPolicy {
  /** 保留时长 - Schema: duration */
  duration?: string;
  
  /** 最大版本数 - Schema: max_versions */
  max_versions?: number;
}

// ===== 请求和响应类型 =====

/**
 * 创建上下文请求
 */
export interface CreateContextRequest {
  name: string;
  description?: string;
  shared_state?: Partial<SharedState>;
  access_control?: Partial<AccessControl>;
  configuration?: Partial<ContextConfiguration>;
}

/**
 * 更新上下文请求
 */
export interface UpdateContextRequest {
  context_id: UUID;
  name?: string;
  description?: string;
  status?: ContextStatus;
  lifecycle_stage?: ContextLifecycleStage;
  shared_state?: Partial<SharedState>;
  access_control?: Partial<AccessControl>;
  configuration?: Partial<ContextConfiguration>;
}

/**
 * 批量上下文请求
 */
export interface BatchContextRequest {
  operations: BatchContextOperation[];
}

/**
 * 批量操作
 */
export interface BatchContextOperation {
  type: 'create' | 'update' | 'delete';
  data: CreateContextRequest | UpdateContextRequest | { context_id: UUID };
}

/**
 * 上下文响应
 */
export interface ContextResponse {
  context: ContextProtocol;
  metadata?: {
    created_at: Timestamp;
    updated_at: Timestamp;
    version: number;
  };
}

/**
 * 批量上下文响应
 */
export interface BatchContextResponse {
  results: ContextOperationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * 上下文过滤器
 */
export interface ContextFilter {
  context_ids?: UUID[];
  names?: string[];
  statuses?: ContextStatus[];
  lifecycle_stages?: ContextLifecycleStage[];
  owner_user_ids?: string[];
  created_after?: Timestamp;
  created_before?: Timestamp;
}

/**
 * 操作结果
 */
export interface ContextOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ContextError;
  execution_time_ms?: number;
}

// ===== 错误处理 =====

/**
 * Context模块错误基类
 */
export class ContextError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ContextError';
    this.code = code;
    this.details = details;
  }
}

/**
 * 验证错误
 */
export class ValidationError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * 访问拒绝错误
 */
export class AccessDeniedError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'ACCESS_DENIED', details);
    this.name = 'AccessDeniedError';
  }
}

/**
 * 资源分配错误
 */
export class ResourceAllocationError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'RESOURCE_ALLOCATION_FAILED', details);
    this.name = 'ResourceAllocationError';
  }
}

/**
 * 依赖解析错误
 */
export class DependencyResolutionError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'DEPENDENCY_RESOLUTION_FAILED', details);
    this.name = 'DependencyResolutionError';
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

/**
 * 内部错误
 */
export class InternalError extends ContextError {
  constructor(message: string, details?: unknown) {
    super(message, 'INTERNAL_ERROR', details);
    this.name = 'InternalError';
  }
} 

/**
 * 上下文事件类型枚举
 * 定义上下文模块可能发送的所有事件类型
 */
export type ContextEventType = 
  | 'context_created' 
  | 'context_updated' 
  | 'context_deleted' 
  | 'context_terminated'
  | 'shared_state_changed'
  | 'status_changed'
  | 'lifecycle_stage_changed';

/**
 * 上下文事件接口
 * 定义上下文模块事件的标准结构
 * 
 * @schema_path 事件基于context-protocol.json
 */
export interface ContextEvent {
  /** 事件类型 */
  event_type: ContextEventType;
  
  /** 事件关联的上下文ID */
  context_id: UUID;
  
  /** 事件发生时间戳 */
  timestamp: Timestamp;
  
  /** 事件相关数据 */
  data?: Record<string, unknown>;
  
  /** 源模块 */
  source?: string;
  
  /** 事件发送者ID */
  sender_id?: string;
} 