/**
 * Role仓库接口
 * 
 * 定义角色数据访问的领域接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Role } from '../entities/role.entity';
import { RoleType, RoleStatus, ResourceType, PermissionAction } from '../../types';

/**
 * 角色查询过滤器
 */
export interface RoleFilter {
  context_id?: UUID;
  role_type?: RoleType;
  status?: RoleStatus;
  name_pattern?: string;
  has_permission?: {
    resource_type: ResourceType;
    resource_id?: UUID | '*';
    action: PermissionAction;
  };
  scope_level?: string;
  created_after?: string;
  created_before?: string;
}

/**
 * 分页参数
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Role仓库接口
 */
export interface IRoleRepository {
  /**
   * 保存角色
   */
  save(role: Role): Promise<void>;

  /**
   * 根据ID查找角色
   */
  findById(roleId: UUID): Promise<Role | null>;

  /**
   * 根据名称查找角色
   */
  findByName(name: string, contextId?: UUID): Promise<Role | null>;

  /**
   * 根据上下文ID查找角色列表
   */
  findByContextId(contextId: UUID): Promise<Role[]>;

  /**
   * 根据过滤器查找角色列表
   */
  findByFilter(filter: RoleFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Role>>;

  /**
   * 查找具有特定权限的角色
   */
  findByPermission(resourceType: ResourceType, action: PermissionAction, resourceId?: UUID): Promise<Role[]>;

  /**
   * 查找活跃角色
   */
  findActiveRoles(contextId?: UUID): Promise<Role[]>;

  /**
   * 更新角色
   */
  update(role: Role): Promise<void>;

  /**
   * 删除角色
   */
  delete(roleId: UUID): Promise<void>;

  /**
   * 检查角色是否存在
   */
  exists(roleId: UUID): Promise<boolean>;

  /**
   * 检查角色名称是否唯一
   */
  isNameUnique(name: string, contextId: UUID, excludeRoleId?: UUID): Promise<boolean>;

  /**
   * 获取角色统计信息
   */
  getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_type: Record<RoleType, number>;
    by_status: Record<RoleStatus, number>;
    active_count: number;
  }>;
}
