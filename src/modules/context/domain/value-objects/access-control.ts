/**
 * 访问控制值对象
 * 
 * 领域值对象，表示Context的访问控制配置
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { UUID } from '../../../../public/shared/types';

/**
 * 主体类型枚举
 */
export enum PrincipalType {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group'
}

/**
 * 操作类型枚举
 */
export enum Action {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * 策略类型枚举
 */
export enum PolicyType {
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational'
}

/**
 * 策略执行模式枚举
 */
export enum PolicyEnforcement {
  STRICT = 'strict',
  ADVISORY = 'advisory',
  DISABLED = 'disabled'
}

/**
 * 所有者接口
 */
export interface Owner {
  userId: string;
  role: string;
}

/**
 * 权限接口
 */
export interface Permission {
  principal: string;
  principalType: PrincipalType;
  resource: string;
  actions: Action[];
  conditions?: Record<string, unknown>;
}

/**
 * 策略规则接口
 */
export interface PolicyRule {
  condition: string;
  action: string;
  effect: 'allow' | 'deny';
}

/**
 * 策略接口
 */
export interface Policy {
  id: UUID;
  name: string;
  type: PolicyType;
  rules: PolicyRule[];
  enforcement: PolicyEnforcement;
}

/**
 * 访问控制值对象
 */
export class AccessControl {
  constructor(
    public readonly owner: Owner,
    public readonly permissions: Permission[] = [],
    public readonly policies: Policy[] = []
  ) {
    this.validateAccessControl();
  }

  /**
   * 验证访问控制配置的有效性
   */
  private validateAccessControl(): void {
    // 验证所有者
    if (!this.owner.userId || !this.owner.role) {
      throw new Error('Owner must have userId and role');
    }

    // 验证权限
    for (const permission of this.permissions) {
      if (!permission.principal || !permission.resource || !permission.actions.length) {
        throw new Error('Invalid permission configuration');
      }
    }

    // 验证策略
    for (const policy of this.policies) {
      if (!policy.id || !policy.name || !policy.rules.length) {
        throw new Error('Invalid policy configuration');
      }
      
      for (const rule of policy.rules) {
        if (!rule.condition || !rule.action || !rule.effect) {
          throw new Error(`Invalid rule in policy ${policy.name}`);
        }
      }
    }
  }

  /**
   * 添加权限
   */
  addPermission(permission: Permission): AccessControl {
    const existingIndex = this.permissions.findIndex(
      p => p.principal === permission.principal && 
           p.resource === permission.resource
    );
    
    const newPermissions = [...this.permissions];
    
    if (existingIndex >= 0) {
      newPermissions[existingIndex] = permission;
    } else {
      newPermissions.push(permission);
    }

    return new AccessControl(this.owner, newPermissions, this.policies);
  }

  /**
   * 移除权限
   */
  removePermission(principal: string, resource: string): AccessControl {
    const newPermissions = this.permissions.filter(
      p => !(p.principal === principal && p.resource === resource)
    );

    return new AccessControl(this.owner, newPermissions, this.policies);
  }

  /**
   * 添加策略
   */
  addPolicy(policy: Policy): AccessControl {
    const existingIndex = this.policies.findIndex(p => p.id === policy.id);
    const newPolicies = [...this.policies];
    
    if (existingIndex >= 0) {
      newPolicies[existingIndex] = policy;
    } else {
      newPolicies.push(policy);
    }

    return new AccessControl(this.owner, this.permissions, newPolicies);
  }

  /**
   * 移除策略
   */
  removePolicy(policyId: UUID): AccessControl {
    const newPolicies = this.policies.filter(p => p.id !== policyId);
    return new AccessControl(this.owner, this.permissions, newPolicies);
  }

  /**
   * 检查权限
   */
  hasPermission(principal: string, resource: string, action: Action): boolean {
    // 检查所有者权限
    if (principal === this.owner.userId) {
      return true;
    }

    // 检查显式权限
    const permission = this.permissions.find(
      p => p.principal === principal && p.resource === resource
    );

    if (permission && permission.actions.includes(action)) {
      return true;
    }

    // 检查策略
    for (const policy of this.policies) {
      if (policy.enforcement === PolicyEnforcement.DISABLED) {
        continue;
      }

      for (const rule of policy.rules) {
        // 简化的策略评估逻辑
        if (rule.action === action.toString() && rule.effect === 'allow') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 获取主体的所有权限
   */
  getPermissionsForPrincipal(principal: string): Permission[] {
    return this.permissions.filter(p => p.principal === principal);
  }

  /**
   * 获取资源的所有权限
   */
  getPermissionsForResource(resource: string): Permission[] {
    return this.permissions.filter(p => p.resource === resource);
  }

  /**
   * 转换为Schema格式（snake_case）
   */
  toSchemaFormat(): Record<string, unknown> {
    return {
      owner: {
        user_id: this.owner.userId,
        role: this.owner.role
      },
      permissions: this.permissions.map(permission => ({
        principal: permission.principal,
        principal_type: permission.principalType,
        resource: permission.resource,
        actions: permission.actions,
        conditions: permission.conditions
      })),
      policies: this.policies.map(policy => ({
        id: policy.id,
        name: policy.name,
        type: policy.type,
        rules: policy.rules,
        enforcement: policy.enforcement
      }))
    };
  }

  /**
   * 从Schema格式创建（snake_case）
   */
  static fromSchemaFormat(data: Record<string, unknown>): AccessControl {
    const ownerData = data.owner as any;
    const owner: Owner = {
      userId: ownerData.user_id,
      role: ownerData.role
    };

    const permissions = (data.permissions as any[] || []).map(perm => ({
      principal: perm.principal,
      principalType: perm.principal_type as PrincipalType,
      resource: perm.resource,
      actions: perm.actions as Action[],
      conditions: perm.conditions
    }));

    const policies = (data.policies as any[] || []).map(policy => ({
      id: policy.id,
      name: policy.name,
      type: policy.type as PolicyType,
      rules: policy.rules as PolicyRule[],
      enforcement: policy.enforcement as PolicyEnforcement
    }));

    return new AccessControl(owner, permissions, policies);
  }
}
