# Confirm模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/confirm/testing-guide.md) | [中文](testing-guide.md)



**多智能体协议生命周期平台 - Confirm模块测试指南 v1.0.0-alpha**

[![测试](https://img.shields.io/badge/testing-Enterprise%20Validated-green.svg)](./README.md)
[![覆盖率](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![工作流](https://img.shields.io/badge/workflow-Tested-blue.svg)](./performance-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/confirm/testing-guide.md)

---

## 🎯 测试概览

本综合测试指南提供测试Confirm模块企业工作流引擎、审批系统、决策支持功能和合规机制的策略、模式和示例。涵盖关键任务审批系统的测试方法论。

### **测试范围**
- **工作流引擎测试**: BPMN工作流执行和状态管理
- **审批系统测试**: 多级审批链和路由逻辑
- **决策支持测试**: AI推荐和风险评估验证
- **共识测试**: 多方协议和投票机制
- **集成测试**: 跨模块工作流集成测试
- **合规测试**: 监管合规和审计跟踪验证

---

## 🧪 工作流引擎测试策略

### **工作流执行单元测试**

#### **工作流服务测试**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseWorkflowService } from '../services/enterprise-workflow.service';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { ApprovalRouter } from '../routers/approval.router';
import { NotificationService } from '../services/notification.service';
import { AuditLogger } from '../loggers/audit.logger';

describe('EnterpriseWorkflowService', () => {
  let service: EnterpriseWorkflowService;
  let workflowRepository: jest.Mocked<WorkflowRepository>;
  let approvalRouter: jest.Mocked<ApprovalRouter>;
  let notificationService: jest.Mocked<NotificationService>;
  let auditLogger: jest.Mocked<AuditLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseWorkflowService,
        {
          provide: WorkflowRepository,
          useValue: {
            createApprovalRequest: jest.fn(),
            findApprovalRequest: jest.fn(),
            findMatchingWorkflows: jest.fn(),
            getWorkflowStep: jest.fn(),
            findStepDecision: jest.fn()
          }
        },
        {
          provide: ApprovalRouter,
          useValue: {
            routeApproval: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: {
            sendInitialNotifications: jest.fn(),
            sendDecisionNotifications: jest.fn()
          }
        },
        {
          provide: AuditLogger,
          useValue: {
            logApprovalRequestCreated: jest.fn(),
            logApprovalDecision: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<EnterpriseWorkflowService>(EnterpriseWorkflowService);
    workflowRepository = module.get(WorkflowRepository);
    approvalRouter = module.get(ApprovalRouter);
    notificationService = module.get(NotificationService);
    auditLogger = module.get(AuditLogger);
  });

  describe('createApprovalRequest', () => {
    it('应该使用有效工作流创建审批请求', async () => {
      // 准备
      const request: CreateApprovalRequest = {
        requestType: 'budget_approval',
        title: 'Q4营销预算',
        description: 'Q4营销活动预算审批',
        priority: Priority.High,
        urgency: Urgency.Normal,
        requestedBy: 'user-001',
        contextId: 'ctx-001',
        subject: {
          subjectType: 'budget_allocation',
          subjectId: 'budget-q4-marketing',
          amount: 500000,
          currency: 'USD',
          category: 'marketing_expenses'
        }
      };

      const expectedWorkflow = {
        workflowId: 'wf-budget-approval-001',
        workflowName: '预算审批工作流',
        steps: [
          {
            stepId: 'step-001',
            stepName: '经理审批',
            stepType: 'human_approval',
            required: true
          }
        ]
      };

      const expectedApprovalRoute = {
        routeId: 'route-001',
        currentApprovers: [
          {
            approverId: 'manager-001',
            approverName: '张经理',
            stepName: '经理审批'
          }
        ]
      };

      const expectedApprovalRequest = {
        requestId: 'req-001',
        requestType: 'budget_approval',
        title: 'Q4营销预算',
        status: ApprovalStatus.Submitted,
        workflowId: 'wf-budget-approval-001',
        createdAt: new Date()
      };

      // 设置模拟
      workflowRepository.findMatchingWorkflows.mockResolvedValue([expectedWorkflow]);
      approvalRouter.routeApproval.mockResolvedValue(expectedApprovalRoute);
      workflowRepository.createApprovalRequest.mockResolvedValue(expectedApprovalRequest);

      // 执行
      const result = await service.createApprovalRequest(request);

      // 验证
      expect(result).toEqual(expectedApprovalRequest);
      expect(workflowRepository.findMatchingWorkflows).toHaveBeenCalledWith({
        requestType: 'budget_approval',
        amount: 500000,
        currency: 'USD'
      });
      expect(approvalRouter.routeApproval).toHaveBeenCalledWith(request, expectedWorkflow);
      expect(notificationService.sendInitialNotifications).toHaveBeenCalledWith(
        expectedApprovalRequest,
        expectedApprovalRoute
      );
      expect(auditLogger.logApprovalRequestCreated).toHaveBeenCalled();
    });

    it('应该在没有匹配工作流时抛出错误', async () => {
      // 准备
      const request: CreateApprovalRequest = {
        requestType: 'invalid_type',
        title: '无效请求',
        requestedBy: 'user-001'
      };

      // 设置模拟
      workflowRepository.findMatchingWorkflows.mockResolvedValue([]);

      // 执行和验证
      await expect(service.createApprovalRequest(request))
        .rejects
        .toThrow('未找到匹配的工作流');
    });
  });

  describe('processApprovalDecision', () => {
    it('应该成功处理审批决策', async () => {
      // 准备
      const requestId = 'req-001';
      const decision: ApprovalDecision = {
        decision: 'approved',
        decisionRationale: '预算分配合理，符合公司战略',
        approverId: 'manager-001',
        stepName: '经理审批',
        processedAt: new Date()
      };

      const existingRequest = {
        requestId: 'req-001',
        status: ApprovalStatus.InProgress,
        currentStep: '经理审批',
        workflowId: 'wf-budget-approval-001'
      };

      const expectedResult = {
        decisionId: 'decision-001',
        requestId: 'req-001',
        decisionStatus: 'processed',
        workflowStatus: 'approved',
        nextActions: []
      };

      // 设置模拟
      workflowRepository.findApprovalRequest.mockResolvedValue(existingRequest);
      workflowRepository.recordDecision.mockResolvedValue({
        decisionId: 'decision-001',
        decision: 'approved'
      });

      // 执行
      const result = await service.processApprovalDecision(requestId, decision);

      // 验证
      expect(result.decisionStatus).toBe('processed');
      expect(workflowRepository.findApprovalRequest).toHaveBeenCalledWith(requestId);
      expect(auditLogger.logApprovalDecision).toHaveBeenCalled();
    });

    it('应该在请求不存在时抛出错误', async () => {
      // 准备
      const requestId = 'non-existent';
      const decision: ApprovalDecision = {
        decision: 'approved',
        approverId: 'manager-001'
      };

      // 设置模拟
      workflowRepository.findApprovalRequest.mockResolvedValue(null);

      // 执行和验证
      await expect(service.processApprovalDecision(requestId, decision))
        .rejects
        .toThrow('审批请求未找到');
    });
  });
});
```

### **审批路由器测试**

#### **智能路由测试**
```typescript
describe('IntelligentApprovalRouter', () => {
  let router: IntelligentApprovalRouter;
  let userService: jest.Mocked<UserService>;
  let aiRecommendationService: jest.Mocked<AIRecommendationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligentApprovalRouter,
        {
          provide: UserService,
          useValue: {
            findUsersByRole: jest.fn(),
            findUsersByDepartment: jest.fn(),
            getUserWorkload: jest.fn()
          }
        },
        {
          provide: AIRecommendationService,
          useValue: {
            recommendApprovers: jest.fn()
          }
        }
      ]
    }).compile();

    router = module.get<IntelligentApprovalRouter>(IntelligentApprovalRouter);
    userService = module.get(UserService);
    aiRecommendationService = module.get(AIRecommendationService);
  });

  it('应该基于角色选择审批者', async () => {
    // 准备
    const request = {
      requestType: 'budget_approval',
      amount: 100000,
      department: 'marketing'
    };

    const workflow = {
      steps: [
        {
          stepId: 'step-001',
          approverSelection: {
            method: 'role_based',
            role: 'department_manager'
          }
        }
      ]
    };

    const expectedApprovers = [
      {
        userId: 'manager-001',
        userName: '张经理',
        userRole: 'department_manager',
        department: 'marketing'
      }
    ];

    // 设置模拟
    userService.findUsersByRole.mockResolvedValue(expectedApprovers);

    // 执行
    const result = await router.routeApproval(request, workflow);

    // 验证
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].approvers).toEqual(expectedApprovers);
    expect(userService.findUsersByRole).toHaveBeenCalledWith('department_manager', {
      department: 'marketing'
    });
  });

  it('应该使用AI推荐选择最佳审批者', async () => {
    // 准备
    const request = {
      requestType: 'budget_approval',
      amount: 500000,
      complexity: 'high'
    };

    const workflow = {
      steps: [
        {
          stepId: 'step-001',
          approverSelection: {
            method: 'ai_recommended'
          }
        }
      ]
    };

    const aiRecommendations = [
      {
        userId: 'expert-001',
        userName: '李专家',
        confidence: 0.95,
        rationale: '具有高额预算审批经验'
      }
    ];

    // 设置模拟
    aiRecommendationService.recommendApprovers.mockResolvedValue(aiRecommendations);

    // 执行
    const result = await router.routeApproval(request, workflow);

    // 验证
    expect(result.steps[0].approvers).toEqual(aiRecommendations);
    expect(aiRecommendationService.recommendApprovers).toHaveBeenCalledWith({
      requestType: 'budget_approval',
      amount: 500000,
      complexity: 'high'
    });
  });
});
```

---

## 🔧 集成测试策略

### **端到端工作流测试**

```typescript
describe('完整预算审批工作流 (E2E)', () => {
  let app: INestApplication;
  let workflowService: EnterpriseWorkflowService;
  let testDatabase: TestDatabase;

  beforeAll(async () => {
    // 设置测试应用
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfirmModule.forTest()]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    workflowService = app.get<EnterpriseWorkflowService>(EnterpriseWorkflowService);
    testDatabase = app.get<TestDatabase>(TestDatabase);
  });

  afterAll(async () => {
    await testDatabase.cleanup();
    await app.close();
  });

  it('应该完成完整的预算审批流程', async () => {
    // 阶段1: 创建审批请求
    const approvalRequest = await workflowService.createApprovalRequest({
      requestType: 'budget_approval',
      title: '测试预算审批',
      amount: 100000,
      requestedBy: 'test-user-001'
    });

    expect(approvalRequest.status).toBe(ApprovalStatus.Submitted);

    // 阶段2: 第一级审批 (部门经理)
    const managerDecision = await workflowService.processApprovalDecision(
      approvalRequest.requestId,
      {
        decision: 'approved',
        approverId: 'manager-001',
        decisionRationale: '预算合理'
      }
    );

    expect(managerDecision.workflowStatus).toBe('in_progress');

    // 阶段3: 第二级审批 (财务)
    const financeDecision = await workflowService.processApprovalDecision(
      approvalRequest.requestId,
      {
        decision: 'approved',
        approverId: 'finance-001',
        decisionRationale: '财务审查通过'
      }
    );

    expect(financeDecision.workflowStatus).toBe('approved');

    // 阶段4: 验证最终状态
    const finalStatus = await workflowService.getApprovalStatus(approvalRequest.requestId);
    expect(finalStatus.status).toBe(ApprovalStatus.Approved);
    expect(finalStatus.completedSteps).toHaveLength(2);
  });
});
```

---

## 🔗 相关文档

- [Confirm模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [集成示例](./integration-examples.md) - 集成示例

---

**测试版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业验证  

**⚠️ Alpha版本说明**: Confirm模块测试指南在Alpha版本中提供企业级审批工作流测试策略。额外的高级测试模式和验证方法将在Beta版本中添加。
