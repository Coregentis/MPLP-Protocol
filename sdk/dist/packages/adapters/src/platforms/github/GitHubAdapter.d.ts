/**
 * @fileoverview GitHub Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的GitHub平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * GitHub扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface GitHubExtensionConfig {
    extension_id: string;
    extension_type: 'adapter';
    status: 'active' | 'inactive' | 'error';
    compatibility: {
        mplp_version: string;
        required_modules: string[];
    };
}
/**
 * GitHub平台适配器 - 基于MPLP V1.0 Alpha Extension架构
 * @description 继承MPLP V1.0 Alpha的Extension模式和事件系统
 */
export declare class GitHubAdapter extends BaseAdapter {
    private client?;
    private extensionConfig;
    constructor(config: AdapterConfig);
    /**
     * 初始化GitHub客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with GitHub
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from GitHub
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Create GitHub content (Issue, PR, or Release)
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Comment on GitHub issue/PR
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share GitHub content (limited - can star repository)
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete GitHub content (limited)
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Star a repository
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Unstar a repository
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow a GitHub user
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow a GitHub user
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get GitHub user profile
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get GitHub issue/PR content
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search GitHub issues/PRs
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get GitHub content analytics
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup GitHub webhook
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove GitHub webhook
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring GitHub events
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate GitHub-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * Parse post ID to extract repository and issue/PR number
     */
    private parsePostId;
    /**
     * 创建测试模拟客户端 - 用于测试环境
     */
    private createTestMockClient;
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig(): GitHubExtensionConfig;
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void;
    /**
     * 临时方法 - 需要完成其他API方法的真实实现
     */
    private createMockClient;
}
export {};
//# sourceMappingURL=GitHubAdapter.d.ts.map