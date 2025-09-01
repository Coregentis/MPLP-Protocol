/**
 * Role领域实体
 * 
 * @description Role模块的核心领域实体，基于实际Schema定义 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 领域层 - 实体
 */

import {
  UUID,
  RoleType,
  RoleStatus,
  SecurityClearance,
  Permission,
  RoleInheritance,
  RoleDelegation,
  RoleAttributes,
  ValidationRules,
  AuditSettings,
  Agent,
  PerformanceMetrics,
  MonitoringIntegration,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  AuditTrail
} from '../../types';

/**
 * Role领域实体
 * 
 * @description 企业级RBAC安全中心的核心领域实体，包含完整的角色管理、权限控制和安全审计功能
 */
export class RoleEntity {
  // 基础协议字段
  public readonly protocolVersion: string;
  public readonly timestamp: Date;
  public readonly roleId: UUID;
  public readonly contextId: UUID;
  
  // 角色核心字段
  public name: string;
  public displayName?: string;
  public description?: string;
  public roleType: RoleType;
  public status: RoleStatus;
  
  // 范围配置
  public scope?: {
    level: 'global' | 'organization' | 'project' | 'team' | 'individual';
    contextIds?: UUID[];
    planIds?: UUID[];
    resourceConstraints?: {
      maxContexts?: number;
      maxPlans?: number;
      allowedResourceTypes?: string[];
    };
  };
  
  // 权限管理
  public permissions: Permission[];
  
  // 继承机制
  public inheritance?: RoleInheritance;
  
  // 委托机制
  public delegation?: RoleDelegation;
  
  // 属性管理
  public attributes?: RoleAttributes;
  
  // 验证规则
  public validationRules?: ValidationRules;
  
  // 审计设置
  public auditSettings?: AuditSettings;
  
  // Agent管理
  public agents?: Agent[];
  
  // Agent管理配置
  public agentManagement?: {
    maxAgents?: number;
    autoScaling?: boolean;
    loadBalancing?: boolean;
    healthCheckIntervalMs?: number;
    defaultAgentConfig?: Record<string, unknown>;
  };
  
  // 团队配置
  public teamConfiguration?: {
    maxTeamSize?: number;
    collaborationRules?: Array<{
      ruleName: string;
      ruleType: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
      ruleConfig?: Record<string, unknown>;
    }>;
    decisionMechanism?: {
      type: 'consensus' | 'majority' | 'weighted' | 'authority';
      threshold?: number;
      timeoutMs?: number;
    };
  };
  
  // 性能监控
  public performanceMetrics: PerformanceMetrics;
  
  // 监控集成
  public monitoringIntegration: MonitoringIntegration;
  
  // 版本历史
  public versionHistory: VersionHistory;
  
  // 搜索元数据
  public searchMetadata: SearchMetadata;
  
  // 角色操作
  public roleOperation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';
  
  // 事件集成
  public eventIntegration: EventIntegration;
  
  // 审计跟踪
  public auditTrail: AuditTrail;

  /**
   * 构造函数
   * @param data 角色实体数据
   */
  constructor(data: {
    protocolVersion: string;
    timestamp: Date;
    roleId: UUID;
    contextId: UUID;
    name: string;
    roleType: RoleType;
    status: RoleStatus;
    permissions: Permission[];
    performanceMetrics: PerformanceMetrics;
    monitoringIntegration: MonitoringIntegration;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    roleOperation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';
    eventIntegration: EventIntegration;
    auditTrail: AuditTrail;
    displayName?: string;
    description?: string;
    scope?: RoleEntity['scope'];
    inheritance?: RoleInheritance;
    delegation?: RoleDelegation;
    attributes?: RoleAttributes;
    validationRules?: ValidationRules;
    auditSettings?: AuditSettings;
    agents?: Agent[];
    agentManagement?: RoleEntity['agentManagement'];
    teamConfiguration?: RoleEntity['teamConfiguration'];
  }) {
    // 基础协议字段
    this.protocolVersion = data.protocolVersion;
    this.timestamp = data.timestamp;
    this.roleId = data.roleId;
    this.contextId = data.contextId;
    
    // 角色核心字段
    this.name = data.name;
    this.displayName = data.displayName;
    this.description = data.description;
    this.roleType = data.roleType;
    this.status = data.status;
    
    // 可选字段
    this.scope = data.scope;
    this.permissions = data.permissions;
    this.inheritance = data.inheritance;
    this.delegation = data.delegation;
    this.attributes = data.attributes;
    this.validationRules = data.validationRules;
    this.auditSettings = data.auditSettings;
    this.agents = data.agents;
    this.agentManagement = data.agentManagement;
    this.teamConfiguration = data.teamConfiguration;
    
    // 必需字段
    this.performanceMetrics = data.performanceMetrics;
    this.monitoringIntegration = data.monitoringIntegration;
    this.versionHistory = data.versionHistory;
    this.searchMetadata = data.searchMetadata;
    this.roleOperation = data.roleOperation;
    this.eventIntegration = data.eventIntegration;
    this.auditTrail = data.auditTrail;
    
    // 验证实体有效性
    this.validate();
  }

  /**
   * 验证角色实体的有效性
   * @throws Error 如果实体无效
   */
  private validate(): void {
    if (!this.roleId || !this.contextId) {
      throw new Error('Role ID and Context ID are required');
    }
    
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Role name is required');
    }
    
    if (!this.roleType || !this.status) {
      throw new Error('Role type and status are required');
    }
    
    if (!Array.isArray(this.permissions)) {
      throw new Error('Permissions must be an array');
    }
  }

  /**
   * 检查角色是否有特定权限
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param action 操作类型
   * @returns 是否有权限
   */
  public hasPermission(
    resourceType: string,
    resourceId: string,
    action: string
  ): boolean {
    return this.permissions.some(permission =>
      (permission.resourceType === resourceType || permission.resourceType === 'system') &&
      (permission.resourceId === resourceId || permission.resourceId === '*') &&
      permission.actions.includes(action as 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin')
    );
  }

  /**
   * 添加权限
   * @param permission 权限对象
   */
  public addPermission(permission: Permission): void {
    // 检查权限是否已存在
    const exists = this.permissions.some(p => 
      p.permissionId === permission.permissionId
    );
    
    if (!exists) {
      this.permissions.push(permission);
    }
  }

  /**
   * 移除权限
   * @param permissionId 权限ID
   */
  public removePermission(permissionId: UUID): void {
    this.permissions = this.permissions.filter(p => 
      p.permissionId !== permissionId
    );
  }

  /**
   * 检查角色是否处于活跃状态
   * @returns 是否活跃
   */
  public isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 激活角色
   */
  public activate(): void {
    this.status = 'active';
  }

  /**
   * 停用角色
   */
  public deactivate(): void {
    this.status = 'inactive';
  }

  /**
   * 获取角色的安全级别
   * @returns 安全级别
   */
  public getSecurityClearance(): SecurityClearance | undefined {
    return this.attributes?.securityClearance;
  }

  /**
   * 检查角色是否可以委托权限
   * @returns 是否可以委托
   */
  public canDelegate(): boolean {
    return this.delegation?.canDelegate ?? false;
  }

  /**
   * 获取角色的复杂度评分
   * @returns 复杂度评分 (0-100)
   */
  public getComplexityScore(): number {
    let score = 0;
    
    // 基于权限数量
    score += Math.min(this.permissions.length * 2, 30);
    
    // 基于继承关系
    if (this.inheritance?.parentRoles?.length) {
      score += this.inheritance.parentRoles.length * 5;
    }
    
    // 基于委托关系
    if (this.delegation?.activeDelegations?.length) {
      score += this.delegation.activeDelegations.length * 3;
    }
    
    // 基于Agent数量
    if (this.agents?.length) {
      score += Math.min(this.agents.length * 2, 20);
    }
    
    // 基于验证规则
    if (this.validationRules?.assignmentRules?.length) {
      score += this.validationRules.assignmentRules.length * 2;
    }
    
    return Math.min(score, 100);
  }

  /**
   * 转换为简单对象
   * @returns 简单对象表示
   */
  public toPlainObject(): Record<string, unknown> {
    return {
      protocolVersion: this.protocolVersion,
      timestamp: this.timestamp,
      roleId: this.roleId,
      contextId: this.contextId,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      roleType: this.roleType,
      status: this.status,
      scope: this.scope,
      permissions: this.permissions,
      inheritance: this.inheritance,
      delegation: this.delegation,
      attributes: this.attributes,
      validationRules: this.validationRules,
      auditSettings: this.auditSettings,
      agents: this.agents,
      agentManagement: this.agentManagement,
      teamConfiguration: this.teamConfiguration,
      performanceMetrics: this.performanceMetrics,
      monitoringIntegration: this.monitoringIntegration,
      versionHistory: this.versionHistory,
      searchMetadata: this.searchMetadata,
      roleOperation: this.roleOperation,
      eventIntegration: this.eventIntegration,
      auditTrail: this.auditTrail
    };
  }
}
