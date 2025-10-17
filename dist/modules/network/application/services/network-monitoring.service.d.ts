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
    startMonitoring(networkId: string, intervalMs?: number): Promise<void>;
    stopMonitoring(networkId: string): Promise<void>;
    getRealtimeMetrics(networkId: string): Promise<MonitoringMetrics>;
    getDashboard(networkId: string): Promise<NetworkDashboard>;
    getMetricsHistory(networkId: string, hours?: number): MonitoringMetrics[];
    getActiveAlerts(networkId: string): MonitoringAlert[];
    acknowledgeAlert(networkId: string, alertId: string): Promise<void>;
    resolveAlert(networkId: string, alertId: string): Promise<void>;
    private collectMetrics;
    private collectRealtimeMetrics;
    private collectPerformanceMetrics;
    private detectAlerts;
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