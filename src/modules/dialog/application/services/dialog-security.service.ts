/**
 * DialogSecurityService
 * 
 * @description Dialog安全服务，提供对话安全管理和权限控制功能
 * @version 1.0.0
 * @layer 应用层 - 应用服务
 */

import {
  UUID,
  type IContentModerator,
  type IPrivacyProtector
} from '../../types';
import { DialogRepository } from '../../domain/repositories/dialog.repository';
import { DialogEntity } from '../../domain/entities/dialog.entity';
import { ContentModerator } from '../../infrastructure/moderators/content.moderator';
import { PrivacyProtector } from '../../infrastructure/protectors/privacy.protector';

// ===== 安全扫描接口 =====
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

// ===== 安全请求接口 =====
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

// ===== 安全结果接口 =====
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
export class DialogSecurityService {
  private readonly contentModerator: IContentModerator;
  private readonly privacyProtector: IPrivacyProtector;

  constructor(
    private readonly dialogRepository: DialogRepository,
    private readonly securityScanner: ISecurityScanner,
    private readonly permissionManager: IPermissionManager,
    private readonly auditLogger: IAuditLogger,
    contentModerator?: IContentModerator,
    privacyProtector?: IPrivacyProtector
  ) {
    // 使用依赖注入或创建默认实例
    this.contentModerator = contentModerator || new ContentModerator();
    this.privacyProtector = privacyProtector || new PrivacyProtector();
  }

  /**
   * 扫描对话安全性
   * @param request 安全扫描请求
   * @returns 安全扫描结果
   */
  async scanDialogSecurity(request: ScanDialogSecurityRequest): Promise<DialogSecurityScanResult> {
    try {
      // 获取对话数据
      const dialog = await this.dialogRepository.findById(request.dialogId);
      if (!dialog) {
        throw new Error(`Dialog ${request.dialogId} not found`);
      }

      // 执行安全扫描
      const scanResult = await this.securityScanner.performSecurityScan(dialog);
      
      // 检查权限（如果提供了用户ID）
      let permissionResult: PermissionCheckResult | undefined;
      if (request.userId) {
        permissionResult = await this.securityScanner.checkPermissions(dialog, request.userId);
      }

      // 威胁检测
      const threatResult = await this.securityScanner.detectThreats(dialog);

      // 生成安全发现
      const findings = this.generateSecurityFindings(scanResult, permissionResult, threatResult);

      // 计算整体风险
      const overallRisk = this.calculateOverallRisk(findings);

      // 生成推荐
      const recommendations = this.generateSecurityRecommendations(findings);

      // 记录安全事件
      await this.auditLogger.logSecurityEvent({
        eventId: this.generateEventId(),
        eventType: 'security_scan',
        severity: overallRisk === 'critical' ? 'critical' : 'medium',
        dialogId: request.dialogId,
        userId: request.userId,
        timestamp: new Date().toISOString(),
        description: `Security scan completed for dialog ${request.dialogId}`,
        metadata: { scanType: request.scanType, findingsCount: findings.length }
      });

      return {
        dialogId: request.dialogId,
        scanType: request.scanType,
        status: 'completed',
        overallRisk,
        scannedAt: new Date().toISOString(),
        findings,
        recommendations,
        complianceStatus: request.scanType === 'compliance' ? this.checkCompliance(dialog, findings) : undefined
      };
    } catch (error) {
      // 如果是对话不存在的错误，直接抛出
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }

      // 记录失败事件
      await this.auditLogger.logSecurityEvent({
        eventId: this.generateEventId(),
        eventType: 'security_scan',
        severity: 'high',
        dialogId: request.dialogId,
        userId: request.userId,
        timestamp: new Date().toISOString(),
        description: `Security scan failed for dialog ${request.dialogId}: ${error}`,
        metadata: { error: String(error) }
      });

      return {
        dialogId: request.dialogId,
        scanType: request.scanType,
        status: 'failed',
        overallRisk: 'high',
        scannedAt: new Date().toISOString(),
        findings: [],
        recommendations: ['扫描失败，建议手动检查对话安全性']
      };
    }
  }

  /**
   * 验证对话权限
   * @param request 权限验证请求
   * @returns 权限验证结果
   */
  async validateDialogPermissions(request: ValidateDialogPermissionsRequest): Promise<PermissionValidationResult> {
    const dialog = await this.dialogRepository.findById(request.dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${request.dialogId} not found`);
    }

    const violations: PermissionViolation[] = [];
    const warnings: string[] = [];

    // 验证每个请求的操作
    for (const operation of request.requestedOperations) {
      const result = await this.permissionManager.validatePermissions(request.dialogId, request.userId, operation);
      if (!result.isValid) {
        violations.push(...result.violations);
        warnings.push(...result.warnings);
      }
    }

    const isValid = violations.length === 0;

    // 记录权限事件
    await this.auditLogger.logPermissionEvent({
      eventId: this.generateEventId(),
      dialogId: request.dialogId,
      userId: request.userId,
      operation: request.requestedOperations.join(','),
      granted: isValid,
      reason: isValid ? 'All permissions granted' : 'Permission violations detected',
      timestamp: new Date().toISOString()
    });

    return {
      isValid,
      violations,
      warnings,
      recommendations: this.generatePermissionRecommendations(violations)
    };
  }

  /**
   * 强制执行权限检查
   * @param dialogId 对话ID
   * @param userId 用户ID
   * @param operation 操作类型
   * @returns 是否允许操作
   */
  async enforcePermissions(dialogId: UUID, userId: UUID, operation: string): Promise<boolean> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    const granted = await this.permissionManager.enforcePermissions(dialogId, userId, operation);

    // 审计权限使用
    await this.permissionManager.auditPermissionUsage(dialogId, userId, operation);

    // 记录权限事件
    await this.auditLogger.logPermissionEvent({
      eventId: this.generateEventId(),
      dialogId,
      userId,
      operation,
      granted,
      reason: granted ? 'Permission granted' : 'Permission denied',
      timestamp: new Date().toISOString()
    });

    return granted;
  }

  /**
   * 生成安全报告
   * @param request 安全报告请求
   * @returns 安全报告
   */
  async generateSecurityReport(request: GenerateSecurityReportRequest): Promise<SecurityReport> {
    const dialog = await this.dialogRepository.findById(request.dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${request.dialogId} not found`);
    }

    // 执行完整安全扫描
    const scanResult = await this.securityScanner.performSecurityScan(dialog);
    const threatResult = await this.securityScanner.detectThreats(dialog);

    // 生成安全发现
    const findings = this.generateSecurityFindings(scanResult, undefined, threatResult);

    // 检查合规性
    const complianceStatus = this.checkCompliance(dialog, findings);

    // 生成摘要
    const summary: SecuritySummary = {
      overallRisk: this.calculateOverallRisk(findings),
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'critical').length,
      complianceScore: this.calculateComplianceScore(complianceStatus)
    };

    return {
      dialogId: request.dialogId,
      reportType: request.reportType,
      generatedAt: new Date().toISOString(),
      summary,
      findings,
      complianceStatus,
      recommendations: request.includeRecommendations ? this.generateSecurityRecommendations(findings) : []
    };
  }

  /**
   * 执行内容审核
   * @param content 内容文本
   * @param options 审核选项
   * @returns 审核结果
   */
  async moderateContent(content: string, options: {
    checkProfanity?: boolean;
    checkToxicity?: boolean;
    checkSpam?: boolean;
    checkPersonalInfo?: boolean;
    language?: string;
  } = {}): Promise<{
    approved: boolean;
    confidence: number;
    violations: Array<{
      type: 'profanity' | 'toxicity' | 'spam' | 'personal_info' | 'inappropriate';
      severity: 'low' | 'medium' | 'high';
      description: string;
      location: { start: number; end: number };
      suggestion?: string;
    }>;
    sanitizedContent?: string;
    metadata: {
      language: string;
      contentLength: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();

    // 使用ContentModerator进行高级内容审核
    const moderationResult = await this.contentModerator.moderate(content);

    // 转换ContentModerator结果为DialogSecurityService格式
    const violations = moderationResult.violations.map(violation => ({
      type: violation.type as 'profanity' | 'toxicity' | 'spam' | 'personal_info' | 'inappropriate',
      severity: violation.severity as 'low' | 'medium' | 'high',
      description: violation.description,
      location: violation.location || { start: 0, end: content.length },
      suggestion: violation.suggestion || 'Please review and modify the content'
    }));

    // 如果ContentModerator没有检测到违规，执行额外检查
    if (violations.length === 0) {
      // 检查亵渎内容
      if (options.checkProfanity !== false) {
        const profanityViolations = await this.checkProfanity(content);
        violations.push(...profanityViolations.map(v => ({
          ...v,
          suggestion: v.suggestion || 'Please use more appropriate language'
        })));
      }

      // 检查毒性内容
      if (options.checkToxicity !== false) {
        const toxicityViolations = await this.checkToxicity(content);
        violations.push(...toxicityViolations.map(v => ({
          ...v,
          suggestion: v.suggestion || 'Please use more respectful language'
        })));
      }

      // 检查垃圾信息
      if (options.checkSpam !== false) {
        const spamViolations = await this.checkSpam(content);
        violations.push(...spamViolations.map(v => ({
          ...v,
          suggestion: v.suggestion || 'Please avoid promotional content'
        })));
      }

      // 检查个人信息
      if (options.checkPersonalInfo !== false) {
        const personalInfoViolations = await this.checkPersonalInfo(content);
        violations.push(...personalInfoViolations.map(v => ({
          ...v,
          suggestion: v.suggestion || 'Please remove personal information'
        })));
      }
    }

    const approved = moderationResult.approved && (violations.length === 0 || violations.every(v => v.severity === 'low'));
    const confidence = this.calculateModerationConfidence(violations);
    const sanitizedContent = approved ? undefined : this.sanitizeContent(content, violations);

    return {
      approved,
      confidence,
      violations,
      sanitizedContent,
      metadata: {
        language: options.language || 'en',
        contentLength: content.length,
        processingTime: Date.now() - startTime
      }
    };
  }

  /**
   * 执行隐私保护检查
   * @param dialogId 对话ID
   * @param options 检查选项
   * @returns 隐私检查结果
   */
  async checkPrivacyCompliance(dialogId: UUID, options: {
    checkGDPR?: boolean;
    checkCCPA?: boolean;
    checkHIPAA?: boolean;
    checkDataRetention?: boolean;
  } = {}): Promise<{
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
  }> {
    const dialog = await this.dialogRepository.findById(dialogId);
    if (!dialog) {
      throw new Error(`Dialog ${dialogId} not found`);
    }

    // 使用PrivacyProtector进行高级隐私合规检查
    const dialogData = {
      dialogId: dialog.dialogId,
      participants: dialog.participants,
      capabilities: dialog.capabilities,
      timestamp: dialog.timestamp,
      processingPurpose: 'dialog_management',
      processingLegalBasis: 'legitimate_interest',
      encryptionEnabled: true,
      accessControls: true,
      deletionMechanism: true,
      exportMechanism: true
    };

    const violations = [];

    // GDPR检查 - 使用PrivacyProtector增强
    if (options.checkGDPR !== false) {
      const gdprResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'GDPR');
      const gdprViolations = gdprResult.violations.map(violation => ({
        regulation: 'GDPR' as const,
        requirement: 'GDPR Compliance',
        violation,
        severity: 'high' as const,
        remediation: 'Implement GDPR compliance measures'
      }));
      violations.push(...gdprViolations);
    }

    // CCPA检查 - 使用PrivacyProtector增强
    if (options.checkCCPA !== false) {
      const ccpaResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'CCPA');
      const ccpaViolations = ccpaResult.violations.map(violation => ({
        regulation: 'CCPA' as const,
        requirement: 'CCPA Compliance',
        violation,
        severity: 'medium' as const,
        remediation: 'Implement CCPA compliance measures'
      }));
      violations.push(...ccpaViolations);
    }

    // HIPAA检查 - 使用PrivacyProtector增强
    if (options.checkHIPAA !== false) {
      const hipaaResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'HIPAA');
      const hipaaViolations = hipaaResult.violations.map(violation => ({
        regulation: 'HIPAA' as const,
        requirement: 'HIPAA Compliance',
        violation,
        severity: 'critical' as const,
        remediation: 'Implement HIPAA compliance measures'
      }));
      violations.push(...hipaaViolations);
    }

    // 数据保留检查
    if (options.checkDataRetention !== false) {
      const retentionViolations = await this.checkDataRetention(dialog);
      violations.push(...retentionViolations);
    }

    const compliant = violations.length === 0;
    const dataProcessingInfo = await this.analyzeDataProcessing(dialog);
    const recommendations = this.generatePrivacyRecommendations(violations);

    return {
      compliant,
      violations,
      dataProcessingInfo,
      recommendations
    };
  }

  // ===== 私有辅助方法 =====

  private generateSecurityFindings(
    scanResult: SecurityScanResult,
    permissionResult?: PermissionCheckResult,
    threatResult?: ThreatDetectionResult
  ): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // 处理扫描结果
    scanResult.vulnerabilities.forEach((vuln, index) => {
      findings.push({
        id: `scan-${index + 1}`,
        severity: vuln.severity,
        category: 'vulnerability',
        title: `Security Vulnerability: ${vuln.type}`,
        description: vuln.description,
        recommendation: vuln.mitigation,
        affectedComponents: ['dialog-content']
      });
    });

    // 处理权限结果
    if (permissionResult && !permissionResult.hasPermission) {
      findings.push({
        id: 'permission-1',
        severity: 'medium',
        category: 'permission',
        title: 'Permission Issues Detected',
        description: `Missing permissions: ${permissionResult.missingPermissions.join(', ')}`,
        recommendation: 'Grant required permissions or restrict access',
        affectedComponents: ['access-control']
      });
    }

    // 处理威胁结果
    if (threatResult && threatResult.threatsDetected) {
      threatResult.threats.forEach((threat, index) => {
        findings.push({
          id: `threat-${index + 1}`,
          severity: threat.severity,
          category: 'threat',
          title: `Security Threat: ${threat.type}`,
          description: threat.description,
          recommendation: 'Implement threat mitigation measures',
          affectedComponents: ['dialog-processing']
        });
      });
    }

    return findings;
  }

  private calculateOverallRisk(findings: SecurityFinding[]): 'low' | 'medium' | 'high' | 'critical' {
    if (findings.some(f => f.severity === 'critical')) return 'critical';
    if (findings.some(f => f.severity === 'high')) return 'high';
    if (findings.some(f => f.severity === 'medium')) return 'medium';
    return 'low';
  }

  private generateSecurityRecommendations(findings: SecurityFinding[]): string[] {
    const recommendations = new Set<string>();

    findings.forEach(finding => {
      recommendations.add(finding.recommendation);
    });

    if (findings.length === 0) {
      recommendations.add('继续保持良好的安全实践');
    }

    return Array.from(recommendations);
  }

  private generatePermissionRecommendations(violations: PermissionViolation[]): string[] {
    return violations.map(v => v.remediation);
  }

  private checkCompliance(_dialog: DialogEntity, findings: SecurityFinding[]): ComplianceStatus {
    const violations: ComplianceViolation[] = [];

    // 检查GDPR合规性
    const hasDataPrivacyIssues = findings.some(f => f.category === 'privacy');
    if (hasDataPrivacyIssues) {
      violations.push({
        regulation: 'GDPR',
        requirement: 'Data Privacy Protection',
        violation: 'Potential privacy issues detected',
        remediation: 'Implement data anonymization and consent management'
      });
    }

    return {
      gdprCompliant: !hasDataPrivacyIssues,
      hipaaCompliant: true, // 简化实现
      soxCompliant: true, // 简化实现
      violations
    };
  }

  private calculateComplianceScore(complianceStatus: ComplianceStatus): number {
    let score = 100;
    score -= complianceStatus.violations.length * 10;
    return Math.max(0, score);
  }

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // ===== 内容审核私有方法 =====

  private async checkProfanity(content: string): Promise<Array<{
    type: 'profanity';
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: { start: number; end: number };
    suggestion?: string;
  }>> {
    // TODO: 等待L3管理器激活亵渎内容检测
    // 模拟检测结果
    const profanityWords = ['badword1', 'badword2']; // 实际应该从配置或API获取
    const violations = [];

    for (const word of profanityWords) {
      const index = content.toLowerCase().indexOf(word);
      if (index !== -1) {
        violations.push({
          type: 'profanity' as const,
          severity: 'medium' as const,
          description: `检测到不当用词: ${word}`,
          location: { start: index, end: index + word.length },
          suggestion: '***'
        });
      }
    }

    return violations;
  }

  private async checkToxicity(content: string): Promise<Array<{
    type: 'toxicity';
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: { start: number; end: number };
    suggestion?: string;
  }>> {
    // TODO: 等待L3管理器激活毒性内容检测
    // 模拟毒性检测
    const toxicityScore = Math.random(); // 实际应该使用ML模型

    if (toxicityScore > 0.7) {
      return [{
        type: 'toxicity' as const,
        severity: 'high' as const,
        description: '检测到高毒性内容',
        location: { start: 0, end: content.length },
        suggestion: '请使用更友善的语言'
      }];
    }

    return [];
  }

  private async checkSpam(content: string): Promise<Array<{
    type: 'spam';
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: { start: number; end: number };
    suggestion?: string;
  }>> {
    // TODO: 等待L3管理器激活垃圾信息检测
    // 简单的垃圾信息检测
    const spamIndicators = ['click here', 'buy now', 'limited time'];
    const violations = [];

    for (const indicator of spamIndicators) {
      const index = content.toLowerCase().indexOf(indicator);
      if (index !== -1) {
        violations.push({
          type: 'spam' as const,
          severity: 'medium' as const,
          description: `检测到垃圾信息指标: ${indicator}`,
          location: { start: index, end: index + indicator.length }
        });
      }
    }

    return violations;
  }

  private async checkPersonalInfo(content: string): Promise<Array<{
    type: 'personal_info';
    severity: 'low' | 'medium' | 'high';
    description: string;
    location: { start: number; end: number };
    suggestion?: string;
  }>> {
    // TODO: 等待L3管理器激活个人信息检测
    // 简单的个人信息检测
    const violations = [];

    // 检测邮箱
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(content)) !== null) {
      violations.push({
        type: 'personal_info' as const,
        severity: 'high' as const,
        description: '检测到邮箱地址',
        location: { start: match.index, end: match.index + match[0].length },
        suggestion: '[邮箱已隐藏]'
      });
    }

    // 检测电话号码
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
    while ((match = phoneRegex.exec(content)) !== null) {
      violations.push({
        type: 'personal_info' as const,
        severity: 'high' as const,
        description: '检测到电话号码',
        location: { start: match.index, end: match.index + match[0].length },
        suggestion: '[电话已隐藏]'
      });
    }

    return violations;
  }

  private calculateModerationConfidence(violations: Array<{ severity: string }>): number {
    if (violations.length === 0) return 0.95;

    const severityWeights = { low: 0.1, medium: 0.3, high: 0.6 };
    const totalWeight = violations.reduce((sum, v) => sum + (severityWeights[v.severity as keyof typeof severityWeights] || 0.3), 0);

    return Math.max(0.5, 0.95 - (totalWeight / violations.length));
  }

  private sanitizeContent(content: string, violations: Array<{
    location: { start: number; end: number };
    suggestion?: string;
  }>): string {
    let sanitized = content;

    // 按位置倒序排序，避免索引偏移问题
    const sortedViolations = violations
      .filter(v => v.suggestion)
      .sort((a, b) => b.location.start - a.location.start);

    for (const violation of sortedViolations) {
      sanitized = sanitized.substring(0, violation.location.start) +
                 (violation.suggestion || '***') +
                 sanitized.substring(violation.location.end);
    }

    return sanitized;
  }

  // ===== 隐私合规检查私有方法 =====

  private async checkGDPRCompliance(dialog: DialogEntity): Promise<Array<{
    regulation: 'GDPR';
    requirement: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
  }>> {
    // TODO: 等待L3管理器激活GDPR合规检查
    const violations = [];

    // 检查数据处理同意
    if (!dialog.auditTrail.enabled) {
      violations.push({
        regulation: 'GDPR' as const,
        requirement: 'Article 7 - Consent',
        violation: '缺少数据处理同意记录',
        severity: 'high' as const,
        remediation: '启用审计追踪并记录用户同意'
      });
    }

    // 检查数据保留期限
    if (dialog.auditTrail.retentionDays > 365) {
      violations.push({
        regulation: 'GDPR' as const,
        requirement: 'Article 5 - Storage limitation',
        violation: '数据保留期限过长',
        severity: 'medium' as const,
        remediation: '调整数据保留期限至合规范围'
      });
    }

    return violations;
  }

  private async checkCCPACompliance(dialog: DialogEntity): Promise<Array<{
    regulation: 'CCPA';
    requirement: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
  }>> {
    // TODO: 等待L3管理器激活CCPA合规检查
    const violations = [];

    // 检查数据删除权
    if (!dialog.auditTrail.enabled) {
      violations.push({
        regulation: 'CCPA' as const,
        requirement: 'Right to Delete',
        violation: '缺少数据删除机制',
        severity: 'medium' as const,
        remediation: '实施数据删除和匿名化机制'
      });
    }

    return violations;
  }

  private async checkHIPAACompliance(dialog: DialogEntity): Promise<Array<{
    regulation: 'HIPAA';
    requirement: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
  }>> {
    // TODO: 等待L3管理器激活HIPAA合规检查
    const violations = [];

    // 检查健康信息保护
    if (dialog.participants.length > 2) {
      violations.push({
        regulation: 'HIPAA' as const,
        requirement: 'Minimum Necessary Standard',
        violation: '可能存在过度的健康信息访问',
        severity: 'high' as const,
        remediation: '限制健康信息的访问范围'
      });
    }

    return violations;
  }

  private async checkDataRetention(dialog: DialogEntity): Promise<Array<{
    regulation: 'DATA_RETENTION';
    requirement: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation: string;
  }>> {
    // TODO: 等待L3管理器激活数据保留检查
    const violations = [];

    // 检查保留期限设置
    if (dialog.auditTrail.retentionDays <= 0) {
      violations.push({
        regulation: 'DATA_RETENTION' as const,
        requirement: 'Data Retention Policy',
        violation: '未设置数据保留期限',
        severity: 'medium' as const,
        remediation: '设置合适的数据保留期限'
      });
    }

    return violations;
  }

  private async analyzeDataProcessing(dialog: DialogEntity): Promise<{
    personalDataDetected: boolean;
    dataTypes: string[];
    retentionPeriod: number;
    consentStatus: 'granted' | 'pending' | 'denied' | 'unknown';
  }> {
    // TODO: 等待L3管理器激活数据处理分析
    // 模拟数据处理分析
    return {
      personalDataDetected: dialog.participants.length > 0,
      dataTypes: ['user_id', 'conversation_data', 'metadata'],
      retentionPeriod: dialog.auditTrail.retentionDays,
      consentStatus: dialog.auditTrail.enabled ? 'granted' : 'unknown'
    };
  }

  private generatePrivacyRecommendations(violations: Array<{ regulation: string; severity: string }>): string[] {
    const recommendations = [];

    if (violations.some(v => v.regulation === 'GDPR')) {
      recommendations.push('实施GDPR合规措施，包括同意管理和数据保护');
    }

    if (violations.some(v => v.regulation === 'CCPA')) {
      recommendations.push('建立CCPA合规流程，确保用户权利保护');
    }

    if (violations.some(v => v.regulation === 'HIPAA')) {
      recommendations.push('加强健康信息保护措施');
    }

    if (violations.some(v => v.severity === 'critical' || v.severity === 'high')) {
      recommendations.push('优先处理高风险隐私问题');
    }

    if (recommendations.length === 0) {
      recommendations.push('继续维护良好的隐私保护实践');
    }

    return recommendations;
  }
}
