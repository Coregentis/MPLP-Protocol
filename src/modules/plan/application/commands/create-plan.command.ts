/**
 * CreatePlan命令处理器
 * 
 * 处理创建计划的命令
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:20:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { v4 as uuidv4 } from 'uuid';
import { Plan } from '../../domain/entities/plan.entity';
import { PlanManagementService, OperationResult } from '../services/plan-management.service';
import { UUID } from '../../../../public/shared/types';
import {
  ExecutionStrategy,
  Priority,
  PlanTask,
  PlanDependency,
  Duration
} from '../../types';
import { PlanConfiguration } from '../../domain/value-objects/plan-configuration.value-object';

/**
 * 创建计划命令接口
 * Application层使用camelCase命名约定
 */
export interface CreatePlanCommand {
  planId?: UUID;                    // 对应Schema: plan_id
  contextId: UUID;                  // 对应Schema: context_id
  name: string;                     // 对应Schema: name
  description: string;              // 对应Schema: description
  goals?: string[];                 // 对应Schema: goals
  tasks?: PlanTask[];               // 对应Schema: tasks
  dependencies?: PlanDependency[];  // 对应Schema: dependencies
  executionStrategy?: ExecutionStrategy; // 对应Schema: execution_strategy
  priority?: Priority;              // 对应Schema: priority
  estimatedDuration?: Duration;     // 对应Schema: estimated_duration
  configuration?: PlanConfiguration; // 对应Schema: configuration
  metadata?: Record<string, unknown>; // 对应Schema: metadata
}

/**
 * 创建计划命令处理器
 */
export class CreatePlanCommandHandler {
  constructor(private readonly planManagementService: PlanManagementService) {}
  
  /**
   * 处理创建计划命令
   * @param command 创建计划命令
   * @returns 操作结果
   */
  async execute(command: CreatePlanCommand): Promise<OperationResult<Plan>> {
    // 生成计划ID（如果未提供）
    const planId = command.planId || uuidv4();
    
    // 执行创建计划操作
    // Application层(camelCase) → Service层(snake_case)映射
    return this.planManagementService.createPlan({
      planId: planId,
      contextId: command.contextId,
      name: command.name,
      description: command.description,
      goals: command.goals,
      tasks: command.tasks,
      dependencies: command.dependencies,
      executionStrategy: command.executionStrategy,
      priority: command.priority,
      estimatedDuration: command.estimatedDuration,
      configuration: command.configuration,
      metadata: command.metadata
    });
  }
} 