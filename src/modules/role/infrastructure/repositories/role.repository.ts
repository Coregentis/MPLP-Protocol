/**
 * Role仓库实现
 * 
 * 基础设施层的数据访问实现
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Role } from '../../domain/entities/role.entity';
import { 
  IRoleRepository, 
  RoleFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/repositories/role-repository.interface';
import { RoleType, RoleStatus, ResourceType, PermissionAction } from '../../types';

/**
 * Role仓库实现
 * 
 * 注意：这是一个内存实现，生产环境中应该使用真实的数据库实现
 */
export class RoleRepository implements IRoleRepository {
  private roles: Map<UUID, Role> = new Map();

  /**
   * 保存角色
   */
  async save(role: Role): Promise<void> {
    this.roles.set(role.roleId, role);
  }

  /**
   * 根据ID查找角色
   */
  async findById(roleId: UUID): Promise<Role | null> {
    return this.roles.get(roleId) || null;
  }

  /**
   * 根据名称查找角色
   */
  async findByName(name: string, contextId?: UUID): Promise<Role | null> {
    for (const role of this.roles.values()) {
      if (role.name === name && (!contextId || role.contextId === contextId)) {
        return role;
      }
    }
    return null;
  }

  /**
   * 根据上下文ID查找角色列表
   */
  async findByContextId(contextId: UUID): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(role => role.contextId === contextId);
  }

  /**
   * 根据过滤器查找角色列表
   */
  async findByFilter(
    filter: RoleFilter, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Role>> {
    let results = Array.from(this.roles.values());

    // 应用过滤器
    if (filter.contextId) {
      results = results.filter(role => role.contextId === filter.contextId);
    }

    if (filter.roleType) {
      results = results.filter(role => role.roleType === filter.roleType);
    }

    if (filter.status) {
      results = results.filter(role => role.status === filter.status);
    }

    if (filter.name_pattern) {
      const pattern = new RegExp(filter.name_pattern, 'i');
      results = results.filter(role => 
        pattern.test(role.name) || 
        (role.displayName && pattern.test(role.displayName))
      );
    }

    if (filter.has_permission) {
      const { resource_type, resource_id, action } = filter.has_permission;
      results = results.filter(role => 
        role.hasPermission(resource_type, resource_id || '*', action)
      );
    }

    if (filter.created_after) {
      results = results.filter(role => role.createdAt >= filter.created_after!);
    }

    if (filter.created_before) {
      results = results.filter(role => role.createdAt <= filter.created_before!);
    }

    // 排序
    if (pagination?.sort_by) {
      results.sort((a, b) => {
        const aValue = this.getPropertyValue(a, pagination.sort_by!);
        const bValue = this.getPropertyValue(b, pagination.sort_by!);
        
        if (pagination.sort_order === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // 分页
    const total = results.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;
    
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      items: paginatedResults,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  /**
   * 查找具有特定权限的角色
   */
  async findByPermission(
    resourceType: ResourceType, 
    action: PermissionAction, 
    resourceId?: UUID
  ): Promise<Role[]> {
    return Array.from(this.roles.values())
      .filter(role => role.hasPermission(resourceType, resourceId || '*', action));
  }

  /**
   * 查找活跃角色
   */
  async findActiveRoles(contextId?: UUID): Promise<Role[]> {
    let results = Array.from(this.roles.values())
      .filter(role => role.isActive());

    if (contextId) {
      results = results.filter(role => role.contextId === contextId);
    }

    return results;
  }

  /**
   * 更新角色
   */
  async update(role: Role): Promise<void> {
    this.roles.set(role.roleId, role);
  }

  /**
   * 删除角色
   */
  async delete(roleId: UUID): Promise<void> {
    this.roles.delete(roleId);
  }

  /**
   * 检查角色是否存在
   */
  async exists(roleId: UUID): Promise<boolean> {
    return this.roles.has(roleId);
  }

  /**
   * 检查角色名称是否唯一
   */
  async isNameUnique(name: string, contextId: UUID, excludeRoleId?: UUID): Promise<boolean> {
    for (const role of this.roles.values()) {
      if (role.name === name && 
          role.contextId === contextId && 
          role.roleId !== excludeRoleId) {
        return false;
      }
    }
    return true;
  }

  /**
   * 获取角色统计信息
   */
  async getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_type: Record<RoleType, number>;
    by_status: Record<RoleStatus, number>;
    active_count: number;
  }> {
    let roles = Array.from(this.roles.values());
    
    if (contextId) {
      roles = roles.filter(role => role.contextId === contextId);
    }

    const total = roles.length;
    const active_count = roles.filter(role => role.isActive()).length;
    
    const by_type = roles.reduce((acc, role) => {
      acc[role.roleType] = (acc[role.roleType] || 0) + 1;
      return acc;
    }, {} as Record<RoleType, number>);

    const by_status = roles.reduce((acc, role) => {
      acc[role.status] = (acc[role.status] || 0) + 1;
      return acc;
    }, {} as Record<RoleStatus, number>);

    return {
      total,
      by_type,
      by_status,
      active_count
    };
  }

  /**
   * 获取属性值用于排序
   */
  private getPropertyValue(role: Role, property: string): string {
    switch (property) {
      case 'name':
        return role.name;
      case 'created_at':
        return role.createdAt;
      case 'updated_at':
        return role.updatedAt;
      case 'role_type':
        return role.roleType;
      case 'status':
        return role.status;
      default:
        return role.createdAt;
    }
  }
}
