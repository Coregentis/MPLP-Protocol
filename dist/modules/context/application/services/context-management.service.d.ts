/**
 * Context核心管理服务 - 重构版本
 *
 * @description 基于SCTM+GLFB+ITCM方法论重构的核心上下文管理服务
 * 整合原有17个服务中的核心管理功能：CRUD、生命周期、状态同步、版本控制、缓存管理
 * @version 2.0.0
 * @layer 应用层 - 核心服务
 * @refactor 17→3服务简化，符合协议最小化原则
 */
import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import { LifecycleStage, StateUpdates, CreateContextData, UpdateContextData, ContextFilter, SearchQuery } from '../../types';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';
export interface ICacheManager {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface IVersionManager {
    createVersion(context: ContextEntity): Promise<string>;
    getVersionHistory(contextId: UUID): Promise<ContextVersion[]>;
    getVersion(contextId: UUID, version: string): Promise<ContextEntity | null>;
    compareVersions(contextId: UUID, version1: string, version2: string): Promise<VersionDiff>;
}
export interface ContextVersion {
    versionId: string;
    contextId: UUID;
    version: string;
    createdAt: Date;
    changes: Record<string, unknown>;
    createdBy?: UUID;
}
export interface VersionDiff {
    added: Record<string, unknown>;
    modified: Record<string, unknown>;
    removed: string[];
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
/**
 * Context核心管理服务
 *
 * @description 整合原有17个服务中的6个核心管理服务功能
 * 职责：上下文CRUD、生命周期管理、状态同步、版本控制、缓存管理、批量操作
 */
export declare class ContextManagementService {
    private readonly contextRepository;
    private readonly logger;
    private readonly cacheManager;
    private readonly versionManager;
    constructor(contextRepository: IContextRepository, logger: ILogger, cacheManager: ICacheManager, versionManager: IVersionManager);
    /**
     * 创建新的Context - 增强版本
     * 整合：原上下文管理、缓存策略、版本历史功能
     */
    createContext(data: CreateContextData): Promise<ContextEntity>;
    /**
     * 获取Context - 缓存优化版本
     * 整合：原上下文管理、缓存策略功能
     */
    getContext(contextId: UUID): Promise<ContextEntity | null>;
    /**
     * 根据ID获取Context (别名方法)
     */
    getContextById(contextId: UUID): Promise<ContextEntity | null>;
    /**
     * 根据名称获取Context
     */
    getContextByName(name: string): Promise<ContextEntity | null>;
    /**
     * 查询Contexts
     */
    queryContexts(filter?: ContextFilter, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 搜索Contexts
     */
    searchContexts(query: SearchQuery | string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    /**
     * 获取Context统计信息
     */
    getContextStatistics(): Promise<Record<string, unknown>>;
    /**
     * 批量创建多个Context - 新增功能
     * 基于Schema驱动开发，支持批量操作
     */
    createMultipleContexts(requests: CreateContextData[]): Promise<ContextEntity[]>;
    /**
     * 更新Context - 版本控制增强版本
     * 整合：原上下文管理、版本历史、缓存策略功能
     */
    updateContext(contextId: UUID, data: UpdateContextData): Promise<ContextEntity>;
    /**
     * 删除Context - 安全删除版本
     * 整合：原上下文管理、缓存策略功能
     */
    deleteContext(contextId: UUID): Promise<boolean>;
    /**
     * 生命周期阶段转换
     * 新增功能：支持 planning → executing → monitoring → completed 的标准转换
     */
    transitionLifecycleStage(contextId: UUID, newStage: LifecycleStage): Promise<ContextEntity>;
    /**
     * 激活上下文
     */
    activateContext(contextId: UUID): Promise<ContextEntity>;
    /**
     * 停用上下文
     */
    deactivateContext(contextId: UUID): Promise<ContextEntity>;
    /**
     * 同步共享状态
     * 新增功能：实时状态同步和版本控制
     */
    syncSharedState(contextId: UUID, stateUpdates: StateUpdates): Promise<void>;
    /**
     * 获取状态变更历史
     */
    getStateHistory(contextId: UUID): Promise<ContextVersion[]>;
    /**
     * 比较状态版本
     */
    compareStateVersions(contextId: UUID, version1: string, version2: string): Promise<VersionDiff>;
    /**
     * 批量创建上下文
     * 新增功能：支持批量创建以提升性能
     */
    createContexts(requests: CreateContextData[]): Promise<ContextEntity[]>;
    /**
     * 查询上下文列表 - 增强版本
     * 整合：原查询功能，新增缓存优化
     */
    listContexts(filter: ContextFilter): Promise<ContextEntity[]>;
    /**
     * 统计上下文数量
     */
    countContexts(filter: ContextFilter): Promise<number>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
    /**
     * 生成上下文ID
     */
    private generateContextId;
    /**
     * 验证创建数据
     */
    private validateCreateData;
    /**
     * 验证更新数据
     */
    private validateUpdateData;
    /**
     * 验证生命周期转换
     */
    private validateLifecycleTransition;
    /**
     * 根据生命周期阶段获取对应状态
     */
    private getStatusForLifecycleStage;
    /**
     * 检查是否可以删除
     */
    private canBeDeleted;
    /**
     * 合并共享状态
     */
    private mergeSharedState;
    /**
     * 发布状态变更事件
     */
    private publishStateChangeEvent;
    /**
     * 版本号递增
     */
    private incrementVersion;
    /**
     * 判断是否为简单过滤条件
     */
    private isSimpleFilter;
    /**
     * 处理Context生命周期事件
     */
    private handleContextLifecycleEvent;
}
//# sourceMappingURL=context-management.service.d.ts.map