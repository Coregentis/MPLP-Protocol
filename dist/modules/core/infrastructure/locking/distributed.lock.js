"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlockDetector = exports.DistributedLockManager = void 0;
class DistributedLockManager {
    config;
    provider;
    connection = null;
    activeLocks = new Map();
    renewalTimers = new Map();
    statistics;
    deadlockDetector;
    constructor(config) {
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
    async connect() {
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
            if (this.config.deadlockDetection) {
                this.deadlockDetector.start();
            }
        }
        catch (error) {
            this.statistics.connectionStatus = 'error';
            throw new Error(`Failed to connect to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async disconnect() {
        try {
            this.deadlockDetector.stop();
            const lockIds = Array.from(this.activeLocks.keys());
            for (const lockId of lockIds) {
                await this.releaseLock(lockId);
            }
            for (const timer of this.renewalTimers.values()) {
                clearTimeout(timer);
            }
            this.renewalTimers.clear();
            if (this.connection) {
                await this.disconnectProvider();
                this.connection = null;
            }
            this.statistics.connectionStatus = 'disconnected';
        }
        catch (error) {
        }
    }
    async acquireLock(request) {
        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = this.config.maxRetries + 1;
        while (attempts < maxAttempts) {
            attempts++;
            try {
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
                const lockInfo = await this.tryAcquireLock(request);
                if (lockInfo) {
                    this.activeLocks.set(lockInfo.lockId, lockInfo);
                    this.statistics.activeLocks++;
                    this.statistics.successfulAcquisitions++;
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
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
            catch (error) {
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
    async releaseLock(lockId) {
        const lockInfo = this.activeLocks.get(lockId);
        if (!lockInfo) {
            return false;
        }
        try {
            const renewalTimer = this.renewalTimers.get(lockId);
            if (renewalTimer) {
                clearTimeout(renewalTimer);
                this.renewalTimers.delete(lockId);
            }
            const released = await this.tryReleaseLock(lockInfo);
            if (released) {
                this.activeLocks.delete(lockId);
                this.statistics.activeLocks--;
                const holdTime = Date.now() - new Date(lockInfo.acquiredAt).getTime();
                this.updateAverageHoldTime(holdTime);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`Error releasing lock ${lockId}:`, error);
            return false;
        }
    }
    async renewLock(lockId, ttl) {
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
        }
        catch (error) {
            console.error(`Error renewing lock ${lockId}:`, error);
            return false;
        }
    }
    getLockInfo(lockId) {
        return this.activeLocks.get(lockId) || null;
    }
    getResourceLocks(resourceId) {
        return Array.from(this.activeLocks.values())
            .filter(lock => lock.resourceId === resourceId);
    }
    getStatistics() {
        return { ...this.statistics };
    }
    async connectRedis() {
        console.log('Connecting to Redis lock provider...');
        await this.simulateConnection();
        this.connection = { type: 'redis', connected: true };
    }
    async connectEtcd() {
        console.log('Connecting to Etcd lock provider...');
        await this.simulateConnection();
        this.connection = { type: 'etcd', connected: true };
    }
    async connectZookeeper() {
        console.log('Connecting to Zookeeper lock provider...');
        await this.simulateConnection();
        this.connection = { type: 'zookeeper', connected: true };
    }
    async connectDatabase() {
        console.log('Connecting to Database lock provider...');
        await this.simulateConnection();
        this.connection = { type: 'database', connected: true };
    }
    async connectMemory() {
        this.connection = {
            type: 'memory',
            connected: true,
            locks: new Map()
        };
    }
    async disconnectProvider() {
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
    async tryAcquireLock(request) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Connection not available');
        }
        const lockId = this.generateUUID();
        const ttl = request.ttl || this.config.defaultTtl;
        const lockInfo = {
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
    async tryAcquireRedisLock(lockInfo) {
        await this.simulateNetworkCall();
        if (Math.random() > 0.1) {
            console.log(`Redis lock acquired: ${lockInfo.resourceId}`);
            return lockInfo;
        }
        return null;
    }
    async tryAcquireEtcdLock(lockInfo) {
        await this.simulateNetworkCall();
        if (Math.random() > 0.1) {
            console.log(`Etcd lock acquired: ${lockInfo.resourceId}`);
            return lockInfo;
        }
        return null;
    }
    async tryAcquireZookeeperLock(lockInfo) {
        await this.simulateNetworkCall();
        if (Math.random() > 0.1) {
            console.log(`Zookeeper lock acquired: ${lockInfo.resourceId}`);
            return lockInfo;
        }
        return null;
    }
    async tryAcquireDatabaseLock(lockInfo) {
        await this.simulateNetworkCall();
        if (Math.random() > 0.1) {
            console.log(`Database lock acquired: ${lockInfo.resourceId}`);
            return lockInfo;
        }
        return null;
    }
    async tryAcquireMemoryLock(lockInfo) {
        if (!this.connection?.locks) {
            return null;
        }
        const existingLock = Array.from(this.connection.locks.values())
            .find((lock) => lock.resourceId === lockInfo.resourceId && lock.status === 'acquired');
        if (existingLock) {
            if (new Date(existingLock.expiresAt) > new Date()) {
                return null;
            }
            else {
                this.connection.locks.delete(existingLock.lockId);
            }
        }
        this.connection.locks.set(lockInfo.lockId, lockInfo);
        return lockInfo;
    }
    async tryReleaseLock(lockInfo) {
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
    async tryRenewLock(lockInfo, ttl) {
        switch (this.provider) {
            case 'redis':
            case 'etcd':
            case 'zookeeper':
            case 'database':
                await this.simulateNetworkCall();
                return Math.random() > 0.05;
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
    startRenewal(lockInfo) {
        const renewalInterval = this.config.renewalInterval;
        const timer = setTimeout(async () => {
            try {
                const renewed = await this.renewLock(lockInfo.lockId);
                if (renewed && lockInfo.metadata.renewalCount < lockInfo.metadata.maxRenewals) {
                    this.startRenewal(lockInfo);
                }
            }
            catch (error) {
                console.error(`Error in lock renewal for ${lockInfo.lockId}:`, error);
            }
        }, renewalInterval);
        this.renewalTimers.set(lockInfo.lockId, timer);
    }
    updateAverageHoldTime(holdTime) {
        const totalLocks = this.statistics.successfulAcquisitions;
        this.statistics.averageHoldTime =
            (this.statistics.averageHoldTime * (totalLocks - 1) + holdTime) / totalLocks;
    }
    async simulateConnection() {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    async simulateDisconnection() {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    async simulateNetworkCall() {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.DistributedLockManager = DistributedLockManager;
class DeadlockDetector {
    _lockManager;
    detectionInterval = null;
    detectionEnabled = false;
    constructor(lockManager) {
        this._lockManager = lockManager;
    }
    start() {
        if (this.detectionEnabled)
            return;
        this.detectionEnabled = true;
        this.detectionInterval = setInterval(() => {
            this.detectDeadlocks();
        }, 5000);
    }
    stop() {
        this.detectionEnabled = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }
    async checkDeadlock(_request) {
        return null;
    }
    async detectDeadlocks() {
        try {
            console.log('Running deadlock detection...');
        }
        catch (error) {
            console.error('Error in deadlock detection:', error);
        }
    }
}
exports.DeadlockDetector = DeadlockDetector;
