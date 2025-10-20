/**
 * Network Monitoring Service - 企业级网络监控服务
 *
 * @description 提供实时网络监控、性能追踪和智能预警功能
 * @version 1.0.0
 * @layer 应用层 - 企业级服务
 */
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
export declare class NetworkMonitoringService {
    private readonly networkRepository;
    private monitoringIntervals;
    private metricsHistory;
    private activeAlerts;
    constructor(networkRepository: INetworkRepository);
    /**
     * 开始监控网络
     */
    startMonitoring(networkId: string, intervalMs?: number): Promise<void>;
    /**
     * 停止监控网络
     */
    stopMonitoring(networkId: string): Promise<void>;
    /**
     * 获取实时监控指标
     */
    getRealtimeMetrics(networkId: string): Promise<MonitoringMetrics>;
    /**
     * 获取网络监控仪表板
     */
    getDashboard(networkId: string): Promise<NetworkDashboard>;
    /**
     * 获取历史指标
     */
    getMetricsHistory(networkId: string, hours?: number): MonitoringMetrics[];
    /**
     * 获取活跃警报
     */
    getActiveAlerts(networkId: string): MonitoringAlert[];
    /**
     * 确认警报
     */
    acknowledgeAlert(networkId: string, alertId: string): Promise<void>;
    /**
     * 解决警报
     */
    resolveAlert(networkId: string, alertId: string): Promise<void>;
    /**
     * 收集网络指标
     */
    private collectMetrics;
    /**
     * 收集实时指标
     */
    private collectRealtimeMetrics;
    /**
     * 收集性能指标
     */
    private collectPerformanceMetrics;
    /**
     * 检测警报
     */
    private detectAlerts;
    /**
     * 分析趋势
     */
    private analyzeTrends;
    private calculateMessagesThroughput;
    private calculateCurrentLatency;
    private calculateErrorRate;
    private simulateCpuUsage;
    private simulateMemoryUsage;
    private buildPerformanceMetric;
    private createAlert;
    private calculateTrend;
    private storeMetricsHistory;
    private updateActiveAlerts;
    private buildOverview;
    private buildPerformanceMetrics;
    private buildCapacityMetrics;
    private identifyTopIssues;
}
//# sourceMappingURL=network-monitoring.service.d.ts.map