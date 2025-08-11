/**
 * RoleCacheService真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleCacheService } from '../../../src/modules/role/infrastructure/cache/role-cache.service';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import { 
  Permission,
  PermissionCheckResult,
  RoleType,
  RoleStatus,
  ResourceType,
  PermissionAction,
  GrantType
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleCacheService真实实现单元测试', () => {
  let cacheService: RoleCacheService;

  beforeEach(() => {
    cacheService = new RoleCacheService();
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

  describe('角色缓存功能 - getRole/setRole', () => {
    it('应该成功缓存和获取角色', () => {
      const role = createValidRole();

      cacheService.setRole(role.roleId, role);
      const cachedRole = cacheService.getRole(role.roleId);

      expect(cachedRole).toBe(role);
    });

    it('应该返回null对于不存在的角色', () => {
      const nonExistentId = TestDataFactory.Base.generateUUID();

      const cachedRole = cacheService.getRole(nonExistentId);

      expect(cachedRole).toBeNull();
    });

    it('应该支持自定义TTL', () => {
      const role = createValidRole();
      const customTTL = 1000; // 1秒

      cacheService.setRole(role.roleId, role, customTTL);
      const cachedRole = cacheService.getRole(role.roleId);

      expect(cachedRole).toBe(role);
    });

    it('应该在TTL过期后返回null', async () => {
      const role = createValidRole();
      const shortTTL = 10; // 10毫秒

      cacheService.setRole(role.roleId, role, shortTTL);

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 20));

      const cachedRole = cacheService.getRole(role.roleId);
      expect(cachedRole).toBeNull();
    });

    it('应该处理缓存大小限制', () => {
      // 创建大量角色以触发缓存淘汰
      const roles: Role[] = [];
      for (let i = 0; i < 10005; i++) { // 超过MAX_CACHE_SIZE (10000)
        const role = createValidRole({ name: `Role ${i}` });
        roles.push(role);
        cacheService.setRole(role.roleId, role);
      }

      // 验证缓存大小不超过限制
      const stats = cacheService.getStats();
      expect(stats.roleCache.size).toBeLessThanOrEqual(10000);
    });

    it('应该覆盖已存在的缓存项', () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const role1 = createValidRole({ roleId, name: 'Original Role' });
      const role2 = createValidRole({ roleId, name: 'Updated Role' });

      cacheService.setRole(roleId, role1);
      cacheService.setRole(roleId, role2);

      const cachedRole = cacheService.getRole(roleId);
      expect(cachedRole).toBe(role2);
      expect(cachedRole?.name).toBe('Updated Role');
    });
  });

  describe('权限检查缓存功能 - getPermissionCheck/setPermissionCheck', () => {
    it('应该成功缓存和获取权限检查结果', () => {
      const key = {
        roleId: TestDataFactory.Base.generateUUID(),
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };
      const result: PermissionCheckResult = {
        allowed: true,
        reason: 'Direct permission',
        evaluated_at: new Date().toISOString()
      };

      cacheService.setPermissionCheck(key, result);
      const cachedResult = cacheService.getPermissionCheck(key);

      expect(cachedResult).toEqual(result);
    });

    it('应该返回null对于不存在的权限检查', () => {
      const key = {
        roleId: TestDataFactory.Base.generateUUID(),
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };

      const cachedResult = cacheService.getPermissionCheck(key);

      expect(cachedResult).toBeNull();
    });

    it('应该在TTL过期后返回null', async () => {
      const key = {
        roleId: TestDataFactory.Base.generateUUID(),
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };
      const result: PermissionCheckResult = {
        allowed: true,
        reason: 'Direct permission',
        evaluated_at: new Date().toISOString()
      };
      const shortTTL = 10; // 10毫秒

      cacheService.setPermissionCheck(key, result, shortTTL);

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 20));

      const cachedResult = cacheService.getPermissionCheck(key);
      expect(cachedResult).toBeNull();
    });

    it('应该处理不同的权限检查键', () => {
      const baseKey = {
        roleId: TestDataFactory.Base.generateUUID(),
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };

      const key1 = { ...baseKey };
      const key2 = { ...baseKey, action: 'update' };
      const key3 = { ...baseKey, resourceType: 'plan' };

      const result1: PermissionCheckResult = { allowed: true, reason: 'Read permission', evaluated_at: new Date().toISOString() };
      const result2: PermissionCheckResult = { allowed: false, reason: 'No update permission', evaluated_at: new Date().toISOString() };
      const result3: PermissionCheckResult = { allowed: true, reason: 'Plan permission', evaluated_at: new Date().toISOString() };

      cacheService.setPermissionCheck(key1, result1);
      cacheService.setPermissionCheck(key2, result2);
      cacheService.setPermissionCheck(key3, result3);

      expect(cacheService.getPermissionCheck(key1)).toEqual(result1);
      expect(cacheService.getPermissionCheck(key2)).toEqual(result2);
      expect(cacheService.getPermissionCheck(key3)).toEqual(result3);
    });
  });

  describe('有效权限缓存功能 - getEffectivePermissions/setEffectivePermissions', () => {
    it('应该成功缓存和获取有效权限', () => {
      const userId = TestDataFactory.Base.generateUUID();
      const permissions = [
        createValidPermission({ resource_type: 'context', actions: ['read'] }),
        createValidPermission({ resource_type: 'plan', actions: ['update'] })
      ];

      cacheService.setEffectivePermissions(userId, permissions);
      const cachedPermissions = cacheService.getEffectivePermissions(userId);

      expect(cachedPermissions).toEqual(permissions);
    });

    it('应该支持上下文特定的权限缓存', () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];

      cacheService.setEffectivePermissions(userId, permissions, contextId);
      const cachedPermissions = cacheService.getEffectivePermissions(userId, contextId);

      expect(cachedPermissions).toEqual(permissions);
    });

    it('应该区分不同上下文的权限', () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId1 = TestDataFactory.Base.generateUUID();
      const contextId2 = TestDataFactory.Base.generateUUID();
      
      const permissions1 = [createValidPermission({ resource_type: 'context' })];
      const permissions2 = [createValidPermission({ resource_type: 'plan' })];

      cacheService.setEffectivePermissions(userId, permissions1, contextId1);
      cacheService.setEffectivePermissions(userId, permissions2, contextId2);

      expect(cacheService.getEffectivePermissions(userId, contextId1)).toEqual(permissions1);
      expect(cacheService.getEffectivePermissions(userId, contextId2)).toEqual(permissions2);
    });

    it('应该返回null对于不存在的有效权限', () => {
      const userId = TestDataFactory.Base.generateUUID();

      const cachedPermissions = cacheService.getEffectivePermissions(userId);

      expect(cachedPermissions).toBeNull();
    });

    it('应该在TTL过期后返回null', async () => {
      const userId = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];
      const shortTTL = 10; // 10毫秒

      cacheService.setEffectivePermissions(userId, permissions, undefined, shortTTL);

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 20));

      const cachedPermissions = cacheService.getEffectivePermissions(userId);
      expect(cachedPermissions).toBeNull();
    });
  });

  describe('缓存失效功能 - invalidateRole/invalidateUserPermissions', () => {
    it('应该成功失效角色缓存', () => {
      const role = createValidRole();

      cacheService.setRole(role.roleId, role);
      expect(cacheService.getRole(role.roleId)).toBe(role);

      cacheService.invalidateRole(role.roleId);
      expect(cacheService.getRole(role.roleId)).toBeNull();
    });

    it('应该失效相关的权限检查缓存', () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const key = {
        roleId,
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };
      const result: PermissionCheckResult = {
        allowed: true,
        reason: 'Direct permission',
        evaluated_at: new Date().toISOString()
      };

      cacheService.setPermissionCheck(key, result);
      expect(cacheService.getPermissionCheck(key)).toEqual(result);

      cacheService.invalidateRole(roleId);
      expect(cacheService.getPermissionCheck(key)).toBeNull();
    });

    it('应该成功失效用户权限缓存', () => {
      const userId = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];

      cacheService.setEffectivePermissions(userId, permissions);
      expect(cacheService.getEffectivePermissions(userId)).toEqual(permissions);

      cacheService.invalidateUserPermissions(userId);
      expect(cacheService.getEffectivePermissions(userId)).toBeNull();
    });

    it('应该失效用户在所有上下文中的权限缓存', () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId1 = TestDataFactory.Base.generateUUID();
      const contextId2 = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];

      cacheService.setEffectivePermissions(userId, permissions, contextId1);
      cacheService.setEffectivePermissions(userId, permissions, contextId2);

      cacheService.invalidateUserPermissions(userId);

      expect(cacheService.getEffectivePermissions(userId, contextId1)).toBeNull();
      expect(cacheService.getEffectivePermissions(userId, contextId2)).toBeNull();
    });

    it('应该只失效指定用户的权限缓存', () => {
      const userId1 = TestDataFactory.Base.generateUUID();
      const userId2 = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];

      cacheService.setEffectivePermissions(userId1, permissions);
      cacheService.setEffectivePermissions(userId2, permissions);

      cacheService.invalidateUserPermissions(userId1);

      expect(cacheService.getEffectivePermissions(userId1)).toBeNull();
      expect(cacheService.getEffectivePermissions(userId2)).toEqual(permissions);
    });
  });

  describe('缓存管理功能 - clearAll/getStats', () => {
    it('应该清除所有缓存', () => {
      const role = createValidRole();
      const userId = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];
      const key = {
        roleId: role.roleId,
        resourceType: 'context',
        resourceId: TestDataFactory.Base.generateUUID(),
        action: 'read',
        contextHash: 'test-hash'
      };
      const result: PermissionCheckResult = {
        allowed: true,
        reason: 'Direct permission',
        evaluated_at: new Date().toISOString()
      };

      // 添加各种缓存项
      cacheService.setRole(role.roleId, role);
      cacheService.setPermissionCheck(key, result);
      cacheService.setEffectivePermissions(userId, permissions);

      // 验证缓存项存在
      expect(cacheService.getRole(role.roleId)).toBe(role);
      expect(cacheService.getPermissionCheck(key)).toEqual(result);
      expect(cacheService.getEffectivePermissions(userId)).toEqual(permissions);

      // 清除所有缓存
      cacheService.clearAll();

      // 验证所有缓存项都被清除
      expect(cacheService.getRole(role.roleId)).toBeNull();
      expect(cacheService.getPermissionCheck(key)).toBeNull();
      expect(cacheService.getEffectivePermissions(userId)).toBeNull();
    });

    it('应该返回缓存统计信息', () => {
      const role = createValidRole();
      const userId = TestDataFactory.Base.generateUUID();
      const permissions = [createValidPermission()];

      cacheService.setRole(role.roleId, role);
      cacheService.setEffectivePermissions(userId, permissions);

      const stats = cacheService.getStats();

      expect(stats).toHaveProperty('roleCache');
      expect(stats).toHaveProperty('permissionCache');
      expect(stats).toHaveProperty('effectivePermissionsCache');

      expect(stats.roleCache.size).toBe(1);
      expect(stats.effectivePermissionsCache.size).toBe(1);
      expect(typeof stats.roleCache.hitRate).toBe('number');
      expect(typeof stats.permissionCache.hitRate).toBe('number');
      expect(typeof stats.effectivePermissionsCache.hitRate).toBe('number');
    });

    it('应该显示正确的缓存大小', () => {
      const roles = Array.from({ length: 5 }, () => createValidRole());
      const users = Array.from({ length: 3 }, () => TestDataFactory.Base.generateUUID());
      const permissions = [createValidPermission()];

      // 添加角色缓存
      roles.forEach(role => cacheService.setRole(role.roleId, role));

      // 添加有效权限缓存
      users.forEach(userId => cacheService.setEffectivePermissions(userId, permissions));

      const stats = cacheService.getStats();

      expect(stats.roleCache.size).toBe(5);
      expect(stats.effectivePermissionsCache.size).toBe(3);
    });
  });

  describe('上下文哈希功能 - generateContextHash', () => {
    it('应该为相同上下文生成相同哈希', () => {
      const context = { userId: '123', department: 'engineering', level: 'senior' };

      const hash1 = cacheService.generateContextHash(context);
      const hash2 = cacheService.generateContextHash(context);

      expect(hash1).toBe(hash2);
    });

    it('应该为不同上下文生成不同哈希', () => {
      const context1 = { userId: '123', department: 'engineering' };
      const context2 = { userId: '123', department: 'marketing' };

      const hash1 = cacheService.generateContextHash(context1);
      const hash2 = cacheService.generateContextHash(context2);

      expect(hash1).not.toBe(hash2);
    });

    it('应该处理键顺序不同的相同上下文', () => {
      const context1 = { userId: '123', department: 'engineering', level: 'senior' };
      const context2 = { level: 'senior', userId: '123', department: 'engineering' };

      const hash1 = cacheService.generateContextHash(context1);
      const hash2 = cacheService.generateContextHash(context2);

      expect(hash1).toBe(hash2);
    });

    it('应该处理空上下文', () => {
      const emptyContext = {};

      const hash = cacheService.generateContextHash(emptyContext);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('应该处理复杂的上下文对象', () => {
      const complexContext = {
        userId: '123',
        permissions: ['read', 'write'],
        metadata: { created: '2025-01-01', version: 1 },
        settings: { theme: 'dark', language: 'en' }
      };

      const hash = cacheService.generateContextHash(complexContext);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('边缘情况和性能测试', () => {
    it('应该处理大量缓存项的性能', () => {
      const startTime = performance.now();

      // 添加大量角色缓存
      for (let i = 0; i < 1000; i++) {
        const role = createValidRole({ name: `Role ${i}` });
        cacheService.setRole(role.roleId, role);
      }

      // 添加大量权限检查缓存
      for (let i = 0; i < 1000; i++) {
        const key = {
          roleId: TestDataFactory.Base.generateUUID(),
          resourceType: 'context',
          resourceId: TestDataFactory.Base.generateUUID(),
          action: 'read',
          contextHash: `hash-${i}`
        };
        const result: PermissionCheckResult = {
          allowed: true,
          reason: `Permission ${i}`,
          evaluated_at: new Date().toISOString()
        };
        cacheService.setPermissionCheck(key, result);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该处理并发缓存操作', async () => {
      const roles = Array.from({ length: 100 }, () => createValidRole());

      // 并发设置缓存
      const setPromises = roles.map(role =>
        Promise.resolve(cacheService.setRole(role.roleId, role))
      );
      await Promise.all(setPromises);

      // 并发获取缓存
      const getPromises = roles.map(role =>
        Promise.resolve(cacheService.getRole(role.roleId))
      );
      const results = await Promise.all(getPromises);

      expect(results).toHaveLength(100);
      expect(results.every(result => result !== null)).toBe(true);
    });

    it('应该处理缓存淘汰机制', () => {
      // 添加超过限制的缓存项
      const roles: Role[] = [];
      for (let i = 0; i < 10005; i++) {
        const role = createValidRole({ name: `Role ${i}` });
        roles.push(role);
        cacheService.setRole(role.roleId, role);
      }

      const stats = cacheService.getStats();
      expect(stats.roleCache.size).toBeLessThanOrEqual(10000);

      // 验证最新的角色仍然在缓存中
      const lastRole = roles[roles.length - 1];
      expect(cacheService.getRole(lastRole.roleId)).toBe(lastRole);
    });

    it('应该处理TTL边界情况', async () => {
      const role = createValidRole();
      const veryShortTTL = 1; // 1毫秒

      cacheService.setRole(role.roleId, role, veryShortTTL);

      // 立即获取应该成功
      expect(cacheService.getRole(role.roleId)).toBe(role);

      // 等待TTL过期
      await new Promise(resolve => setTimeout(resolve, 5));

      // 过期后应该返回null
      expect(cacheService.getRole(role.roleId)).toBeNull();
    });

    it('应该处理特殊字符的缓存键', () => {
      const specialContext = {
        'user-id': '123',
        'department/team': 'eng/backend',
        'level@company': 'senior@acme',
        'permissions[]': ['read', 'write']
      };

      const hash = cacheService.generateContextHash(specialContext);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });
});
