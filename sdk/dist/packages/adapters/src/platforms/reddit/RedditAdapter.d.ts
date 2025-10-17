/**
 * @fileoverview Reddit Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Reddit平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * Reddit扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface RedditExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * Reddit platform adapter
 */
export declare class RedditAdapter extends BaseAdapter {
    private client?;
    private username?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化Reddit客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with Reddit
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from Reddit
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Submit Reddit post
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Comment on Reddit post
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share Reddit post (not directly supported)
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete Reddit post/comment
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Upvote Reddit post/comment
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Remove vote from Reddit post/comment
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow user (not directly supported)
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow user (not directly supported)
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get Reddit user profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get Reddit post content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search Reddit posts
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get Reddit post analytics
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup webhook (not supported)
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove webhook (not supported)
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring (polling-based)
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate Reddit-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): RedditExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
    /**
     * Reddit API框架 - 基于snoowrap库
     */
    private createRedditApiFramework;
}
export {};
//# sourceMappingURL=RedditAdapter.d.ts.map