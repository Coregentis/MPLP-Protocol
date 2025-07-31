/**
 * MPLP Role Types - Role模块类型定义
 * 
 * 提供Role模块相关的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

import { UUID, Timestamp } from './index';

// ===== Role基础类型 =====

/**
 * 角色类型枚举
 */
export type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';

/**
 * 角色状态枚举
 */
export type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';

/**
 * 权限动作枚举
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'manage';

/**
 * 资源类型枚举
 */
export type ResourceType = 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';

/**
 * 严重程度枚举
 */
export type Severity = 'warning' | 'error' | 'critical';

/**
 * 审计事件类型枚举
 */
export type AuditEventType = 'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed';

/**
 * 角色范围枚举
 */
export type RoleScope = 'global' | 'organization' | 'project' | 'context' | 'local';

/**
 * 委托状态枚举
 */
export type DelegationStatus = 'active' | 'expired' | 'revoked' | 'pending';

// ===== Role接口定义 =====

/**
 * Role创建请求
 */
export interface CreateRoleRequest {
  name: string;
  role_type: RoleType;
  display_name?: string;
  description?: string;
  scope?: RoleScope;
  permissions?: RolePermissionData[];
  metadata?: Record<string, any>;
}

/**
 * Role更新请求
 */
export interface UpdateRoleRequest {
  name?: string;
  display_name?: string;
  description?: string;
  status?: RoleStatus;
  scope?: RoleScope;
  permissions?: RolePermissionData[];
  metadata?: Record<string, any>;
}

/**
 * Role查询参数
 */
export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role_type?: RoleType;
  status?: RoleStatus;
  scope?: RoleScope;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Role数据接口
 */
export interface RoleData {
  role_id: UUID;
  name: string;
  role_type: RoleType;
  display_name?: string;
  description?: string;
  status: RoleStatus;
  scope: RoleScope;
  permissions: RolePermissionData[];
  inheritance?: RoleInheritanceData;
  delegation?: RoleDelegationData;
  attributes?: RoleAttributesData;
  validation_rules?: ValidationRulesData;
  audit_settings?: AuditSettingsData;
  created_at: Timestamp;
  updated_at: Timestamp;
  metadata?: Record<string, any>;
}

/**
 * 权限数据接口
 */
export interface RolePermissionData {
  permission_id: UUID;
  resource_type: ResourceType;
  resource_id?: UUID;
  actions: PermissionAction[];
  conditions?: Record<string, any>;
  granted_at: Timestamp;
  expires_at?: Timestamp;
  metadata?: Record<string, any>;
}

/**
 * 角色继承数据接口
 */
export interface RoleInheritanceData {
  parent_roles: UUID[];
  child_roles: UUID[];
  inheritance_rules?: {
    inherit_permissions: boolean;
    inherit_attributes: boolean;
    override_allowed: boolean;
  };
}

/**
 * 角色委托数据接口
 */
export interface RoleDelegationData {
  delegations: {
    delegation_id: UUID;
    delegated_to: UUID;
    delegated_by: UUID;
    permissions: PermissionAction[];
    start_date: Timestamp;
    end_date?: Timestamp;
    status: DelegationStatus;
    conditions?: Record<string, any>;
  }[];
}

/**
 * 角色属性数据接口
 */
export interface RoleAttributesData {
  attributes: Record<string, any>;
  constraints?: {
    max_concurrent_sessions?: number;
    allowed_ip_ranges?: string[];
    time_restrictions?: {
      start_time: string;
      end_time: string;
      days_of_week: number[];
    };
  };
}

/**
 * 验证规则数据接口
 */
export interface ValidationRulesData {
  separation_of_duties?: {
    conflicting_roles: UUID[];
    severity: Severity;
    description: string;
  }[];
  approval_requirements?: {
    required_approvers: number;
    approver_roles: UUID[];
    approval_timeout_hours?: number;
  };
  access_controls?: {
    require_mfa: boolean;
    session_timeout_minutes?: number;
    max_failed_attempts?: number;
  };
}

/**
 * 审计设置数据接口
 */
export interface AuditSettingsData {
  audit_enabled: boolean;
  audit_events: AuditEventType[];
  retention_days?: number;
  audit_level: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * 角色分配请求
 */
export interface AssignRoleRequest {
  user_id: UUID;
  role_id: UUID;
  assigned_by: UUID;
  start_date?: Timestamp;
  end_date?: Timestamp;
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 角色分配数据接口
 */
export interface RoleAssignmentData {
  assignment_id: UUID;
  user_id: UUID;
  role_id: UUID;
  assigned_by: UUID;
  assigned_at: Timestamp;
  start_date?: Timestamp;
  end_date?: Timestamp;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 权限检查请求
 */
export interface PermissionCheckRequest {
  user_id: UUID;
  resource_type: ResourceType;
  resource_id?: UUID;
  action: PermissionAction;
  context?: Record<string, any>;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  applicable_roles: UUID[];
  conditions_met: boolean;
  audit_trail?: {
    check_id: UUID;
    timestamp: Timestamp;
    result: boolean;
    details: Record<string, any>;
  };
}

/**
 * 角色统计数据接口
 */
export interface RoleStatistics {
  total_roles: number;
  active_roles: number;
  inactive_roles: number;
  roles_by_type: Record<RoleType, number>;
  total_assignments: number;
  active_assignments: number;
  expired_assignments: number;
  permission_usage: Record<PermissionAction, number>;
}
