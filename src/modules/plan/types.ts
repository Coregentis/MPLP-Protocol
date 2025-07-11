/**
 * MPLP Plan模块类型定义
 * 
 * Plan模块负责任务规划和执行编排的类型定义
 * 严格按照 plan-protocol.json Schema规范定义
 * 
 * @version v1.0.1
 * @created 2025-07-09T20:35:00+08:00
 * @compliance 10/10 Schema合规性 - 完全匹配Schema定义
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== 添加缺失的类型别名 (Schema合规性) =====

/**
 * Task类型别名 - 与PlanTask完全相同
 * 解决代码中引用Task但定义为PlanTask的问题
 */
export type Task = PlanTask;

/**
 * TaskPriority类型别名 - 与Priority完全相同
 * 解决代码中引用TaskPriority的问题
 */
export type TaskPriority = Priority;

/**
 * TaskOperationResult类型别名
 * 用于Task相关操作的结果
 */
export type TaskOperationResult<T = Task> = PlanOperationResult<T>;

/**
 * TaskDependency类型别名 - 与PlanDependency完全相同
 * 解决代码中引用TaskDependency的问题
 */
export type TaskDependency = PlanDependency;

/**
 * BatchOperationResult类型 - 批量操作结果
 * 用于批量任务操作的结果返回
 */
export interface BatchOperationResult<T = Task[]> {
  success: boolean;
  results: TaskOperationResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  execution_time_ms?: number;
}

// ===== Plan协议主接口 (Schema根节点) =====

/**
 * Plan协议主接口
 * 完全符合plan-protocol.json Schema规范
 */
export interface PlanProtocol {
  // Schema必需字段
  protocol_version: Version;
  timestamp: Timestamp;
  plan_id: UUID;
  context_id: UUID;
  name: string;
  description?: string;
  status: PlanStatus;
  priority: Priority;
  timeline: Timeline;
  tasks: PlanTask[];
  dependencies: PlanDependency[];
  milestones: PlanMilestone[];
  optimization?: PlanOptimization;
  risk_assessment?: PlanRiskAssessment;
  failure_resolver?: FailureResolver;
  
  // 运行时字段 (用于实现，非Schema定义)
  progress_summary?: PlanProgressSummary; // 使用正确的类型
  task_ids?: UUID[]; // 任务ID列表 (缓存字段)
  dependency_graph?: TaskDependencyGraph; // 依赖图结构 (缓存字段) 
  metadata?: {
    created_by?: string;
    created_at?: Timestamp;
    updated_by?: string;
    updated_at?: Timestamp;
    version?: number;
    creation_source?: string;
    total_tasks?: number;
    total_dependencies?: number;
    complexity_score?: number;
    risk_assessment?: PlanRiskAssessment;
  };
  
  // 实现扩展字段
  title?: string; // title字段别名，与name相同
  owner_id?: string; // 计划所有者
  team_ids?: string[]; // 团队ID列表
  stakeholder_ids?: string[]; // 利益相关者ID列表
  estimated_duration_hours?: number; // 预估持续时间
  performance_metrics?: PlanPerformanceMetrics; // 性能指标
  configuration?: PlanConfiguration; // 配置信息
}

/**
 * 进度摘要 (运行时计算字段)
 */
export interface ProgressSummary {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  blocked_tasks: number;
  overall_progress_percentage: number;
  estimated_completion_date?: Timestamp;
  milestones: {
    total: number;
    achieved: number;
    at_risk: number;
  };
}

// ===== 计划状态 (Schema定义) =====

/**
 * 计划状态枚举 (Schema规范)
 */
export type PlanStatus = 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';

// ===== 时间线和持续时间 (Schema定义) =====

/**
 * 时间线结构 (Schema定义)
 */
export interface Timeline {
  start_date?: Timestamp;
  end_date?: Timestamp;
  estimated_duration: Duration;
  actual_duration?: Duration;
}

/**
 * 持续时间结构 (Schema定义)
 */
export interface Duration {
  value: number;
  unit: DurationUnit;
}

/**
 * 持续时间单位 (Schema定义)
 */
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

// ===== 任务相关 (Schema定义) =====

/**
 * 计划任务 (Schema定义)
 */
export interface PlanTask {
  task_id: UUID;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignee?: TaskAssignee;
  estimated_effort?: TaskEffort;
  actual_effort?: TaskEffort;
  resources_required?: ResourceRequirement[];
  acceptance_criteria?: AcceptanceCriterion[];
  sub_tasks?: PlanTask[];
  
  // 运行时字段 (用于实现，非Schema定义)
  plan_id?: UUID; // 关联的计划ID (缓存字段，方便查询)
  subtask_ids?: UUID[]; // 子任务ID列表 (与sub_tasks对应的ID缓存)
  parent_task_id?: UUID; // 父任务ID
  dependencies?: UUID[]; // 依赖任务ID列表
  
  // 时间字段
  created_at?: Timestamp;
  updated_at?: Timestamp;
  started_at?: Timestamp;
  completed_at?: Timestamp;
  
  // 进度和状态字段
  progress_percentage?: number;
  actual_duration_minutes?: number;
  
  // 错误和结果字段
  error_message?: string;
  result_data?: unknown;
  
  // 元数据字段
  metadata?: {
    tags?: string[];
    category?: string;
    source?: string;
    complexity_score?: number;
    risk_level?: string;
    automation_level?: string;
    retry_count?: number;
    max_retry_count?: number;
    intervention_required?: boolean;
    intervention_reason?: string;
    intervention_requested_at?: Timestamp;
    rollback_reason?: string;
    rollback_target?: UUID;
    skip_reason?: string;
    skip_dependents?: boolean;
  };
  
  // 执行上下文
  execution_context?: {
    context_id?: UUID;
    environment?: string;
    variables?: Record<string, unknown>;
    secrets?: Record<string, string>;
    resource_allocations?: unknown[];
  };
  
  // 分配信息
  assignee_id?: string;
  
  // 性能指标
  performance_metrics?: unknown;
}

/**
 * 任务类型 (Schema定义)
 */
export type TaskType = 'atomic' | 'composite' | 'milestone' | 'checkpoint';

/**
 * 任务状态 (Schema定义)
 */
export type TaskStatus = 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';

/**
 * 任务分配 (Schema定义)
 */
export interface TaskAssignee {
  user_id?: string;
  role?: string;
  team?: string;
}

/**
 * 任务工作量 (Schema定义)
 */
export interface TaskEffort {
  value: number;
  unit: 'hours' | 'days' | 'story_points';
}

/**
 * 资源需求 (Schema定义)
 */
export interface ResourceRequirement {
  resource_type: string;
  amount: number;
  unit: string;
  availability: ResourceAvailability;
}

/**
 * 资源可用性 (Schema定义)
 */
export type ResourceAvailability = 'required' | 'preferred' | 'optional';

/**
 * 验收标准 (Schema定义)
 */
export interface AcceptanceCriterion {
  id: UUID;
  description: string;
  type: AcceptanceCriterionType;
  status: AcceptanceCriterionStatus;
  verification_method?: VerificationMethod;
}

/**
 * 验收标准类型 (Schema定义)
 */
export type AcceptanceCriterionType = 'functional' | 'non_functional' | 'quality';

/**
 * 验收标准状态 (Schema定义)
 */
export type AcceptanceCriterionStatus = 'pending' | 'met' | 'not_met';

/**
 * 验证方法 (Schema定义)
 */
export type VerificationMethod = 'manual' | 'automated' | 'review';

// ===== 依赖管理 (Schema定义) =====

/**
 * 计划依赖 (Schema定义)
 */
export interface PlanDependency {
  id: UUID;
  source_task_id: UUID;
  target_task_id: UUID;
  dependency_type: DependencyType;
  lag?: Duration;
  criticality: DependencyCriticality;
  condition?: string;
  
  // 运行时字段
  dependency_id?: UUID; // 别名字段，与id相同
  metadata?: {
    created_at?: Timestamp;
    created_by?: string;
    weight?: number;
    is_critical?: boolean;
  };
}

/**
 * 依赖类型 (Schema定义)
 */
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

/**
 * 依赖重要性 (Schema定义)
 */
export type DependencyCriticality = 'blocking' | 'important' | 'nice_to_have';

// ===== 里程碑 (Schema定义) =====

/**
 * 计划里程碑 (Schema定义)
 */
export interface PlanMilestone {
  id: UUID; // Schema字段名：id (不是milestone_id)
  name: string;
  description?: string;
  target_date: Timestamp; // Schema字段名：target_date (不是due_date)
  status: MilestoneStatus;
  success_criteria: MilestoneSuccessCriterion[];
  dependencies?: UUID[];
}

/**
 * 里程碑状态 (Schema定义)
 */
export type MilestoneStatus = 'upcoming' | 'at_risk' | 'achieved' | 'missed';

/**
 * 里程碑成功标准 (Schema定义)
 */
export interface MilestoneSuccessCriterion {
  metric: string;
  target_value: string | number | boolean; // Schema支持boolean类型
  actual_value?: string | number | boolean; // Schema字段名：actual_value (不是current_value)
  status: MilestoneSuccessCriterionStatus;
}

/**
 * 里程碑成功标准状态 (Schema定义)
 */
export type MilestoneSuccessCriterionStatus = 'pending' | 'achieved' | 'not_achieved';

// ===== 优化设置 (Schema扩展) =====

/**
 * 计划优化 (Schema扩展)
 */
export interface PlanOptimization {
  strategy: OptimizationStrategy;
  constraints?: OptimizationConstraints;
  parameters?: OptimizationParameters;
}

/**
 * 优化策略 (Schema扩展)
 */
export type OptimizationStrategy = 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';

/**
 * 优化约束 (Schema扩展)
 */
export interface OptimizationConstraints {
  max_duration?: Duration;
  max_cost?: number;
  required_quality_score?: number;
  resource_limits?: Record<string, number>;
}

/**
 * 优化参数 (Schema扩展)
 */
export interface OptimizationParameters {
  time_weight?: number;
  cost_weight?: number;
  quality_weight?: number;
  risk_tolerance: RiskTolerance;
}

/**
 * 风险容忍度 (Schema扩展)
 */
export type RiskTolerance = 'low' | 'medium' | 'high';

// ===== 风险评估 (Schema扩展) =====

/**
 * 计划风险评估 (Schema扩展)
 */
export interface PlanRiskAssessment {
  overall_risk_level: RiskLevel;
  identified_risks: PlanRisk[];
}

/**
 * 风险级别 (Schema扩展)
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 计划风险 (Schema扩展)
 */
export interface PlanRisk {
  risk_id: UUID;
  name: string;
  description: string;
  category: RiskCategory;
  probability: number; // 0-1
  impact: number; // 0-1
  risk_level: RiskLevel;
  mitigation_strategy?: string;
  contingency_plan?: string;
  status: RiskStatus;
}

/**
 * 风险类别 (Schema扩展)
 */
export type RiskCategory = 'technical' | 'operational' | 'external' | 'resource';

/**
 * 风险状态 (Schema扩展)
 */
export type RiskStatus = 'identified' | 'monitored' | 'mitigated' | 'realized' | 'closed';

// ===== 故障解决器 (Schema扩展 - MPLP v1.0.1新增) =====

/**
 * 故障解决器 (Schema扩展)
 */
export interface FailureResolver {
  enabled: boolean;
  strategies: RecoveryStrategy[];
  retry_config?: RetryConfig;
  rollback_config?: RollbackConfig;
  manual_intervention_config?: ManualInterventionConfig;
  notification_channels: NotificationChannel[];
  performance_thresholds: PerformanceThresholds;
}

/**
 * 恢复策略 (Schema扩展)
 */
export type RecoveryStrategy = 'retry' | 'rollback' | 'skip' | 'manual_intervention';

/**
 * 重试配置 (Schema扩展)
 */
export interface RetryConfig {
  max_attempts: number;
  delay_ms: number;
  backoff_factor: number;
  max_delay_ms: number;
}

/**
 * 回滚配置 (Schema扩展)
 */
export interface RollbackConfig {
  enabled: boolean;
  checkpoint_frequency: number;
  max_rollback_depth: number;
}

/**
 * 手动干预配置 (Schema扩展)
 */
export interface ManualInterventionConfig {
  timeout_ms: number;
  escalation_levels: string[];
  approval_required: boolean;
}

/**
 * 通知渠道 (Schema扩展)
 */
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'console';

/**
 * 性能阈值 (Schema扩展)
 */
export interface PerformanceThresholds {
  max_execution_time_ms: number;
  max_memory_usage_mb: number;
  max_cpu_usage_percent: number;
}

// ===== 依赖管理辅助 (Schema扩展) =====

/**
 * 依赖管理 (Schema扩展)
 */
export interface DependencyManagement {
  auto_resolution: boolean;
  conflict_detection: boolean;
  circular_dependency_check: boolean;
  optimization_enabled: boolean;
}

// ===== 请求/响应类型 (API接口) =====

/**
 * 创建计划请求 (API接口)
 */
export interface CreatePlanRequest {
  context_id: UUID;
  name: string;
  description?: string;
  priority: Priority;
  timeline: Timeline;
  tasks?: Partial<PlanTask>[];
  dependencies?: Partial<PlanDependency>[];
  milestones?: Partial<PlanMilestone>[];
  optimization?: Partial<PlanOptimization>;
  risk_assessment?: Partial<PlanRiskAssessment>;
  failure_resolver?: Partial<FailureResolver>;
}

/**
 * 更新计划请求 (API接口)
 */
export interface UpdatePlanRequest {
  plan_id: UUID;
  name?: string;
  description?: string;
  status?: PlanStatus;
  priority?: Priority;
  timeline?: Partial<Timeline>;
  tasks?: Partial<PlanTask>[];
  dependencies?: Partial<PlanDependency>[];
  milestones?: Partial<PlanMilestone>[];
  optimization?: Partial<PlanOptimization>;
  risk_assessment?: Partial<PlanRiskAssessment>;
  failure_resolver?: Partial<FailureResolver>;
}

/**
 * 计划过滤器 (API接口)
 */
export interface PlanFilter {
  plan_ids?: UUID[];
  context_ids?: UUID[];
  names?: string[];
  statuses?: PlanStatus[];
  priorities?: Priority[];
  created_after?: Timestamp;
  created_before?: Timestamp;
  assignee_user_ids?: string[];
}

/**
 * 计划操作结果 (API接口)
 */
export interface PlanOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  execution_time_ms?: number;
  
  // 扩展字段 (用于实现，非Schema定义)
  plan_id?: UUID;
  task_id?: UUID;
  error_code?: string;
  affected_task_ids?: UUID[];
  operation_time_ms?: number;
}

// ===== 配置接口 =====

/**
 * 计划配置 (配置接口)
 */
export interface PlanConfiguration {
  auto_scheduling_enabled: boolean;
  dependency_validation_enabled: boolean;
  risk_monitoring_enabled: boolean;
  failure_recovery_enabled: boolean;
  performance_tracking_enabled: boolean;
  notification_settings: {
    enabled: boolean;
    channels: NotificationChannel[];
    events: string[];
    task_completion?: boolean; // 添加缺失的task_completion字段
  };
  optimization_settings: {
    enabled: boolean;
    strategy: OptimizationStrategy;
    auto_reoptimize: boolean;
  };
  timeout_settings: {
    default_task_timeout_ms: number;
    plan_execution_timeout_ms: number;
    dependency_resolution_timeout_ms: number;
  };
  retry_policy?: RetryConfig; // 添加缺失的retry_policy字段
  parallel_execution_limit: number; // 并行执行限制
}

// ===== 常量和错误 =====

/**
 * 计划常量
 */
export const PLAN_CONSTANTS = {
  PROTOCOL_VERSION: '1.0.1' as const,
  DEFAULT_PRIORITY: 'medium' as Priority,
  DEFAULT_PLAN_STATUS: 'draft' as PlanStatus,
  DEFAULT_TASK_STATUS: 'pending' as TaskStatus,
  DEFAULT_TASK_TYPE: 'atomic' as TaskType,
  MAX_TASK_DEPTH: 10,
  MAX_DEPENDENCY_DEPTH: 100,
  MAX_RETRY_ATTEMPTS: 5,
  DEFAULT_TIMEOUT_MS: 30000,
  MIN_TIMELINE_DURATION: { value: 1, unit: 'hours' as DurationUnit },
  MAX_TIMELINE_DURATION: { value: 5, unit: 'years' as DurationUnit }
} as const;

/**
 * 计划错误代码
 */
export enum PlanErrorCode {
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PLAN_ALREADY_EXISTS = 'PLAN_ALREADY_EXISTS',
  INVALID_PLAN_DATA = 'INVALID_PLAN_DATA',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  TASK_DEPENDENCY_CONFLICT = 'TASK_DEPENDENCY_CONFLICT',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  MILESTONE_VALIDATION_FAILED = 'MILESTONE_VALIDATION_FAILED',
  RESOURCE_ALLOCATION_FAILED = 'RESOURCE_ALLOCATION_FAILED',
  TIMELINE_CONFLICT = 'TIMELINE_CONFLICT',
  OPTIMIZATION_FAILED = 'OPTIMIZATION_FAILED',
  RISK_ASSESSMENT_FAILED = 'RISK_ASSESSMENT_FAILED',
  FAILURE_RECOVERY_FAILED = 'FAILURE_RECOVERY_FAILED',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ===== 扩展类型定义 (用于实现) =====

/**
 * 任务依赖图结构 (实现类型)
 */
export interface TaskDependencyGraph {
  nodes: UUID[];
  edges: PlanDependency[];
  entry_points: UUID[];
  exit_points: UUID[];
  critical_path: UUID[];
  cycles: UUID[][];
}

/**
 * 计划进度汇总 (实现类型)
 */
export interface PlanProgressSummary {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  blocked_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overall_progress_percentage: number;
  milestones: PlanMilestone[] | { total: number; achieved: number; at_risk: number };
}

/**
 * 计划性能指标 (实现类型)
 */
export interface PlanPerformanceMetrics {
  total_planning_time_ms: number;
  dependency_analysis_time_ms: number;
  task_scheduling_time_ms: number;
  execution_efficiency_score: number;
  resource_utilization_rate: number;
  deadline_adherence_rate: number;
  quality_score: number;
  last_updated: Timestamp;
}

/**
 * 任务性能指标 (实现类型)
 */
export interface TaskPerformanceMetrics {
  queue_time_ms: number;
  execution_time_ms: number;
  wait_time_ms: number;
  resource_usage: {
    cpu_percentage: number;
    memory_mb: number;
    network_io_bytes: number;
    disk_io_bytes: number;
  };
  dependency_resolution_time_ms: number;
  last_updated: Timestamp;
}

/**
 * 计划事件类型 (实现类型)
 */
export type PlanEventType = 
  | 'plan_created' 
  | 'plan_updated' 
  | 'plan_deleted'
  | 'task_created' 
  | 'task_updated' 
  | 'task_deleted'
  | 'task_failure_resolved'
  | 'task_retry_scheduled'
  | 'task_unblocked'
  | 'dependency_resolved'
  | 'manual_intervention_required';

/**
 * 计划事件 (实现类型)
 */
export interface PlanEvent {
  event_id: UUID;
  event_type: PlanEventType;
  plan_id: UUID;
  task_id?: UUID;
  timestamp: Timestamp;
  data: unknown;
  metadata: {
    source: string;
    severity: string;
    tracepilot_synced: boolean;
  };
}

// ===== 导出默认值 =====
export const PROTOCOL_VERSION = PLAN_CONSTANTS.PROTOCOL_VERSION;
export const DEFAULT_TIMELINE_DURATION: Duration = PLAN_CONSTANTS.MIN_TIMELINE_DURATION;
export const DEFAULT_PRIORITY: Priority = PLAN_CONSTANTS.DEFAULT_PRIORITY;
export const DEFAULT_TASK_TYPE: TaskType = PLAN_CONSTANTS.DEFAULT_TASK_TYPE;
export const DEFAULT_TASK_STATUS: TaskStatus = PLAN_CONSTANTS.DEFAULT_TASK_STATUS;
export const DEFAULT_PLAN_STATUS: PlanStatus = PLAN_CONSTANTS.DEFAULT_PLAN_STATUS; 