/**
 * MPLP Confirm Module - Security Service
 * @description 企业级审批工作流安全服务 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmSecurityService
 */
import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { UUID } from '../../types';
/**
 * 权限验证结果接口
 */
export interface PermissionValidationResult {
    isValid: boolean;
    userId: string;
    permissions: string[];
    violations: string[];
    recommendations: string[];
}
/**
 * 安全审计条目接口 - 基于Schema audit_trail结构
 */
export interface SecurityAuditEntry {
    auditId: UUID;
    confirmId: UUID;
    userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    result: 'success' | 'failure' | 'warning';
    details: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * 合规检查结果接口
 */
export interface ComplianceCheckResult {
    confirmId: UUID;
    isCompliant: boolean;
    regulations: Array<{
        name: string;
        status: 'compliant' | 'non-compliant' | 'warning';
        details: string;
    }>;
    violations: string[];
    recommendations: string[];
    complianceScore: number;
}
/**
 * 可疑活动检测结果接口
 */
export interface SuspiciousActivityResult {
    confirmId: UUID;
    activityType: 'unusual_approval_pattern' | 'rapid_decisions' | 'off_hours_activity' | 'privilege_escalation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: Date;
    userId: string;
    riskScore: number;
    recommendedActions: string[];
}
/**
 * 安全管理器接口
 */
export interface ISecurityManager {
    validateUserPermissions(userId: string, action: string, resourceId: UUID): Promise<boolean>;
    logSecurityEvent(event: SecurityAuditEntry): Promise<void>;
    checkCompliance(confirmId: UUID): Promise<ComplianceCheckResult>;
    detectSuspiciousActivity(confirmId: UUID): Promise<SuspiciousActivityResult[]>;
}
/**
 * 审计日志记录器接口
 */
export interface IAuditLogger {
    logApprovalAction(confirmId: UUID, userId: string, action: string, result: string): Promise<void>;
    logAccessAttempt(userId: string, resourceId: UUID, success: boolean): Promise<void>;
    logSecurityViolation(violation: SecurityAuditEntry): Promise<void>;
    logSecurityEvent(event: SecurityAuditEntry): Promise<void>;
    getAuditTrail(confirmId: UUID): Promise<SecurityAuditEntry[]>;
}
/**
 * 确认安全服务
 * 基于重构指南第386-629行实现，严格遵循Schema驱动开发
 */
export declare class ConfirmSecurityService {
    private readonly confirmRepository;
    private readonly securityManager;
    private readonly auditLogger;
    constructor(confirmRepository: IConfirmRepository, securityManager: ISecurityManager, auditLogger: IAuditLogger);
    /**
     * 验证审批权限 - 基于Schema approval_workflow.steps.approver结构
     * @param userId 用户ID
     * @param confirmId 确认ID
     * @param action 操作类型
     * @returns 权限验证结果
     */
    validateApprovalPermissions(userId: string, confirmId: UUID, action: string): Promise<PermissionValidationResult>;
    /**
     * 执行安全审计 - 基于Schema audit_trail结构
     * @param confirmId 确认ID
     * @returns 安全审计条目数组
     */
    performSecurityAudit(confirmId: UUID): Promise<SecurityAuditEntry[]>;
    /**
     * 检查合规性 - 基于Schema risk_assessment结构
     * @param confirmId 确认ID
     * @returns 合规检查结果
     */
    checkCompliance(confirmId: UUID): Promise<ComplianceCheckResult>;
    /**
     * 监控可疑活动 - 基于Schema approval_workflow结构
     * @param confirmId 确认ID
     * @returns 可疑活动检测结果数组
     */
    monitorSuspiciousActivity(confirmId: UUID): Promise<SuspiciousActivityResult[]>;
    /**
     * 获取安全审计跟踪 - 基于Schema audit_trail结构
     * @param confirmId 确认ID
     * @returns 安全审计条目数组
     */
    getSecurityAuditTrail(confirmId: UUID): Promise<SecurityAuditEntry[]>;
    /**
     * 生成审计ID
     * @returns 审计ID
     */
    private generateAuditId;
    /**
     * 评估操作风险级别 - 基于Schema risk_assessment.overall_risk_level
     * @param outcome 决策结果
     * @param requestRiskLevel 请求风险级别
     * @returns 风险级别
     */
    private assessActionRiskLevel;
}
//# sourceMappingURL=confirm-security.service.d.ts.map