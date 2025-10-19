/**
 * Security Manager Interface - Domain Layer
 * @description Interface for security management operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
/**
 * Permission types
 */
export type PermissionType = 'read' | 'write' | 'delete' | 'create' | 'update' | 'execute' | 'admin' | 'manage' | 'approve' | 'audit';
/**
 * Security context
 */
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
/**
 * Permission validation result
 */
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
/**
 * Security policy
 */
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
/**
 * Security audit entry
 */
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
/**
 * Security threat assessment
 */
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
/**
 * Security Manager Interface
 * Handles all security management operations
 *
 * @interface SecurityManager
 * @description Core interface for security management as required by refactoring guide
 */
export interface SecurityManager {
    /**
     * Validate user permission for resource and action
     * @param userId - User identifier
     * @param resource - Resource identifier
     * @param action - Action to perform
     * @param context - Security context (optional)
     * @returns Promise<boolean> - True if permission is granted
     * @throws Error if validation fails
     */
    validatePermission(userId: UUID, resource: string, action: string, context?: Partial<SecurityContext>): Promise<boolean>;
    /**
     * Get detailed permission validation result
     * @param userId - User identifier
     * @param resource - Resource identifier
     * @param action - Action to perform
     * @param context - Security context (optional)
     * @returns Promise<PermissionValidationResult> - Detailed validation result
     * @throws Error if validation fails
     */
    validatePermissionDetailed(userId: UUID, resource: string, action: string, context?: Partial<SecurityContext>): Promise<PermissionValidationResult>;
    /**
     * Grant permission to user
     * @param userId - User identifier
     * @param resource - Resource identifier
     * @param permissions - Permissions to grant
     * @param grantedBy - User granting the permission
     * @param expiresAt - Permission expiration date (optional)
     * @returns Promise<void>
     * @throws Error if granting fails
     */
    grantPermission(userId: UUID, resource: string, permissions: PermissionType[], grantedBy: UUID, expiresAt?: Date): Promise<void>;
    /**
     * Revoke permission from user
     * @param userId - User identifier
     * @param resource - Resource identifier
     * @param permissions - Permissions to revoke
     * @param revokedBy - User revoking the permission
     * @param reason - Reason for revocation (optional)
     * @returns Promise<void>
     * @throws Error if revocation fails
     */
    revokePermission(userId: UUID, resource: string, permissions: PermissionType[], revokedBy: UUID, reason?: string): Promise<void>;
    /**
     * Get user permissions for resource
     * @param userId - User identifier
     * @param resource - Resource identifier (optional, gets all if not provided)
     * @returns Promise<string[]> - Array of permissions
     */
    getUserPermissions(userId: UUID, resource?: string): Promise<string[]>;
    /**
     * Check if user has role
     * @param userId - User identifier
     * @param role - Role to check
     * @returns Promise<boolean> - True if user has role
     */
    hasRole(userId: UUID, role: string): Promise<boolean>;
    /**
     * Assign role to user
     * @param userId - User identifier
     * @param role - Role to assign
     * @param assignedBy - User assigning the role
     * @param expiresAt - Role expiration date (optional)
     * @returns Promise<void>
     * @throws Error if assignment fails
     */
    assignRole(userId: UUID, role: string, assignedBy: UUID, expiresAt?: Date): Promise<void>;
    /**
     * Remove role from user
     * @param userId - User identifier
     * @param role - Role to remove
     * @param removedBy - User removing the role
     * @param reason - Reason for removal (optional)
     * @returns Promise<void>
     * @throws Error if removal fails
     */
    removeRole(userId: UUID, role: string, removedBy: UUID, reason?: string): Promise<void>;
    /**
     * Create security policy
     * @param policy - Security policy to create
     * @param createdBy - User creating the policy
     * @returns Promise<UUID> - Policy identifier
     * @throws Error if creation fails
     */
    createSecurityPolicy(policy: Omit<SecurityPolicy, 'policyId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    /**
     * Update security policy
     * @param policyId - Policy identifier
     * @param updates - Policy updates
     * @param updatedBy - User updating the policy
     * @returns Promise<void>
     * @throws Error if update fails
     */
    updateSecurityPolicy(policyId: UUID, updates: Partial<SecurityPolicy>, updatedBy: UUID): Promise<void>;
    /**
     * Delete security policy
     * @param policyId - Policy identifier
     * @param deletedBy - User deleting the policy
     * @param reason - Reason for deletion (optional)
     * @returns Promise<void>
     * @throws Error if deletion fails
     */
    deleteSecurityPolicy(policyId: UUID, deletedBy: UUID, reason?: string): Promise<void>;
    /**
     * Get applicable security policies
     * @param resource - Resource identifier
     * @param action - Action to perform
     * @param userId - User identifier (optional)
     * @returns Promise<SecurityPolicy[]> - Applicable policies
     */
    getApplicablePolicies(resource: string, action: string, userId?: UUID): Promise<SecurityPolicy[]>;
    /**
     * Assess security threats
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param assessmentType - Type of assessment (optional)
     * @returns Promise<SecurityThreatAssessment> - Threat assessment result
     * @throws Error if assessment fails
     */
    assessSecurityThreats(entityId: UUID, entityType: string, assessmentType?: 'basic' | 'comprehensive' | 'targeted'): Promise<SecurityThreatAssessment>;
    /**
     * Log security event
     * @param event - Security audit entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logSecurityEvent(event: Omit<SecurityAuditEntry, 'auditId' | 'timestamp'>): Promise<void>;
    /**
     * Get security audit log
     * @param filters - Audit log filters (optional)
     * @returns Promise<SecurityAuditEntry[]> - Audit log entries
     */
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
    /**
     * Generate security report
     * @param reportType - Type of report
     * @param timeRange - Time range for report
     * @param filters - Report filters (optional)
     * @returns Promise<SecurityReport> - Generated report
     * @throws Error if report generation fails
     */
    generateSecurityReport(reportType: 'access_summary' | 'threat_assessment' | 'policy_compliance' | 'audit_summary', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Record<string, unknown>): Promise<SecurityReport>;
    /**
     * Get security statistics
     * @param timeRange - Time range for statistics (optional)
     * @returns Promise<SecurityStatistics> - Security statistics
     */
    getSecurityStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<SecurityStatistics>;
}
/**
 * Security report
 */
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
/**
 * Security statistics
 */
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