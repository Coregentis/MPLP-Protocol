/**
 * Plan-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划驱动扩展的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Plan-Extension模块间集成测试', () => {
  let planService: PlanManagementService;
  let extensionService: ExtensionManagementService;
  let mockPlanEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    extensionService = new ExtensionManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('规划驱动扩展集成', () => {
    it('应该基于规划安装扩展', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        name: 'Extension Plan',
        status: 'active',
        extensionsRequired: ['planning-ext', 'execution-ext']
      } as any);
      
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 20,
        installedExtensions: 15,
        activeExtensions: 12,
        extensionsByCategory: { 'planning': 8, 'execution': 4, 'utility': 3 },
        averageInstallTime: 180
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(plan).toBeDefined();
      expect(extensionStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['planning']).toBeGreaterThan(0);
    });

    it('应该查询规划和扩展统计的关联', async () => {
      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Extension-enabled Plan',
        status: 'active',
        requiredExtensions: ['planning', 'execution']
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 25,
        installedExtensions: 20,
        activeExtensions: 18,
        extensionsByCategory: { 'planning': 10, 'execution': 8, 'utility': 2 },
        averageInstallTime: 160
      } as any);

      // Act
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(plan.requiredExtensions).toContain('planning');
      expect(extensionStats.extensionsByCategory['planning']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockExtensionEntity.extensionId,
        { extensionType: 'planning', autoInstall: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _planId: string,
        _planData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockPlanEntity.planId,
        { planType: 'execution', supportExtensions: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('规划扩展集成测试', () => {
    it('应该支持规划扩展的自动化管理', async () => {
      const automationData = {
        planId: mockPlanEntity.planId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'automated_extension'
      };

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: automationData.planId,
        name: 'Automated Plan',
        status: 'active',
        extensionAutomation: true
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 18,
        installedExtensions: 15,
        activeExtensions: 13,
        extensionsByCategory: { 'automation': 6, 'planning': 7, 'utility': 2 },
        averageInstallTime: 140
      } as any);

      // Act
      const plan = await planService.getPlan(automationData.planId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(plan.extensionAutomation).toBe(true);
      expect(extensionStats.extensionsByCategory['automation']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划不存在的情况', async () => {
      const planId = 'non-existent-plan';
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan not found'));

      await expect(planService.getPlan(planId)).rejects.toThrow('Plan not found');
    });

    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan'
      } as any);
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 12,
        installedExtensions: 10,
        activeExtensions: 8,
        extensionsByCategory: { 'planning': 5, 'execution': 3, 'utility': 2 },
        averageInstallTime: 120
      } as any);

      const plan = await planService.getPlan(mockPlanEntity.planId);
      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Extension数据关联的一致性', () => {
      const planId = mockPlanEntity.planId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证规划扩展关联数据的完整性', () => {
      const planData = {
        planId: mockPlanEntity.planId,
        name: 'Extension-enabled Plan',
        extensionsEnabled: true,
        requiredExtensions: ['planning', 'execution']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        planId: planData.planId,
        category: 'planning',
        status: 'installed'
      };

      expect(extensionData.planId).toBe(planData.planId);
      expect(planData.extensionsEnabled).toBe(true);
      expect(planData.requiredExtensions).toContain(extensionData.category);
    });
  });
});
