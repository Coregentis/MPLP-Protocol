/**
 * RoleMapper真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 验证Schema-TypeScript双重命名约定转换的正确性
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { 
  RoleMapper, 
  RoleSchema, 
  RoleEntityData,
  CreateRoleSchema,
  CreateRoleEntityData,
  RoleFilterSchema,
  RoleFilterEntityData
} from '../../../src/modules/role/api/mappers/role.mapper';
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
  ResourceType,
  PermissionAction,
  GrantType,
  ScopeLevel
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleMapper真实实现单元测试', () => {
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

  // 辅助函数：创建有效的RoleSchema
  const createValidRoleSchema = (overrides: Partial<RoleSchema> = {}): RoleSchema => {
    const defaults = {
      protocol_version: '1.0.0',
      timestamp: new Date().toISOString(),
      role_id: TestDataFactory.Base.generateUUID(),
      context_id: TestDataFactory.Base.generateUUID(),
      name: 'Test Role',
      role_type: 'functional' as RoleType,
      status: 'active' as RoleStatus,
      permissions: [] as Permission[],
      display_name: 'Test Role Display',
      description: 'Test role description'
    };

    return { ...defaults, ...overrides };
  };

  describe('Schema转换 - toSchema', () => {
    it('应该正确将Role实体转换为Schema格式', () => {
      const role = createValidRole({
        name: 'Project Manager',
        roleType: 'organizational'
      });

      const schema = RoleMapper.toSchema(role);

      // 验证双重命名约定转换
      expect(schema.protocol_version).toBe(role.protocolVersion);
      expect(schema.timestamp).toBe(role.timestamp);
      expect(schema.role_id).toBe(role.roleId);
      expect(schema.context_id).toBe(role.contextId);
      expect(schema.name).toBe(role.name);
      expect(schema.role_type).toBe(role.roleType);
      expect(schema.status).toBe(role.status);
      expect(schema.permissions).toEqual(role.permissions);
      expect(schema.display_name).toBe(role.displayName);
      expect(schema.description).toBe(role.description);
    });

    it('应该正确处理可选字段', () => {
      const role = createValidRole();
      
      // 设置可选字段
      (role as any)._scope = {
        level: 'organization' as ScopeLevel,
        boundaries: ['department-1', 'department-2'],
        restrictions: {}
      } as RoleScope;

      (role as any)._inheritance = {
        parent_roles: [TestDataFactory.Base.generateUUID()],
        inheritance_type: 'additive',
        max_depth: 3
      } as RoleInheritance;

      const schema = RoleMapper.toSchema(role);

      expect(schema.scope).toEqual(role.scope);
      expect(schema.inheritance).toEqual(role.inheritance);
    });

    it('应该正确处理复杂的权限数组', () => {
      const role = createValidRole();
      const complexPermissions = [
        createValidPermission({
          resource_type: 'context',
          actions: ['read', 'update'],
          conditions: { department: 'engineering' }
        }),
        createValidPermission({
          resource_type: 'plan',
          actions: ['create', 'delete'],
          grant_type: 'inherited'
        })
      ];

      // 设置权限
      (role as any)._permissions = complexPermissions;

      const schema = RoleMapper.toSchema(role);

      expect(schema.permissions).toHaveLength(2);
      expect(schema.permissions[0]).toEqual(complexPermissions[0]);
      expect(schema.permissions[1]).toEqual(complexPermissions[1]);
    });

    it('应该正确处理agents和team_configuration', () => {
      const role = createValidRole();
      
      // 设置agents和team配置
      role.agents = ['agent-1', 'agent-2'];
      role.agentManagement = { maxAgents: 5, autoAssign: true };
      role.teamConfiguration = { maxTeamSize: 10, collaborationRules: [] };

      const schema = RoleMapper.toSchema(role);

      expect(schema.agents).toEqual(role.agents);
      expect(schema.agent_management).toEqual(role.agentManagement);
      expect(schema.team_configuration).toEqual(role.teamConfiguration);
    });
  });

  describe('实体转换 - fromSchema', () => {
    it('应该正确将Schema格式转换为TypeScript数据', () => {
      const schema = createValidRoleSchema({
        name: 'Data Analyst',
        role_type: 'functional'
      });

      const entityData = RoleMapper.fromSchema(schema);

      // 验证双重命名约定转换
      expect(entityData.protocolVersion).toBe(schema.protocol_version);
      expect(entityData.timestamp).toBe(schema.timestamp);
      expect(entityData.roleId).toBe(schema.role_id);
      expect(entityData.contextId).toBe(schema.context_id);
      expect(entityData.name).toBe(schema.name);
      expect(entityData.roleType).toBe(schema.role_type);
      expect(entityData.status).toBe(schema.status);
      expect(entityData.permissions).toEqual(schema.permissions);
      expect(entityData.displayName).toBe(schema.display_name);
      expect(entityData.description).toBe(schema.description);
    });

    it('应该正确处理可选字段的转换', () => {
      const schema = createValidRoleSchema();
      
      schema.scope = {
        level: 'project' as ScopeLevel,
        boundaries: ['project-1'],
        restrictions: { timeLimit: '30d' }
      } as RoleScope;

      schema.delegation = {
        can_delegate: true,
        delegation_depth: 2,
        allowed_delegates: [TestDataFactory.Base.generateUUID()],
        delegation_constraints: {}
      } as RoleDelegation;

      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.scope).toEqual(schema.scope);
      expect(entityData.delegation).toEqual(schema.delegation);
    });

    it('应该正确处理复杂的权限和属性', () => {
      const schema = createValidRoleSchema();
      
      schema.permissions = [
        createValidPermission({
          resource_type: 'trace',
          actions: ['read', 'analyze'],
          conditions: { sensitivity: 'high' }
        })
      ];

      schema.attributes = {
        priority: 'high',
        department: 'security',
        clearance_level: 'confidential'
      } as RoleAttributes;

      schema.validation_rules = {
        required_certifications: ['security-clearance'],
        min_experience_years: 5,
        background_check: true
      } as ValidationRules;

      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.permissions).toEqual(schema.permissions);
      expect(entityData.attributes).toEqual(schema.attributes);
      expect(entityData.validationRules).toEqual(schema.validation_rules);
    });

    it('应该正确处理审计设置', () => {
      const schema = createValidRoleSchema();
      
      schema.audit_settings = {
        log_all_actions: true,
        retention_days: 365,
        sensitive_operations: ['permission_change', 'role_assignment'],
        notification_settings: {
          email_alerts: true,
          slack_notifications: false
        }
      } as AuditSettings;

      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.auditSettings).toEqual(schema.audit_settings);
    });
  });

  describe('双向转换一致性验证', () => {
    it('应该保证toSchema和fromSchema的双向转换一致性', () => {
      const originalRole = createValidRole({
        name: 'System Administrator',
        roleType: 'system'
      });

      // 设置复杂数据
      (originalRole as any)._permissions = [createValidPermission()];
      originalRole.agents = ['admin-agent'];
      originalRole.agentManagement = { autoAssign: false };

      // 执行双向转换
      const schema = RoleMapper.toSchema(originalRole);
      const convertedData = RoleMapper.fromSchema(schema);

      // 验证关键字段的一致性
      expect(convertedData.protocolVersion).toBe(originalRole.protocolVersion);
      expect(convertedData.roleId).toBe(originalRole.roleId);
      expect(convertedData.contextId).toBe(originalRole.contextId);
      expect(convertedData.name).toBe(originalRole.name);
      expect(convertedData.roleType).toBe(originalRole.roleType);
      expect(convertedData.status).toBe(originalRole.status);
      expect(convertedData.permissions).toEqual(originalRole.permissions);
      expect(convertedData.agents).toEqual(originalRole.agents);
      expect(convertedData.agentManagement).toEqual(originalRole.agentManagement);
    });

    it('应该保证Schema到实体再到Schema的一致性', () => {
      const originalSchema = createValidRoleSchema({
        name: 'Quality Assurance',
        role_type: 'functional'
      });

      originalSchema.permissions = [createValidPermission()];
      originalSchema.agents = ['qa-agent-1', 'qa-agent-2'];

      // 执行双向转换
      const entityData = RoleMapper.fromSchema(originalSchema);
      
      // 创建Role实例进行反向转换
      const role = new Role(
        entityData.roleId,
        entityData.contextId,
        entityData.protocolVersion,
        entityData.name,
        entityData.roleType,
        entityData.status,
        entityData.permissions,
        entityData.timestamp,
        new Date().toISOString(),
        new Date().toISOString(),
        entityData.displayName,
        entityData.description
      );
      
      role.agents = entityData.agents;
      role.agentManagement = entityData.agentManagement;

      const convertedSchema = RoleMapper.toSchema(role);

      // 验证关键字段的一致性
      expect(convertedSchema.protocol_version).toBe(originalSchema.protocol_version);
      expect(convertedSchema.role_id).toBe(originalSchema.role_id);
      expect(convertedSchema.context_id).toBe(originalSchema.context_id);
      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.role_type).toBe(originalSchema.role_type);
      expect(convertedSchema.status).toBe(originalSchema.status);
      expect(convertedSchema.permissions).toEqual(originalSchema.permissions);
      expect(convertedSchema.agents).toEqual(originalSchema.agents);
    });
  });

  describe('Schema验证 - validateSchema', () => {
    it('应该验证有效的Schema数据', () => {
      const validSchema = createValidRoleSchema();

      const isValid = RoleMapper.validateSchema(validSchema);

      expect(isValid).toBe(true);
    });

    it('应该拒绝缺少必需字段的Schema', () => {
      const invalidSchema = {
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString(),
        // 缺少其他必需字段
      };

      const isValid = RoleMapper.validateSchema(invalidSchema);

      expect(isValid).toBe(false);
    });

    it('应该拒绝null或undefined数据', () => {
      expect(RoleMapper.validateSchema(null)).toBe(false);
      expect(RoleMapper.validateSchema(undefined)).toBe(false);
      expect(RoleMapper.validateSchema('')).toBe(false);
      expect(RoleMapper.validateSchema(123)).toBe(false);
    });

    it('应该验证包含所有必需字段的Schema', () => {
      const completeSchema = {
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString(),
        role_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Complete Role',
        role_type: 'functional',
        status: 'active',
        permissions: []
      };

      const isValid = RoleMapper.validateSchema(completeSchema);

      expect(isValid).toBe(true);
    });
  });

  describe('批量转换 - toSchemaArray/fromSchemaArray', () => {
    it('应该正确批量转换Role实体数组到Schema数组', () => {
      const roles = [
        createValidRole({ name: 'Role 1', roleType: 'functional' }),
        createValidRole({ name: 'Role 2', roleType: 'organizational' }),
        createValidRole({ name: 'Role 3', roleType: 'system' })
      ];

      const schemas = RoleMapper.toSchemaArray(roles);

      expect(schemas).toHaveLength(3);
      expect(schemas[0].name).toBe('Role 1');
      expect(schemas[0].role_type).toBe('functional');
      expect(schemas[1].name).toBe('Role 2');
      expect(schemas[1].role_type).toBe('organizational');
      expect(schemas[2].name).toBe('Role 3');
      expect(schemas[2].role_type).toBe('system');
    });

    it('应该正确批量转换Schema数组到实体数据数组', () => {
      const schemas = [
        createValidRoleSchema({ name: 'Schema Role 1', role_type: 'functional' }),
        createValidRoleSchema({ name: 'Schema Role 2', role_type: 'project' })
      ];

      const entityDataArray = RoleMapper.fromSchemaArray(schemas);

      expect(entityDataArray).toHaveLength(2);
      expect(entityDataArray[0].name).toBe('Schema Role 1');
      expect(entityDataArray[0].roleType).toBe('functional');
      expect(entityDataArray[1].name).toBe('Schema Role 2');
      expect(entityDataArray[1].roleType).toBe('project');
    });

    it('应该处理空数组', () => {
      const emptyRoles: Role[] = [];
      const emptySchemas: RoleSchema[] = [];

      expect(RoleMapper.toSchemaArray(emptyRoles)).toEqual([]);
      expect(RoleMapper.fromSchemaArray(emptySchemas)).toEqual([]);
    });
  });

  describe('创建请求转换 - createRequestToSchema/createRequestFromSchema', () => {
    it('应该正确转换创建请求到Schema格式', () => {
      const createRequest: CreateRoleEntityData = {
        contextId: TestDataFactory.Base.generateUUID(),
        name: 'New Role',
        roleType: 'functional',
        displayName: 'New Role Display',
        description: 'New role description',
        permissions: [createValidPermission()]
      };

      const schema = RoleMapper.createRequestToSchema(createRequest);

      expect(schema.context_id).toBe(createRequest.contextId);
      expect(schema.name).toBe(createRequest.name);
      expect(schema.role_type).toBe(createRequest.roleType);
      expect(schema.display_name).toBe(createRequest.displayName);
      expect(schema.description).toBe(createRequest.description);
      expect(schema.permissions).toEqual(createRequest.permissions);
    });

    it('应该正确转换Schema格式到创建请求', () => {
      const createSchema: CreateRoleSchema = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Schema Role',
        role_type: 'organizational',
        display_name: 'Schema Role Display',
        description: 'Schema role description',
        permissions: [createValidPermission()]
      };

      const entityData = RoleMapper.createRequestFromSchema(createSchema);

      expect(entityData.contextId).toBe(createSchema.context_id);
      expect(entityData.name).toBe(createSchema.name);
      expect(entityData.roleType).toBe(createSchema.role_type);
      expect(entityData.displayName).toBe(createSchema.display_name);
      expect(entityData.description).toBe(createSchema.description);
      expect(entityData.permissions).toEqual(createSchema.permissions);
    });

    it('应该处理可选字段', () => {
      const minimalRequest: CreateRoleEntityData = {
        contextId: TestDataFactory.Base.generateUUID(),
        name: 'Minimal Role',
        roleType: 'functional'
      };

      const schema = RoleMapper.createRequestToSchema(minimalRequest);

      expect(schema.context_id).toBe(minimalRequest.contextId);
      expect(schema.name).toBe(minimalRequest.name);
      expect(schema.role_type).toBe(minimalRequest.roleType);
      expect(schema.display_name).toBeUndefined();
      expect(schema.description).toBeUndefined();
      expect(schema.permissions).toBeUndefined();
    });
  });

  describe('过滤器转换 - filterToSchema/filterFromSchema', () => {
    it('应该正确转换过滤器到Schema格式', () => {
      const filter: RoleFilterEntityData = {
        contextId: TestDataFactory.Base.generateUUID(),
        roleType: 'functional',
        status: 'active',
        namePattern: 'Manager'
      };

      const schema = RoleMapper.filterToSchema(filter);

      expect(schema.context_id).toBe(filter.contextId);
      expect(schema.role_type).toBe(filter.roleType);
      expect(schema.status).toBe(filter.status);
      expect(schema.name_pattern).toBe(filter.namePattern);
    });

    it('应该正确转换Schema格式到过滤器', () => {
      const filterSchema: RoleFilterSchema = {
        context_id: TestDataFactory.Base.generateUUID(),
        role_type: 'organizational',
        status: 'inactive',
        name_pattern: 'Admin'
      };

      const filter = RoleMapper.filterFromSchema(filterSchema);

      expect(filter.contextId).toBe(filterSchema.context_id);
      expect(filter.roleType).toBe(filterSchema.role_type);
      expect(filter.status).toBe(filterSchema.status);
      expect(filter.namePattern).toBe(filterSchema.name_pattern);
    });

    it('应该处理部分过滤器字段', () => {
      const partialFilter: RoleFilterEntityData = {
        roleType: 'system'
      };

      const schema = RoleMapper.filterToSchema(partialFilter);

      expect(schema.context_id).toBeUndefined();
      expect(schema.role_type).toBe('system');
      expect(schema.status).toBeUndefined();
      expect(schema.name_pattern).toBeUndefined();
    });
  });

  describe('边缘情况和错误处理', () => {
    it('应该处理包含特殊字符的角色名称', () => {
      const role = createValidRole({
        name: 'Role with "quotes" and \\backslashes\\ & symbols!'
      });

      const schema = RoleMapper.toSchema(role);
      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.name).toBe(role.name);
    });

    it('应该处理空权限数组', () => {
      const role = createValidRole();
      (role as any)._permissions = [];

      const schema = RoleMapper.toSchema(role);

      expect(schema.permissions).toEqual([]);
    });

    it('应该处理大量权限的角色', () => {
      const role = createValidRole();
      const manyPermissions = Array.from({ length: 100 }, (_, i) =>
        createValidPermission({
          resource_type: 'context',
          actions: ['read'],
          resource_id: `resource-${i}`
        })
      );

      (role as any)._permissions = manyPermissions;

      const schema = RoleMapper.toSchema(role);

      expect(schema.permissions).toHaveLength(100);
      expect(schema.permissions[0].resource_id).toBe('resource-0');
      expect(schema.permissions[99].resource_id).toBe('resource-99');
    });

    it('应该处理复杂的嵌套对象', () => {
      const role = createValidRole();

      (role as any)._attributes = {
        nested: {
          deeply: {
            nested: {
              value: 'deep value',
              array: [1, 2, 3],
              object: { key: 'value' }
            }
          }
        }
      } as RoleAttributes;

      const schema = RoleMapper.toSchema(role);
      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.attributes).toEqual(role.attributes);
    });

    it('应该处理undefined和null值', () => {
      const schema = createValidRoleSchema();
      schema.display_name = undefined;
      schema.description = null as any;

      const entityData = RoleMapper.fromSchema(schema);

      expect(entityData.displayName).toBeUndefined();
      expect(entityData.description).toBeNull();
    });
  });
});
