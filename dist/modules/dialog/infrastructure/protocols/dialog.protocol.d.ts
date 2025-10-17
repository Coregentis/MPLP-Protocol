import { DialogManagementService } from '../../application/services/dialog-management.service';
export interface IMLPPProtocol {
    readonly protocolName: string;
    readonly protocolVersion: string;
    readonly moduleId: string;
    readonly capabilities: string[];
    readonly dependencies: string[];
    initialize(config?: unknown): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ProtocolHealthStatus>;
    getStatus(): Promise<ProtocolStatus>;
    getMetrics(): Promise<ProtocolMetrics>;
    sendMessage(targetModule: string, message: unknown): Promise<void>;
    receiveMessage(sourceModule: string, message: unknown): Promise<unknown>;
    broadcastMessage(message: unknown): Promise<void>;
    updateConfiguration(config: unknown): Promise<void>;
    getConfiguration(): Promise<unknown>;
    validateConfiguration(config: unknown): Promise<boolean>;
}
export interface ProtocolHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    timestamp: string;
    checks: HealthCheck[];
    metrics: Record<string, number>;
    errors: string[];
}
export interface ProtocolStatus {
    state: 'initializing' | 'running' | 'stopping' | 'stopped' | 'error';
    uptime: number;
    lastActivity: string;
    activeConnections: number;
    processedRequests: number;
}
export interface ProtocolMetrics {
    performance: {
        averageResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
        throughput: number;
    };
    resources: {
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        networkUsage: number;
    };
    business: {
        activeDialogs: number;
        totalDialogs: number;
        dialogsPerHour: number;
        averageDialogDuration: number;
    };
}
export interface HealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration: number;
    timestamp: string;
}
export declare class DialogProtocol implements IMLPPProtocol {
    private readonly dialogManagementService;
    readonly protocolName = "MPLP-Dialog";
    readonly protocolVersion = "1.0.0";
    readonly moduleId = "dialog";
    readonly capabilities: string[];
    readonly dependencies: string[];
    private _status;
    private _startTime;
    private _lastActivity;
    private _activeConnections;
    private _processedRequests;
    private _configuration;
    constructor(dialogManagementService: DialogManagementService);
    initialize(_config?: unknown): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ProtocolHealthStatus>;
    getStatus(): Promise<ProtocolStatus>;
    getMetrics(): Promise<ProtocolMetrics>;
    sendMessage(_targetModule: string, _message: unknown): Promise<void>;
    receiveMessage(_sourceModule: string, _message: unknown): Promise<unknown>;
    broadcastMessage(_message: unknown): Promise<void>;
    updateConfiguration(_config: unknown): Promise<void>;
    getConfiguration(): Promise<unknown>;
    validateConfiguration(_config: unknown): Promise<boolean>;
}
//# sourceMappingURL=dialog.protocol.d.ts.map