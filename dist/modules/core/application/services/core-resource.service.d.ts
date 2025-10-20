/**
 * 资源管理服务
 * 职责：系统资源分配、性能监控、负载均衡
 * 遵循DDD应用服务模式
 */
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID } from '../../types';
export interface ResourceRequirements {
    cpuCores?: number;
    memoryMb?: number;
    diskSpaceMb?: number;
    networkBandwidthMbps?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDurationMs?: number;
}
export interface ResourceAllocation {
    allocationId: UUID;
    executionId: string;
    allocatedResources: {
        cpuCores: number;
        memoryMb: number;
        diskSpaceMb: number;
        networkBandwidthMbps: number;
    };
    allocationTime: string;
    estimatedReleaseTime?: string;
    status: 'allocated' | 'in_use' | 'released' | 'failed';
}
export interface SystemPerformanceMetrics {
    timestamp: string;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
    networkUsagePercent: number;
    activeWorkflows: number;
    queuedWorkflows: number;
    averageResponseTimeMs: number;
    throughputPerSecond: number;
    errorRate: number;
}
export interface WorkloadData {
    workflowId: UUID;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedResourceUsage: ResourceRequirements;
    currentLoad: number;
    targetNodes?: string[];
}
export interface BalancingResult {
    balancingId: UUID;
    workflowId: UUID;
    originalNode?: string;
    targetNode: string;
    balancingTime: string;
    estimatedImprovement: {
        loadReduction: number;
        responseTimeImprovement: number;
    };
    status: 'pending' | 'completed' | 'failed';
}
/**
 * 资源管理服务类
 * 提供系统资源的智能分配和管理
 */
export declare class CoreResourceService {
    private readonly coreRepository;
    private readonly resourceAllocations;
    private readonly performanceHistory;
    constructor(coreRepository: ICoreRepository);
    /**
     * 分配系统资源
     * @param executionId 执行ID
     * @param resourceRequirements 资源需求
     * @returns 资源分配结果
     */
    allocateResources(executionId: string, resourceRequirements: ResourceRequirements): Promise<ResourceAllocation>;
    /**
     * 释放系统资源
     * @param allocationId 分配ID
     * @returns 是否释放成功
     */
    releaseResources(allocationId: UUID): Promise<boolean>;
    /**
     * 监控系统性能
     * @returns 系统性能指标
     */
    monitorSystemPerformance(): Promise<SystemPerformanceMetrics>;
    /**
     * 执行负载均衡
     * @param workloadData 工作负载数据
     * @returns 负载均衡结果
     */
    balanceWorkload(workloadData: WorkloadData): Promise<BalancingResult>;
    /**
     * 获取资源使用统计
     * @returns 资源使用统计
     */
    getResourceUsageStatistics(): Promise<{
        totalAllocations: number;
        activeAllocations: number;
        averageAllocationDuration: number;
        resourceUtilization: {
            cpu: number;
            memory: number;
            disk: number;
            network: number;
        };
    }>;
    /**
     * 获取性能历史数据
     * @param hours 获取最近几小时的数据
     * @returns 性能历史数据
     */
    getPerformanceHistory(hours?: number): SystemPerformanceMetrics[];
    /**
     * 评估资源需求
     */
    private assessResourceNeeds;
    /**
     * 检查资源可用性
     */
    private checkResourceAvailability;
    /**
     * 执行资源分配
     */
    private performResourceAllocation;
    /**
     * 收集性能指标
     */
    private collectPerformanceMetrics;
    /**
     * 分析性能趋势
     */
    private analyzePerformanceTrends;
    /**
     * 生成性能报告
     */
    private generatePerformanceReport;
    /**
     * 分析当前负载
     */
    private analyzeCurrentLoad;
    /**
     * 计算最优分配
     */
    private calculateOptimalAllocation;
    /**
     * 执行负载重分配
     */
    private performLoadBalancing;
}
//# sourceMappingURL=core-resource.service.d.ts.map