/**
 * @fileoverview Slack Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Slack平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * Slack扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface SlackExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * Slack platform adapter
 */
export declare class SlackAdapter extends BaseAdapter {
    private client?;
    private botId?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化Slack客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with Slack
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from Slack
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Send Slack message
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Reply to Slack message (thread)
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share Slack message (quote in new message)
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete Slack message
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Add reaction to Slack message
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Remove reaction from Slack message
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow user (not supported in Slack)
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow user (not supported in Slack)
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get Slack user profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get Slack message content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search Slack messages
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get Slack message analytics (limited)
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup Slack webhook
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove Slack webhook
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring Slack events
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate Slack-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * Parse post ID to extract channel and timestamp
     */
    private parsePostId;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): SlackExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
    /**
     * Slack API框架 - 基于@slack/web-api库
     */
    private createSlackApiFramework;
}
export {};
//# sourceMappingURL=SlackAdapter.d.ts.map