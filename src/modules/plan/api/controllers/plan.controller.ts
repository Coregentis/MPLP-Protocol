/**
 * Plan控制器
 * 
 * @description Plan模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */

import { PlanManagementService } from '../../application/services/plan-management.service';
import { PlanEntityData } from '../mappers/plan.mapper';
import { TaskType, TaskStatus } from '../../types';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  PlanResponseDto,
  PaginatedPlanResponseDto,
  PlanOperationResultDto,
  PlanExecutionDto,
  PlanOptimizationDto,
  PlanValidationDto
} from '../dto/plan.dto.js';
import { UUID, Priority } from '../../../../shared/types';
import { PaginationParams } from '../../../../shared/types';

/**
 * Plan API控制器
 * 
 * @description 提供Plan的RESTful API接口
 */
export class PlanController {
  
  constructor(
    private readonly planManagementService: PlanManagementService
  ) {}

  // ===== RESTful API方法 =====

  /**
   * 创建新Plan
   * POST /plans
   */
  async createPlan(dto: CreatePlanDto): Promise<PlanOperationResultDto> {
    try {
      // 验证DTO
      this.validateCreateDto(dto);

      // 转换DTO为服务参数
      const createParams = {
        contextId: dto.contextId,
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        tasks: dto.tasks?.map(task => ({
          name: task.name || '',
          description: task.description,
          type: (task.type === 'review' ? 'checkpoint' : task.type) as 'atomic' | 'composite' | 'milestone' | 'checkpoint' || 'atomic',
          priority: task.priority as 'critical' | 'high' | 'medium' | 'low' | undefined
        }))
      };

      // 调用应用服务
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
    } catch (error) {
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

  /**
   * 根据ID获取Plan
   * GET /plans/:id
   */
  async getPlanById(planId: UUID): Promise<PlanResponseDto | null> {
    try {
      // 验证UUID格式
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }

      // 获取Plan数据
      const planData = await this.planManagementService.getPlan(planId);
      if (!planData) {
        return null;
      }

      // 转换为响应DTO
      return this.dataToResponseDto(planData);
    } catch (error) {
      throw new Error(`Failed to get plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 根据名称获取Plan
   * GET /plans/by-name/:name
   */
  async getPlanByName(name: string): Promise<PlanResponseDto | null> {
    try {
      // 验证名称
      if (!name || name.trim().length === 0) {
        throw new Error('Plan name cannot be empty');
      }

      // 暂时通过查询所有计划来实现按名称查找
      // TODO: 实现专门的按名称查找方法
      throw new Error('getPlanByName not implemented yet');
    } catch (error) {
      throw new Error(`Failed to get plan by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 更新Plan
   * PUT /plans/:id
   */
  async updatePlan(planId: UUID, dto: UpdatePlanDto): Promise<PlanOperationResultDto> {
    try {
      // 验证参数
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }
      this.validateUpdateDto(dto);

      // 调用应用服务
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
    } catch (error) {
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

  /**
   * 删除Plan
   * DELETE /plans/:id
   */
  async deletePlan(planId: UUID): Promise<PlanOperationResultDto> {
    try {
      // 验证UUID格式
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }

      // 调用应用服务
      await this.planManagementService.deletePlan(planId);

      return {
        success: true,
        planId,
        message: 'Plan deleted successfully'
      };
    } catch (error) {
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

  /**
   * 查询Plans
   * GET /plans
   */
  async queryPlans(
    query: PlanQueryDto,
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedPlanResponseDto> {
    try {
      // 验证查询参数
      this.validateQueryDto(query);
      this.validatePaginationParams(pagination);

      // 暂时返回空结果
      // TODO: 实现实际的查询功能
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
    } catch (error) {
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

  /**
   * 执行Plan
   * POST /plans/:id/execute
   */
  async executePlan(planId: UUID, dto?: PlanExecutionDto): Promise<PlanOperationResultDto> {
    try {
      // 验证UUID格式
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }

      // 调用应用服务
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
    } catch (error) {
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

  /**
   * 优化Plan
   * POST /plans/:id/optimize
   */
  async optimizePlan(planId: UUID, dto?: PlanOptimizationDto): Promise<PlanOperationResultDto> {
    try {
      // 验证UUID格式
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }

      // 调用应用服务
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
    } catch (error) {
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

  /**
   * 验证Plan
   * POST /plans/:id/validate
   */
  async validatePlan(planId: UUID, dto?: PlanValidationDto): Promise<PlanOperationResultDto> {
    try {
      // 验证UUID格式
      if (!this.isValidUUID(planId)) {
        throw new Error('Invalid plan ID format');
      }

      // 调用应用服务
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
    } catch (error) {
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

  // ===== 私有辅助方法 =====

  /**
   * 验证创建DTO
   */
  private validateCreateDto(dto: CreatePlanDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Plan name is required');
    }
    if (!dto.contextId || !this.isValidUUID(dto.contextId)) {
      throw new Error('Valid context ID is required');
    }
    // 简化任务验证
    if (dto.tasks && dto.tasks.length > 0) {
      for (const task of dto.tasks) {
        if (!task.name || task.name.trim().length === 0) {
          throw new Error('All tasks must have a name');
        }
      }
    }
  }

  /**
   * 验证更新DTO
   */
  private validateUpdateDto(dto: UpdatePlanDto): void {
    if (dto.name !== undefined && (!dto.name || dto.name.trim().length === 0)) {
      throw new Error('Plan name cannot be empty');
    }
    // 简化任务验证
    if (dto.tasks && dto.tasks.length > 0) {
      for (const task of dto.tasks) {
        if (!task.name || task.name.trim().length === 0) {
          throw new Error('All tasks must have a name');
        }
      }
    }
  }

  /**
   * 验证查询DTO
   */
  private validateQueryDto(dto: PlanQueryDto): void {
    if (dto.contextId && !this.isValidUUID(dto.contextId)) {
      throw new Error('Invalid context ID format');
    }
    if (dto.createdAfter && dto.createdBefore && dto.createdAfter >= dto.createdBefore) {
      throw new Error('createdAfter must be before createdBefore');
    }
  }

  /**
   * 验证分页参数
   */
  private validatePaginationParams(params: PaginationParams): void {
    if (params.page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (params.limit < 1 || params.limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  /**
   * 验证UUID格式
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * 将数据转换为响应DTO
   */
  private dataToResponseDto(data: PlanEntityData): PlanResponseDto {
    return {
      planId: data.planId,
      contextId: data.contextId,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority || 'medium',
      protocolVersion: data.protocolVersion,
      timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp,

      // 核心功能字段 - 基于实际PlanEntityData结构
      tasks: data.tasks.map(task => ({
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        type: task.type as TaskType,
        status: task.status as TaskStatus,
        priority: task.priority as Priority || 'medium'
      })),

      // 企业级功能字段 - 使用默认值
      auditTrail: {
        enabled: true,
        retentionDays: 90
      },
      monitoringIntegration: data.monitoringIntegration || {},
      performanceMetrics: data.performanceMetrics || {},

      // 基础元数据字段
      metadata: data.metadata,
      createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    };
  }
}
