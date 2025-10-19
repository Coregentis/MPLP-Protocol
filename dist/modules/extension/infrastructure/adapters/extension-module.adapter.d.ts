/**
 * Extension模块适配器
 *
 * @description Extension模块的基础设施适配器，提供模块间通信和协调功能
 * @version 1.0.0
 * @layer Infrastructure层 - 适配器
 * @pattern 适配器模式 + 依赖注入 + 协议适配
 */
import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
/**
 * Extension模块适配器接口
 */
export interface IExtensionModuleAdapter {
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null>;
    deleteExtension(extensionId: UUID): Promise<boolean>;
    activateExtension(extensionId: UUID): Promise<boolean>;
    deactivateExtension(extensionId: UUID): Promise<boolean>;
    listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult>;
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]>;
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]>;
    getHealthStatus(): Promise<ExtensionHealthStatus>;
    getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics>;
}
import { ExtensionConfiguration, ExtensionCompatibility } from '../../types';
/**
 * 创建扩展请求接口 (适配器层)
 */
export interface CreateExtensionRequest {
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    configuration?: ExtensionConfiguration;
    security?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    compatibility?: ExtensionCompatibility;
}
/**
 * 更新扩展请求接口 (适配器层)
 */
export interface UpdateExtensionRequest {
    extensionId: UUID;
    name?: string;
    displayName?: string;
    description?: string;
    version?: string;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    configuration?: Record<string, unknown>;
    security?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
/**
 * 扩展激活请求接口 (适配器层)
 */
export interface ExtensionActivationRequest {
    extensionId: UUID;
    contextId?: UUID;
    activationOptions?: Record<string, unknown>;
}
/**
 * 扩展查询选项接口
 */
export interface ExtensionQueryOptions {
    contextId?: UUID;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * 扩展查询条件接口
 */
export interface ExtensionQueryCriteria {
    name?: string;
    displayName?: string;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    tags?: string[];
    category?: string;
}
/**
 * 扩展列表结果接口
 */
export interface ExtensionListResult {
    extensions: ExtensionEntityData[];
    totalCount: number;
    hasMore: boolean;
    nextPage?: number;
}
/**
 * 扩展健康状态接口
 */
export interface ExtensionHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration?: number;
    }>;
    metrics: {
        totalExtensions: number;
        activeExtensions: number;
        errorCount: number;
        averageResponseTime: number;
    };
}
/**
 * 扩展性能指标接口
 */
export interface ExtensionPerformanceMetrics {
    activationLatency: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    errorRate: number;
    throughput: number;
    responseTime: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    alerts: Array<{
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        timestamp: string;
    }>;
}
/**
 * Extension模块适配器实现
 */
export declare class ExtensionModuleAdapter implements IExtensionModuleAdapter {
    private readonly extensionManagementService;
    constructor(extensionManagementService: ExtensionManagementService);
    /**
     * 创建扩展
     */
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    /**
     * 获取扩展
     */
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    /**
     * 更新扩展
     */
    updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null>;
    /**
     * 删除扩展
     */
    deleteExtension(extensionId: UUID): Promise<boolean>;
    /**
     * 激活扩展
     */
    activateExtension(extensionId: UUID): Promise<boolean>;
    /**
     * 停用扩展
     */
    deactivateExtension(extensionId: UUID): Promise<boolean>;
    /**
     * 列出扩展
     */
    listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult>;
    /**
     * 查询扩展
     */
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]>;
    /**
     * 获取活跃扩展
     */
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 根据类型获取扩展
     */
    getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]>;
    /**
     * 获取健康状态
     */
    getHealthStatus(): Promise<ExtensionHealthStatus>;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics>;
}
//# sourceMappingURL=extension-module.adapter.d.ts.map