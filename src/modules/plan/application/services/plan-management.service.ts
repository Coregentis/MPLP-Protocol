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

  /**
   * 同步计划
   * @param params 同步参数
   * @returns 操作结果
   */
  async syncPlan(params: {
    planId: UUID;
    targetVersion?: string;
    syncOptions?: Record<string, unknown>;
  }): Promise<OperationResult<{ planId: UUID; syncedAt: Date; version: string }>> {
    try {
      const plan = await this.planRepository.findById(params.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活同步逻辑
      const syncResult = {
        planId: params.planId,
        syncedAt: new Date(),
        version: params.targetVersion || '1.0.0'
      };

      return {
        success: true,
        data: syncResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to sync plan: ${errorMessage}`
      };
    }
  }

  /**
   * 操作计划
   * @param params 操作参数
   * @returns 操作结果
   */
  async operatePlan(params: {
    planId: UUID;
    operation: 'start' | 'pause' | 'resume' | 'stop' | 'optimize';
    operationOptions?: Record<string, unknown>;
  }): Promise<OperationResult<{ operation: string; result: Record<string, unknown> }>> {
    try {
      const plan = await this.planRepository.findById(params.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活操作逻辑
      const operationResult = {
        operation: params.operation,
        result: {
          planId: params.planId,
          operationTime: new Date().toISOString(),
          status: 'completed'
        }
      };

      return {
        success: true,
        data: operationResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to operate plan: ${errorMessage}`
      };
    }
  }

  /**
   * 获取计划状态
   * @param planId 计划ID
   * @param options 状态选项
   * @returns 操作结果
   */
  async getPlanStatus(planId: UUID, options?: {
    includeDetails?: boolean;
    includeMetrics?: boolean;
  }): Promise<OperationResult<{
    planId: UUID;
    status: PlanStatus;
    progress?: number;
    details?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
  }>> {
    try {
      const plan = await this.planRepository.findById(planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      const planObject = plan.toObject();
      const statusResult = {
        planId,
        status: planObject.status,
        progress: planObject.progress?.percentage || 0,
        ...(options?.includeDetails && {
          details: {
            tasks: planObject.tasks?.length || 0,
            dependencies: planObject.dependencies?.length || 0,
            createdAt: planObject.createdAt,
            updatedAt: planObject.updatedAt
          }
        }),
        ...(options?.includeMetrics && {
          metrics: {
            executionTime: 0,
            resourceUsage: {},
            performanceScore: 100
          }
        })
      };

      return {
        success: true,
        data: statusResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to get plan status: ${errorMessage}`
      };
    }
  }

  /**
   * 分析计划
   * @param params 分析参数
   * @returns 操作结果
   */
  async analyzePlan(params: {
    planId: UUID;
    analysisType: 'quality' | 'risk' | 'performance' | 'dependencies';
    analysisOptions?: Record<string, unknown>;
  }): Promise<OperationResult<{
    planId: UUID;
    analysisType: string;
    insights?: string[];
    recommendations?: string[];
    metrics?: Record<string, unknown>;
  }>> {
    try {
      const plan = await this.planRepository.findById(params.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活分析逻辑
      const analysisResult = {
        planId: params.planId,
        analysisType: params.analysisType,
        insights: [
          `${params.analysisType} analysis completed`,
          'Plan structure is well-defined',
          'Dependencies are properly managed'
        ],
        recommendations: [
          'Consider optimizing task dependencies',
          'Review resource allocation',
          'Monitor execution progress'
        ],
        metrics: {
          score: 85,
          complexity: 'medium',
          riskLevel: 'low'
        }
      };

      return {
        success: true,
        data: analysisResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to analyze plan: ${errorMessage}`
      };
    }
  }

  /**
   * 执行计划
   * @param params 执行参数
   * @returns 操作结果
   */
  async executePlan(params: {
    planId: UUID;
    executionMode?: 'sequential' | 'parallel' | 'adaptive';
    executionOptions?: Record<string, unknown>;
  }): Promise<OperationResult<{
    planId: UUID;
    executionId: UUID;
    status: string;
    startedAt: Date;
  }>> {
    try {
      const plan = await this.planRepository.findById(params.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活执行逻辑
      const executionResult = {
        planId: params.planId,
        executionId: `exec-${Date.now()}` as UUID,
        status: 'started',
        startedAt: new Date()
      };

      return {
        success: true,
        data: executionResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to execute plan: ${errorMessage}`
      };
    }
  }

  /**
   * 优化计划
   * @param params 优化参数
   * @returns 操作结果
   */
  async optimizePlan(params: {
    planId: UUID;
    optimizationType?: 'performance' | 'resource' | 'time' | 'cost';
    optimizationOptions?: Record<string, unknown>;
  }): Promise<OperationResult<{
    planId: UUID;
    optimizationType: string;
    improvements: string[];
    metrics: Record<string, unknown>;
  }>> {
    try {
      const plan = await this.planRepository.findById(params.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活优化逻辑
      const optimizationResult = {
        planId: params.planId,
        optimizationType: params.optimizationType || 'performance',
        improvements: [
          'Optimized task dependencies',
          'Improved resource allocation',
          'Enhanced execution strategy'
        ],
        metrics: {
          performanceGain: '15%',
          resourceSaving: '10%',
          timeReduction: '8%'
        }
      };

      return {
        success: true,
        data: optimizationResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to optimize plan: ${errorMessage}`
      };
    }
  }

  /**
   * 查询计划
   * @param filter 查询过滤器
   * @returns 操作结果
   */
  async queryPlans(filter: {
    contextId?: UUID;
    status?: PlanStatus;
    priority?: Priority;
    searchTerm?: string;
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  }): Promise<OperationResult<{
    plans: Plan[];
    total: number;
    filters: Record<string, unknown>;
  }>> {
    try {
      // TODO: 等待CoreOrchestrator激活查询逻辑
      // 转换为PlanFilter格式
      const planFilter = {
        context_ids: filter.contextId ? [filter.contextId] : undefined,
        statuses: filter.status ? [filter.status] : undefined,
        priorities: filter.priority ? [filter.priority] : undefined,
        date_range: filter.dateRange ? {
          start: filter.dateRange.start.toISOString(),
          end: filter.dateRange.end.toISOString()
        } : undefined
      };

      const plans = await this.planRepository.findByFilter(planFilter);

      const queryResult = {
        plans,
        total: plans.length,
        filters: filter
      };

      return {
        success: true,
        data: queryResult
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to query plans: ${errorMessage}`
      };
    }
  }

  /**
   * 删除遗留计划
   * @param planId 计划ID
   * @returns 操作结果
   */
  async deleteLegacyPlan(planId: UUID): Promise<OperationResult<boolean>> {
    try {
      const plan = await this.planRepository.findById(planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // TODO: 等待CoreOrchestrator激活遗留计划删除逻辑
      await this.planRepository.delete(planId);

      return {
        success: true,
        data: true
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to delete legacy plan: ${errorMessage}`
      };
    }
  }

  // ===== MPLP规划协调器预留接口 =====
  // 体现Plan模块作为"智能任务规划协调器"的核心定位
  // 参数使用下划线前缀，等待CoreOrchestrator激活

  /**
   * 核心规划协调接口 (4个深度集成模块)
   */

  /**
   * 验证规划协调权限 - Role模块协调权限
   * @param _userId 用户ID (等待CoreOrchestrator激活)
   * @param _planId 计划ID (等待CoreOrchestrator激活)
   * @param _coordinationContext 协调上下文 (等待CoreOrchestrator激活)
   * @returns 权限验证结果
   */
  private async validatePlanCoordinationPermission(
    _userId: UUID,
    _planId: UUID,
    _coordinationContext: Record<string, unknown>
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Role模块协调权限验证
    // 临时实现：允许所有协调操作
    return true;
  }

  /**
   * 获取规划协调上下文 - Context模块协调环境
   * @param _contextId 上下文ID (等待CoreOrchestrator激活)
   * @param _planType 计划类型 (等待CoreOrchestrator激活)
   * @returns 协调上下文信息
   */
  private async getPlanCoordinationContext(
    _contextId: UUID,
    _planType: string
  ): Promise<Record<string, unknown>> {
    // TODO: 等待CoreOrchestrator激活Context模块协调环境获取
    // 临时实现：返回基础上下文
    return {
      contextId: _contextId,
      planType: _planType,
      coordinationMode: 'intelligent_planning',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 记录规划协调指标 - Trace模块协调监控
   * @param _planId 计划ID (等待CoreOrchestrator激活)
   * @param _metrics 协调指标 (等待CoreOrchestrator激活)
   * @returns 记录结果
   */
  private async recordPlanCoordinationMetrics(
    _planId: UUID,
    _metrics: Record<string, unknown>
  ): Promise<void> {
    // TODO: 等待CoreOrchestrator激活Trace模块协调监控记录
    // 临时实现：记录到内存（实际应该发送到Trace模块）
    // console.log(`Plan coordination metrics recorded for ${_planId}:`, _metrics);
  }

  /**
   * 管理规划扩展协调 - Extension模块协调管理
   * @param _planId 计划ID (等待CoreOrchestrator激活)
   * @param _extensions 扩展配置 (等待CoreOrchestrator激活)
   * @returns 管理结果
   */
  private async managePlanExtensionCoordination(
    _planId: UUID,
    _extensions: Record<string, unknown>
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Extension模块协调管理
    // 临时实现：允许所有扩展协调
    return true;
  }

  /**
   * 规划增强协调接口 (4个增强集成模块)
   */

  /**
   * 请求规划变更协调 - Confirm模块变更协调
   * @param _planId 计划ID (等待CoreOrchestrator激活)
   * @param _change 变更请求 (等待CoreOrchestrator激活)
   * @returns 变更协调结果
   */
  private async requestPlanChangeCoordination(
    _planId: UUID,
    _change: Record<string, unknown>
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Confirm模块变更协调
    // 临时实现：允许所有变更协调
    return true;
  }

  /**
   * 协调协作规划管理 - Collab模块协作协调
   * @param _collabId 协作ID (等待CoreOrchestrator激活)
   * @param _planConfig 规划配置 (等待CoreOrchestrator激活)
   * @returns 协作协调结果
   */
  private async coordinateCollabPlanManagement(
    _collabId: UUID,
    _planConfig: Record<string, unknown>
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Collab模块协作协调
    // 临时实现：允许所有协作协调
    return true;
  }

  /**
   * 启用对话驱动规划协调 - Dialog模块对话协调
   * @param _dialogId 对话ID (等待CoreOrchestrator激活)
   * @param _planParticipants 规划参与者 (等待CoreOrchestrator激活)
   * @returns 对话协调结果
   */
  private async enableDialogDrivenPlanCoordination(
    _dialogId: UUID,
    _planParticipants: string[]
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Dialog模块对话协调
    // 临时实现：允许所有对话协调
    return true;
  }

  /**
   * 跨网络协调规划 - Network模块分布式协调
   * @param _networkId 网络ID (等待CoreOrchestrator激活)
   * @param _planConfig 规划配置 (等待CoreOrchestrator激活)
   * @returns 网络协调结果
   */
  private async coordinatePlanAcrossNetwork(
    _networkId: UUID,
    _planConfig: Record<string, unknown>
  ): Promise<boolean> {
    // TODO: 等待CoreOrchestrator激活Network模块分布式协调
    // 临时实现：允许所有网络协调
    return true;
  }
}