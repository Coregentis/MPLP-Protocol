/**
 * Role实体单元测试
 * 
 * 基于Schema驱动测试原则，测试Role实体的所有领域行为
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T18:00:00+08:00
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
  ScopeLevel
} from '../../../src/modules/role/types';
import { UUID, Timestamp } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Role Entity', () => {
  // 辅助函数：创建有效的Permission
  const createValidPermission = (resourceType: ResourceType = 'context', action: PermissionAction = 'read'): Permission => ({
    permission_id: TestDataFactory.Base.generateUUID(),
    resource_type: resourceType,
    resource_id: TestDataFactory.Base.generateUUID(),
    actions: [action],
    conditions: {
      time_based: {
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString() // 24小时后
      },
      context_based: {
        required_attributes: { department: 'engineering' }
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

  // 辅助函数：创建有效的RoleInheritance
  const createValidInheritance = (): RoleInheritance => ({
    parent_roles: [{
      role_id: TestDataFactory.Base.generateUUID(),
      inheritance_type: 'full',
      excluded_permissions: []
    }],
    child_roles: [{
      role_id: TestDataFactory.Base.generateUUID(),
      delegation_level: 1,
      can_further_delegate: true
    }],
    inheritance_rules: {
      merge_strategy: 'union',
      conflict_resolution: 'most_restrictive'
    }
  });

  // 辅助函数：创建有效的RoleDelegation
  const createValidDelegation = (): RoleDelegation => ({
    can_delegate: true,
    delegatable_permissions: [TestDataFactory.Base.generateUUID()],
    delegation_constraints: {
      max_delegation_depth: 3,
      time_limit: 168, // 7天 * 24小时
      require_approval: true,
      revocable: true
    }
  });

  // 辅助函数：创建有效的RoleAttributes
  const createValidAttributes = (): RoleAttributes => ({
    security_clearance: 'confidential',
    department: 'engineering',
    seniority_level: 'senior',
    certification_requirements: [{
      certification: 'PMP',
      level: 'certified',
      expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issuer: 'PMI'
    }],
    custom_attributes: {
      priority: 100,
      category: 'management'
    }
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Role实例', async () => {
      // 基于实际Schema创建测试数据
      const roleParams = {
        role_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0',
        name: 'Project Manager',
        role_type: 'project' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission('context', 'read'), createValidPermission('plan', 'create')],
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name: 'Project Manager Role',
        description: 'Manages project lifecycle and resources',
        scope: createValidScope(),
        inheritance: createValidInheritance(),
        delegation: createValidDelegation(),
        attributes: createValidAttributes(),
        validation_rules: {
          max_assignments: 100,
          requires_approval: true,
          approval_workflow: 'standard'
        } as ValidationRules,
        audit_settings: {
          audit_enabled: true,
          audit_events: ['assignment', 'permission_change'],
          retention_period: '365d',
          compliance_frameworks: ['SOX', 'GDPR']
        } as AuditSettings
      };

      // 执行测试
      const role = await TestHelpers.Performance.expectExecutionTime(
        () => new Role(
          roleParams.role_id,
          roleParams.context_id,
          roleParams.protocol_version,
          roleParams.name,
          roleParams.role_type,
          roleParams.status,
          roleParams.permissions,
          roleParams.timestamp,
          roleParams.created_at,
          roleParams.updated_at,
          roleParams.display_name,
          roleParams.description,
          roleParams.scope,
          roleParams.inheritance,
          roleParams.delegation,
          roleParams.attributes,
          roleParams.validation_rules,
          roleParams.audit_settings
        ),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果 - 基于实际getter方法
      expect(role.role_id).toBe(roleParams.role_id);
      expect(role.context_id).toBe(roleParams.context_id);
      expect(role.protocol_version).toBe(roleParams.protocol_version);
      expect(role.name).toBe(roleParams.name);
      expect(role.role_type).toBe(roleParams.role_type);
      expect(role.status).toBe(roleParams.status);
      expect(role.permissions).toEqual(roleParams.permissions);
      expect(role.display_name).toBe(roleParams.display_name);
      expect(role.description).toBe(roleParams.description);
      expect(role.scope).toEqual(roleParams.scope);
      expect(role.inheritance).toEqual(roleParams.inheritance);
      expect(role.delegation).toEqual(roleParams.delegation);
      expect(role.attributes).toEqual(roleParams.attributes);
      expect(role.validation_rules).toEqual(roleParams.validation_rules);
      expect(role.audit_settings).toEqual(roleParams.audit_settings);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '最小必需参数',
          input: {
            role_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0',
            name: 'Basic Role',
            role_type: 'functional' as RoleType,
            status: 'active' as RoleStatus,
            permissions: [],
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expectedError: undefined
        },
        {
          name: '空权限数组',
          input: {
            role_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0',
            name: 'Empty Permissions Role',
            role_type: 'system' as RoleType,
            status: 'inactive' as RoleStatus,
            permissions: [],
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expectedError: undefined
        },
        {
          name: '包含所有可选参数',
          input: {
            role_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0',
            name: 'Full Featured Role',
            role_type: 'organizational' as RoleType,
            status: 'active' as RoleStatus,
            permissions: [createValidPermission()],
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Full Role',
            description: 'Complete role with all features',
            scope: createValidScope(),
            inheritance: createValidInheritance(),
            delegation: createValidDelegation(),
            attributes: createValidAttributes()
          },
          expectedError: undefined
        }
      ];

      for (const test of boundaryTests) {
        const role = new Role(
          test.input.role_id,
          test.input.context_id,
          test.input.protocol_version,
          test.input.name,
          test.input.role_type,
          test.input.status,
          test.input.permissions,
          test.input.timestamp,
          test.input.created_at,
          test.input.updated_at,
          test.input.display_name,
          test.input.description,
          test.input.scope,
          test.input.inheritance,
          test.input.delegation,
          test.input.attributes,
          undefined,
          undefined
        );

        expect(role.role_id).toBe(test.input.role_id);
        expect(role.context_id).toBe(test.input.context_id);
        expect(role.name).toBe(test.input.name);
        expect(role.role_type).toBe(test.input.role_type);
        expect(role.status).toBe(test.input.status);
        expect(role.permissions).toEqual(test.input.permissions);
      }
    });
  });

  describe('addPermission', () => {
    it('应该成功添加新权限', async () => {
      // 准备测试数据
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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
      const originalUpdatedAt = role.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      role.addPermission(newPermission);

      // 验证结果
      expect(role.permissions).toContain(newPermission);
      expect(role.permissions.length).toBe(1);
      expect(new Date(role.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });

    it('应该不添加重复的权限', () => {
      // 准备测试数据
      const existingPermission = createValidPermission('context', 'read');
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [existingPermission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 执行测试
      role.addPermission(existingPermission);

      // 验证结果
      expect(role.permissions).toContain(existingPermission);
      expect(role.permissions.length).toBe(1);
    });
  });

  describe('removePermission', () => {
    it('应该成功移除存在的权限', async () => {
      // 准备测试数据
      const permissionToRemove = createValidPermission('plan', 'delete');
      const otherPermission = createValidPermission('context', 'read');
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [permissionToRemove, otherPermission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = role.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      role.removePermission(permissionToRemove.permission_id);

      // 验证结果
      expect(role.permissions).not.toContain(permissionToRemove);
      expect(role.permissions).toContain(otherPermission);
      expect(role.permissions.length).toBe(1);
      expect(new Date(role.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('应该处理移除不存在的权限', () => {
      // 准备测试数据
      const existingPermission = createValidPermission('context', 'read');
      const nonExistentId = TestDataFactory.Base.generateUUID();
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [existingPermission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 执行测试
      role.removePermission(nonExistentId);

      // 验证结果
      expect(role.permissions).toContain(existingPermission);
      expect(role.permissions.length).toBe(1);
    });
  });

  describe('hasPermission', () => {
    it('应该正确检查权限存在', () => {
      // 准备测试数据
      const permission = createValidPermission('context', 'read');
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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

      // 执行测试
      const hasPermission = role.hasPermission('context', permission.resource_id!, 'read');

      // 验证结果
      expect(hasPermission).toBe(true);
    });

    it('应该正确检查权限不存在', () => {
      // 准备测试数据
      const permission = createValidPermission('context', 'read');
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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

      // 执行测试
      const hasPermission = role.hasPermission('plan', TestDataFactory.Base.generateUUID(), 'create');

      // 验证结果
      expect(hasPermission).toBe(false);
    });

    it('应该支持通配符资源ID', () => {
      // 准备测试数据
      const permission = createValidPermission('context', 'read');
      permission.resource_id = '*'; // 通配符
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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

      // 执行测试
      const hasPermission = role.hasPermission('context', TestDataFactory.Base.generateUUID(), 'read');

      // 验证结果
      expect(hasPermission).toBe(true);
    });
  });

  describe('getActivePermissions', () => {
    it('应该返回所有有效权限', () => {
      // 准备测试数据
      const activePermission = createValidPermission('context', 'read');
      const expiredPermission = createValidPermission('plan', 'create');
      expiredPermission.expiry = new Date(Date.now() - 86400000).toISOString(); // 昨天过期

      const role = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [activePermission, expiredPermission],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 执行测试
      const activePermissions = role.getActivePermissions();

      // 验证结果
      expect(activePermissions).toContain(activePermission);
      expect(activePermissions).not.toContain(expiredPermission);
      expect(activePermissions.length).toBe(1);
    });

    it('应该处理没有权限的情况', () => {
      // 准备测试数据
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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

      // 执行测试
      const activePermissions = role.getActivePermissions();

      // 验证结果
      expect(activePermissions).toEqual([]);
      expect(activePermissions.length).toBe(0);
    });
  });

  describe('updateAttributes', () => {
    it('应该成功更新角色属性', async () => {
      // 准备测试数据
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Test Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        { department: 'engineering', custom_attributes: { priority: 50, category: 'basic' } }
      );

      const newAttributes = { custom_attributes: { priority: 100, updated: true } };
      const originalUpdatedAt = role.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      role.updateAttributes(newAttributes);

      // 验证结果
      expect(role.attributes?.custom_attributes?.priority).toBe(100);
      expect(role.attributes?.department).toBe('engineering'); // 保留原有属性
      expect(role.attributes?.custom_attributes?.updated).toBe(true);
      expect(new Date(role.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('setScope', () => {
    it('应该成功设置角色范围', async () => {
      // 准备测试数据
      const role = new Role(
        TestDataFactory.Base.generateUUID(),
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

      const newScope = createValidScope();
      const originalUpdatedAt = role.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      role.setScope(newScope);

      // 验证结果
      expect(role.scope).toEqual(newScope);
      expect(new Date(role.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('isActive', () => {
    it('应该正确判断角色是否激活', () => {
      // 测试激活状态
      const activeRole = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Active Role',
        'functional',
        'active',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      expect(activeRole.isActive()).toBe(true);

      // 测试非激活状态
      const inactiveRole = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'Inactive Role',
        'functional',
        'inactive',
        [],
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      expect(inactiveRole.isActive()).toBe(false);
    });
  });

  describe('getter方法', () => {
    it('应该正确返回所有属性', () => {
      // 准备测试数据
      const roleParams = {
        role_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0',
        name: 'Test Role',
        role_type: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [createValidPermission()],
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name: 'Test Display Name',
        description: 'Test Description',
        scope: createValidScope(),
        inheritance: createValidInheritance(),
        delegation: createValidDelegation(),
        attributes: createValidAttributes()
      };

      const role = new Role(
        roleParams.role_id,
        roleParams.context_id,
        roleParams.protocol_version,
        roleParams.name,
        roleParams.role_type,
        roleParams.status,
        roleParams.permissions,
        roleParams.timestamp,
        roleParams.created_at,
        roleParams.updated_at,
        roleParams.display_name,
        roleParams.description,
        roleParams.scope,
        roleParams.inheritance,
        roleParams.delegation,
        roleParams.attributes
      );

      // 验证所有getter方法
      expect(role.role_id).toBe(roleParams.role_id);
      expect(role.context_id).toBe(roleParams.context_id);
      expect(role.protocol_version).toBe(roleParams.protocol_version);
      expect(role.name).toBe(roleParams.name);
      expect(role.role_type).toBe(roleParams.role_type);
      expect(role.status).toBe(roleParams.status);
      expect(role.permissions).toEqual(roleParams.permissions);
      expect(role.timestamp).toBe(roleParams.timestamp);
      expect(role.created_at).toBe(roleParams.created_at);
      expect(role.updated_at).toBe(roleParams.updated_at);
      expect(role.display_name).toBe(roleParams.display_name);
      expect(role.description).toBe(roleParams.description);
      expect(role.scope).toEqual(roleParams.scope);
      expect(role.inheritance).toEqual(roleParams.inheritance);
      expect(role.delegation).toEqual(roleParams.delegation);
      expect(role.attributes).toEqual(roleParams.attributes);
    });
  });
});
