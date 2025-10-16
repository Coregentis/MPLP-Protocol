/**
 * {{name}} - Advanced MPLP Application
 * {{description}}
 * 
 * This advanced template includes:
 * - Multiple specialized agents
 * - Workflow orchestration
 * - HTTP API server
 * - Environment configuration
 * - Advanced error handling
 * 
 * @author {{author}}
 * @version 1.0.0
 */

import { MPLPApplication } from '@mplp/sdk-core';
import { MultiAgentOrchestrator } from '@mplp/orchestrator';
import { DataProcessorAgent } from './agents/DataProcessorAgent';
import { NotificationAgent } from './agents/NotificationAgent';
import { ValidationAgent } from './agents/ValidationAgent';
import { APIServer } from './server/APIServer';
import { WorkflowManager } from './workflows/WorkflowManager';
import { getConfig, validateConfig } from './config/AppConfig';
import { logger } from './utils/Logger';

/**
 * Advanced MPLP Application
 */
class {{pascalName}}Application {
  private app: MPLPApplication;
  private orchestrator: MultiAgentOrchestrator;
  private apiServer: APIServer;
  private workflowManager: WorkflowManager;
  
  // Agents
  private dataProcessor: DataProcessorAgent;
  private notificationAgent: NotificationAgent;
  private validationAgent: ValidationAgent;

  constructor() {
    // Load and validate configuration
    const config = getConfig();
    validateConfig(config);
    
    // Initialize MPLP application
    this.app = new MPLPApplication({
      name: config.app.name,
      version: config.app.version,
      description: config.app.description,
      logging: config.logging,
      health: config.health
    });

    // Initialize orchestrator
    this.orchestrator = new MultiAgentOrchestrator({
      name: 'MainOrchestrator',
      maxConcurrentWorkflows: config.orchestrator.maxConcurrentWorkflows,
      defaultTimeout: config.orchestrator.defaultTimeout
    });

    // Initialize agents
    this.dataProcessor = new DataProcessorAgent();
    this.notificationAgent = new NotificationAgent();
    this.validationAgent = new ValidationAgent();

    // Initialize API server
    this.apiServer = new APIServer(config.server);

    // Initialize workflow manager
    this.workflowManager = new WorkflowManager(this.orchestrator);
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing {{name}}...');
    
    try {
      // Initialize MPLP application
      await this.app.initialize();
      
      // Register agents with the application
      await this.app.registerModule('dataProcessor', this.dataProcessor);
      await this.app.registerModule('notificationAgent', this.notificationAgent);
      await this.app.registerModule('validationAgent', this.validationAgent);
      
      // Register agents with orchestrator
      await this.orchestrator.registerAgent('dataProcessor', this.dataProcessor);
      await this.orchestrator.registerAgent('notificationAgent', this.notificationAgent);
      await this.orchestrator.registerAgent('validationAgent', this.validationAgent);
      
      // Initialize workflows
      await this.workflowManager.initialize();
      
      // Initialize API server
      await this.apiServer.initialize();
      
      logger.info('✅ Application initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize application:', error as Error);
      throw error;
    }
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    logger.info('🎯 Starting {{name}}...');
    
    try {
      // Start MPLP application
      await this.app.start();
      
      // Start orchestrator
      await this.orchestrator.start();
      
      // Start API server
      await this.apiServer.start();
      
      // Demonstrate capabilities
      await this.demonstrateCapabilities();
      
      logger.info('🎉 Application started successfully');
      logger.info(`🌐 API Server running on http://localhost:${this.apiServer.getPort()}`);
      
    } catch (error) {
      logger.error('❌ Failed to start application:', error as Error);
      throw error;
    }
  }

  /**
   * Stop the application
   */
  async stop(): Promise<void> {
    logger.info('🛑 Stopping {{name}}...');
    
    try {
      // Stop API server
      await this.apiServer.stop();
      
      // Stop orchestrator
      await this.orchestrator.stop();
      
      // Stop MPLP application
      await this.app.stop();
      
      logger.info('✅ Application stopped successfully');
    } catch (error) {
      logger.error('❌ Failed to stop application:', error as Error);
      throw error;
    }
  }

  /**
   * Demonstrate application capabilities
   */
  private async demonstrateCapabilities(): Promise<void> {
    logger.info('\n🤖 Demonstrating advanced capabilities...');
    
    try {
      // Execute a sample workflow
      const workflowResult = await this.workflowManager.executeWorkflow('dataProcessingWorkflow', {
        data: 'Sample data for processing',
        priority: 'high'
      });
      
      logger.info('📊 Workflow Result:', workflowResult);
      
    } catch (error) {
      logger.error('❌ Capability demonstration failed:', error as Error);
    }
  }

  /**
   * Get application status
   */
  async getStatus(): Promise<any> {
    return {
      application: await this.app.getStatus(),
      orchestrator: await this.orchestrator.getStatus(),
      apiServer: this.apiServer.getStatus(),
      agents: {
        dataProcessor: this.dataProcessor.getStatus(),
        notificationAgent: this.notificationAgent.getStatus(),
        validationAgent: this.validationAgent.getStatus()
      }
    };
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const application = new {{pascalName}}Application();
  
  try {
    await application.initialize();
    await application.start();
    
    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n🔄 Received ${signal}, shutting down gracefully...`);
      await application.stop();
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Keep the process running
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('💥 Application failed:', error as Error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { {{pascalName}}Application };
