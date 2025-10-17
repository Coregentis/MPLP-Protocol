"use strict";
/**
 * @fileoverview Base platform adapter implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = void 0;
const MPLPEventManager_1 = require("./MPLPEventManager");
/**
 * Base platform adapter class - 基于MPLP V1.0 Alpha事件架构
 */
class BaseAdapter {
    constructor(config, capabilities) {
        this.config = config;
        this.capabilities = capabilities;
        this._isAuthenticated = false;
        this._rateLimitInfo = null;
        this.monitoringActive = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.setupRateLimiter();
    }
    /**
     * Get authentication status
     */
    get isAuthenticated() {
        return this._isAuthenticated;
    }
    /**
     * Get rate limit info
     */
    get rateLimitInfo() {
        return this._rateLimitInfo;
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
     * Initialize the adapter
     */
    async initialize() {
        try {
            await this.doInitialize();
            this.emit('adapter:ready', this);
        }
        catch (error) {
            this.emit('adapter:error', this, error);
            throw error;
        }
    }
    /**
     * Authenticate with the platform
     */
    async authenticate() {
        try {
            const result = await this.doAuthenticate();
            this._isAuthenticated = result;
            if (result) {
                this.emit('authenticated');
            }
            else {
                this.emit('authentication:failed');
            }
            return result;
        }
        catch (error) {
            this.emit('adapter:error', this, error);
            return false;
        }
    }
    /**
     * Disconnect from the platform
     */
    async disconnect() {
        try {
            await this.stopMonitoring();
            await this.doDisconnect();
            this._isAuthenticated = false;
            this.emit('disconnected');
        }
        catch (error) {
            this.emit('adapter:error', this, error);
            throw error;
        }
    }
    /**
     * Post content to the platform
     */
    async post(content) {
        await this.checkRateLimit();
        if (!this.capabilities.canPost) {
            throw new Error(`Platform ${this.config.platform} does not support posting`);
        }
        if (!await this.validateContent(content)) {
            throw new Error('Content validation failed');
        }
        try {
            const result = await this.doPost(content);
            this.emit('content:posted', this, result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Comment on a post
     */
    async comment(postId, content) {
        await this.checkRateLimit();
        if (!this.capabilities.canComment) {
            throw new Error(`Platform ${this.config.platform} does not support commenting`);
        }
        try {
            const result = await this.doComment(postId, content);
            this.emit('content:commented', this, result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Share a post
     */
    async share(postId, comment) {
        await this.checkRateLimit();
        if (!this.capabilities.canShare) {
            throw new Error(`Platform ${this.config.platform} does not support sharing`);
        }
        try {
            const result = await this.doShare(postId, comment);
            this.emit('content:shared', this, result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Delete a post
     */
    async delete(postId) {
        await this.checkRateLimit();
        if (!this.capabilities.canDelete) {
            throw new Error(`Platform ${this.config.platform} does not support deletion`);
        }
        try {
            const result = await this.doDelete(postId);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Like a post
     */
    async like(postId) {
        await this.checkRateLimit();
        if (!this.capabilities.canLike) {
            throw new Error(`Platform ${this.config.platform} does not support liking`);
        }
        try {
            const result = await this.doLike(postId);
            this.emit('content:liked', this, result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Unlike a post
     */
    async unlike(postId) {
        await this.checkRateLimit();
        try {
            const result = await this.doUnlike(postId);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Follow a user
     */
    async follow(userId) {
        await this.checkRateLimit();
        if (!this.capabilities.canFollow) {
            throw new Error(`Platform ${this.config.platform} does not support following`);
        }
        try {
            const result = await this.doFollow(userId);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Unfollow a user
     */
    async unfollow(userId) {
        await this.checkRateLimit();
        try {
            const result = await this.doUnfollow(userId);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
            this.emit('adapter:error', this, error);
            return result;
        }
    }
    /**
     * Start monitoring for events
     */
    async startMonitoring(options) {
        if (this.monitoringActive) {
            return;
        }
        try {
            await this.doStartMonitoring(options);
            this.monitoringActive = true;
            this.emit('monitoring:started');
        }
        catch (error) {
            this.emit('adapter:error', this, error);
            throw error;
        }
    }
    /**
     * Stop monitoring
     */
    async stopMonitoring() {
        if (!this.monitoringActive) {
            return;
        }
        try {
            await this.doStopMonitoring();
            this.monitoringActive = false;
            this.emit('monitoring:stopped');
        }
        catch (error) {
            this.emit('adapter:error', this, error);
            throw error;
        }
    }
    /**
     * Validate content before posting
     */
    async validateContent(content) {
        // Check content length
        if (this.capabilities.maxContentLength &&
            content.content.length > this.capabilities.maxContentLength) {
            return false;
        }
        // Check content type support
        if (!this.capabilities.supportedContentTypes.includes(content.type)) {
            return false;
        }
        // Check media attachments
        if (content.media) {
            for (const media of content.media) {
                if (this.capabilities.maxMediaSize &&
                    media.size && media.size > this.capabilities.maxMediaSize) {
                    return false;
                }
            }
        }
        // Platform-specific validation
        return await this.doValidateContent(content);
    }
    /**
     * Setup rate limiter
     */
    setupRateLimiter() {
        if (this.config.rateLimit) {
            // Rate limiter would be initialized here
            // this.rateLimiter = new RateLimiterMemory({
            //   points: this.config.rateLimit.requests,
            //   duration: Math.floor(this.config.rateLimit.window / 1000),
            // });
        }
    }
    /**
     * Check rate limit before making requests
     */
    async checkRateLimit() {
        if (this.rateLimiter) {
            try {
                await this.rateLimiter.consume(this.config.platform);
            }
            catch (rateLimiterRes) {
                const info = {
                    limit: this.config.rateLimit.requests,
                    remaining: 0,
                    reset: new Date(Date.now() + rateLimiterRes.msBeforeNext),
                    retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
                };
                this._rateLimitInfo = info;
                this.emit('adapter:ratelimit', this, info);
                throw new Error(`Rate limit exceeded. Retry after ${info.retryAfter} seconds`);
            }
        }
    }
    /**
     * Handle webhook events
     */
    handleWebhookEvent(event) {
        this.emit('webhook:received', this, event);
        // Handle specific event types
        switch (event.type) {
            case 'mention':
                this.emit('mention:received', this, event.data);
                break;
            case 'message':
                this.emit('message:received', this, event.data);
                break;
            default:
                // Handle other event types
                break;
        }
    }
}
exports.BaseAdapter = BaseAdapter;
//# sourceMappingURL=BaseAdapter.js.map