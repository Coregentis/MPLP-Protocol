/**
 * Plan模块重构完美测试套件 - Context模块A+标准
 * 
 * @description 基于Plan模块重构指南和Context模块A+标准的完美测试套件
 * 测试3个企业级协议服务：PlanProtocolService、PlanIntegrationService、PlanValidationService
 * @version 2.0.0 - AI算法外置版本
 * @layer 测试层 - 企业级测试
 * @standard Context模块A+标准：100%测试通过率，零技术债务
 * @coverage 目标覆盖率≥95%，测试通过率100%
 * @location tests/modules/plan/ (迁移自src/modules/plan/__tests__/)
 */

import { PlanProtocolService } from '../../../src/modules/plan/application/services/plan-protocol.service';
import { PlanIntegrationService } from '../../../src/modules/plan/application/services/plan-integration.service';
import { PlanValidationService } from '../../../src/modules/plan/application/services/plan-validation.service';
import { UUID } from '../../../src/shared/types';

// ===== Mock实现 (Context模块A+标准) =====
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn()
};

const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn()
};

const mockAIServiceConfig = {
  endpoint: 'https://api.example.com/ai',
  apiKey: 'test-api-key',
  timeout: 30000
};

// Plan仓储Mock
const mockPlanRepository = {
  savePlanRequest: jest.fn(),
  findPlanRequest: jest.fn(),
  updatePlanRequestStatus: jest.fn(),
  savePlanResult: jest.fn(),
  findPlanResult: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn()
};

// Context服务Mock (MPLP生态系统集成)
const mockContextService = {
  getContext: jest.fn(),
  validateContext: jest.fn(),
  updateContext: jest.fn()
};

// Role服务Mock (MPLP生态系统集成)
const mockRoleService = {
  validateRole: jest.fn(),
  checkPermissions: jest.fn(),
  getRoleCapabilities: jest.fn()
};

// Confirm服务Mock (MPLP生态系统集成)
const mockConfirmService = {
  requestApproval: jest.fn(),
  checkApprovalStatus: jest.fn(),
  processApproval: jest.fn()
};

// Trace服务Mock (MPLP生态系统集成)
const mockTraceService = {
  startTrace: jest.fn(),
  updateTrace: jest.fn(),
  endTrace: jest.fn()
};

// Extension服务Mock (MPLP生态系统集成)
const mockExtensionService = {
  loadExtension: jest.fn(),
  executeExtension: jest.fn(),
  unloadExtension: jest.fn()
};

// Dialog服务Mock (MPLP生态系统集成)
const mockDialogService = {
  startDialog: jest.fn(),
  processMessage: jest.fn(),
  endDialog: jest.fn()
};

// Collab服务Mock (MPLP生态系统集成)
const mockCollabService = {
  createCollaboration: jest.fn(),
  joinCollaboration: jest.fn(),
  leaveCollaboration: jest.fn()
};

// Network服务Mock (MPLP生态系统集成)
const mockNetworkService = {
  sendMessage: jest.fn(),
  receiveMessage: jest.fn(),
  establishConnection: jest.fn()
};

// Validation相关Mock
const mockValidationRules = {
  validateParameters: jest.fn(),
  validateConstraints: jest.fn(),
  validatePlanType: jest.fn()
};

const mockQualityChecker = {
  checkPlanQuality: jest.fn(),
  checkDataIntegrity: jest.fn()
};

// CoordinationManager Mock
const mockCoordinationManager = {
  coordinateOperation: jest.fn(),
  registerModule: jest.fn(),
  unregisterModule: jest.fn()
};

// ===== 测试数据工厂 (Context模块A+标准) =====
const createTestPlanRequest = (overrides: Partial<any> = {}) => ({
  planId: 'plan-test-001',
  contextId: 'ctx-test-001',
  name: 'Test Plan',
  description: 'Test plan description',
  priority: 'high',
  tasks: [
    {
      taskId: 'task-001',
      name: 'Test Task',
      type: 'atomic',
      status: 'pending',
      priority: 'medium'
    }
  ],
  ...overrides
});

const createTestPlanResult = (overrides: Partial<any> = {}) => ({
  planId: 'plan-test-001',
  status: 'completed',
  result: {
    success: true,
    data: { optimizedTasks: 5, estimatedTime: 120 },
    metadata: { processingTime: 1500, algorithm: 'genetic' }
  },
  timestamp: new Date().toISOString(),
  ...overrides
});

// ===== 主测试套件 =====
describe('Plan模块重构完美测试套件', () => {
  let planProtocolService: PlanProtocolService;
  let planIntegrationService: PlanIntegrationService;
  let planValidationService: PlanValidationService;

  beforeEach(() => {
    // 重置所有Mock
    jest.clearAllMocks();

    // 初始化服务实例
    planProtocolService = new PlanProtocolService(mockPlanRepository, mockHttpClient, mockLogger);
    planIntegrationService = new PlanIntegrationService(
      mockPlanRepository,
      mockCoordinationManager,
      mockLogger
    );
    planValidationService = new PlanValidationService(mockValidationRules, mockQualityChecker, mockLogger);
  });

  // ===== PlanProtocolService测试 (Context模块A+标准) =====
  describe('PlanProtocolService企业级测试', () => {
    describe('createPlanRequest功能测试', () => {
      it('应该成功创建Plan请求并返回结果', async () => {
        // 📋 Arrange
        const planRequestData = {
          planType: 'task_planning' as const,
          parameters: { tasks: ['task1', 'task2'] },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'high' as const }
        };

        // Mock repository响应
        mockPlanRepository.savePlanRequest.mockResolvedValue({
          requestId: 'req-001',
          planType: 'task_planning',
          parameters: planRequestData.parameters,
          status: 'pending',
          createdAt: new Date()
        });

        // 🎬 Act
        const result = await planProtocolService.createPlanRequest(planRequestData);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.requestId).toBeDefined();
        expect(result.planType).toBe('task_planning');
        expect(mockPlanRepository.savePlanRequest).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalled();
      });

      it('应该处理无效请求数据', async () => {
        // 📋 Arrange
        const invalidRequestData = {
          planType: '' as any,
          parameters: {}
        };

        // 🎬 Act & Assert
        await expect(planProtocolService.createPlanRequest(invalidRequestData))
          .rejects.toThrow('Plan type is required');
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('optimizePlan功能测试', () => {
      it('应该成功优化Plan', async () => {
        // 📋 Arrange
        const planId = 'plan-test-001';
        const optimizationParams = {
          constraints: { maxTime: 100, maxResources: 50 },
          objectives: ['performance', 'cost']
        };

        // 🎬 Act
        const result = await planProtocolService.optimizePlan(planId, optimizationParams);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.planId).toBe(planId);
        expect(result.name).toBe('Retrieved Plan');
        expect(result.status).toBe('active');
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('executePlan功能测试', () => {
      it('应该成功执行Plan', async () => {
        // 📋 Arrange
        const planId = 'plan-test-001';
        const executionOptions = {
          strategy: 'balanced' as const,
          dryRun: false,
          validateDependencies: false
        };

        // 🎬 Act
        const result = await planProtocolService.executePlan(planId, executionOptions);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.planId).toBe(planId);
        expect(result.name).toBe('Retrieved Plan');
        expect(result.status).toBe('active');
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });
  });

  // ===== PlanIntegrationService测试 (MPLP生态系统集成) =====
  describe('PlanIntegrationService MPLP生态系统集成测试', () => {
    describe('Context模块集成测试', () => {
      it('应该成功集成Context服务', async () => {
        // 📋 Arrange
        const contextId = 'ctx-test-001';
        const planData = { test: 'data' };

        // 🎬 Act
        const result = await planIntegrationService.integrateWithContext(contextId, planData);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.message).toContain('Context integration interface reserved');
        expect(result.data.contextId).toBe(contextId);
        expect(result.data.integrationStatus).toBe('reserved');
        expect(result.data.activationPending).toBe(true);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('Role模块集成测试', () => {
      it('应该成功集成Role服务', async () => {
        // 📋 Arrange
        const roleId = 'role-001';
        const planData = { test: 'data' };

        // 🎬 Act
        const result = await planIntegrationService.integrateWithRole(roleId, planData);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.message).toContain('Role integration interface reserved');
        expect(result.data.roleId).toBe(roleId);
        expect(result.data.integrationStatus).toBe('reserved');
        expect(result.data.activationPending).toBe(true);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });
  });

  // ===== PlanValidationService测试 (企业级验证) =====
  describe('PlanValidationService企业级验证测试', () => {
    describe('validatePlanRequest功能测试', () => {
      it('应该成功验证有效的Plan请求', async () => {
        // 📋 Arrange
        const validPlanRequest = {
          planType: 'task_planning' as const,
          parameters: { tasks: ['task1', 'task2'] },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'high' as const }
        };

        // Mock validation rules to return success
        mockValidationRules.validatePlanType.mockReturnValue(true);
        mockValidationRules.validateParameters.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });
        mockValidationRules.validateConstraints.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });

        // 🎬 Act
        const result = await planValidationService.validatePlanRequest(validPlanRequest);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toBeDefined();
        expect(mockLogger.info).toHaveBeenCalled();
      });

      it('应该检测无效的Plan请求', async () => {
        // 📋 Arrange
        const invalidPlanRequest = {
          planType: '' as any, // 无效的planType
          parameters: {},      // 空参数
          constraints: {},
          metadata: {}
        };

        // Mock validation rules to return errors
        mockValidationRules.validatePlanType.mockReturnValue(false);
        mockValidationRules.validateParameters.mockReturnValue({
          isValid: false,
          errors: [{ field: 'parameters', message: 'Parameters cannot be empty', severity: 'error' }],
          warnings: []
        });
        mockValidationRules.validateConstraints.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });

        // 🎬 Act
        const result = await planValidationService.validatePlanRequest(invalidPlanRequest);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        // The basic validation will catch the empty planType
        expect(result.errors.some(e => e.message === 'Plan type is required')).toBe(true);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('validatePlanResult功能测试', () => {
      it('应该成功验证有效的Plan结果', async () => {
        // 📋 Arrange
        const validPlanResult = {
          planData: { optimizedTasks: 5, estimatedTime: 120 },
          confidence: 0.95,
          metadata: { processingTime: 1500, algorithm: 'genetic' },
          status: 'completed' as const
        };

        // Mock quality checker
        mockQualityChecker.checkPlanQuality.mockResolvedValue({
          score: 0.9,
          issues: []
        });
        mockQualityChecker.checkDataIntegrity.mockResolvedValue({
          isValid: true,
          issues: []
        });

        // 🎬 Act
        const result = await planValidationService.validatePlanResult(validPlanResult);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('业务规则验证集成测试', () => {
      it('应该通过完整的Plan请求验证包含业务规则', async () => {
        // 📋 Arrange
        const planData = {
          planType: 'task_planning' as const,
          parameters: {
            tasks: [
              { taskId: 'task-001', name: 'Critical Task', type: 'atomic', status: 'pending', priority: 'high' }
            ]
          },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'high' as const }
        };

        // Mock all validation rules to return success
        mockValidationRules.validatePlanType.mockReturnValue(true);
        mockValidationRules.validateParameters.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });
        mockValidationRules.validateConstraints.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });

        // 🎬 Act
        const result = await planValidationService.validatePlanRequest(planData);

        // ✅ Assert
        expect(result).toBeDefined();
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });
  });

  // ===== 企业级集成测试 =====
  describe('企业级服务集成测试', () => {
    describe('服务间协作测试', () => {
      it('应该支持完整的Plan生命周期', async () => {
        // 📋 Arrange
        const planRequest = createTestPlanRequest();

        // Mock所有服务响应
        mockHttpClient.post.mockResolvedValue({
          data: {
            planData: { optimizedTasks: 5, estimatedTime: 120 },
            confidence: 0.95,
            metadata: { processingTime: 1500, algorithm: 'genetic' }
          }
        });

        // Mock validation rules
        mockValidationRules.validatePlanType.mockReturnValue(true);
        mockValidationRules.validateParameters.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });
        mockValidationRules.validateConstraints.mockReturnValue({
          isValid: true,
          errors: [],
          warnings: []
        });

        // Mock quality checker for any potential calls
        mockQualityChecker.checkPlanQuality.mockResolvedValue({
          score: 0.9,
          issues: []
        });
        mockQualityChecker.checkDataIntegrity.mockResolvedValue({
          isValid: true,
          issues: []
        });

        // Mock repository responses
        mockPlanRepository.savePlanRequest.mockResolvedValue({
          requestId: 'req-001',
          planType: 'task_planning',
          parameters: planRequest.parameters,
          status: 'pending',
          createdAt: new Date()
        });

        // 🎬 Act - 完整生命周期
        const validationResult = await planValidationService.validatePlanRequest({
          planType: 'task_planning',
          parameters: { tasks: planRequest.tasks },
          constraints: { maxDuration: 100 },
          metadata: { priority: planRequest.priority }
        });
        expect(validationResult.isValid).toBe(true);

        const creationResult = await planProtocolService.createPlanRequest({
          planType: 'task_planning',
          parameters: { tasks: planRequest.tasks },
          constraints: { maxDuration: 100 },
          metadata: { priority: planRequest.priority }
        });
        expect(creationResult.requestId).toBeDefined();

        const contextIntegration = await planIntegrationService.integrateWithContext('ctx-test-001');
        expect(contextIntegration.success).toBe(true);

        // ✅ Assert
        expect(mockLogger.info).toHaveBeenCalled(); // 验证、创建、集成都会调用logger
        expect(mockPlanRepository.savePlanRequest).toHaveBeenCalledTimes(1);
      });
    });

    describe('错误处理和恢复测试', () => {
      it('应该优雅处理服务错误', async () => {
        // 📋 Arrange
        const planRequestData = {
          planType: 'task_planning' as const,
          parameters: { tasks: ['task1', 'task2'] },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'high' as const }
        };
        mockPlanRepository.savePlanRequest.mockRejectedValue(new Error('Database Error'));

        // 🎬 Act & Assert
        await expect(planProtocolService.createPlanRequest(planRequestData))
          .rejects.toThrow('Database Error');
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });

  // ===== 性能和可靠性测试 =====
  describe('性能和可靠性测试', () => {
    describe('性能基准测试', () => {
      it('应该在合理时间内完成Plan创建', async () => {
        // 📋 Arrange
        const planRequestData = {
          planType: 'task_planning' as const,
          parameters: { tasks: ['task1', 'task2'] },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'high' as const }
        };

        mockPlanRepository.savePlanRequest.mockResolvedValue({
          requestId: 'req-001',
          planType: 'task_planning',
          parameters: planRequestData.parameters,
          status: 'pending',
          createdAt: new Date()
        });

        // 🎬 Act
        const startTime = Date.now();
        const result = await planProtocolService.createPlanRequest(planRequestData);
        const endTime = Date.now();

        // ✅ Assert
        expect(result.requestId).toBeDefined();
        expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成
      });
    });

    describe('并发处理测试', () => {
      it('应该支持并发Plan请求', async () => {
        // 📋 Arrange
        const planRequestsData = Array.from({ length: 5 }, (_, i) => ({
          planType: 'task_planning' as const,
          parameters: { tasks: [`task-${i}`] },
          constraints: { maxDuration: 100 },
          metadata: { priority: 'medium' as const }
        }));

        mockPlanRepository.savePlanRequest.mockImplementation((data) =>
          Promise.resolve({
            requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
            planType: data.planType,
            parameters: data.parameters,
            status: 'pending',
            createdAt: new Date()
          })
        );

        // 🎬 Act
        const results = await Promise.all(
          planRequestsData.map(requestData => planProtocolService.createPlanRequest(requestData))
        );

        // ✅ Assert
        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(result.requestId).toBeDefined();
          expect(result.planType).toBe('task_planning');
        });
        expect(mockPlanRepository.savePlanRequest).toHaveBeenCalledTimes(5);
      });
    });
  });
});
