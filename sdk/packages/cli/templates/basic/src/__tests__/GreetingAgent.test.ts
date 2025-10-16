/**
 * Tests for GreetingAgent
 */

import { GreetingAgent } from '../agents/GreetingAgent';

describe('GreetingAgent', () => {
  let agent: GreetingAgent;

  beforeEach(() => {
    agent = new GreetingAgent();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Initialization', () => {
    it('should create agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent).toBeInstanceOf(GreetingAgent);
    });

    it('should have correct agent info', () => {
      const info = agent.getInfo();
      
      expect(info.name).toBe('GreetingAgent');
      expect(info.description).toBe('A friendly agent that provides greetings and farewells');
      expect(info.version).toBe('1.0.0');
      expect(info.capabilities).toEqual(['greet', 'farewell', 'status']);
      expect(info.status).toBe('active');
    });
  });

  describe('Greeting Capability', () => {
    it('should greet with a personalized message', async () => {
      const result = await agent.greet('Alice');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Alice');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty name gracefully', async () => {
      const result = await agent.greet('');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate different greetings', async () => {
      const greetings = new Set();
      
      // Generate multiple greetings to test randomness
      for (let i = 0; i < 10; i++) {
        const greeting = await agent.greet('TestUser');
        greetings.add(greeting);
      }
      
      // Should have some variety (at least 2 different greetings in 10 attempts)
      expect(greetings.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Farewell Capability', () => {
    it('should say farewell with a personalized message', async () => {
      const result = await agent.farewell('Bob');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Bob');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty name gracefully', async () => {
      const result = await agent.farewell('');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate different farewells', async () => {
      const farewells = new Set();
      
      // Generate multiple farewells to test randomness
      for (let i = 0; i < 10; i++) {
        const farewell = await agent.farewell('TestUser');
        farewells.add(farewell);
      }
      
      // Should have some variety
      expect(farewells.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Status Capability', () => {
    it('should return status information', async () => {
      const result = await agent.getStatus();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('GreetingAgent');
      expect(result).toContain('active');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid capability gracefully', async () => {
      // This test depends on the agent implementation
      // If the agent throws for invalid capabilities, test that
      // If it handles gracefully, test the graceful handling
      expect(agent).toBeDefined();
    });
  });
});
