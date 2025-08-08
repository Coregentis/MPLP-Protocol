/**
 * 访问控制响应DTO
 * 
 * API层数据传输对象，用于返回Context的访问控制信息
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../../public/shared/types';
import {
  OwnerSchema,
  PermissionSchema,
  PolicySchema,
  ActionSchema
} from '../requests/update-access-control.request';

/**
 * 访问控制响应接口（Schema格式 - snake_case）
 */
export interface AccessControlResponse {
  /**
   * 所有者信息
   */
  owner: OwnerSchema;

  /**
   * 权限列表
   */
  permissions: PermissionSchema[];

  /**
   * 策略列表
   */
  policies: PolicySchema[];
}

/**
 * 权限检查响应接口
 */
export interface PermissionCheckResponse {
  /**
   * 主体标识
   */
  principal: string;

  /**
   * 资源标识
   */
  resource: string;

  /**
   * 操作类型
   */
  action: ActionSchema;

  /**
   * 是否有权限
   */
  has_permission: boolean;

  /**
   * 权限来源
   */
  permission_source: 'owner' | 'explicit' | 'policy' | 'none';

  /**
   * 检查时间
   */
  checked_at: string;
}

/**
 * 主体权限响应接口
 */
export interface PrincipalPermissionsResponse {
  /**
   * 主体标识
   */
  principal: string;

  /**
   * 权限列表
   */
  permissions: PermissionSchema[];

  /**
   * 权限数量
   */
  permission_count: number;

  /**
   * 可访问资源列表
   */
  accessible_resources: string[];
}

/**
 * 资源权限响应接口
 */
export interface ResourcePermissionsResponse {
  /**
   * 资源标识
   */
  resource: string;

  /**
   * 权限列表
   */
  permissions: PermissionSchema[];

  /**
   * 权限数量
   */
  permission_count: number;

  /**
   * 有权限的主体列表
   */
  authorized_principals: string[];
}

/**
 * 权限摘要响应接口
 */
export interface PermissionSummaryResponse {
  /**
   * 总权限数
   */
  total_permissions: number;

  /**
   * 用户权限数
   */
  user_permissions: number;

  /**
   * 角色权限数
   */
  role_permissions: number;

  /**
   * 组权限数
   */
  group_permissions: number;

  /**
   * 按操作类型分组的权限数
   */
  permissions_by_action: Record<ActionSchema, number>;

  /**
   * 最近添加的权限
   */
  recent_permissions: PermissionSchema[];
}

/**
 * 策略摘要响应接口
 */
export interface PolicySummaryResponse {
  /**
   * 总策略数
   */
  total_policies: number;

  /**
   * 安全策略数
   */
  security_policies: number;

  /**
   * 合规策略数
   */
  compliance_policies: number;

  /**
   * 运营策略数
   */
  operational_policies: number;

  /**
   * 启用策略数
   */
  enabled_policies: number;

  /**
   * 禁用策略数
   */
  disabled_policies: number;

  /**
   * 最近添加的策略
   */
  recent_policies: PolicySchema[];
}

/**
 * 访问控制摘要响应接口
 */
export interface AccessControlSummaryResponse {
  /**
   * 所有者信息
   */
  owner: OwnerSchema;

  /**
   * 权限摘要
   */
  permission_summary: PermissionSummaryResponse;

  /**
   * 策略摘要
   */
  policy_summary: PolicySummaryResponse;

  /**
   * 最后更新时间
   */
  last_updated_at: string;
}

/**
 * 权限验证响应接口
 */
export interface PermissionValidationResponse {
  /**
   * 是否有效
   */
  is_valid: boolean;

  /**
   * 验证错误列表
   */
  validation_errors: string[];

  /**
   * 验证警告列表
   */
  validation_warnings: string[];

  /**
   * 建议改进
   */
  suggestions: string[];
}

/**
 * 策略验证响应接口
 */
export interface PolicyValidationResponse {
  /**
   * 是否有效
   */
  is_valid: boolean;

  /**
   * 验证错误列表
   */
  validation_errors: string[];

  /**
   * 验证警告列表
   */
  validation_warnings: string[];

  /**
   * 策略冲突
   */
  policy_conflicts: string[];

  /**
   * 建议改进
   */
  suggestions: string[];
}
