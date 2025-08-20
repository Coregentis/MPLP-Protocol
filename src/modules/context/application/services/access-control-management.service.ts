/**
 * 访问控制管理服务
 * 
 * 应用服务，负责Context的访问控制管理
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import { 
  AccessControl,
  Owner,
  Permission,
  Policy,
  Action,
  PrincipalType
} from '../../domain/value-objects/access-control';

/**
 * 访问控制管理服务
 */
export class AccessControlManagementService {
  private readonly logger = new Logger('AccessControlManagementService');

  /**
   * 创建新的访问控制配置
   */
  createAccessControl(
    owner: Owner,
    permissions: Permission[] = [],
    policies: Policy[] = []
  ): AccessControl {
    try {
      this.logger.info('Creating new access control', {
        ownerId: owner.userId,
        ownerRole: owner.role,
        permissionCount: permissions.length,
        policyCount: policies.length
      });

      return new AccessControl(owner, permissions, policies);
    } catch (error) {
      this.logger.error('Failed to create access control', { error });
      throw error;
    }
  }

  /**
   * 添加权限
   */
  addPermission(
    currentAccessControl: AccessControl,
    permission: Permission
  ): AccessControl {
    try {
      this.validatePermission(permission);

      this.logger.info('Adding permission', {
        principal: permission.principal,
        principalType: permission.principalType,
        resource: permission.resource,
        actions: permission.actions
      });

      return currentAccessControl.addPermission(permission);
    } catch (error) {
      this.logger.error('Failed to add permission', { error, permission });
      throw error;
    }
  }

  /**
   * 移除权限
   */
  removePermission(
    currentAccessControl: AccessControl,
    principal: string,
    resource: string
  ): AccessControl {
    try {
      this.logger.info('Removing permission', { principal, resource });

      return currentAccessControl.removePermission(principal, resource);
    } catch (error) {
      this.logger.error('Failed to remove permission', { 
        error, 
        principal, 
        resource 
      });
      throw error;
    }
  }

  /**
   * 添加策略
   */
  addPolicy(
    currentAccessControl: AccessControl,
    policy: Policy
  ): AccessControl {
    try {
      this.validatePolicy(policy);

      this.logger.info('Adding policy', {
        policyId: policy.id,
        policyName: policy.name,
        policyType: policy.type,
        ruleCount: policy.rules.length,
        enforcement: policy.enforcement
      });

      return currentAccessControl.addPolicy(policy);
    } catch (error) {
      this.logger.error('Failed to add policy', { error, policy });
      throw error;
    }
  }

  /**
   * 移除策略
   */
  removePolicy(
    currentAccessControl: AccessControl,
    policyId: UUID
  ): AccessControl {
    try {
      this.logger.info('Removing policy', { policyId });

      return currentAccessControl.removePolicy(policyId);
    } catch (error) {
      this.logger.error('Failed to remove policy', { error, policyId });
      throw error;
    }
  }

  /**
   * 检查权限
   */
  checkPermission(
    accessControl: AccessControl,
    principal: string,
    resource: string,
    action: Action
  ): boolean {
    try {
      const hasPermission = accessControl.hasPermission(principal, resource, action);

      this.logger.debug('Permission check', {
        principal,
        resource,
        action,
        hasPermission
      });

      return hasPermission;
    } catch (error) {
      this.logger.error('Failed to check permission', { 
        error, 
        principal, 
        resource, 
        action 
      });
      return false;
    }
  }

  /**
   * 获取主体的所有权限
   */
  getPermissionsForPrincipal(
    accessControl: AccessControl,
    principal: string
  ): Permission[] {
    try {
      const permissions = accessControl.getPermissionsForPrincipal(principal);

      this.logger.debug('Retrieved permissions for principal', {
        principal,
        permissionCount: permissions.length
      });

      return permissions;
    } catch (error) {
      this.logger.error('Failed to get permissions for principal', { 
        error, 
        principal 
      });
      return [];
    }
  }

  /**
   * 获取资源的所有权限
   */
  getPermissionsForResource(
    accessControl: AccessControl,
    resource: string
  ): Permission[] {
    try {
      const permissions = accessControl.getPermissionsForResource(resource);

      this.logger.debug('Retrieved permissions for resource', {
        resource,
        permissionCount: permissions.length
      });

      return permissions;
    } catch (error) {
      this.logger.error('Failed to get permissions for resource', { 
        error, 
        resource 
      });
      return [];
    }
  }

  /**
   * 创建标准权限
   */
  createStandardPermission(
    principal: string,
    principalType: PrincipalType,
    resource: string,
    actions: Action[],
    conditions?: Record<string, unknown>
  ): Permission {
    return {
      principal,
      principalType,
      resource,
      actions,
      conditions
    };
  }

  /**
   * 创建只读权限
   */
  createReadOnlyPermission(
    principal: string,
    principalType: PrincipalType,
    resource: string
  ): Permission {
    return this.createStandardPermission(
      principal,
      principalType,
      resource,
      [Action.READ]
    );
  }

  /**
   * 创建读写权限
   */
  createReadWritePermission(
    principal: string,
    principalType: PrincipalType,
    resource: string
  ): Permission {
    return this.createStandardPermission(
      principal,
      principalType,
      resource,
      [Action.READ, Action.WRITE]
    );
  }

  /**
   * 创建管理员权限
   */
  createAdminPermission(
    principal: string,
    principalType: PrincipalType,
    resource: string
  ): Permission {
    return this.createStandardPermission(
      principal,
      principalType,
      resource,
      [Action.READ, Action.WRITE, Action.EXECUTE, Action.DELETE, Action.ADMIN]
    );
  }

  /**
   * 验证权限配置
   */
  private validatePermission(permission: Permission): void {
    if (!permission.principal || permission.principal.trim() === '') {
      throw new Error('Permission principal cannot be empty');
    }

    if (!permission.resource || permission.resource.trim() === '') {
      throw new Error('Permission resource cannot be empty');
    }

    if (!permission.actions || permission.actions.length === 0) {
      throw new Error('Permission must have at least one action');
    }

    // 验证操作的有效性
    for (const action of permission.actions) {
      if (!Object.values(Action).includes(action)) {
        throw new Error(`Invalid action: ${action}`);
      }
    }
  }

  /**
   * 验证策略配置
   */
  private validatePolicy(policy: Policy): void {
    if (!policy.id || policy.id.trim() === '') {
      throw new Error('Policy ID cannot be empty');
    }

    if (!policy.name || policy.name.trim() === '') {
      throw new Error('Policy name cannot be empty');
    }

    if (!policy.rules || policy.rules.length === 0) {
      throw new Error('Policy must have at least one rule');
    }

    // 验证策略规则
    for (const rule of policy.rules) {
      if (!rule.condition || rule.condition.trim() === '') {
        throw new Error('Policy rule condition cannot be empty');
      }

      if (!rule.action || rule.action.trim() === '') {
        throw new Error('Policy rule action cannot be empty');
      }

      if (rule.effect !== 'allow' && rule.effect !== 'deny') {
        throw new Error('Policy rule effect must be "allow" or "deny"');
      }
    }
  }
}
