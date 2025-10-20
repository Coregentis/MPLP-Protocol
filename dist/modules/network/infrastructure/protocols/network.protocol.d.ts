/**
 * Network协议实现
 *
 * @description Network模块的MPLP协议实现，基于标准IMLPPProtocol接口和MLPPProtocolBase基类
 * @version 1.0.0
 * @layer 基础设施层 - 协议实现
 * @architecture 统一DDD架构 + L3管理器注入模式
 */
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
import { NetworkManagementService } from '../../application/services/network-management.service.js';
import { NetworkAnalyticsService } from '../../application/services/network-analytics.service';
import { NetworkMonitoringService } from '../../application/services/network-monitoring.service';
import { NetworkSecurityService } from '../../application/services/network-security.service';
import { NetworkTopology } from '../../types';
/**
 * 拓扑性能指标接口
 */
interface TopologyMetrics {
    averageLatency: number;
    reliability: number;
    throughput: number;
    redundancy: number;
    cost: number;
    efficiency: number;
}
/**
 * 性能改进接口
 */
interface PerformanceImprovement {
    latency: number;
    reliability: number;
    throughput: number;
    cost: number;
    overall: number;
}
/**
 * Network协议类
 * 直接实现IMLPPProtocol接口
 * @pattern 与其他8个模块使用IDENTICAL的直接实现IMLPPProtocol模式
 */
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
    /**
     * 初始化协议
     * @param config 协议配置
     * @returns 初始化结果
     */
    initialize(config?: Record<string, unknown>): Promise<boolean>;
    /**
     * 执行协议操作
     * @param operation 操作类型
     * @param params 操作参数
     * @returns 执行结果
     */
    execute(operation: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 验证协议数据
     * @param data 待验证数据
     * @param schema Schema类型
     * @returns 验证结果
     */
    validate(data: Record<string, unknown>, schema?: string): Promise<{
        valid: boolean;
        errors?: string[];
        schema?: string;
        timestamp?: string;
    }>;
    /**
     * 获取协议元数据
     * @returns {Object} 协议元数据
     */
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
            lastHealthCheck: string;
        };
        metrics: {
            uptime: number;
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        config: {
            enableLogging: unknown;
            enableMetrics: unknown;
            enableCaching: unknown;
            networkTimeout: unknown;
            maxConnections: unknown;
        };
        supportedOperations: string[];
        timestamp: string;
    };
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     * @pattern 与其他8个模块使用IDENTICAL的标准接口实现
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     * @pattern 与其他8个模块使用IDENTICAL的标准接口实现
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 健康检查
     * @returns {Promise<HealthStatus>} 标准健康状态
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 初始化内部组件
     */
    initializeComponents(): Promise<void>;
    /**
     * 注册协议能力
     */
    registerCapabilities(): Promise<void>;
    /**
     * 启动健康检查
     */
    startHealthCheck(): void;
    /**
     * 更新性能指标
     */
    updateMetrics(responseTime: number, success: boolean): void;
    createNetwork(params: Record<string, unknown>): Promise<{
        networkId: string;
        status: string;
        topology: NetworkTopology;
        nodeCount: number;
        edgeCount: number;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateNetwork(params: Record<string, unknown>): Promise<{
        networkId: string;
        status: string;
        updatedFields: string[];
        name: string;
        description: string;
        topology: NetworkTopology;
        updatedAt: Date;
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
        nodes: any[];
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
    /**
     * 计算最优路由路径
     * 支持多种路由策略：最短路径、最小延迟、负载均衡、容错路由
     */
    private calculateOptimalRoute;
    /**
     * 构建网络图数据结构
     */
    private buildNetworkGraph;
    /**
     * Dijkstra最短路径算法
     */
    private dijkstraShortestPath;
    /**
     * 最小延迟路径算法
     */
    private minimumLatencyPath;
    /**
     * 负载均衡路径算法
     */
    private loadBalancedPath;
    /**
     * 容错路径算法
     */
    private faultTolerantPath;
    /**
     * 应用负载均衡策略
     */
    private applyLoadBalancing;
    /**
     * 寻找替代路径
     */
    private findAlternativePath;
    /**
     * 验证路由权限
     */
    private validateRoutePermissions;
    /**
     * 执行路由
     */
    private executeRouting;
    /**
     * 分析拓扑性能指标
     */
    private analyzeTopologyMetrics;
    /**
     * 生成优化计划
     */
    private generateOptimizationPlan;
    /**
     * 执行拓扑优化
     */
    private executeTopologyOptimization;
    /**
     * 计算改进程度
     */
    private calculateImprovement;
    private identifyCriticalPaths;
    private findIsolatedNodes;
    private findNearestNode;
    private identifyRedundantEdges;
    /**
     * 获取健康状态
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: string;
        details: Record<string, unknown>;
    }>;
    /**
     * 获取活跃网络数量
     */
    private getActiveNetworkCount;
    /**
     * 获取活跃连接数量
     */
    private getActiveConnectionCount;
    /**
     * 获取平均延迟
     */
    private getAverageLatency;
}
export {};
//# sourceMappingURL=network.protocol.d.ts.map