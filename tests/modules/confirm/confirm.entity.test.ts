/**
 * Confirm实体测试
 * 
 * @description 测试Confirm领域实体的核心功能和业务逻辑
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import {
  UUID,
  DecisionOutcome
} from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

describe('ConfirmEntity测试', () => {
  let confirmEntity: ConfirmEntity;
  let mockConfirmData: any;

  beforeEach(() => {
    mockConfirmData = createMockConfirmEntityData();

    // 修复auditTrail为数组结构，符合Entity定义
    mockConfirmData.auditTrail = [{
      eventId: 'event-001' as UUID,
      timestamp: new Date('2025-08-26T10:00:00Z'),
      userId: 'user-001' as UUID,
      action: 'created',
      details: 'Confirm request created',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Test Browser'
    }];

    confirmEntity = new ConfirmEntity(mockConfirmData);
  });

  describe('构造函数测试', () => {
    it('应该正确创建Confirm实体', () => {
      expect(confirmEntity).toBeInstanceOf(ConfirmEntity);
      expect(confirmEntity.confirmId).toBe('confirm-test-001');
      expect(confirmEntity.contextId).toBe('context-test-001');
      expect(confirmEntity.confirmationType).toBe('approval');
      expect(confirmEntity.status).toBe('pending');
      expect(confirmEntity.priority).toBe('high');
    });

    it('应该正确设置请求者信息', () => {
      expect(confirmEntity.requester.userId).toBe('user-001');
      expect(confirmEntity.requester.role).toBe('developer');
      expect(confirmEntity.requester.requestReason).toBe('Deploy to production environment');
    });

    it('应该正确设置主题信息', () => {
      expect(confirmEntity.subject.title).toBe('Production Deployment Approval');
      expect(confirmEntity.subject.description).toContain('version 1.2.0');
      expect(confirmEntity.subject.impactAssessment.scope).toBe('project');
      expect(confirmEntity.subject.impactAssessment.affectedSystems).toContain('api-gateway');
    });

    it('应该正确设置风险评估', () => {
      expect(confirmEntity.riskAssessment.overallRiskLevel).toBe('medium');
      expect(confirmEntity.riskAssessment.riskFactors).toHaveLength(1);
      expect(confirmEntity.riskAssessment.riskFactors[0].factor).toBe('Database Migration');
    });
  });

  describe('业务逻辑方法测试', () => {
    it('应该能够添加审批记录', () => {
      const approval = {
        approvalId: 'approval-001' as UUID,
        approverId: 'approver-001' as UUID,
        decision: 'approved' as DecisionOutcome,
        comments: 'Looks good to deploy',
        timestamp: new Date(),
        stepId: 'step-001' as UUID
      };

      confirmEntity.addApproval(approval);
      expect(confirmEntity.approvals).toHaveLength(1);
      expect(confirmEntity.approvals[0].decision).toBe('approved');
    });

    it('应该能够更新状态', () => {
      confirmEntity.updateStatus('approved');
      expect(confirmEntity.status).toBe('approved');
      expect(confirmEntity.timestamp).toBeInstanceOf(Date);
    });

    it('应该能够添加审计记录', () => {
      const auditEvent = {
        eventId: 'event-002' as UUID,
        timestamp: new Date(),
        userId: 'user-002' as UUID,
        action: 'approved',
        details: 'Request approved by tech lead',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 Test Browser'
      };

      confirmEntity.addAuditEvent(auditEvent);
      expect(confirmEntity.auditTrail).toHaveLength(2);
      expect(confirmEntity.auditTrail[1].action).toBe('approved');
    });
  });

  describe('验证方法测试', () => {
    it('应该验证必需字段', () => {
      expect(() => {
        new ConfirmEntity({
          ...mockConfirmData,
          confirmId: undefined
        });
      }).toThrow();
    });

    it('应该验证状态转换', () => {
      confirmEntity.updateStatus('approved');
      expect(() => {
        confirmEntity.updateStatus('pending');
      }).toThrow('Invalid status transition');
    });

    it('应该验证优先级设置', () => {
      expect(['low', 'medium', 'high', 'critical']).toContain(confirmEntity.priority);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空的审批列表', () => {
      expect(confirmEntity.approvals).toEqual([]);
      expect(confirmEntity.getCurrentApprovalCount()).toBe(0);
    });

    it('应该处理空的附件列表', () => {
      const entityWithoutAttachments = new ConfirmEntity({
        ...mockConfirmData,
        subject: {
          ...mockConfirmData.subject,
          attachments: undefined
        }
      });
      expect(entityWithoutAttachments.subject.attachments).toBeUndefined();
    });

    it('应该处理最大字符串长度', () => {
      const longDescription = 'x'.repeat(10000);
      expect(() => {
        new ConfirmEntity({
          ...mockConfirmData,
          subject: {
            ...mockConfirmData.subject,
            description: longDescription
          }
        });
      }).not.toThrow();
    });
  });
});
