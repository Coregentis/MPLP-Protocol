/**
 * Confirm模块适配器单元测试
 * @description 测试ConfirmModuleAdapter的所有功能，确保100%分支覆盖
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 23:32
 * 
 * 基于MPLP测试策略规则：
 * 1. 基于实际Schema和实现编写测试
 * 2. 使用TestDataFactory生成测试数据
 * 3. 发现并修复源代码问题，而不是绕过问题
 * 4. 确保100%分支覆盖，发现源代码功能缺失
 */

import { jest } from '@jest/globals';
import { ConfirmModuleAdapter } from '../../../src/modules/confirm/infrastructure/adapters/confirm-module.adapter';
import { ConfirmManagementService, OperationResult } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { ConfirmFactory, CreateConfirmRequest } from '../../../src/modules/confirm/domain/factories/confirm.factory';
import { ConfirmValidationService, ValidationResult } from '../../../src/modules/confirm/domain/services/confirm-validation.service';
import { Confirm } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmEntityData } from '../../../src/modules/confirm/api/mappers/confirm.mapper';
import { ConfirmationCoordinationRequest, ConfirmationResult, ModuleStatus } from '../../../src/public/modules/core/types/core.types';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  ConfirmDecision,
  ConfirmSubject,
  Requester,
  ApprovalWorkflow,
  StepStatus,
  ConfirmMetadata,
  UUID,
  Timestamp
} from '../../../src/modules/confirm/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('ConfirmModuleAdapter单元测试', () => {
  let confirmAdapter: ConfirmModuleAdapter;
  let mockConfirmManagementService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmFactory: jest.Mocked<ConfirmFactory>;
  let mockConfirmValidationService: jest.Mocked<ConfirmValidationService>;

  // 辅助函数：创建正确的Mock Confirm实体
  const createMockConfirm = (
    contextId: string,
    confirmationType: ConfirmationType = ConfirmationType.TASK_APPROVAL,
    title: string = 'Test Confirmation'
  ): Confirm => {
    const confirmData: ConfirmEntityData = {
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      confirmId: TestDataFactory.Base.generateUUID(),
      contextId: contextId,
      confirmationType: confirmationType,
      status: ConfirmStatus.PENDING,
      priority: Priority.MEDIUM,
      subject: {
        title: title,
        description: 'Test Description',
        impactAssessment: {
          businessImpact: 'Medium impact',
          technicalImpact: 'Low impact',
          riskLevel: 'low',
          impactScope: ['core-orchestrator'],
        },
      },
      requester: {
        userId: 'core-orchestrator',
        name: 'System User',
        role: 'system',
        email: 'system@example.com',
        department: 'core',
        requestReason: 'Test request reason'
      },
      approvalWorkflow: {
        workflowType: 'consensus',
        steps: [{
          stepId: 'step-1',
          name: 'Test Approval',
          stepOrder: 1,
          level: 1,
          approvers: [{
            approverId: 'approver-1',
            name: 'Test Approver',
            role: 'system',
            email: 'approver@example.com',
            priority: 1,
            isActive: true,
          }],
          status: StepStatus.PENDING,
          timeoutHours: 24,
        }],
        requireAllApprovers: false,
        allowDelegation: true,
        autoApprovalRules: {
          enabled: false,
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      metadata: {
        source: 'test',
        tags: ['adapter-test'],
        customFields: {}
      }
    };

    return new Confirm(confirmData);
  };

  beforeEach(async () => {
    // 基于实际接口创建Mock服务
    mockConfirmManagementService = {
      createConfirm: jest.fn(),
      getConfirm: jest.fn(),
      updateConfirmStatus: jest.fn(),
      deleteConfirm: jest.fn(),
      listConfirms: jest.fn(),
      searchConfirms: jest.fn(),
      findPendingConfirms: jest.fn(),
      findExpiredConfirms: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      getConfirmHistory: jest.fn(),
      validateConfirmWorkflow: jest.fn(),
      enableAIAnalysis: jest.fn(),
      enableComplianceCheck: jest.fn(),
      enablePerformanceMonitoring: jest.fn()
    } as jest.Mocked<ConfirmManagementService>;

    mockConfirmFactory = {
      create: jest.fn()
    } as jest.Mocked<ConfirmFactory>;

    mockConfirmValidationService = {
      validateCreateRequest: jest.fn(),
      validateStatusTransition: jest.fn(),
      validateApprovalWorkflow: jest.fn(),
      validateRequester: jest.fn(),
      validateSubject: jest.fn()
    } as jest.Mocked<ConfirmValidationService>;

    // 创建适配器实例
    confirmAdapter = new ConfirmModuleAdapter(
      mockConfirmManagementService,
      mockConfirmFactory,
      mockConfirmValidationService
    );
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('模块初始化', () => {
    test('应该成功初始化适配器', async () => {
      await confirmAdapter.initialize();

      const status = confirmAdapter.getStatus();
      expect(status.module_name).toBe('confirm');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该处理初始化失败', async () => {
      // 创建一个没有服务的适配器来模拟初始化失败
      const invalidAdapter = new ConfirmModuleAdapter(null as any, null as any, null as any);

      await expect(invalidAdapter.initialize()).rejects.toThrow('Confirm management service not available');

      const status = invalidAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });

    test('应该正确设置模块名称', () => {
      expect(confirmAdapter.module_name).toBe('confirm');
    });
  });

  describe('确认协调执行', () => {
    beforeEach(async () => {
      await confirmAdapter.initialize();
    });

    test('应该成功执行手动确认策略', async () => {
      // 使用TestDataFactory生成测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'manual',
        parameters: {
          approval_rules: ['manual_review_required']
        },
        approvalWorkflow: {
          required_approvers: ['user1', 'user2'],
          approval_threshold: 2,
          parallel_approval: true
        }
      };

      // 基于实际Confirm实体创建Mock返回值
      const mockConfirm = createMockConfirm(
        contextId,
        'task_approval',
        'Confirmation for manual strategy'
      );

      const mockResult: OperationResult<Confirm> = {
        success: true,
        data: mockConfirm
      };

      mockConfirmManagementService.createConfirm.mockResolvedValue(mockResult);

      const result: ConfirmationResult = await confirmAdapter.execute(request);

      // 验证结果结构
      expect(result.confirmation_id).toBeDefined();
      expect(result.approval_status).toBeDefined();
      expect(result.approver_responses).toBeDefined();
      expect(result.final_decision).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // 验证手动审批流程
      expect(Object.keys(result.approver_responses)).toHaveLength(2);
      expect(result.approver_responses['user1']).toBeDefined();
      expect(result.approver_responses['user2']).toBeDefined();

      // 验证服务调用
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledTimes(1);
    });

    test('应该成功执行自动确认策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'automatic',
        parameters: {}
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'resource_allocation',
        'Confirmation for automatic strategy'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const result: ConfirmationResult = await confirmAdapter.execute(request);

      expect(result.approval_status).toBe('approved');
      expect(result.final_decision).toBe(true);
      expect(result.approver_responses['system']).toBeDefined();
      expect(result.approver_responses['system'].decision).toBe('approve');
      expect(result.approver_responses['system'].comments).toBe('Automatically approved');
    });

    test('应该成功执行条件确认策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'conditional',
        parameters: {
          approval_rules: ['condition_met']
        }
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'risk_acceptance',
        'Confirmation for conditional strategy'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const result: ConfirmationResult = await confirmAdapter.execute(request);

      expect(result.approval_status).toBe('approved');
      expect(result.final_decision).toBe(true);
      expect(result.approver_responses['system'].decision).toBe('approve');
      expect(result.approver_responses['system'].comments).toContain('conditions met');
    });

    test('应该成功执行多阶段确认策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'multi_stage',
        parameters: {},
        approvalWorkflow: {
          required_approvers: ['stage1_approver', 'stage2_approver', 'stage3_approver'],
          approval_threshold: 3,
          parallel_approval: false
        }
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'plan_approval',
        'Confirmation for multi_stage strategy'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const result: ConfirmationResult = await confirmAdapter.execute(request);

      expect(result.approval_status).toBe('approved');
      expect(result.final_decision).toBe(true);
      expect(Object.keys(result.approver_responses)).toHaveLength(3);
      
      // 验证多阶段审批
      expect(result.approver_responses['stage1_approver'].comments).toContain('Stage 1 approval');
      expect(result.approver_responses['stage2_approver'].comments).toContain('Stage 2 approval');
      expect(result.approver_responses['stage3_approver'].comments).toContain('Stage 3 approval');
    });
  });

  describe('参数验证', () => {
    beforeEach(async () => {
      await confirmAdapter.initialize();
    });

    test('应该验证contextId必需', async () => {
      const request: ConfirmationCoordinationRequest = {
        contextId: '', // 空的contextId
        confirmation_strategy: 'manual',
        parameters: {}
      };

      await expect(confirmAdapter.execute(request)).rejects.toThrow('Context ID is required');

      const status = confirmAdapter.getStatus();
      expect(status.error_count).toBe(1);
      expect(status.status).toBe('error');
    });

    test('应该验证确认策略有效性', async () => {
      const request: ConfirmationCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmation_strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(confirmAdapter.execute(request)).rejects.toThrow(
        'Unsupported confirmation strategy: invalid_strategy'
      );
    });

    test('应该验证超时为正数', async () => {
      const request: ConfirmationCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmation_strategy: 'manual',
        parameters: {
          timeoutMs: -1000 // 负数超时
        }
      };

      await expect(confirmAdapter.execute(request)).rejects.toThrow('Timeout must be positive');
    });

    test('应该验证升级策略配置', async () => {
      const request: ConfirmationCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmation_strategy: 'manual',
        parameters: {
          escalation_policy: {
            levels: [], // 空的升级级别
            timeout_per_level: 3600000
          }
        }
      };

      await expect(confirmAdapter.execute(request)).rejects.toThrow(
        'Escalation levels must be a non-empty array'
      );
    });

    test('应该验证审批工作流配置', async () => {
      const request: ConfirmationCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmation_strategy: 'manual',
        parameters: {},
        approvalWorkflow: {
          required_approvers: ['user1', 'user2'],
          approval_threshold: 5, // 阈值超过审批者数量
          parallel_approval: true
        }
      };

      await expect(confirmAdapter.execute(request)).rejects.toThrow(
        'Approval threshold must be between 1 and the number of required approvers'
      );
    });
  });

  describe('优先级确定', () => {
    beforeEach(async () => {
      await confirmAdapter.initialize();
    });

    test('应该根据超时确定优先级', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 测试紧急任务（< 5分钟）
      const urgentRequest: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'automatic',
        parameters: {
          timeoutMs: 240000 // 4 minutes - 应该是urgent
        }
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'resource_allocation',
        'Urgent Confirmation'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const result = await confirmAdapter.execute(urgentRequest);
      expect(result.confirmation_id).toBeDefined();
      
      // 验证createConfirm被调用时使用了正确的优先级
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: Priority.URGENT
        })
      );
    });
  });

  describe('模块状态管理', () => {
    test('应该正确跟踪执行状态', async () => {
      await confirmAdapter.initialize();

      const contextId = TestDataFactory.Base.generateUUID();
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'automatic',
        parameters: {}
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'resource_allocation',
        'Test Confirmation'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const initialStatus = confirmAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      await confirmAdapter.execute(request);

      const finalStatus = confirmAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });

    test('应该处理执行错误并更新状态', async () => {
      await confirmAdapter.initialize();

      const request: ConfirmationCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmation_strategy: 'manual',
        parameters: {}
      };

      // 模拟服务错误
      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: false,
        error: 'Service error'
      });

      await expect(confirmAdapter.execute(request)).rejects.toThrow('Failed to create confirmation: Service error');

      const status = confirmAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });
  });

  describe('清理资源', () => {
    test('应该成功清理资源', async () => {
      await confirmAdapter.initialize();
      await confirmAdapter.cleanup();

      const status = confirmAdapter.getStatus();
      expect(status.status).toBe('idle');
    });
  });

  describe('性能测试', () => {
    beforeEach(async () => {
      await confirmAdapter.initialize();
    });

    test('应该在合理时间内完成确认协调', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'automatic',
        parameters: {}
      };

      const mockConfirm = createMockConfirm(
        contextId,
        'resource_allocation',
        'Performance Test Confirmation'
      );

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      const startTime = Date.now();
      const result = await confirmAdapter.execute(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ADAPTER_EXECUTION_TIME || 1000);
    });
  });
});
