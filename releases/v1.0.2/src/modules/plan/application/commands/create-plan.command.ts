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
import { 
  UUID, 
  ExecutionStrategy, 
  Priority 
} from '../../../shared/types';

/**
 * 创建计划命令接口
 */
export interface CreatePlanCommand {
  plan_id?: UUID;
  context_id: UUID;
  name: string;
  description: string;
  goals?: string[];
  tasks?: any[];
  dependencies?: any[];
  execution_strategy?: ExecutionStrategy;
  priority?: Priority;
  estimated_duration?: { value: number; unit: string };
  configuration?: any;
  metadata?: Record<string, unknown>;
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
    const planId = command.plan_id || uuidv4();
    
    // 执行创建计划操作
    return this.planManagementService.createPlan({
      plan_id: planId,
      context_id: command.context_id,
      name: command.name,
      description: command.description,
      goals: command.goals,
      tasks: command.tasks,
      dependencies: command.dependencies,
      execution_strategy: command.execution_strategy,
      priority: command.priority,
      estimated_duration: command.estimated_duration,
      configuration: command.configuration,
      metadata: command.metadata
    });
  }
} 