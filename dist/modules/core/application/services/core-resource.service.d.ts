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
export declare class CoreResourceService {
    private readonly coreRepository;
    private readonly resourceAllocations;
    private readonly performanceHistory;
    constructor(coreRepository: ICoreRepository);
    allocateResources(executionId: string, resourceRequirements: ResourceRequirements): Promise<ResourceAllocation>;
    releaseResources(allocationId: UUID): Promise<boolean>;
    monitorSystemPerformance(): Promise<SystemPerformanceMetrics>;
    balanceWorkload(workloadData: WorkloadData): Promise<BalancingResult>;
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
    getPerformanceHistory(hours?: number): SystemPerformanceMetrics[];
    private assessResourceNeeds;
    private checkResourceAvailability;
    private performResourceAllocation;
    private collectPerformanceMetrics;
    private analyzePerformanceTrends;
    private generatePerformanceReport;
    private analyzeCurrentLoad;
    private calculateOptimalAllocation;
    private performLoadBalancing;
}
//# sourceMappingURL=core-resource.service.d.ts.map