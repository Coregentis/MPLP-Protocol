/**
 * Extension安全服务
 * 
 * @description 扩展安全和合规服务，负责权限管理、安全审计、恶意代码检测
 * @version 1.0.0
 * @layer Application层 - 应用服务
 * @pattern 基于重构指南的3服务架构设计
 */

import { UUID } from '../../../../shared/types';
import { IExtensionRepository } from '../../domain/repositories/extension.repository.interface';
import {
  ExtensionEntityData,
  ExtensionPermissions
} from '../../types';

// ===== 安全相关接口定义 =====

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

// ===== 安全数据类型定义 =====

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

// ===== 请求/响应类型 =====

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

/**
 * Extension安全服务实现
 */
export class ExtensionSecurityService {
  constructor(
    private readonly extensionRepository: IExtensionRepository,
    private readonly securityScanner: ISecurityScanner,
    private readonly permissionManager: IPermissionManager,
    private readonly auditLogger: IAuditLogger
  ) {}

  /**
   * 扫描扩展安全性
   * @param request - 扫描请求
   * @returns Promise<SecurityScanResult> - 扫描结果
   */
  async scanExtensionSecurity(request: ScanExtensionRequest): Promise<SecurityScanResult> {
    const extension = await this.extensionRepository.findById(request.extensionId);
    if (!extension) {
      throw new Error(`Extension ${request.extensionId} not found`);
    }

    const scanId = this.generateScanId();
    const startTime = new Date().toISOString();

    try {
      // 1. 静态代码分析
      const staticAnalysis = await this.securityScanner.performStaticAnalysis(extension);
      
      // 2. 依赖安全检查
      const dependencyCheck = await this.securityScanner.checkDependencies(extension);
      
      // 3. 恶意代码检测
      const malwareCheck = await this.securityScanner.detectMalware(extension);
      
      // 4. 代码签名验证
      const signatureCheck = await this.securityScanner.validateCodeSignature(extension);

      // 5. 权限审计
      const permissionAudit = await this.auditExtensionPermissions(extension);

      // 合并所有发现
      const findings: SecurityFinding[] = [
        ...staticAnalysis.vulnerabilities,
        ...this.convertDependencyFindings(dependencyCheck),
        ...this.convertMalwareFindings(malwareCheck),
        ...this.convertSignatureFindings(signatureCheck),
        ...permissionAudit.violations.map(v => this.convertPermissionViolation(v))
      ];

      // 计算整体风险
      const overallRisk = this.calculateOverallRisk(findings);

      // 生成合规状态
      const complianceStatus = request.includeCompliance 
        ? await this.checkCompliance(extension, findings)
        : this.createEmptyComplianceStatus();

      const endTime = new Date().toISOString();

      const scanResult: SecurityScanResult = {
        scanId,
        extensionId: request.extensionId,
        scanType: request.scanType,
        startTime,
        endTime,
        status: 'completed',
        overallRisk,
        findings,
        recommendations: this.generateSecurityRecommendations(findings),
        complianceStatus
      };

      // 记录安全审计事件
      await this.auditLogger.logSecurityEvent({
        eventId: this.generateEventId(),
        extensionId: request.extensionId,
        eventType: 'scan',
        severity: overallRisk === 'critical' ? 'critical' : 'medium',
        description: `Security scan completed with ${findings.length} findings`,
        timestamp: endTime,
        userId: request.userId,
        metadata: { scanId, scanType: request.scanType }
      });

      return scanResult;

    } catch (error) {
      const endTime = new Date().toISOString();
      
      // 记录扫描失败事件
      await this.auditLogger.logSecurityEvent({
        eventId: this.generateEventId(),
        extensionId: request.extensionId,
        eventType: 'scan',
        severity: 'high',
        description: `Security scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: endTime,
        userId: request.userId,
        metadata: { scanId, error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return {
        scanId,
        extensionId: request.extensionId,
        scanType: request.scanType,
        startTime,
        endTime,
        status: 'failed',
        overallRisk: 'high',
        findings: [],
        recommendations: ['扫描失败，建议手动检查扩展安全性'],
        complianceStatus: this.createEmptyComplianceStatus()
      };
    }
  }

  /**
   * 验证扩展权限
   * @param request - 权限验证请求
   * @returns Promise<PermissionValidationResult> - 验证结果
   */
  async validateExtensionPermissions(request: ValidatePermissionsRequest): Promise<PermissionValidationResult> {
    const extension = await this.extensionRepository.findById(request.extensionId);
    if (!extension) {
      throw new Error(`Extension ${request.extensionId} not found`);
    }

    // 验证权限
    const validationResult = await this.permissionManager.validatePermissions(
      request.extensionId,
      request.requestedPermissions
    );

    // 记录权限审计事件
    await this.auditLogger.logPermissionEvent({
      eventId: this.generateEventId(),
      extensionId: request.extensionId,
      userId: request.userId,
      operation: 'permission_validation',
      permission: JSON.stringify(request.requestedPermissions),
      granted: validationResult.isValid,
      timestamp: new Date().toISOString(),
      reason: validationResult.isValid ? 'Valid permissions' : 'Permission violations detected'
    });

    return validationResult;
  }

  /**
   * 强制执行权限检查
   * @param extensionId - 扩展ID
   * @param operation - 操作名称
   * @param userId - 用户ID
   * @returns Promise<boolean> - 是否允许操作
   */
  async enforcePermissions(extensionId: UUID, operation: string, userId?: UUID): Promise<boolean> {
    const extension = await this.extensionRepository.findById(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    // 强制执行权限
    const granted = await this.permissionManager.enforcePermissions(extensionId, operation);

    // 记录权限使用审计
    await this.permissionManager.auditPermissionUsage(extensionId, operation, userId);

    // 记录权限审计事件
    await this.auditLogger.logPermissionEvent({
      eventId: this.generateEventId(),
      extensionId,
      userId,
      operation,
      permission: operation,
      granted,
      timestamp: new Date().toISOString(),
      reason: granted ? 'Permission granted' : 'Permission denied'
    });

    return granted;
  }

  /**
   * 生成安全报告
   * @param request - 报告生成请求
   * @returns Promise<SecurityReport> - 安全报告
   */
  async generateSecurityReport(request: GenerateSecurityReportRequest): Promise<SecurityReport> {
    const extension = await this.extensionRepository.findById(request.extensionId);
    if (!extension) {
      throw new Error(`Extension ${request.extensionId} not found`);
    }

    // 执行安全扫描
    const scanResult = await this.scanExtensionSecurity({
      extensionId: request.extensionId,
      scanType: 'full',
      includeCompliance: true
    });

    const reportId = this.generateReportId();
    const generatedAt = new Date().toISOString();

    // 生成摘要
    const summary = this.generateSecuritySummary(scanResult.findings);

    return {
      reportId,
      extensionId: request.extensionId,
      generatedAt,
      reportType: request.reportType,
      summary,
      findings: scanResult.findings,
      recommendations: request.includeRecommendations 
        ? scanResult.recommendations 
        : [],
      complianceStatus: scanResult.complianceStatus
    };
  }

  // ===== 私有辅助方法 =====

  private generateScanId(): UUID {
    return `scan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private generateEventId(): UUID {
    return `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private generateReportId(): UUID {
    return `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private async auditExtensionPermissions(extension: ExtensionEntityData): Promise<PermissionValidationResult> {
    return await this.permissionManager.validatePermissions(extension.extensionId, extension.security.permissions);
  }

  private convertDependencyFindings(result: DependencySecurityResult): SecurityFinding[] {
    return result.vulnerableDependencies.map(dep => ({
      id: this.generateEventId(),
      type: 'dependency' as const,
      severity: dep.severity,
      title: `Vulnerable dependency: ${dep.name}`,
      description: `Dependency ${dep.name}@${dep.version} has known vulnerabilities: ${dep.vulnerabilities.join(', ')}`,
      location: `package.json`,
      remediation: `Update ${dep.name} to a secure version`
    }));
  }

  private convertMalwareFindings(result: MalwareDetectionResult): SecurityFinding[] {
    if (!result.isMalicious) return [];

    return [{
      id: this.generateEventId(),
      type: 'malware' as const,
      severity: 'critical' as const,
      title: 'Malware detected',
      description: `Malicious patterns detected with ${result.confidence}% confidence: ${result.detectedPatterns.join(', ')}`,
      remediation: 'Remove the extension immediately and scan the system for infections'
    }];
  }

  private convertSignatureFindings(result: CodeSignatureResult): SecurityFinding[] {
    if (result.isValid && result.trustLevel === 'trusted') return [];

    return [{
      id: this.generateEventId(),
      type: 'code-quality' as const,
      severity: result.trustLevel === 'untrusted' ? 'high' : 'medium' as const,
      title: 'Code signature issue',
      description: `Code signature is ${result.isValid ? 'valid but untrusted' : 'invalid'}`,
      remediation: 'Verify the extension source and consider using only trusted extensions'
    }];
  }

  private convertPermissionViolation(violation: PermissionViolation): SecurityFinding {
    return {
      id: this.generateEventId(),
      type: 'permission' as const,
      severity: violation.severity,
      title: `Permission violation: ${violation.permission}`,
      description: violation.reason,
      remediation: violation.remediation
    };
  }

  private calculateOverallRisk(findings: SecurityFinding[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || mediumCount > 5) return 'medium';
    return 'low';
  }

  private async checkCompliance(_extension: ExtensionEntityData, findings: SecurityFinding[]): Promise<ComplianceStatus> {
    // 简化的合规检查实现
    const violations: ComplianceViolation[] = [];

    // 检查GDPR合规性
    if (this.hasDataProcessingFindings(findings)) {
      violations.push({
        regulation: 'GDPR',
        requirement: 'Data protection by design',
        violation: 'Extension may process personal data without proper safeguards',
        severity: 'high'
      });
    }

    return {
      gdprCompliant: !violations.some(v => v.regulation === 'GDPR'),
      hipaaCompliant: !violations.some(v => v.regulation === 'HIPAA'),
      soxCompliant: !violations.some(v => v.regulation === 'SOX'),
      violations
    };
  }

  private hasDataProcessingFindings(findings: SecurityFinding[]): boolean {
    return findings.some(f => 
      f.description.toLowerCase().includes('data') || 
      f.description.toLowerCase().includes('privacy')
    );
  }

  private createEmptyComplianceStatus(): ComplianceStatus {
    return {
      gdprCompliant: true,
      hipaaCompliant: true,
      soxCompliant: true,
      violations: []
    };
  }

  private generateSecurityRecommendations(findings: SecurityFinding[]): string[] {
    const recommendations: string[] = [];

    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');

    if (criticalFindings.length > 0) {
      recommendations.push('立即处理所有严重安全问题');
    }

    if (highFindings.length > 0) {
      recommendations.push('优先处理高风险安全问题');
    }

    if (findings.some(f => f.type === 'dependency')) {
      recommendations.push('更新所有有漏洞的依赖项');
    }

    if (findings.some(f => f.type === 'permission')) {
      recommendations.push('审查和限制扩展权限');
    }

    return recommendations;
  }

  private generateSecuritySummary(findings: SecurityFinding[]): SecuritySummary {
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;
    const lowFindings = findings.filter(f => f.severity === 'low').length;

    const overallRisk = this.calculateOverallRisk(findings);
    const complianceScore = Math.max(0, 100 - (criticalFindings * 30 + highFindings * 20 + mediumFindings * 10));

    return {
      overallRisk,
      totalFindings: findings.length,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      complianceScore
    };
  }
}
