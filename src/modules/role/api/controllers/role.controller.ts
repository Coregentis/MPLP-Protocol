/**
 * Role控制器
 * 
 * API层控制器，处理HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// UUID import removed - not used in this file
import { RoleManagementService, CreateRoleRequest, RoleStatistics } from '../../application/services/role-management.service';
import { RoleFilter } from '../../domain/repositories/role-repository.interface';
import { RoleStatus, RoleType, Permission, ResourceType, PermissionAction } from '../../types';
import { RoleMapper } from '../mappers/role.mapper';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRolesDto,
  RoleResponseDto,
  RoleListResponseDto,
  OperationResultDto,
  PermissionCheckResultDto
} from '../dto/role.dto';

/**
 * HTTP请求接口基类
 */
export interface BaseHttpRequest {
  params: Record<string, string>;
  query: Record<string, string>;
  user?: {
    id: string;
    role: string;
  };
}

/**
 * 创建角色请求接口
 */
export interface CreateRoleHttpRequest extends BaseHttpRequest {
  body: CreateRoleDto;
}

/**
 * 更新角色请求接口
 */
export interface UpdateRoleHttpRequest extends BaseHttpRequest {
  body: UpdateRoleDto;
}

/**
 * 查询角色请求接口
 */
export interface QueryRolesHttpRequest extends BaseHttpRequest {
  body?: QueryRolesDto;
}

/**
 * 权限操作请求接口
 */
export interface PermissionHttpRequest extends BaseHttpRequest {
  body: Permission;
}

/**
 * 通用HTTP请求接口
 */
export interface HttpRequest extends BaseHttpRequest {
  body: Record<string, string | number | boolean>;
}

/**
 * HTTP响应接口
 */
export interface HttpResponse {
  status: number;
  data?: RoleResponseDto | RoleListResponseDto | OperationResultDto | PermissionCheckResultDto | RoleStatistics;
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
  async createRole(req: CreateRoleHttpRequest): Promise<HttpResponse> {
    try {
      // 使用DTO接收Schema格式的请求
      const createDto: CreateRoleDto = req.body;

      // 转换为应用层请求格式 - 直接使用DTO字段
      const createRequest: CreateRoleRequest = {
        context_id: createDto.context_id,
        name: createDto.name,
        role_type: createDto.role_type,
        display_name: createDto.display_name,
        description: createDto.description,
        permissions: createDto.permissions
      };

      const result = await this.roleManagementService.createRole(createRequest);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      // 使用Mapper转换响应为Schema格式
      const responseData: RoleResponseDto = {
        ...RoleMapper.toSchema(result.data!),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        status: 201,
        data: responseData,
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

      // 使用Mapper转换响应为Schema格式
      const responseData: RoleResponseDto = {
        ...RoleMapper.toSchema(result.data!),
        created_at: result.data!.createdAt,
        updated_at: result.data!.updatedAt
      };

      return {
        status: 200,
        data: responseData
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
  async updateRoleStatus(req: UpdateRoleHttpRequest): Promise<HttpResponse> {
    try {
      const roleId = req.params.id;
      const status = req.body.status as RoleStatus;

      const result = await this.roleManagementService.updateRoleStatus(roleId, status);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      // 使用Mapper转换响应为Schema格式
      const responseData: RoleResponseDto = {
        ...RoleMapper.toSchema(result.data!),
        created_at: result.data!.createdAt,
        updated_at: result.data!.updatedAt
      };

      return {
        status: 200,
        data: responseData,
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
  async addPermission(req: PermissionHttpRequest): Promise<HttpResponse> {
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

      // 使用Mapper转换响应为Schema格式
      const responseData: RoleResponseDto = {
        ...RoleMapper.toSchema(result.data!),
        created_at: result.data!.createdAt,
        updated_at: result.data!.updatedAt
      };

      return {
        status: 200,
        data: responseData,
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

      // 使用Mapper转换响应为Schema格式
      const responseData: RoleResponseDto = {
        ...RoleMapper.toSchema(result.data!),
        created_at: result.data!.createdAt,
        updated_at: result.data!.updatedAt
      };

      return {
        status: 200,
        data: responseData,
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

      const permissionResult: PermissionCheckResultDto = {
        has_permission: result.data || false,
        checked_at: new Date().toISOString()
      };

      return {
        status: 200,
        data: permissionResult
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
        role_type: req.query.roleType as RoleType,
        status: req.query.status as RoleStatus,
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

      // 转换为RoleListResponseDto格式
      const roleListResponse: RoleListResponseDto = {
        roles: result.data?.items?.map(role => ({
          ...RoleMapper.toSchema(role),
          created_at: role.createdAt,
          updated_at: role.updatedAt
        })) || [],
        total: result.data?.total || 0,
        page: result.data?.page || 1,
        limit: result.data?.limit || 10,
        total_pages: result.data?.total_pages || 1
      };

      return {
        status: 200,
        data: roleListResponse
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

      // 转换为RoleResponseDto数组
      const rolesResponse: RoleResponseDto[] = result.data?.map(role => ({
        ...RoleMapper.toSchema(role),
        created_at: role.createdAt,
        updated_at: role.updatedAt
      })) || [];

      return {
        status: 200,
        data: { roles: rolesResponse, total: rolesResponse.length, page: 1, limit: rolesResponse.length, total_pages: 1 } as RoleListResponseDto
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
