/**
 * AI Coordination Example - Main Entry Point
 * Demonstrates multi-agent AI coordination using MPLP SDK
 */

import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import {
  PlannerAgent,
  CreatorAgent,
  ReviewerAgent,
  PublisherAgent,
  CoordinatorAgent
} from './agents';
import {
  Task,
  TaskRequirements,
  TaskContext,
  ContentStyle,
  PublishingChannel
} from './types';

export class AICoordinationExamplesApp {
  private coordinator?: CoordinatorAgent;
  private planner?: PlannerAgent;
  private creator?: CreatorAgent;
  private reviewer?: ReviewerAgent;
  private publisher?: PublisherAgent;

  constructor() {
    console.log(chalk.blue.bold('🤖 MPLP AI Coordination Examples'));
    console.log(chalk.gray('Multi-Agent AI Coordination System'));
    console.log();
  }

  public async initialize(): Promise<void> {
    try {
      console.log(chalk.yellow('🚀 Initializing AI Coordination System...'));
      
      // Create and initialize all agents
      await this.createAgents();
      await this.initializeAgents();
      await this.registerAgents();
      
      console.log(chalk.green('✅ AI Coordination System initialized successfully!'));
      console.log();
      
    } catch (error) {
      console.error(chalk.red.bold('❌ Failed to initialize AI Coordination System:'), error);
      throw error;
    }
  }

  public async runAllExamples(): Promise<void> {
    console.log(chalk.blue.bold('🎯 Running AI Coordination Examples'));
    console.log(chalk.gray('Demonstrating multi-agent AI coordination capabilities'));
    console.log();

    try {
      // Example 1: Basic Content Creation Workflow
      console.log(chalk.cyan('📋 Example 1: Basic Content Creation Workflow'));
      await this.runBasicContentCreationExample();
      console.log();

      // Example 2: Multi-Language Content Creation
      console.log(chalk.cyan('📋 Example 2: Multi-Language Content Creation'));
      await this.runMultiLanguageExample();
      console.log();

      // Example 3: Quality Review Workflow
      console.log(chalk.cyan('📋 Example 3: Quality Review Workflow'));
      await this.runQualityReviewExample();
      console.log();

      console.log(chalk.green.bold('✅ All AI coordination examples completed successfully!'));
      console.log(chalk.gray('Check the console output for detailed coordination results.'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Error running AI coordination examples:'), error);
      throw error;
    }
  }

  public async runExample(exampleName: string): Promise<void> {
    console.log(chalk.blue(`🚀 Running ${exampleName} example`));

    try {
      switch (exampleName) {
        case 'basic-content':
          await this.runBasicContentCreationExample();
          break;
        
        case 'multi-language':
          await this.runMultiLanguageExample();
          break;
        
        case 'quality-review':
          await this.runQualityReviewExample();
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
    console.log(chalk.blue.bold('📋 Available AI Coordination Examples:'));
    console.log();
    console.log(chalk.cyan('  basic-content') + chalk.gray('     - Basic content creation workflow'));
    console.log(chalk.cyan('  multi-language') + chalk.gray('    - Multi-language content creation'));
    console.log(chalk.cyan('  quality-review') + chalk.gray('     - High-quality review workflow'));
    console.log(chalk.cyan('  coordination-demo') + chalk.gray('  - Agent coordination demonstration'));
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
}

// ============================================================================
// CLI Entry Point
// ============================================================================

export async function main(): Promise<void> {
  const app = new AICoordinationExamplesApp();
  
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
export default AICoordinationExamplesApp;
export * from './agents';
export * from './types';
