/**
 * DistributedLock - 分布式锁机制
 * 支持多种实现：Redis、Etcd、Zookeeper、Database
 * 包括锁获取、释放、续期、死锁检测和故障恢复
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
import { UUID, Timestamp } from '../../types';
export interface DistributedLockConfig {
    provider: LockProvider;
    connectionString: string;
    defaultTtl: number;
    renewalInterval: number;
    maxRetries: number;
    retryDelay: number;
    deadlockDetection: boolean;
    deadlockTimeout: number;
    lockTimeout: number;
    options: ProviderOptions;
}
export type LockProvider = 'redis' | 'etcd' | 'zookeeper' | 'database' | 'memory';
export interface ProviderOptions {
    redis?: RedisLockOptions;
    etcd?: EtcdLockOptions;
    zookeeper?: ZookeeperLockOptions;
    database?: DatabaseLockOptions;
}
export interface RedisLockOptions {
    keyPrefix: string;
    database: number;
    cluster: boolean;
    sentinels?: string[];
}
export interface EtcdLockOptions {
    keyPrefix: string;
    endpoints: string[];
    username?: string;
    password?: string;
}
export interface ZookeeperLockOptions {
    rootPath: string;
    sessionTimeout: number;
    connectionTimeout: number;
}
export interface DatabaseLockOptions {
    tableName: string;
    connectionPool: number;
    isolationLevel: 'read_committed' | 'repeatable_read' | 'serializable';
}
export interface LockInfo {
    lockId: UUID;
    resourceId: string;
    ownerId: string;
    lockType: LockType;
    status: LockStatus;
    acquiredAt: Timestamp;
    expiresAt: Timestamp;
    renewedAt?: Timestamp;
    metadata: LockMetadata;
}
export type LockType = 'exclusive' | 'shared' | 'read' | 'write';
export type LockStatus = 'acquired' | 'waiting' | 'expired' | 'released' | 'failed';
export interface LockMetadata {
    source: string;
    version: string;
    priority: number;
    tags: string[];
    context: Record<string, unknown>;
    renewalCount: number;
    maxRenewals: number;
}
export interface LockRequest {
    resourceId: string;
    ownerId: string;
    lockType: LockType;
    ttl?: number;
    timeout?: number;
    priority?: number;
    metadata?: Partial<LockMetadata>;
}
export interface LockResult {
    success: boolean;
    lockInfo?: LockInfo;
    error?: LockError;
    waitTime: number;
    attempts: number;
}
export interface LockError {
    errorType: LockErrorType;
    message: string;
    resourceId: string;
    ownerId: string;
    timestamp: Timestamp;
    context?: Record<string, unknown>;
}
export type LockErrorType = 'timeout' | 'already_locked' | 'invalid_owner' | 'expired' | 'connection_error' | 'deadlock_detected' | 'quota_exceeded' | 'permission_denied';
export interface DeadlockInfo {
    deadlockId: UUID;
    detectedAt: Timestamp;
    involvedLocks: LockInfo[];
    cycle: string[];
    resolution: DeadlockResolution;
}
export interface DeadlockResolution {
    strategy: 'abort_youngest' | 'abort_lowest_priority' | 'abort_random' | 'manual';
    abortedLocks: string[];
    reason: string;
}
export interface LockStatistics {
    totalLocks: number;
    activeLocks: number;
    waitingLocks: number;
    expiredLocks: number;
    successfulAcquisitions: number;
    failedAcquisitions: number;
    averageHoldTime: number;
    averageWaitTime: number;
    deadlockCount: number;
    renewalCount: number;
    connectionStatus: 'connected' | 'disconnected' | 'error';
}
export interface LockConnection {
    type: LockProvider;
    connected: boolean;
    locks?: Map<string, LockInfo>;
}
export declare class DistributedLockManager {
    private config;
    private provider;
    private connection;
    private activeLocks;
    private renewalTimers;
    private statistics;
    private deadlockDetector;
    constructor(config: DistributedLockConfig);
    /**
     * 连接到锁提供商
     */
    connect(): Promise<void>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 获取锁
     */
    acquireLock(request: LockRequest): Promise<LockResult>;
    /**
     * 释放锁
     */
    releaseLock(lockId: string): Promise<boolean>;
    /**
     * 续期锁
     */
    renewLock(lockId: string, ttl?: number): Promise<boolean>;
    /**
     * 获取锁信息
     */
    getLockInfo(lockId: string): LockInfo | null;
    /**
     * 获取资源的锁信息
     */
    getResourceLocks(resourceId: string): LockInfo[];
    /**
     * 获取统计信息
     */
    getStatistics(): LockStatistics;
    private connectRedis;
    private connectEtcd;
    private connectZookeeper;
    private connectDatabase;
    private connectMemory;
    private disconnectProvider;
    private tryAcquireLock;
    private tryAcquireRedisLock;
    private tryAcquireEtcdLock;
    private tryAcquireZookeeperLock;
    private tryAcquireDatabaseLock;
    private tryAcquireMemoryLock;
    private tryReleaseLock;
    private tryRenewLock;
    private startRenewal;
    private updateAverageHoldTime;
    private simulateConnection;
    private simulateDisconnection;
    private simulateNetworkCall;
    private generateUUID;
}
export declare class DeadlockDetector {
    private _lockManager;
    private detectionInterval;
    private detectionEnabled;
    constructor(lockManager: DistributedLockManager);
    start(): void;
    stop(): void;
    checkDeadlock(_request: LockRequest): Promise<DeadlockInfo | null>;
    private detectDeadlocks;
}
//# sourceMappingURL=distributed.lock.d.ts.map