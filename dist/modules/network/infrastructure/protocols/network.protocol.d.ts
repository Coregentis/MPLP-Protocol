import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
import { NetworkManagementService } from '../../application/services/network-management.service.js';
import { NetworkAnalyticsService } from '../../application/services/network-analytics.service';
import { NetworkMonitoringService } from '../../application/services/network-monitoring.service';
import { NetworkSecurityService } from '../../application/services/network-security.service';
import { NetworkTopology } from '../../types';
interface TopologyMetrics {
    averageLatency: number;
    reliability: number;
    throughput: number;
    redundancy: number;
    cost: number;
    efficiency: number;
}
interface PerformanceImprovement {
    latency: number;
    reliability: number;
    throughput: number;
    cost: number;
    overall: number;
}
export declare class NetworkProtocol implements IMLPPProtocol {
    private readonly networkManagementService;
    private readonly networkAnalyticsService;
    private readonly networkMonitoringService;
    private readonly networkSecurityService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    protocolName: string;
    protocolVersion: string;
    protocolType: string;
    capabilities: string[];
    isInitialized: boolean;
    isActive: boolean;
    lastHealthCheck: string | null;
    errorCount: number;
    maxErrors: number;
    metrics: {
        operationsCount: number;
        averageResponseTime: number;
        errorRate: number;
        lastOperationTime: string | null;
    };
    config: Record<string, unknown>;
    initTime: number;
    cache?: Map<string, unknown>;
    metricsCollector?: {
        operations: Record<string, unknown>[];
        errors: Record<string, unknown>[];
        responseTimeHistory: {
            time: number;
            timestamp: string;
            success: boolean;
        }[];
    };
    healthCheckInterval?: ReturnType<typeof setTimeout>;
    constructor(networkManagementService: NetworkManagementService, networkAnalyticsService: NetworkAnalyticsService, networkMonitoringService: NetworkMonitoringService, networkSecurityService: NetworkSecurityService, securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    initialize(config?: Record<string, unknown>): Promise<boolean>;
    execute(operation: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
    validate(data: Record<string, unknown>, schema?: string): Promise<{
        valid: boolean;
        errors?: string[];
        schema?: string;
        timestamp?: string;
    }>;
    getMetadata(): {
        name: string;
        version: string;
        type: string;
        capabilities: string[];
        status: {
            initialized: boolean;
            active: boolean;
            errorCount: number;
            maxErrors: number;
            lastHealthCheck: string | null;
        };
        metrics: {
            uptime: number;
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        config: {
            enableLogging: {};
            enableMetrics: {};
            enableCaching: {};
            networkTimeout: {};
            maxConnections: {};
        };
        supportedOperations: string[];
        timestamp: string;
    };
    getProtocolMetadata(): ProtocolMetadata;
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    healthCheck(): Promise<HealthStatus>;
    initializeComponents(): Promise<void>;
    registerCapabilities(): Promise<void>;
    startHealthCheck(): void;
    updateMetrics(responseTime: number, success: boolean): void;
    createNetwork(params: Record<string, unknown>): Promise<{
        networkId: string;
        status: string;
        topology: NetworkTopology;
        nodeCount: number;
        edgeCount: number;
        name: string;
        description: string | undefined;
        createdAt: Date;
        updatedAt: Date | undefined;
    }>;
    updateNetwork(params: Record<string, unknown>): Promise<{
        networkId: string;
        status: string;
        updatedFields: string[];
        name: string | undefined;
        description: string | undefined;
        topology: NetworkTopology | undefined;
        updatedAt: Date | undefined;
    }>;
    deleteNetwork(params: Record<string, unknown>): Promise<{
        networkId: string;
        status: string;
        deletedAt: string;
        success: boolean;
    }>;
    addNode(_params: Record<string, unknown>): Promise<{
        nodeId: string;
        status: string;
    }>;
    removeNode(params: Record<string, unknown>): Promise<{
        nodeId: unknown;
        status: string;
    }>;
    updateNodeStatus(params: Record<string, unknown>): Promise<{
        nodeId: unknown;
        status: unknown;
    }>;
    addEdge(_params: Record<string, unknown>): Promise<{
        edgeId: string;
        status: string;
    }>;
    removeEdge(params: Record<string, unknown>): Promise<{
        edgeId: unknown;
        status: string;
    }>;
    getNetworkStats(params: Record<string, unknown>): Promise<{
        networkId: unknown;
        stats: {};
    }>;
    checkNetworkHealth(params: Record<string, unknown>): Promise<{
        networkId: unknown;
        healthy: boolean;
    }>;
    optimizeTopology(params: Record<string, unknown>): Promise<{
        networkId: string;
        optimized: boolean;
        optimizationGoal: string;
        improvement: PerformanceImprovement;
        beforeMetrics: TopologyMetrics;
        afterMetrics: TopologyMetrics;
        optimizationPlan: {
            totalActions: number;
            estimatedImprovement: number;
            estimatedCost: number;
        };
        executionTime: number;
        timestamp: string;
    }>;
    discoverNodes(params: Record<string, unknown>): Promise<{
        networkId: unknown;
        nodes: never[];
    }>;
    routeMessage(params: Record<string, unknown>): Promise<{
        messageId: string;
        routed: boolean;
        path: string[];
        estimatedLatency: number;
        actualLatency: number;
        hops: number;
        routingStrategy: string;
        loadBalanced: boolean;
        securityValidated: boolean;
        timestamp: string;
    }>;
    private calculateOptimalRoute;
    private buildNetworkGraph;
    private dijkstraShortestPath;
    private minimumLatencyPath;
    private loadBalancedPath;
    private faultTolerantPath;
    private applyLoadBalancing;
    private findAlternativePath;
    private validateRoutePermissions;
    private executeRouting;
    private analyzeTopologyMetrics;
    private generateOptimizationPlan;
    private executeTopologyOptimization;
    private calculateImprovement;
    private identifyCriticalPaths;
    private findIsolatedNodes;
    private findNearestNode;
    private identifyRedundantEdges;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: string;
        details: Record<string, unknown>;
    }>;
    private getActiveNetworkCount;
    private getActiveConnectionCount;
    private getAverageLatency;
}
export {};
//# sourceMappingURL=network.protocol.d.ts.map