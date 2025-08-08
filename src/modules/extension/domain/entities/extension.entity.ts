/**
 * Extension领域实体
 * 
 * 扩展管理的核心领域实体，封装扩展业务逻辑和不变性约束
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp, Version } from '../../../../public/shared/types';
import { 
  ExtensionType, 
  ExtensionStatus, 
  ExtensionCompatibility,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionLifecycle,
  ExtensionSecurity,
  ExtensionMetadata
} from '../../types';

/**
 * Extension领域实体
 */
export class Extension {
  private _extension_id: UUID;
  private _context_id: UUID;
  private _protocol_version: Version;
  private _name: string;
  private _version: Version;
  private _type: ExtensionType;
  private _status: ExtensionStatus;
  private _display_name?: string;
  private _description?: string;
  private _compatibility?: ExtensionCompatibility;
  private _configuration?: ExtensionConfiguration;
  private _extension_points: ExtensionPoint[];
  private _api_extensions: ApiExtension[];
  private _event_subscriptions: EventSubscription[];
  private _lifecycle?: ExtensionLifecycle;
  private _security?: ExtensionSecurity;
  private _metadata?: ExtensionMetadata;
  private _timestamp: Timestamp;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;

    /**
   * 扩展类型
   */
  public extensionType: string;

constructor(
    extensionId: UUID,
    contextId: UUID,
    protocolVersion: Version,
    name: string,
    version: Version,
    type: ExtensionType,
    status: ExtensionStatus,
    timestamp: Timestamp,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    displayName?: string,
    description?: string,
    compatibility?: ExtensionCompatibility,
    configuration?: ExtensionConfiguration,
    extensionPoints: ExtensionPoint[] = [],
    apiExtensions: ApiExtension[] = [],
    eventSubscriptions: EventSubscription[] = [],
    lifecycle?: ExtensionLifecycle,
    security?: ExtensionSecurity,
    metadata?: ExtensionMetadata
  ) {
    this._extension_id = extensionId;
    this._context_id = contextId;
    this._protocol_version = protocolVersion;
    this._name = name;
    this._version = version;
    this._type = type;
    this._status = status;
    this._timestamp = timestamp;
    this._created_at = createdAt;
    this._updated_at = updatedAt;
    this._display_name = displayName;
    this._description = description;
    this._compatibility = compatibility;
    this._configuration = configuration;
    this._extension_points = extensionPoints;
    this._api_extensions = apiExtensions;
    this._event_subscriptions = eventSubscriptions;
    this._lifecycle = lifecycle;
    this._security = security;
    this._metadata = metadata;

    this.validateInvariants();
  }

  // Getters
  get extensionId(): UUID { return this._extension_id; }
  get contextId(): UUID { return this._context_id; }
  get protocolVersion(): Version { return this._protocol_version; }
  get name(): string { return this._name; }
  get version(): Version { return this._version; }
  get type(): ExtensionType { return this._type; }
  get status(): ExtensionStatus { return this._status; }
  get displayName(): string | undefined { return this._display_name; }
  get description(): string | undefined { return this._description; }
  get compatibility(): ExtensionCompatibility | undefined { return this._compatibility; }
  get configuration(): ExtensionConfiguration | undefined { return this._configuration; }
  get extensionPoints(): ExtensionPoint[] { return [...this._extension_points]; }
  get apiExtensions(): ApiExtension[] { return [...this._api_extensions]; }
  get eventSubscriptions(): EventSubscription[] { return [...this._event_subscriptions]; }
  get lifecycle(): ExtensionLifecycle | undefined { return this._lifecycle; }
  get security(): ExtensionSecurity | undefined { return this._security; }
  get metadata(): ExtensionMetadata | undefined { return this._metadata; }
  get timestamp(): Timestamp { return this._timestamp; }
  get createdAt(): Timestamp { return this._created_at; }
  get updatedAt(): Timestamp { return this._updated_at; }

  /**
   * 更新扩展状态
   */
  updateStatus(newStatus: ExtensionStatus): void {
    this.validateStatusTransition(this._status, newStatus);
    this._status = newStatus;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 激活扩展
   */
  activate(): void {
    if (this._status !== 'installed' && this._status !== 'inactive') {
      throw new Error(`无法激活状态为 ${this._status} 的扩展`);
    }
    this._status = 'active';
    this._updated_at = new Date().toISOString();
  }

  /**
   * 停用扩展
   */
  deactivate(): void {
    if (this._status !== 'active') {
      throw new Error(`无法停用状态为 ${this._status} 的扩展`);
    }
    this._status = 'inactive';
    this._updated_at = new Date().toISOString();
  }

  /**
   * 添加扩展点
   */
  addExtensionPoint(extensionPoint: ExtensionPoint): void {
    const exists = this._extension_points.some(ep => ep.name === extensionPoint.name);
    if (!exists) {
      this._extension_points.push(extensionPoint);
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 移除扩展点
   */
  removeExtensionPoint(pointName: string): void {
    const initialLength = this._extension_points.length;
    this._extension_points = this._extension_points.filter(ep => ep.name !== pointName);
    
    if (this._extension_points.length !== initialLength) {
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 添加API扩展
   */
  addApiExtension(apiExtension: ApiExtension): void {
    const exists = this._api_extensions.some(ae => ae.endpoint_id === apiExtension.endpoint_id);
    if (!exists) {
      this._api_extensions.push(apiExtension);
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 添加事件订阅
   */
  addEventSubscription(subscription: EventSubscription): void {
    const exists = this._event_subscriptions.some(es =>
      es.event_pattern === subscription.event_pattern && es.handler === subscription.handler
    );
    if (!exists) {
      this._event_subscriptions.push(subscription);
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 检查是否激活
   */
  isActive(): boolean {
    return this._status === 'active';
  }

  /**
   * 检查是否可以卸载
   */
  canUninstall(): boolean {
    return ['installed', 'inactive', 'disabled', 'error'].includes(this._status);
  }

  /**
   * 检查版本兼容性
   */
  isCompatibleWith(mplpVersion: string): boolean {
    if (!this._compatibility) return true;
    
    // 简化的版本兼容性检查
    return this._compatibility.mplp_version === mplpVersion || 
           this._compatibility.mplp_version === '*';
  }

  /**
   * 更新配置
   */
  updateConfiguration(config: ExtensionConfiguration): void {
    this._configuration = { ...this._configuration, ...config };
    this._updated_at = new Date().toISOString();
  }

  /**
   * 验证领域不变性
   */
  private validateInvariants(): void {
    if (!this._extension_id) {
      throw new Error('扩展ID不能为空');
    }
    if (!this._context_id) {
      throw new Error('上下文ID不能为空');
    }
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('扩展名称不能为空');
    }
    if (this._name.length > 100) {
      throw new Error('扩展名称不能超过100个字符');
    }
    if (!this._version) {
      throw new Error('扩展版本不能为空');
    }
  }

  /**
   * 验证状态转换的有效性
   */
  private validateStatusTransition(from: ExtensionStatus, to: ExtensionStatus): void {
    const validTransitions: Record<ExtensionStatus, ExtensionStatus[]> = {
      'installed': ['active', 'inactive', 'disabled', 'uninstalling'],
      'active': ['inactive', 'disabled', 'error', 'updating'],
      'inactive': ['active', 'disabled', 'uninstalling'],
      'disabled': ['inactive', 'uninstalling'],
      'error': ['inactive', 'disabled', 'uninstalling'],
      'updating': ['active', 'inactive', 'error'],
      'uninstalling': []
    };

    if (!validTransitions[from].includes(to)) {
      throw new Error(`无效的状态转换: ${from} -> ${to}`);
    }
  }

  /**
   * 转换为协议格式
   */
  toProtocol(): any {
    return {
      protocolVersion: this._protocol_version,
      timestamp: this._timestamp,
      extensionId: this._extension_id,
      contextId: this._context_id,
      name: this._name,
      version: this._version,
      type: this._type,
      status: this._status,
      displayName: this._display_name,
      description: this._description,
      compatibility: this._compatibility,
      configuration: this._configuration,
      extensionPoints: this._extension_points,
      apiExtensions: this._api_extensions,
      eventSubscriptions: this._event_subscriptions,
      lifecycle: this._lifecycle,
      security: this._security,
      metadata: this._metadata,
      createdAt: this._created_at,
      updatedAt: this._updated_at
    };
  }

  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: any): Extension {
    return new Extension(
      protocol.extensionId,
      protocol.contextId,
      protocol.protocolVersion,
      protocol.name,
      protocol.version,
      protocol.type,
      protocol.status,
      protocol.timestamp,
      protocol.createdAt,
      protocol.updatedAt,
      protocol.displayName,
      protocol.description,
      protocol.compatibility,
      protocol.configuration,
      protocol.extensionPoints || [],
      protocol.apiExtensions || [],
      protocol.eventSubscriptions || [],
      protocol.lifecycle,
      protocol.security,
      protocol.metadata
    );
  }
}
