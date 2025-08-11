/**
 * Role Repository单元测试
 * 
 * 基于Schema驱动测试原则，测试RoleRepository的所有数据访问功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleRepository } from '../../../src/modules/role/infrastructure/repositories/role.repository';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
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

describe('RoleRepository', () => {
  let repository: RoleRepository;

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

  // 辅助函数：创建有效的Role
  const createValidRole = (overrides: Partial<any> = {}): Role => {
    const defaultContextId = TestDataFactory.Base.generateUUID();
    const now = new Date().toISOString();

    // 设置默认值
    const defaults = {
      role_id: TestDataFactory.Base.generateUUID(),
      context_id: defaultContextId,
      protocol_version: '1.0.0',
      name: `test-role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role_type: 'functional' as RoleType,
      status: 'active' as RoleStatus,
      permissions: [createValidPermission()],
      timestamp: now,
      created_at: now,
      updated_at: now,
      display_name: 'Test Role',
      description: 'A test role for unit testing',
      scope: {
        level: 'context' as ScopeLevel,
        resource_types: ['context' as ResourceType],
        constraints: {}
      } as RoleScope,
      inheritance: undefined as RoleInheritance | undefined,
      delegation: undefined as RoleDelegation | undefined,
      attributes: {
        department: 'engineering',
        custom_attributes: {}
      } as RoleAttributes,
      validation_rules: undefined,
      audit_settings: undefined
    };

    // 应用overrides
    const params = { ...defaults, ...overrides };

    // 确保context_id不为空
    if (!params.context_id) {
      params.context_id = defaultContextId;
    }

    // 使用位置参数调用构造函数（按照Role构造函数的签名）
    return new Role(
      params.role_id,
      params.context_id,
      params.protocol_version,
      params.name,
      params.role_type,
      params.status,
      params.permissions,
      params.timestamp,
      params.created_at,
      params.updated_at,
      params.display_name,
      params.description,
      params.scope,
      params.inheritance,
      params.delegation,
      params.attributes,
      params.validation_rules,
      params.audit_settings
    );
  };

  beforeEach(() => {
    repository = new RoleRepository();
  });

  describe('save', () => {
    it('应该成功保存角色', async () => {
      // 准备测试数据
      const role = createValidRole();
      
      // 执行测试
      await repository.save(role);
      
      // 验证结果
      const savedRole = await repository.findById(role.role_id);
      expect(savedRole).toBeDefined();
      expect(savedRole?.role_id).toBe(role.role_id);
      expect(savedRole?.name).toBe(role.name);
    });

    it('应该覆盖已存在的角色', async () => {
      // 准备测试数据
      const role1 = createValidRole({ name: 'original-name' });
      const role2 = createValidRole({ 
        role_id: role1.role_id, 
        name: 'updated-name' 
      });
      
      // 执行测试
      await repository.save(role1);
      await repository.save(role2);
      
      // 验证结果
      const savedRole = await repository.findById(role1.role_id);
      expect(savedRole?.name).toBe('updated-name');
    });

    it('应该处理大量角色保存', async () => {
      // 准备测试数据
      const roles: Role[] = [];
      for (let i = 0; i < 100; i++) {
        roles.push(createValidRole({ name: `role-${i}` }));
      }
      
      // 执行测试
      const startTime = Date.now();
      for (const role of roles) {
        await repository.save(role);
      }
      const endTime = Date.now();
      
      // 验证性能
      expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.REPOSITORY_BATCH_SAVE_MS);
      
      // 验证结果
      for (const role of roles) {
        const savedRole = await repository.findById(role.role_id);
        expect(savedRole).toBeDefined();
      }
    });
  });

  describe('findById', () => {
    it('应该成功查找存在的角色', async () => {
      // 准备测试数据
      const role = createValidRole();
      await repository.save(role);
      
      // 执行测试
      const foundRole = await repository.findById(role.role_id);
      
      // 验证结果
      expect(foundRole).toBeDefined();
      expect(foundRole?.role_id).toBe(role.role_id);
      expect(foundRole?.name).toBe(role.name);
      expect(foundRole?.role_type).toBe(role.role_type);
    });

    it('应该返回null当角色不存在', async () => {
      // 执行测试
      const nonExistentId = TestDataFactory.Base.generateUUID();
      const foundRole = await repository.findById(nonExistentId);
      
      // 验证结果
      expect(foundRole).toBeNull();
    });

    it('应该处理无效的ID格式', async () => {
      // 执行测试
      const foundRole = await repository.findById('invalid-id');
      
      // 验证结果
      expect(foundRole).toBeNull();
    });
  });

  describe('findByName', () => {
    it('应该成功查找存在的角色', async () => {
      // 准备测试数据
      const role = createValidRole({ name: 'unique-role-name' });
      await repository.save(role);
      
      // 执行测试
      const foundRole = await repository.findByName('unique-role-name');
      
      // 验证结果
      expect(foundRole).toBeDefined();
      expect(foundRole?.name).toBe('unique-role-name');
      expect(foundRole?.role_id).toBe(role.role_id);
    });

    it('应该支持按上下文ID过滤', async () => {
      // 准备测试数据
      const contextId1 = TestDataFactory.Base.generateUUID();
      const contextId2 = TestDataFactory.Base.generateUUID();
      const role1 = createValidRole({ name: 'same-name', context_id: contextId1 });
      const role2 = createValidRole({ name: 'same-name', context_id: contextId2 });
      
      await repository.save(role1);
      await repository.save(role2);
      
      // 执行测试
      const foundRole1 = await repository.findByName('same-name', contextId1);
      const foundRole2 = await repository.findByName('same-name', contextId2);
      
      // 验证结果
      expect(foundRole1?.context_id).toBe(contextId1);
      expect(foundRole2?.context_id).toBe(contextId2);
      expect(foundRole1?.role_id).not.toBe(foundRole2?.role_id);
    });

    it('应该返回null当角色不存在', async () => {
      // 执行测试
      const foundRole = await repository.findByName('non-existent-role');
      
      // 验证结果
      expect(foundRole).toBeNull();
    });

    it('应该处理空字符串名称', async () => {
      // 执行测试
      const foundRole = await repository.findByName('');
      
      // 验证结果
      expect(foundRole).toBeNull();
    });
  });

  describe('findByContextId', () => {
    it('应该成功查找指定上下文的角色', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const role1 = createValidRole({ context_id: contextId });
      const role2 = createValidRole({ context_id: contextId });
      const role3 = createValidRole(); // 不同的context_id

      await repository.save(role1);
      await repository.save(role2);
      await repository.save(role3);

      // 执行测试
      const roles = await repository.findByContextId(contextId);

      // 验证结果
      expect(roles).toHaveLength(2);
      expect(roles.every(role => role.context_id === contextId)).toBe(true);
    });

    it('应该返回空数组当没有匹配的角色', async () => {
      // 执行测试
      const nonExistentContextId = TestDataFactory.Base.generateUUID();
      const roles = await repository.findByContextId(nonExistentContextId);

      // 验证结果
      expect(roles).toEqual([]);
    });
  });

  describe('findActiveRoles', () => {
    it('应该成功查找活跃角色', async () => {
      // 准备测试数据
      const activeRole1 = createValidRole({ status: 'active' });
      const activeRole2 = createValidRole({ status: 'active' });
      const inactiveRole = createValidRole({ status: 'inactive' });

      await repository.save(activeRole1);
      await repository.save(activeRole2);
      await repository.save(inactiveRole);

      // 执行测试
      const activeRoles = await repository.findActiveRoles();

      // 验证结果
      expect(activeRoles).toHaveLength(2);
      expect(activeRoles.every(role => role.status === 'active')).toBe(true);
    });

    it('应该支持按上下文ID过滤', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const activeRole1 = createValidRole({ status: 'active', context_id: contextId });
      const activeRole2 = createValidRole({ status: 'active' }); // 不同context_id

      await repository.save(activeRole1);
      await repository.save(activeRole2);

      // 执行测试
      const activeRoles = await repository.findActiveRoles(contextId);

      // 验证结果
      expect(activeRoles).toHaveLength(1);
      expect(activeRoles[0].context_id).toBe(contextId);
    });

    it('应该返回空数组当没有活跃角色', async () => {
      // 准备测试数据
      const inactiveRole = createValidRole({ status: 'inactive' });
      await repository.save(inactiveRole);

      // 执行测试
      const activeRoles = await repository.findActiveRoles();

      // 验证结果
      expect(activeRoles).toEqual([]);
    });
  });

  describe('findByFilter', () => {
    beforeEach(async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const roles = [
        createValidRole({ name: 'admin', role_type: 'system', status: 'active', context_id: contextId }),
        createValidRole({ name: 'user', role_type: 'functional', status: 'active', context_id: contextId }),
        createValidRole({ name: 'guest', role_type: 'functional', status: 'inactive', context_id: contextId }),
        createValidRole({ name: 'manager', role_type: 'organizational', status: 'active', context_id: contextId })
      ];

      for (const role of roles) {
        await repository.save(role);
      }
    });

    it('应该支持无过滤条件的查询', async () => {
      // 执行测试
      const result = await repository.findByFilter({});

      // 验证结果
      expect(result.items).toHaveLength(4);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('应该支持按类型过滤', async () => {
      // 执行测试
      const result = await repository.findByFilter({
        role_type: 'functional'
      });

      // 验证结果
      expect(result.items).toHaveLength(2);
      expect(result.items.every(role => role.role_type === 'functional')).toBe(true);
    });

    it('应该支持按状态过滤', async () => {
      // 执行测试
      const result = await repository.findByFilter({
        status: 'active'
      });

      // 验证结果
      expect(result.items).toHaveLength(3);
      expect(result.items.every(role => role.status === 'active')).toBe(true);
    });

    it('应该支持分页', async () => {
      // 执行测试
      const result = await repository.findByFilter({}, { page: 1, limit: 2 });

      // 验证结果
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total_pages).toBe(2);
    });

    it('应该支持组合过滤条件', async () => {
      // 执行测试
      const result = await repository.findByFilter({
        role_type: 'functional',
        status: 'active'
      });

      // 验证结果
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('user');
    });
  });

  describe('delete', () => {
    it('应该成功删除存在的角色', async () => {
      // 准备测试数据
      const role = createValidRole();
      await repository.save(role);

      // 验证角色存在
      expect(await repository.findById(role.role_id)).toBeDefined();

      // 执行测试
      await repository.delete(role.role_id);

      // 验证结果
      expect(await repository.findById(role.role_id)).toBeNull();
    });

    it('应该处理删除不存在的角色', async () => {
      // 执行测试 - 不应该抛出错误
      const nonExistentId = TestDataFactory.Base.generateUUID();
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('应该返回true当角色存在', async () => {
      // 准备测试数据
      const role = createValidRole();
      await repository.save(role);
      
      // 执行测试
      const exists = await repository.exists(role.role_id);
      
      // 验证结果
      expect(exists).toBe(true);
    });

    it('应该返回false当角色不存在', async () => {
      // 执行测试
      const nonExistentId = TestDataFactory.Base.generateUUID();
      const exists = await repository.exists(nonExistentId);
      
      // 验证结果
      expect(exists).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('应该返回正确的角色统计信息', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const roles = [
        createValidRole({ role_type: 'system', status: 'active', context_id: contextId }),
        createValidRole({ role_type: 'functional', status: 'active', context_id: contextId }),
        createValidRole({ role_type: 'functional', status: 'inactive', context_id: contextId })
      ];

      for (const role of roles) {
        await repository.save(role);
      }

      // 执行测试
      const stats = await repository.getStatistics(contextId);

      // 验证结果
      expect(stats.total).toBe(3);
      expect(stats.active_count).toBe(2);
      expect(stats.by_type.system).toBe(1);
      expect(stats.by_type.functional).toBe(2);
      expect(stats.by_status.active).toBe(2);
      expect(stats.by_status.inactive).toBe(1);
    });

    it('应该返回空统计当没有角色', async () => {
      // 执行测试
      const stats = await repository.getStatistics();

      // 验证结果
      expect(stats.total).toBe(0);
      expect(stats.active_count).toBe(0);
    });
  });

  describe('isNameUnique', () => {
    it('应该返回true当名称唯一', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'unique-name', context_id: contextId });
      await repository.save(role);

      // 执行测试
      const isUnique = await repository.isNameUnique('different-name', contextId);

      // 验证结果
      expect(isUnique).toBe(true);
    });

    it('应该返回false当名称已存在', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'existing-name', context_id: contextId });
      await repository.save(role);

      // 执行测试
      const isUnique = await repository.isNameUnique('existing-name', contextId);

      // 验证结果
      expect(isUnique).toBe(false);
    });

    it('应该支持排除指定角色ID', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const role = createValidRole({ name: 'test-name', context_id: contextId });
      await repository.save(role);

      // 执行测试 - 排除自己
      const isUnique = await repository.isNameUnique('test-name', contextId, role.role_id);

      // 验证结果
      expect(isUnique).toBe(true);
    });
  });
});
