import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
export interface RoleProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    roleConfiguration?: {
        maxRoles?: number;
        defaultRoleType?: 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
        permissionModel?: 'rbac' | 'abac' | 'hybrid';
        inheritanceMode?: 'none' | 'single' | 'multiple';
        auditEnabled?: boolean;
        securityClearanceRequired?: boolean;
    };
    agentManagement?: {
        maxAgents?: number;
        autoScaling?: boolean;
        loadBalancing?: boolean;
        healthCheckIntervalMs?: number;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        roleAssignmentLatencyThresholdMs?: number;
        permissionCheckLatencyThresholdMs?: number;
        securityScoreThreshold?: number;
    };
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
export declare class RoleProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): RoleProtocolFactory;
    createProtocol(config?: RoleProtocolFactoryConfig): Promise<IMLPPProtocol>;
    getProtocolMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
    reset(): void;
    destroy(): Promise<void>;
}
export declare const DEFAULT_ROLE_PROTOCOL_CONFIG: RoleProtocolFactoryConfig;
//# sourceMappingURL=role-protocol.factory.d.ts.map