/**
 * Plan映射器
 * 
 * 实现领域实体和持久化实体之间的转换
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:40:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../../domain/entities/plan.entity';
import { PlanEntity } from './plan.entity';
import { PlanFactoryService } from '../../domain/services/plan-factory.service';

/**
 * Plan映射器
 */
export class PlanMapper {
  private readonly planFactoryService: PlanFactoryService;
  
  constructor(planFactoryService: PlanFactoryService = new PlanFactoryService()) {
    this.planFactoryService = planFactoryService;
  }
  
  /**
   * 将领域实体转换为持久化实体
   * @param plan 领域实体
   * @returns 持久化实体
   */
  toPersistence(plan: Plan): PlanEntity {
    const planObject = plan.toObject();
    
    const planEntity = new PlanEntity();
    planEntity.plan_id = planObject.plan_id;
    planEntity.context_id = planObject.context_id;
    planEntity.name = planObject.name;
    planEntity.description = planObject.description;
    planEntity.status = planObject.status;
    planEntity.version = planObject.version;
    planEntity.created_at = new Date(planObject.created_at);
    planEntity.updated_at = new Date(planObject.updated_at);
    planEntity.goals = planObject.goals;
    planEntity.tasks = planObject.tasks;
    planEntity.dependencies = planObject.dependencies;
    planEntity.execution_strategy = planObject.execution_strategy;
    planEntity.priority = planObject.priority;
    planEntity.estimated_duration = planObject.estimated_duration;
    planEntity.progress = planObject.progress;
    planEntity.timeline = planObject.timeline;
    planEntity.configuration = planObject.configuration;
    planEntity.metadata = planObject.metadata;
    planEntity.risk_assessment = planObject.risk_assessment;
    
    return planEntity;
  }
  
  /**
   * 将持久化实体转换为领域实体
   * @param planEntity 持久化实体
   * @returns 领域实体
   */
  toDomain(planEntity: PlanEntity): Plan {
    return this.planFactoryService.createPlan({
      plan_id: planEntity.plan_id,
      context_id: planEntity.context_id,
      name: planEntity.name,
      description: planEntity.description,
      status: planEntity.status,
      version: planEntity.version,
      created_at: planEntity.created_at.toISOString(),
      updated_at: planEntity.updated_at.toISOString(),
      goals: planEntity.goals,
      tasks: planEntity.tasks,
      dependencies: planEntity.dependencies,
      execution_strategy: planEntity.execution_strategy,
      priority: planEntity.priority,
      estimated_duration: planEntity.estimated_duration,
      timeline: planEntity.timeline,
      configuration: planEntity.configuration,
      metadata: planEntity.metadata,
      risk_assessment: planEntity.risk_assessment ? {
        ...planEntity.risk_assessment,
        overall_risk_level: planEntity.risk_assessment.overall_risk_level as any
      } : undefined
    });
  }
  
  /**
   * 将持久化实体列表转换为领域实体列表
   * @param planEntities 持久化实体列表
   * @returns 领域实体列表
   */
  toDomainList(planEntities: PlanEntity[]): Plan[] {
    return planEntities.map(entity => this.toDomain(entity));
  }
} 