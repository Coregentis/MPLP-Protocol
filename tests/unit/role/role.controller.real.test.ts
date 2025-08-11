/**
 * RoleController真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleController } from '../../../src/modules/role/api/controllers/role.controller';
import { RoleManagementService, CreateRoleRequest, OperationResult } from '../../../src/modules/role/application/services/role-management.service';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import { RoleMapper } from '../../../src/modules/role/api/mappers/role.mapper';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  RoleListResponseDto,
  PermissionCheckResultDto
} from '../../../src/modules/role/api/dto/role.dto';
import {
  RoleType,
  RoleStatus,
  Permission,
  ResourceType,
  PermissionAction,
  GrantType
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

// HTTP请求和响应类型定义
interface HttpRequest {
  params: Record<string, string>;
  body: any;
  query: Record<string, string>;
}

interface HttpResponse {
  status: number;
  data?: any;
  error?: string;
  message?: string;
}

interface CreateRoleHttpRequest extends HttpRequest {
  body: CreateRoleDto;
}

interface UpdateRoleHttpRequest extends HttpRequest {
  body: { status: RoleStatus };
}

describe('RoleController真实实现单元测试', () => {
  let controller: RoleController;
  let mockRoleManagementService: jest.Mocked<RoleManagementService>;

  beforeEach(() => {
    // 创建RoleManagementService的mock
    mockRoleManagementService = {
      createRole: jest.fn(),
      getRoleById: jest.fn(),
      updateRoleStatus: jest.fn(),
      deleteRole: jest.fn(),
      assignPermissions: jest.fn(),
      revokePermissions: jest.fn(),
      checkPermission: jest.fn(),
      queryRoles: jest.fn(),
      getActiveRoles: jest.fn(),
      getStatistics: jest.fn(),
      generateUUID: jest.fn(() => TestDataFactory.Base.generateUUID())
    } as any;

    controller = new RoleController(mockRoleManagementService);
  });

  // 辅助函数：创建有效的Role实例
  const createValidRole = (overrides: {
    roleId?: string;
    contextId?: string;
    name?: string;
    roleType?: RoleType;
    status?: RoleStatus;
  } = {}): Role => {
    const defaults = {
      roleId: TestDataFactory.Base.generateUUID(),
      contextId: TestDataFactory.Base.generateUUID(),
      protocolVersion: '1.0.0',
      name: 'Test Role',
      roleType: 'functional' as RoleType,
      status: 'active' as RoleStatus,
      permissions: [] as Permission[],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const merged = { ...defaults, ...overrides };
    return new Role(
      merged.roleId,
      merged.contextId,
      merged.protocolVersion,
      merged.name,
      merged.roleType,
      merged.status,
      merged.permissions,
      merged.timestamp,
      merged.createdAt,
      merged.updatedAt
    );
  };

  // 辅助函数：创建有效的Permission
  const createValidPermission = (overrides: Partial<Permission> = {}): Permission => {
    const defaults = {
      permission_id: TestDataFactory.Base.generateUUID(),
      resource_type: 'context' as ResourceType,
      resource_id: TestDataFactory.Base.generateUUID(),
      actions: ['read'] as PermissionAction[],
      conditions: {},
      grant_type: 'direct' as GrantType,
      expiry: new Date(Date.now() + 86400000).toISOString()
    };

    return { ...defaults, ...overrides };
  };

  describe('角色创建 - createRole', () => {
    it('应该成功创建角色', async () => {
      const createDto: CreateRoleDto = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional',
        display_name: 'Test Role Display',
        description: 'Test role description',
        permissions: [createValidPermission()]
      };

      const req: CreateRoleHttpRequest = {
        body: createDto,
        params: {},
        query: {}
      };

      const mockRole = createValidRole({
        name: 'Test Role',
        roleType: 'functional'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      // Mock RoleMapper.toSchema
      jest.spyOn(RoleMapper, 'toSchema').mockReturnValue({
        protocol_version: '1.0.0',
        timestamp: mockRole.timestamp,
        role_id: mockRole.roleId,
        context_id: mockRole.contextId,
        name: mockRole.name,
        role_type: mockRole.roleType,
        status: mockRole.status,
        permissions: mockRole.permissions
      });

      const response = await controller.createRole(req);

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.message).toBe('角色创建成功');
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith({
        context_id: createDto.context_id,
        name: createDto.name,
        role_type: createDto.role_type,
        display_name: createDto.display_name,
        description: createDto.description,
        permissions: createDto.permissions
      });
    });

    it('应该处理创建失败', async () => {
      const createDto: CreateRoleDto = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional'
      };

      const req: CreateRoleHttpRequest = {
        body: createDto,
        params: {},
        query: {}
      };

      mockRoleManagementService.createRole.mockResolvedValue({
        success: false,
        error: 'Role creation failed'
      });

      const response = await controller.createRole(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Role creation failed');
    });

    it('应该处理异常情况', async () => {
      const createDto: CreateRoleDto = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional'
      };

      const req: CreateRoleHttpRequest = {
        body: createDto,
        params: {},
        query: {}
      };

      mockRoleManagementService.createRole.mockRejectedValue(new Error('Service error'));

      const response = await controller.createRole(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Service error');
    });
  });

  describe('角色查询 - getRoleById', () => {
    it('应该成功获取角色详情', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {}
      };

      const mockRole = createValidRole({ roleId });

      mockRoleManagementService.getRoleById.mockResolvedValue({
        success: true,
        data: mockRole
      });

      // Mock RoleMapper.toSchema
      jest.spyOn(RoleMapper, 'toSchema').mockReturnValue({
        protocol_version: '1.0.0',
        timestamp: mockRole.timestamp,
        role_id: mockRole.roleId,
        context_id: mockRole.contextId,
        name: mockRole.name,
        role_type: mockRole.roleType,
        status: mockRole.status,
        permissions: mockRole.permissions
      });

      const response = await controller.getRoleById(req);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.role_id).toBe(roleId);
      expect(response.data.created_at).toBe(mockRole.createdAt);
      expect(response.data.updated_at).toBe(mockRole.updatedAt);
      expect(mockRoleManagementService.getRoleById).toHaveBeenCalledWith(roleId);
    });

    it('应该处理角色不存在', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {}
      };

      mockRoleManagementService.getRoleById.mockResolvedValue({
        success: false,
        error: 'Role not found'
      });

      const response = await controller.getRoleById(req);

      expect(response.status).toBe(404);
      expect(response.error).toBe('Role not found');
    });

    it('应该处理异常情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {}
      };

      mockRoleManagementService.getRoleById.mockRejectedValue(new Error('Database error'));

      const response = await controller.getRoleById(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Database error');
    });
  });

  describe('角色状态更新 - updateRoleStatus', () => {
    it('应该成功更新角色状态', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const newStatus: RoleStatus = 'inactive';

      const req: UpdateRoleHttpRequest = {
        params: { id: roleId },
        body: { status: newStatus },
        query: {}
      };

      const mockRole = createValidRole({ roleId, status: newStatus });

      mockRoleManagementService.updateRoleStatus.mockResolvedValue({
        success: true,
        data: mockRole
      });

      // Mock RoleMapper.toSchema
      jest.spyOn(RoleMapper, 'toSchema').mockReturnValue({
        protocol_version: '1.0.0',
        timestamp: mockRole.timestamp,
        role_id: mockRole.roleId,
        context_id: mockRole.contextId,
        name: mockRole.name,
        role_type: mockRole.roleType,
        status: mockRole.status,
        permissions: mockRole.permissions
      });

      const response = await controller.updateRoleStatus(req);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe(newStatus);
      expect(response.message).toBe('角色状态更新成功');
      expect(mockRoleManagementService.updateRoleStatus).toHaveBeenCalledWith(roleId, newStatus);
    });

    it('应该处理更新失败', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: UpdateRoleHttpRequest = {
        params: { id: roleId },
        body: { status: 'inactive' },
        query: {}
      };

      mockRoleManagementService.updateRoleStatus.mockResolvedValue({
        success: false,
        error: 'Update failed'
      });

      const response = await controller.updateRoleStatus(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Update failed');
    });
  });

  describe('权限检查 - checkPermission', () => {
    it('应该成功检查权限', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {
          resource_type: 'context',
          resource_id: 'resource-123',
          action: 'read'
        }
      };

      mockRoleManagementService.checkPermission.mockResolvedValue({
        success: true,
        data: true
      });

      const response = await controller.checkPermission(req);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.has_permission).toBe(true);
      expect(response.data.checked_at).toBeDefined();
      expect(mockRoleManagementService.checkPermission).toHaveBeenCalledWith(
        roleId,
        'context',
        'resource-123',
        'read'
      );
    });

    it('应该处理没有resource_id的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {
          resource_type: 'context',
          action: 'read'
        }
      };

      mockRoleManagementService.checkPermission.mockResolvedValue({
        success: true,
        data: false
      });

      const response = await controller.checkPermission(req);

      expect(response.status).toBe(200);
      expect(response.data.has_permission).toBe(false);
      expect(mockRoleManagementService.checkPermission).toHaveBeenCalledWith(
        roleId,
        'context',
        '*',
        'read'
      );
    });

    it('应该处理权限检查失败', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: { id: roleId },
        body: {},
        query: {
          resource_type: 'context',
          action: 'read'
        }
      };

      mockRoleManagementService.checkPermission.mockResolvedValue({
        success: false,
        error: 'Permission check failed'
      });

      const response = await controller.checkPermission(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Permission check failed');
    });
  });

  describe('角色查询 - queryRoles', () => {
    it('应该成功查询角色列表', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {
          contextId: TestDataFactory.Base.generateUUID(),
          roleType: 'functional',
          status: 'active',
          page: '1',
          limit: '10'
        }
      };

      const mockRoles = [
        createValidRole({ name: 'Role 1' }),
        createValidRole({ name: 'Role 2' })
      ];

      mockRoleManagementService.queryRoles.mockResolvedValue({
        success: true,
        data: {
          items: mockRoles,
          total: 2,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

      // Mock RoleMapper.toSchema
      jest.spyOn(RoleMapper, 'toSchema').mockImplementation((role) => ({
        protocol_version: '1.0.0',
        timestamp: role.timestamp,
        role_id: role.roleId,
        context_id: role.contextId,
        name: role.name,
        role_type: role.roleType,
        status: role.status,
        permissions: role.permissions
      }));

      const response = await controller.queryRoles(req);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.roles).toHaveLength(2);
      expect(response.data.total).toBe(2);
      expect(response.data.page).toBe(1);
      expect(response.data.limit).toBe(10);
      expect(mockRoleManagementService.queryRoles).toHaveBeenCalledWith(
        {
          context_id: req.query.contextId,
          role_type: 'functional',
          status: 'active',
          name_pattern: undefined,
          created_after: undefined,
          created_before: undefined
        },
        {
          page: 1,
          limit: 10,
          sort_by: undefined,
          sort_order: undefined
        }
      );
    });

    it('应该处理查询失败', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      mockRoleManagementService.queryRoles.mockResolvedValue({
        success: false,
        error: 'Query failed'
      });

      const response = await controller.queryRoles(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Query failed');
    });

    it('应该使用默认分页参数', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      const mockRoles = [createValidRole()];

      mockRoleManagementService.queryRoles.mockResolvedValue({
        success: true,
        data: {
          items: mockRoles,
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

      jest.spyOn(RoleMapper, 'toSchema').mockImplementation((role) => ({
        protocol_version: '1.0.0',
        timestamp: role.timestamp,
        role_id: role.roleId,
        context_id: role.contextId,
        name: role.name,
        role_type: role.roleType,
        status: role.status,
        permissions: role.permissions
      }));

      const response = await controller.queryRoles(req);

      expect(response.status).toBe(200);
      expect(mockRoleManagementService.queryRoles).toHaveBeenCalledWith(
        expect.any(Object),
        {
          page: 1,
          limit: 10,
          sort_by: undefined,
          sort_order: undefined
        }
      );
    });
  });

  describe('活跃角色查询 - getActiveRoles', () => {
    it('应该成功获取活跃角色', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: {},
        body: {},
        query: { contextId }
      };

      const mockRoles = [
        createValidRole({ status: 'active' }),
        createValidRole({ status: 'active' })
      ];

      mockRoleManagementService.getActiveRoles.mockResolvedValue({
        success: true,
        data: mockRoles
      });

      jest.spyOn(RoleMapper, 'toSchema').mockImplementation((role) => ({
        protocol_version: '1.0.0',
        timestamp: role.timestamp,
        role_id: role.roleId,
        context_id: role.contextId,
        name: role.name,
        role_type: role.roleType,
        status: role.status,
        permissions: role.permissions
      }));

      const response = await controller.getActiveRoles(req);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.roles).toHaveLength(2);
      expect(response.data.total).toBe(2);
      expect(mockRoleManagementService.getActiveRoles).toHaveBeenCalledWith(contextId);
    });

    it('应该处理没有活跃角色的情况', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      mockRoleManagementService.getActiveRoles.mockResolvedValue({
        success: true,
        data: []
      });

      const response = await controller.getActiveRoles(req);

      expect(response.status).toBe(200);
      expect(response.data.roles).toHaveLength(0);
      expect(response.data.total).toBe(0);
    });
  });

  describe('统计信息 - getStatistics', () => {
    it('应该成功获取统计信息', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const req: HttpRequest = {
        params: {},
        body: {},
        query: { contextId }
      };

      const mockStats = {
        total: 10,
        active_count: 8,
        by_type: {
          functional: 5,
          organizational: 3,
          system: 2
        },
        by_status: {
          active: 8,
          inactive: 2
        }
      };

      mockRoleManagementService.getStatistics.mockResolvedValue({
        success: true,
        data: mockStats
      });

      const response = await controller.getStatistics(req);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockStats);
      expect(mockRoleManagementService.getStatistics).toHaveBeenCalledWith(contextId);
    });

    it('应该处理统计失败', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      mockRoleManagementService.getStatistics.mockResolvedValue({
        success: false,
        error: 'Statistics failed'
      });

      const response = await controller.getStatistics(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Statistics failed');
    });
  });

  describe('边缘情况和错误处理', () => {
    it('应该处理空的请求参数', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      mockRoleManagementService.getRoleById.mockResolvedValue({
        success: false,
        error: 'Role ID is required'
      });

      const response = await controller.getRoleById(req);

      expect(response.status).toBe(404);
    });

    it('应该处理无效的查询参数', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {
          page: 'invalid',
          limit: 'invalid'
        }
      };

      const mockRoles = [createValidRole()];

      mockRoleManagementService.queryRoles.mockResolvedValue({
        success: true,
        data: {
          items: mockRoles,
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

      jest.spyOn(RoleMapper, 'toSchema').mockImplementation((role) => ({
        protocol_version: '1.0.0',
        timestamp: role.timestamp,
        role_id: role.roleId,
        context_id: role.contextId,
        name: role.name,
        role_type: role.roleType,
        status: role.status,
        permissions: role.permissions
      }));

      const response = await controller.queryRoles(req);

      expect(response.status).toBe(200);
      // 应该使用默认值
      expect(mockRoleManagementService.queryRoles).toHaveBeenCalledWith(
        expect.any(Object),
        {
          page: 1,
          limit: 10,
          sort_by: undefined,
          sort_order: undefined
        }
      );
    });

    it('应该处理服务层异常', async () => {
      const req: HttpRequest = {
        params: {},
        body: {},
        query: {}
      };

      mockRoleManagementService.getStatistics.mockRejectedValue(new Error('Service unavailable'));

      const response = await controller.getStatistics(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Service unavailable');
    });
  });
});
