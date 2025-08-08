/**
 * Plan映射器
 *
 * 实现领域实体和持久化实体之间的转换
 * 命名映射策略：
 * - 领域层：驼峰命名 (planId, contextId, executionStrategy)
 * - 持久化层：下划线命名 (plan_id, context_id, execution_strategy)
 *
 * @version v1.0.0
 * @created 2025-07-26T19:40:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Plan } from '../../domain/entities/plan.entity';
import { PlanEntity } from './plan.entity';
import { PlanFactoryService } from '../../domain/services/plan-factory.service';
import {
  ExecutionStrategy,
  Priority,
  RiskLevel
} from '../../../../public/shared/types/plan-types';
import { RiskAssessment, Risk } from '../../domain/value-objects/risk-assessment.value-object';
import { Timeline } from '../../domain/value-objects/timeline.value-object';
import { PlanConfiguration } from '../../domain/value-objects/plan-configuration.value-object';
import {
  PlanTask,
  PlanDependency
} from '../../types';

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
   * 命名转换：驼峰命名 → 下划线命名
   * @param plan 领域实体
   * @returns 持久化实体
   */
  toPersistence(plan: Plan): PlanEntity {
    const planObject = plan.toObject();

    const planEntity = new PlanEntity();
    // 基础属性映射：驼峰 → 下划线
    planEntity.plan_id = planObject.planId;
    planEntity.context_id = planObject.contextId;
    planEntity.name = planObject.name;
    planEntity.description = planObject.description;
    planEntity.status = planObject.status;
    planEntity.version = planObject.version;
    planEntity.created_at = new Date(planObject.createdAt);
    planEntity.updated_at = new Date(planObject.updatedAt);

    // 复杂属性映射
    planEntity.goals = planObject.goals;
    planEntity.tasks = planObject.tasks as Record<string, unknown>[];
    planEntity.dependencies = planObject.dependencies as Record<string, unknown>[];
    planEntity.execution_strategy = planObject.executionStrategy as ExecutionStrategy;
    planEntity.priority = planObject.priority as Priority;
    planEntity.estimated_duration = planObject.estimatedDuration;

    // Progress映射：驼峰 → 下划线
    planEntity.progress = {
      completed_tasks: planObject.progress.completedTasks,
      total_tasks: planObject.progress.totalTasks,
      percentage: planObject.progress.percentage
    };

    // Timeline映射：处理milestones类型转换
    planEntity.timeline = planObject.timeline ? {
      start_date: planObject.timeline.start_date,
      end_date: planObject.timeline.end_date,
      milestones: planObject.timeline.milestones as unknown as Record<string, unknown>[],
      critical_path: planObject.timeline.critical_path
    } : undefined;

    planEntity.configuration = planObject.configuration as Record<string, unknown>;
    planEntity.metadata = planObject.metadata;

    // 风险评估映射：处理类型转换
    planEntity.risk_assessment = planObject.riskAssessment ? {
      overall_risk_level: (planObject.riskAssessment as unknown as RiskAssessment).overall_risk_level || 'low',
      risks: ((planObject.riskAssessment as unknown as RiskAssessment).risks || []) as unknown as Record<string, unknown>[],
      last_assessed: (planObject.riskAssessment as unknown as RiskAssessment).last_assessed || new Date().toISOString()
    } : undefined;

    return planEntity;
  }
  
  /**
   * 将持久化实体转换为领域实体
   * 命名转换：下划线命名 → 驼峰命名
   * @param planEntity 持久化实体
   * @returns 领域实体
   */
  toDomain(planEntity: PlanEntity): Plan {
    return this.planFactoryService.createPlan({
      // 基础属性映射：下划线 → 驼峰
      planId: planEntity.plan_id,
      contextId: planEntity.context_id,
      name: planEntity.name,
      description: planEntity.description,
      status: planEntity.status,
      version: planEntity.version,
      createdAt: planEntity.created_at.toISOString(),
      updatedAt: planEntity.updated_at.toISOString(),

      // 复杂属性映射
      goals: planEntity.goals,
      tasks: planEntity.tasks as unknown as PlanTask[],
      dependencies: planEntity.dependencies as unknown as PlanDependency[],
      executionStrategy: planEntity.execution_strategy,
      priority: planEntity.priority,
      estimatedDuration: planEntity.estimated_duration,

      timeline: planEntity.timeline as unknown as Timeline,
      configuration: planEntity.configuration as unknown as PlanConfiguration,
      metadata: planEntity.metadata,

      // 风险评估映射
      riskAssessment: planEntity.risk_assessment ? {
        overall_risk_level: planEntity.risk_assessment.overall_risk_level as RiskLevel,
        risks: (planEntity.risk_assessment.risks || []) as unknown as Risk[],
        last_assessed: planEntity.risk_assessment.last_assessed
      } as RiskAssessment : undefined
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