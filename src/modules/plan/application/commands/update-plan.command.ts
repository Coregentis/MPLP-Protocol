/**
 * 更新计划命令
 * 
 * 处理计划更新的应用层命令
 * 
 * @version v1.0.0
 * @created 2025-08-07
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID } from '../../../../public/shared/types';
import {
  PlanStatus,
  ExecutionStrategy,
  Priority,
  PlanTask,
  PlanDependency,
  Duration
} from '../../types';
import { PlanConfiguration } from '../../domain/value-objects/plan-configuration.value-object';
import { PlanManagementService } from '../services/plan-management.service';
import { Plan } from '../../domain/entities/plan.entity';
import { OperationResult } from '../../../../public/shared/types';

/**
 * 更新计划命令接口
 */
export interface UpdatePlanCommand {
  planId: UUID;
  name?: string;
  description?: string;
  status?: PlanStatus;
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
}

/**
 * 更新计划命令处理器
 */
export class UpdatePlanCommandHandler {
  constructor(
    private readonly planManagementService: PlanManagementService
  ) {}
  
  /**
   * 处理更新计划命令
   * @param command 更新计划命令
   * @returns 操作结果
   */
  async execute(command: UpdatePlanCommand): Promise<OperationResult<Plan>> {
    // 构建类型安全的更新数据
    const updateData: {
      name?: string;
      description?: string;
      status?: PlanStatus;
      goals?: string[];
      tasks?: PlanTask[];
      dependencies?: PlanDependency[];
      executionStrategy?: ExecutionStrategy;
      priority?: Priority;
      estimatedDuration?: Duration;
      configuration?: PlanConfiguration;
      metadata?: Record<string, unknown>;
    } = {
      name: command.name,
      description: command.description,
      status: command.status,
      goals: command.goals,
      tasks: command.tasks,
      executionStrategy: command.executionStrategy || command.execution_strategy,
      priority: command.priority,
      configuration: command.configuration,
      metadata: command.metadata
    };

    // 处理estimatedDuration
    if (command.estimatedDuration || command.estimated_duration) {
      updateData.estimatedDuration = {
        value: (command.estimatedDuration || command.estimated_duration)?.value || 0,
        unit: ((command.estimatedDuration || command.estimated_duration)?.unit || 'hours') as 'minutes' | 'hours' | 'days' | 'weeks'
      };
    }

    // 处理dependencies
    if (command.dependencies) {
      updateData.dependencies = command.dependencies.map(dep => ({
        dependencyId: dep.dependencyId,
        sourceTaskId: dep.sourceTaskId,
        targetTaskId: dep.targetTaskId,
        type: dep.type,
        lagTimeMs: dep.lagTimeMs,
        condition: dep.condition,
        metadata: dep.metadata
      }));
    }

    return this.planManagementService.updatePlan(command.planId, updateData as Partial<Plan>);
  }
}
