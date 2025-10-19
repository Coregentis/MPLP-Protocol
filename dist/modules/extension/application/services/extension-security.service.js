"use strict";
/**
 * Extension安全服务
 *
 * @description 扩展安全和合规服务，负责权限管理、安全审计、恶意代码检测
 * @version 1.0.0
 * @layer Application层 - 应用服务
 * @pattern 基于重构指南的3服务架构设计
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionSecurityService = void 0;
/**
 * Extension安全服务实现
 */
class ExtensionSecurityService {
    constructor(extensionRepository, securityScanner, permissionManager, auditLogger) {
        this.extensionRepository = extensionRepository;
        this.securityScanner = securityScanner;
        this.permissionManager = permissionManager;
        this.auditLogger = auditLogger;
    }
    /**
     * 扫描扩展安全性
     * @param request - 扫描请求
     * @returns Promise<SecurityScanResult> - 扫描结果
     */
    async scanExtensionSecurity(request) {
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
            const findings = [
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
            const scanResult = {
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
        }
        catch (error) {
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
    async validateExtensionPermissions(request) {
        const extension = await this.extensionRepository.findById(request.extensionId);
        if (!extension) {
            throw new Error(`Extension ${request.extensionId} not found`);
        }
        // 验证权限
        const validationResult = await this.permissionManager.validatePermissions(request.extensionId, request.requestedPermissions);
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
    async enforcePermissions(extensionId, operation, userId) {
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
    async generateSecurityReport(request) {
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
    generateScanId() {
        return `scan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateEventId() {
        return `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async auditExtensionPermissions(extension) {
        return await this.permissionManager.validatePermissions(extension.extensionId, extension.security.permissions);
    }
    convertDependencyFindings(result) {
        return result.vulnerableDependencies.map(dep => ({
            id: this.generateEventId(),
            type: 'dependency',
            severity: dep.severity,
            title: `Vulnerable dependency: ${dep.name}`,
            description: `Dependency ${dep.name}@${dep.version} has known vulnerabilities: ${dep.vulnerabilities.join(', ')}`,
            location: `package.json`,
            remediation: `Update ${dep.name} to a secure version`
        }));
    }
    convertMalwareFindings(result) {
        if (!result.isMalicious)
            return [];
        return [{
                id: this.generateEventId(),
                type: 'malware',
                severity: 'critical',
                title: 'Malware detected',
                description: `Malicious patterns detected with ${result.confidence}% confidence: ${result.detectedPatterns.join(', ')}`,
                remediation: 'Remove the extension immediately and scan the system for infections'
            }];
    }
    convertSignatureFindings(result) {
        if (result.isValid && result.trustLevel === 'trusted')
            return [];
        return [{
                id: this.generateEventId(),
                type: 'code-quality',
                severity: result.trustLevel === 'untrusted' ? 'high' : 'medium',
                title: 'Code signature issue',
                description: `Code signature is ${result.isValid ? 'valid but untrusted' : 'invalid'}`,
                remediation: 'Verify the extension source and consider using only trusted extensions'
            }];
    }
    convertPermissionViolation(violation) {
        return {
            id: this.generateEventId(),
            type: 'permission',
            severity: violation.severity,
            title: `Permission violation: ${violation.permission}`,
            description: violation.reason,
            remediation: violation.remediation
        };
    }
    calculateOverallRisk(findings) {
        const criticalCount = findings.filter(f => f.severity === 'critical').length;
        const highCount = findings.filter(f => f.severity === 'high').length;
        const mediumCount = findings.filter(f => f.severity === 'medium').length;
        if (criticalCount > 0)
            return 'critical';
        if (highCount > 2)
            return 'high';
        if (highCount > 0 || mediumCount > 5)
            return 'medium';
        return 'low';
    }
    async checkCompliance(_extension, findings) {
        // 简化的合规检查实现
        const violations = [];
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
    hasDataProcessingFindings(findings) {
        return findings.some(f => f.description.toLowerCase().includes('data') ||
            f.description.toLowerCase().includes('privacy'));
    }
    createEmptyComplianceStatus() {
        return {
            gdprCompliant: true,
            hipaaCompliant: true,
            soxCompliant: true,
            violations: []
        };
    }
    generateSecurityRecommendations(findings) {
        const recommendations = [];
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
    generateSecuritySummary(findings) {
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
exports.ExtensionSecurityService = ExtensionSecurityService;
//# sourceMappingURL=extension-security.service.js.map