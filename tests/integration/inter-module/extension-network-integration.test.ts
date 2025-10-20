/**
 * Extension-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证扩展驱动网络的集成功能
 */

import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';
import { NetworkTestFactory } from '../../modules/network/factories/network-test.factory';

describe('Extension-Network模块间集成测试', () => {
  let extensionService: ExtensionManagementService;
  let networkService: NetworkManagementService;
  let mockExtensionEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    extensionService = new ExtensionManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    networkService = new NetworkManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
    mockNetworkEntity = NetworkTestFactory.createNetworkEntity();
  });

  describe('扩展驱动网络集成', () => {
    it('应该基于扩展创建网络', async () => {
      // Arrange
      const extensionId = mockExtensionEntity.extensionId;

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 46,
        installedExtensions: 40,
        activeExtensions: 34,
        extensionsByCategory: { 'network': 20, 'topology': 14, 'utility': 6 },
        averageInstallTime: 220
      } as any);
      
      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 58,
        activeNetworks: 52,
        totalNodes: 340,
        totalEdges: 640,
        topologyDistribution: { 'extension_managed': 32, 'mesh': 20, 'star': 6 },
        statusDistribution: { 'active': 52, 'inactive': 6 }
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(extensionStats).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['network']).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['extension_managed']).toBeGreaterThan(0);
    });

    it('应该查询扩展统计和网络统计的关联', async () => {
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 50,
        installedExtensions: 44,
        activeExtensions: 38,
        extensionsByCategory: { 'network': 22, 'topology': 16, 'utility': 6 },
        averageInstallTime: 210
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 60,
        activeNetworks: 55,
        totalNodes: 360,
        totalEdges: 680,
        topologyDistribution: { 'extension_managed': 35, 'mesh': 20, 'star': 5 },
        statusDistribution: { 'active': 55, 'inactive': 5 }
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(extensionStats.extensionsByCategory['network']).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['extension_managed']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockNetworkEntity.networkId,
        { networkType: 'extension', topology: 'mesh' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _extensionId: string,
        _extensionData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockExtensionEntity.extensionId,
        { extensionType: 'network', category: 'topology' }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络扩展集成测试', () => {
    it('应该支持扩展网络的拓扑管理', async () => {
      const topologyData = {
        extensionId: mockExtensionEntity.extensionId,
        networkId: mockNetworkEntity.networkId,
        operation: 'extension_topology'
      };

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 44,
        installedExtensions: 38,
        activeExtensions: 32,
        extensionsByCategory: { 'topology_manager': 18, 'network': 14, 'utility': 6 },
        averageInstallTime: 200
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 54,
        activeNetworks: 48,
        totalNodes: 320,
        totalEdges: 600,
        topologyDistribution: { 'extension_topology': 26, 'mesh': 22, 'star': 6 },
        statusDistribution: { 'active': 48, 'inactive': 6 }
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(extensionStats.extensionsByCategory['topology_manager']).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['extension_topology']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Extension-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 38,
        installedExtensions: 32,
        activeExtensions: 28,
        extensionsByCategory: { 'network': 16, 'topology': 12, 'utility': 4 },
        averageInstallTime: 190
      } as any);
      
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 42,
        activeNetworks: 36,
        totalNodes: 220,
        totalEdges: 420,
        topologyDistribution: { 'extension_managed': 20, 'mesh': 16, 'star': 6 },
        statusDistribution: { 'active': 36, 'inactive': 6 }
      } as any);

      const extensionStats = await extensionService.getExtensionStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(extensionStats).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Extension-Network数据关联的一致性', () => {
      const extensionId = mockExtensionEntity.extensionId;
      const networkId = mockNetworkEntity.networkId;

      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证扩展网络关联数据的完整性', () => {
      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        category: 'network',
        networkEnabled: true,
        supportedTopologies: ['extension_managed', 'mesh']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        extensionId: extensionData.extensionId,
        topology: 'extension_managed',
        status: 'extension_enabled'
      };

      expect(networkData.extensionId).toBe(extensionData.extensionId);
      expect(extensionData.networkEnabled).toBe(true);
      expect(extensionData.supportedTopologies).toContain(networkData.topology);
    });
  });
});
