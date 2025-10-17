import { ConfirmProtocol } from '../protocols/confirm.protocol';
export interface ConfirmProtocolFactoryConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    crossCuttingConcerns?: Record<string, {
        enabled: boolean;
    }>;
}
export declare class ConfirmProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): ConfirmProtocolFactory;
    createProtocol(config?: ConfirmProtocolFactoryConfig): Promise<ConfirmProtocol>;
    getProtocol(): ConfirmProtocol | null;
    reset(): void;
    private createRepository;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    getMetadata(): import("../../../../core/protocols/mplp-protocol-base").ProtocolMetadata;
    validateConfig(config: ConfirmProtocolFactoryConfig): {
        valid: boolean;
        errors: string[];
    };
    getStatistics(): {
        protocolInitialized: boolean;
        factoryVersion: string;
        supportedRepositoryTypes: string[];
        supportedCrossCuttingConcerns: string[];
    };
}
//# sourceMappingURL=confirm-protocol.factory.d.ts.map