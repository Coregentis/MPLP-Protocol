/**
 * MPLP v1.0 模块导出类型定义
 * 
 * 定义所有模块的导出接口和类型
 * 
 * @version 1.0.0
 * @created 2025-07-28
 */

// ===== 基础类型 =====
export type UUID = string;
export type Timestamp = string;

// ===== 通用操作结果 =====
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

// ===== 分页相关 =====
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ===== Context模块导出 =====
export interface ContextModuleExports {
  contextManagementService: ContextManagementService;
  contextController: ContextController;
}

export interface ContextManagementService {
  createContext(request: CreateContextRequest): Promise<OperationResult<Context>>;
  getContextById(contextId: UUID): Promise<OperationResult<Context>>;
  updateContext(contextId: UUID, updates: Partial<UpdateContextRequest>): Promise<OperationResult<Context>>;
  deleteContext(contextId: UUID): Promise<OperationResult<void>>;
  queryContexts(filter: ContextFilter, pagination?: PaginationOptions): Promise<OperationResult<PaginatedResult<Context>>>;
}

export interface ContextController {
  createContext(request: any): Promise<any>;
  getContext(request: any): Promise<any>;
  updateContext(request: any): Promise<any>;
  deleteContext(request: any): Promise<any>;
  queryContexts(request: any): Promise<any>;
}

export interface Context {
  context_id: UUID;
  name: string;
  description?: string;
  status: ContextStatus;
  metadata: Record<string, any>;
  tags: string[];
  parent_context_id?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ContextStatus = 'draft' | 'active' | 'inactive' | 'completed' | 'archived' | 'cancelled';

export interface CreateContextRequest {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  parent_context_id?: UUID;
}

export interface UpdateContextRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ContextFilter {
  name?: string;
  status?: ContextStatus | ContextStatus[];
  tags?: string[];
  parent_context_id?: UUID;
  created_after?: Timestamp;
  created_before?: Timestamp;
}

// ===== Plan模块导出 =====
export interface PlanModuleExports {
  planManagementService: PlanManagementService;
  planController: PlanController;
}

export interface PlanManagementService {
  createPlan(request: CreatePlanRequest): Promise<OperationResult<Plan>>;
  getPlanById(planId: UUID): Promise<OperationResult<Plan>>;
  updatePlan(planId: UUID, updates: Partial<UpdatePlanRequest>): Promise<OperationResult<Plan>>;
  deletePlan(planId: UUID): Promise<OperationResult<void>>;
  addTask(planId: UUID, task: CreateTaskRequest): Promise<OperationResult<Task>>;
  updateTaskStatus(taskId: UUID, status: TaskStatus): Promise<OperationResult<Task>>;
}

export interface PlanController {
  createPlan(request: any): Promise<any>;
  getPlan(request: any): Promise<any>;
  updatePlan(request: any): Promise<any>;
  deletePlan(request: any): Promise<any>;
}

export interface Plan {
  plan_id: UUID;
  context_id: UUID;
  name: string;
  description?: string;
  status: PlanStatus;
  tasks: Task[];
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Task {
  task_id: UUID;
  plan_id: UUID;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_duration?: number;
  actual_duration?: number;
  dependencies: UUID[];
  assigned_to?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreatePlanRequest {
  context_id: UUID;
  name: string;
  description?: string;
  tasks: CreateTaskRequest[];
  metadata?: Record<string, any>;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  priority: TaskPriority;
  estimated_duration?: number;
  dependencies?: UUID[];
  assigned_to?: string;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// ===== Confirm模块导出 =====
export interface ConfirmModuleExports {
  confirmManagementService: ConfirmManagementService;
  confirmController: ConfirmController;
}

export interface ConfirmManagementService {
  createConfirmation(request: CreateConfirmationRequest): Promise<OperationResult<Confirmation>>;
  getConfirmationById(confirmationId: UUID): Promise<OperationResult<Confirmation>>;
  submitApproval(confirmationId: UUID, approverId: string, decision: ApprovalDecision, comments?: string): Promise<OperationResult<Approval>>;
  getConfirmationStatus(confirmationId: UUID): Promise<OperationResult<ConfirmationStatus>>;
}

export interface ConfirmController {
  createConfirmation(request: any): Promise<any>;
  getConfirmation(request: any): Promise<any>;
  submitApproval(request: any): Promise<any>;
}

export interface Confirmation {
  confirmation_id: UUID;
  context_id: UUID;
  plan_id?: UUID;
  type: ConfirmationType;
  title: string;
  description?: string;
  status: ConfirmationStatus;
  required_approvers: string[];
  approval_threshold: number;
  approvals: Approval[];
  deadline?: Timestamp;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Approval {
  approval_id: UUID;
  confirmation_id: UUID;
  approver_id: string;
  decision: ApprovalDecision;
  comments?: string;
  submitted_at: Timestamp;
}

export type ConfirmationType = 'plan_approval' | 'task_approval' | 'resource_approval' | 'milestone_approval' | 'custom';
export type ConfirmationStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
export type ApprovalDecision = 'approve' | 'reject' | 'abstain';

export interface CreateConfirmationRequest {
  context_id: UUID;
  plan_id?: UUID;
  type: ConfirmationType;
  title: string;
  description?: string;
  required_approvers: string[];
  approval_threshold: number;
  deadline?: Date;
  metadata?: Record<string, any>;
}

// ===== Trace模块导出 =====
export interface TraceModuleExports {
  traceManagementService: TraceManagementService;
  traceController: TraceController;
}

export interface TraceManagementService {
  createTrace(request: CreateTraceRequest): Promise<OperationResult<Trace>>;
  getTraceById(traceId: UUID): Promise<OperationResult<Trace>>;
  recordEvent(request: RecordEventRequest): Promise<OperationResult<Event>>;
  queryTraces(filter: TraceFilter, aggregation?: TraceAggregation): Promise<OperationResult<TraceQueryResult>>;
  getMetrics(timeRange: TimeRange, metricTypes?: MetricType[]): Promise<OperationResult<MetricsData>>;
}

export interface TraceController {
  createTrace(request: any): Promise<any>;
  getTrace(request: any): Promise<any>;
  recordEvent(request: any): Promise<any>;
}

export interface Trace {
  trace_id: UUID;
  context_id: UUID;
  execution_id?: UUID;
  trace_type: TraceType;
  name: string;
  description?: string;
  status: TraceStatus;
  events: Event[];
  metadata: Record<string, any>;
  tags: string[];
  started_at: Timestamp;
  completed_at?: Timestamp;
  duration_ms?: number;
}

export interface Event {
  event_id: UUID;
  trace_id: UUID;
  event_type: string;
  level: EventLevel;
  message?: string;
  data?: Record<string, any>;
  timestamp: Timestamp;
  duration_ms?: number;
  parent_event_id?: UUID;
}

export type TraceType = 'workflow_execution' | 'module_operation' | 'api_request' | 'background_task' | 'custom';
export type TraceStatus = 'active' | 'completed' | 'failed' | 'cancelled' | 'expired';
export type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface CreateTraceRequest {
  context_id: UUID;
  execution_id?: UUID;
  trace_type: TraceType;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface RecordEventRequest {
  trace_id: UUID;
  event_type: string;
  level: EventLevel;
  message?: string;
  data?: Record<string, any>;
  timestamp?: Date;
  duration_ms?: number;
}

export interface TraceFilter {
  context_ids?: UUID[];
  trace_types?: TraceType[];
  status?: TraceStatus[];
  time_range?: TimeRange;
  has_errors?: boolean;
}

export interface TraceAggregation {
  group_by?: string[];
  metrics?: string[];
  time_bucket?: string;
}

export interface TraceQueryResult {
  traces: Trace[];
  aggregations?: Record<string, any>;
  pagination?: PaginationOptions;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface MetricsData {
  total_duration?: number;
  completed_tasks?: number;
  success_rate?: number;
  efficiency_score?: number;
}

export type MetricType = 'response_time' | 'error_rate' | 'throughput' | 'custom';

// ===== Role模块导出 =====
export interface RoleModuleExports {
  roleManagementService: RoleManagementService;
  roleController: RoleController;
}

export interface RoleManagementService {
  createRole(request: CreateRoleRequest): Promise<OperationResult<Role>>;
  getRoleById(roleId: UUID): Promise<OperationResult<Role>>;
  assignRoleToUser(userId: string, roleId: UUID, context?: AssignmentContext): Promise<OperationResult<UserRole>>;
  checkPermission(userId: string, permission: string, context?: PermissionContext): Promise<boolean>;
  getUserRoles(userId: string): Promise<OperationResult<UserRole[]>>;
  getUserPermissions(userId: string, context?: PermissionContext): Promise<OperationResult<string[]>>;
}

export interface RoleController {
  createRole(request: any): Promise<any>;
  getRole(request: any): Promise<any>;
  assignRole(request: any): Promise<any>;
}

export interface Role {
  role_id: UUID;
  name: string;
  description?: string;
  permissions: Permission[];
  parent_role_id?: UUID;
  child_roles: Role[];
  is_system_role: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Permission {
  permission_id: UUID;
  name: string;
  resource: string;
  action: string;
  description?: string;
  conditions?: PermissionCondition[];
  is_system_permission: boolean;
  created_at: Timestamp;
}

export interface UserRole {
  assignment_id: UUID;
  user_id: string;
  role_id: UUID;
  assigned_by: string;
  context_id?: UUID;
  expires_at?: Date;
  is_active: boolean;
  assigned_at: Timestamp;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  parent_role_id?: UUID;
  is_system_role?: boolean;
  metadata?: Record<string, any>;
}

export interface AssignmentContext {
  context_id?: UUID;
  expires_at?: Date;
}

export interface PermissionContext {
  context_id?: UUID;
  resource_id?: string;
  [key: string]: any;
}

export interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
}

// ===== Extension模块导出 =====
export interface ExtensionModuleExports {
  extensionManagementService: ExtensionManagementService;
  extensionController: ExtensionController;
}

export interface ExtensionManagementService {
  installExtension(request: InstallExtensionRequest): Promise<OperationResult<Extension>>;
  enableExtension(extensionId: UUID): Promise<OperationResult<void>>;
  executeHook(hookType: string, context: HookContext, data?: any): Promise<HookExecutionResult[]>;
  getExtensionById(extensionId: UUID): Promise<OperationResult<Extension>>;
  queryExtensions(filter: ExtensionFilter): Promise<OperationResult<Extension[]>>;
}

export interface ExtensionController {
  installExtension(request: any): Promise<any>;
  getExtension(request: any): Promise<any>;
  enableExtension(request: any): Promise<any>;
}

export interface Extension {
  extension_id: UUID;
  name: string;
  version: string;
  description?: string;
  author: string;
  source: ExtensionSource;
  status: ExtensionStatus;
  config: Record<string, any>;
  dependencies: ExtensionDependency[];
  hooks: Hook[];
  permissions: string[];
  metadata: ExtensionMetadata;
  installed_at: Timestamp;
  updated_at: Timestamp;
}

export interface Hook {
  hook_id: UUID;
  extension_id: UUID;
  hook_type: string;
  handler: string;
  priority: number;
  conditions?: HookCondition[];
  is_active: boolean;
  execution_count: number;
  last_executed?: Timestamp;
  created_at: Timestamp;
}

export type ExtensionSource = 'npm' | 'git' | 'local' | 'marketplace';
export type ExtensionStatus = 'installing' | 'installed' | 'enabled' | 'disabled' | 'error' | 'updating' | 'uninstalling';

export interface InstallExtensionRequest {
  name: string;
  version: string;
  source: ExtensionSource;
  package_name?: string;
  repository_url?: string;
  local_path?: string;
  config?: Record<string, any>;
  dependencies?: ExtensionDependency[];
}

export interface ExtensionDependency {
  name: string;
  version: string;
  optional?: boolean;
}

export interface ExtensionMetadata {
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  compatibility: {
    mplp_version: string;
    node_version: string;
  };
  resources: {
    memory_limit?: number;
    cpu_limit?: number;
    disk_space?: number;
  };
}

export interface HookContext {
  execution_id: UUID;
  context_id?: UUID;
  user_id?: string;
  timestamp: Timestamp;
  data?: Record<string, any>;
}

export interface HookCondition {
  field: string;
  operator: string;
  value: any;
}

export interface HookExecutionResult {
  hook_id: UUID;
  success: boolean;
  data?: any;
  error?: string;
  execution_time: number;
}

export interface ExtensionFilter {
  name?: string;
  status?: ExtensionStatus[];
  source?: ExtensionSource[];
  author?: string;
}

// ===== Core模块导出 =====
export interface CoreModuleExports {
  orchestrator: CoreOrchestrator;
  workflowManager: WorkflowManager;
  moduleCoordinator: ModuleCoordinator;
}

export interface CoreOrchestrator {
  executeWorkflow(contextId: UUID, workflowConfig?: Partial<WorkflowConfiguration>): Promise<WorkflowExecutionResult>;
  getActiveExecutions(): ExecutionContext[];
  getModuleStatuses(): Map<ProtocolModule, ModuleStatus>;
  addEventListener(listener: (event: CoordinationEvent) => void): void;
}

export interface WorkflowManager {
  getTemplate(templateName: string): WorkflowConfiguration | undefined;
  createCustomWorkflow(stages: WorkflowStage[], options?: WorkflowOptions): WorkflowConfiguration;
  validateWorkflowConfiguration(config: WorkflowConfiguration): ValidationResult;
}

export interface ModuleCoordinator {
  checkModuleDependencies(): { satisfied: boolean; missing: ProtocolModule[] };
  getModuleHealthStatus(): Map<ProtocolModule, boolean>;
  getModuleInterface(moduleName: ProtocolModule): ModuleInterface | undefined;
}

export interface WorkflowConfiguration {
  stages: WorkflowStage[];
  parallel_execution?: boolean;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
  error_handling?: ErrorHandlingPolicy;
}

export interface WorkflowExecutionResult {
  execution_id: UUID;
  context_id: UUID;
  status: 'completed' | 'failed' | 'cancelled';
  stages: StageExecutionResult[];
  total_duration_ms: number;
  started_at: Timestamp;
  completed_at?: Timestamp;
  error?: Error;
}

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

export interface StageExecutionResult {
  stage: WorkflowStage;
  status: 'completed' | 'failed' | 'skipped';
  duration_ms: number;
  data?: any;
  error?: string;
}

export interface ModuleStatus {
  module_name: ProtocolModule;
  status: 'initialized' | 'running' | 'idle' | 'error';
  last_execution?: Timestamp;
  error_count: number;
  performance_metrics?: PerformanceMetrics;
}

export interface CoordinationEvent {
  event_id: UUID;
  event_type: 'stage_started' | 'stage_completed' | 'stage_failed' | 'workflow_completed' | 'workflow_failed';
  execution_id: UUID;
  stage?: WorkflowStage;
  data?: any;
  timestamp: Timestamp;
}

export interface RetryPolicy {
  max_attempts: number;
  delay_ms: number;
  backoff_multiplier?: number;
  retry_on_errors?: string[];
}

export interface ErrorHandlingPolicy {
  continue_on_error: boolean;
  rollback_on_failure: boolean;
  notification_enabled: boolean;
  error_threshold?: number;
}

export interface WorkflowOptions {
  parallel?: boolean;
  timeout_ms?: number;
  retry_policy?: Partial<RetryPolicy>;
  error_handling?: Partial<ErrorHandlingPolicy>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ModuleInterface {
  module_name: ProtocolModule;
  initialize(): Promise<void>;
  execute(context: any): Promise<any>;
  cleanup(): Promise<void>;
  getStatus(): ModuleStatus;
}

export interface PerformanceMetrics {
  averageExecutionTime: number;
  successRate: number;
  concurrentExecutions: number;
  bottlenecks: string[];
  stageMetrics: StageMetrics[];
}

export interface StageMetrics {
  name: string;
  averageTime: number;
  successRate: number;
  errorCount: number;
}

export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace';
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'core';
