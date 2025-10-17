import { type IMLPPProtocol } from '../protocols/dialog.protocol';
export interface ProtocolFactoryConfig {
    environment: 'development' | 'staging' | 'production';
    enableLogging: boolean;
    enableMetrics: boolean;
    enableHealthCheck: boolean;
    dependencies: {
        database?: unknown;
        cache?: unknown;
        messageQueue?: unknown;
        monitoring?: unknown;
    };
    features: {
        intelligentControl: boolean;
        criticalThinking: boolean;
        knowledgeSearch: boolean;
        multimodal: boolean;
        collaboration: boolean;
    };
}
export interface ProtocolInstanceConfig {
    instanceId: string;
    protocolVersion: string;
    customCapabilities?: string[];
    overrideDefaults?: Record<string, unknown>;
    integrationConfig?: {
        enabledModules: string[];
        orchestrationScenarios: string[];
        adapterSettings: Record<string, unknown>;
    };
}
export declare class DialogProtocolFactory {
    private static _instance;
    private _protocolInstances;
    private _factoryConfig;
    private constructor();
    static getInstance(config?: ProtocolFactoryConfig): DialogProtocolFactory;
    createProtocolInstance(instanceConfig: ProtocolInstanceConfig): Promise<IMLPPProtocol>;
    getProtocolInstance(instanceId: string): IMLPPProtocol | null;
    destroyProtocolInstance(instanceId: string): Promise<void>;
    getAllProtocolInstances(): Map<string, IMLPPProtocol>;
    getFactoryStatus(): {
        totalInstances: number;
        activeInstances: number;
        factoryConfig: ProtocolFactoryConfig;
        instanceIds: string[];
    };
    updateFactoryConfig(newConfig: Partial<ProtocolFactoryConfig>): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        instances: {
            [instanceId: string]: string;
        };
        factoryMetrics: {
            totalInstances: number;
            healthyInstances: number;
            unhealthyInstances: number;
        };
    }>;
    private _createDependencies;
    private _configureProtocolInstance;
    private _recordFactoryEvent;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=dialog-protocol.factory.d.ts.map