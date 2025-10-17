/**
 * @fileoverview Medium Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Medium平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * Medium扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface MediumExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * Medium platform adapter
 */
export declare class MediumAdapter extends BaseAdapter {
    private client?;
    private userId?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化Medium客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with Medium
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from Medium
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Publish Medium article
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Comment on Medium article (not supported)
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share Medium article (not supported)
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete Medium article (not supported)
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Like Medium article (not supported)
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Unlike Medium article (not supported)
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow user (not supported)
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow user (not supported)
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get Medium user profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get Medium article content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search Medium articles (limited)
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get Medium article analytics (limited)
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
     * Start monitoring (not supported)
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate Medium-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * Get user's publications
     */
    getPublications(): Promise<any[]>;
    /**
     * Get user's articles
     */
    getUserArticles(options?: any): Promise<ContentItem[]>;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): MediumExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
    /**
     * Medium API框架 - 基于真实API
     */
    private createMediumApiFramework;
}
export {};
//# sourceMappingURL=MediumAdapter.d.ts.map