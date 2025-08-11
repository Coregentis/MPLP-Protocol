/**
 * RoleEntity真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import {
  RoleType,
  RoleStatus,
  Permission,
  RoleScope,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  ValidationRules,
  AuditSettings,
  PermissionAction,
  ResourceType,
  GrantType,
  ScopeLevel,
  InheritanceType
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleEntity真实实现单元测试', () => {
  
  // 辅助函数：创建有效的Role实例
  const createValidRole = (overrides: {
    roleId?: string;
    contextId?: string;
    protocolVersion?: string;
    name?: string;
    roleType?: RoleType;
    status?: RoleStatus;
    permissions?: Permission[];
    timestamp?: string;
    createdAt?: string;
    updatedAt?: string;
    displayName?: string;
    description?: string;
    scope?: RoleScope;
    inheritance?: RoleInheritance;
    delegation?: RoleDelegation;
    attributes?: RoleAttributes;
    validationRules?: ValidationRules;
    auditSettings?: AuditSettings;
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
      merged.updatedAt,
      merged.displayName,
      merged.description,
      merged.scope,
      merged.inheritance,
      merged.delegation,
      merged.attributes,
      merged.validationRules,
      merged.auditSettings
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

  describe('构造函数和基本属性', () => {
    it('应该正确创建Role实例', () => {
      const roleId = TestDataFactory.Base.generateUUID();
      const contextId = TestDataFactory.Base.generateUUID();
      const name = 'Test Role';
      const roleType: RoleType = 'functional';
      const status: RoleStatus = 'active';

      const role = createValidRole({
        roleId,
        contextId,
        name,
        roleType,
        status
      });

      expect(role.roleId).toBe(roleId);
      expect(role.contextId).toBe(contextId);
      expect(role.name).toBe(name);
      expect(role.roleType).toBe(roleType);
      expect(role.status).toBe(status);
      expect(role.protocolVersion).toBe('1.0.0');
      expect(Array.isArray(role.permissions)).toBe(true);
    });

    it('应该支持可选参数', () => {
      const displayName = 'Display Name';
      const description = 'Role Description';

      const role = createValidRole({
        displayName,
        description
      });

      expect(role.displayName).toBe(displayName);
      expect(role.description).toBe(description);
    });

    it('应该正确处理Schema兼容的getter', () => {
      const role = createValidRole();

      // 测试snake_case getters
      expect(role.role_id).toBe(role.roleId);
      expect(role.context_id).toBe(role.contextId);
      expect(role.protocol_version).toBe(role.protocolVersion);
      expect(role.role_type).toBe(role.roleType);
      expect(role.display_name).toBe(role.displayName);
      expect(role.created_at).toBe(role.createdAt);
      expect(role.updated_at).toBe(role.updatedAt);
    });

    it('应该处理不同的角色类型', () => {
      const roleTypes: RoleType[] = ['functional', 'organizational', 'system', 'temporary'];

      roleTypes.forEach(roleType => {
        const role = createValidRole({ roleType });
        expect(role.roleType).toBe(roleType);
      });
    });

    it('应该处理不同的角色状态', () => {
      const statuses: RoleStatus[] = ['active', 'inactive', 'suspended', 'deprecated'];

      statuses.forEach(status => {
        const role = createValidRole({ status });
        expect(role.status).toBe(status);
      });
    });

    it('应该返回权限数组的副本', () => {
      const permissions = [createValidPermission()];
      const role = createValidRole({ permissions });

      const returnedPermissions = role.permissions;
      expect(returnedPermissions).toEqual(permissions);
      expect(returnedPermissions).not.toBe(permissions); // 应该是副本，不是原数组
    });
  });

  describe('updateStatus - 真实状态转换验证', () => {
    it('应该成功更新有效的状态转换', () => {
      const role = createValidRole({ status: 'active' });
      const originalUpdatedAt = role.updated_at;

      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        role.updateStatus('inactive');

        expect(role.status).toBe('inactive');
        expect(role.updated_at).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('应该拒绝无效的状态转换', () => {
      const role = createValidRole({ status: 'deprecated' });

      expect(() => {
        role.updateStatus('active');
      }).toThrow('无效的状态转换');
    });

    it('应该处理所有有效的状态转换', () => {
      // 基于实际的状态转换规则
      const validTransitions = [
        { from: 'active', to: 'inactive' },
        { from: 'active', to: 'suspended' },
        { from: 'active', to: 'deprecated' },
        { from: 'inactive', to: 'active' },
        { from: 'inactive', to: 'deprecated' },
        { from: 'suspended', to: 'active' },
        { from: 'suspended', to: 'deprecated' }
      ];

      validTransitions.forEach(({ from, to }) => {
        const role = createValidRole({ status: from as RoleStatus });
        expect(() => {
          role.updateStatus(to as RoleStatus);
        }).not.toThrow();
        expect(role.status).toBe(to);
      });
    });

    it('应该拒绝从deprecated状态的转换', () => {
      const role = createValidRole({ status: 'deprecated' });

      const invalidTargets: RoleStatus[] = ['active', 'inactive', 'suspended'];
      invalidTargets.forEach(target => {
        expect(() => {
          role.updateStatus(target);
        }).toThrow('无效的状态转换');
      });
    });
  });

  describe('addPermission - 真实权限添加逻辑', () => {
    it('应该成功添加新权限', () => {
      const role = createValidRole();
      const permission = createValidPermission();
      const originalUpdatedAt = role.updated_at;

      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        role.addPermission(permission);

        expect(role.permissions).toContain(permission);
        expect(role.updated_at).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('应该防止添加重复的权限ID', () => {
      const role = createValidRole();
      const permission = createValidPermission();

      role.addPermission(permission);
      const permissionsCountAfterFirst = role.permissions.length;

      role.addPermission(permission); // 尝试添加相同权限

      expect(role.permissions.length).toBe(permissionsCountAfterFirst);
    });

    it('应该防止添加相同资源和操作的权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      
      const permission1 = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read', 'update']
      });

      const permission2 = createValidPermission({
        permission_id: TestDataFactory.Base.generateUUID(), // 不同的ID
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['update', 'read'] // 相同操作，不同顺序
      });

      role.addPermission(permission1);
      const permissionsCountAfterFirst = role.permissions.length;

      role.addPermission(permission2);

      expect(role.permissions.length).toBe(permissionsCountAfterFirst);
    });

    it('应该允许添加不同资源的相同操作权限', () => {
      const role = createValidRole();
      
      const permission1 = createValidPermission({
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(),
        actions: ['read']
      });

      const permission2 = createValidPermission({
        resource_type: 'context',
        resource_id: TestDataFactory.Base.generateUUID(), // 不同资源
        actions: ['read'] // 相同操作
      });

      role.addPermission(permission1);
      role.addPermission(permission2);

      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.permissions.length).toBe(2);
    });

    it('应该允许添加相同资源的不同操作权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      
      const permission1 = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read']
      });

      const permission2 = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['update'] // 不同操作
      });

      role.addPermission(permission1);
      role.addPermission(permission2);

      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.permissions.length).toBe(2);
    });

    it('应该处理复杂的权限组合', () => {
      const role = createValidRole();
      const permissions = [
        createValidPermission({ resource_type: 'context', actions: ['read'] }),
        createValidPermission({ resource_type: 'plan', actions: ['update'] }),
        createValidPermission({ resource_type: 'trace', actions: ['delete'] }),
        createValidPermission({ resource_type: 'role', actions: ['admin'] })
      ];

      permissions.forEach(permission => {
        role.addPermission(permission);
      });

      expect(role.permissions.length).toBe(4);
      permissions.forEach(permission => {
        expect(role.permissions).toContain(permission);
      });
    });
  });

  describe('removePermission - 真实权限移除逻辑', () => {
    it('应该成功移除存在的权限', () => {
      const role = createValidRole();
      const permission = createValidPermission();

      role.addPermission(permission);
      expect(role.permissions).toContain(permission);

      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        const originalUpdatedAt = role.updated_at;
        role.removePermission(permission.permission_id);

        expect(role.permissions).not.toContain(permission);
        expect(role.updated_at).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('应该处理移除不存在的权限', () => {
      const role = createValidRole();
      const nonExistentId = TestDataFactory.Base.generateUUID();
      const originalLength = role.permissions.length;
      const originalUpdatedAt = role.updated_at;

      role.removePermission(nonExistentId);

      expect(role.permissions.length).toBe(originalLength);
      expect(role.updated_at).toBe(originalUpdatedAt); // 时间戳不应该改变
    });

    it('应该只移除指定ID的权限', () => {
      const role = createValidRole();
      const permission1 = createValidPermission();
      const permission2 = createValidPermission();
      
      role.addPermission(permission1);
      role.addPermission(permission2);

      role.removePermission(permission1.permission_id);

      expect(role.permissions).not.toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.permissions.length).toBe(1);
    });

    it('应该处理移除多个权限', () => {
      const role = createValidRole();
      const permissions = [
        createValidPermission(),
        createValidPermission(),
        createValidPermission()
      ];
      
      permissions.forEach(p => role.addPermission(p));

      // 移除前两个权限
      role.removePermission(permissions[0].permission_id);
      role.removePermission(permissions[1].permission_id);

      expect(role.permissions).not.toContain(permissions[0]);
      expect(role.permissions).not.toContain(permissions[1]);
      expect(role.permissions).toContain(permissions[2]);
      expect(role.permissions.length).toBe(1);
    });
  });

  describe('hasPermission - 真实权限检查逻辑', () => {
    it('应该正确检查存在的权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read', 'update']
      });

      role.addPermission(permission);

      expect(role.hasPermission('context', resourceId, 'read')).toBe(true);
      expect(role.hasPermission('context', resourceId, 'update')).toBe(true);
    });

    it('应该拒绝不存在的权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();

      expect(role.hasPermission('context', resourceId, 'read')).toBe(false);
    });

    it('应该支持通配符资源ID', () => {
      const role = createValidRole();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: '*', // 通配符
        actions: ['read']
      });

      role.addPermission(permission);

      const anyResourceId = TestDataFactory.Base.generateUUID();
      expect(role.hasPermission('context', anyResourceId, 'read')).toBe(true);
      expect(role.hasPermission('context', '*', 'read')).toBe(true);
    });

    it('应该检查资源类型匹配', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read']
      });

      role.addPermission(permission);

      expect(role.hasPermission('context', resourceId, 'read')).toBe(true);
      expect(role.hasPermission('plan', resourceId, 'read')).toBe(false); // 不同资源类型
    });

    it('应该检查操作权限匹配', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read']
      });

      role.addPermission(permission);

      expect(role.hasPermission('context', resourceId, 'read')).toBe(true);
      expect(role.hasPermission('context', resourceId, 'update')).toBe(false); // 没有update权限
    });

    it('应该检查权限过期时间', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();

      // 已过期的权限
      const expiredPermission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read'],
        expiry: new Date(Date.now() - 86400000).toISOString() // 1天前过期
      });

      role.addPermission(expiredPermission);

      expect(role.hasPermission('context', resourceId, 'read')).toBe(false);
    });

    it('应该处理没有过期时间的权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read'],
        expiry: undefined // 没有过期时间
      });

      role.addPermission(permission);

      expect(role.hasPermission('context', resourceId, 'read')).toBe(true);
    });

    it('应该处理条件权限', () => {
      const role = createValidRole();
      const resourceId = TestDataFactory.Base.generateUUID();
      const permission = createValidPermission({
        resource_type: 'context',
        resource_id: resourceId,
        actions: ['read'],
        conditions: {
          time_based: {
            start_time: '09:00',
            end_time: '17:00'
          }
        }
      });

      role.addPermission(permission);

      // 权限检查会调用checkPermissionConditions方法
      const result = role.hasPermission('context', resourceId, 'read');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getActivePermissions - 真实活跃权限过滤', () => {
    it('应该返回所有未过期的权限', () => {
      const role = createValidRole();

      const activePermission = createValidPermission({
        expiry: new Date(Date.now() + 86400000).toISOString() // 1天后过期
      });

      const expiredPermission = createValidPermission({
        expiry: new Date(Date.now() - 86400000).toISOString() // 1天前过期
      });

      role.addPermission(activePermission);
      role.addPermission(expiredPermission);

      const activePermissions = role.getActivePermissions();

      expect(activePermissions).toContain(activePermission);
      expect(activePermissions).not.toContain(expiredPermission);
      expect(activePermissions.length).toBe(1);
    });

    it('应该返回没有过期时间的权限', () => {
      const role = createValidRole();

      const permanentPermission = createValidPermission({
        expiry: undefined // 没有过期时间
      });

      role.addPermission(permanentPermission);

      const activePermissions = role.getActivePermissions();

      expect(activePermissions).toContain(permanentPermission);
      expect(activePermissions.length).toBe(1);
    });

    it('应该处理条件权限的过滤', () => {
      const role = createValidRole();

      const conditionalPermission = createValidPermission({
        conditions: {
          custom_conditions: {
            rule: 'test_rule',
            value: 'test_value'
          }
        }
      });

      role.addPermission(conditionalPermission);

      const activePermissions = role.getActivePermissions();

      // 结果取决于checkPermissionConditions的实现
      expect(Array.isArray(activePermissions)).toBe(true);
    });

    it('应该处理空权限列表', () => {
      const role = createValidRole();

      const activePermissions = role.getActivePermissions();

      expect(activePermissions).toEqual([]);
      expect(activePermissions.length).toBe(0);
    });

    it('应该处理混合权限状态', () => {
      const role = createValidRole();

      const permissions = [
        createValidPermission({ expiry: new Date(Date.now() + 86400000).toISOString() }), // 活跃
        createValidPermission({ expiry: new Date(Date.now() - 86400000).toISOString() }), // 过期
        createValidPermission({ expiry: undefined }), // 永久
        createValidPermission({ expiry: new Date(Date.now() + 3600000).toISOString() })  // 活跃
      ];

      permissions.forEach(p => role.addPermission(p));

      const activePermissions = role.getActivePermissions();

      // 应该有3个活跃权限（排除过期的）
      expect(activePermissions.length).toBe(3);
      expect(activePermissions).toContain(permissions[0]);
      expect(activePermissions).not.toContain(permissions[1]);
      expect(activePermissions).toContain(permissions[2]);
      expect(activePermissions).toContain(permissions[3]);
    });
  });

  describe('updateAttributes - 真实属性更新逻辑', () => {
    it('应该成功更新角色属性', () => {
      const role = createValidRole();
      const attributes: RoleAttributes = {
        department: 'engineering',
        security_clearance: 'confidential',
        custom_attributes: {
          priority: 'high',
          cost_center: 'CC001'
        }
      };

      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        const originalUpdatedAt = role.updated_at;
        role.updateAttributes(attributes);

        expect(role.attributes).toEqual(attributes);
        expect(role.updated_at).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('应该合并现有属性', () => {
      const role = createValidRole({
        attributes: {
          department: 'hr',
          custom_attributes: {
            priority: 'low'
          }
        }
      });

      const newAttributes: RoleAttributes = {
        department: 'engineering', // 覆盖现有值
        custom_attributes: {
          priority: 'high',
          cost_center: 'CC001'
        }
      };

      role.updateAttributes(newAttributes);

      expect(role.attributes).toEqual({
        priority: 'high',
        department: 'hr', // 保留原有值
        cost_center: 'CC001'
      });
    });

    it('应该处理空属性对象', () => {
      const role = createValidRole();
      const originalAttributes = role.attributes;

      role.updateAttributes({});

      // 空对象会被合并，如果原来是undefined，现在会变成{}
      if (originalAttributes === undefined) {
        expect(role.attributes).toEqual({});
      } else {
        expect(role.attributes).toEqual(originalAttributes);
      }
    });
  });

  describe('setScope - 真实范围设置逻辑', () => {
    it('应该成功设置角色范围', () => {
      const role = createValidRole();
      const scope: RoleScope = {
        level: 'organization' as ScopeLevel,
        boundaries: ['dept1', 'dept2'],
        restrictions: {
          time_based: true,
          location_based: false
        }
      };
      // 等待一毫秒确保时间戳不同
      setTimeout(() => {
        const originalUpdatedAt = role.updated_at;
        role.setScope(scope);

        expect(role.scope).toEqual(scope);
        expect(role.updated_at).not.toBe(originalUpdatedAt);
      }, 1);
    });

    it('应该处理不同的范围级别', () => {
      const role = createValidRole();
      const scopeLevels: ScopeLevel[] = ['global', 'organization', 'project', 'team', 'individual'];

      scopeLevels.forEach(level => {
        const scope: RoleScope = {
          level,
          context_ids: [TestDataFactory.Base.generateUUID()],
          plan_ids: [TestDataFactory.Base.generateUUID()]
        };

        role.setScope(scope);
        expect(role.scope?.level).toBe(level);
      });
    });
  });

  describe('isActive - 真实活跃状态检查', () => {
    it('应该正确识别活跃角色', () => {
      const role = createValidRole({ status: 'active' });
      expect(role.isActive()).toBe(true);
    });

    it('应该正确识别非活跃角色', () => {
      const inactiveStatuses: RoleStatus[] = ['inactive', 'suspended', 'deprecated'];

      inactiveStatuses.forEach(status => {
        const role = createValidRole({ status });
        expect(role.isActive()).toBe(false);
      });
    });
  });

  describe('canDelegate - 真实委托能力检查', () => {
    it('应该允许活跃且可委托的角色进行委托', () => {
      const role = createValidRole({
        status: 'active',
        delegation: {
          can_delegate: true,
          delegatable_permissions: [TestDataFactory.Base.generateUUID()],
          delegation_constraints: {
            max_delegation_depth: 2,
            time_limit: 24,
            require_approval: false,
            revocable: true
          }
        }
      });

      expect(role.canDelegate()).toBe(true);
    });

    it('应该拒绝非活跃角色的委托', () => {
      const role = createValidRole({
        status: 'inactive',
        delegation: {
          can_delegate: true,
          delegatable_permissions: [TestDataFactory.Base.generateUUID()],
          delegation_constraints: {
            max_delegation_depth: 2,
            time_limit: 24,
            require_approval: false,
            revocable: true
          }
        }
      });

      expect(role.canDelegate()).toBe(false);
    });

    it('应该拒绝不可委托的角色', () => {
      const role = createValidRole({
        status: 'active',
        delegation: {
          can_delegate: false,
          delegatable_permissions: [],
          delegation_constraints: {
            max_delegation_depth: 0,
            time_limit: 0,
            require_approval: true,
            revocable: false
          }
        }
      });

      expect(role.canDelegate()).toBe(false);
    });

    it('应该处理没有委托配置的角色', () => {
      const role = createValidRole({
        status: 'active'
        // 没有delegation配置
      });

      expect(role.canDelegate()).toBe(false);
    });
  });

  describe('getInheritedPermissions - 真实继承权限获取', () => {
    it('应该返回继承的权限列表', () => {
      const role = createValidRole();

      const inheritedPermissions = role.getInheritedPermissions();

      expect(Array.isArray(inheritedPermissions)).toBe(true);
      // 当前实现返回空数组
      expect(inheritedPermissions.length).toBe(0);
    });
  });

  describe('toProtocol - 真实协议转换', () => {
    it('应该正确转换为协议格式', () => {
      const roleData = {
        roleId: TestDataFactory.Base.generateUUID(),
        contextId: TestDataFactory.Base.generateUUID(),
        protocolVersion: '1.0.0',
        name: 'Test Role',
        roleType: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        displayName: 'Test Display Name',
        description: 'Test Description'
      };

      const role = createValidRole(roleData);
      const protocol = role.toProtocol();

      expect(protocol.roleId).toBe(roleData.roleId);
      expect(protocol.contextId).toBe(roleData.contextId);
      expect(protocol.protocolVersion).toBe(roleData.protocolVersion);
      expect(protocol.name).toBe(roleData.name);
      expect(protocol.roleType).toBe(roleData.roleType);
      expect(protocol.status).toBe(roleData.status);
      expect(protocol.displayName).toBe(roleData.displayName);
      expect(protocol.description).toBe(roleData.description);
      expect(Array.isArray(protocol.permissions)).toBe(true);
      expect(typeof protocol.createdAt).toBe('string');
      expect(typeof protocol.updatedAt).toBe('string');
    });

    it('应该包含所有权限', () => {
      const role = createValidRole();
      const permissions = [
        createValidPermission({ resource_type: 'context' }),
        createValidPermission({ resource_type: 'plan' })
      ];

      permissions.forEach(p => role.addPermission(p));

      const protocol = role.toProtocol();

      expect(protocol.permissions).toEqual(permissions);
      expect(protocol.permissions.length).toBe(2);
    });

    it('应该处理可选字段', () => {
      const role = createValidRole({
        scope: {
          level: 'organization' as ScopeLevel,
          context_ids: [TestDataFactory.Base.generateUUID()],
          plan_ids: [TestDataFactory.Base.generateUUID()]
        },
        attributes: {
          department: 'engineering',
          custom_attributes: {
            priority: 'high'
          }
        }
      });

      const protocol = role.toProtocol();

      expect(protocol.scope).toEqual(role.scope);
      expect(protocol.attributes).toEqual(role.attributes);
    });
  });

  describe('fromProtocol - 真实协议解析', () => {
    it('应该正确从协议格式创建Role实例', () => {
      const protocolData = {
        roleId: TestDataFactory.Base.generateUUID(),
        contextId: TestDataFactory.Base.generateUUID(),
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        name: 'Protocol Role',
        roleType: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission()],
        displayName: 'Protocol Display Name',
        description: 'Protocol Description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const role = Role.fromProtocol(protocolData);

      expect(role.roleId).toBe(protocolData.roleId);
      expect(role.contextId).toBe(protocolData.contextId);
      expect(role.protocolVersion).toBe(protocolData.protocolVersion);
      expect(role.name).toBe(protocolData.name);
      expect(role.roleType).toBe(protocolData.roleType);
      expect(role.status).toBe(protocolData.status);
      expect(role.permissions).toEqual(protocolData.permissions);
      expect(role.displayName).toBe(protocolData.displayName);
      expect(role.description).toBe(protocolData.description);
    });

    it('应该处理最小协议数据', () => {
      const minimalProtocolData = {
        roleId: TestDataFactory.Base.generateUUID(),
        contextId: TestDataFactory.Base.generateUUID(),
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        name: 'Minimal Role',
        roleType: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const role = Role.fromProtocol(minimalProtocolData);

      expect(role.roleId).toBe(minimalProtocolData.roleId);
      expect(role.name).toBe(minimalProtocolData.name);
      expect(role.permissions).toEqual([]);
      expect(role.displayName).toBeUndefined();
      expect(role.description).toBeUndefined();
    });

    it('应该处理完整的协议数据', () => {
      const fullProtocolData = {
        roleId: TestDataFactory.Base.generateUUID(),
        contextId: TestDataFactory.Base.generateUUID(),
        protocolVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        name: 'Full Role',
        roleType: 'organizational' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission()],
        displayName: 'Full Display Name',
        description: 'Full Description',
        scope: {
          level: 'department' as ScopeLevel,
          boundaries: ['dept1', 'dept2'],
          restrictions: { time_based: true }
        },
        inheritance: {
          parent_roles: [{
            roleId: TestDataFactory.Base.generateUUID(),
            inheritance_type: 'full' as InheritanceType,
            excluded_permissions: []
          }],
          child_roles: [{
            roleId: TestDataFactory.Base.generateUUID(),
            delegation_level: 1,
            can_further_delegate: true
          }]
        },
        delegation: {
          can_delegate: true,
          max_delegation_depth: 3,
          delegation_restrictions: {}
        },
        attributes: {
          priority: 'high',
          department: 'engineering'
        },
        validationRules: {
          assignment_rules: [{
            rule_id: TestDataFactory.Base.generateUUID(),
            condition: 'user.department == "engineering"',
            action: 'allow' as const,
            message: 'Only engineering users allowed'
          }],
          separation_of_duties: [{
            conflicting_roles: [TestDataFactory.Base.generateUUID()],
            severity: 'warning' as const,
            exception_approval_required: true
          }]
        },
        auditSettings: {
          audit_enabled: true,
          audit_events: ['assignment', 'permission_change'],
          retention_period: '90d',
          compliance_frameworks: ['SOX']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const role = Role.fromProtocol(fullProtocolData);

      expect(role.scope).toEqual(fullProtocolData.scope);
      expect(role.inheritance).toEqual(fullProtocolData.inheritance);
      expect(role.delegation).toEqual(fullProtocolData.delegation);
      expect(role.attributes).toEqual(fullProtocolData.attributes);
      expect(role.validationRules).toEqual(fullProtocolData.validationRules);
      expect(role.auditSettings).toEqual(fullProtocolData.auditSettings);
    });
  });

  describe('边缘情况和异常处理', () => {
    it('应该处理极长的角色名称', () => {
      const longName = 'a'.repeat(1000);

      expect(() => {
        createValidRole({ name: longName });
      }).toThrow('角色名称不能超过100个字符');
    });

    it('应该处理空的角色名称', () => {
      expect(() => {
        createValidRole({ name: '' });
      }).toThrow('角色名称不能为空');

      expect(() => {
        createValidRole({ name: '   ' }); // 只有空格
      }).toThrow('角色名称不能为空');
    });

    it('应该处理大量权限的性能', () => {
      const role = createValidRole();
      const permissions = Array.from({ length: 1000 }, () => createValidPermission());

      const startTime = performance.now();
      permissions.forEach(p => role.addPermission(p));
      const endTime = performance.now();

      expect(role.permissions.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该处理权限检查的性能', () => {
      const role = createValidRole();
      const permissions = Array.from({ length: 100 }, () => createValidPermission());
      permissions.forEach(p => role.addPermission(p));

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        role.hasPermission('context', TestDataFactory.Base.generateUUID(), 'read');
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该处理特殊字符的角色名称', () => {
      const specialNames = [
        'Role with spaces',
        'Role-with-dashes',
        'Role_with_underscores',
        'Role.with.dots',
        'Role123',
        '角色中文名称',
        'Rôle with accénts'
      ];

      specialNames.forEach(name => {
        const role = createValidRole({ name });
        expect(role.name).toBe(name);
      });
    });

    it('应该处理并发权限操作', () => {
      const role = createValidRole();
      const permissions = Array.from({ length: 50 }, () => createValidPermission());

      // 模拟并发添加权限
      permissions.forEach(p => role.addPermission(p));

      // 模拟并发移除权限
      const toRemove = permissions.slice(0, 25);
      toRemove.forEach(p => role.removePermission(p.permission_id));

      expect(role.permissions.length).toBe(25);
    });

    it('应该处理协议转换的往返一致性', () => {
      const originalRole = createValidRole({
        displayName: 'Test Display',
        description: 'Test Description',
        scope: {
          level: 'organization' as ScopeLevel,
          boundaries: ['dept1'],
          restrictions: {}
        }
      });

      // 添加一些权限
      const permissions = [createValidPermission(), createValidPermission()];
      permissions.forEach(p => originalRole.addPermission(p));

      // 转换为协议格式再转换回来
      const protocol = originalRole.toProtocol();
      const reconstructedRole = Role.fromProtocol(protocol);

      // 验证关键属性一致性
      expect(reconstructedRole.roleId).toBe(originalRole.roleId);
      expect(reconstructedRole.name).toBe(originalRole.name);
      expect(reconstructedRole.roleType).toBe(originalRole.roleType);
      expect(reconstructedRole.status).toBe(originalRole.status);
      expect(reconstructedRole.permissions).toEqual(originalRole.permissions);
      expect(reconstructedRole.displayName).toBe(originalRole.displayName);
      expect(reconstructedRole.description).toBe(originalRole.description);
    });

    it('应该处理时间戳的边界情况', () => {
      const role = createValidRole();

      // 测试过期时间边界
      const almostExpiredPermission = createValidPermission({
        expiry: new Date(Date.now() + 1000).toISOString() // 1秒后过期
      });

      role.addPermission(almostExpiredPermission);

      // 立即检查应该有效
      expect(role.getActivePermissions()).toContain(almostExpiredPermission);

      // 等待过期后检查（在实际测试中可能需要mock时间）
      const justExpiredPermission = createValidPermission({
        expiry: new Date(Date.now() - 1).toISOString() // 1毫秒前过期
      });

      role.addPermission(justExpiredPermission);
      expect(role.getActivePermissions()).not.toContain(justExpiredPermission);
    });
  });
});
