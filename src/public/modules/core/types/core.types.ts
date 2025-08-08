/**
 * Core模块类型定义
 *
 * 定义Core运行时调度器的核心类型
 *
 * @version 2.0.0
 * @created 2025-09-16
 * @updated 2025-08-04
 */

import { UUID, Timestamp } from '../../../shared/types';

/**
 * 工作流阶段 - 支持完整的10个模块
 */
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';

/**
 * 执行状态
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 协议模块类型 - 支持完整的10个模块
 */
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network' | 'core';

/**
 * 工作流配置
 */
export interface WorkflowConfiguration {
  stages: WorkflowStage[];
  parallel_execution?: boolean;
  timeout_ms?: number;
  retryPolicy?: RetryPolicy;
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
 * 执行上下文 - 兼容原有接口
 */
export interface ExecutionContext {
  execution_id: UUID;
  contextId: UUID;
  workflowConfig: WorkflowConfiguration;
  current_stage: WorkflowStage;
  stage_results: Map<WorkflowStage, unknown>;
  metadata: Record<string, unknown>;
  startedAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 工作流执行上下文 - 新的业务工作流上下文
 */
export interface WorkflowExecutionContext {
  execution_id: UUID;
  contextId: UUID;
  workflowType: BusinessWorkflowType;
  current_stage: WorkflowStage;
  stage_index: number;
  total_stages: number;
  data_store: BusinessDataStore;
  execution_state: WorkflowExecutionState;
  metadata: Record<string, unknown>;
  startedAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 阶段执行结果
 */
export interface StageExecutionResult {
  stage: WorkflowStage;
  status: ExecutionStatus;
  result?: unknown;
  error?: Error;
  duration_ms: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  execution_id: UUID;
  contextId: UUID;
  status: ExecutionStatus;
  stages: StageExecutionResult[];
  total_duration_ms: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  error?: Error;
}

/**
 * 模块接口 - 重新设计解决P0架构问题
 * 职责分离：工作流执行 vs 业务协调
 */
export interface ModuleInterface {
  module_name: ProtocolModule;
  initialize(): Promise<void>;

  // 工作流阶段执行 - 技术层面
  executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult>;

  // 业务协调执行 - 业务层面
  executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult>;

  cleanup(): Promise<void>;
  getStatus(): ModuleStatus;

  // 新增：数据验证和错误处理
  validateInput(input: unknown): Promise<ValidationResult>;
  handleError(error: BusinessError, context: BusinessContext): Promise<ErrorHandlingResult>;
}

/**
 * 模块状态
 */
export interface ModuleStatus {
  module_name: ProtocolModule;
  status: 'initialized' | 'running' | 'idle' | 'error';
  last_execution?: Timestamp;
  error_count: number;
  performanceMetrics?: PerformanceMetrics;
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
 * 协调事件类型 - 支持所有10个模块的事件
 */
export type CoordinationEventType =
  | 'stage_started' | 'stage_completed' | 'stage_failed'
  | 'workflow_completed' | 'workflow_failed'
  | 'decision_started' | 'decision_completed' | 'consensus_reached'  // Collab事件
  | 'role_created' | 'role_activated' | 'role_deactivated'          // Role事件
  | 'dialog_started' | 'turn_completed' | 'dialog_ended'            // Dialog事件
  | 'plugin_registered' | 'plugin_activated' | 'plugin_executed'    // Extension事件
  | 'knowledge_persisted' | 'knowledge_shared' | 'context_updated'  // Context事件
  | 'network_formed' | 'topology_changed' | 'agent_joined'          // Network事件
  | 'planning_started' | 'planning_completed' | 'task_decomposed'   // Plan事件
  | 'confirmation_started' | 'confirmation_completed' | 'approval_granted' // Confirm事件
  | 'tracing_started' | 'tracing_completed' | 'event_captured';     // Trace事件

/**
 * 协调事件
 */
export interface CoordinationEvent {
  event_id: UUID;
  event_type: CoordinationEventType;
  execution_id: UUID;
  stage?: WorkflowStage;
  data?: unknown;
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
  moduleTimeoutMs: number;
  maxConcurrentExecutions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
  lifecycle_hooks?: LifecycleHooks;
}

// ===== 新增：模块协调接口定义 =====

/**
 * 决策协调请求 (Collab模块)
 */
export interface DecisionCoordinationRequest {
  contextId: UUID;
  participants: string[];
  strategy: 'simple_voting' | 'weighted_voting' | 'consensus' | 'delegation';
  parameters: {
    threshold?: number;
    weights?: Record<string, number>;
    timeout_ms?: number;
  };
  conflict_resolution?: 'mediation' | 'escalation' | 'override';
}

/**
 * 决策结果
 */
export interface DecisionResult {
  decision_id: UUID;
  result: unknown;
  consensus_reached: boolean;
  participants_votes: Record<string, unknown>;
  timestamp: Timestamp;
}

/**
 * 生命周期协调请求 (Role模块)
 */
export interface LifecycleCoordinationRequest {
  contextId: UUID;
  creation_strategy: 'static' | 'dynamic' | 'template_based' | 'ai_generated';
  parameters: {
    creation_rules?: string[];
    template_source?: string;
    generation_criteria?: unknown;
  };
  capability_management?: {
    skills: string[];
    expertise_level: number;
    learning_enabled: boolean;
  };
}

/**
 * 生命周期结果
 */
export interface LifecycleResult {
  roleId: UUID;
  role_data: unknown;
  capabilities: string[];
  timestamp: Timestamp;
}

/**
 * 对话协调请求 (Dialog模块)
 */
export interface DialogCoordinationRequest {
  contextId: UUID;
  turn_strategy: 'fixed' | 'adaptive' | 'goal_driven' | 'context_aware';
  parameters: {
    min_turns?: number;
    max_turns?: number;
    exit_criteria?: unknown;
  };
  state_management?: {
    persistence: boolean;
    transitions: string[];
    rollback_support: boolean;
  };
}

/**
 * 对话轮次
 */
export interface DialogTurn {
  turn_id: string;
  timestamp: Timestamp;
  action: string;
  result: 'success' | 'failed' | 'pending';
  data?: Record<string, unknown>;
}

/**
 * 对话最终状态
 */
export interface DialogFinalState {
  status: 'completed' | 'failed' | 'timeout' | 'cancelled';
  turn_count: number;
  strategy: string;
  metadata?: Record<string, unknown>;
}

/**
 * 对话结果
 */
export interface DialogResult {
  dialogId: UUID;
  turns: DialogTurn[];
  final_state: DialogFinalState;
  timestamp: Timestamp;
}

/**
 * 插件生命周期阶段
 */
export interface PluginLifecycleStage {
  enabled: boolean;
  timeout_ms?: number;
  retry_count?: number;
  parameters?: Record<string, unknown>;
}

/**
 * 插件协调请求 (Extension模块)
 */
export interface PluginCoordinationRequest {
  contextId: UUID;
  categories: ('methodology' | 'algorithm' | 'workflow' | 'analysis')[];
  lifecycle: {
    registration: PluginLifecycleStage;
    activation: PluginLifecycleStage;
    execution: PluginLifecycleStage;
    deactivation: PluginLifecycleStage;
  };
  integration_points: ('pre_execution' | 'post_execution' | 'error_handling' | 'monitoring')[];
}

/**
 * 插件执行结果
 */
export interface PluginExecutionResult {
  status: 'success' | 'failed' | 'timeout';
  output?: Record<string, unknown>;
  error?: string;
  metrics?: {
    execution_time_ms: number;
    memory_usage_mb: number;
  };
}

/**
 * 插件结果
 */
export interface PluginResult {
  plugin_id: UUID;
  execution_result: PluginExecutionResult;
  integration_status: Record<string, boolean>;
  timestamp: Timestamp;
}

/**
 * 知识保留策略
 */
export interface KnowledgeRetentionPolicy {
  duration_days?: number;
  max_size_mb?: number;
  cleanup_strategy: 'lru' | 'fifo' | 'manual';
}

/**
 * 知识访问控制
 */
export interface KnowledgeAccessControl {
  read_permissions: string[];
  write_permissions: string[];
  admin_permissions: string[];
}

/**
 * 知识协调请求 (Context模块)
 */
export interface KnowledgeCoordinationRequest {
  contextId: UUID;
  strategy: 'memory' | 'file' | 'database' | 'distributed';
  parameters: {
    storage_backend?: string;
    retention_policy?: KnowledgeRetentionPolicy;
    accessControl?: KnowledgeAccessControl;
  };
  sharing?: {
    cross_session: boolean;
    cross_application: boolean;
    sharing_rules: string[];
  };
}

/**
 * 知识持久化数据
 */
export interface KnowledgePersistedData {
  data_type: 'text' | 'json' | 'binary';
  content: Record<string, unknown>;
  metadata: {
    size_bytes: number;
    createdAt: Timestamp;
    last_accessed: Timestamp;
  };
}

/**
 * 知识结果
 */
export interface KnowledgeResult {
  knowledge_id: UUID;
  persisted_data: KnowledgePersistedData;
  sharing_status: Record<string, boolean>;
  timestamp: Timestamp;
}

/**
 * 规划协调请求 (Plan模块)
 */
export interface PlanningCoordinationRequest {
  contextId: UUID;
  planning_strategy: 'sequential' | 'parallel' | 'adaptive' | 'hierarchical';
  parameters: {
    decomposition_rules?: string[];
    priority_weights?: Record<string, number>;
    resource_constraints?: {
      time_limit?: number;
      resource_limit?: number;
    };
    [key: string]: unknown;
  };
  task_management?: {
    auto_decomposition: boolean;
    dependency_tracking: boolean;
    progress_monitoring: boolean;
  };
}

/**
 * 规划结果
 */
export interface PlanningResult {
  planId: UUID;
  plan_id?: UUID;  // 兼容snake_case
  task_breakdown: {
    tasks: Array<{
      taskId: UUID;
      name: string;
      dependencies: UUID[];
      priority: number;
      estimated_duration?: number;
    }>;
    execution_order: UUID[];
  };
  resource_allocation: Record<string, unknown>;
  timestamp: Timestamp;
}

/**
 * 确认协调请求 (Confirm模块)
 */
export interface ConfirmationCoordinationRequest {
  contextId: UUID;
  confirmation_strategy: 'manual' | 'automatic' | 'conditional' | 'multi_stage';
  parameters: {
    approval_rules?: string[];
    timeout_ms?: number;
    escalation_policy?: {
      levels: string[];
      timeout_per_level: number;
    };
    [key: string]: unknown;
  };
  approvalWorkflow?: {
    required_approvers: string[];
    approval_threshold: number;
    parallel_approval: boolean;
  };
}

/**
 * 确认结果
 */
export interface ConfirmationResult {
  confirmation_id: UUID;
  approval_status: 'approved' | 'rejected' | 'pending' | 'escalated';
  approver_responses: Record<string, {
    decision: 'approve' | 'reject' | 'abstain';
    timestamp: Timestamp;
    comments?: string;
  }>;
  final_decision: boolean;
  timestamp: Timestamp;
}

/**
 * 跟踪协调请求 (Trace模块)
 */
export interface TracingCoordinationRequest {
  contextId: UUID;
  tracing_strategy: 'real_time' | 'batch' | 'sampling' | 'adaptive';
  parameters: {
    sampling_rate?: number;
    retention_period?: number;
    event_filters?: string[];
    [key: string]: unknown;
  };
  monitoring_config?: {
    metrics_collection: boolean;
    alert_thresholds: Record<string, number>;
    dashboard_enabled: boolean;
  };
}

/**
 * 跟踪结果
 */
export interface TracingResult {
  traceId: UUID;
  monitoring_session: {
    sessionId: UUID;
    start_time: Timestamp;
    active_traces: number;
  };
  event_collection: {
    events_captured: number;
    storage_location: string;
  };
  timestamp: Timestamp;
}

/**
 * 扩展工作流配置 - 支持10模块的完整工作流配置
 */
export interface ExtendedWorkflowConfig {
  stages?: WorkflowStage[];
  executionMode?: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  timeout_ms?: number;

  // 各模块的特定配置
  collabConfig?: {
    participants?: string[];
    strategy?: 'simple_voting' | 'weighted_voting' | 'consensus' | 'delegation';
    parameters?: {
      threshold?: number;
      weights?: Record<string, number>;
      timeout_ms?: number;
    };
    conflict_resolution?: 'mediation' | 'escalation' | 'override';
  };

  roleConfig?: {
    creation_strategy?: 'static' | 'dynamic' | 'template_based' | 'ai_generated';
    parameters?: {
      creation_rules?: string[];
      template_source?: string;
      generation_criteria?: unknown;
    };
    capability_management?: {
      skills?: string[];
      expertise_level?: number;
      learning_enabled?: boolean;
    };
  };

  dialogConfig?: {
    turn_strategy?: 'fixed' | 'adaptive' | 'goal_driven' | 'context_aware';
    parameters?: {
      min_turns?: number;
      max_turns?: number;
      exit_criteria?: unknown;
    };
    state_management?: {
      persistence?: boolean;
      transitions?: string[];
      rollback_support?: boolean;
    };
  };

  extensionConfig?: {
    categories?: ('methodology' | 'algorithm' | 'workflow' | 'analysis')[];
    lifecycle?: {
      registration?: unknown;
      activation?: unknown;
      execution?: unknown;
      deactivation?: unknown;
    };
    integration_points?: ('pre_execution' | 'post_execution' | 'error_handling' | 'monitoring')[];
  };

  contextConfig?: {
    strategy?: 'memory' | 'file' | 'database' | 'distributed';
    parameters?: {
      storage_backend?: string;
      retention_policy?: unknown;
      accessControl?: unknown;
    };
    sharing?: {
      cross_session?: boolean;
      cross_application?: boolean;
      sharing_rules?: string[];
    };
  };
}

// ===== P0架构修复：新增业务协调和工作流类型 =====

/**
 * 业务工作流类型
 */
export type BusinessWorkflowType =
  | 'project_lifecycle'      // Plan → Confirm → Trace
  | 'decision_making'        // Collab → Confirm → Trace
  | 'knowledge_management'   // Context → Dialog → Extension
  | 'role_based_execution'   // Role → Plan → Confirm
  | 'custom';

/**
 * 业务数据存储
 */
export interface BusinessDataStore {
  global_data: Record<string, BusinessData>;
  stage_inputs: Record<string, BusinessData>;
  stage_outputs: Record<string, BusinessData>;
  intermediate_results: Record<string, unknown>;
}

/**
 * 工作流执行状态
 */
export interface WorkflowExecutionState {
  status: BusinessWorkflowStatus;
  completed_stages: string[];
  failed_stages: string[];
  pending_stages: string[];
  current_stage_status: BusinessCoordinationStatus;
  error_count: number;
  retry_count: number;
}

/**
 * 业务工作流状态
 */
export type BusinessWorkflowStatus =
  | 'initializing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'requires_intervention';

/**
 * 业务协调请求
 */
export interface BusinessCoordinationRequest {
  coordination_id: UUID;
  contextId: UUID;
  module: ProtocolModule;
  coordination_type: BusinessCoordinationType;
  input_data: BusinessData;
  previous_stage_results?: BusinessData[];
  configuration?: ModuleCoordinationConfiguration;
}

/**
 * 业务协调类型
 */
export type BusinessCoordinationType =
  | 'planning_coordination'
  | 'confirmation_coordination'
  | 'tracing_coordination'
  | 'collaboration_coordination'
  | 'dialog_coordination'
  | 'context_coordination'
  | 'role_coordination'
  | 'extension_coordination'
  | 'network_coordination';

/**
 * 业务协调结果
 */
export interface BusinessCoordinationResult {
  coordination_id: UUID;
  module: ProtocolModule;
  status: BusinessCoordinationStatus;
  output_data: BusinessData;
  execution_metrics: ExecutionMetrics;
  error?: BusinessError;
  timestamp: Timestamp;
}

/**
 * 业务协调状态
 */
export type BusinessCoordinationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'requires_approval'
  | 'requires_input';

/**
 * 业务数据
 */
export interface BusinessData {
  data_type: BusinessDataType;
  data_version: string;
  payload: Record<string, unknown>;
  metadata: BusinessDataMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 业务数据类型
 */
export type BusinessDataType =
  | 'planning_data'
  | 'confirmation_data'
  | 'tracing_data'
  | 'collaboration_data'
  | 'dialog_data'
  | 'context_data'
  | 'role_data'
  | 'extension_data'
  | 'network_data';

/**
 * 业务数据元数据
 */
export interface BusinessDataMetadata {
  source_module: ProtocolModule;
  target_modules: ProtocolModule[];
  data_schema_version: string;
  validation_status: 'valid' | 'invalid' | 'pending';
  security_level: 'public' | 'internal' | 'confidential' | 'restricted';
}

/**
 * 业务错误
 */
export interface BusinessError {
  error_id: UUID;
  error_type: BusinessErrorType;
  error_code: string;
  error_message: string;
  source_module: ProtocolModule;
  stage_id?: string;
  context_data: Record<string, unknown>;
  recovery_suggestions: RecoverySuggestion[];
  timestamp: Timestamp;
}

/**
 * 业务错误类型
 */
export type BusinessErrorType =
  | 'validation_error'
  | 'business_logic_error'
  | 'data_consistency_error'
  | 'authorization_error'
  | 'timeout_error'
  | 'dependency_error'
  | 'system_error';

/**
 * 恢复建议
 */
export interface RecoverySuggestion {
  suggestion_type: 'retry' | 'skip' | 'rollback' | 'manual_intervention' | 'alternative_path';
  description: string;
  automated: boolean;
  parameters?: Record<string, unknown>;
}

/**
 * 业务上下文
 */
export interface BusinessContext {
  contextId: UUID;
  workflow_execution_id?: UUID;
  stage_id?: string;
  user_context?: UserContext;
  security_context?: SecurityContext;
}

/**
 * 用户上下文
 */
export interface UserContext {
  userId: string;
  roles: string[];
  permissions: string[];
}

/**
 * 安全上下文
 */
export interface SecurityContext {
  security_level: 'public' | 'internal' | 'confidential' | 'restricted';
  access_tokens: string[];
  audit_required: boolean;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  field_path: string;
  error_code: string;
  error_message: string;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  field_path: string;
  warning_code: string;
  warning_message: string;
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  handled: boolean;
  recovery_action: 'retry' | 'skip' | 'rollback' | 'escalate';
  recovery_data?: BusinessData;
}

/**
 * 执行指标
 */
export interface ExecutionMetrics {
  start_time: Timestamp;
  end_time: Timestamp;
  duration_ms: number;
  cpu_usage?: number;
  memory_usage?: number;
  network_calls?: number;
}

/**
 * 模块协调配置
 */
export interface ModuleCoordinationConfiguration {
  timeout_ms: number;
  retryPolicy: RetryPolicy;
  validationRules: string[];
  output_format: string;
}
