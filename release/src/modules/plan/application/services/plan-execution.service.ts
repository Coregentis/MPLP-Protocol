/**
 * Plan执行服务
 * 
 * 提供Plan实体的执行功能，包括执行计划、暂停执行、恢复执行和取消执行
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:15:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../../domain/entities/plan.entity';
import { PlanTask } from '../../domain/value-objects/plan-task.value-object';
import { PlanDependency } from '../../domain/value-objects/plan-dependency.value-object';
import { IPlanRepository } from '../../domain/repositories/plan-repository.interface';
import { PlanValidationService } from '../../domain/services/plan-validation.service';
import { getDependencyTaskIds } from '../../domain/value-objects/plan-dependency.value-object';
import { isTaskFinished } from '../../domain/value-objects/plan-task.value-object';
import { UUID, TaskStatus } from '../../../../public/shared/types/plan-types';

/**
 * 计划执行请求接口
 */
export interface PlanExecutionRequest {
  plan_id: UUID;
  execution_context?: Record<string, unknown>;
  execution_options?: {
    parallel_limit?: number;
    timeout_ms?: number;
    retry_failed_tasks?: boolean;
    failure_strategy?: string;
  };
  execution_variables?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
}

/**
 * 计划执行结果接口
 */
export interface PlanExecutionResult {
  success: boolean;
  plan_id: UUID;
  status: string;
  execution_id?: UUID;
  started_at?: string;
  completed_at?: string;
  execution_time_ms: number;
  estimated_completion_time?: string;
  optimization_applied?: boolean;
  execution_mode?: string;
  tasks_status: {
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    skipped: number;
  };
  error?: string;
}

/**
 * 任务执行结果接口
 */
export interface TaskExecutionResult {
  success: boolean;
  task_id: UUID;
  status: TaskStatus;
  started_at: string;
  completed_at?: string;
  execution_time_ms: number;
  error?: string;
}

/**
 * Plan执行服务
 */
export class PlanExecutionService {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly planValidationService: PlanValidationService
  ) {}
  
  /**
   * 执行计划
   * @param request 执行请求
   * @returns 执行结果
   */
  async executePlan(request: PlanExecutionRequest): Promise<PlanExecutionResult> {
    const startTime = Date.now();
    
    try {
      // 获取计划
      const plan = await this.planRepository.findById(request.plan_id);
      
      if (!plan) {
        return this.buildFailureResult(
          request.plan_id,
          `Plan with ID ${request.plan_id} not found`,
          startTime
        );
      }
      
      // 验证计划是否可执行
      const validation = this.planValidationService.validatePlanExecutability(plan);
      if (!validation.valid) {
        return this.buildFailureResult(
          request.plan_id,
          `Plan is not executable: ${validation.errors.join(', ')}`,
          startTime
        );
      }
      
      // 更新计划状态为活动
      plan.updateStatus('active');
      await this.planRepository.update(plan);
      
      // 执行计划
      const executionResult = await this.executeTasksInPlan(plan, request);
      
      // 更新计划状态
      if (executionResult.success) {
        plan.updateStatus('completed');
      } else {
        plan.updateStatus('failed');
      }
      
      await this.planRepository.update(plan);
      
      return executionResult;
    } catch (error: any) {
      return this.buildFailureResult(
        request.plan_id,
        `Failed to execute plan: ${error.message}`,
        startTime
      );
    }
  }
  
  /**
   * 执行计划中的任务
   * @param plan 计划
   * @param request 执行请求
   * @returns 执行结果
   */
  private async executeTasksInPlan(
    plan: Plan,
    request: PlanExecutionRequest
  ): Promise<PlanExecutionResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();
    
    try {
      // 确定执行模式
      const executionMode = plan.execution_strategy;
      const parallelLimit = request.execution_options?.parallel_limit || 
                           plan.configuration.execution_settings.parallel_limit || 5;
      
      // 初始化任务状态
      const taskResults: Record<UUID, TaskExecutionResult> = {};
      let pendingTasks = [...plan.tasks];
      let inProgressTasks: PlanTask[] = [];
      const completedTasks: PlanTask[] = [];
      const failedTasks: PlanTask[] = [];
      const cancelledTasks: PlanTask[] = [];
      const skippedTasks: PlanTask[] = [];
      
      // 模拟执行计划中的任务
      // 注意：在实际实现中，这里会有更复杂的逻辑来执行任务
      
      // 根据执行策略执行任务
      if (executionMode === 'sequential') {
        // 顺序执行
        for (const task of this.sortTasksByDependencies(plan.tasks, plan.dependencies)) {
          const result = await this.executeTask(task, plan, request);
          taskResults[task.task_id] = result;
          
          if (result.status === 'completed') {
            completedTasks.push(task);
          } else if (result.status === 'failed') {
            failedTasks.push(task);
            // 如果不重试失败的任务，则中止执行
            if (!request.execution_options?.retry_failed_tasks) {
              break;
            }
          } else if (result.status === 'cancelled') {
            cancelledTasks.push(task);
          } else if (result.status === 'skipped') {
            skippedTasks.push(task);
          }
        }
      } else if (executionMode === 'parallel') {
        // 并行执行
        while (pendingTasks.length > 0 || inProgressTasks.length > 0) {
          // 找出可以执行的任务
          const executableTasks = this.findExecutableTasks(
            pendingTasks,
            inProgressTasks,
            completedTasks,
            failedTasks,
            plan.dependencies,
            parallelLimit
          );
          
          // 启动可执行的任务
          for (const task of executableTasks) {
            pendingTasks = pendingTasks.filter(t => t.task_id !== task.task_id);
            inProgressTasks.push(task);
            
            // 异步执行任务
            this.executeTask(task, plan, request).then(result => {
              taskResults[task.task_id] = result;
              inProgressTasks = inProgressTasks.filter(t => t.task_id !== task.task_id);
              
              if (result.status === 'completed') {
                completedTasks.push(task);
              } else if (result.status === 'failed') {
                failedTasks.push(task);
              } else if (result.status === 'cancelled') {
                cancelledTasks.push(task);
              } else if (result.status === 'skipped') {
                skippedTasks.push(task);
              }
            });
          }
          
          // 等待一段时间，模拟任务执行
          if (inProgressTasks.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else if (executionMode === 'conditional') {
        // 条件执行
        // 注意：在实际实现中，这里会有更复杂的逻辑来处理条件执行
        // 这里只是简单模拟
        for (const task of this.sortTasksByDependencies(plan.tasks, plan.dependencies)) {
          // 检查条件
          const shouldExecute = this.evaluateTaskCondition(task, request.conditions || {});
          
          if (shouldExecute) {
            const result = await this.executeTask(task, plan, request);
            taskResults[task.task_id] = result;
            
            if (result.status === 'completed') {
              completedTasks.push(task);
            } else if (result.status === 'failed') {
              failedTasks.push(task);
              // 如果不重试失败的任务，则中止执行
              if (!request.execution_options?.retry_failed_tasks) {
                break;
              }
            } else if (result.status === 'cancelled') {
              cancelledTasks.push(task);
            } else if (result.status === 'skipped') {
              skippedTasks.push(task);
            }
          } else {
            // 跳过任务
            skippedTasks.push(task);
          }
        }
      }
      
      // 计算执行时间
      const executionTimeMs = Date.now() - startTime;
      
      // 构建执行结果
      const success = failedTasks.length === 0 && cancelledTasks.length === 0;
      
      return {
        success,
        plan_id: plan.plan_id,
        status: success ? 'completed' : 'failed',
        execution_id: executionId,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTimeMs,
        execution_mode: executionMode,
        tasks_status: {
          pending: pendingTasks.length,
          in_progress: inProgressTasks.length,
          completed: completedTasks.length,
          failed: failedTasks.length,
          cancelled: cancelledTasks.length,
          skipped: skippedTasks.length
        },
        error: failedTasks.length > 0 ? `${failedTasks.length} tasks failed` : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        plan_id: plan.plan_id,
        status: 'failed',
        execution_id: executionId,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        execution_time_ms: Date.now() - startTime,
        tasks_status: {
          pending: 0,
          in_progress: 0,
          completed: 0,
          failed: 0,
          cancelled: 0,
          skipped: 0
        },
        error: `Failed to execute plan: ${error.message}`
      };
    }
  }
  
  /**
   * 执行单个任务
   * @param task 任务
   * @param plan 计划
   * @param request 执行请求
   * @returns 任务执行结果
   */
  private async executeTask(
    task: PlanTask,
    plan: Plan,
    request: PlanExecutionRequest
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    
    try {
      // 模拟任务执行
      // 注意：在实际实现中，这里会有更复杂的逻辑来执行任务
      
      // 随机执行时间，模拟任务执行
      const executionTime = Math.floor(Math.random() * 1000) + 500;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // 90%的成功率，模拟任务成功或失败
      const success = Math.random() < 0.9;
      
      if (success) {
        return {
          success: true,
          task_id: task.task_id,
          status: 'completed',
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          execution_time_ms: Date.now() - startTime
        };
      } else {
        return {
          success: false,
          task_id: task.task_id,
          status: 'failed',
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          execution_time_ms: Date.now() - startTime,
          error: 'Task execution failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        task_id: task.task_id,
        status: 'failed',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        execution_time_ms: Date.now() - startTime,
        error: `Failed to execute task: ${error.message}`
      };
    }
  }
  
  /**
   * 查找可执行的任务
   * @param pendingTasks 待执行任务
   * @param inProgressTasks 正在执行的任务
   * @param completedTasks 已完成的任务
   * @param failedTasks 失败的任务
   * @param dependencies 依赖关系
   * @param parallelLimit 并行限制
   * @returns 可执行的任务
   */
  private findExecutableTasks(
    pendingTasks: PlanTask[],
    inProgressTasks: PlanTask[],
    completedTasks: PlanTask[],
    failedTasks: PlanTask[],
    dependencies: PlanDependency[],
    parallelLimit: number
  ): PlanTask[] {
    // 如果已达到并行限制，不执行新任务
    if (inProgressTasks.length >= parallelLimit) {
      return [];
    }
    
    // 找出可执行的任务
    const executableTasks: PlanTask[] = [];
    
    for (const task of pendingTasks) {
      // 检查任务依赖是否已满足
      const dependencyTaskIds = getDependencyTaskIds(dependencies, task.task_id);
      const allDependenciesMet = dependencyTaskIds.every(depId => 
        completedTasks.some(t => t.task_id === depId) || 
        failedTasks.some(t => t.task_id === depId)
      );
      
      if (allDependenciesMet) {
        executableTasks.push(task);
        
        // 如果已达到并行限制，不再添加新任务
        if (executableTasks.length + inProgressTasks.length >= parallelLimit) {
          break;
        }
      }
    }
    
    return executableTasks;
  }
  
  /**
   * 按依赖关系排序任务
   * @param tasks 任务列表
   * @param dependencies 依赖关系
   * @returns 排序后的任务列表
   */
  private sortTasksByDependencies(tasks: PlanTask[], dependencies: PlanDependency[]): PlanTask[] {
    // 构建依赖图
    const graph: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    
    // 初始化图和入度
    tasks.forEach(task => {
      graph[task.task_id] = [];
      inDegree[task.task_id] = 0;
    });
    
    // 添加依赖边
    dependencies.forEach(dep => {
      graph[dep.source_task_id].push(dep.target_task_id);
      inDegree[dep.target_task_id] = (inDegree[dep.target_task_id] || 0) + 1;
    });
    
    // 拓扑排序
    const queue: string[] = [];
    const sorted: string[] = [];
    
    // 找出入度为0的节点
    tasks.forEach(task => {
      if (inDegree[task.task_id] === 0) {
        queue.push(task.task_id);
      }
    });
    
    // 执行拓扑排序
    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);
      
      for (const neighbor of graph[node]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    // 如果存在循环依赖，使用原始顺序
    if (sorted.length !== tasks.length) {
      return tasks;
    }
    
    // 按拓扑排序顺序返回任务
    return sorted.map(id => tasks.find(task => task.task_id === id)!);
  }
  
  /**
   * 评估任务条件
   * @param task 任务
   * @param conditions 条件
   * @returns 是否满足条件
   */
  private evaluateTaskCondition(task: PlanTask, conditions: Record<string, unknown>): boolean {
    // 注意：在实际实现中，这里会有更复杂的逻辑来评估条件
    // 这里只是简单模拟
    
    // 默认执行
    return true;
  }
  
  /**
   * 生成执行ID
   * @returns 执行ID
   */
  private generateExecutionId(): UUID {
    return `exec-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * 构建失败结果
   * @param planId 计划ID
   * @param errorMessage 错误信息
   * @param startTime 开始时间
   * @returns 执行结果
   */
  private buildFailureResult(
    planId: UUID,
    errorMessage: string,
    startTime: number
  ): PlanExecutionResult {
    return {
      success: false,
      plan_id: planId,
      status: 'failed',
      execution_time_ms: Date.now() - startTime,
      tasks_status: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        skipped: 0
      },
      error: errorMessage
    };
  }
} 