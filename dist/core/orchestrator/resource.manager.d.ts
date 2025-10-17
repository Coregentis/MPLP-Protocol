import { UUID, Timestamp } from '../../modules/core/types';
export interface ResourceRequirements {
    cpuCores: number;
    memoryMb: number;
    diskSpaceMb: number;
    networkBandwidth: number;
    maxConnections: number;
    estimatedDuration: number;
    priority: ResourcePriority;
}
export type ResourcePriority = 'low' | 'normal' | 'high' | 'critical';
export interface ResourceAllocation {
    allocationId: UUID;
    requirements: ResourceRequirements;
    allocatedResources: AllocatedResources;
    status: AllocationStatus;
    createdAt: Timestamp;
    expiresAt?: Timestamp;
    metadata?: Record<string, unknown>;
}
export type AllocationStatus = 'pending' | 'allocated' | 'active' | 'released' | 'expired';
export interface AllocatedResources {
    cpuCores: number;
    memoryMb: number;
    diskSpaceMb: number;
    networkBandwidth: number;
    connections: ConnectionAllocation[];
    reservedUntil: Timestamp;
}
export interface ConnectionAllocation {
    connectionId: UUID;
    moduleId: string;
    endpoint: string;
    status: 'active' | 'idle' | 'error';
    createdAt: Timestamp;
    lastUsed: Timestamp;
    usageCount: number;
}
export interface ResourceUsage {
    timestamp: Timestamp;
    cpu: CpuUsage;
    memory: MemoryUsage;
    disk: DiskUsage;
    network: NetworkUsage;
    connections: ConnectionUsage;
    overall: OverallUsage;
}
export interface CpuUsage {
    totalCores: number;
    usedCores: number;
    utilizationPercentage: number;
    loadAverage: number[];
    processes: ProcessUsage[];
}
export interface ProcessUsage {
    processId: string;
    cpuPercentage: number;
    memoryMb: number;
    startTime: Timestamp;
}
export interface MemoryUsage {
    totalMb: number;
    usedMb: number;
    availableMb: number;
    utilizationPercentage: number;
    heapUsage: HeapUsage;
    gcStats: GcStats;
}
export interface HeapUsage {
    totalMb: number;
    usedMb: number;
    externalMb: number;
}
export interface GcStats {
    collections: number;
    totalDuration: number;
    averageDuration: number;
    lastCollection: Timestamp;
}
export interface DiskUsage {
    totalMb: number;
    usedMb: number;
    availableMb: number;
    utilizationPercentage: number;
    ioStats: IoStats;
}
export interface IoStats {
    readOperations: number;
    writeOperations: number;
    readMb: number;
    writeMb: number;
}
export interface NetworkUsage {
    totalBandwidth: number;
    usedBandwidth: number;
    utilizationPercentage: number;
    activeConnections: number;
    totalConnections: number;
    trafficStats: TrafficStats;
}
export interface TrafficStats {
    inboundMb: number;
    outboundMb: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
}
export interface ConnectionUsage {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    errorConnections: number;
    poolUtilization: number;
    averageResponseTime: number;
}
export interface OverallUsage {
    healthScore: number;
    performanceScore: number;
    resourceEfficiency: number;
    bottlenecks: string[];
    recommendations: string[];
}
export interface ResourceLimits {
    maxCpuCores: number;
    maxMemoryMb: number;
    maxDiskSpaceMb: number;
    maxNetworkBandwidth: number;
    maxConnections: number;
    maxConcurrentAllocations: number;
    allocationTimeout: number;
}
export interface ResourceLimitStatus {
    limits: ResourceLimits;
    current: ResourceUsage;
    violations: ResourceViolation[];
    warnings: ResourceWarning[];
    recommendations: string[];
}
export interface ResourceViolation {
    violationId: UUID;
    resourceType: string;
    limit: number;
    current: number;
    severity: 'warning' | 'error' | 'critical';
    timestamp: Timestamp;
    action: 'throttle' | 'reject' | 'cleanup';
}
export interface ResourceWarning {
    warningId: UUID;
    resourceType: string;
    threshold: number;
    current: number;
    message: string;
    timestamp: Timestamp;
}
export interface ModuleConnection {
    connectionId: UUID;
    moduleId: string;
    endpoint: string;
    status: 'connecting' | 'connected' | 'idle' | 'active' | 'error' | 'closed';
    createdAt: Timestamp;
    lastUsed: Timestamp;
    usageCount: number;
    errorCount: number;
    metadata?: Record<string, unknown>;
}
export interface ConnectionPoolConfig {
    minConnections: number;
    maxConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
    maxRetries: number;
    healthCheckInterval: number;
}
export interface ConnectionPoolStats {
    poolId: string;
    moduleId: string;
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    errorConnections: number;
    waitingRequests: number;
    averageWaitTime: number;
    averageResponseTime: number;
    successRate: number;
}
export interface CachedResult {
    key: string;
    value: unknown;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    accessCount: number;
    lastAccessed: Timestamp;
    size: number;
}
export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
    expiredCount: number;
}
export declare class ResourceManager {
    private allocations;
    private connectionPools;
    private cache;
    private resourceLimits;
    private monitoringInterval;
    constructor(limits?: Partial<ResourceLimits>);
    allocateResources(requirements: ResourceRequirements): Promise<ResourceAllocation>;
    releaseResources(allocationId: string): Promise<void>;
    monitorResourceUsage(): Promise<ResourceUsage>;
    checkResourceLimits(): Promise<ResourceLimitStatus>;
    getConnection(moduleId: string): Promise<ModuleConnection>;
    releaseConnection(connection: ModuleConnection): Promise<void>;
    getCachedResult(key: string): Promise<CachedResult | null>;
    setCachedResult(key: string, result: unknown, ttl: number): Promise<void>;
    private canAllocateResources;
    private getTotalConnections;
    private getTotalActiveConnections;
    private getTotalIdleConnections;
    private getTotalErrorConnections;
    private getPoolUtilization;
    private calculateHealthScore;
    private calculatePerformanceScore;
    private calculateResourceEfficiency;
    private identifyBottlenecks;
    private generateRecommendations;
    private startResourceMonitoring;
    private cleanupExpiredAllocations;
    private cleanupExpiredCache;
    private generateUUID;
    destroy(): void;
}
//# sourceMappingURL=resource.manager.d.ts.map