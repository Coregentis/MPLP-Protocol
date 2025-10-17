import { UUID } from '../../../../shared/types';
export interface ResourceAllocationData {
    resourceId: UUID;
    targetId: UUID;
    amount: number;
    duration: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, unknown>;
}
export interface ResourceAllocation {
    allocationId: UUID;
    resourceId: UUID;
    targetId: UUID;
    amount: number;
    duration: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'allocated' | 'active' | 'released' | 'failed';
    allocatedAt: Date;
    expiresAt?: Date;
    metadata: Record<string, unknown>;
}
export interface ResourceAvailability {
    resourceId: UUID;
    isAvailable: boolean;
    availableAmount: number;
    totalAmount: number;
    allocatedAmount: number;
    reservedAmount: number;
    availabilityWindow?: {
        startTime: Date;
        endTime: Date;
    };
    constraints: string[];
    recommendations: string[];
}
export interface TaskAllocationData {
    taskId: UUID;
    assigneeId: UUID;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration?: number;
    requiredCapabilities?: string[];
    dependencies?: UUID[];
    deadline?: Date;
    metadata?: Record<string, unknown>;
}
export interface TaskAllocation {
    allocationId: UUID;
    taskId: UUID;
    assigneeId: UUID;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'assigned' | 'accepted' | 'rejected' | 'completed';
    allocatedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    metadata: Record<string, unknown>;
}
export interface AllocationOptimization {
    optimizationId: UUID;
    targetType: 'resource' | 'task' | 'mixed';
    currentAllocation: ResourceAllocation[] | TaskAllocation[];
    optimizedAllocation: ResourceAllocation[] | TaskAllocation[];
    improvementMetrics: {
        efficiencyGain: number;
        costReduction: number;
        timeReduction: number;
        utilizationImprovement: number;
    };
    implementationPlan: {
        steps: string[];
        estimatedTime: number;
        risks: string[];
        prerequisites: string[];
    };
}
export interface ITaskAllocator {
    allocateResource(resourceId: UUID, targetId: UUID, amount: number, duration: number): Promise<ResourceAllocation>;
    checkResourceAvailability(resourceId: UUID, amount: number, duration: number): Promise<boolean>;
    getResourceAvailability(resourceId: UUID, amount?: number, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<ResourceAvailability>;
    releaseResource(allocationId: UUID, reason?: string): Promise<void>;
    allocateTask(taskData: TaskAllocationData): Promise<TaskAllocation>;
    deallocateTask(allocationId: UUID, reason?: string): Promise<void>;
    getOptimalResourceAllocation(requirements: ResourceAllocationData[], constraints?: {
        maxCost?: number;
        maxTime?: number;
        preferredResources?: UUID[];
        excludedResources?: UUID[];
    }): Promise<ResourceAllocation[]>;
    getOptimalTaskAllocation(tasks: TaskAllocationData[], members: UUID[], constraints?: {
        maxTasksPerMember?: number;
        skillMatching?: boolean;
        loadBalancing?: boolean;
        deadlineOptimization?: boolean;
    }): Promise<TaskAllocation[]>;
    optimizeAllocations(allocationType: 'resource' | 'task' | 'mixed', targetIds?: UUID[]): Promise<AllocationOptimization>;
    getAllocationStatistics(timeRange?: {
        startDate: Date;
        endDate: Date;
    }): Promise<AllocationStatistics>;
    reserveResource(resourceId: UUID, amount: number, reservationWindow: {
        startTime: Date;
        endTime: Date;
    }, reservedBy: UUID): Promise<ResourceReservation>;
    cancelReservation(reservationId: UUID, reason?: string): Promise<void>;
}
export interface AllocationStatistics {
    totalAllocations: number;
    activeAllocations: number;
    completedAllocations: number;
    failedAllocations: number;
    averageAllocationDuration: number;
    resourceUtilizationRate: number;
    taskCompletionRate: number;
    allocationEfficiency: number;
    costMetrics: {
        totalCost: number;
        averageCostPerAllocation: number;
        costSavings: number;
    };
    timeRange: {
        startDate: Date;
        endDate: Date;
    };
}
export interface ResourceReservation {
    reservationId: UUID;
    resourceId: UUID;
    amount: number;
    reservedBy: UUID;
    reservedAt: Date;
    reservationWindow: {
        startTime: Date;
        endTime: Date;
    };
    status: 'active' | 'expired' | 'cancelled' | 'converted';
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=task-allocator.interface.d.ts.map