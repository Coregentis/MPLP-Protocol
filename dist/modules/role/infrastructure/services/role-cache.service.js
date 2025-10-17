"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCacheService = void 0;
exports.createRoleCacheService = createRoleCacheService;
const role_logger_service_1 = require("./role-logger.service");
class RoleCacheService {
    warmupStrategy;
    cache = new Map();
    timers = new Map();
    metrics;
    logger;
    config;
    cleanupTimer;
    warmupTimer;
    constructor(config = {}, warmupStrategy = {
        enabled: true,
        strategies: ['popular_roles', 'permission_cache'],
        batchSize: 50,
        intervalMs: 300000
    }) {
        this.warmupStrategy = warmupStrategy;
        this.config = {
            maxSize: 1000,
            defaultTTL: 300,
            enableMetrics: true,
            enablePrewarming: true,
            evictionPolicy: 'lru',
            compressionEnabled: false,
            persistenceEnabled: false,
            cleanupInterval: 60000,
            ...config
        };
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            totalSize: 0,
            hitRate: 0,
            missRate: 0,
            memoryUsage: 0,
            averageAccessTime: 0
        };
        this.logger = (0, role_logger_service_1.createRoleLogger)({
            module: 'RoleCache',
            level: role_logger_service_1.LogLevel.INFO,
            enableStructured: true,
            environment: process.env.NODE_ENV || 'development'
        });
        this.startCleanupTimer();
        if (this.warmupStrategy.enabled) {
            this.startWarmupTimer();
        }
    }
    async get(key) {
        const startTime = Date.now();
        const entry = this.cache.get(key);
        if (!entry) {
            this.recordMiss(key, Date.now() - startTime);
            return undefined;
        }
        if (this.isExpired(entry)) {
            await this.delete(key);
            this.recordMiss(key, Date.now() - startTime, 'expired');
            return undefined;
        }
        entry.accessedAt = Date.now();
        entry.accessCount++;
        this.recordHit(key, Date.now() - startTime);
        return entry.value;
    }
    async set(key, value, ttl, tags) {
        try {
            const effectiveTTL = ttl ?? this.config.defaultTTL;
            const now = Date.now();
            if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
                await this.evict();
            }
            const entry = {
                key,
                value,
                createdAt: now,
                accessedAt: now,
                accessCount: 1,
                ttl: effectiveTTL,
                tags
            };
            this.cache.set(key, entry);
            this.setExpiration(key, effectiveTTL);
            this.recordSet(key);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to set cache entry', error instanceof Error ? error : undefined, { key });
            return false;
        }
    }
    async delete(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        this.cache.delete(key);
        this.clearTimer(key);
        this.recordDelete(key);
        return true;
    }
    async deleteByTags(tags) {
        let deletedCount = 0;
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            if (await this.delete(key)) {
                deletedCount++;
            }
        }
        this.logger.info('Batch deleted cache entries by tags', {
            tags,
            deletedCount,
            totalKeys: keysToDelete.length
        });
        return deletedCount;
    }
    async clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.clearAllTimers();
        this.logger.info('Cache cleared', { previousSize: size });
    }
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    getHealthStatus() {
        const metrics = this.getMetrics();
        let status = 'healthy';
        if (metrics.hitRate < 0.5) {
            status = 'degraded';
        }
        if (metrics.hitRate < 0.3 || metrics.memoryUsage > 0.9) {
            status = 'unhealthy';
        }
        return {
            status,
            metrics,
            details: {
                cacheSize: this.cache.size,
                maxSize: this.config.maxSize,
                utilizationRate: this.cache.size / this.config.maxSize,
                averageEntryAge: this.calculateAverageEntryAge(),
                expiredEntries: this.countExpiredEntries()
            }
        };
    }
    async warmup(data) {
        const startTime = Date.now();
        let warmedCount = 0;
        try {
            if (data.roles) {
                for (const role of data.roles) {
                    await this.set(`role:${role.roleId}`, role, 600, ['role', 'warmup']);
                    warmedCount++;
                }
            }
            if (data.permissions) {
                for (const permission of data.permissions) {
                    const permissionObj = permission;
                    await this.set(`permission:${permissionObj.id}`, permission, 300, ['permission', 'warmup']);
                    warmedCount++;
                }
            }
            if (data.statistics) {
                for (const stat of data.statistics) {
                    const statObj = stat;
                    await this.set(`stats:${statObj.key}`, statObj.value, 3600, ['statistics', 'warmup']);
                    warmedCount++;
                }
            }
            const duration = Date.now() - startTime;
            this.logger.info('Cache warmup completed', {
                warmedCount,
                duration,
                strategies: Object.keys(data)
            });
        }
        catch (error) {
            this.logger.error('Cache warmup failed', error instanceof Error ? error : undefined, {
                warmedCount,
                duration: Date.now() - startTime
            });
        }
    }
    isExpired(entry) {
        if (entry.ttl <= 0)
            return false;
        return Date.now() - entry.createdAt > entry.ttl * 1000;
    }
    setExpiration(key, ttl) {
        if (ttl <= 0)
            return;
        this.clearTimer(key);
        const timer = setTimeout(async () => {
            await this.delete(key);
            this.logger.debug('Cache entry expired', { key });
        }, ttl * 1000);
        this.timers.set(key, timer);
    }
    clearTimer(key) {
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }
    clearAllTimers() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
    async evict() {
        switch (this.config.evictionPolicy) {
            case 'lru':
                await this.evictLRU();
                break;
            case 'lfu':
                await this.evictLFU();
                break;
            case 'ttl':
                await this.evictByTTL();
                break;
            case 'random':
                await this.evictRandom();
                break;
            default:
                await this.evictLRU();
        }
    }
    async evictLRU() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessedAt < oldestTime) {
                oldestTime = entry.accessedAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            await this.delete(oldestKey);
            this.recordEviction(oldestKey, 'lru');
        }
    }
    async evictLFU() {
        let leastUsedKey = '';
        let leastAccessCount = Number.MAX_SAFE_INTEGER;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < leastAccessCount) {
                leastAccessCount = entry.accessCount;
                leastUsedKey = key;
            }
        }
        if (leastUsedKey) {
            await this.delete(leastUsedKey);
            this.recordEviction(leastUsedKey, 'lfu');
        }
    }
    async evictByTTL() {
        const now = Date.now();
        let shortestTTLKey = '';
        let shortestRemainingTime = Number.MAX_SAFE_INTEGER;
        for (const [key, entry] of this.cache.entries()) {
            const remainingTime = (entry.createdAt + entry.ttl * 1000) - now;
            if (remainingTime < shortestRemainingTime) {
                shortestRemainingTime = remainingTime;
                shortestTTLKey = key;
            }
        }
        if (shortestTTLKey) {
            await this.delete(shortestTTLKey);
            this.recordEviction(shortestTTLKey, 'ttl');
        }
    }
    async evictRandom() {
        const keys = Array.from(this.cache.keys());
        if (keys.length > 0) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            await this.delete(randomKey);
            this.recordEviction(randomKey, 'random');
        }
    }
    recordHit(key, accessTime) {
        this.metrics.hits++;
        this.updateHitRate();
        this.updateAverageAccessTime(accessTime);
        this.logger.debug('Cache hit', { key, accessTime });
    }
    recordMiss(key, accessTime, reason) {
        this.metrics.misses++;
        this.updateHitRate();
        this.updateAverageAccessTime(accessTime);
        this.logger.debug('Cache miss', { key, accessTime, reason });
    }
    recordSet(key) {
        this.metrics.sets++;
        this.metrics.totalSize = this.cache.size;
        this.logger.debug('Cache set', { key, totalSize: this.metrics.totalSize });
    }
    recordDelete(key) {
        this.metrics.deletes++;
        this.metrics.totalSize = this.cache.size;
        this.logger.debug('Cache delete', { key, totalSize: this.metrics.totalSize });
    }
    recordEviction(key, policy) {
        this.metrics.evictions++;
        this.metrics.totalSize = this.cache.size;
        this.logger.info('Cache eviction', { key, policy, totalSize: this.metrics.totalSize });
    }
    updateHitRate() {
        const total = this.metrics.hits + this.metrics.misses;
        if (total > 0) {
            this.metrics.hitRate = this.metrics.hits / total;
            this.metrics.missRate = this.metrics.misses / total;
        }
    }
    updateAverageAccessTime(accessTime) {
        const total = this.metrics.hits + this.metrics.misses;
        if (total === 1) {
            this.metrics.averageAccessTime = accessTime;
        }
        else {
            this.metrics.averageAccessTime =
                (this.metrics.averageAccessTime * (total - 1) + accessTime) / total;
        }
    }
    updateMetrics() {
        this.metrics.totalSize = this.cache.size;
        this.metrics.memoryUsage = this.calculateMemoryUsage();
    }
    calculateMemoryUsage() {
        const entrySize = 200;
        return (this.cache.size * entrySize) / (1024 * 1024);
    }
    calculateAverageEntryAge() {
        if (this.cache.size === 0)
            return 0;
        const now = Date.now();
        let totalAge = 0;
        for (const entry of this.cache.values()) {
            totalAge += now - entry.createdAt;
        }
        return totalAge / this.cache.size;
    }
    countExpiredEntries() {
        let expiredCount = 0;
        for (const entry of this.cache.values()) {
            if (this.isExpired(entry)) {
                expiredCount++;
            }
        }
        return expiredCount;
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(async () => {
            await this.cleanup();
        }, this.config.cleanupInterval);
    }
    startWarmupTimer() {
        if (!this.warmupStrategy.enabled)
            return;
        this.warmupTimer = setInterval(async () => {
            await this.performScheduledWarmup();
        }, this.warmupStrategy.intervalMs);
    }
    async cleanup() {
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            await this.delete(key);
        }
        if (keysToDelete.length > 0) {
            this.logger.info('Cache cleanup completed', {
                expiredEntries: keysToDelete.length,
                remainingEntries: this.cache.size
            });
        }
    }
    async performScheduledWarmup() {
        this.logger.debug('Scheduled cache warmup triggered');
    }
    async destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        if (this.warmupTimer) {
            clearInterval(this.warmupTimer);
        }
        this.clearAllTimers();
        await this.clear();
        this.logger.info('Cache service destroyed');
    }
}
exports.RoleCacheService = RoleCacheService;
function createRoleCacheService(config, warmupStrategy) {
    return new RoleCacheService(config, warmupStrategy);
}
