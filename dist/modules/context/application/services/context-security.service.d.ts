/**
 * Context安全服务 - 新增服务
 *
 * @description 基于SCTM+GLFB+ITCM方法论设计的上下文安全和权限管理服务
 * 整合原有17个服务中的安全相关功能：权限控制、审计追踪，新增：安全审计、合规检查、威胁检测
 * @version 2.0.0
 * @layer 应用层 - 安全服务
 * @refactor 17→3服务简化，专注于安全和合规功能
 */
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
/**
 * Context安全服务
 *
 * @description 整合原有17个服务中的2个安全服务，新增3个企业级安全功能
 * 职责：访问控制、安全审计、合规检查、威胁检测、数据保护
 */
export declare class ContextSecurityService {
    private readonly contextRepository;
    private readonly securityManager;
    private readonly auditLogger;
    private readonly complianceChecker;
    private readonly threatDetector;
    private readonly logger;
    constructor(contextRepository: IContextRepository, securityManager: SecurityManager, auditLogger: IAuditLogger, complianceChecker: IComplianceChecker, threatDetector: IThreatDetector, logger: ILogger);
    /**
     * 验证访问权限
     * 整合：原权限控制功能，增强：详细的权限验证和审计
     */
    validateAccess(contextId: UUID, userId: UUID, operation: string): Promise<boolean>;
    /**
     * 执行安全审计
     * 新增功能：全面的安全审计和评估
     */
    performSecurityAudit(contextId: UUID): Promise<SecurityAudit>;
    /**
     * 加密敏感数据
     * 新增功能：敏感数据加密保护
     */
    encryptSensitiveData(contextId: UUID, data: string | Record<string, string | number | boolean>): Promise<string>;
    /**
     * 解密敏感数据
     * 新增功能：敏感数据解密
     */
    decryptSensitiveData(contextId: UUID, encryptedData: string): Promise<string>;
    /**
     * 检查合规性
     * 新增功能：多种合规标准检查
     */
    checkCompliance(contextId: UUID, standard: ComplianceStandard): Promise<ComplianceResult>;
    /**
     * 应用安全策略
     * 新增功能：动态安全策略管理
     */
    applySecurityPolicy(contextId: UUID, policy: SecurityPolicy): Promise<void>;
    /**
     * 检测安全威胁
     * 新增功能：智能威胁检测和评估
     */
    detectThreats(contextId: UUID): Promise<ThreatDetectionResult>;
    /**
     * 检查权限策略
     */
    private checkPermissionPolicy;
    /**
     * 分析访问模式
     */
    private analyzeAccessPatterns;
    /**
     * 检查数据完整性
     */
    private checkDataIntegrity;
    /**
     * 评估威胁
     */
    private assessThreats;
    /**
     * 计算安全分数
     */
    private calculateSecurityScore;
    /**
     * 转换为安全发现
     */
    private convertToFindings;
    /**
     * 生成安全建议
     */
    private generateSecurityRecommendations;
    /**
     * 验证安全策略
     */
    private validateSecurityPolicy;
    /**
     * 计算风险等级
     */
    private calculateRiskLevel;
    /**
     * 生成威胁缓解建议
     */
    private generateThreatMitigationRecommendations;
    /**
     * 映射合规状态
     */
    private mapComplianceStatus;
}
//# sourceMappingURL=context-security.service.d.ts.map