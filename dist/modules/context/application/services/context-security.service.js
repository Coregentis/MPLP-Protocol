"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSecurityService = void 0;
class ContextSecurityService {
    contextRepository;
    securityManager;
    auditLogger;
    complianceChecker;
    threatDetector;
    logger;
    constructor(contextRepository, securityManager, auditLogger, complianceChecker, threatDetector, logger) {
        this.contextRepository = contextRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
        this.complianceChecker = complianceChecker;
        this.threatDetector = threatDetector;
        this.logger = logger;
    }
    async validateAccess(contextId, userId, operation) {
        try {
            this.logger.info('Validating access', { contextId, userId, operation });
            const userContext = await this.securityManager.getUserContext(userId);
            if (!userContext) {
                await this.auditLogger.logSecurityEvent({
                    type: 'access_denied',
                    contextId,
                    userId,
                    operation,
                    reason: 'invalid_user',
                    timestamp: new Date()
                });
                return false;
            }
            const hasPermission = await this.checkPermissionPolicy(contextId, userId, operation);
            await this.auditLogger.logAccessAttempt({
                contextId,
                userId,
                operation,
                result: hasPermission ? 'granted' : 'denied',
                timestamp: new Date(),
                userAgent: userContext.userAgent,
                ipAddress: userContext.ipAddress
            });
            this.logger.info('Access validation completed', {
                contextId,
                userId,
                operation,
                result: hasPermission ? 'granted' : 'denied'
            });
            return hasPermission;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.auditLogger.logSecurityEvent({
                type: 'access_error',
                contextId,
                userId,
                operation,
                error: errorMessage,
                timestamp: new Date()
            });
            this.logger.error('Failed to validate access', error, { contextId, userId, operation });
            return false;
        }
    }
    async performSecurityAudit(contextId) {
        try {
            this.logger.info('Performing security audit', { contextId });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            const [accessPatterns, dataIntegrity, complianceStatus, threatAssessment] = await Promise.all([
                this.analyzeAccessPatterns(contextId),
                this.checkDataIntegrity(context),
                this.checkCompliance(contextId, 'GDPR'),
                this.assessThreats(contextId)
            ]);
            const securityScore = this.calculateSecurityScore({
                accessPatterns,
                dataIntegrity,
                threats: threatAssessment,
                complianceStatus: { violations: complianceStatus.violations },
                threatAssessment
            });
            const audit = {
                contextId,
                auditId: `audit-${Date.now()}`,
                timestamp: new Date().toISOString(),
                securityScore,
                findings: [
                    ...this.convertToFindings(accessPatterns.anomalies, 'access_anomaly'),
                    ...this.convertToFindings(dataIntegrity.issues, 'data_exposure'),
                    ...this.convertToFindings(complianceStatus.violations, 'policy_violation'),
                    ...this.convertToFindings(threatAssessment.threats, 'vulnerability')
                ],
                recommendations: await this.generateSecurityRecommendations(contextId, {
                    accessPatterns,
                    dataIntegrity,
                    complianceStatus,
                    threatAssessment
                }),
                complianceStatus: this.mapComplianceStatus(complianceStatus.overall)
            };
            this.logger.info('Security audit completed', {
                contextId,
                auditId: audit.auditId,
                securityScore: audit.securityScore
            });
            return audit;
        }
        catch (error) {
            this.logger.error('Failed to perform security audit', error, { contextId });
            throw error;
        }
    }
    async encryptSensitiveData(contextId, data) {
        try {
            const encryptionKey = await this.securityManager.getEncryptionKey(contextId);
            const encryptedData = await this.securityManager.encrypt(data, encryptionKey);
            await this.auditLogger.logDataOperation({
                type: 'encryption',
                contextId,
                dataType: typeof data,
                timestamp: new Date()
            });
            this.logger.debug('Data encrypted successfully', { contextId });
            return encryptedData;
        }
        catch (error) {
            this.logger.error('Failed to encrypt data', error, { contextId });
            throw error;
        }
    }
    async decryptSensitiveData(contextId, encryptedData) {
        try {
            const encryptionKey = await this.securityManager.getEncryptionKey(contextId);
            const decryptedData = await this.securityManager.decrypt(encryptedData, encryptionKey);
            await this.auditLogger.logDataOperation({
                type: 'decryption',
                contextId,
                timestamp: new Date()
            });
            this.logger.debug('Data decrypted successfully', { contextId });
            return decryptedData;
        }
        catch (error) {
            this.logger.error('Failed to decrypt data', error, { contextId });
            throw error;
        }
    }
    async checkCompliance(contextId, standard) {
        try {
            this.logger.info('Checking compliance', { contextId, standard });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            const complianceResult = await this.complianceChecker.check(context, standard);
            await this.auditLogger.logComplianceCheck({
                contextId,
                standard,
                result: complianceResult.status,
                violations: complianceResult.violations.length,
                timestamp: new Date()
            });
            this.logger.info('Compliance check completed', {
                contextId,
                standard,
                status: complianceResult.status,
                violations: complianceResult.violations.length
            });
            return complianceResult;
        }
        catch (error) {
            this.logger.error('Failed to check compliance', error, { contextId, standard });
            throw error;
        }
    }
    async applySecurityPolicy(contextId, policy) {
        try {
            this.logger.info('Applying security policy', { contextId, policyId: policy.id });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            await this.validateSecurityPolicy(policy);
            await this.securityManager.applyPolicy(contextId, policy);
            await this.auditLogger.logPolicyChange({
                contextId,
                policyType: policy.type,
                policyId: policy.id,
                action: 'applied',
                timestamp: new Date()
            });
            this.logger.info('Security policy applied successfully', {
                contextId,
                policyId: policy.id
            });
        }
        catch (error) {
            this.logger.error('Failed to apply security policy', error, {
                contextId,
                policyId: policy.id
            });
            throw error;
        }
    }
    async detectThreats(contextId) {
        try {
            this.logger.info('Detecting threats', { contextId });
            const threats = await this.threatDetector.scan(contextId);
            const result = {
                contextId,
                scanId: `scan-${Date.now()}`,
                timestamp: new Date().toISOString(),
                threats,
                riskLevel: this.calculateRiskLevel(threats),
                recommendations: await this.generateThreatMitigationRecommendations(threats)
            };
            await this.auditLogger.logThreatDetection({
                contextId,
                threatsFound: threats.length,
                severity: threats.length > 0 ? Math.max(...threats.map(t => t.severity)) : 0,
                timestamp: new Date()
            });
            this.logger.info('Threat detection completed', {
                contextId,
                scanId: result.scanId,
                threatsFound: threats.length,
                riskLevel: result.riskLevel
            });
            return result;
        }
        catch (error) {
            this.logger.error('Failed to detect threats', error, { contextId });
            throw error;
        }
    }
    async checkPermissionPolicy(contextId, userId, operation) {
        try {
            const userRoles = await this.securityManager.getUserRoles(userId);
            const contextPermissions = await this.securityManager.getContextPermissions(contextId);
            return this.securityManager.hasPermission(userRoles, contextPermissions, operation);
        }
        catch (error) {
            this.logger.error('Failed to check permission policy', error, { contextId, userId, operation });
            return false;
        }
    }
    async analyzeAccessPatterns(_contextId) {
        return { anomalies: [] };
    }
    async checkDataIntegrity(_context) {
        return { issues: [] };
    }
    async assessThreats(contextId) {
        const threats = await this.threatDetector.scan(contextId);
        return { threats };
    }
    calculateSecurityScore(assessments) {
        let score = 100;
        score -= assessments.accessPatterns.anomalies.length * 5;
        score -= assessments.dataIntegrity.issues.length * 10;
        score -= (assessments.complianceStatus?.violations.length || 0) * 15;
        score -= (assessments.threatAssessment?.threats.length || 0) * 20;
        return Math.max(0, score);
    }
    convertToFindings(items, type) {
        return items.map(item => {
            let severity = 'medium';
            if (typeof item.severity === 'string') {
                severity = item.severity;
            }
            else if (typeof item.severity === 'number') {
                if (item.severity >= 8)
                    severity = 'critical';
                else if (item.severity >= 6)
                    severity = 'high';
                else if (item.severity >= 4)
                    severity = 'medium';
                else
                    severity = 'low';
            }
            const recommendation = 'recommendation' in item ? item.recommendation :
                'remediation' in item ? item.remediation :
                    `Address ${type}`;
            return {
                type,
                severity,
                description: item.description || `${type} detected`,
                recommendation
            };
        });
    }
    async generateSecurityRecommendations(_contextId, assessments) {
        const recommendations = [];
        if (assessments.accessPatterns.anomalies.length > 0) {
            recommendations.push('Review and update access control policies');
        }
        if (assessments.dataIntegrity.issues.length > 0) {
            recommendations.push('Implement data integrity checks');
        }
        if (assessments.complianceStatus.violations.length > 0) {
            recommendations.push('Address compliance violations');
        }
        if (assessments.threatAssessment.threats.length > 0) {
            recommendations.push('Implement threat mitigation measures');
        }
        return recommendations;
    }
    async validateSecurityPolicy(policy) {
        if (!policy.id || !policy.name || !policy.type) {
            throw new Error('Invalid security policy: missing required fields');
        }
        if (!policy.rules || policy.rules.length === 0) {
            throw new Error('Invalid security policy: no rules defined');
        }
    }
    calculateRiskLevel(threats) {
        if (threats.length === 0)
            return 'low';
        const maxSeverity = Math.max(...threats.map(t => t.severity));
        if (maxSeverity >= 8)
            return 'critical';
        if (maxSeverity >= 6)
            return 'high';
        if (maxSeverity >= 4)
            return 'medium';
        return 'low';
    }
    async generateThreatMitigationRecommendations(threats) {
        const recommendations = new Set();
        threats.forEach(threat => {
            switch (threat.type) {
                case 'unauthorized_access':
                    recommendations.add('Strengthen access controls and authentication');
                    break;
                case 'data_breach':
                    recommendations.add('Implement data encryption and monitoring');
                    break;
                case 'policy_violation':
                    recommendations.add('Review and enforce security policies');
                    break;
                case 'anomalous_behavior':
                    recommendations.add('Implement behavioral analysis and alerting');
                    break;
            }
        });
        return Array.from(recommendations);
    }
    mapComplianceStatus(status) {
        switch (status) {
            case 'pass':
                return 'compliant';
            case 'fail':
                return 'non_compliant';
            case 'warning':
                return 'partial';
            default:
                return 'non_compliant';
        }
    }
}
exports.ContextSecurityService = ContextSecurityService;
