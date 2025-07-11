/**
 * MPLP Plan模块工厂类
 * 
 * 提供Plan对象创建、验证和Schema合规性保证功能
 * 严格按照 plan-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json Schema定义
 * @schema_path src/schemas/plan-protocol.json
 */

import { v4 as uuidv4 } from 'uuid';
import {
  PlanProtocol,
  PlanStatus,
  PlanTask,
  TaskStatus,
  TaskType,
  PlanDependency,
  DependencyType,
  DependencyCriticality,
  PlanMilestone,
  MilestoneStatus,
  Priority,
  Timeline,
  Duration,
  DurationUnit,
  PlanConfiguration,
  FailureResolver,
  PlanOptimization,
  PlanRiskAssessment,
  RiskLevel,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanOperationResult,
  UUID,
  Timestamp,
  PLAN_CONSTANTS
} from './types';
import {
  createDefaultPlanConfiguration,
  createDefaultFailureResolver,
  createDefaultTimeline,
  validatePlanConfiguration,
  validateFailureResolver,
  validatePlanName,
  isValidUUID,
  isValidTimestamp
} from './utils';

/**
 * Plan工厂类 - 提供Plan对象创建和验证功能
 */
export class PlanFactory {
  private static instance?: PlanFactory;

  /**
   * 获取PlanFactory单例实例
   */
  public static getInstance(): PlanFactory {
    if (!PlanFactory.instance) {
      PlanFactory.instance = new PlanFactory();
    }
    return PlanFactory.instance;
  }

  /**
   * 创建新的Plan协议对象（Schema兼容）
   */
  public createPlan(request: CreatePlanRequest): PlanOperationResult<PlanProtocol> {
    try {
      // 1. 验证输入参数
      const validationResult = this.validateCreatePlanRequest(request);
      if (!validationResult.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid plan creation request',
            details: validationResult.errors
          }
        };
      }

      // 2. 创建Plan协议对象
      const planId = uuidv4();
      const timestamp = new Date().toISOString();
      
      const plan: PlanProtocol = {
        // Schema必需字段
        protocol_version: PLAN_CONSTANTS.PROTOCOL_VERSION,
        timestamp,
        plan_id: planId,
        context_id: request.context_id,
        name: request.name,
        description: request.description,
        status: PLAN_CONSTANTS.DEFAULT_PLAN_STATUS,
        priority: request.priority,
        timeline: request.timeline || createDefaultTimeline(),
        tasks: this.createTasksFromRequest(request.tasks || []),
        dependencies: this.createDependenciesFromRequest(request.dependencies || []),
        milestones: this.createMilestonesFromRequest(request.milestones || []),
                 optimization: this.mergeWithDefaultOptimization(request.optimization),
         risk_assessment: this.mergeWithDefaultRiskAssessment(request.risk_assessment),
        failure_resolver: this.mergeWithDefaultFailureResolver(request.failure_resolver),

        // 运行时字段
        progress_summary: this.createInitialProgressSummary(),
        task_ids: [],
        dependency_graph: this.createEmptyDependencyGraph(),
        metadata: {
          created_by: 'system',
          created_at: timestamp,
          updated_by: 'system',
          updated_at: timestamp,
          version: 1,
          creation_source: 'plan_factory',
          total_tasks: 0,
          total_dependencies: 0,
          complexity_score: 0
        }
      };

      // 3. 更新计算字段
      this.updateCalculatedFields(plan);

      // 4. 验证创建的Plan
      const planValidation = this.validatePlanProtocol(plan);
      if (!planValidation.valid) {
        return {
          success: false,
          error: {
            code: 'PLAN_VALIDATION_ERROR',
            message: 'Created plan failed validation',
            details: planValidation.errors
          }
        };
      }

      return {
        success: true,
        data: plan
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PLAN_CREATION_ERROR',
          message: 'Failed to create plan',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * 创建默认的空Plan对象
   */
  public createEmptyPlan(contextId: UUID, name: string, priority: Priority = 'medium'): PlanProtocol {
    const planId = uuidv4();
    const timestamp = new Date().toISOString();

    return {
      protocol_version: PLAN_CONSTANTS.PROTOCOL_VERSION,
      timestamp,
      plan_id: planId,
      context_id: contextId,
      name,
      status: 'draft',
      priority,
      timeline: createDefaultTimeline(),
      tasks: [],
      dependencies: [],
      milestones: [],
      optimization: this.createDefaultOptimization(),
      risk_assessment: this.createDefaultRiskAssessment(),
      failure_resolver: createDefaultFailureResolver(),
      progress_summary: this.createInitialProgressSummary(),
      task_ids: [],
      dependency_graph: this.createEmptyDependencyGraph(),
      metadata: {
        created_by: 'system',
        created_at: timestamp,
        updated_by: 'system',
        updated_at: timestamp,
        version: 1,
        creation_source: 'plan_factory',
        total_tasks: 0,
        total_dependencies: 0,
        complexity_score: 0
      }
    };
  }

  /**
   * 创建新的任务对象
   */
  public createTask(
    name: string,
    type: TaskType = 'atomic',
    priority: Priority = 'medium',
    description?: string
  ): PlanTask {
    const taskId = uuidv4();
    const timestamp = new Date().toISOString();

    return {
      task_id: taskId,
      name,
      description,
      type,
      status: 'pending',
      priority,
      created_at: timestamp,
      updated_at: timestamp,
      progress_percentage: 0,
      metadata: {
        complexity_score: 1,
        automation_level: 'manual',
        retry_count: 0,
        max_retry_count: 3
      }
    };
  }

  /**
   * 创建新的依赖关系对象
   */
  public createDependency(
    sourceTaskId: UUID,
    targetTaskId: UUID,
    dependencyType: DependencyType = 'finish_to_start',
    criticality: DependencyCriticality = 'important'
  ): PlanDependency {
    const dependencyId = uuidv4();
    const timestamp = new Date().toISOString();

    return {
      id: dependencyId,
      source_task_id: sourceTaskId,
      target_task_id: targetTaskId,
      dependency_type: dependencyType,
      criticality,
      metadata: {
        created_at: timestamp,
        created_by: 'system',
        is_critical: criticality === 'blocking'
      }
    };
  }

  /**
   * 创建新的里程碑对象
   */
  public createMilestone(
    name: string,
    targetDate: Timestamp,
    description?: string
  ): PlanMilestone {
    const milestoneId = uuidv4();

    return {
      id: milestoneId,
      name,
      description,
      target_date: targetDate,
      status: 'upcoming',
      success_criteria: []
    };
  }

  /**
   * 验证Plan协议对象的完整性
   */
  public validatePlanProtocol(plan: PlanProtocol): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证必需字段
    if (!plan.protocol_version || plan.protocol_version !== PLAN_CONSTANTS.PROTOCOL_VERSION) {
      errors.push(`Invalid protocol_version: expected ${PLAN_CONSTANTS.PROTOCOL_VERSION}, got ${plan.protocol_version}`);
    }

    if (!plan.plan_id || !isValidUUID(plan.plan_id)) {
      errors.push('Invalid plan_id: must be a valid UUID');
    }

    if (!plan.context_id || !isValidUUID(plan.context_id)) {
      errors.push('Invalid context_id: must be a valid UUID');
    }

    if (!plan.timestamp || !isValidTimestamp(plan.timestamp)) {
      errors.push('Invalid timestamp: must be a valid ISO 8601 date');
    }

    const nameValidation = validatePlanName(plan.name);
    if (!nameValidation.valid) {
      errors.push(`Invalid name: ${nameValidation.error}`);
    }

    // 验证状态
    const validStatuses: PlanStatus[] = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(plan.status)) {
      errors.push(`Invalid status: must be one of ${validStatuses.join(', ')}`);
    }

    // 验证优先级
    const validPriorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(plan.priority)) {
      errors.push(`Invalid priority: must be one of ${validPriorities.join(', ')}`);
    }

    // 验证时间线
    if (!plan.timeline || !plan.timeline.estimated_duration) {
      errors.push('Timeline with estimated_duration is required');
    }

    // 验证任务
    for (const task of plan.tasks) {
      const taskErrors = this.validateTask(task);
      errors.push(...taskErrors.map(err => `Task ${task.task_id}: ${err}`));
    }

    // 验证依赖关系
    for (const dependency of plan.dependencies) {
      const depErrors = this.validateDependency(dependency);
      errors.push(...depErrors.map(err => `Dependency ${dependency.id}: ${err}`));
    }

    // 验证里程碑
    for (const milestone of plan.milestones) {
      const milestoneErrors = this.validateMilestone(milestone);
      errors.push(...milestoneErrors.map(err => `Milestone ${milestone.id}: ${err}`));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证创建Plan请求
   */
  private validateCreatePlanRequest(request: CreatePlanRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.context_id || !isValidUUID(request.context_id)) {
      errors.push('Invalid context_id: must be a valid UUID');
    }

    const nameValidation = validatePlanName(request.name);
    if (!nameValidation.valid) {
      errors.push(`Invalid name: ${nameValidation.error}`);
    }

    const validPriorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(request.priority)) {
      errors.push(`Invalid priority: must be one of ${validPriorities.join(', ')}`);
    }

    if (request.timeline && request.timeline.estimated_duration) {
      if (request.timeline.estimated_duration.value <= 0) {
        errors.push('Timeline estimated_duration value must be positive');
      }
      const validUnits: DurationUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months'];
      if (!validUnits.includes(request.timeline.estimated_duration.unit)) {
        errors.push(`Invalid duration unit: must be one of ${validUnits.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证任务对象
   */
  private validateTask(task: PlanTask): string[] {
    const errors: string[] = [];

    if (!task.task_id || !isValidUUID(task.task_id)) {
      errors.push('Invalid task_id: must be a valid UUID');
    }

    if (!task.name || task.name.length === 0) {
      errors.push('Task name cannot be empty');
    }

    const validTypes: TaskType[] = ['atomic', 'composite', 'milestone', 'checkpoint'];
    if (!validTypes.includes(task.type)) {
      errors.push(`Invalid type: must be one of ${validTypes.join(', ')}`);
    }

    const validStatuses: TaskStatus[] = ['pending', 'ready', 'running', 'blocked', 'completed', 'failed', 'skipped'];
    if (!validStatuses.includes(task.status)) {
      errors.push(`Invalid status: must be one of ${validStatuses.join(', ')}`);
    }

    const validPriorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(task.priority)) {
      errors.push(`Invalid priority: must be one of ${validPriorities.join(', ')}`);
    }

    return errors;
  }

  /**
   * 验证依赖关系对象
   */
  private validateDependency(dependency: PlanDependency): string[] {
    const errors: string[] = [];

    if (!dependency.id || !isValidUUID(dependency.id)) {
      errors.push('Invalid id: must be a valid UUID');
    }

    if (!dependency.source_task_id || !isValidUUID(dependency.source_task_id)) {
      errors.push('Invalid source_task_id: must be a valid UUID');
    }

    if (!dependency.target_task_id || !isValidUUID(dependency.target_task_id)) {
      errors.push('Invalid target_task_id: must be a valid UUID');
    }

    if (dependency.source_task_id === dependency.target_task_id) {
      errors.push('source_task_id and target_task_id cannot be the same');
    }

    const validTypes: DependencyType[] = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
    if (!validTypes.includes(dependency.dependency_type)) {
      errors.push(`Invalid dependency_type: must be one of ${validTypes.join(', ')}`);
    }

    const validCriticalities: DependencyCriticality[] = ['blocking', 'important', 'nice_to_have'];
    if (!validCriticalities.includes(dependency.criticality)) {
      errors.push(`Invalid criticality: must be one of ${validCriticalities.join(', ')}`);
    }

    return errors;
  }

  /**
   * 验证里程碑对象
   */
  private validateMilestone(milestone: PlanMilestone): string[] {
    const errors: string[] = [];

    if (!milestone.id || !isValidUUID(milestone.id)) {
      errors.push('Invalid id: must be a valid UUID');
    }

    if (!milestone.name || milestone.name.length === 0) {
      errors.push('Milestone name cannot be empty');
    }

    if (!milestone.target_date || !isValidTimestamp(milestone.target_date)) {
      errors.push('Invalid target_date: must be a valid ISO 8601 date');
    }

    const validStatuses: MilestoneStatus[] = ['upcoming', 'at_risk', 'achieved', 'missed'];
    if (!validStatuses.includes(milestone.status)) {
      errors.push(`Invalid status: must be one of ${validStatuses.join(', ')}`);
    }

    return errors;
  }

  /**
   * 从请求创建任务列表
   */
  private createTasksFromRequest(tasks: Partial<PlanTask>[]): PlanTask[] {
    return tasks.map(taskReq => ({
      task_id: taskReq.task_id || uuidv4(),
      name: taskReq.name || 'Untitled Task',
      description: taskReq.description,
      type: taskReq.type || 'atomic',
      status: taskReq.status || 'pending',
      priority: taskReq.priority || 'medium',
      assignee: taskReq.assignee,
      estimated_effort: taskReq.estimated_effort,
      actual_effort: taskReq.actual_effort,
      resources_required: taskReq.resources_required || [],
      acceptance_criteria: taskReq.acceptance_criteria || [],
      sub_tasks: taskReq.sub_tasks || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress_percentage: 0,
      metadata: {
        complexity_score: 1,
        automation_level: 'manual',
        retry_count: 0,
        max_retry_count: 3,
        ...taskReq.metadata
      }
    }));
  }

  /**
   * 从请求创建依赖关系列表
   */
  private createDependenciesFromRequest(dependencies: Partial<PlanDependency>[]): PlanDependency[] {
    return dependencies.map(depReq => ({
      id: depReq.id || uuidv4(),
      source_task_id: depReq.source_task_id!,
      target_task_id: depReq.target_task_id!,
      dependency_type: depReq.dependency_type || 'finish_to_start',
      criticality: depReq.criticality || 'important',
      lag: depReq.lag,
      condition: depReq.condition,
      metadata: {
        created_at: new Date().toISOString(),
        created_by: 'system',
        is_critical: (depReq.criticality || 'important') === 'blocking',
        ...depReq.metadata
      }
    }));
  }

  /**
   * 从请求创建里程碑列表
   */
  private createMilestonesFromRequest(milestones: Partial<PlanMilestone>[]): PlanMilestone[] {
    return milestones.map(milestoneReq => ({
      id: milestoneReq.id || uuidv4(),
      name: milestoneReq.name || 'Untitled Milestone',
      description: milestoneReq.description,
      target_date: milestoneReq.target_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
      status: milestoneReq.status || 'upcoming',
      success_criteria: milestoneReq.success_criteria || [],
      dependencies: milestoneReq.dependencies
    }));
  }

     /**
    * 合并默认失败解决器配置
    */
   private mergeWithDefaultFailureResolver(partial?: Partial<FailureResolver>): FailureResolver {
     const defaultResolver = createDefaultFailureResolver();
     
     if (!partial) {
       return defaultResolver;
     }

     return {
       ...defaultResolver,
       ...partial,
       retry_config: partial.retry_config ? {
         ...defaultResolver.retry_config,
         ...partial.retry_config
       } : defaultResolver.retry_config,
       rollback_config: partial.rollback_config ? {
         ...defaultResolver.rollback_config,
         ...partial.rollback_config
       } : defaultResolver.rollback_config,
       manual_intervention_config: partial.manual_intervention_config ? {
         ...defaultResolver.manual_intervention_config,
         ...partial.manual_intervention_config
       } : defaultResolver.manual_intervention_config,
       performance_thresholds: partial.performance_thresholds ? {
         ...defaultResolver.performance_thresholds,
         ...partial.performance_thresholds
       } : defaultResolver.performance_thresholds
     };
   }

   /**
    * 合并默认优化配置
    */
   private mergeWithDefaultOptimization(partial?: Partial<PlanOptimization>): PlanOptimization {
     const defaultOptimization = this.createDefaultOptimization();
     
     if (!partial) {
       return defaultOptimization;
     }

     return {
       ...defaultOptimization,
       ...partial,
       constraints: partial.constraints ? {
         ...defaultOptimization.constraints,
         ...partial.constraints
       } : defaultOptimization.constraints,
       parameters: partial.parameters ? {
         ...defaultOptimization.parameters,
         ...partial.parameters
       } : defaultOptimization.parameters
     };
   }

   /**
    * 合并默认风险评估配置
    */
   private mergeWithDefaultRiskAssessment(partial?: Partial<PlanRiskAssessment>): PlanRiskAssessment {
     const defaultAssessment = this.createDefaultRiskAssessment();
     
     if (!partial) {
       return defaultAssessment;
     }

     return {
       ...defaultAssessment,
       ...partial,
       identified_risks: partial.identified_risks || defaultAssessment.identified_risks
     };
   }

  /**
   * 创建默认优化配置
   */
  private createDefaultOptimization(): PlanOptimization {
    return {
      strategy: 'balanced',
      constraints: {
        resource_limits: {}
      },
      parameters: {
        time_weight: 0.3,
        cost_weight: 0.3,
        quality_weight: 0.4,
        risk_tolerance: 'medium'
      }
    };
  }

  /**
   * 创建默认风险评估
   */
  private createDefaultRiskAssessment(): PlanRiskAssessment {
    return {
      overall_risk_level: 'low',
      identified_risks: []
    };
  }

  /**
   * 创建初始进度摘要
   */
  private createInitialProgressSummary() {
    return {
      total_tasks: 0,
      completed_tasks: 0,
      failed_tasks: 0,
      blocked_tasks: 0,
      in_progress_tasks: 0,
      pending_tasks: 0,
      overall_progress_percentage: 0,
      milestones: []
    };
  }

  /**
   * 创建空的依赖图
   */
  private createEmptyDependencyGraph() {
    return {
      nodes: [],
      edges: [],
      entry_points: [],
      exit_points: [],
      critical_path: [],
      cycles: []
    };
  }

  /**
   * 更新计算字段
   */
  private updateCalculatedFields(plan: PlanProtocol): void {
    // 更新task_ids
    plan.task_ids = plan.tasks.map(task => task.task_id);

    // 更新依赖图
    if (plan.dependency_graph) {
      plan.dependency_graph.nodes = plan.task_ids;
      plan.dependency_graph.edges = plan.dependencies;
    }

    // 更新进度摘要
    if (plan.progress_summary) {
      plan.progress_summary.total_tasks = plan.tasks.length;
      plan.progress_summary.completed_tasks = plan.tasks.filter(t => t.status === 'completed').length;
      plan.progress_summary.failed_tasks = plan.tasks.filter(t => t.status === 'failed').length;
      plan.progress_summary.blocked_tasks = plan.tasks.filter(t => t.status === 'blocked').length;
      plan.progress_summary.in_progress_tasks = plan.tasks.filter(t => t.status === 'running').length;
      plan.progress_summary.pending_tasks = plan.tasks.filter(t => t.status === 'pending').length;
      
      if (plan.progress_summary.total_tasks > 0) {
        plan.progress_summary.overall_progress_percentage = 
          (plan.progress_summary.completed_tasks / plan.progress_summary.total_tasks) * 100;
      }
    }

    // 更新元数据
    if (plan.metadata) {
      plan.metadata.total_tasks = plan.tasks.length;
      plan.metadata.total_dependencies = plan.dependencies.length;
      plan.metadata.complexity_score = this.calculateComplexityScore(plan);
      plan.metadata.updated_at = new Date().toISOString();
    }
  }

  /**
   * 计算复杂度评分
   */
  private calculateComplexityScore(plan: PlanProtocol): number {
    const taskComplexity = plan.tasks.length * 0.1;
    const dependencyComplexity = plan.dependencies.length * 0.2;
    const milestoneComplexity = plan.milestones.length * 0.1;
    
    // 计算嵌套任务复杂度
    const nestedComplexity = plan.tasks.reduce((acc, task) => {
      return acc + (task.sub_tasks?.length || 0) * 0.05;
    }, 0);

    return Math.round((taskComplexity + dependencyComplexity + milestoneComplexity + nestedComplexity) * 10) / 10;
  }

  /**
   * 将Plan对象转换为Schema兼容格式
   */
  public toPlanProtocol(plan: PlanProtocol): PlanProtocol {
    // 移除运行时字段，只保留Schema定义的字段
    const {
      progress_summary,
      task_ids,
      dependency_graph,
      metadata,
      title,
      owner_id,
      team_ids,
      stakeholder_ids,
      estimated_duration_hours,
      performance_metrics,
      configuration,
      ...schemaFields
    } = plan;

    return schemaFields;
  }

  /**
   * 从Schema格式创建完整的Plan对象
   */
  public fromPlanProtocol(schemaData: PlanProtocol): PlanProtocol {
    const plan = { ...schemaData };
    
    // 添加运行时字段
    if (!plan.progress_summary) {
      plan.progress_summary = this.createInitialProgressSummary();
    }
    
    if (!plan.task_ids) {
      plan.task_ids = plan.tasks.map(task => task.task_id);
    }
    
    if (!plan.dependency_graph) {
      plan.dependency_graph = this.createEmptyDependencyGraph();
    }

    if (!plan.metadata) {
      const timestamp = new Date().toISOString();
      plan.metadata = {
        created_by: 'system',
        created_at: timestamp,
        updated_by: 'system',
        updated_at: timestamp,
        version: 1,
        creation_source: 'schema_import',
        total_tasks: plan.tasks.length,
        total_dependencies: plan.dependencies.length,
        complexity_score: 0
      };
    }

    // 更新计算字段
    this.updateCalculatedFields(plan);

    return plan;
  }
} 