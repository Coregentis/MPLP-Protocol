/**
 * Role领域实体
 * 
 * 角色管理的核心领域实体，封装角色业务逻辑和不变性约束
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
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
  ResourceType
} from '../../types';

/**
 * Role领域实体
 */
export class Role {
  private _role_id: UUID;
  private _context_id: UUID;
  private _protocol_version: string;
  private _name: string;
  private _role_type: RoleType;
  private _status: RoleStatus;
  private _permissions: Permission[];
  private _display_name?: string;
  private _description?: string;
  private _scope?: RoleScope;
  private _inheritance?: RoleInheritance;
  private _delegation?: RoleDelegation;
  private _attributes?: RoleAttributes;
  private _validation_rules?: ValidationRules;
  private _audit_settings?: AuditSettings;
  private _timestamp: Timestamp;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;

  constructor(
    role_id: UUID,
    context_id: UUID,
    protocol_version: string,
    name: string,
    role_type: RoleType,
    status: RoleStatus,
    permissions: Permission[],
    timestamp: Timestamp,
    created_at: Timestamp,
    updated_at: Timestamp,
    display_name?: string,
    description?: string,
    scope?: RoleScope,
    inheritance?: RoleInheritance,
    delegation?: RoleDelegation,
    attributes?: RoleAttributes,
    validation_rules?: ValidationRules,
    audit_settings?: AuditSettings
  ) {
    this._role_id = role_id;
    this._context_id = context_id;
    this._protocol_version = protocol_version;
    this._name = name;
    this._role_type = role_type;
    this._status = status;
    this._permissions = permissions;
    this._timestamp = timestamp;
    this._created_at = created_at;
    this._updated_at = updated_at;
    this._display_name = display_name;
    this._description = description;
    this._scope = scope;
    this._inheritance = inheritance;
    this._delegation = delegation;
    this._attributes = attributes;
    this._validation_rules = validation_rules;
    this._audit_settings = audit_settings;

    this.validateInvariants();
  }

  // Getters
  get role_id(): UUID { return this._role_id; }
  get context_id(): UUID { return this._context_id; }
  get protocol_version(): string { return this._protocol_version; }
  get name(): string { return this._name; }
  get role_type(): RoleType { return this._role_type; }
  get status(): RoleStatus { return this._status; }
  get permissions(): Permission[] { return [...this._permissions]; }
  get display_name(): string | undefined { return this._display_name; }
  get description(): string | undefined { return this._description; }
  get scope(): RoleScope | undefined { return this._scope; }
  get inheritance(): RoleInheritance | undefined { return this._inheritance; }
  get delegation(): RoleDelegation | undefined { return this._delegation; }
  get attributes(): RoleAttributes | undefined { return this._attributes; }
  get validation_rules(): ValidationRules | undefined { return this._validation_rules; }
  get audit_settings(): AuditSettings | undefined { return this._audit_settings; }
  get timestamp(): Timestamp { return this._timestamp; }
  get created_at(): Timestamp { return this._created_at; }
  get updated_at(): Timestamp { return this._updated_at; }

  /**
   * 更新角色状态
   */
  updateStatus(newStatus: RoleStatus): void {
    this.validateStatusTransition(this._status, newStatus);
    this._status = newStatus;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 添加权限
   */
  addPermission(permission: Permission): void {
    // 检查权限是否已存在
    const exists = this._permissions.some(p => 
      p.permission_id === permission.permission_id ||
      (p.resource_type === permission.resource_type && 
       p.resource_id === permission.resource_id &&
       JSON.stringify(p.actions.sort()) === JSON.stringify(permission.actions.sort()))
    );

    if (!exists) {
      this._permissions.push(permission);
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 移除权限
   */
  removePermission(permissionId: UUID): void {
    const initialLength = this._permissions.length;
    this._permissions = this._permissions.filter(p => p.permission_id !== permissionId);
    
    if (this._permissions.length !== initialLength) {
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 检查是否有特定权限
   */
  hasPermission(resourceType: ResourceType, resourceId: UUID | '*', action: PermissionAction): boolean {
    return this._permissions.some(permission => {
      // 检查资源类型匹配
      if (permission.resource_type !== resourceType) return false;
      
      // 检查资源ID匹配（通配符或精确匹配）
      if (permission.resource_id !== '*' && permission.resource_id !== resourceId) return false;
      
      // 检查操作权限
      if (!permission.actions.includes(action)) return false;
      
      // 检查权限是否过期
      if (permission.expiry && new Date(permission.expiry) < new Date()) return false;
      
      // 检查条件限制（简化实现）
      if (permission.conditions) {
        // 这里可以添加更复杂的条件检查逻辑
        return this.checkPermissionConditions(permission.conditions);
      }
      
      return true;
    });
  }

  /**
   * 获取有效权限列表
   */
  getActivePermissions(): Permission[] {
    const now = new Date();
    return this._permissions.filter(permission => {
      // 过滤过期权限
      if (permission.expiry && new Date(permission.expiry) < now) return false;
      
      // 检查条件限制
      if (permission.conditions) {
        return this.checkPermissionConditions(permission.conditions);
      }
      
      return true;
    });
  }

  /**
   * 更新角色属性
   */
  updateAttributes(attributes: RoleAttributes): void {
    this._attributes = { ...this._attributes, ...attributes };
    this._updated_at = new Date().toISOString();
  }

  /**
   * 设置角色范围
   */
  setScope(scope: RoleScope): void {
    this._scope = scope;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 检查角色是否激活
   */
  isActive(): boolean {
    return this._status === 'active';
  }

  /**
   * 检查角色是否可以委托
   */
  canDelegate(): boolean {
    return this.isActive() && !!this._delegation?.can_delegate;
  }

  /**
   * 获取继承的权限
   */
  getInheritedPermissions(): Permission[] {
    // 这里应该从父角色获取继承的权限
    // 简化实现，返回空数组
    return [];
  }

  /**
   * 验证领域不变性
   */
  private validateInvariants(): void {
    if (!this._role_id) {
      throw new Error('角色ID不能为空');
    }
    if (!this._context_id) {
      throw new Error('上下文ID不能为空');
    }
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('角色名称不能为空');
    }
    if (this._name.length > 100) {
      throw new Error('角色名称不能超过100个字符');
    }
  }

  /**
   * 验证状态转换的有效性
   */
  private validateStatusTransition(from: RoleStatus, to: RoleStatus): void {
    const validTransitions: Record<RoleStatus, RoleStatus[]> = {
      'active': ['inactive', 'suspended', 'deprecated'],
      'inactive': ['active', 'deprecated'],
      'suspended': ['active', 'deprecated'],
      'deprecated': []
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`无效的状态转换: ${from} -> ${to}`);
    }
  }

  /**
   * 检查权限条件
   */
  private checkPermissionConditions(conditions: any): boolean {
    // 简化的条件检查实现
    // 在实际应用中，这里应该包含更复杂的条件验证逻辑
    
    if (conditions.time_based) {
      const now = new Date();
      if (conditions.time_based.start_time && new Date(conditions.time_based.start_time) > now) {
        return false;
      }
      if (conditions.time_based.end_time && new Date(conditions.time_based.end_time) < now) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 转换为协议格式
   */
  toProtocol(): any {
    return {
      protocol_version: this._protocol_version,
      timestamp: this._timestamp,
      role_id: this._role_id,
      context_id: this._context_id,
      name: this._name,
      role_type: this._role_type,
      status: this._status,
      permissions: this._permissions,
      display_name: this._display_name,
      description: this._description,
      scope: this._scope,
      inheritance: this._inheritance,
      delegation: this._delegation,
      attributes: this._attributes,
      validation_rules: this._validation_rules,
      audit_settings: this._audit_settings,
      created_at: this._created_at,
      updated_at: this._updated_at
    };
  }

  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: any): Role {
    return new Role(
      protocol.role_id,
      protocol.context_id,
      protocol.protocol_version,
      protocol.name,
      protocol.role_type,
      protocol.status,
      protocol.permissions || [],
      protocol.timestamp,
      protocol.created_at,
      protocol.updated_at,
      protocol.display_name,
      protocol.description,
      protocol.scope,
      protocol.inheritance,
      protocol.delegation,
      protocol.attributes,
      protocol.validation_rules,
      protocol.audit_settings
    );
  }
}
