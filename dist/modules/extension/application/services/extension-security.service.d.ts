import { UUID } from '../../../../shared/types';
import { IExtensionRepository } from '../../domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionPermissions } from '../../types';
export interface ISecurityScanner {
    performStaticAnalysis(extension: ExtensionEntityData): Promise<StaticAnalysisResult>;
    checkDependencies(extension: ExtensionEntityData): Promise<DependencySecurityResult>;
    detectMalware(extension: ExtensionEntityData): Promise<MalwareDetectionResult>;
    validateCodeSignature(extension: ExtensionEntityData): Promise<CodeSignatureResult>;
}
export interface IPermissionManager {
    validatePermissions(extensionId: UUID, requestedPermissions: ExtensionPermissions): Promise<PermissionValidationResult>;
    enforcePermissions(extensionId: UUID, operation: string): Promise<boolean>;
    auditPermissionUsage(extensionId: UUID, operation: string, userId?: UUID): Promise<void>;
}
export interface IAuditLogger {
    logSecurityEvent(event: SecurityAuditEvent): Promise<void>;
    logPermissionEvent(event: PermissionAuditEvent): Promise<void>;
    logComplianceEvent(event: ComplianceAuditEvent): Promise<void>;
}
export interface SecurityScanResult {
    scanId: UUID;
    extensionId: UUID;
    scanType: 'full' | 'quick' | 'targeted';
    startTime: string;
    endTime: string;
    status: 'completed' | 'failed' | 'partial';
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    findings: SecurityFinding[];
    recommendations: string[];
    complianceStatus: ComplianceStatus;
}
export interface SecurityFinding {
    id: UUID;
    type: 'vulnerability' | 'malware' | 'permission' | 'dependency' | 'code-quality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    location?: string;
    remediation?: string;
    cveId?: string;
}
export interface StaticAnalysisResult {
    codeQuality: number;
    vulnerabilities: SecurityFinding[];
    suspiciousPatterns: string[];
    riskScore: number;
}
export interface DependencySecurityResult {
    vulnerableDependencies: VulnerableDependency[];
    outdatedDependencies: OutdatedDependency[];
    riskScore: number;
}
export interface MalwareDetectionResult {
    isMalicious: boolean;
    confidence: number;
    detectedPatterns: string[];
    riskScore: number;
}
export interface CodeSignatureResult {
    isValid: boolean;
    signer: string;
    signedAt: string;
    trustLevel: 'trusted' | 'untrusted' | 'unknown';
}
export interface VulnerableDependency {
    name: string;
    version: string;
    vulnerabilities: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface OutdatedDependency {
    name: string;
    currentVersion: string;
    latestVersion: string;
    securityRisk: boolean;
}
export interface PermissionValidationResult {
    isValid: boolean;
    violations: PermissionViolation[];
    warnings: string[];
    recommendations: string[];
}
export interface PermissionViolation {
    permission: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    remediation: string;
}
export interface ComplianceStatus {
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    soxCompliant: boolean;
    violations: ComplianceViolation[];
}
export interface ComplianceViolation {
    regulation: 'GDPR' | 'HIPAA' | 'SOX';
    requirement: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface SecurityAuditEvent {
    eventId: UUID;
    extensionId: UUID;
    eventType: 'scan' | 'violation' | 'threat' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: string;
    userId?: UUID;
    metadata?: Record<string, unknown>;
}
export interface PermissionAuditEvent {
    eventId: UUID;
    extensionId: UUID;
    userId?: UUID;
    operation: string;
    permission: string;
    granted: boolean;
    timestamp: string;
    reason?: string;
}
export interface ComplianceAuditEvent {
    eventId: UUID;
    extensionId: UUID;
    regulation: 'GDPR' | 'HIPAA' | 'SOX';
    requirement: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    timestamp: string;
    details?: string;
}
export interface SecurityReport {
    reportId: UUID;
    extensionId: UUID;
    generatedAt: string;
    reportType: 'security' | 'compliance' | 'permissions' | 'comprehensive';
    summary: SecuritySummary;
    findings: SecurityFinding[];
    recommendations: string[];
    complianceStatus: ComplianceStatus;
}
export interface SecuritySummary {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    totalFindings: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    complianceScore: number;
}
export interface ScanExtensionRequest {
    extensionId: UUID;
    scanType: 'full' | 'quick' | 'targeted';
    includeCompliance?: boolean;
    userId?: UUID;
}
export interface ValidatePermissionsRequest {
    extensionId: UUID;
    requestedPermissions: ExtensionPermissions;
    userId?: UUID;
}
export interface GenerateSecurityReportRequest {
    extensionId: UUID;
    reportType: 'security' | 'compliance' | 'permissions' | 'comprehensive';
    includeRecommendations?: boolean;
}
export declare class ExtensionSecurityService {
    private readonly extensionRepository;
    private readonly securityScanner;
    private readonly permissionManager;
    private readonly auditLogger;
    constructor(extensionRepository: IExtensionRepository, securityScanner: ISecurityScanner, permissionManager: IPermissionManager, auditLogger: IAuditLogger);
    scanExtensionSecurity(request: ScanExtensionRequest): Promise<SecurityScanResult>;
    validateExtensionPermissions(request: ValidatePermissionsRequest): Promise<PermissionValidationResult>;
    enforcePermissions(extensionId: UUID, operation: string, userId?: UUID): Promise<boolean>;
    generateSecurityReport(request: GenerateSecurityReportRequest): Promise<SecurityReport>;
    private generateScanId;
    private generateEventId;
    private generateReportId;
    private auditExtensionPermissions;
    private convertDependencyFindings;
    private convertMalwareFindings;
    private convertSignatureFindings;
    private convertPermissionViolation;
    private calculateOverallRisk;
    private checkCompliance;
    private hasDataProcessingFindings;
    private createEmptyComplianceStatus;
    private generateSecurityRecommendations;
    private generateSecuritySummary;
}
//# sourceMappingURL=extension-security.service.d.ts.map