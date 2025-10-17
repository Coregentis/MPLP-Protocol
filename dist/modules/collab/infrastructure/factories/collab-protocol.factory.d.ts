import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface CollabProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxParticipants?: number;
    defaultCoordinationType?: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    defaultDecisionMaking?: 'consensus' | 'majority' | 'weighted' | 'coordinator';
    crossCuttingConcerns?: {
        security?: {
            enabled: boolean;
        };
        performance?: {
            enabled: boolean;
        };
        eventBus?: {
            enabled: boolean;
        };
        errorHandler?: {
            enabled: boolean;
        };
        coordination?: {
            enabled: boolean;
        };
        orchestration?: {
            enabled: boolean;
        };
        stateSync?: {
            enabled: boolean;
        };
        transaction?: {
            enabled: boolean;
        };
        protocolVersion?: {
            enabled: boolean;
        };
    };
}
export declare class CollabProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): CollabProtocolFactory;
    createProtocol(config?: CollabProtocolFactoryConfig): Promise<IMLPPProtocol>;
    createConfiguredProtocol(config: CollabProtocolFactoryConfig): Promise<IMLPPProtocol>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    reset(): void;
    static destroy(): void;
    static getDefaultConfig(): CollabProtocolFactoryConfig;
    static validateConfig(config: CollabProtocolFactoryConfig): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=collab-protocol.factory.d.ts.map