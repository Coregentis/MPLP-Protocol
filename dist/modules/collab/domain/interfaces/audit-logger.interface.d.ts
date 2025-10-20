/**
 * Audit Logger Interface - Domain Layer
 * @description Interface for audit logging operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
/**
 * Audit event types
 */
export type AuditEventType = 'access_granted' | 'access_denied' | 'resource_created' | 'resource_updated' | 'resource_deleted' | 'permission_granted' | 'permission_revoked' | 'policy_violation' | 'security_incident' | 'data_export' | 'data_import' | 'configuration_change' | 'user_action' | 'system_event' | 'error_occurred';
/**
 * Audit severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
/**
 * Audit log entry
 */
export interface AuditLogEntry {
    entryId: UUID;
    timestamp: Date;
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId?: UUID;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    resourceId?: UUID;
    resourceType?: string;
    action: string;
    result: 'success' | 'failure' | 'partial' | 'blocked';
    description: string;
    details: Record<string, unknown>;
    correlationId?: UUID;
    parentEventId?: UUID;
    relatedEntities?: UUID[];
    complianceRelevant: boolean;
    securityRelevant: boolean;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPeriod: number;
    archivalDate?: Date;
    metadata: Record<string, unknown>;
}
/**
 * Access log entry
 */
export interface AccessLogEntry {
    userId: UUID;
    resource: string;
    action: string;
    timestamp: Date;
    result: 'granted' | 'denied';
    reason?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Error log entry
 */
export interface ErrorLogEntry {
    userId?: UUID;
    resource?: string;
    action?: string;
    error: string;
    stackTrace?: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    correlationId?: UUID;
    metadata?: Record<string, unknown>;
}
/**
 * Data protection log entry
 */
export interface DataProtectionLogEntry {
    collabId: UUID;
    protectionLevel: 'basic' | 'standard' | 'high' | 'maximum';
    timestamp: Date;
    appliedBy?: UUID;
    measures: string[];
    complianceStandards: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Audit query parameters
 */
export interface AuditQuery {
    eventType?: AuditEventType | AuditEventType[];
    severity?: AuditSeverity | AuditSeverity[];
    userId?: UUID;
    resource?: string;
    resourceType?: string;
    action?: string;
    result?: 'success' | 'failure' | 'partial' | 'blocked';
    startTime?: Date;
    endTime?: Date;
    correlationId?: UUID;
    complianceRelevant?: boolean;
    securityRelevant?: boolean;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'severity' | 'eventType' | 'userId';
    sortOrder?: 'asc' | 'desc';
}
/**
 * Audit statistics
 */
export interface AuditStatistics {
    totalEntries: number;
    entriesByEventType: Record<AuditEventType, number>;
    entriesBySeverity: Record<AuditSeverity, number>;
    entriesByResult: Record<string, number>;
    uniqueUsers: number;
    uniqueResources: number;
    complianceRelevantEntries: number;
    securityRelevantEntries: number;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    topUsers: Array<{
        userId: UUID;
        entryCount: number;
    }>;
    topResources: Array<{
        resource: string;
        entryCount: number;
    }>;
    errorRate: number;
    averageEntriesPerDay: number;
    metadata: Record<string, unknown>;
}
/**
 * Audit report
 */
export interface AuditReport {
    reportId: UUID;
    reportType: 'access_summary' | 'security_events' | 'compliance_audit' | 'error_analysis' | 'user_activity';
    generatedAt: Date;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    summary: {
        totalEvents: number;
        criticalEvents: number;
        securityIncidents: number;
        complianceViolations: number;
        errorCount: number;
        keyFindings: string[];
    };
    details: AuditLogEntry[];
    statistics: AuditStatistics;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
/**
 * Audit Logger Interface
 * Handles all audit logging operations
 *
 * @interface IAuditLogger
 * @description Core interface for audit logging as required by refactoring guide
 */
export interface IAuditLogger {
    /**
     * Log access granted event
     * @param entry - Access log entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logAccessGranted(entry: AccessLogEntry): Promise<void>;
    /**
     * Log access denied event
     * @param entry - Access log entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logAccessDenied(entry: AccessLogEntry): Promise<void>;
    /**
     * Log error event
     * @param entry - Error log entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logError(entry: ErrorLogEntry): Promise<void>;
    /**
     * Log data protection event
     * @param entry - Data protection log entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logDataProtection(entry: DataProtectionLogEntry): Promise<void>;
    /**
     * Log generic audit event
     * @param entry - Audit log entry
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logAuditEvent(entry: Omit<AuditLogEntry, 'entryId' | 'timestamp'>): Promise<void>;
    /**
     * Log user action
     * @param userId - User identifier
     * @param action - Action performed
     * @param resource - Resource affected (optional)
     * @param result - Action result
     * @param details - Additional details (optional)
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logUserAction(userId: UUID, action: string, resource?: string, result?: 'success' | 'failure' | 'partial' | 'blocked', details?: Record<string, unknown>): Promise<void>;
    /**
     * Log system event
     * @param eventType - Type of system event
     * @param description - Event description
     * @param severity - Event severity (optional)
     * @param details - Additional details (optional)
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logSystemEvent(eventType: AuditEventType, description: string, severity?: AuditSeverity, details?: Record<string, unknown>): Promise<void>;
    /**
     * Log security incident
     * @param incidentType - Type of security incident
     * @param description - Incident description
     * @param severity - Incident severity
     * @param userId - User involved (optional)
     * @param resource - Resource affected (optional)
     * @param details - Additional details (optional)
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logSecurityIncident(incidentType: string, description: string, severity: AuditSeverity, userId?: UUID, resource?: string, details?: Record<string, unknown>): Promise<void>;
    /**
     * Log policy violation
     * @param policyId - Policy identifier
     * @param violationType - Type of violation
     * @param description - Violation description
     * @param userId - User involved (optional)
     * @param resource - Resource affected (optional)
     * @param details - Additional details (optional)
     * @returns Promise<void>
     * @throws Error if logging fails
     */
    logPolicyViolation(policyId: UUID, violationType: string, description: string, userId?: UUID, resource?: string, details?: Record<string, unknown>): Promise<void>;
    /**
     * Query audit log entries
     * @param query - Audit query parameters
     * @returns Promise<AuditLogEntry[]> - Matching audit log entries
     * @throws Error if query fails
     */
    queryAuditLog(query: AuditQuery): Promise<AuditLogEntry[]>;
    /**
     * Get audit statistics
     * @param timeRange - Time range for statistics (optional)
     * @param filters - Additional filters (optional)
     * @returns Promise<AuditStatistics> - Audit statistics
     * @throws Error if statistics generation fails
     */
    getAuditStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }, filters?: Partial<AuditQuery>): Promise<AuditStatistics>;
    /**
     * Generate audit report
     * @param reportType - Type of report to generate
     * @param timeRange - Time range for report
     * @param filters - Report filters (optional)
     * @returns Promise<AuditReport> - Generated audit report
     * @throws Error if report generation fails
     */
    generateAuditReport(reportType: 'access_summary' | 'security_events' | 'compliance_audit' | 'error_analysis' | 'user_activity', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Partial<AuditQuery>): Promise<AuditReport>;
    /**
     * Archive old audit entries
     * @param olderThan - Archive entries older than this date
     * @param archiveLocation - Location to archive entries (optional)
     * @returns Promise<number> - Number of entries archived
     * @throws Error if archival fails
     */
    archiveOldEntries(olderThan: Date, archiveLocation?: string): Promise<number>;
    /**
     * Delete old audit entries
     * @param olderThan - Delete entries older than this date
     * @param force - Force deletion even if retention period not met (optional)
     * @returns Promise<number> - Number of entries deleted
     * @throws Error if deletion fails
     */
    deleteOldEntries(olderThan: Date, force?: boolean): Promise<number>;
    /**
     * Export audit log
     * @param query - Query parameters for export
     * @param format - Export format
     * @returns Promise<string> - Export file path or data
     * @throws Error if export fails
     */
    exportAuditLog(query: AuditQuery, format: 'json' | 'csv' | 'xml' | 'pdf'): Promise<string>;
    /**
     * Verify audit log integrity
     * @param timeRange - Time range to verify (optional)
     * @returns Promise<AuditIntegrityResult> - Integrity verification result
     * @throws Error if verification fails
     */
    verifyAuditLogIntegrity(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<AuditIntegrityResult>;
    /**
     * Set audit retention policy
     * @param policy - Retention policy configuration
     * @returns Promise<void>
     * @throws Error if policy setting fails
     */
    setRetentionPolicy(policy: {
        defaultRetentionPeriod: number;
        eventTypeRetention: Record<AuditEventType, number>;
        complianceRetentionPeriod: number;
        securityRetentionPeriod: number;
        archivalEnabled: boolean;
        compressionEnabled: boolean;
    }): Promise<void>;
    /**
     * Get current retention policy
     * @returns Promise<RetentionPolicy> - Current retention policy
     */
    getRetentionPolicy(): Promise<RetentionPolicy>;
}
/**
 * Audit integrity result
 */
export interface AuditIntegrityResult {
    verificationId: UUID;
    verifiedAt: Date;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    totalEntries: number;
    verifiedEntries: number;
    corruptedEntries: number;
    missingEntries: number;
    integrityScore: number;
    issues: Array<{
        issueType: 'corruption' | 'missing' | 'tampering' | 'inconsistency';
        description: string;
        affectedEntries: UUID[];
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
/**
 * Retention policy
 */
export interface RetentionPolicy {
    policyId: UUID;
    createdAt: Date;
    updatedAt: Date;
    defaultRetentionPeriod: number;
    eventTypeRetention: Record<AuditEventType, number>;
    complianceRetentionPeriod: number;
    securityRetentionPeriod: number;
    archivalEnabled: boolean;
    compressionEnabled: boolean;
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=audit-logger.interface.d.ts.map