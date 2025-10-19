/**
 * Task Allocator Interface - Domain Layer
 * @description Interface for task and resource allocation operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
/**
 * Resource allocation data
 */
export interface ResourceAllocationData {
    resourceId: UUID;
    targetId: UUID;
    amount: number;
    duration: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, unknown>;
}
/**
 * Resource allocation result
 */
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
/**
 * Resource availability check result
 */
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
/**
 * Task allocation data
 */
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
/**
 * Task allocation result
 */
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
/**
 * Allocation optimization result
 */
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
/**
 * Task Allocator Interface
 * Handles all task and resource allocation operations
 *
 * @interface ITaskAllocator
 * @description Core interface for task and resource allocation as required by refactoring guide
 */
export interface ITaskAllocator {
    /**
     * Allocate resource to target
     * @param resourceId - Resource identifier
     * @param targetId - Target identifier (member, task, etc.)
     * @param amount - Amount to allocate
     * @param duration - Allocation duration in milliseconds
     * @returns Promise<ResourceAllocation> - Allocation result
     * @throws Error if allocation fails
     */
    allocateResource(resourceId: UUID, targetId: UUID, amount: number, duration: number): Promise<ResourceAllocation>;
    /**
     * Check resource availability
     * @param resourceId - Resource identifier
     * @param amount - Required amount
     * @param duration - Required duration in milliseconds
     * @returns Promise<boolean> - True if resource is available
     */
    checkResourceAvailability(resourceId: UUID, amount: number, duration: number): Promise<boolean>;
    /**
     * Get detailed resource availability information
     * @param resourceId - Resource identifier
     * @param amount - Required amount (optional)
     * @param timeWindow - Time window for availability check (optional)
     * @returns Promise<ResourceAvailability> - Detailed availability information
     */
    getResourceAvailability(resourceId: UUID, amount?: number, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<ResourceAvailability>;
    /**
     * Release allocated resource
     * @param allocationId - Allocation identifier
     * @param reason - Reason for release (optional)
     * @returns Promise<void>
     * @throws Error if release fails
     */
    releaseResource(allocationId: UUID, reason?: string): Promise<void>;
    /**
     * Allocate task to member
     * @param taskData - Task allocation data
     * @returns Promise<TaskAllocation> - Task allocation result
     * @throws Error if allocation fails
     */
    allocateTask(taskData: TaskAllocationData): Promise<TaskAllocation>;
    /**
     * Deallocate task from member
     * @param allocationId - Task allocation identifier
     * @param reason - Reason for deallocation (optional)
     * @returns Promise<void>
     * @throws Error if deallocation fails
     */
    deallocateTask(allocationId: UUID, reason?: string): Promise<void>;
    /**
     * Get optimal resource allocation
     * @param requirements - Resource requirements
     * @param constraints - Allocation constraints (optional)
     * @returns Promise<ResourceAllocation[]> - Optimal allocation plan
     */
    getOptimalResourceAllocation(requirements: ResourceAllocationData[], constraints?: {
        maxCost?: number;
        maxTime?: number;
        preferredResources?: UUID[];
        excludedResources?: UUID[];
    }): Promise<ResourceAllocation[]>;
    /**
     * Get optimal task allocation
     * @param tasks - Tasks to allocate
     * @param members - Available members
     * @param constraints - Allocation constraints (optional)
     * @returns Promise<TaskAllocation[]> - Optimal task allocation plan
     */
    getOptimalTaskAllocation(tasks: TaskAllocationData[], members: UUID[], constraints?: {
        maxTasksPerMember?: number;
        skillMatching?: boolean;
        loadBalancing?: boolean;
        deadlineOptimization?: boolean;
    }): Promise<TaskAllocation[]>;
    /**
     * Optimize existing allocations
     * @param allocationType - Type of allocation to optimize
     * @param targetIds - Target allocation IDs (optional, optimizes all if not provided)
     * @returns Promise<AllocationOptimization> - Optimization result
     */
    optimizeAllocations(allocationType: 'resource' | 'task' | 'mixed', targetIds?: UUID[]): Promise<AllocationOptimization>;
    /**
     * Get allocation statistics
     * @param timeRange - Time range for statistics (optional)
     * @returns Promise<AllocationStatistics> - Allocation statistics
     */
    getAllocationStatistics(timeRange?: {
        startDate: Date;
        endDate: Date;
    }): Promise<AllocationStatistics>;
    /**
     * Reserve resource for future allocation
     * @param resourceId - Resource identifier
     * @param amount - Amount to reserve
     * @param reservationWindow - Reservation time window
     * @param reservedBy - Who is making the reservation
     * @returns Promise<ResourceReservation> - Reservation result
     */
    reserveResource(resourceId: UUID, amount: number, reservationWindow: {
        startTime: Date;
        endTime: Date;
    }, reservedBy: UUID): Promise<ResourceReservation>;
    /**
     * Cancel resource reservation
     * @param reservationId - Reservation identifier
     * @param reason - Reason for cancellation (optional)
     * @returns Promise<void>
     * @throws Error if cancellation fails
     */
    cancelReservation(reservationId: UUID, reason?: string): Promise<void>;
}
/**
 * Allocation statistics
 */
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
/**
 * Resource reservation
 */
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