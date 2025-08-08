/**
 * MPLP Plan Types - Plan模块类型定义
 * 
 * 提供Plan模块相关的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

// 重新导出基础类型
export type UUID = string;
export type Timestamp = string;

// ===== Plan基础类型 =====

/**
 * 计划状态枚举
 */
export type PlanStatus = 'draft' | 'active' | 'approved' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'archived';

/**
 * 计划状态常量对象 - 提供类似enum的使用方式
 */
export const PlanStatus = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  APPROVED: 'approved' as const,
  PAUSED: 'paused' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  CANCELLED: 'cancelled' as const,
  ARCHIVED: 'archived' as const
} as const;

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled' | 'failed' | 'skipped' | 'ready' | 'pending_intervention';

/**
 * 任务状态常量对象 - 提供类似enum的使用方式
 */
export const TaskStatus = {
  PENDING: 'pending' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  BLOCKED: 'blocked' as const,
  CANCELLED: 'cancelled' as const,
  FAILED: 'failed' as const,
  SKIPPED: 'skipped' as const,
  READY: 'ready' as const,
  PENDING_INTERVENTION: 'pending_intervention' as const
} as const;

/**
 * 执行策略枚举
 */
export type ExecutionStrategy = 'sequential' | 'parallel' | 'hybrid' | 'conditional';

/**
 * 执行策略常量对象 - 提供类似enum的使用方式
 */
export const ExecutionStrategy = {
  SEQUENTIAL: 'sequential' as const,
  PARALLEL: 'parallel' as const,
  HYBRID: 'hybrid' as const,
  CONDITIONAL: 'conditional' as const
} as const;

/**
 * 优先级枚举
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'normal';

/**
 * 优先级常量对象 - 提供类似enum的使用方式
 */
export const Priority = {
  CRITICAL: 'critical' as const,
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
  NORMAL: 'normal' as const
} as const;

/**
 * 任务优先级枚举
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 任务类型枚举
 */
export type TaskType = 'action' | 'decision' | 'review' | 'approval' | 'milestone' | 'atomic';

/**
 * 依赖类型枚举
 */
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

/**
 * 依赖关键性枚举
 */
export type DependencyCriticality = 'critical' | 'important' | 'optional';

/**
 * 里程碑状态枚举
 */
export type MilestoneStatus = 'pending' | 'achieved' | 'missed' | 'cancelled';

/**
 * 持续时间单位枚举
 */
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

/**
 * 风险级别枚举
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 风险类别枚举
 */
export type RiskCategory = 'technical' | 'resource' | 'schedule' | 'quality' | 'external';

/**
 * 风险状态枚举
 */
export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'resolved' | 'accepted';

// ===== 扩展类型定义 =====

/**
 * 优化策略枚举
 */
export type OptimizationStrategy = 'time' | 'cost' | 'quality' | 'resource' | 'risk' | 'critical_path_focus' | 'parallel_execution';

/**
 * 持续时间接口
 */
export interface Duration {
  value: number;
  unit: DurationUnit;
}

/**
 * 任务工作量接口
 */
export interface TaskEffort {
  estimated_hours: number;
  actual_hours?: number;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * 任务分配者接口
 */
export interface TaskAssignee {
  userId: UUID;
  name: string;
  role?: string;
  email?: string;
}

/**
 * 资源需求接口
 */
export interface ResourceRequirement {
  resource_type: string;
  quantity: number;
  unit: string;
  availability_required?: boolean;
}

/**
 * 验收标准接口
 */
export interface AcceptanceCriterion {
  criterion_id: UUID;
  description: string;
  is_met: boolean;
  verified_by?: UUID;
  verified_at?: Timestamp;
}

// ===== Plan接口定义 =====

/**
 * Plan创建请求
 */
export interface CreatePlanRequest {
  contextId: UUID;
  name: string;
  description?: string;
  goals?: string[];
  priority?: Priority;
  execution_strategy?: ExecutionStrategy;
  estimatedDuration?: {
    value: number;
    unit: DurationUnit;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Plan更新请求
 */
export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  status?: PlanStatus;
  goals?: string[];
  priority?: Priority;
  execution_strategy?: ExecutionStrategy;
  estimatedDuration?: {
    value: number;
    unit: DurationUnit;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Plan查询参数
 */
export interface PlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlanStatus;
  priority?: Priority;
  contextId?: UUID;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Plan数据接口
 */
export interface PlanData {
  planId: UUID;
  contextId: UUID;
  name: string;
  description?: string;
  status: PlanStatus;
  version: string;
  goals: string[];
  priority: Priority;
  execution_strategy: ExecutionStrategy;
  estimatedDuration?: {
    value: number;
    unit: DurationUnit;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 任务数据接口
 */
export interface TaskData {
  taskId: UUID;
  planId: UUID;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  estimatedDuration?: {
    value: number;
    unit: DurationUnit;
  };
  actualDuration?: {
    value: number;
    unit: DurationUnit;
  };
  start_date?: Timestamp;
  end_date?: Timestamp;
  dependencies?: UUID[];
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 依赖关系数据接口
 */
export interface PlanDependencyData {
  dependency_id: UUID;
  source_task_id: UUID;
  target_taskId: UUID;
  type: DependencyType;
  criticality: DependencyCriticality;
  lag_time?: {
    value: number;
    unit: DurationUnit;
  };
  metadata?: Record<string, unknown>;
}

/**
 * 里程碑数据接口
 */
export interface MilestoneData {
  milestone_id: UUID;
  planId: UUID;
  name: string;
  description?: string;
  target_date: Timestamp;
  actual_date?: Timestamp;
  status: MilestoneStatus;
  criteria: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 风险评估数据接口
 */
export interface RiskAssessmentData {
  risk_id: UUID;
  planId: UUID;
  name: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  status: RiskStatus;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation_strategy?: string;
  contingency_plan?: string;
  identified_at: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}
