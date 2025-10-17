import { UUID, Timestamp, Priority } from '../../shared/types';
export type PlanStatus = 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
export type TaskType = 'atomic' | 'composite' | 'milestone' | 'review';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
export type MilestoneStatus = 'upcoming' | 'active' | 'completed' | 'overdue';
export type ResourceType = 'human' | 'material' | 'financial' | 'technical';
export type ResourceStatus = 'available' | 'allocated' | 'overallocated' | 'unavailable';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'closed';
export type ExecutionStrategy = 'sequential' | 'parallel' | 'conditional' | 'adaptive';
export type OptimizationTarget = 'time' | 'cost' | 'quality' | 'resource' | 'risk';
export interface TaskDependency {
    taskId: UUID;
    type: DependencyType;
    lag?: number;
    lagUnit?: 'hours' | 'days' | 'weeks';
}
export interface Task {
    taskId?: UUID;
    name: string;
    description?: string;
    type: TaskType;
    status: TaskStatus;
    priority: Priority;
    estimatedDuration?: number;
    actualDuration?: number;
    durationUnit?: 'hours' | 'days' | 'weeks';
    assignedTo?: string[];
    dependencies?: TaskDependency[];
    startDate?: Timestamp;
    endDate?: Timestamp;
    completionPercentage?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
export interface Milestone {
    id: UUID;
    name: string;
    description?: string;
    targetDate: Timestamp;
    actualDate?: Timestamp;
    status: MilestoneStatus;
    criteria?: string[];
    dependencies?: UUID[];
    deliverables?: string[];
}
export interface ResourceAllocation {
    resourceId: UUID;
    resourceName: string;
    type: ResourceType;
    allocatedAmount: number;
    totalCapacity: number;
    unit: string;
    status: ResourceStatus;
    allocationPeriod?: {
        startDate: Timestamp;
        endDate: Timestamp;
    };
}
export interface RiskItem {
    riskId: UUID;
    name: string;
    description: string;
    category: string;
    level: RiskLevel;
    status: RiskStatus;
    probability: number;
    impact: number;
    riskScore: number;
    mitigationPlan?: string;
    owner?: string;
    identifiedDate: Timestamp;
    reviewDate?: Timestamp;
}
export interface ExecutionConfig {
    strategy: ExecutionStrategy;
    maxParallelTasks?: number;
    retryPolicy?: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier?: number;
    };
    timeoutSettings?: {
        taskTimeout: number;
        planTimeout: number;
    };
    notificationSettings?: {
        enabled: boolean;
        events: ('task_started' | 'task_completed' | 'task_failed' | 'milestone_reached' | 'plan_completed')[];
        channels: ('email' | 'webhook' | 'sms')[];
    };
}
export interface OptimizationConfig {
    enabled: boolean;
    targets: OptimizationTarget[];
    constraints?: {
        maxDuration?: number;
        maxCost?: number;
        minQuality?: number;
        resourceLimits?: Record<string, number>;
    };
    algorithms?: ('genetic' | 'simulated_annealing' | 'particle_swarm' | 'greedy')[];
}
export interface ValidationRule {
    ruleId: UUID;
    name: string;
    description: string;
    type: 'dependency' | 'resource' | 'timeline' | 'quality' | 'business';
    severity: 'error' | 'warning' | 'info';
    condition: string;
    message: string;
    enabled: boolean;
}
export interface CoordinationConfig {
    enabled: boolean;
    coordinationMode: 'centralized' | 'distributed' | 'hybrid';
    conflictResolution: 'priority' | 'timestamp' | 'manual' | 'automatic';
    syncInterval?: number;
    coordinationEndpoints?: string[];
}
export interface AuditEvent {
    eventId: UUID;
    eventType: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'task_started' | 'task_completed' | 'milestone_reached' | 'resource_allocated' | 'risk_identified';
    timestamp: Timestamp;
    userId: string;
    userRole?: string;
    action: string;
    resource: string;
    planOperation?: string;
    planId?: UUID;
    planName?: string;
    taskId?: UUID;
    taskName?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: UUID;
}
export interface AuditTrail {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: AuditEvent[];
    complianceSettings?: {
        gdprEnabled?: boolean;
        hipaaEnabled?: boolean;
        soxEnabled?: boolean;
        auditLevel?: 'basic' | 'detailed' | 'comprehensive';
        dataLogging?: boolean;
        customCompliance?: string[];
    };
}
export interface PlanEntityData {
    protocolVersion: string;
    timestamp: Timestamp;
    planId: UUID;
    contextId: UUID;
    name: string;
    description?: string;
    status: PlanStatus;
    priority: Priority;
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
    versionHistory: Record<string, unknown>;
    searchMetadata: Record<string, unknown>;
    cachingPolicy: Record<string, unknown>;
    eventIntegration: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: string;
    updatedBy?: string;
}
export interface PlanSchema {
    protocol_version: string;
    timestamp: string;
    plan_id: string;
    context_id: string;
    name: string;
    description?: string;
    status: PlanStatus;
    priority: Priority;
    tasks: Record<string, unknown>[];
    milestones?: Record<string, unknown>[];
    resources?: Record<string, unknown>[];
    risks?: Record<string, unknown>[];
    execution_config?: Record<string, unknown>;
    optimization_config?: Record<string, unknown>;
    validation_rules?: Record<string, unknown>[];
    coordination_config?: Record<string, unknown>;
    audit_trail: Record<string, unknown>;
    monitoring_integration: Record<string, unknown>;
    performance_metrics: Record<string, unknown>;
    version_history: Record<string, unknown>;
    search_metadata: Record<string, unknown>;
    caching_policy: Record<string, unknown>;
    event_integration: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}
export interface CreatePlanRequest {
    contextId: UUID;
    name: string;
    description?: string;
    priority?: Priority;
    tasks?: Partial<Task>[];
    milestones?: Partial<Milestone>[];
    executionConfig?: Partial<ExecutionConfig>;
    optimizationConfig?: Partial<OptimizationConfig>;
}
export interface UpdatePlanRequest {
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
export interface PlanQueryFilter {
    status?: PlanStatus | PlanStatus[];
    priority?: Priority | Priority[];
    contextId?: UUID;
    createdAfter?: Timestamp;
    createdBefore?: Timestamp;
    namePattern?: string;
    assignedTo?: string;
}
export interface PlanExecutionResult {
    status: 'completed' | 'failed' | 'partial';
    totalTasks: number;
    completedTasks: number;
    failedTasks?: number;
    errors: string[];
    executionTime?: number;
    startTime: Timestamp;
    endTime?: Timestamp;
}
export interface PlanOptimizationResult {
    originalScore: number;
    optimizedScore: number;
    improvements: string[];
    optimizationTime: number;
    algorithm?: string;
    metrics?: Record<string, number>;
}
export interface PlanValidationResult {
    isValid: boolean;
    violations: {
        ruleId: UUID;
        severity: 'error' | 'warning' | 'info';
        message: string;
        affectedTasks?: UUID[];
    }[];
    recommendations: string[];
    validationTime: number;
}
//# sourceMappingURL=types.d.ts.map