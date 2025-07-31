/**
 * Plan DTO
 * 
 * 定义API请求和响应的数据结构
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:50:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { 
  UUID, 
  PlanStatus, 
  TaskStatus, 
  ExecutionStrategy, 
  Priority, 
  TaskPriority, 
  TaskType, 
  DependencyType, 
  DependencyCriticality, 
  MilestoneStatus, 
  DurationUnit, 
  RiskLevel, 
  RiskCategory, 
  RiskStatus 
} from '../../../../public/shared/types/plan-types';

/**
 * 创建计划请求DTO
 */
export interface CreatePlanRequestDto {
  plan_id?: UUID;
  context_id: UUID;
  name: string;
  description: string;
  goals?: string[];
  tasks?: PlanTaskDto[];
  dependencies?: PlanDependencyDto[];
  execution_strategy?: ExecutionStrategy;
  priority?: Priority;
  estimated_duration?: DurationDto;
  configuration?: PlanConfigurationDto;
  metadata?: Record<string, unknown>;
}

/**
 * 更新计划请求DTO
 */
export interface UpdatePlanRequestDto {
  name?: string;
  description?: string;
  status?: PlanStatus;
  goals?: string[];
  tasks?: PlanTaskDto[];
  dependencies?: PlanDependencyDto[];
  execution_strategy?: ExecutionStrategy;
  priority?: Priority;
  estimated_duration?: DurationDto;
  configuration?: PlanConfigurationDto;
  metadata?: Record<string, unknown>;
  risk_assessment?: RiskAssessmentDto;
}

/**
 * 计划执行请求DTO
 */
export interface PlanExecutionRequestDto {
  execution_context?: Record<string, unknown>;
  execution_options?: {
    parallel_limit?: number;
    timeout_ms?: number;
    retry_failed_tasks?: boolean;
    failure_strategy?: string;
  };
  execution_variables?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
}

/**
 * 计划响应DTO
 */
export interface PlanResponseDto {
  plan_id: UUID;
  context_id: UUID;
  name: string;
  description: string;
  status: PlanStatus;
  version: string;
  created_at: string;
  updated_at: string;
  goals: string[];
  tasks: PlanTaskDto[];
  dependencies: PlanDependencyDto[];
  execution_strategy: ExecutionStrategy;
  priority: Priority;
  estimated_duration?: DurationDto;
  progress: {
    completed_tasks: number;
    total_tasks: number;
    percentage: number;
  };
  timeline?: TimelineDto;
  configuration: PlanConfigurationDto;
  metadata?: Record<string, unknown>;
  risk_assessment?: RiskAssessmentDto;
}

/**
 * 计划任务DTO
 */
export interface PlanTaskDto {
  task_id: UUID;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  parent_task_id?: UUID;
  estimated_effort?: TaskEffortDto;
  assignee?: TaskAssigneeDto;
  resource_requirements?: ResourceRequirementDto[];
  acceptance_criteria?: AcceptanceCriterionDto[];
  start_time?: string;
  end_time?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 计划依赖DTO
 */
export interface PlanDependencyDto {
  id: UUID;
  source_task_id: UUID;
  target_task_id: UUID;
  dependency_type: DependencyType;
  lag?: DurationDto;
  criticality: DependencyCriticality;
  condition?: string;
}

/**
 * 时间线DTO
 */
export interface TimelineDto {
  start_date: string;
  end_date: string;
  milestones: PlanMilestoneDto[];
  critical_path: UUID[];
}

/**
 * 计划里程碑DTO
 */
export interface PlanMilestoneDto {
  milestone_id: UUID;
  name: string;
  description?: string;
  due_date: string;
  status: MilestoneStatus;
  related_tasks: UUID[];
}

/**
 * 持续时间DTO
 */
export interface DurationDto {
  value: number;
  unit: DurationUnit;
}

/**
 * 任务工作量DTO
 */
export interface TaskEffortDto {
  value: number;
  unit: DurationUnit;
  confidence?: number; // 0-1之间的置信度
}

/**
 * 任务执行者DTO
 */
export interface TaskAssigneeDto {
  id: UUID;
  name: string;
  role?: string;
  assignment_time?: string;
}

/**
 * 资源需求DTO
 */
export interface ResourceRequirementDto {
  resource_type: string;
  amount: number;
  unit?: string;
  mandatory: boolean;
}

/**
 * 验收标准DTO
 */
export interface AcceptanceCriterionDto {
  id: UUID;
  description: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: UUID;
}

/**
 * 计划配置DTO
 */
export interface PlanConfigurationDto {
  execution_settings: {
    strategy: ExecutionStrategy;
    parallel_limit?: number;
    default_timeout_ms: number;
    retry_policy: {
      max_retries: number;
      retry_delay_ms: number;
      backoff_factor: number;
    };
  };
  notification_settings: {
    enabled: boolean;
    channels: string[];
    events: string[];
    task_completion?: boolean;
  };
  optimization_settings: {
    enabled: boolean;
    strategies: string[];
    auto_adjust: boolean;
  };
  monitoring_settings?: {
    interval_ms: number;
    metrics: string[];
    alerts_enabled: boolean;
    alert_thresholds?: Record<string, number>;
  };
}

/**
 * 风险评估DTO
 */
export interface RiskAssessmentDto {
  overall_risk_level: RiskLevel;
  risks: RiskDto[];
  last_assessed: string;
}

/**
 * 风险DTO
 */
export interface RiskDto {
  risk_id: UUID;
  name: string;
  description: string;
  category: RiskCategory;
  likelihood: number; // 0-1
  impact: number; // 0-1
  risk_level: RiskLevel;
  status: RiskStatus;
  mitigation_strategy?: string;
  related_tasks?: UUID[];
}

/**
 * 计划执行结果DTO
 */
export interface PlanExecutionResultDto {
  success: boolean;
  plan_id: UUID;
  status: string;
  execution_id?: UUID;
  started_at?: string;
  completed_at?: string;
  execution_time_ms: number;
  estimated_completion_time?: string;
  optimization_applied?: boolean;
  execution_mode?: string;
  tasks_status: {
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    skipped: number;
  };
  error?: string;
}

/**
 * 计划状态DTO
 */
export interface PlanStatusDto {
  plan_id: UUID;
  status: PlanStatus;
  progress: {
    completed_tasks: number;
    total_tasks: number;
    percentage: number;
  };
  updated_at: string;
} 