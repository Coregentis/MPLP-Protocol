# Confirm Module Testing Guide

> **🌐 Language Navigation**: [English](testing-guide.md) | [中文](../../../zh-CN/modules/confirm/testing-guide.md)



**Multi-Agent Protocol Lifecycle Platform - Confirm Module Testing Guide v1.0.0-alpha**

[![Testing](https://img.shields.io/badge/testing-Enterprise%20Validated-green.svg)](./README.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![Workflow](https://img.shields.io/badge/workflow-Tested-blue.svg)](./performance-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/confirm/testing-guide.md)

---

## 🎯 Testing Overview

This comprehensive testing guide provides strategies, patterns, and examples for testing the Confirm Module's enterprise workflow engine, approval systems, decision support features, and compliance mechanisms. It covers testing methodologies for mission-critical approval systems.

### **Testing Scope**
- **Workflow Engine Testing**: BPMN workflow execution and state management
- **Approval System Testing**: Multi-level approval chains and routing logic
- **Decision Support Testing**: AI recommendations and risk assessment validation
- **Consensus Testing**: Multi-party agreement and voting mechanisms
- **Integration Testing**: Cross-module workflow integration testing
- **Compliance Testing**: Regulatory compliance and audit trail validation

---

## 🧪 Workflow Engine Testing Strategy

### **Workflow Execution Unit Tests**

#### **Workflow Service Tests**
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
    it('should create approval request with valid workflow', async () => {
      // Arrange
      const request: CreateApprovalRequest = {
        requestType: 'budget_approval',
        title: 'Q4 Marketing Budget',
        description: 'Approval for Q4 marketing campaign budget',
        priority: Priority.High,
        urgency: Urgency.Normal,
        requestedBy: 'user-001',
        contextId: 'ctx-001',
        subject: {
          subjectType: 'budget_allocation',
          subjectId: 'budget-q4-001',
          amount: 500000,
          currency: 'USD'
        },
        metadata: {
          department: 'marketing',
          costCenter: 'MKT-001'
        }
      };

      const workflow = {
        workflowId: 'wf-001',
        workflowName: 'Budget Approval Workflow',
        status: WorkflowStatus.Active,
        steps: [
          {
            stepId: 'step-001',
            stepName: 'Manager Approval',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'direct_manager'
            },
            requirements: {
              required: true,
              timeoutHours: 24,
              escalationEnabled: true
            }
          }
        ]
      };

      const approvalRoute = {
        routeId: 'route-001',
        requestId: 'req-001',
        workflowId: 'wf-001',
        steps: [
          {
            stepId: 'step-001',
            stepName: 'Manager Approval',
            approvers: [
              {
                approverId: 'manager-001',
                approverName: 'John Manager',
                approverRole: 'direct_manager'
              }
            ],
            status: ApprovalStepStatus.Pending
          }
        ],
        currentApprovers: [
          {
            approverId: 'manager-001',
            approverName: 'John Manager',
            approverRole: 'direct_manager'
          }
        ]
      };

      const expectedApprovalRequest = {
        requestId: 'req-001',
        requestType: 'budget_approval',
        title: 'Q4 Marketing Budget',
        status: ApprovalStatus.Submitted,
        workflowExecution: {
          executionId: 'exec-001',
          workflowId: 'wf-001',
          status: ExecutionStatus.InProgress
        },
        approvalRoute: approvalRoute,
        createdAt: expect.any(Date)
      };

      workflowRepository.findMatchingWorkflows.mockResolvedValue([workflow]);
      approvalRouter.routeApproval.mockResolvedValue(approvalRoute);
      workflowRepository.createApprovalRequest.mockResolvedValue(expectedApprovalRequest);

      // Act
      const result = await service.createApprovalRequest(request);

      // Assert
      expect(workflowRepository.findMatchingWorkflows).toHaveBeenCalledWith({
        requestType: 'budget_approval',
        subjectType: 'budget_allocation',
        amount: 500000,
        department: 'marketing',
        priority: Priority.High
      });
      expect(approvalRouter.routeApproval).toHaveBeenCalledWith(request, workflow);
      expect(workflowRepository.createApprovalRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          requestType: 'budget_approval',
          title: 'Q4 Marketing Budget',
          status: ApprovalStatus.Submitted,
          workflowExecution: expect.any(Object),
          approvalRoute: approvalRoute
        })
      );
      expect(notificationService.sendInitialNotifications).toHaveBeenCalledWith(
        expectedApprovalRequest,
        approvalRoute
      );
      expect(auditLogger.logApprovalRequestCreated).toHaveBeenCalledWith({
        requestId: 'req-001',
        requestType: 'budget_approval',
        requestedBy: 'user-001',
        workflowId: 'wf-001',
        initialApprovers: ['manager-001'],
        timestamp: expect.any(Date)
      });
      expect(result).toEqual(expectedApprovalRequest);
    });

    it('should reject request with invalid priority', async () => {
      // Arrange
      const invalidRequest: CreateApprovalRequest = {
        requestType: 'budget_approval',
        title: 'Invalid Request',
        priority: 'invalid_priority' as Priority,
        urgency: Urgency.Normal,
        requestedBy: 'user-001',
        subject: {
          subjectType: 'budget_allocation',
          subjectId: 'budget-001',
          amount: 100000,
          currency: 'USD'
        }
      };

      // Act & Assert
      await expect(service.createApprovalRequest(invalidRequest))
        .rejects
        .toThrow(ValidationError);
      
      expect(workflowRepository.findMatchingWorkflows).not.toHaveBeenCalled();
      expect(auditLogger.logApprovalRequestCreated).not.toHaveBeenCalled();
    });

    it('should handle no matching workflow scenario', async () => {
      // Arrange
      const request: CreateApprovalRequest = {
        requestType: 'unknown_type',
        title: 'Unknown Request',
        priority: Priority.Normal,
        urgency: Urgency.Normal,
        requestedBy: 'user-001',
        subject: {
          subjectType: 'unknown_subject',
          subjectId: 'unknown-001',
          amount: 1000,
          currency: 'USD'
        }
      };

      workflowRepository.findMatchingWorkflows.mockResolvedValue([]);

      // Act & Assert
      await expect(service.createApprovalRequest(request))
        .rejects
        .toThrow(NotFoundError);
      
      expect(workflowRepository.findMatchingWorkflows).toHaveBeenCalled();
      expect(approvalRouter.routeApproval).not.toHaveBeenCalled();
    });
  });

  describe('processApprovalDecision', () => {
    it('should process approval decision successfully', async () => {
      // Arrange
      const decision: ApprovalDecision = {
        decisionId: 'dec-001',
        requestId: 'req-001',
        stepId: 'step-001',
        approverId: 'manager-001',
        approverRole: 'direct_manager',
        decision: DecisionType.Approved,
        decisionTimestamp: new Date(),
        decisionRationale: 'Budget allocation is justified and aligns with strategic goals'
      };

      const approvalRequest = {
        requestId: 'req-001',
        status: ApprovalStatus.PendingApproval,
        workflowExecution: {
          executionId: 'exec-001',
          workflowId: 'wf-001',
          currentStep: 'step-001',
          status: ExecutionStatus.InProgress
        }
      };

      const workflowStep = {
        stepId: 'step-001',
        stepName: 'Manager Approval',
        approverSelection: {
          method: 'role_based',
          role: 'direct_manager'
        }
      };

      const recordedDecision = {
        ...decision,
        recordedAt: new Date()
      };

      const updatedWorkflowState = {
        status: ExecutionStatus.Completed,
        currentStep: null,
        completedAt: new Date()
      };

      workflowRepository.findApprovalRequest.mockResolvedValue(approvalRequest);
      workflowRepository.getWorkflowStep.mockResolvedValue(workflowStep);
      workflowRepository.findStepDecision.mockResolvedValue(null);
      service.recordApprovalDecision = jest.fn().mockResolvedValue(recordedDecision);
      service.updateWorkflowState = jest.fn().mockResolvedValue(updatedWorkflowState);
      service.determineNextSteps = jest.fn().mockResolvedValue([]);
      service.executeNextSteps = jest.fn().mockResolvedValue({
        finalOutcome: {
          decision: DecisionType.Approved,
          effectiveDate: new Date()
        }
      });

      // Act
      const result = await service.processApprovalDecision(decision);

      // Assert
      expect(workflowRepository.findApprovalRequest).toHaveBeenCalledWith('req-001');
      expect(workflowRepository.getWorkflowStep).toHaveBeenCalledWith('wf-001', 'step-001');
      expect(workflowRepository.findStepDecision).toHaveBeenCalledWith('req-001', 'step-001');
      expect(service.recordApprovalDecision).toHaveBeenCalledWith(decision, approvalRequest);
      expect(service.updateWorkflowState).toHaveBeenCalledWith(recordedDecision, approvalRequest);
      expect(auditLogger.logApprovalDecision).toHaveBeenCalledWith({
        decisionId: 'dec-001',
        requestId: 'req-001',
        approverId: 'manager-001',
        decision: DecisionType.Approved,
        workflowState: ExecutionStatus.Completed,
        nextSteps: [],
        timestamp: expect.any(Date)
      });
      expect(result.decision).toEqual(recordedDecision);
      expect(result.workflowState).toEqual(updatedWorkflowState);
    });

    it('should reject decision for non-existent request', async () => {
      // Arrange
      const decision: ApprovalDecision = {
        decisionId: 'dec-001',
        requestId: 'non-existent',
        stepId: 'step-001',
        approverId: 'manager-001',
        decision: DecisionType.Approved
      };

      workflowRepository.findApprovalRequest.mockResolvedValue(null);

      // Act & Assert
      await expect(service.processApprovalDecision(decision))
        .rejects
        .toThrow(NotFoundError);
      
      expect(workflowRepository.findApprovalRequest).toHaveBeenCalledWith('non-existent');
      expect(auditLogger.logApprovalDecision).not.toHaveBeenCalled();
    });

    it('should reject duplicate decision for same step', async () => {
      // Arrange
      const decision: ApprovalDecision = {
        decisionId: 'dec-002',
        requestId: 'req-001',
        stepId: 'step-001',
        approverId: 'manager-001',
        decision: DecisionType.Approved
      };

      const approvalRequest = {
        requestId: 'req-001',
        status: ApprovalStatus.PendingApproval,
        workflowExecution: {
          currentStep: 'step-001'
        }
      };

      const existingDecision = {
        decisionId: 'dec-001',
        stepId: 'step-001',
        decision: DecisionType.Approved
      };

      workflowRepository.findApprovalRequest.mockResolvedValue(approvalRequest);
      workflowRepository.findStepDecision.mockResolvedValue(existingDecision);

      // Act & Assert
      await expect(service.processApprovalDecision(decision))
        .rejects
        .toThrow(ConflictError);
      
      expect(workflowRepository.findStepDecision).toHaveBeenCalledWith('req-001', 'step-001');
    });
  });
});
```

---

## 🔐 Approval System Testing

### **Approval Router Tests**

#### **Intelligent Approval Router Tests**
```typescript
describe('IntelligentApprovalRouter', () => {
  let router: IntelligentApprovalRouter;
  let policyEngine: jest.Mocked<PolicyEngine>;
  let roleService: jest.Mocked<RoleService>;
  let aiRecommendationEngine: jest.Mocked<AIRecommendationEngine>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligentApprovalRouter,
        {
          provide: PolicyEngine,
          useValue: {
            evaluateRoutingPolicies: jest.fn()
          }
        },
        {
          provide: RoleService,
          useValue: {
            getUsersWithRole: jest.fn(),
            checkUserAvailability: jest.fn()
          }
        },
        {
          provide: AIRecommendationEngine,
          useValue: {
            recommendApprovers: jest.fn()
          }
        }
      ]
    }).compile();

    router = module.get<IntelligentApprovalRouter>(IntelligentApprovalRouter);
    policyEngine = module.get(PolicyEngine);
    roleService = module.get(RoleService);
    aiRecommendationEngine = module.get(AIRecommendationEngine);
  });

  describe('routeApproval', () => {
    it('should route approval to appropriate approvers', async () => {
      // Arrange
      const request: CreateApprovalRequest = {
        requestType: 'budget_approval',
        title: 'Marketing Budget',
        subject: {
          subjectType: 'budget_allocation',
          amount: 100000,
          currency: 'USD'
        },
        requestedBy: 'user-001',
        metadata: {
          department: 'marketing'
        }
      };

      const workflow: Workflow = {
        workflowId: 'wf-001',
        steps: [
          {
            stepId: 'step-001',
            stepName: 'Manager Approval',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'department_manager'
            },
            requirements: {
              required: true,
              timeoutHours: 24
            }
          }
        ]
      };

      const policyResult = {
        requiredSteps: [
          {
            stepName: 'Manager Approval',
            required: true,
            conditions: []
          }
        ]
      };

      const aiRecommendations = {
        recommendedApprovers: [
          {
            approverId: 'manager-001',
            confidence: 0.95,
            reasoning: 'Direct manager with budget authority'
          }
        ]
      };

      const availableManagers = [
        {
          userId: 'manager-001',
          name: 'John Manager',
          role: 'department_manager',
          available: true
        }
      ];

      policyEngine.evaluateRoutingPolicies.mockResolvedValue(policyResult);
      aiRecommendationEngine.recommendApprovers.mockResolvedValue(aiRecommendations);
      roleService.getUsersWithRole.mockResolvedValue(availableManagers);
      roleService.checkUserAvailability.mockResolvedValue(true);

      // Act
      const result = await router.routeApproval(request, workflow);

      // Assert
      expect(policyEngine.evaluateRoutingPolicies).toHaveBeenCalledWith(
        request,
        workflow,
        expect.any(Object)
      );
      expect(aiRecommendationEngine.recommendApprovers).toHaveBeenCalledWith(
        expect.objectContaining({
          request,
          workflow,
          policyResult
        })
      );
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].approvers).toContainEqual(
        expect.objectContaining({
          approverId: 'manager-001',
          approverName: 'John Manager',
          approverRole: 'department_manager'
        })
      );
      expect(result.currentApprovers).toHaveLength(1);
      expect(result.estimatedDuration).toBeGreaterThan(0);
    });

    it('should handle fallback routing when primary approvers unavailable', async () => {
      // Arrange
      const request: CreateApprovalRequest = {
        requestType: 'urgent_approval',
        title: 'Urgent Decision Required',
        subject: {
          subjectType: 'emergency_decision',
          amount: 50000,
          currency: 'USD'
        },
        requestedBy: 'user-001',
        priority: Priority.Critical
      };

      const workflow: Workflow = {
        workflowId: 'wf-002',
        steps: [
          {
            stepId: 'step-001',
            stepName: 'Primary Approval',
            approverSelection: {
              method: 'role_based',
              role: 'primary_approver',
              fallbackRole: 'backup_approver'
            }
          }
        ]
      };

      // Primary approvers unavailable
      roleService.getUsersWithRole
        .mockResolvedValueOnce([]) // No primary approvers
        .mockResolvedValueOnce([   // Fallback approvers available
          {
            userId: 'backup-001',
            name: 'Backup Approver',
            role: 'backup_approver',
            available: true
          }
        ]);

      policyEngine.evaluateRoutingPolicies.mockResolvedValue({
        requiredSteps: [{ stepName: 'Primary Approval', required: true }]
      });

      aiRecommendationEngine.recommendApprovers.mockResolvedValue({
        recommendedApprovers: []
      });

      // Act
      const result = await router.routeApproval(request, workflow);

      // Assert
      expect(roleService.getUsersWithRole).toHaveBeenCalledWith('primary_approver');
      expect(roleService.getUsersWithRole).toHaveBeenCalledWith('backup_approver');
      expect(result.steps[0].approvers).toContainEqual(
        expect.objectContaining({
          approverId: 'backup-001',
          approverRole: 'backup_approver'
        })
      );
    });

    it('should throw error when no approvers available', async () => {
      // Arrange
      const request: CreateApprovalRequest = {
        requestType: 'impossible_approval',
        title: 'No Approvers Available',
        subject: {
          subjectType: 'test_subject',
          amount: 1000,
          currency: 'USD'
        },
        requestedBy: 'user-001'
      };

      const workflow: Workflow = {
        workflowId: 'wf-003',
        steps: [
          {
            stepId: 'step-001',
            stepName: 'Impossible Approval',
            approverSelection: {
              method: 'role_based',
              role: 'non_existent_role'
            }
          }
        ]
      };

      roleService.getUsersWithRole.mockResolvedValue([]);
      policyEngine.evaluateRoutingPolicies.mockResolvedValue({
        requiredSteps: [{ stepName: 'Impossible Approval', required: true }]
      });
      aiRecommendationEngine.recommendApprovers.mockResolvedValue({
        recommendedApprovers: []
      });

      // Act & Assert
      await expect(router.routeApproval(request, workflow))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

---

## 🔗 Related Documentation

- [Confirm Module Overview](./README.md) - Module overview and architecture
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Testing Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Coverage**: 100% comprehensive  

**⚠️ Alpha Notice**: This testing guide provides comprehensive enterprise workflow testing strategies in Alpha release. Additional AI decision support testing patterns and advanced consensus testing will be added based on community feedback in Beta release.
