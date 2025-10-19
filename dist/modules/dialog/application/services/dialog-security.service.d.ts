/**
 * DialogSecurityService
 *
 * @description Dialog安全服务，提供对话安全管理和权限控制功能
 * @version 1.0.0
 * @layer 应用层 - 应用服务
 */
import { UUID, type IContentModerator, type IPrivacyProtector } from '../../types';
import { DialogRepository } from '../../domain/repositories/dialog.repository';
import { DialogEntity } from '../../domain/entities/dialog.entity';
export interface ISecurityScanner {
    performSecurityScan(dialog: DialogEntity): Promise<SecurityScanResult>;
    checkPermissions(dialog: DialogEntity, userId: UUID): Promise<PermissionCheckResult>;
    validateContent(content: string): Promise<ContentValidationResult>;
    detectThreats(dialog: DialogEntity): Promise<ThreatDetectionResult>;
}
export interface IPermissionManager {
    validatePermissions(dialogId: UUID, userId: UUID, operation: string): Promise<PermissionValidationResult>;
    enforcePermissions(dialogId: UUID, userId: UUID, operation: string): Promise<boolean>;
    auditPermissionUsage(dialogId: UUID, userId: UUID, operation: string): Promise<void>;
}
export interface IAuditLogger {
    logSecurityEvent(event: SecurityEvent): Promise<void>;
    logPermissionEvent(event: PermissionEvent): Promise<void>;
    logComplianceEvent(event: ComplianceEvent): Promise<void>;
}
export interface ScanDialogSecurityRequest {
    dialogId: UUID;
    scanType: 'quick' | 'full' | 'compliance';
    includeContent?: boolean;
    userId?: UUID;
}
export interface ValidateDialogPermissionsRequest {
    dialogId: UUID;
    userId: UUID;
    requestedOperations: string[];
    context?: Record<string, unknown>;
}
export interface GenerateSecurityReportRequest {
    dialogId: UUID;
    reportType: 'security' | 'compliance' | 'comprehensive';
    includeRecommendations?: boolean;
}
export interface DialogSecurityScanResult {
    dialogId: UUID;
    scanType: 'quick' | 'full' | 'compliance';
    status: 'completed' | 'failed' | 'partial';
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    scannedAt: string;
    findings: SecurityFinding[];
    recommendations: string[];
    complianceStatus?: ComplianceStatus;
}
export interface SecurityScanResult {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    vulnerabilities: SecurityVulnerability[];
    recommendations: string[];
}
export interface PermissionCheckResult {
    hasPermission: boolean;
    missingPermissions: string[];
    warnings: string[];
}
export interface ContentValidationResult {
    isValid: boolean;
    violations: ContentViolation[];
    sanitizedContent?: string;
}
export interface ThreatDetectionResult {
    threatsDetected: boolean;
    threats: SecurityThreat[];
    riskScore: number;
}
export interface PermissionValidationResult {
    isValid: boolean;
    violations: PermissionViolation[];
    warnings: string[];
    recommendations: string[];
}
export interface SecurityFinding {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    title: string;
    description: string;
    recommendation: string;
    affectedComponents: string[];
}
export interface SecurityVulnerability {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
}
export interface ContentViolation {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: string;
}
export interface SecurityThreat {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    indicators: string[];
}
export interface PermissionViolation {
    operation: string;
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
    regulation: string;
    requirement: string;
    violation: string;
    remediation: string;
}
export interface SecurityEvent {
    eventId: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    dialogId: UUID;
    userId?: UUID;
    timestamp: string;
    description: string;
    metadata?: Record<string, unknown>;
}
export interface PermissionEvent {
    eventId: string;
    dialogId: UUID;
    userId: UUID;
    operation: string;
    granted: boolean;
    reason: string;
    timestamp: string;
}
export interface ComplianceEvent {
    eventId: string;
    dialogId: UUID;
    regulation: string;
    status: 'compliant' | 'violation';
    details: string;
    timestamp: string;
}
export interface SecurityReport {
    dialogId: UUID;
    reportType: 'security' | 'compliance' | 'comprehensive';
    generatedAt: string;
    summary: SecuritySummary;
    findings: SecurityFinding[];
    complianceStatus: ComplianceStatus;
    recommendations: string[];
}
export interface SecuritySummary {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    totalFindings: number;
    criticalFindings: number;
    complianceScore: number;
}
/**
 * Dialog安全服务实现
 */
export declare class DialogSecurityService {
    private readonly dialogRepository;
    private readonly securityScanner;
    private readonly permissionManager;
    private readonly auditLogger;
    private readonly contentModerator;
    private readonly privacyProtector;
    constructor(dialogRepository: DialogRepository, securityScanner: ISecurityScanner, permissionManager: IPermissionManager, auditLogger: IAuditLogger, contentModerator?: IContentModerator, privacyProtector?: IPrivacyProtector);
    /**
     * 扫描对话安全性
     * @param request 安全扫描请求
     * @returns 安全扫描结果
     */
    scanDialogSecurity(request: ScanDialogSecurityRequest): Promise<DialogSecurityScanResult>;
    /**
     * 验证对话权限
     * @param request 权限验证请求
     * @returns 权限验证结果
     */
    validateDialogPermissions(request: ValidateDialogPermissionsRequest): Promise<PermissionValidationResult>;
    /**
     * 强制执行权限检查
     * @param dialogId 对话ID
     * @param userId 用户ID
     * @param operation 操作类型
     * @returns 是否允许操作
     */
    enforcePermissions(dialogId: UUID, userId: UUID, operation: string): Promise<boolean>;
    /**
     * 生成安全报告
     * @param request 安全报告请求
     * @returns 安全报告
     */
    generateSecurityReport(request: GenerateSecurityReportRequest): Promise<SecurityReport>;
    /**
     * 执行内容审核
     * @param content 内容文本
     * @param options 审核选项
     * @returns 审核结果
     */
    moderateContent(content: string, options?: {
        checkProfanity?: boolean;
        checkToxicity?: boolean;
        checkSpam?: boolean;
        checkPersonalInfo?: boolean;
        language?: string;
    }): Promise<{
        approved: boolean;
        confidence: number;
        violations: Array<{
            type: 'profanity' | 'toxicity' | 'spam' | 'personal_info' | 'inappropriate';
            severity: 'low' | 'medium' | 'high';
            description: string;
            location: {
                start: number;
                end: number;
            };
            suggestion?: string;
        }>;
        sanitizedContent?: string;
        metadata: {
            language: string;
            contentLength: number;
            processingTime: number;
        };
    }>;
    /**
     * 执行隐私保护检查
     * @param dialogId 对话ID
     * @param options 检查选项
     * @returns 隐私检查结果
     */
    checkPrivacyCompliance(dialogId: UUID, options?: {
        checkGDPR?: boolean;
        checkCCPA?: boolean;
        checkHIPAA?: boolean;
        checkDataRetention?: boolean;
    }): Promise<{
        compliant: boolean;
        violations: Array<{
            regulation: 'GDPR' | 'CCPA' | 'HIPAA' | 'DATA_RETENTION';
            requirement: string;
            violation: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            remediation: string;
        }>;
        dataProcessingInfo: {
            personalDataDetected: boolean;
            dataTypes: string[];
            retentionPeriod: number;
            consentStatus: 'granted' | 'pending' | 'denied' | 'unknown';
        };
        recommendations: string[];
    }>;
    private generateSecurityFindings;
    private calculateOverallRisk;
    private generateSecurityRecommendations;
    private generatePermissionRecommendations;
    private checkCompliance;
    private calculateComplianceScore;
    private generateEventId;
    private checkProfanity;
    private checkToxicity;
    private checkSpam;
    private checkPersonalInfo;
    private calculateModerationConfidence;
    private sanitizeContent;
    private checkGDPRCompliance;
    private checkCCPACompliance;
    private checkHIPAACompliance;
    private checkDataRetention;
    private analyzeDataProcessing;
    private generatePrivacyRecommendations;
}
//# sourceMappingURL=dialog-security.service.d.ts.map