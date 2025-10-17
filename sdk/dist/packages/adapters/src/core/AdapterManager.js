"use strict";
/**
 * @fileoverview Platform adapter manager - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterManager = void 0;
const MPLPEventManager_1 = require("./MPLPEventManager");
/**
 * Platform adapter manager - 基于MPLP V1.0 Alpha事件架构
 */
class AdapterManager {
    constructor() {
        this._adapters = new Map();
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Get all adapters
     */
    get adapters() {
        return new Map(this._adapters);
    }
    /**
     * Add adapter to manager
     */
    async addAdapter(name, adapter) {
        try {
            // Initialize adapter
            await adapter.initialize();
            // Authenticate if credentials are provided
            if (adapter.config.auth.credentials && Object.keys(adapter.config.auth.credentials).length > 0) {
                await adapter.authenticate();
            }
            // Setup event forwarding
            this.setupAdapterEvents(name, adapter);
            // Add to collection
            this._adapters.set(name, adapter);
            this.emit('adapter:added', name, adapter);
        }
        catch (error) {
            this.emit('adapter:error', name, error);
            throw error;
        }
    }
    /**
     * Remove adapter from manager
     */
    async removeAdapter(name) {
        const adapter = this._adapters.get(name);
        if (!adapter) {
            return;
        }
        try {
            // Stop monitoring if active
            await adapter.stopMonitoring();
            // Disconnect adapter
            await adapter.disconnect();
            // Remove event listeners
            adapter.removeAllListeners();
            // Remove from collection
            this._adapters.delete(name);
            this.emit('adapter:removed', name);
        }
        catch (error) {
            this.emit('adapter:error', name, error);
            throw error;
        }
    }
    /**
     * Get adapter by name
     */
    getAdapter(name) {
        return this._adapters.get(name);
    }
    /**
     * Get adapters by platform
     */
    getAdaptersByPlatform(platform) {
        return Array.from(this._adapters.values()).filter(adapter => adapter.config.platform === platform);
    }
    /**
     * Post content to all adapters
     */
    async postToAll(content, platforms) {
        const results = new Map();
        const targetAdapters = platforms
            ? Array.from(this._adapters.entries()).filter(([name]) => platforms.includes(name))
            : Array.from(this._adapters.entries());
        // Post to all adapters in parallel
        const promises = targetAdapters.map(async ([name, adapter]) => {
            try {
                if (!adapter.capabilities.canPost) {
                    return [name, {
                            success: false,
                            error: `Platform ${adapter.config.platform} does not support posting`,
                            timestamp: new Date()
                        }];
                }
                const result = await adapter.post(content);
                return [name, result];
            }
            catch (error) {
                return [name, {
                        success: false,
                        error: error.message,
                        timestamp: new Date()
                    }];
            }
        });
        const resolvedResults = await Promise.all(promises);
        resolvedResults.forEach(([name, result]) => {
            results.set(name, result);
        });
        this.emit('bulk:post:complete', results);
        return results;
    }
    /**
     * Post content to multiple specific adapters
     */
    async postToMultiple(content, platforms) {
        return this.postToAll(content, platforms);
    }
    /**
     * Start monitoring on all adapters
     */
    async startMonitoringAll() {
        const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
            try {
                await adapter.startMonitoring();
            }
            catch (error) {
                this.emit('adapter:error', name, error);
            }
        });
        await Promise.all(promises);
        this.emit('monitoring:started:all');
    }
    /**
     * Stop monitoring on all adapters
     */
    async stopMonitoringAll() {
        const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
            try {
                await adapter.stopMonitoring();
            }
            catch (error) {
                this.emit('adapter:error', name, error);
            }
        });
        await Promise.all(promises);
        this.emit('monitoring:stopped:all');
    }
    /**
     * Get aggregated analytics for a post across all platforms
     */
    async getAggregatedAnalytics(postId) {
        const analytics = new Map();
        const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
            try {
                if (!adapter.capabilities.supportsAnalytics) {
                    return [name, {}];
                }
                const metrics = await adapter.getAnalytics(postId);
                return [name, metrics];
            }
            catch (error) {
                // Ignore errors for individual adapters
                return [name, {}];
            }
        });
        const results = await Promise.all(promises);
        results.forEach(([name, metrics]) => {
            analytics.set(name, metrics);
        });
        return analytics;
    }
    /**
     * Bulk follow operation across platforms
     */
    async followOnAll(userId, platforms) {
        const results = new Map();
        const targetAdapters = platforms
            ? Array.from(this._adapters.entries()).filter(([name]) => platforms.includes(name))
            : Array.from(this._adapters.entries());
        const promises = targetAdapters.map(async ([name, adapter]) => {
            try {
                if (!adapter.capabilities.canFollow) {
                    return [name, {
                            success: false,
                            error: `Platform ${adapter.config.platform} does not support following`,
                            timestamp: new Date()
                        }];
                }
                const result = await adapter.follow(userId);
                return [name, result];
            }
            catch (error) {
                return [name, {
                        success: false,
                        error: error.message,
                        timestamp: new Date()
                    }];
            }
        });
        const resolvedResults = await Promise.all(promises);
        resolvedResults.forEach(([name, result]) => {
            results.set(name, result);
        });
        return results;
    }
    /**
     * Search across all platforms
     */
    async searchAll(query, options) {
        const results = new Map();
        const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
            try {
                const items = await adapter.search(query, options);
                return [name, items];
            }
            catch (error) {
                return [name, []];
            }
        });
        const resolvedResults = await Promise.all(promises);
        resolvedResults.forEach(([name, items]) => {
            results.set(name, items);
        });
        return results;
    }
    /**
     * Get status of all adapters
     */
    getAdapterStatuses() {
        const statuses = new Map();
        this._adapters.forEach((adapter, name) => {
            statuses.set(name, {
                platform: adapter.config.platform,
                enabled: adapter.config.enabled,
                authenticated: adapter.isAuthenticated,
                rateLimitInfo: adapter.rateLimitInfo,
                capabilities: adapter.capabilities
            });
        });
        return statuses;
    }
    /**
     * Disconnect all adapters
     */
    async disconnectAll() {
        const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
            try {
                await adapter.disconnect();
            }
            catch (error) {
                this.emit('adapter:error', name, error);
            }
        });
        await Promise.all(promises);
        this._adapters.clear();
        this.emit('adapters:disconnected:all');
    }
    /**
     * Setup event forwarding for adapter
     */
    setupAdapterEvents(name, adapter) {
        // Forward all adapter events with adapter name
        const events = [
            'adapter:ready',
            'adapter:error',
            'adapter:ratelimit',
            'content:posted',
            'content:liked',
            'content:shared',
            'content:commented',
            'webhook:received',
            'mention:received',
            'message:received'
        ];
        events.forEach(event => {
            adapter.on(event, (...args) => {
                this.emit(event, name, ...args);
            });
        });
        // Setup custom events
        adapter.on('authenticated', () => {
            this.emit('adapter:authenticated', name, adapter);
        });
        adapter.on('disconnected', () => {
            this.emit('adapter:disconnected', name, adapter);
        });
        adapter.on('monitoring:started', () => {
            this.emit('adapter:monitoring:started', name, adapter);
        });
        adapter.on('monitoring:stopped', () => {
            this.emit('adapter:monitoring:stopped', name, adapter);
        });
    }
    /**
     * Get adapter count by platform
     */
    getAdapterCountByPlatform() {
        const counts = new Map();
        this._adapters.forEach(adapter => {
            const platform = adapter.config.platform;
            counts.set(platform, (counts.get(platform) || 0) + 1);
        });
        return counts;
    }
    /**
     * Get authenticated adapters
     */
    getAuthenticatedAdapters() {
        const authenticated = new Map();
        this._adapters.forEach((adapter, name) => {
            if (adapter.isAuthenticated) {
                authenticated.set(name, adapter);
            }
        });
        return authenticated;
    }
    /**
     * Validate all adapter configurations
     */
    validateAllConfigurations() {
        const validations = new Map();
        this._adapters.forEach((adapter, name) => {
            try {
                // Basic validation - check if required fields are present
                const isValid = !!(adapter.config.platform &&
                    adapter.config.name &&
                    adapter.config.version &&
                    adapter.config.auth);
                validations.set(name, isValid);
            }
            catch (error) {
                validations.set(name, false);
            }
        });
        return validations;
    }
}
exports.AdapterManager = AdapterManager;
//# sourceMappingURL=AdapterManager.js.map