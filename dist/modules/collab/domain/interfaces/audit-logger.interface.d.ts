import { UUID } from '../../../../shared/types';
export type AuditEventType = 'access_granted' | 'access_denied' | 'resource_created' | 'resource_updated' | 'resource_deleted' | 'permission_granted' | 'permission_revoked' | 'policy_violation' | 'security_incident' | 'data_export' | 'data_import' | 'configuration_change' | 'user_action' | 'system_event' | 'error_occurred';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
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
export interface DataProtectionLogEntry {
    collabId: UUID;
    protectionLevel: 'basic' | 'standard' | 'high' | 'maximum';
    timestamp: Date;
    appliedBy?: UUID;
    measures: string[];
    complianceStandards: string[];
    metadata?: Record<string, unknown>;
}
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
export interface IAuditLogger {
    logAccessGranted(entry: AccessLogEntry): Promise<void>;
    logAccessDenied(entry: AccessLogEntry): Promise<void>;
    logError(entry: ErrorLogEntry): Promise<void>;
    logDataProtection(entry: DataProtectionLogEntry): Promise<void>;
    logAuditEvent(entry: Omit<AuditLogEntry, 'entryId' | 'timestamp'>): Promise<void>;
    logUserAction(userId: UUID, action: string, resource?: string, result?: 'success' | 'failure' | 'partial' | 'blocked', details?: Record<string, unknown>): Promise<void>;
    logSystemEvent(eventType: AuditEventType, description: string, severity?: AuditSeverity, details?: Record<string, unknown>): Promise<void>;
    logSecurityIncident(incidentType: string, description: string, severity: AuditSeverity, userId?: UUID, resource?: string, details?: Record<string, unknown>): Promise<void>;
    logPolicyViolation(policyId: UUID, violationType: string, description: string, userId?: UUID, resource?: string, details?: Record<string, unknown>): Promise<void>;
    queryAuditLog(query: AuditQuery): Promise<AuditLogEntry[]>;
    getAuditStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }, filters?: Partial<AuditQuery>): Promise<AuditStatistics>;
    generateAuditReport(reportType: 'access_summary' | 'security_events' | 'compliance_audit' | 'error_analysis' | 'user_activity', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Partial<AuditQuery>): Promise<AuditReport>;
    archiveOldEntries(olderThan: Date, archiveLocation?: string): Promise<number>;
    deleteOldEntries(olderThan: Date, force?: boolean): Promise<number>;
    exportAuditLog(query: AuditQuery, format: 'json' | 'csv' | 'xml' | 'pdf'): Promise<string>;
    verifyAuditLogIntegrity(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<AuditIntegrityResult>;
    setRetentionPolicy(policy: {
        defaultRetentionPeriod: number;
        eventTypeRetention: Record<AuditEventType, number>;
        complianceRetentionPeriod: number;
        securityRetentionPeriod: number;
        archivalEnabled: boolean;
        compressionEnabled: boolean;
    }): Promise<void>;
    getRetentionPolicy(): Promise<RetentionPolicy>;
}
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