"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
class PlanController {
    planManagementService;
    constructor(planManagementService) {
        this.planManagementService = planManagementService;
    }
    async createPlan(dto) {
        try {
            this.validateCreateDto(dto);
            const createParams = {
                contextId: dto.contextId,
                name: dto.name,
                description: dto.description,
                priority: dto.priority,
                tasks: dto.tasks?.map(task => ({
                    name: task.name || '',
                    description: task.description,
                    type: (task.type === 'review' ? 'checkpoint' : task.type) || 'atomic',
                    priority: task.priority
                }))
            };
            const plan = await this.planManagementService.createPlan(createParams);
            return {
                success: true,
                planId: plan.planId,
                message: 'Plan created successfully',
                metadata: {
                    name: plan.name,
                    status: plan.status,
                    priority: plan.priority,
                    taskCount: plan.tasks.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_CREATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { dto }
                }
            };
        }
    }
    async getPlanById(planId) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            const planData = await this.planManagementService.getPlan(planId);
            if (!planData) {
                return null;
            }
            return this.dataToResponseDto(planData);
        }
        catch (error) {
            throw new Error(`Failed to get plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getPlanByName(name) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Plan name cannot be empty');
            }
            throw new Error('getPlanByName not implemented yet');
        }
        catch (error) {
            throw new Error(`Failed to get plan by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updatePlan(planId, dto) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            this.validateUpdateDto(dto);
            const updateParams = {
                planId,
                name: dto.name,
                description: dto.description,
                status: dto.status,
                priority: dto.priority
            };
            const updatedPlan = await this.planManagementService.updatePlan(updateParams);
            return {
                success: true,
                planId: updatedPlan.planId,
                message: 'Plan updated successfully',
                metadata: {
                    name: updatedPlan.name,
                    status: updatedPlan.status,
                    priority: updatedPlan.priority,
                    taskCount: updatedPlan.tasks.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { planId, dto }
                }
            };
        }
    }
    async deletePlan(planId) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            await this.planManagementService.deletePlan(planId);
            return {
                success: true,
                planId,
                message: 'Plan deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_DELETION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { planId }
                }
            };
        }
    }
    async queryPlans(query, pagination = { page: 1, limit: 10 }) {
        try {
            this.validateQueryDto(query);
            this.validatePaginationParams(pagination);
            return {
                success: true,
                data: [],
                pagination: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: 0,
                    totalPages: 0
                }
            };
        }
        catch (error) {
            return {
                success: false,
                data: [],
                pagination: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: 0,
                    totalPages: 0
                },
                error: {
                    code: 'PLAN_QUERY_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { query, pagination }
                }
            };
        }
    }
    async executePlan(planId, dto) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            const result = await this.planManagementService.executePlan(planId);
            return {
                success: true,
                planId,
                message: 'Plan execution completed',
                metadata: {
                    status: result.status,
                    totalTasks: result.totalTasks,
                    completedTasks: result.completedTasks
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_EXECUTION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { planId, dto }
                }
            };
        }
    }
    async optimizePlan(planId, dto) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            const result = await this.planManagementService.optimizePlan(planId);
            return {
                success: true,
                planId,
                message: 'Plan optimization completed',
                metadata: {
                    originalScore: result.originalScore,
                    optimizedScore: result.optimizedScore,
                    improvements: result.improvements
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_OPTIMIZATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { planId, dto }
                }
            };
        }
    }
    async validatePlan(planId, dto) {
        try {
            if (!this.isValidUUID(planId)) {
                throw new Error('Invalid plan ID format');
            }
            const result = await this.planManagementService.validatePlan(planId);
            return {
                success: true,
                planId,
                message: 'Plan validation completed',
                metadata: {
                    isValid: result.isValid,
                    violationCount: result.violations.length,
                    recommendationCount: result.recommendations.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PLAN_VALIDATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { planId, dto }
                }
            };
        }
    }
    validateCreateDto(dto) {
        if (!dto.name || dto.name.trim().length === 0) {
            throw new Error('Plan name is required');
        }
        if (!dto.contextId || !this.isValidUUID(dto.contextId)) {
            throw new Error('Valid context ID is required');
        }
        if (dto.tasks && dto.tasks.length > 0) {
            for (const task of dto.tasks) {
                if (!task.name || task.name.trim().length === 0) {
                    throw new Error('All tasks must have a name');
                }
            }
        }
    }
    validateUpdateDto(dto) {
        if (dto.name !== undefined && (!dto.name || dto.name.trim().length === 0)) {
            throw new Error('Plan name cannot be empty');
        }
        if (dto.tasks && dto.tasks.length > 0) {
            for (const task of dto.tasks) {
                if (!task.name || task.name.trim().length === 0) {
                    throw new Error('All tasks must have a name');
                }
            }
        }
    }
    validateQueryDto(dto) {
        if (dto.contextId && !this.isValidUUID(dto.contextId)) {
            throw new Error('Invalid context ID format');
        }
        if (dto.createdAfter && dto.createdBefore && dto.createdAfter >= dto.createdBefore) {
            throw new Error('createdAfter must be before createdBefore');
        }
    }
    validatePaginationParams(params) {
        if (params.page < 1) {
            throw new Error('Page number must be greater than 0');
        }
        if (params.limit < 1 || params.limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    dataToResponseDto(data) {
        return {
            planId: data.planId,
            contextId: data.contextId,
            name: data.name,
            description: data.description,
            status: data.status,
            priority: data.priority || 'medium',
            protocolVersion: data.protocolVersion,
            timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp,
            tasks: data.tasks.map(task => ({
                taskId: task.taskId,
                name: task.name,
                description: task.description,
                type: task.type,
                status: task.status,
                priority: task.priority || 'medium'
            })),
            auditTrail: {
                enabled: true,
                retentionDays: 90
            },
            monitoringIntegration: data.monitoringIntegration || {},
            performanceMetrics: data.performanceMetrics || {},
            metadata: data.metadata,
            createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy
        };
    }
}
exports.PlanController = PlanController;
