/**
 * Context实体 - MPLP v1.0 基于完整Schema的14个功能域
 *
 * 领域实体，代表上下文的核心业务对象
 * 支持完整的mplp-context.json Schema
 * 兼容测试期望的构造函数和方法
 *
 * @version 1.0.0
 * @updated 2025-08-15
 */

import { UUID } from '../../../../public/shared/types';
import { ContextEntityData } from '../../api/mappers/context.mapper';
import { EntityStatus, ContextStatus } from '../../types';

/**
 * Context实体类 - MPLP v1.0
 * 包含14个功能域的完整上下文管理
 * 遵循MPLP双重命名约定：实体层使用camelCase
 * 兼容测试期望的接口
 */
export class Context {
  // 基础协议字段
  private readonly _contextId: UUID;
  private _name: string;
  private _description?: string;
  private _lifecycleStage: string | undefined;
  private _status: EntityStatus;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _sessionIds: UUID[];
  private _sharedStateIds: UUID[];
  private _configuration: Record<string, unknown>;
  private _metadata: Record<string, unknown>;

  // 14个功能域 (保持向后兼容)
  private _sharedState?: ContextEntityData['sharedState'];
  private _accessControl?: ContextEntityData['accessControl'];
  private _auditTrail?: ContextEntityData['auditTrail'];
  private _monitoringIntegration?: ContextEntityData['monitoringIntegration'];
  private _performanceMetrics?: ContextEntityData['performanceMetrics'];
  private _versionHistory?: ContextEntityData['versionHistory'];
  private _searchMetadata?: ContextEntityData['searchMetadata'];
  private _cachingPolicy?: ContextEntityData['cachingPolicy'];
  private _syncConfiguration?: ContextEntityData['syncConfiguration'];
  private _errorHandling?: ContextEntityData['errorHandling'];
  private _integrationEndpoints?: ContextEntityData['integrationEndpoints'];
  private _eventIntegration?: ContextEntityData['eventIntegration'];

  // 支持测试期望的构造函数
  constructor(
    contextId: UUID,
    name: string,
    description?: string,
    lifecycleStage?: string,
    status?: EntityStatus,
    createdAt?: Date,
    updatedAt?: Date,
    sessionIds?: UUID[],
    sharedStateIds?: UUID[],
    configuration?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  );

  // 支持原有的数据对象构造函数
  constructor(data: ContextEntityData);

  // 实际构造函数实现
  constructor(
    contextIdOrData: UUID | ContextEntityData,
    name?: string,
    description?: string,
    lifecycleStage?: string,
    status?: EntityStatus,
    createdAt?: Date,
    updatedAt?: Date,
    sessionIds?: UUID[],
    sharedStateIds?: UUID[],
    configuration?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ) {
    if (typeof contextIdOrData === 'object') {
      // 使用数据对象构造
      const data = contextIdOrData as ContextEntityData;
      this._contextId = data.contextId;
      this._name = data.name;
      this._description = data.description;
      this._lifecycleStage = data.lifecycleStage;
      this._status = data.status as EntityStatus;
      this._createdAt = data.timestamp;
      this._updatedAt = data.timestamp;
      this._sessionIds = [];
      this._sharedStateIds = [];
      this._configuration = {};
      this._metadata = {};

      // 14个功能域
      this._sharedState = data.sharedState;
      this._accessControl = data.accessControl;
      this._auditTrail = data.auditTrail;
      this._monitoringIntegration = data.monitoringIntegration;
      this._performanceMetrics = data.performanceMetrics;
      this._versionHistory = data.versionHistory;
      this._searchMetadata = data.searchMetadata;
      this._cachingPolicy = data.cachingPolicy;
      this._syncConfiguration = data.syncConfiguration;
      this._errorHandling = data.errorHandling;
      this._integrationEndpoints = data.integrationEndpoints;
      this._eventIntegration = data.eventIntegration;
    } else {
      // 使用参数构造
      this._contextId = contextIdOrData;
      this._name = name!;
      this._description = description;
      this._lifecycleStage = lifecycleStage;
      this._status = status !== undefined ? status : ContextStatus.ACTIVE;
      this._createdAt = createdAt || new Date();
      this._updatedAt = updatedAt || new Date();
      this._sessionIds = sessionIds || [];
      this._sharedStateIds = sharedStateIds || [];
      this._configuration = configuration || {};
      this._metadata = metadata || {};
    }
  }

  // ===== 基础协议字段访问器 =====

  get contextId(): UUID {
    return this._contextId;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updatedAt = new Date();
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(value: string | undefined) {
    this._description = value;
    this._updatedAt = new Date();
  }

  get status(): EntityStatus {
    return this._status;
  }

  set status(value: EntityStatus) {
    this._status = value;
    this._updatedAt = new Date();
  }

  get lifecycleStage(): string | undefined {
    return this._lifecycleStage;
  }

  set lifecycleStage(value: string | undefined) {
    this._lifecycleStage = value;
    this._updatedAt = new Date();
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get protocolVersion(): string {
    return '1.0.0'; // MPLP协议版本
  }

  get timestamp(): Date {
    return this._updatedAt; // 使用更新时间作为时间戳
  }

  get sessionIds(): UUID[] {
    return this._sessionIds;
  }

  set sessionIds(value: UUID[]) {
    this._sessionIds = value;
    this._updatedAt = new Date();
  }

  get sharedStateIds(): UUID[] {
    return this._sharedStateIds;
  }

  set sharedStateIds(value: UUID[]) {
    this._sharedStateIds = value;
    this._updatedAt = new Date();
  }

  get configuration(): Record<string, unknown> {
    return this._configuration;
  }

  set configuration(value: Record<string, unknown>) {
    this._configuration = value;
    this._updatedAt = new Date();
  }

  get metadata(): Record<string, unknown> {
    return this._metadata;
  }

  set metadata(value: Record<string, unknown>) {
    this._metadata = value;
    this._updatedAt = new Date();
  }

  // 14个功能域的getter方法
  get auditTrail(): NonNullable<ContextEntityData['auditTrail']> {
    return this._auditTrail || {
      enabled: true,
      retentionDays: 30,
      auditEvents: []
    };
  }

  set auditTrail(value: ContextEntityData['auditTrail']) {
    this._auditTrail = value;
    this._updatedAt = new Date();
  }

  get monitoringIntegration(): NonNullable<ContextEntityData['monitoringIntegration']> {
    return this._monitoringIntegration || {
      enabled: true,
      supportedProviders: ['prometheus'],
      exportFormats: ['json']
    };
  }

  set monitoringIntegration(value: ContextEntityData['monitoringIntegration']) {
    this._monitoringIntegration = value;
    this._updatedAt = new Date();
  }

  get performanceMetrics(): NonNullable<ContextEntityData['performanceMetrics']> {
    return this._performanceMetrics || {
      enabled: true,
      collectionIntervalSeconds: 60
    };
  }

  set performanceMetrics(value: ContextEntityData['performanceMetrics']) {
    this._performanceMetrics = value;
    this._updatedAt = new Date();
  }

  get versionHistory(): NonNullable<ContextEntityData['versionHistory']> {
    return this._versionHistory || {
      enabled: true,
      maxVersions: 10,
      versions: []
    };
  }

  set versionHistory(value: ContextEntityData['versionHistory']) {
    this._versionHistory = value;
    this._updatedAt = new Date();
  }

  get searchMetadata(): NonNullable<ContextEntityData['searchMetadata']> {
    return this._searchMetadata || {
      enabled: true,
      indexingStrategy: 'full_text',
      searchableFields: ['context_id', 'context_name'],
      searchIndexes: []
    };
  }

  set searchMetadata(value: ContextEntityData['searchMetadata']) {
    this._searchMetadata = value;
    this._updatedAt = new Date();
  }

  get cachingPolicy(): NonNullable<ContextEntityData['cachingPolicy']> {
    return this._cachingPolicy || {
      enabled: true,
      cacheStrategy: 'lru',
      cacheLevels: []
    };
  }

  set cachingPolicy(value: ContextEntityData['cachingPolicy']) {
    this._cachingPolicy = value;
    this._updatedAt = new Date();
  }

  get syncConfiguration(): NonNullable<ContextEntityData['syncConfiguration']> {
    return this._syncConfiguration || {
      enabled: true,
      syncStrategy: 'real_time',
      syncTargets: []
    };
  }

  set syncConfiguration(value: ContextEntityData['syncConfiguration']) {
    this._syncConfiguration = value;
    this._updatedAt = new Date();
  }

  get errorHandling(): NonNullable<ContextEntityData['errorHandling']> {
    return this._errorHandling || {
      enabled: true,
      errorPolicies: []
    };
  }

  set errorHandling(value: ContextEntityData['errorHandling']) {
    this._errorHandling = value;
    this._updatedAt = new Date();
  }

  get integrationEndpoints(): NonNullable<ContextEntityData['integrationEndpoints']> {
    return this._integrationEndpoints || {
      enabled: true,
      webhooks: [],
      apiEndpoints: []
    };
  }

  set integrationEndpoints(value: ContextEntityData['integrationEndpoints']) {
    this._integrationEndpoints = value;
    this._updatedAt = new Date();
  }

  get eventIntegration(): NonNullable<ContextEntityData['eventIntegration']> {
    return this._eventIntegration || {
      enabled: true,
      publishedEvents: [],
      subscribedEvents: []
    };
  }

  set eventIntegration(value: ContextEntityData['eventIntegration']) {
    this._eventIntegration = value;
    this._updatedAt = new Date();
  }

  // ===== 14个功能域访问器 =====

  get sharedState(): ContextEntityData['sharedState'] | undefined {
    return this._sharedState;
  }

  set sharedState(value: ContextEntityData['sharedState'] | undefined) {
    this._sharedState = value;
    this.updateTimestamp();
  }

  get accessControl(): ContextEntityData['accessControl'] | undefined {
    return this._accessControl;
  }

  set accessControl(value: ContextEntityData['accessControl'] | undefined) {
    this._accessControl = value;
    this.updateTimestamp();
  }



  // ===== 领域方法 =====

  /**
   * 更新时间戳
   */
  private updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  /**
   * 激活上下文
   */
  public activate(): boolean {
    if (this._status === ContextStatus.SUSPENDED) {
      this._status = ContextStatus.ACTIVE;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 暂停上下文
   */
  public suspend(): boolean {
    if (this._status === ContextStatus.ACTIVE) {
      this._status = ContextStatus.SUSPENDED;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 添加会话ID
   */
  public addSessionId(sessionId: UUID): boolean {
    if (!this._sessionIds.includes(sessionId)) {
      this._sessionIds.push(sessionId);
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 移除会话ID
   */
  public removeSessionId(sessionId: UUID): boolean {
    const index = this._sessionIds.indexOf(sessionId);
    if (index > -1) {
      this._sessionIds.splice(index, 1);
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 更新配置
   */
  public updateConfiguration(configOrKey: Record<string, unknown> | string, value?: unknown): void {
    if (typeof configOrKey === 'object' && configOrKey !== null) {
      // 如果传入的是配置对象，合并到现有配置
      Object.assign(this._configuration, configOrKey);
    } else {
      // 如果传入的是key-value对
      this._configuration = { ...this._configuration, [configOrKey as string]: value };
    }
    this._updatedAt = new Date();
  }

  /**
   * 终止上下文
   */
  public terminate(): boolean {
    if (this._status !== ContextStatus.TERMINATED) {
      this._status = ContextStatus.TERMINATED;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 更新共享状态
   */
  public updateSharedState(sharedStateOrKey: Record<string, unknown> | string, value?: unknown): void {
    // 如果第一个参数是SharedState对象
    if (typeof sharedStateOrKey === 'object' && sharedStateOrKey !== null && !value) {
      // 假设SharedState对象有一个data属性或者直接是数据
      const sharedStateData = (sharedStateOrKey as Record<string, unknown>).data || sharedStateOrKey;

      // 如果没有共享状态，创建一个基本结构
      if (!this._sharedState) {
        this._sharedState = {
          variables: {},
          resources: {
            allocated: {},
            requirements: {}
          },
          dependencies: [],
          goals: []
        };
      }

      // 更新变量
      if (this._sharedState.variables && sharedStateData) {
        Object.assign(this._sharedState.variables, sharedStateData);
      }
    } else {
      // 传统的key-value更新方式
      const key = sharedStateOrKey as string;

      // 如果没有共享状态，创建一个基本结构
      if (!this._sharedState) {
        this._sharedState = {
          variables: {},
          resources: {
            allocated: {},
            requirements: {}
          },
          dependencies: [],
          goals: []
        };
      }

      if (this._sharedState.variables) {
        this._sharedState.variables[key] = value;
      }
    }

    this._updatedAt = new Date();
  }



  /**
   * 验证实体完整性
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证基础字段
    if (!this._contextId) errors.push('contextId is required');
    if (!this._name) errors.push('name is required');
    if (!this._status) errors.push('status is required');
    if (!this._lifecycleStage) errors.push('lifecycleStage is required');

    // 验证必需的功能域
    if (!this._sharedState) errors.push('sharedState is required');
    if (!this._accessControl) errors.push('accessControl is required');
    if (!this._configuration) errors.push('configuration is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 转换为数据对象（向后兼容）
   */
  toData(): ContextEntityData {
    return {
      protocolVersion: '1.0.0',
      timestamp: this._updatedAt,
      contextId: this._contextId,
      name: this._name,
      description: this._description,
      status: this._status,
      lifecycleStage: this._lifecycleStage || 'planning',
      sharedState: this._sharedState || {
        variables: {},
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      },
      accessControl: this._accessControl || {
        owner: { userId: 'system', role: 'admin' },
        permissions: []
      },
      configuration: {
        timeoutSettings: { defaultTimeout: 300, maxTimeout: 3600 },
        persistence: { enabled: true, storageBackend: 'memory' }
      },
      auditTrail: this._auditTrail || {
        enabled: true,
        retentionDays: 30,
        auditEvents: []
      },
      monitoringIntegration: this._monitoringIntegration || {
        enabled: true,
        supportedProviders: ['prometheus'],
        exportFormats: ['json']
      },
      performanceMetrics: this._performanceMetrics || {
        enabled: true,
        collectionIntervalSeconds: 60
      },
      versionHistory: this._versionHistory || {
        enabled: true,
        maxVersions: 10,
        versions: []
      },
      searchMetadata: this._searchMetadata || {
        enabled: true,
        indexingStrategy: 'auto',
        searchableFields: ['name', 'description'],
        searchIndexes: []
      },
      cachingPolicy: this._cachingPolicy || {
        enabled: true,
        cacheStrategy: 'lru',
        cacheLevels: []
      },
      syncConfiguration: this._syncConfiguration || {
        enabled: true,
        syncStrategy: 'push_pull',
        syncTargets: []
      },
      errorHandling: this._errorHandling || {
        enabled: true,
        errorPolicies: []
      },
      integrationEndpoints: this._integrationEndpoints || {
        enabled: true,
        webhooks: [],
        apiEndpoints: []
      },
      eventIntegration: this._eventIntegration || {
        enabled: true,
        publishedEvents: ['context_created', 'context_updated'],
        subscribedEvents: []
      }
    };
  }

  /**
   * 克隆实体
   */
  clone(): Context {
    return new Context(
      this._contextId,
      this._name,
      this._description,
      this._lifecycleStage,
      this._status,
      new Date(this._createdAt),
      new Date(this._updatedAt),
      [...this._sessionIds],
      [...this._sharedStateIds],
      { ...this._configuration },
      { ...this._metadata }
    );
  }
}
