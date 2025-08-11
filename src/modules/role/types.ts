/**
 * MPLP Role模块类型定义
 * 
 * @version v1.1.0
 * @created 2025-07-09T21:30:00+08:00
 * @updated 2025-08-13T01:45:00+08:00
 * @compliance mplp-role.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/development-standards.mdc - Schema驱动开发
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version };

// ===== Role协议主接口 (Schema根节点) =====

/**
 * Role协议主接口
 * 完全符合mplp-role.json Schema规范
 * @schema mplp-role.json
 */
export interface RoleProtocol {
  // Schema必需字段
  protocolVersion: Version;    // 协议版本
  timestamp: Timestamp;         // 消息时间戳
  roleId: UUID;                // 角色唯一标识符
  contextId: UUID;             // 关联的上下文ID
  name: string;                 // 角色名称
  roleType: RoleType;          // 角色类型
  status: RoleStatus;           // 角色状态
  permissions: Permission[];    // 权限列表
  
  // Schema可选字段
  displayName?: string;        // 角色显示名称
  description?: string;         // 角色描述
  scope?: RoleScope;            // 角色适用范围
  inheritance?: RoleInheritance; // 角色继承
  delegation?: RoleDelegation;  // 角色委托
  attributes?: RoleAttributes;  // 角色属性
  validationRules?: ValidationRules; // 验证规则
  auditSettings?: AuditSettings; // 审计设置

  // Agent管理相关字段 (Schema新增)
  agents?: Agent[];             // 管理的Agent列表
  agentManagement?: AgentManagement; // Agent管理配置
  teamConfiguration?: TeamConfiguration; // 团队配置
}

// ===== 基础枚举类型 (Schema定义) =====

/**
 * 角色类型 (Schema定义)
 * @schema role-protocol.json#/properties/role_type
 */
export type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';

/**
 * 角色状态 (Schema定义)
 * @schema role-protocol.json#/properties/status
 */
export type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';

/**
 * 权限操作 (Schema定义)
 * @schema role-protocol.json#/properties/permissions/items/properties/actions/items
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin';

/**
 * 权限授予类型 (Schema定义)
 * @schema role-protocol.json#/properties/permissions/items/properties/grant_type
 */
export type GrantType = 'direct' | 'inherited' | 'delegated' | 'temporary';

/**
 * 范围级别 (Schema定义)
 * @schema role-protocol.json#/properties/scope/properties/level
 */
export type ScopeLevel = 'global' | 'organization' | 'project' | 'team' | 'individual';

/**
 * 继承类型 (Schema定义)
 * @schema role-protocol.json#/properties/inheritance/properties/parent_roles/items/properties/inheritance_type
 */
export type InheritanceType = 'full' | 'partial' | 'conditional';

/**
 * 合并策略 (Schema定义)
 * @schema role-protocol.json#/properties/inheritance/properties/inheritance_rules/properties/merge_strategy
 */
export type MergeStrategy = 'union' | 'intersection' | 'priority' | 'custom';

/**
 * 冲突解决策略 (Schema定义)
 * @schema role-protocol.json#/properties/inheritance/properties/inheritance_rules/properties/conflict_resolution
 */
export type ConflictResolution = 'deny' | 'allow' | 'escalate' | 'most_restrictive' | 'least_restrictive';

/**
 * 资源类型 (Schema定义)
 * @schema role-protocol.json#/properties/permissions/items/properties/resource_type
 */
export type ResourceType = 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';

/**
 * 严重程度 (Schema定义)
 * @schema role-protocol.json#/properties/validation_rules/properties/separation_of_duties/items/properties/severity
 */
export type Severity = 'warning' | 'error' | 'critical';

/**
 * 审计事件类型 (Schema定义)
 * @schema role-protocol.json#/properties/audit_settings/properties/audit_events/items
 */
export type AuditEventType = 'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed';

// ===== 主要接口定义 (Schema组件) =====

/**
 * 资源约束 (Schema定义)
 * @schema role-protocol.json#/properties/scope/properties/resource_constraints
 */
export interface ResourceConstraints {
  max_contexts?: number;           // 最大上下文数量
  max_plans?: number;              // 最大计划数量
  allowed_resource_types?: string[]; // 允许的资源类型
}

/**
 * 权限定义 (Schema定义)
 * @schema role-protocol.json#/properties/permissions/items
 */
export interface Permission {
  permission_id: UUID;              // 权限ID
  resource_type: ResourceType;      // 资源类型
  resource_id: UUID | '*';          // 资源ID或通配符
  actions: PermissionAction[];      // 允许的操作
  conditions?: {                    // 条件限制
    time_based?: {                  // 基于时间的条件
      start_time?: Timestamp;       // 开始时间
      end_time?: Timestamp;         // 结束时间
      timezone?: string;            // 时区
      days_of_week?: number[];      // 星期几(0-6)
    };
    location_based?: {              // 基于位置的条件
      allowed_ip_ranges?: string[]; // 允许的IP范围
      geo_restrictions?: string[];  // 地理位置限制
    };
    context_based?: {               // 基于上下文的条件
      required_attributes?: Record<string, unknown>; // 必需属性
      forbidden_attributes?: Record<string, unknown>; // 禁止属性
    };
    approval_required?: {           // 需要审批的条件
      for_actions?: string[];       // 需要审批的操作
      approval_threshold?: number;  // 审批阈值
      approver_roles?: string[];    // 审批角色
    };
    custom_conditions?: Record<string, unknown>; // 自定义条件
    resource_state?: Record<string, unknown>;   // 资源状态条件
  };
  grant_type: GrantType;            // 授予类型
  expiry?: Timestamp;               // 过期时间
}

/**
 * 角色范围 (Schema定义)
 * @schema role-protocol.json#/properties/scope
 */
export interface RoleScope {
  level: ScopeLevel;                // 范围级别
  context_ids?: UUID[];             // 适用的上下文ID
  plan_ids?: UUID[];                // 适用的计划ID
  resource_constraints?: ResourceConstraints; // 资源约束
}

/**
 * 角色继承 (Schema定义)
 * @schema role-protocol.json#/properties/inheritance
 */
export interface RoleInheritance {
  parent_roles?: Array<{           // 父角色
    roleId: UUID;                 // 角色ID
    inheritance_type: InheritanceType; // 继承类型
    excluded_permissions?: UUID[]; // 排除的权限
    conditions?: Record<string, unknown>; // 条件
  }>;
  child_roles?: Array<{            // 子角色
    roleId: UUID;                 // 角色ID
    delegation_level: number;      // 委托级别
    can_further_delegate: boolean; // 是否可以进一步委托
  }>;
  inheritance_rules?: {            // 继承规则
    merge_strategy: MergeStrategy; // 合并策略
    conflict_resolution: ConflictResolution; // 冲突解决
    max_inheritance_depth?: number; // 最大继承深度
  };
}

/**
 * 委托约束 (Schema定义)
 * @schema role-protocol.json#/properties/delegation/properties/delegation_constraints
 */
export interface DelegationConstraints {
  max_delegation_depth?: number;   // 最大委托深度
  time_limit?: number;             // 时间限制(小时)
  require_approval?: boolean;      // 是否需要审批
  revocable?: boolean;             // 是否可撤销
}

/**
 * 活动委托 (Schema定义)
 * @schema role-protocol.json#/properties/delegation/properties/active_delegations/items
 */
export interface ActiveDelegation {
  delegation_id: UUID;             // 委托ID
  delegated_to: string;            // 委托给谁
  permissions: UUID[];             // 委托的权限
  start_time: Timestamp;           // 开始时间
  end_time?: Timestamp;            // 结束时间
  status: 'active' | 'suspended' | 'revoked' | 'expired'; // 状态
}

/**
 * 角色委托 (Schema定义)
 * @schema role-protocol.json#/properties/delegation
 */
export interface RoleDelegation {
  can_delegate: boolean;           // 是否可委托
  delegatable_permissions?: UUID[]; // 可委托的权限
  delegation_constraints?: DelegationConstraints; // 委托约束
  active_delegations?: ActiveDelegation[]; // 活动委托
}

/**
 * 安全级别 (Schema定义)
 * @schema role-protocol.json#/properties/attributes/properties/security_clearance
 */
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';

/**
 * 资历级别 (Schema定义)
 * @schema role-protocol.json#/properties/attributes/properties/seniority_level
 */
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

/**
 * 角色属性 (Schema定义)
 * @schema role-protocol.json#/properties/attributes
 */
export interface RoleAttributes {
  security_clearance?: SecurityClearance; // 安全级别
  department?: string;              // 部门
  seniority_level?: SeniorityLevel; // 资历级别
  certification_requirements?: Array<{ // 认证要求
    certification: string;          // 认证名称
    level: string;                  // 认证级别
    expiry?: Timestamp;             // 过期时间
    issuer?: string;                // 发证机构
  }>;
  custom_attributes?: Record<string, string | number | boolean>; // 自定义属性
}

/**
 * 验证规则 (Schema定义)
 * @schema role-protocol.json#/properties/validation_rules
 */
export interface ValidationRules {
  assignment_rules?: Array<{       // 分配规则
    rule_id: UUID;                 // 规则ID
    condition: string;             // 条件
    action: 'allow' | 'deny' | 'require_approval'; // 操作
    message?: string;              // 消息
  }>;
  separation_of_duties?: Array<{   // 职责分离
    conflicting_roles: UUID[];     // 冲突角色
    severity: Severity;            // 严重性
    exception_approval_required?: boolean; // 是否需要例外审批
  }>;
}

/**
 * 审计设置 (Schema定义)
 * @schema role-protocol.json#/properties/audit_settings
 */
export interface AuditSettings {
  audit_enabled: boolean;          // 是否启用审计
  audit_events?: AuditEventType[]; // 审计事件类型
  retention_period?: string;       // 保留期限
  compliance_frameworks?: string[]; // 合规框架
}

// ===== 请求和响应接口 =====

/**
 * 基础协议接口
 * 所有协议消息的基础
 */
export interface BaseProtocol {
  protocolVersion: Version;
  timestamp: Timestamp;
}

/**
 * 创建角色请求
 * @implementation 应用层接口，基于Schema定义
 */
export interface CreateRoleRequest {
  contextId: UUID;
  name: string;
  displayName?: string;
  description?: string;
  roleType: RoleType;
  scope?: RoleScope;
  permissions: Permission[];
  inheritance?: RoleInheritance;
  attributes?: RoleAttributes;
  validationRules?: ValidationRules;
  auditSettings?: AuditSettings;
}

/**
 * 更新角色请求
 * @implementation 应用层接口，基于Schema定义
 */
export interface UpdateRoleRequest {
  roleId: UUID;
  displayName?: string;
  description?: string;
  status?: RoleStatus;
  scope?: RoleScope;
  permissions?: Permission[];
  inheritance?: RoleInheritance;
  attributes?: RoleAttributes;
  validationRules?: ValidationRules;
  auditSettings?: AuditSettings;
}

/**
 * 角色过滤条件
 * @implementation 应用层接口，基于Schema定义
 */
export interface RoleFilter {
  contextId?: UUID;
  role_types?: RoleType[];
  status?: RoleStatus[];
  name_pattern?: string;
  has_permission?: {
    resource_type: ResourceType;
    action: PermissionAction;
  };
  created_after?: Timestamp;
  created_before?: Timestamp;
  security_clearance?: SecurityClearance;
  department?: string;
}

/**
 * 用户角色分配
 * @implementation 应用层接口，基于Schema定义
 */
export interface UserRoleAssignment {
  assignment_id: UUID;
  userId: string;
  roleId: UUID;
  contextId?: UUID;
  assigned_by: string;
  assigned_at: Timestamp;
  expires_at?: Timestamp;
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  conditions?: Record<string, unknown>;
}

/**
 * 权限检查请求
 * @implementation 应用层接口，基于Schema定义
 */
export interface PermissionCheckRequest {
  userId: string;
  resource_type: ResourceType;
  resource_id: string;
  action: PermissionAction;
  context?: Record<string, unknown>;
}

/**
 * 权限检查结果
 * @implementation 应用层接口，基于Schema定义
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matching_permissions?: string[];
  role_chain?: string[];
  conditions_met?: boolean;
  check_time_ms?: number;
  cache_hit?: boolean;
  roleId?: string;
  error?: string;
  execution_time_ms?: number;
}

/**
 * 批量权限检查请求
 * @implementation 应用层接口，基于Schema定义
 */
export interface BatchPermissionCheckRequest {
  userId: string;
  checks: Array<{
    resource_type: ResourceType;
    resource_id: string;
    action: PermissionAction;
  }>;
  context?: Record<string, unknown>;
  options?: {
    fail_fast?: boolean;
  };
}

/**
 * 批量权限检查结果
 * @implementation 应用层接口，基于Schema定义
 */
export interface BatchPermissionCheckResult {
  results: Array<PermissionCheckResult>;
  total_checks: number;
  summary: {
    total: number;
    permitted: number;
    denied: number;
    errors: number;
  };
  execution_time_ms?: number;
}

/**
 * 角色操作结果
 * @implementation 应用层接口，基于Schema定义
 */
export interface RoleOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ValidationError[];
  };
  execution_time_ms?: number;
}

/**
 * 验证错误
 * @implementation 应用层接口，基于Schema定义
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 角色事件
 * @implementation 应用层接口，基于Schema定义
 */
export interface RoleEvent {
  event_id: UUID;
  event_type: RoleEventType;
  roleId: UUID;
  contextId: UUID;
  actor_id: string;
  timestamp: Timestamp;
  details: Record<string, unknown>;
  severity: Severity;
}

/**
 * 角色事件类型
 * @implementation 应用层接口，基于Schema定义
 */
export type RoleEventType = 
  | 'role_created' 
  | 'role_updated' 
  | 'role_deleted' 
  | 'role_activated' 
  | 'role_deactivated' 
  | 'role_assigned' 
  | 'role_revoked' 
  | 'permission_added' 
  | 'permission_removed' 
  | 'permission_updated';

/**
 * 角色性能指标
 * @implementation 应用层接口，基于Schema定义
 */
export interface RolePerformanceMetrics {
  roleId?: string;
  period?: {
    start_time: string;
    end_time: string;
    duration_hours: number;
  };
  usage_stats?: {
    total_assignments: number;
    active_assignments: number;
    unique_users: number;
    avg_session_duration_minutes: number;
    most_used_permissions: string[];
  };
  permission_stats?: {
    total_permissions: number;
    permissions_used: number;
    permissions_unused: number;
    most_frequent_actions: string[];
    denied_attempts: number;
  };
  delegation_stats?: {
    total_delegations: number;
    active_delegations: number;
    expired_delegations: number;
    revoked_delegations: number;
    avg_delegation_duration_hours: number;
  };
  performance_stats?: {
    avg_permission_check_ms: number;
    max_permission_check_ms: number;
    cache_hit_rate: number;
    error_rate: number;
    total_operations: number;
  };
  compliance_stats?: {
    compliant_operations: number;
    non_compliant_operations: number;
    compliance_rate: number;
    policy_violations: number;
    audit_log_entries: number;
  };
  avg_permission_check_ms: number;
  avg_role_creation_ms: number;
  avg_role_query_ms: number;
  batch_permission_checks_per_second: number;
  cache_hit_ratio: number;
  active_users_count: number;
  active_roles_count: number;
  permission_check_avg_ms?: number;
  generated_at?: string;
}

/**
 * 用户会话统计
 * @implementation 应用层接口，基于Schema定义
 */
export interface UserSessionStats {
  userId: string;
  active_roles: number;
  permission_checks: number;
  last_activity: Timestamp;
  avg_response_time_ms: number;
}

/**
 * 角色配置
 * @implementation 应用层接口，基于Schema定义
 */
export interface RoleConfiguration {
  cache_enabled: boolean;
  cache_ttl_seconds: number;
  max_batch_size: number;
  max_inheritance_depth: number;
  max_delegation_depth: number;
  performance_monitoring: boolean;
  audit_enabled: boolean;
}

/**
 * 角色错误代码
 * @implementation 应用层接口，基于Schema定义
 */
export enum RoleErrorCode {
  INVALID_ROLE_DATA = 'ROLE-001',
  ROLE_NOT_FOUND = 'ROLE-002',
  ROLE_ALREADY_EXISTS = 'ROLE-003',
  INVALID_PERMISSION = 'ROLE-004',
  PERMISSION_DENIED = 'ROLE-005',
  ROLE_ASSIGNMENT_FAILED = 'ROLE-006',
  ROLE_REVOCATION_FAILED = 'ROLE-007',
  CIRCULAR_INHERITANCE = 'ROLE-008',
  INHERITANCE_DEPTH_EXCEEDED = 'ROLE-009',
  DELEGATION_DEPTH_EXCEEDED = 'ROLE-010',
  SEPARATION_OF_DUTIES_VIOLATION = 'ROLE-011',
  INTERNAL_ERROR = 'ROLE-999'
}

// ===== Agent管理相关类型定义 (Schema新增) =====

/**
 * Agent类型 (Schema定义)
 */
export type AgentType = 'core' | 'specialist' | 'stakeholder' | 'coordinator' | 'custom';

/**
 * Agent状态 (Schema定义)
 */
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance' | 'retired';

/**
 * 专业技能水平 (Schema定义)
 */
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

/**
 * 沟通风格 (Schema定义)
 */
export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'collaborative' | 'directive';

/**
 * 冲突解决策略 (Schema定义)
 */
export type ConflictResolutionStrategy = 'consensus' | 'majority' | 'authority' | 'compromise' | 'avoidance';

/**
 * 优先级类型 (Schema定义)
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 重试策略 (Schema定义)
 */
export interface RetryPolicy {
  max_retries: number;
  backoff_ms: number;
  backoff_multiplier?: number;
  max_backoff_ms?: number;
}

/**
 * Agent定义 (Schema定义)
 */
export interface Agent {
  agentId: UUID;
  name: string;
  type: AgentType;
  domain: string;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  configuration?: AgentConfiguration;
  performanceMetrics?: PerformanceMetrics;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
}

/**
 * Agent能力定义 (Schema定义)
 */
export interface AgentCapabilities {
  core: {
    critical_thinking: boolean;
    scenario_validation: boolean;
    ddsc_dialog: boolean;
    mplp_protocols: string[];
  };
  specialist: {
    domain: string;
    expertise_level: ExpertiseLevel;
    knowledge_areas: string[];
    tools?: string[];
  };
  collaboration: {
    communication_style: CommunicationStyle;
    conflict_resolution: ConflictResolutionStrategy;
    decision_weight: number;
    trust_level: number;
  };
  learning: {
    experience_accumulation: boolean;
    pattern_recognition: boolean;
    adaptation_mechanism: boolean;
    performance_optimization: boolean;
  };
}

/**
 * Agent配置 (Schema定义)
 */
export interface AgentConfiguration {
  basic: {
    max_concurrent_tasks: number;
    timeoutMs: number;
    retry_policy?: RetryPolicy;
    priority_level?: Priority;
  };
  communication: {
    protocols: string[];
    message_format: string;
    encryption_enabled?: boolean;
    compression_enabled?: boolean;
  };
  performance?: {
    cache_enabled?: boolean;
    batch_processing?: boolean;
    parallel_execution?: boolean;
    resource_limits?: {
      max_memory_mb?: number;
      max_cpu_percent?: number;
    };
  };
  security: {
    authentication_required: boolean;
    authorization_level?: string;
    audit_logging: boolean;
    data_encryption?: boolean;
  };
}

/**
 * 性能指标 (Schema定义)
 */
export interface PerformanceMetrics {
  response_time_ms?: number;
  throughput_ops_per_sec?: number;
  success_rate?: number;
  error_rate?: number;
  resource_utilization?: {
    cpu_percent?: number;
    memory_mb?: number;
    network_kb_per_sec?: number;
  };
  last_updated?: Timestamp;
}

/**
 * Agent管理配置 (Schema定义)
 */
export interface AgentManagement {
  max_agents?: number;
  auto_scaling?: boolean;
  load_balancing?: boolean;
  health_check_interval_ms?: number;
  default_agent_config?: AgentConfiguration;
}

/**
 * 团队配置 (Schema定义)
 */
export interface TeamConfiguration {
  max_team_size?: number;
  collaboration_rules?: CollaborationRule[];
  decisionMechanism?: DecisionMechanism;
}

/**
 * 协作规则 (Schema定义)
 */
export interface CollaborationRule {
  rule_name: string;
  rule_type: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
  rule_config?: Record<string, unknown>;
}

/**
 * 决策机制 (Schema定义)
 */
export interface DecisionMechanism {
  type: 'consensus' | 'majority' | 'weighted' | 'authority';
  threshold?: number;
  timeoutMs?: number;
}

// ===== Domain Services 类型定义 =====

/**
 * 验证结果接口
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
  metadata?: Record<string, unknown>;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * 冲突结果接口
 */
export interface ConflictResult {
  conflict_id: UUID;
  conflict_type: 'permission_overlap' | 'role_inheritance' | 'separation_of_duties' | 'resource_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_permissions: UUID[];
  affected_roles: UUID[];
  resolution_suggestions: string[];
  metadata?: Record<string, unknown>;
}

/**
 * 解析后的角色接口
 */
export interface ResolvedRole {
  roleId: UUID;
  name: string;
  effective_permissions: Permission[];
  inherited_from: UUID[];
  delegation_chain: UUID[];
  computed_at: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * Agent性能指标接口 (Domain Services专用)
 */
export interface AgentPerformanceMetrics {
  agent_id: UUID;
  measurement_period: {
    start_time: Timestamp;
    end_time: Timestamp;
    duration_ms: number;
  };
  performance_data: {
    response_time_avg_ms: number;
    response_time_max_ms: number;
    success_rate: number;
    error_rate: number;
    throughput_ops_per_second: number;
    resource_utilization: {
      cpu_usage_percent: number;
      memory_usage_mb: number;
      network_io_bytes: number;
    };
  };
  quality_metrics: {
    accuracy_score: number;
    completeness_score: number;
    consistency_score: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * 团队结果接口
 */
export interface TeamResult {
  team_id: UUID;
  configuration_applied: boolean;
  team_members: {
    agent_id: UUID;
    role_id: UUID;
    status: AgentStatus;
    assigned_at: Timestamp;
  }[];
  performance_baseline: AgentPerformanceMetrics[];
  collaboration_rules: CollaborationRule[];
  decision_mechanism: DecisionMechanism;
  metadata?: Record<string, unknown>;
}

/**
 * 决策请求接口
 */
export interface DecisionRequest {
  decision_id: UUID;
  context_id: UUID;
  decision_type: 'role_assignment' | 'permission_grant' | 'conflict_resolution' | 'resource_allocation';
  participants: UUID[];
  options: {
    option_id: UUID;
    description: string;
    impact_assessment: Record<string, unknown>;
    supporters: UUID[];
  }[];
  deadline?: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 决策结果接口
 */
export interface DecisionResult {
  decision_id: UUID;
  selected_option: UUID;
  decision_method: 'consensus' | 'majority' | 'weighted' | 'authority';
  voting_results: {
    participant_id: UUID;
    vote: UUID;
    weight?: number;
    timestamp: Timestamp;
  }[];
  execution_plan: {
    step_id: UUID;
    description: string;
    responsible_agent: UUID;
    deadline: Timestamp;
    dependencies: UUID[];
  }[];
  decided_at: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 审计事件接口
 */
export interface AuditEvent {
  event_id: UUID;
  event_type: 'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'role_assigned' | 'role_unassigned';
  actor_id: UUID;
  target_id: UUID;
  resource_type: ResourceType;
  timestamp: Timestamp;
  details: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  context_id?: UUID;
  session_id?: UUID;
  metadata?: Record<string, unknown>;
}

/**
 * 审计过滤器接口
 */
export interface AuditFilter {
  start_time?: Timestamp;
  end_time?: Timestamp;
  event_types?: string[];
  actor_ids?: UUID[];
  target_ids?: UUID[];
  resource_types?: ResourceType[];
  severity_levels?: string[];
  context_ids?: UUID[];
  limit?: number;
  offset?: number;
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  log_id: UUID;
  events: AuditEvent[];
  total_count: number;
  filtered_count: number;
  query_metadata: {
    filter_applied: AuditFilter;
    execution_time_ms: number;
    generated_at: Timestamp;
  };
  metadata?: Record<string, unknown>;
}

/**
 * 合规报告接口
 */
export interface ComplianceReport {
  report_id: UUID;
  framework: string;
  report_period: {
    start_time: Timestamp;
    end_time: Timestamp;
  };
  compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant';
  findings: {
    finding_id: UUID;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: AuditEvent[];
    recommendations: string[];
  }[];
  overall_score: number;
  generated_at: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * 异常结果接口
 */
export interface AnomalyResult {
  anomaly_id: UUID;
  anomaly_type: 'unusual_access_pattern' | 'privilege_escalation' | 'suspicious_timing' | 'resource_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_user: UUID;
  detection_time: Timestamp;
  evidence: {
    event_ids: UUID[];
    pattern_description: string;
    confidence_score: number;
  };
  recommended_actions: string[];
  metadata?: Record<string, unknown>;
}