/**
 * Agent Orchestrator - Enterprise Multi-Agent Orchestration Platform
 * Built with MPLP SDK v1.1.0-beta for enterprise-grade multi-agent coordination
 */

import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  PlannerAgent,
  CreatorAgent,
  ReviewerAgent,
  PublisherAgent,
  CoordinatorAgent
} from './agents';
import {
  Task,
  TaskResult,
  TaskRequirements,
  TaskContext,
  ContentStyle,
  PublishingChannel,
  OrchestrationMetrics,
  AgentStatus,
  WorkflowDefinition,
  DistributedDeployment
} from './types';

export class AgentOrchestratorApp extends EventEmitter {
  private coordinator?: CoordinatorAgent;
  private planner?: PlannerAgent;
  private creator?: CreatorAgent;
  private reviewer?: ReviewerAgent;
  private publisher?: PublisherAgent;
  private isInitialized: boolean = false;
  private orchestrationMetrics: OrchestrationMetrics;
  private workflowDefinitions: Map<string, WorkflowDefinition> = new Map();
  private activeWorkflows: Map<string, any> = new Map();

  constructor() {
    super();
    console.log(chalk.blue.bold('🎭 MPLP Agent Orchestrator'));
    console.log(chalk.gray('Enterprise Multi-Agent Orchestration Platform'));
    console.log(chalk.gray('Built with MPLP SDK v1.1.0-beta'));
    console.log();

    this.orchestrationMetrics = {
      totalAgents: 0,
      activeWorkflows: 0,
      completedTasks: 0,
      averageExecutionTime: 0,
      successRate: 0,
      resourceUtilization: 0
    };
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log(chalk.yellow('⚠️  Agent Orchestrator already initialized'));
      return;
    }

    try {
      console.log(chalk.yellow('🚀 Initializing Agent Orchestrator Platform...'));

      // Initialize enterprise-grade workflow definitions
      await this.initializeWorkflowDefinitions();

      // Create and initialize all agents
      await this.createAgents();
      await this.initializeAgents();
      await this.registerAgents();

      // Initialize monitoring and metrics
      await this.initializeMonitoring();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      this.emit('orchestrator:initialized');

      console.log(chalk.green('✅ Agent Orchestrator Platform initialized successfully!'));
      console.log(chalk.gray(`   📊 Total Agents: ${this.orchestrationMetrics.totalAgents}`));
      console.log(chalk.gray(`   🔄 Workflow Definitions: ${this.workflowDefinitions.size}`));
      console.log();

    } catch (error) {
      console.error(chalk.red.bold('❌ Failed to initialize Agent Orchestrator Platform:'), error);
      this.emit('orchestrator:error', error);
      throw error;
    }
  }

  public async runAllExamples(): Promise<void> {
    console.log(chalk.blue.bold('🎯 Running Agent Orchestrator Examples'));
    console.log(chalk.gray('Demonstrating enterprise multi-agent orchestration capabilities'));
    console.log();

    try {
      // Example 1: Enterprise Content Creation Workflow
      console.log(chalk.cyan('📋 Example 1: Enterprise Content Creation Workflow'));
      await this.runEnterpriseContentCreation();
      console.log();

      // Example 2: Multi-Language Content Creation
      console.log(chalk.cyan('📋 Example 2: Multi-Language Content Creation'));
      await this.runMultiLanguageExample();
      console.log();

      // Example 3: Quality Review Workflow
      console.log(chalk.cyan('📋 Example 3: Quality Review Workflow'));
      await this.runQualityReviewExample();
      console.log();

      // Example 4: Distributed Coordination Demo
      console.log(chalk.cyan('📋 Example 4: Distributed Agent Coordination'));
      await this.runDistributedCoordination();
      console.log();

      console.log(chalk.green.bold('✅ All agent orchestration examples completed successfully!'));
      console.log(chalk.gray('Check the console output for detailed orchestration results.'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Error running agent orchestration examples:'), error);
      throw error;
    }
  }

  public async runExample(exampleName: string): Promise<void> {
    console.log(chalk.blue(`🚀 Running ${exampleName} example`));

    try {
      switch (exampleName) {
        case 'enterprise-content':
          await this.runEnterpriseContentCreation();
          break;

        case 'multi-language':
          await this.runMultiLanguageExample();
          break;

        case 'quality-review':
          await this.runQualityReviewExample();
          break;

        case 'distributed-coordination':
          await this.runDistributedCoordination();
          break;

        case 'coordination-demo':
          await this.runCoordinationDemo();
          break;

        default:
          throw new Error(`Unknown example: ${exampleName}`);
      }

      console.log(chalk.green(`✅ ${exampleName} example completed successfully!`));

    } catch (error) {
      console.error(chalk.red.bold(`❌ Error running ${exampleName} example:`), error);
      throw error;
    }
  }

  // ============================================================================
  // Example Implementations
  // ============================================================================

  private async runBasicContentCreationExample(): Promise<void> {
    if (!this.coordinator) {
      throw new Error('Coordinator not initialized');
    }

    const task: Task = {
      id: uuidv4(),
      type: 'content_creation',
      priority: 'high',
      requirements: {
        topic: 'The Future of Artificial Intelligence',
        length: 1500,
        style: 'professional' as ContentStyle,
        languages: ['en-US'],
        channels: ['blog', 'social_media'] as PublishingChannel[],
        quality_threshold: 0.8
      },
      context: {
        user_id: 'demo_user',
        session_id: uuidv4(),
        workflow_id: uuidv4(),
        metadata: {
          example_type: 'basic_content_creation'
        }
      }
    };

    console.log(chalk.gray('  📝 Creating content about AI future...'));
    const result = await this.coordinator.process(task);
    
    console.log(chalk.green('  ✅ Content creation workflow completed'));
    console.log(chalk.gray(`  📊 Status: ${result.status}`));
    console.log(chalk.gray(`  ⏱️  Execution time: ${result.execution_metadata?.total_execution_time || 0}ms`));
    console.log(chalk.gray(`  🎯 Quality score: ${result.coordination_metrics?.quality_score?.toFixed(2) || 'N/A'}`));
  }

  private async runMultiLanguageExample(): Promise<void> {
    if (!this.coordinator) {
      throw new Error('Coordinator not initialized');
    }

    const task: Task = {
      id: uuidv4(),
      type: 'content_creation',
      priority: 'medium',
      requirements: {
        topic: 'Digital Transformation Best Practices',
        length: 1200,
        style: 'technical' as ContentStyle,
        languages: ['en-US', 'zh-CN'],
        channels: ['documentation', 'newsletter'] as PublishingChannel[],
        quality_threshold: 0.85
      },
      context: {
        user_id: 'demo_user',
        session_id: uuidv4(),
        workflow_id: uuidv4(),
        metadata: {
          example_type: 'multi_language_content'
        }
      }
    };

    console.log(chalk.gray('  🌐 Creating multi-language content...'));
    const result = await this.coordinator.process(task);
    
    console.log(chalk.green('  ✅ Multi-language workflow completed'));
    console.log(chalk.gray(`  📊 Status: ${result.status}`));
    console.log(chalk.gray(`  🌍 Languages: ${task.requirements.languages?.join(', ')}`));
    console.log(chalk.gray(`  📈 Workflow efficiency: ${result.coordination_metrics?.workflow_efficiency?.toFixed(2) || 'N/A'}`));
  }

  private async runQualityReviewExample(): Promise<void> {
    if (!this.coordinator) {
      throw new Error('Coordinator not initialized');
    }

    const task: Task = {
      id: uuidv4(),
      type: 'content_creation',
      priority: 'high',
      requirements: {
        topic: 'Enterprise Security Framework',
        length: 2000,
        style: 'formal' as ContentStyle,
        languages: ['en-US'],
        channels: ['documentation', 'internal'] as PublishingChannel[],
        quality_threshold: 0.95 // High quality threshold
      },
      context: {
        user_id: 'demo_user',
        session_id: uuidv4(),
        workflow_id: uuidv4(),
        metadata: {
          example_type: 'quality_review_workflow'
        }
      }
    };

    console.log(chalk.gray('  🔍 Running high-quality review workflow...'));
    const result = await this.coordinator.process(task);
    
    console.log(chalk.green('  ✅ Quality review workflow completed'));
    console.log(chalk.gray(`  📊 Status: ${result.status}`));
    console.log(chalk.gray(`  🎯 Quality threshold: ${task.requirements.quality_threshold}`));
    console.log(chalk.gray(`  📋 Coordination rounds: ${result.execution_metadata?.coordination_rounds || 0}`));
  }

  private async runCoordinationDemo(): Promise<void> {
    console.log(chalk.gray('  🎭 Demonstrating agent coordination capabilities...'));
    
    // Show agent status
    const agents = this.coordinator?.getRegisteredAgents() ?? [];
    console.log(chalk.gray(`  👥 Registered agents: ${agents.length}`));
    
    for (const agent of agents) {
      console.log(chalk.gray(`    - ${agent.name} (${agent.type}): ${agent.status}`));
    }

    // Show coordination metrics
    const workflowHistory = this.coordinator?.getWorkflowHistory() ?? [];
    console.log(chalk.gray(`  📈 Completed workflows: ${workflowHistory.length}`));
    
    if (workflowHistory.length > 0) {
      const lastWorkflow = workflowHistory[workflowHistory.length - 1];
      if (lastWorkflow) {
        console.log(chalk.gray(`  ⚡ Last workflow efficiency: ${lastWorkflow.coordination_metrics.workflow_efficiency.toFixed(2)}`));
      }
    }
  }

  // ============================================================================
  // Agent Management
  // ============================================================================

  private async createAgents(): Promise<void> {
    // Create Planner Agent
    this.planner = new PlannerAgent({
      name: 'Strategic Planner',
      planning_strategies: ['audience_analysis', 'content_mapping', 'seo_optimization'],
      content_expertise: ['technical_writing', 'marketing_copy', 'educational_content']
    });

    // Create Creator Agent
    this.creator = new CreatorAgent({
      name: 'Content Creator',
      writing_styles: ['narrative', 'expository', 'technical', 'conversational'],
      content_types: ['article', 'blog_post', 'tutorial', 'case_study'],
      creativity_level: 0.7
    });

    // Create Reviewer Agent
    this.reviewer = new ReviewerAgent({
      name: 'Quality Reviewer',
      review_criteria: ['accuracy', 'clarity', 'completeness', 'coherence', 'engagement'],
      expertise_areas: ['language_proficiency', 'editorial_standards', 'subject_matter'],
      strictness_level: 0.8
    });

    // Create Publisher Agent
    this.publisher = new PublisherAgent({
      name: 'Content Publisher',
      supported_channels: ['blog', 'social_media', 'newsletter', 'documentation'],
      publishing_strategies: ['immediate', 'scheduled', 'cross_platform'],
      automation_level: 0.9
    });

    // Create Coordinator Agent
    this.coordinator = new CoordinatorAgent({
      name: 'AI Coordinator',
      coordination_strategy: 'adaptive',
      decision_timeout: 30000,
      consensus_threshold: 0.8
    });
  }

  private async initializeAgents(): Promise<void> {
    const agents = [this.planner, this.creator, this.reviewer, this.publisher, this.coordinator];
    
    for (const agent of agents) {
      if (agent) {
        await agent.initialize();
      }
    }
  }

  private async registerAgents(): Promise<void> {
    if (!this.coordinator) {
      throw new Error('Coordinator not initialized');
    }

    const agents = [this.planner, this.creator, this.reviewer, this.publisher];
    
    for (const agent of agents) {
      if (agent) {
        await this.coordinator.registerAgent(agent);
      }
    }
  }

  public async shutdown(): Promise<void> {
    console.log(chalk.yellow('🔄 Shutting down AI Coordination System...'));
    
    const agents = [this.coordinator, this.planner, this.creator, this.reviewer, this.publisher];
    
    for (const agent of agents) {
      if (agent) {
        await agent.shutdown();
      }
    }
    
    console.log(chalk.green('✅ AI Coordination System shutdown completed'));
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  public displayAvailableExamples(): void {
    console.log(chalk.blue.bold('📋 Available Agent Orchestrator Examples:'));
    console.log();
    console.log(chalk.cyan('  enterprise-content') + chalk.gray('      - Enterprise content creation workflow'));
    console.log(chalk.cyan('  multi-language') + chalk.gray('         - Multi-language content creation'));
    console.log(chalk.cyan('  quality-review') + chalk.gray('          - High-quality review workflow'));
    console.log(chalk.cyan('  distributed-coordination') + chalk.gray(' - Distributed agent coordination'));
    console.log(chalk.cyan('  coordination-demo') + chalk.gray('       - Agent coordination demonstration'));
    console.log();
    console.log(chalk.gray('Usage: npm run example:<name> or use the runExample() method'));
  }

  public getCoordinator(): CoordinatorAgent | undefined {
    return this.coordinator;
  }

  public getAgents() {
    return {
      planner: this.planner,
      creator: this.creator,
      reviewer: this.reviewer,
      publisher: this.publisher,
      coordinator: this.coordinator
    };
  }

  // ============================================================================
  // Enterprise-Grade Methods
  // ============================================================================

  private async initializeWorkflowDefinitions(): Promise<void> {
    console.log(chalk.gray('  📋 Initializing workflow definitions...'));

    // Content Creation Workflow
    const contentWorkflow: WorkflowDefinition = {
      id: 'content-creation-workflow',
      name: 'Enterprise Content Creation',
      description: 'Multi-stage content creation with quality assurance',
      steps: [
        {
          id: 'planning',
          name: 'Content Planning',
          agentType: 'planner',
          action: 'analyze_requirements',
          inputs: { requirements: 'task.requirements' },
          outputs: { plan: 'content_plan' }
        },
        {
          id: 'creation',
          name: 'Content Creation',
          agentType: 'creator',
          action: 'create_content',
          inputs: { plan: 'content_plan' },
          outputs: { content: 'draft_content' },
          dependencies: ['planning']
        },
        {
          id: 'review',
          name: 'Quality Review',
          agentType: 'reviewer',
          action: 'review_content',
          inputs: { content: 'draft_content' },
          outputs: { reviewed_content: 'final_content' },
          dependencies: ['creation']
        },
        {
          id: 'publishing',
          name: 'Content Publishing',
          agentType: 'publisher',
          action: 'publish_content',
          inputs: { content: 'final_content' },
          outputs: { published: 'publication_result' },
          dependencies: ['review']
        }
      ],
      triggers: [
        {
          type: 'event',
          condition: 'task.type === "content_creation"'
        }
      ]
    };

    this.workflowDefinitions.set(contentWorkflow.id, contentWorkflow);
    console.log(chalk.gray(`    ✅ Loaded workflow: ${contentWorkflow.name}`));
  }

  private async initializeMonitoring(): Promise<void> {
    console.log(chalk.gray('  📊 Initializing monitoring system...'));

    // Update orchestration metrics
    this.orchestrationMetrics = {
      totalAgents: 5, // planner, creator, reviewer, publisher, coordinator
      activeWorkflows: 0,
      completedTasks: 0,
      averageExecutionTime: 0,
      successRate: 0,
      resourceUtilization: 0
    };

    console.log(chalk.gray('    ✅ Monitoring system initialized'));
  }

  private setupEventListeners(): void {
    console.log(chalk.gray('  🔗 Setting up event listeners...'));

    // Listen for agent events
    this.on('agent:task_completed', (data) => {
      this.orchestrationMetrics.completedTasks++;
      this.emit('metrics:updated', this.orchestrationMetrics);
    });

    this.on('workflow:started', (workflowId) => {
      this.orchestrationMetrics.activeWorkflows++;
      this.activeWorkflows.set(workflowId, { startTime: new Date() });
    });

    this.on('workflow:completed', (workflowId) => {
      this.orchestrationMetrics.activeWorkflows--;
      this.activeWorkflows.delete(workflowId);
    });

    console.log(chalk.gray('    ✅ Event listeners configured'));
  }

  // ============================================================================
  // Enterprise Workflow Management
  // ============================================================================

  public async executeWorkflow(workflowId: string, task: Task): Promise<TaskResult> {
    if (!this.isInitialized) {
      throw new Error('Agent Orchestrator not initialized');
    }

    const workflow = this.workflowDefinitions.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    console.log(chalk.blue(`🔄 Executing workflow: ${workflow.name}`));
    this.emit('workflow:started', workflowId);

    try {
      // For now, delegate to coordinator (can be enhanced for complex workflows)
      const result = await this.coordinator!.process(task);

      this.emit('workflow:completed', workflowId);
      console.log(chalk.green(`✅ Workflow completed: ${workflow.name}`));

      return result;
    } catch (error) {
      this.emit('workflow:failed', workflowId, error);
      console.error(chalk.red(`❌ Workflow failed: ${workflow.name}`), error);
      throw error;
    }
  }

  public getWorkflowDefinitions(): WorkflowDefinition[] {
    return Array.from(this.workflowDefinitions.values());
  }

  public getOrchestrationMetrics(): OrchestrationMetrics {
    return { ...this.orchestrationMetrics };
  }

  public getActiveWorkflows(): string[] {
    return Array.from(this.activeWorkflows.keys());
  }

  // ============================================================================
  // Enhanced Examples with Enterprise Features
  // ============================================================================

  public async runEnterpriseContentCreation(): Promise<void> {
    console.log(chalk.cyan('🏢 Enterprise Content Creation Workflow'));

    const task: Task = {
      id: uuidv4(),
      type: 'content_creation',
      priority: 'high',
      requirements: {
        topic: 'Enterprise AI Strategy and Implementation',
        length: 2500,
        style: 'professional' as ContentStyle,
        languages: ['en-US'],
        channels: ['documentation', 'internal'] as PublishingChannel[],
        quality_threshold: 0.9
      },
      context: {
        user_id: 'enterprise_user',
        session_id: uuidv4(),
        workflow_id: uuidv4(),
        metadata: {
          department: 'strategy',
          classification: 'internal',
          approval_required: true
        }
      }
    };

    const result = await this.executeWorkflow('content-creation-workflow', task);

    console.log(chalk.green('  ✅ Enterprise content creation completed'));
    console.log(chalk.gray(`  📊 Quality Score: ${result.coordination_metrics?.quality_score?.toFixed(2) || 'N/A'}`));
    console.log(chalk.gray(`  ⏱️  Execution Time: ${result.execution_metadata?.total_execution_time || 0}ms`));
  }

  public async runDistributedCoordination(): Promise<void> {
    console.log(chalk.cyan('🌐 Distributed Agent Coordination Demo'));

    // Simulate distributed deployment metrics
    const deploymentNodes: DistributedDeployment[] = [
      {
        nodeId: 'node-coordinator-01',
        nodeType: 'coordinator',
        capacity: 100,
        currentLoad: 45,
        status: 'online',
        lastHeartbeat: new Date()
      },
      {
        nodeId: 'node-worker-01',
        nodeType: 'worker',
        capacity: 80,
        currentLoad: 30,
        status: 'online',
        lastHeartbeat: new Date()
      },
      {
        nodeId: 'node-worker-02',
        nodeType: 'worker',
        capacity: 80,
        currentLoad: 60,
        status: 'online',
        lastHeartbeat: new Date()
      }
    ];

    console.log(chalk.gray('  🖥️  Distributed Deployment Status:'));
    for (const node of deploymentNodes) {
      const loadColor = node.currentLoad > 70 ? chalk.red : node.currentLoad > 50 ? chalk.yellow : chalk.green;
      console.log(chalk.gray(`    - ${node.nodeId} (${node.nodeType}): ${loadColor(node.currentLoad + '%')} load`));
    }

    console.log(chalk.gray(`  📈 Total Capacity: ${deploymentNodes.reduce((sum, node) => sum + node.capacity, 0)}`));
    console.log(chalk.gray(`  ⚡ Average Load: ${(deploymentNodes.reduce((sum, node) => sum + node.currentLoad, 0) / deploymentNodes.length).toFixed(1)}%`));
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

export async function main(): Promise<void> {
  const app = new AgentOrchestratorApp();

  try {
    await app.initialize();

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.length > 0) {
      const exampleName = args[0];
      if (exampleName) {
        await app.runExample(exampleName);
      } else {
        await app.runAllExamples();
      }
    } else {
      await app.runAllExamples();
    }

  } catch (error) {
    console.error(chalk.red.bold('❌ Application error:'), error);
    process.exit(1);
  } finally {
    await app.shutdown();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use as a library
export default AgentOrchestratorApp;
export * from './agents';
export * from './types';
