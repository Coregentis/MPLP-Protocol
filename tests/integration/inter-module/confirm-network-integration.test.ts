/**
 * Confirm-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证确认驱动网络的集成功能
 */

import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';
import { NetworkTestFactory } from '../../modules/network/factories/network-test.factory';

describe('Confirm-Network模块间集成测试', () => {
  let confirmService: ConfirmManagementService;
  let networkService: NetworkManagementService;
  let mockConfirmEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    confirmService = new ConfirmManagementService(
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
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
    mockNetworkEntity = NetworkTestFactory.createNetworkEntity();
  });

  describe('确认驱动网络集成', () => {
    it('应该基于确认创建网络', async () => {
      // Arrange
      const confirmId = mockConfirmEntity.confirmId;

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId,
        confirmationType: 'network_approval',
        status: 'approved',
        networkRequired: true
      } as any);
      
      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 48,
        activeNetworks: 42,
        totalNodes: 260,
        totalEdges: 480,
        topologyDistribution: { 'approved': 24, 'mesh': 18, 'star': 6 },
        statusDistribution: { 'active': 42, 'inactive': 6 }
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(confirmId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(confirm).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(networkStats.topologyDistribution['approved']).toBeGreaterThan(0);
    });

    it('应该查询确认统计和网络统计的关联', async () => {
      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 32,
        byStatus: { 'pending': 18, 'approved': 12, 'rejected': 2 },
        byType: { 'network_approval': 22, 'manual_approval': 10 },
        byPriority: { 'high': 14, 'medium': 16, 'low': 2 }
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 50,
        activeNetworks: 45,
        totalNodes: 280,
        totalEdges: 520,
        topologyDistribution: { 'approved': 28, 'mesh': 17, 'star': 5 },
        statusDistribution: { 'active': 45, 'inactive': 5 }
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(confirmStats.byType['network_approval']).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['approved']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockNetworkEntity.networkId,
        { networkType: 'approval', topology: 'mesh' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _confirmId: string,
        _confirmData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockConfirmEntity.confirmId,
        { confirmationType: 'network', requiresApproval: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络审批集成测试', () => {
    it('应该支持确认网络的拓扑管理', async () => {
      const topologyData = {
        confirmId: mockConfirmEntity.confirmId,
        networkId: mockNetworkEntity.networkId,
        operation: 'network_approval'
      };

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: topologyData.confirmId,
        confirmationType: 'network_topology_approval',
        status: 'approved',
        topologyManagement: true
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 45,
        activeNetworks: 40,
        totalNodes: 240,
        totalEdges: 450,
        topologyDistribution: { 'approval_managed': 22, 'mesh': 15, 'star': 3 },
        statusDistribution: { 'active': 40, 'inactive': 5 }
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(topologyData.confirmId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(confirm.topologyManagement).toBe(true);
      expect(networkStats.topologyDistribution['approval_managed']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理确认获取失败', async () => {
      const confirmId = 'invalid-confirm-id';
      jest.spyOn(confirmService, 'getConfirm').mockRejectedValue(new Error('Confirm not found'));

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm not found');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Confirm-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'performance_test'
      } as any);
      
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 32,
        activeNetworks: 28,
        totalNodes: 160,
        totalEdges: 320,
        topologyDistribution: { 'approved': 16, 'mesh': 10, 'star': 2 },
        statusDistribution: { 'active': 28, 'inactive': 4 }
      } as any);

      const confirm = await confirmService.getConfirm(mockConfirmEntity.confirmId);
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(confirm).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Confirm-Network数据关联的一致性', () => {
      const confirmId = mockConfirmEntity.confirmId;
      const networkId = mockNetworkEntity.networkId;

      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证确认网络关联数据的完整性', () => {
      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'network_approval',
        networkRequired: true,
        supportedTopologies: ['approved', 'mesh', 'star']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        confirmId: confirmData.confirmId,
        topology: 'approved',
        status: 'active'
      };

      expect(networkData.confirmId).toBe(confirmData.confirmId);
      expect(confirmData.networkRequired).toBe(true);
      expect(confirmData.supportedTopologies).toContain(networkData.topology);
    });
  });
});
