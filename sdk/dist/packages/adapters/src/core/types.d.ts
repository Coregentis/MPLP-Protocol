/**
 * @fileoverview Core types for platform adapters
 */
/**
 * Platform types
 */
export type PlatformType = 'twitter' | 'linkedin' | 'github' | 'discord' | 'slack' | 'reddit' | 'medium' | 'telegram' | 'custom';
/**
 * Authentication types
 */
export type AuthType = 'oauth1' | 'oauth2' | 'bearer' | 'basic' | 'api-key' | 'custom';
/**
 * Content types
 */
export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'link' | 'poll' | 'comment' | 'custom';
/**
 * Action types
 */
export type ActionType = 'post' | 'comment' | 'like' | 'share' | 'follow' | 'unfollow' | 'message' | 'custom';
/**
 * Base adapter configuration
 */
export interface AdapterConfig {
    platform: PlatformType;
    name: string;
    version: string;
    enabled: boolean;
    auth: {
        type: AuthType;
        credentials: Record<string, any>;
        refreshToken?: string;
        expiresAt?: Date;
    };
    rateLimit?: {
        requests: number;
        window: number;
        burst?: number;
    };
    retry?: {
        attempts: number;
        delay: number;
        backoff: 'linear' | 'exponential';
    };
    settings?: Record<string, any>;
}
/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
    canPost: boolean;
    canComment: boolean;
    canShare: boolean;
    canDelete: boolean;
    canEdit: boolean;
    canLike: boolean;
    canFollow: boolean;
    canMessage: boolean;
    canMention: boolean;
    supportedContentTypes: ContentType[];
    maxContentLength?: number;
    maxMediaSize?: number;
    supportsPolls: boolean;
    supportsScheduling: boolean;
    supportsAnalytics: boolean;
    supportsWebhooks: boolean;
}
/**
 * Content item
 */
export interface ContentItem {
    id?: string;
    type: ContentType;
    content: string;
    metadata?: Record<string, any>;
    media?: MediaAttachment[];
    audience?: string[];
    tags?: string[];
    mentions?: string[];
    publishAt?: Date;
    expiresAt?: Date;
    metrics?: ContentMetrics;
}
/**
 * Media attachment
 */
export interface MediaAttachment {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    alt?: string;
    thumbnail?: string;
}
/**
 * Content metrics
 */
export interface ContentMetrics {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
    impressions?: number;
    engagement?: number;
    reach?: number;
    reactions?: number;
    replies?: number;
}
/**
 * User profile
 */
export interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    bio?: string;
    avatar?: string;
    url?: string;
    verified?: boolean;
    followers?: number;
    following?: number;
    metadata?: Record<string, any>;
}
/**
 * Platform action
 */
export interface PlatformAction {
    type: ActionType;
    target?: string;
    content?: ContentItem;
    options?: Record<string, any>;
    timestamp: Date;
}
/**
 * Action result
 */
export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
/**
 * Webhook event
 */
export interface WebhookEvent {
    platform: PlatformType;
    type: string;
    data: any;
    timestamp: Date;
    signature?: string;
}
/**
 * Rate limit info
 */
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: Date;
    retryAfter?: number;
}
/**
 * EventEmitter兼容接口 - 基于MPLP V1.0 Alpha架构
 */
export interface MPLPEventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
}
/**
 * Platform adapter interface - 基于MPLP V1.0 Alpha架构
 */
export interface IPlatformAdapter extends MPLPEventEmitter {
    readonly config: AdapterConfig;
    readonly capabilities: PlatformCapabilities;
    readonly isAuthenticated: boolean;
    readonly rateLimitInfo: RateLimitInfo | null;
    initialize(): Promise<void>;
    authenticate(): Promise<boolean>;
    disconnect(): Promise<void>;
    post(content: ContentItem): Promise<ActionResult>;
    comment(postId: string, content: string): Promise<ActionResult>;
    share(postId: string, comment?: string): Promise<ActionResult>;
    delete(postId: string): Promise<ActionResult>;
    like(postId: string): Promise<ActionResult>;
    unlike(postId: string): Promise<ActionResult>;
    follow(userId: string): Promise<ActionResult>;
    unfollow(userId: string): Promise<ActionResult>;
    getProfile(userId?: string): Promise<UserProfile>;
    getContent(postId: string): Promise<ContentItem>;
    search(query: string, options?: any): Promise<ContentItem[]>;
    startMonitoring(options?: any): Promise<void>;
    stopMonitoring(): Promise<void>;
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    removeWebhook(webhookId: string): Promise<boolean>;
    validateContent(content: ContentItem): Promise<boolean>;
    getAnalytics(postId: string): Promise<ContentMetrics>;
}
/**
 * Adapter factory interface
 */
export interface IAdapterFactory {
    createAdapter(platform: PlatformType, config: AdapterConfig): IPlatformAdapter;
    getSupportedPlatforms(): PlatformType[];
    getDefaultConfig(platform: PlatformType): Partial<AdapterConfig>;
}
/**
 * Adapter manager interface - 基于MPLP V1.0 Alpha架构
 */
export interface IAdapterManager extends MPLPEventEmitter {
    readonly adapters: Map<string, IPlatformAdapter>;
    addAdapter(name: string, adapter: IPlatformAdapter): Promise<void>;
    removeAdapter(name: string): Promise<void>;
    getAdapter(name: string): IPlatformAdapter | undefined;
    postToAll(content: ContentItem, platforms?: string[]): Promise<Map<string, ActionResult>>;
    postToMultiple(content: ContentItem, platforms: string[]): Promise<Map<string, ActionResult>>;
    startMonitoringAll(): Promise<void>;
    stopMonitoringAll(): Promise<void>;
    getAggregatedAnalytics(postId: string): Promise<Map<string, ContentMetrics>>;
}
/**
 * Adapter events
 */
export interface AdapterEvents {
    'adapter:ready': (adapter: IPlatformAdapter) => void;
    'adapter:error': (adapter: IPlatformAdapter, error: Error) => void;
    'adapter:ratelimit': (adapter: IPlatformAdapter, info: RateLimitInfo) => void;
    'content:posted': (adapter: IPlatformAdapter, result: ActionResult) => void;
    'content:liked': (adapter: IPlatformAdapter, result: ActionResult) => void;
    'content:shared': (adapter: IPlatformAdapter, result: ActionResult) => void;
    'content:commented': (adapter: IPlatformAdapter, result: ActionResult) => void;
    'webhook:received': (adapter: IPlatformAdapter, event: WebhookEvent) => void;
    'mention:received': (adapter: IPlatformAdapter, mention: any) => void;
    'message:received': (adapter: IPlatformAdapter, message: any) => void;
}
/**
 * Adapter plugin interface
 */
export interface IAdapterPlugin {
    readonly name: string;
    readonly version: string;
    apply(adapter: IPlatformAdapter): void | Promise<void>;
}
/**
 * Content filter interface
 */
export interface IContentFilter {
    readonly name: string;
    filter(content: ContentItem): Promise<ContentItem>;
    validate(content: ContentItem): Promise<boolean>;
}
/**
 * Analytics provider interface
 */
export interface IAnalyticsProvider {
    readonly name: string;
    track(event: string, data: any): Promise<void>;
    getMetrics(query: any): Promise<any>;
}
/**
 * Scheduler interface
 */
export interface IScheduler {
    schedule(content: ContentItem, publishAt: Date): Promise<string>;
    cancel(scheduleId: string): Promise<boolean>;
    list(): Promise<Array<{
        id: string;
        content: ContentItem;
        publishAt: Date;
    }>>;
}
//# sourceMappingURL=types.d.ts.map