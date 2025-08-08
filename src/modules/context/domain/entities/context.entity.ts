/**
 * Context实体
 * 
 * 领域实体，代表上下文的核心业务对象
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, EntityStatus } from '../../../../public/shared/types';
import { ContextLifecycleStage } from '../../../../public/shared/types/context-types';
import { SharedState, Dependency, Goal, Resource } from '../value-objects/shared-state';
import { AccessControl, Action } from '../value-objects/access-control';

/**
 * Context实体类
 * 包含上下文的核心属性和领域行为
 */
export class Context {
  constructor(
    public readonly contextId: UUID,
    public name: string,
    public description: string | null,
    public lifecycleStage: ContextLifecycleStage,
    public status: EntityStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public sessionIds: UUID[] = [],
    public sharedStateIds: UUID[] = [],
    public configuration: Record<string, unknown> = {},
    public metadata: Record<string, unknown> = {},
    public sharedState?: SharedState,
    public accessControl?: AccessControl
  ) {}

  /**
   * 激活上下文
   * @returns 如果状态发生变化则返回true
   */
  activate(): boolean {
    if (this.status === EntityStatus.SUSPENDED) {
      this.status = EntityStatus.ACTIVE;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 暂停上下文
   * @returns 如果状态发生变化则返回true
   */
  suspend(): boolean {
    if (this.status === EntityStatus.ACTIVE) {
      this.status = EntityStatus.SUSPENDED;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 终止上下文
   * @returns 如果状态发生变化则返回true
   */
  terminate(): boolean {
    if (this.status !== EntityStatus.DELETED) {
      this.status = EntityStatus.DELETED;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 更新上下文的基本信息
   */
  update(name?: string, description?: string | null): void {
    let changed = false;

    if (name !== undefined && name !== this.name) {
      this.name = name;
      changed = true;
    }

    if (description !== undefined && description !== this.description) {
      this.description = description;
      changed = true;
    }

    if (changed) {
      this.updatedAt = new Date();
    }
  }

  /**
   * 更新上下文的生命周期阶段
   */
  updateLifecycleStage(stage: ContextLifecycleStage): boolean {
    if (stage !== this.lifecycleStage) {
      this.lifecycleStage = stage;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 添加会话ID
   */
  addSessionId(sessionId: UUID): boolean {
    if (!this.sessionIds.includes(sessionId)) {
      this.sessionIds.push(sessionId);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 移除会话ID
   */
  removeSessionId(sessionId: UUID): boolean {
    const initialLength = this.sessionIds.length;
    this.sessionIds = this.sessionIds.filter(id => id !== sessionId);
    
    if (this.sessionIds.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 添加共享状态ID
   */
  addSharedStateId(sharedStateId: UUID): boolean {
    if (!this.sharedStateIds.includes(sharedStateId)) {
      this.sharedStateIds.push(sharedStateId);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 移除共享状态ID
   */
  removeSharedStateId(sharedStateId: UUID): boolean {
    const initialLength = this.sharedStateIds.length;
    this.sharedStateIds = this.sharedStateIds.filter(id => id !== sharedStateId);
    
    if (this.sharedStateIds.length !== initialLength) {
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 更新配置
   */
  updateConfiguration(config: Record<string, unknown>): void {
    this.configuration = {
      ...this.configuration,
      ...config
    };
    this.updatedAt = new Date();
  }

  /**
   * 更新元数据
   */
  updateMetadata(meta: Record<string, unknown>): void {
    this.metadata = {
      ...this.metadata,
      ...meta
    };
    this.updatedAt = new Date();
  }

  /**
   * 更新共享状态
   */
  updateSharedState(sharedState: SharedState): void {
    this.sharedState = sharedState;
    this.updatedAt = new Date();
  }

  /**
   * 更新访问控制
   */
  updateAccessControl(accessControl: AccessControl): void {
    this.accessControl = accessControl;
    this.updatedAt = new Date();
  }

  /**
   * 更新名称
   */
  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  /**
   * 更新描述
   */
  updateDescription(description: string | null): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * 获取共享状态变量
   */
  getSharedVariable(key: string): unknown {
    return this.sharedState?.variables[key];
  }

  /**
   * 设置共享状态变量
   */
  setSharedVariable(key: string, value: unknown): void {
    if (!this.sharedState) {
      this.sharedState = new SharedState({ [key]: value });
    } else {
      this.sharedState = this.sharedState.updateVariables({ [key]: value });
    }
    this.updatedAt = new Date();
  }

  /**
   * 检查访问权限
   */
  hasPermission(principal: string, resource: string, action: Action): boolean {
    if (!this.accessControl) {
      return false;
    }
    return this.accessControl.hasPermission(principal, resource, action);
  }

  /**
   * 获取所有依赖
   */
  getDependencies(): Dependency[] {
    return this.sharedState?.dependencies || [];
  }

  /**
   * 获取所有目标
   */
  getGoals(): Goal[] {
    return this.sharedState?.goals || [];
  }

  /**
   * 检查目标是否完成
   */
  isGoalAchieved(goalId: UUID): boolean {
    const goal = this.sharedState?.goals.find(g => g.id === goalId);
    return goal?.status === 'achieved';
  }

  /**
   * 获取资源分配状态
   */
  getResourceAllocation(resourceKey: string): Resource | undefined {
    return this.sharedState?.allocatedResources[resourceKey];
  }

  /**
   * 检查资源是否可用
   */
  isResourceAvailable(resourceKey: string): boolean {
    const resource = this.getResourceAllocation(resourceKey);
    return resource?.status === 'available';
  }

  /**
   * 创建Context的深拷贝
   */
  clone(): Context {
    return new Context(
      this.contextId,
      this.name,
      this.description,
      this.lifecycleStage,
      this.status,
      new Date(this.createdAt),
      new Date(this.updatedAt),
      [...this.sessionIds],
      [...this.sharedStateIds],
      JSON.parse(JSON.stringify(this.configuration)),
      JSON.parse(JSON.stringify(this.metadata)),
      this.sharedState,
      this.accessControl
    );
  }
}