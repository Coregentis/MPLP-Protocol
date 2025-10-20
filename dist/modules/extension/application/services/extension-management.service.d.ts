/**
 * Extension管理服务
 *
 * @description Extension模块的核心应用服务，负责业务流程编排和用例实现
 * @version 1.0.0
 * @layer Application层 - 应用服务
 * @pattern 应用服务 + 用例编排 + 横切关注点集成
 */
import { UUID } from '../../../../shared/types';
import { IExtensionRepository, ExtensionQueryFilter, PaginationParams, SortParams, ExtensionQueryResult, BatchOperationResult, ExtensionStatistics } from '../../domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionType, ExtensionStatus, ExtensionConfiguration, ExtensionPoint, ApiExtension, EventSubscription, ExtensionPerformanceMetrics } from '../../types';
/**
 * 创建扩展请求
 */
export interface CreateExtensionRequest {
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    compatibility: ExtensionEntityData['compatibility'];
    configuration: ExtensionConfiguration;
    extensionPoints?: ExtensionPoint[];
    apiExtensions?: ApiExtension[];
    eventSubscriptions?: EventSubscription[];
    security: ExtensionEntityData['security'];
    metadata: ExtensionEntityData['metadata'];
}
/**
 * 更新扩展请求
 */
export interface UpdateExtensionRequest {
    extensionId: UUID;
    displayName?: string;
    description?: string;
    configuration?: Record<string, unknown>;
    extensionPoints?: ExtensionPoint[];
    apiExtensions?: ApiExtension[];
    eventSubscriptions?: EventSubscription[];
    metadata?: Partial<ExtensionEntityData['metadata']>;
}
/**
 * 扩展激活请求
 */
export interface ExtensionActivationRequest {
    extensionId: UUID;
    userId?: string;
    force?: boolean;
}
/**
 * 扩展健康状态
 */
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    details?: {
        service: string;
        version: string;
        repository: {
            status: string;
            extensionCount: number;
            activeExtensions: number;
            lastOperation: string;
        };
        performance: {
            averageResponseTime: number;
            totalExtensions: number;
            errorRate: number;
        };
    };
}
/**
 * Extension管理服务类
 * 负责扩展的完整生命周期管理、业务流程编排和横切关注点集成
 */
export declare class ExtensionManagementService {
    private readonly extensionRepository;
    constructor(extensionRepository: IExtensionRepository);
    /**
     * 为扩展应用所有横切关注点
     * @param extension - 扩展数据
     */
    applyAllCrossCuttingConcerns(extension: ExtensionEntityData): Promise<void>;
    /**
     * 移除扩展的所有横切关注点
     * @param extensionId - 扩展ID
     */
    removeAllCrossCuttingConcerns(extensionId: UUID): Promise<void>;
    /**
     * 协调扩展与其他MPLP模块 (预留接口)
     */
    private coordinateWithModule;
    /**
     * 跟踪扩展性能 (预留接口)
     */
    private trackExtensionPerformance;
    /**
     * 验证扩展安全配置 (预留接口)
     */
    private validateExtensionSecurity;
    /**
     * 验证扩展协议版本 (预留接口)
     */
    private validateExtensionProtocolVersion;
    /**
     * 发布扩展事件 (预留接口)
     */
    private publishExtensionEvent;
    /**
     * 同步扩展状态 (预留接口)
     */
    private syncExtensionState;
    /**
     * 处理扩展错误 (预留接口)
     */
    private handleExtensionError;
    /**
     * 创建扩展
     * @param request - 创建扩展请求
     * @returns Promise<ExtensionEntityData> - 创建的扩展数据
     */
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    /**
     * 获取扩展
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionEntityData | null> - 扩展数据或null
     */
    getExtensionById(extensionId: UUID): Promise<ExtensionEntityData | null>;
    /**
     * 更新扩展
     * @param request - 更新扩展请求
     * @returns Promise<ExtensionEntityData> - 更新后的扩展数据
     */
    updateExtension(request: UpdateExtensionRequest): Promise<ExtensionEntityData>;
    /**
     * 删除扩展
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否删除成功
     */
    deleteExtension(extensionId: UUID): Promise<boolean>;
    /**
     * 激活扩展
     * @param request - 激活请求
     * @returns Promise<boolean> - 是否激活成功
     */
    activateExtension(request: ExtensionActivationRequest): Promise<boolean>;
    /**
     * 停用扩展
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否停用成功
     */
    deactivateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    /**
     * 更新扩展版本
     * @param extensionId - 扩展ID
     * @param newVersion - 新版本号
     * @param changelog - 变更日志
     * @param userId - 操作用户ID
     * @returns Promise<ExtensionEntityData> - 更新后的扩展数据
     */
    updateExtensionVersion(extensionId: UUID, newVersion: string, changelog: string, userId?: string): Promise<ExtensionEntityData>;
    /**
     * 查询扩展
     * @param filter - 查询过滤器
     * @param pagination - 分页参数
     * @param sort - 排序参数
     * @returns Promise<ExtensionQueryResult> - 查询结果
     */
    queryExtensions(filter: ExtensionQueryFilter, pagination?: PaginationParams, sort?: SortParams[]): Promise<ExtensionQueryResult>;
    /**
     * 根据上下文ID获取扩展
     * @param contextId - 上下文ID
     * @returns Promise<ExtensionEntityData[]> - 扩展数组
     */
    getExtensionsByContextId(contextId: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 根据类型获取扩展
     * @param extensionType - 扩展类型
     * @param status - 可选的状态过滤
     * @returns Promise<ExtensionEntityData[]> - 扩展数组
     */
    getExtensionsByType(extensionType: ExtensionType, status?: ExtensionStatus): Promise<ExtensionEntityData[]>;
    /**
     * 获取活动扩展
     * @param contextId - 可选的上下文ID过滤
     * @returns Promise<ExtensionEntityData[]> - 活动扩展数组
     */
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 搜索扩展
     * @param searchTerm - 搜索词
     * @param searchFields - 搜索字段
     * @param pagination - 分页参数
     * @returns Promise<ExtensionQueryResult> - 搜索结果
     */
    searchExtensions(searchTerm: string, searchFields?: string[], pagination?: PaginationParams): Promise<ExtensionQueryResult>;
    /**
     * 获取扩展数量
     * @param filter - 可选的过滤条件
     * @returns Promise<number> - 扩展数量
     */
    getExtensionCount(filter?: ExtensionQueryFilter): Promise<number>;
    /**
     * 检查扩展是否存在
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否存在
     */
    extensionExists(extensionId: UUID): Promise<boolean>;
    /**
     * 获取扩展统计信息
     * @param filter - 可选的过滤条件
     * @returns Promise<ExtensionStatistics> - 统计信息
     */
    getExtensionStatistics(filter?: ExtensionQueryFilter): Promise<ExtensionStatistics>;
    /**
     * 更新扩展性能指标
     * @param extensionId - 扩展ID
     * @param metrics - 性能指标
     * @returns Promise<void>
     */
    updatePerformanceMetrics(extensionId: UUID, metrics: Partial<ExtensionPerformanceMetrics>): Promise<void>;
    /**
     * 批量创建扩展
     * @param requests - 创建请求数组
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    createExtensionBatch(requests: CreateExtensionRequest[]): Promise<BatchOperationResult>;
    /**
     * 批量删除扩展
     * @param extensionIds - 扩展ID数组
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    deleteExtensionBatch(extensionIds: UUID[]): Promise<BatchOperationResult>;
    /**
     * 批量更新扩展状态
     * @param extensionIds - 扩展ID数组
     * @param status - 新状态
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    updateExtensionStatusBatch(extensionIds: UUID[], status: ExtensionStatus): Promise<BatchOperationResult>;
    /**
     * 获取服务健康状态
     * @returns Promise<HealthStatus> - 健康状态
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * 生成扩展ID
     */
    private generateExtensionId;
    /**
     * 准备扩展数据
     */
    private prepareExtensionData;
    private createInitialLifecycle;
    private createInitialAuditTrail;
    private createInitialPerformanceMetrics;
    private createInitialMonitoringIntegration;
    private createInitialVersionHistory;
    private createInitialSearchMetadata;
    private createInitialEventIntegration;
    /**
     * 列出扩展
     * @param options - 查询选项
     * @returns Promise<{extensions: ExtensionEntityData[], totalCount: number, hasMore: boolean}> - 扩展列表
     */
    listExtensions(options?: {
        contextId?: UUID;
        extensionType?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        extensions: ExtensionEntityData[];
        totalCount: number;
        hasMore: boolean;
    }>;
}
//# sourceMappingURL=extension-management.service.d.ts.map