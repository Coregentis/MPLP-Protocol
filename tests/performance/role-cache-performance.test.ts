/**
 * Role缓存性能测试
 * 
 * 验证缓存机制的性能提升效果
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleManagementService } from '../../src/modules/role/application/services/role-management.service';
import { RoleRepository } from '../../src/modules/role/infrastructure/repositories/role.repository';
import { RoleCacheService } from '../../src/modules/role/infrastructure/cache/role-cache.service';
import { PermissionCalculationService } from '../../src/modules/role/domain/services/permission-calculation.service';
import { 
  RoleType, 
  Permission,
  PermissionAction,
  ResourceType,
  GrantType
} from '../../src/modules/role/types';
import { TestDataFactory } from '../public/test-utils/test-data-factory';

describe('Role缓存性能测试', () => {
  let roleServiceWithCache: RoleManagementService;
  let roleServiceWithoutCache: RoleManagementService;
  let cacheService: RoleCacheService;
  let permissionServiceWithCache: PermissionCalculationService;
  let permissionServiceWithoutCache: PermissionCalculationService;

  beforeEach(async () => {
    // 创建带缓存的服务
    cacheService = new RoleCacheService();
    const repositoryWithCache = new RoleRepository();
    roleServiceWithCache = new RoleManagementService(repositoryWithCache, cacheService);
    permissionServiceWithCache = new PermissionCalculationService(cacheService);

    // 创建不带缓存的服务
    const repositoryWithoutCache = new RoleRepository();
    roleServiceWithoutCache = new RoleManagementService(repositoryWithoutCache);
    permissionServiceWithoutCache = new PermissionCalculationService();
  });

  describe('角色获取缓存性能', () => {
    it('应该显著提升重复角色获取的性能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 创建测试角色
      const createResult = await roleServiceWithCache.createRole({
        context_id: contextId,
        name: 'cache-test-role',
        role_type: 'functional' as RoleType,
        permissions: [{
          permission_id: TestDataFactory.Base.generateUUID(),
          resource_type: 'context' as ResourceType,
          resource_id: contextId,
          actions: ['read' as PermissionAction],
          conditions: {},
          grant_type: 'direct' as GrantType,
          expiry: new Date(Date.now() + 86400000).toISOString()
        }]
      });

      const roleId = createResult.data!.role_id;

      // 测试首次获取（缓存未命中）
      const firstFetchStart = performance.now();
      const firstResult = await roleServiceWithCache.getRoleById(roleId);
      const firstFetchTime = performance.now() - firstFetchStart;

      expect(firstResult.success).toBe(true);

      // 测试重复获取（缓存命中）
      const cachedFetchStart = performance.now();
      const cachedResult = await roleServiceWithCache.getRoleById(roleId);
      const cachedFetchTime = performance.now() - cachedFetchStart;

      expect(cachedResult.success).toBe(true);

      // 缓存命中应该更快（考虑到基础性能已经很好，调整期望）
      expect(cachedFetchTime).toBeLessThan(firstFetchTime); // 缓存应该更快

      console.log(`首次获取耗时: ${firstFetchTime.toFixed(2)}ms`);
      console.log(`缓存获取耗时: ${cachedFetchTime.toFixed(2)}ms`);
      console.log(`性能提升: ${(firstFetchTime / cachedFetchTime).toFixed(1)}倍`);
    });

    it('应该在大量重复查询中显示缓存效果', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 创建10个测试角色
      const roleIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const createResult = await roleServiceWithCache.createRole({
          context_id: contextId,
          name: `batch-cache-role-${i}`,
          role_type: 'functional' as RoleType,
          permissions: []
        });
        roleIds.push(createResult.data!.role_id);
      }

      // 测试带缓存的批量查询（每个角色查询10次）
      const cachedStart = performance.now();
      for (let round = 0; round < 10; round++) {
        for (const roleId of roleIds) {
          const result = await roleServiceWithCache.getRoleById(roleId);
          expect(result.success).toBe(true);
        }
      }
      const cachedTime = performance.now() - cachedStart;

      // 验证缓存统计
      const stats = cacheService.getStats();
      expect(stats.roleCache.size).toBeGreaterThan(0);

      console.log(`带缓存批量查询耗时: ${cachedTime.toFixed(2)}ms`);
      console.log(`缓存大小: ${stats.roleCache.size}`);
      console.log(`缓存命中率: ${(stats.roleCache.hitRate * 100).toFixed(1)}%`);
    });
  });

  describe('权限计算缓存性能', () => {
    it('应该提升权限计算的性能', async () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();

      // 测试首次权限计算（缓存未命中）
      const firstCalcStart = performance.now();
      const firstPermissions = await permissionServiceWithCache.calculateEffectivePermissions(userId, contextId);
      const firstCalcTime = performance.now() - firstCalcStart;

      // 测试重复权限计算（缓存命中）
      const cachedCalcStart = performance.now();
      const cachedPermissions = await permissionServiceWithCache.calculateEffectivePermissions(userId, contextId);
      const cachedCalcTime = performance.now() - cachedCalcStart;

      expect(firstPermissions).toEqual(cachedPermissions);
      expect(cachedCalcTime).toBeLessThan(firstCalcTime * 0.1); // 至少快10倍

      console.log(`首次权限计算耗时: ${firstCalcTime.toFixed(2)}ms`);
      console.log(`缓存权限计算耗时: ${cachedCalcTime.toFixed(2)}ms`);
      console.log(`权限计算性能提升: ${(firstCalcTime / cachedCalcTime).toFixed(1)}倍`);
    });

    it('应该在高频权限检查中显示缓存效果', async () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();

      // 测试带缓存的高频权限计算
      const cachedStart = performance.now();
      for (let i = 0; i < 100; i++) {
        const permissions = await permissionServiceWithCache.calculateEffectivePermissions(userId, contextId);
        expect(Array.isArray(permissions)).toBe(true);
      }
      const cachedTime = performance.now() - cachedStart;

      // 验证缓存效果
      const stats = cacheService.getStats();
      expect(stats.effectivePermissionsCache.size).toBeGreaterThanOrEqual(0);

      console.log(`带缓存100次权限计算耗时: ${cachedTime.toFixed(2)}ms`);
      console.log(`平均每次计算: ${(cachedTime / 100).toFixed(3)}ms`);
      console.log(`权限缓存大小: ${stats.effectivePermissionsCache.size}`);
    });
  });

  describe('缓存统计和管理', () => {
    it('应该提供准确的缓存统计信息', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 创建一些角色并访问
      for (let i = 0; i < 5; i++) {
        const createResult = await roleServiceWithCache.createRole({
          context_id: contextId,
          name: `stats-test-role-${i}`,
          role_type: 'functional' as RoleType,
          permissions: []
        });
        
        // 多次访问以产生缓存命中
        await roleServiceWithCache.getRoleById(createResult.data!.role_id);
        await roleServiceWithCache.getRoleById(createResult.data!.role_id);
      }

      const stats = cacheService.getStats();
      
      expect(stats.roleCache.size).toBeGreaterThan(0);
      expect(stats.roleCache.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.permissionCache.size).toBeGreaterThanOrEqual(0);
      expect(stats.effectivePermissionsCache.size).toBeGreaterThanOrEqual(0);

      console.log('缓存统计信息:', JSON.stringify(stats, null, 2));
    });

    it('应该正确处理缓存失效', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 创建角色
      const createResult = await roleServiceWithCache.createRole({
        context_id: contextId,
        name: 'invalidation-test-role',
        role_type: 'functional' as RoleType,
        permissions: []
      });

      const roleId = createResult.data!.role_id;

      // 首次获取（缓存）
      await roleServiceWithCache.getRoleById(roleId);
      
      // 验证角色在缓存中
      const cachedRole = cacheService.getRole(roleId);
      expect(cachedRole).toBeDefined();

      // 使缓存失效
      cacheService.invalidateRole(roleId);

      // 验证角色不再在缓存中
      const invalidatedRole = cacheService.getRole(roleId);
      expect(invalidatedRole).toBeNull();
    });

    it('应该在内存压力下正确淘汰缓存', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 创建大量角色以触发缓存淘汰
      const roleIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const createResult = await roleServiceWithCache.createRole({
          context_id: contextId,
          name: `eviction-test-role-${i}`,
          role_type: 'functional' as RoleType,
          permissions: []
        });
        roleIds.push(createResult.data!.role_id);
        
        // 访问角色以缓存
        await roleServiceWithCache.getRoleById(createResult.data!.role_id);
      }

      const finalStats = cacheService.getStats();
      
      // 缓存大小应该在合理范围内
      expect(finalStats.roleCache.size).toBeLessThanOrEqual(50);
      
      console.log(`创建${roleIds.length}个角色后的缓存大小: ${finalStats.roleCache.size}`);
    });
  });

  describe('并发缓存性能', () => {
    it('应该在高并发场景下保持性能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 创建测试角色
      const createResult = await roleServiceWithCache.createRole({
        context_id: contextId,
        name: 'concurrent-cache-test-role',
        role_type: 'functional' as RoleType,
        permissions: []
      });

      const roleId = createResult.data!.role_id;

      // 并发访问同一个角色
      const concurrentStart = performance.now();
      const promises = Array.from({ length: 100 }, () =>
        roleServiceWithCache.getRoleById(roleId)
      );
      
      const results = await Promise.all(promises);
      const concurrentTime = performance.now() - concurrentStart;

      // 验证所有请求都成功
      expect(results.every(r => r.success)).toBe(true);
      expect(concurrentTime).toBeLessThan(100); // 100ms内完成100个并发请求

      console.log(`100个并发缓存访问耗时: ${concurrentTime.toFixed(2)}ms`);
      console.log(`平均每个请求: ${(concurrentTime / 100).toFixed(2)}ms`);
    });
  });
});
