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
import { PlanTask } from '../value-objects/plan-task.value-object';
import { PlanDependency } from '../value-objects/plan-dependency.value-object';
import { PlanConfiguration, createDefaultPlanConfiguration } from '../value-objects/plan-configuration.value-object';
import { Timeline, createTimeline } from '../value-objects/timeline.value-object';
import { PlanMilestone, createPlanMilestone } from '../value-objects/plan-milestone.value-object';
import { RiskAssessment, Risk, createRiskAssessment, createRisk } from '../value-objects/risk-assessment.value-object';
import { 
  UUID, 
  Timestamp, 
  PlanStatus, 
  ExecutionStrategy, 
  Priority, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  DependencyType, 
  DependencyCriticality, 
  MilestoneStatus,
  RiskCategory,
  RiskStatus
} from '../../../../public/shared/types/plan-types';

/**
 * Plan工厂服务
 */
export class PlanFactoryService {
  /**
   * 创建Plan实体
   */
  createPlan(params: {
    plan_id?: UUID;
    context_id: UUID;
    name: string;
    description: string;
    status?: PlanStatus;
    version?: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
    goals?: string[];
    tasks?: PlanTask[];
    dependencies?: PlanDependency[];
    execution_strategy?: ExecutionStrategy;
    priority?: Priority;
    estimated_duration?: { value: number; unit: string };
    timeline?: Timeline;
    configuration?: PlanConfiguration;
    metadata?: Record<string, unknown>;
    risk_assessment?: RiskAssessment;
  }): Plan {
    const now = new Date().toISOString();
    
    return new Plan({
      plan_id: params.plan_id || uuidv4(),
      context_id: params.context_id,
      name: params.name,
      description: params.description,
      status: params.status || 'draft',
      version: params.version || '1.0.0',
      created_at: params.created_at || now,
      updated_at: params.updated_at || now,
      goals: params.goals || [],
      tasks: params.tasks || [],
      dependencies: params.dependencies || [],
      execution_strategy: params.execution_strategy || 'sequential',
      priority: params.priority || 'normal',
      estimated_duration: params.estimated_duration,
      progress: {
        completed_tasks: params.tasks ? params.tasks.filter(t => t.status === 'completed').length : 0,
        total_tasks: params.tasks ? params.tasks.length : 0,
        percentage: params.tasks && params.tasks.length > 0 
          ? Math.round((params.tasks.filter(t => t.status === 'completed').length / params.tasks.length) * 100) 
          : 0
      },
      timeline: params.timeline,
      configuration: params.configuration || createDefaultPlanConfiguration(),
      metadata: params.metadata,
      risk_assessment: params.risk_assessment
    });
  }
  
  /**
   * 创建PlanTask值对象
   */
  createTask(params: {
    task_id?: UUID;
    name: string;
    description: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    type?: TaskType;
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
      task_id: params.task_id || uuidv4(),
      name: params.name,
      description: params.description,
      status: params.status || 'pending',
      priority: params.priority || 'medium',
      type: params.type || 'atomic',
      parent_task_id: params.parent_task_id,
      estimated_effort: params.estimated_effort ? {
        estimated_hours: params.estimated_effort.value,
        complexity: (params.estimated_effort.confidence && params.estimated_effort.confidence > 0.8) ? 'low' :
                   (params.estimated_effort.confidence && params.estimated_effort.confidence > 0.5) ? 'medium' : 'high'
      } : undefined,
      assignee: params.assignee ? {
        user_id: params.assignee.id,
        name: params.assignee.name,
        role: params.assignee.role
      } : undefined,
      resource_requirements: params.resource_requirements?.map(req => ({
        resource_type: req.resource_type,
        quantity: req.amount,
        unit: req.unit || 'units',
        mandatory: req.mandatory
      })),
      acceptance_criteria: params.acceptance_criteria?.map(criteria => ({
        criterion_id: criteria.id || uuidv4(),
        description: criteria.description,
        is_met: criteria.verified || false,
        verified_at: criteria.verified_at,
        verified_by: criteria.verified_by
      })),
      start_time: params.start_time,
      end_time: params.end_time,
      metadata: params.metadata
    };
  }
  
  /**
   * 创建PlanDependency值对象
   */
  createDependency(params: {
    id?: UUID;
    source_task_id: UUID;
    target_task_id: UUID;
    dependency_type?: DependencyType;
    lag?: { value: number; unit: string };
    criticality?: DependencyCriticality;
    condition?: string;
  }): PlanDependency {
    return {
      id: params.id || uuidv4(),
      source_task_id: params.source_task_id,
      target_task_id: params.target_task_id,
      dependency_type: params.dependency_type || 'finish_to_start',
      lag: params.lag ? {
        value: params.lag.value,
        unit: (params.lag.unit as any) || 'hours'
      } : undefined,
      criticality: params.criticality || 'important',
      condition: params.condition
    };
  }
  
  /**
   * 创建Timeline值对象
   */
  createTimeline(params: {
    start_date: Timestamp;
    end_date: Timestamp;
    milestones?: {
      milestone_id?: UUID;
      name: string;
      description?: string;
      due_date: Timestamp;
      status?: MilestoneStatus;
      related_tasks?: UUID[];
    }[];
    critical_path?: UUID[];
  }): Timeline {
    return createTimeline({
      start_date: params.start_date,
      end_date: params.end_date,
      milestones: params.milestones?.map(m => createPlanMilestone({
        milestone_id: m.milestone_id || uuidv4(),
        name: m.name,
        description: m.description,
        due_date: m.due_date,
        status: m.status,
        related_tasks: m.related_tasks
      })),
      critical_path: params.critical_path
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
      category: RiskCategory;
      likelihood: number;
      impact: number;
      status?: RiskStatus;
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
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        status: r.status,
        mitigation_strategy: r.mitigation_strategy,
        related_tasks: r.related_tasks
      })),
      last_assessed: params.last_assessed
    });
  }
} 