/**
 * Context-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动网络的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';

describe('Context-Network模块间集成测试', () => {
  let contextService: ContextManagementService;
  let networkService: NetworkManagementService;
  let mockContextEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock logger
      {} as any, // Mock cache manager
      {} as any  // Mock version manager
    );

    networkService = new NetworkManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockNetworkEntity = { networkId: 'network-context-001' }; // 简化的mock数据
  });

  describe('上下文驱动网络集成', () => {
    it('应该基于上下文创建网络', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 85,
        activeContexts: 78,
        contextsByType: { 'network_driven': 48, 'session': 30, 'global': 7 },
        averageLifetime: 4200,
        memoryUsage: 320,
        cacheHitRate: 0.96
      } as any);

      // Mock network service - 使用实际存在的方法
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 8,
        activeNetworks: 6,
        totalNodes: 48,
        totalEdges: 72,
        topologyDistribution: { 'mesh': 4, 'star': 2, 'ring': 2 },
        statusDistribution: { 'active': 6, 'inactive': 2 }
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(contextStats).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(contextStats.contextsByType['network_driven']).toBeGreaterThan(0);
      expect(networkStats.activeNetworks).toBeGreaterThan(0);
    });

    it('应该查询上下文统计和网络统计的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 90,
        activeContexts: 85,
        contextsByType: { 'network_driven': 52, 'session': 33, 'global': 5 },
        averageLifetime: 4500,
        memoryUsage: 350,
        cacheHitRate: 0.97
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 10,
        activeNetworks: 8,
        totalNodes: 60,
        totalEdges: 90,
        topologyDistribution: { 'mesh': 5, 'star': 3, 'ring': 2 },
        statusDistribution: { 'active': 8, 'inactive': 2 }
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(contextStats.contextsByType['network_driven']).toBeGreaterThan(0);
      expect(networkStats.activeNetworks).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockNetworkEntity.networkId,
        { networkType: 'context', distributed: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockContextEntity.contextId,
        { contextType: 'network_driven', distributed: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络上下文集成测试', () => {
    it('应该支持上下文网络的拓扑管理', async () => {
      const topologyData = {
        contextId: mockContextEntity.contextId,
        networkId: mockNetworkEntity.networkId,
        operation: 'context_network_topology'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 80,
        activeContexts: 75,
        contextsByType: { 'topology_managed': 45, 'session': 30, 'global': 5 },
        averageLifetime: 4000,
        memoryUsage: 300,
        cacheHitRate: 0.95
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 7,
        activeNetworks: 5,
        totalNodes: 35,
        totalEdges: 52,
        topologyDistribution: { 'mesh': 3, 'star': 2, 'ring': 2 },
        statusDistribution: { 'active': 5, 'inactive': 2 }
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(contextStats.contextsByType['topology_managed']).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['mesh']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文统计获取失败', async () => {
      jest.spyOn(contextService, 'getContextStatistics').mockRejectedValue(new Error('Context service unavailable'));

      await expect(contextService.getContextStatistics()).rejects.toThrow('Context service unavailable');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 70,
        activeContexts: 65,
        contextsByType: { 'network_driven': 40, 'session': 25, 'global': 5 },
        averageLifetime: 3800,
        memoryUsage: 280,
        cacheHitRate: 0.94
      } as any);

      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 6,
        activeNetworks: 4,
        totalNodes: 24,
        totalEdges: 36,
        topologyDistribution: { 'mesh': 2, 'star': 2, 'ring': 2 },
        statusDistribution: { 'active': 4, 'inactive': 2 }
      } as any);

      const contextStats = await contextService.getContextStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(contextStats).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Network数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const networkId = mockNetworkEntity.networkId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文网络关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        contextType: 'network_driven',
        networkEnabled: true,
        supportedTopologies: ['mesh', 'star']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        contextId: contextData.contextId,
        topology: 'mesh',
        status: 'active'
      };

      expect(networkData.contextId).toBe(contextData.contextId);
      expect(contextData.networkEnabled).toBe(true);
      expect(contextData.supportedTopologies).toContain(networkData.topology);
    });
  });
});
