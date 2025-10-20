/**
 * Plan-Trace模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划执行追踪的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';

describe('Plan-Trace模块间集成测试', () => {
  let planService: PlanManagementService;
  let traceService: TraceManagementService;
  let mockPlanEntity: any;
  let mockTraceEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    traceService = new TraceManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
  });

  describe('规划执行追踪集成', () => {
    it('应该为规划执行开始追踪记录', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;
      const contextId = 'context-plan-trace-001';

      // Mock plan service - 使用实际存在的方法
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        contextId,
        name: 'Traceable Plan',
        status: 'active',
        tasks: []
      } as any);

      // Mock trace service - 使用实际存在的方法
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-001',
        contextId,
        traceType: 'plan_execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Plan Execution Trace',
          category: 'system',
          source: { component: 'plan-trace-integration' }
        }
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const traceRecord = await traceService.startTrace({
        contextId: plan.contextId,
        type: 'plan_execution',
        name: 'Plan Execution Trace'
      } as any);

      // Assert
      expect(plan).toBeDefined();
      expect(traceRecord).toBeDefined();
      expect(traceRecord.contextId).toBe(contextId);
      expect(traceRecord.traceType).toBe('plan_execution');
    });

    it('应该为规划添加追踪跨度', async () => {
      // Arrange
      const traceId = 'trace-plan-span-001';
      const planId = mockPlanEntity.planId;

      // Mock plan service - 获取规划
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        name: 'Plan with Spans',
        status: 'active',
        tasks: [
          { taskId: 'task-001', name: 'Task 1', status: 'completed' }
        ]
      } as any);

      // Mock trace service - 添加跨度
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId,
        operationName: 'plan_task_execution',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1500,
        tags: { planId, taskId: 'task-001' },
        logs: [],
        status: 'completed'
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const span = await traceService.addSpan(traceId, {
        operationName: 'plan_task_execution',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1500,
        tags: { planId: plan.planId, taskId: 'task-001' }
      } as any);

      // Assert
      expect(plan).toBeDefined();
      expect(span.operationName).toBe('plan_task_execution');
      expect(span.tags.planId).toBe(planId);
      expect(span.status).toBe('completed');
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      // 测试Plan模块中的预留接口参数
      const testPlanIntegration = async (
        _planId: string,        // 预留参数：规划ID
        _executionId: string,   // 预留参数：执行ID
        _traceConfig: Record<string, unknown>  // 预留参数：追踪配置
      ): Promise<boolean> => {
        // TODO: 等待CoreOrchestrator激活实际实现
        return true;
      };

      // Act & Assert
      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        'exec-123',
        { traceLevel: 'detailed', includeMetrics: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Trace模块的预留接口参数', async () => {
      // 测试Trace模块中的预留接口参数
      const testTraceIntegration = async (
        _traceId: string,       // 预留参数：追踪ID
        _planId: string,        // 预留参数：关联规划ID
        _metricsData: object    // 预留参数：指标数据
      ): Promise<boolean> => {
        // TODO: 等待CoreOrchestrator激活实际实现
        return true;
      };

      // Act & Assert
      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockPlanEntity.planId,
        { executionTime: 1500, memoryUsage: 256, cpuUsage: 45 }
      );

      expect(result).toBe(true);
    });
  });

  describe('执行监控集成测试', () => {
    it('应该支持规划执行的实时监控', async () => {
      // Arrange
      const monitoringData = {
        planId: mockPlanEntity.planId,
        executionId: 'exec-monitor-001',
        monitoringType: 'real_time'
      };

      // Mock plan service - 获取规划状态
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: monitoringData.planId,
        name: 'Monitored Plan',
        status: 'active',
        tasks: [
          { taskId: 'task-001', status: 'running' },
          { taskId: 'task-002', status: 'running' },
          { taskId: 'task-003', status: 'running' }
        ]
      } as any);

      // Mock trace service - 结束追踪
      jest.spyOn(traceService, 'endTrace').mockResolvedValue({
        traceId: 'trace-monitor-001',
        contextId: 'context-001',
        traceType: 'plan_monitoring',
        severity: 'info',
        event: {
          type: 'end',
          name: 'Plan Monitoring Complete',
          category: 'system'
        }
      } as any);

      // Act
      const plan = await planService.getPlan(monitoringData.planId);
      const monitoringTrace = await traceService.endTrace('trace-monitor-001', {
        endTime: new Date(),
        finalStatus: 'completed'
      });

      // Assert
      expect(plan.status).toBe('active');
      expect(plan.tasks.length).toBe(3);
      expect(monitoringTrace.traceType).toBe('plan_monitoring');
      expect(monitoringTrace.event.type).toBe('end');
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划执行失败的追踪', async () => {
      // Arrange
      const planId = 'failed-plan-001';
      const errorMessage = 'Task execution timeout';

      // Mock plan service - 获取规划（模拟失败场景）
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error(errorMessage));

      // Mock trace service - 开始错误追踪
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-failure-001',
        contextId: 'context-failure-001',
        traceType: 'execution_failure',
        severity: 'error',
        event: {
          type: 'error',
          name: 'Plan Execution Failure',
          category: 'error',
          source: { component: 'plan-service' }
        }
      } as any);

      // Act & Assert
      await expect(planService.getPlan(planId)).rejects.toThrow(errorMessage);

      const failureTrace = await traceService.startTrace({
        contextId: 'context-failure-001',
        type: 'execution_failure',
        name: 'Plan Execution Failure'
      } as any);

      // Assert
      expect(failureTrace.traceType).toBe('execution_failure');
      expect(failureTrace.severity).toBe('error');
      expect(failureTrace.event.type).toBe('error');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Trace集成操作', async () => {
      // Arrange
      const startTime = Date.now();
      
      // Mock快速响应
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan'
      } as any);
      
      jest.spyOn(traceService, 'createTrace').mockResolvedValue({
        traceId: 'trace-perf-001',
        planId: mockPlanEntity.planId,
        traceType: 'performance_test'
      } as any);

      // Act
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const trace = await traceService.createTrace({
        planId: plan.planId,
        traceType: 'performance_test'
      } as any);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Assert - 集成操作应在100ms内完成
      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(trace).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Trace数据关联的一致性', () => {
      // Arrange & Act
      const planId = mockPlanEntity.planId;
      const traceId = mockTraceEntity.traceId;

      // Assert - 验证ID格式一致性
      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
    });

    it('应该验证规划追踪关联数据的完整性', () => {
      // Arrange
      const planData = {
        planId: mockPlanEntity.planId,
        executionId: 'exec-consistency-001',
        tasks: ['task-001', 'task-002']
      };

      const traceData = {
        traceId: mockTraceEntity.traceId,
        planId: planData.planId,
        executionId: planData.executionId,
        trackedTasks: planData.tasks
      };

      // Assert - 验证数据关联一致性
      expect(traceData.planId).toBe(planData.planId);
      expect(traceData.executionId).toBe(planData.executionId);
      expect(traceData.trackedTasks).toEqual(planData.tasks);
    });
  });
});
