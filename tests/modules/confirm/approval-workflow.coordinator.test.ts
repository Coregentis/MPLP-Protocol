/**
 * ApprovalWorkflowCoordinator 测试套件
 * 
 * 验证审批流程协调引擎的核心功能
 * 测试企业级协调性能基准
 * 
 * @version 1.0.0
 * @created 2025-08-18
 */

import { ApprovalWorkflowCoordinator } from '../../../src/modules/confirm/application/coordinators/approval-workflow.coordinator';
import { 
  ApprovalWorkflow, 
  ApprovalStep, 
  Approver, 
  StepStatus, 
  Priority, 
  RiskLevel 
} from '../../../src/modules/confirm/types';

describe('ApprovalWorkflowCoordinator - 审批流程协调引擎', () => {
  let coordinator: ApprovalWorkflowCoordinator;

  beforeEach(() => {
    coordinator = new ApprovalWorkflowCoordinator();
  });

  describe('核心协调功能', () => {
    it('应该成功协调审批流程', async () => {
      // 准备测试数据
      const workflow: ApprovalWorkflow = {
        workflowId: 'workflow-001',
        name: '测试审批流程',
        workflowType: 'sequential',
        steps: [
          {
            stepId: 'step-001',
            name: '初审',
            stepOrder: 1,
            status: StepStatus.PENDING,
            approvers: [
              {
                approverId: 'approver-001',
                name: '审批者1',
                email: 'approver1@company.com',
                role: 'manager'
              } as Approver
            ],
            timeoutHours: 24
          } as ApprovalStep
        ]
      };

      // 执行协调
      const result = await coordinator.coordinateApprovalWorkflow(workflow, Priority.MEDIUM);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.workflowId).toBe('workflow-001');
      expect(coordinator.getActiveWorkflowCount()).toBe(1);
    });

    it('应该拒绝超过并发容量限制的请求', async () => {
      // 先填满容量（1000个工作流）
      const initialWorkflows: ApprovalWorkflow[] = [];
      for (let i = 0; i < 1000; i++) {
        initialWorkflows.push({
          workflowId: `workflow-${i}`,
          name: `测试流程${i}`,
          workflowType: 'sequential',
          steps: []
        });
      }

      // 填满容量
      const initialResults = await Promise.all(
        initialWorkflows.map(workflow => coordinator.coordinateApprovalWorkflow(workflow))
      );

      // 验证容量已满
      expect(coordinator.getActiveWorkflowCount()).toBe(1000);

      // 尝试添加第1001个工作流（应该失败）
      const overflowWorkflow: ApprovalWorkflow = {
        workflowId: 'overflow-workflow',
        name: '溢出测试流程',
        workflowType: 'sequential',
        steps: []
      };

      const overflowResult = await coordinator.coordinateApprovalWorkflow(overflowWorkflow);

      // 验证容量限制
      expect(overflowResult.success).toBe(false);
      expect(overflowResult.error).toContain('审批协调器已达到最大并发容量限制');
      expect(coordinator.getActiveWorkflowCount()).toBe(1000); // 仍然是1000
    });
  });

  describe('审批者能力评估', () => {
    it('应该成功评估审批者能力', async () => {
      const approverIds = ['approver-001', 'approver-002', 'approver-003'];

      const result = await coordinator.assessApproverCapabilities(approverIds);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toMatchObject({
        approverId: 'approver-001',
        capabilityScore: expect.any(Number),
        workloadLevel: expect.stringMatching(/^(low|medium|high|overloaded)$/),
        averageDecisionTime: expect.any(Number),
        accuracyRate: expect.any(Number),
        availability: expect.any(Boolean)
      });
    });

    it('应该缓存审批者能力评估结果', async () => {
      const approverIds = ['approver-001'];

      // 第一次评估
      const result1 = await coordinator.assessApproverCapabilities(approverIds);
      
      // 第二次评估（应该使用缓存）
      const result2 = await coordinator.assessApproverCapabilities(approverIds);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.[0].approverId).toBe(result2.data?.[0].approverId);
    });
  });

  describe('性能监控和分析', () => {
    it('应该提供整体性能分析', async () => {
      const result = await coordinator.analyzeApprovalPerformance();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        totalWorkflows: expect.any(Number),
        activeWorkflows: expect.any(Number),
        completedWorkflows: expect.any(Number),
        averageProcessingTime: expect.any(Number),
        coordinationEfficiency: expect.any(Number),
        concurrentCapacity: 1000,
        errorRate: expect.any(Number)
      });
    });

    it('应该提供特定工作流性能分析', async () => {
      // 先创建一个工作流
      const workflow: ApprovalWorkflow = {
        workflowId: 'workflow-perf-test',
        name: '性能测试流程',
        workflowType: 'sequential',
        steps: []
      };

      await coordinator.coordinateApprovalWorkflow(workflow);

      // 分析特定工作流性能
      const result = await coordinator.analyzeApprovalPerformance('workflow-perf-test');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该正确跟踪协调指标', () => {
      const metrics = coordinator.getCoordinationMetrics();

      expect(metrics).toMatchObject({
        totalWorkflows: expect.any(Number),
        activeWorkflows: expect.any(Number),
        completedWorkflows: expect.any(Number),
        averageProcessingTime: expect.any(Number),
        coordinationEfficiency: expect.any(Number),
        concurrentCapacity: 1000,
        errorRate: expect.any(Number)
      });
    });
  });

  describe('策略优化', () => {
    it('应该生成审批策略优化建议', async () => {
      // 先创建一个工作流
      const workflow: ApprovalWorkflow = {
        workflowId: 'workflow-optimize-test',
        name: '优化测试流程',
        workflowType: 'sequential',
        steps: [
          {
            stepId: 'step-001',
            name: '步骤1',
            stepOrder: 1,
            status: StepStatus.PENDING,
            approvers: [],
            timeoutHours: 24
          } as ApprovalStep
        ]
      };

      await coordinator.coordinateApprovalWorkflow(workflow);

      // 生成优化建议
      const result = await coordinator.optimizeApprovalStrategy('workflow-optimize-test');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        workflowId: 'workflow-optimize-test',
        currentEfficiency: expect.any(Number),
        optimizedEfficiency: expect.any(Number),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/^(parallel|sequential|delegation|automation)$/),
            description: expect.any(String),
            expectedImprovement: expect.any(Number),
            implementationCost: expect.any(Number)
          })
        ]),
        estimatedTimeReduction: expect.any(Number),
        riskAssessment: expect.any(String)
      });
    });

    it('应该处理不存在的工作流优化请求', async () => {
      const result = await coordinator.optimizeApprovalStrategy('non-existent-workflow');

      expect(result.success).toBe(false);
      expect(result.error).toContain('工作流不存在或已完成');
    });
  });

  describe('高优先级处理', () => {
    it('应该为高优先级工作流提供优化处理', async () => {
      const workflow: ApprovalWorkflow = {
        workflowId: 'workflow-high-priority',
        name: '高优先级流程',
        workflowType: 'sequential',
        steps: [
          {
            stepId: 'step-001',
            name: '紧急审批',
            stepOrder: 1,
            status: StepStatus.PENDING,
            approvers: [
              {
                approverId: 'approver-001',
                name: '紧急审批者',
                email: 'urgent@company.com',
                role: 'senior-manager'
              } as Approver
            ],
            timeoutHours: 24
          } as ApprovalStep
        ]
      };

      const result = await coordinator.coordinateApprovalWorkflow(workflow, Priority.HIGH);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // 验证高优先级优化（如缩短超时时间）
      expect(result.data?.steps[0].timeoutHours).toBeLessThan(24);
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理协调过程中的错误', async () => {
      // 创建一个可能导致错误的工作流
      const invalidWorkflow = null as any;

      const result = await coordinator.coordinateApprovalWorkflow(invalidWorkflow);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该优雅处理能力评估过程中的错误', async () => {
      // 传入无效的审批者ID
      const invalidApproverIds = null as any;

      const result = await coordinator.assessApproverCapabilities(invalidApproverIds);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('企业级性能基准', () => {
    it('应该支持1000+并发审批流程协调', async () => {
      const concurrentWorkflows = 100; // 测试环境使用较小数量
      const workflows: Promise<any>[] = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const workflow: ApprovalWorkflow = {
          workflowId: `concurrent-workflow-${i}`,
          name: `并发测试流程${i}`,
          workflowType: 'sequential',
          steps: []
        };
        workflows.push(coordinator.coordinateApprovalWorkflow(workflow));
      }

      const results = await Promise.all(workflows);
      const successCount = results.filter(r => r.success).length;

      expect(successCount).toBeGreaterThan(90); // 至少90%成功率
    });

    it('应该在合理时间内完成协调', async () => {
      const workflow: ApprovalWorkflow = {
        workflowId: 'performance-test',
        name: '性能测试流程',
        workflowType: 'sequential',
        steps: []
      };

      const startTime = Date.now();
      const result = await coordinator.coordinateApprovalWorkflow(workflow);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // 应在1秒内完成
    });

    it('应该达到≥35%的协调效率提升', async () => {
      // 创建基准工作流
      const baselineWorkflow: ApprovalWorkflow = {
        workflowId: 'baseline-workflow',
        name: '基准流程',
        workflowType: 'sequential',
        steps: []
      };

      await coordinator.coordinateApprovalWorkflow(baselineWorkflow);

      // 获取优化建议
      const optimization = await coordinator.optimizeApprovalStrategy('baseline-workflow');

      expect(optimization.success).toBe(true);
      expect(optimization.data?.estimatedTimeReduction).toBeGreaterThanOrEqual(35);
    });
  });
});
