import { UUID, Timestamp } from '../../types';
export interface ServiceDiscoveryConfig {
    provider: ServiceDiscoveryProvider;
    endpoints: string[];
    timeout: number;
    retryAttempts: number;
    healthCheckInterval: number;
    ttl: number;
    authentication?: AuthenticationConfig;
}
export type ServiceDiscoveryProvider = 'consul' | 'etcd' | 'zookeeper' | 'memory';
export interface AuthenticationConfig {
    type: 'token' | 'basic' | 'certificate';
    credentials: Record<string, string>;
}
export interface ServiceRegistration {
    serviceId: UUID;
    serviceName: string;
    version: string;
    address: string;
    port: number;
    protocol: 'http' | 'https' | 'tcp' | 'grpc';
    metadata: ServiceMetadata;
    healthCheck: HealthCheckConfig;
    tags: string[];
    registeredAt: Timestamp;
    lastHeartbeat: Timestamp;
}
export interface ServiceMetadata {
    moduleId: string;
    capabilities: string[];
    dependencies: string[];
    environment: string;
    region?: string;
    zone?: string;
    weight: number;
    priority: number;
}
export interface HealthCheckConfig {
    type: 'http' | 'tcp' | 'script' | 'ttl';
    endpoint?: string;
    interval: number;
    timeout: number;
    retries: number;
    deregisterAfter: number;
}
export interface ServiceInstance {
    instanceId: UUID;
    serviceId: UUID;
    serviceName: string;
    version: string;
    address: string;
    port: number;
    protocol: string;
    status: ServiceStatus;
    metadata: ServiceMetadata;
    healthStatus: HealthStatus;
    lastSeen: Timestamp;
}
export type ServiceStatus = 'active' | 'inactive' | 'maintenance' | 'error';
export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
    lastCheck: Timestamp;
    consecutiveFailures: number;
    message?: string;
    responseTime?: number;
}
export interface ServiceQuery {
    serviceName?: string;
    tags?: string[];
    metadata?: Record<string, string>;
    healthyOnly?: boolean;
    region?: string;
    zone?: string;
}
export interface LoadBalancingStrategy {
    name: string;
    selectInstance(instances: ServiceInstance[]): ServiceInstance | null;
}
export interface LoadBalancingConfig {
    strategy: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'random' | 'consistent_hash';
    healthCheckEnabled: boolean;
    failoverEnabled: boolean;
    maxRetries: number;
}
export declare class ServiceDiscovery {
    private config;
    private registeredServices;
    private serviceInstances;
    private healthCheckInterval;
    private loadBalancer;
    constructor(config: ServiceDiscoveryConfig);
    registerService(registration: Omit<ServiceRegistration, 'serviceId' | 'registeredAt' | 'lastHeartbeat'>): Promise<ServiceRegistration>;
    deregisterService(serviceId: UUID): Promise<void>;
    discoverServices(query?: ServiceQuery): Promise<ServiceInstance[]>;
    getServiceInstance(serviceName: string, query?: ServiceQuery): Promise<ServiceInstance | null>;
    updateHealthStatus(serviceId: UUID, status: HealthStatus): Promise<void>;
    performHealthCheck(registration: ServiceRegistration): Promise<HealthStatus>;
    private registerWithConsul;
    private registerWithEtcd;
    private registerWithZookeeper;
    private registerInMemory;
    private deregisterFromConsul;
    private deregisterFromEtcd;
    private deregisterFromZookeeper;
    private deregisterFromMemory;
    private discoverFromConsul;
    private discoverFromEtcd;
    private discoverFromZookeeper;
    private discoverFromMemory;
    private performHttpHealthCheck;
    private performTcpHealthCheck;
    private performTtlHealthCheck;
    private updateConsulHealth;
    private updateEtcdHealth;
    private updateZookeeperHealth;
    private updateMemoryHealth;
    private filterInstances;
    private startHealthChecking;
    private simulateNetworkCall;
    private generateUUID;
    destroy(): void;
}
export declare class LoadBalancer {
    private config;
    private roundRobinCounters;
    constructor(config: LoadBalancingConfig);
    selectInstance(instances: ServiceInstance[]): ServiceInstance | null;
    private roundRobinSelect;
    private weightedRoundRobinSelect;
    private randomSelect;
    private leastConnectionsSelect;
}
//# sourceMappingURL=service.discovery.d.ts.map