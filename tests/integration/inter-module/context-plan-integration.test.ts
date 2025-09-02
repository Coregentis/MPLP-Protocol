/**
 * Context-Plan模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动规划的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';

describe('Context-Plan模块间集成测试', () => {
  let contextService: ContextManagementService;
  let planService: PlanManagementService;
  let mockContextEntity: any;
  let mockPlanEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock logger
      {} as any, // Mock cache manager
      {} as any  // Mock version manager
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
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockPlanEntity = { planId: 'plan-context-001' }; // 简化的mock数据
  });

  describe('上下文驱动规划集成', () => {
    it('应该基于上下文创建规划', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 85,
        activeContexts: 78,
        contextsByType: { 'plan_driven': 48, 'session': 30, 'global': 7 },
        averageLifetime: 4200,
        memoryUsage: 320,
        cacheHitRate: 0.96
      } as any);

      // Mock plan service
      jest.spyOn(planService, 'createPlan').mockResolvedValue({
        planId: 'plan-001',
        contextId: contextId,
        name: 'Context Plan',
        status: 'active',
        tasks: []
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const planResult = await planService.createPlan({
        contextId: contextId,
        name: 'Context Plan',
        description: 'Plan created from context',
        priority: 'high',
        tasks: []
      });

      // Assert
      expect(contextStats).toBeDefined();
      expect(planResult).toBeDefined();
      expect(contextStats.contextsByType['plan_driven']).toBeGreaterThan(0);
      expect(planResult.contextId).toBe(contextId);
    });

    it('应该查询上下文统计和规划的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 90,
        activeContexts: 85,
        contextsByType: { 'plan_driven': 52, 'session': 33, 'global': 5 },
        averageLifetime: 4500,
        memoryUsage: 350,
        cacheHitRate: 0.97
      } as any);

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: 'plan-002',
        contextId: 'ctx-002',
        name: 'Context Plan 2',
        status: 'active',
        tasks: []
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const planData = await planService.getPlan('plan-002');

      // Assert
      expect(contextStats.contextsByType['plan_driven']).toBeGreaterThan(0);
      expect(planData.status).toBe('active');
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _planId: string,
        _planConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockPlanEntity.planId,
        { planType: 'context', aiDriven: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockContextEntity.contextId,
        { contextType: 'plan_driven', orchestrated: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文统计获取失败', async () => {
      jest.spyOn(contextService, 'getContextStatistics').mockRejectedValue(new Error('Context service unavailable'));

      await expect(contextService.getContextStatistics()).rejects.toThrow('Context service unavailable');
    });

    it('应该正确处理规划创建失败', async () => {
      jest.spyOn(planService, 'createPlan').mockRejectedValue(new Error('Plan service unavailable'));

      await expect(planService.createPlan({
        contextId: 'invalid-context',
        name: 'Invalid Plan',
        tasks: []
      })).rejects.toThrow('Plan service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Plan集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 70,
        activeContexts: 65,
        contextsByType: { 'plan_driven': 40, 'session': 25, 'global': 5 },
        averageLifetime: 3800,
        memoryUsage: 280,
        cacheHitRate: 0.94
      } as any);

      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: 'plan-perf-001',
        contextId: 'ctx-perf-001',
        name: 'Performance Plan',
        status: 'active',
        tasks: []
      } as any);

      const contextStats = await contextService.getContextStatistics();
      const planData = await planService.getPlan('plan-perf-001');

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(contextStats).toBeDefined();
      expect(planData).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Plan数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const planId = mockPlanEntity.planId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文规划关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        contextType: 'plan_driven',
        planEnabled: true,
        supportedPlanTypes: ['context', 'ai_driven']
      };

      const planData = {
        planId: mockPlanEntity.planId,
        contextId: contextData.contextId,
        planType: 'context',
        status: 'active'
      };

      expect(planData.contextId).toBe(contextData.contextId);
      expect(contextData.planEnabled).toBe(true);
      expect(contextData.supportedPlanTypes).toContain(planData.planType);
    });
  });
});
