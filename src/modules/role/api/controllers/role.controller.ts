/**
 * Role控制器
 * 
 * API层控制器，处理HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { RoleManagementService, CreateRoleRequest } from '../../application/services/role-management.service';
import { RoleFilter } from '../../domain/repositories/role-repository.interface';
import { RoleStatus, Permission, ResourceType, PermissionAction } from '../../types';

/**
 * HTTP请求接口
 */
export interface HttpRequest {
  params: Record<string, any>;
  body: any;
  query: Record<string, any>;
  user?: {
    id: string;
    role: string;
  };
}

/**
 * HTTP响应接口
 */
export interface HttpResponse {
  status: number;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Role控制器
 */
export class RoleController {
  constructor(
    private readonly roleManagementService: RoleManagementService
  ) {}

  /**
   * 创建角色
   * POST /api/v1/roles
   */
  async createRole(req: HttpRequest): Promise<HttpResponse> {
    try {
      const createRequest: CreateRoleRequest = req.body;
      const result = await this.roleManagementService.createRole(createRequest);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 201,
        data: result.data?.toProtocol(),
        message: '角色创建成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取角色详情
   * GET /api/v1/roles/:id
   */
  async getRoleById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const result = await this.roleManagementService.getRoleById(roleId);
      
      if (!result.success) {
        return {
          status: 404,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 更新角色状态
   * PUT /api/v1/roles/:id/status
   */
  async updateRoleStatus(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const { status } = req.body;

      const result = await this.roleManagementService.updateRoleStatus(roleId, status);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '角色状态更新成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 添加权限
   * POST /api/v1/roles/:id/permissions
   */
  async addPermission(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const permission: Permission = req.body;

      const result = await this.roleManagementService.addPermission(roleId, permission);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '权限添加成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 移除权限
   * DELETE /api/v1/roles/:id/permissions/:permissionId
   */
  async removePermission(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const permissionId = req.params.permissionId;

      const result = await this.roleManagementService.removePermission(roleId, permissionId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '权限移除成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 检查权限
   * GET /api/v1/roles/:id/permissions/check
   */
  async checkPermission(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const { resource_type, resource_id, action } = req.query;

      const result = await this.roleManagementService.checkPermission(
        roleId,
        resource_type as ResourceType,
        resource_id || '*',
        action as PermissionAction
      );
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: { has_permission: result.data }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 查询角色列表
   * GET /api/v1/roles
   */
  async queryRoles(req: HttpRequest): Promise<HttpResponse> {
    try {
      const filter: RoleFilter = {
        context_id: req.query.contextId,
        role_type: req.query.roleType,
        status: req.query.status,
        name_pattern: req.query.name_pattern,
        created_after: req.query.created_after,
        created_before: req.query.created_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order as 'asc' | 'desc'
      };

      const result = await this.roleManagementService.queryRoles(filter, pagination);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: {
          ...result.data,
          items: result.data?.items.map(role => role.toProtocol())
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取活跃角色
   * GET /api/v1/roles/active
   */
  async getActiveRoles(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId;
      const result = await this.roleManagementService.getActiveRoles(contextId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.map(role => role.toProtocol())
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 删除角色
   * DELETE /api/v1/roles/:id
   */
  async deleteRole(req: HttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const result = await this.roleManagementService.deleteRole(roleId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        message: '角色删除成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取统计信息
   * GET /api/v1/roles/statistics
   */
  async getStatistics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId;
      const result = await this.roleManagementService.getStatistics(contextId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }
}
