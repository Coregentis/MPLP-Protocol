import { type ProtocolFactoryConfig } from './infrastructure/factories/dialog-protocol.factory';
import { type IMLPPProtocol } from './infrastructure/protocols/dialog.protocol';
import { DialogManagementService } from './application/services/dialog-management.service';
import { DialogAdapter } from './infrastructure/adapters/dialog.adapter';
import { DialogController } from './api/controllers/dialog.controller';
import { DialogMapper } from './api/mappers/dialog.mapper';
import { type DialogRepository } from './domain/repositories/dialog.repository';
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
export declare class DialogModuleContainer {
    private _config;
    private _protocolFactory;
    private _services;
    private _initialized;
    constructor(config: DialogModuleConfig);
    initialize(): Promise<void>;
    getService<T>(serviceName: string): T;
    getProtocolInstance(instanceId: string): IMLPPProtocol | null;
    getProtocol(): IMLPPProtocol | null;
    isInitialized(): boolean;
    createProtocolInstance(instanceId: string): Promise<IMLPPProtocol>;
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
    destroy(): Promise<void>;
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
    shutdown(): Promise<void>;
    private _registerCoreServices;
    private _registerApplicationServices;
    private _registerInfrastructureServices;
    private _registerApiServices;
}
export declare class DialogModule {
    private _container;
    private _config;
    constructor(config: DialogModuleConfig);
    initialize(): Promise<void>;
    getContainer(): DialogModuleContainer;
    getConfig(): DialogModuleConfig;
    updateConfig(newConfig: Partial<DialogModuleConfig>): Promise<void>;
    shutdown(): Promise<void>;
}
export declare function createDefaultDialogModuleConfig(environment?: 'development' | 'staging' | 'production'): DialogModuleConfig;
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
export declare function createDialogModule(options?: DialogModuleOptions): Promise<DialogModuleCreationResult>;
export default createDialogModule;
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
export declare function initializeDialogModule(): Promise<EnterpriseDialogModule>;
//# sourceMappingURL=module.d.ts.map