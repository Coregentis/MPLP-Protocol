import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import { UUID } from '../../../../shared/types';
export interface SecurityManager {
    getUserContext(userId: UUID): Promise<UserContext | null>;
    getUserRoles(userId: UUID): Promise<string[]>;
    getContextPermissions(contextId: UUID): Promise<Permission[]>;
    hasPermission(userRoles: string[], contextPermissions: Permission[], operation: string): boolean;
    getEncryptionKey(contextId: UUID): Promise<string>;
    encrypt(data: string | Record<string, string | number | boolean>, key: string): Promise<string>;
    decrypt(encryptedData: string, key: string): Promise<string>;
    applyPolicy(contextId: UUID, policy: SecurityPolicy): Promise<void>;
    validateRequest(request: Record<string, string | number | boolean>): Promise<void>;
}
export interface IAuditLogger {
    logSecurityEvent(event: SecurityEvent): Promise<void>;
    logAccessAttempt(attempt: AccessAttempt): Promise<void>;
    logDataOperation(operation: DataOperation): Promise<void>;
    logComplianceCheck(check: ComplianceCheck): Promise<void>;
    logPolicyChange(change: PolicyChange): Promise<void>;
    logThreatDetection(detection: ThreatDetection): Promise<void>;
}
export interface IComplianceChecker {
    check(context: ContextEntity, standard: ComplianceStandard): Promise<ComplianceResult>;
}
export interface IThreatDetector {
    scan(contextId: UUID): Promise<Threat[]>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export interface UserContext {
    userId: UUID;
    roles: string[];
    permissions: string[];
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
}
export interface Permission {
    resource: string;
    action: string;
    conditions?: Record<string, string | number | boolean>;
}
export interface SecurityEvent {
    type: 'access_denied' | 'access_error' | 'policy_violation' | 'threat_detected';
    contextId: UUID;
    userId?: UUID;
    operation?: string;
    reason?: string;
    error?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface AccessAttempt {
    contextId: UUID;
    userId: UUID;
    operation: string;
    result: 'granted' | 'denied';
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
    metadata?: Record<string, unknown>;
}
export interface DataOperation {
    type: 'encryption' | 'decryption' | 'access' | 'modification';
    contextId: UUID;
    userId?: UUID;
    dataType?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface ComplianceCheck {
    contextId: UUID;
    standard: ComplianceStandard;
    result: 'compliant' | 'non_compliant' | 'partial';
    violations: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface PolicyChange {
    contextId: UUID;
    policyType: string;
    policyId: string;
    action: 'applied' | 'removed' | 'modified';
    timestamp: Date;
    userId?: UUID;
    metadata?: Record<string, unknown>;
}
export interface ThreatDetection {
    contextId: UUID;
    threatsFound: number;
    severity: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface SecurityAudit {
    contextId: UUID;
    auditId: string;
    timestamp: string;
    securityScore: number;
    findings: SecurityFinding[];
    recommendations: string[];
    complianceStatus: 'compliant' | 'non_compliant' | 'partial';
}
export interface SecurityFinding {
    type: 'vulnerability' | 'policy_violation' | 'access_anomaly' | 'data_exposure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
export interface ComplianceResult {
    status: 'compliant' | 'non_compliant' | 'partial';
    violations: ComplianceViolation[];
    score: number;
    recommendations: string[];
    overall: 'pass' | 'fail' | 'warning';
}
export interface ComplianceViolation {
    rule: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    remediation: string;
}
export interface SecurityAnomaly {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: Date;
}
export interface SecurityIssue {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
}
export interface SecurityPolicy {
    id: string;
    type: 'access_control' | 'data_protection' | 'audit' | 'compliance';
    name: string;
    rules: PolicyRule[];
    enabled: boolean;
}
export interface PolicyRule {
    condition: string;
    action: 'allow' | 'deny' | 'audit' | 'encrypt';
    parameters?: Record<string, string | number | boolean>;
}
export interface Threat {
    id: string;
    type: 'unauthorized_access' | 'data_breach' | 'policy_violation' | 'anomalous_behavior';
    severity: number;
    description: string;
    recommendation: string;
    detected: Date;
}
export interface ThreatDetectionResult {
    contextId: UUID;
    scanId: string;
    timestamp: string;
    threats: Threat[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
}
export type ComplianceStandard = 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
export declare class ContextSecurityService {
    private readonly contextRepository;
    private readonly securityManager;
    private readonly auditLogger;
    private readonly complianceChecker;
    private readonly threatDetector;
    private readonly logger;
    constructor(contextRepository: IContextRepository, securityManager: SecurityManager, auditLogger: IAuditLogger, complianceChecker: IComplianceChecker, threatDetector: IThreatDetector, logger: ILogger);
    validateAccess(contextId: UUID, userId: UUID, operation: string): Promise<boolean>;
    performSecurityAudit(contextId: UUID): Promise<SecurityAudit>;
    encryptSensitiveData(contextId: UUID, data: string | Record<string, string | number | boolean>): Promise<string>;
    decryptSensitiveData(contextId: UUID, encryptedData: string): Promise<string>;
    checkCompliance(contextId: UUID, standard: ComplianceStandard): Promise<ComplianceResult>;
    applySecurityPolicy(contextId: UUID, policy: SecurityPolicy): Promise<void>;
    detectThreats(contextId: UUID): Promise<ThreatDetectionResult>;
    private checkPermissionPolicy;
    private analyzeAccessPatterns;
    private checkDataIntegrity;
    private assessThreats;
    private calculateSecurityScore;
    private convertToFindings;
    private generateSecurityRecommendations;
    private validateSecurityPolicy;
    private calculateRiskLevel;
    private generateThreatMitigationRecommendations;
    private mapComplianceStatus;
}
//# sourceMappingURL=context-security.service.d.ts.map