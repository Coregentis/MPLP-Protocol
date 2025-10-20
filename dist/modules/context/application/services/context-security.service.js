"use strict";
/**
 * Context安全服务 - 新增服务
 *
 * @description 基于SCTM+GLFB+ITCM方法论设计的上下文安全和权限管理服务
 * 整合原有17个服务中的安全相关功能：权限控制、审计追踪，新增：安全审计、合规检查、威胁检测
 * @version 2.0.0
 * @layer 应用层 - 安全服务
 * @refactor 17→3服务简化，专注于安全和合规功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSecurityService = void 0;
/**
 * Context安全服务
 *
 * @description 整合原有17个服务中的2个安全服务，新增3个企业级安全功能
 * 职责：访问控制、安全审计、合规检查、威胁检测、数据保护
 */
class ContextSecurityService {
    constructor(contextRepository, securityManager, auditLogger, complianceChecker, threatDetector, logger) {
        this.contextRepository = contextRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
        this.complianceChecker = complianceChecker;
        this.threatDetector = threatDetector;
        this.logger = logger;
    }
    // ===== 访问控制 - 整合功能 =====
    /**
     * 验证访问权限
     * 整合：原权限控制功能，增强：详细的权限验证和审计
     */
    async validateAccess(contextId, userId, operation) {
        try {
            this.logger.info('Validating access', { contextId, userId, operation });
            // 1. 验证用户身份
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
            // 2. 检查权限策略
            const hasPermission = await this.checkPermissionPolicy(contextId, userId, operation);
            // 3. 记录访问日志
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
    // ===== 安全审计 - 新增功能 =====
    /**
     * 执行安全审计
     * 新增功能：全面的安全审计和评估
     */
    async performSecurityAudit(contextId) {
        try {
            this.logger.info('Performing security audit', { contextId });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            // 并行执行多种安全检查
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
    // ===== 数据保护 - 新增功能 =====
    /**
     * 加密敏感数据
     * 新增功能：敏感数据加密保护
     */
    async encryptSensitiveData(contextId, data) {
        try {
            const encryptionKey = await this.securityManager.getEncryptionKey(contextId);
            const encryptedData = await this.securityManager.encrypt(data, encryptionKey);
            // 记录加密操作
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
    /**
     * 解密敏感数据
     * 新增功能：敏感数据解密
     */
    async decryptSensitiveData(contextId, encryptedData) {
        try {
            const encryptionKey = await this.securityManager.getEncryptionKey(contextId);
            const decryptedData = await this.securityManager.decrypt(encryptedData, encryptionKey);
            // 记录解密操作
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
    // ===== 合规检查 - 新增功能 =====
    /**
     * 检查合规性
     * 新增功能：多种合规标准检查
     */
    async checkCompliance(contextId, standard) {
        try {
            this.logger.info('Checking compliance', { contextId, standard });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            const complianceResult = await this.complianceChecker.check(context, standard);
            // 记录合规检查
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
    // ===== 安全策略管理 - 新增功能 =====
    /**
     * 应用安全策略
     * 新增功能：动态安全策略管理
     */
    async applySecurityPolicy(contextId, policy) {
        try {
            this.logger.info('Applying security policy', { contextId, policyId: policy.id });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            // 验证策略有效性
            await this.validateSecurityPolicy(policy);
            // 应用安全策略
            await this.securityManager.applyPolicy(contextId, policy);
            // 记录策略应用
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
    // ===== 威胁检测 - 新增功能 =====
    /**
     * 检测安全威胁
     * 新增功能：智能威胁检测和评估
     */
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
            // 记录威胁检测结果
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
    // ===== 私有辅助方法 =====
    /**
     * 检查权限策略
     */
    async checkPermissionPolicy(contextId, userId, operation) {
        try {
            // 获取用户角色和权限
            const userRoles = await this.securityManager.getUserRoles(userId);
            const contextPermissions = await this.securityManager.getContextPermissions(contextId);
            // 检查操作权限
            return this.securityManager.hasPermission(userRoles, contextPermissions, operation);
        }
        catch (error) {
            this.logger.error('Failed to check permission policy', error, { contextId, userId, operation });
            return false;
        }
    }
    /**
     * 分析访问模式
     */
    async analyzeAccessPatterns(_contextId) {
        // 简化实现，实际应该基于历史访问数据分析
        return { anomalies: [] };
    }
    /**
     * 检查数据完整性
     */
    async checkDataIntegrity(_context) {
        // 简化实现，实际应该检查数据完整性
        return { issues: [] };
    }
    /**
     * 评估威胁
     */
    async assessThreats(contextId) {
        const threats = await this.threatDetector.scan(contextId);
        return { threats };
    }
    /**
     * 计算安全分数
     */
    calculateSecurityScore(assessments) {
        // 基于各项安全评估计算综合安全分数
        let score = 100;
        // 根据发现的问题扣分
        score -= assessments.accessPatterns.anomalies.length * 5;
        score -= assessments.dataIntegrity.issues.length * 10;
        score -= (assessments.complianceStatus?.violations.length || 0) * 15;
        score -= (assessments.threatAssessment?.threats.length || 0) * 20;
        return Math.max(0, score);
    }
    /**
     * 转换为安全发现
     */
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
    /**
     * 生成安全建议
     */
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
    /**
     * 验证安全策略
     */
    async validateSecurityPolicy(policy) {
        if (!policy.id || !policy.name || !policy.type) {
            throw new Error('Invalid security policy: missing required fields');
        }
        if (!policy.rules || policy.rules.length === 0) {
            throw new Error('Invalid security policy: no rules defined');
        }
    }
    /**
     * 计算风险等级
     */
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
    /**
     * 生成威胁缓解建议
     */
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
    /**
     * 映射合规状态
     */
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
//# sourceMappingURL=context-security.service.js.map