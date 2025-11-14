"use strict";
/**
 * MPLP Confirm Module - Security Service
 * @description 企业级审批工作流安全服务 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmSecurityService
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmSecurityService = void 0;
const crypto_1 = require("crypto");
/**
 * 确认安全服务
 * 基于重构指南第386-629行实现，严格遵循Schema驱动开发
 */
class ConfirmSecurityService {
    constructor(confirmRepository, securityManager, auditLogger) {
        this.confirmRepository = confirmRepository;
        this.securityManager = securityManager;
        this.auditLogger = auditLogger;
    }
    /**
     * 验证审批权限 - 基于Schema approval_workflow.steps.approver结构
     * @param userId 用户ID
     * @param confirmId 确认ID
     * @param action 操作类型
     * @returns 权限验证结果
     */
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
        // 检查用户是否在审批工作流中
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
        // 验证系统级权限
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
        // 记录成功的权限验证
        await this.auditLogger.logApprovalAction(confirmId, userId, action, 'permission_validated');
        return {
            isValid: true,
            userId,
            permissions: [action],
            violations: [],
            recommendations: []
        };
    }
    /**
     * 执行安全审计 - 基于Schema audit_trail结构
     * @param confirmId 确认ID
     * @returns 安全审计条目数组
     */
    async performSecurityAudit(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const auditEntries = [];
        // 审计审批工作流中的每个步骤
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
        // 检查可疑活动
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
    /**
     * 检查合规性 - 基于Schema risk_assessment结构
     * @param confirmId 确认ID
     * @returns 合规检查结果
     */
    async checkCompliance(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const complianceResult = await this.securityManager.checkCompliance(confirmId);
        // 记录合规检查
        await this.auditLogger.logApprovalAction(confirmId, 'system', 'compliance_check', complianceResult.isCompliant ? 'compliant' : 'non_compliant');
        return complianceResult;
    }
    /**
     * 监控可疑活动 - 基于Schema approval_workflow结构
     * @param confirmId 确认ID
     * @returns 可疑活动检测结果数组
     */
    async monitorSuspiciousActivity(confirmId) {
        const confirmRequest = await this.confirmRepository.findById(confirmId);
        if (!confirmRequest) {
            throw new Error(`Confirm request ${confirmId} not found`);
        }
        const suspiciousActivities = await this.securityManager.detectSuspiciousActivity(confirmId);
        // 记录可疑活动监控
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
    /**
     * 获取安全审计跟踪 - 基于Schema audit_trail结构
     * @param confirmId 确认ID
     * @returns 安全审计条目数组
     */
    async getSecurityAuditTrail(confirmId) {
        return await this.auditLogger.getAuditTrail(confirmId);
    }
    /**
     * 生成审计ID
     * @returns 审计ID
     */
    generateAuditId() {
        return `audit-${Date.now()}-${(0, crypto_1.randomBytes)(6).toString('hex')}`; // CWE-330 修复
    }
    /**
     * 评估操作风险级别 - 基于Schema risk_assessment.overall_risk_level
     * @param outcome 决策结果
     * @param requestRiskLevel 请求风险级别
     * @returns 风险级别
     */
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
//# sourceMappingURL=confirm-security.service.js.map