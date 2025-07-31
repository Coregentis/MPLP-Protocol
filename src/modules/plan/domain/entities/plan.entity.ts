/**
 * Plan领域实体
 * 
 * 计划实体是Plan模块的核心领域对象，包含计划的所有属性和业务逻辑
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:15:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { PlanStatus, TaskStatus, ExecutionStrategy, Priority, UUID, Timestamp } from '../../../../public/shared/types/plan-types';
import { PlanTask } from '../value-objects/plan-task.value-object';
import { PlanDependency } from '../value-objects/plan-dependency.value-object';
import { PlanConfiguration } from '../value-objects/plan-configuration.value-object';
import { Timeline } from '../value-objects/timeline.value-object';
import { RiskAssessment } from '../value-objects/risk-assessment.value-object';

/**
 * Plan领域实体
 */
export class Plan {
  private _plan_id: UUID;
  private _context_id: UUID;
  private _name: string;
  private _description: string;
  private _status: PlanStatus;
  private _version: string;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;
  private _goals: string[];
  private _tasks: PlanTask[];
  private _dependencies: PlanDependency[];
  private _execution_strategy: ExecutionStrategy;
  private _priority: Priority;
  private _estimated_duration?: { value: number; unit: string };
  private _progress: {
    completed_tasks: number;
    total_tasks: number;
    percentage: number;
  };
  private _timeline?: Timeline;
  private _configuration: PlanConfiguration;
  private _metadata?: Record<string, unknown>;
  private _risk_assessment?: RiskAssessment;

  constructor(params: {
    plan_id: UUID;
    context_id: UUID;
    name: string;
    description: string;
    status: PlanStatus;
    version: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    goals: string[];
    tasks: PlanTask[];
    dependencies: PlanDependency[];
    execution_strategy: ExecutionStrategy;
    priority: Priority;
    estimated_duration?: { value: number; unit: string };
    progress: {
      completed_tasks: number;
      total_tasks: number;
      percentage: number;
    };
    timeline?: Timeline;
    configuration: PlanConfiguration;
    metadata?: Record<string, unknown>;
    risk_assessment?: RiskAssessment;
  }) {
    this._plan_id = params.plan_id;
    this._context_id = params.context_id;
    this._name = params.name;
    this._description = params.description;
    this._status = params.status;
    this._version = params.version;
    this._created_at = params.created_at;
    this._updated_at = params.updated_at;
    this._goals = params.goals;
    this._tasks = params.tasks;
    this._dependencies = params.dependencies;
    this._execution_strategy = params.execution_strategy;
    this._priority = params.priority;
    this._estimated_duration = params.estimated_duration;
    this._progress = params.progress;
    this._timeline = params.timeline;
    this._configuration = params.configuration;
    this._metadata = params.metadata;
    this._risk_assessment = params.risk_assessment;
  }

  // ===== 获取器 =====

  get plan_id(): UUID {
    return this._plan_id;
  }

  get context_id(): UUID {
    return this._context_id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get status(): PlanStatus {
    return this._status;
  }

  get version(): string {
    return this._version;
  }

  get created_at(): Timestamp {
    return this._created_at;
  }

  get updated_at(): Timestamp {
    return this._updated_at;
  }

  get goals(): string[] {
    return [...this._goals];
  }

  get tasks(): PlanTask[] {
    return [...this._tasks];
  }

  get dependencies(): PlanDependency[] {
    return [...this._dependencies];
  }

  get execution_strategy(): ExecutionStrategy {
    return this._execution_strategy;
  }

  get priority(): Priority {
    return this._priority;
  }

  get estimated_duration(): { value: number; unit: string } | undefined {
    return this._estimated_duration ? { ...this._estimated_duration } : undefined;
  }

  get progress(): { completed_tasks: number; total_tasks: number; percentage: number } {
    return { ...this._progress };
  }

  get timeline(): Timeline | undefined {
    return this._timeline ? { ...this._timeline } : undefined;
  }

  get configuration(): PlanConfiguration {
    return { ...this._configuration };
  }

  get metadata(): Record<string, unknown> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  get risk_assessment(): RiskAssessment | undefined {
    return this._risk_assessment ? { ...this._risk_assessment } : undefined;
  }

  // ===== 业务方法 =====

  /**
   * 更新计划状态
   * @param newStatus 新状态
   * @returns 成功或失败
   */
  updateStatus(newStatus: PlanStatus): boolean {
    // 验证状态转换是否有效
    if (!this.isValidStatusTransition(this._status, newStatus)) {
      return false;
    }

    this._status = newStatus;
    this._updated_at = new Date().toISOString();
    return true;
  }

  /**
   * 添加任务
   * @param task 任务
   */
  addTask(task: PlanTask): void {
    // 检查任务ID是否已存在
    if (this._tasks.some(t => t.task_id === task.task_id)) {
      throw new Error(`Task with ID ${task.task_id} already exists`);
    }

    this._tasks.push(task);
    this._updated_at = new Date().toISOString();
    this.recalculateProgress();
  }

  /**
   * 更新任务
   * @param taskId 任务ID
   * @param updates 更新内容
   * @returns 成功或失败
   */
  updateTask(taskId: UUID, updates: Partial<PlanTask>): boolean {
    const taskIndex = this._tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    // 如果更新包含状态，验证状态转换是否有效
    if (updates.status && !this.isValidTaskStatusTransition(this._tasks[taskIndex].status, updates.status)) {
      return false;
    }

    // 更新任务
    this._tasks[taskIndex] = {
      ...this._tasks[taskIndex],
      ...updates
    };

    this._updated_at = new Date().toISOString();
    this.recalculateProgress();
    return true;
  }

  /**
   * 添加依赖关系
   * @param dependency 依赖关系
   * @returns 成功或失败
   */
  addDependency(dependency: PlanDependency): boolean {
    // 检查依赖的任务是否存在
    const sourceTaskExists = this._tasks.some(t => t.task_id === dependency.source_task_id);
    const targetTaskExists = this._tasks.some(t => t.task_id === dependency.target_task_id);

    if (!sourceTaskExists || !targetTaskExists) {
      return false;
    }

    // 检查是否已存在相同的依赖
    if (this._dependencies.some(d => 
      d.source_task_id === dependency.source_task_id && 
      d.target_task_id === dependency.target_task_id)) {
      return false;
    }

    // 检查是否会形成循环依赖
    if (this.wouldFormCycle(dependency)) {
      return false;
    }

    this._dependencies.push(dependency);
    this._updated_at = new Date().toISOString();
    return true;
  }

  /**
   * 更新配置
   * @param updates 配置更新
   */
  updateConfiguration(updates: Partial<PlanConfiguration>): void {
    this._configuration = {
      ...this._configuration,
      ...updates
    };
    this._updated_at = new Date().toISOString();
  }

  /**
   * 更新计划元数据
   * @param updates 元数据更新
   */
  updateMetadata(updates: Record<string, unknown>): void {
    this._metadata = {
      ...this._metadata || {},
      ...updates
    };
    this._updated_at = new Date().toISOString();
  }

  /**
   * 更新风险评估
   * @param assessment 风险评估
   */
  updateRiskAssessment(assessment: RiskAssessment): void {
    this._risk_assessment = assessment;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 计算计划进度
   */
  recalculateProgress(): void {
    const total = this._tasks.length;
    const completed = this._tasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this._progress = {
      completed_tasks: completed,
      total_tasks: total,
      percentage
    };
  }

  /**
   * 判断计划是否可执行
   * @returns 是否可执行及原因
   */
  isExecutable(): { executable: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // 检查状态
    if (this._status !== 'active' && this._status !== 'approved') {
      reasons.push(`Plan status must be 'active' or 'approved', current status: ${this._status}`);
    }

    // 检查是否有任务
    if (this._tasks.length === 0) {
      reasons.push('Plan has no tasks');
    }

    // 检查是否有无效依赖
    const invalidDeps = this.validateDependencies();
    if (invalidDeps.length > 0) {
      reasons.push(`Plan has invalid dependencies: ${invalidDeps.join(', ')}`);
    }

    return {
      executable: reasons.length === 0,
      reasons
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 验证状态转换是否有效
   * @param from 当前状态
   * @param to 目标状态
   * @returns 是否有效
   */
  private isValidStatusTransition(from: PlanStatus, to: PlanStatus): boolean {
    // 有效的状态转换映射
    const validTransitions: Record<PlanStatus, PlanStatus[]> = {
      draft: ['active', 'cancelled', 'approved'],
      approved: ['active', 'cancelled'],
      active: ['paused', 'completed', 'cancelled', 'failed'],
      paused: ['active', 'cancelled'],
      completed: ['archived'],
      cancelled: ['archived'],
      failed: ['draft', 'active'],
      archived: []
    };
    
    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * 验证任务状态转换是否有效
   * @param from 当前状态
   * @param to 目标状态
   * @returns 是否有效
   */
  private isValidTaskStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    // 有效的状态转换映射
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      pending: ['in_progress', 'blocked', 'cancelled', 'skipped', 'ready'],
      in_progress: ['completed', 'failed', 'blocked', 'cancelled', 'pending_intervention'],
      blocked: ['in_progress', 'cancelled', 'skipped', 'ready'],
      completed: [],
      failed: ['pending', 'in_progress', 'skipped', 'cancelled'],
      skipped: [],
      cancelled: [],
      ready: ['in_progress', 'blocked', 'cancelled'],
      pending_intervention: ['in_progress', 'failed', 'cancelled']
    };
    
    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * 检查添加依赖是否会形成循环
   * @param newDep 新依赖
   * @returns 是否会形成循环
   */
  private wouldFormCycle(newDep: PlanDependency): boolean {
    // 创建依赖图
    const graph: Record<string, string[]> = {};
    
    // 初始化图
    this._tasks.forEach(task => {
      graph[task.task_id] = [];
    });
    
    // 添加现有依赖
    this._dependencies.forEach(dep => {
      graph[dep.source_task_id].push(dep.target_task_id);
    });
    
    // 添加新依赖
    graph[newDep.source_task_id].push(newDep.target_task_id);
    
    // 检查是否有循环
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string): boolean => {
      // 如果节点在递归栈中，说明有循环
      if (recursionStack.has(node)) {
        return true;
      }
      
      // 如果节点已访问且不在递归栈中，说明这条路径没有循环
      if (visited.has(node)) {
        return false;
      }
      
      // 标记节点为已访问并添加到递归栈
      visited.add(node);
      recursionStack.add(node);
      
      // 检查所有邻居
      for (const neighbor of graph[node]) {
        if (hasCycle(neighbor)) {
          return true;
        }
      }
      
      // 从递归栈中移除节点
      recursionStack.delete(node);
      return false;
    };
    
    // 检查每个节点
    for (const node of Object.keys(graph)) {
      if (!visited.has(node) && hasCycle(node)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 验证依赖关系
   * @returns 无效依赖的错误信息
   */
  private validateDependencies(): string[] {
    const errors: string[] = [];
    
    // 检查每个依赖
    this._dependencies.forEach(dep => {
      // 检查源任务是否存在
      if (!this._tasks.some(t => t.task_id === dep.source_task_id)) {
        errors.push(`Source task ${dep.source_task_id} does not exist`);
      }
      
      // 检查目标任务是否存在
      if (!this._tasks.some(t => t.task_id === dep.target_task_id)) {
        errors.push(`Target task ${dep.target_task_id} does not exist`);
      }
      
      // 检查源和目标是否相同
      if (dep.source_task_id === dep.target_task_id) {
        errors.push(`Self-dependency detected: ${dep.source_task_id}`);
      }
    });
    
    return errors;
  }

  /**
   * 转换为普通对象
   */
  toObject() {
    return {
      plan_id: this._plan_id,
      context_id: this._context_id,
      name: this._name,
      description: this._description,
      status: this._status,
      version: this._version,
      created_at: this._created_at,
      updated_at: this._updated_at,
      goals: [...this._goals],
      tasks: this._tasks.map(task => ({ ...task })),
      dependencies: this._dependencies.map(dep => ({ ...dep })),
      execution_strategy: this._execution_strategy,
      priority: this._priority,
      estimated_duration: this._estimated_duration ? { ...this._estimated_duration } : undefined,
      progress: { ...this._progress },
      timeline: this._timeline ? { ...this._timeline } : undefined,
      configuration: { ...this._configuration },
      metadata: this._metadata ? { ...this._metadata } : undefined,
      risk_assessment: this._risk_assessment ? { ...this._risk_assessment } : undefined
    };
  }
} 