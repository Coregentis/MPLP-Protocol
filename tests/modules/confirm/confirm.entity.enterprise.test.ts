/**
 * Confirm实体企业级功能测试
 * 
 * 测试新增的企业级功能方法：
 * - 增强业务逻辑验证
 * - 智能审批路由
 * - 风险控制和缓解
 * - 性能监控和分析
 * - 审批策略优化
 * 
 * @version 1.0.0
 * @created 2025-08-18
 */

import { Confirm } from '../../../src/modules/confirm/domain/entities/confirm.entity';
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
  Approver
} from '../../../src/modules/confirm/types';
import { ConfirmEntityData } from '../../../src/modules/confirm/api/mappers/confirm.mapper';

describe('Confirm Entity - 企业级功能测试', () => {

  // 辅助函数：创建完整的测试数据
  const createEnterpriseTestData = (overrides: Partial<ConfirmEntityData> = {}): ConfirmEntityData => {
    const baseData: ConfirmEntityData = {
      confirmId: 'confirm-001',
      contextId: 'context-001',
      planId: 'plan-001',
      protocolVersion: '1.0.0',
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      status: ConfirmStatus.PENDING,
      priority: Priority.HIGH,
      subject: {
        title: '企业级系统升级确认',
        description: '升级核心业务系统到最新版本',
        impactAssessment: {
          scope: 'enterprise',
          businessImpact: '系统升级将影响所有业务流程',
          technicalImpact: '需要停机维护2小时',
          riskLevel: 'high',
          impactScope: ['core-system', 'user-interface', 'database'],
          estimatedCost: 50000
        } as ImpactAssessment
      } as ConfirmSubject,
      requester: {
        userId: 'user-001',
        name: '张三',
        email: 'zhangsan@company.com',
        role: 'system-admin'
      } as Requester,
      approvalWorkflow: {
        workflowId: 'workflow-001',
        name: '企业级审批流程',
        workflowType: 'sequential',
        steps: [
          {
            stepId: 'step-001',
            name: '技术审查',
            stepOrder: 1,
            status: StepStatus.PENDING,
            approvers: [
              {
                approverId: 'approver-001',
                name: '李四',
                email: 'lisi@company.com',
                role: 'tech-lead'
              } as Approver,
              {
                approverId: 'approver-003',
                name: '赵六',
                email: 'zhaoliu@company.com',
                role: 'senior-tech-lead'
              } as Approver
            ],
            timeoutHours: 24,
            startedAt: new Date().toISOString()
          } as ApprovalStep,
          {
            stepId: 'step-002',
            name: '业务审查',
            stepOrder: 2,
            status: StepStatus.PENDING,
            approvers: [
              {
                approverId: 'approver-002',
                name: '王五',
                email: 'wangwu@company.com',
                role: 'business-manager'
              } as Approver
            ],
            timeoutHours: 48
          } as ApprovalStep
        ]
      } as ApprovalWorkflow,
      createdAt: new Date(),
      updatedAt: new Date(),
      timestamp: new Date(), // 添加timestamp字段
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12小时后过期（符合URGENT优先级限制）
      metadata: {
        source: 'enterprise-system',
        tags: ['critical', 'system-upgrade'],
        customFields: {
          department: 'IT',
          budget: '50000'
        }
      }
    };

    return { ...baseData, ...overrides };
  };

  describe('增强业务逻辑验证', () => {
    it('应该验证高优先级确认的严格要求', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.URGENT
      });

      expect(() => new Confirm(testData)).not.toThrow();
    });

    it('应该拒绝缺少影响评估的高优先级确认', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.URGENT,
        subject: {
          title: '紧急确认',
          description: '紧急业务确认',
          // 缺少 impactAssessment
        } as ConfirmSubject
      });

      expect(() => new Confirm(testData)).toThrow('影响评估信息是必需的');
    });

    it('应该验证邮箱格式', () => {
      const testData = createEnterpriseTestData({
        requester: {
          userId: 'user-001',
          name: '张三',
          email: 'invalid-email', // 无效邮箱
          role: 'admin'
        } as Requester
      });

      expect(() => new Confirm(testData)).toThrow('请求者邮箱格式无效');
    });

    it('应该验证审批工作流步骤', () => {
      const testData = createEnterpriseTestData({
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '测试流程',
          steps: [] // 空步骤数组
        } as ApprovalWorkflow
      });

      expect(() => new Confirm(testData)).toThrow('审批工作流必须包含至少一个步骤');
    });

    it('应该验证风险级别', () => {
      const testData = createEnterpriseTestData({
        subject: {
          title: '测试确认',
          description: '测试描述',
          impactAssessment: {
            scope: 'project',
            businessImpact: '业务影响',
            technicalImpact: '技术影响',
            riskLevel: 'invalid-risk-level' as unknown, // 无效风险级别（故意测试验证）
            impactScope: ['system1'],
            estimatedCost: 1000
          } as ImpactAssessment
        } as ConfirmSubject
      });

      expect(() => new Confirm(testData)).toThrow('风险级别必须是以下之一: low, medium, high, critical');
    });
  });

  describe('智能审批路由', () => {
    it('应该为高风险确认推荐更多审批者', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.URGENT,
        subject: {
          title: '高风险确认',
          description: '高风险业务确认',
          impactAssessment: {
            scope: 'enterprise',
            businessImpact: '重大业务影响',
            technicalImpact: '重大技术影响',
            riskLevel: 'critical',
            impactScope: ['core-system'],
            estimatedCost: 100000
          } as ImpactAssessment
        } as ConfirmSubject,
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '高风险审批流程',
          workflowType: 'sequential',
          steps: [
            {
              stepId: 'step-001',
              name: '技术审查',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [
                {
                  approverId: 'approver-001',
                  name: '技术主管',
                  email: 'tech-lead@company.com',
                  role: 'tech-lead'
                } as Approver,
                {
                  approverId: 'approver-002',
                  name: '安全专家',
                  email: 'security@company.com',
                  role: 'security-officer'
                } as Approver
              ],
              timeoutHours: 4
            } as ApprovalStep
          ]
        } as ApprovalWorkflow,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12小时后过期
      });

      const confirm = new Confirm(testData);
      const routing = confirm.intelligentApprovalRouting();

      expect(routing.recommendedApprovers).toContain('senior-manager');
      expect(routing.recommendedApprovers).toContain('security-officer');
      expect(routing.recommendedApprovers).toContain('compliance-officer');
      expect(routing.estimatedCompletionTime).toBe(4); // 4小时
      expect(routing.riskMitigationSteps).toContain('立即通知相关利益相关者');
    });

    it('应该为低风险确认推荐简化流程', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.LOW,
        subject: {
          title: '低风险确认',
          description: '低风险业务确认',
          impactAssessment: {
            scope: 'project',
            businessImpact: '轻微业务影响',
            technicalImpact: '轻微技术影响',
            riskLevel: 'low',
            impactScope: ['test-system'],
            estimatedCost: 1000
          } as ImpactAssessment
        } as ConfirmSubject
      });

      const confirm = new Confirm(testData);
      const routing = confirm.intelligentApprovalRouting();

      expect(routing.recommendedApprovers).toEqual(['peer-reviewer']);
      expect(routing.estimatedCompletionTime).toBe(48); // 48小时
      expect(routing.riskMitigationSteps).toEqual(['标准代码审查']);
    });
  });

  describe('风险控制和缓解', () => {
    it('应该为关键风险提供详细的缓解措施', () => {
      const testData = createEnterpriseTestData({
        subject: {
          title: '关键系统变更',
          description: '关键系统变更确认',
          impactAssessment: {
            scope: 'enterprise',
            businessImpact: '关键业务影响',
            technicalImpact: '关键技术影响',
            riskLevel: 'critical',
            impactScope: ['core-system'],
            estimatedCost: 200000
          } as ImpactAssessment
        } as ConfirmSubject
      });

      const confirm = new Confirm(testData);
      const mitigation = confirm.performRiskMitigation();

      expect(mitigation.mitigationActions).toContain('实施蓝绿部署');
      expect(mitigation.mitigationActions).toContain('设置实时监控');
      expect(mitigation.monitoringRequirements).toContain('实时性能监控');
      expect(mitigation.rollbackPlan).toBe('立即回滚机制，5分钟内完成');
    });

    it('应该为低风险提供标准缓解措施', () => {
      const testData = createEnterpriseTestData({
        subject: {
          title: '低风险变更',
          description: '低风险变更确认',
          impactAssessment: {
            scope: 'project',
            businessImpact: '轻微影响',
            technicalImpact: '轻微影响',
            riskLevel: 'low',
            impactScope: ['test-system'],
            estimatedCost: 1000
          } as ImpactAssessment
        } as ConfirmSubject
      });

      const confirm = new Confirm(testData);
      const mitigation = confirm.performRiskMitigation();

      expect(mitigation.mitigationActions).toEqual(['标准部署流程']);
      expect(mitigation.monitoringRequirements).toEqual(['基础监控']);
      expect(mitigation.rollbackPlan).toBe('标准回滚流程，1小时内完成');
    });
  });

  describe('性能监控和分析', () => {
    it('应该计算审批时间指标', () => {
      const testData = createEnterpriseTestData({
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前创建
      });

      const confirm = new Confirm(testData);
      const analysis = confirm.performanceAnalysis();

      expect(analysis.approvalTimeMetrics.averageApprovalTime).toBeGreaterThan(1.5);
      expect(analysis.approvalTimeMetrics.averageApprovalTime).toBeLessThan(2.5);
      expect(typeof analysis.approvalTimeMetrics.efficiencyScore).toBe('number');
      expect(analysis.approvalTimeMetrics.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(analysis.approvalTimeMetrics.efficiencyScore).toBeLessThanOrEqual(100);
    });

    it('应该识别瓶颈步骤', () => {
      const pastTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25小时前
      const testData = createEnterpriseTestData({
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '测试流程',
          workflowType: 'sequential',
          steps: [
            {
              stepId: 'step-001',
              name: '超时步骤',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [
                {
                  approverId: 'approver-001',
                  name: '审批者1',
                  email: 'approver1@company.com',
                  role: 'manager'
                } as Approver,
                {
                  approverId: 'approver-002',
                  name: '审批者2',
                  email: 'approver2@company.com',
                  role: 'senior-manager'
                } as Approver
              ],
              timeoutHours: 24,
              startedAt: pastTime.toISOString() // 已超时
            } as ApprovalStep
          ]
        } as ApprovalWorkflow,
        priority: Priority.MEDIUM // 改为MEDIUM优先级，避免高优先级验证
      });

      const confirm = new Confirm(testData);
      const analysis = confirm.performanceAnalysis();

      expect(analysis.approvalTimeMetrics.bottleneckSteps).toContain('超时步骤');
    });

    it('应该提供工作流优化建议', () => {
      const testData = createEnterpriseTestData({
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10小时前创建
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '复杂流程',
          workflowType: 'sequential',
          steps: [
            {
              stepId: 'step-001',
              name: '步骤1',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a1', name: 'A1', email: 'a1@test.com', role: 'manager' } as Approver]
            },
            {
              stepId: 'step-002',
              name: '步骤2',
              stepOrder: 2,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a2', name: 'A2', email: 'a2@test.com', role: 'manager' } as Approver]
            },
            {
              stepId: 'step-003',
              name: '步骤3',
              stepOrder: 3,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a3', name: 'A3', email: 'a3@test.com', role: 'manager' } as Approver]
            },
            {
              stepId: 'step-004',
              name: '步骤4',
              stepOrder: 4,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a4', name: 'A4', email: 'a4@test.com', role: 'manager' } as Approver]
            }
          ] as ApprovalStep[]
        } as ApprovalWorkflow
      });

      const confirm = new Confirm(testData);
      const analysis = confirm.performanceAnalysis();

      expect(analysis.workflowOptimization.automationOpportunities).toContain('自动化低风险审批');
      expect(analysis.workflowOptimization.automationOpportunities).toContain('智能路由');
    });
  });

  describe('审批策略优化', () => {
    it('应该为低风险确认推荐减少步骤', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.LOW,
        subject: {
          title: '低风险确认',
          description: '低风险业务确认',
          impactAssessment: {
            scope: 'project',
            businessImpact: '轻微影响',
            technicalImpact: '轻微影响',
            riskLevel: 'low',
            impactScope: ['test-system'],
            estimatedCost: 1000
          } as ImpactAssessment
        } as ConfirmSubject,
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '标准流程',
          workflowType: 'sequential',
          steps: [
            {
              stepId: 'step-001',
              name: '步骤1',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a1', name: 'A1', email: 'a1@test.com', role: 'manager' } as Approver]
            },
            {
              stepId: 'step-002',
              name: '步骤2',
              stepOrder: 2,
              status: StepStatus.PENDING,
              approvers: [{ approverId: 'a2', name: 'A2', email: 'a2@test.com', role: 'manager' } as Approver]
            }
          ] as ApprovalStep[]
        } as ApprovalWorkflow
      });

      const confirm = new Confirm(testData);
      const optimization = confirm.optimizeApprovalStrategy();

      expect(optimization.optimizedWorkflow.recommendedSteps).toBe(1); // 减少到1步
      expect(optimization.optimizedWorkflow.automationCandidates).toContain('初步审查');
      expect(optimization.costBenefitAnalysis.timeSavings).toBeGreaterThan(0);
    });

    it('应该为高风险确认推荐增加步骤', () => {
      const testData = createEnterpriseTestData({
        priority: Priority.URGENT,
        subject: {
          title: '高风险确认',
          description: '高风险业务确认',
          impactAssessment: {
            scope: 'enterprise',
            businessImpact: '重大影响',
            technicalImpact: '重大影响',
            riskLevel: 'high',
            impactScope: ['core-system'],
            estimatedCost: 100000
          } as ImpactAssessment
        } as ConfirmSubject,
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '标准流程',
          workflowType: 'sequential',
          steps: [
            {
              stepId: 'step-001',
              name: '步骤1',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [
                { approverId: 'a1', name: 'A1', email: 'a1@test.com', role: 'manager' } as Approver,
                { approverId: 'a2', name: 'A2', email: 'a2@test.com', role: 'senior-manager' } as Approver
              ]
            }
          ] as ApprovalStep[]
        } as ApprovalWorkflow
      });

      const confirm = new Confirm(testData);
      const optimization = confirm.optimizeApprovalStrategy();

      expect(optimization.optimizedWorkflow.recommendedSteps).toBe(2); // 增加到2步
      expect(optimization.costBenefitAnalysis.currentCost).toBe(2); // 1步 * 2小时
      expect(optimization.costBenefitAnalysis.optimizedCost).toBe(3); // 2步 * 1.5小时
    });

    it('应该识别可并行化的步骤', () => {
      const testData = createEnterpriseTestData({
        approvalWorkflow: {
          workflowId: 'workflow-001',
          name: '并行流程',
          workflowType: 'parallel',
          steps: [
            {
              stepId: 'step-001',
              name: '多审批者步骤',
              stepOrder: 1,
              status: StepStatus.PENDING,
              approvers: [
                { approverId: 'a1', name: 'A1', email: 'a1@test.com', role: 'manager' } as Approver,
                { approverId: 'a2', name: 'A2', email: 'a2@test.com', role: 'manager' } as Approver
              ]
            } as ApprovalStep
          ]
        } as ApprovalWorkflow
      });

      const confirm = new Confirm(testData);
      const optimization = confirm.optimizeApprovalStrategy();

      expect(optimization.optimizedWorkflow.parallelizableSteps).toContain('多审批者步骤');
    });
  });

  describe('Schema映射集成测试', () => {
    it('应该正确转换为Schema格式', () => {
      const testData = createEnterpriseTestData();
      const confirm = new Confirm(testData);

      const schema = confirm.toSchema();

      expect(schema.confirm_id).toBe(testData.confirmId);
      expect(schema.context_id).toBe(testData.contextId);
      expect(schema.plan_id).toBe(testData.planId);
      expect(schema.confirmation_type).toBe(testData.confirmationType);
      expect(schema.status).toBe(testData.status);
      expect(schema.priority).toBe(testData.priority);
    });

    it('应该正确从Schema格式创建实体', () => {
      const testData = createEnterpriseTestData();
      const originalConfirm = new Confirm(testData);
      const schema = originalConfirm.toSchema();

      const recreatedConfirm = Confirm.fromSchema(schema);

      expect(recreatedConfirm.confirmId).toBe(originalConfirm.confirmId);
      expect(recreatedConfirm.contextId).toBe(originalConfirm.contextId);
      expect(recreatedConfirm.planId).toBe(originalConfirm.planId);
      expect(recreatedConfirm.status).toBe(originalConfirm.status);
      expect(recreatedConfirm.priority).toBe(originalConfirm.priority);
    });

    it('应该支持批量Schema转换', () => {
      const testData1 = createEnterpriseTestData({ confirmId: 'confirm-001' });
      const testData2 = createEnterpriseTestData({ confirmId: 'confirm-002' });

      const confirm1 = new Confirm(testData1);
      const confirm2 = new Confirm(testData2);

      const schemas = [confirm1.toSchema(), confirm2.toSchema()];
      const recreatedConfirms = Confirm.fromSchemaArray(schemas);

      expect(recreatedConfirms).toHaveLength(2);
      expect(recreatedConfirms[0].confirmId).toBe('confirm-001');
      expect(recreatedConfirms[1].confirmId).toBe('confirm-002');
    });
  });
});
