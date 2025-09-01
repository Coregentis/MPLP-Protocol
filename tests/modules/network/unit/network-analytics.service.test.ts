/**
 * NetworkAnalyticsService 企业级测试套件
 * 
 * @description 基于mplp-network.json Schema的企业级网络分析服务测试
 * @version 1.0.0
 * @layer 测试层 - 企业级服务测试
 */

import { NetworkAnalyticsService } from '../../../../src/modules/network/application/services/network-analytics.service';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';
import { INetworkRepository } from '../../../../src/modules/network/domain/repositories/network-repository.interface';

describe('Network模块分析服务测试', () => {
  let networkAnalyticsService: NetworkAnalyticsService;
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
    networkAnalyticsService = new NetworkAnalyticsService(mockNetworkRepository);
  });

  describe('网络分析功能测试', () => {
    it('应该成功分析网络性能指标', async () => {
      // 准备测试数据
      const networkEntity = new NetworkEntity({
        networkId: 'net-analytics-001',
        name: 'Analytics Test Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-analytics-001',
        nodes: [
          {
            agentId: 'agent-001',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute', 'storage'],
            metadata: {}
          },
          {
            agentId: 'agent-002', 
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-001',
            sourceNodeId: 'agent-001',
            targetNodeId: 'agent-002',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: true, bandwidth: 1000 }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 执行分析
      const result = await networkAnalyticsService.analyzeNetwork('net-analytics-001');

      // 验证结果
      expect(result).toBeDefined();
      expect(result.networkId).toBe('net-analytics-001');
      expect(result.timestamp).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.topology).toBeDefined();
      expect(result.security).toBeDefined();
      expect(result.optimization).toBeDefined();

      // 验证性能指标
      expect(result.performance.averageLatency).toBeGreaterThan(0);
      expect(result.performance.throughput).toBeGreaterThan(0);
      expect(result.performance.reliability).toBeGreaterThanOrEqual(0);
      expect(result.performance.reliability).toBeLessThanOrEqual(1);
      expect(result.performance.availability).toBeGreaterThanOrEqual(0);
      expect(result.performance.availability).toBeLessThanOrEqual(1);

      // 验证拓扑指标
      expect(result.topology.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.topology.efficiency).toBeLessThanOrEqual(1);
      expect(result.topology.redundancy).toBeGreaterThanOrEqual(0);
      expect(result.topology.connectivity).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.topology.bottlenecks)).toBe(true);

      // 验证安全指标
      expect(result.security.vulnerabilities).toBeGreaterThanOrEqual(0);
      expect(result.security.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.security.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.security.recommendations)).toBe(true);

      // 验证优化建议
      expect(Array.isArray(result.optimization.suggestions)).toBe(true);
      expect(result.optimization.potentialImprovement).toBeGreaterThanOrEqual(0);
      expect(['low', 'medium', 'high']).toContain(result.optimization.implementationComplexity);

      // 验证仓储调用
      expect(mockNetworkRepository.findById).toHaveBeenCalledWith('net-analytics-001');
    });

    it('应该在网络不存在时抛出错误', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      await expect(networkAnalyticsService.analyzeNetwork('non-existent-network'))
        .rejects.toThrow('Network non-existent-network not found');

      expect(mockNetworkRepository.findById).toHaveBeenCalledWith('non-existent-network');
    });

    it('应该正确计算单节点网络的指标', async () => {
      // 准备单节点网络数据
      const singleNodeNetwork = new NetworkEntity({
        networkId: 'net-single-001',
        name: 'Single Node Network',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-single-001',
        nodes: [
          {
            agentId: 'agent-single',
            nodeType: 'standalone',
            status: 'online',
            capabilities: ['all'],
            metadata: {}
          }
        ],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(singleNodeNetwork);

      const result = await networkAnalyticsService.analyzeNetwork('net-single-001');

      // 单节点网络的特殊验证
      expect(result.topology.redundancy).toBe(0); // 无冗余
      expect(result.topology.bottlenecks).toHaveLength(0); // 无瓶颈
      expect(result.security.vulnerabilities).toBeGreaterThan(0); // 单点故障风险
    });
  });

  describe('健康报告生成测试', () => {
    it('应该生成完整的网络健康报告', async () => {
      // 准备测试数据
      const networkEntity = new NetworkEntity({
        networkId: 'net-health-001',
        name: 'Health Test Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-health-001',
        nodes: [
          {
            agentId: 'agent-h1',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          },
          {
            agentId: 'agent-h2',
            nodeType: 'worker', 
            status: 'online',
            capabilities: ['storage'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-h1',
            sourceNodeId: 'agent-h1',
            targetNodeId: 'agent-h2',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: true }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 生成健康报告
      const report = await networkAnalyticsService.generateHealthReport('net-health-001');

      // 验证报告结构
      expect(report).toBeDefined();
      expect(report.networkId).toBe('net-health-001');
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(report.overallHealth);
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
      expect(report.timestamp).toBeDefined();

      // 验证组件健康状况
      expect(report.components).toBeDefined();
      expect(report.components.connectivity).toBeDefined();
      expect(report.components.performance).toBeDefined();
      expect(report.components.security).toBeDefined();
      expect(report.components.reliability).toBeDefined();

      // 验证每个组件的结构
      Object.values(report.components).forEach(component => {
        expect(['healthy', 'warning', 'critical']).toContain(component.status);
        expect(component.score).toBeGreaterThanOrEqual(0);
        expect(component.score).toBeLessThanOrEqual(100);
        expect(typeof component.metrics).toBe('object');
        expect(Array.isArray(component.issues)).toBe(true);
      });

      // 验证警报和趋势
      expect(Array.isArray(report.alerts)).toBe(true);
      expect(Array.isArray(report.trends)).toBe(true);

      // 验证仓储调用
      expect(mockNetworkRepository.findById).toHaveBeenCalledWith('net-health-001');
    });

    it('应该为不健康网络生成适当的警报', async () => {
      // 准备不健康网络数据
      const unhealthyNetwork = new NetworkEntity({
        networkId: 'net-unhealthy-001',
        name: 'Unhealthy Network',
        topology: 'star',
        status: 'degraded',
        contextId: 'ctx-unhealthy-001',
        nodes: [
          {
            agentId: 'agent-u1',
            nodeType: 'coordinator',
            status: 'error',
            capabilities: ['coordination'],
            metadata: {}
          },
          {
            agentId: 'agent-u2',
            nodeType: 'worker',
            status: 'offline',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-u1',
            sourceNodeId: 'agent-u1',
            targetNodeId: 'agent-u2',
            connectionType: 'direct',
            status: 'inactive',
            metadata: { encrypted: false }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(unhealthyNetwork);

      const report = await networkAnalyticsService.generateHealthReport('net-unhealthy-001');

      // 验证不健康状态 - 应该是不太好的状态
      expect(['fair', 'poor', 'critical']).toContain(report.overallHealth);
      expect(report.healthScore).toBeLessThan(80); // 相对较低的健康分数

      // 验证警报存在
      expect(report.alerts.length).toBeGreaterThan(0);
      
      // 验证组件状态反映问题
      const hasWarningOrCritical = Object.values(report.components).some(
        component => component.status === 'warning' || component.status === 'critical'
      );
      expect(hasWarningOrCritical).toBe(true);
    });
  });

  describe('边界条件和错误处理测试', () => {
    it('应该处理空网络的情况', async () => {
      const emptyNetwork = new NetworkEntity({
        networkId: 'net-empty-001',
        name: 'Empty Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-empty-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(emptyNetwork);

      const result = await networkAnalyticsService.analyzeNetwork('net-empty-001');

      // 空网络的特殊处理
      expect(result.topology.efficiency).toBe(1); // 空网络效率为1
      expect(result.topology.connectivity).toBe(1); // 空网络连通性为1
      expect(result.performance.availability).toBe(1); // 空网络可用性为1
    });

    it('应该处理仓储错误', async () => {
      mockNetworkRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(networkAnalyticsService.analyzeNetwork('net-error-001'))
        .rejects.toThrow('Database connection failed');
    });

    it('应该处理无效网络ID', async () => {
      await expect(networkAnalyticsService.analyzeNetwork(''))
        .rejects.toThrow();

      await expect(networkAnalyticsService.generateHealthReport(''))
        .rejects.toThrow();
    });
  });

  describe('性能和优化测试', () => {
    it('应该在合理时间内完成分析', async () => {
      // 创建大型网络进行性能测试
      const largeNetwork = new NetworkEntity({
        networkId: 'net-large-001',
        name: 'Large Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-large-001',
        nodes: Array.from({ length: 100 }, (_, i) => ({
          agentId: `agent-${i}`,
          nodeType: 'worker',
          status: 'online',
          capabilities: ['compute'],
          metadata: {}
        })),
        edges: Array.from({ length: 200 }, (_, i) => ({
          edgeId: `edge-${i}`,
          sourceNodeId: `agent-${i % 100}`,
          targetNodeId: `agent-${(i + 1) % 100}`,
          connectionType: 'direct',
          status: 'active',
          metadata: { encrypted: true }
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(largeNetwork);

      const startTime = Date.now();
      const result = await networkAnalyticsService.analyzeNetwork('net-large-001');
      const endTime = Date.now();

      // 验证性能要求
      expect(endTime - startTime).toBeLessThan(1000); // 应在1秒内完成
      expect(result).toBeDefined();
      expect(result.networkId).toBe('net-large-001');
    });

    it('应该提供有意义的优化建议', async () => {
      const inefficientNetwork = new NetworkEntity({
        networkId: 'net-inefficient-001',
        name: 'Inefficient Network',
        topology: 'star', // 星型拓扑可能效率较低
        status: 'active',
        contextId: 'ctx-inefficient-001',
        nodes: Array.from({ length: 10 }, (_, i) => ({
          agentId: `agent-${i}`,
          nodeType: i === 0 ? 'coordinator' : 'worker',
          status: 'online',
          capabilities: i === 0 ? ['coordination'] : ['compute'],
          metadata: {}
        })),
        edges: Array.from({ length: 9 }, (_, i) => ({
          edgeId: `edge-${i}`,
          sourceNodeId: 'agent-0', // 所有连接都通过中心节点
          targetNodeId: `agent-${i + 1}`,
          connectionType: 'direct',
          status: 'active',
          metadata: { encrypted: false } // 未加密连接
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(inefficientNetwork);

      const result = await networkAnalyticsService.analyzeNetwork('net-inefficient-001');

      // 验证优化建议
      expect(result.optimization.suggestions.length).toBeGreaterThan(0);
      
      // 应该有拓扑优化建议或负载均衡建议
      const hasOptimization = result.optimization.suggestions.some(
        suggestion => suggestion.type === 'topology' || suggestion.type === 'load_balancing'
      );
      expect(hasOptimization).toBe(true);

      // 应该有安全建议（因为有未加密连接）
      expect(result.security.recommendations.length).toBeGreaterThan(0);
      expect(result.security.recommendations.some(rec => 
        rec.includes('encryption') || rec.includes('加密')
      )).toBe(true);
    });
  });
});
