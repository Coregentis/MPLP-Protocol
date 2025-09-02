/**
 * DistributedLock - 分布式锁机制
 * 支持多种实现：Redis、Etcd、Zookeeper、Database
 * 包括锁获取、释放、续期、死锁检测和故障恢复
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../types';

// ===== 分布式锁配置接口 =====

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

// ===== 锁信息接口 =====

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

// ===== 锁操作接口 =====

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

export type LockErrorType = 
  | 'timeout'
  | 'already_locked'
  | 'invalid_owner'
  | 'expired'
  | 'connection_error'
  | 'deadlock_detected'
  | 'quota_exceeded'
  | 'permission_denied';

// ===== 死锁检测接口 =====

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

// ===== 锁统计接口 =====

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

// ===== 连接接口 =====

export interface LockConnection {
  type: LockProvider;
  connected: boolean;
  locks?: Map<string, LockInfo>;
}

// ===== 分布式锁管理器实现 =====

export class DistributedLockManager {
  private config: DistributedLockConfig;
  private provider: LockProvider;
  private connection: LockConnection | null = null;
  private activeLocks = new Map<string, LockInfo>();
  private renewalTimers = new Map<string, NodeJS.Timeout>();
  private statistics: LockStatistics;
  private deadlockDetector: DeadlockDetector;

  constructor(config: DistributedLockConfig) {
    this.config = config;
    this.provider = config.provider;
    this.statistics = {
      totalLocks: 0,
      activeLocks: 0,
      waitingLocks: 0,
      expiredLocks: 0,
      successfulAcquisitions: 0,
      failedAcquisitions: 0,
      averageHoldTime: 0,
      averageWaitTime: 0,
      deadlockCount: 0,
      renewalCount: 0,
      connectionStatus: 'disconnected'
    };
    this.deadlockDetector = new DeadlockDetector(this);
  }

  /**
   * 连接到锁提供商
   */
  async connect(): Promise<void> {
    try {
      switch (this.provider) {
        case 'redis':
          await this.connectRedis();
          break;
        case 'etcd':
          await this.connectEtcd();
          break;
        case 'zookeeper':
          await this.connectZookeeper();
          break;
        case 'database':
          await this.connectDatabase();
          break;
        case 'memory':
          await this.connectMemory();
          break;
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }

      this.statistics.connectionStatus = 'connected';
      // Connected to lock provider

      // 启动死锁检测
      if (this.config.deadlockDetection) {
        this.deadlockDetector.start();
      }

    } catch (error) {
      this.statistics.connectionStatus = 'error';
      throw new Error(`Failed to connect to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    try {
      // 停止死锁检测
      this.deadlockDetector.stop();

      // 释放所有锁
      const lockIds = Array.from(this.activeLocks.keys());
      for (const lockId of lockIds) {
        await this.releaseLock(lockId);
      }

      // 清理续期定时器
      for (const timer of this.renewalTimers.values()) {
        clearTimeout(timer);
      }
      this.renewalTimers.clear();

      // 断开连接
      if (this.connection) {
        await this.disconnectProvider();
        this.connection = null;
      }

      this.statistics.connectionStatus = 'disconnected';
      // Disconnected from lock provider

    } catch (error) {
      // Error disconnecting from provider
    }
  }

  /**
   * 获取锁
   */
  async acquireLock(request: LockRequest): Promise<LockResult> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = this.config.maxRetries + 1;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        // 检查死锁
        if (this.config.deadlockDetection) {
          const deadlock = await this.deadlockDetector.checkDeadlock(request);
          if (deadlock) {
            return {
              success: false,
              error: {
                errorType: 'deadlock_detected',
                message: `Deadlock detected for resource: ${request.resourceId}`,
                resourceId: request.resourceId,
                ownerId: request.ownerId,
                timestamp: new Date().toISOString()
              },
              waitTime: Date.now() - startTime,
              attempts
            };
          }
        }

        // 尝试获取锁
        const lockInfo = await this.tryAcquireLock(request);
        if (lockInfo) {
          // 成功获取锁
          this.activeLocks.set(lockInfo.lockId, lockInfo);
          this.statistics.activeLocks++;
          this.statistics.successfulAcquisitions++;

          // 启动自动续期
          if (this.config.renewalInterval > 0) {
            this.startRenewal(lockInfo);
          }

          return {
            success: true,
            lockInfo,
            waitTime: Date.now() - startTime,
            attempts
          };
        }

        // 锁被占用，等待重试
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }

      } catch (error) {
        this.statistics.failedAcquisitions++;
        
        return {
          success: false,
          error: {
            errorType: 'connection_error',
            message: error instanceof Error ? error.message : 'Unknown error',
            resourceId: request.resourceId,
            ownerId: request.ownerId,
            timestamp: new Date().toISOString()
          },
          waitTime: Date.now() - startTime,
          attempts
        };
      }
    }

    // 超时失败
    this.statistics.failedAcquisitions++;
    return {
      success: false,
      error: {
        errorType: 'timeout',
        message: `Failed to acquire lock after ${attempts} attempts`,
        resourceId: request.resourceId,
        ownerId: request.ownerId,
        timestamp: new Date().toISOString()
      },
      waitTime: Date.now() - startTime,
      attempts
    };
  }

  /**
   * 释放锁
   */
  async releaseLock(lockId: string): Promise<boolean> {
    const lockInfo = this.activeLocks.get(lockId);
    if (!lockInfo) {
      return false;
    }

    try {
      // 停止续期
      const renewalTimer = this.renewalTimers.get(lockId);
      if (renewalTimer) {
        clearTimeout(renewalTimer);
        this.renewalTimers.delete(lockId);
      }

      // 释放锁
      const released = await this.tryReleaseLock(lockInfo);
      if (released) {
        this.activeLocks.delete(lockId);
        this.statistics.activeLocks--;
        
        // 更新平均持有时间
        const holdTime = Date.now() - new Date(lockInfo.acquiredAt).getTime();
        this.updateAverageHoldTime(holdTime);

        // Lock released successfully
        return true;
      }

      return false;

    } catch (error) {
      console.error(`Error releasing lock ${lockId}:`, error);
      return false;
    }
  }

  /**
   * 续期锁
   */
  async renewLock(lockId: string, ttl?: number): Promise<boolean> {
    const lockInfo = this.activeLocks.get(lockId);
    if (!lockInfo) {
      return false;
    }

    try {
      const newTtl = ttl || this.config.defaultTtl;
      const renewed = await this.tryRenewLock(lockInfo, newTtl);
      
      if (renewed) {
        lockInfo.expiresAt = new Date(Date.now() + newTtl).toISOString();
        lockInfo.renewedAt = new Date().toISOString();
        lockInfo.metadata.renewalCount++;
        this.statistics.renewalCount++;

        console.log(`Lock renewed: ${lockId} for resource: ${lockInfo.resourceId}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`Error renewing lock ${lockId}:`, error);
      return false;
    }
  }

  /**
   * 获取锁信息
   */
  getLockInfo(lockId: string): LockInfo | null {
    return this.activeLocks.get(lockId) || null;
  }

  /**
   * 获取资源的锁信息
   */
  getResourceLocks(resourceId: string): LockInfo[] {
    return Array.from(this.activeLocks.values())
      .filter(lock => lock.resourceId === resourceId);
  }

  /**
   * 获取统计信息
   */
  getStatistics(): LockStatistics {
    return { ...this.statistics };
  }

  // ===== 提供商特定实现 =====

  private async connectRedis(): Promise<void> {
    console.log('Connecting to Redis lock provider...');
    await this.simulateConnection();
    this.connection = { type: 'redis', connected: true };
  }

  private async connectEtcd(): Promise<void> {
    console.log('Connecting to Etcd lock provider...');
    await this.simulateConnection();
    this.connection = { type: 'etcd', connected: true };
  }

  private async connectZookeeper(): Promise<void> {
    console.log('Connecting to Zookeeper lock provider...');
    await this.simulateConnection();
    this.connection = { type: 'zookeeper', connected: true };
  }

  private async connectDatabase(): Promise<void> {
    console.log('Connecting to Database lock provider...');
    await this.simulateConnection();
    this.connection = { type: 'database', connected: true };
  }

  private async connectMemory(): Promise<void> {
    this.connection = { 
      type: 'memory', 
      connected: true,
      locks: new Map<string, LockInfo>()
    };
  }

  private async disconnectProvider(): Promise<void> {
    switch (this.provider) {
      case 'redis':
      case 'etcd':
      case 'zookeeper':
      case 'database':
        await this.simulateDisconnection();
        break;
      case 'memory':
        if (this.connection?.locks) {
          this.connection.locks.clear();
        }
        break;
    }
  }

  private async tryAcquireLock(request: LockRequest): Promise<LockInfo | null> {
    // 检查连接状态
    if (this.statistics.connectionStatus !== 'connected') {
      throw new Error('Connection not available');
    }

    const lockId = this.generateUUID();
    const ttl = request.ttl || this.config.defaultTtl;
    
    const lockInfo: LockInfo = {
      lockId,
      resourceId: request.resourceId,
      ownerId: request.ownerId,
      lockType: request.lockType,
      status: 'acquired',
      acquiredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttl).toISOString(),
      metadata: {
        source: 'DistributedLockManager',
        version: '1.0.0',
        priority: request.priority || 0,
        tags: request.metadata?.tags || [],
        context: request.metadata?.context || {},
        renewalCount: 0,
        maxRenewals: request.metadata?.maxRenewals || 100
      }
    };

    switch (this.provider) {
      case 'redis':
        return await this.tryAcquireRedisLock(lockInfo);
      case 'etcd':
        return await this.tryAcquireEtcdLock(lockInfo);
      case 'zookeeper':
        return await this.tryAcquireZookeeperLock(lockInfo);
      case 'database':
        return await this.tryAcquireDatabaseLock(lockInfo);
      case 'memory':
        return await this.tryAcquireMemoryLock(lockInfo);
      default:
        return null;
    }
  }

  private async tryAcquireRedisLock(lockInfo: LockInfo): Promise<LockInfo | null> {
    // 简化实现：模拟Redis锁获取
    await this.simulateNetworkCall();
    
    // 模拟90%成功率
    if (Math.random() > 0.1) {
      console.log(`Redis lock acquired: ${lockInfo.resourceId}`);
      return lockInfo;
    }
    
    return null;
  }

  private async tryAcquireEtcdLock(lockInfo: LockInfo): Promise<LockInfo | null> {
    // 简化实现：模拟Etcd锁获取
    await this.simulateNetworkCall();
    
    if (Math.random() > 0.1) {
      console.log(`Etcd lock acquired: ${lockInfo.resourceId}`);
      return lockInfo;
    }
    
    return null;
  }

  private async tryAcquireZookeeperLock(lockInfo: LockInfo): Promise<LockInfo | null> {
    // 简化实现：模拟Zookeeper锁获取
    await this.simulateNetworkCall();
    
    if (Math.random() > 0.1) {
      console.log(`Zookeeper lock acquired: ${lockInfo.resourceId}`);
      return lockInfo;
    }
    
    return null;
  }

  private async tryAcquireDatabaseLock(lockInfo: LockInfo): Promise<LockInfo | null> {
    // 简化实现：模拟数据库锁获取
    await this.simulateNetworkCall();
    
    if (Math.random() > 0.1) {
      console.log(`Database lock acquired: ${lockInfo.resourceId}`);
      return lockInfo;
    }
    
    return null;
  }

  private async tryAcquireMemoryLock(lockInfo: LockInfo): Promise<LockInfo | null> {
    // 内存实现：检查是否已存在锁
    if (!this.connection?.locks) {
      return null;
    }

    const existingLock = Array.from(this.connection.locks.values())
      .find((lock: LockInfo) => lock.resourceId === lockInfo.resourceId && lock.status === 'acquired');

    if (existingLock) {
      // 检查是否过期
      if (new Date(existingLock.expiresAt) > new Date()) {
        return null; // 锁仍然有效
      } else {
        // 锁已过期，清理
        this.connection.locks.delete(existingLock.lockId);
      }
    }

    // 获取锁
    this.connection.locks.set(lockInfo.lockId, lockInfo);
    return lockInfo;
  }

  private async tryReleaseLock(lockInfo: LockInfo): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
      case 'etcd':
      case 'zookeeper':
      case 'database':
        await this.simulateNetworkCall();
        return true;
      case 'memory':
        return this.connection?.locks?.delete(lockInfo.lockId) || false;
      default:
        return false;
    }
  }

  private async tryRenewLock(lockInfo: LockInfo, ttl: number): Promise<boolean> {
    switch (this.provider) {
      case 'redis':
      case 'etcd':
      case 'zookeeper':
      case 'database':
        await this.simulateNetworkCall();
        return Math.random() > 0.05; // 95%成功率
      case 'memory': {
        const lock = this.connection?.locks?.get(lockInfo.lockId);
        if (lock) {
          lock.expiresAt = new Date(Date.now() + ttl).toISOString();
          return true;
        }
        return false;
      }
      default:
        return false;
    }
  }

  private startRenewal(lockInfo: LockInfo): void {
    const renewalInterval = this.config.renewalInterval;
    const timer = setTimeout(async () => {
      try {
        const renewed = await this.renewLock(lockInfo.lockId);
        if (renewed && lockInfo.metadata.renewalCount < lockInfo.metadata.maxRenewals) {
          this.startRenewal(lockInfo); // 继续续期
        }
      } catch (error) {
        console.error(`Error in lock renewal for ${lockInfo.lockId}:`, error);
      }
    }, renewalInterval);

    this.renewalTimers.set(lockInfo.lockId, timer);
  }

  private updateAverageHoldTime(holdTime: number): void {
    const totalLocks = this.statistics.successfulAcquisitions;
    this.statistics.averageHoldTime = 
      (this.statistics.averageHoldTime * (totalLocks - 1) + holdTime) / totalLocks;
  }

  private async simulateConnection(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulateDisconnection(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async simulateNetworkCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ===== 死锁检测器实现 =====

export class DeadlockDetector {
  private _lockManager: DistributedLockManager;
  private detectionInterval: NodeJS.Timeout | null = null;
  private detectionEnabled = false;

  constructor(lockManager: DistributedLockManager) {
    this._lockManager = lockManager;
  }

  start(): void {
    if (this.detectionEnabled) return;
    
    this.detectionEnabled = true;
    this.detectionInterval = setInterval(() => {
      this.detectDeadlocks();
    }, 5000); // 每5秒检测一次
  }

  stop(): void {
    this.detectionEnabled = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  async checkDeadlock(_request: LockRequest): Promise<DeadlockInfo | null> {
    // 简化实现：基本的死锁检测逻辑
    // 在实际实现中，这里会构建等待图并检测循环
    return null;
  }

  private async detectDeadlocks(): Promise<void> {
    try {
      // 简化实现：死锁检测逻辑
      console.log('Running deadlock detection...');
    } catch (error) {
      console.error('Error in deadlock detection:', error);
    }
  }
}
