/**
 * Plan模块TypeScript类型定义
 * 
 * @description 基于实际Schema的完整TypeScript接口定义
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-plan.json
 * @naming_convention camelCase (TypeScript层)
 */

import { UUID, Timestamp, Priority } from '../../shared/types';

// ===== 基础枚举类型 =====

/**
 * 计划状态枚举
 */
export type PlanStatus = 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';

/**
 * 任务类型枚举
 */
export type TaskType = 'atomic' | 'composite' | 'milestone' | 'review';

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * 依赖类型枚举
 */
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

/**
 * 里程碑状态枚举
 */
export type MilestoneStatus = 'upcoming' | 'active' | 'completed' | 'overdue';

/**
 * 资源类型枚举
 */
export type ResourceType = 'human' | 'material' | 'financial' | 'technical';

/**
 * 资源状态枚举
 */
export type ResourceStatus = 'available' | 'allocated' | 'overallocated' | 'unavailable';

/**
 * 风险等级枚举
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 风险状态枚举
 */
export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'closed';

/**
 * 执行策略枚举
 */
export type ExecutionStrategy = 'sequential' | 'parallel' | 'conditional' | 'adaptive';

/**
 * 优化目标枚举
 */
export type OptimizationTarget = 'time' | 'cost' | 'quality' | 'resource' | 'risk';

// ===== 复杂对象接口 =====

/**
 * 任务依赖接口
 */
export interface TaskDependency {
  taskId: UUID;
  type: DependencyType;
  lag?: number;
  lagUnit?: 'hours' | 'days' | 'weeks';
}

/**
 * 任务接口
 */
export interface Task {
  taskId?: UUID;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  estimatedDuration?: number;
  actualDuration?: number;
  durationUnit?: 'hours' | 'days' | 'weeks';
  assignedTo?: string[];
  dependencies?: TaskDependency[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  completionPercentage?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 里程碑接口
 */
export interface Milestone {
  id: UUID;
  name: string;
  description?: string;
  targetDate: Timestamp;
  actualDate?: Timestamp;
  status: MilestoneStatus;
  criteria?: string[];
  dependencies?: UUID[];
  deliverables?: string[];
}

/**
 * 资源分配接口
 */
export interface ResourceAllocation {
  resourceId: UUID;
  resourceName: string;
  type: ResourceType;
  allocatedAmount: number;
  totalCapacity: number;
  unit: string;
  status: ResourceStatus;
  allocationPeriod?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}

/**
 * 风险项接口
 */
export interface RiskItem {
  riskId: UUID;
  name: string;
  description: string;
  category: string;
  level: RiskLevel;
  status: RiskStatus;
  probability: number;
  impact: number;
  riskScore: number;
  mitigationPlan?: string;
  owner?: string;
  identifiedDate: Timestamp;
  reviewDate?: Timestamp;
}

/**
 * 执行配置接口
 */
export interface ExecutionConfig {
  strategy: ExecutionStrategy;
  maxParallelTasks?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier?: number;
  };
  timeoutSettings?: {
    taskTimeout: number;
    planTimeout: number;
  };
  notificationSettings?: {
    enabled: boolean;
    events: ('task_started' | 'task_completed' | 'task_failed' | 'milestone_reached' | 'plan_completed')[];
    channels: ('email' | 'webhook' | 'sms')[];
  };
}

/**
 * 优化配置接口
 */
export interface OptimizationConfig {
  enabled: boolean;
  targets: OptimizationTarget[];
  constraints?: {
    maxDuration?: number;
    maxCost?: number;
    minQuality?: number;
    resourceLimits?: Record<string, number>;
  };
  algorithms?: ('genetic' | 'simulated_annealing' | 'particle_swarm' | 'greedy')[];
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  ruleId: UUID;
  name: string;
  description: string;
  type: 'dependency' | 'resource' | 'timeline' | 'quality' | 'business';
  severity: 'error' | 'warning' | 'info';
  condition: string;
  message: string;
  enabled: boolean;
}

/**
 * 协调配置接口
 */
export interface CoordinationConfig {
  enabled: boolean;
  coordinationMode: 'centralized' | 'distributed' | 'hybrid';
  conflictResolution: 'priority' | 'timestamp' | 'manual' | 'automatic';
  syncInterval?: number;
  coordinationEndpoints?: string[];
}

// ===== 企业级功能接口 =====

/**
 * 审计事件接口
 */
export interface AuditEvent {
  eventId: UUID;
  eventType: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'task_started' | 'task_completed' | 'milestone_reached' | 'resource_allocated' | 'risk_identified';
  timestamp: Timestamp;
  userId: string;
  userRole?: string;
  action: string;
  resource: string;
  planOperation?: string;
  planId?: UUID;
  planName?: string;
  taskId?: UUID;
  taskName?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

/**
 * 审计追踪接口
 */
export interface AuditTrail {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    auditLevel?: 'basic' | 'detailed' | 'comprehensive';
    dataLogging?: boolean;
    customCompliance?: string[];
  };
}

// ===== 主要Plan实体接口 =====

/**
 * Plan实体数据接口 (TypeScript层 - camelCase)
 */
export interface PlanEntityData {
  // 基础协议字段
  protocolVersion: string;
  timestamp: Timestamp;
  planId: UUID;
  contextId: UUID;
  name: string;
  description?: string;
  status: PlanStatus;
  priority: Priority;

  // 核心功能字段
  tasks: Task[];
  milestones?: Milestone[];
  resources?: ResourceAllocation[];
  risks?: RiskItem[];
  executionConfig?: ExecutionConfig;
  optimizationConfig?: OptimizationConfig;
  validationRules?: ValidationRule[];
  coordinationConfig?: CoordinationConfig;

  // 企业级功能字段
  auditTrail: AuditTrail;
  monitoringIntegration: Record<string, unknown>;
  performanceMetrics: Record<string, unknown>;
  versionHistory: Record<string, unknown>;
  searchMetadata: Record<string, unknown>;
  cachingPolicy: Record<string, unknown>;
  eventIntegration: Record<string, unknown>;

  // 基础元数据字段
  metadata?: Record<string, unknown>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Plan Schema接口 (Schema层 - snake_case)
 */
export interface PlanSchema {
  // 基础协议字段
  protocol_version: string;
  timestamp: string;
  plan_id: string;
  context_id: string;
  name: string;
  description?: string;
  status: PlanStatus;
  priority: Priority;

  // 核心功能字段
  tasks: Record<string, unknown>[];
  milestones?: Record<string, unknown>[];
  resources?: Record<string, unknown>[];
  risks?: Record<string, unknown>[];
  execution_config?: Record<string, unknown>;
  optimization_config?: Record<string, unknown>;
  validation_rules?: Record<string, unknown>[];
  coordination_config?: Record<string, unknown>;

  // 企业级功能字段
  audit_trail: Record<string, unknown>;
  monitoring_integration: Record<string, unknown>;
  performance_metrics: Record<string, unknown>;
  version_history: Record<string, unknown>;
  search_metadata: Record<string, unknown>;
  caching_policy: Record<string, unknown>;
  event_integration: Record<string, unknown>;

  // 基础元数据字段
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ===== 操作相关接口 =====

/**
 * Plan创建请求接口
 */
export interface CreatePlanRequest {
  contextId: UUID;
  name: string;
  description?: string;
  priority?: Priority;
  tasks?: Partial<Task>[];
  milestones?: Partial<Milestone>[];
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
}

/**
 * Plan更新请求接口
 */
export interface UpdatePlanRequest {
  planId: UUID;
  name?: string;
  description?: string;
  status?: PlanStatus;
  priority?: Priority;
  tasks?: Partial<Task>[];
  milestones?: Partial<Milestone>[];
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
}

/**
 * Plan查询过滤器接口
 */
export interface PlanQueryFilter {
  status?: PlanStatus | PlanStatus[];
  priority?: Priority | Priority[];
  contextId?: UUID;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  namePattern?: string;
  assignedTo?: string;
}

/**
 * Plan执行结果接口
 */
export interface PlanExecutionResult {
  status: 'completed' | 'failed' | 'partial';
  totalTasks: number;
  completedTasks: number;
  failedTasks?: number;
  errors: string[];
  executionTime?: number;
  startTime: Timestamp;
  endTime?: Timestamp;
}

/**
 * Plan优化结果接口
 */
export interface PlanOptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvements: string[];
  optimizationTime: number;
  algorithm?: string;
  metrics?: Record<string, number>;
}

/**
 * Plan验证结果接口
 */
export interface PlanValidationResult {
  isValid: boolean;
  violations: {
    ruleId: UUID;
    severity: 'error' | 'warning' | 'info';
    message: string;
    affectedTasks?: UUID[];
  }[];
  recommendations: string[];
  validationTime: number;
}

// ===== 导出所有类型 =====
// 注意：使用具名导出避免与共享类型冲突
