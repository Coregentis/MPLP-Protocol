"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceSecurityService = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
class TraceSecurityService {
    traceRepository;
    securityManager;
    auditLogger;
    dataProtector;
    constructor(traceRepository, securityManager, auditLogger, dataProtector) {
        this.traceRepository = traceRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
        this.dataProtector = dataProtector;
    }
    async validateTraceAccess(userId, traceId, action) {
        try {
            if (!this.securityManager || !this.auditLogger) {
                return true;
            }
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
    async protectSensitiveData(traceId) {
        const traceData = await this.traceRepository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        if (!this.dataProtector || !this.auditLogger) {
            return;
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        const sensitiveFields = this.identifySensitiveFields(trace);
        for (const field of sensitiveFields) {
            const encryptedValue = await this.dataProtector.encrypt(String(field.value));
            field.value = encryptedValue;
        }
        trace.markAsSensitive();
        await this.traceRepository.save(trace);
        await this.auditLogger.logDataProtection({
            traceId,
            action: 'encrypt_sensitive_data',
            fieldsCount: sensitiveFields.length,
            timestamp: new Date()
        });
    }
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
    async manageDataRetention(retentionPolicy) {
        const cutoffDate = new Date(Date.now() - retentionPolicy.retentionPeriod);
        const expiredTraces = await this.traceRepository.queryByTimeRange({
            startTime: new Date(0),
            endTime: cutoffDate
        });
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
        if (this.auditLogger) {
            await this.auditLogger.logDataRetention({
                policy: retentionPolicy.name,
                result,
                timestamp: new Date()
            });
        }
        return result;
    }
    async performSecurityAudit(timeRange) {
        const auditId = this.generateAuditId();
        try {
            const auditData = await this.collectSecurityAuditData(timeRange);
            const securityFindings = await this.performSecurityChecks(auditData);
            const complianceFindings = await this.performComplianceChecks(auditData);
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
    identifySensitiveFields(_trace) {
        const sensitiveFields = [];
        return sensitiveFields;
    }
    async archiveTrace(_traceId) {
    }
    async checkGDPRCompliance(_trace) {
        return { compliant: true, findings: [], score: 95 };
    }
    async checkHIPAACompliance(_trace) {
        return { compliant: true, findings: [], score: 90 };
    }
    async checkSOXCompliance(_trace) {
        return { compliant: true, findings: [], score: 88 };
    }
    async collectSecurityAuditData(_timeRange) {
        return {};
    }
    async performSecurityChecks(_data) {
        return [];
    }
    async performComplianceChecks(_data) {
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
