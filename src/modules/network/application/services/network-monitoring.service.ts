/**
 * Network Monitoring Service - 企业级网络监控服务
 * 
 * @description 提供实时网络监控、性能追踪和智能预警功能
 * @version 1.0.0
 * @layer 应用层 - 企业级服务
 */

import { NetworkEntity } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';

export interface MonitoringMetrics {
  networkId: string;
  timestamp: string;
  realTime: {
    activeConnections: number;
    messagesThroughput: number;
    averageLatency: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  performance: {
    responseTime: PerformanceMetric;
    throughput: PerformanceMetric;
    errorRate: PerformanceMetric;
    availability: PerformanceMetric;
  };
  alerts: MonitoringAlert[];
  trends: MetricTrend[];
}

export interface PerformanceMetric {
  current: number;
  average: number;
  min: number;
  max: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface MonitoringAlert {
  id: string;
  networkId: string;
  type: 'performance' | 'connectivity' | 'security' | 'capacity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
  metadata: Record<string, unknown>;
}

export interface MetricTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  timeframe: '1h' | '24h' | '7d' | '30d';
  prediction: {
    nextValue: number;
    confidence: number;
    timeToThreshold?: number;
  };
}

export interface NetworkDashboard {
  networkId: string;
  lastUpdated: string;
  overview: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    totalNodes: number;
    activeNodes: number;
    totalConnections: number;
    activeConnections: number;
  };
  performance: {
    latency: DashboardMetric;
    throughput: DashboardMetric;
    errorRate: DashboardMetric;
    availability: DashboardMetric;
  };
  capacity: {
    nodeUtilization: number;
    connectionUtilization: number;
    bandwidthUtilization: number;
    storageUtilization: number;
  };
  recentAlerts: MonitoringAlert[];
  topIssues: string[];
}

export interface DashboardMetric {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  sparkline: number[];
}

export class NetworkMonitoringService {
  private monitoringIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private metricsHistory: Map<string, MonitoringMetrics[]> = new Map();
  private activeAlerts: Map<string, MonitoringAlert[]> = new Map();

  constructor(
    private readonly networkRepository: INetworkRepository
  ) {}

  /**
   * 开始监控网络
   */
  async startMonitoring(networkId: string, intervalMs: number = 30000): Promise<void> {
    // 停止现有监控
    await this.stopMonitoring(networkId);

    // 启动新的监控间隔
    const interval = setInterval(async () => {
      try {
        await this.collectMetrics(networkId);
      } catch (error) {
        // TODO: 实现适当的错误日志记录机制
        // 暂时忽略监控错误，避免中断监控流程
      }
    }, intervalMs);

    this.monitoringIntervals.set(networkId, interval);
    
    // 立即收集一次指标
    await this.collectMetrics(networkId);
  }

  /**
   * 停止监控网络
   */
  async stopMonitoring(networkId: string): Promise<void> {
    const interval = this.monitoringIntervals.get(networkId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(networkId);
    }
  }

  /**
   * 获取实时监控指标
   */
  async getRealtimeMetrics(networkId: string): Promise<MonitoringMetrics> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    return await this.collectMetrics(networkId);
  }

  /**
   * 获取网络监控仪表板
   */
  async getDashboard(networkId: string): Promise<NetworkDashboard> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const metrics = await this.getRealtimeMetrics(networkId);
    const alerts = this.getActiveAlerts(networkId);
    const history = this.getMetricsHistory(networkId, 24); // 24小时历史

    return {
      networkId,
      lastUpdated: new Date().toISOString(),
      overview: this.buildOverview(network, metrics),
      performance: this.buildPerformanceMetrics(metrics, history),
      capacity: this.buildCapacityMetrics(network, metrics),
      recentAlerts: alerts.slice(0, 10),
      topIssues: this.identifyTopIssues(alerts, metrics)
    };
  }

  /**
   * 获取历史指标
   */
  getMetricsHistory(networkId: string, hours: number = 24): MonitoringMetrics[] {
    const history = this.metricsHistory.get(networkId) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return history.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * 获取活跃警报
   */
  getActiveAlerts(networkId: string): MonitoringAlert[] {
    return this.activeAlerts.get(networkId) || [];
  }

  /**
   * 确认警报
   */
  async acknowledgeAlert(networkId: string, alertId: string): Promise<void> {
    const alerts = this.activeAlerts.get(networkId) || [];
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.acknowledged = true;
      alert.metadata.acknowledgedAt = new Date().toISOString();
    }
  }

  /**
   * 解决警报
   */
  async resolveAlert(networkId: string, alertId: string): Promise<void> {
    const alerts = this.activeAlerts.get(networkId) || [];
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex >= 0) {
      alerts[alertIndex].resolvedAt = new Date().toISOString();
      alerts.splice(alertIndex, 1);
    }
  }

  /**
   * 收集网络指标
   */
  private async collectMetrics(networkId: string): Promise<MonitoringMetrics> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const timestamp = new Date().toISOString();
    
    // 收集实时指标
    const realTime = await this.collectRealtimeMetrics(network);
    
    // 收集性能指标
    const performance = await this.collectPerformanceMetrics(network);
    
    // 检测警报
    const alerts = await this.detectAlerts(network, realTime, performance);
    
    // 分析趋势
    const trends = this.analyzeTrends(networkId, realTime);

    const metrics: MonitoringMetrics = {
      networkId,
      timestamp,
      realTime,
      performance,
      alerts,
      trends
    };

    // 存储历史数据
    this.storeMetricsHistory(networkId, metrics);
    
    // 更新活跃警报
    this.updateActiveAlerts(networkId, alerts);

    return metrics;
  }

  /**
   * 收集实时指标
   */
  private async collectRealtimeMetrics(network: NetworkEntity): Promise<MonitoringMetrics['realTime']> {
    const _activeNodes = network.nodes.filter(n => n.status === 'online').length;
    const activeConnections = network.edges.filter(e => e.status === 'active').length;

    return {
      activeConnections,
      messagesThroughput: this.calculateMessagesThroughput(network),
      averageLatency: this.calculateCurrentLatency(network),
      errorRate: this.calculateErrorRate(network),
      cpuUsage: this.simulateCpuUsage(),
      memoryUsage: this.simulateMemoryUsage()
    };
  }

  /**
   * 收集性能指标
   */
  private async collectPerformanceMetrics(network: NetworkEntity): Promise<MonitoringMetrics['performance']> {
    const history = this.getMetricsHistory(network.networkId, 1);
    
    return {
      responseTime: this.buildPerformanceMetric('responseTime', network, history),
      throughput: this.buildPerformanceMetric('throughput', network, history),
      errorRate: this.buildPerformanceMetric('errorRate', network, history),
      availability: this.buildPerformanceMetric('availability', network, history)
    };
  }

  /**
   * 检测警报
   */
  private async detectAlerts(
    network: NetworkEntity,
    realTime: MonitoringMetrics['realTime'],
    _performance: MonitoringMetrics['performance']
  ): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = [];

    // 检测高延迟
    if (realTime.averageLatency > 200) {
      alerts.push(this.createAlert(
        network.networkId,
        'performance',
        'warning',
        'High Latency Detected',
        `Average latency is ${realTime.averageLatency}ms, exceeding threshold of 200ms`,
        { latency: realTime.averageLatency }
      ));
    }

    // 检测高错误率
    if (realTime.errorRate > 0.05) {
      alerts.push(this.createAlert(
        network.networkId,
        'performance',
        'error',
        'High Error Rate',
        `Error rate is ${(realTime.errorRate * 100).toFixed(2)}%, exceeding threshold of 5%`,
        { errorRate: realTime.errorRate }
      ));
    }

    // 检测连接问题
    if (realTime.activeConnections === 0 && network.nodes.length > 1) {
      alerts.push(this.createAlert(
        network.networkId,
        'connectivity',
        'critical',
        'No Active Connections',
        'Network has no active connections despite having multiple nodes',
        { nodeCount: network.nodes.length }
      ));
    }

    // 检测容量问题
    if (realTime.cpuUsage > 90) {
      alerts.push(this.createAlert(
        network.networkId,
        'capacity',
        'warning',
        'High CPU Usage',
        `CPU usage is ${realTime.cpuUsage}%, approaching capacity limit`,
        { cpuUsage: realTime.cpuUsage }
      ));
    }

    return alerts;
  }

  /**
   * 分析趋势
   */
  private analyzeTrends(networkId: string, realTime: MonitoringMetrics['realTime']): MetricTrend[] {
    const history = this.getMetricsHistory(networkId, 1);
    const trends: MetricTrend[] = [];

    if (history.length > 1) {
      const previous = history[history.length - 2];
      
      // 分析延迟趋势
      const latencyTrend = this.calculateTrend(
        previous.realTime.averageLatency,
        realTime.averageLatency,
        200 // 阈值
      );
      trends.push(latencyTrend);

      // 分析吞吐量趋势
      const throughputTrend = this.calculateTrend(
        previous.realTime.messagesThroughput,
        realTime.messagesThroughput,
        1000 // 阈值
      );
      trends.push(throughputTrend);
    }

    return trends;
  }

  // ===== 私有辅助方法 =====

  private calculateMessagesThroughput(network: NetworkEntity): number {
    // 基于网络规模和活跃连接模拟吞吐量
    const activeConnections = network.edges.filter(e => e.status === 'active').length;
    const baseRate = 100;
    const connectionMultiplier = activeConnections * 50;
    return baseRate + connectionMultiplier + Math.random() * 100;
  }

  private calculateCurrentLatency(network: NetworkEntity): number {
    // 基于网络拓扑和负载模拟当前延迟
    const baseLatency = 50;
    const nodeLatency = network.nodes.length * 2;
    const loadFactor = 1 + Math.random() * 0.5;
    return Math.round((baseLatency + nodeLatency) * loadFactor);
  }

  private calculateErrorRate(network: NetworkEntity): number {
    // 模拟错误率
    const baseErrorRate = 0.01;
    const complexityFactor = network.nodes.length > 10 ? 0.02 : 0;
    return baseErrorRate + complexityFactor + Math.random() * 0.02;
  }

  private simulateCpuUsage(): number {
    return Math.round(30 + Math.random() * 40); // 30-70%
  }

  private simulateMemoryUsage(): number {
    return Math.round(40 + Math.random() * 30); // 40-70%
  }

  private buildPerformanceMetric(
    type: string, 
    network: NetworkEntity, 
    history: MonitoringMetrics[]
  ): PerformanceMetric {
    let current: number;
    let threshold: number;

    switch (type) {
      case 'responseTime':
        current = this.calculateCurrentLatency(network);
        threshold = 200;
        break;
      case 'throughput':
        current = this.calculateMessagesThroughput(network);
        threshold = 500;
        break;
      case 'errorRate':
        current = this.calculateErrorRate(network);
        threshold = 0.05;
        break;
      case 'availability':
        current = network.nodes.filter(n => n.status === 'online').length / network.nodes.length;
        threshold = 0.95;
        break;
      default:
        current = 0;
        threshold = 0;
    }

    const values = history.map(h => {
      switch (type) {
        case 'responseTime': return h.realTime.averageLatency;
        case 'throughput': return h.realTime.messagesThroughput;
        case 'errorRate': return h.realTime.errorRate;
        case 'availability': return 1 - h.realTime.errorRate; // 简化计算
        default: return 0;
      }
    });

    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : current;
    const min = values.length > 0 ? Math.min(...values) : current;
    const max = values.length > 0 ? Math.max(...values) : current;

    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (type === 'errorRate' || type === 'responseTime') {
      if (current > threshold * 1.5) status = 'critical';
      else if (current > threshold) status = 'warning';
    } else {
      if (current < threshold * 0.5) status = 'critical';
      else if (current < threshold) status = 'warning';
    }

    return {
      current,
      average,
      min,
      max,
      threshold,
      status
    };
  }

  private createAlert(
    networkId: string,
    type: MonitoringAlert['type'],
    severity: MonitoringAlert['severity'],
    title: string,
    description: string,
    metadata: Record<string, unknown>
  ): MonitoringAlert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      networkId,
      type,
      severity,
      title,
      description,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      metadata
    };
  }

  private calculateTrend(previous: number, current: number, threshold: number): MetricTrend {
    const changePercent = ((current - previous) / previous) * 100;
    const direction = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';
    
    return {
      metric: 'latency',
      direction,
      changePercent,
      timeframe: '1h',
      prediction: {
        nextValue: current + (current - previous),
        confidence: 0.7,
        timeToThreshold: direction === 'up' && current < threshold ? 
          Math.round((threshold - current) / (current - previous)) : undefined
      }
    };
  }

  private storeMetricsHistory(networkId: string, metrics: MonitoringMetrics): void {
    const history = this.metricsHistory.get(networkId) || [];
    history.push(metrics);
    
    // 保留最近24小时的数据
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(m => 
      new Date(m.timestamp).getTime() > cutoffTime
    );
    
    this.metricsHistory.set(networkId, filteredHistory);
  }

  private updateActiveAlerts(networkId: string, newAlerts: MonitoringAlert[]): void {
    const existingAlerts = this.activeAlerts.get(networkId) || [];
    
    // 合并新警报，避免重复
    const allAlerts = [...existingAlerts];
    newAlerts.forEach(newAlert => {
      const exists = existingAlerts.some(existing => 
        existing.type === newAlert.type && 
        existing.title === newAlert.title &&
        !existing.resolvedAt
      );
      
      if (!exists) {
        allAlerts.push(newAlert);
      }
    });
    
    this.activeAlerts.set(networkId, allAlerts);
  }

  private buildOverview(network: NetworkEntity, metrics: MonitoringMetrics): NetworkDashboard['overview'] {
    const activeNodes = network.nodes.filter(n => n.status === 'online').length;
    const status = metrics.alerts.some(a => a.severity === 'critical') ? 'critical' :
                  metrics.alerts.some(a => a.severity === 'error') ? 'degraded' : 'healthy';

    return {
      status,
      uptime: 0.99, // 模拟正常运行时间
      totalNodes: network.nodes.length,
      activeNodes,
      totalConnections: network.edges.length,
      activeConnections: metrics.realTime.activeConnections
    };
  }

  private buildPerformanceMetrics(
    metrics: MonitoringMetrics, 
    history: MonitoringMetrics[]
  ): NetworkDashboard['performance'] {
    const sparklineData = history.slice(-20).map(h => h.realTime.averageLatency);
    
    return {
      latency: {
        value: metrics.realTime.averageLatency,
        unit: 'ms',
        trend: 'stable',
        status: metrics.realTime.averageLatency > 200 ? 'critical' : 
                metrics.realTime.averageLatency > 100 ? 'warning' : 'good',
        sparkline: sparklineData
      },
      throughput: {
        value: metrics.realTime.messagesThroughput,
        unit: 'msg/s',
        trend: 'up',
        status: 'good',
        sparkline: history.slice(-20).map(h => h.realTime.messagesThroughput)
      },
      errorRate: {
        value: metrics.realTime.errorRate * 100,
        unit: '%',
        trend: 'stable',
        status: metrics.realTime.errorRate > 0.05 ? 'critical' : 'good',
        sparkline: history.slice(-20).map(h => h.realTime.errorRate * 100)
      },
      availability: {
        value: 99.5,
        unit: '%',
        trend: 'stable',
        status: 'good',
        sparkline: Array(20).fill(99.5)
      }
    };
  }

  private buildCapacityMetrics(network: NetworkEntity, metrics: MonitoringMetrics): NetworkDashboard['capacity'] {
    return {
      nodeUtilization: (network.nodes.filter(n => n.status === 'online').length / network.nodes.length) * 100,
      connectionUtilization: (metrics.realTime.activeConnections / network.edges.length) * 100,
      bandwidthUtilization: 65, // 模拟带宽使用率
      storageUtilization: 45 // 模拟存储使用率
    };
  }

  private identifyTopIssues(alerts: MonitoringAlert[], metrics: MonitoringMetrics): string[] {
    const issues: string[] = [];
    
    if (metrics.realTime.averageLatency > 200) {
      issues.push('High network latency affecting performance');
    }
    
    if (metrics.realTime.errorRate > 0.05) {
      issues.push('Elevated error rate detected');
    }
    
    if (alerts.some(a => a.type === 'connectivity')) {
      issues.push('Network connectivity issues');
    }
    
    return issues.slice(0, 5);
  }
}
