/**
 * Agent Orchestrator - Main Application Tests
 * Comprehensive test suite for the enterprise multi-agent orchestration platform
 */

import { AgentOrchestratorApp } from '../index';
import {
  PlannerAgent,
  CreatorAgent,
  ReviewerAgent,
  PublisherAgent,
  CoordinatorAgent
} from '../agents';

// Mock the agents to avoid complex initialization in tests
jest.mock('../agents/PlannerAgent');
jest.mock('../agents/CreatorAgent');
jest.mock('../agents/ReviewerAgent');
jest.mock('../agents/PublisherAgent');
jest.mock('../agents/CoordinatorAgent');

const MockPlannerAgent = PlannerAgent as jest.MockedClass<typeof PlannerAgent>;
const MockCreatorAgent = CreatorAgent as jest.MockedClass<typeof CreatorAgent>;
const MockReviewerAgent = ReviewerAgent as jest.MockedClass<typeof ReviewerAgent>;
const MockPublisherAgent = PublisherAgent as jest.MockedClass<typeof PublisherAgent>;
const MockCoordinatorAgent = CoordinatorAgent as jest.MockedClass<typeof CoordinatorAgent>;

describe('AgentOrchestratorApp', () => {
  let app: AgentOrchestratorApp;
  let mockCoordinator: jest.Mocked<CoordinatorAgent>;
  let mockPlanner: jest.Mocked<PlannerAgent>;
  let mockCreator: jest.Mocked<CreatorAgent>;
  let mockReviewer: jest.Mocked<ReviewerAgent>;
  let mockPublisher: jest.Mocked<PublisherAgent>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockCoordinator = {
      initialize: jest.fn().mockResolvedValue(undefined),
      registerAgent: jest.fn().mockResolvedValue(undefined),
      process: jest.fn().mockResolvedValue({
        task_id: 'test_task',
        agent_id: 'test_coordinator',
        status: 'success',
        output: { title: 'Test Content', content: 'Test content body' },
        execution_metadata: {
          started_at: new Date(),
          completed_at: new Date(),
          total_execution_time: 5000,
          coordination_rounds: 1,
          decisions_made: 3,
          conflicts_resolved: 0
        },
        coordination_metrics: {
          agent_utilization: {},
          communication_efficiency: 0.85,
          decision_accuracy: 0.9,
          workflow_efficiency: 0.8,
          quality_score: 0.85
        }
      }),
      getRegisteredAgents: jest.fn().mockReturnValue([]),
      getWorkflowHistory: jest.fn().mockReturnValue([]),
      shutdown: jest.fn().mockResolvedValue(undefined),
      id: 'coordinator_1',
      name: 'Test Coordinator',
      type: 'coordinator',
      status: 'ready',
      capabilities: ['task_coordination', 'decision_making']
    } as any;

    mockPlanner = {
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      id: 'planner_1',
      name: 'Test Planner',
      type: 'planner',
      status: 'ready',
      capabilities: ['content_planning']
    } as any;

    mockCreator = {
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      id: 'creator_1',
      name: 'Test Creator',
      type: 'creator',
      status: 'ready',
      capabilities: ['content_creation']
    } as any;

    mockReviewer = {
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      id: 'reviewer_1',
      name: 'Test Reviewer',
      type: 'reviewer',
      status: 'ready',
      capabilities: ['content_review']
    } as any;

    mockPublisher = {
      initialize: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      id: 'publisher_1',
      name: 'Test Publisher',
      type: 'publisher',
      status: 'ready',
      capabilities: ['content_publishing']
    } as any;

    // Configure mocks to return the mock instances
    MockCoordinatorAgent.mockImplementation(() => mockCoordinator);
    MockPlannerAgent.mockImplementation(() => mockPlanner);
    MockCreatorAgent.mockImplementation(() => mockCreator);
    MockReviewerAgent.mockImplementation(() => mockReviewer);
    MockPublisherAgent.mockImplementation(() => mockPublisher);

    app = new AgentOrchestratorApp();
  });

  describe('constructor', () => {
    it('should create an instance successfully', () => {
      expect(app).toBeInstanceOf(AgentOrchestratorApp);
    });
  });

  describe('initialize', () => {
    it('should initialize all agents successfully', async () => {
      await app.initialize();

      // Verify all agents were created
      expect(MockPlannerAgent).toHaveBeenCalledWith({
        name: 'Strategic Planner',
        planning_strategies: ['audience_analysis', 'content_mapping', 'seo_optimization'],
        content_expertise: ['technical_writing', 'marketing_copy', 'educational_content']
      });

      expect(MockCreatorAgent).toHaveBeenCalledWith({
        name: 'Content Creator',
        writing_styles: ['narrative', 'expository', 'technical', 'conversational'],
        content_types: ['article', 'blog_post', 'tutorial', 'case_study'],
        creativity_level: 0.7
      });

      expect(MockReviewerAgent).toHaveBeenCalledWith({
        name: 'Quality Reviewer',
        review_criteria: ['accuracy', 'clarity', 'completeness', 'coherence', 'engagement'],
        expertise_areas: ['language_proficiency', 'editorial_standards', 'subject_matter'],
        strictness_level: 0.8
      });

      expect(MockPublisherAgent).toHaveBeenCalledWith({
        name: 'Content Publisher',
        supported_channels: ['blog', 'social_media', 'newsletter', 'documentation'],
        publishing_strategies: ['immediate', 'scheduled', 'cross_platform'],
        automation_level: 0.9
      });

      expect(MockCoordinatorAgent).toHaveBeenCalledWith({
        name: 'AI Coordinator',
        coordination_strategy: 'adaptive',
        decision_timeout: 30000,
        consensus_threshold: 0.8
      });

      // Verify all agents were initialized
      expect(mockPlanner.initialize).toHaveBeenCalled();
      expect(mockCreator.initialize).toHaveBeenCalled();
      expect(mockReviewer.initialize).toHaveBeenCalled();
      expect(mockPublisher.initialize).toHaveBeenCalled();
      expect(mockCoordinator.initialize).toHaveBeenCalled();

      // Verify agents were registered with coordinator
      expect(mockCoordinator.registerAgent).toHaveBeenCalledWith(mockPlanner);
      expect(mockCoordinator.registerAgent).toHaveBeenCalledWith(mockCreator);
      expect(mockCoordinator.registerAgent).toHaveBeenCalledWith(mockReviewer);
      expect(mockCoordinator.registerAgent).toHaveBeenCalledWith(mockPublisher);
    });

    it('should handle initialization errors gracefully', async () => {
      mockCoordinator.initialize.mockRejectedValue(new Error('Initialization failed'));

      await expect(app.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('runAllExamples', () => {
    beforeEach(async () => {
      await app.initialize();
    });

    it('should run all examples in correct order', async () => {
      await app.runAllExamples();

      // Verify coordinator.process was called for each example
      expect(mockCoordinator.process).toHaveBeenCalledTimes(3);

      // Verify the examples were called with correct parameters
      const calls = mockCoordinator.process.mock.calls;
      
      // Enterprise content creation example
      expect(calls[0][0]).toMatchObject({
        type: 'content_creation',
        priority: 'high',
        requirements: {
          topic: 'Enterprise AI Strategy and Implementation',
          length: 2500,
          style: 'professional'
        }
      });

      // Multi-language example
      expect(calls[1][0]).toMatchObject({
        type: 'content_creation',
        priority: 'medium',
        requirements: {
          topic: 'Digital Transformation Best Practices',
          languages: ['en-US', 'zh-CN']
        }
      });

      // Quality review example
      expect(calls[2][0]).toMatchObject({
        type: 'content_creation',
        priority: 'high',
        requirements: {
          topic: 'Enterprise Security Framework',
          quality_threshold: 0.95
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Coordination failed');
      mockCoordinator.process.mockRejectedValue(error);

      await expect(app.runAllExamples()).rejects.toThrow('Coordination failed');
    });
  });

  describe('runExample', () => {
    beforeEach(async () => {
      await app.initialize();
    });

    it('should run enterprise-content example', async () => {
      await app.runExample('enterprise-content');

      expect(mockCoordinator.process).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'content_creation',
          requirements: expect.objectContaining({
            topic: 'Enterprise AI Strategy and Implementation'
          })
        })
      );
    });

    it('should run multi-language example', async () => {
      await app.runExample('multi-language');

      expect(mockCoordinator.process).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: expect.objectContaining({
            languages: ['en-US', 'zh-CN']
          })
        })
      );
    });

    it('should run quality-review example', async () => {
      await app.runExample('quality-review');

      expect(mockCoordinator.process).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: expect.objectContaining({
            quality_threshold: 0.95
          })
        })
      );
    });

    it('should run coordination-demo example', async () => {
      await app.runExample('coordination-demo');

      expect(mockCoordinator.getRegisteredAgents).toHaveBeenCalled();
      expect(mockCoordinator.getWorkflowHistory).toHaveBeenCalled();
    });

    it('should throw error for unknown example', async () => {
      await expect(app.runExample('unknown')).rejects.toThrow('Unknown example: unknown');
    });

    it('should handle example execution errors', async () => {
      const error = new Error('Example error');
      mockCoordinator.process.mockRejectedValue(error);

      await expect(app.runExample('enterprise-content')).rejects.toThrow('Example error');
    });
  });

  describe('shutdown', () => {
    beforeEach(async () => {
      await app.initialize();
    });

    it('should shutdown all agents', async () => {
      await app.shutdown();

      expect(mockCoordinator.shutdown).toHaveBeenCalled();
      expect(mockPlanner.shutdown).toHaveBeenCalled();
      expect(mockCreator.shutdown).toHaveBeenCalled();
      expect(mockReviewer.shutdown).toHaveBeenCalled();
      expect(mockPublisher.shutdown).toHaveBeenCalled();
    });
  });

  describe('displayAvailableExamples', () => {
    it('should display available examples without errors', () => {
      expect(() => app.displayAvailableExamples()).not.toThrow();
    });
  });

  describe('getters', () => {
    beforeEach(async () => {
      await app.initialize();
    });

    it('should return coordinator instance', () => {
      const coordinator = app.getCoordinator();
      expect(coordinator).toBe(mockCoordinator);
    });

    it('should return all agents', () => {
      const agents = app.getAgents();
      
      expect(agents.coordinator).toBe(mockCoordinator);
      expect(agents.planner).toBe(mockPlanner);
      expect(agents.creator).toBe(mockCreator);
      expect(agents.reviewer).toBe(mockReviewer);
      expect(agents.publisher).toBe(mockPublisher);
    });
  });
});

describe('AI Coordination Integration', () => {
  it('should create and initialize all agent classes', () => {
    expect(PlannerAgent).toBeDefined();
    expect(CreatorAgent).toBeDefined();
    expect(ReviewerAgent).toBeDefined();
    expect(PublisherAgent).toBeDefined();
    expect(CoordinatorAgent).toBeDefined();
  });

  it('should handle CLI entry point scenarios', () => {
    // Test that the main function exists and can be imported
    expect(typeof require('../index').main).toBe('function');
  });
});

describe('Agent Class Exports', () => {
  it('should export all agent classes', () => {
    const agents = require('../agents');
    
    expect(agents.PlannerAgent).toBeDefined();
    expect(agents.CreatorAgent).toBeDefined();
    expect(agents.ReviewerAgent).toBeDefined();
    expect(agents.PublisherAgent).toBeDefined();
    expect(agents.CoordinatorAgent).toBeDefined();
    expect(agents.BaseAgent).toBeDefined();
  });
});
