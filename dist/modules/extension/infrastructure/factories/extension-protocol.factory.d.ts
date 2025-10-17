import { ExtensionProtocol } from '../protocols/extension.protocol';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
import { IExtensionRepository } from '../../domain/repositories/extension.repository.interface';
import { ExtensionModuleAdapter } from '../adapters/extension-module.adapter';
import { ExtensionProtocolFactoryConfig } from '../../types';
import { ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface ExtensionProtocolConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    enableSecurity?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableEventBus?: boolean;
    enableErrorHandling?: boolean;
    enableCoordination?: boolean;
    enableOrchestration?: boolean;
    maxExtensions?: number;
    activationTimeout?: number;
    deactivationTimeout?: number;
    healthCheckInterval?: number;
    performanceMetricsInterval?: number;
    enableSandbox?: boolean;
    enableCodeSigning?: boolean;
    enablePermissionValidation?: boolean;
    enableResourceLimiting?: boolean;
    maxMemoryUsage?: number;
    maxCpuUsage?: number;
    maxNetworkRequests?: number;
}
export interface ExtensionProtocolDependencies {
    extensionRepository?: IExtensionRepository;
    extensionManagementService?: ExtensionManagementService;
    extensionModuleAdapter?: ExtensionModuleAdapter;
    securityManager?: unknown;
    performanceManager?: unknown;
    eventBusManager?: unknown;
    errorHandlerManager?: unknown;
    coordinationManager?: unknown;
    orchestrationManager?: unknown;
    stateSyncManager?: unknown;
    transactionManager?: unknown;
    protocolVersionManager?: unknown;
}
export declare class ExtensionProtocolFactory {
    private static instance;
    private readonly defaultConfig;
    private protocol;
    private constructor();
    static getInstance(): ExtensionProtocolFactory;
    createProtocol(config?: Partial<ExtensionProtocolFactoryConfig>): Promise<ExtensionProtocol>;
    createDefaultProtocol(): Promise<ExtensionProtocol>;
    createTestProtocol(config?: Partial<ExtensionProtocolConfig>): ExtensionProtocol;
    createProductionProtocol(config?: Partial<ExtensionProtocolConfig>): ExtensionProtocol;
    private resolveDependencies;
    private createTestDependencies;
    private createProductionDependencies;
    validateConfig(config: ExtensionProtocolConfig): boolean;
    getDefaultConfig(): ExtensionProtocolConfig;
    getProtocolMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
    reset(): void;
    destroy(): Promise<void>;
}
export declare const DEFAULT_EXTENSION_PROTOCOL_CONFIG: ExtensionProtocolFactoryConfig;
//# sourceMappingURL=extension-protocol.factory.d.ts.map