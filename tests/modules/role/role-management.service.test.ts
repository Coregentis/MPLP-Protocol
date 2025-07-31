/**
 * Role管理服务单元测试
 * 
 * 基于Schema驱动测试原则，测试RoleManagementService的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T18:00:00+08:00
 */

import { jest } from '@jest/globals';
import { RoleManagementService, OperationResult, CreateRoleRequest } from '../../../src/modules/role/application/services/role-management.service';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import { IRoleRepository, RoleFilter, PaginationOptions, PaginatedResult } from '../../../src/modules/role/domain/repositories/role-repository.interface';
import { 
  RoleType, 
  RoleStatus, 
  Permission,
  RoleScope,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  PermissionAction,
  ResourceType,
  GrantType,
  ScopeLevel
} from '../../../src/modules/role/types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('RoleManagementService', () => {
  let service: RoleManagementService;
  let mockRepository: jest.Mocked<IRoleRepository>;

  // 辅助函数：创建有效的Permission
  const createValidPermission = (resourceType: ResourceType = 'context', action: PermissionAction = 'read'): Permission => ({
    permission_id: TestDataFactory.Base.generateUUID(),
    resource_type: resourceType,
    resource_id: TestDataFactory.Base.generateUUID(),
    actions: [action],
    conditions: {
      time_based: {
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString()
      }
    },
    grant_type: 'direct' as GrantType,
    expiry: new Date(Date.now() + 86400000).toISOString()
  });

  // 辅助函数：创建有效的RoleScope
  const createValidScope = (): RoleScope => ({
    level: 'project' as ScopeLevel,
    context_ids: [TestDataFactory.Base.generateUUID()],
    plan_ids: [TestDataFactory.Base.generateUUID()],
    resource_constraints: {
      max_contexts: 10,
      max_plans: 50,
      allowed_resource_types: ['context', 'plan']
    }
  });

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      findByName: jest.fn(),
      findActiveRoles: jest.fn(),
      isNameUnique: jest.fn(),
      exists: jest.fn(),
      count: jest.fn()
    } as unknown as jest.Mocked<IRoleRepository>;

    // 创建服务实例 - 基于实际构造函数
    service = new RoleManagementService(mockRepository);
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('应该成功创建Role', async () => {
      // 准备测试数据 - 基于实际Schema
      const createRequest: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Project Manager',
        role_type: 'project',
        display_name: 'Project Manager Role',
        description: 'Manages project lifecycle and resources',
        permissions: [createValidPermission('context', 'read'), createValidPermission('plan', 'create')]
      };

      // 设置Mock返回值 - 基于实际接口
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createRole(createRequest),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果 - 基于实际返回类型
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(createRequest.name);
      expect(result.data?.role_type).toBe(createRequest.role_type);
      expect(result.data?.display_name).toBe(createRequest.display_name);
      expect(result.data?.description).toBe(createRequest.description);
      expect(result.data?.permissions).toEqual(createRequest.permissions);
      expect(mockRepository.isNameUnique).toHaveBeenCalledWith(createRequest.name, createRequest.context_id);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该处理角色名称重复', async () => {
      // 准备测试数据
      const createRequest: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Duplicate Role',
        role_type: 'functional'
      };

      // 设置Mock返回值
      mockRepository.isNameUnique.mockResolvedValue(false);

      // 执行测试
      const result = await service.createRole(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色名称已存在');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const createRequest: CreateRoleRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Role',
        role_type: 'functional'
      };

      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.createRole(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '最小必需参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'Basic Role',
            role_type: 'functional' as RoleType
          },
          expectedSuccess: true
        },
        {
          name: '包含所有可选参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'Full Role',
            role_type: 'project' as RoleType,
            display_name: 'Full Featured Role',
            description: 'Complete role with all features',
            permissions: [createValidPermission('context', 'read')]
          },
          expectedSuccess: true
        },
        {
          name: '空权限数组',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'Empty Permissions Role',
            role_type: 'system' as RoleType,
            permissions: []
          },
          expectedSuccess: true
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedSuccess) {
          mockRepository.isNameUnique.mockResolvedValue(true);
          mockRepository.save.mockResolvedValue(undefined);

          const result = await service.createRole(test.input);
          expect(result.success).toBe(true);
          expect(result.data?.name).toBe(test.input.name);
          expect(result.data?.role_type).toBe(test.input.role_type);
        }
        
        // 清理Mock状态
        jest.clearAllMocks();
      }
    });
  });

  describe('getRoleById', () => {
    it('应该成功获取Role', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const mockRole = new Role(
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

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockRole);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getRoleById(roleId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('应该处理Role不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.getRoleById(roleId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getRoleById(roleId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('updateRoleStatus', () => {
    it('应该成功更新Role状态', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const existingRole = new Role(
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

      const newStatus: RoleStatus = 'inactive';

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingRole);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.updateRoleStatus(roleId, newStatus);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Role不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const newStatus: RoleStatus = 'inactive';

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.updateRoleStatus(roleId, newStatus);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('addPermission', () => {
    it('应该成功为角色添加权限', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const existingRole = new Role(
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

      const newPermission = createValidPermission('plan', 'create');

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingRole);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.addPermission(roleId, newPermission);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理角色不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission('context', 'read');

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.addPermission(roleId, permission);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('removePermission', () => {
    it('应该成功从角色移除权限', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission('context', 'read');
      const existingRole = new Role(
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

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingRole);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.removePermission(roleId, permission.permission_id);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理角色不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const permissionId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.removePermission(roleId, permissionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('checkPermission', () => {
    it('应该成功检查权限', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission('context', 'read');
      permission.resource_id = resourceId;

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

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(role);

      // 执行测试
      const result = await service.checkPermission(roleId, 'context', resourceId, 'read');

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('应该正确返回无权限', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        roleId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [], // 无权限
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(role);

      // 执行测试
      const result = await service.checkPermission(roleId, 'context', resourceId, 'read');

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it('应该处理角色不存在的情况', async () => {
      // 准备测试数据
      const roleId = TestDataFactory.Base.generateUUID();
      const resourceId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.checkPermission(roleId, 'context', resourceId, 'read');

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('角色不存在');
    });
  });

  describe('queryRoles', () => {
    it('应该成功查询Role列表', async () => {
      // 准备测试数据
      const filter: RoleFilter = {
        context_id: TestDataFactory.Base.generateUUID(),
        role_type: 'functional'
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
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryRoles(filter, pagination);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该处理无分页参数的查询', async () => {
      // 准备测试数据
      const filter: RoleFilter = {
        status: 'active'
      };

      const mockResult: PaginatedResult<Role> = {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryRoles(filter);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, undefined);
    });
  });

  describe('getActiveRoles', () => {
    it('应该成功获取活跃角色', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const mockRoles: Role[] = [];

      // 设置Mock返回值
      mockRepository.findActiveRoles.mockResolvedValue(mockRoles);

      // 执行测试
      const result = await service.getActiveRoles(contextId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoles);
      expect(mockRepository.findActiveRoles).toHaveBeenCalledWith(contextId);
    });

    it('应该处理无上下文ID的查询', async () => {
      // 准备测试数据
      const mockRoles: Role[] = [];

      // 设置Mock返回值
      mockRepository.findActiveRoles.mockResolvedValue(mockRoles);

      // 执行测试
      const result = await service.getActiveRoles();

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoles);
      expect(mockRepository.findActiveRoles).toHaveBeenCalledWith(undefined);
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findActiveRoles.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getActiveRoles(contextId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
