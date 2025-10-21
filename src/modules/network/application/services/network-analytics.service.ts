/**
 * Network Analytics Service - 企业级网络分析服务
 *
 * @description 基于mplp-network.json Schema的企业级网络分析服务
 * @version 1.0.0
 * @layer 应用层 - 企业级服务
 * @schema 基于 src/schemas/core-modules/mplp-network.json
 */

import { NetworkEntity } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';

export interface NetworkAnalyticsMetrics {
  networkId: string;
  timestamp: string;
  performance: {
    averageLatency: number;
    throughput: number;
    reliability: number;
    availability: number;
  };
  topology: {
    efficiency: number;
    redundancy: number;
    connectivity: number;
    bottlenecks: string[];
  };
  security: {
    vulnerabilities: number;
    riskScore: number;
    recommendations: string[];
  };
  optimization: {
    suggestions: OptimizationSuggestion[];
    potentialImprovement: number;
    implementationComplexity: 'low' | 'medium' | 'high';
  };
}

export interface OptimizationSuggestion {
  type: 'topology' | 'routing' | 'load_balancing' | 'security';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImprovement: number;
  implementationCost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface NetworkHealthReport {
  networkId: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthScore: number; // 0-100
  timestamp: string;
  components: {
    connectivity: ComponentHealth;
    performance: ComponentHealth;
    security: ComponentHealth;
    reliability: ComponentHealth;
  };
  alerts: NetworkAlert[];
  trends: HealthTrend[];
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  metrics: Record<string, number>;
  issues: string[];
}

export interface NetworkAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: string;
  message: string;
  timestamp: string;
  affectedNodes: string[];
}

export interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'degrading';
  changeRate: number;
  timeframe: string;
}

export class NetworkAnalyticsService {
  constructor(
    private readonly networkRepository: INetworkRepository
  ) {}

  /**
   * 执行全面的网络分析
   */
  async analyzeNetwork(networkId: string): Promise<NetworkAnalyticsMetrics> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const [performance, topology, security, optimization] = await Promise.all([
      this.analyzePerformance(network),
      this.analyzeTopology(network),
      this.analyzeSecurity(network),
      this.generateOptimizationSuggestions(network)
    ]);

    return {
      networkId,
      timestamp: new Date().toISOString(),
      performance,
      topology,
      security,
      optimization
    };
  }

  /**
   * 生成网络健康报告
   */
  async generateHealthReport(networkId: string): Promise<NetworkHealthReport> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const components = await this.assessComponentHealth(network);
    const alerts = await this.detectNetworkAlerts(network);
    const trends = await this.analyzeHealthTrends(network);

    // 计算总体健康分数
    const healthScore = this.calculateOverallHealthScore(components);
    const overallHealth = this.determineOverallHealth(healthScore);

    return {
      networkId,
      overallHealth,
      healthScore,
      timestamp: new Date().toISOString(),
      components,
      alerts,
      trends
    };
  }

  /**
   * 分析网络性能
   */
  private async analyzePerformance(network: NetworkEntity): Promise<NetworkAnalyticsMetrics['performance']> {
    // 模拟性能分析逻辑
    const _nodeCount = network.nodes.length;
    const _edgeCount = network.edges.length;
    // Mark as intentionally unused (reserved for future performance analysis features)
    void _nodeCount;
    void _edgeCount;

    // 基于网络规模和拓扑计算性能指标
    const averageLatency = this.calculateAverageLatency(network);
    const throughput = this.calculateThroughput(network);
    const reliability = this.calculateReliability(network);
    const availability = this.calculateAvailability(network);

    return {
      averageLatency,
      throughput,
      reliability,
      availability
    };
  }

  /**
   * 分析网络拓扑
   */
  private async analyzeTopology(network: NetworkEntity): Promise<NetworkAnalyticsMetrics['topology']> {
    const efficiency = this.calculateTopologyEfficiency(network);
    const redundancy = this.calculateRedundancy(network);
    const connectivity = this.calculateConnectivity(network);
    const bottlenecks = this.identifyBottlenecks(network);

    return {
      efficiency,
      redundancy,
      connectivity,
      bottlenecks
    };
  }

  /**
   * 分析网络安全
   */
  private async analyzeSecurity(network: NetworkEntity): Promise<NetworkAnalyticsMetrics['security']> {
    const vulnerabilities = this.assessVulnerabilities(network);
    const riskScore = this.calculateSecurityRiskScore(network);
    const recommendations = this.generateSecurityRecommendations(network);

    return {
      vulnerabilities,
      riskScore,
      recommendations
    };
  }

  /**
   * 生成优化建议
   */
  private async generateOptimizationSuggestions(network: NetworkEntity): Promise<NetworkAnalyticsMetrics['optimization']> {
    const suggestions = this.identifyOptimizationOpportunities(network);
    const potentialImprovement = this.calculatePotentialImprovement(suggestions);
    const implementationComplexity = this.assessImplementationComplexity(suggestions);

    return {
      suggestions,
      potentialImprovement,
      implementationComplexity
    };
  }

  /**
   * 评估组件健康状况
   */
  private async assessComponentHealth(network: NetworkEntity): Promise<NetworkHealthReport['components']> {
    return {
      connectivity: this.assessConnectivityHealth(network),
      performance: this.assessPerformanceHealth(network),
      security: this.assessSecurityHealth(network),
      reliability: this.assessReliabilityHealth(network)
    };
  }

  /**
   * 检测网络警报
   */
  private async detectNetworkAlerts(network: NetworkEntity): Promise<NetworkAlert[]> {
    const alerts: NetworkAlert[] = [];

    // 检测连接性问题
    if (network.nodes.length > 0 && network.edges.length === 0) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        severity: 'critical',
        type: 'connectivity',
        message: 'Network has nodes but no connections',
        timestamp: new Date().toISOString(),
        affectedNodes: network.nodes.map(n => n.agentId)
      });
    }

    // 检测性能问题
    const avgLatency = this.calculateAverageLatency(network);
    if (avgLatency > 200) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        severity: 'warning',
        type: 'performance',
        message: `High average latency detected: ${avgLatency}ms`,
        timestamp: new Date().toISOString(),
        affectedNodes: []
      });
    }

    // 检测节点状态问题
    const errorNodes = network.nodes.filter(n => n.status === 'error');
    if (errorNodes.length > 0) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        severity: 'error',
        type: 'connectivity',
        message: `${errorNodes.length} nodes in error state`,
        timestamp: new Date().toISOString(),
        affectedNodes: errorNodes.map(n => n.agentId)
      });
    }

    // 检测离线节点
    const offlineNodes = network.nodes.filter(n => n.status === 'offline');
    if (offlineNodes.length > 0) {
      alerts.push({
        id: `alert-${Date.now()}-4`,
        severity: 'warning',
        type: 'connectivity',
        message: `${offlineNodes.length} nodes are offline`,
        timestamp: new Date().toISOString(),
        affectedNodes: offlineNodes.map(n => n.agentId)
      });
    }

    // 检测未加密连接
    const unencryptedEdges = network.edges.filter(e =>
      !e.metadata.encrypted || e.metadata.encrypted === false
    );
    if (unencryptedEdges.length > 0) {
      alerts.push({
        id: `alert-${Date.now()}-5`,
        severity: 'warning',
        type: 'security',
        message: `${unencryptedEdges.length} unencrypted connections detected`,
        timestamp: new Date().toISOString(),
        affectedNodes: []
      });
    }

    return alerts;
  }

  /**
   * 分析健康趋势
   */
  private async analyzeHealthTrends(_network: NetworkEntity): Promise<HealthTrend[]> {
    // 模拟趋势分析
    return [
      {
        metric: 'latency',
        trend: 'stable',
        changeRate: 0.02,
        timeframe: '24h'
      },
      {
        metric: 'throughput',
        trend: 'improving',
        changeRate: 0.15,
        timeframe: '7d'
      }
    ];
  }

  // ===== 私有计算方法 =====

  private calculateAverageLatency(network: NetworkEntity): number {
    // 基于网络拓扑和节点数量的简化计算
    const baseLatency = 50; // 基础延迟
    const nodeLatency = network.nodes.length * 2; // 每个节点增加2ms
    const topologyFactor = network.topology === 'mesh' ? 0.8 : 1.2; // mesh拓扑更高效
    return Math.round(baseLatency + nodeLatency * topologyFactor);
  }

  private calculateThroughput(network: NetworkEntity): number {
    // 基于连接数和拓扑类型计算吞吐量 (MB/s)
    const basethroughput = 100;
    const connectionBonus = network.edges.length * 10;
    const topologyMultiplier = network.topology === 'mesh' ? 1.5 : 1.0;
    return Math.round(basethroughput + connectionBonus * topologyMultiplier);
  }

  private calculateReliability(network: NetworkEntity): number {
    // 基于冗余度和连接性计算可靠性 (0-1)
    const redundancy = this.calculateRedundancy(network);
    const connectivity = this.calculateConnectivity(network);
    return Math.min(0.95, (redundancy + connectivity) / 2);
  }

  private calculateAvailability(network: NetworkEntity): number {
    // 基于网络健康状况计算可用性 (0-1)
    const baseAvailability = 0.99;
    if (network.nodes.length === 0) {
      return 1; // 空网络可用性为1
    }
    const nodeHealthFactor = network.nodes.filter(n => n.status === 'online').length / network.nodes.length;
    return Math.min(0.999, baseAvailability * nodeHealthFactor);
  }

  private calculateTopologyEfficiency(network: NetworkEntity): number {
    // 计算拓扑效率 (0-1)
    const nodeCount = network.nodes.length;
    const edgeCount = network.edges.length;
    if (nodeCount <= 1) return 1;
    
    const optimalEdges = nodeCount - 1; // 最小连通图
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2; // 完全图
    const efficiency = 1 - Math.abs(edgeCount - optimalEdges) / maxEdges;
    return Math.max(0, Math.min(1, efficiency));
  }

  private calculateRedundancy(network: NetworkEntity): number {
    // 计算网络冗余度 (0-1)
    const nodeCount = network.nodes.length;
    const edgeCount = network.edges.length;
    if (nodeCount <= 1) return 0;
    
    const minEdges = nodeCount - 1;
    const redundantEdges = Math.max(0, edgeCount - minEdges);
    const maxRedundantEdges = ((nodeCount * (nodeCount - 1)) / 2) - minEdges;
    return maxRedundantEdges > 0 ? redundantEdges / maxRedundantEdges : 0;
  }

  private calculateConnectivity(network: NetworkEntity): number {
    // 计算网络连通性 (0-1)
    if (network.nodes.length <= 1) return 1;
    return network.edges.length > 0 ? 0.8 : 0; // 简化计算
  }

  private identifyBottlenecks(network: NetworkEntity): string[] {
    // 识别网络瓶颈节点
    const bottlenecks: string[] = [];
    
    // 简化逻辑：找出连接数最多的节点作为潜在瓶颈
    const nodeConnections = new Map<string, number>();
    network.edges.forEach(edge => {
      nodeConnections.set(edge.sourceNodeId, (nodeConnections.get(edge.sourceNodeId) || 0) + 1);
      nodeConnections.set(edge.targetNodeId, (nodeConnections.get(edge.targetNodeId) || 0) + 1);
    });

    const avgConnections = Array.from(nodeConnections.values()).reduce((a, b) => a + b, 0) / nodeConnections.size;
    nodeConnections.forEach((connections, nodeId) => {
      if (connections > avgConnections * 2) {
        bottlenecks.push(nodeId);
      }
    });

    return bottlenecks;
  }

  private assessVulnerabilities(network: NetworkEntity): number {
    // 评估安全漏洞数量
    let vulnerabilities = 0;
    
    // 检查单点故障
    if (network.nodes.length === 1) vulnerabilities += 1;
    
    // 检查未加密连接 - 基于metadata中的encrypted标志
    const unencryptedEdges = network.edges.filter(e =>
      !e.metadata.encrypted || e.metadata.encrypted === false
    );
    vulnerabilities += unencryptedEdges.length;
    
    return vulnerabilities;
  }

  private calculateSecurityRiskScore(network: NetworkEntity): number {
    // 计算安全风险分数 (0-100)
    const vulnerabilities = this.assessVulnerabilities(network);
    const baseRisk = 20; // 基础风险
    const vulnerabilityRisk = vulnerabilities * 15;
    return Math.min(100, baseRisk + vulnerabilityRisk);
  }

  private generateSecurityRecommendations(network: NetworkEntity): string[] {
    const recommendations: string[] = [];
    
    if (network.nodes.length === 1) {
      recommendations.push('Add redundant nodes to eliminate single point of failure');
    }
    
    const unencryptedEdges = network.edges.filter(e =>
      !e.metadata.encrypted || e.metadata.encrypted === false
    );
    if (unencryptedEdges.length > 0) {
      recommendations.push('Enable encryption for all network connections');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Network security configuration appears optimal');
    }
    
    return recommendations;
  }

  private identifyOptimizationOpportunities(network: NetworkEntity): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // 拓扑优化建议
    const efficiency = this.calculateTopologyEfficiency(network);
    if (efficiency < 0.7) {
      suggestions.push({
        type: 'topology',
        priority: 'high',
        description: 'Optimize network topology for better efficiency',
        expectedImprovement: (0.8 - efficiency) * 100,
        implementationCost: 50,
        riskLevel: 'medium'
      });
    }
    
    // 负载均衡建议
    const bottlenecks = this.identifyBottlenecks(network);
    if (bottlenecks.length > 0) {
      suggestions.push({
        type: 'load_balancing',
        priority: 'medium',
        description: 'Implement load balancing to reduce bottlenecks',
        expectedImprovement: 25,
        implementationCost: 30,
        riskLevel: 'low'
      });
    }
    
    return suggestions;
  }

  private calculatePotentialImprovement(suggestions: OptimizationSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => total + suggestion.expectedImprovement, 0);
  }

  private assessImplementationComplexity(suggestions: OptimizationSuggestion[]): 'low' | 'medium' | 'high' {
    const totalCost = suggestions.reduce((total, suggestion) => total + suggestion.implementationCost, 0);
    if (totalCost < 50) return 'low';
    if (totalCost < 100) return 'medium';
    return 'high';
  }

  private calculateOverallHealthScore(components: NetworkHealthReport['components']): number {
    const scores = [
      components.connectivity.score,
      components.performance.score,
      components.security.score,
      components.reliability.score
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private determineOverallHealth(score: number): NetworkHealthReport['overallHealth'] {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  private assessConnectivityHealth(network: NetworkEntity): ComponentHealth {
    const connectivity = this.calculateConnectivity(network);
    const score = Math.round(connectivity * 100);
    
    return {
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      score,
      metrics: { connectivity },
      issues: score < 80 ? ['Low network connectivity detected'] : []
    };
  }

  private assessPerformanceHealth(network: NetworkEntity): ComponentHealth {
    const latency = this.calculateAverageLatency(network);
    const throughput = this.calculateThroughput(network);
    const score = Math.round(Math.max(0, 100 - (latency - 50) / 2));
    
    return {
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      score,
      metrics: { latency, throughput },
      issues: latency > 100 ? ['High latency detected'] : []
    };
  }

  private assessSecurityHealth(network: NetworkEntity): ComponentHealth {
    const riskScore = this.calculateSecurityRiskScore(network);
    const score = Math.round(Math.max(0, 100 - riskScore));
    
    return {
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      score,
      metrics: { riskScore },
      issues: riskScore > 40 ? ['Security vulnerabilities detected'] : []
    };
  }

  private assessReliabilityHealth(network: NetworkEntity): ComponentHealth {
    const reliability = this.calculateReliability(network);
    const score = Math.round(reliability * 100);
    
    return {
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      score,
      metrics: { reliability },
      issues: reliability < 0.8 ? ['Low network reliability'] : []
    };
  }
}
