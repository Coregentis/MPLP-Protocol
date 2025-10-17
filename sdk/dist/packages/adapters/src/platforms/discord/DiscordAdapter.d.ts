/**
 * @fileoverview Discord platform adapter - Production Implementation
 */
import { BaseAdapter } from '../../core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, UserProfile, ContentMetrics } from '../../core/types';
/**
 * Discord platform adapter - Production Implementation
 */
export declare class DiscordAdapter extends BaseAdapter {
    private client?;
    private botId?;
    private isReady;
    constructor(config: AdapterConfig);
    /**
     * Initialize Discord client - Production Implementation
     */
    protected doInitialize(): Promise<void>;
    /**
     * Authenticate with Discord - Production Implementation
     */
    protected doAuthenticate(): Promise<boolean>;
    /**
     * Disconnect from Discord - Production Implementation
     */
    protected doDisconnect(): Promise<void>;
    /**
     * Send Discord message - Production Implementation
     */
    protected doPost(content: ContentItem): Promise<ActionResult>;
    /**
     * Reply to Discord message - Production Implementation
     */
    protected doComment(postId: string, content: string): Promise<ActionResult>;
    /**
     * Share Discord message (quote message) - Production Implementation
     */
    protected doShare(postId: string, comment?: string): Promise<ActionResult>;
    /**
     * Delete Discord message - Production Implementation
     */
    protected doDelete(postId: string): Promise<ActionResult>;
    /**
     * Add reaction to Discord message - Production Implementation
     */
    protected doLike(postId: string): Promise<ActionResult>;
    /**
     * Remove reaction from Discord message - Production Implementation
     */
    protected doUnlike(postId: string): Promise<ActionResult>;
    /**
     * Follow user (not supported in Discord)
     */
    protected doFollow(userId: string): Promise<ActionResult>;
    /**
     * Unfollow user (not supported in Discord)
     */
    protected doUnfollow(userId: string): Promise<ActionResult>;
    /**
     * Get Discord user profile - Production Implementation
     */
    getProfile(userId?: string): Promise<UserProfile>;
    /**
     * Get Discord message content - Production Implementation
     */
    getContent(postId: string): Promise<ContentItem>;
    /**
     * Search Discord messages (limited)
     */
    search(query: string, options?: any): Promise<ContentItem[]>;
    /**
     * Get Discord message analytics (limited)
     */
    getAnalytics(postId: string): Promise<ContentMetrics>;
    /**
     * Setup Discord webhook
     */
    setupWebhook(url: string, events: string[]): Promise<boolean>;
    /**
     * Remove Discord webhook
     */
    removeWebhook(webhookId: string): Promise<boolean>;
    /**
     * Start monitoring Discord events
     */
    protected doStartMonitoring(options?: any): Promise<void>;
    /**
     * Stop monitoring
     */
    protected doStopMonitoring(): Promise<void>;
    /**
     * Validate Discord-specific content
     */
    protected doValidateContent(content: ContentItem): Promise<boolean>;
    /**
     * Parse post ID to extract channel and message IDs
     */
    private parsePostId;
    /**
     * 创建测试模拟客户端 - 用于测试环境
     */
    private createTestMockClient;
}
//# sourceMappingURL=DiscordAdapter.d.ts.map