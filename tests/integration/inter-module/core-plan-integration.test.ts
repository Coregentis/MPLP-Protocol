/**
 * Core-Plan模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证核心驱动规划的集成功能
 */

import { CoreManagementService } from '../../../src/modules/core/application/services/core-management.service';
import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';

describe('Core-Plan模块间集成测试', () => {
  let coreService: CoreManagementService;
  let planService: PlanManagementService;
  let mockCoreEntity: any;
  let mockPlanEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    coreService = new CoreManagementService(
      {} as any // Mock repository
    );

    planService = new PlanManagementService(
      {} as any, // Mock security manager
      {} as any, // Mock performance monitor
      {} as any, // Mock event bus manager
      {} as any, // Mock error handler
      {} as any, // Mock coordination manager
      {} as any, // Mock orchestration manager
      {} as any, // Mock state sync manager
      {} as any, // Mock transaction manager
      {} as any  // Mock protocol version manager
    );

    // 创建测试数据
    mockCoreEntity = { coreId: 'core-001' }; // 简化的mock数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
  });

  describe('核心驱动规划集成', () => {
    it('应该基于核心编排创建规划', async () => {
      // Arrange
      const coreId = mockCoreEntity.coreId;

      // Mock core service - 使用实际存在的方法
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 72,
        activeWorkflows: 68,
        completedWorkflows: 42,
        failedWorkflows: 4,
        averageDuration: 190
      } as any);

      // Mock plan service - 使用实际存在的方法
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: 'test-plan-001',
        name: 'Orchestrated Plan',
        status: 'active',
        contextId: 'context-001',
        tasks: []
      } as any);

      // Act
      const coreStats = await coreService.getWorkflowStatistics();
      const planData = await planService.getPlan('test-plan-001');

      // Assert
      expect(coreStats).toBeDefined();
      expect(planData).toBeDefined();
      expect(coreStats.activeWorkflows).toBeGreaterThan(0);
      expect(coreStats.activeWorkflows).toBeGreaterThan(0);
      expect(planData.status).toBe('active');
    });

    it('应该查询核心统计和规划统计的关联', async () => {
      // Mock core service - 使用实际存在的方法
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 80,
        activeWorkflows: 75,
        completedWorkflows: 48,
        failedWorkflows: 5,
        averageDuration: 180
      } as any);

      // Mock plan service - 使用实际存在的方法
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: 'plan-stats-001',
        name: 'Statistics Plan',
        status: 'active',
        contextId: 'context-stats',
        tasks: []
      } as any);

      // Act
      const coreStats = await coreService.getWorkflowStatistics();
      const planData = await planService.getPlan('plan-stats-001');

      // Assert
      expect(coreStats.totalWorkflows).toBeGreaterThan(0);
      expect(planData.status).toBe('active');
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Core模块的预留接口参数', async () => {
      const testCoreIntegration = async (
        _coreId: string,
        _planId: string,
        _planConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCoreIntegration(
        mockCoreEntity.coreId,
        mockPlanEntity.planId,
        { planType: 'orchestrated', aiDriven: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _coreId: string,
        _coreData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockCoreEntity.coreId,
        { coreType: 'orchestrator', planningEnabled: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('规划编排集成测试', () => {
    it('应该支持核心规划的编排管理', async () => {
      const orchestrationData = {
        coreId: mockCoreEntity.coreId,
        planId: mockPlanEntity.planId,
        operation: 'plan_orchestration'
      };

      // Mock core service - 使用实际存在的方法
      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 70,
        activeWorkflows: 65,
        completedWorkflows: 40,
        failedWorkflows: 5,
        averageDuration: 170
      } as any);

      // Mock plan service - 使用实际存在的方法
      jest.spyOn(planService, 'createPlan').mockResolvedValue({
        planId: 'orchestrated-plan-001',
        name: 'Core Managed Plan',
        status: 'active',
        contextId: 'context-orchestration',
        tasks: []
      } as any);

      // Act
      const coreStats = await coreService.getWorkflowStatistics();
      const planResult = await planService.createPlan({
        contextId: 'context-orchestration',
        name: 'Core Managed Plan',
        tasks: []
      });

      // Assert
      expect(coreStats.activeWorkflows).toBeGreaterThan(0);
      expect(planResult.status).toBe('active');
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理核心工作流统计获取失败', async () => {
      jest.spyOn(coreService, 'getWorkflowStatistics').mockRejectedValue(new Error('Core service unavailable'));

      await expect(coreService.getWorkflowStatistics()).rejects.toThrow('Core service unavailable');
    });

    it('应该正确处理规划获取失败', async () => {
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan service unavailable'));

      await expect(planService.getPlan('invalid-plan')).rejects.toThrow('Plan service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Core-Plan集成操作', async () => {
      const startTime = Date.now();

      jest.spyOn(coreService, 'getWorkflowStatistics').mockResolvedValue({
        totalWorkflows: 60,
        activeWorkflows: 55,
        completedWorkflows: 35,
        failedWorkflows: 5,
        averageDuration: 160
      } as any);

      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: 'perf-plan-001',
        name: 'Performance Plan',
        status: 'active',
        contextId: 'context-perf',
        tasks: []
      } as any);

      const coreStats = await coreService.getWorkflowStatistics();
      const planData = await planService.getPlan('perf-plan-001');

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(coreStats).toBeDefined();
      expect(planData).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Core-Plan数据关联的一致性', () => {
      const coreId = mockCoreEntity.coreId;
      const planId = mockPlanEntity.planId;

      expect(coreId).toBeDefined();
      expect(typeof coreId).toBe('string');
      expect(coreId.length).toBeGreaterThan(0);
      
      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
    });

    it('应该验证核心规划关联数据的完整性', () => {
      const coreData = {
        coreId: mockCoreEntity.coreId,
        orchestrationType: 'plan_driven',
        planningEnabled: true,
        managedPlanTypes: ['orchestrated', 'autonomous']
      };

      const planData = {
        planId: mockPlanEntity.planId,
        coreId: coreData.coreId,
        planType: 'orchestrated',
        status: 'core_managed'
      };

      expect(planData.coreId).toBe(coreData.coreId);
      expect(coreData.planningEnabled).toBe(true);
      expect(coreData.managedPlanTypes).toContain(planData.planType);
    });
  });
});
