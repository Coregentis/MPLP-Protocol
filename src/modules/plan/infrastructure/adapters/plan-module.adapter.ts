/**
 * Plan模块适配器
 * 
 * 实现Core模块的ModuleInterface接口，提供任务规划和分解功能
 * 
 * @version 2.0.0
 * @created 2025-08-04
 * @updated 2025-08-04 23:09
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ModuleInterface,
  ModuleStatus,
  PlanningCoordinationRequest,
  PlanningResult,
  BusinessCoordinationRequest,
  BusinessCoordinationResult,
  BusinessData,
  BusinessError,
  BusinessContext,
  ValidationResult,
  ErrorHandlingResult,
  WorkflowExecutionContext,
  StageExecutionResult
} from '../../../../public/modules/core/types/core.types';
import { PlanManagementService } from '../../application/services/plan-management.service';
import { PlanExecutionService } from '../../application/services/plan-execution.service';
import { Logger } from '../../../../public/utils/logger';
import { 
  ExecutionStrategy,
  Priority,
  UUID
} from '../../../../public/shared/types/plan-types';

/**
 * Plan模块适配器类
 * 实现Core模块的ModuleInterface接口
 */
export class PlanModuleAdapter implements ModuleInterface {
  public readonly module_name = 'plan';
  private logger = new Logger('PlanModuleAdapter');
  private moduleStatus: ModuleStatus = {
    module_name: 'plan',
    status: 'idle',
    error_count: 0
  };

  constructor(
    private planManagementService: PlanManagementService,
    private planExecutionService: PlanExecutionService
  ) {}

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Plan module adapter');
      
      // 检查服务是否可用
      if (!this.planManagementService || !this.planExecutionService) {
        throw new Error('Plan services not available');
      }

      this.moduleStatus.status = 'initialized';
      this.logger.info('Plan module adapter initialized successfully');
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      this.logger.error('Failed to initialize Plan module adapter', error);
      throw error;
    }
  }

  /**
   * 执行任务规划
   */
  async execute(request: PlanningCoordinationRequest): Promise<PlanningResult> {
    this.logger.info('Executing planning coordination', { 
      contextId: request.contextId,
      strategy: request.planning_strategy 
    });

    this.moduleStatus.status = 'running';
    this.moduleStatus.last_execution = new Date().toISOString();

    try {
      // 验证请求参数
      this.validatePlanningRequest(request);

      // 根据策略执行任务规划
      const result = await this.executePlanningStrategy(request);

      this.moduleStatus.status = 'idle';
      
      this.logger.info('Planning coordination completed', {
        contextId: request.contextId,
        plan_id: result.plan_id
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      
      this.logger.error('Planning coordination failed', {
        contextId: request.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Plan module adapter');
      this.moduleStatus.status = 'idle';
      this.logger.info('Plan module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup Plan module adapter', error);
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return this.moduleStatus;
  }

  // ===== 私有方法 =====

  /**
   * 验证规划请求
   */
  private validatePlanningRequest(request: PlanningCoordinationRequest): void {
    if (!request.contextId) {
      throw new Error('Context ID is required');
    }

    if (!['sequential', 'parallel', 'adaptive', 'hierarchical'].includes(request.planning_strategy)) {
      throw new Error(`Unsupported planning strategy: ${request.planning_strategy}`);
    }

    // 验证资源约束
    if (request.parameters.resource_constraints) {
      const { time_limit, resource_limit } = request.parameters.resource_constraints;
      
      if (time_limit && time_limit <= 0) {
        throw new Error('Time limit must be positive');
      }
      
      if (resource_limit && resource_limit <= 0) {
        throw new Error('Resource limit must be positive');
      }
    }

    // 验证任务管理配置
    if (request.task_management) {
      const { auto_decomposition, dependency_tracking, progress_monitoring } = request.task_management;
      
      if (typeof auto_decomposition !== 'boolean' ||
          typeof dependency_tracking !== 'boolean' ||
          typeof progress_monitoring !== 'boolean') {
        throw new Error('Task management flags must be boolean values');
      }
    }
  }

  /**
   * 执行规划策略
   */
  private async executePlanningStrategy(request: PlanningCoordinationRequest): Promise<PlanningResult> {
    const plan_id = uuidv4();
    const timestamp = new Date().toISOString();

    // 根据策略生成计划数据
    const planData = await this.generatePlanData(request, plan_id);

    // 创建计划
    const createResult = await this.planManagementService.createPlan(planData);
    if (!createResult.success || !createResult.data) {
      throw new Error(`Failed to create plan: ${createResult.error}`);
    }

    const plan = createResult.data;

    // 执行任务分解
    const taskBreakdown = await this.executeTaskDecomposition(request, plan);

    // 分配资源
    const resourceAllocation = this.allocateResources(request, taskBreakdown);

    return {
      plan_id: plan_id as UUID,
      task_breakdown: taskBreakdown,
      resource_allocation: resourceAllocation,
      timestamp: timestamp as any
    };
  }

  /**
   * 生成计划数据
   */
  private async generatePlanData(request: PlanningCoordinationRequest, plan_id: string): Promise<any> {
    const strategy = this.mapStrategyToExecutionStrategy(request.planning_strategy);
    const priority = this.determinePriority(request);

    return {
      plan_id,
      context_id: request.contextId,
      name: `Plan-${request.planning_strategy}-${plan_id.substring(0, 8)}`,
      description: `Plan created using ${request.planning_strategy} strategy`,
      goals: request.parameters.decomposition_rules || ['Complete project objectives'],
      execution_strategy: strategy,
      priority: priority,
      estimated_duration: request.parameters.resource_constraints?.time_limit 
        ? { value: request.parameters.resource_constraints.time_limit, unit: 'minutes' }
        : undefined,
      configuration: {
        execution_settings: {
          strategy: strategy,
          parallel_limit: request.planning_strategy === 'parallel' ? 5 : 1,
          default_timeout_ms: 30000,
          retry_policy: {
            max_retries: 3,
            retry_delay_ms: 1000,
            backoff_factor: 2
          }
        },
        notification_settings: {
          enabled: request.task_management?.progress_monitoring || false,
          channels: ['system'],
          events: ['task_completed', 'plan_completed']
        },
        optimization_settings: {
          enabled: request.planning_strategy === 'adaptive',
          strategies: ['resource_optimization', 'time_optimization'],
          auto_adjust: true
        }
      },
      metadata: {
        planning_strategy: request.planning_strategy,
        auto_decomposition: request.task_management?.auto_decomposition || false,
        dependency_tracking: request.task_management?.dependency_tracking || false,
        progress_monitoring: request.task_management?.progress_monitoring || false
      }
    };
  }

  /**
   * 执行任务分解
   */
  private async executeTaskDecomposition(request: PlanningCoordinationRequest, plan: any): Promise<{
    tasks: Array<{
      task_id: UUID;
      name: string;
      dependencies: UUID[];
      priority: number;
      estimated_duration?: number;
    }>;
    execution_order: UUID[];
  }> {
    const tasks = [];
    const taskIds = [];

    // 根据分解规则生成任务
    const decompositionRules = request.parameters.decomposition_rules || ['default_task'];
    
    for (let i = 0; i < decompositionRules.length; i++) {
      const taskId = uuidv4();
      const rule = decompositionRules[i];
      
      tasks.push({
        task_id: taskId as UUID,
        name: `Task: ${rule}`,
        dependencies: i > 0 && request.planning_strategy === 'sequential' ? [taskIds[i - 1]] : [],
        priority: this.calculateTaskPriority(request, i),
        estimated_duration: this.estimateTaskDuration(request, rule)
      });
      
      taskIds.push(taskId as UUID);
    }

    // 确定执行顺序
    const execution_order = this.determineExecutionOrder(request.planning_strategy, taskIds);

    return {
      tasks,
      execution_order
    };
  }

  /**
   * 分配资源
   */
  private allocateResources(request: PlanningCoordinationRequest, taskBreakdown: any): Record<string, any> {
    const allocation: Record<string, any> = {
      strategy: request.planning_strategy,
      total_tasks: taskBreakdown.tasks.length,
      resource_constraints: request.parameters.resource_constraints || {},
      priority_weights: request.parameters.priority_weights || {}
    };

    // 根据策略分配资源
    switch (request.planning_strategy) {
      case 'parallel':
        allocation.parallel_slots = Math.min(taskBreakdown.tasks.length, 5);
        allocation.resource_per_task = 1.0 / allocation.parallel_slots;
        break;
      
      case 'sequential':
        allocation.parallel_slots = 1;
        allocation.resource_per_task = 1.0;
        break;
      
      case 'adaptive':
        allocation.adaptive_threshold = 0.7;
        allocation.resource_buffer = 0.2;
        break;
      
      case 'hierarchical':
        allocation.hierarchy_levels = Math.ceil(Math.log2(taskBreakdown.tasks.length));
        allocation.level_resources = {};
        break;
    }

    return allocation;
  }

  /**
   * 映射策略到执行策略
   */
  private mapStrategyToExecutionStrategy(strategy: string): ExecutionStrategy {
    switch (strategy) {
      case 'sequential':
        return 'sequential';
      case 'parallel':
        return 'parallel';
      case 'adaptive':
        return 'hybrid'; // 自适应映射到混合策略
      case 'hierarchical':
        return 'conditional'; // 层次化映射到条件策略
      default:
        return 'sequential';
    }
  }

  /**
   * 确定优先级
   */
  private determinePriority(request: PlanningCoordinationRequest): Priority {
    const constraints = request.parameters.resource_constraints;
    
    if (constraints?.time_limit && constraints.time_limit < 3600000) { // < 1 hour
      return 'critical';
    } else if (constraints?.time_limit && constraints.time_limit < 86400000) { // < 1 day
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * 计算任务优先级
   */
  private calculateTaskPriority(request: PlanningCoordinationRequest, index: number): number {
    const weights = request.parameters.priority_weights;
    if (weights && weights[`task_${index}`]) {
      return weights[`task_${index}`];
    }
    
    // 默认优先级：越早的任务优先级越高
    return Math.max(1, 10 - index);
  }

  /**
   * 估算任务持续时间
   */
  private estimateTaskDuration(request: PlanningCoordinationRequest, rule: string): number | undefined {
    const constraints = request.parameters.resource_constraints;
    if (!constraints?.time_limit) {
      return undefined;
    }

    // 简化估算：平均分配时间
    const decompositionRules = request.parameters.decomposition_rules || ['default_task'];
    return Math.floor(constraints.time_limit / decompositionRules.length);
  }

  /**
   * 确定执行顺序
   */
  private determineExecutionOrder(strategy: string, taskIds: UUID[]): UUID[] {
    switch (strategy) {
      case 'sequential':
        return [...taskIds]; // 按创建顺序
      
      case 'parallel':
        return [...taskIds]; // 并行执行，顺序不重要
      
      case 'adaptive':
        return [...taskIds].sort(); // 按ID排序，模拟自适应调整
      
      case 'hierarchical':
        // 简化的层次排序
        return [...taskIds].reverse();
      
      default:
        return [...taskIds];
    }
  }

  /**
   * P0修复：执行工作流阶段
   */
  async executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing Plan stage', {
        executionId: context.execution_id,
        contextId: context.context_id
      });

      // 从工作流上下文创建业务协调请求
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: context.context_id,
        module: 'plan',
        coordination_type: 'planning_coordination',
        input_data: context.data_store.global_data.input || {
          data_type: 'planning_data',
          data_version: '1.0.0',
          payload: { context_id: context.context_id },
          metadata: {
            source_module: 'plan',
            target_modules: ['plan'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        previous_stage_results: [],
        configuration: {
          timeout_ms: 30000,
          retry_policy: { max_attempts: 3, delay_ms: 1000 },
          validation_rules: [],
          output_format: 'planning_data'
        }
      };

      // 执行业务协调
      const businessResult = await this.executeBusinessCoordination(businessRequest);

      return {
        stage: 'plan',
        status: businessResult.status === 'completed' ? 'completed' : 'failed',
        result: businessResult.output_data,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        stage: 'plan',
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：执行业务协调
   */
  async executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Executing Plan business coordination', {
        coordinationId: request.coordination_id,
        contextId: request.context_id
      });

      // 转换业务协调请求为Plan协调请求
      const planRequest: PlanningCoordinationRequest = {
        contextId: request.context_id,
        planning_strategy: request.input_data.payload.planning_strategy || 'sequential',
        parameters: request.input_data.payload.parameters || {
          decomposition_rules: ['Complete project objectives'],
          resource_constraints: {},
          priority_weights: {}
        }
      };

      // 执行原有的Plan协调逻辑
      const planResult = await this.execute(planRequest);

      // 转换结果为业务协调结果
      const outputData: BusinessData = {
        data_type: 'planning_data',
        data_version: '1.0.0',
        payload: planResult,
        metadata: {
          source_module: 'plan',
          target_modules: ['confirm'],
          data_schema_version: '1.0.0',
          validation_status: 'valid',
          security_level: 'internal'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        coordination_id: request.coordination_id,
        module: 'plan',
        status: 'completed',
        output_data: outputData,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const businessError: BusinessError = {
        error_id: uuidv4() as UUID,
        error_type: 'business_logic_error',
        error_code: 'PLAN_COORDINATION_FAILED',
        error_message: error instanceof Error ? error.message : String(error),
        source_module: 'plan',
        context_data: { coordinationId: request.coordination_id },
        recovery_suggestions: [
          {
            suggestion_type: 'retry',
            description: 'Retry the planning coordination',
            automated: true
          }
        ],
        timestamp: new Date().toISOString()
      };

      return {
        coordination_id: request.coordination_id,
        module: 'plan',
        status: 'failed',
        output_data: request.input_data,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        error: businessError,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：验证输入数据
   */
  async validateInput(input: BusinessData | PlanningCoordinationRequest): Promise<ValidationResult> {
    const errors: Array<{ field_path: string; error_code: string; error_message: string }> = [];
    const warnings: Array<{ field_path: string; warning_code: string; warning_message: string }> = [];

    try {
      // 检查输入类型并验证
      if ('data_type' in input) {
        // BusinessData类型
        const businessData = input as BusinessData;
        if (!businessData.payload) {
          errors.push({
            field_path: 'payload',
            error_code: 'MISSING_PAYLOAD',
            error_message: 'Business data payload is required'
          });
        }
      } else {
        // PlanningCoordinationRequest类型
        const planRequest = input as PlanningCoordinationRequest;
        if (!planRequest.contextId) {
          errors.push({
            field_path: 'contextId',
            error_code: 'MISSING_CONTEXT_ID',
            error_message: 'Context ID is required'
          });
        }
      }

      return {
        is_valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        is_valid: false,
        errors: [{
          field_path: 'input',
          error_code: 'VALIDATION_ERROR',
          error_message: error instanceof Error ? error.message : String(error)
        }],
        warnings: []
      };
    }
  }

  /**
   * P0修复：处理错误
   */
  async handleError(error: BusinessError, context: BusinessContext): Promise<ErrorHandlingResult> {
    this.logger.error('Handling Plan module error', {
      errorId: error.error_id,
      errorType: error.error_type,
      contextId: context.context_id
    });

    // 根据错误类型决定恢复策略
    switch (error.error_type) {
      case 'validation_error':
        return {
          handled: true,
          recovery_action: 'retry'
        };

      case 'timeout_error':
        return {
          handled: true,
          recovery_action: 'retry'
        };

      default:
        return {
          handled: false,
          recovery_action: 'escalate'
        };
    }
  }
}
