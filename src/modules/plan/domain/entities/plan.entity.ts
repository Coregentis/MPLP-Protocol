/**
 * Plan领域实体
 * 
 * @description Plan模块的核心领域实体，包含智能任务规划的业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 与Context模块使用IDENTICAL的DDD实体模式
 */

import { 
  PlanEntityData,
  PlanTaskData,
  PlanMetadata
} from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
import { generateUUID } from '../../../../shared/utils';

/**
 * Plan领域实体
 * 
 * @description 封装Plan的业务逻辑和不变量，实现智能任务规划协调功能
 * @pattern 与Context模块使用IDENTICAL的实体封装模式
 */
export class PlanEntity {
  private data: PlanEntityData;

  constructor(data: Partial<PlanEntityData>) {
    this.data = this.initializeData(data);
    this.validateInvariants();
  }

  // ===== 访问器方法 =====

  get planId(): UUID {
    return this.data.planId;
  }

  get contextId(): UUID {
    return this.data.contextId;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get status(): 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed' {
    return this.data.status;
  }

  get priority(): 'critical' | 'high' | 'medium' | 'low' | undefined {
    return this.data.priority;
  }

  get protocolVersion(): string {
    return this.data.protocolVersion;
  }

  get timestamp(): Date {
    return this.data.timestamp;
  }

  get tasks(): PlanTaskData[] {
    return this.data.tasks;
  }

  get metadata(): PlanMetadata | undefined {
    return this.data.metadata;
  }

  get createdAt(): Date | undefined {
    return this.data.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.data.updatedAt;
  }

  get createdBy(): string | undefined {
    return this.data.createdBy;
  }

  get updatedBy(): string | undefined {
    return this.data.updatedBy;
  }

  // ===== 业务逻辑方法 =====

  /**
   * 激活计划
   * @returns 如果状态发生变化则返回true
   */
  activate(): boolean {
    if (this.data.status === 'draft' || this.data.status === 'paused') {
      this.data.status = 'active';
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 暂停计划
   * @returns 如果状态发生变化则返回true
   */
  pause(): boolean {
    if (this.data.status === 'active') {
      this.data.status = 'paused';
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 完成计划
   * @returns 如果状态发生变化则返回true
   */
  complete(): boolean {
    if (this.data.status === 'active') {
      this.data.status = 'completed';
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 取消计划
   * @returns 如果状态发生变化则返回true
   */
  cancel(): boolean {
    if (this.data.status !== 'completed' && this.data.status !== 'cancelled') {
      this.data.status = 'cancelled';
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 添加任务
   * @param task 要添加的任务
   */
  addTask(task: Omit<PlanTaskData, 'taskId'>): void {
    const newTask: PlanTaskData = {
      ...task,
      taskId: generateUUID()
    };
    this.data.tasks.push(newTask);
    this.data.updatedAt = new Date();
  }

  /**
   * 移除任务
   * @param taskId 要移除的任务ID
   * @returns 如果任务被移除则返回true
   */
  removeTask(taskId: UUID): boolean {
    const initialLength = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(task => task.taskId !== taskId);
    
    if (this.data.tasks.length < initialLength) {
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param status 新状态
   * @returns 如果任务状态被更新则返回true
   */
  updateTaskStatus(
    taskId: UUID, 
    status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped'
  ): boolean {
    const task = this.data.tasks.find(t => t.taskId === taskId);
    if (task && task.status !== status) {
      task.status = status;
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 获取计划进度
   * @returns 计划完成百分比 (0-100)
   */
  getProgress(): number {
    if (this.data.tasks.length === 0) {
      return 0;
    }
    
    const completedTasks = this.data.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / this.data.tasks.length) * 100);
  }

  /**
   * 检查计划是否可以执行
   * @returns 如果计划可以执行则返回true
   */
  canExecute(): boolean {
    return this.data.status === 'approved' || this.data.status === 'active';
  }

  /**
   * 更新元数据
   * @param metadata 新的元数据
   */
  updateMetadata(metadata: Partial<PlanMetadata>): void {
    this.data.metadata = { ...this.data.metadata, ...metadata };
    this.data.updatedAt = new Date();
  }

  /**
   * 获取实体数据的副本
   * @returns 实体数据的深拷贝
   */
  toData(): PlanEntityData {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * 更新实体数据
   * @param updates 要更新的数据
   */
  update(updates: Partial<PlanEntityData>): void {
    // 保护不可变字段
    const { planId: _planId, contextId: _contextId, protocolVersion: _protocolVersion, timestamp: _timestamp, createdAt: _createdAt, createdBy: _createdBy, ...allowedUpdates } = updates;
    
    Object.assign(this.data, allowedUpdates, {
      updatedAt: new Date()
    });
    
    this.validateInvariants();
  }

  // ===== 私有方法 =====

  /**
   * 初始化实体数据
   * @param data 输入数据
   * @returns 完整的实体数据
   */
  private initializeData(data: Partial<PlanEntityData>): PlanEntityData {
    const now = new Date();

    // 验证必需字段在设置默认值之前
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Plan name is required and cannot be empty');
    }

    return {
      protocolVersion: data.protocolVersion || '1.0.0',
      timestamp: data.timestamp || now,
      planId: data.planId || generateUUID(),
      contextId: data.contextId || generateUUID(),
      name: data.name,
      description: data.description,
      status: data.status || 'draft',
      priority: data.priority || 'medium',
      tasks: data.tasks || [],
      dependencies: data.dependencies || [],
      milestones: data.milestones || [],
      timeline: data.timeline,
      optimization: data.optimization,
      riskAssessment: data.riskAssessment,
      failureResolver: data.failureResolver,
      configuration: data.configuration,
      metadata: data.metadata,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      createdBy: data.createdBy || 'system',
      updatedBy: data.updatedBy || 'system',
      
      // 必需的横切关注点字段
      auditTrail: data.auditTrail || {
        enabled: true,
        retentionDays: 90
      },
      monitoringIntegration: data.monitoringIntegration || {
        enabled: true,
        supportedProviders: ['prometheus', 'grafana']
      },
      performanceMetrics: data.performanceMetrics || {
        enabled: true,
        collectionIntervalSeconds: 60
      },
      versionHistory: data.versionHistory || {
        enabled: true,
        maxVersions: 10
      },
      searchMetadata: data.searchMetadata || {
        enabled: true,
        indexingStrategy: 'full_text'
      },
      cachingPolicy: data.cachingPolicy || {
        enabled: true,
        cacheStrategy: 'lru'
      },
      eventIntegration: data.eventIntegration || {
        enabled: true
      }
    };
  }

  /**
   * 验证实体不变量
   * @throws Error 如果不变量被违反
   */
  private validateInvariants(): void {
    if (!this.data.planId) {
      throw new Error('Plan ID is required');
    }
    
    if (!this.data.contextId) {
      throw new Error('Context ID is required');
    }
    
    if (!this.data.name || this.data.name.trim().length === 0) {
      throw new Error('Plan name is required and cannot be empty');
    }
    
    if (this.data.name.length > 255) {
      throw new Error('Plan name cannot exceed 255 characters');
    }
    
    if (this.data.description && this.data.description.length > 2000) {
      throw new Error('Plan description cannot exceed 2000 characters');
    }
    
    // 验证任务ID的唯一性
    const taskIds = this.data.tasks.map(task => task.taskId);
    const uniqueTaskIds = new Set(taskIds);
    if (taskIds.length !== uniqueTaskIds.size) {
      throw new Error('Task IDs must be unique within a plan');
    }
  }
}
