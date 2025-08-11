/**
 * Role模块Mapper类
 * 
 * 实现Schema-TypeScript双重命名约定转换
 * 符合MPLP模块标准化规范强制要求
 * 
 * @version 1.0.0
 * @created 2025-08-09
 * @compliance MPLP模块标准化规范 - 强制Mapper实现
 */

import { Role } from '../../domain/entities/role.entity';
import { 
  RoleType, 
  RoleStatus, 
  Permission,
  RoleScope,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  ValidationRules,
  AuditSettings
} from '../../types';
import { UUID, Timestamp } from '../../../../public/shared/types';

// ===== Schema接口 (snake_case) =====

/**
 * Role Schema接口 - 严格遵循snake_case命名
 * 对应mplp-role.json Schema定义
 */
export interface RoleSchema {
  protocol_version: string;
  timestamp: string;
  role_id: string;
  context_id: string;
  name: string;
  role_type: RoleType;
  status: RoleStatus;
  permissions: Permission[];
  display_name?: string;
  description?: string;
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
  agents?: unknown[];
  agent_management?: Record<string, unknown>;
  team_configuration?: Record<string, unknown>;
}

/**
 * 创建角色Schema请求
 */
export interface CreateRoleSchema {
  context_id: string;
  name: string;
  role_type: RoleType;
  display_name?: string;
  description?: string;
  permissions?: Permission[];
}

/**
 * 角色查询Schema过滤器
 */
export interface RoleFilterSchema {
  context_id?: string;
  role_type?: RoleType;
  status?: RoleStatus;
  name_pattern?: string;
}

// ===== TypeScript接口 (camelCase) =====

/**
 * Role实体数据接口 - 严格遵循camelCase命名
 * 用于TypeScript应用层
 */
export interface RoleEntityData {
  protocolVersion: string;
  timestamp: Timestamp;
  roleId: UUID;
  contextId: UUID;
  name: string;
  roleType: RoleType;
  status: RoleStatus;
  permissions: Permission[];
  displayName?: string;
  description?: string;
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validationRules?: ValidationRules;
  auditSettings?: AuditSettings;
  agents?: unknown[];
  agentManagement?: Record<string, unknown>;
  teamConfiguration?: Record<string, unknown>;
}

/**
 * 创建角色TypeScript请求
 */
export interface CreateRoleEntityData {
  contextId: string;
  name: string;
  roleType: RoleType;
  displayName?: string;
  description?: string;
  permissions?: Permission[];
}

/**
 * 角色查询TypeScript过滤器
 */
export interface RoleFilterEntityData {
  contextId?: string;
  roleType?: RoleType;
  status?: RoleStatus;
  namePattern?: string;
}

// ===== RoleMapper类 (强制要求) =====

/**
 * Role模块Mapper类
 * 
 * 实现Schema-TypeScript双重命名约定转换
 * 符合MPLP模块标准化规范的强制要求
 */
export class RoleMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: Role): RoleSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      role_id: entity.roleId,
      context_id: entity.contextId,
      name: entity.name,
      role_type: entity.roleType,
      status: entity.status,
      permissions: entity.permissions,
      display_name: entity.displayName,
      description: entity.description,
      scope: entity.scope,
      inheritance: entity.inheritance,
      delegation: entity.delegation,
      attributes: entity.attributes,
      validation_rules: entity.validationRules,
      audit_settings: entity.auditSettings,
      agents: entity.agents,
      agent_management: entity.agentManagement,
      team_configuration: entity.teamConfiguration
    };
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: RoleSchema): RoleEntityData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      roleId: schema.role_id,
      contextId: schema.context_id,
      name: schema.name,
      roleType: schema.role_type,
      status: schema.status,
      permissions: schema.permissions,
      displayName: schema.display_name,
      description: schema.description,
      scope: schema.scope,
      inheritance: schema.inheritance,
      delegation: schema.delegation,
      attributes: schema.attributes,
      validationRules: schema.validation_rules,
      auditSettings: schema.audit_settings,
      agents: schema.agents,
      agentManagement: schema.agent_management,
      teamConfiguration: schema.team_configuration
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is RoleSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;
    
    // 验证必需字段
    const requiredFields = [
      'protocol_version', 'timestamp', 'role_id', 'context_id', 
      'name', 'role_type', 'status', 'permissions'
    ];

    return requiredFields.every(field => field in schema);
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: Role[]): RoleSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: RoleSchema[]): RoleEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 创建角色请求：TypeScript → Schema
   */
  static createRequestToSchema(request: CreateRoleEntityData): CreateRoleSchema {
    return {
      context_id: request.contextId,
      name: request.name,
      role_type: request.roleType,
      display_name: request.displayName,
      description: request.description,
      permissions: request.permissions
    };
  }

  /**
   * 创建角色请求：Schema → TypeScript
   */
  static createRequestFromSchema(schema: CreateRoleSchema): CreateRoleEntityData {
    return {
      contextId: schema.context_id,
      name: schema.name,
      roleType: schema.role_type,
      displayName: schema.display_name,
      description: schema.description,
      permissions: schema.permissions
    };
  }

  /**
   * 过滤器：TypeScript → Schema
   */
  static filterToSchema(filter: RoleFilterEntityData): RoleFilterSchema {
    return {
      context_id: filter.contextId,
      role_type: filter.roleType,
      status: filter.status,
      name_pattern: filter.namePattern
    };
  }

  /**
   * 过滤器：Schema → TypeScript
   */
  static filterFromSchema(schema: RoleFilterSchema): RoleFilterEntityData {
    return {
      contextId: schema.context_id,
      roleType: schema.role_type,
      status: schema.status,
      namePattern: schema.name_pattern
    };
  }
}
