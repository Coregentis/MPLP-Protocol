import { UUID } from '../../../../shared/types';
export type PermissionType = 'read' | 'write' | 'delete' | 'create' | 'update' | 'execute' | 'admin' | 'manage' | 'approve' | 'audit';
export interface SecurityContext {
    userId: UUID;
    sessionId: string;
    roles: string[];
    permissions: string[];
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
}
export interface PermissionValidationResult {
    isValid: boolean;
    userId: UUID;
    resource: string;
    action: string;
    timestamp: Date;
    reason?: string;
    requiredPermissions: string[];
    grantedPermissions: string[];
    missingPermissions: string[];
    context: SecurityContext;
    metadata: Record<string, unknown>;
}
export interface SecurityPolicy {
    policyId: UUID;
    name: string;
    description: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    rules: Array<{
        ruleId: UUID;
        name: string;
        condition: string;
        action: 'allow' | 'deny' | 'require_approval';
        priority: number;
        metadata: Record<string, unknown>;
    }>;
    scope: {
        resources: string[];
        actions: string[];
        roles: string[];
        conditions: Record<string, unknown>;
    };
    metadata: Record<string, unknown>;
}
export interface SecurityAuditEntry {
    auditId: UUID;
    timestamp: Date;
    eventType: 'permission_check' | 'access_granted' | 'access_denied' | 'policy_violation' | 'security_incident';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId: UUID;
    resource: string;
    action: string;
    result: 'success' | 'failure' | 'blocked' | 'warning';
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    description: string;
    details: Record<string, unknown>;
    relatedEntities: UUID[];
    metadata: Record<string, unknown>;
}
export interface SecurityThreatAssessment {
    assessmentId: UUID;
    entityId: UUID;
    entityType: string;
    assessedAt: Date;
    overallThreatLevel: 'low' | 'medium' | 'high' | 'critical';
    threatCategories: Record<string, 'low' | 'medium' | 'high' | 'critical'>;
    threats: Array<{
        threatId: UUID;
        category: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        likelihood: number;
        impact: number;
        riskScore: number;
        mitigationStrategies: string[];
    }>;
    vulnerabilities: Array<{
        vulnerabilityId: UUID;
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        exploitability: number;
        remediationSteps: string[];
    }>;
    recommendations: Array<{
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
        recommendation: string;
        estimatedEffort: 'low' | 'medium' | 'high';
        expectedImpact: string;
    }>;
    metadata: Record<string, unknown>;
}
export interface SecurityManager {
    validatePermission(userId: UUID, resource: string, action: string, context?: Partial<SecurityContext>): Promise<boolean>;
    validatePermissionDetailed(userId: UUID, resource: string, action: string, context?: Partial<SecurityContext>): Promise<PermissionValidationResult>;
    grantPermission(userId: UUID, resource: string, permissions: PermissionType[], grantedBy: UUID, expiresAt?: Date): Promise<void>;
    revokePermission(userId: UUID, resource: string, permissions: PermissionType[], revokedBy: UUID, reason?: string): Promise<void>;
    getUserPermissions(userId: UUID, resource?: string): Promise<string[]>;
    hasRole(userId: UUID, role: string): Promise<boolean>;
    assignRole(userId: UUID, role: string, assignedBy: UUID, expiresAt?: Date): Promise<void>;
    removeRole(userId: UUID, role: string, removedBy: UUID, reason?: string): Promise<void>;
    createSecurityPolicy(policy: Omit<SecurityPolicy, 'policyId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    updateSecurityPolicy(policyId: UUID, updates: Partial<SecurityPolicy>, updatedBy: UUID): Promise<void>;
    deleteSecurityPolicy(policyId: UUID, deletedBy: UUID, reason?: string): Promise<void>;
    getApplicablePolicies(resource: string, action: string, userId?: UUID): Promise<SecurityPolicy[]>;
    assessSecurityThreats(entityId: UUID, entityType: string, assessmentType?: 'basic' | 'comprehensive' | 'targeted'): Promise<SecurityThreatAssessment>;
    logSecurityEvent(event: Omit<SecurityAuditEntry, 'auditId' | 'timestamp'>): Promise<void>;
    getSecurityAuditLog(filters?: {
        userId?: UUID;
        resource?: string;
        action?: string;
        eventType?: string;
        severity?: string;
        startTime?: Date;
        endTime?: Date;
        limit?: number;
        offset?: number;
    }): Promise<SecurityAuditEntry[]>;
    generateSecurityReport(reportType: 'access_summary' | 'threat_assessment' | 'policy_compliance' | 'audit_summary', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Record<string, unknown>): Promise<SecurityReport>;
    getSecurityStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<SecurityStatistics>;
}
export interface SecurityReport {
    reportId: UUID;
    reportType: 'access_summary' | 'threat_assessment' | 'policy_compliance' | 'audit_summary';
    generatedAt: Date;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    summary: {
        totalEvents: number;
        securityIncidents: number;
        policyViolations: number;
        threatLevel: 'low' | 'medium' | 'high' | 'critical';
        keyFindings: string[];
    };
    details: Record<string, unknown>;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface SecurityStatistics {
    totalPermissionChecks: number;
    successfulAccess: number;
    deniedAccess: number;
    policyViolations: number;
    securityIncidents: number;
    threatAssessments: number;
    averageThreatLevel: number;
    topThreats: Array<{
        threat: string;
        count: number;
        severity: string;
    }>;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=security-manager.interface.d.ts.map