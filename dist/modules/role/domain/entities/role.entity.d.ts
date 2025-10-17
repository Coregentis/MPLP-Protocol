import { UUID, RoleType, RoleStatus, SecurityClearance, Permission, RoleInheritance, RoleDelegation, RoleAttributes, ValidationRules, AuditSettings, Agent, PerformanceMetrics, MonitoringIntegration, VersionHistory, SearchMetadata, EventIntegration, AuditTrail } from '../../types';
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
    private validate;
    hasPermission(resourceType: string, resourceId: string, action: string): boolean;
    addPermission(permission: Permission): void;
    removePermission(permissionId: UUID): void;
    isActive(): boolean;
    activate(): void;
    deactivate(): void;
    getSecurityClearance(): SecurityClearance | undefined;
    canDelegate(): boolean;
    getComplexityScore(): number;
    toPlainObject(): Record<string, unknown>;
}
//# sourceMappingURL=role.entity.d.ts.map