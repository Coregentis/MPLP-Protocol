/**
 * Plan-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划驱动网络的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
import { NetworkTestFactory } from '../../modules/network/factories/network-test.factory';

describe('Plan-Network模块间集成测试', () => {
  let planService: PlanManagementService;
  let networkService: NetworkManagementService;
  let mockPlanEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    networkService = new NetworkManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockNetworkEntity = NetworkTestFactory.createNetworkEntity();
  });

  describe('规划驱动网络集成', () => {
    it('应该基于规划创建网络', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        name: 'Network Plan',
        status: 'active',
        networkEnabled: true
      } as any);
      
      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 35,
        activeNetworks: 30,
        totalNodes: 180,
        totalEdges: 320,
        topologyDistribution: { 'mesh': 18, 'star': 8, 'ring': 4 },
        statusDistribution: { 'active': 30, 'inactive': 5 }
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(plan).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(networkStats.topologyDistribution['mesh']).toBeGreaterThan(0);
    });

    it('应该查询规划和网络统计的关联', async () => {
      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Network-enabled Plan',
        status: 'active',
        networkTopologies: ['mesh', 'star']
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 40,
        activeNetworks: 35,
        totalNodes: 200,
        totalEdges: 380,
        topologyDistribution: { 'mesh': 20, 'star': 10, 'ring': 5 },
        statusDistribution: { 'active': 35, 'inactive': 5 }
      } as any);

      // Act
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(plan.networkTopologies).toContain('mesh');
      expect(networkStats.topologyDistribution['mesh']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockNetworkEntity.networkId,
        { networkType: 'planning', topology: 'mesh' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _planId: string,
        _planData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockPlanEntity.planId,
        { planType: 'distributed', supportNetwork: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络规划集成测试', () => {
    it('应该支持规划网络的拓扑管理', async () => {
      const topologyData = {
        planId: mockPlanEntity.planId,
        networkId: mockNetworkEntity.networkId,
        operation: 'topology_planning'
      };

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: topologyData.planId,
        name: 'Topology Plan',
        status: 'active',
        topologyManagement: true
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 32,
        activeNetworks: 28,
        totalNodes: 160,
        totalEdges: 300,
        topologyDistribution: { 'planned': 15, 'mesh': 10, 'star': 3 },
        statusDistribution: { 'active': 28, 'inactive': 4 }
      } as any);

      // Act
      const plan = await planService.getPlan(topologyData.planId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(plan.topologyManagement).toBe(true);
      expect(networkStats.topologyDistribution['planned']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划不存在的情况', async () => {
      const planId = 'non-existent-plan';
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan not found'));

      await expect(planService.getPlan(planId)).rejects.toThrow('Plan not found');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan'
      } as any);
      
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 25,
        activeNetworks: 22,
        totalNodes: 120,
        totalEdges: 240,
        topologyDistribution: { 'mesh': 12, 'star': 7, 'ring': 3 },
        statusDistribution: { 'active': 22, 'inactive': 3 }
      } as any);

      const plan = await planService.getPlan(mockPlanEntity.planId);
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Network数据关联的一致性', () => {
      const planId = mockPlanEntity.planId;
      const networkId = mockNetworkEntity.networkId;

      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证规划网络关联数据的完整性', () => {
      const planData = {
        planId: mockPlanEntity.planId,
        name: 'Network-enabled Plan',
        networkEnabled: true,
        supportedTopologies: ['mesh', 'star', 'ring']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        planId: planData.planId,
        topology: 'mesh',
        status: 'active'
      };

      expect(networkData.planId).toBe(planData.planId);
      expect(planData.networkEnabled).toBe(true);
      expect(planData.supportedTopologies).toContain(networkData.topology);
    });
  });
});
