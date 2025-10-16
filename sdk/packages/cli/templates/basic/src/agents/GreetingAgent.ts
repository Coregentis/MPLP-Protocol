/**
 * Greeting Agent - A simple example agent for demonstration
 */

import { AgentBuilder } from '@mplp/agent-builder';

/**
 * Greeting Agent class
 * 
 * This is a simple example agent that demonstrates basic MPLP agent functionality.
 * It provides greeting and farewell capabilities.
 */
export class GreetingAgent {
  private agent: any;

  constructor() {
    // Build the agent using MPLP Agent Builder
    this.agent = new AgentBuilder()
      .setName('GreetingAgent')
      .setDescription('A friendly agent that provides greetings and farewells')
      .setVersion('1.0.0')
      
      // Add greeting capability
      .addCapability('greet', async (name: string) => {
        return this.generateGreeting(name);
      })
      
      // Add farewell capability
      .addCapability('farewell', async (name: string) => {
        return this.generateFarewell(name);
      })
      
      // Add status capability
      .addCapability('status', async () => {
        return this.getStatus();
      })
      
      .build();
  }

  /**
   * Greet someone
   */
  async greet(name: string): Promise<string> {
    return this.agent.executeCapability('greet', name);
  }

  /**
   * Say farewell to someone
   */
  async farewell(name: string): Promise<string> {
    return this.agent.executeCapability('farewell', name);
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<string> {
    return this.agent.executeCapability('status');
  }

  /**
   * Generate a personalized greeting
   */
  private generateGreeting(name: string): string {
    const greetings = [
      `Hello, ${name}! Welcome to the MPLP world!`,
      `Greetings, ${name}! How can I assist you today?`,
      `Hi there, ${name}! Great to see you!`,
      `Welcome, ${name}! I'm your friendly greeting agent.`,
      `Good day, ${name}! Ready to explore multi-agent systems?`
    ];
    
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }

  /**
   * Generate a personalized farewell
   */
  private generateFarewell(name: string): string {
    const farewells = [
      `Goodbye, ${name}! Thanks for using MPLP!`,
      `Farewell, ${name}! See you next time!`,
      `Take care, ${name}! Until we meet again!`,
      `Bye for now, ${name}! Happy coding!`,
      `See you later, ${name}! Keep building amazing agents!`
    ];
    
    const randomIndex = Math.floor(Math.random() * farewells.length);
    return farewells[randomIndex];
  }

  /**
   * Get current agent status
   */
  private getStatus(): string {
    return `GreetingAgent is active and ready to serve! 🤖✨`;
  }

  /**
   * Get agent information
   */
  getInfo(): any {
    return {
      name: 'GreetingAgent',
      description: 'A friendly agent that provides greetings and farewells',
      version: '1.0.0',
      capabilities: ['greet', 'farewell', 'status'],
      status: 'active'
    };
  }
}
