/**
 * Core模块类型定义
 * 
 * 定义Core运行时调度器的核心类型
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../shared/types';

/**
 * 工作流阶段
 */
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace';

/**
 * 执行状态
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 协议模块类型
 */
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';

/**
 * 工作流配置
 */
export interface WorkflowConfiguration {
  stages: WorkflowStage[];
  parallel_execution?: boolean;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
  error_handling?: ErrorHandlingPolicy;
}

/**
 * 重试策略
 */
export interface RetryPolicy {
  max_attempts: number;
  delay_ms: number;
  backoff_multiplier?: number;
  max_delay_ms?: number;
}

/**
 * 错误处理策略
 */
export interface ErrorHandlingPolicy {
  continue_on_error: boolean;
  rollback_on_failure: boolean;
  notification_enabled: boolean;
}

/**
 * 执行上下文
 */
export interface ExecutionContext {
  execution_id: UUID;
  context_id: UUID;
  workflow_config: WorkflowConfiguration;
  current_stage: WorkflowStage;
  stage_results: Map<WorkflowStage, any>;
  metadata: Record<string, any>;
  started_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * 阶段执行结果
 */
export interface StageExecutionResult {
  stage: WorkflowStage;
  status: ExecutionStatus;
  result?: any;
  error?: Error;
  duration_ms: number;
  started_at: Timestamp;
  completed_at?: Timestamp;
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  execution_id: UUID;
  context_id: UUID;
  status: ExecutionStatus;
  stages: StageExecutionResult[];
  total_duration_ms: number;
  started_at: Timestamp;
  completed_at?: Timestamp;
  error?: Error;
}

/**
 * 模块接口
 */
export interface ModuleInterface {
  module_name: ProtocolModule;
  initialize(): Promise<void>;
  execute(context: any): Promise<any>;
  cleanup(): Promise<void>;
  getStatus(): ModuleStatus;
}

/**
 * 模块状态
 */
export interface ModuleStatus {
  module_name: ProtocolModule;
  status: 'initialized' | 'running' | 'idle' | 'error';
  last_execution?: Timestamp;
  error_count: number;
  performance_metrics?: PerformanceMetrics;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  average_execution_time_ms: number;
  total_executions: number;
  success_rate: number;
  error_rate: number;
  last_updated: Timestamp;
}

/**
 * 协调事件
 */
export interface CoordinationEvent {
  event_id: UUID;
  event_type: 'stage_started' | 'stage_completed' | 'stage_failed' | 'workflow_completed' | 'workflow_failed';
  execution_id: UUID;
  stage?: WorkflowStage;
  data?: any;
  timestamp: Timestamp;
}

/**
 * 生命周期钩子
 */
export interface LifecycleHooks {
  beforeStage?: (stage: WorkflowStage, context: ExecutionContext) => Promise<void>;
  afterStage?: (stage: WorkflowStage, result: StageExecutionResult, context: ExecutionContext) => Promise<void>;
  onError?: (error: Error, stage: WorkflowStage, context: ExecutionContext) => Promise<void>;
  beforeWorkflow?: (context: ExecutionContext) => Promise<void>;
  afterWorkflow?: (result: WorkflowExecutionResult) => Promise<void>;
}

/**
 * 调度器配置
 */
export interface OrchestratorConfiguration {
  default_workflow: WorkflowConfiguration;
  module_timeout_ms: number;
  max_concurrent_executions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
  lifecycle_hooks?: LifecycleHooks;
}
