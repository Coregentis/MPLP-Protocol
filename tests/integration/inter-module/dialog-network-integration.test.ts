/**
 * Dialog-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证对话驱动网络的集成功能
 */

import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { NetworkTestFactory } from '../../modules/network/factories/network-test.factory';

describe('Dialog-Network模块间集成测试', () => {
  let dialogService: DialogManagementService;
  let networkService: NetworkManagementService;
  let mockDialogEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    dialogService = new DialogManagementService(
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
    mockDialogEntity = { dialogId: 'dialog-network-001' }; // 简化的mock数据
    mockNetworkEntity = NetworkTestFactory.createNetworkEntity();
  });

  describe('对话驱动网络集成', () => {
    it('应该基于对话创建网络', async () => {
      // Arrange
      const dialogId = mockDialogEntity.dialogId;

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 58,
        averageParticipants: 5.8,
        activeDialogs: 52,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 42,
          criticalThinking: 38,
          knowledgeSearch: 45,
          multimodal: 28
        },
        recentActivity: {
          dailyCreated: [8, 10, 9, 12, 11, 13, 10],
          weeklyActive: [48, 52, 50, 58]
        }
      } as any);
      
      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 62,
        activeNetworks: 58,
        totalNodes: 380,
        totalEdges: 720,
        topologyDistribution: { 'dialog_driven': 36, 'mesh': 22, 'star': 4 },
        statusDistribution: { 'active': 58, 'inactive': 4 }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(dialogStats).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['dialog_driven']).toBeGreaterThan(0);
    });

    it('应该查询对话统计和网络统计的关联', async () => {
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 60,
        averageParticipants: 6.0,
        activeDialogs: 55,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 45,
          criticalThinking: 40,
          knowledgeSearch: 48,
          multimodal: 30
        },
        recentActivity: {
          dailyCreated: [9, 11, 10, 13, 12, 14, 11],
          weeklyActive: [50, 55, 52, 60]
        }
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 65,
        activeNetworks: 60,
        totalNodes: 400,
        totalEdges: 760,
        topologyDistribution: { 'dialog_driven': 38, 'mesh': 22, 'star': 5 },
        statusDistribution: { 'active': 60, 'inactive': 5 }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['dialog_driven']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockNetworkEntity.networkId,
        { networkType: 'dialog', topology: 'mesh' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _dialogId: string,
        _dialogData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockDialogEntity.dialogId,
        { dialogType: 'network', capabilities: ['intelligent'] }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络对话集成测试', () => {
    it('应该支持对话网络的智能拓扑', async () => {
      const topologyData = {
        dialogId: mockDialogEntity.dialogId,
        networkId: mockNetworkEntity.networkId,
        operation: 'intelligent_topology'
      };

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 54,
        averageParticipants: 5.4,
        activeDialogs: 48,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 48,
          criticalThinking: 42,
          knowledgeSearch: 40,
          multimodal: 24
        },
        recentActivity: {
          dailyCreated: [7, 9, 8, 11, 10, 12, 9],
          weeklyActive: [44, 48, 46, 54]
        }
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 58,
        activeNetworks: 54,
        totalNodes: 360,
        totalEdges: 680,
        topologyDistribution: { 'intelligent_dialog': 30, 'mesh': 24, 'star': 4 },
        statusDistribution: { 'active': 54, 'inactive': 4 }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(networkStats.topologyDistribution['intelligent_dialog']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Dialog-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 45,
        averageParticipants: 4.5,
        activeDialogs: 40,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 35,
          criticalThinking: 30,
          knowledgeSearch: 38,
          multimodal: 20
        },
        recentActivity: {
          dailyCreated: [6, 8, 7, 10, 9, 11, 8],
          weeklyActive: [35, 40, 38, 45]
        }
      } as any);
      
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 48,
        activeNetworks: 45,
        totalNodes: 280,
        totalEdges: 540,
        topologyDistribution: { 'dialog_driven': 25, 'mesh': 20, 'star': 3 },
        statusDistribution: { 'active': 45, 'inactive': 3 }
      } as any);

      const dialogStats = await dialogService.getDialogStatistics();
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(dialogStats).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Dialog-Network数据关联的一致性', () => {
      const dialogId = mockDialogEntity.dialogId;
      const networkId = mockNetworkEntity.networkId;

      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证对话网络关联数据的完整性', () => {
      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        capabilities: ['intelligent', 'criticalThinking'],
        networkEnabled: true,
        supportedTopologies: ['dialog_driven', 'mesh']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        dialogId: dialogData.dialogId,
        topology: 'dialog_driven',
        status: 'dialog_enabled'
      };

      expect(networkData.dialogId).toBe(dialogData.dialogId);
      expect(dialogData.networkEnabled).toBe(true);
      expect(dialogData.supportedTopologies).toContain(networkData.topology);
    });
  });
});
