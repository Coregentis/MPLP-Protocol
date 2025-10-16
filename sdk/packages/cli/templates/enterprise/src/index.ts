/**
 * {{name}} - Enterprise MPLP Application
 * 
 * This is an enterprise-grade multi-agent application built with MPLP.
 * It includes advanced features like monitoring, logging, and orchestration.
 * 
 * @version 1.0.0
 * @author {{author}}
 */

import { MPLPApplication, ApplicationConfig } from '@mplp/sdk-core';
import { AgentBuilder } from '@mplp/agent-builder';
import { Orchestrator } from '@mplp/orchestrator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Enterprise application configuration
 */
const config: ApplicationConfig = {
  name: '{{name}}',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Enterprise features
  monitoring: {
    enabled: true,
    metricsPort: 9090,
    healthCheckPath: '/health'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    destination: process.env.LOG_FILE || 'logs/app.log'
  },
  
  security: {
    cors: {
      enabled: true,
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};

/**
 * Main application class
 */
class {{name}}App {
  private app: MPLPApplication;
  private orchestrator: Orchestrator;
  private agents: Map<string, any> = new Map();

  constructor() {
    this.app = new MPLPApplication(config);
    this.orchestrator = new Orchestrator();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${config.name}...`);
    
    try {
      // Initialize MPLP application
      await this.app.initialize();
      
      // Setup agents
      await this.setupAgents();
      
      // Setup orchestration
      await this.setupOrchestration();
      
      console.log(`✅ ${config.name} initialized successfully`);
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Setup application agents
   */
  private async setupAgents(): Promise<void> {
    const agentBuilder = new AgentBuilder();
    
    // Create main processing agent
    const mainAgent = await agentBuilder
      .withName('main-agent')
      .withCapabilities(['processing', 'coordination'])
      .withConfig({
        maxConcurrency: 10,
        timeout: 30000
      })
      .build();
    
    this.agents.set('main', mainAgent);
    
    // Create monitoring agent
    const monitorAgent = await agentBuilder
      .withName('monitor-agent')
      .withCapabilities(['monitoring', 'alerting'])
      .withConfig({
        checkInterval: 5000,
        alertThreshold: 0.8
      })
      .build();
    
    this.agents.set('monitor', monitorAgent);
    
    console.log(`📦 Created ${this.agents.size} agents`);
  }

  /**
   * Setup orchestration workflows
   */
  private async setupOrchestration(): Promise<void> {
    // Define main workflow
    await this.orchestrator.defineWorkflow('main-workflow', {
      steps: [
        {
          name: 'initialize',
          agent: 'main',
          action: 'initialize'
        },
        {
          name: 'process',
          agent: 'main',
          action: 'process',
          dependsOn: ['initialize']
        },
        {
          name: 'monitor',
          agent: 'monitor',
          action: 'monitor',
          parallel: true
        }
      ]
    });
    
    console.log('🔄 Orchestration workflows configured');
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    try {
      await this.initialize();
      await this.app.start();
      
      console.log(`🌟 ${config.name} is running on port ${config.port}`);
      console.log(`📊 Monitoring available on port ${config.monitoring?.metricsPort}`);
      console.log(`🏥 Health check: http://localhost:${config.port}${config.monitoring?.healthCheckPath}`);
      
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down application...');
    
    try {
      // Stop orchestrator
      await this.orchestrator.stop();
      
      // Stop agents
      for (const [name, agent] of this.agents) {
        await agent.stop();
        console.log(`🔌 Stopped agent: ${name}`);
      }
      
      // Stop MPLP application
      await this.app.stop();
      
      console.log('✅ Application shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Create and start application
const app = new {{name}}App();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await app.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});

// Start the application
if (require.main === module) {
  app.start().catch((error) => {
    console.error('❌ Application startup failed:', error);
    process.exit(1);
  });
}

export default {{name}}App;
