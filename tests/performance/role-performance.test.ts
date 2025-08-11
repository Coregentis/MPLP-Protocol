/**
 * Role模块性能基准测试
 * 
 * 测试关键性能指标并提供优化建议
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleManagementService } from '../../src/modules/role/application/services/role-management.service';
import { RoleRepository } from '../../src/modules/role/infrastructure/repositories/role.repository';
import { PermissionCalculationService } from '../../src/modules/role/domain/services/permission-calculation.service';
import { 
  RoleType, 
  Permission,
  PermissionAction,
  ResourceType,
  GrantType
} from '../../src/modules/role/types';
import { TestDataFactory } from '../public/test-utils/test-data-factory';

describe('Role模块性能基准测试', () => {
  let roleService: RoleManagementService;
  let roleRepository: RoleRepository;
  let permissionCalculationService: PermissionCalculationService;

  beforeEach(async () => {
    roleRepository = new RoleRepository();
    roleService = new RoleManagementService(roleRepository);
    permissionCalculationService = new PermissionCalculationService();
  });

  describe('角色创建性能', () => {
    it('应该在50ms内创建单个角色', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const startTime = performance.now();
      
      const result = await roleService.createRole({
        context_id: contextId,
        name: 'performance-test-role',
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
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(50); // 50ms阈值
      
      console.log(`角色创建耗时: ${executionTime.toFixed(2)}ms`);
    });

    it('应该在1秒内批量创建100个角色', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const startTime = performance.now();
      
      const promises = Array.from({ length: 100 }, (_, i) =>
        roleService.createRole({
          context_id: contextId,
          name: `batch-role-${i}`,
          role_type: 'functional' as RoleType,
          permissions: []
        })
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results.every(r => r.success)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // 1秒阈值
      
      console.log(`批量创建100个角色耗时: ${executionTime.toFixed(2)}ms`);
      console.log(`平均每个角色: ${(executionTime / 100).toFixed(2)}ms`);
    });
  });

  describe('权限检查性能', () => {
    let roleId: string;
    
    beforeEach(async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const createResult = await roleService.createRole({
        context_id: contextId,
        name: 'permission-test-role',
        role_type: 'functional' as RoleType,
        permissions: Array.from({ length: 10 }, (_, i) => ({
          permission_id: TestDataFactory.Base.generateUUID(),
          resource_type: 'plan' as ResourceType,
          resource_id: `resource-${i}`,
          actions: ['read' as PermissionAction, 'update' as PermissionAction],
          conditions: {
            time_based: {
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 86400000).toISOString()
            }
          },
          grant_type: 'direct' as GrantType,
          expiry: new Date(Date.now() + 86400000).toISOString()
        }))
      });
      
      roleId = createResult.data!.role_id;
    });

    it('应该在10ms内完成单次权限检查', async () => {
      const startTime = performance.now();
      
      const result = await roleService.checkPermission(roleId, {
        resource_type: 'plan' as ResourceType,
        resource_id: 'resource-1',
        action: 'read' as PermissionAction,
        context: {
          timestamp: new Date().toISOString()
        }
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(10); // 10ms阈值
      
      console.log(`权限检查耗时: ${executionTime.toFixed(2)}ms`);
    });

    it('应该在500ms内完成1000次权限检查', async () => {
      const startTime = performance.now();
      
      const promises = Array.from({ length: 1000 }, (_, i) =>
        roleService.checkPermission(roleId, {
          resource_type: 'plan' as ResourceType,
          resource_id: `resource-${i % 10}`,
          action: 'read' as PermissionAction,
          context: {
            timestamp: new Date().toISOString()
          }
        })
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results.every(r => r.success)).toBe(true);
      expect(executionTime).toBeLessThan(500); // 500ms阈值
      
      console.log(`1000次权限检查耗时: ${executionTime.toFixed(2)}ms`);
      console.log(`平均每次检查: ${(executionTime / 1000).toFixed(2)}ms`);
    });
  });

  describe('权限计算性能', () => {
    it('应该在100ms内计算复杂权限继承', async () => {
      const userId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();
      
      const startTime = performance.now();
      
      const effectivePermissions = await permissionCalculationService.calculateEffectivePermissions(
        userId,
        contextId
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(effectivePermissions).toBeDefined();
      expect(executionTime).toBeLessThan(100); // 100ms阈值
      
      console.log(`权限计算耗时: ${executionTime.toFixed(2)}ms`);
    });

    it('应该在1秒内处理权限冲突解决', async () => {
      // 创建冲突的权限
      const conflictingPermissions: Permission[] = Array.from({ length: 50 }, (_, i) => ({
        permission_id: TestDataFactory.Base.generateUUID(),
        resource_type: 'context' as ResourceType,
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: i % 2 === 0 ? ['read' as PermissionAction] : ['read' as PermissionAction, 'write' as PermissionAction],
        conditions: {
          time_based: {
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 86400000).toISOString()
          }
        },
        grant_type: 'direct' as GrantType,
        expiry: new Date(Date.now() + 86400000).toISOString()
      }));
      
      const startTime = performance.now();
      
      const resolvedPermissions = await permissionCalculationService.resolvePermissionConflicts(
        conflictingPermissions
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(resolvedPermissions).toBeDefined();
      expect(Array.isArray(resolvedPermissions)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // 1秒阈值
      
      console.log(`权限冲突解决耗时: ${executionTime.toFixed(2)}ms`);
      console.log(`处理权限数量: ${conflictingPermissions.length}`);
    });
  });

  describe('Repository查询性能', () => {
    beforeEach(async () => {
      // 创建测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const createPromises = Array.from({ length: 50 }, (_, i) =>
        roleService.createRole({
          context_id: contextId,
          name: `query-test-role-${i}`,
          role_type: i % 2 === 0 ? 'functional' as RoleType : 'administrative' as RoleType,
          permissions: []
        })
      );
      
      await Promise.all(createPromises);
    });

    it('应该在100ms内查询角色列表', async () => {
      const startTime = performance.now();
      
      const result = await roleService.queryRoles({}, { page: 1, limit: 20 });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(100); // 100ms阈值
      
      console.log(`角色查询耗时: ${executionTime.toFixed(2)}ms`);
    });

    it('应该在50ms内根据ID获取角色', async () => {
      // 先创建一个角色获取ID
      const createResult = await roleService.createRole({
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'get-test-role',
        role_type: 'functional' as RoleType,
        permissions: []
      });
      
      const roleId = createResult.data!.role_id;
      
      const startTime = performance.now();
      
      const result = await roleService.getRoleById(roleId);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(50); // 50ms阈值
      
      console.log(`角色获取耗时: ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('内存使用性能', () => {
    it('应该在合理范围内使用内存', async () => {
      const initialMemory = process.memoryUsage();
      
      // 创建大量角色对象
      const contextId = TestDataFactory.Base.generateUUID();
      const createPromises = Array.from({ length: 1000 }, (_, i) =>
        roleService.createRole({
          context_id: contextId,
          name: `memory-test-role-${i}`,
          role_type: 'functional' as RoleType,
          permissions: Array.from({ length: 5 }, (_, j) => ({
            permission_id: TestDataFactory.Base.generateUUID(),
            resource_type: 'context' as ResourceType,
            resource_id: TestDataFactory.Base.generateUUID(),
            actions: ['read' as PermissionAction],
            conditions: {},
            grant_type: 'direct' as GrantType,
            expiry: new Date(Date.now() + 86400000).toISOString()
          }))
        })
      );
      
      await Promise.all(createPromises);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseInMB = memoryIncrease / (1024 * 1024);
      
      // 内存增长应该在合理范围内（< 100MB for 1000 roles）
      expect(memoryIncreaseInMB).toBeLessThan(100);
      
      console.log(`内存增长: ${memoryIncreaseInMB.toFixed(2)}MB`);
      console.log(`平均每个角色: ${(memoryIncreaseInMB / 1000 * 1024).toFixed(2)}KB`);
    });
  });

  describe('并发性能', () => {
    it('应该支持高并发的角色操作', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const startTime = performance.now();
      
      // 并发执行不同类型的操作
      const operations = [
        // 创建操作
        ...Array.from({ length: 20 }, (_, i) =>
          roleService.createRole({
            context_id: contextId,
            name: `concurrent-create-${i}`,
            role_type: 'functional' as RoleType,
            permissions: []
          })
        ),
        // 查询操作
        ...Array.from({ length: 30 }, () =>
          roleService.queryRoles({}, { page: 1, limit: 10 })
        )
      ];
      
      const results = await Promise.all(operations);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 验证所有操作都成功
      expect(results.every(r => r.success)).toBe(true);
      expect(executionTime).toBeLessThan(2000); // 2秒阈值
      
      console.log(`并发操作耗时: ${executionTime.toFixed(2)}ms`);
      console.log(`操作数量: ${operations.length}`);
      console.log(`平均每个操作: ${(executionTime / operations.length).toFixed(2)}ms`);
    });
  });
});
