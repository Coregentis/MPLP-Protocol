/**
 * Extension实体
 *
 * @description Extension模块的核心聚合根，封装扩展管理的所有业务逻辑
 * @version 1.0.0
 * @layer Domain层 - 实体
 * @pattern DDD聚合根 + 业务逻辑封装
 */
import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus, ExtensionCompatibility, ExtensionConfiguration, ExtensionPoint, ApiExtension, EventSubscription, ExtensionLifecycle, ExtensionSecurity, ExtensionMetadata, AuditTrail, ExtensionPerformanceMetrics, MonitoringIntegration, VersionHistory, SearchMetadata, EventIntegration } from '../../types';
/**
 * Extension实体类
 * 作为扩展管理的聚合根，封装所有扩展相关的业务逻辑
 */
export declare class ExtensionEntity {
    readonly extensionId: UUID;
    readonly contextId: UUID;
    readonly protocolVersion: string;
    private _name;
    private _displayName;
    private _description;
    private _version;
    private _extensionType;
    private _status;
    private _timestamp;
    private _compatibility;
    private _configuration;
    private _extensionPoints;
    private _apiExtensions;
    private _eventSubscriptions;
    private _lifecycle;
    private _security;
    private _metadata;
    private _auditTrail;
    private _performanceMetrics;
    private _monitoringIntegration;
    private _versionHistory;
    private _searchMetadata;
    private _eventIntegration;
    /**
     * 构造函数
     * @param data - 扩展实体数据
     */
    constructor(data: ExtensionEntityData);
    get name(): string;
    get displayName(): string;
    get description(): string;
    get version(): string;
    get extensionType(): ExtensionType;
    get status(): ExtensionStatus;
    get timestamp(): string;
    get compatibility(): ExtensionCompatibility;
    get configuration(): ExtensionConfiguration;
    get extensionPoints(): ExtensionPoint[];
    get apiExtensions(): ApiExtension[];
    get eventSubscriptions(): EventSubscription[];
    get lifecycle(): ExtensionLifecycle;
    get security(): ExtensionSecurity;
    get metadata(): ExtensionMetadata;
    get auditTrail(): AuditTrail;
    get performanceMetrics(): ExtensionPerformanceMetrics;
    get monitoringIntegration(): MonitoringIntegration;
    get versionHistory(): VersionHistory;
    get searchMetadata(): SearchMetadata;
    get eventIntegration(): EventIntegration;
    /**
     * 激活扩展
     * @param userId - 操作用户ID
     * @returns 是否激活成功
     */
    activate(userId?: string): boolean;
    /**
     * 停用扩展
     * @param userId - 操作用户ID
     * @returns 是否停用成功
     */
    deactivate(userId?: string): boolean;
    /**
     * 标记扩展为错误状态
     * @param error - 错误信息
     * @param userId - 操作用户ID
     */
    markAsError(error?: string, userId?: string): void;
    /**
     * 验证扩展的有效性
     * @returns 是否有效
     */
    validate(): boolean;
    /**
     * 更新扩展配置
     * @param newConfig - 新的配置
     * @param userId - 操作用户ID
     */
    updateConfiguration(newConfig: Record<string, unknown>, userId?: string): void;
    /**
     * 更新扩展版本
     * @param newVersion - 新版本号
     * @param changelog - 变更日志
     * @param userId - 操作用户ID
     */
    updateVersion(newVersion: string, changelog: string, userId?: string): void;
    /**
     * 添加扩展点
     * @param extensionPoint - 扩展点定义
     * @param userId - 操作用户ID
     */
    addExtensionPoint(extensionPoint: ExtensionPoint, userId?: string): void;
    /**
     * 移除扩展点
     * @param extensionPointId - 扩展点ID
     * @param userId - 操作用户ID
     */
    removeExtensionPoint(extensionPointId: string, userId?: string): void;
    /**
     * 更新性能指标
     * @param metrics - 新的性能指标
     */
    updatePerformanceMetrics(metrics: Partial<ExtensionPerformanceMetrics>): void;
    /**
     * 检查扩展是否处于活动状态
     */
    isActive(): boolean;
    /**
     * 检查扩展是否有错误
     */
    hasError(): boolean;
    /**
     * 检查扩展是否兼容当前MPLP版本
     */
    isCompatible(): boolean;
    /**
     * 获取扩展的健康状态
     */
    getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy';
    /**
     * 检查是否有特定类型的扩展点
     * @param type - 扩展点类型
     */
    hasExtensionPointType(type: string): boolean;
    /**
     * 获取特定类型的扩展点
     * @param type - 扩展点类型
     */
    getExtensionPointsByType(type: string): ExtensionPoint[];
    /**
     * 转换为数据对象
     * @returns 扩展实体数据
     */
    toData(): ExtensionEntityData;
    /**
     * 验证必需字段
     */
    private validateRequiredFields;
    /**
     * 验证配置
     */
    private validateConfiguration;
    /**
     * 验证版本格式
     */
    private isValidVersion;
    /**
     * 检查是否为破坏性变更
     */
    private isBreakingChange;
    /**
     * 计算健康状态
     */
    private calculateHealthStatus;
    /**
     * 添加审计事件
     */
    private addAuditEvent;
}
//# sourceMappingURL=extension.entity.d.ts.map