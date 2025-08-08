/**
 * Plan管理服务
 * 
 * 提供Plan实体的管理功能，包括创建、查询、更新和删除计划
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:10:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../../domain/entities/plan.entity';
import { IPlanRepository, PlanFilter } from '../../domain/repositories/plan-repository.interface';
import { PlanValidationService, ValidationResult } from '../../domain/services/plan-validation.service';
import { PlanFactoryService } from '../../domain/services/plan-factory.service';
import { UUID } from '../../../../public/shared/types';
import { Priority, PlanStatus, PlanTask, PlanDependency, ExecutionStrategy } from '../../types';
import { PlanConfiguration } from '../../domain/value-objects/plan-configuration.value-object';

/**
 * 操作结果接口
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}

/**
 * Plan管理服务
 */
export class PlanManagementService {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly planValidationService: PlanValidationService,
    private readonly planFactoryService: PlanFactoryService
  ) {}
  
  /**
   * 创建计划
   * @param params 计划参数
   * @returns 操作结果
   */
  async createPlan(params: {
    planId?: UUID;
    contextId?: UUID;
    context_id?: UUID;  // 兼容snake_case
    name: string;
    description: string;
    goals?: string[];
    tasks?: PlanTask[];
    dependencies?: PlanDependency[];
    executionStrategy?: ExecutionStrategy;
    execution_strategy?: ExecutionStrategy;  // 兼容snake_case
    priority?: Priority;
    estimatedDuration?: { value: number; unit: string };
    estimated_duration?: { value: number; unit: string };  // 兼容snake_case
    configuration?: PlanConfiguration;
    metadata?: Record<string, unknown>;
  }): Promise<OperationResult<Plan>> {
    try {
      // 验证计划名称
      const nameValidation = this.planValidationService.validatePlanName(params.name);
      if (!nameValidation.valid) {
        return {
          success: false,
          error: 'Invalid plan name',
          validationErrors: nameValidation.errors
        };
      }
      
      // 标准化参数，支持snake_case到camelCase转换
      const normalizedParams = {
        planId: params.planId,
        contextId: params.contextId || params.context_id,
        name: params.name,
        description: params.description,
        goals: params.goals,
        tasks: params.tasks,
        dependencies: params.dependencies,
        executionStrategy: params.executionStrategy || params.execution_strategy,
        priority: params.priority,
        estimatedDuration: params.estimatedDuration || params.estimated_duration,
        configuration: params.configuration,
        metadata: params.metadata
      };

      // 验证必需字段
      if (!normalizedParams.contextId) {
        return {
          success: false,
          error: 'Context ID is required'
        };
      }

      // 创建计划实体
      const plan = this.planFactoryService.createPlan({
        planId: normalizedParams.planId,
        contextId: normalizedParams.contextId,
        name: normalizedParams.name,
        description: normalizedParams.description,
        goals: normalizedParams.goals,
        tasks: normalizedParams.tasks,
        dependencies: normalizedParams.dependencies,
        executionStrategy: normalizedParams.executionStrategy,
        priority: normalizedParams.priority,
        estimatedDuration: normalizedParams.estimatedDuration,
        configuration: normalizedParams.configuration,
        metadata: normalizedParams.metadata
      });
      
      // 验证计划
      const validation = this.planValidationService.validatePlan(plan);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Plan validation failed',
          validationErrors: validation.errors
        };
      }
      
      // 检查计划ID是否已存在
      if (params.planId) {
        const exists = await this.planRepository.exists(params.planId);
        if (exists) {
          return {
            success: false,
            error: `Plan with ID ${params.planId} already exists`
          };
        }
      }
      
      // 保存计划
      const savedPlan = await this.planRepository.create(plan);
      
      return {
        success: true,
        data: savedPlan
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to create plan: ${errorMessage}`
      };
    }
  }
  
  /**
   * 获取计划
   * @param planId 计划ID
   * @returns 操作结果
   */
  async getPlan(planId: UUID): Promise<OperationResult<Plan>> {
    try {
      const plan = await this.planRepository.findById(planId);
      
      if (!plan) {
        return {
          success: false,
          error: `Plan with ID ${planId} not found`
        };
      }
      
      return {
        success: true,
        data: plan
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to get plan: ${errorMessage}`
      };
    }
  }
  
  /**
   * 更新计划
   * @param planId 计划ID
   * @param updates 更新内容
   * @returns 操作结果
   */
  async updatePlan(planId: UUID, updates: Partial<Plan>): Promise<OperationResult<Plan>> {
    try {
      // 获取现有计划
      const existingPlan = await this.planRepository.findById(planId);
      
      if (!existingPlan) {
        return {
          success: false,
          error: `Plan with ID ${planId} not found`
        };
      }
      
      // 验证计划名称
      if (updates.name && updates.name !== existingPlan.name) {
        const nameValidation = this.planValidationService.validatePlanName(updates.name);
        if (!nameValidation.valid) {
          return {
            success: false,
            error: 'Invalid plan name',
            validationErrors: nameValidation.errors
          };
        }
      }
      
      // 更新计划
      const updatedPlan = new Plan({
        ...existingPlan.toObject(),
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // 验证更新后的计划
      const validation = this.planValidationService.validatePlan(updatedPlan);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Plan validation failed',
          validationErrors: validation.errors
        };
      }
      
      // 保存更新后的计划
      const savedPlan = await this.planRepository.update(updatedPlan);
      
      return {
        success: true,
        data: savedPlan
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to update plan: ${errorMessage}`
      };
    }
  }

  /**
   * 删除计划
   * @param planId 计划ID
   * @returns 操作结果
   */
  async deletePlan(planId: UUID): Promise<OperationResult<boolean>> {
    try {
      // 检查计划是否存在
      const exists = await this.planRepository.exists(planId);

      if (!exists) {
        return {
          success: false,
          error: `Plan with ID ${planId} not found`
        };
      }

      // 删除计划
      const result = await this.planRepository.delete(planId);

      return {
        success: result,
        data: result
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to delete plan: ${errorMessage}`
      };
    }
  }
  
  /**
   * 更新计划状态
   * @param planId 计划ID
   * @param newStatus 新状态
   * @returns 操作结果
   */
  async updatePlanStatus(planId: UUID, newStatus: PlanStatus): Promise<OperationResult<Plan>> {
    try {
      // 获取现有计划
      const existingPlan = await this.planRepository.findById(planId);
      
      if (!existingPlan) {
        return {
          success: false,
          error: `Plan with ID ${planId} not found`
        };
      }
      
      // 更新状态
      const statusUpdateSuccess = existingPlan.updateStatus(newStatus);
      
      if (!statusUpdateSuccess) {
        return {
          success: false,
          error: `Invalid status transition from ${existingPlan.status} to ${newStatus}`
        };
      }
      
      // 保存更新后的计划
      const savedPlan = await this.planRepository.update(existingPlan);
      
      return {
        success: true,
        data: savedPlan
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to update plan status: ${errorMessage}`
      };
    }
  }
  
  /**
   * 查找计划
   * @param filter 过滤条件
   * @returns 操作结果
   */
  async findPlans(filter: PlanFilter): Promise<OperationResult<Plan[]>> {
    try {
      const plans = await this.planRepository.findByFilter(filter);
      
      return {
        success: true,
        data: plans
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to find plans: ${errorMessage}`
      };
    }
  }

  /**
   * 统计计划数量
   * @param filter 过滤条件
   * @returns 操作结果
   */
  async countPlans(filter?: PlanFilter): Promise<OperationResult<number>> {
    try {
      const count = await this.planRepository.count(filter);

      return {
        success: true,
        data: count
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to count plans: ${errorMessage}`
      };
    }
  }
  
  /**
   * 检查计划是否可执行
   * @param planId 计划ID
   * @returns 操作结果
   */
  async isPlanExecutable(planId: UUID): Promise<OperationResult<ValidationResult>> {
    try {
      // 获取现有计划
      const existingPlan = await this.planRepository.findById(planId);

      if (!existingPlan) {
        return {
          success: false,
          error: `Plan with ID ${planId} not found`
        };
      }

      // 验证计划是否可执行
      const validation = this.planValidationService.validatePlanExecutability(existingPlan);

      return {
        success: validation.valid,
        data: validation,
        validationErrors: validation.errors
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to check plan executability: ${errorMessage}`
      };
    }
  }

  /**
   * 通过ID获取计划（带选项）
   * @param planId 计划ID
   * @param _options 查询选项（暂未使用）
   * @returns 操作结果
   */
  async getPlanById(planId: UUID): Promise<OperationResult<Plan | null>> {
    try {
      const plan = await this.planRepository.findById(planId);
      return {
        success: true,
        data: plan
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to get plan by ID: ${errorMessage}`
      };
    }
  }

  /**
   * 获取计划列表
   * @param query 查询参数
   * @returns 操作结果
   */
  async getPlans(query: {
    contextId?: UUID;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<OperationResult<{
    plans: Plan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      // 获取计划列表（模拟分页）
      const allPlans = await this.planRepository.findByContextId(query.contextId || '');
      const total = allPlans.length;
      const page = query.page || 1;
      const limit = query.limit || 10;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const plans = allPlans.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: {
          plans,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to get plans: ${errorMessage}`
      };
    }
  }
}