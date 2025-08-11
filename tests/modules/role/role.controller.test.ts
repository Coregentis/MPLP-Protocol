/**
 * Role Controller API层测试
 * 
 * 基于实际Controller实现，测试HTTP端点和请求处理
 * 确保API接口质量和错误处理正确性
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleController, CreateRoleHttpRequest, UpdateRoleHttpRequest, HttpRequest } from '../../../src/modules/role/api/controllers/role.controller';
import { RoleManagementService } from '../../../src/modules/role/application/services/role-management.service';
import { 
  RoleType, 
  RoleStatus, 
  Permission,
  PermissionAction,
  ResourceType,
  GrantType,
  ScopeLevel
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleController', () => {
  let controller: RoleController;
  let mockRoleManagementService: jest.Mocked<RoleManagementService>;

  // 辅助函数：创建有效的Permission
  const createValidPermission = (): Permission => ({
    permission_id: TestDataFactory.Base.generateUUID(),
    resource_type: 'context' as ResourceType,
    resource_id: TestDataFactory.Base.generateUUID(),
    actions: ['read' as PermissionAction],
    conditions: {
      time_based: {
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString()
      }
    },
    grant_type: 'direct' as GrantType,
    expiry: new Date(Date.now() + 86400000).toISOString()
  });

  beforeEach(() => {
    // 创建Mock服务
    mockRoleManagementService = {
      createRole: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      getRoleById: jest.fn(),
      getRoleByName: jest.fn(),
      listRoles: jest.fn(),
      addPermission: jest.fn(),
      removePermission: jest.fn(),
      checkPermission: jest.fn(),
      getStatistics: jest.fn(),
      assignRole: jest.fn(),
      unassignRole: jest.fn(),
      activateRole: jest.fn(),
      deactivateRole: jest.fn()
    } as any;

    controller = new RoleController(mockRoleManagementService);
  });

  describe('createRole', () => {
    it('应该成功创建角色', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const roleId = TestDataFactory.Base.generateUUID();
      
      const request: CreateRoleHttpRequest = {
        params: {},
        query: {},
        body: {
          context_id: contextId,
          name: 'test-role',
          role_type: 'functional' as RoleType,
          display_name: 'Test Role',
          description: 'A test role',
          permissions: [createValidPermission()]
        }
      };

      const mockRole = {
        role_id: roleId,
        context_id: contextId,
        name: 'test-role',
        role_type: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission()],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole as any
      });

      // 执行测试
      const response = await controller.createRole(request);

      // 验证结果
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith({
        context_id: contextId,
        name: 'test-role',
        role_type: 'functional',
        display_name: 'Test Role',
        description: 'A test role',
        permissions: request.body.permissions
      });
    });

    it('应该处理创建失败的情况', async () => {
      // 准备测试数据
      const request: CreateRoleHttpRequest = {
        params: {},
        query: {},
        body: {
          context_id: TestDataFactory.Base.generateUUID(),
          name: 'invalid-role',
          role_type: 'functional' as RoleType,
          permissions: []
        }
      };

      mockRoleManagementService.createRole.mockResolvedValue({
        success: false,
        error: 'Role name already exists'
      });

      // 执行测试
      const response = await controller.createRole(request);

      // 验证结果
      expect(response.status).toBe(400);
      expect(response.error).toBe('Role name already exists');
      expect(response.data).toBeUndefined();
    });

    it('应该处理服务异常', async () => {
      // 准备测试数据
      const request: CreateRoleHttpRequest = {
        params: {},
        query: {},
        body: {
          context_id: TestDataFactory.Base.generateUUID(),
          name: 'test-role',
          role_type: 'functional' as RoleType,
          permissions: []
        }
      };

      mockRoleManagementService.createRole.mockRejectedValue(new Error('Database connection failed'));

      // 执行测试
      const response = await controller.createRole(request);

      // 验证结果
      expect(response.status).toBe(500);
      expect(response.error).toBe('Database connection failed');
    });
  });

  describe('getRoleById', () => {
    it('应该成功获取角色', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: HttpRequest = {
        params: { id: roleId },
        query: {},
        body: {}
      };

      const mockRole = {
        role_id: roleId,
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'test-role',
        role_type: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission()],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockRoleManagementService.getRoleById.mockResolvedValue({
        success: true,
        data: mockRole as any
      });

      // 执行测试
      const response = await controller.getRoleById(request);

      // 验证结果
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(mockRoleManagementService.getRoleById).toHaveBeenCalledWith(roleId);
    });

    it('应该处理角色不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: HttpRequest = {
        params: { id: roleId },
        query: {},
        body: {}
      };

      mockRoleManagementService.getRoleById.mockResolvedValue({
        success: false,
        error: 'Role not found'
      });

      // 执行测试
      const response = await controller.getRoleById(request);

      // 验证结果
      expect(response.status).toBe(404);
      expect(response.error).toBe('Role not found');
    });

    it('应该处理服务异常', async () => {
      // 准备测试数据
      const request: HttpRequest = {
        params: { id: TestDataFactory.Base.generateUUID() },
        query: {},
        body: {}
      };

      mockRoleManagementService.getRoleById.mockRejectedValue(new Error('Database error'));

      // 执行测试
      const response = await controller.getRoleById(request);

      // 验证结果
      expect(response.status).toBe(500);
      expect(response.error).toBe('Database error');
    });
  });

  describe('updateRoleStatus', () => {
    it('应该成功更新角色状态', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: UpdateRoleHttpRequest = {
        params: { id: roleId },
        query: {},
        body: {
          status: 'inactive' as RoleStatus
        }
      };

      const mockUpdatedRole = {
        role_id: roleId,
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'test-role',
        role_type: 'functional' as RoleType,
        status: 'inactive' as RoleStatus,
        permissions: [createValidPermission()],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 添加updateRoleStatus方法到mock
      mockRoleManagementService.updateRoleStatus = jest.fn().mockResolvedValue({
        success: true,
        data: mockUpdatedRole as any
      });

      // 执行测试
      const response = await controller.updateRoleStatus(request);

      // 验证结果
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(mockRoleManagementService.updateRoleStatus).toHaveBeenCalledWith(roleId, 'inactive');
    });

    it('应该处理状态更新失败的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: UpdateRoleHttpRequest = {
        params: { id: roleId },
        query: {},
        body: {
          status: 'invalid' as any
        }
      };

      mockRoleManagementService.updateRoleStatus = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid status value'
      });

      // 执行测试
      const response = await controller.updateRoleStatus(request);

      // 验证结果
      expect(response.status).toBe(400);
      expect(response.error).toBe('Invalid status value');
    });
  });

  describe('deleteRole', () => {
    it('应该成功删除角色', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: HttpRequest = {
        params: { id: roleId },
        query: {},
        body: {}
      };

      mockRoleManagementService.deleteRole.mockResolvedValue({
        success: true
      });

      // 执行测试
      const response = await controller.deleteRole(request);

      // 验证结果
      expect(response.status).toBe(200);
      expect(response.message).toBe('角色删除成功');
      expect(mockRoleManagementService.deleteRole).toHaveBeenCalledWith(roleId);
    });

    it('应该处理删除失败的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const request: HttpRequest = {
        params: { id: roleId },
        query: {},
        body: {}
      };

      mockRoleManagementService.deleteRole.mockResolvedValue({
        success: false,
        error: 'Role is in use and cannot be deleted'
      });

      // 执行测试
      const response = await controller.deleteRole(request);

      // 验证结果
      expect(response.status).toBe(400);
      expect(response.error).toBe('Role is in use and cannot be deleted');
    });
  });

  describe('queryRoles', () => {
    it('应该成功查询角色', async () => {
      // 准备测试数据
      const request: HttpRequest = {
        params: {},
        query: {
          contextId: TestDataFactory.Base.generateUUID(),
          page: '1',
          limit: '10'
        },
        body: {}
      };

      const mockRoles = [
        {
          role_id: TestDataFactory.Base.generateUUID(),
          context_id: request.query.contextId,
          name: 'role1',
          role_type: 'functional' as RoleType,
          status: 'active' as RoleStatus,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          role_id: TestDataFactory.Base.generateUUID(),
          context_id: request.query.contextId,
          name: 'role2',
          role_type: 'system' as RoleType,
          status: 'active' as RoleStatus,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // 添加queryRoles方法到mock
      mockRoleManagementService.queryRoles = jest.fn().mockResolvedValue({
        success: true,
        data: {
          items: mockRoles as any,
          total: 2,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

      // 执行测试
      const response = await controller.queryRoles(request);

      // 验证结果
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(mockRoleManagementService.queryRoles).toHaveBeenCalled();
    });

    it('应该处理查询失败的情况', async () => {
      // 准备测试数据
      const request: HttpRequest = {
        params: {},
        query: {},
        body: {}
      };

      mockRoleManagementService.queryRoles = jest.fn().mockResolvedValue({
        success: false,
        error: 'Query failed'
      });

      // 执行测试
      const response = await controller.queryRoles(request);

      // 验证结果
      expect(response.status).toBe(400);
      expect(response.error).toBe('Query failed');
    });
  });
});
