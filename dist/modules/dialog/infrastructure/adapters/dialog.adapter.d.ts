/**
 * Dialog Infrastructure Adapter
 * @description Dialog模块基础设施适配器 - 外部系统集成预留接口
 * @version 1.0.0
 */
import { DialogEntity } from '../../domain/entities/dialog.entity';
import { DialogRepository } from '../../domain/repositories/dialog.repository';
import { type UUID } from '../../types';
/**
 * Dialog基础设施适配器类
 * 实现外部系统集成的预留接口
 */
export declare class DialogAdapter implements DialogRepository {
    readonly name = "dialog";
    readonly version = "1.0.0";
    private _initialized;
    private _dialogStorage;
    /**
     * 保存对话实体
     * @param dialog 对话实体
     * @returns 保存后的对话实体
     */
    save(dialog: DialogEntity): Promise<DialogEntity>;
    /**
     * 根据ID查找对话
     * @param id 对话ID
     * @returns 对话实体或null
     */
    findById(id: UUID): Promise<DialogEntity | null>;
    /**
     * 根据名称查找对话
     * @param _name 对话名称
     * @returns 对话实体数组
     */
    findByName(_name: string): Promise<DialogEntity[]>;
    /**
     * 根据参与者查找对话
     * @param _participantId 参与者ID
     * @returns 对话实体数组
     */
    findByParticipant(_participantId: string): Promise<DialogEntity[]>;
    /**
     * 获取所有对话
     * @param limit 限制数量
     * @param offset 偏移量
     * @returns 对话实体数组
     */
    findAll(limit?: number, offset?: number): Promise<DialogEntity[]>;
    /**
     * 更新对话实体
     * @param _id 对话ID
     * @param _dialog 更新的对话实体
     * @returns 更新后的对话实体
     */
    update(_id: UUID, _dialog: DialogEntity): Promise<DialogEntity>;
    /**
     * 删除对话
     * @param id 对话ID
     */
    delete(id: UUID): Promise<void>;
    /**
     * 检查对话是否存在
     * @param _id 对话ID
     * @returns 是否存在
     */
    exists(_id: UUID): Promise<boolean>;
    /**
     * 获取对话总数
     * @returns 对话总数
     */
    count(): Promise<number>;
    /**
     * 根据条件搜索对话
     * @param _criteria 搜索条件
     * @returns 对话实体数组
     */
    search(_criteria: unknown): Promise<DialogEntity[]>;
    /**
     * 获取活跃对话
     * @returns 活跃对话实体数组
     */
    findActiveDialogs(): Promise<DialogEntity[]>;
    /**
     * 根据能力类型查找对话
     * @param _capabilityType 能力类型
     * @returns 对话实体数组
     */
    findByCapability(_capabilityType: string): Promise<DialogEntity[]>;
    /**
     * 集成消息队列系统
     * @param queueConfig 队列配置
     */
    integrateMessageQueue(queueConfig: unknown): Promise<void>;
    /**
     * 集成缓存系统
     * @param cacheConfig 缓存配置
     */
    integrateCacheSystem(cacheConfig: unknown): Promise<void>;
    /**
     * 集成搜索引擎
     * @param _searchConfig 搜索配置
     */
    integrateSearchEngine(_searchConfig: unknown): Promise<void>;
    /**
     * 集成监控系统
     * @param monitoringConfig 监控配置
     */
    integrateMonitoringSystem(monitoringConfig: unknown): Promise<void>;
    /**
     * 集成日志系统
     * @param _loggingConfig 日志配置
     */
    integrateLoggingSystem(_loggingConfig: unknown): Promise<void>;
    /**
     * 集成安全系统
     * @param _securityConfig 安全配置
     */
    integrateSecuritySystem(_securityConfig: unknown): Promise<void>;
    /**
     * 集成通知系统
     * @param _notificationConfig 通知配置
     */
    integrateNotificationSystem(_notificationConfig: unknown): Promise<void>;
    /**
     * 集成文件存储系统
     * @param _storageConfig 存储配置
     */
    integrateFileStorageSystem(_storageConfig: unknown): Promise<void>;
    /**
     * 集成AI服务
     * @param _aiConfig AI服务配置
     */
    integrateAIServices(_aiConfig: unknown): Promise<void>;
    /**
     * 集成数据库系统
     * @param _dbConfig 数据库配置
     */
    integrateDatabaseSystem(_dbConfig: unknown): Promise<void>;
    /**
     * 初始化适配器
     * @param _config 初始化配置
     */
    initialize(_config?: unknown): Promise<void>;
    /**
     * 健康检查
     * @returns 健康状态
     */
    healthCheck(): Promise<unknown>;
    /**
     * 关闭适配器
     */
    shutdown(): Promise<void>;
    /**
     * 重新配置适配器
     * @param _newConfig 新配置
     */
    reconfigure(_newConfig: unknown): Promise<void>;
    /**
     * 检查适配器是否已初始化
     * @returns 初始化状态
     */
    isInitialized(): boolean;
    /**
     * 发布Dialog事件
     * @param _eventType 事件类型
     * @param _eventData 事件数据
     */
    publishDialogEvent(_eventType: string, _eventData: unknown): Promise<void>;
    /**
     * 获取健康状态
     * @returns 健康状态
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        adapter: {
            initialized: boolean;
            name: string;
            version: string;
        };
    }>;
    /**
     * 获取统计信息
     * @returns 统计信息
     */
    getStatistics(): Promise<{
        adapter: {
            eventBusConnected: boolean;
            coordinatorRegistered: boolean;
            totalDialogs: number;
            activeConnections: number;
        };
    }>;
    /**
     * 获取模块接口状态
     * @returns 模块接口状态
     */
    getModuleInterfaceStatus(): {
        context: string;
        plan: string;
        role: string;
        confirm: string;
        trace: string;
        extension: string;
        core: string;
        collab: string;
        network: string;
    };
    /**
     * 处理对话事件
     * @param message 消息队列消息
     */
    private handleDialogEvent;
    /**
     * 同步对话状态
     * @param message 状态同步消息
     */
    private syncDialogState;
    /**
     * 预热对话缓存
     * @param cacheAdapter 缓存适配器
     */
    private warmupDialogCache;
    /**
     * 设置对话监控指标
     * @param monitoringAdapter 监控适配器
     */
    private setupDialogMetrics;
    /**
     * 设置对话日志集成
     * @param monitoringAdapter 监控适配器
     */
    private setupDialogLogging;
    /**
     * 设置对话追踪集成
     * @param monitoringAdapter 监控适配器
     */
    private setupDialogTracing;
    private onDialogCreated;
    private onDialogUpdated;
    private onDialogCompleted;
    private onDialogError;
}
//# sourceMappingURL=dialog.adapter.d.ts.map