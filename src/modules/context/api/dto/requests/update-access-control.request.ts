/**
 * 更新访问控制请求DTO
 * 
 * API层数据传输对象，用于更新Context的访问控制
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../../public/shared/types';

/**
 * 主体类型枚举（Schema格式）
 */
export enum PrincipalTypeSchema {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group'
}

/**
 * 操作类型枚举（Schema格式）
 */
export enum ActionSchema {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * 策略类型枚举（Schema格式）
 */
export enum PolicyTypeSchema {
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational'
}

/**
 * 策略执行模式枚举（Schema格式）
 */
export enum PolicyEnforcementSchema {
  STRICT = 'strict',
  ADVISORY = 'advisory',
  DISABLED = 'disabled'
}

/**
 * 所有者接口（Schema格式）
 */
export interface OwnerSchema {
  user_id: string;
  role: string;
}

/**
 * 权限接口（Schema格式）
 */
export interface PermissionSchema {
  principal: string;
  principal_type: PrincipalTypeSchema;
  resource: string;
  actions: ActionSchema[];
  conditions?: Record<string, unknown>;
}

/**
 * 策略规则接口（Schema格式）
 */
export interface PolicyRuleSchema {
  condition: string;
  action: string;
  effect: 'allow' | 'deny';
}

/**
 * 策略接口（Schema格式）
 */
export interface PolicySchema {
  id: UUID;
  name: string;
  type: PolicyTypeSchema;
  rules: PolicyRuleSchema[];
  enforcement: PolicyEnforcementSchema;
}

/**
 * 更新访问控制请求接口（Schema格式 - snake_case）
 */
export interface UpdateAccessControlRequest {
  /**
   * 所有者信息
   */
  owner?: OwnerSchema;

  /**
   * 权限列表
   */
  permissions?: PermissionSchema[];

  /**
   * 策略列表
   */
  policies?: PolicySchema[];
}

/**
 * 添加权限请求接口
 */
export interface AddPermissionRequest {
  /**
   * 权限配置
   */
  permission: PermissionSchema;
}

/**
 * 移除权限请求接口
 */
export interface RemovePermissionRequest {
  /**
   * 主体标识
   */
  principal: string;

  /**
   * 资源标识
   */
  resource: string;
}

/**
 * 添加策略请求接口
 */
export interface AddPolicyRequest {
  /**
   * 策略配置
   */
  policy: PolicySchema;
}

/**
 * 移除策略请求接口
 */
export interface RemovePolicyRequest {
  /**
   * 策略ID
   */
  policy_id: UUID;
}

/**
 * 检查权限请求接口
 */
export interface CheckPermissionRequest {
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
}

/**
 * 获取主体权限请求接口
 */
export interface GetPrincipalPermissionsRequest {
  /**
   * 主体标识
   */
  principal: string;
}

/**
 * 获取资源权限请求接口
 */
export interface GetResourcePermissionsRequest {
  /**
   * 资源标识
   */
  resource: string;
}

/**
 * 创建标准权限请求接口
 */
export interface CreateStandardPermissionRequest {
  /**
   * 主体标识
   */
  principal: string;

  /**
   * 主体类型
   */
  principal_type: PrincipalTypeSchema;

  /**
   * 资源标识
   */
  resource: string;

  /**
   * 操作列表
   */
  actions: ActionSchema[];

  /**
   * 条件配置
   */
  conditions?: Record<string, unknown>;
}

/**
 * 创建预设权限请求接口
 */
export interface CreatePresetPermissionRequest {
  /**
   * 主体标识
   */
  principal: string;

  /**
   * 主体类型
   */
  principal_type: PrincipalTypeSchema;

  /**
   * 资源标识
   */
  resource: string;

  /**
   * 权限类型：readonly, readwrite, admin
   */
  permission_type: 'readonly' | 'readwrite' | 'admin';
}
