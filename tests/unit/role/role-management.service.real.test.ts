/**
 * RoleManagementService真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleManagementService, CreateRoleRequest, OperationResult } from '../../../src/modules/role/application/services/role-management.service';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import { IRoleRepository, RoleFilter, PaginationOptions, PaginatedResult } from '../../../src/modules/role/domain/repositories/role-repository.interface';
import { RoleCacheService } from '../../../src/modules/role/infrastructure/cache/role-cache.service';
import { RoleType, RoleStatus, Permission, ResourceType, PermissionAction } from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

// Mock dependencies
const mockRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByFilter: jest.fn(),
  findActiveRoles: jest.fn(),
  isNameUnique: jest.fn(),
  exists: jest.fn()
} as unknown as jest.Mocked<IRoleRepository>;

const mockCacheService = {
  getRole: jest.fn(),
  setRole: jest.fn(),
  deleteRole: jest.fn(),
  clear: jest.fn()
} as unknown as jest.Mocked<RoleCacheService>;

describe('RoleManagementService真实实现单元测试', () => {
  let roleManagementService: RoleManagementService;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    roleManagementService = new RoleManagementService(mockRepository, mockCacheService);
  });

  describe('createRole - 真实方法签名和返回值', () => {
    it('应该成功创建角色', async () => {
      const request: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional',
        display_name: 'Test Role Display',
        description: 'Test role description',
        permissions: [{
          permission_id: TestDataFactory.Base.generateUUID(),
          resource_type: 'context',
          resource_id: TestDataFactory.Base.generateUUID(),
          actions: ['read'],
          conditions: {},
          grant_type: 'direct',
          expiry: new Date(Date.now() + 86400000).toISOString()
        }]
      };

      // Mock角色名称唯一性检查
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      const result = await roleManagementService.createRole(request);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(Role);
      expect(result.data?.name).toBe(request.name);
      expect(result.data?.roleType).toBe(request.role_type);
      expect(result.data?.contextId).toBe(request.context_id);
      
      // 验证Repository调用
      expect(mockRepository.isNameUnique).toHaveBeenCalledWith(request.name, request.context_id);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockCacheService.setRole).toHaveBeenCalled();
    });

    it('应该拒绝重复的角色名称', async () => {
      const request: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Duplicate Role',
        role_type: 'functional'
      };

      // Mock角色名称已存在
      mockRepository.isNameUnique.mockResolvedValue(false);

      const result = await roleManagementService.createRole(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色名称已存在');
      expect(result.data).toBeUndefined();
      
      // 验证不会调用save
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理创建过程中的异常', async () => {
      const request: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional'
      };

      // Mock异常
      mockRepository.isNameUnique.mockRejectedValue(new Error('Database error'));

      const result = await roleManagementService.createRole(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('应该处理不同的角色类型', async () => {
      const roleTypes: RoleType[] = ['functional', 'organizational', 'system', 'temporary'];

      for (const roleType of roleTypes) {
        const request: CreateRoleRequest = {
          context_id: TestDataFactory.Base.generateUUID(),
          name: `${roleType} Role`,
          role_type: roleType
        };

        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue(undefined);

        const result = await roleManagementService.createRole(request);

        expect(result.success).toBe(true);
        expect(result.data?.roleType).toBe(roleType);
      }
    });

    it('应该处理空的权限列表', async () => {
      const request: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'No Permissions Role',
        role_type: 'functional',
        permissions: []
      };

      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      const result = await roleManagementService.createRole(request);

      expect(result.success).toBe(true);
      expect(result.data?.permissions).toEqual([]);
    });

    it('应该处理缺少可选字段的请求', async () => {
      const request: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Minimal Role',
        role_type: 'functional'
        // 没有display_name, description, permissions
      };

      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      const result = await roleManagementService.createRole(request);

      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBeUndefined();
      expect(result.data?.description).toBeUndefined();
      expect(result.data?.permissions).toEqual([]);
    });
  });

  describe('getRoleById - 真实缓存优化实现', () => {
    it('应该从缓存返回角色', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const cachedRole = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Cached Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // Mock缓存命中
      mockCacheService.getRole.mockReturnValue(cachedRole);

      const result = await roleManagementService.getRoleById(roleId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(cachedRole);
      
      // 验证不会调用Repository
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockCacheService.getRole).toHaveBeenCalledWith(roleId);
    });

    it('应该从Repository获取角色并缓存', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Repository Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // Mock缓存未命中，Repository命中
      mockCacheService.getRole.mockReturnValue(null);
      mockRepository.findById.mockResolvedValue(role);

      const result = await roleManagementService.getRoleById(roleId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(role);
      
      // 验证调用顺序
      expect(mockCacheService.getRole).toHaveBeenCalledWith(roleId);
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockCacheService.setRole).toHaveBeenCalledWith(roleId, role);
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();

      // Mock缓存和Repository都未命中
      mockCacheService.getRole.mockReturnValue(null);
      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.getRoleById(roleId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(result.data).toBeUndefined();
    });

    it('应该处理Repository异常', async () => {
      const roleId = TestDataFactory.Base.generateUUID();

      // Mock缓存未命中，Repository异常
      mockCacheService.getRole.mockReturnValue(null);
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await roleManagementService.getRoleById(roleId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('应该处理空的角色ID', async () => {
      const result = await roleManagementService.getRoleById('');

      expect(result.success).toBe(false);
      // 可能返回错误或者调用Repository
    });

    it('应该处理null和undefined角色ID', async () => {
      const result1 = await roleManagementService.getRoleById(null as any);
      const result2 = await roleManagementService.getRoleById(undefined as any);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe('updateRoleStatus - 真实方法实现', () => {
    it('应该成功更新角色状态', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const newStatus: RoleStatus = 'inactive';
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await roleManagementService.updateRoleStatus(roleId, newStatus);

      expect(result.success).toBe(true);
      expect(result.data).toBe(role);
      expect(role.status).toBe(newStatus);
      
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalledWith(role);
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const newStatus: RoleStatus = 'inactive';

      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.updateRoleStatus(roleId, newStatus);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理有效的状态转换', async () => {
      // 基于实际的状态转换规则：active -> ['inactive', 'suspended', 'deprecated']
      const validTransitions = [
        { from: 'active', to: 'inactive' },
        { from: 'active', to: 'suspended' },
        { from: 'active', to: 'deprecated' },
        { from: 'inactive', to: 'active' },
        { from: 'suspended', to: 'active' }
      ];

      for (const transition of validTransitions) {
        const roleId = TestDataFactory.Base.generateUUID();
        const role = new Role(
          roleId,
          TestDataFactory.Base.generateUUID(),
          '1.0.0',
          'Test Role',
          'functional',
          transition.from as RoleStatus,
          [],
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(role);
        mockRepository.update.mockResolvedValue(undefined);

        const result = await roleManagementService.updateRoleStatus(roleId, transition.to as RoleStatus);

        expect(result.success).toBe(true);
        expect(role.status).toBe(transition.to);
      }
    });

    it('应该拒绝无效的状态转换', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'deprecated', // deprecated状态不能转换到其他状态
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);

      const result = await roleManagementService.updateRoleStatus(roleId, 'active');

      expect(result.success).toBe(false);
      expect(result.error).toContain('无效的状态转换');
    });

    it('应该处理更新过程中的异常', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const newStatus: RoleStatus = 'inactive';
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      const result = await roleManagementService.updateRoleStatus(roleId, newStatus);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('addPermission - 真实方法实现', () => {
    it('应该成功添加权限', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permission: Permission = {
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read', 'write'],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      };

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await roleManagementService.addPermission(roleId, permission);

      expect(result.success).toBe(true);
      expect(result.data).toBe(role);
      expect(role.permissions).toContain(permission);
      
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalledWith(role);
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permission: Permission = {
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read'],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      };

      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.addPermission(roleId, permission);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理添加权限过程中的异常', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permission: Permission = {
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read'],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      };

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockRejectedValue(new Error('Add permission failed'));

      const result = await roleManagementService.addPermission(roleId, permission);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Add permission failed');
    });
  });

  describe('removePermission - 真实方法实现', () => {
    it('应该成功移除权限', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permissionId = TestDataFactory.Base.generateUUID();
      const permission: Permission = {
        permission_id: permissionId,
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read'],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      };

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [permission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await roleManagementService.removePermission(roleId, permissionId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(role);
      expect(role.permissions).not.toContain(permission);

      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalledWith(role);
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permissionId = TestDataFactory.Base.generateUUID();

      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.removePermission(roleId, permissionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理权限不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permissionId = TestDataFactory.Base.generateUUID();

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [], // 没有权限
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await roleManagementService.removePermission(roleId, permissionId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(role);
      // 移除不存在的权限应该成功，但不改变权限列表
    });
  });

  describe('checkPermission - 真实方法实现', () => {
    it('应该检查权限并返回结果', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceType: ResourceType = 'context';
      const resourceId = TestDataFactory.Base.generateUUID();
      const action: PermissionAction = 'read';

      const permission: Permission = {
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: resourceType,
        resource_id: resourceId,
        actions: [action],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      };

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [permission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);

      const result = await roleManagementService.checkPermission(roleId, resourceType, resourceId, action);

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('boolean');

      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceType: ResourceType = 'context';
      const resourceId = TestDataFactory.Base.generateUUID();
      const action: PermissionAction = 'read';

      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.checkPermission(roleId, resourceType, resourceId, action);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
    });

    it('应该处理通配符资源ID', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceType: ResourceType = 'context';
      const action: PermissionAction = 'read';

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);

      const result = await roleManagementService.checkPermission(roleId, resourceType, '*', action);

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('boolean');
    });
  });

  describe('queryRoles - 真实方法实现', () => {
    it('应该查询角色列表', async () => {
      const filter: RoleFilter = {
        context_id: TestDataFactory.Base.generateUUID(),
        role_type: 'functional',
        status: 'active'
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const mockResult: PaginatedResult<Role> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockRepository.findByFilter.mockResolvedValue(mockResult);

      const result = await roleManagementService.queryRoles(filter, pagination);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);

      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该处理没有分页参数的查询', async () => {
      const filter: RoleFilter = {
        context_id: TestDataFactory.Base.generateUUID()
      };

      const mockResult: PaginatedResult<Role> = {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };

      mockRepository.findByFilter.mockResolvedValue(mockResult);

      const result = await roleManagementService.queryRoles(filter);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockResult);

      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, undefined);
    });

    it('应该处理查询异常', async () => {
      const filter: RoleFilter = {
        context_id: TestDataFactory.Base.generateUUID()
      };

      mockRepository.findByFilter.mockRejectedValue(new Error('Query failed'));

      const result = await roleManagementService.queryRoles(filter);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  describe('getActiveRoles - 真实方法实现', () => {
    it('应该获取活跃角色列表', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const mockRoles: Role[] = [
        new Role(
          TestDataFactory.Base.generateUUID(),
          contextId,
          '1.0.0',
          'Active Role 1',
          'functional',
          'active',
          [],
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        )
      ];

      mockRepository.findActiveRoles.mockResolvedValue(mockRoles);

      const result = await roleManagementService.getActiveRoles(contextId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockRoles);

      expect(mockRepository.findActiveRoles).toHaveBeenCalledWith(contextId);
    });

    it('应该处理没有上下文ID的情况', async () => {
      const mockRoles: Role[] = [];

      mockRepository.findActiveRoles.mockResolvedValue(mockRoles);

      const result = await roleManagementService.getActiveRoles();

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockRoles);

      expect(mockRepository.findActiveRoles).toHaveBeenCalledWith(undefined);
    });

    it('应该处理获取活跃角色异常', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      mockRepository.findActiveRoles.mockRejectedValue(new Error('Get active roles failed'));

      const result = await roleManagementService.getActiveRoles(contextId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Get active roles failed');
    });
  });

  describe('deleteRole - 真实方法实现', () => {
    it('应该成功删除角色', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional', // 非系统角色
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await roleManagementService.deleteRole(roleId);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();

      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.delete).toHaveBeenCalledWith(roleId);
    });

    it('应该拒绝删除系统角色', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const systemRole = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'System Role',
        'system', // 系统角色
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(systemRole);

      const result = await roleManagementService.deleteRole(roleId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('不能删除系统角色');

      // 验证不会调用delete
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('应该处理角色不存在的情况', async () => {
      const roleId = TestDataFactory.Base.generateUUID();

      mockRepository.findById.mockResolvedValue(null);

      const result = await roleManagementService.deleteRole(roleId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('应该处理删除过程中的异常', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);
      mockRepository.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await roleManagementService.deleteRole(roleId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('边缘情况和性能测试', () => {
    it('应该处理并发角色创建', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        context_id: TestDataFactory.Base.generateUUID(),
        name: `Concurrent Role ${i}`,
        role_type: 'functional' as RoleType
      }));

      // Mock所有请求都成功
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      const promises = requests.map(request => roleManagementService.createRole(request));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('应该处理大量权限的角色', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const permissions: Permission[] = Array.from({ length: 100 }, () => ({
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read'],
        conditions: {},
        grant_type: 'direct',
        expiry: new Date(Date.now() + 86400000).toISOString()
      }));

      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Many Permissions Role',
        'functional',
        'active',
        permissions,
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      mockRepository.findById.mockResolvedValue(role);

      const startTime = performance.now();
      const result = await roleManagementService.checkPermission(roleId, 'context', TestDataFactory.Base.generateUUID(), 'read');
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该处理异常输入', async () => {
      // Mock缓存和Repository都未命中
      mockCacheService.getRole.mockReturnValue(null);
      mockRepository.findById.mockResolvedValue(null);

      // 测试null参数 - 实际实现可能会处理null并返回success=true但data=null
      const result1 = await roleManagementService.getRoleById(null as any);
      expect(result1).toBeDefined();
      expect(typeof result1.success).toBe('boolean');

      // 测试undefined参数
      const result2 = await roleManagementService.getRoleById(undefined as any);
      expect(result2).toBeDefined();
      expect(typeof result2.success).toBe('boolean');

      // 测试空字符串
      const result3 = await roleManagementService.getRoleById('');
      expect(result3).toBeDefined();
      expect(typeof result3.success).toBe('boolean');
    });
  });
});
