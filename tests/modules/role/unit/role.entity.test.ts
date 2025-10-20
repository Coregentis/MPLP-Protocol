/**
 * Role实体测试
 * 
 * @description 测试Role实体的业务逻辑和方法 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 测试层 - 单元测试 (Tier 1)
 */

import { RoleEntity } from '../../../../src/modules/role/domain/entities/role.entity';
import { createSimpleMockRoleEntityData, createComplexMockRoleEntityData, createTestPermission, createTestUUID } from '../test-data-factory';
import { UUID, Permission, SecurityClearance } from '../../../../src/modules/role/types';

describe('RoleEntity测试', () => {
  let simpleRoleData: any;
  let complexRoleData: any;
  let simpleRole: RoleEntity;
  let complexRole: RoleEntity;

  beforeEach(() => {
    simpleRoleData = createSimpleMockRoleEntityData();
    complexRoleData = createComplexMockRoleEntityData();
    
    simpleRole = new RoleEntity(simpleRoleData);
    complexRole = new RoleEntity(complexRoleData);
  });

  describe('构造函数测试', () => {
    it('应该正确创建简单角色实体', () => {
      expect(simpleRole.roleId).toBe(simpleRoleData.roleId);
      expect(simpleRole.contextId).toBe(simpleRoleData.contextId);
      expect(simpleRole.name).toBe(simpleRoleData.name);
      expect(simpleRole.roleType).toBe(simpleRoleData.roleType);
      expect(simpleRole.status).toBe(simpleRoleData.status);
      expect(simpleRole.permissions).toEqual(simpleRoleData.permissions);
    });

    it('应该正确创建复杂角色实体', () => {
      expect(complexRole.roleId).toBe(complexRoleData.roleId);
      expect(complexRole.scope).toEqual(complexRoleData.scope);
      expect(complexRole.inheritance).toEqual(complexRoleData.inheritance);
      expect(complexRole.delegation).toEqual(complexRoleData.delegation);
      expect(complexRole.attributes).toEqual(complexRoleData.attributes);
      expect(complexRole.agents).toEqual(complexRoleData.agents);
    });

    it('应该在缺少必需字段时抛出错误', () => {
      const invalidData = { ...simpleRoleData };
      delete invalidData.roleId;

      expect(() => new RoleEntity(invalidData)).toThrow('Role ID and Context ID are required');
    });

    it('应该在名称为空时抛出错误', () => {
      const invalidData = { ...simpleRoleData, name: '' };

      expect(() => new RoleEntity(invalidData)).toThrow('Role name is required');
    });

    it('应该在权限不是数组时抛出错误', () => {
      const invalidData = { ...simpleRoleData, permissions: 'not-array' };

      expect(() => new RoleEntity(invalidData)).toThrow('Permissions must be an array');
    });
  });

  describe('权限管理测试', () => {
    describe('hasPermission方法', () => {
      it('应该正确检查直接权限', () => {
        const permission = simpleRole.permissions[0];
        const hasPermission = simpleRole.hasPermission(
          permission.resourceType,
          permission.resourceId,
          permission.actions[0]
        );

        expect(hasPermission).toBe(true);
      });

      it('应该正确处理系统级权限', () => {
        const systemPermission = createTestPermission({
          resourceType: 'system',
          resourceId: 'any-resource' as UUID,
          actions: ['admin']
        });
        
        simpleRole.addPermission(systemPermission);
        
        const hasPermission = simpleRole.hasPermission('context', 'any-resource', 'admin');
        expect(hasPermission).toBe(true);
      });

      it('应该正确处理通配符资源ID', () => {
        const wildcardPermission = createTestPermission({
          resourceType: 'plan',
          resourceId: '*' as UUID,
          actions: ['read']
        });
        
        simpleRole.addPermission(wildcardPermission);
        
        const hasPermission = simpleRole.hasPermission('plan', 'any-plan-id', 'read');
        expect(hasPermission).toBe(true);
      });

      it('应该在没有权限时返回false', () => {
        const hasPermission = simpleRole.hasPermission('nonexistent', 'resource', 'action');
        expect(hasPermission).toBe(false);
      });
    });

    describe('addPermission方法', () => {
      it('应该正确添加新权限', () => {
        const newPermission = createTestPermission({
          permissionId: createTestUUID(),
          resourceType: 'task',
          actions: ['create', 'update']
        });

        const initialCount = simpleRole.permissions.length;
        simpleRole.addPermission(newPermission);

        expect(simpleRole.permissions).toHaveLength(initialCount + 1);
        expect(simpleRole.permissions).toContain(newPermission);
      });

      it('应该避免添加重复权限', () => {
        const existingPermission = simpleRole.permissions[0];
        const initialCount = simpleRole.permissions.length;

        simpleRole.addPermission(existingPermission);

        expect(simpleRole.permissions).toHaveLength(initialCount);
      });
    });

    describe('removePermission方法', () => {
      it('应该正确移除权限', () => {
        const permissionToRemove = simpleRole.permissions[0];
        const initialCount = simpleRole.permissions.length;

        simpleRole.removePermission(permissionToRemove.permissionId);

        expect(simpleRole.permissions).toHaveLength(initialCount - 1);
        expect(simpleRole.permissions).not.toContain(permissionToRemove);
      });

      it('应该在权限不存在时不产生错误', () => {
        const nonexistentId = createTestUUID();
        const initialCount = simpleRole.permissions.length;

        expect(() => simpleRole.removePermission(nonexistentId)).not.toThrow();
        expect(simpleRole.permissions).toHaveLength(initialCount);
      });
    });
  });

  describe('角色状态管理测试', () => {
    describe('isActive方法', () => {
      it('应该正确识别活跃角色', () => {
        expect(simpleRole.isActive()).toBe(true);
      });

      it('应该正确识别非活跃角色', () => {
        simpleRole.status = 'inactive';
        expect(simpleRole.isActive()).toBe(false);
      });
    });

    describe('activate方法', () => {
      it('应该正确激活角色', () => {
        simpleRole.status = 'inactive';
        simpleRole.activate();
        expect(simpleRole.status).toBe('active');
        expect(simpleRole.isActive()).toBe(true);
      });
    });

    describe('deactivate方法', () => {
      it('应该正确停用角色', () => {
        simpleRole.deactivate();
        expect(simpleRole.status).toBe('inactive');
        expect(simpleRole.isActive()).toBe(false);
      });
    });
  });

  describe('角色属性测试', () => {
    describe('getSecurityClearance方法', () => {
      it('应该返回正确的安全级别', () => {
        const clearance = complexRole.getSecurityClearance();
        expect(clearance).toBe('confidential');
      });

      it('应该在没有属性时返回undefined', () => {
        const clearance = simpleRole.getSecurityClearance();
        expect(clearance).toBeUndefined();
      });
    });

    describe('canDelegate方法', () => {
      it('应该正确识别可委托角色', () => {
        expect(complexRole.canDelegate()).toBe(true);
      });

      it('应该正确识别不可委托角色', () => {
        expect(simpleRole.canDelegate()).toBe(false);
      });
    });
  });

  describe('复杂度评分测试', () => {
    describe('getComplexityScore方法', () => {
      it('应该为简单角色返回较低分数', () => {
        const score = simpleRole.getComplexityScore();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(score).toBeLessThan(50); // 简单角色应该分数较低
      });

      it('应该为复杂角色返回较高分数', () => {
        const score = complexRole.getComplexityScore();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(score).toBeGreaterThan(simpleRole.getComplexityScore());
      });

      it('应该基于权限数量计算分数', () => {
        const roleWithManyPermissions = new RoleEntity({
          ...simpleRoleData,
          permissions: Array(10).fill(null).map(() => createTestPermission())
        });

        const score = roleWithManyPermissions.getComplexityScore();
        expect(score).toBeGreaterThan(simpleRole.getComplexityScore());
      });

      it('应该基于继承关系计算分数', () => {
        const roleWithInheritance = new RoleEntity({
          ...simpleRoleData,
          inheritance: {
            parentRoles: [
              { roleId: createTestUUID(), inheritanceType: 'full', excludedPermissions: [], conditions: {} },
              { roleId: createTestUUID(), inheritanceType: 'partial', excludedPermissions: [], conditions: {} }
            ],
            childRoles: [
              { roleId: createTestUUID(), delegationLevel: 1, canFurtherDelegate: false }
            ],
            inheritanceRules: {
              mergeStrategy: 'union',
              conflictResolution: 'most_restrictive',
              maxInheritanceDepth: 3
            }
          }
        });

        const score = roleWithInheritance.getComplexityScore();
        expect(score).toBeGreaterThan(simpleRole.getComplexityScore());
      });

      it('应该基于Agent数量计算分数', () => {
        const roleWithAgents = new RoleEntity({
          ...simpleRoleData,
          agents: Array(5).fill(complexRoleData.agents![0])
        });

        const score = roleWithAgents.getComplexityScore();
        expect(score).toBeGreaterThan(simpleRole.getComplexityScore());
      });
    });
  });

  describe('数据转换测试', () => {
    describe('toPlainObject方法', () => {
      it('应该正确转换为简单对象', () => {
        const plainObject = simpleRole.toPlainObject();

        expect(plainObject).toHaveProperty('roleId', simpleRole.roleId);
        expect(plainObject).toHaveProperty('contextId', simpleRole.contextId);
        expect(plainObject).toHaveProperty('name', simpleRole.name);
        expect(plainObject).toHaveProperty('roleType', simpleRole.roleType);
        expect(plainObject).toHaveProperty('status', simpleRole.status);
        expect(plainObject).toHaveProperty('permissions', simpleRole.permissions);
        expect(plainObject).toHaveProperty('performanceMetrics', simpleRole.performanceMetrics);
      });

      it('应该包含所有可选字段', () => {
        const plainObject = complexRole.toPlainObject();

        expect(plainObject).toHaveProperty('scope', complexRole.scope);
        expect(plainObject).toHaveProperty('inheritance', complexRole.inheritance);
        expect(plainObject).toHaveProperty('delegation', complexRole.delegation);
        expect(plainObject).toHaveProperty('attributes', complexRole.attributes);
        expect(plainObject).toHaveProperty('agents', complexRole.agents);
        expect(plainObject).toHaveProperty('agentManagement', complexRole.agentManagement);
        expect(plainObject).toHaveProperty('teamConfiguration', complexRole.teamConfiguration);
      });

      it('应该返回可序列化的对象', () => {
        const plainObject = complexRole.toPlainObject();

        expect(() => JSON.stringify(plainObject)).not.toThrow();

        const jsonString = JSON.stringify(plainObject);
        const parsedObject = JSON.parse(jsonString);

        // 验证关键字段而不是整个对象，因为Date对象会被序列化为字符串
        expect(parsedObject.roleId).toEqual(plainObject.roleId);
        expect(parsedObject.name).toEqual(plainObject.name);
        expect(parsedObject.roleType).toEqual(plainObject.roleType);
        expect(parsedObject.status).toEqual(plainObject.status);
        expect(typeof parsedObject.timestamp).toBe('string'); // Date被序列化为字符串
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空权限数组', () => {
      const roleWithNoPermissions = new RoleEntity({
        ...simpleRoleData,
        permissions: []
      });

      expect(roleWithNoPermissions.permissions).toHaveLength(0);
      expect(roleWithNoPermissions.hasPermission('any', 'resource', 'action')).toBe(false);
      expect(roleWithNoPermissions.getComplexityScore()).toBeGreaterThanOrEqual(0);
    });

    it('应该处理大量权限', () => {
      const manyPermissions = Array(100).fill(null).map(() => createTestPermission());
      const roleWithManyPermissions = new RoleEntity({
        ...simpleRoleData,
        permissions: manyPermissions
      });

      expect(roleWithManyPermissions.permissions).toHaveLength(100);
      expect(roleWithManyPermissions.getComplexityScore()).toBeLessThanOrEqual(100);
    });

    it('应该处理极长的角色名称', () => {
      const longName = 'a'.repeat(1000);
      const roleWithLongName = new RoleEntity({
        ...simpleRoleData,
        name: longName
      });

      expect(roleWithLongName.name).toBe(longName);
    });

    it('应该处理特殊字符在角色名称中', () => {
      const specialName = 'role-with-special-chars!@#$%^&*()_+{}|:"<>?[]\\;\',./ ';
      const roleWithSpecialName = new RoleEntity({
        ...simpleRoleData,
        name: specialName
      });

      expect(roleWithSpecialName.name).toBe(specialName);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内创建角色', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        new RoleEntity(simpleRoleData);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成1000次创建
    });

    it('应该在合理时间内检查权限', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        simpleRole.hasPermission('context', 'resource', 'read');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成10000次权限检查
    });

    it('应该在合理时间内计算复杂度分数', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        complexRole.getComplexityScore();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成1000次复杂度计算
    });
  });
});
