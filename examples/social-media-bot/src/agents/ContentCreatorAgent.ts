/**
 * Content Creator Agent
 * Responsible for creating social media content based on plans
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentCapability,
  Task,
  AgentMessage,
  ContentItem,
  ContentStatus,
  SocialPlatform,
  SocialMediaError
} from '../types';

export class ContentCreatorAgent extends BaseAgent {
  private contentTemplates: Map<string, string[]> = new Map();
  private mediaLibrary: Map<string, string[]> = new Map();

  constructor() {
    super(
      'Content Creator',
      'content-creator',
      [
        'content_creation',
        'content_review',
        'audience_analysis'
      ]
    );
  }

  protected async onInitialize(): Promise<void> {
    this.initializeContentTemplates();
    this.initializeMediaLibrary();
  }

  protected async processTask(task: Task): Promise<unknown> {
    switch (task.type) {
      case 'content_creation':
        return await this.createContent(task);
      case 'content_review':
        return await this.reviewContent(task);
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
    this.contentTemplates.clear();
    this.mediaLibrary.clear();
  }

  private async createContent(task: Task): Promise<ContentItem> {
    const { contentPlan, platform, targetAudience } = task.data.parameters as {
      contentPlan: any;
      platform: SocialPlatform;
      targetAudience: string[];
    };

    const content: ContentItem = {
      id: `content-${Date.now()}`,
      title: contentPlan.title || 'Generated Content',
      content: this.generateContentText(contentPlan.type, platform, targetAudience),
      hashtags: contentPlan.hashtags || [],
      mentions: [],
      platforms: [platform],
      scheduledTime: contentPlan.scheduledTime,
      status: ContentStatus.DRAFT,
      metadata: {
        author: this.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [contentPlan.type],
        category: contentPlan.type,
        priority: contentPlan.priority,
        targetAudience
      }
    };

    return content;
  }

  private async reviewContent(task: Task): Promise<{ approved: boolean; feedback: string[] }> {
    const { content } = task.data.parameters as { content: ContentItem };
    
    const feedback: string[] = [];
    let approved = true;

    // Check content length for platform
    if (content.platforms.includes(SocialPlatform.TWITTER) && content.content.length > 280) {
      feedback.push('Content exceeds Twitter character limit');
      approved = false;
    }

    // Check for required hashtags
    if (content.hashtags.length === 0) {
      feedback.push('Content should include relevant hashtags');
      approved = false;
    }

    // Check for appropriate tone
    if (content.content.includes('!'.repeat(3))) {
      feedback.push('Consider reducing excessive exclamation marks');
    }

    return { approved, feedback };
  }

  private initializeContentTemplates(): void {
    this.contentTemplates.set('promotional', [
      'Exciting news! {announcement}',
      'Check out our latest {product}',
      'Don\'t miss this opportunity: {offer}'
    ]);
    
    this.contentTemplates.set('educational', [
      'Did you know? {fact}',
      'Pro tip: {tip}',
      'Learn how to {skill}'
    ]);
  }

  private initializeMediaLibrary(): void {
    this.mediaLibrary.set('stock-images', [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ]);
  }

  private generateContentText(type: string, platform: SocialPlatform, audience: string[]): string {
    const templates = this.contentTemplates.get(type) || ['Default content for {audience}'];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template!
      .replace('{audience}', audience.join(' and '))
      .replace('{announcement}', 'our latest update')
      .replace('{product}', 'solution')
      .replace('{offer}', 'special promotion')
      .replace('{fact}', 'this interesting insight')
      .replace('{tip}', 'this helpful advice')
      .replace('{skill}', 'improve your results');
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
}
