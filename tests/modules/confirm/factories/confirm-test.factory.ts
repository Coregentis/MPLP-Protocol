/**
 * Confirm模块测试数据工厂
 * 基于MPLP统一测试标准v1.0
 * 
 * @description 提供标准化的Confirm测试数据生成
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ConfirmEntity } from '../../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmationType, ConfirmationStatus, Priority, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel } from '../../../../src/modules/confirm/types';
import { UUID } from '../../../../src/shared/types';

export class ConfirmTestFactory {
  /**
   * 创建标准Confirm实体用于测试
   */
  static createConfirmEntity(overrides: Partial<any> = {}): ConfirmEntity {
    const defaultData = {
      // 基础协议字段
      protocolVersion: '1.0.0',
      timestamp: new Date('2025-01-01T00:00:00Z'),
      confirmId: 'confirm-test-001' as UUID,
      contextId: 'ctx-test-001' as UUID,
      planId: 'plan-test-001' as UUID,
      
      // 业务核心字段
      confirmationType: 'approval' as ConfirmationType,
      status: 'pending' as ConfirmationStatus,
      priority: 'medium' as Priority,
      
      // 请求者信息
      requester: {
        userId: 'user-test-001',
        role: 'developer',
        department: 'engineering',
        requestReason: 'Test approval request'
      },
      
      // 审批工作流
      approvalWorkflow: {
        workflowType: 'sequential' as WorkflowType,
        steps: [{
          stepId: 'step-001' as UUID,
          stepName: 'Initial Review',
          approvers: ['approver-001'],
          requiredApprovals: 1,
          status: 'pending' as StepStatus,
          timeoutHours: 24,
          escalationRules: []
        }],
        currentStepIndex: 0,
        autoApprovalRules: [],
        escalationPolicy: {
          enabled: true,
          timeoutHours: 48,
          escalationChain: ['manager-001']
        }
      },
      
      // 确认主题 (必需字段)
      subject: {
        title: 'Test Confirmation Request',
        description: 'Test confirmation request for unit testing',
        impactAssessment: {
          scope: 'project' as const,
          affectedSystems: ['test-system'],
          affectedUsers: ['test-user'],
          businessImpact: 'low' as const,
          technicalImpact: 'low' as const
        }
      },
      
      // 风险评估
      riskAssessment: {
        overallRiskLevel: 'low' as RiskLevel,
        riskFactors: [{
          factor: 'Technical Risk',
          description: 'Low technical complexity',
          probability: 0.1,
          impact: 'low' as ImpactLevel,
          mitigation: 'Comprehensive testing'
        }],
        complianceRequirements: []
      },
      
      // 审批记录
      approvals: [],
      
      // 审计追踪
      auditTrail: [{
        eventId: 'audit-001' as UUID,
        timestamp: new Date('2025-01-01T00:00:00Z'),
        userId: 'user-test-001' as UUID,
        action: 'request_created',
        details: 'Confirmation request created',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      }],
      
      // 通知配置
      notifications: {
        enabled: true,
        channels: ['email'],
        recipients: {
          onSubmission: ['requester'],
          onApproval: ['requester', 'approvers'],
          onRejection: ['requester'],
          onEscalation: ['managers']
        },
        templates: {
          submission: 'default_submission',
          approval: 'default_approval',
          rejection: 'default_rejection'
        }
      },
      
      // 企业级功能字段
      performanceMetrics: {},
      monitoringIntegration: {},
      versionHistory: {},
      searchMetadata: {},
      eventIntegration: {},
      auditSettings: {
        enabled: true,
        retentionDays: 90
      }
    };

    return new ConfirmEntity({ ...defaultData, ...overrides });
  }

  /**
   * 创建Confirm Schema格式数据 (snake_case)
   */
  static createConfirmSchema(overrides: Partial<any> = {}) {
    const defaultSchema = {
      protocol_version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      confirm_id: 'confirm-test-001',
      context_id: 'ctx-test-001',
      plan_id: 'plan-test-001',
      confirmation_type: 'approval',
      status: 'pending',
      priority: 'medium',
      requester: {
        user_id: 'user-test-001',
        role: 'developer',
        department: 'engineering',
        request_reason: 'Test approval request'
      },
      approval_workflow: {
        workflow_type: 'sequential',
        steps: [{
          step_id: 'step-001',
          step_name: 'Initial Review',
          approvers: ['approver-001'],
          required_approvals: 1,
          status: 'pending',
          timeout_hours: 24,
          escalation_rules: []
        }],
        current_step_index: 0
      },
      audit_trail: [{
        event_id: 'audit-001',
        timestamp: '2025-01-01T00:00:00.000Z',
        user_id: 'user-test-001',
        action: 'request_created',
        details: 'Confirmation request created',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent'
      }]
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建批量Confirm实体数组
   */
  static createConfirmEntityArray(count: number = 3): ConfirmEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createConfirmEntity({
        confirmId: `confirm-test-${String(index + 1).padStart(3, '0')}` as UUID,
        contextId: `ctx-test-${String(index + 1).padStart(3, '0')}` as UUID,
        subject: {
          title: `Test Confirmation Request ${index + 1}`,
          description: `Test confirmation request ${index + 1} for unit testing`,
          impactAssessment: {
            scope: 'project' as const,
            businessImpact: 'low' as const,
            technicalImpact: 'low' as const
          }
        }
      })
    );
  }

  /**
   * 创建性能测试用的大量数据
   */
  static createPerformanceTestData(count: number = 1000): ConfirmEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createConfirmEntity({
        confirmId: `confirm-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        contextId: `ctx-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        subject: {
          title: `Performance Test Confirmation ${index + 1}`,
          description: `Performance test confirmation ${index + 1}`,
          impactAssessment: {
            scope: 'project' as const,
            businessImpact: 'low' as const,
            technicalImpact: 'low' as const
          }
        }
      })
    );
  }

  /**
   * 创建边界条件测试数据
   */
  static createBoundaryTestData() {
    return {
      minimalConfirm: this.createConfirmEntity({
        subject: {
          title: 'Min',
          description: 'Minimal request',
          impactAssessment: {
            scope: 'task' as const,
            businessImpact: 'low' as const,
            technicalImpact: 'low' as const
          }
        }
      }),
      maximalConfirm: this.createConfirmEntity({
        subject: {
          title: 'A'.repeat(255),
          description: 'X'.repeat(1000),
          impactAssessment: {
            scope: 'organization' as const,
            affectedSystems: Array.from({ length: 10 }, (_, i) => `system-${i}`),
            affectedUsers: Array.from({ length: 100 }, (_, i) => `user-${i}`),
            businessImpact: 'high' as const,
            technicalImpact: 'high' as const
          }
        }
      })
    };
  }
}
