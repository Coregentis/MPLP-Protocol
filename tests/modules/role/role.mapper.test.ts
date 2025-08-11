/**
 * Role Mapper测试
 * 
 * 测试Schema-TypeScript双重命名约定转换
 * 确保数据映射的正确性和一致性
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleMapper, RoleSchema } from '../../../src/modules/role/api/mappers/role.mapper';
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
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleMapper', () => {
  
  // 辅助函数：创建有效的Permission
  const createValidPermission = (): Permission => ({
    permission_id: TestDataFactory.Base.generateUUID(),
    resource_type: 'context' as ResourceType,
    resource_id: TestDataFactory.Base.generateUUID(),
    actions: ['read' as PermissionAction],
    conditions: {
      time_based: {
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000).toISOString()
      }
    },
    grant_type: 'direct' as GrantType,
    expiry: new Date(Date.now() + 86400000).toISOString()
  });

  // 辅助函数：创建有效的Role实体
  const createValidRole = (): Role => {
    const now = new Date().toISOString();
    return new Role(
      TestDataFactory.Base.generateUUID(),
      TestDataFactory.Base.generateUUID(),
      '1.0.0',
      'test-role',
      'functional' as RoleType,
      'active' as RoleStatus,
      [createValidPermission()],
      now,
      now,
      now,
      'Test Role',
      'A test role for mapping',
      {
        level: 'context' as ScopeLevel,
        resource_types: ['context' as ResourceType],
        constraints: {}
      } as RoleScope,
      undefined,
      undefined,
      {
        department: 'engineering',
        custom_attributes: {}
      } as RoleAttributes,
      undefined,
      undefined
    );
  };

  // 辅助函数：创建有效的RoleSchema
  const createValidRoleSchema = (): RoleSchema => ({
    protocol_version: '1.0.0',
    timestamp: new Date().toISOString(),
    role_id: TestDataFactory.Base.generateUUID(),
    context_id: TestDataFactory.Base.generateUUID(),
    name: 'test-role-schema',
    role_type: 'functional' as RoleType,
    status: 'active' as RoleStatus,
    permissions: [createValidPermission()],
    display_name: 'Test Role Schema',
    description: 'A test role schema for mapping',
    scope: {
      level: 'context' as ScopeLevel,
      resource_types: ['context' as ResourceType],
      constraints: {}
    } as RoleScope,
    inheritance: undefined,
    delegation: undefined,
    attributes: {
      department: 'engineering',
      custom_attributes: {}
    } as RoleAttributes,
    validation_rules: undefined,
    audit_settings: undefined,
    agents: [],
    agent_management: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  describe('toSchema', () => {
    it('应该正确将Role实体转换为Schema格式', () => {
      // 准备测试数据
      const role = createValidRole();
      
      // 执行测试
      const schema = RoleMapper.toSchema(role);
      
      // 验证结果 - 检查snake_case字段
      expect(schema.role_id).toBe(role.role_id);
      expect(schema.context_id).toBe(role.context_id);
      expect(schema.protocol_version).toBe(role.protocol_version);
      expect(schema.name).toBe(role.name);
      expect(schema.role_type).toBe(role.role_type);
      expect(schema.status).toBe(role.status);
      expect(schema.display_name).toBe(role.display_name);
      expect(schema.description).toBe(role.description);
      expect(schema.permissions).toEqual(role.permissions);
      expect(schema.scope).toEqual(role.scope);
      expect(schema.attributes).toEqual(role.attributes);
      // 注意：created_at和updated_at不在基础Schema中，由Controller层添加
    });

    it('应该处理可选字段为undefined的情况', () => {
      // 准备测试数据 - 创建最小化Role
      const now = new Date().toISOString();
      const minimalRole = new Role(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'minimal-role',
        'functional' as RoleType,
        'active' as RoleStatus,
        [],
        now,
        now,
        now
      );
      
      // 执行测试
      const schema = RoleMapper.toSchema(minimalRole);
      
      // 验证结果
      expect(schema.role_id).toBe(minimalRole.role_id);
      expect(schema.name).toBe(minimalRole.name);
      expect(schema.display_name).toBeUndefined();
      expect(schema.description).toBeUndefined();
      expect(schema.scope).toBeUndefined();
      expect(schema.inheritance).toBeUndefined();
      expect(schema.delegation).toBeUndefined();
      expect(schema.attributes).toBeUndefined();
      expect(schema.validation_rules).toBeUndefined();
      expect(schema.audit_settings).toBeUndefined();
    });

    it('应该正确处理复杂的权限数组', () => {
      // 准备测试数据
      const role = createValidRole();
      const complexPermissions: Permission[] = [
        createValidPermission(),
        {
          permission_id: TestDataFactory.Base.generateUUID(),
          resource_type: 'plan' as ResourceType,
          resource_id: '*',
          actions: ['create' as PermissionAction, 'update' as PermissionAction],
          conditions: {
            time_based: {
              start_time: new Date().toISOString(),
              end_time: new Date(Date.now() + 86400000).toISOString()
            },
            location_based: {
              allowed_ip_ranges: ['192.168.1.0/24']
            }
          },
          grant_type: 'inherited' as GrantType,
          expiry: new Date(Date.now() + 86400000).toISOString()
        }
      ];
      
      // 使用反射设置权限（因为permissions是私有的）
      (role as any)._permissions = complexPermissions;
      
      // 执行测试
      const schema = RoleMapper.toSchema(role);
      
      // 验证结果
      expect(schema.permissions).toHaveLength(2);
      expect(schema.permissions[0]).toEqual(complexPermissions[0]);
      expect(schema.permissions[1]).toEqual(complexPermissions[1]);
    });
  });

  describe('fromSchema', () => {
    it('应该正确将Schema格式转换为Role实体数据', () => {
      // 准备测试数据
      const schema = createValidRoleSchema();

      // 执行测试
      const roleData = RoleMapper.fromSchema(schema);

      // 验证结果 - 检查camelCase字段
      expect(roleData.roleId).toBe(schema.role_id);
      expect(roleData.contextId).toBe(schema.context_id);
      expect(roleData.protocolVersion).toBe(schema.protocol_version);
      expect(roleData.name).toBe(schema.name);
      expect(roleData.roleType).toBe(schema.role_type);
      expect(roleData.status).toBe(schema.status);
      expect(roleData.displayName).toBe(schema.display_name);
      expect(roleData.description).toBe(schema.description);
      expect(roleData.permissions).toEqual(schema.permissions);
      expect(roleData.scope).toEqual(schema.scope);
      expect(roleData.attributes).toEqual(schema.attributes);
      // 注意：fromSchema返回的是RoleEntityData，不包含created_at/updated_at
    });

    it('应该正确处理可选字段', () => {
      // 准备测试数据 - 最小化Schema
      const minimalSchema: RoleSchema = {
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString(),
        role_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'minimal-schema-role',
        role_type: 'functional' as RoleType,
        status: 'active' as RoleStatus,
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 执行测试
      const role = RoleMapper.fromSchema(minimalSchema);
      
      // 验证结果
      expect(role.roleId).toBe(minimalSchema.role_id);
      expect(role.name).toBe(minimalSchema.name);
      expect(role.displayName).toBeUndefined();
      expect(role.description).toBeUndefined();
      expect(role.scope).toBeUndefined();
      expect(role.inheritance).toBeUndefined();
      expect(role.delegation).toBeUndefined();
      expect(role.attributes).toBeUndefined();
    });

    it('应该正确处理继承和委托配置', () => {
      // 准备测试数据
      const schema = createValidRoleSchema();
      schema.inheritance = {
        parent_roles: [TestDataFactory.Base.generateUUID()],
        inheritance_type: 'additive',
        max_depth: 3
      } as RoleInheritance;
      
      schema.delegation = {
        can_delegate: true,
        delegation_depth: 2,
        allowed_delegates: [TestDataFactory.Base.generateUUID()],
        delegation_constraints: {}
      } as RoleDelegation;
      
      // 执行测试
      const role = RoleMapper.fromSchema(schema);
      
      // 验证结果
      expect(role.inheritance).toEqual(schema.inheritance);
      expect(role.delegation).toEqual(schema.delegation);
    });
  });

  describe('双向转换一致性', () => {
    it('应该保证toSchema和fromSchema的双向转换一致性', () => {
      // 准备测试数据
      const originalRole = createValidRole();
      
      // 执行双向转换
      const schema = RoleMapper.toSchema(originalRole);
      const convertedRole = RoleMapper.fromSchema(schema);
      
      // 验证结果 - 关键字段应该保持一致
      expect(convertedRole.roleId).toBe(originalRole.roleId);
      expect(convertedRole.contextId).toBe(originalRole.contextId);
      expect(convertedRole.name).toBe(originalRole.name);
      expect(convertedRole.roleType).toBe(originalRole.roleType);
      expect(convertedRole.status).toBe(originalRole.status);
      expect(convertedRole.displayName).toBe(originalRole.displayName);
      expect(convertedRole.description).toBe(originalRole.description);
      expect(convertedRole.permissions).toEqual(originalRole.permissions);
      expect(convertedRole.scope).toEqual(originalRole.scope);
      expect(convertedRole.attributes).toEqual(originalRole.attributes);
    });

    it('应该保证Schema到Role再到Schema的一致性', () => {
      // 准备测试数据
      const originalSchema = createValidRoleSchema();
      
      // 执行双向转换
      const role = RoleMapper.fromSchema(originalSchema);
      const convertedSchema = RoleMapper.toSchema(role);
      
      // 验证结果 - 关键字段应该保持一致
      expect(convertedSchema.role_id).toBe(originalSchema.role_id);
      expect(convertedSchema.context_id).toBe(originalSchema.context_id);
      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.role_type).toBe(originalSchema.role_type);
      expect(convertedSchema.status).toBe(originalSchema.status);
      expect(convertedSchema.display_name).toBe(originalSchema.display_name);
      expect(convertedSchema.description).toBe(originalSchema.description);
      expect(convertedSchema.permissions).toEqual(originalSchema.permissions);
      expect(convertedSchema.scope).toEqual(originalSchema.scope);
      expect(convertedSchema.attributes).toEqual(originalSchema.attributes);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的Schema数据', () => {
      // 准备测试数据 - 缺少必需字段的Schema
      const invalidSchema = {
        protocol_version: '1.0.0',
        // 缺少其他必需字段
      } as any;

      // 执行测试 - fromSchema不会抛出异常，而是返回部分数据
      const result = RoleMapper.fromSchema(invalidSchema);

      // 验证结果 - 应该有protocol_version但缺少其他字段
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.roleId).toBeUndefined();
      expect(result.contextId).toBeUndefined();
    });

    it('应该处理空权限数组', () => {
      // 准备测试数据
      const schema = createValidRoleSchema();
      schema.permissions = [];
      
      // 执行测试
      const role = RoleMapper.fromSchema(schema);
      
      // 验证结果
      expect(role.permissions).toEqual([]);
    });

    it('应该处理null和undefined值', () => {
      // 准备测试数据
      const schema = createValidRoleSchema();
      schema.display_name = undefined;
      schema.description = undefined;
      schema.scope = undefined;
      
      // 执行测试
      const role = RoleMapper.fromSchema(schema);
      
      // 验证结果
      expect(role.displayName).toBeUndefined();
      expect(role.description).toBeUndefined();
      expect(role.scope).toBeUndefined();
    });
  });
});
