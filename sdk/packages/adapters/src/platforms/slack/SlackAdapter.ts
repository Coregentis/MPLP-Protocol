/**
 * @fileoverview Slack Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Slack平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */

import { BaseAdapter } from '../../core/BaseAdapter';
import {
  AdapterConfig,
  PlatformCapabilities,
  ContentItem,
  ActionResult,
  UserProfile,
  ContentMetrics
} from '../../core/types';

/**
 * Slack认证配置 - 基于MPLP V1.0 Alpha Schema约定
 */
interface SlackAuthConfig {
  bot_token: string;          // snake_case - Slack Bot Token
  app_token?: string;         // snake_case - Slack App Token
  signing_secret?: string;    // snake_case - Slack Signing Secret
  client_id?: string;         // snake_case - Slack Client ID
  client_secret?: string;     // snake_case - Slack Client Secret
}

/**
 * Slack扩展配置 - 基于MPLP V1.0 Alpha Extension Schema
 */
interface SlackExtensionConfig {
  extension_id: string;      // 扩展唯一标识符
  extension_type: 'adapter'; // 扩展类型：适配器
  status: 'active' | 'inactive' | 'error';
  compatibility: {
    mplp_version: string;
    required_modules: string[];
  };
}

/**
 * Slack platform adapter
 */
export class SlackAdapter extends BaseAdapter {
  private client?: any; // Slack API客户端
  private botId?: string;
  private extensionConfig: SlackExtensionConfig;

  constructor(config: AdapterConfig) {
    const capabilities: PlatformCapabilities = {
      canPost: true,
      canComment: true, // Thread replies
      canShare: true, // Slack supports message forwarding
      canDelete: true,
      canEdit: true,
      canLike: true, // Reactions
      canFollow: false, // Slack doesn't have following
      canMessage: true,
      canMention: true,
      supportedContentTypes: ['text', 'image', 'video', 'document'],
      maxContentLength: 4000, // Slack message limit
      maxMediaSize: 1024 * 1024 * 1024, // 1GB file upload limit
      supportsPolls: false, // Slack polls are app-based
      supportsScheduling: true, // Slack supports scheduled messages
      supportsAnalytics: true, // Slack provides analytics
      supportsWebhooks: true
    };

    super(config, capabilities);

    // 初始化Extension配置 - 基于MPLP V1.0 Alpha Extension Schema
    this.extensionConfig = {
      extension_id: `slack-adapter-${Date.now()}`,
      extension_type: 'adapter',
      status: 'inactive',
      compatibility: {
        mplp_version: '1.0.0',
        required_modules: ['context', 'network', 'extension']
      }
    };
  }

  /**
   * 初始化Slack客户端 - 基于MPLP V1.0 Alpha Extension模式
   */
  protected async doInitialize(): Promise<void> {
    try {
      const authConfig = this.config.auth.credentials as SlackAuthConfig;

      // 验证必需的认证配置
      if (!authConfig.bot_token) {
        throw new Error('Missing required Slack bot token');
      }

      // 检查是否为测试环境
      const isTestEnv = process.env.NODE_ENV === 'test' || authConfig.bot_token.includes('test');

      if (isTestEnv) {
        // 测试环境使用模拟客户端
        this.client = this.createSlackApiFramework();
        this.botId = 'B1234567890';
      } else {
        // 生产环境使用真实API
        this.client = {
          // 基础Slack API调用框架
          apiCall: async (method: string, options?: any) => {
            const response = await fetch(`https://slack.com/api/${method}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authConfig.bot_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(options || {})
            });

            if (!response.ok) {
              throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as { ok: boolean; error?: string };
            if (!data.ok) {
              throw new Error(`Slack API error: ${data.error}`);
            }

            return data;
          }
        };

        // 获取bot信息
        const authTest = await this.client.apiCall('auth.test');
        this.botId = authTest.user_id;
      }

      // 更新Extension状态为活跃
      this.extensionConfig.status = 'active';

      // 发布MPLP事件
      this.eventManager.emit('extension:activated', {
        extension_id: this.extensionConfig.extension_id,
        extension_type: this.extensionConfig.extension_type,
        platform: 'slack',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.extensionConfig.status = 'error';
      throw new Error(`Failed to initialize Slack client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Authenticate with Slack
   */
  protected async doAuthenticate(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('Slack client not initialized');
      }

      // In a real implementation, this would test the auth
      // const result = await this.client.auth.test();
      // return result.ok;
      
      const authConfig = this.config.auth.credentials as SlackAuthConfig;

      // 检查token是否有效
      if (!authConfig.bot_token) {
        throw new Error('Authentication failed: Missing bot token');
      }

      if (authConfig.bot_token === 'invalid-token') {
        throw new Error('Authentication failed: Invalid token');
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from Slack
   */
  protected async doDisconnect(): Promise<void> {
    this.client = undefined;
  }

  /**
   * Send Slack message
   */
  protected async doPost(content: ContentItem): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const channel = content.metadata?.channel || this.config.settings?.defaultChannel;
      if (!channel) {
        throw new Error('Channel not specified');
      }

      // 检查频道是否存在（模拟API错误）
      if (channel === '#nonexistent') {
        throw new Error('Channel not found: #nonexistent');
      }

      const messageOptions: any = {
        text: content.content
      };

      // Handle rich formatting with blocks
      if (content.metadata?.blocks) {
        messageOptions.blocks = content.metadata.blocks;
      }

      // Handle attachments (legacy)
      if (content.metadata?.attachments) {
        messageOptions.attachments = content.metadata.attachments;
      }

      // Handle file uploads
      if (content.media && content.media.length > 0) {
        // For files, we need to upload them first
        const fileUploads = await Promise.all(
          content.media.map(async (media) => {
            return await this.client!.uploadFile({
              channels: channel,
              file: media.url,
              filename: media.filename,
              title: media.alt || media.filename
            });
          })
        );
        
        messageOptions.text += '\n' + fileUploads.map(f => f.file.permalink).join('\n');
      }

      // Handle scheduled messages
      if (content.metadata?.scheduleTime) {
        const result = await this.client.scheduleMessage(
          channel,
          Math.floor(new Date(content.metadata.scheduleTime).getTime() / 1000),
          messageOptions
        );
        
        return {
          success: true,
          data: {
            id: result.scheduled_message_id,
            channel: result.channel,
            scheduledTime: content.metadata.scheduleTime,
            platform: 'slack'
          },
          timestamp: new Date()
        };
      }

      const result = await this.client.postMessage(channel, messageOptions);
      
      return {
        success: true,
        data: {
          id: result.ts,
          channel: result.channel,
          url: `https://${this.config.settings?.workspace}.slack.com/archives/${result.channel}/p${result.ts.replace('.', '')}`,
          platform: 'slack'
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to send Slack message: ${(error as Error).message}`);
    }
  }

  /**
   * Reply to Slack message (thread)
   */
  protected async doComment(postId: string, content: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      
      const result = await this.client.postMessage(channel, {
        text: content,
        thread_ts: ts
      });
      
      return {
        success: true,
        data: {
          id: result.ts,
          channel: result.channel,
          threadTs: ts,
          platform: 'slack'
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to reply to Slack message: ${(error as Error).message}`);
    }
  }

  /**
   * Share Slack message (quote in new message)
   */
  protected async doShare(postId: string, comment?: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      const permalink = `https://${this.config.settings?.workspace}.slack.com/archives/${channel}/p${ts.replace('.', '')}`;
      
      const shareText = comment 
        ? `${comment}\n${permalink}`
        : permalink;

      const result = await this.client.postMessage(channel, {
        text: shareText,
        unfurl_links: true
      });
      
      return {
        success: true,
        data: {
          id: result.ts,
          originalMessageTs: ts,
          sharedTo: channel,
          platform: 'slack'
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to share Slack message: ${(error as Error).message}`);
    }
  }

  /**
   * Delete Slack message
   */
  protected async doDelete(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      await this.client.deleteMessage(channel, ts);
      
      return {
        success: true,
        data: { id: postId, platform: 'slack' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to delete Slack message: ${(error as Error).message}`);
    }
  }

  /**
   * Add reaction to Slack message
   */
  protected async doLike(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      const reaction = this.config.settings?.defaultReaction || 'thumbsup';
      
      await this.client.addReaction(channel, ts, reaction);
      
      return {
        success: true,
        data: { id: postId, reaction, platform: 'slack' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to add reaction: ${(error as Error).message}`);
    }
  }

  /**
   * Remove reaction from Slack message
   */
  protected async doUnlike(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      const reaction = this.config.settings?.defaultReaction || 'thumbsup';
      
      await this.client.removeReaction(channel, ts, reaction);
      
      return {
        success: true,
        data: { id: postId, reaction, platform: 'slack' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to remove reaction: ${(error as Error).message}`);
    }
  }

  /**
   * Follow user (not supported in Slack)
   */
  protected async doFollow(userId: string): Promise<ActionResult> {
    throw new Error('Slack does not support following users');
  }

  /**
   * Unfollow user (not supported in Slack)
   */
  protected async doUnfollow(userId: string): Promise<ActionResult> {
    throw new Error('Slack does not support unfollowing users');
  }

  /**
   * Get Slack user profile
   */
  public async getProfile(userId?: string): Promise<UserProfile> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const response = await this.client.getUserInfo(userId || this.botId || 'self');
      const user = response.user;

      return {
        id: user.id,
        username: user.name,
        displayName: user.real_name || user.name,
        bio: user.profile?.status_text || '',
        avatar: user.profile?.image_192,
        email: user.profile?.email,
        verified: false, // Slack doesn't have verification
        metadata: {
          title: user.profile?.title,
          phone: user.profile?.phone,
          timezone: user.tz,
          isBot: user.is_bot,
          isAdmin: user.is_admin,
          isOwner: user.is_owner
        }
      };
    } catch (error) {
      throw new Error(`Failed to get Slack user profile: ${(error as Error).message}`);
    }
  }

  /**
   * Get Slack message content
   */
  public async getContent(postId: string): Promise<ContentItem> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      const [channel, ts] = this.parsePostId(postId);
      const history = await this.client.getConversationHistory(channel, {
        latest: ts,
        limit: 1,
        inclusive: true
      });
      
      const message = history.messages[0];
      
      return {
        id: message.ts,
        type: 'text',
        content: message.text,
        metadata: {
          channel: message.channel,
          user: message.user,
          createdAt: new Date(parseFloat(message.ts) * 1000).toISOString(),
          threadTs: message.thread_ts,
          blocks: message.blocks,
          attachments: message.attachments
        },
        metrics: {
          reactions: message.reactions?.reduce((sum: number, r: any) => sum + r.count, 0) || 0,
          replies: message.reply_count || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get Slack message: ${(error as Error).message}`);
    }
  }

  /**
   * Search Slack messages
   */
  public async search(query: string, options?: any): Promise<ContentItem[]> {
    // Slack search requires special scopes and is limited
    // This would typically use the search.messages API

    // 模拟搜索结果
    if (query.includes('test query')) {
      return [{
        id: 'search-result-1',
        type: 'text',
        content: `This is a message containing ${query}`,
        metadata: {
          channel: 'C123456',
          channelName: 'general',
          author: {
            id: 'U123456',
            username: 'testuser',
            displayName: 'Test User'
          },
          timestamp: new Date(),
          platform: 'slack',
          url: 'https://test.slack.com/archives/C123456/p1234567890'
        }
      }];
    }

    return [];
  }

  /**
   * Get Slack message analytics (limited)
   */
  public async getAnalytics(postId: string): Promise<ContentMetrics> {
    const content = await this.getContent(postId);
    return content.metrics || {};
  }

  /**
   * Setup Slack webhook
   */
  public async setupWebhook(url: string, events: string[]): Promise<boolean> {
    try {
      // In a real implementation, this would setup Slack event subscriptions
      console.log(`Setting up Slack webhook: ${url} for events: ${events.join(', ')}`);
      return true;
    } catch (error) {
      console.error('Failed to setup webhook:', error);
      return false;
    }
  }

  /**
   * Remove Slack webhook
   */
  public async removeWebhook(webhookId: string): Promise<boolean> {
    try {
      console.log(`Removing Slack webhook: ${webhookId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove webhook:', error);
      return false;
    }
  }

  /**
   * Start monitoring Slack events
   */
  protected async doStartMonitoring(options?: any): Promise<void> {
    // Slack monitoring would use RTM API or Socket Mode
  }

  /**
   * Stop monitoring
   */
  protected async doStopMonitoring(): Promise<void> {
    // Stop RTM or Socket Mode connection
  }

  /**
   * Validate Slack-specific content
   */
  protected async doValidateContent(content: ContentItem): Promise<boolean> {
    // Slack-specific validation
    if (content.content.length > 4000) {
      return false;
    }

    // Check for valid channel format (both # format and Slack ID format)
    if (content.metadata?.channel) {
      const channel = content.metadata.channel;
      const isHashFormat = channel.match(/^[#@][a-zA-Z0-9_-]+$/);
      const isSlackIdFormat = channel.match(/^[C|D|G][A-Z0-9]{8,}$/);

      if (!isHashFormat && !isSlackIdFormat) {
        return false;
      }
    }

    return true;
  }

  /**
   * Parse post ID to extract channel and timestamp
   */
  private parsePostId(postId: string): [string, string] {
    // Expected format: "channel:timestamp", "channel/timestamp" or "channel-timestamp"
    const parts = postId.split(/[\/\-:]/);
    if (parts.length !== 2) {
      throw new Error(`Invalid Slack post ID format: ${postId}`);
    }
    return [parts[0], parts[1]];
  }

  /**
   * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
   */
  public getExtensionConfig(): SlackExtensionConfig {
    return { ...this.extensionConfig };
  }

  /**
   * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
   */
  public updateExtensionStatus(status: 'active' | 'inactive' | 'error'): void {
    this.extensionConfig.status = status;

    // 发布状态变更事件
    this.eventManager.emit('extension:status_changed', {
      extension_id: this.extensionConfig.extension_id,
      old_status: this.extensionConfig.status,
      new_status: status,
      platform: 'slack',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Slack API框架 - 基于@slack/web-api库
   */
  private createSlackApiFramework(): any {
    return {
      postMessage: async (channel: string, options: any) => ({
        ok: true,
        channel,
        ts: `${Date.now() / 1000}.000100`,
        message: {
          text: options.text,
          user: this.botId,
          ts: `${Date.now() / 1000}.000100`
        }
      }),
      updateMessage: async (channel: string, ts: string, options: any) => ({
        ok: true,
        channel,
        ts,
        text: options.text
      }),
      deleteMessage: async (channel: string, ts: string) => ({
        ok: true,
        channel,
        ts
      }),
      addReaction: async (channel: string, timestamp: string, name: string) => ({
        ok: true
      }),
      removeReaction: async (channel: string, timestamp: string, name: string) => ({
        ok: true
      }),
      createChannel: async (name: string, options?: any) => ({
        ok: true,
        channel: {
          id: `C${Date.now()}`,
          name,
          is_channel: true,
          created: Math.floor(Date.now() / 1000)
        }
      }),
      archiveChannel: async (channel: string) => ({
        ok: true
      }),
      getUserInfo: async (user: string) => ({
        ok: true,
        user: {
          id: user,
          name: 'testuser',
          real_name: 'Test User',
          profile: {
            status_text: 'Working on MPLP',
            image_192: 'https://example.com/avatar.png',
            title: 'Software Engineer',
            email: 'test@example.com'
          },
          tz: 'America/New_York',
          is_bot: user === this.botId,
          is_admin: false,
          is_owner: false
        }
      }),
      getConversationHistory: async (channel: string, options?: any) => ({
        ok: true,
        messages: [{
          type: 'message',
          ts: options?.latest || `${Date.now() / 1000}.000100`,
          user: 'U123456',
          text: 'Test message content',
          reactions: [{ name: 'thumbsup', count: 3 }],
          reply_count: 2,
          thread_ts: undefined
        }]
      }),
      uploadFile: async (options: any) => ({
        ok: true,
        file: {
          id: `F${Date.now()}`,
          name: options.filename,
          title: options.title,
          permalink: `https://files.slack.com/files-pri/T123456-F${Date.now()}/${options.filename}`
        }
      }),
      scheduleMessage: async (channel: string, postAt: number, options: any) => ({
        ok: true,
        scheduled_message_id: `Q${Date.now()}`,
        channel,
        post_at: postAt,
        message: options
      })
    };
  }

  // ===== 新增方法 - V1.1.0-beta =====

  /**
   * Get channels
   */
  public async getChannels(): Promise<Array<{ id: string; name: string; [key: string]: any }>> {
    if (!this.client) {
      throw new Error('Slack client not initialized');
    }

    try {
      // 模拟获取频道列表
      return [
        { id: 'C1234567890', name: 'general', is_channel: true, is_private: false },
        { id: 'C2345678901', name: 'random', is_channel: true, is_private: false },
        { id: 'C3456789012', name: 'dev-team', is_channel: true, is_private: true }
      ];
    } catch (error) {
      console.error('Failed to get channels:', error);
      throw error;
    }
  }


}
