import { PlanProtocol } from '../protocols/plan.protocol';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface PlanProtocolFactoryConfig {
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
export declare class PlanProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): PlanProtocolFactory;
    createProtocol(config?: PlanProtocolFactoryConfig): Promise<IMLPPProtocol>;
    getProtocolMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
    reset(): void;
    destroy(): Promise<void>;
    getCurrentProtocol(): PlanProtocol | null;
    isInitialized(): boolean;
    static create(config?: PlanProtocolFactoryConfig): Promise<IMLPPProtocol>;
    static getDefaultConfig(): PlanProtocolFactoryConfig;
    static getDevelopmentConfig(): PlanProtocolFactoryConfig;
    static getProductionConfig(): PlanProtocolFactoryConfig;
}
//# sourceMappingURL=plan-protocol.factory.d.ts.map