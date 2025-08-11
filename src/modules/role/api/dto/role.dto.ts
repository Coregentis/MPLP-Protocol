/**
 * Role模块DTO定义
 * 
 * 数据传输对象，用于API层的数据交换
 * 符合MPLP模块标准化规范
 * 
 * @version 1.0.0
 * @created 2025-08-09
 * @compliance MPLP模块标准化规范 - 统一DTO标准
 */

import { 
  RoleType, 
  RoleStatus, 
  Permission,
  RoleScope,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  ValidationRules,
  AuditSettings
} from '../../types';

// ===== 请求DTO (Schema格式 - snake_case) =====

/**
 * 创建角色请求DTO
 * 使用snake_case命名，符合Schema层约定
 */
export interface CreateRoleDto {
  context_id: string;
  name: string;
  role_type: RoleType;
  display_name?: string;
  description?: string;
  permissions?: Permission[];
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
}

/**
 * 更新角色请求DTO
 */
export interface UpdateRoleDto {
  name?: string;
  display_name?: string;
  description?: string;
  status?: RoleStatus;
  permissions?: Permission[];
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
}

/**
 * 角色查询请求DTO
 */
export interface QueryRolesDto {
  context_id?: string;
  role_type?: RoleType;
  status?: RoleStatus;
  name_pattern?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 角色分配请求DTO
 */
export interface AssignRoleDto {
  user_id: string;
  role_id: string;
  assignment_type: 'direct' | 'inherited' | 'delegated' | 'temporary';
  valid_from?: string;
  valid_to?: string;
  conditions?: Record<string, unknown>;
}

/**
 * 权限检查请求DTO
 */
export interface CheckPermissionDto {
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  context?: Record<string, unknown>;
}

// ===== 响应DTO (Schema格式 - snake_case) =====

/**
 * 角色响应DTO
 * 完整的角色信息，用于API响应
 */
export interface RoleResponseDto {
  protocol_version: string;
  timestamp: string;
  role_id: string;
  context_id: string;
  name: string;
  role_type: RoleType;
  status: RoleStatus;
  permissions: Permission[];
  display_name?: string;
  description?: string;
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
  agents?: unknown[];
  agent_management?: Record<string, unknown>;
  team_configuration?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * 角色列表响应DTO
 */
export interface RoleListResponseDto {
  roles: RoleResponseDto[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * 权限检查响应DTO
 */
export interface PermissionCheckResponseDto {
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  allowed: boolean;
  reason?: string;
  conditions_met?: boolean;
  effective_permissions?: Permission[];
  checked_at: string;
}

/**
 * 角色分配响应DTO
 */
export interface RoleAssignmentResponseDto {
  assignment_id: string;
  user_id: string;
  role_id: string;
  assignment_type: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  assigned_at: string;
  assigned_by: string;
  valid_from?: string;
  valid_to?: string;
  conditions?: Record<string, unknown>;
}

// ===== 通用响应DTO =====

/**
 * 操作结果DTO
 */
export interface OperationResultDto {
  success: boolean;
  data?: RoleResponseDto;
  error?: string;
  warnings?: string[];
  timestamp: string;
  request_id?: string;
}

/**
 * 权限检查结果DTO
 */
export interface PermissionCheckResultDto {
  has_permission: boolean;
  reason?: string;
  checked_at: string;
}

/**
 * 分页参数DTO
 */
export interface PaginationDto {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页响应DTO
 */
export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ===== Agent管理相关DTO =====

/**
 * Agent创建请求DTO
 */
export interface CreateAgentDto {
  role_id: string;
  agent_name: string;
  agent_type: 'core' | 'specialist' | 'stakeholder' | 'coordinator' | 'custom';
  domain: string;
  capabilities: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

/**
 * Agent响应DTO
 */
export interface AgentResponseDto {
  agent_id: string;
  role_id: string;
  name: string;
  type: string;
  domain: string;
  status: string;
  capabilities: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * 团队配置DTO
 */
export interface TeamConfigurationDto {
  role_id: string;
  max_team_size: number;
  collaboration_rules: Array<{
    rule_name: string;
    rule_type: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
    rule_config: Record<string, unknown>;
  }>;
  decision_mechanism: {
    type: 'consensus' | 'majority' | 'weighted' | 'authority';
    threshold?: number;
    timeout_ms?: number;
  };
}

// ===== 审计相关DTO =====

/**
 * 审计日志查询DTO
 */
export interface AuditLogQueryDto {
  user_id?: string;
  role_id?: string;
  action_types?: string[];
  resource_types?: string[];
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

/**
 * 审计日志响应DTO
 */
export interface AuditLogResponseDto {
  log_id: string;
  user_id: string;
  role_id?: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  action_details: Record<string, unknown>;
  result: 'success' | 'failure' | 'partial';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}
