/**
 * @fileoverview LinkedIn Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的LinkedIn平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * LinkedIn扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface LinkedInExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * LinkedIn平台适配器 - 基于MPLP V1.0 Alpha Extension架构
 * @description 继承MPLP V1.0 Alpha的Extension模式和事件系统
 * @note LinkedIn API需要企业级访问权限，此实现提供基础框架
 */
export declare class LinkedInAdapter extends BaseAdapter {
    private client?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化LinkedIn客户端 - 基于MPLP V1.0 Alpha Extension模式
     * @note LinkedIn API需要企业级访问权限和复杂的OAuth流程
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with LinkedIn
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from LinkedIn
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Create a LinkedIn post
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Comment on a LinkedIn post
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share a LinkedIn post
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete a LinkedIn post
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Like a LinkedIn post
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Unlike a LinkedIn post
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow a company/user
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow a company/user
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get LinkedIn profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get LinkedIn post content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search LinkedIn posts
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get LinkedIn post analytics
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup webhook (limited support)
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove webhook
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring (limited)
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate LinkedIn-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): LinkedInExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
    /**
     * LinkedIn企业级API框架 - 需要真实SDK实现
     * @note 此方法提供基础框架，生产环境需要使用linkedin-api-client等企业级SDK
     */
    private createLinkedInApiFramework;
    /**
     * 创建测试模拟客户端 - 用于测试环境
     */
    private createTestMockClient;
}
export {};
//# sourceMappingURL=LinkedInAdapter.d.ts.map