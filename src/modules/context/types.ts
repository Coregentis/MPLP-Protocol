/**
 * Context模块TypeScript类型定义
 * 
 * @description 基于实际Schema的完整TypeScript接口定义
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-context.json
 * @naming_convention camelCase (TypeScript层)
 */

import { UUID, Timestamp, Priority } from '../../shared/types';

// ===== 基础枚举类型 =====

/**
 * 上下文状态枚举
 */
export type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';

/**
 * 生命周期阶段枚举
 */
export type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';

/**
 * 资源状态枚举
 */
export type ResourceStatus = 'available' | 'allocated' | 'exhausted';

/**
 * 依赖类型枚举
 */
export type DependencyType = 'context' | 'plan' | 'external';

/**
 * 依赖状态枚举
 */
export type DependencyStatus = 'pending' | 'resolved' | 'failed';

/**
 * 目标状态枚举
 */
export type GoalStatus = 'defined' | 'active' | 'achieved' | 'abandoned';

/**
 * 操作符枚举
 */
export type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';

/**
 * 主体类型枚举
 */
export type PrincipalType = 'user' | 'role' | 'group';

/**
 * 权限枚举
 */
export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';

/**
 * 策略类型枚举
 */
export type PolicyType = 'security' | 'compliance' | 'operational';

/**
 * 策略执行枚举
 */
export type PolicyEnforcement = 'strict' | 'advisory' | 'disabled';

// ===== 复杂对象接口 =====

/**
 * 资源分配接口
 */
export interface ResourceAllocation {
  type: string;
  amount: number;
  unit: string;
  status: ResourceStatus;
}

/**
 * 资源需求接口
 */
export interface ResourceRequirement {
  minimum: number;
  optimal?: number;
  maximum?: number;
  unit: string;
}

/**
 * 资源管理接口
 */
export interface ResourceManagement {
  allocated: Record<string, ResourceAllocation>;
  requirements: Record<string, ResourceRequirement>;
}

/**
 * 依赖关系接口
 */
export interface Dependency {
  id: UUID;
  type: DependencyType;
  name: string;
  version?: string;
  status: DependencyStatus;
}

/**
 * 成功标准接口
 */
export interface SuccessCriteria {
  metric: string;
  operator: Operator;
  value: string | number | boolean;
  unit?: string;
}

/**
 * 目标定义接口
 */
export interface Goal {
  id: UUID;
  name: string;
  description?: string;
  priority: Priority;
  status: GoalStatus;
  successCriteria?: SuccessCriteria[];
}

/**
 * 共享状态接口
 */
export interface SharedState {
  variables?: Record<string, string | number | boolean | object>;
  resources?: {
    allocated?: Record<string, {
      type: string;
      amount: number;
      unit: string;
      status: 'available' | 'allocated' | 'exhausted';
    }>;
    limits?: Record<string, {
      max_amount: number;
      unit: string;
      enforcement_policy: string;
    }>;
  };
  dependencies?: string[];
  goals?: string[];
}

/**
 * 所有者信息接口
 */
export interface Owner {
  userId: string;
  role: string;
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  principal: string;
  principalType: PrincipalType;
  resource: string;
  actions: Permission[];
  conditions?: Record<string, unknown>;
}

/**
 * 策略配置接口
 */
export interface PolicyConfig {
  id: UUID;
  name: string;
  type: PolicyType;
  rules: Record<string, unknown>[];
  enforcement: PolicyEnforcement;
}

/**
 * 访问控制接口
 */
export interface AccessControl {
  owner: Owner;
  permissions: PermissionConfig[];
  policies?: PolicyConfig[];
}

/**
 * 超时设置接口
 */
export interface TimeoutSettings {
  defaultTimeout: number;
  maxTimeout: number;
  cleanupTimeout?: number;
}

/**
 * 通知设置接口
 */
export interface NotificationSettings {
  enabled: boolean;
  channels?: ('email' | 'webhook' | 'sms' | 'push')[];
  events?: ('created' | 'updated' | 'completed' | 'failed' | 'timeout')[];
}

/**
 * 持久化配置接口
 */
export interface PersistenceConfig {
  enabled: boolean;
  storageBackend: 'memory' | 'database' | 'file' | 'redis';
  retentionPolicy?: {
    duration?: string;
    maxVersions?: number;
  };
}

/**
 * 配置设置接口
 */
export interface Configuration {
  timeoutSettings: TimeoutSettings;
  notificationSettings?: NotificationSettings;
  persistence: PersistenceConfig;
}

// ===== 企业级功能接口 =====

/**
 * 审计事件接口
 */
export interface AuditEvent {
  eventId: UUID;
  eventType: 'context_created' | 'context_updated' | 'context_deleted' | 'context_accessed' | 'context_shared' | 'permission_changed' | 'state_changed' | 'cache_updated' | 'sync_executed';
  timestamp: Timestamp;
  userId: string;
  userRole?: string;
  action: string;
  resource: string;
  contextOperation?: string;
  contextId?: UUID;
  contextName?: string;
  lifecycleStage?: string;
  sharedStateKeys?: string[];
  accessLevel?: string;
  contextDetails?: Record<string, unknown>;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

/**
 * 合规设置接口
 */
export interface ComplianceSettings {
  gdprEnabled?: boolean;
  hipaaEnabled?: boolean;
  soxEnabled?: boolean;
  contextAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
  contextDataLogging?: boolean;
  customCompliance?: string[];
}

/**
 * 审计追踪接口
 */
export interface AuditTrail {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: ComplianceSettings;
}

// ===== 主要Context实体接口 =====

/**
 * Context实体数据接口 (TypeScript层 - camelCase)
 */
export interface ContextEntityData {
  // 基础协议字段
  protocolVersion: string;
  timestamp: Timestamp;
  contextId: UUID;
  name: string;
  description?: string;
  status: ContextStatus;
  lifecycleStage: LifecycleStage;

  // 时间戳字段
  createdAt?: Date;
  updatedAt?: Date;

  // 版本和标签字段
  version?: string;
  tags?: string[];

  // 核心功能字段 (允许部分定义)
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;

  // 企业级功能字段
  auditTrail: AuditTrail;
  monitoringIntegration: Record<string, unknown>; // 简化处理
  performanceMetrics: Record<string, unknown>;    // 简化处理
  versionHistory: Record<string, unknown>;        // 简化处理
  searchMetadata: Record<string, unknown>;        // 简化处理
  cachingPolicy: Record<string, unknown>;         // 简化处理
  syncConfiguration: Record<string, unknown>;     // 简化处理
  errorHandling: Record<string, unknown>;         // 简化处理
  integrationEndpoints: Record<string, unknown>;  // 简化处理
  eventIntegration: Record<string, unknown>;      // 简化处理
}

/**
 * Context Schema接口 (Schema层 - snake_case)
 */
export interface ContextSchema {
  // 基础协议字段
  protocol_version: string;
  timestamp: string;
  context_id: string;
  name: string;
  description?: string;
  status: ContextStatus;
  lifecycle_stage: LifecycleStage;

  // 核心功能字段
  shared_state: Record<string, unknown>;
  access_control: Record<string, unknown>;
  configuration: Record<string, unknown>;

  // 企业级功能字段
  audit_trail: Record<string, unknown>;
  monitoring_integration: Record<string, unknown>;
  performance_metrics: Record<string, unknown>;
  version_history: Record<string, unknown>;
  search_metadata: Record<string, unknown>;
  caching_policy: Record<string, unknown>;
  sync_configuration: Record<string, unknown>;
  error_handling: Record<string, unknown>;
  integration_endpoints: Record<string, unknown>;
  event_integration: Record<string, unknown>;
}

// ===== 操作相关接口 =====

/**
 * Context创建请求接口
 */
export interface CreateContextRequest {
  name: string;
  description?: string;
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
}

/**
 * Context更新请求接口
 */
export interface UpdateContextRequest {
  name?: string;
  description?: string;
  status?: ContextStatus;
  lifecycleStage?: LifecycleStage;
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
}

/**
 * Context查询过滤器接口
 */
export interface ContextQueryFilter {
  status?: ContextStatus | ContextStatus[];
  lifecycleStage?: LifecycleStage | LifecycleStage[];
  owner?: string;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  namePattern?: string;
}

// ===== 缺失的类型定义 =====

/**
 * Context过滤器接口 (用于分析服务)
 */
export interface ContextFilter {
  status?: ContextStatus | ContextStatus[];
  lifecycleStage?: LifecycleStage | LifecycleStage[];
  owner?: string;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  namePattern?: string;
  tags?: string[];
}

/**
 * 状态更新接口
 */
export interface StateUpdates {
  variables?: Record<string, unknown>;
  resources?: Partial<ResourceManagement>;
  dependencies?: Dependency[];
  goals?: Goal[];
}

/**
 * 创建Context数据接口
 */
export interface CreateContextData {
  name: string;
  description?: string;
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
  tags?: string[];
}

/**
 * 更新Context数据接口
 */
export interface UpdateContextData {
  name?: string;
  description?: string;
  status?: ContextStatus;
  lifecycleStage?: LifecycleStage;
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
  tags?: string[];
}

/**
 * 使用指标接口 (扩展版本)
 */
export interface UsageMetrics {
  totalAccess: number;
  lastAccessTime: Timestamp;
  avgSessionDuration: number;
  uniqueUsers: number;
  lastAccessed: Timestamp;
  averageSessionDuration: number;
}

/**
 * 搜索查询接口
 */
export interface SearchQuery {
  query: string;
  filters?: ContextFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ===== 导出所有类型 =====
// 注意：使用具名导出避免与共享类型冲突
