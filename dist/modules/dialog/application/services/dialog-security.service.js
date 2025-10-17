"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogSecurityService = void 0;
const content_moderator_1 = require("../../infrastructure/moderators/content.moderator");
const privacy_protector_1 = require("../../infrastructure/protectors/privacy.protector");
class DialogSecurityService {
    dialogRepository;
    securityScanner;
    permissionManager;
    auditLogger;
    contentModerator;
    privacyProtector;
    constructor(dialogRepository, securityScanner, permissionManager, auditLogger, contentModerator, privacyProtector) {
        this.dialogRepository = dialogRepository;
        this.securityScanner = securityScanner;
        this.permissionManager = permissionManager;
        this.auditLogger = auditLogger;
        this.contentModerator = contentModerator || new content_moderator_1.ContentModerator();
        this.privacyProtector = privacyProtector || new privacy_protector_1.PrivacyProtector();
    }
    async scanDialogSecurity(request) {
        try {
            const dialog = await this.dialogRepository.findById(request.dialogId);
            if (!dialog) {
                throw new Error(`Dialog ${request.dialogId} not found`);
            }
            const scanResult = await this.securityScanner.performSecurityScan(dialog);
            let permissionResult;
            if (request.userId) {
                permissionResult = await this.securityScanner.checkPermissions(dialog, request.userId);
            }
            const threatResult = await this.securityScanner.detectThreats(dialog);
            const findings = this.generateSecurityFindings(scanResult, permissionResult, threatResult);
            const overallRisk = this.calculateOverallRisk(findings);
            const recommendations = this.generateSecurityRecommendations(findings);
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
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw error;
            }
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
    async validateDialogPermissions(request) {
        const dialog = await this.dialogRepository.findById(request.dialogId);
        if (!dialog) {
            throw new Error(`Dialog ${request.dialogId} not found`);
        }
        const violations = [];
        const warnings = [];
        for (const operation of request.requestedOperations) {
            const result = await this.permissionManager.validatePermissions(request.dialogId, request.userId, operation);
            if (!result.isValid) {
                violations.push(...result.violations);
                warnings.push(...result.warnings);
            }
        }
        const isValid = violations.length === 0;
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
    async enforcePermissions(dialogId, userId, operation) {
        const dialog = await this.dialogRepository.findById(dialogId);
        if (!dialog) {
            throw new Error(`Dialog ${dialogId} not found`);
        }
        const granted = await this.permissionManager.enforcePermissions(dialogId, userId, operation);
        await this.permissionManager.auditPermissionUsage(dialogId, userId, operation);
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
    async generateSecurityReport(request) {
        const dialog = await this.dialogRepository.findById(request.dialogId);
        if (!dialog) {
            throw new Error(`Dialog ${request.dialogId} not found`);
        }
        const scanResult = await this.securityScanner.performSecurityScan(dialog);
        const threatResult = await this.securityScanner.detectThreats(dialog);
        const findings = this.generateSecurityFindings(scanResult, undefined, threatResult);
        const complianceStatus = this.checkCompliance(dialog, findings);
        const summary = {
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
    async moderateContent(content, options = {}) {
        const startTime = Date.now();
        const moderationResult = await this.contentModerator.moderate(content);
        const violations = moderationResult.violations.map(violation => ({
            type: violation.type,
            severity: violation.severity,
            description: violation.description,
            location: violation.location || { start: 0, end: content.length },
            suggestion: violation.suggestion || 'Please review and modify the content'
        }));
        if (violations.length === 0) {
            if (options.checkProfanity !== false) {
                const profanityViolations = await this.checkProfanity(content);
                violations.push(...profanityViolations.map(v => ({
                    ...v,
                    suggestion: v.suggestion || 'Please use more appropriate language'
                })));
            }
            if (options.checkToxicity !== false) {
                const toxicityViolations = await this.checkToxicity(content);
                violations.push(...toxicityViolations.map(v => ({
                    ...v,
                    suggestion: v.suggestion || 'Please use more respectful language'
                })));
            }
            if (options.checkSpam !== false) {
                const spamViolations = await this.checkSpam(content);
                violations.push(...spamViolations.map(v => ({
                    ...v,
                    suggestion: v.suggestion || 'Please avoid promotional content'
                })));
            }
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
    async checkPrivacyCompliance(dialogId, options = {}) {
        const dialog = await this.dialogRepository.findById(dialogId);
        if (!dialog) {
            throw new Error(`Dialog ${dialogId} not found`);
        }
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
        if (options.checkGDPR !== false) {
            const gdprResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'GDPR');
            const gdprViolations = gdprResult.violations.map(violation => ({
                regulation: 'GDPR',
                requirement: 'GDPR Compliance',
                violation,
                severity: 'high',
                remediation: 'Implement GDPR compliance measures'
            }));
            violations.push(...gdprViolations);
        }
        if (options.checkCCPA !== false) {
            const ccpaResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'CCPA');
            const ccpaViolations = ccpaResult.violations.map(violation => ({
                regulation: 'CCPA',
                requirement: 'CCPA Compliance',
                violation,
                severity: 'medium',
                remediation: 'Implement CCPA compliance measures'
            }));
            violations.push(...ccpaViolations);
        }
        if (options.checkHIPAA !== false) {
            const hipaaResult = await this.privacyProtector.checkPrivacyCompliance(dialogData, 'HIPAA');
            const hipaaViolations = hipaaResult.violations.map(violation => ({
                regulation: 'HIPAA',
                requirement: 'HIPAA Compliance',
                violation,
                severity: 'critical',
                remediation: 'Implement HIPAA compliance measures'
            }));
            violations.push(...hipaaViolations);
        }
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
    generateSecurityFindings(scanResult, permissionResult, threatResult) {
        const findings = [];
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
    calculateOverallRisk(findings) {
        if (findings.some(f => f.severity === 'critical'))
            return 'critical';
        if (findings.some(f => f.severity === 'high'))
            return 'high';
        if (findings.some(f => f.severity === 'medium'))
            return 'medium';
        return 'low';
    }
    generateSecurityRecommendations(findings) {
        const recommendations = new Set();
        findings.forEach(finding => {
            recommendations.add(finding.recommendation);
        });
        if (findings.length === 0) {
            recommendations.add('继续保持良好的安全实践');
        }
        return Array.from(recommendations);
    }
    generatePermissionRecommendations(violations) {
        return violations.map(v => v.remediation);
    }
    checkCompliance(_dialog, findings) {
        const violations = [];
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
            hipaaCompliant: true,
            soxCompliant: true,
            violations
        };
    }
    calculateComplianceScore(complianceStatus) {
        let score = 100;
        score -= complianceStatus.violations.length * 10;
        return Math.max(0, score);
    }
    generateEventId() {
        return `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async checkProfanity(content) {
        const profanityWords = ['badword1', 'badword2'];
        const violations = [];
        for (const word of profanityWords) {
            const index = content.toLowerCase().indexOf(word);
            if (index !== -1) {
                violations.push({
                    type: 'profanity',
                    severity: 'medium',
                    description: `检测到不当用词: ${word}`,
                    location: { start: index, end: index + word.length },
                    suggestion: '***'
                });
            }
        }
        return violations;
    }
    async checkToxicity(content) {
        const toxicityScore = Math.random();
        if (toxicityScore > 0.7) {
            return [{
                    type: 'toxicity',
                    severity: 'high',
                    description: '检测到高毒性内容',
                    location: { start: 0, end: content.length },
                    suggestion: '请使用更友善的语言'
                }];
        }
        return [];
    }
    async checkSpam(content) {
        const spamIndicators = ['click here', 'buy now', 'limited time'];
        const violations = [];
        for (const indicator of spamIndicators) {
            const index = content.toLowerCase().indexOf(indicator);
            if (index !== -1) {
                violations.push({
                    type: 'spam',
                    severity: 'medium',
                    description: `检测到垃圾信息指标: ${indicator}`,
                    location: { start: index, end: index + indicator.length }
                });
            }
        }
        return violations;
    }
    async checkPersonalInfo(content) {
        const violations = [];
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        let match;
        while ((match = emailRegex.exec(content)) !== null) {
            violations.push({
                type: 'personal_info',
                severity: 'high',
                description: '检测到邮箱地址',
                location: { start: match.index, end: match.index + match[0].length },
                suggestion: '[邮箱已隐藏]'
            });
        }
        const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
        while ((match = phoneRegex.exec(content)) !== null) {
            violations.push({
                type: 'personal_info',
                severity: 'high',
                description: '检测到电话号码',
                location: { start: match.index, end: match.index + match[0].length },
                suggestion: '[电话已隐藏]'
            });
        }
        return violations;
    }
    calculateModerationConfidence(violations) {
        if (violations.length === 0)
            return 0.95;
        const severityWeights = { low: 0.1, medium: 0.3, high: 0.6 };
        const totalWeight = violations.reduce((sum, v) => sum + (severityWeights[v.severity] || 0.3), 0);
        return Math.max(0.5, 0.95 - (totalWeight / violations.length));
    }
    sanitizeContent(content, violations) {
        let sanitized = content;
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
    async checkGDPRCompliance(dialog) {
        const violations = [];
        if (!dialog.auditTrail.enabled) {
            violations.push({
                regulation: 'GDPR',
                requirement: 'Article 7 - Consent',
                violation: '缺少数据处理同意记录',
                severity: 'high',
                remediation: '启用审计追踪并记录用户同意'
            });
        }
        if (dialog.auditTrail.retentionDays > 365) {
            violations.push({
                regulation: 'GDPR',
                requirement: 'Article 5 - Storage limitation',
                violation: '数据保留期限过长',
                severity: 'medium',
                remediation: '调整数据保留期限至合规范围'
            });
        }
        return violations;
    }
    async checkCCPACompliance(dialog) {
        const violations = [];
        if (!dialog.auditTrail.enabled) {
            violations.push({
                regulation: 'CCPA',
                requirement: 'Right to Delete',
                violation: '缺少数据删除机制',
                severity: 'medium',
                remediation: '实施数据删除和匿名化机制'
            });
        }
        return violations;
    }
    async checkHIPAACompliance(dialog) {
        const violations = [];
        if (dialog.participants.length > 2) {
            violations.push({
                regulation: 'HIPAA',
                requirement: 'Minimum Necessary Standard',
                violation: '可能存在过度的健康信息访问',
                severity: 'high',
                remediation: '限制健康信息的访问范围'
            });
        }
        return violations;
    }
    async checkDataRetention(dialog) {
        const violations = [];
        if (dialog.auditTrail.retentionDays <= 0) {
            violations.push({
                regulation: 'DATA_RETENTION',
                requirement: 'Data Retention Policy',
                violation: '未设置数据保留期限',
                severity: 'medium',
                remediation: '设置合适的数据保留期限'
            });
        }
        return violations;
    }
    async analyzeDataProcessing(dialog) {
        return {
            personalDataDetected: dialog.participants.length > 0,
            dataTypes: ['user_id', 'conversation_data', 'metadata'],
            retentionPeriod: dialog.auditTrail.retentionDays,
            consentStatus: dialog.auditTrail.enabled ? 'granted' : 'unknown'
        };
    }
    generatePrivacyRecommendations(violations) {
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
exports.DialogSecurityService = DialogSecurityService;
