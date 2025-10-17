"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmSecurityService = void 0;
class ConfirmSecurityService {
    confirmRepository;
    securityManager;
    auditLogger;
    constructor(confirmRepository, securityManager, auditLogger) {
        this.confirmRepository = confirmRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
    }
    async validateApprovalPermissions(userId, confirmId, action) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            return {
                isValid: false,
                userId,
                permissions: [],
                violations: [`Confirm request ${confirmId} not found`],
                recommendations: ['Verify the confirm request ID']
            };
        }
        const userInWorkflow = confirmRequest.approvalWorkflow.steps.some(step => step.approver.userId === userId);
        if (!userInWorkflow) {
            await this.auditLogger.logSecurityViolation({
                auditId: this.generateAuditId(),
                confirmId,
                userId,
                action,
                timestamp: new Date(),
                result: 'failure',
                details: 'User not authorized for this approval workflow',
                riskLevel: 'medium'
            });
            return {
                isValid: false,
                userId,
                permissions: [],
                violations: ['User not authorized for this approval workflow'],
                recommendations: ['Contact administrator for proper authorization']
            };
        }
        const hasSystemPermission = await this.securityManager.validateUserPermissions(userId, action, confirmId);
        if (!hasSystemPermission) {
            return {
                isValid: false,
                userId,
                permissions: [],
                violations: ['Insufficient system permissions'],
                recommendations: ['Request appropriate permissions from administrator']
            };
        }
        await this.auditLogger.logApprovalAction(confirmId, userId, action, 'permission_validated');
        return {
            isValid: true,
            userId,
            permissions: [action],
            violations: [],
            recommendations: []
        };
    }
    async performSecurityAudit(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const auditEntries = [];
        for (const step of confirmRequest.approvalWorkflow.steps) {
            if (step.decision) {
                const auditEntry = {
                    auditId: this.generateAuditId(),
                    confirmId,
                    userId: step.approver.userId,
                    action: `approval_${step.decision.outcome}`,
                    timestamp: step.decision.timestamp,
                    result: step.decision.outcome === 'approve' ? 'success' : 'warning',
                    details: `${step.decision.outcome} decision by ${step.approver.role}`,
                    riskLevel: this.assessActionRiskLevel(step.decision.outcome, confirmRequest.riskAssessment.overallRiskLevel)
                };
                auditEntries.push(auditEntry);
                await this.auditLogger.logSecurityEvent(auditEntry);
            }
        }
        const suspiciousActivities = await this.securityManager.detectSuspiciousActivity(confirmId);
        for (const activity of suspiciousActivities) {
            const auditEntry = {
                auditId: this.generateAuditId(),
                confirmId,
                userId: activity.userId,
                action: 'suspicious_activity_detected',
                timestamp: activity.timestamp,
                result: 'warning',
                details: activity.description,
                riskLevel: activity.severity
            };
            auditEntries.push(auditEntry);
            await this.auditLogger.logSecurityEvent(auditEntry);
        }
        return auditEntries;
    }
    async checkCompliance(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const complianceResult = await this.securityManager.checkCompliance(confirmId);
        await this.auditLogger.logApprovalAction(confirmId, 'system', 'compliance_check', complianceResult.isCompliant ? 'compliant' : 'non_compliant');
        return complianceResult;
    }
    async monitorSuspiciousActivity(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const suspiciousActivities = await this.securityManager.detectSuspiciousActivity(confirmId);
        for (const activity of suspiciousActivities) {
            await this.auditLogger.logSecurityViolation({
                auditId: this.generateAuditId(),
                confirmId,
                userId: activity.userId,
                action: 'suspicious_activity_monitoring',
                timestamp: activity.timestamp,
                result: 'warning',
                details: `Detected ${activity.activityType}: ${activity.description}`,
                riskLevel: activity.severity
            });
        }
        return suspiciousActivities;
    }
    async getSecurityAuditTrail(confirmId) {
        return await this.auditLogger.getAuditTrail(confirmId);
    }
    generateAuditId() {
        return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    assessActionRiskLevel(outcome, requestRiskLevel) {
        if (requestRiskLevel === 'critical') {
            return outcome === 'approve' ? 'high' : 'medium';
        }
        if (requestRiskLevel === 'high') {
            return outcome === 'approve' ? 'medium' : 'low';
        }
        return 'low';
    }
}
exports.ConfirmSecurityService = ConfirmSecurityService;
