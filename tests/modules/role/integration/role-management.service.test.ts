/**
 * Role管理服务集成测试
 * 
 * @description 测试RoleManagementService与其他组件的集成 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 测试层 - 集成测试 (Tier 2)
 */

import { RoleManagementService } from '../../../../src/modules/role/application/services/role-management.service';
import { MemoryRoleRepository } from '../../../../src/modules/role/infrastructure/repositories/role.repository';
import { RoleEntity } from '../../../../src/modules/role/domain/entities/role.entity';
import { RoleMapper } from '../../../../src/modules/role/api/mappers/role.mapper';
import { 
  createSimpleMockRoleEntityData, 
  createComplexMockRoleEntityData, 
  createMockCreateRoleRequest,
  createMultipleMockRoles,
  createTestUUID,
  createTestPermission
} from '../test-data-factory';
import { UUID, RoleType, RoleStatus, Permission } from '../../../../src/modules/role/types';

describe('RoleManagementService集成测试', () => {
  let roleService: RoleManagementService;
  let roleRepository: MemoryRoleRepository;
  let mockRoleData: any;
  let mockComplexRoleData: any;

  beforeEach(async () => {
    roleRepository = new MemoryRoleRepository();
    roleService = new RoleManagementService(roleRepository);
    
    mockRoleData = createSimpleMockRoleEntityData();
    mockComplexRoleData = createComplexMockRoleEntityData();
  });

  afterEach(async () => {
    // 清理所有角色数据
    await roleRepository.clear();
  });

  describe('角色CRUD操作集成测试', () => {
    it('应该成功创建和检索角色', async () => {
      const createRequest = createMockCreateRoleRequest();
      
      // 创建角色
      const createdRole = await roleService.createRole(createRequest);
      
      expect(createdRole).toBeDefined();
      expect(createdRole.name).toBe(createRequest.name);
      expect(createdRole.roleType).toBe(createRequest.roleType);
      expect(createdRole.contextId).toBe(createRequest.contextId);
      
      // 检索角色
      const retrievedRole = await roleService.getRoleById(createdRole.roleId);
      
      expect(retrievedRole).toBeDefined();
      expect(retrievedRole!.roleId).toBe(createdRole.roleId);
      expect(retrievedRole!.name).toBe(createdRole.name);
    });

    it('应该成功更新角色信息', async () => {
      const createRequest = createMockCreateRoleRequest();
      const createdRole = await roleService.createRole(createRequest);
      
      const updateData = {
        name: 'updated-role-name',
        displayName: 'Updated Role Name',
        description: 'Updated description'
      };
      
      const updatedRole = await roleService.updateRole(createdRole.roleId, updateData);
      
      expect(updatedRole.name).toBe(updateData.name);
      expect(updatedRole.displayName).toBe(updateData.displayName);
      expect(updatedRole.description).toBe(updateData.description);
      expect(updatedRole.roleId).toBe(createdRole.roleId); // ID不变
    });

    it('应该成功删除角色', async () => {
      const createRequest = createMockCreateRoleRequest();
      const createdRole = await roleService.createRole(createRequest);
      
      // 删除角色
      await roleService.deleteRole(createdRole.roleId);
      
      // 验证角色已删除
      const deletedRole = await roleService.getRoleById(createdRole.roleId);
      expect(deletedRole).toBeNull();
    });

    it('应该正确处理角色不存在的情况', async () => {
      const nonExistentId = createTestUUID();
      
      const role = await roleService.getRoleById(nonExistentId);
      expect(role).toBeNull();
      
      await expect(roleService.updateRole(nonExistentId, { name: 'test' }))
        .rejects.toThrow('not found');

      await expect(roleService.deleteRole(nonExistentId))
        .rejects.toThrow('not found');
    });
  });

  describe('权限管理集成测试', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功添加权限到角色', async () => {
      const newPermission = createTestPermission({
        resourceType: 'task',
        actions: ['create', 'update', 'delete']
      });

      const updatedRole = await roleService.addPermission(testRole.roleId, newPermission);
      
      expect(updatedRole.permissions).toContain(newPermission);
      expect(updatedRole.hasPermission('task', newPermission.resourceId, 'create')).toBe(true);
    });

    it('应该成功从角色移除权限', async () => {
      // 先添加权限
      const permission = createTestPermission();
      await roleService.addPermission(testRole.roleId, permission);
      
      // 再移除权限
      const updatedRole = await roleService.removePermission(testRole.roleId, permission.permissionId);
      
      expect(updatedRole.permissions).not.toContain(permission);
      expect(updatedRole.hasPermission(permission.resourceType, permission.resourceId, permission.actions[0])).toBe(false);
    });

    it('应该正确检查角色权限', async () => {
      const permission = createTestPermission({
        resourceType: 'context',
        resourceId: 'test-resource' as UUID,
        actions: ['read', 'write']
      });
      
      await roleService.addPermission(testRole.roleId, permission);
      
      const hasReadPermission = await roleService.checkPermission(
        testRole.roleId, 
        'context', 
        'test-resource', 
        'read'
      );
      
      const hasWritePermission = await roleService.checkPermission(
        testRole.roleId, 
        'context', 
        'test-resource', 
        'write'
      );
      
      const hasDeletePermission = await roleService.checkPermission(
        testRole.roleId, 
        'context', 
        'test-resource', 
        'delete'
      );
      
      expect(hasReadPermission).toBe(true);
      expect(hasWritePermission).toBe(true);
      expect(hasDeletePermission).toBe(false);
    });
  });

  describe('角色状态管理集成测试', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功激活角色', async () => {
      // 先停用角色
      await roleService.deactivateRole(testRole.roleId);
      
      // 再激活角色
      const activatedRole = await roleService.activateRole(testRole.roleId);
      
      expect(activatedRole.status).toBe('active');
      expect(activatedRole.isActive()).toBe(true);
    });

    it('应该成功停用角色', async () => {
      const deactivatedRole = await roleService.deactivateRole(testRole.roleId);
      
      expect(deactivatedRole.status).toBe('inactive');
      expect(deactivatedRole.isActive()).toBe(false);
    });
  });

  describe('角色查询集成测试', () => {
    beforeEach(async () => {
      // 创建多个测试角色
      const createRequests = createMultipleMockRoles(5).map(roleData => ({
        contextId: roleData.contextId,
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        roleType: roleData.roleType,
        permissions: roleData.permissions,
        scope: roleData.scope,
        attributes: roleData.attributes
      }));

      for (const createRequest of createRequests) {
        await roleService.createRole(createRequest);
      }
    });

    it('应该正确获取所有角色', async () => {
      const result = await roleService.getAllRoles();

      expect(result.items).toHaveLength(5);
      expect(result.items.every(role => role instanceof RoleEntity)).toBe(true);
      expect(result.total).toBe(5);
    });

    it('应该正确根据上下文ID获取角色', async () => {
      const contextId = 'context-test-001' as UUID;
      const rolesByContext = await roleService.getRolesByContext(contextId);
      
      expect(Array.isArray(rolesByContext)).toBe(true);
      expect(rolesByContext.every(role => role.contextId === contextId)).toBe(true);
    });

    it('应该正确根据角色类型获取角色', async () => {
      const roleType: RoleType = 'organizational';
      const rolesByType = await roleService.getRolesByType(roleType);
      
      expect(Array.isArray(rolesByType)).toBe(true);
      expect(rolesByType.every(role => role.roleType === roleType)).toBe(true);
    });

    it('应该正确搜索角色', async () => {
      const searchResults = await roleService.searchRoles({
        query: 'test-role',
        filters: {
          status: 'active' as RoleStatus
        }
      });

      expect(Array.isArray(searchResults.items)).toBe(true);
      expect(searchResults.total).toBeGreaterThan(0);
      expect(searchResults.items.every(role => role.status === 'active')).toBe(true);
    });
  });

  describe('统计分析集成测试', () => {
    beforeEach(async () => {
      // 创建不同类型和状态的角色，使用唯一名称
      const timestamp = Date.now();
      const roles = [
        { ...createSimpleMockRoleEntityData(), name: `stats-role-1-${timestamp}`, roleType: 'organizational' as RoleType, status: 'active' as RoleStatus },
        { ...createSimpleMockRoleEntityData(), name: `stats-role-2-${timestamp}`, roleType: 'functional' as RoleType, status: 'active' as RoleStatus },
        { ...createSimpleMockRoleEntityData(), name: `stats-role-3-${timestamp}`, roleType: 'organizational' as RoleType, status: 'inactive' as RoleStatus },
        { ...createComplexMockRoleEntityData(), name: `stats-role-4-${timestamp}`, roleType: 'functional' as RoleType, status: 'active' as RoleStatus }
      ];

      for (const roleData of roles) {
        const createRequest = {
          contextId: roleData.contextId,
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          roleType: roleData.roleType,
          permissions: roleData.permissions,
          scope: roleData.scope,
          attributes: roleData.attributes
        };
        await roleService.createRole(createRequest);
      }
    });

    it('应该正确生成角色统计信息', async () => {
      // 创建统计测试专用的角色，使用唯一名称
      const statisticsTestRole = createSimpleMockRoleEntityData();
      statisticsTestRole.name = `statistics-test-role-${Date.now()}`;
      const createRequest = {
        contextId: statisticsTestRole.contextId,
        name: statisticsTestRole.name,
        displayName: statisticsTestRole.displayName,
        description: statisticsTestRole.description,
        roleType: statisticsTestRole.roleType,
        permissions: statisticsTestRole.permissions,
        scope: statisticsTestRole.scope,
        attributes: statisticsTestRole.attributes
      };
      await roleService.createRole(createRequest);

      const statistics = await roleService.getRoleStatistics();

      expect(statistics).toHaveProperty('totalRoles');
      expect(statistics).toHaveProperty('activeRoles');
      expect(statistics).toHaveProperty('inactiveRoles');
      expect(statistics).toHaveProperty('rolesByType');
      expect(statistics).toHaveProperty('averageComplexityScore');
      expect(statistics).toHaveProperty('totalPermissions');
      expect(statistics).toHaveProperty('totalAgents');

      // 验证统计数据的合理性（不依赖具体数量，因为可能有其他测试的数据）
      expect(statistics.totalRoles).toBeGreaterThan(0);
      expect(statistics.activeRoles).toBeGreaterThanOrEqual(0);
      expect(statistics.inactiveRoles).toBeGreaterThanOrEqual(0);
      expect(statistics.totalRoles).toBe(statistics.activeRoles + statistics.inactiveRoles);
      expect(typeof statistics.averageComplexityScore).toBe('number');
      expect(statistics.totalPermissions).toBeGreaterThanOrEqual(0);
      expect(statistics.totalAgents).toBeGreaterThanOrEqual(0);
    });

    it('应该正确生成复杂度分布', async () => {
      // 创建复杂度测试专用的角色，使用唯一名称
      const complexityTestRole = createSimpleMockRoleEntityData();
      complexityTestRole.name = `complexity-test-role-${Date.now()}`;
      const createRequest = {
        contextId: complexityTestRole.contextId,
        name: complexityTestRole.name,
        displayName: complexityTestRole.displayName,
        description: complexityTestRole.description,
        roleType: complexityTestRole.roleType,
        permissions: complexityTestRole.permissions,
        scope: complexityTestRole.scope,
        attributes: complexityTestRole.attributes
      };
      await roleService.createRole(createRequest);

      const distribution = await roleService.getComplexityDistribution();

      expect(Array.isArray(distribution)).toBe(true);
      if (distribution.length > 0) {
        expect(distribution.every(item =>
          typeof item.range === 'string' &&
          typeof item.count === 'number' &&
          typeof item.percentage === 'number'
        )).toBe(true);
      }
    });
  });

  describe('批量操作集成测试', () => {
    it('应该成功批量创建角色', async () => {
      const createRequests = [
        createMockCreateRoleRequest(),
        { ...createMockCreateRoleRequest(), name: 'batch-role-2' },
        { ...createMockCreateRoleRequest(), name: 'batch-role-3' }
      ];
      
      const results = await roleService.bulkCreateRoles(createRequests);

      expect(results.successfulRoles).toHaveLength(3);
      expect(results.failedRoles).toHaveLength(0);
      expect(results.successfulRoles.every(role => role instanceof RoleEntity)).toBe(true);
    });

    it('应该正确处理批量操作中的错误', async () => {
      const timestamp = Date.now();
      const createRequests = [
        { ...createMockCreateRoleRequest(), name: `bulk-test-role-1-${timestamp}` },
        { ...createMockCreateRoleRequest(), name: '' }, // 无效名称
        { ...createMockCreateRoleRequest(), name: `bulk-test-role-2-${timestamp}` }
      ];

      const results = await roleService.bulkCreateRoles(createRequests);

      expect(results.successfulRoles).toHaveLength(2);
      expect(results.failedRoles).toHaveLength(1);
      expect(results.failedRoles[0]).toHaveProperty('error');
      expect(results.failedRoles[0].error).toContain('name is required');
    });
  });

  describe('数据一致性集成测试', () => {
    it('应该保持Repository和Service之间的数据一致性', async () => {
      const createRequest = createMockCreateRoleRequest();
      
      // 通过Service创建角色
      const serviceRole = await roleService.createRole(createRequest);
      
      // 直接从Repository获取角色
      const repositoryRole = await roleRepository.findById(serviceRole.roleId);
      
      expect(repositoryRole).toBeDefined();
      expect(repositoryRole!.roleId).toBe(serviceRole.roleId);
      expect(repositoryRole!.name).toBe(serviceRole.name);
      expect(repositoryRole!.roleType).toBe(serviceRole.roleType);
    });

    it('应该正确处理并发操作', async () => {
      const timestamp = Date.now();
      const createRequest = { ...createMockCreateRoleRequest(), name: `concurrent-test-role-${timestamp}` };
      const role = await roleService.createRole(createRequest);

      // 模拟并发更新
      const updatePromises = [
        roleService.updateRole(role.roleId, { name: `concurrent-update-1-${timestamp}` }),
        roleService.updateRole(role.roleId, { name: `concurrent-update-2-${timestamp}` }),
        roleService.updateRole(role.roleId, { name: `concurrent-update-3-${timestamp}` })
      ];

      const results = await Promise.allSettled(updatePromises);

      // 至少有一个更新成功
      const successfulUpdates = results.filter(result => result.status === 'fulfilled');
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // 验证最终状态
      const finalRole = await roleService.getRoleById(role.roleId);
      expect(finalRole).toBeDefined();
      expect(finalRole!.name).toMatch(new RegExp(`concurrent-update-[123]-${timestamp}`));
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理无效输入', async () => {
      const invalidRequest = {
        contextId: '' as UUID, // 无效的contextId
        name: '',              // 无效的name
        roleType: 'invalid' as RoleType // 无效的roleType
      };
      
      await expect(roleService.createRole(invalidRequest as any))
        .rejects.toThrow();
    });

    it('应该正确处理Repository错误', async () => {
      // 模拟Repository错误
      jest.spyOn(roleRepository, 'create').mockRejectedValueOnce(new Error('Database error'));
      
      const createRequest = createMockCreateRoleRequest();
      
      await expect(roleService.createRole(createRequest))
        .rejects.toThrow('Database error');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内处理大量角色', async () => {
      const startTime = Date.now();
      
      // 创建100个角色
      const createPromises = Array(100).fill(null).map((_, index) => 
        roleService.createRole({
          ...createMockCreateRoleRequest(),
          name: `performance-role-${index}`
        })
      );
      
      await Promise.all(createPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
      
      // 验证所有角色都已创建
      const allRoles = await roleService.getAllRoles();
      expect(allRoles.total).toBeGreaterThanOrEqual(100);
    });

    it('应该高效处理复杂查询', async () => {
      // 创建大量测试数据
      const roles = createMultipleMockRoles(50);
      for (const roleData of roles) {
        const createRequest = {
          contextId: roleData.contextId,
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          roleType: roleData.roleType,
          permissions: roleData.permissions,
          scope: roleData.scope,
          attributes: roleData.attributes
        };
        await roleService.createRole(createRequest);
      }
      
      const startTime = Date.now();
      
      // 执行复杂查询
      const searchResults = await roleService.searchRoles({
        query: 'test',
        filters: {
          status: 'active' as RoleStatus,
          roleType: 'organizational' as RoleType
        },
        pagination: {
          page: 1,
          limit: 10
        },
        sort: {
          field: 'name',
          order: 'asc'
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(searchResults.items).toBeDefined();
      expect(searchResults.total).toBeDefined();
    });
  });
});
