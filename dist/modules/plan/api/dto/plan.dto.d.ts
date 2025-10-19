/**
 * Plan模块DTO定义
 *
 * @description API层数据传输对象，用于请求和响应的数据结构定义
 * @version 1.0.0
 * @layer API层 - 数据传输对象
 */
import { PlanStatus, TaskType, TaskStatus, MilestoneStatus, CreatePlanRequest, UpdatePlanRequest, PlanQueryFilter, Task, Milestone, ResourceAllocation, RiskItem, ExecutionConfig, OptimizationConfig, ValidationRule, CoordinationConfig, AuditTrail } from '../../types';
import { Priority, UUID, Timestamp } from '../../../../shared/types';
/**
 * 创建Plan请求DTO
 */
export declare class CreatePlanDto implements CreatePlanRequest {
    contextId: UUID;
    name: string;
    description?: string;
    priority?: Priority;
    tasks?: Partial<Task>[];
    milestones?: Partial<Milestone>[];
    executionConfig?: Partial<ExecutionConfig>;
    optimizationConfig?: Partial<OptimizationConfig>;
}
/**
 * 更新Plan请求DTO
 */
export declare class UpdatePlanDto implements UpdatePlanRequest {
    planId: UUID;
    name?: string;
    description?: string;
    status?: PlanStatus;
    priority?: Priority;
    tasks?: Partial<Task>[];
    milestones?: Partial<Milestone>[];
    executionConfig?: Partial<ExecutionConfig>;
    optimizationConfig?: Partial<OptimizationConfig>;
}
/**
 * Plan查询DTO
 */
export declare class PlanQueryDto implements PlanQueryFilter {
    status?: PlanStatus | PlanStatus[];
    priority?: Priority | Priority[];
    contextId?: UUID;
    createdAfter?: Timestamp;
    createdBefore?: Timestamp;
    namePattern?: string;
    assignedTo?: string;
}
/**
 * Plan响应DTO
 */
export declare class PlanResponseDto {
    planId: UUID;
    contextId: UUID;
    name: string;
    description?: string;
    status: PlanStatus;
    priority: Priority;
    protocolVersion: string;
    timestamp: Timestamp;
    tasks: Task[];
    milestones?: Milestone[];
    resources?: ResourceAllocation[];
    risks?: RiskItem[];
    executionConfig?: ExecutionConfig;
    optimizationConfig?: OptimizationConfig;
    validationRules?: ValidationRule[];
    coordinationConfig?: CoordinationConfig;
    auditTrail: AuditTrail;
    monitoringIntegration: Record<string, unknown>;
    performanceMetrics: Record<string, unknown>;
    versionHistory?: Record<string, unknown>;
    searchMetadata?: Record<string, unknown>;
    cachingPolicy?: Record<string, unknown>;
    eventIntegration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: string;
    updatedBy?: string;
}
/**
 * 分页Plan响应DTO
 */
export declare class PaginatedPlanResponseDto {
    success: boolean;
    data: PlanResponseDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
/**
 * Plan操作结果DTO
 */
export declare class PlanOperationResultDto {
    success: boolean;
    planId?: UUID;
    message?: string;
    metadata?: Record<string, unknown>;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
/**
 * Plan执行DTO
 */
export declare class PlanExecutionDto {
    executionMode?: 'sequential' | 'parallel' | 'adaptive';
    dryRun?: boolean;
    skipValidation?: boolean;
    notifyOnCompletion?: boolean;
    customConfig?: Record<string, unknown>;
}
/**
 * Plan优化DTO
 */
export declare class PlanOptimizationDto {
    targets?: ('time' | 'cost' | 'quality' | 'resource' | 'risk')[];
    constraints?: {
        maxDuration?: number;
        maxCost?: number;
        minQuality?: number;
        resourceLimits?: Record<string, number>;
    };
    algorithm?: 'genetic' | 'simulated_annealing' | 'particle_swarm' | 'greedy';
    iterations?: number;
}
/**
 * Plan验证DTO
 */
export declare class PlanValidationDto {
    validationLevel?: 'basic' | 'standard' | 'comprehensive';
    includeWarnings?: boolean;
    customRules?: ValidationRule[];
    skipRuleIds?: UUID[];
}
/**
 * 任务创建DTO
 */
export declare class CreateTaskDto {
    name: string;
    description?: string;
    type: TaskType;
    priority: Priority;
    estimatedDuration?: number;
    durationUnit?: 'hours' | 'days' | 'weeks';
    assignedTo?: string[];
    dependencies?: {
        taskId: UUID;
        type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
        lag?: number;
        lagUnit?: 'hours' | 'days' | 'weeks';
    }[];
    tags?: string[];
    metadata?: Record<string, unknown>;
}
/**
 * 任务更新DTO
 */
export declare class UpdateTaskDto {
    taskId: UUID;
    name?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    estimatedDuration?: number;
    actualDuration?: number;
    durationUnit?: 'hours' | 'days' | 'weeks';
    assignedTo?: string[];
    completionPercentage?: number;
    startDate?: Timestamp;
    endDate?: Timestamp;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
/**
 * 里程碑创建DTO
 */
export declare class CreateMilestoneDto {
    name: string;
    description?: string;
    targetDate: Timestamp;
    criteria?: string[];
    dependencies?: UUID[];
    deliverables?: string[];
}
/**
 * 里程碑更新DTO
 */
export declare class UpdateMilestoneDto {
    id: UUID;
    name?: string;
    description?: string;
    targetDate?: Timestamp;
    actualDate?: Timestamp;
    status?: MilestoneStatus;
    criteria?: string[];
    dependencies?: UUID[];
    deliverables?: string[];
}
/**
 * 资源分配DTO
 */
export declare class ResourceAllocationDto {
    resourceId: UUID;
    resourceName: string;
    type: 'human' | 'material' | 'financial' | 'technical';
    allocatedAmount: number;
    totalCapacity: number;
    unit: string;
    allocationPeriod?: {
        startDate: Timestamp;
        endDate: Timestamp;
    };
}
/**
 * 风险项DTO
 */
export declare class RiskItemDto {
    name: string;
    description: string;
    category: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: number;
    mitigationPlan?: string;
    owner?: string;
}
//# sourceMappingURL=plan.dto.d.ts.map