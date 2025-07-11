/**
 * MPLP Role模块类型定义
 * 
 * @version v1.0.1
 * @created 2025-07-09T21:30:00+08:00
 * @compliance 10/10 Schema合规性 - 完全匹配Schema定义
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version };

// ===== Role协议主接口 (Schema根节点) =====

/**
 * Role协议主接口
 * 完全符合role-protocol.json Schema规范
 */
export interface RoleProtocol {
  // Schema必需字段
  protocol_version: Version;
  timestamp: Timestamp;
  role_id: UUID;
  context_id: UUID;
  name: string;
  role_type: RoleType;
  status: RoleStatus;
  permissions: Permission[];
  
  // Schema可选字段
  display_name?: string;
  description?: string;
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
}

// ===== 基础枚举类型 (Schema定义) =====

/**
 * 角色类型 (Schema定义)
 */
export type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';

/**
 * 角色状态 (Schema定义)
 */
export type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';

/**
 * 优先级枚举 (Schema定义)
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// ===== 角色范围 (Schema定义) =====

/**
 * 角色范围 (Schema定义)
 */
export interface RoleScope {
  level: ScopeLevel;
  context_ids?: UUID[];
  plan_ids?: UUID[];
  resource_constraints?: ResourceConstraints;
}

/**
 * 范围级别 (Schema定义)
 */
export type ScopeLevel = 'global' | 'organization' | 'project' | 'team' | 'individual';

/**
 * 资源约束 (Schema定义)
 */
export interface ResourceConstraints {
  max_contexts?: number;
  max_plans?: number;
  allowed_resource_types?: string[];
}

// ===== 权限管理 (Schema定义) =====

/**
 * 权限 (Schema定义)
 */
export interface Permission {
  permission_id: UUID;
  resource_type: ResourceType;
  resource_id: UUID | '*';
  actions: PermissionAction[];
  conditions?: PermissionConditions;
  grant_type: GrantType;
  expiry?: Timestamp;
}

/**
 * 资源类型 (Schema定义)
 */
export type ResourceType = 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';

/**
 * 权限操作 (Schema定义)
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin';

/**
 * 权限条件 (Schema定义)
 */
export interface PermissionConditions {
  time_based?: TimeBased;
  location_based?: LocationBased;
  context_based?: ContextBased;
  approval_required?: ApprovalRequired;
}

/**
 * 时间限制 (Schema定义)
 */
export interface TimeBased {
  start_time?: string;
  end_time?: string;
  timezone?: string;
  days_of_week?: number[];
}

/**
 * 位置限制 (Schema定义)
 */
export interface LocationBased {
  allowed_ip_ranges?: string[];
  geo_restrictions?: string[];
}

/**
 * 上下文限制 (Schema定义)
 */
export interface ContextBased {
  required_attributes?: Record<string, unknown>;
  forbidden_attributes?: Record<string, unknown>;
}

/**
 * 审批要求 (Schema定义)
 */
export interface ApprovalRequired {
  for_actions?: string[];
  approval_threshold?: number;
  approver_roles?: string[];
}

/**
 * 授权类型 (Schema定义)
 */
export type GrantType = 'direct' | 'inherited' | 'delegated' | 'temporary';

// ===== 角色继承 (Schema定义) =====

/**
 * 角色继承 (Schema定义)
 */
export interface RoleInheritance {
  parent_roles?: ParentRole[];
  child_roles?: ChildRole[];
  inheritance_rules?: InheritanceRules;
}

/**
 * 父角色 (Schema定义)
 */
export interface ParentRole {
  role_id: UUID;
  inheritance_type: InheritanceType;
  excluded_permissions?: UUID[];
  conditions?: Record<string, unknown>;
}

/**
 * 子角色 (Schema定义)
 */
export interface ChildRole {
  role_id: UUID;
  delegation_level: number;
  can_further_delegate?: boolean;
}

/**
 * 继承规则 (Schema定义)
 */
export interface InheritanceRules {
  merge_strategy: MergeStrategy;
  conflict_resolution: ConflictResolution;
  max_inheritance_depth?: number;
}

/**
 * 继承类型 (Schema定义)
 */
export type InheritanceType = 'full' | 'partial' | 'conditional';

/**
 * 合并策略 (Schema定义)
 */
export type MergeStrategy = 'union' | 'intersection' | 'priority' | 'custom';

/**
 * 冲突解决 (Schema定义)
 */
export type ConflictResolution = 'deny' | 'allow' | 'escalate' | 'most_restrictive' | 'least_restrictive';

// ===== 角色委派 (Schema定义) =====

/**
 * 角色委派 (Schema定义)
 */
export interface RoleDelegation {
  can_delegate: boolean;
  delegatable_permissions?: UUID[];
  delegation_constraints?: DelegationConstraints;
  active_delegations?: ActiveDelegation[];
}

/**
 * 委派约束 (Schema定义)
 */
export interface DelegationConstraints {
  max_delegation_depth?: number;
  time_limit?: number;
  require_approval?: boolean;
  revocable?: boolean;
}

/**
 * 活跃委派 (Schema定义)
 */
export interface ActiveDelegation {
  delegation_id: UUID;
  delegated_to: string;
  permissions: UUID[];
  start_time: Timestamp;
  end_time?: Timestamp;
  status: DelegationStatus;
}

/**
 * 委派状态 (Schema定义)
 */
export type DelegationStatus = 'active' | 'suspended' | 'revoked' | 'expired';

// ===== 角色属性 (Schema定义) =====

/**
 * 角色属性 (Schema定义)
 */
export interface RoleAttributes {
  security_clearance?: SecurityClearance;
  department?: string;
  seniority_level?: SeniorityLevel;
  certification_requirements?: CertificationRequirement[];
  custom_attributes?: Record<string, string | number | boolean>;
}

/**
 * 安全级别 (Schema定义)
 */
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';

/**
 * 资历级别 (Schema定义)
 */
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';

/**
 * 认证要求 (Schema定义)
 */
export interface CertificationRequirement {
  certification: string;
  level: string;
  expiry?: Timestamp;
  issuer?: string;
}

// ===== 验证规则 (Schema定义) =====

/**
 * 验证规则 (Schema定义)
 */
export interface ValidationRules {
  assignment_rules?: AssignmentRule[];
  separation_of_duties?: SeparationOfDuty[];
}

/**
 * 分配规则 (Schema定义)
 */
export interface AssignmentRule {
  rule_id: UUID;
  condition: string;
  action: AssignmentAction;
  message?: string;
}

/**
 * 分配动作 (Schema定义)
 */
export type AssignmentAction = 'allow' | 'deny' | 'require_approval';

/**
 * 职责分离 (Schema定义)
 */
export interface SeparationOfDuty {
  conflicting_roles: UUID[];
  severity: Severity;
  exception_approval_required?: boolean;
}

/**
 * 严重性 (Schema定义)
 */
export type Severity = 'warning' | 'error' | 'critical';

// ===== 审计设置 (Schema定义) =====

/**
 * 审计设置 (Schema定义)
 */
export interface AuditSettings {
  audit_enabled: boolean;
  audit_events?: AuditEventType[];
  retention_period?: string;
  compliance_frameworks?: string[];
}

/**
 * 审计事件类型 (Schema定义)
 */
export type AuditEventType = 'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed';

// ===== 请求和响应接口 =====

/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
  context_id: UUID;
  name: string;
  display_name?: string;
  description?: string;
  role_type: RoleType;
  scope: RoleScope;
  permissions: Partial<Permission>[];
  inheritance?: Partial<RoleInheritance>;
  attributes?: Partial<RoleAttributes>;
  validation_rules?: Partial<ValidationRules>;
  audit_settings?: Partial<AuditSettings>;
}

/**
 * 更新角色请求
 */
export interface UpdateRoleRequest {
  role_id: UUID;
  display_name?: string;
  description?: string;
  status?: RoleStatus;
  scope?: Partial<RoleScope>;
  permissions?: Partial<Permission>[];
  inheritance?: Partial<RoleInheritance>;
  attributes?: Partial<RoleAttributes>;
  validation_rules?: Partial<ValidationRules>;
  audit_settings?: Partial<AuditSettings>;
}

/**
 * 角色过滤器
 */
export interface RoleFilter {
  role_ids?: UUID[];
  context_ids?: UUID[];
  names?: string[];
  role_types?: RoleType[];
  statuses?: RoleStatus[];
  scope_levels?: ScopeLevel[];
  created_after?: Timestamp;
  created_before?: Timestamp;
  has_permissions?: PermissionAction[];
}

/**
 * 角色操作结果
 */
export interface RoleOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  execution_time_ms?: number;
}

/**
 * 角色配置
 */
export interface RoleConfiguration {
  inheritance_enabled: boolean;
  delegation_enabled: boolean;
  security_policies_enabled: boolean;
  compliance_tracking_enabled: boolean;
  audit_logging_enabled: boolean;
  cache_settings: {
    enabled: boolean;
    ttl_seconds: number;
    max_entries: number;
  };
  permission_settings: {
    default_grant_type: GrantType;
    require_explicit_deny: boolean;
    cascade_revocation: boolean;
  };
  delegation_settings: {
    max_delegation_depth: number;
    require_approval: boolean;
    auto_expire_hours: number;
  };
}

/**
 * 角色错误代码
 */
export enum RoleErrorCode {
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_ALREADY_EXISTS = 'ROLE_ALREADY_EXISTS',
  INVALID_ROLE_DATA = 'INVALID_ROLE_DATA',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INHERITANCE_CYCLE_DETECTED = 'INHERITANCE_CYCLE_DETECTED',
  DELEGATION_NOT_ALLOWED = 'DELEGATION_NOT_ALLOWED',
  DELEGATION_EXPIRED = 'DELEGATION_EXPIRED',
  SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',
  COMPLIANCE_REQUIREMENT_FAILED = 'COMPLIANCE_REQUIREMENT_FAILED',
  AUDIT_LOG_FAILURE = 'AUDIT_LOG_FAILURE',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * 权限检查请求
 */
export interface PermissionCheckRequest {
  user_id: UUID;
  resource_type: ResourceType;
  resource_id: UUID | '*';
  action: PermissionAction;
  context_id?: UUID;
  check_inheritance?: boolean;
  additional_context?: Record<string, unknown>;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  matching_permissions?: UUID[];
  role_chain?: UUID[];
  applied_roles?: UUID[];
  applied_permissions?: UUID[];
  conditions_met?: boolean;
  expiry?: Timestamp;
  check_time_ms?: number;
  cache_hit?: boolean;
}

/**
 * 批量权限检查请求
 */
export interface BatchPermissionCheckRequest {
  checks: PermissionCheckRequest[];
  options?: {
    fail_fast?: boolean;
    include_details?: boolean;
    timeout_ms?: number;
  };
}

/**
 * 批量权限检查结果
 */
export interface BatchPermissionCheckResult {
  results: PermissionCheckResult[];
  total_checks: number;
  summary: {
    total: number;
    permitted: number;
    denied: number;
    errors: number;
  };
  execution_time_ms: number;
}

/**
 * 用户角色分配
 */
export interface UserRoleAssignment {
  assignment_id: UUID;
  user_id: UUID;
  role_id: UUID;
  context_id?: UUID;
  assigned_by: UUID;
  assigned_at: Timestamp;
  expires_at?: Timestamp;
  status: AssignmentStatus;
  conditions?: AssignmentConditions;
  metadata?: AssignmentMetadata;
}

/**
 * 分配状态
 */
export type AssignmentStatus = 'active' | 'suspended' | 'expired' | 'revoked';

/**
 * 分配条件
 */
export interface AssignmentConditions {
  time_based?: TimeBased;
  location_based?: LocationBased;
  approval_required?: boolean;
  auto_expire?: boolean;
}

/**
 * 分配元数据
 */
export interface AssignmentMetadata {
  reason?: string;
  approval_reference?: UUID;
  approval_chain?: UUID[];
  cost_center?: string;
  department?: string;
  project_id?: UUID;
  notes?: string;
}

/**
 * 角色性能指标
 */
export interface RolePerformanceMetrics {
  role_id: UUID;
  context_id?: UUID;
  period: MetricsPeriod;
  usage_stats: UsageStats;
  permission_stats: PermissionStats;
  delegation_stats: DelegationStats;
  performance_stats: PerformanceStats;
  compliance_stats: ComplianceStats;
  permission_check_avg_ms: number;
  generated_at: Timestamp;
}

/**
 * 指标周期
 */
export interface MetricsPeriod {
  start_time: Timestamp;
  end_time: Timestamp;
  duration_hours: number;
}

/**
 * 使用统计
 */
export interface UsageStats {
  total_assignments: number;
  active_assignments: number;
  unique_users: number;
  avg_session_duration_minutes: number;
  most_used_permissions: string[];
}

/**
 * 权限统计
 */
export interface PermissionStats {
  total_permissions: number;
  permissions_used: number;
  permissions_unused: number;
  most_frequent_actions: PermissionAction[];
  denied_attempts: number;
}

/**
 * 委派统计
 */
export interface DelegationStats {
  total_delegations: number;
  active_delegations: number;
  expired_delegations: number;
  revoked_delegations: number;
  avg_delegation_duration_hours: number;
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  avg_permission_check_ms: number;
  max_permission_check_ms: number;
  cache_hit_rate: number;
  error_rate: number;
  total_operations: number;
}

/**
 * 合规统计
 */
export interface ComplianceStats {
  compliant_operations: number;
  non_compliant_operations: number;
  compliance_rate: number;
  policy_violations: number;
  audit_log_entries: number;
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 角色事件
 */
export interface RoleEvent {
  event_id: UUID;
  event_type: RoleEventType;
  role_id: UUID;
  user_id?: UUID;
  context_id?: UUID;
  actor_id?: string;
  timestamp: Timestamp;
  details: Record<string, unknown>;
  severity: Severity;
}

/**
 * 角色事件类型
 */
export type RoleEventType = 
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'role_assigned'
  | 'role_unassigned'
  | 'permission_granted'
  | 'permission_revoked'
  | 'delegation_created'
  | 'delegation_expired'
  | 'policy_violation'
  | 'compliance_check';

/**
 * 用户会话统计
 */
export interface UserSessionStats {
  user_id: UUID;
  total_sessions: number;
  avg_session_duration_minutes: number;
  last_login: Timestamp;
  last_activity: Timestamp;
  failed_login_attempts: number;
  roles_used: UUID[];
  permissions_exercised: number;
}

/**
 * 基础协议接口
 */
export interface BaseProtocol {
  protocol_version: Version;
  timestamp: Timestamp;
}

/**
 * 角色模块常量
 */
export const ROLE_CONSTANTS = {
  PROTOCOL_VERSION: '1.0.1',
  MAX_INHERITANCE_DEPTH: 10,
  MAX_DELEGATION_DEPTH: 5,
  DEFAULT_EXPIRY_DAYS: 90
} as const; 