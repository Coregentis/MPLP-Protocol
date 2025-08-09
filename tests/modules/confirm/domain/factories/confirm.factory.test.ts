/**
 * Confirm工厂单元测试
 * 
 * 基于系统性链式批判性思维方法论和实际源代码功能构建测试
 * 严格遵循TypeScript类型安全，零any类型使用
 * 通过测试发现源代码问题并修复，达到协议级质量标准
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { ConfirmFactory, CreateConfirmRequest } from '../../../../../src/modules/confirm/domain/factories/confirm.factory';
import { Confirm } from '../../../../../src/modules/confirm/domain/entities/confirm.entity';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  ConfirmSubject,
  Requester,
  ApprovalWorkflow,
  ApprovalStep,
  StepStatus,
  ImpactAssessment,
  ConfirmMetadata,
  ConfirmProtocol
} from '../../../../../src/modules/confirm/types';
import { UUID } from '../../../../../src/public/shared/types';

describe('ConfirmFactory - 协议级测试', () => {
  describe('create - 确认实体创建', () => {
    // 测试数据工厂
    const createValidRequest = (): CreateConfirmRequest => ({
      contextId: 'context-12345',
      planId: 'plan-67890',
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      priority: 'medium',
      subject: {
        title: '项目计划审批',
        description: '需要对项目计划进行审批确认',
        impactAssessment: {
          scope: 'project',
          businessImpact: 'medium',
          technicalImpact: 'low',
          riskLevel: 'low',
          affectedSystems: ['system1', 'system2'],
          estimatedEffort: 'medium'
        } as ImpactAssessment
      } as ConfirmSubject,
      requester: {
        userId: 'user-12345',
        role: 'project_manager',
        requestReason: '项目进入下一阶段需要管理层确认',
        department: 'engineering',
        contactInfo: {
          email: 'pm@example.com',
          phone: '+86-138-0000-0000'
        }
      } as Requester,
      approvalWorkflow: {
        workflowId: 'workflow-123',
        name: '项目审批流程',
        description: '标准项目审批流程',
        steps: [
          {
            stepId: 'step-1',
            name: '技术负责人审批',
            stepOrder: 1,
            approverRole: 'tech_lead',
            isRequired: true,
            timeoutHours: 24,
            escalationRule: {
              enabled: true,
              escalateToRole: 'engineering_manager',
              escalateAfterHours: 48
            }
          } as ApprovalStep,
          {
            stepId: 'step-2',
            name: '项目经理审批',
            stepOrder: 2,
            approverRole: 'project_manager',
            isRequired: true,
            timeoutHours: 48,
            escalationRule: {
              enabled: true,
              escalateToRole: 'director',
              escalateAfterHours: 72
            }
          } as ApprovalStep
        ],
        parallelExecution: false,
        autoApprovalRules: []
      } as ApprovalWorkflow,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后过期
      metadata: {
        source: 'project_management_system',
        tags: ['project', 'approval', 'milestone'],
        customFields: {
          projectId: 'proj-123',
          milestone: 'phase-1-completion'
        }
      } as ConfirmMetadata
    });

    it('应该成功创建确认实体', () => {
      const request = createValidRequest();
      
      const confirm = ConfirmFactory.create(request);

      // 验证基本属性
      expect(confirm).toBeInstanceOf(Confirm);
      expect(confirm.confirmId).toBeDefined();
      expect(confirm.confirmId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(confirm.contextId).toBe(request.contextId);
      expect(confirm.planId).toBe(request.planId);
      expect(confirm.confirmationType).toBe(request.confirmationType);
      expect(confirm.status).toBe(ConfirmStatus.PENDING);
      expect(confirm.priority).toBe(request.priority);
      expect(confirm.subject).toEqual(request.subject);
      expect(confirm.requester).toEqual(request.requester);
      expect(confirm.approvalWorkflow).toEqual(request.approvalWorkflow);
      expect(confirm.expiresAt).toBe(request.expiresAt);
      expect(confirm.metadata).toEqual(request.metadata);
    });

    it('应该设置正确的协议版本', () => {
      const request = createValidRequest();
      const confirm = ConfirmFactory.create(request);

      expect(confirm.protocolVersion).toBe('1.0.0');
    });

    it('应该设置正确的时间戳', () => {
      const beforeCreate = Date.now();
      const request = createValidRequest();
      const confirm = ConfirmFactory.create(request);
      const afterCreate = Date.now();

      expect(confirm.createdAt).toBeDefined();
      expect(confirm.updatedAt).toBeDefined();

      const createdTime = new Date(confirm.createdAt).getTime();
      expect(createdTime).toBeGreaterThanOrEqual(beforeCreate);
      expect(createdTime).toBeLessThanOrEqual(afterCreate);
      expect(confirm.updatedAt).toBe(confirm.createdAt);
    });

    it('应该处理可选字段为undefined', () => {
      const request: CreateConfirmRequest = {
        contextId: 'context-12345',
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: 'medium',
        subject: {
          title: '测试确认',
          description: '测试描述',
          impactAssessment: {} as ImpactAssessment
        },
        requester: {
          userId: 'user-123',
          role: 'manager',
          requestReason: '测试原因'
        },
        approvalWorkflow: {
          workflowId: 'workflow-123',
          name: '测试工作流',
          description: '测试',
          steps: [{
            stepId: 'step-1',
            name: '步骤1',
            stepOrder: 1,
            approverRole: 'manager',
            isRequired: true,
            timeoutHours: 24
          } as ApprovalStep],
          parallelExecution: false,
          autoApprovalRules: []
        }
        // planId, expiresAt, metadata 为 undefined
      };

      const confirm = ConfirmFactory.create(request);

      expect(confirm.planId).toBeUndefined();
      expect(confirm.expiresAt).toBeUndefined();
      expect(confirm.metadata).toBeUndefined();
      expect(confirm.decision).toBeUndefined();
    });

    it('应该生成唯一的确认ID', () => {
      const request = createValidRequest();
      const confirm1 = ConfirmFactory.create(request);
      const confirm2 = ConfirmFactory.create(request);

      expect(confirm1.confirmId).not.toBe(confirm2.confirmId);
    });
  });

  describe('createPlanApproval - 计划审批创建', () => {
    it('应该创建计划审批确认', () => {
      const contextId = 'context-123';
      const planId = 'plan-456';
      const subject: ConfirmSubject = {
        title: '计划审批',
        description: '需要审批项目计划',
        impactAssessment: {
          scope: 'project',
          businessImpact: 'medium',
          technicalImpact: 'low',
          riskLevel: 'low',
          impactScope: ['system1'],
          estimatedCost: 1000
        } as ImpactAssessment
      };
      const requester: Requester = {
        userId: 'user-123',
        name: '测试用户',
        role: 'manager',
        email: 'test@example.com',
        requestReason: '项目需要审批'
      };

      const confirm = ConfirmFactory.createPlanApproval(
        contextId,
        planId,
        subject,
        requester,
        Priority.MEDIUM
      );

      expect(confirm.confirmationType).toBe(ConfirmationType.PLAN_APPROVAL);
      expect(confirm.priority).toBe(Priority.MEDIUM);
      expect(confirm.contextId).toBe(contextId);
      expect(confirm.planId).toBe(planId);
    });
  });

  describe('createEmergencyApproval - 紧急审批创建', () => {
    it('应该创建紧急审批确认', () => {
      const contextId = 'context-123';
      const subject: ConfirmSubject = {
        title: '紧急审批',
        description: '需要紧急处理的审批',
        impactAssessment: {
          scope: 'system',
          businessImpact: 'high',
          technicalImpact: 'high',
          riskLevel: 'high',
          impactScope: ['system1', 'system2'],
          estimatedCost: 5000
        } as ImpactAssessment
      };
      const requester: Requester = {
        userId: 'user-123',
        name: '测试用户',
        role: 'manager',
        email: 'test@example.com',
        requestReason: '紧急情况需要处理'
      };

      const confirm = ConfirmFactory.createEmergencyApproval(
        contextId,
        subject,
        requester
      );

      expect(confirm.confirmationType).toBe(ConfirmationType.EMERGENCY_APPROVAL);
      expect(confirm.priority).toBe(Priority.HIGH);
      expect(confirm.contextId).toBe(contextId);
    });
  });

  describe('validateCreateRequest - 请求验证', () => {
    it('应该验证有效的创建请求', () => {
      const request: CreateConfirmRequest = {
        contextId: 'context-123',
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: 'medium',
        subject: {
          title: '测试确认',
          description: '测试描述',
          impactAssessment: {} as ImpactAssessment
        },
        requester: {
          userId: 'user-123',
          role: 'manager',
          requestReason: '测试原因'
        },
        approvalWorkflow: {
          workflowId: 'workflow-123',
          name: '测试工作流',
          description: '测试',
          steps: [{
            stepId: 'step-1',
            name: '步骤1',
            stepOrder: 1,
            approverRole: 'manager',
            isRequired: true,
            timeoutHours: 24
          } as ApprovalStep],
          parallelExecution: false,
          autoApprovalRules: []
        }
      };

      const result = ConfirmFactory.validateCreateRequest(request);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝缺少上下文ID的请求', () => {
      const request = {
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: 'medium',
        subject: { title: '测试', description: '测试' },
        requester: { userId: 'user-123', role: 'manager', requestReason: '测试' },
        approvalWorkflow: { steps: [{}] }
      } as CreateConfirmRequest;

      const result = ConfirmFactory.validateCreateRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('上下文ID不能为空');
    });

    it('应该拒绝缺少主题标题的请求', () => {
      const request = {
        contextId: 'context-123',
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: 'medium',
        subject: { description: '测试' }, // 缺少title
        requester: { userId: 'user-123', role: 'manager', requestReason: '测试' },
        approvalWorkflow: { steps: [{}] }
      } as CreateConfirmRequest;

      const result = ConfirmFactory.validateCreateRequest(request);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('确认主题标题不能为空');
    });
  });

  describe('fromProtocol - 协议数据重建', () => {
    it('应该从协议数据重建确认实体', () => {
      const protocol: ConfirmProtocol = {
        confirmId: 'confirm-123',
        contextId: 'context-456',
        protocolVersion: '1.0.0',
        confirmationType: 'plan_approval',
        status: 'pending',
        priority: 'medium',
        subject: {
          title: '测试确认',
          description: '测试描述',
          impactAssessment: {
            scope: 'project',
            businessImpact: 'medium',
            technicalImpact: 'low',
            riskLevel: 'low',
            impactScope: ['system1'],
            estimatedCost: 1000
          }
        },
        requester: {
          userId: 'user-123',
          name: '测试用户',
          role: 'manager',
          email: 'test@example.com',
          requestReason: '测试原因'
        },
        approvalWorkflow: {
          workflowId: 'workflow-123',
          name: '测试工作流',
          description: '测试',
          steps: [{
            stepId: 'step-1',
            name: '测试步骤',
            stepOrder: 1,
            approverRole: 'manager',
            isRequired: true,
            timeoutHours: 24,
            status: StepStatus.PENDING
          }],
          parallelExecution: false,
          autoApprovalRules: [{
            enabled: false,
            conditions: []
          }]
        },
        createdAt: '2025-08-08T10:00:00Z',
        updatedAt: '2025-08-08T10:00:00Z'
      };

      const confirm = ConfirmFactory.fromProtocol(protocol);

      expect(confirm.confirmId).toBe(protocol.confirmId);
      expect(confirm.contextId).toBe(protocol.contextId);
      expect(confirm.protocolVersion).toBe(protocol.protocolVersion);
      expect(confirm.confirmationType).toBe(protocol.confirmationType);
      expect(confirm.status).toBe(protocol.status);
      expect(confirm.priority).toBe(protocol.priority);
      expect(confirm.createdAt).toBe(protocol.createdAt);
      expect(confirm.updatedAt).toBe(protocol.updatedAt);
    });
  });
});
