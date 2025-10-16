/**
 * Social Media Bot - Main Application Tests
 * Comprehensive test suite for the social media automation system
 */

import { SocialMediaBot } from '../index';
import {
  ContentPlannerAgent,
  ContentCreatorAgent,
  SocialPublisherAgent
} from '../agents';
import {
  SocialPlatform,
  ContentItem,
  ContentStatus,
  ContentPriority,
  TaskPriority,
  TaskStatus
} from '../types';

// Mock the agents to avoid complex initialization in tests
jest.mock('../agents/ContentPlannerAgent');
jest.mock('../agents/ContentCreatorAgent');
jest.mock('../agents/SocialPublisherAgent');

const MockContentPlannerAgent = ContentPlannerAgent as jest.MockedClass<typeof ContentPlannerAgent>;
const MockContentCreatorAgent = ContentCreatorAgent as jest.MockedClass<typeof ContentCreatorAgent>;
const MockSocialPublisherAgent = SocialPublisherAgent as jest.MockedClass<typeof SocialPublisherAgent>;

describe('SocialMediaBot', () => {
  let bot: SocialMediaBot;
  let mockPlanner: jest.Mocked<ContentPlannerAgent>;
  let mockCreator: jest.Mocked<ContentCreatorAgent>;
  let mockPublisher: jest.Mocked<SocialPublisherAgent>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPlanner = {
      initialize: jest.fn().mockResolvedValue(undefined),
      process: jest.fn().mockResolvedValue({
        taskId: 'plan-123',
        status: TaskStatus.COMPLETED,
        result: [
          {
            id: 'content-1',
            title: 'Test Content 1',
            content: 'Test content for Twitter',
            hashtags: ['#test', '#social'],
            mentions: [],
            platforms: [SocialPlatform.TWITTER],
            status: ContentStatus.DRAFT,
            metadata: {
              author: 'Content Planner',
              createdAt: new Date(),
              updatedAt: new Date(),
              tags: ['promotional'],
              category: 'promotional',
              priority: ContentPriority.MEDIUM,
              targetAudience: ['developers']
            }
          }
        ],
        completedAt: new Date(),
        duration: 100
      }),
      shutdown: jest.fn().mockResolvedValue(undefined),
      getHealthStatus: jest.fn().mockReturnValue({
        status: 'idle',
        activeTasksCount: 0,
        isInitialized: true
      }),
      communicate: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn()
    } as any;

    mockCreator = {
      initialize: jest.fn().mockResolvedValue(undefined),
      process: jest.fn().mockResolvedValue({
        taskId: 'create-123',
        status: TaskStatus.COMPLETED,
        result: {
          id: 'content-1',
          title: 'Test Content 1',
          content: 'Generated content for social media',
          hashtags: ['#test', '#social'],
          mentions: [],
          platforms: [SocialPlatform.TWITTER],
          status: ContentStatus.DRAFT,
          metadata: {
            author: 'Content Creator',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: ['promotional'],
            category: 'promotional',
            priority: ContentPriority.MEDIUM,
            targetAudience: ['developers']
          }
        },
        completedAt: new Date(),
        duration: 200
      }),
      shutdown: jest.fn().mockResolvedValue(undefined),
      getHealthStatus: jest.fn().mockReturnValue({
        status: 'idle',
        activeTasksCount: 0,
        isInitialized: true
      }),
      communicate: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn()
    } as any;

    mockPublisher = {
      initialize: jest.fn().mockResolvedValue(undefined),
      process: jest.fn().mockResolvedValue({
        taskId: 'publish-123',
        status: TaskStatus.COMPLETED,
        result: {
          success: true,
          publishedTo: [SocialPlatform.TWITTER],
          errors: []
        },
        completedAt: new Date(),
        duration: 300
      }),
      shutdown: jest.fn().mockResolvedValue(undefined),
      getHealthStatus: jest.fn().mockReturnValue({
        status: 'idle',
        activeTasksCount: 0,
        isInitialized: true
      }),
      getPublishingStats: jest.fn().mockReturnValue({
        totalPublished: 5,
        successRate: 0.9,
        platformBreakdown: {
          twitter: 3,
          linkedin: 2
        }
      }),
      queueContent: jest.fn(),
      communicate: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn()
    } as any;

    // Mock constructors
    MockContentPlannerAgent.mockImplementation(() => mockPlanner);
    MockContentCreatorAgent.mockImplementation(() => mockCreator);
    MockSocialPublisherAgent.mockImplementation(() => mockPublisher);

    // Create bot instance
    bot = new SocialMediaBot();
  });

  afterEach(async () => {
    if (bot) {
      try {
        await bot.shutdown();
      } catch (error) {
        // Ignore shutdown errors in tests
      }
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await bot.initialize();

      expect(mockPlanner.initialize).toHaveBeenCalled();
      expect(mockCreator.initialize).toHaveBeenCalled();
      expect(mockPublisher.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockPlanner.initialize.mockRejectedValue(new Error('Initialization failed'));

      await expect(bot.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('Content Workflow', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should create content workflow successfully', async () => {
      const params = {
        platforms: [SocialPlatform.TWITTER, SocialPlatform.LINKEDIN],
        contentType: 'promotional',
        targetAudience: ['developers', 'entrepreneurs'],
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      };

      const result = await bot.createContentWorkflow(params);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'content-1',
        title: 'Test Content 1',
        platforms: [SocialPlatform.TWITTER]
      });

      expect(mockPlanner.process).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content_planning',
          priority: TaskPriority.HIGH,
          data: { parameters: params }
        })
      );

      expect(mockCreator.process).toHaveBeenCalled();
      expect(mockPublisher.process).toHaveBeenCalled();
    });

    it('should handle workflow errors', async () => {
      mockPlanner.process.mockRejectedValue(new Error('Planning failed'));

      const params = {
        platforms: [SocialPlatform.TWITTER],
        contentType: 'promotional',
        targetAudience: ['developers'],
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };

      await expect(bot.createContentWorkflow(params)).rejects.toThrow('Planning failed');
    });

    it('should throw error if bot not initialized', async () => {
      const uninitializedBot = new SocialMediaBot();

      const params = {
        platforms: [SocialPlatform.TWITTER],
        contentType: 'promotional',
        targetAudience: ['developers'],
        timeframe: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };

      await expect(uninitializedBot.createContentWorkflow(params)).rejects.toThrow('Bot not initialized');
    });
  });

  describe('Content Publishing', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should publish content immediately', async () => {
      const content: ContentItem = {
        id: 'content-123',
        title: 'Test Content',
        content: 'Test content for immediate publishing',
        hashtags: ['#test'],
        mentions: [],
        platforms: [SocialPlatform.TWITTER],
        status: ContentStatus.APPROVED,
        metadata: {
          author: 'Test Author',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test'],
          category: 'test',
          priority: ContentPriority.HIGH,
          targetAudience: ['testers']
        }
      };

      await bot.publishContent(content);

      expect(mockPublisher.process).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content_publishing',
          priority: TaskPriority.HIGH,
          data: { parameters: { content } }
        })
      );
    });
  });

  describe('Status and Metrics', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should return bot status', () => {
      const status = bot.getStatus();

      expect(status).toMatchObject({
        initialized: true,
        agents: {
          contentPlanner: {
            status: 'idle',
            activeTasksCount: 0,
            isInitialized: true
          },
          contentCreator: {
            status: 'idle',
            activeTasksCount: 0,
            isInitialized: true
          },
          socialPublisher: {
            status: 'idle',
            activeTasksCount: 0,
            isInitialized: true
          }
        },
        publishingStats: {
          totalPublished: 5,
          successRate: 0.9,
          platformBreakdown: {
            twitter: 3,
            linkedin: 2
          }
        }
      });
    });
  });

  describe('Shutdown', () => {
    it('should shutdown all agents', async () => {
      await bot.initialize();
      await bot.shutdown();

      expect(mockPlanner.shutdown).toHaveBeenCalled();
      expect(mockCreator.shutdown).toHaveBeenCalled();
      expect(mockPublisher.shutdown).toHaveBeenCalled();
    });

    it('should handle shutdown errors', async () => {
      await bot.initialize();
      mockPlanner.shutdown.mockRejectedValue(new Error('Shutdown failed'));

      await expect(bot.shutdown()).rejects.toThrow('Shutdown failed');
    });
  });

  describe('Agent Communication', () => {
    beforeEach(async () => {
      await bot.initialize();
    });

    it('should set up agent communication', () => {
      expect(mockPlanner.on).toHaveBeenCalledWith('sendMessage', expect.any(Function));
      expect(mockCreator.on).toHaveBeenCalledWith('sendMessage', expect.any(Function));
      expect(mockPublisher.on).toHaveBeenCalledWith('sendMessage', expect.any(Function));

      expect(mockPlanner.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockCreator.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockPublisher.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });
});
