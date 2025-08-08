/**
 * Plan工厂服务
 * 
 * 提供创建Plan实体及相关值对象的方法
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:05:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { v4 as uuidv4 } from 'uuid';
import { Plan } from '../entities/plan.entity';
import { PlanTask, PlanDependency } from '../../types';
import { PlanConfiguration, createDefaultPlanConfiguration } from '../value-objects/plan-configuration.value-object';
import { Timeline, createTimeline } from '../value-objects/timeline.value-object';
import { createPlanMilestone } from '../value-objects/plan-milestone.value-object';
import { RiskAssessment, createRiskAssessment, createRisk } from '../value-objects/risk-assessment.value-object';
import { UUID, Timestamp } from '../../../../public/shared/types';
import {
  PlanStatus,
  ExecutionStrategy,
  Priority,
  TaskStatus,
  DependencyType,
  RiskLevel
} from '../../types';
import { MilestoneStatus, RiskCategory, RiskStatus } from '../../../../public/shared/types/plan-types';

/**
 * Plan工厂服务
 */
export class PlanFactoryService {
  /**
   * 创建Plan实体
   */
  createPlan(params: {
    planId?: UUID;
    contextId: UUID;
    name: string;
    description: string;
    status?: PlanStatus;
    version?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    goals?: string[];
    tasks?: PlanTask[];
    dependencies?: PlanDependency[];
    executionStrategy?: ExecutionStrategy;
    priority?: Priority;
    estimatedDuration?: { value: number; unit: string };
    timeline?: Timeline;
    configuration?: PlanConfiguration;
    metadata?: Record<string, unknown>;
    riskAssessment?: RiskAssessment;
  }): Plan {
    const now = new Date().toISOString();
    
    return new Plan({
      planId: params.planId || uuidv4(),
      contextId: params.contextId,
      name: params.name,
      description: params.description,
      status: params.status || PlanStatus.DRAFT,
      version: params.version || '1.0.0',
      createdAt: params.createdAt || now,
      updatedAt: params.updatedAt || now,
      goals: params.goals || [],
      tasks: params.tasks || [],
      dependencies: params.dependencies || [],
      executionStrategy: params.executionStrategy || ExecutionStrategy.SEQUENTIAL,
      priority: params.priority || Priority.MEDIUM,
      estimatedDuration: params.estimatedDuration ? {
        value: params.estimatedDuration.value,
        unit: params.estimatedDuration.unit as 'minutes' | 'hours' | 'days' | 'weeks'
      } : undefined,
      progress: {
        completedTasks: params.tasks ? params.tasks.filter(t => t.status === TaskStatus.COMPLETED).length : 0,
        totalTasks: params.tasks ? params.tasks.length : 0,
        percentage: params.tasks && params.tasks.length > 0
          ? Math.round((params.tasks.filter(t => t.status === TaskStatus.COMPLETED).length / params.tasks.length) * 100)
          : 0
      },
      timeline: params.timeline,
      configuration: params.configuration || createDefaultPlanConfiguration(),
      metadata: params.metadata,
      riskAssessment: params.riskAssessment ? {
        overallRiskLevel: RiskLevel.LOW,
        risks: []
      } : undefined
    });
  }
  
  /**
   * 创建PlanTask值对象
   */
  createTask(params: {
    taskId?: UUID;
    name: string;
    description: string;
    status?: TaskStatus;
    priority?: Priority;
    type?: string;
    parent_task_id?: UUID;
    estimated_effort?: { value: number; unit: string; confidence?: number };
    assignee?: { id: UUID; name: string; role?: string; assignment_time?: Timestamp };
    resource_requirements?: { resource_type: string; amount: number; unit?: string; mandatory: boolean }[];
    acceptance_criteria?: { id?: UUID; description: string; verified?: boolean; verified_at?: Timestamp; verified_by?: UUID }[];
    start_time?: Timestamp;
    end_time?: Timestamp;
    metadata?: Record<string, unknown>;
  }): PlanTask {
    return {
      taskId: params.taskId || uuidv4(),
      name: params.name,
      description: params.description,
      status: params.status,
      priority: params.priority,
      type: params.type,
      dependencies: [],
      estimatedDuration: params.estimated_effort ? {
        value: params.estimated_effort.value,
        unit: (params.estimated_effort.unit as 'minutes' | 'hours' | 'days' | 'weeks') || 'hours'
      } : undefined,
      actualDuration: undefined,
      progress: 0,
      resourceRequirements: params.resource_requirements?.map(req => ({
        resourceId: `resource-${Date.now()}-${Math.random()}`,
        type: req.resource_type,
        quantity: req.amount,
        unit: req.unit || 'units',
        mandatory: req.mandatory
      })),
      failureResolver: undefined,
      parameters: {},
      metadata: params.metadata
    };
  }
  
  /**
   * 创建PlanDependency值对象
   */
  createDependency(params: {
    dependencyId?: UUID;
    sourceTaskId: UUID;
    targetTaskId: UUID;
    type?: DependencyType;
    lagTimeMs?: number;
    condition?: string;
    metadata?: Record<string, unknown>;
  }): PlanDependency {
    return {
      dependencyId: params.dependencyId || uuidv4(),
      sourceTaskId: params.sourceTaskId,
      targetTaskId: params.targetTaskId,
      type: params.type || DependencyType.FINISH_TO_START,
      lagTimeMs: params.lagTimeMs,
      condition: params.condition,
      metadata: params.metadata
    };
  }
  
  /**
   * 创建Timeline值对象
   */
  createTimeline(params: {
    startDate: Timestamp;
    endDate: Timestamp;
    milestones?: {
      milestoneId?: UUID;
      name: string;
      description?: string;
      dueDate: Timestamp;
      status?: string;
      relatedTasks?: UUID[];
    }[];
    criticalPath?: UUID[];
  }): Timeline {
    return createTimeline({
      start_date: params.startDate,
      end_date: params.endDate,
      milestones: params.milestones?.map(m => createPlanMilestone({
        milestone_id: m.milestoneId || uuidv4(),
        name: m.name,
        description: m.description,
        due_date: m.dueDate,
        status: m.status as MilestoneStatus,
        related_tasks: m.relatedTasks
      })),
      critical_path: params.criticalPath
    });
  }
  
  /**
   * 创建RiskAssessment值对象
   */
  createRiskAssessment(params: {
    risks: {
      risk_id?: UUID;
      name: string;
      description: string;
      category: string;
      likelihood: number;
      impact: number;
      status?: string;
      mitigation_strategy?: string;
      related_tasks?: UUID[];
    }[];
    last_assessed?: Timestamp;
  }): RiskAssessment {
    return createRiskAssessment({
      risks: params.risks.map(r => createRisk({
        risk_id: r.risk_id || uuidv4(),
        name: r.name,
        description: r.description,
        category: r.category as RiskCategory,
        likelihood: r.likelihood,
        impact: r.impact,
        status: r.status as RiskStatus,
        mitigation_strategy: r.mitigation_strategy,
        related_tasks: r.related_tasks
      })),
      last_assessed: params.last_assessed
    });
  }
} 