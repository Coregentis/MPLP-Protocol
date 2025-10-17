"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskItemDto = exports.ResourceAllocationDto = exports.UpdateMilestoneDto = exports.CreateMilestoneDto = exports.UpdateTaskDto = exports.CreateTaskDto = exports.PlanValidationDto = exports.PlanOptimizationDto = exports.PlanExecutionDto = exports.PlanOperationResultDto = exports.PaginatedPlanResponseDto = exports.PlanResponseDto = exports.PlanQueryDto = exports.UpdatePlanDto = exports.CreatePlanDto = void 0;
class CreatePlanDto {
    contextId;
    name;
    description;
    priority;
    tasks;
    milestones;
    executionConfig;
    optimizationConfig;
}
exports.CreatePlanDto = CreatePlanDto;
class UpdatePlanDto {
    planId;
    name;
    description;
    status;
    priority;
    tasks;
    milestones;
    executionConfig;
    optimizationConfig;
}
exports.UpdatePlanDto = UpdatePlanDto;
class PlanQueryDto {
    status;
    priority;
    contextId;
    createdAfter;
    createdBefore;
    namePattern;
    assignedTo;
}
exports.PlanQueryDto = PlanQueryDto;
class PlanResponseDto {
    planId;
    contextId;
    name;
    description;
    status;
    priority;
    protocolVersion;
    timestamp;
    tasks;
    milestones;
    resources;
    risks;
    executionConfig;
    optimizationConfig;
    validationRules;
    coordinationConfig;
    auditTrail;
    monitoringIntegration;
    performanceMetrics;
    versionHistory;
    searchMetadata;
    cachingPolicy;
    eventIntegration;
    metadata;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
}
exports.PlanResponseDto = PlanResponseDto;
class PaginatedPlanResponseDto {
    success;
    data;
    pagination;
    error;
}
exports.PaginatedPlanResponseDto = PaginatedPlanResponseDto;
class PlanOperationResultDto {
    success;
    planId;
    message;
    metadata;
    error;
}
exports.PlanOperationResultDto = PlanOperationResultDto;
class PlanExecutionDto {
    executionMode;
    dryRun;
    skipValidation;
    notifyOnCompletion;
    customConfig;
}
exports.PlanExecutionDto = PlanExecutionDto;
class PlanOptimizationDto {
    targets;
    constraints;
    algorithm;
    iterations;
}
exports.PlanOptimizationDto = PlanOptimizationDto;
class PlanValidationDto {
    validationLevel;
    includeWarnings;
    customRules;
    skipRuleIds;
}
exports.PlanValidationDto = PlanValidationDto;
class CreateTaskDto {
    name;
    description;
    type;
    priority;
    estimatedDuration;
    durationUnit;
    assignedTo;
    dependencies;
    tags;
    metadata;
}
exports.CreateTaskDto = CreateTaskDto;
class UpdateTaskDto {
    taskId;
    name;
    description;
    status;
    priority;
    estimatedDuration;
    actualDuration;
    durationUnit;
    assignedTo;
    completionPercentage;
    startDate;
    endDate;
    tags;
    metadata;
}
exports.UpdateTaskDto = UpdateTaskDto;
class CreateMilestoneDto {
    name;
    description;
    targetDate;
    criteria;
    dependencies;
    deliverables;
}
exports.CreateMilestoneDto = CreateMilestoneDto;
class UpdateMilestoneDto {
    id;
    name;
    description;
    targetDate;
    actualDate;
    status;
    criteria;
    dependencies;
    deliverables;
}
exports.UpdateMilestoneDto = UpdateMilestoneDto;
class ResourceAllocationDto {
    resourceId;
    resourceName;
    type;
    allocatedAmount;
    totalCapacity;
    unit;
    allocationPeriod;
}
exports.ResourceAllocationDto = ResourceAllocationDto;
class RiskItemDto {
    name;
    description;
    category;
    level;
    probability;
    impact;
    mitigationPlan;
    owner;
}
exports.RiskItemDto = RiskItemDto;
