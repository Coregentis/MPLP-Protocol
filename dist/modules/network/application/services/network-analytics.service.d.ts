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
    healthScore: number;
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
export declare class NetworkAnalyticsService {
    private readonly networkRepository;
    constructor(networkRepository: INetworkRepository);
    analyzeNetwork(networkId: string): Promise<NetworkAnalyticsMetrics>;
    generateHealthReport(networkId: string): Promise<NetworkHealthReport>;
    private analyzePerformance;
    private analyzeTopology;
    private analyzeSecurity;
    private generateOptimizationSuggestions;
    private assessComponentHealth;
    private detectNetworkAlerts;
    private analyzeHealthTrends;
    private calculateAverageLatency;
    private calculateThroughput;
    private calculateReliability;
    private calculateAvailability;
    private calculateTopologyEfficiency;
    private calculateRedundancy;
    private calculateConnectivity;
    private identifyBottlenecks;
    private assessVulnerabilities;
    private calculateSecurityRiskScore;
    private generateSecurityRecommendations;
    private identifyOptimizationOpportunities;
    private calculatePotentialImprovement;
    private assessImplementationComplexity;
    private calculateOverallHealthScore;
    private determineOverallHealth;
    private assessConnectivityHealth;
    private assessPerformanceHealth;
    private assessSecurityHealth;
    private assessReliabilityHealth;
}
//# sourceMappingURL=network-analytics.service.d.ts.map