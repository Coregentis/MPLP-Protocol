"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionSecurityService = void 0;
class ExtensionSecurityService {
    extensionRepository;
    securityScanner;
    permissionManager;
    auditLogger;
    constructor(extensionRepository, securityScanner, permissionManager, auditLogger) {
        this.extensionRepository = extensionRepository;
        this.securityScanner = securityScanner;
        this.permissionManager = permissionManager;
        this.auditLogger = auditLogger;
    }
    async scanExtensionSecurity(request) {
        const extension = await this.extensionRepository.findById(request.extensionId);
        if (!extension) {
            throw new Error(`Extension ${request.extensionId} not found`);
        }
        const scanId = this.generateScanId();
        const startTime = new Date().toISOString();
        try {
            const staticAnalysis = await this.securityScanner.performStaticAnalysis(extension);
            const dependencyCheck = await this.securityScanner.checkDependencies(extension);
            const malwareCheck = await this.securityScanner.detectMalware(extension);
            const signatureCheck = await this.securityScanner.validateCodeSignature(extension);
            const permissionAudit = await this.auditExtensionPermissions(extension);
            const findings = [
                ...staticAnalysis.vulnerabilities,
                ...this.convertDependencyFindings(dependencyCheck),
                ...this.convertMalwareFindings(malwareCheck),
                ...this.convertSignatureFindings(signatureCheck),
                ...permissionAudit.violations.map(v => this.convertPermissionViolation(v))
            ];
            const overallRisk = this.calculateOverallRisk(findings);
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
    async validateExtensionPermissions(request) {
        const extension = await this.extensionRepository.findById(request.extensionId);
        if (!extension) {
            throw new Error(`Extension ${request.extensionId} not found`);
        }
        const validationResult = await this.permissionManager.validatePermissions(request.extensionId, request.requestedPermissions);
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
    async enforcePermissions(extensionId, operation, userId) {
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
        }
        const granted = await this.permissionManager.enforcePermissions(extensionId, operation);
        await this.permissionManager.auditPermissionUsage(extensionId, operation, userId);
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
    async generateSecurityReport(request) {
        const extension = await this.extensionRepository.findById(request.extensionId);
        if (!extension) {
            throw new Error(`Extension ${request.extensionId} not found`);
        }
        const scanResult = await this.scanExtensionSecurity({
            extensionId: request.extensionId,
            scanType: 'full',
            includeCompliance: true
        });
        const reportId = this.generateReportId();
        const generatedAt = new Date().toISOString();
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
        const violations = [];
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
