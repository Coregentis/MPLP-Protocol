/**
 * Core协议类型定义
 * @description 定义MPLP Core协议的所有类型和接口
 * @author MPLP Team
 * @version 2.0.0
 * @updated 2025-08-04
 */

// ===== 基础类型 =====
export type UUID = string;
export type Timestamp = string;

// ===== 工作流相关类型 =====

/**
 * 工作流阶段枚举
 */
export enum WorkflowStage {
  CONTEXT = 'context',
  PLAN = 'plan',
  CONFIRM = 'confirm',
  TRACE = 'trace',
  ROLE = 'role',
  EXTENSION = 'extension',
  COLLAB = 'collab',
  DIALOG = 'dialog',
  NETWORK = 'network'
}

/**
 * 工作流状态枚举
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
 * 执行模式枚举
 */
export enum ExecutionMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  HYBRID = 'hybrid'
}

/**
 * 优先级枚举
 */
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * 阶段执行状态枚举
 */
export enum StageStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// ===== 重试策略 =====

/**
 * 重试策略接口
 */
export interface RetryPolicy {
  max_attempts: number;
  delay_ms: number;
  backoff_factor?: number;
}

// ===== 工作流配置 =====

/**
 * 工作流配置接口
 */
export interface WorkflowConfig {
  name: string;
  description?: string;
  stages: WorkflowStage[];
  execution_mode: ExecutionMode;
  timeout_ms?: number;
  max_concurrent_executions?: number;
  retry_policy?: RetryPolicy;
}

// ===== 执行上下文 =====

/**
 * 执行上下文接口
 */
export interface ExecutionContext {
  user_id?: string;
  session_id?: UUID;
  request_id?: UUID;
  priority?: Priority;
  metadata?: Record<string, any>;
  variables?: Record<string, any>;
}

// ===== 阶段执行结果 =====

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * 阶段执行结果接口
 */
export interface StageResult {
  status: StageStatus;
  start_time?: Timestamp;
  end_time?: Timestamp;
  duration_ms?: number;
  result?: Record<string, any>;
  error?: ErrorInfo;
}

// ===== 执行状态 =====

/**
 * 执行状态接口
 */
export interface ExecutionStatus {
  status: WorkflowStatus;
  current_stage?: WorkflowStage;
  completed_stages?: WorkflowStage[];
  stage_results?: Record<string, StageResult>;
  start_time?: Timestamp;
  end_time?: Timestamp;
  duration_ms?: number;
  retry_count?: number;
}

// ===== 模块协调 =====

/**
 * 模块适配器配置接口
 */
export interface ModuleAdapterConfig {
  adapter_type: string;
  config?: Record<string, any>;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
}

/**
 * 数据映射接口
 */
export interface DataMapping {
  source_stage: WorkflowStage;
  source_field: string;
  target_field: string;
  transformation?: string;
}

/**
 * 数据流配置接口
 */
export interface DataFlowConfig {
  input_mappings?: Record<string, DataMapping>;
  output_mappings?: Record<string, DataMapping>;
}

/**
 * 模块协调配置接口
 */
export interface ModuleCoordination {
  module_adapters?: Record<string, ModuleAdapterConfig>;
  data_flow?: DataFlowConfig;
}

// ===== 事件处理 =====

/**
 * 事件类型枚举
 */
export enum EventType {
  WORKFLOW_CREATED = 'workflow.created',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_CANCELLED = 'workflow.cancelled',
  STAGE_STARTED = 'stage.started',
  STAGE_COMPLETED = 'stage.completed',
  STAGE_FAILED = 'stage.failed',
  MODULE_CONNECTED = 'module.connected',
  MODULE_DISCONNECTED = 'module.disconnected',
  DATA_TRANSFERRED = 'data.transferred'
}

/**
 * 事件监听器配置接口
 */
export interface EventListenerConfig {
  event_type: EventType;
  handler: string;
  config?: Record<string, any>;
}

/**
 * 事件路由规则接口
 */
export interface EventRoutingRule {
  condition: string;
  handler: string;
}

/**
 * 事件路由配置接口
 */
export interface EventRoutingConfig {
  default_handler?: string;
  routing_rules?: EventRoutingRule[];
}

/**
 * 事件处理配置接口
 */
export interface EventHandling {
  event_listeners?: EventListenerConfig[];
  event_routing?: EventRoutingConfig;
}

// ===== Core协议主接口 =====

/**
 * Core协议接口
 */
export interface CoreProtocol {
  protocol_version: string;
  timestamp: Timestamp;
  workflow_id: UUID;
  orchestrator_id: UUID;
  workflow_config: WorkflowConfig;
  execution_context: ExecutionContext;
  execution_status: ExecutionStatus;
  module_coordination?: ModuleCoordination;
  event_handling?: EventHandling;
}

// ===== 操作结果 =====

/**
 * 操作结果接口
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

// ===== 工作流执行结果 =====

/**
 * 工作流执行结果接口
 */
export interface WorkflowExecutionResult {
  workflow_id: UUID;
  status: WorkflowStatus;
  start_time: Timestamp;
  end_time?: Timestamp;
  duration_ms?: number;
  completed_stages: WorkflowStage[];
  stage_results: Record<string, StageResult>;
  context: ExecutionContext;
  error?: ErrorInfo;
}

// ===== 模块接口 =====

/**
 * 模块适配器接口
 */
export interface IModuleAdapter {
  execute(input: Record<string, any>): Promise<OperationResult>;
  getStatus(): Promise<StageStatus>;
  healthCheck(): Promise<boolean>;
  getMetadata(): ModuleMetadata;
}

/**
 * 模块元数据接口
 */
export interface ModuleMetadata {
  name: string;
  version: string;
  stage: WorkflowStage;
  description?: string;
  capabilities?: string[];
}

// ===== CoreOrchestrator接口 =====

/**
 * CoreOrchestrator配置接口
 */
export interface CoreOrchestratorConfig {
  default_workflow?: WorkflowConfig;
  module_timeout_ms?: number;
  max_concurrent_executions?: number;
  enable_metrics?: boolean;
  enable_events?: boolean;
}

/**
 * CoreOrchestrator接口
 */
export interface ICoreOrchestrator {
  // 工作流执行
  executeWorkflow(contextId: string, config?: Partial<WorkflowConfig>): Promise<OperationResult<WorkflowExecutionResult>>;
  
  // 状态管理
  getActiveExecutions(): Promise<string[]>;
  getExecutionStatus(workflowId: string): Promise<OperationResult<ExecutionStatus>>;
  
  // 模块管理
  getModuleStatuses(): Promise<Record<string, StageStatus>>;
  registerModuleAdapter(stage: WorkflowStage, adapter: IModuleAdapter): Promise<void>;
  
  // 事件处理
  addEventListener(eventType: EventType, handler: (event: any) => void): void;
  removeEventListener(eventType: EventType, handler: (event: any) => void): void;
  
  // 控制操作
  pauseWorkflow(workflowId: string): Promise<OperationResult<boolean>>;
  resumeWorkflow(workflowId: string): Promise<OperationResult<boolean>>;
  cancelWorkflow(workflowId: string): Promise<OperationResult<boolean>>;
}
