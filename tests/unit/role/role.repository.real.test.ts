/**
 * RoleRepository真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleRepository } from '../../../src/modules/role/infrastructure/repositories/role.repository';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import { 
  RoleFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../../src/modules/role/domain/repositories/role-repository.interface';
import { 
  RoleType, 
  RoleStatus, 
  Permission,
  ResourceType,
  PermissionAction,
  GrantType
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleRepository真实实现单元测试', () => {
  let repository: RoleRepository;

  beforeEach(() => {
    repository = new RoleRepository();
  });

  // 辅助函数：创建有效的Role实例
  const createValidRole = (overrides: {
    roleId?: string;
    contextId?: string;
    name?: string;
    roleType?: RoleType;
    status?: RoleStatus;
    permissions?: Permission[];
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

  describe('save - 真实保存实现', () => {
    it('应该成功保存角色', async () => {
      const role = createValidRole();

      await repository.save(role);

      // 验证角色已保存
      const savedRole = await repository.findById(role.roleId);
      expect(savedRole).toBe(role);
    });

    it('应该覆盖已存在的角色', async () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role1 = createValidRole({ roleId, name: 'Original Role' });
      const role2 = createValidRole({ roleId, name: 'Updated Role' });

      await repository.save(role1);
      await repository.save(role2);

      const savedRole = await repository.findById(roleId);
      expect(savedRole).toBe(role2);
      expect(savedRole?.name).toBe('Updated Role');
    });

    it('应该处理多个不同角色的保存', async () => {
      const roles = [
        createValidRole({ name: 'Role 1' }),
        createValidRole({ name: 'Role 2' }),
        createValidRole({ name: 'Role 3' })
      ];

      for (const role of roles) {
        await repository.save(role);
      }

      // 验证所有角色都已保存
      for (const role of roles) {
        const savedRole = await repository.findById(role.roleId);
        expect(savedRole).toBe(role);
      }
    });
  });

  describe('findById - 真实查找实现', () => {
    it('应该找到存在的角色', async () => {
      const role = createValidRole();
      await repository.save(role);

      const foundRole = await repository.findById(role.roleId);

      expect(foundRole).toBe(role);
    });

    it('应该返回null对于不存在的角色', async () => {
      const nonExistentId = TestDataFactory.Base.generateUUID();

      const foundRole = await repository.findById(nonExistentId);

      expect(foundRole).toBeNull();
    });

    it('应该处理空字符串ID', async () => {
      const foundRole = await repository.findById('');

      expect(foundRole).toBeNull();
    });
  });

  describe('findByName - 真实名称查找实现', () => {
    it('应该找到指定名称的角色', async () => {
      const role = createValidRole({ name: 'Unique Role Name' });
      await repository.save(role);

      const foundRole = await repository.findByName('Unique Role Name');

      expect(foundRole).toBe(role);
    });

    it('应该在指定上下文中查找角色', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const role1 = createValidRole({ name: 'Same Name', contextId });
      const role2 = createValidRole({ name: 'Same Name', contextId: TestDataFactory.Base.generateUUID() });

      await repository.save(role1);
      await repository.save(role2);

      const foundRole = await repository.findByName('Same Name', contextId);

      expect(foundRole).toBe(role1);
    });

    it('应该返回null对于不存在的名称', async () => {
      const foundRole = await repository.findByName('Non Existent Role');

      expect(foundRole).toBeNull();
    });

    it('应该处理大小写敏感的查找', async () => {
      const role = createValidRole({ name: 'CaseSensitive' });
      await repository.save(role);

      const foundRole1 = await repository.findByName('CaseSensitive');
      const foundRole2 = await repository.findByName('casesensitive');

      expect(foundRole1).toBe(role);
      expect(foundRole2).toBeNull(); // 大小写不匹配
    });
  });

  describe('findByContextId - 真实上下文查找实现', () => {
    it('应该找到指定上下文的所有角色', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const roles = [
        createValidRole({ contextId, name: 'Role 1' }),
        createValidRole({ contextId, name: 'Role 2' }),
        createValidRole({ contextId: TestDataFactory.Base.generateUUID(), name: 'Role 3' }) // 不同上下文
      ];

      for (const role of roles) {
        await repository.save(role);
      }

      const foundRoles = await repository.findByContextId(contextId);

      expect(foundRoles).toHaveLength(2);
      expect(foundRoles).toContain(roles[0]);
      expect(foundRoles).toContain(roles[1]);
      expect(foundRoles).not.toContain(roles[2]);
    });

    it('应该返回空数组对于不存在的上下文', async () => {
      const nonExistentContextId = TestDataFactory.Base.generateUUID();

      const foundRoles = await repository.findByContextId(nonExistentContextId);

      expect(foundRoles).toEqual([]);
    });
  });

  describe('findByFilter - 真实过滤查找实现', () => {
    beforeEach(async () => {
      // 准备测试数据
      const roles = [
        createValidRole({ 
          name: 'Admin Role', 
          roleType: 'system', 
          status: 'active',
          contextId: 'context-1'
        }),
        createValidRole({ 
          name: 'User Role', 
          roleType: 'functional', 
          status: 'active',
          contextId: 'context-1'
        }),
        createValidRole({ 
          name: 'Manager Role', 
          roleType: 'organizational', 
          status: 'inactive',
          contextId: 'context-2'
        }),
        createValidRole({ 
          name: 'Guest Role', 
          roleType: 'temporary', 
          status: 'active',
          contextId: 'context-2'
        })
      ];

      for (const role of roles) {
        await repository.save(role);
      }
    });

    it('应该按上下文ID过滤', async () => {
      const filter: RoleFilter = { context_id: 'context-1' };

      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.items.every(role => role.contextId === 'context-1')).toBe(true);
    });

    it('应该按角色类型过滤', async () => {
      const filter: RoleFilter = { role_type: 'functional' };

      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].roleType).toBe('functional');
    });

    it('应该按状态过滤', async () => {
      const filter: RoleFilter = { status: 'active' };

      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(3);
      expect(result.items.every(role => role.status === 'active')).toBe(true);
    });

    it('应该按名称模式过滤', async () => {
      const filter: RoleFilter = { name_pattern: 'Role' };

      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(4); // 所有角色名称都包含'Role'
    });

    it('应该支持组合过滤', async () => {
      const filter: RoleFilter = { 
        context_id: 'context-1',
        status: 'active'
      };

      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(2);
      expect(result.items.every(role => 
        role.contextId === 'context-1' && role.status === 'active'
      )).toBe(true);
    });

    it('应该支持分页', async () => {
      const filter: RoleFilter = {};
      const pagination: PaginationOptions = { page: 1, limit: 2 };

      const result = await repository.findByFilter(filter, pagination);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total_pages).toBe(2);
    });

    it('应该处理第二页分页', async () => {
      const filter: RoleFilter = {};
      const pagination: PaginationOptions = { page: 2, limit: 2 };

      const result = await repository.findByFilter(filter, pagination);

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(2);
    });

    it('应该处理超出范围的分页', async () => {
      const filter: RoleFilter = {};
      const pagination: PaginationOptions = { page: 10, limit: 2 };

      const result = await repository.findByFilter(filter, pagination);

      expect(result.items).toHaveLength(0);
      expect(result.page).toBe(10);
    });

    it('应该使用默认分页参数', async () => {
      const filter: RoleFilter = {};

      const result = await repository.findByFilter(filter);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findByPermission - 真实权限查找实现', () => {
    beforeEach(async () => {
      // 准备有权限的角色 - 直接在构造函数中传入权限
      const permission1 = createValidPermission({
        resource_type: 'context',
        resource_id: 'resource-1',
        actions: ['read', 'update']
      });

      const permission2 = createValidPermission({
        resource_type: 'plan',
        resource_id: 'resource-2',
        actions: ['create', 'delete']
      });

      const role1 = createValidRole({
        name: 'Role with Context Permission',
        permissions: [permission1]
      });
      const role2 = createValidRole({
        name: 'Role with Plan Permission',
        permissions: [permission2]
      });
      const role3 = createValidRole({ name: 'Role without Permissions' });

      await repository.save(role1);
      await repository.save(role2);
      await repository.save(role3);
    });

    it('应该找到具有指定权限的角色', async () => {
      const roles = await repository.findByPermission('context', 'read', 'resource-1');

      expect(roles).toHaveLength(1);
      expect(roles[0].name).toBe('Role with Context Permission');
    });

    it('应该支持通配符资源ID', async () => {
      // 创建一个具有通配符权限的角色
      const wildcardPermission = createValidPermission({
        resource_type: 'context',
        resource_id: '*', // 通配符权限
        actions: ['read']
      });

      const wildcardRole = createValidRole({
        name: 'Wildcard Role',
        permissions: [wildcardPermission]
      });

      await repository.save(wildcardRole);

      // 使用任意资源ID查找，应该匹配通配符权限
      const roles = await repository.findByPermission('context', 'read', 'any-resource-id');

      expect(roles).toHaveLength(1);
      expect(roles[0].name).toBe('Wildcard Role');
    });

    it('应该返回空数组对于不存在的权限', async () => {
      const roles = await repository.findByPermission('trace', 'admin');

      expect(roles).toEqual([]);
    });

    it('应该处理不同的资源类型', async () => {
      const contextRoles = await repository.findByPermission('context', 'read', 'resource-1');
      const planRoles = await repository.findByPermission('plan', 'create', 'resource-2');

      expect(contextRoles).toHaveLength(1);
      expect(planRoles).toHaveLength(1);
      expect(contextRoles[0].name).toBe('Role with Context Permission');
      expect(planRoles[0].name).toBe('Role with Plan Permission');
    });
  });

  describe('findActiveRoles - 真实活跃角色查找实现', () => {
    beforeEach(async () => {
      const roles = [
        createValidRole({ name: 'Active Role 1', status: 'active', contextId: 'context-1' }),
        createValidRole({ name: 'Active Role 2', status: 'active', contextId: 'context-1' }),
        createValidRole({ name: 'Inactive Role', status: 'inactive', contextId: 'context-1' }),
        createValidRole({ name: 'Active Role 3', status: 'active', contextId: 'context-2' })
      ];

      for (const role of roles) {
        await repository.save(role);
      }
    });

    it('应该找到所有活跃角色', async () => {
      const activeRoles = await repository.findActiveRoles();

      expect(activeRoles).toHaveLength(3);
      expect(activeRoles.every(role => role.status === 'active')).toBe(true);
    });

    it('应该在指定上下文中找到活跃角色', async () => {
      const activeRoles = await repository.findActiveRoles('context-1');

      expect(activeRoles).toHaveLength(2);
      expect(activeRoles.every(role =>
        role.status === 'active' && role.contextId === 'context-1'
      )).toBe(true);
    });

    it('应该返回空数组对于没有活跃角色的上下文', async () => {
      const activeRoles = await repository.findActiveRoles('non-existent-context');

      expect(activeRoles).toEqual([]);
    });
  });

  describe('update - 真实更新实现', () => {
    it('应该成功更新角色', async () => {
      const role = createValidRole({ name: 'Original Name' });
      await repository.save(role);

      // 修改角色
      role.updateStatus('inactive');

      await repository.update(role);

      const updatedRole = await repository.findById(role.roleId);
      expect(updatedRole?.status).toBe('inactive');
    });

    it('应该处理不存在角色的更新', async () => {
      const role = createValidRole();

      // 不应该抛出异常
      await expect(repository.update(role)).resolves.not.toThrow();
    });
  });

  describe('delete - 真实删除实现', () => {
    it('应该成功删除角色', async () => {
      const role = createValidRole();
      await repository.save(role);

      await repository.delete(role.roleId);

      const deletedRole = await repository.findById(role.roleId);
      expect(deletedRole).toBeNull();
    });

    it('应该处理删除不存在的角色', async () => {
      const nonExistentId = TestDataFactory.Base.generateUUID();

      // 不应该抛出异常
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });

  describe('exists - 真实存在检查实现', () => {
    it('应该返回true对于存在的角色', async () => {
      const role = createValidRole();
      await repository.save(role);

      const exists = await repository.exists(role.roleId);

      expect(exists).toBe(true);
    });

    it('应该返回false对于不存在的角色', async () => {
      const nonExistentId = TestDataFactory.Base.generateUUID();

      const exists = await repository.exists(nonExistentId);

      expect(exists).toBe(false);
    });
  });

  describe('isNameUnique - 真实名称唯一性检查实现', () => {
    it('应该返回true对于唯一的名称', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      const isUnique = await repository.isNameUnique('Unique Name', contextId);

      expect(isUnique).toBe(true);
    });

    it('应该返回false对于已存在的名称', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'Existing Name', contextId });
      await repository.save(role);

      const isUnique = await repository.isNameUnique('Existing Name', contextId);

      expect(isUnique).toBe(false);
    });

    it('应该排除指定的角色ID', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'Existing Name', contextId });
      await repository.save(role);

      const isUnique = await repository.isNameUnique('Existing Name', contextId, role.roleId);

      expect(isUnique).toBe(true); // 排除自己，所以是唯一的
    });

    it('应该在不同上下文中允许相同名称', async () => {
      const contextId1 = TestDataFactory.Base.generateUUID();
      const contextId2 = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'Same Name', contextId: contextId1 });
      await repository.save(role);

      const isUnique = await repository.isNameUnique('Same Name', contextId2);

      expect(isUnique).toBe(true);
    });
  });

  describe('getStatistics - 真实统计信息实现', () => {
    beforeEach(async () => {
      const roles = [
        createValidRole({ roleType: 'system', status: 'active', contextId: 'context-1' }),
        createValidRole({ roleType: 'functional', status: 'active', contextId: 'context-1' }),
        createValidRole({ roleType: 'functional', status: 'inactive', contextId: 'context-1' }),
        createValidRole({ roleType: 'organizational', status: 'active', contextId: 'context-2' })
      ];

      for (const role of roles) {
        await repository.save(role);
      }
    });

    it('应该返回所有角色的统计信息', async () => {
      const stats = await repository.getStatistics();

      expect(stats.total).toBe(4);
      expect(stats.active_count).toBe(3);
      expect(stats.by_type.system).toBe(1);
      expect(stats.by_type.functional).toBe(2);
      expect(stats.by_type.organizational).toBe(1);
      expect(stats.by_status.active).toBe(3);
      expect(stats.by_status.inactive).toBe(1);
    });

    it('应该返回指定上下文的统计信息', async () => {
      const stats = await repository.getStatistics('context-1');

      expect(stats.total).toBe(3);
      expect(stats.active_count).toBe(2);
      expect(stats.by_type.system).toBe(1);
      expect(stats.by_type.functional).toBe(2);
      expect(stats.by_status.active).toBe(2);
      expect(stats.by_status.inactive).toBe(1);
    });

    it('应该处理空上下文的统计', async () => {
      const stats = await repository.getStatistics('non-existent-context');

      expect(stats.total).toBe(0);
      expect(stats.active_count).toBe(0);
      expect(Object.values(stats.by_type).every(count => count === 0)).toBe(true);
      expect(Object.values(stats.by_status).every(count => count === 0)).toBe(true);
    });
  });

  describe('边缘情况和性能测试', () => {
    it('应该处理大量角色的保存和查询', async () => {
      const roles = Array.from({ length: 1000 }, (_, i) =>
        createValidRole({ name: `Role ${i}` })
      );

      const startTime = performance.now();

      // 批量保存
      for (const role of roles) {
        await repository.save(role);
      }

      // 查询所有角色
      const filter: RoleFilter = {};
      const result = await repository.findByFilter(filter, { page: 1, limit: 1000 });

      const endTime = performance.now();

      expect(result.items).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该处理复杂的过滤查询', async () => {
      // 创建复杂的测试数据
      const roles = Array.from({ length: 100 }, (_, i) =>
        createValidRole({
          name: `Role ${i}`,
          roleType: i % 2 === 0 ? 'functional' : 'organizational',
          status: i % 3 === 0 ? 'inactive' : 'active',
          contextId: `context-${i % 5}`
        })
      );

      for (const role of roles) {
        await repository.save(role);
      }

      const filter: RoleFilter = {
        role_type: 'functional',
        status: 'active',
        name_pattern: 'Role'
      };

      const result = await repository.findByFilter(filter);

      // 验证过滤结果
      expect(result.items.every(role =>
        role.roleType === 'functional' &&
        role.status === 'active' &&
        role.name.includes('Role')
      )).toBe(true);
    });

    it('应该处理并发操作', async () => {
      const roles = Array.from({ length: 50 }, () => createValidRole());

      // 并发保存
      const savePromises = roles.map(role => repository.save(role));
      await Promise.all(savePromises);

      // 并发查询
      const findPromises = roles.map(role => repository.findById(role.roleId));
      const foundRoles = await Promise.all(findPromises);

      expect(foundRoles).toHaveLength(50);
      expect(foundRoles.every(role => role !== null)).toBe(true);
    });
  });
});
