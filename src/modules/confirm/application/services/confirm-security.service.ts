/**
 * MPLP Confirm Module - Security Service
 * @description 企业级审批工作流安全服务 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmSecurityService
 */

import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { UUID } from '../../types';

// ===== 基于Schema的安全接口定义 =====

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
  complianceScore: number; // 0-100
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
  riskScore: number; // 0-100
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
export class ConfirmSecurityService {
  constructor(
    private readonly confirmRepository: IConfirmRepository,
    private readonly securityManager: ISecurityManager,
    private readonly auditLogger: IAuditLogger
  ) {}

  /**
   * 验证审批权限 - 基于Schema approval_workflow.steps.approver结构
   * @param userId 用户ID
   * @param confirmId 确认ID
   * @param action 操作类型
   * @returns 权限验证结果
   */
  async validateApprovalPermissions(userId: string, confirmId: UUID, action: string): Promise<PermissionValidationResult> {
    const confirmRequest: ConfirmEntity | null = await this.confirmRepository.findById(confirmId);
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
    const userInWorkflow = confirmRequest.approvalWorkflow.steps.some(
      step => step.approver.userId === userId
    );

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
  async performSecurityAudit(confirmId: UUID): Promise<SecurityAuditEntry[]> {
    const confirmRequest: ConfirmEntity | null = await this.confirmRepository.findById(confirmId);
    if (!confirmRequest) {
      throw new Error(`Confirm request ${confirmId} not found`);
    }

    const auditEntries: SecurityAuditEntry[] = [];

    // 审计审批工作流中的每个步骤
    for (const step of confirmRequest.approvalWorkflow.steps) {
      if (step.decision) {
        const auditEntry: SecurityAuditEntry = {
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
      const auditEntry: SecurityAuditEntry = {
        auditId: this.generateAuditId(),
        confirmId,
        userId: activity.userId,
        action: 'suspicious_activity_detected',
        timestamp: activity.timestamp,
        result: 'warning',
        details: activity.description,
        riskLevel: activity.severity as 'low' | 'medium' | 'high' | 'critical'
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
  async checkCompliance(confirmId: UUID): Promise<ComplianceCheckResult> {
    const confirmRequest: ConfirmEntity | null = await this.confirmRepository.findById(confirmId);
    if (!confirmRequest) {
      throw new Error(`Confirm request ${confirmId} not found`);
    }

    const complianceResult = await this.securityManager.checkCompliance(confirmId);
    
    // 记录合规检查
    await this.auditLogger.logApprovalAction(
      confirmId, 
      'system', 
      'compliance_check', 
      complianceResult.isCompliant ? 'compliant' : 'non_compliant'
    );

    return complianceResult;
  }

  /**
   * 监控可疑活动 - 基于Schema approval_workflow结构
   * @param confirmId 确认ID
   * @returns 可疑活动检测结果数组
   */
  async monitorSuspiciousActivity(confirmId: UUID): Promise<SuspiciousActivityResult[]> {
    const confirmRequest: ConfirmEntity | null = await this.confirmRepository.findById(confirmId);
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
        riskLevel: activity.severity as 'low' | 'medium' | 'high' | 'critical'
      });
    }

    return suspiciousActivities;
  }

  /**
   * 获取安全审计跟踪 - 基于Schema audit_trail结构
   * @param confirmId 确认ID
   * @returns 安全审计条目数组
   */
  async getSecurityAuditTrail(confirmId: UUID): Promise<SecurityAuditEntry[]> {
    return await this.auditLogger.getAuditTrail(confirmId);
  }

  /**
   * 生成审计ID
   * @returns 审计ID
   */
  private generateAuditId(): UUID {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as UUID;
  }

  /**
   * 评估操作风险级别 - 基于Schema risk_assessment.overall_risk_level
   * @param outcome 决策结果
   * @param requestRiskLevel 请求风险级别
   * @returns 风险级别
   */
  private assessActionRiskLevel(outcome: string, requestRiskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    if (requestRiskLevel === 'critical') {
      return outcome === 'approve' ? 'high' : 'medium';
    }
    
    if (requestRiskLevel === 'high') {
      return outcome === 'approve' ? 'medium' : 'low';
    }
    
    return 'low';
  }
}
