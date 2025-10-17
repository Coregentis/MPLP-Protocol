import { NetworkProtocol } from '../protocols/network.protocol';
export declare class NetworkProtocolFactory {
    private static factoryInstance;
    private instances;
    private defaultConfig;
    constructor();
    createProtocol(instanceId?: string, config?: {}): Promise<NetworkProtocol>;
    getProtocol(instanceId?: string): NetworkProtocol | null;
    destroyProtocol(instanceId?: string): Promise<boolean>;
    getAllProtocols(): Map<string, NetworkProtocol>;
    getProtocolStatus(instanceId?: string): {
        instanceId: string;
        initialized: boolean;
        active: boolean;
        errorCount: number;
        lastHealthCheck: string | null;
        metrics: {
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        timestamp: string;
    } | null;
    getAllProtocolStatus(): {
        instanceId: string;
        initialized: boolean;
        active: boolean;
        errorCount: number;
        lastHealthCheck: string | null;
        metrics: {
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        timestamp: string;
    }[];
    restartProtocol(instanceId?: string, newConfig?: {}): Promise<NetworkProtocol>;
    createMultipleProtocols(configs: Record<string, unknown>[]): Promise<NetworkProtocol[]>;
    healthCheckAll(): Promise<Record<string, unknown>>;
    cleanup(): Promise<boolean>;
    getFactoryStats(): Record<string, unknown>;
    setDefaultConfig(config: Record<string, unknown>): void;
    getDefaultConfig(): Record<string, unknown>;
    static create(_config?: Record<string, unknown>): NetworkProtocol;
    static createWithDefaults(): NetworkProtocol;
    static createForTesting(): NetworkProtocol;
    static createForProduction(): NetworkProtocol;
    private static singletonInstance;
    static getInstance(): NetworkProtocol;
    static resetInstance(): void;
}
//# sourceMappingURL=network-protocol.factory.d.ts.map