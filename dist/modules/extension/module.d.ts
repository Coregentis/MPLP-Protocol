/**
 * Extension模块主入口
 *
 * @description Extension模块的主要入口点，实现IMLPPProtocol接口和模块初始化
 * @version 1.0.0
 * @layer 模块层 - 主入口
 * @pattern MPLP协议实现 + 模块初始化 + 依赖注入
 */
import { UUID } from '../../shared/types';
import { ExtensionManagementService } from './application/services/extension-management.service';
import { ExtensionEntityData, ExtensionType } from './types';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus, MLPPRequest, MLPPResponse } from '../../core/protocols/mplp-protocol-base';
/**
 * Extension模块配置选项
 */
export interface ExtensionModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    extensionRetentionDays?: number;
    maxExtensionsPerContext?: number;
    enablePerformanceMonitoring?: boolean;
    enableSecurityValidation?: boolean;
    enableEventPublishing?: boolean;
    enableCrossCuttingConcerns?: boolean;
}
/**
 * Extension模块类
 * 实现MPLP协议接口，提供扩展管理的完整功能
 */
export declare class ExtensionModule implements IMLPPProtocol {
    private extensionManagementService?;
    private extensionRepository?;
    private isInitialized;
    private moduleOptions;
    private initializationTime;
    /**
     * 初始化Extension模块
     * @param config - 模块配置
     */
    initialize(config?: Record<string, unknown> | ExtensionModuleOptions): Promise<void>;
    /**
     * 关闭Extension模块
     */
    shutdown(): Promise<void>;
    /**
     * 获取模块元数据
     */
    getMetadata(): {
        name: string;
        version: string;
        description: string;
        author: string;
        dependencies: string[];
    };
    /**
     * 执行协议操作
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 健康检查
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 获取模块版本
     */
    getVersion(): string;
    /**
     * 获取扩展管理服务
     * @returns ExtensionManagementService实例
     */
    getExtensionManagementService(): ExtensionManagementService;
    /**
     * 获取横切关注点服务 (现已集成到ExtensionManagementService中)
     * @returns ExtensionManagementService实例
     */
    getCrossCuttingConcernsService(): ExtensionManagementService;
    /**
     * 创建扩展的便捷方法
     * @param request - 创建扩展请求
     * @returns Promise<ExtensionEntityData> - 创建的扩展数据
     */
    createExtension(request: {
        contextId: UUID;
        name: string;
        displayName: string;
        description: string;
        version: string;
        extensionType: ExtensionType;
    }): Promise<ExtensionEntityData>;
    /**
     * 获取扩展的便捷方法
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionEntityData | null> - 扩展数据或null
     */
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    /**
     * 激活扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否激活成功
     */
    activateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    /**
     * 停用扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否停用成功
     */
    deactivateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    /**
     * 更新扩展的便捷方法
     * @param extensionId - 扩展ID
     * @param updateData - 更新数据
     * @returns Promise<ExtensionEntityData | null> - 更新后的扩展数据或null
     */
    updateExtension(extensionId: UUID, updateData: {
        displayName?: string;
        description?: string;
        status?: string;
        configuration?: Record<string, unknown>;
    }): Promise<ExtensionEntityData | null>;
    /**
     * 列出扩展的便捷方法
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
    /**
     * 删除扩展的便捷方法
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否删除成功
     */
    deleteExtension(extensionId: UUID): Promise<boolean>;
    /**
     * 获取活动扩展的便捷方法
     * @param contextId - 可选的上下文ID过滤
     * @returns Promise<ExtensionEntityData[]> - 活动扩展数组
     */
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    /**
     * 解析配置
     */
    private parseConfiguration;
    /**
     * 初始化仓储层
     */
    private initializeRepository;
    /**
     * 初始化服务层
     */
    private initializeServices;
    /**
     * 初始化横切关注点 (现已集成到ExtensionManagementService中)
     */
    private initializeCrossCuttingConcerns;
    /**
     * 记录初始化指标
     */
    private recordInitializationMetrics;
    /**
     * 清理资源
     */
    private cleanupResources;
}
/**
 * 创建Extension模块实例
 * @param options - 模块配置选项
 * @returns ExtensionModule实例
 */
export declare function createExtensionModule(_options?: ExtensionModuleOptions): ExtensionModule;
/**
 * 初始化Extension模块的便捷函数
 * @param options - 模块配置选项
 * @returns Promise<ExtensionModule> - 初始化后的模块实例
 */
export declare function initializeExtensionModule(options?: ExtensionModuleOptions): Promise<ExtensionModule>;
export default ExtensionModule;
//# sourceMappingURL=module.d.ts.map