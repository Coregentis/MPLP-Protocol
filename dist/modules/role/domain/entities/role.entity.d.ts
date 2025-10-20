/**
 * Role领域实体
 *
 * @description Role模块的核心领域实体，基于实际Schema定义 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
import { UUID, RoleType, RoleStatus, SecurityClearance, Permission, RoleInheritance, RoleDelegation, RoleAttributes, ValidationRules, AuditSettings, Agent, PerformanceMetrics, MonitoringIntegration, VersionHistory, SearchMetadata, EventIntegration, AuditTrail } from '../../types';
/**
 * Role领域实体
 *
 * @description 企业级RBAC安全中心的核心领域实体，包含完整的角色管理、权限控制和安全审计功能
 */
export declare class RoleEntity {
    readonly protocolVersion: string;
    readonly timestamp: Date;
    readonly roleId: UUID;
    readonly contextId: UUID;
    name: string;
    displayName?: string;
    description?: string;
    roleType: RoleType;
    status: RoleStatus;
    scope?: {
        level: 'global' | 'organization' | 'project' | 'team' | 'individual';
        contextIds?: UUID[];
        planIds?: UUID[];
        resourceConstraints?: {
            maxContexts?: number;
            maxPlans?: number;
            allowedResourceTypes?: string[];
        };
    };
    permissions: Permission[];
    inheritance?: RoleInheritance;
    delegation?: RoleDelegation;
    attributes?: RoleAttributes;
    validationRules?: ValidationRules;
    auditSettings?: AuditSettings;
    agents?: Agent[];
    agentManagement?: {
        maxAgents?: number;
        autoScaling?: boolean;
        loadBalancing?: boolean;
        healthCheckIntervalMs?: number;
        defaultAgentConfig?: Record<string, unknown>;
    };
    teamConfiguration?: {
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
    performanceMetrics: PerformanceMetrics;
    monitoringIntegration: MonitoringIntegration;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    roleOperation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';
    eventIntegration: EventIntegration;
    auditTrail: AuditTrail;
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
    });
    /**
     * 验证角色实体的有效性
     * @throws Error 如果实体无效
     */
    private validate;
    /**
     * 检查角色是否有特定权限
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @returns 是否有权限
     */
    hasPermission(resourceType: string, resourceId: string, action: string): boolean;
    /**
     * 添加权限
     * @param permission 权限对象
     */
    addPermission(permission: Permission): void;
    /**
     * 移除权限
     * @param permissionId 权限ID
     */
    removePermission(permissionId: UUID): void;
    /**
     * 检查角色是否处于活跃状态
     * @returns 是否活跃
     */
    isActive(): boolean;
    /**
     * 激活角色
     */
    activate(): void;
    /**
     * 停用角色
     */
    deactivate(): void;
    /**
     * 获取角色的安全级别
     * @returns 安全级别
     */
    getSecurityClearance(): SecurityClearance | undefined;
    /**
     * 检查角色是否可以委托权限
     * @returns 是否可以委托
     */
    canDelegate(): boolean;
    /**
     * 获取角色的复杂度评分
     * @returns 复杂度评分 (0-100)
     */
    getComplexityScore(): number;
    /**
     * 转换为简单对象
     * @returns 简单对象表示
     */
    toPlainObject(): Record<string, unknown>;
}
//# sourceMappingURL=role.entity.d.ts.map