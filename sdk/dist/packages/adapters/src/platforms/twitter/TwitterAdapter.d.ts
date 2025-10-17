/**
 * @fileoverview Twitter Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Twitter平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * Twitter扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface TwitterExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * Twitter平台适配器 - 基于MPLP V1.0 Alpha Extension架构
 * @description 继承MPLP V1.0 Alpha的Extension模式和事件系统
 */
export declare class TwitterAdapter extends BaseAdapter {
    private client?;
    private webhookServer?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化Twitter客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with Twitter
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from Twitter
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Post a tweet
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Reply to a tweet
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Retweet a tweet
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete a tweet
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Like a tweet
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Unlike a tweet
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow a user
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow a user
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get user profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get tweet content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search tweets
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get tweet analytics
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup webhook
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove webhook
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring mentions and messages
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate Twitter-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * 创建测试模拟客户端 - 用于测试环境
     */
    private createTestMockClient;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): TwitterExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
}
export {};
//# sourceMappingURL=TwitterAdapter.d.ts.map