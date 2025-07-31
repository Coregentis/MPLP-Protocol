/**
 * Role管理服务
 * 
 * 应用层服务，协调领域对象和基础设施层
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Role } from '../../domain/entities/role.entity';
import { IRoleRepository, RoleFilter, PaginationOptions, PaginatedResult } from '../../domain/repositories/role-repository.interface';
import { 
  RoleType, 
  RoleStatus, 
  Permission,
  ResourceType,
  PermissionAction 
} from '../../types';

/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
  context_id: UUID;
  name: string;
  role_type: RoleType;
  display_name?: string;
  description?: string;
  permissions?: Permission[];
}

/**
 * 操作结果
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Role管理服务
 */
export class RoleManagementService {
  constructor(
    private readonly roleRepository: IRoleRepository
  ) {}

  /**
   * 创建角色
   */
  async createRole(request: CreateRoleRequest): Promise<OperationResult<Role>> {
    try {
      // 验证角色名称唯一性
      const isUnique = await this.roleRepository.isNameUnique(request.name, request.context_id);
      if (!isUnique) {
        return {
          success: false,
          error: '角色名称已存在'
        };
      }

      // 创建角色实体
      const now = new Date().toISOString();
      const role = new Role(
        this.generateUUID(),
        request.context_id,
        '1.0.0',
        request.name,
        request.role_type,
        'active',
        request.permissions || [],
        now,
        now,
        now,
        request.display_name,
        request.description
      );

      // 保存到仓库
      await this.roleRepository.save(role);

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建角色失败'
      };
    }
  }

  /**
   * 获取角色详情
   */
  async getRoleById(roleId: UUID): Promise<OperationResult<Role>> {
    try {
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取角色失败'
      };
    }
  }

  /**
   * 更新角色状态
   */
  async updateRoleStatus(roleId: UUID, status: RoleStatus): Promise<OperationResult<Role>> {
    try {
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      role.updateStatus(status);
      await this.roleRepository.update(role);

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新角色状态失败'
      };
    }
  }

  /**
   * 添加权限
   */
  async addPermission(roleId: UUID, permission: Permission): Promise<OperationResult<Role>> {
    try {
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      role.addPermission(permission);
      await this.roleRepository.update(role);

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加权限失败'
      };
    }
  }

  /**
   * 移除权限
   */
  async removePermission(roleId: UUID, permissionId: UUID): Promise<OperationResult<Role>> {
    try {
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      role.removePermission(permissionId);
      await this.roleRepository.update(role);

      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '移除权限失败'
      };
    }
  }

  /**
   * 检查权限
   */
  async checkPermission(
    roleId: UUID, 
    resourceType: ResourceType, 
    resourceId: UUID | '*', 
    action: PermissionAction
  ): Promise<OperationResult<boolean>> {
    try {
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      const hasPermission = role.hasPermission(resourceType, resourceId, action);

      return {
        success: true,
        data: hasPermission
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查权限失败'
      };
    }
  }

  /**
   * 查询角色列表
   */
  async queryRoles(
    filter: RoleFilter,
    pagination?: PaginationOptions
  ): Promise<OperationResult<PaginatedResult<Role>>> {
    try {
      const result = await this.roleRepository.findByFilter(filter, pagination);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询角色列表失败'
      };
    }
  }

  /**
   * 获取活跃角色
   */
  async getActiveRoles(contextId?: UUID): Promise<OperationResult<Role[]>> {
    try {
      const roles = await this.roleRepository.findActiveRoles(contextId);
      
      return {
        success: true,
        data: roles
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取活跃角色失败'
      };
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId: UUID): Promise<OperationResult<void>> {
    try {
      const exists = await this.roleRepository.exists(roleId);
      
      if (!exists) {
        return {
          success: false,
          error: '角色不存在'
        };
      }

      await this.roleRepository.delete(roleId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除角色失败'
      };
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(contextId?: UUID): Promise<OperationResult<any>> {
    try {
      const statistics = await this.roleRepository.getStatistics(contextId);
      
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败'
      };
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
