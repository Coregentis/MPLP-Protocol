import { UUID } from '../../shared/types';
import { ExtensionManagementService } from './application/services/extension-management.service';
import { ExtensionEntityData, ExtensionType } from './types';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus, MLPPRequest, MLPPResponse } from '../../core/protocols/mplp-protocol-base';
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
export declare class ExtensionModule implements IMLPPProtocol {
    private extensionManagementService?;
    private extensionRepository?;
    private isInitialized;
    private moduleOptions;
    private initializationTime;
    initialize(config?: Record<string, unknown> | ExtensionModuleOptions): Promise<void>;
    shutdown(): Promise<void>;
    getMetadata(): {
        name: string;
        version: string;
        description: string;
        author: string;
        dependencies: string[];
    };
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    getVersion(): string;
    getExtensionManagementService(): ExtensionManagementService;
    getCrossCuttingConcernsService(): ExtensionManagementService;
    createExtension(request: {
        contextId: UUID;
        name: string;
        displayName: string;
        description: string;
        version: string;
        extensionType: ExtensionType;
    }): Promise<ExtensionEntityData>;
    getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
    activateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    deactivateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    updateExtension(extensionId: UUID, updateData: {
        displayName?: string;
        description?: string;
        status?: string;
        configuration?: Record<string, unknown>;
    }): Promise<ExtensionEntityData | null>;
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
    deleteExtension(extensionId: UUID): Promise<boolean>;
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    private parseConfiguration;
    private initializeRepository;
    private initializeServices;
    private initializeCrossCuttingConcerns;
    private recordInitializationMetrics;
    private cleanupResources;
}
export declare function createExtensionModule(_options?: ExtensionModuleOptions): ExtensionModule;
export declare function initializeExtensionModule(options?: ExtensionModuleOptions): Promise<ExtensionModule>;
export default ExtensionModule;
//# sourceMappingURL=module.d.ts.map