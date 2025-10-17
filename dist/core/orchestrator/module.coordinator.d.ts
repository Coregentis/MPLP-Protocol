import { UUID, Timestamp } from '../../modules/core/types';
export interface ModuleInfo {
    moduleId: string;
    moduleName: string;
    version: string;
    status: ModuleStatus;
    services: ServiceInfo[];
    endpoints: ModuleEndpoint[];
    healthCheck: HealthCheckConfig;
    metadata: ModuleMetadata;
    registeredAt: Timestamp;
    lastHeartbeat: Timestamp;
}
export type ModuleStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export interface ServiceInfo {
    serviceId: string;
    serviceName: string;
    description?: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    timeout: number;
    retryPolicy: RetryPolicy;
}
export interface ModuleEndpoint {
    endpointId: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    authentication?: AuthenticationConfig;
}
export interface HealthCheckConfig {
    endpoint: string;
    interval: number;
    timeout: number;
    retries: number;
}
export interface ModuleMetadata {
    capabilities: string[];
    dependencies: string[];
    resources: ResourceRequirements;
    tags: Record<string, string>;
}
export interface AuthenticationConfig {
    type: 'bearer' | 'api_key' | 'basic';
    credentials: Record<string, string>;
}
export interface RetryPolicy {
    maxRetries: number;
    retryDelay: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    retryableErrors: string[];
}
export interface ResourceRequirements {
    cpuCores: number;
    memoryMb: number;
    diskSpaceMb: number;
    networkBandwidth: number;
}
export interface ServiceRequest {
    requestId: UUID;
    moduleId: string;
    serviceId: string;
    parameters: Record<string, unknown>;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    metadata?: Record<string, unknown>;
    timestamp: Timestamp;
}
export interface ServiceResult {
    requestId: UUID;
    moduleId: string;
    serviceId: string;
    status: 'success' | 'error' | 'timeout';
    result?: Record<string, unknown>;
    error?: ServiceError;
    duration: number;
    timestamp: Timestamp;
}
export interface ServiceError {
    errorCode: string;
    errorMessage: string;
    errorType: 'validation' | 'execution' | 'timeout' | 'network' | 'authentication';
    retryable: boolean;
    details?: Record<string, unknown>;
}
export interface CoordinationRequest {
    coordinationId: UUID;
    modules: string[];
    operation: string;
    parameters: Record<string, unknown>;
    coordinationType: 'sequential' | 'parallel' | 'conditional';
    timeout: number;
    timestamp: Timestamp;
}
export interface CoordinationResult {
    coordinationId: UUID;
    status: 'success' | 'partial_success' | 'failure';
    results: ModuleResult[];
    duration: number;
    errors: CoordinationError[];
    timestamp: Timestamp;
}
export interface ModuleResult {
    moduleId: string;
    status: 'success' | 'error' | 'skipped';
    result?: Record<string, unknown>;
    error?: ServiceError;
    duration: number;
}
export interface CoordinationError {
    moduleId: string;
    errorType: string;
    message: string;
    retryCount: number;
}
export interface ModuleError {
    errorId: UUID;
    moduleId: string;
    serviceId?: string;
    errorType: 'connection' | 'timeout' | 'validation' | 'execution' | 'authentication';
    message: string;
    originalError?: Error;
    timestamp: Timestamp;
    context?: Record<string, unknown>;
}
export interface ErrorHandlingResult {
    handled: boolean;
    action: 'retry' | 'skip' | 'abort' | 'fallback';
    retryAfter?: number;
    fallbackResult?: Record<string, unknown>;
}
export interface FailedOperation {
    operationId: UUID;
    moduleId: string;
    serviceId: string;
    parameters: Record<string, unknown>;
    error: ModuleError;
    retryCount: number;
    maxRetries: number;
    lastAttempt: Timestamp;
}
export interface RetryResult {
    operationId: UUID;
    status: 'success' | 'failed' | 'max_retries_exceeded';
    result?: ServiceResult;
    error?: ModuleError;
    totalRetries: number;
}
export declare class ModuleCoordinator {
    private connectionTimeout;
    private defaultRetryPolicy;
    private registeredModules;
    private activeConnections;
    private pendingRequests;
    private failedOperations;
    constructor(connectionTimeout?: number, defaultRetryPolicy?: RetryPolicy);
    registerModule(module: ModuleInfo): Promise<void>;
    discoverModules(): Promise<ModuleInfo[]>;
    invokeModuleService(moduleId: string, serviceId: string, parameters: Record<string, unknown>): Promise<ServiceResult>;
    coordinateModules(modules: string[], operation: string): Promise<CoordinationResult>;
    handleModuleError(error: ModuleError): Promise<ErrorHandlingResult>;
    retryOperation(operation: FailedOperation): Promise<RetryResult>;
    private validateModuleInfo;
    private checkModuleHealth;
    private establishConnection;
    private getModuleConnection;
    private validateServiceParameters;
    private executeServiceCall;
    private isRetryableError;
    private calculateRetryDelay;
    private generateUUID;
}
export interface ModuleConnection {
    moduleId: string;
    endpoint: string;
    status: 'connected' | 'disconnected' | 'error';
    lastUsed: Timestamp;
}
//# sourceMappingURL=module.coordinator.d.ts.map