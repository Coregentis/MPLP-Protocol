import { UUID, Timestamp } from '../../types';
export interface LoadBalancerConfig {
    strategy: LoadBalancingStrategy;
    healthCheckEnabled: boolean;
    healthCheckInterval: number;
    healthCheckTimeout: number;
    failoverEnabled: boolean;
    maxRetries: number;
    retryDelay: number;
    circuitBreakerEnabled: boolean;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
    stickySessionEnabled: boolean;
    stickySessionTtl: number;
}
export type LoadBalancingStrategy = 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'weighted_least_connections' | 'response_time' | 'random' | 'consistent_hash' | 'ip_hash';
export interface ServiceInstance {
    instanceId: UUID;
    serviceName: string;
    address: string;
    port: number;
    protocol: string;
    weight: number;
    priority: number;
    status: InstanceStatus;
    healthStatus: HealthStatus;
    metrics: InstanceMetrics;
    metadata: InstanceMetadata;
    createdAt: Timestamp;
    lastSeen: Timestamp;
}
export type InstanceStatus = 'active' | 'inactive' | 'draining' | 'maintenance';
export interface HealthStatus {
    isHealthy: boolean;
    lastCheck: Timestamp;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    responseTime: number;
    errorMessage?: string;
}
export interface InstanceMetrics {
    activeConnections: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTime: Timestamp;
    cpuUsage: number;
    memoryUsage: number;
}
export interface InstanceMetadata {
    region?: string;
    zone?: string;
    version: string;
    capabilities: string[];
    tags: Record<string, string>;
}
export interface RoutingRule {
    ruleId: UUID;
    name: string;
    priority: number;
    conditions: RoutingCondition[];
    actions: RoutingAction[];
    enabled: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface RoutingCondition {
    type: 'path' | 'header' | 'query' | 'method' | 'ip' | 'user_agent';
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'in';
    value: string | string[];
    expectedValue?: string;
    caseSensitive?: boolean;
}
export interface RoutingAction {
    type: 'route' | 'redirect' | 'rewrite' | 'block' | 'rate_limit';
    target?: string;
    parameters?: Record<string, unknown>;
}
export interface RoutingRequest {
    requestId: UUID;
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body?: unknown;
    clientIp: string;
    userAgent: string;
    timestamp: Timestamp;
    sessionId?: string;
}
export interface RoutingResult {
    requestId: UUID;
    selectedInstance: ServiceInstance | null;
    routingRule?: RoutingRule;
    strategy: LoadBalancingStrategy;
    attempts: RoutingAttempt[];
    totalTime: number;
    success: boolean;
    error?: string;
}
export interface RoutingAttempt {
    instanceId: UUID;
    startTime: Timestamp;
    endTime?: Timestamp;
    responseTime?: number;
    success: boolean;
    error?: string;
}
export interface CircuitBreakerState {
    instanceId: UUID;
    state: 'closed' | 'open' | 'half_open';
    failureCount: number;
    successCount: number;
    lastFailureTime?: Timestamp;
    nextRetryTime?: Timestamp;
}
export interface StickySession {
    sessionId: string;
    instanceId: UUID;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    requestCount: number;
}
export declare class LoadBalancer {
    private config;
    private instances;
    private roundRobinCounters;
    private circuitBreakers;
    private stickySessions;
    private routingRules;
    private healthCheckInterval;
    constructor(config?: Partial<LoadBalancerConfig>);
    registerInstance(instance: ServiceInstance): void;
    unregisterInstance(instanceId: UUID): void;
    addRoutingRule(rule: RoutingRule): void;
    routeRequest(request: RoutingRequest): Promise<RoutingResult>;
    private selectInstance;
    private roundRobinSelect;
    private weightedRoundRobinSelect;
    private leastConnectionsSelect;
    private weightedLeastConnectionsSelect;
    private responseTimeSelect;
    private randomSelect;
    private consistentHashSelect;
    private ipHashSelect;
    private getAvailableInstances;
    private findMatchingRule;
    private matchesConditions;
    private matchesCondition;
    private shouldBlockRequest;
    private processRequest;
    private updateInstanceMetrics;
    private isCircuitBreakerOpen;
    private updateCircuitBreaker;
    private updateStickySession;
    private startHealthChecking;
    private performHealthCheck;
    private updateHealthStatus;
    private hashString;
    getStatistics(): LoadBalancerStatistics;
    destroy(): void;
}
export interface LoadBalancerStatistics {
    totalInstances: number;
    healthyInstances: number;
    totalRequests: number;
    successfulRequests: number;
    successRate: number;
    averageResponseTime: number;
    activeCircuitBreakers: number;
    activeSessions: number;
}
//# sourceMappingURL=load.balancer.d.ts.map