/**
 * Dialog Module Configuration
 * @description Dialog模块依赖注入配置和模块导出
 * @version 1.0.0
 */
import { type ProtocolFactoryConfig } from './infrastructure/factories/dialog-protocol.factory';
import { type IMLPPProtocol } from './infrastructure/protocols/dialog.protocol';
import { DialogManagementService } from './application/services/dialog-management.service';
import { DialogAdapter } from './infrastructure/adapters/dialog.adapter';
import { DialogController } from './api/controllers/dialog.controller';
import { DialogMapper } from './api/mappers/dialog.mapper';
import { type DialogRepository } from './domain/repositories/dialog.repository';
/**
 * Dialog模块配置接口
 */
export interface DialogModuleConfig {
    environment: 'development' | 'staging' | 'production';
    enableProtocol: boolean;
    enableIntegration: boolean;
    enableOrchestration: boolean;
    protocolConfig: ProtocolFactoryConfig;
    serviceConfig: {
        enableCaching: boolean;
        enableMetrics: boolean;
        enableTracing: boolean;
        maxConcurrentDialogs: number;
        defaultTimeout: number;
    };
    integrationConfig: {
        enabledModules: string[];
        orchestrationScenarios: string[];
        crossCuttingConcerns: string[];
    };
}
/**
 * Dialog模块依赖注入容器
 */
export declare class DialogModuleContainer {
    private _config;
    private _protocolFactory;
    private _services;
    private _initialized;
    constructor(config: DialogModuleConfig);
    /**
     * 初始化模块容器
     */
    initialize(): Promise<void>;
    /**
     * 获取服务实例
     * @param serviceName 服务名称
     * @returns 服务实例
     */
    getService<T>(serviceName: string): T;
    /**
     * 获取协议实例
     * @param instanceId 实例ID
     * @returns 协议实例
     */
    getProtocolInstance(instanceId: string): IMLPPProtocol | null;
    /**
     * 获取协议实例（企业级标准接口）
     */
    getProtocol(): IMLPPProtocol | null;
    /**
     * 检查模块是否已初始化
     */
    isInitialized(): boolean;
    /**
     * 创建协议实例
     * @param instanceId 实例ID
     * @returns 协议实例
     */
    createProtocolInstance(instanceId: string): Promise<IMLPPProtocol>;
    /**
     * 获取模块组件
     * @returns 模块组件
     */
    getComponents(): {
        controller: DialogController;
        service: DialogManagementService;
        mapper: typeof DialogMapper;
        moduleAdapter: DialogAdapter;
        commandHandler?: unknown;
        queryHandler?: unknown;
        webSocketHandler?: unknown;
        domainService?: unknown;
    };
    /**
     * 销毁模块
     */
    destroy(): Promise<void>;
    /**
     * 获取模块健康状态
     * @returns 健康状态
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        services: {
            [serviceName: string]: string;
        };
        protocols: {
            [instanceId: string]: string;
        };
        timestamp: string;
    }>;
    /**
     * 关闭模块容器
     */
    shutdown(): Promise<void>;
    /**
     * 注册核心服务
     */
    private _registerCoreServices;
    /**
     * 注册应用服务
     */
    private _registerApplicationServices;
    /**
     * 注册基础设施服务
     */
    private _registerInfrastructureServices;
    /**
     * 注册API服务
     */
    private _registerApiServices;
}
/**
 * Dialog模块类
 * 模块的主要入口点
 */
export declare class DialogModule {
    private _container;
    private _config;
    constructor(config: DialogModuleConfig);
    /**
     * 初始化模块
     */
    initialize(): Promise<void>;
    /**
     * 获取模块容器
     * @returns 依赖注入容器
     */
    getContainer(): DialogModuleContainer;
    /**
     * 获取模块配置
     * @returns 模块配置
     */
    getConfig(): DialogModuleConfig;
    /**
     * 更新模块配置
     * @param newConfig 新配置
     */
    updateConfig(newConfig: Partial<DialogModuleConfig>): Promise<void>;
    /**
     * 关闭模块
     */
    shutdown(): Promise<void>;
}
/**
 * 创建默认Dialog模块配置
 * @param environment 环境
 * @returns 默认配置
 */
export declare function createDefaultDialogModuleConfig(environment?: 'development' | 'staging' | 'production'): DialogModuleConfig;
/**
 * Dialog模块初始化选项
 */
export interface DialogModuleOptions {
    enableWebSocket?: boolean;
    enableRealTimeUpdates?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableAdvancedAnalytics?: boolean;
    enableSecurityAudit?: boolean;
    enableBatchOperations?: boolean;
    enableSearchOptimization?: boolean;
    enableEventIntegration?: boolean;
    enableVersionControl?: boolean;
    enableMultiModal?: boolean;
    enableIntelligentControl?: boolean;
    enableCriticalThinking?: boolean;
    enableKnowledgeSearch?: boolean;
    maxConcurrentDialogs?: number;
    defaultTimeout?: number;
    cacheSize?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    persistenceEnabled?: boolean;
    backupEnabled?: boolean;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
    auditTrailEnabled?: boolean;
    performanceMetricsEnabled?: boolean;
    healthCheckEnabled?: boolean;
    monitoringIntegrationEnabled?: boolean;
    searchMetadataEnabled?: boolean;
    eventIntegrationEnabled?: boolean;
    versionHistoryEnabled?: boolean;
}
/**
 * Dialog模块初始化结果
 */
export interface DialogModuleResult {
    success: boolean;
    module: DialogModuleContainer | null;
    error?: string;
    performance?: {
        initializationTime: number;
        memoryUsage: number;
        componentCount: number;
    };
}
/**
 * Dialog模块创建结果
 */
export interface DialogModuleCreationResult {
    success: boolean;
    module: DialogModuleContainer | null;
    error?: string;
    performance: {
        initializationTime: number;
        memoryUsage: number;
        componentCount: number;
    };
}
/**
 * 创建Dialog模块
 * @param options - 模块配置选项
 * @returns Promise<DialogModuleCreationResult> - 初始化结果
 */
export declare function createDialogModule(options?: DialogModuleOptions): Promise<DialogModuleCreationResult>;
/**
 * 默认导出：创建Dialog模块函数
 */
export default createDialogModule;
/**
 * 企业级Dialog模块接口
 */
export interface EnterpriseDialogModule {
    controller: DialogController;
    commandHandler: DialogManagementService;
    queryHandler: DialogManagementService;
    repository: DialogRepository;
    protocol: IMLPPProtocol | null;
    moduleAdapter: {
        name: string;
        version: string;
        getModuleInterfaceStatus: () => {
            initialized: boolean;
            interfaces: string[];
            status: string;
        };
    };
    webSocketHandler?: {
        addConnection: (connection: {
            id: string;
            send: (message: string) => void;
        }) => Promise<void>;
        removeConnection: (connectionId: string) => Promise<void>;
        getStatus: () => Promise<{
            connections: number;
            totalConnections: number;
            activeConnections: number;
            connectionHealth: string;
        }>;
        broadcastMessage: (message: unknown) => Promise<void>;
        handleMessage: (connection: unknown, message: unknown) => Promise<void>;
        broadcast: (message: unknown) => Promise<void>;
    };
    domainService: {
        validateDialogCreation: (dialogData: unknown) => {
            isValid: boolean;
            violations: string[];
            recommendations: string[];
        };
        calculateDialogComplexity: (dialogData: unknown) => {
            score: number;
            factors: string[];
            recommendations: string[];
        };
        assessDialogQuality: (dialogData: unknown) => {
            score: number;
            factors: string[];
            recommendations: string[];
        };
        validateDialogUpdate: (dialogId: string, updateData: unknown) => {
            isValid: boolean;
            violations: string[];
            recommendations: string[];
        };
        validateDialogDeletion: (dialogId: string) => {
            isValid: boolean;
            violations: string[];
            recommendations: string[];
        };
    };
    isModuleInitialized: () => boolean;
    getHealthStatus: () => Promise<{
        status: string;
        details: {
            initialized: boolean;
            services: string[];
            timestamp: string;
        };
    }>;
    getStatistics: () => Promise<{
        totalDialogs: number;
        averageParticipants: number;
        activeDialogs: number;
        endedDialogs: number;
    }>;
    getVersionInfo: () => {
        version: string;
        buildDate: string;
        name: string;
    };
    getComponents: () => {
        controller: DialogController;
        commandHandler: DialogManagementService;
        queryHandler: DialogManagementService;
        repository: DialogRepository;
        protocol: IMLPPProtocol | null;
        moduleAdapter: EnterpriseDialogModule['moduleAdapter'];
        webSocketHandler?: EnterpriseDialogModule['webSocketHandler'];
        domainService: EnterpriseDialogModule['domainService'];
    };
    destroy: () => Promise<void>;
}
/**
 * 企业级Dialog模块初始化函数
 * @description 基于Context、Plan、Role、Confirm模块的企业级标准
 */
export declare function initializeDialogModule(): Promise<EnterpriseDialogModule>;
//# sourceMappingURL=module.d.ts.map