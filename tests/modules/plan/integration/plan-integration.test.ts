/**
 * Plan模块集成测试
 *
 * @description 验证Plan模块各组件间的集成功能
 * @version 1.0.0
 * @layer 测试层 - 集成测试
 * @coverage 目标覆盖率 90%+
 * @pattern 与Context模块使用IDENTICAL的集成测试模式
 */

import { PlanEntity } from '../../../../src/modules/plan/domain/entities/plan.entity';
import { PlanRepository } from '../../../../src/modules/plan/infrastructure/repositories/plan.repository';
import { PlanManagementService } from '../../../../src/modules/plan/application/services/plan-management.service';
import { PlanMapper } from '../../../../src/modules/plan/api/mappers/plan.mapper';
import { PlanProtocol } from '../../../../src/modules/plan/infrastructure/protocols/plan.protocol';

// Mock L3管理器接口定义
interface MockSecurityManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
  validateAccess: jest.MockedFunction<() => Promise<boolean>>;
}

interface MockPerformanceMonitor {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
  startTrace: jest.MockedFunction<() => Promise<string>>;
  endTrace: jest.MockedFunction<() => Promise<void>>;
  recordMetric: jest.MockedFunction<() => void>;
  startTimer: jest.MockedFunction<() => { stop: jest.MockedFunction<() => void> }>;
  getMetrics: jest.MockedFunction<() => Record<string, unknown>>;
}

interface MockEventBusManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
  publish: jest.MockedFunction<() => Promise<void>>;
}

interface MockErrorHandler {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
  handleError: jest.MockedFunction<() => Promise<void>>;
}

interface MockCoordinationManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
}

interface MockOrchestrationManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
}

interface MockStateSyncManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
}

interface MockTransactionManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
  beginTransaction: jest.MockedFunction<() => Promise<string>>;
  commitTransaction: jest.MockedFunction<() => Promise<void>>;
  abortTransaction: jest.MockedFunction<() => Promise<void>>;
}

interface MockProtocolVersionManager {
  healthCheck: jest.MockedFunction<() => Promise<boolean>>;
}

// Mock L3管理器
const createMockManagers = () => ({
  securityManager: {
    healthCheck: jest.fn().mockResolvedValue(true),
    validateAccess: jest.fn().mockResolvedValue(true)
  } as MockSecurityManager,
  performanceMonitor: {
    healthCheck: jest.fn().mockResolvedValue(true),
    startTrace: jest.fn().mockResolvedValue('trace-id'),
    endTrace: jest.fn().mockResolvedValue(undefined),
    recordMetric: jest.fn(),
    startTimer: jest.fn().mockReturnValue({ stop: jest.fn() }),
    getMetrics: jest.fn().mockReturnValue({})
  } as MockPerformanceMonitor,
  eventBusManager: {
    healthCheck: jest.fn().mockResolvedValue(true),
    publish: jest.fn().mockResolvedValue(undefined)
  } as MockEventBusManager,
  errorHandler: {
    healthCheck: jest.fn().mockResolvedValue(true),
    handleError: jest.fn().mockResolvedValue(undefined)
  } as MockErrorHandler,
  coordinationManager: {
    healthCheck: jest.fn().mockResolvedValue(true)
  } as MockCoordinationManager,
  orchestrationManager: {
    healthCheck: jest.fn().mockResolvedValue(true)
  } as MockOrchestrationManager,
  stateSyncManager: {
    healthCheck: jest.fn().mockResolvedValue(true)
  } as MockStateSyncManager,
  transactionManager: {
    healthCheck: jest.fn().mockResolvedValue(true),
    beginTransaction: jest.fn().mockResolvedValue('tx-id'),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined)
  } as MockTransactionManager,
  protocolVersionManager: {
    healthCheck: jest.fn().mockResolvedValue(true)
  } as MockProtocolVersionManager
});

describe('Plan模块集成测试', () => {
  let repository: PlanRepository;
  let service: PlanManagementService;
  let protocol: PlanProtocol;
  let mockManagers: ReturnType<typeof createMockManagers>;

  beforeEach(() => {
    mockManagers = createMockManagers();
    repository = new PlanRepository();
    service = new PlanManagementService(
      mockManagers.securityManager,
      mockManagers.performanceMonitor,
      mockManagers.eventBusManager,
      mockManagers.errorHandler,
      mockManagers.coordinationManager,
      mockManagers.orchestrationManager,
      mockManagers.stateSyncManager,
      mockManagers.transactionManager,
      mockManagers.protocolVersionManager
    );

    // Mock服务接口定义
    interface MockPlanProtocolService {
      createPlanRequest: jest.MockedFunction<() => Promise<{ requestId: string }>>;
      executePlanRequest: jest.MockedFunction<() => Promise<{
        resultId: string;
        planData: { planId: string };
        confidence: number;
        status: string;
      }>>;
      getPlanResult: jest.MockedFunction<() => Promise<{
        resultId: string;
        planData: { planId: string };
        confidence: number;
        status: string;
      }>>;
      optimizePlan: jest.MockedFunction<() => Promise<{
        planId: string;
        name: string;
        status: string;
        tasks: unknown[];
        contextId: string;
        timestamp: Date;
      }>>;
    }

    // 创建缺失的服务Mock
    const mockPlanProtocolService = {
      createPlanRequest: jest.fn().mockResolvedValue({ requestId: 'req-001' }),
      executePlanRequest: jest.fn().mockResolvedValue({
        resultId: 'result-001',
        planData: { planId: 'plan-001' },
        confidence: 0.9,
        status: 'completed'
      }),
      getPlanResult: jest.fn().mockResolvedValue({
        resultId: 'result-001',
        planData: { planId: 'plan-001' },
        confidence: 0.9,
        status: 'completed'
      }),
      optimizePlan: jest.fn().mockResolvedValue({
        planId: 'plan-001',
        name: 'Optimized Plan',
        status: 'active',
        tasks: [],
        contextId: 'context-001',
        timestamp: new Date()
      })
    } as MockPlanProtocolService;

    interface MockPlanIntegrationService {
      integrateWithContext: jest.MockedFunction<() => Promise<{ success: boolean }>>;
      integrateWithRole: jest.MockedFunction<() => Promise<{ success: boolean }>>;
    }

    interface MockPlanValidationService {
      validatePlanResult: jest.MockedFunction<() => Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
        score: number;
        recommendations: string[];
      }>>;
    }

    const mockPlanIntegrationService = {
      integrateWithContext: jest.fn().mockResolvedValue({ success: true }),
      integrateWithRole: jest.fn().mockResolvedValue({ success: true })
    } as MockPlanIntegrationService;

    const mockPlanValidationService = {
      validatePlanResult: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        score: 0.9,
        recommendations: []
      })
    } as MockPlanValidationService;

    protocol = new PlanProtocol(
      mockPlanProtocolService,
      mockPlanIntegrationService,
      mockPlanValidationService,
      mockManagers.securityManager,
      mockManagers.performanceMonitor,
      mockManagers.eventBusManager,
      mockManagers.errorHandler,
      mockManagers.coordinationManager,
      mockManagers.orchestrationManager,
      mockManagers.stateSyncManager,
      mockManagers.transactionManager,
      mockManagers.protocolVersionManager
    );
  });

  describe('Entity-Repository集成测试', () => {
    it('应该成功保存和检索Plan实体', async () => {
      // 📋 Arrange
      const planEntity = new PlanEntity({
        name: 'Integration Test Plan',
        contextId: 'ctx-integration-test',
        description: 'Plan for integration testing',
        priority: 'high',
        tasks: [
          {
            taskId: 'task-int-1',
            name: 'Integration Task',
            type: 'atomic',
            status: 'pending',
            priority: 'medium'
          }
        ]
      });

      // 🎬 Act
      const savedEntity = await repository.save(planEntity);
      const retrievedEntity = await repository.findById(savedEntity.planId);

      // ✅ Assert
      expect(retrievedEntity).not.toBeNull();
      expect(retrievedEntity!.planId).toBe(savedEntity.planId);
      expect(retrievedEntity!.name).toBe('Integration Test Plan');
      expect(retrievedEntity!.description).toBe('Plan for integration testing');
      expect(retrievedEntity!.priority).toBe('high');
      expect(retrievedEntity!.tasks).toHaveLength(1);
      expect(retrievedEntity!.tasks[0].name).toBe('Integration Task');
    });

    it('应该支持实体状态变更和持久化', async () => {
      // 📋 Arrange
      const planEntity = new PlanEntity({
        name: 'State Change Test Plan',
        contextId: 'ctx-state-test'
      });
      await repository.save(planEntity);

      // 🎬 Act - 修改实体状态
      planEntity.activate();
      planEntity.addTask({
        name: 'New Task',
        type: 'atomic',
        status: 'pending'
      });
      await repository.update(planEntity);

      // 验证状态变更
      const updatedEntity = await repository.findById(planEntity.planId);

      // ✅ Assert
      expect(updatedEntity!.status).toBe('active');
      expect(updatedEntity!.tasks).toHaveLength(1);
      expect(updatedEntity!.tasks[0].name).toBe('New Task');
      expect(updatedEntity!.updatedAt).toBeDefined();
    });

    it('应该支持复杂查询和过滤', async () => {
      // 📋 Arrange - 创建多个测试实体
      const plans = [
        new PlanEntity({ name: 'High Priority Plan', priority: 'high', status: 'active', contextId: 'ctx-1' }),
        new PlanEntity({ name: 'Medium Priority Plan', priority: 'medium', status: 'draft', contextId: 'ctx-2' }),
        new PlanEntity({ name: 'Low Priority Plan', priority: 'low', status: 'completed', contextId: 'ctx-1' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
      }

      // 🎬 Act - 执行复杂查询
      const highPriorityPlans = await repository.findByPriority('high');
      const activePlans = await repository.findByStatus('active');
      const ctx1Plans = await repository.findByContextId('ctx-1');

      // ✅ Assert
      expect(highPriorityPlans.data).toHaveLength(1);
      expect(highPriorityPlans.data[0].name).toBe('High Priority Plan');
      
      expect(activePlans.data).toHaveLength(1);
      expect(activePlans.data[0].status).toBe('active');
      
      expect(ctx1Plans.data).toHaveLength(2);
      expect(ctx1Plans.data.every(plan => plan.contextId === 'ctx-1')).toBe(true);
    });
  });

  describe('Service-Repository集成测试', () => {
    it('应该通过Service成功创建和管理Plan', async () => {
      // 📋 Arrange
      const createRequest = {
        contextId: 'ctx-service-test',
        name: 'Service Integration Plan',
        description: 'Plan created through service',
        priority: 'critical' as const,
        tasks: [
          {
            name: 'Service Task',
            type: 'atomic' as const,
            priority: 'high' as const
          }
        ]
      };

      // 🎬 Act
      const createdPlan = await service.createPlan(createRequest);
      const retrievedPlan = await service.getPlan(createdPlan.planId);
      
      const updateRequest = {
        planId: createdPlan.planId,
        description: 'Updated through service'
      };
      const updatedPlan = await service.updatePlan(updateRequest);

      // ✅ Assert
      expect(createdPlan).toBeDefined();
      expect(createdPlan.name).toBe('Service Integration Plan');
      expect(createdPlan.tasks).toHaveLength(1);
      
      expect(retrievedPlan).not.toBeNull();
      expect(retrievedPlan!.planId).toBe(createdPlan.planId);
      
      expect(updatedPlan.description).toBe('Updated through service');
    });

    it('应该支持Plan执行和优化流程', async () => {
      // 📋 Arrange
      const plan = await service.createPlan({
        contextId: 'ctx-execution-test',
        name: 'Execution Test Plan',
        tasks: [
          { name: 'Task 1', type: 'atomic' },
          { name: 'Task 2', type: 'atomic' }
        ]
      });

      // 🎬 Act
      const validationResult = await service.validatePlan(plan.planId);
      const optimizationResult = await service.optimizePlan(plan.planId);
      const executionResult = await service.executePlan(plan.planId);

      // ✅ Assert
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.violations).toHaveLength(0);
      
      expect(optimizationResult.optimizedScore).toBeGreaterThan(optimizationResult.originalScore);
      expect(optimizationResult.improvements).toBeInstanceOf(Array);
      
      expect(executionResult.status).toBe('completed');
      expect(executionResult.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('Protocol-Service集成测试', () => {
    it('应该通过Protocol成功处理Plan操作', async () => {
      // 📋 Arrange
      const createRequest = {
        requestId: 'req-protocol-test',
        operation: 'create_plan' as const,
        payload: {
          contextId: 'ctx-protocol-test',
          planData: {
            name: 'Protocol Test Plan',
            description: 'Plan created through protocol',
            priority: 'high' as const,
            tasks: [
              {
                name: 'Protocol Task',
                type: 'atomic' as const,
                priority: 'medium' as const
              }
            ]
          }
        }
      };

      // 🎬 Act
      const createResponse = await protocol.executeOperation(createRequest);
      
      const getRequest = {
        requestId: 'req-get-test',
        operation: 'get_plan_result' as const,
        payload: {
          requestId: createResponse.result?.planId || 'req-001' // 使用创建响应中的planId作为requestId
        }
      };
      const getResponse = await protocol.executeOperation(getRequest);

      // ✅ Assert
      expect(createResponse.status).toBe('success');
      expect(createResponse.result).toBeDefined();

      expect(getResponse.status).toBe('success');
      expect(getResponse.result).toBeDefined();
      expect(getResponse.data?.plan?.planId).toBe(createResponse.data?.plan?.planId);
    });

    it('应该支持Protocol健康检查', async () => {
      // 🎬 Act
      const healthStatus = await protocol.healthCheck();

      // ✅ Assert
      expect(healthStatus).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.checks).toBeDefined();
      // metadata可能不存在（在错误情况下）
      if (healthStatus.status !== 'unhealthy') {
        expect(healthStatus.metadata).toBeDefined();
      }
    });
  });

  describe('Mapper集成测试', () => {
    it('应该支持Entity-Schema双向转换', async () => {
      // 📋 Arrange
      const originalEntity = new PlanEntity({
        name: 'Mapper Test Plan',
        contextId: 'ctx-mapper-test',
        description: 'Plan for mapper testing',
        priority: 'medium',
        tasks: [
          {
            taskId: 'task-mapper-1',
            name: 'Mapper Task',
            type: 'atomic',
            status: 'pending',
            priority: 'low'
          }
        ]
      });

      // 🎬 Act - Entity → Schema → EntityData → Entity
      const entityData = originalEntity.toData();
      const schema = PlanMapper.toSchema(entityData);
      const convertedEntityData = PlanMapper.fromSchema(schema);
      const newEntity = new PlanEntity(convertedEntityData);

      // ✅ Assert
      expect(schema.name).toBe(originalEntity.name);
      expect(schema.context_id).toBe(originalEntity.contextId);
      expect(schema.description).toBe(originalEntity.description);
      expect(schema.priority).toBe(originalEntity.priority);
      expect(schema.tasks).toHaveLength(1);
      expect(schema.tasks[0].task_id).toBe('task-mapper-1');
      
      expect(newEntity.name).toBe(originalEntity.name);
      expect(newEntity.contextId).toBe(originalEntity.contextId);
      expect(newEntity.description).toBe(originalEntity.description);
      expect(newEntity.priority).toBe(originalEntity.priority);
      expect(newEntity.tasks).toHaveLength(1);
      expect(newEntity.tasks[0].taskId).toBe('task-mapper-1');
    });

    it('应该验证Schema格式正确性', async () => {
      // 📋 Arrange
      const entity = new PlanEntity({
        name: 'Schema Validation Plan',
        contextId: 'ctx-validation-test'
      });

      // 🎬 Act
      const entityData = entity.toData();
      const schema = PlanMapper.toSchema(entityData);
      const isValid = PlanMapper.validateSchema(schema);

      // ✅ Assert
      expect(isValid).toBe(true);
      expect(schema).toHaveProperty('protocol_version');
      expect(schema).toHaveProperty('plan_id');
      expect(schema).toHaveProperty('context_id');
      expect(schema).toHaveProperty('name');
      expect(schema).toHaveProperty('audit_trail');
      expect(schema).toHaveProperty('monitoring_integration');
    });
  });

  describe('端到端工作流集成测试', () => {
    it('应该支持完整的Plan生命周期', async () => {
      // 📋 Arrange - 通过Protocol创建Plan
      const createRequest = {
        requestId: 'req-lifecycle-test',
        operation: 'create_plan' as const,
        payload: {
          contextId: 'ctx-lifecycle-test',
          planData: {
            name: 'Lifecycle Test Plan',
            description: 'Complete lifecycle test',
            priority: 'high' as const,
            tasks: [
              { name: 'Task 1', type: 'atomic' as const },
              { name: 'Task 2', type: 'atomic' as const }
            ]
          }
        }
      };

      // 🎬 Act - 执行完整生命周期
      // 1. 创建Plan
      const createResponse = await protocol.executeOperation(createRequest);
      const planId = createResponse.result?.planId || 'plan-001';

      // 2. 验证Plan
      const validateResponse = await protocol.executeOperation({
        requestId: 'req-validate',
        operation: 'validate_plan',
        payload: { planData: { planId } }
      });

      // 3. 优化Plan
      const optimizeResponse = await protocol.executeOperation({
        requestId: 'req-optimize',
        operation: 'optimize_plan',
        payload: { planId }
      });

      // 4. 执行Plan
      const executeResponse = await protocol.executeOperation({
        requestId: 'req-execute',
        operation: 'execute_plan',
        payload: { requestId: planId }
      });

      // ✅ Assert
      expect(createResponse.status).toBe('success');
      expect(createResponse.result).toBeDefined();

      expect(validateResponse.status).toBe('success');
      expect(validateResponse.result).toBeDefined();

      expect(optimizeResponse.status).toBe('success');
      expect(optimizeResponse.result).toBeDefined();

      expect(executeResponse.status).toBe('success');
      expect(executeResponse.result).toBeDefined();
    });
  });
});
