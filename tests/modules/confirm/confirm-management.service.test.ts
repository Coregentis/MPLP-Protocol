/**
 * Confirm管理服务单元测试
 * 
 * 基于Schema驱动测试原则，测试ConfirmManagementService的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T17:00:00+08:00
 */

import { jest } from '@jest/globals';
import { ConfirmManagementService, OperationResult } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { Confirm } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { IConfirmRepository, ConfirmFilter, PaginationOptions } from '../../../src/modules/confirm/domain/repositories/confirm-repository.interface';
import { ConfirmFactory, CreateConfirmRequest } from '../../../src/modules/confirm/domain/factories/confirm.factory';
import { ConfirmValidationService, ValidationResult } from '../../../src/modules/confirm/domain/services/confirm-validation.service';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  ConfirmDecision,
  ConfirmSubject,
  Requester,
  ApprovalWorkflow,
  ApprovalStep,
  StepStatus,
  ImpactAssessment
} from '../../../src/modules/confirm/types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('ConfirmManagementService', () => {
  let service: ConfirmManagementService;
  let mockRepository: jest.Mocked<IConfirmRepository>;
  let mockFactory: jest.Mocked<ConfirmFactory>;
  let mockValidationService: jest.Mocked<ConfirmValidationService>;

  // 辅助函数：创建有效的ConfirmSubject
  const createValidSubject = (title: string = 'Test Confirmation', description: string = 'Test'): ConfirmSubject => ({
    title,
    description,
    impactAssessment: {
      scope: 'project',
      businessImpact: 'medium',
      technicalImpact: 'low',
      riskLevel: 'low',
      impactScope: ['system1', 'system2'],
      estimatedCost: 1000
    } as ImpactAssessment
  });

  // 辅助函数：创建有效的Requester
  const createValidRequester = (userId: string = 'user-123'): Requester => ({
    userId: userId,
    name: '测试用户',
    role: 'manager',
    email: 'test@example.com',
    requestReason: 'Testing purposes',
    department: 'engineering'
  });

  // 辅助函数：创建有效的ApprovalWorkflow
  const createValidWorkflow = (): ApprovalWorkflow => ({
    workflowId: TestDataFactory.Base.generateUUID(),
    name: 'Test Workflow',
    description: 'Test approval workflow',
    steps: [
      {
        stepId: TestDataFactory.Base.generateUUID(),
        name: 'Initial Review',
        stepOrder: 1,
        approverRole: 'supervisor',
        isRequired: true,
        timeoutHours: 24,
        status: StepStatus.PENDING
      } as ApprovalStep
    ],
    parallelExecution: false,
    autoApprovalRules: [{
      enabled: false,
      conditions: []
    }]
  });

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      findPending: jest.fn(),
      exists: jest.fn(),
      count: jest.fn()
    } as unknown as jest.Mocked<IConfirmRepository>;

    mockFactory = {
      create: jest.fn()
    } as unknown as jest.Mocked<ConfirmFactory>;

    mockValidationService = {
      validateCreateRequest: jest.fn(),
      validateStatusTransition: jest.fn(),
      validateApprovalWorkflow: jest.fn(),
      validateRequester: jest.fn(),
      validateSubject: jest.fn()
    } as unknown as jest.Mocked<ConfirmValidationService>;

    // 创建服务实例 - 基于实际构造函数
    service = new ConfirmManagementService(
      mockRepository,
      mockValidationService
    );
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createConfirm', () => {
    it('应该成功创建Confirm', async () => {
      // 准备测试数据 - 基于实际Schema (使用camelCase)
      const createRequest: CreateConfirmRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planId: TestDataFactory.Base.generateUUID(),
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: 'medium',
        subject: createValidSubject('Test Confirmation', 'Test confirmation description'),
        requester: createValidRequester('user-123'),
        approvalWorkflow: createValidWorkflow(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          source: 'test',
          tags: ['test']
        }
      };

      const mockConfirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        createRequest.contextId,
        '1.0.0',
        createRequest.confirmationType,
        ConfirmStatus.PENDING,
        createRequest.priority,
        createRequest.subject,
        createRequest.requester,
        createRequest.approvalWorkflow,
        new Date().toISOString(),
        new Date().toISOString(),
        createRequest.planId,
        undefined,
        createRequest.expiresAt,
        createRequest.metadata
      );

      // 设置Mock返回值 - 基于实际接口
      const validationResult: ValidationResult = { 
        isValid: true, 
        errors: [], 
        warnings: [] 
      };
      mockValidationService.validateCreateRequest.mockReturnValue(validationResult);
      
      // Mock ConfirmFactory.create
      jest.spyOn(ConfirmFactory, 'create').mockReturnValue(mockConfirm);
      
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createConfirm(createRequest),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果 - 基于实际返回类型
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.confirmId).toBeDefined();
      expect(result.data?.contextId).toBe(createRequest.contextId);
      expect(mockValidationService.validateCreateRequest).toHaveBeenCalledWith(
        createRequest.contextId,
        createRequest.confirmationType,
        createRequest.priority,
        createRequest.subject,
        createRequest.requester,
        createRequest.approvalWorkflow
      );
      expect(ConfirmFactory.create).toHaveBeenCalledWith(createRequest);
      expect(mockRepository.save).toHaveBeenCalledWith(mockConfirm);
    });

    it('应该处理验证失败', async () => {
      // 准备测试数据
      const createRequest: CreateConfirmRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        confirmationType: ConfirmationType.PLAN_APPROVAL,
        priority: Priority.MEDIUM,
        subject: createValidSubject('', 'Test'), // 无效标题
        requester: createValidRequester('user-123'),
        approvalWorkflow: createValidWorkflow()
      };

      const validationResult: ValidationResult = { 
        isValid: false, 
        errors: ['Subject title is required'], 
        warnings: [] 
      };
      mockValidationService.validateCreateRequest.mockReturnValue(validationResult);

      // 执行测试
      const result = await service.createConfirm(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Subject title is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const createRequest: CreateConfirmRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        confirmation_type: 'plan_approval',
        priority: 'medium',
        subject: createValidSubject('Test Confirmation', 'Test'),
        requester: createValidRequester('user-123'),
        approval_workflow: createValidWorkflow()
      };

      const mockConfirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        createRequest.context_id,
        '1.0.0',
        createRequest.confirmation_type,
        'pending',
        createRequest.priority,
        createRequest.subject,
        createRequest.requester,
        createRequest.approval_workflow,
        new Date().toISOString(),
        new Date().toISOString()
      );

      const validationResult: ValidationResult = { 
        isValid: true, 
        errors: [], 
        warnings: [] 
      };
      const dbError = new Error('Database connection failed');

      mockValidationService.validateCreateRequest.mockReturnValue(validationResult);
      jest.spyOn(ConfirmFactory, 'create').mockReturnValue(mockConfirm);
      mockRepository.save.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.createConfirm(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空字符串标题',
          input: { 
            title: '', 
            description: 'Test' 
          },
          expectedError: 'Subject title is required'
        },
        {
          name: '超长标题',
          input: { 
            title: 'a'.repeat(1000), 
            description: 'Test' 
          },
          expectedSuccess: true
        },
        {
          name: '空审批者数组',
          input: { 
            title: 'Valid Title', 
            description: 'Test',
            approvers: []
          },
          expectedSuccess: true
        }
      ];

      for (const test of boundaryTests) {
        const createRequest: CreateConfirmRequest = {
          context_id: TestDataFactory.Base.generateUUID(),
          confirmation_type: 'plan_approval',
          priority: 'medium',
          subject: createValidSubject(test.input.title, test.input.description),
          requester: createValidRequester('user-123'),
          approval_workflow: createValidWorkflow()
        };

        if (test.expectedError) {
          const validationResult: ValidationResult = { 
            isValid: false, 
            errors: [test.expectedError], 
            warnings: [] 
          };
          mockValidationService.validateCreateRequest.mockReturnValue(validationResult);
          
          const result = await service.createConfirm(createRequest);
          expect(result.success).toBe(false);
          expect(result.error).toBe(test.expectedError);
        } else if (test.expectedSuccess) {
          const validationResult: ValidationResult = { 
            isValid: true, 
            errors: [], 
            warnings: [] 
          };
          const mockConfirm = new Confirm(
            TestDataFactory.Base.generateUUID(),
            createRequest.context_id,
            '1.0.0',
            createRequest.confirmation_type,
            'pending',
            createRequest.priority,
            createRequest.subject,
            createRequest.requester,
            createRequest.approval_workflow,
            new Date().toISOString(),
            new Date().toISOString()
          );

          mockValidationService.validateCreateRequest.mockReturnValue(validationResult);
          jest.spyOn(ConfirmFactory, 'create').mockReturnValue(mockConfirm);
          mockRepository.save.mockResolvedValue(undefined);

          const result = await service.createConfirm(createRequest);
          expect(result.success).toBe(true);
        }
        
        // 清理Mock状态
        jest.clearAllMocks();
      }
    });
  });

  describe('getConfirmById', () => {
    it('应该成功获取Confirm', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const mockConfirm = new Confirm(
        confirmId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'pending',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockConfirm);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getConfirmById(confirmId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirm);
      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
    });

    it('应该处理Confirm不存在的情况', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.getConfirmById(confirmId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('确认不存在');
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getConfirmById(confirmId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('updateConfirmStatus', () => {
    it('应该成功更新Confirm状态', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const existingConfirm = new Confirm(
        confirmId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'pending',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const newStatus: ConfirmStatus = 'in_review';
      const decision: ConfirmDecision = 'approved';

      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingConfirm);
      mockValidationService.validateStatusTransition.mockReturnValue(validationResult);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.updateConfirmStatus(confirmId, newStatus, decision);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockValidationService.validateStatusTransition).toHaveBeenCalledWith('pending', newStatus);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Confirm不存在的情况', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const newStatus: ConfirmStatus = 'in_review';

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.updateConfirmStatus(confirmId, newStatus);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('确认不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理无效状态转换', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const existingConfirm = new Confirm(
        confirmId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'approved',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const newStatus: ConfirmStatus = 'pending';

      const validationResult: ValidationResult = {
        isValid: false,
        errors: ['Invalid status transition'],
        warnings: []
      };

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingConfirm);
      mockValidationService.validateStatusTransition.mockReturnValue(validationResult);

      // 执行测试
      const result = await service.updateConfirmStatus(confirmId, newStatus);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid status transition');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('cancelConfirm', () => {
    it('应该成功取消Confirm', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();
      const existingConfirm = new Confirm(
        confirmId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'pending',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingConfirm);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.cancelConfirm(confirmId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Confirm不存在的情况', async () => {
      // 准备测试数据
      const confirmId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.cancelConfirm(confirmId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('确认不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('queryConfirms', () => {
    it('应该成功查询Confirm列表', async () => {
      // 准备测试数据
      const filter: ConfirmFilter = {
        context_id: TestDataFactory.Base.generateUUID(),
        status: 'pending'
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryConfirms(filter, pagination);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });
  });

  describe('getPendingConfirms', () => {
    it('应该成功获取待处理确认', async () => {
      // 准备测试数据
      const userId = 'user-123';
      const mockConfirms: Confirm[] = [];

      // 设置Mock返回值
      mockRepository.findPending.mockResolvedValue(mockConfirms);

      // 执行测试
      const result = await service.getPendingConfirms(userId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirms);
      expect(mockRepository.findPending).toHaveBeenCalledWith(userId);
    });

    it('应该处理无用户ID的情况', async () => {
      // 准备测试数据
      const mockConfirms: Confirm[] = [];

      // 设置Mock返回值
      mockRepository.findPending.mockResolvedValue(mockConfirms);

      // 执行测试
      const result = await service.getPendingConfirms();

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirms);
      expect(mockRepository.findPending).toHaveBeenCalledWith(undefined);
    });
  });
});
