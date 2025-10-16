/**
 * Social Media Bot - Main Entry Point
 * Enterprise social media automation system using MPLP SDK
 */

import { EventEmitter } from 'events';
import {
  ContentPlannerAgent,
  ContentCreatorAgent,
  SocialPublisherAgent
} from './agents';
import {
  Task,
  TaskPriority,
  TaskStatus,
  SocialPlatform,
  ContentItem,
  AgentMessage,
  SocialMediaError
} from './types';

/**
 * Social Media Bot Application
 */
export class SocialMediaBot extends EventEmitter {
  private contentPlanner: ContentPlannerAgent;
  private contentCreator: ContentCreatorAgent;
  private socialPublisher: SocialPublisherAgent;
  private isInitialized = false;

  constructor() {
    super();
    this.contentPlanner = new ContentPlannerAgent();
    this.contentCreator = new ContentCreatorAgent();
    this.socialPublisher = new SocialPublisherAgent();
    this.setupAgentCommunication();
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Social Media Bot...');
      await Promise.all([
        this.contentPlanner.initialize(),
        this.contentCreator.initialize(),
        this.socialPublisher.initialize()
      ]);
      this.isInitialized = true;
      console.log('✅ Social Media Bot initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Social Media Bot:', error);
      throw error;
    }
  }

  async createContentWorkflow(params: {
    platforms: SocialPlatform[];
    contentType: string;
    targetAudience: string[];
    timeframe: { start: Date; end: Date };
  }): Promise<ContentItem[]> {
    if (!this.isInitialized) {
      throw new SocialMediaError('Bot not initialized', 'BOT_NOT_INITIALIZED');
    }

    const workflowId = `workflow-${Date.now()}`;
    console.log(`📋 Starting content workflow ${workflowId}...`);

    try {
      // Step 1: Plan content
      const planningTask: Task = {
        id: `plan-${Date.now()}`,
        type: 'content_planning',
        priority: TaskPriority.HIGH,
        data: { parameters: params },
        status: TaskStatus.PENDING,
        createdAt: new Date()
      };

      const planningResult = await this.contentPlanner.process(planningTask);
      const plannedContent = planningResult.result as ContentItem[];

      // Step 2: Create content
      const createdContent: ContentItem[] = [];
      for (const contentPlan of plannedContent) {
        const creationTask: Task = {
          id: `create-${Date.now()}-${Math.random()}`,
          type: 'content_creation',
          priority: TaskPriority.MEDIUM,
          data: {
            parameters: {
              contentPlan,
              platform: contentPlan.platforms[0],
              targetAudience: params.targetAudience
            }
          },
          status: TaskStatus.PENDING,
          createdAt: new Date()
        };

        const creationResult = await this.contentCreator.process(creationTask);
        const content = creationResult.result as ContentItem;
        createdContent.push(content);
      }

      // Step 3: Publish content
      for (const content of createdContent) {
        const publishTask: Task = {
          id: `publish-${Date.now()}-${Math.random()}`,
          type: 'content_publishing',
          priority: TaskPriority.HIGH,
          data: { parameters: { content } },
          status: TaskStatus.PENDING,
          createdAt: new Date()
        };

        await this.socialPublisher.process(publishTask);
      }

      console.log(`✅ Content workflow ${workflowId} completed successfully`);
      return createdContent;

    } catch (error) {
      console.error(`❌ Content workflow ${workflowId} failed:`, error);
      throw error;
    }
  }

  /**
   * Publish content immediately
   */
  async publishContent(content: ContentItem): Promise<void> {
    if (!this.isInitialized) {
      throw new SocialMediaError('Bot not initialized', 'BOT_NOT_INITIALIZED');
    }

    const publishTask: Task = {
      id: `publish-${Date.now()}`,
      type: 'content_publishing',
      priority: TaskPriority.HIGH,
      data: { parameters: { content } },
      status: TaskStatus.PENDING,
      createdAt: new Date()
    };

    await this.socialPublisher.process(publishTask);
  }

  getStatus(): { initialized: boolean; agents: Record<string, any>; publishingStats: any } {
    return {
      initialized: this.isInitialized,
      agents: {
        contentPlanner: this.contentPlanner.getHealthStatus(),
        contentCreator: this.contentCreator.getHealthStatus(),
        socialPublisher: this.socialPublisher.getHealthStatus()
      },
      publishingStats: this.socialPublisher.getPublishingStats()
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Social Media Bot...');
    try {
      await Promise.all([
        this.contentPlanner.shutdown(),
        this.contentCreator.shutdown(),
        this.socialPublisher.shutdown()
      ]);
      this.isInitialized = false;
      console.log('✅ Social Media Bot shut down successfully');
      this.emit('shutdown');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  private setupAgentCommunication(): void {
    const agents = [this.contentPlanner, this.contentCreator, this.socialPublisher];

    agents.forEach(agent => {
      agent.on('sendMessage', (message: AgentMessage) => {
        const targetAgent = agents.find(a => a.id === message.to);
        if (targetAgent) {
          targetAgent.communicate(message).catch(error => {
            console.error(`Failed to deliver message:`, error);
          });
        }
      });

      agent.on('error', (error: Error) => {
        console.error(`Agent ${agent.name} error:`, error);
        this.emit('agentError', { agentName: agent.name, error });
      });
    });
  }
}

export async function runSocialMediaDemo(): Promise<void> {
  const bot = new SocialMediaBot();

  try {
    await bot.initialize();

    const content = await bot.createContentWorkflow({
      platforms: [SocialPlatform.TWITTER, SocialPlatform.LINKEDIN],
      contentType: 'promotional',
      targetAudience: ['developers', 'entrepreneurs'],
      timeframe: {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`📊 Created ${content.length} content items`);
    const status = bot.getStatus();
    console.log('📈 Bot Status:', JSON.stringify(status, null, 2));

    await bot.shutdown();

  } catch (error) {
    console.error('Demo failed:', error);
    await bot.shutdown();
  }
}

export * from './agents';
export * from './types';

if (require.main === module) {
  runSocialMediaDemo().catch(console.error);
}