/**
 * Collab模块配置
 *
 * @description Collab模块的核心配置和依赖注入，与其他6个已完成模块保持IDENTICAL架构
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { CollabManagementService } from './application/services/collab-management.service';
import { CollabCoordinationService } from './domain/services/collab-coordination.service';
import { CollabRepositoryImpl } from './infrastructure/repositories/collab.repository.impl';
import { CollabModuleAdapter } from './infrastructure/adapters/collab-module.adapter';
import { CollabProtocol } from './infrastructure/protocols/collab.protocol';
import { CollabController } from './api/controllers/collab.controller';
import { CollabModuleConfig } from './types';
/**
 * Collab模块类
 *
 * @description 管理Collab模块的生命周期和依赖注入，遵循其他6个模块的IDENTICAL架构模式
 */
export declare class CollabModule {
    private static instance;
    private collabRepository;
    private collabCoordinationService;
    private collabManagementService;
    private collabModuleAdapter;
    private collabProtocol;
    private collabController;
    private _securityManager;
    private _performanceMonitor;
    private _eventBusManager;
    private _errorHandler;
    private _coordinationManager;
    private _orchestrationManager;
    private _stateSyncManager;
    private _transactionManager;
    private _protocolVersionManager;
    private config;
    private constructor();
    /**
     * 获取模块单例实例
     */
    static getInstance(): CollabModule;
    /**
     * 初始化模块配置
     */
    private initializeConfig;
    /**
     * 初始化L3横切关注点管理器
     *
     * @description 与其他6个模块保持IDENTICAL的L3管理器注入模式
     */
    private initializeL3Managers;
    /**
     * 初始化核心服务
     */
    private initializeServices;
    /**
     * 初始化基础设施组件
     */
    private initializeInfrastructure;
    /**
     * 获取Collab管理服务
     */
    getCollabManagementService(): CollabManagementService;
    /**
     * 获取Collab协调服务
     */
    getCollabCoordinationService(): CollabCoordinationService;
    /**
     * 获取Collab仓库
     */
    getCollabRepository(): CollabRepositoryImpl;
    /**
     * 获取Collab模块适配器
     */
    getCollabModuleAdapter(): CollabModuleAdapter;
    /**
     * 获取Collab协议
     */
    getCollabProtocol(): CollabProtocol;
    /**
     * 获取Collab控制器
     */
    getCollabController(): CollabController;
    /**
     * 获取模块配置
     */
    getConfig(): CollabModuleConfig;
    /**
     * 更新模块配置
     */
    updateConfig(newConfig: Partial<CollabModuleConfig>): void;
    /**
     * 启动模块
     */
    start(): Promise<void>;
    /**
     * 停止模块
     */
    stop(): Promise<void>;
    /**
     * 重启模块
     */
    restart(): Promise<void>;
    /**
     * 模块健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        details: Record<string, unknown>;
    }>;
}
export default CollabModule;
//# sourceMappingURL=module.d.ts.map