/**
 * Plan领域实体
 * 
 * 计划实体是Plan模块的核心领域对象，包含计划的所有属性和业务逻辑
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:15:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
import {
  PlanStatus,
  TaskStatus,
  ExecutionStrategy,
  Priority,
  PlanTask,
  PlanDependency,
  Duration,
  RiskAssessment
} from '../../types';
import { PlanConfiguration } from '../value-objects/plan-configuration.value-object';
import { Timeline } from '../value-objects/timeline.value-object';

/**
 * Plan领域实体
 */
export class Plan {
  // Domain层使用camelCase命名约定 (DDD架构标准)
  private _planId: UUID;                    // 对应Schema: plan_id
  private _contextId: UUID;                 // 对应Schema: context_id
  private _name: string;                    // 对应Schema: name
  private _description: string;             // 对应Schema: description
  private _status: PlanStatus;              // 对应Schema: status
  private _version: string;                 // 对应Schema: version
  private _createdAt: Timestamp;            // 对应Schema: created_at
  private _updatedAt: Timestamp;            // 对应Schema: updated_at
  private _goals: string[];                 // 对应Schema: goals
  private _tasks: PlanTask[];               // 对应Schema: tasks
  private _dependencies: PlanDependency[];  // 对应Schema: dependencies
  private _executionStrategy: ExecutionStrategy; // 对应Schema: execution_strategy
  private _priority: Priority;              // 对应Schema: priority
  private _estimatedDuration?: Duration;    // 对应Schema: estimated_duration
  private _progress: {                      // 对应Schema: progress
    completedTasks: number;                 // camelCase for Domain layer
    totalTasks: number;
    percentage: number;
  };
  private _timeline?: Timeline;             // 对应Schema: timeline
  private _configuration: PlanConfiguration; // 对应Schema: configuration
  private _metadata?: Record<string, unknown>; // 对应Schema: metadata
  private _riskAssessment?: RiskAssessment; // 对应Schema: risk_assessment

    /**
   * 里程碑列表
   */
  public milestones?: unknown[];

  /**
   * 优化配置
   */
  public optimization?: Record<string, unknown>;

  /**
   * 失败解决器
   */
  public failureResolver?: Record<string, unknown>;

  /**
   * 创建者
   */
  public createdBy: string;

  /**
   * 更新者
   */
  public updatedBy?: string;

constructor(params: Record<string, unknown>) {
    // 验证必需字段
    this.validateRequiredFields(params);

    // 转换snake_case到camelCase参数
    const normalizedParams = this.normalizeParams(params);

    // Domain层属性赋值，使用camelCase
    this._planId = normalizedParams.planId;
    this._contextId = normalizedParams.contextId;
    this._name = normalizedParams.name;
    this._description = normalizedParams.description;
    this._status = normalizedParams.status;
    this._version = normalizedParams.version;
    this._createdAt = normalizedParams.createdAt;
    this._updatedAt = normalizedParams.updatedAt;
    this._goals = normalizedParams.goals;
    this._tasks = normalizedParams.tasks;
    this._dependencies = normalizedParams.dependencies;
    this._executionStrategy = normalizedParams.executionStrategy;
    this._priority = normalizedParams.priority;
    this._estimatedDuration = normalizedParams.estimatedDuration;
    this._progress = normalizedParams.progress;
    this._timeline = normalizedParams.timeline;
    this._configuration = normalizedParams.configuration;
    this._metadata = normalizedParams.metadata;
    this._riskAssessment = normalizedParams.riskAssessment;
    this.createdBy = normalizedParams.createdBy || 'system';
    this.updatedBy = normalizedParams.updatedBy;
  }

  /**
   * 验证必需字段
   */
  private validateRequiredFields(params: Record<string, unknown>): void {
    const planId = params.planId || params.plan_id;
    const contextId = params.contextId || params.context_id;
    const name = params.name;

    if (!planId) {
      throw new Error('Plan ID is required');
    }

    if (!contextId) {
      throw new Error('Context ID is required');
    }

    if (!name) {
      throw new Error('Plan name is required');
    }

    // 验证字段类型
    if (params.priority && !Object.values(Priority).includes(params.priority as Priority)) {
      throw new Error('Invalid priority value');
    }
  }

  /**
   * 标准化参数，支持snake_case到camelCase转换
   */
  private normalizeParams(params: Record<string, unknown>): {
    planId: UUID;
    contextId: UUID;
    name: string;
    description: string;
    status: PlanStatus;
    version: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    goals: string[];
    tasks: PlanTask[];
    dependencies: PlanDependency[];
    executionStrategy: ExecutionStrategy;
    priority: Priority;
    estimatedDuration?: Duration;
    progress: {
      completedTasks: number;
      totalTasks: number;
      percentage: number;
    };
    timeline?: Timeline;
    configuration: PlanConfiguration;
    metadata?: Record<string, unknown>;
    riskAssessment?: RiskAssessment;
    createdBy?: string;
    updatedBy?: string;
  } {
    const now = new Date().toISOString();

    return {
      planId: (params.planId || params.plan_id) as UUID,
      contextId: (params.contextId || params.context_id) as UUID,
      name: params.name as string,
      description: params.description as string,
      status: (params.status || PlanStatus.DRAFT) as PlanStatus,
      version: (params.version || '1.0.0') as string,
      createdAt: (params.createdAt || params.created_at || params.timestamp || now) as Timestamp,
      updatedAt: (params.updatedAt || params.updated_at || params.timestamp || now) as Timestamp,
      goals: (params.goals || []) as string[],
      tasks: (params.tasks || []) as PlanTask[],
      dependencies: (params.dependencies || []) as PlanDependency[],
      executionStrategy: (params.executionStrategy || params.execution_strategy || 'sequential') as ExecutionStrategy,
      priority: params.priority as Priority,
      estimatedDuration: (params.estimatedDuration || params.estimated_duration) as Duration,
      progress: this.normalizeProgress((params.progress as Record<string, unknown>) || {}),
      timeline: params.timeline as Timeline,
      configuration: (params.configuration || {}) as PlanConfiguration,
      metadata: params.metadata as Record<string, unknown>,
      riskAssessment: (params.riskAssessment || params.risk_assessment) as RiskAssessment,
      createdBy: (params.createdBy || params.created_by) as string,
      updatedBy: (params.updatedBy || params.updated_by) as string
    };
  }

  /**
   * 标准化progress对象
   */
  private normalizeProgress(progress: Record<string, unknown> | undefined): {
    completedTasks: number;
    totalTasks: number;
    percentage: number;
  } {
    if (!progress) {
      return {
        completedTasks: 0,
        totalTasks: 0,
        percentage: 0
      };
    }

    return {
      completedTasks: (progress.completedTasks || progress.completed_tasks || 0) as number,
      totalTasks: (progress.totalTasks || progress.total_tasks || 0) as number,
      percentage: (progress.percentage || 0) as number
    };
  }

  // ===== 获取器 =====

  get planId(): UUID {
    return this._planId;
  }

  get contextId(): UUID {
    return this._contextId;
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

  get createdAt(): Timestamp {
    return this._createdAt;
  }

  get updatedAt(): Timestamp {
    return this._updatedAt;
  }

  get goals(): string[] {
    return [...this._goals];
  }

  get tasks(): PlanTask[] {
    return [...this._tasks];
  }

  get dependencies(): (PlanDependency & { source_task_id: string; target_task_id: string })[] {
    return this._dependencies.map(dep => ({
      ...dep,
      source_task_id: dep.sourceTaskId,
      target_task_id: dep.targetTaskId
    }));
  }

  get executionStrategy(): ExecutionStrategy {
    return this._executionStrategy;
  }

  get priority(): Priority {
    return this._priority;
  }

  get estimatedDuration(): Duration | undefined {
    return this._estimatedDuration ? { ...this._estimatedDuration } : undefined;
  }

  get progress(): {
    completedTasks: number;
    totalTasks: number;
    percentage: number;
    // 兼容snake_case访问
    completed_tasks: number;
    total_tasks: number;
  } {
    return {
      ...this._progress,
      completed_tasks: this._progress.completedTasks,
      total_tasks: this._progress.totalTasks
    };
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

  get riskAssessment(): RiskAssessment | undefined {
    return this._riskAssessment ? { ...this._riskAssessment } : undefined;
  }

  // ===== Snake_case 兼容性获取器 (用于测试) =====

  get plan_id(): UUID {
    return this._planId;
  }

  get context_id(): UUID {
    return this._contextId;
  }

  get execution_strategy(): ExecutionStrategy {
    return this._executionStrategy;
  }

  get estimated_duration(): { value: number; unit: string } | undefined {
    return this._estimatedDuration;
  }

  get created_at(): Timestamp {
    return this._createdAt;
  }

  get updated_at(): Timestamp {
    return this._updatedAt;
  }

  get risk_assessment(): RiskAssessment | undefined {
    return this._riskAssessment ? { ...this._riskAssessment } : undefined;
  }



  // ===== 业务方法 =====

  /**
   * 更新计划状态
   * @param newStatus 新状态
   * @returns 成功或失败
   */
  updateStatus(newStatus: PlanStatus): { success: boolean; error?: string } {
    // 验证状态转换是否有效
    if (!this.isValidStatusTransition(this._status, newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${this._status} to ${newStatus}`
      };
    }

    this._status = newStatus;
    this._updatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * 添加任务
   * @param task 任务
   */
  addTask(task: PlanTask): { success: boolean; error?: string } {
    // 获取任务ID，支持两种字段名
    const taskId = task.taskId || (task as unknown as { task_id?: string }).task_id;

    if (!taskId) {
      return {
        success: false,
        error: 'Task ID is required'
      };
    }

    // 检查任务ID是否已存在
    if (this._tasks.some(t =>
      t.taskId === taskId || (t as unknown as { task_id?: string }).task_id === taskId
    )) {
      return {
        success: false,
        error: `Task with ID ${taskId} already exists`
      };
    }

    // 确保任务有正确的taskId字段，但不重复添加
    const normalizedTask: PlanTask = {
      ...task,
      taskId: taskId
    };

    // 如果原始任务使用task_id，移除taskId字段以避免重复
    if ((task as unknown as { task_id?: string }).task_id && !task.taskId) {
      delete (normalizedTask as unknown as { taskId?: string }).taskId;
    }

    this._tasks.push(normalizedTask);
    this._updatedAt = new Date().toISOString();
    this.recalculateProgress();

    return { success: true };
  }

  /**
   * 更新任务
   * @param taskId 任务ID
   * @param updates 更新内容
   * @returns 成功或失败
   */
  updateTask(taskId: UUID, updates: Partial<PlanTask>): { success: boolean; error?: string } {
    const taskIndex = this._tasks.findIndex(t =>
      t.taskId === taskId || (t as unknown as { task_id?: string }).task_id === taskId
    );
    if (taskIndex === -1) {
      return {
        success: false,
        error: `Task with ID ${taskId} not found`
      };
    }

    const currentTask = this._tasks[taskIndex];

    // 如果更新包含状态，验证状态转换是否有效
    if (updates.status && currentTask.status) {
      if (!this.isValidTaskStatusTransition(currentTask.status, updates.status)) {
        return {
          success: false,
          error: `Invalid task status transition from ${currentTask.status} to ${updates.status}`
        };
      }
    }

    // 更新任务，确保保持必要的字段
    this._tasks[taskIndex] = {
      ...currentTask,
      ...updates,
      // 确保taskId不被覆盖
      taskId: currentTask.taskId
    };

    this._updatedAt = new Date().toISOString();
    this.recalculateProgress();
    return { success: true };
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   * @returns 成功或失败
   */
  removeTask(taskId: UUID): { success: boolean; error?: string } {
    const taskIndex = this._tasks.findIndex(t =>
      t.taskId === taskId || (t as unknown as { task_id?: string }).task_id === taskId
    );
    if (taskIndex === -1) {
      return {
        success: false,
        error: `Task with ID ${taskId} not found`
      };
    }

    // 删除任务
    this._tasks.splice(taskIndex, 1);

    // 删除相关的依赖关系
    this._dependencies = this._dependencies.filter(dep =>
      dep.sourceTaskId !== taskId && dep.targetTaskId !== taskId
    );

    this._updatedAt = new Date().toISOString();
    this.recalculateProgress();
    return { success: true };
  }

  /**
   * 添加依赖关系
   * @param dependency 依赖关系
   * @returns 成功或失败
   */
  addDependency(dependency: PlanDependency): boolean {
    // 支持snake_case字段名
    const depWithSnakeCase = dependency as unknown as {
      source_task_id?: string;
      target_task_id?: string;
    };

    const sourceTaskId = dependency.sourceTaskId || depWithSnakeCase.source_task_id;
    const targetTaskId = dependency.targetTaskId || depWithSnakeCase.target_task_id;

    if (!sourceTaskId || !targetTaskId) {
      return false;
    }

    // 检查依赖的任务是否存在
    const sourceTaskExists = this._tasks.some(t => t.taskId === sourceTaskId);
    const targetTaskExists = this._tasks.some(t => t.taskId === targetTaskId);

    if (!sourceTaskExists || !targetTaskExists) {
      return false;
    }

    // 检查是否已存在相同的依赖
    if (this._dependencies.some(d =>
      d.sourceTaskId === sourceTaskId &&
      d.targetTaskId === targetTaskId)) {
      return false;
    }

    // 创建标准化的依赖对象
    const normalizedDependency: PlanDependency = {
      ...dependency,
      sourceTaskId: sourceTaskId,
      targetTaskId: targetTaskId
    };

    // 检查是否会形成循环依赖
    if (this.wouldFormCycle(normalizedDependency)) {
      return false;
    }

    this._dependencies.push(normalizedDependency);
    this._updatedAt = new Date().toISOString();
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
    this._updatedAt = new Date().toISOString();
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
    this._updatedAt = new Date().toISOString();
  }

  /**
   * 更新风险评估
   * @param assessment 风险评估
   */
  updateRiskAssessment(assessment: RiskAssessment): void {
    this._riskAssessment = assessment;
    this._updatedAt = new Date().toISOString();
  }

  /**
   * 计算计划进度
   */
  recalculateProgress(): void {
    const total = this._tasks.length;
    const completed = this._tasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this._progress = {
      completedTasks: completed,
      totalTasks: total,
      percentage
    };
  }

  /**
   * 判断计划是否可执行
   * @returns 是否可执行
   */
  isExecutable(): boolean {
    // 检查状态 - 允许ACTIVE和APPROVED状态执行
    if (this._status !== PlanStatus.ACTIVE && this._status !== PlanStatus.APPROVED) {
      return false;
    }

    // 检查是否有任务
    if (this._tasks.length === 0) {
      return false;
    }

    // 检查是否有无效依赖
    const invalidDeps = this.validateDependencies();
    if (invalidDeps.length > 0) {
      return false;
    }

    // 检查是否有循环依赖
    if (this.hasCyclicDependencies()) {
      return false;
    }

    return true;
  }

  /**
   * 计算计划的总估计时长
   * @returns 总时长（毫秒）
   */
  getTotalEstimatedDuration(): number {
    return this._tasks.reduce((total, task) => {
      // 支持两种字段名
      const estimatedDuration = task.estimatedDuration ||
                               (task as unknown as { estimated_duration?: number }).estimated_duration;

      if (typeof estimatedDuration === 'number') {
        return total + estimatedDuration;
      } else if (estimatedDuration && typeof estimatedDuration === 'object' && 'value' in estimatedDuration) {
        return total + (estimatedDuration as Duration).value;
      }

      return total;
    }, 0);
  }

  /**
   * 获取计划的任务统计
   * @returns 任务统计信息
   */
  getTaskStatistics(): {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
  } {
    const stats = {
      total: this._tasks.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0
    };

    this._tasks.forEach(task => {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.in_progress++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
        case TaskStatus.FAILED:
          stats.failed++;
          break;
      }
    });

    return stats;
  }

  /**
   * 验证任务依赖的有效性
   * @returns 验证结果
   */
  validateTaskDependencies(): { success: boolean; error?: string } {
    const errors = this.validateDependencies();
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join('; ')
      };
    }
    return { success: true };
  }

  /**
   * 支持计划的序列化
   * @returns JSON对象
   */
  toJSON(): Record<string, unknown> {
    return this.toObject();
  }

  /**
   * 支持计划的克隆
   * @returns 克隆的计划实例
   */
  clone(): Plan {
    return new Plan(this.toObject());
  }

  /**
   * 获取计划可执行性详情
   * @returns 是否可执行及原因
   */
  getExecutabilityDetails(): { executable: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // 检查状态 - 允许ACTIVE和APPROVED状态执行
    if (this._status !== PlanStatus.ACTIVE && this._status !== PlanStatus.APPROVED) {
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

    // 检查是否有循环依赖
    if (this.hasCyclicDependencies()) {
      reasons.push('Plan has cyclic dependencies');
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
      [PlanStatus.DRAFT]: [PlanStatus.APPROVED, PlanStatus.ACTIVE, PlanStatus.CANCELLED],
      [PlanStatus.APPROVED]: [PlanStatus.ACTIVE, PlanStatus.CANCELLED],
      [PlanStatus.ACTIVE]: [PlanStatus.PAUSED, PlanStatus.COMPLETED, PlanStatus.FAILED, PlanStatus.CANCELLED],
      [PlanStatus.PAUSED]: [PlanStatus.ACTIVE, PlanStatus.CANCELLED],
      [PlanStatus.COMPLETED]: [PlanStatus.ARCHIVED],
      [PlanStatus.FAILED]: [PlanStatus.DRAFT, PlanStatus.ACTIVE, PlanStatus.CANCELLED, PlanStatus.ARCHIVED],
      [PlanStatus.CANCELLED]: [PlanStatus.ARCHIVED],
      [PlanStatus.ARCHIVED]: [] // 归档状态是终态
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
      [TaskStatus.PENDING]: [TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.CANCELLED, TaskStatus.SKIPPED],
      [TaskStatus.READY]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.CANCELLED, TaskStatus.SKIPPED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.BLOCKED, TaskStatus.CANCELLED, TaskStatus.PENDING_INTERVENTION],
      [TaskStatus.COMPLETED]: [], // 完成状态是终态
      [TaskStatus.BLOCKED]: [TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED, TaskStatus.SKIPPED],
      [TaskStatus.FAILED]: [TaskStatus.PENDING, TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED, TaskStatus.SKIPPED],
      [TaskStatus.SKIPPED]: [], // 跳过状态是终态
      [TaskStatus.CANCELLED]: [], // 取消状态是终态
      [TaskStatus.PENDING_INTERVENTION]: [TaskStatus.READY, TaskStatus.IN_PROGRESS, TaskStatus.FAILED, TaskStatus.CANCELLED]
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
      const taskId = task.taskId || (task as unknown as { task_id?: string }).task_id;
      if (taskId) {
        graph[taskId] = [];
      }
    });

    // 添加现有依赖
    this._dependencies.forEach(dep => {
      const sourceId = dep.sourceTaskId || (dep as unknown as { source_task_id?: string }).source_task_id;
      const targetId = dep.targetTaskId || (dep as unknown as { target_task_id?: string }).target_task_id;

      if (sourceId && targetId && graph[sourceId]) {
        graph[sourceId].push(targetId);
      }
    });

    // 添加新依赖
    const newSourceId = newDep.sourceTaskId || (newDep as unknown as { source_task_id?: string }).source_task_id;
    const newTargetId = newDep.targetTaskId || (newDep as unknown as { target_task_id?: string }).target_task_id;

    if (newSourceId && newTargetId && graph[newSourceId]) {
      graph[newSourceId].push(newTargetId);
    }
    
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

    // 检查计划级别的依赖
    this._dependencies.forEach(dep => {
      const sourceId = dep.sourceTaskId || (dep as unknown as { source_task_id?: string }).source_task_id;
      const targetId = dep.targetTaskId || (dep as unknown as { target_task_id?: string }).target_task_id;

      if (!sourceId || !targetId) {
        errors.push(`Invalid dependency: missing source or target task ID`);
        return;
      }

      // 检查源任务是否存在
      if (!this._tasks.some(t =>
        t.taskId === sourceId || (t as unknown as { task_id?: string }).task_id === sourceId
      )) {
        errors.push(`Source task ${sourceId} does not exist`);
      }

      // 检查目标任务是否存在
      if (!this._tasks.some(t =>
        t.taskId === targetId || (t as unknown as { task_id?: string }).task_id === targetId
      )) {
        errors.push(`Target task ${targetId} does not exist`);
      }

      // 检查源和目标是否相同
      if (sourceId === targetId) {
        errors.push(`Self-dependency detected: ${sourceId}`);
      }
    });

    // 检查任务级别的依赖
    this._tasks.forEach(task => {
      const taskId = task.taskId || (task as unknown as { task_id?: string }).task_id;
      const dependencies = task.dependencies || (task as unknown as { dependencies?: string[] }).dependencies || [];

      if (taskId && dependencies.length > 0) {
        dependencies.forEach(depId => {
          // 检查依赖的任务是否存在
          if (!this._tasks.some(t =>
            t.taskId === depId || (t as unknown as { task_id?: string }).task_id === depId
          )) {
            errors.push(`Task ${taskId} depends on non-existent task: ${depId}`);
          }

          // 检查自依赖
          if (taskId === depId) {
            errors.push(`Self-dependency detected in task: ${taskId}`);
          }
        });
      }
    });

    return errors;
  }

  /**
   * 检查是否存在循环依赖
   * @returns 是否存在循环依赖
   */
  hasCyclicDependencies(): boolean {
    // 使用深度优先搜索检测循环
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    // 构建邻接表，基于任务的依赖关系
    const graph: Record<string, string[]> = {};

    // 初始化图
    this._tasks.forEach(task => {
      const taskId = task.taskId || (task as unknown as { task_id?: string }).task_id;
      if (taskId) {
        graph[taskId] = [];
      }
    });

    // 添加任务级别的依赖关系
    this._tasks.forEach(task => {
      const taskId = task.taskId || (task as unknown as { task_id?: string }).task_id;
      const dependencies = task.dependencies || (task as unknown as { dependencies?: string[] }).dependencies || [];

      if (taskId && dependencies.length > 0) {
        graph[taskId] = [...dependencies];
      }
    });

    // 添加计划级别的依赖关系
    this._dependencies.forEach(dep => {
      const sourceId = dep.sourceTaskId || (dep as unknown as { source_task_id?: string }).source_task_id;
      const targetId = dep.targetTaskId || (dep as unknown as { target_task_id?: string }).target_task_id;

      if (sourceId && targetId && graph[sourceId]) {
        graph[sourceId].push(targetId);
      }
    });

    // 对每个节点进行DFS
    for (const taskId of Object.keys(graph)) {
      if (this.hasCycleDFS(taskId, graph, visited, recursionStack)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 深度优先搜索检测循环
   * @param node 当前节点
   * @param graph 图
   * @param visited 已访问节点
   * @param recursionStack 递归栈
   * @returns 是否存在循环
   */
  private hasCycleDFS(
    node: string,
    graph: Record<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    if (recursionStack.has(node)) {
      return true; // 发现循环
    }

    if (visited.has(node)) {
      return false; // 已经访问过，没有循环
    }

    visited.add(node);
    recursionStack.add(node);

    // 访问所有邻居
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (this.hasCycleDFS(neighbor, graph, visited, recursionStack)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  /**
   * 转换为普通对象
   */
  toObject() {
    return {
      planId: this._planId,
      contextId: this._contextId,
      name: this._name,
      description: this._description,
      status: this._status,
      version: this._version,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      goals: [...this._goals],
      tasks: this._tasks.map(task => ({ ...task })),
      dependencies: this._dependencies.map(dep => ({ ...dep })),
      executionStrategy: this._executionStrategy,
      priority: this._priority,
      estimatedDuration: this._estimatedDuration ? { ...this._estimatedDuration } : undefined,
      progress: { ...this._progress },
      timeline: this._timeline ? { ...this._timeline } : undefined,
      configuration: { ...this._configuration },
      metadata: this._metadata ? { ...this._metadata } : undefined,
      riskAssessment: this._riskAssessment ? { ...this._riskAssessment } : undefined
    };
  }
} 