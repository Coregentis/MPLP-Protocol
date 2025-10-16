/**
 * Social Publisher Agent
 * Responsible for publishing content to social media platforms
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentCapability,
  Task,
  AgentMessage,
  ContentItem,
  ContentStatus,
  SocialPlatform,
  PlatformConfig,
  SocialMediaError
} from '../types';

export class SocialPublisherAgent extends BaseAgent {
  private platformConfigs: Map<SocialPlatform, PlatformConfig> = new Map();
  private publishQueue: ContentItem[] = [];
  private publishHistory: Map<string, any> = new Map();

  constructor() {
    super(
      'Social Publisher',
      'social-publisher',
      [
        'multi_platform_publishing',
        'scheduling_optimization',
        'real_time_monitoring'
      ]
    );
  }

  protected async onInitialize(): Promise<void> {
    this.initializePlatformConfigs();
    this.startPublishingScheduler();
  }

  protected async processTask(task: Task): Promise<unknown> {
    switch (task.type) {
      case 'content_publishing':
        return await this.publishContent(task);
      default:
        throw new SocialMediaError(
          `Unsupported task type: ${task.type}`,
          'UNSUPPORTED_TASK_TYPE',
          undefined,
          { agentId: this.id, taskType: task.type }
        );
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'coordination_request':
        await this.handleCoordinationRequest(message);
        break;
      case 'data_sharing':
        await this.handleDataSharing(message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  protected async onShutdown(): Promise<void> {
    // Process remaining items in publish queue
    await this.processPublishQueue();
    this.platformConfigs.clear();
    this.publishHistory.clear();
  }

  private async publishContent(task: Task): Promise<{ success: boolean; publishedTo: SocialPlatform[]; errors: any[] }> {
    const { content } = task.data.parameters as { content: ContentItem };
    
    const results = {
      success: true,
      publishedTo: [] as SocialPlatform[],
      errors: [] as any[]
    };

    for (const platform of content.platforms) {
      try {
        await this.publishToPlatform(content, platform);
        results.publishedTo.push(platform);
        
        // Update content status
        content.status = ContentStatus.PUBLISHED;
        
        // Record in history
        this.publishHistory.set(`${content.id}-${platform}`, {
          contentId: content.id,
          platform,
          publishedAt: new Date(),
          success: true
        });
        
      } catch (error) {
        results.success = false;
        results.errors.push({ platform, error: (error as Error).message });
        
        // Record failure in history
        this.publishHistory.set(`${content.id}-${platform}`, {
          contentId: content.id,
          platform,
          publishedAt: new Date(),
          success: false,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  private async publishToPlatform(content: ContentItem, platform: SocialPlatform): Promise<void> {
    const config = this.platformConfigs.get(platform);
    if (!config || !config.enabled) {
      throw new SocialMediaError(
        `Platform ${platform} not configured or disabled`,
        'PLATFORM_NOT_CONFIGURED',
        platform
      );
    }

    // Simulate API call to publish content
    console.log(`Publishing to ${platform}:`, {
      title: content.title,
      content: content.content,
      hashtags: content.hashtags,
      scheduledTime: content.scheduledTime
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new SocialMediaError(
        `Failed to publish to ${platform}`,
        'PUBLISH_FAILED',
        platform,
        { contentId: content.id }
      );
    }
  }

  private initializePlatformConfigs(): void {
    // Initialize platform configurations
    const platforms = [
      SocialPlatform.TWITTER,
      SocialPlatform.LINKEDIN,
      SocialPlatform.FACEBOOK,
      SocialPlatform.INSTAGRAM
    ];

    platforms.forEach(platform => {
      this.platformConfigs.set(platform, {
        platform,
        enabled: true,
        credentials: {
          apiKey: `${platform}_api_key`,
          apiSecret: `${platform}_api_secret`,
          accessToken: `${platform}_access_token`
        },
        settings: {
          autoPost: true,
          autoReply: false,
          autoLike: false,
          autoFollow: false,
          contentFilters: [],
          hashtagStrategy: {
            maxHashtags: platform === SocialPlatform.INSTAGRAM ? 10 : 3,
            trendingWeight: 0.5,
            brandHashtags: ['#ourcompany'],
            excludedHashtags: ['#spam'],
            autoGenerate: true
          },
          postingSchedule: {
            timezone: 'UTC',
            optimalTimes: [
              { dayOfWeek: 1, hour: 9, minute: 0 },
              { dayOfWeek: 3, hour: 12, minute: 0 },
              { dayOfWeek: 5, hour: 15, minute: 0 }
            ],
            frequency: {
              postsPerDay: platform === SocialPlatform.TWITTER ? 3 : 1,
              postsPerWeek: platform === SocialPlatform.TWITTER ? 15 : 5,
              minInterval: 120,
              maxInterval: 480
            },
            blackoutPeriods: []
          }
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstLimit: 10
        }
      });
    });
  }

  private startPublishingScheduler(): void {
    // Start a scheduler to process queued content
    setInterval(() => {
      this.processPublishQueue().catch(error => {
        console.error('Error processing publish queue:', error);
      });
    }, 60000); // Check every minute
  }

  private async processPublishQueue(): Promise<void> {
    const now = new Date();
    const readyToPublish = this.publishQueue.filter(content => 
      content.scheduledTime && content.scheduledTime <= now
    );

    for (const content of readyToPublish) {
      try {
        await this.publishContent({
          id: `queue-${Date.now()}`,
          type: 'content_publishing',
          priority: 2,
          data: { parameters: { content } },
          status: 'pending' as any,
          createdAt: new Date()
        });

        // Remove from queue
        const index = this.publishQueue.indexOf(content);
        if (index > -1) {
          this.publishQueue.splice(index, 1);
        }
      } catch (error) {
        console.error(`Failed to publish queued content ${content.id}:`, error);
      }
    }
  }

  private async handleCoordinationRequest(message: AgentMessage): Promise<void> {
    const response = {
      id: `response-${Date.now()}`,
      from: this.id,
      to: message.from,
      type: 'coordination_response' as const,
      payload: {
        data: { status: 'acknowledged', capabilities: this.capabilities },
        metadata: { originalMessageId: message.id }
      },
      timestamp: new Date(),
      priority: message.priority
    };

    this.emit('sendMessage', response);
  }

  private async handleDataSharing(message: AgentMessage): Promise<void> {
    const sharedData = message.payload.data;
    console.log(`Received shared data from ${message.from}:`, sharedData);
  }

  /**
   * Add content to publish queue
   */
  public queueContent(content: ContentItem): void {
    this.publishQueue.push(content);
  }

  /**
   * Get publishing statistics
   */
  public getPublishingStats(): {
    totalPublished: number;
    successRate: number;
    platformBreakdown: Record<string, number>;
  } {
    const history = Array.from(this.publishHistory.values());
    const totalPublished = history.length;
    const successful = history.filter(h => h.success).length;
    const successRate = totalPublished > 0 ? successful / totalPublished : 0;

    const platformBreakdown: Record<string, number> = {};
    history.forEach(h => {
      platformBreakdown[h.platform] = (platformBreakdown[h.platform] || 0) + 1;
    });

    return {
      totalPublished,
      successRate,
      platformBreakdown
    };
  }
}
