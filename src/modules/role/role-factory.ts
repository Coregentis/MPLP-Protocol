/**
 * MPLP Role模块 - 角色工厂类
 * 
 * 负责角色创建和验证，确保符合Schema规范
 * 
 * @version v1.0.0
 * @created 2025-07-13T01:30:00+08:00
 * @compliance role-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  RoleProtocol,
  RoleOperationResult,
  RoleType,
  RoleStatus,
  Permission,
  RoleScope,
  RoleInheritance,
  ValidationRules,
  RoleAttributes,
  AuditSettings,
  CreateRoleRequest,
  ValidationError,
  RoleErrorCode
} from './types';
import { logger } from '../../utils/logger';

/**
 * 角色工厂类
 * 负责角色创建和验证
 */
export class RoleFactory {
  private static instance: RoleFactory;
  private readonly PROTOCOL_VERSION = '1.0.1';
  
  private constructor() {
    logger.info('RoleFactory initialized');
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): RoleFactory {
    if (!RoleFactory.instance) {
      RoleFactory.instance = new RoleFactory();
    }
    return RoleFactory.instance;
  }
  
  /**
   * 创建角色
   * 
   * @param request 创建角色请求
   * @returns 角色创建结果
   */
  public createRole(request: CreateRoleRequest): RoleOperationResult<RoleProtocol> {
    try {
      // 验证请求
      const validationResult = this.validateCreateRequest(request);
      if (!validationResult.valid) {
        return {
          success: false,
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Invalid role data',
            details: validationResult.errors
          }
        };
      }
      
      // 创建角色
      const role: RoleProtocol = {
        protocol_version: this.PROTOCOL_VERSION,
        timestamp: new Date().toISOString(),
        role_id: uuidv4(),
        context_id: request.context_id,
        name: request.name,
        display_name: request.display_name,
        description: request.description,
        role_type: request.role_type,
        status: 'active',  // 默认状态为活跃
        scope: request.scope,
        permissions: this.createPermissions(request.permissions),
        inheritance: request.inheritance,
        attributes: request.attributes,
        validation_rules: request.validation_rules,
        audit_settings: request.audit_settings 
          ? this.createAuditSettings(request.audit_settings) 
          : undefined
      };
      
      // 验证创建的角色
      const roleValidationResult = this.validateRole(role);
      if (!roleValidationResult.valid) {
        return {
          success: false,
          error: {
            code: RoleErrorCode.INVALID_ROLE_DATA,
            message: 'Invalid role data',
            details: roleValidationResult.errors
          }
        };
      }
      
      return {
        success: true,
        data: role
      };
    } catch (error) {
      logger.error('Error creating role', { error });
      return {
        success: false,
        error: {
          code: RoleErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
  
  /**
   * 创建权限数组
   * 
   * @param permissions 权限数组
   * @returns 完整权限数组
   */
  private createPermissions(permissions: Array<Partial<Permission>>): Permission[] {
    return permissions.map(perm => {
      if (!perm.permission_id) {
        perm.permission_id = uuidv4();
      }
      
      // 创建完整的权限对象
      return {
        permission_id: perm.permission_id,
        resource_type: perm.resource_type!,
        resource_id: perm.resource_id!,
        actions: perm.actions!,
        grant_type: perm.grant_type!,
        conditions: perm.conditions,
        expiry: perm.expiry
      };
    });
  }

  /**
   * 创建审计设置
   * 
   * @param auditSettings 部分审计设置
   * @returns 完整审计设置
   */
  private createAuditSettings(auditSettings: Partial<AuditSettings>): AuditSettings {
    return {
      audit_enabled: auditSettings.audit_enabled ?? true, // 默认启用审计
      audit_events: auditSettings.audit_events,
      retention_period: auditSettings.retention_period,
      compliance_frameworks: auditSettings.compliance_frameworks
    };
  }
  
  /**
   * 验证创建请求
   * 
   * @param request 创建请求
   * @returns 验证结果
   */
  private validateCreateRequest(request: CreateRoleRequest): { valid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    // 检查必填字段
    if (!request.context_id) {
      errors.push({
        field: 'context_id',
        message: 'Context ID is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!request.name) {
      errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(request.name)) {
      errors.push({
        field: 'name',
        message: 'Name can only contain letters, numbers, underscores and hyphens',
        code: 'INVALID_FORMAT'
      });
    } else if (request.name.length > 64) {
      errors.push({
        field: 'name',
        message: 'Name cannot exceed 64 characters',
        code: 'INVALID_LENGTH'
      });
    }
    
    if (!request.role_type) {
      errors.push({
        field: 'role_type',
        message: 'Role type is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!request.scope) {
      errors.push({
        field: 'scope',
        message: 'Scope is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!request.permissions || request.permissions.length === 0) {
      errors.push({
        field: 'permissions',
        message: 'At least one permission is required',
        code: 'REQUIRED_FIELD'
      });
    } else {
      // 检查权限对象
      request.permissions.forEach((perm, index) => {
        if (!perm.resource_type) {
          errors.push({
            field: `permissions[${index}].resource_type`,
            message: 'Resource type is required',
            code: 'REQUIRED_FIELD'
          });
        }
        
        if (!perm.resource_id) {
          errors.push({
            field: `permissions[${index}].resource_id`,
            message: 'Resource ID is required',
            code: 'REQUIRED_FIELD'
          });
        }
        
        if (!perm.actions || perm.actions.length === 0) {
          errors.push({
            field: `permissions[${index}].actions`,
            message: 'At least one action is required',
            code: 'REQUIRED_FIELD'
          });
        }
        
        if (!perm.grant_type) {
          errors.push({
            field: `permissions[${index}].grant_type`,
            message: 'Grant type is required',
            code: 'REQUIRED_FIELD'
          });
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证角色对象
   * 
   * @param role 角色对象
   * @returns 验证结果
   */
  public validateRole(role: RoleProtocol): { valid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    // 检查必填字段
    if (!role.protocol_version) {
      errors.push({
        field: 'protocol_version',
        message: 'Protocol version is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (role.protocol_version !== this.PROTOCOL_VERSION) {
      errors.push({
        field: 'protocol_version',
        message: `Invalid protocol version, expected ${this.PROTOCOL_VERSION}`,
        code: 'INVALID_VERSION'
      });
    }
    
    if (!role.timestamp) {
      errors.push({
        field: 'timestamp',
        message: 'Timestamp is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.role_id) {
      errors.push({
        field: 'role_id',
        message: 'Role ID is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.context_id) {
      errors.push({
        field: 'context_id',
        message: 'Context ID is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.name) {
      errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.role_type) {
      errors.push({
        field: 'role_type',
        message: 'Role type is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.status) {
      errors.push({
        field: 'status',
        message: 'Status is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    if (!role.permissions || role.permissions.length === 0) {
      errors.push({
        field: 'permissions',
        message: 'At least one permission is required',
        code: 'REQUIRED_FIELD'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 