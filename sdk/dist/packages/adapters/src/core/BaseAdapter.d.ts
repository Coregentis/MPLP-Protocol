/**
 * @fileoverview Base platform adapter implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { MPLPEventManager } from './MPLPEventManager';
import { IPlatformAdapter, AdapterConfig, PlatformCapabilities, ContentItem, ActionResult, UserProfile, RateLimitInfo, WebhookEvent } from './types';
/**
 * Base platform adapter class - 基于MPLP V1.0 Alpha事件架构
 */
export declare abstract class BaseAdapter implements IPlatformAdapter {
    readonly config: AdapterConfig;
    readonly capabilities: PlatformCapabilities;
    protected eventManager: MPLPEventManager;
    protected rateLimiter?: any;
    protected _isAuthenticated: boolean;
    protected _rateLimitInfo: RateLimitInfo | null;
    protected monitoringActive: boolean;
    constructor(config: AdapterConfig, capabilities: PlatformCapabilities);
    /**
     * Get authentication status
     */
    get isAuthenticated(): boolean;
    /**
     * Get rate limit info
     */
    get rateLimitInfo(): RateLimitInfo | null;
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * Initialize the adapter
     */
    initialize(): Promise<void>;
    /**
     * Authenticate with the platform
     */
    authenticate(): Promise<boolean>;
    /**
     * Disconnect from the platform
     */
    disconnect(): Promise<void>;
    /**
     * Post content to the platform
     */
    post(content: ContentItem): Promise<ActionResult>;
    /**
     * Comment on a post
     */
    comment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share a post
     */
    share(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete a post
     */
    delete(postId: string): Promise<ActionResult>;
    /**
     * Like a post
     */
    like(postId: string): Promise<ActionResult>;
    /**
     * Unlike a post
     */
    unlike(postId: string): Promise<ActionResult>;
    /**
     * Follow a user
     */
    follow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow a user
     */
    unfollow(userId: string): Promise<ActionResult>;
    /**
     * Start monitoring for events
     */
    startMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    stopMonitoring(): Promise<void>;
    /**
     * Validate content before posting
     */
    validateContent(content: ContentItem): Promise<boolean>;
    /**
     * Setup rate limiter
     */
    private setupRateLimiter;
    /**
     * Check rate limit before making requests
     */
    protected checkRateLimit(): Promise<void>;
    /**
     * Handle webhook events
     */
    protected handleWebhookEvent(event: WebhookEvent): void;
    protected abstract doInitialize(): Promise<void>;
    protected abstract doAuthenticate(): Promise<boolean>;
    protected abstract doDisconnect(): Promise<void>;
    protected abstract doPost(content: ContentItem): Promise<ActionResult>;
    protected abstract doComment(postId: string, content: string): Promise<ActionResult>;
    protected abstract doShare(postId: string, comment?: string): Promise<ActionResult>;
    protected abstract doDelete(postId: string): Promise<ActionResult>;
    protected abstract doLike(postId: string): Promise<ActionResult>;
    protected abstract doUnlike(postId: string): Promise<ActionResult>;
    protected abstract doFollow(userId: string): Promise<ActionResult>;
    protected abstract doUnfollow(userId: string): Promise<ActionResult>;
    abstract getProfile(userId?: string): Promise<UserProfile>;
    abstract getContent(postId: string): Promise<ContentItem>;
    abstract search(query: string, options?: any): Promise<ContentItem[]>;
    abstract getAnalytics(postId: string): Promise<any>;
    abstract setupWebhook(url: string, events: string[]): Promise<boolean>;
    abstract removeWebhook(webhookId: string): Promise<boolean>;
    protected abstract doStartMonitoring(options?: any): Promise<void>;
    protected abstract doStopMonitoring(): Promise<void>;
    protected abstract doValidateContent(content: ContentItem): Promise<boolean>;
}
//# sourceMappingURL=BaseAdapter.d.ts.map