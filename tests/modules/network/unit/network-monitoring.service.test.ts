/**
 * NetworkMonitoringService 企业级测试套件
 * 
 * @description 基于mplp-network.json Schema的企业级网络监控服务测试
 * @version 1.0.0
 * @layer 测试层 - 企业级服务测试
 */

import { NetworkMonitoringService } from '../../../../src/modules/network/application/services/network-monitoring.service';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';
import { INetworkRepository } from '../../../../src/modules/network/domain/repositories/network-repository.interface';

describe('NetworkMonitoringService企业级测试', () => {
  let networkMonitoringService: NetworkMonitoringService;
  let mockNetworkRepository: jest.Mocked<INetworkRepository>;

  beforeEach(() => {
    // 创建Mock仓储
    mockNetworkRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByTopology: jest.fn(),
      count: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<INetworkRepository>;

    // 创建服务实例
    networkMonitoringService = new NetworkMonitoringService(mockNetworkRepository);
  });

  afterEach(async () => {
    // 清理所有监控
    const allNetworks = ['net-monitor-001', 'net-monitor-002', 'net-realtime-001'];
    for (const networkId of allNetworks) {
      await networkMonitoringService.stopMonitoring(networkId);
    }
  });

  describe('实时监控功能测试', () => {
    it('应该成功获取实时监控指标', async () => {
      // 准备测试数据
      const networkEntity = new NetworkEntity({
        networkId: 'net-monitor-001',
        name: 'Monitor Test Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-monitor-001',
        nodes: [
          {
            agentId: 'agent-m1',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          },
          {
            agentId: 'agent-m2',
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-m1',
            sourceNodeId: 'agent-m1',
            targetNodeId: 'agent-m2',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: true }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 获取实时指标
      const metrics = await networkMonitoringService.getRealtimeMetrics('net-monitor-001');

      // 验证指标结构
      expect(metrics).toBeDefined();
      expect(metrics.networkId).toBe('net-monitor-001');
      expect(metrics.timestamp).toBeDefined();

      // 验证实时指标
      expect(metrics.realTime).toBeDefined();
      expect(metrics.realTime.activeConnections).toBeGreaterThanOrEqual(0);
      expect(metrics.realTime.messagesThroughput).toBeGreaterThanOrEqual(0);
      expect(metrics.realTime.averageLatency).toBeGreaterThan(0);
      expect(metrics.realTime.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.realTime.errorRate).toBeLessThanOrEqual(1);
      expect(metrics.realTime.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.realTime.cpuUsage).toBeLessThanOrEqual(100);
      expect(metrics.realTime.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.realTime.memoryUsage).toBeLessThanOrEqual(100);

      // 验证性能指标
      expect(metrics.performance).toBeDefined();
      expect(metrics.performance.responseTime).toBeDefined();
      expect(metrics.performance.throughput).toBeDefined();
      expect(metrics.performance.errorRate).toBeDefined();
      expect(metrics.performance.availability).toBeDefined();

      // 验证每个性能指标的结构
      Object.values(metrics.performance).forEach(metric => {
        expect(typeof metric.current).toBe('number');
        expect(typeof metric.average).toBe('number');
        expect(typeof metric.min).toBe('number');
        expect(typeof metric.max).toBe('number');
        expect(typeof metric.threshold).toBe('number');
        expect(['normal', 'warning', 'critical']).toContain(metric.status);
      });

      // 验证警报和趋势
      expect(Array.isArray(metrics.alerts)).toBe(true);
      expect(Array.isArray(metrics.trends)).toBe(true);

      // 验证仓储调用
      expect(mockNetworkRepository.findById).toHaveBeenCalledWith('net-monitor-001');
    });

    it('应该在网络不存在时抛出错误', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      await expect(networkMonitoringService.getRealtimeMetrics('non-existent-network'))
        .rejects.toThrow('Network non-existent-network not found');
    });
  });

  describe('监控启动和停止测试', () => {
    it('应该成功启动网络监控', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-monitor-002',
        name: 'Monitor Start Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-monitor-002',
        nodes: [
          {
            agentId: 'agent-start',
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          }
        ],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 启动监控
      await expect(networkMonitoringService.startMonitoring('net-monitor-002', 5000))
        .resolves.not.toThrow();

      // 验证监控已启动（通过获取指标）
      const metrics = await networkMonitoringService.getRealtimeMetrics('net-monitor-002');
      expect(metrics.networkId).toBe('net-monitor-002');
    });

    it('应该成功停止网络监控', async () => {
      // 先启动监控
      const networkEntity = new NetworkEntity({
        networkId: 'net-stop-001',
        name: 'Monitor Stop Test',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-stop-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);
      await networkMonitoringService.startMonitoring('net-stop-001', 10000);

      // 停止监控
      await expect(networkMonitoringService.stopMonitoring('net-stop-001'))
        .resolves.not.toThrow();
    });

    it('应该处理重复启动监控的情况', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-duplicate-001',
        name: 'Duplicate Monitor Test',
        topology: 'ring',
        status: 'active',
        contextId: 'ctx-duplicate-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 第一次启动
      await networkMonitoringService.startMonitoring('net-duplicate-001', 15000);

      // 第二次启动应该停止之前的监控并启动新的
      await expect(networkMonitoringService.startMonitoring('net-duplicate-001', 20000))
        .resolves.not.toThrow();
    });
  });

  describe('监控仪表板测试', () => {
    it('应该生成完整的监控仪表板', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-dashboard-001',
        name: 'Dashboard Test Network',
        topology: 'hybrid',
        status: 'active',
        contextId: 'ctx-dashboard-001',
        nodes: [
          {
            agentId: 'agent-d1',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute', 'storage'],
            metadata: {}
          },
          {
            agentId: 'agent-d2',
            nodeType: 'worker',
            status: 'offline',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-d1',
            sourceNodeId: 'agent-d1',
            targetNodeId: 'agent-d2',
            connectionType: 'direct',
            status: 'inactive',
            metadata: {}
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const dashboard = await networkMonitoringService.getDashboard('net-dashboard-001');

      // 验证仪表板结构
      expect(dashboard).toBeDefined();
      expect(dashboard.networkId).toBe('net-dashboard-001');
      expect(dashboard.lastUpdated).toBeDefined();

      // 验证概览信息
      expect(dashboard.overview).toBeDefined();
      expect(['healthy', 'degraded', 'critical']).toContain(dashboard.overview.status);
      expect(dashboard.overview.uptime).toBeGreaterThanOrEqual(0);
      expect(dashboard.overview.uptime).toBeLessThanOrEqual(1);
      expect(dashboard.overview.totalNodes).toBe(2);
      expect(dashboard.overview.activeNodes).toBe(1); // 只有一个在线节点
      expect(dashboard.overview.totalConnections).toBe(1);
      expect(dashboard.overview.activeConnections).toBe(0); // 连接是inactive

      // 验证性能指标
      expect(dashboard.performance).toBeDefined();
      expect(dashboard.performance.latency).toBeDefined();
      expect(dashboard.performance.throughput).toBeDefined();
      expect(dashboard.performance.errorRate).toBeDefined();
      expect(dashboard.performance.availability).toBeDefined();

      // 验证每个性能指标的结构
      Object.values(dashboard.performance).forEach(metric => {
        expect(typeof metric.value).toBe('number');
        expect(typeof metric.unit).toBe('string');
        expect(['up', 'down', 'stable']).toContain(metric.trend);
        expect(['good', 'warning', 'critical']).toContain(metric.status);
        expect(Array.isArray(metric.sparkline)).toBe(true);
      });

      // 验证容量指标
      expect(dashboard.capacity).toBeDefined();
      expect(dashboard.capacity.nodeUtilization).toBeGreaterThanOrEqual(0);
      expect(dashboard.capacity.nodeUtilization).toBeLessThanOrEqual(100);
      expect(dashboard.capacity.connectionUtilization).toBeGreaterThanOrEqual(0);
      expect(dashboard.capacity.connectionUtilization).toBeLessThanOrEqual(100);

      // 验证警报和问题
      expect(Array.isArray(dashboard.recentAlerts)).toBe(true);
      expect(Array.isArray(dashboard.topIssues)).toBe(true);
    });
  });

  describe('警报管理测试', () => {
    it('应该正确检测和生成警报', async () => {
      // 创建有问题的网络
      const problematicNetwork = new NetworkEntity({
        networkId: 'net-alert-001',
        name: 'Alert Test Network',
        topology: 'mesh',
        status: 'degraded',
        contextId: 'ctx-alert-001',
        nodes: [
          {
            agentId: 'agent-a1',
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          },
          {
            agentId: 'agent-a2',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [], // 无连接 - 应该触发警报
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(problematicNetwork);

      const metrics = await networkMonitoringService.getRealtimeMetrics('net-alert-001');

      // 应该检测到连接问题
      const connectivityAlerts = metrics.alerts.filter(alert => alert.type === 'connectivity');
      expect(connectivityAlerts.length).toBeGreaterThan(0);

      // 验证警报结构
      metrics.alerts.forEach(alert => {
        expect(alert.id).toBeDefined();
        expect(alert.networkId).toBe('net-alert-001');
        expect(['performance', 'connectivity', 'security', 'capacity']).toContain(alert.type);
        expect(['info', 'warning', 'error', 'critical']).toContain(alert.severity);
        expect(alert.title).toBeDefined();
        expect(alert.description).toBeDefined();
        expect(alert.timestamp).toBeDefined();
        expect(typeof alert.acknowledged).toBe('boolean');
        expect(typeof alert.metadata).toBe('object');
      });
    });

    it('应该支持警报确认和解决', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-ack-001',
        name: 'Acknowledgment Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-ack-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 先生成一些警报
      const metrics = await networkMonitoringService.getRealtimeMetrics('net-ack-001');
      const alerts = networkMonitoringService.getActiveAlerts('net-ack-001');

      if (alerts.length > 0) {
        const alertId = alerts[0].id;

        // 确认警报
        await expect(networkMonitoringService.acknowledgeAlert('net-ack-001', alertId))
          .resolves.not.toThrow();

        // 解决警报
        await expect(networkMonitoringService.resolveAlert('net-ack-001', alertId))
          .resolves.not.toThrow();
      }
    });
  });

  describe('历史数据和趋势分析测试', () => {
    it('应该正确存储和检索历史指标', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-history-001',
        name: 'History Test Network',
        topology: 'tree',
        status: 'active',
        contextId: 'ctx-history-001',
        nodes: [
          {
            agentId: 'agent-h1',
            nodeType: 'root',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          }
        ],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 生成多个指标点来创建历史数据
      await networkMonitoringService.getRealtimeMetrics('net-history-001');
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await networkMonitoringService.getRealtimeMetrics('net-history-001');

      // 获取历史数据
      const history = networkMonitoringService.getMetricsHistory('net-history-001', 1);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(1);

      // 验证历史数据结构
      history.forEach(metric => {
        expect(metric.networkId).toBe('net-history-001');
        expect(metric.timestamp).toBeDefined();
        expect(metric.realTime).toBeDefined();
        expect(metric.performance).toBeDefined();
      });
    });

    it('应该正确分析趋势', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-trend-001',
        name: 'Trend Test Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-trend-001',
        nodes: [
          {
            agentId: 'agent-t1',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 生成足够的数据点来分析趋势
      for (let i = 0; i < 3; i++) {
        await networkMonitoringService.getRealtimeMetrics('net-trend-001');
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const metrics = await networkMonitoringService.getRealtimeMetrics('net-trend-001');

      // 验证趋势分析
      expect(Array.isArray(metrics.trends)).toBe(true);
      
      metrics.trends.forEach(trend => {
        expect(trend.metric).toBeDefined();
        expect(['up', 'down', 'stable']).toContain(trend.direction);
        expect(typeof trend.changePercent).toBe('number');
        expect(['1h', '24h', '7d', '30d']).toContain(trend.timeframe);
        expect(trend.prediction).toBeDefined();
        expect(typeof trend.prediction.nextValue).toBe('number');
        expect(trend.prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(trend.prediction.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('性能和可靠性测试', () => {
    it('应该在高频监控下保持性能', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-perf-001',
        name: 'Performance Test Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-perf-001',
        nodes: Array.from({ length: 50 }, (_, i) => ({
          agentId: `agent-perf-${i}`,
          nodeType: 'worker',
          status: 'online',
          capabilities: ['compute'],
          metadata: {}
        })),
        edges: Array.from({ length: 100 }, (_, i) => ({
          edgeId: `edge-perf-${i}`,
          sourceNodeId: `agent-perf-${i % 50}`,
          targetNodeId: `agent-perf-${(i + 1) % 50}`,
          connectionType: 'direct',
          status: 'active',
          metadata: {}
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 测试高频监控性能
      const startTime = Date.now();
      const promises = Array.from({ length: 10 }, () => 
        networkMonitoringService.getRealtimeMetrics('net-perf-001')
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // 验证性能要求
      expect(endTime - startTime).toBeLessThan(2000); // 10次调用应在2秒内完成
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.networkId).toBe('net-perf-001');
      });
    });

    it('应该处理监控过程中的错误', async () => {
      // 模拟仓储错误
      mockNetworkRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(networkMonitoringService.getRealtimeMetrics('net-error-001'))
        .rejects.toThrow('Database error');

      // 恢复正常
      const networkEntity = new NetworkEntity({
        networkId: 'net-recovery-001',
        name: 'Recovery Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-recovery-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 应该能够恢复正常工作
      const metrics = await networkMonitoringService.getRealtimeMetrics('net-recovery-001');
      expect(metrics.networkId).toBe('net-recovery-001');
    });
  });
});
