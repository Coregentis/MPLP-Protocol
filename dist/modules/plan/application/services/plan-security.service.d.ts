import { UUID } from '../../../../shared/types';
export interface SecurityContext {
    userId: UUID;
    roles: string[];
    permissions: string[];
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}
export interface AccessRequest {
    userId: UUID;
    resource: 'plan' | 'task' | 'agent' | 'coordination';
    resourceId: UUID;
    action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'optimize';
    context?: Record<string, unknown>;
}
export interface AccessResult {
    granted: boolean;
    reason?: string;
    conditions?: string[];
    auditId: string;
}
export interface SecurityAuditEvent {
    eventId: string;
    timestamp: Date;
    userId: UUID;
    action: string;
    resource: string;
    resourceId: UUID;
    result: 'success' | 'failure' | 'denied';
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
}
export interface SecurityPolicy {
    policyId: string;
    name: string;
    type: 'access_control' | 'data_protection' | 'audit' | 'compliance';
    rules: Array<{
        condition: string;
        action: 'allow' | 'deny' | 'require_approval';
        priority: number;
    }>;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ComplianceCheck {
    standard: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
    requirements: Array<{
        requirement: string;
        status: 'compliant' | 'non_compliant' | 'partial';
        evidence?: string[];
        recommendations?: string[];
    }>;
    overallStatus: 'compliant' | 'non_compliant' | 'partial';
    lastChecked: Date;
}
export interface DataProtectionConfig {
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    keyRotationInterval: number;
    dataRetentionPeriod: number;
    anonymizationRules: Array<{
        field: string;
        method: 'hash' | 'mask' | 'remove';
    }>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export declare class PlanSecurityService {
    private readonly logger;
    private readonly dataProtectionConfig;
    private readonly securityPolicies;
    private readonly auditEvents;
    private readonly activeSessions;
    constructor(logger: ILogger, dataProtectionConfig?: DataProtectionConfig);
    validateAccess(request: AccessRequest, securityContext: SecurityContext): Promise<AccessResult>;
    createSecuritySession(userId: UUID, roles: string[], permissions: string[]): Promise<SecurityContext>;
    validateSession(securityContext: SecurityContext): boolean;
    destroySession(sessionId: string): Promise<void>;
    addSecurityPolicy(policy: SecurityPolicy): Promise<void>;
    private applySecurityPolicies;
    performComplianceCheck(standard: ComplianceCheck['standard']): Promise<ComplianceCheck>;
    encryptSensitiveData(data: Record<string, unknown>): Promise<string>;
    decryptSensitiveData(encryptedData: string): Promise<Record<string, unknown>>;
    logAuditEvent(event: SecurityAuditEvent): Promise<void>;
    getAuditEvents(userId?: UUID, startDate?: Date, endDate?: Date, limit?: number): Promise<SecurityAuditEvent[]>;
    private initializeDefaultPolicies;
    private checkBasicPermission;
    private checkResourceAccess;
    private evaluateCondition;
    private createAccessResult;
    private getComplianceRequirements;
    private checkRequirement;
}
//# sourceMappingURL=plan-security.service.d.ts.map