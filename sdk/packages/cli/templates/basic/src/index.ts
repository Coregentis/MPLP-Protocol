/**
 * {{name}} - {{description}}
 * 
 * This is the main entry point for your MPLP application.
 * 
 * @author {{author}}
 * @version 1.0.0
 */

import { MPLPApplication } from '@mplp/sdk-core';
import { AgentBuilder } from '@mplp/agent-builder';
import { GreetingAgent } from './agents/GreetingAgent';
import { AppConfig } from './config/AppConfig';

/**
 * Main application class
 */
class {{pascalName}}Application {
  private app: MPLPApplication;
  private greetingAgent: GreetingAgent;

  constructor() {
    // Initialize MPLP application
    this.app = new MPLPApplication({
      name: '{{name}}',
      version: '1.0.0',
      description: '{{description}}'
    });

    // Create greeting agent
    this.greetingAgent = new GreetingAgent();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing {{name}}...');
    
    try {
      // Initialize MPLP application
      await this.app.initialize();
      
      // Register agents
      await this.app.registerModule('greetingAgent', this.greetingAgent);
      
      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    console.log('🎯 Starting {{name}}...');
    
    try {
      await this.app.start();
      
      // Demonstrate agent functionality
      await this.demonstrateAgents();
      
      console.log('🎉 Application started successfully');
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      throw error;
    }
  }

  /**
   * Stop the application
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping {{name}}...');
    
    try {
      await this.app.stop();
      console.log('✅ Application stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop application:', error);
      throw error;
    }
  }

  /**
   * Demonstrate agent functionality
   */
  private async demonstrateAgents(): Promise<void> {
    console.log('\n🤖 Demonstrating agent capabilities...');
    
    try {
      // Test greeting agent
      const greeting = await this.greetingAgent.greet('World');
      console.log(`Greeting Agent: ${greeting}`);
      
      const farewell = await this.greetingAgent.farewell('World');
      console.log(`Greeting Agent: ${farewell}`);
      
    } catch (error) {
      console.error('❌ Agent demonstration failed:', error);
    }
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
    process.on('SIGINT', async () => {
      console.log('\n🔄 Received SIGINT, shutting down gracefully...');
      await application.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
      await application.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Application failed:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { {{pascalName}}Application };
