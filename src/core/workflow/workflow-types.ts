/**
 * 工作流类型定义
 * @description 定义MPLP工作流系统的核心类型和接口
 * @author MPLP Team
 * @version 1.0.1
 */

/**
 * 工作流阶段类型
 */
export enum WorkflowStageType {
  PLAN = 'plan',
  CONFIRM = 'confirm', 
  TRACE = 'trace',
  DELIVERY = 'delivery'
}

/**
 * 工作流状态
 */
export enum WorkflowStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

/**
 * 工作流优先级
 */
export enum WorkflowPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 工作流上下文接口
 */
export interface IWorkflowContext {
  workflow_id?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  priority?: WorkflowPriority;
  metadata?: Record<string, any>;
  stage_results?: Record<WorkflowStageType, any>;
  variables?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * 工作流定义接口
 */
export interface IWorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  stages: WorkflowStageDefinition[];
  variables?: WorkflowVariable[];
  conditions?: WorkflowCondition[];
  timeout?: number;
  retry_policy?: RetryPolicy;
  created_at: string;
  updated_at: string;
}

/**
 * 工作流阶段定义
 */
export interface WorkflowStageDefinition {
  id: string;
  name: string;
  type: WorkflowStageType;
  description?: string;
  handler: string;
  inputs?: WorkflowInput[];
  outputs?: WorkflowOutput[];
  conditions?: WorkflowCondition[];
  timeout?: number;
  retry_policy?: RetryPolicy;
  dependencies?: string[];
  parallel?: boolean;
}

/**
 * 工作流变量
 */
export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default_value?: any;
  description?: string;
  validation?: ValidationRule[];
}

/**
 * 工作流输入
 */
export interface WorkflowInput {
  name: string;
  type: string;
  required: boolean;
  source?: 'context' | 'previous_stage' | 'variable' | 'constant';
  source_path?: string;
  default_value?: any;
  validation?: ValidationRule[];
}

/**
 * 工作流输出
 */
export interface WorkflowOutput {
  name: string;
  type: string;
  target?: 'context' | 'variable' | 'next_stage';
  target_path?: string;
  transformation?: string;
}

/**
 * 工作流条件
 */
export interface WorkflowCondition {
  id: string;
  expression: string;
  type: 'pre' | 'post' | 'skip' | 'retry';
  description?: string;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: string;
}

/**
 * 重试策略
 */
export interface RetryPolicy {
  max_attempts: number;
  delay: number;
  backoff_factor?: number;
  max_delay?: number;
  retry_on?: string[];
  stop_on?: string[];
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  workflow_id: string;
  status: WorkflowStatus;
  start_time: string;
  end_time?: string;
  duration?: number;
  stage_results: Record<WorkflowStageType, StageExecutionResult>;
  context: IWorkflowContext;
  error?: WorkflowError;
  metrics?: WorkflowExecutionMetrics;
}

/**
 * 阶段执行结果
 */
export interface StageExecutionResult {
  stage_id: string;
  stage_type: WorkflowStageType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  start_time: string;
  end_time?: string;
  duration?: number;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: StageError;
  retry_count?: number;
  metrics?: StageExecutionMetrics;
}

/**
 * 工作流错误
 */
export interface WorkflowError {
  code: string;
  message: string;
  stage?: WorkflowStageType;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
}

/**
 * 阶段错误
 */
export interface StageError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
  recoverable: boolean;
}

/**
 * 工作流执行指标
 */
export interface WorkflowExecutionMetrics {
  total_duration: number;
  stage_durations: Record<WorkflowStageType, number>;
  memory_usage: number;
  cpu_usage: number;
  network_calls: number;
  cache_hits: number;
  cache_misses: number;
}

/**
 * 阶段执行指标
 */
export interface StageExecutionMetrics {
  duration: number;
  memory_usage: number;
  cpu_usage: number;
  network_calls: number;
  database_queries: number;
  cache_operations: number;
}

/**
 * 工作流事件
 */
export interface WorkflowEvent {
  id: string;
  workflow_id: string;
  event_type: WorkflowEventType;
  stage?: WorkflowStageType;
  timestamp: string;
  data?: Record<string, any>;
  source: string;
}

/**
 * 工作流事件类型
 */
export enum WorkflowEventType {
  WORKFLOW_CREATED = 'workflow.created',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_CANCELLED = 'workflow.cancelled',
  WORKFLOW_PAUSED = 'workflow.paused',
  WORKFLOW_RESUMED = 'workflow.resumed',
  STAGE_STARTED = 'stage.started',
  STAGE_COMPLETED = 'stage.completed',
  STAGE_FAILED = 'stage.failed',
  STAGE_SKIPPED = 'stage.skipped',
  STAGE_RETRIED = 'stage.retried',
  CONTEXT_UPDATED = 'context.updated',
  VARIABLE_CHANGED = 'variable.changed'
}

/**
 * 工作流监听器接口
 */
export interface IWorkflowListener {
  onWorkflowEvent(event: WorkflowEvent): Promise<void>;
}

/**
 * 工作流处理器接口
 */
export interface IWorkflowHandler {
  canHandle(stage: WorkflowStageType): boolean;
  handle(context: IWorkflowContext, inputs: Record<string, any>): Promise<Record<string, any>>;
  validate(inputs: Record<string, any>): ValidationResult;
  getMetadata(): HandlerMetadata;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * 处理器元数据
 */
export interface HandlerMetadata {
  name: string;
  version: string;
  description?: string;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  timeout?: number;
  retry_policy?: RetryPolicy;
}

/**
 * 工作流调度器接口
 */
export interface IWorkflowScheduler {
  schedule(definition: IWorkflowDefinition, context: IWorkflowContext, delay?: number): Promise<string>;
  cancel(workflow_id: string): Promise<boolean>;
  pause(workflow_id: string): Promise<boolean>;
  resume(workflow_id: string): Promise<boolean>;
  getStatus(workflow_id: string): Promise<WorkflowStatus>;
  getActiveWorkflows(): Promise<string[]>;
}

/**
 * 工作流存储接口
 */
export interface IWorkflowStorage {
  saveDefinition(definition: IWorkflowDefinition): Promise<void>;
  getDefinition(id: string): Promise<IWorkflowDefinition | undefined>;
  saveExecution(execution: WorkflowExecutionResult): Promise<void>;
  getExecution(workflow_id: string): Promise<WorkflowExecutionResult | undefined>;
  queryExecutions(criteria: QueryCriteria): Promise<WorkflowExecutionResult[]>;
  deleteExecution(workflow_id: string): Promise<boolean>;
}

/**
 * 查询条件
 */
export interface QueryCriteria {
  status?: WorkflowStatus[];
  stage?: WorkflowStageType[];
  start_time_from?: string;
  start_time_to?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
