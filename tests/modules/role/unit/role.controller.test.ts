/**
 * RoleController单元测试
 *
 * 测试目标：将覆盖率从22.13%提升到95%+
 * 重点测试：API端点、请求处理、响应格式、错误处理
 */

import { RoleController } from '../../../../src/modules/role/api/controllers/role.controller';
import { RoleManagementService } from '../../../../src/modules/role/application/services/role-management.service';
import { createSimpleMockRoleEntityData, createComplexMockRoleEntityData, createTestUUID } from '../test-data-factory';
import { UUID, RoleType, RoleStatus } from '../../../../src/modules/role/types';
import { Request, Response } from 'express';

// Mock RoleManagementService
jest.mock('../../../../src/modules/role/application/services/role-management.service');

describe('RoleController单元测试', () => {
  let controller: RoleController;
  let mockRoleManagementService: jest.Mocked<RoleManagementService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRoleManagementService = new RoleManagementService() as jest.Mocked<RoleManagementService>;
    controller = new RoleController(mockRoleManagementService);

    // Mock Express Request and Response
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRole方法', () => {
    it('应该成功创建角色', async () => {
      const roleData = createSimpleMockRoleEntityData();
      mockRequest.body = roleData;

      mockRoleManagementService.createRole.mockResolvedValue(roleData);

      await controller.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: roleData,
        message: 'Role created successfully',
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith(roleData);
    });

    it('应该处理创建角色时的错误', async () => {
      const roleData = createSimpleMockRoleEntityData();
      mockRequest.body = roleData;
      const error = new Error('Creation failed');

      mockRoleManagementService.createRole.mockRejectedValue(error);

      await controller.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Creation failed',
        timestamp: expect.any(String)
      });
    });

    it('应该处理验证错误', async () => {
      const roleData = createSimpleMockRoleEntityData();
      mockRequest.body = roleData;
      const error = new Error('validation failed');

      mockRoleManagementService.createRole.mockRejectedValue(error);

      await controller.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'validation failed',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getRoleById方法', () => {
    it('应该成功获取角色', async () => {
      const roleId = createTestUUID();
      const roleData = createSimpleMockRoleEntityData();
      mockRequest.params = { roleId };

      mockRoleManagementService.getRoleById.mockResolvedValue(roleData);

      await controller.getRoleById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: roleData,
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.getRoleById).toHaveBeenCalledWith(roleId);
    });

    it('应该处理无效的UUID格式', async () => {
      const invalidId = 'invalid-uuid';
      mockRequest.params = { roleId: invalidId };

      await controller.getRoleById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid role ID format',
        timestamp: expect.any(String)
      });
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = createTestUUID();
      mockRequest.params = { roleId };
      const error = new Error('Role not found');

      mockRoleManagementService.getRoleById.mockRejectedValue(error);

      await controller.getRoleById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role not found',
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateRole方法', () => {
    it('应该成功更新角色', async () => {
      const roleId = createTestUUID();
      const updateData = { name: 'updated-role' };
      const updatedRole = { ...createSimpleMockRoleEntityData(), ...updateData };

      mockRequest.params = { roleId };
      mockRequest.body = updateData;
      mockRoleManagementService.updateRole.mockResolvedValue(updatedRole);

      await controller.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRole,
        message: 'Role updated successfully',
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.updateRole).toHaveBeenCalledWith(roleId, updateData);
    });

    it('应该处理更新不存在角色的情况', async () => {
      const roleId = createTestUUID();
      const updateData = { name: 'updated-role' };
      const error = new Error('Role not found');

      mockRequest.params = { roleId };
      mockRequest.body = updateData;
      mockRoleManagementService.updateRole.mockRejectedValue(error);

      await controller.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role not found',
        timestamp: expect.any(String)
      });
    });
  });

  describe('deleteRole方法', () => {
    it('应该成功删除角色', async () => {
      const roleId = createTestUUID();

      mockRequest.params = { roleId };
      mockRoleManagementService.deleteRole.mockResolvedValue(true);

      await controller.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Role deleted successfully',
        deleted: true,
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.deleteRole).toHaveBeenCalledWith(roleId);
    });

    it('应该处理删除不存在角色的情况', async () => {
      const roleId = createTestUUID();
      const error = new Error('Role not found');

      mockRequest.params = { roleId };
      mockRoleManagementService.deleteRole.mockRejectedValue(error);

      await controller.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role not found',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getAllRoles方法', () => {
    it('应该成功获取所有角色', async () => {
      const mockRoles = [createSimpleMockRoleEntityData(), createComplexMockRoleEntityData()];
      const mockResult = {
        items: mockRoles,
        page: 1,
        limit: 10,
        total: 2,
        hasNext: false,
        hasPrevious: false
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockRoleManagementService.getAllRoles.mockResolvedValue(mockResult);

      await controller.getAllRoles(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.getAllRoles).toHaveBeenCalledWith({ page: 1, limit: 10 }, undefined, undefined);
    });

    it('应该支持过滤参数', async () => {
      const mockResult = {
        items: [createSimpleMockRoleEntityData()],
        page: 1,
        limit: 10,
        total: 1,
        hasNext: false,
        hasPrevious: false
      };

      mockRequest.query = {
        page: '1',
        limit: '10',
        roleType: 'organizational',
        status: 'active'
      };
      mockRoleManagementService.getAllRoles.mockResolvedValue(mockResult);

      await controller.getAllRoles(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        timestamp: expect.any(String)
      });
    });
  });

  describe('searchRoles方法', () => {
    it('应该成功搜索角色', async () => {
      const mockResult = {
        items: [createSimpleMockRoleEntityData()],
        page: 1,
        limit: 10,
        total: 1,
        hasNext: false,
        hasPrevious: false
      };

      mockRequest.query = { q: 'admin', page: '1', limit: '10' };
      mockRoleManagementService.searchRoles.mockResolvedValue(mockResult);

      await controller.searchRoles(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          roles: mockResult.items,
          total: mockResult.total,
          page: mockResult.page,
          limit: mockResult.limit
        },
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.searchRoles).toHaveBeenCalledWith('admin', { page: 1, limit: 10 });
    });

    it('应该处理空搜索结果', async () => {
      const mockResult = {
        items: [],
        page: 1,
        limit: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false
      };

      mockRequest.query = { q: 'nonexistent', page: '1', limit: '10' };
      mockRoleManagementService.searchRoles.mockResolvedValue(mockResult);

      await controller.searchRoles(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          roles: mockResult.items,
          total: mockResult.total,
          page: mockResult.page,
          limit: mockResult.limit
        },
        timestamp: expect.any(String)
      });
    });

    it('应该处理缺少搜索词的情况', async () => {
      mockRequest.query = {};

      await controller.searchRoles(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Search term is required',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getRoleStatistics方法', () => {
    it('应该成功获取角色统计信息', async () => {
      const mockStats = {
        totalRoles: 10,
        activeRoles: 8,
        inactiveRoles: 2,
        rolesByType: {
          system: 2,
          organizational: 3,
          functional: 3,
          project: 1,
          temporary: 1
        },
        averageComplexityScore: 45.5,
        totalPermissions: 150,
        totalAgents: 25
      };

      mockRoleManagementService.getRoleStatistics.mockResolvedValue(mockStats);

      const result = await controller.getRoleStatistics();

      expect(result).toEqual({
        success: true,
        data: mockStats,
        timestamp: expect.any(String)
      });
      expect(mockRoleManagementService.getRoleStatistics).toHaveBeenCalled();
    });
  });

  // 注意：addPermissionToRole, removePermissionFromRole, healthCheck 方法在RoleManagementService中不存在
  // 这些测试被移除以匹配实际的服务接口
});
