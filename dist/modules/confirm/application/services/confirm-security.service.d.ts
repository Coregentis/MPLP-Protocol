import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { UUID } from '../../types';
export interface PermissionValidationResult {
    isValid: boolean;
    userId: string;
    permissions: string[];
    violations: string[];
    recommendations: string[];
}
export interface SecurityAuditEntry {
    auditId: UUID;
    confirmId: UUID;
    userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    result: 'success' | 'failure' | 'warning';
    details: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
export interface ComplianceCheckResult {
    confirmId: UUID;
    isCompliant: boolean;
    regulations: Array<{
        name: string;
        status: 'compliant' | 'non-compliant' | 'warning';
        details: string;
    }>;
    violations: string[];
    recommendations: string[];
    complianceScore: number;
}
export interface SuspiciousActivityResult {
    confirmId: UUID;
    activityType: 'unusual_approval_pattern' | 'rapid_decisions' | 'off_hours_activity' | 'privilege_escalation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: Date;
    userId: string;
    riskScore: number;
    recommendedActions: string[];
}
export interface ISecurityManager {
    validateUserPermissions(userId: string, action: string, resourceId: UUID): Promise<boolean>;
    logSecurityEvent(event: SecurityAuditEntry): Promise<void>;
    checkCompliance(confirmId: UUID): Promise<ComplianceCheckResult>;
    detectSuspiciousActivity(confirmId: UUID): Promise<SuspiciousActivityResult[]>;
}
export interface IAuditLogger {
    logApprovalAction(confirmId: UUID, userId: string, action: string, result: string): Promise<void>;
    logAccessAttempt(userId: string, resourceId: UUID, success: boolean): Promise<void>;
    logSecurityViolation(violation: SecurityAuditEntry): Promise<void>;
    logSecurityEvent(event: SecurityAuditEntry): Promise<void>;
    getAuditTrail(confirmId: UUID): Promise<SecurityAuditEntry[]>;
}
export declare class ConfirmSecurityService {
    private readonly confirmRepository;
    private readonly securityManager;
    private readonly auditLogger;
    constructor(confirmRepository: IConfirmRepository, securityManager: ISecurityManager, auditLogger: IAuditLogger);
    validateApprovalPermissions(userId: string, confirmId: UUID, action: string): Promise<PermissionValidationResult>;
    performSecurityAudit(confirmId: UUID): Promise<SecurityAuditEntry[]>;
    checkCompliance(confirmId: UUID): Promise<ComplianceCheckResult>;
    monitorSuspiciousActivity(confirmId: UUID): Promise<SuspiciousActivityResult[]>;
    getSecurityAuditTrail(confirmId: UUID): Promise<SecurityAuditEntry[]>;
    private generateAuditId;
    private assessActionRiskLevel;
}
//# sourceMappingURL=confirm-security.service.d.ts.map