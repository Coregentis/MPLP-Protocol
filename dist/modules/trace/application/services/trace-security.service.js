"use strict";
/**
 * 追踪安全服务
 *
 * @description 提供追踪安全和合规功能，包括访问控制、数据保护、审计合规
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 基于统一架构标准的企业级服务实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceSecurityService = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
/**
 * 追踪安全服务
 *
 * @description 追踪安全和合规服务，职责：访问控制、数据保护、审计合规
 */
class TraceSecurityService {
    constructor(traceRepository, securityManager, auditLogger, dataProtector) {
        this.traceRepository = traceRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
        this.dataProtector = dataProtector;
    }
    /**
     * 验证追踪访问权限
     */
    async validateTraceAccess(userId, traceId, action) {
        try {
            if (!this.securityManager || !this.auditLogger) {
                // 如果没有安全管理器，默认允许访问（开发模式）
                return true;
            }
            // 1. 基本权限检查
            const hasPermission = await this.securityManager.validatePermission(userId, `trace:${traceId}`, action);
            if (!hasPermission) {
                await this.auditLogger.logAccessDenied({
                    userId,
                    resource: `trace:${traceId}`,
                    action,
                    timestamp: new Date()
                });
                return false;
            }
            // 2. 数据敏感性检查
            const trace = await this.traceRepository.findById(traceId);
            if (trace && trace.containsSensitiveData) {
                const hasSensitiveDataAccess = await this.securityManager.validatePermission(userId, 'trace:sensitive_data', 'read');
                if (!hasSensitiveDataAccess) {
                    await this.auditLogger.logAccessDenied({
                        userId,
                        resource: `trace:${traceId}`,
                        action,
                        reason: 'Insufficient permission for sensitive data',
                        timestamp: new Date()
                    });
                    return false;
                }
            }
            // 3. 记录访问成功
            await this.auditLogger.logAccessGranted({
                userId,
                resource: `trace:${traceId}`,
                action,
                timestamp: new Date()
            });
            return true;
        }
        catch (error) {
            if (this.auditLogger) {
                await this.auditLogger.logError({
                    userId,
                    resource: `trace:${traceId}`,
                    action,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date()
                });
            }
            return false;
        }
    }
    /**
     * 保护敏感数据
     */
    async protectSensitiveData(traceId) {
        const traceData = await this.traceRepository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        if (!this.dataProtector || !this.auditLogger) {
            // 如果没有数据保护器，跳过保护（开发模式）
            return;
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        // 1. 识别敏感数据
        const sensitiveFields = this.identifySensitiveFields(trace);
        // 2. 加密敏感数据
        for (const field of sensitiveFields) {
            const encryptedValue = await this.dataProtector.encrypt(String(field.value));
            field.value = encryptedValue;
        }
        // 3. 标记为包含敏感数据
        trace.markAsSensitive();
        // 4. 更新追踪
        await this.traceRepository.save(trace);
        // 5. 记录数据保护操作
        await this.auditLogger.logDataProtection({
            traceId,
            action: 'encrypt_sensitive_data',
            fieldsCount: sensitiveFields.length,
            timestamp: new Date()
        });
    }
    /**
     * 执行合规检查
     */
    async performComplianceCheck(traceId, standard) {
        const traceData = await this.traceRepository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        switch (standard) {
            case 'GDPR':
                return await this.checkGDPRCompliance(trace);
            case 'HIPAA':
                return await this.checkHIPAACompliance(trace);
            case 'SOX':
                return await this.checkSOXCompliance(trace);
            default:
                throw new Error(`Unsupported compliance standard: ${standard}`);
        }
    }
    /**
     * 数据保留管理
     */
    async manageDataRetention(retentionPolicy) {
        const cutoffDate = new Date(Date.now() - retentionPolicy.retentionPeriod);
        // 1. 查找过期追踪
        const expiredTraces = await this.traceRepository.queryByTimeRange({
            startTime: new Date(0),
            endTime: cutoffDate
        });
        // 2. 处理过期数据
        const result = {
            totalProcessed: expiredTraces.length,
            archived: 0,
            deleted: 0,
            errors: []
        };
        for (const trace of expiredTraces) {
            try {
                if (retentionPolicy.archiveBeforeDelete) {
                    await this.archiveTrace(trace.traceId);
                    result.archived++;
                }
                await this.traceRepository.delete(trace.traceId);
                result.deleted++;
            }
            catch (error) {
                result.errors.push({
                    traceId: trace.traceId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        // 3. 记录数据保留操作
        if (this.auditLogger) {
            await this.auditLogger.logDataRetention({
                policy: retentionPolicy.name,
                result,
                timestamp: new Date()
            });
        }
        return result;
    }
    /**
     * 安全审计
     */
    async performSecurityAudit(timeRange) {
        const auditId = this.generateAuditId();
        try {
            // 1. 收集审计数据
            const auditData = await this.collectSecurityAuditData(timeRange);
            // 2. 执行安全检查
            const securityFindings = await this.performSecurityChecks(auditData);
            // 3. 执行合规检查
            const complianceFindings = await this.performComplianceChecks(auditData);
            // 4. 生成审计结果
            const auditResult = {
                auditId,
                timeRange,
                startTime: new Date(),
                endTime: new Date(),
                securityFindings,
                complianceFindings,
                overallScore: this.calculateSecurityScore(securityFindings, complianceFindings),
                recommendations: this.generateSecurityRecommendations(securityFindings, complianceFindings)
            };
            return auditResult;
        }
        catch (error) {
            throw new Error(`Security audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===== 私有辅助方法 =====
    identifySensitiveFields(_trace) {
        const sensitiveFields = [];
        // 识别敏感数据字段 - 简化实现
        // 例如：个人信息、密码、令牌等
        return sensitiveFields;
    }
    async archiveTrace(_traceId) {
        // 归档追踪数据 - 简化实现
    }
    async checkGDPRCompliance(_trace) {
        // GDPR合规检查 - 简化实现
        return { compliant: true, findings: [], score: 95 };
    }
    async checkHIPAACompliance(_trace) {
        // HIPAA合规检查 - 简化实现
        return { compliant: true, findings: [], score: 90 };
    }
    async checkSOXCompliance(_trace) {
        // SOX合规检查 - 简化实现
        return { compliant: true, findings: [], score: 88 };
    }
    async collectSecurityAuditData(_timeRange) {
        // 收集安全审计数据 - 简化实现
        return {};
    }
    async performSecurityChecks(_data) {
        // 执行安全检查 - 简化实现
        return [];
    }
    async performComplianceChecks(_data) {
        // 执行合规检查 - 简化实现
        return [];
    }
    calculateSecurityScore(securityFindings, complianceFindings) {
        return Math.max(0, 100 - securityFindings.length * 10 - complianceFindings.length * 15);
    }
    generateSecurityRecommendations(securityFindings, complianceFindings) {
        const recommendations = [];
        if (securityFindings.length > 0) {
            recommendations.push('Address identified security findings');
        }
        if (complianceFindings.length > 0) {
            recommendations.push('Resolve compliance violations');
        }
        return recommendations;
    }
    generateAuditId() {
        return `trace-audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.TraceSecurityService = TraceSecurityService;
//# sourceMappingURL=trace-security.service.js.map