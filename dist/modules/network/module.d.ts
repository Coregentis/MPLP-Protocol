import { NetworkModuleAdapter } from './infrastructure/adapters/network-module.adapter';
import { NetworkController } from './api/controllers/network.controller';
import { NetworkManagementService } from './application/services/network-management.service';
import { MemoryNetworkRepository } from './infrastructure/repositories/network.repository';
export interface NetworkModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    networkTimeout?: number;
    maxConnections?: number;
}
export declare class NetworkModule {
    private adapter;
    private controller;
    private service;
    private repository;
    constructor(options?: NetworkModuleOptions);
    static initialize(options?: NetworkModuleOptions): Promise<NetworkModule>;
    startup(): Promise<void>;
    shutdown(): Promise<void>;
    getController(): NetworkController;
    getService(): NetworkManagementService;
    getRepository(): MemoryNetworkRepository;
    getAdapter(): NetworkModuleAdapter;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
        timestamp: string;
    }>;
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        author: string;
        license: string;
        dependencies: {
            typescript: string;
        };
        features: string[];
        capabilities: {
            maxNetworks: number;
            maxNodesPerNetwork: number;
            maxConnectionsPerNode: number;
            supportedTopologies: string[];
            supportedProtocols: string[];
            discoveryMechanisms: string[];
            routingAlgorithms: string[];
        };
        performance: {
            networkLatency: string;
            connectionSuccess: string;
            topologyEfficiency: string;
            routingCalculation: string;
            nodeDiscovery: string;
            failoverTime: string;
        };
        crossCuttingConcerns: string[];
    };
    coordinateWithContext(_contextId: string, _operation: string): Promise<boolean>;
    coordinateWithPlan(_planId: string, _networkRequirements: Record<string, unknown>): Promise<boolean>;
    coordinateWithRole(_roleId: string, _networkPermissions: Record<string, unknown>): Promise<boolean>;
    coordinateWithConfirm(_confirmId: string, _networkChanges: Record<string, unknown>): Promise<boolean>;
    coordinateWithTrace(_traceId: string, _networkMetrics: Record<string, unknown>): Promise<boolean>;
    coordinateWithExtension(_extensionId: string, _networkExtensions: Record<string, unknown>): Promise<boolean>;
    coordinateWithDialog(_dialogId: string, _networkCommunication: Record<string, unknown>): Promise<boolean>;
    coordinateWithCollab(_collabId: string, _networkCollaboration: Record<string, unknown>): Promise<boolean>;
    coordinateWithCore(_coreOperation: string, _networkData: Record<string, unknown>): Promise<boolean>;
    handleOrchestrationScenario(_scenarioType: string, _scenarioData: Record<string, unknown>): Promise<Record<string, unknown>>;
}
export declare const NetworkModuleInfo: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    dependencies: {
        typescript: string;
    };
    features: string[];
    mplpIntegration: {
        supportedModules: string[];
        orchestrationScenarios: string[];
        crossCuttingConcerns: string[];
    };
};
//# sourceMappingURL=module.d.ts.map