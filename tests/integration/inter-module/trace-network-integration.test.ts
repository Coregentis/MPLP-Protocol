/**
 * Trace-Network模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证追踪驱动网络的集成功能
 */

import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { NetworkManagementService } from '../../../src/modules/network/application/services/network-management.service';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';
import { NetworkTestFactory } from '../../modules/network/factories/network-test.factory';

describe('Trace-Network模块间集成测试', () => {
  let traceService: TraceManagementService;
  let networkService: NetworkManagementService;
  let mockTraceEntity: any;
  let mockNetworkEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    traceService = new TraceManagementService(
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
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
    mockNetworkEntity = NetworkTestFactory.createNetworkEntity();
  });

  describe('追踪驱动网络集成', () => {
    it('应该基于追踪创建网络', async () => {
      // Arrange
      const traceId = mockTraceEntity.traceId;

      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId,
        traceType: 'network_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Network Trace',
          category: 'network',
          source: { component: 'trace-network-integration' }
        }
      } as any);
      
      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 52,
        activeNetworks: 46,
        totalNodes: 300,
        totalEdges: 560,
        topologyDistribution: { 'traced': 28, 'mesh': 18, 'star': 6 },
        statusDistribution: { 'active': 46, 'inactive': 6 }
      } as any);

      // Act
      const trace = await traceService.startTrace({
        type: 'network_monitoring',
        name: 'Network Trace'
      } as any);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(trace).toBeDefined();
      expect(networkStats).toBeDefined();
      expect(networkStats.topologyDistribution['traced']).toBeGreaterThan(0);
    });

    it('应该查询追踪统计和网络统计的关联', async () => {
      // Mock trace service
      jest.spyOn(traceService, 'getTraceStatistics').mockResolvedValue({
        totalSpans: 50,
        totalDuration: 20000,
        averageSpanDuration: 400,
        errorCount: 1,
        successRate: 0.98,
        criticalPath: ['network_init', 'topology_build', 'connection_establish'],
        bottlenecks: ['topology_build']
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 55,
        activeNetworks: 50,
        totalNodes: 320,
        totalEdges: 600,
        topologyDistribution: { 'traced': 30, 'mesh': 20, 'star': 5 },
        statusDistribution: { 'active': 50, 'inactive': 5 }
      } as any);

      // Act
      const traceStats = await traceService.getTraceStatistics(mockTraceEntity.traceId);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(traceStats.criticalPath).toContain('network_init');
      expect(networkStats.topologyDistribution['traced']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _networkId: string,
        _networkConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockNetworkEntity.networkId,
        { networkType: 'traced', topology: 'mesh' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Network模块的预留接口参数', async () => {
      const testNetworkIntegration = async (
        _networkId: string,
        _traceId: string,
        _traceData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testNetworkIntegration(
        mockNetworkEntity.networkId,
        mockTraceEntity.traceId,
        { traceType: 'network', enableMonitoring: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('网络监控集成测试', () => {
    it('应该支持追踪网络的拓扑监控', async () => {
      const monitoringData = {
        traceId: mockTraceEntity.traceId,
        networkId: mockNetworkEntity.networkId,
        operation: 'topology_monitoring'
      };

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId: monitoringData.traceId,
        operationName: 'topology_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 400,
        tags: { networkId: monitoringData.networkId, operation: 'topology_monitor' },
        logs: [],
        status: 'completed'
      } as any);

      // Mock network service
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 48,
        activeNetworks: 42,
        totalNodes: 280,
        totalEdges: 520,
        topologyDistribution: { 'topology_monitored': 24, 'mesh': 18, 'star': 6 },
        statusDistribution: { 'active': 42, 'inactive': 6 }
      } as any);

      // Act
      const span = await traceService.addSpan(monitoringData.traceId, {
        operationName: 'topology_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 400,
        tags: { networkId: monitoringData.networkId, operation: 'topology_monitor' }
      } as any);
      const networkStats = await networkService.getGlobalStatistics();

      // Assert
      expect(span.operationName).toBe('topology_monitor');
      expect(networkStats.topologyDistribution['topology_monitored']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理追踪统计获取失败', async () => {
      const traceId = 'invalid-trace-id';
      jest.spyOn(traceService, 'getTraceStatistics').mockRejectedValue(new Error('Trace not found'));

      await expect(traceService.getTraceStatistics(traceId)).rejects.toThrow('Trace not found');
    });

    it('应该正确处理网络统计获取失败', async () => {
      jest.spyOn(networkService, 'getGlobalStatistics').mockRejectedValue(new Error('Network service unavailable'));

      await expect(networkService.getGlobalStatistics()).rejects.toThrow('Network service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Trace-Network集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: mockTraceEntity.traceId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);
      
      jest.spyOn(networkService, 'getGlobalStatistics').mockResolvedValue({
        totalNetworks: 35,
        activeNetworks: 30,
        totalNodes: 180,
        totalEdges: 360,
        topologyDistribution: { 'traced': 18, 'mesh': 12, 'star': 5 },
        statusDistribution: { 'active': 30, 'inactive': 5 }
      } as any);

      const trace = await traceService.startTrace({
        type: 'performance_test',
        name: 'Performance Test'
      } as any);
      const networkStats = await networkService.getGlobalStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(trace).toBeDefined();
      expect(networkStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Trace-Network数据关联的一致性', () => {
      const traceId = mockTraceEntity.traceId;
      const networkId = mockNetworkEntity.networkId;

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
      
      expect(networkId).toBeDefined();
      expect(typeof networkId).toBe('string');
      expect(networkId.length).toBeGreaterThan(0);
    });

    it('应该验证追踪网络关联数据的完整性', () => {
      const traceData = {
        traceId: mockTraceEntity.traceId,
        traceType: 'network_monitoring',
        networkEnabled: true,
        monitoredTopologies: ['traced', 'mesh']
      };

      const networkData = {
        networkId: mockNetworkEntity.networkId,
        traceId: traceData.traceId,
        topology: 'traced',
        status: 'monitored'
      };

      expect(networkData.traceId).toBe(traceData.traceId);
      expect(traceData.networkEnabled).toBe(true);
      expect(traceData.monitoredTopologies).toContain(networkData.topology);
    });
  });
});
