/**
 * 计划适配器接口 - 厂商中立设计
 * 
 * 定义了MPLP与外部计划系统集成的标准接口。
 * 所有计划适配器实现必须遵循此接口。
 * 
 * @version v1.0.0
 * @created 2025-07-15T10:15:00+08:00
 * @compliance plan-protocol.json Schema v1.0.2 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { 
  PlanProtocol, 
  PlanTask, 
  PlanDependency, 
  PlanStatus, 
  TaskStatus, 
  FailureResolver, 
  PlanFilter,
  PlanOperationResult
} from '../modules/plan/types';

/**
 * 计划健康状态接口
 */
export interface PlanAdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  last_check_timestamp: string;
  details?: Record<string, unknown>;
  error_message?: string;
}

/**
 * 计划执行结果接口
 */
export interface PlanExecutionResult {
  success: boolean;
  plan_id: string;
  status: PlanStatus;
  execution_id?: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  completed_tasks: number;
  total_tasks: number;
  failed_tasks: number;
  error_message?: string;
  error_details?: Record<string, unknown>;
}

/**
 * 任务执行结果接口
 */
export interface TaskExecutionResult {
  success: boolean;
  task_id: string;
  plan_id: string;
  status: TaskStatus;
  execution_id?: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  output?: Record<string, unknown>;
  error_message?: string;
  error_details?: Record<string, unknown>;
}

/**
 * 故障诊断结果接口
 */
export interface FailureDiagnosticResult {
  failure_id: string;
  task_id: string;
  plan_id: string;
  diagnosis: string;
  confidence_score: number;
  root_cause?: string;
  suggested_actions: string[];
  related_failures?: Array<{
    failure_id: string;
    similarity_score: number;
    resolution?: string;
  }>;
  code_issues?: Array<{
    file_path?: string;
    line_number?: number;
    issue_type: string;
    severity: string;
    description: string;
    suggested_fix?: string;
  }>;
}

/**
 * 计划性能指标接口
 */
export interface PlanPerformanceMetrics {
  avg_execution_time_ms: number;
  avg_task_execution_time_ms: number;
  failure_rate: number;
  recovery_success_rate: number;
  avg_recovery_time_ms: number;
  concurrent_plans: number;
  timestamp: string;
}

/**
 * 计划适配器接口 - 厂商中立
 */
export interface IPlanAdapter {
  /**
   * 获取适配器信息
   * @returns 包含适配器类型和版本的对象
   */
  getAdapterInfo(): { type: string; version: string };
  
  /**
   * 同步计划
   * @param plan 计划协议对象
   * @returns 操作结果
   */
  syncPlan(plan: PlanProtocol): Promise<PlanOperationResult>;
  
  /**
   * 执行计划
   * @param planId 计划ID
   * @param options 执行选项
   * @returns 执行结果
   */
  executePlan(planId: string, options?: Record<string, unknown>): Promise<PlanExecutionResult>;
  
  /**
   * 暂停计划执行
   * @param planId 计划ID
   * @param executionId 执行ID
   * @returns 操作结果
   */
  pausePlanExecution(planId: string, executionId: string): Promise<PlanOperationResult>;
  
  /**
   * 恢复计划执行
   * @param planId 计划ID
   * @param executionId 执行ID
   * @returns 操作结果
   */
  resumePlanExecution(planId: string, executionId: string): Promise<PlanOperationResult>;
  
  /**
   * 取消计划执行
   * @param planId 计划ID
   * @param executionId 执行ID
   * @returns 操作结果
   */
  cancelPlanExecution(planId: string, executionId: string): Promise<PlanOperationResult>;
  
  /**
   * 获取计划执行状态
   * @param planId 计划ID
   * @param executionId 执行ID
   * @returns 执行结果
   */
  getPlanExecutionStatus(planId: string, executionId: string): Promise<PlanExecutionResult>;
  
  /**
   * 获取任务执行状态
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param executionId 执行ID
   * @returns 任务执行结果
   */
  getTaskExecutionStatus(planId: string, taskId: string, executionId: string): Promise<TaskExecutionResult>;
  
  /**
   * 执行单个任务
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param options 执行选项
   * @returns 任务执行结果
   */
  executeTask(planId: string, taskId: string, options?: Record<string, unknown>): Promise<TaskExecutionResult>;
  
  /**
   * 诊断故障
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param failureId 故障ID
   * @returns 故障诊断结果
   */
  diagnosePlanFailure(planId: string, taskId: string, failureId: string): Promise<FailureDiagnosticResult>;
  
  /**
   * 应用故障解决方案
   * @param planId 计划ID
   * @param taskId 任务ID
   * @param failureId 故障ID
   * @param resolverId 解决方案ID
   * @returns 操作结果
   */
  applyFailureResolution(planId: string, taskId: string, failureId: string, resolverId: string): Promise<PlanOperationResult>;
  
  /**
   * 获取计划性能指标
   * @param planId 计划ID
   * @returns 性能指标
   */
  getPlanMetrics(planId: string): Promise<PlanPerformanceMetrics>;
  
  /**
   * 验证计划
   * @param plan 计划协议对象
   * @returns 验证结果
   */
  validatePlan(plan: PlanProtocol): Promise<{
    valid: boolean;
    issues?: Array<{
      path: string;
      severity: string;
      message: string;
    }>;
  }>;
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  checkHealth(): Promise<PlanAdapterHealth>;
  
  /**
   * 优化计划
   * @param planId 计划ID
   * @param optimizationGoals 优化目标
   * @returns 优化后的计划
   */
  optimizePlan?(planId: string, optimizationGoals: string[]): Promise<PlanProtocol>;
  
  /**
   * 分析计划风险
   * @param planId 计划ID
   * @returns 风险评估结果
   */
  analyzePlanRisks?(planId: string): Promise<Record<string, unknown>>;
} 