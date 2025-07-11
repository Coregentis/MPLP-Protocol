/**
 * MPLP Role Controller
 * 
 * 角色管理API控制器，提供HTTP接口
 * 
 * @version 1.0.1
 * @since 2025-07-10
 * @compliance .cursor/rules/architecture-design.mdc
 */

import { Router, Request, Response } from 'express';
import {
  RoleProtocol,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilter,
  PermissionCheckRequest,
  BatchPermissionCheckRequest,
  RoleErrorCode,
  RoleOperationResult,
  ScopeLevel
} from './types';
import { RoleManager } from './role-manager';
import { logger } from '../../utils/logger';

/**
 * Role控制器类
 * 提供角色管理和权限控制的HTTP接口
 */
export class RoleController {
  private readonly router: Router;
  private readonly roleManager: RoleManager;

  constructor() {
    this.router = Router();
    this.roleManager = new RoleManager();
    this.initializeRoutes();
  }

  /**
   * 获取路由器
   * 
   * @returns Router Express路由器
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 角色管理接口
    this.router.post('/roles', this.createRole.bind(this));
    this.router.get('/roles/:roleId', this.getRole.bind(this));
    this.router.put('/roles/:roleId', this.updateRole.bind(this));
    this.router.delete('/roles/:roleId', this.deleteRole.bind(this));
    this.router.get('/roles', this.listRoles.bind(this));

    // 权限检查接口
    this.router.post('/permissions/check', this.checkPermission.bind(this));
    this.router.post('/permissions/batch-check', this.batchCheckPermissions.bind(this));

    // 用户角色接口
    this.router.post('/users/:userId/roles/:roleId', this.assignRole.bind(this));
    this.router.delete('/users/:userId/roles/:roleId', this.revokeRole.bind(this));
    this.router.get('/users/:userId/roles', this.getUserRoles.bind(this));

    // 健康检查接口
    this.router.get('/health', this.getHealth.bind(this));
    this.router.get('/metrics', this.getMetrics.bind(this));
  }

  /**
   * 创建角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async createRole(req: Request, res: Response): Promise<void> {
    try {
      const createRequest: CreateRoleRequest = req.body;
      
      // 添加必要的验证
      if (!createRequest.name || !createRequest.context_id || !createRequest.role_type) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Missing required fields: name, context_id, or role_type'
          }
        });
        return;
      }

      // 确保permissions是完整的Permission类型
      const permissions: Permission[] = (createRequest.permissions || []).map(p => {
        if (!p.permission_id || !p.resource_type || !p.resource_id || !p.actions || !p.grant_type) {
          throw new Error('Invalid permission data: missing required fields');
        }
        return {
          permission_id: p.permission_id,
          resource_type: p.resource_type,
          resource_id: p.resource_id,
          actions: p.actions,
          grant_type: p.grant_type,
          conditions: p.conditions,
          expiry: p.expiry
        } as Permission;
      });

      const role = await this.roleManager.createRole({
        name: createRequest.name,
        description: createRequest.description,
        permissions: permissions
      });

      res.status(201).json(role);
    } catch (error) {
      logger.error('Error creating role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 获取角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async getRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      
      if (!roleId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Role ID is required'
          }
        });
        return;
      }

      const role = await this.roleManager.getRole(roleId);
      
      if (role) {
        res.status(200).json(role);
      } else {
        res.status(404).json({
          error: {
            code: RoleErrorCode.ROLE_NOT_FOUND,
            message: `Role with ID ${roleId} not found`
          }
        });
      }
    } catch (error) {
      logger.error('Error getting role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 更新角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const updateRequest: UpdateRoleRequest = req.body;
      
      if (!roleId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Role ID is required'
          }
        });
        return;
      }

      // 确保permissions是完整的Permission类型
      const permissions: Permission[] | undefined = updateRequest.permissions?.map(p => {
        if (!p.permission_id || !p.resource_type || !p.resource_id || !p.actions || !p.grant_type) {
          throw new Error('Invalid permission data: missing required fields');
        }
        return {
          permission_id: p.permission_id,
          resource_type: p.resource_type,
          resource_id: p.resource_id,
          actions: p.actions,
          grant_type: p.grant_type,
          conditions: p.conditions,
          expiry: p.expiry
        } as Permission;
      });

      const result = await this.roleManager.updateRole(roleId, {
        name: updateRequest.display_name,
        description: updateRequest.description,
        permissions: permissions
      });

      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          error: {
            code: RoleErrorCode.ROLE_NOT_FOUND,
            message: `Role with ID ${roleId} not found`
          }
        });
      }
    } catch (error) {
      logger.error('Error updating role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 删除角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      
      if (!roleId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Role ID is required'
          }
        });
        return;
      }

      const result = await this.roleManager.deleteRole(roleId);
      
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({
          error: {
            code: RoleErrorCode.ROLE_NOT_FOUND,
            message: `Role with ID ${roleId} not found`
          }
        });
      }
    } catch (error) {
      logger.error('Error deleting role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 列出角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async listRoles(req: Request, res: Response): Promise<void> {
    try {
      // 这里应该实现基于查询参数的过滤
      // 当前仅返回空数组作为示例
      res.status(200).json([]);
    } catch (error) {
      logger.error('Error listing roles', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 检查权限
   * 
   * @param req 请求
   * @param res 响应
   */
  private async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const checkRequest: PermissionCheckRequest = req.body;
      
      if (!checkRequest.user_id || !checkRequest.resource_type || !checkRequest.action) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Missing required fields: user_id, resource_type, or action'
          }
        });
        return;
      }

      const result = await this.roleManager.checkPermission(checkRequest);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error checking permission', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 批量检查权限
   * 
   * @param req 请求
   * @param res 响应
   */
  private async batchCheckPermissions(req: Request, res: Response): Promise<void> {
    try {
      const batchRequest: BatchPermissionCheckRequest = req.body;
      
      if (!batchRequest.checks || !Array.isArray(batchRequest.checks) || batchRequest.checks.length === 0) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Checks array is required and must not be empty'
          }
        });
        return;
      }

      const result = await this.roleManager.batchCheckPermissions(batchRequest);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error batch checking permissions', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 分配角色给用户
   * 
   * @param req 请求
   * @param res 响应
   */
  private async assignRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.params;
      const { contextId } = req.body;
      
      if (!userId || !roleId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'User ID and Role ID are required'
          }
        });
        return;
      }

      const result = await this.roleManager.assignRole(userId, roleId, contextId);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error assigning role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 撤销用户角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async revokeRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.params;
      
      if (!userId || !roleId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'User ID and Role ID are required'
          }
        });
        return;
      }

      const result = await this.roleManager.revokeRole(userId, roleId);
      
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({
          error: {
            code: RoleErrorCode.ROLE_NOT_FOUND,
            message: 'Role assignment not found'
          }
        });
      }
    } catch (error) {
      logger.error('Error revoking role', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 获取用户角色
   * 
   * @param req 请求
   * @param res 响应
   */
  private async getUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'User ID is required'
          }
        });
        return;
      }

      const roles = await this.roleManager.getUserRoles(userId);
      res.status(200).json(roles);
    } catch (error) {
      logger.error('Error getting user roles', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 获取健康状态
   * 
   * @param req 请求
   * @param res 响应
   */
  private async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.roleManager.getHealthStatus();
      res.status(200).json(health);
    } catch (error) {
      logger.error('Error getting health status', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * 获取性能指标
   * 
   * @param req 请求
   * @param res 响应
   */
  private async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.roleManager.getPerformanceMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      logger.error('Error getting metrics', { error });
      res.status(500).json({
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
} 