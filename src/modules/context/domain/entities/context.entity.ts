/**
 * Context领域实体
 * 
 * @description Context模块的核心领域实体，包含业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 */

import { 
  ContextEntityData,
  ContextStatus,
  LifecycleStage,
  SharedState,
  AccessControl,
  Configuration,
  AuditTrail
} from '../../types';
import { UUID, Timestamp } from '../../../../shared/types';
import { generateUUID, getCurrentTimestamp } from '../../../../shared/utils';

/**
 * Context领域实体
 * 
 * @description 封装Context的业务逻辑和不变量
 */
export class ContextEntity {
  private data: ContextEntityData;

  constructor(data: Partial<ContextEntityData>) {
    this.data = this.initializeData(data);
    this.validateInvariants();
  }

  // ===== 访问器方法 =====

  get contextId(): UUID {
    return this.data.contextId;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get status(): ContextStatus {
    return this.data.status;
  }

  get lifecycleStage(): LifecycleStage {
    return this.data.lifecycleStage;
  }

  get protocolVersion(): string {
    return this.data.protocolVersion;
  }

  get timestamp(): Timestamp {
    return this.data.timestamp;
  }

  get sharedState(): SharedState {
    const defaultState: SharedState = {
      variables: {},
      resources: { allocated: {}, limits: {} },
      dependencies: [],
      goals: []
    };

    if (!this.data.sharedState) return defaultState;

    return {
      variables: this.data.sharedState.variables || {},
      resources: this.data.sharedState.resources || { allocated: {}, limits: {} },
      dependencies: this.data.sharedState.dependencies || [],
      goals: this.data.sharedState.goals || []
    };
  }

  get accessControl(): AccessControl {
    const defaultAccess: AccessControl = {
      owner: { userId: '', role: '' },
      permissions: []
    };

    if (!this.data.accessControl) return defaultAccess;

    return {
      owner: this.data.accessControl.owner || { userId: '', role: '' },
      permissions: this.data.accessControl.permissions || [],
      policies: this.data.accessControl.policies
    };
  }

  get configuration(): Configuration {
    const defaultConfig: Configuration = {
      timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
      persistence: { enabled: true, storageBackend: 'memory' }
    };

    if (!this.data.configuration) return defaultConfig;

    return {
      timeoutSettings: this.data.configuration.timeoutSettings || { defaultTimeout: 30000, maxTimeout: 300000 },
      persistence: this.data.configuration.persistence || { enabled: true, storageBackend: 'memory' },
      notificationSettings: this.data.configuration.notificationSettings
    };
  }

  get auditTrail(): AuditTrail {
    return this.data.auditTrail;
  }

  get createdAt(): Date | undefined {
    return this.data.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.data.updatedAt;
  }

  get version(): string | undefined {
    return this.data.version;
  }

  get tags(): string[] | undefined {
    return this.data.tags;
  }

  // ===== 业务方法 =====

  /**
   * 更新Context名称
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Context name cannot be empty');
    }
    if (newName.length > 255) {
      throw new Error('Context name cannot exceed 255 characters');
    }

    this.data.name = newName.trim();
    this.updateTimestamp();
  }

  /**
   * 更新Context描述
   */
  updateDescription(newDescription?: string): void {
    if (newDescription && newDescription.length > 1000) {
      throw new Error('Context description cannot exceed 1000 characters');
    }

    this.data.description = newDescription;
    this.updateTimestamp();
  }

  /**
   * 更改Context状态
   */
  changeStatus(newStatus: ContextStatus): void {
    if (!this.isValidStatusTransition(this.data.status, newStatus)) {
      throw new Error(`Invalid status transition from ${this.data.status} to ${newStatus}`);
    }

    this.data.status = newStatus;
    this.updateTimestamp();
  }

  /**
   * 推进生命周期阶段
   */
  advanceLifecycleStage(newStage: LifecycleStage): void {
    if (!this.isValidLifecycleTransition(this.data.lifecycleStage, newStage)) {
      throw new Error(`Invalid lifecycle transition from ${this.data.lifecycleStage} to ${newStage}`);
    }

    this.data.lifecycleStage = newStage;
    this.updateTimestamp();
  }

  /**
   * 更新共享状态
   */
  updateSharedState(updates: Partial<SharedState>): void {
    this.data.sharedState = {
      ...this.data.sharedState,
      ...updates
    };
    this.updateTimestamp();
  }

  /**
   * 更新访问控制
   */
  updateAccessControl(updates: Partial<AccessControl>): void {
    this.data.accessControl = {
      ...this.data.accessControl,
      ...updates
    };
    this.updateTimestamp();
  }

  /**
   * 更新配置
   */
  updateConfiguration(updates: Partial<Configuration>): void {
    this.data.configuration = {
      ...this.data.configuration,
      ...updates
    };
    this.updateTimestamp();
  }

  /**
   * 检查是否可以删除
   */
  canBeDeleted(): boolean {
    return this.data.status === 'terminated' || this.data.status === 'completed';
  }

  /**
   * 检查是否处于活动状态
   */
  isActive(): boolean {
    return this.data.status === 'active';
  }

  /**
   * 获取完整数据
   */
  toData(): ContextEntityData {
    return { ...this.data };
  }

  // ===== 私有方法 =====

  /**
   * 初始化数据
   */
  private initializeData(data: Partial<ContextEntityData>): ContextEntityData {
    const now = getCurrentTimestamp();
    
    return {
      protocolVersion: data.protocolVersion || '1.0.0',
      timestamp: data.timestamp || now,
      contextId: data.contextId || generateUUID(),
      name: data.name || 'Unnamed Context',
      description: data.description,
      status: data.status || 'active',
      lifecycleStage: data.lifecycleStage || 'planning',
      sharedState: data.sharedState || {
        variables: {},
        resources: { allocated: {}, limits: {} },
        dependencies: [],
        goals: []
      },
      accessControl: data.accessControl || {
        owner: { userId: 'system', role: 'admin' },
        permissions: []
      },
      configuration: data.configuration || {
        timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
        persistence: { enabled: true, storageBackend: 'memory' }
      },
      auditTrail: data.auditTrail || {
        enabled: true,
        retentionDays: 90,
        auditEvents: []
      },
      monitoringIntegration: data.monitoringIntegration || { enabled: false },
      performanceMetrics: data.performanceMetrics || { enabled: false },
      versionHistory: data.versionHistory || { enabled: false, maxVersions: 10 },
      searchMetadata: data.searchMetadata || { enabled: false, indexingStrategy: 'basic' },
      cachingPolicy: data.cachingPolicy || { enabled: false, cacheStrategy: 'lru' },
      syncConfiguration: data.syncConfiguration || { enabled: false, syncStrategy: 'manual' },
      errorHandling: data.errorHandling || { enabled: true, errorPolicies: [] },
      integrationEndpoints: data.integrationEndpoints || { enabled: false },
      eventIntegration: data.eventIntegration || { enabled: false }
    };
  }

  /**
   * 验证不变量
   */
  private validateInvariants(): void {
    if (!this.data.contextId) {
      throw new Error('Context ID is required');
    }
    if (!this.data.name || this.data.name.trim().length === 0) {
      throw new Error('Context name is required');
    }
    if (this.data.name.length > 255) {
      throw new Error('Context name cannot exceed 255 characters');
    }
    if (this.data.description && this.data.description.length > 1000) {
      throw new Error('Context description cannot exceed 1000 characters');
    }
  }

  /**
   * 更新Context数据
   */
  update(updateData: Partial<ContextEntityData>): ContextEntity {
    const updatedData = {
      ...this.data,
      ...updateData,
      timestamp: getCurrentTimestamp()
    };

    return new ContextEntity(updatedData);
  }

  /**
   * 更新时间戳
   */
  private updateTimestamp(): void {
    this.data.timestamp = getCurrentTimestamp();
  }

  /**
   * 验证状态转换
   */
  private isValidStatusTransition(from: ContextStatus, to: ContextStatus): boolean {
    const validTransitions: Record<ContextStatus, ContextStatus[]> = {
      'active': ['suspended', 'completed', 'terminated'],
      'suspended': ['active', 'terminated'],
      'completed': ['terminated'],
      'terminated': [] // 终态，不能转换
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * 验证生命周期转换
   */
  private isValidLifecycleTransition(from: LifecycleStage, to: LifecycleStage): boolean {
    const validTransitions: Record<LifecycleStage, LifecycleStage[]> = {
      'planning': ['executing'],
      'executing': ['monitoring', 'completed'],
      'monitoring': ['executing', 'completed'],
      'completed': [] // 终态，不能转换
    };

    return validTransitions[from]?.includes(to) || false;
  }
}
