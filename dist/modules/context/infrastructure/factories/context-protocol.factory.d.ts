import { ContextProtocol } from '../protocols/context.protocol.js';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base.js';
export interface ContextProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
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
export declare class ContextProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): ContextProtocolFactory;
    createProtocol(config?: ContextProtocolFactoryConfig): Promise<IMLPPProtocol>;
    getProtocol(): ContextProtocol | null;
    reset(): void;
    static create(config?: ContextProtocolFactoryConfig): Promise<IMLPPProtocol>;
    static getMetadata(): Promise<ProtocolMetadata>;
    static healthCheck(): Promise<HealthStatus>;
}
//# sourceMappingURL=context-protocol.factory.d.ts.map