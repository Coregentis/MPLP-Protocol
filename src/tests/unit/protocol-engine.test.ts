/**
 * Protocol Engine Unit Tests
 * @description 协议引擎核心功能的单元测试
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';
import {
  ProtocolEngine,
  createDevelopmentEngine,
} from '../../core/protocol-engine';
import {
  ProtocolDefinition,
  OperationContext,
} from '../../core/protocol-types';
import { EventBus } from '../../core/event-bus';
import { CacheManager } from '../../core/cache/cache-manager';

describe('ProtocolEngine Unit Tests', () => {
  let engine: ProtocolEngine;
  let eventBus: EventBus;
  let cache: CacheManager;

  beforeEach(async () => {
    eventBus = new EventBus();
    cache = new CacheManager({
      defaultTTL: 60000,
      maxSize: 100,
      cleanupInterval: 30000,
      enableMetrics: true,
      enableEvents: false,
      storageBackend: 'memory',
    });

    // 创建引擎时传入我们的eventBus实例
    engine = new ProtocolEngine(
      {
        enableValidation: true,
        enableCaching: false,
        enableTracing: true,
        enableMetrics: true,
        defaultTimeout: 60000,
        maxRetries: 3,
        cacheSize: 1000,
      },
      eventBus,
      cache
    );
    await engine.start();
  });

  afterEach(async () => {
    if (engine) {
      engine.resetMetrics(); // 重置指标以避免测试间干扰
      await engine.stop();
    }
    if (cache) {
      // await cache.cleanup(); // cleanup is private
    }
  });

  describe('Engine Lifecycle', () => {
    it('should start and stop successfully', async () => {
      const newEngine = createDevelopmentEngine();

      await newEngine.start();
      const metrics = newEngine.getMetrics();
      expect(metrics.isRunning).toBe(true);

      await newEngine.stop();
      const stoppedMetrics = newEngine.getMetrics();
      expect(stoppedMetrics.isRunning).toBe(false);
    });

    it('should handle multiple start/stop calls gracefully', async () => {
      await engine.start(); // Already started in beforeEach
      await engine.start(); // Should not throw

      await engine.stop();
      await engine.stop(); // Should not throw
    });
  });

  describe('Protocol Registration', () => {
    const testProtocol: ProtocolDefinition = {
      id: 'test-protocol',
      name: 'Test Protocol',
      version: '1.0.0',
      type: 'core',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
      },
      operations: {
        testOperation: {
          name: 'testOperation',
          description: 'Test operation',
          handler: async (input: any, context: OperationContext) => {
            return { success: true, data: input };
          },
        },
      },
      metadata: {
        author: 'Test Author',
        description: 'Test protocol for unit testing',
      },
    };

    it('should register protocol successfully', async () => {
      await engine.registerProtocol(testProtocol);

      const registeredProtocols = engine.getRegisteredProtocols();
      expect(registeredProtocols).toHaveLength(1);
      expect(registeredProtocols[0].id).toBe('test-protocol');
    });

    it('should reject invalid protocol schema', async () => {
      const invalidProtocol = {
        ...testProtocol,
        schema: {
          type: 'invalid-type', // Invalid schema
        },
      };

      await expect(
        engine.registerProtocol(invalidProtocol as any)
      ).rejects.toThrow('Invalid protocol schema');
    });

    it('should reject duplicate protocol registration', async () => {
      await engine.registerProtocol(testProtocol);

      await expect(engine.registerProtocol(testProtocol)).rejects.toThrow(
        'Protocol already registered'
      );
    });

    it('should unregister protocol successfully', async () => {
      await engine.registerProtocol(testProtocol);

      const unregistered = await engine.unregisterProtocol('test-protocol');
      expect(unregistered).toBe(true);

      const protocols = engine.getRegisteredProtocols();
      expect(protocols).toHaveLength(0);
    });

    it('should handle unregistering non-existent protocol', async () => {
      const unregistered = await engine.unregisterProtocol('non-existent');
      expect(unregistered).toBe(false);
    });
  });

  describe('Operation Execution', () => {
    const testProtocol: ProtocolDefinition = {
      id: 'test-protocol',
      name: 'Test Protocol',
      version: '1.0.0',
      type: 'core',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          value: { type: 'number' },
        },
        required: ['id', 'value'],
      },
      operations: {
        add: {
          name: 'add',
          description: 'Add two numbers',
          handler: async (input: any) => {
            return input.a + input.b;
          },
          inputSchema: {
            type: 'object',
            properties: {
              a: { type: 'number' },
              b: { type: 'number' },
            },
            required: ['a', 'b'],
          },
          outputSchema: {
            type: 'number',
          },
        },
        error: {
          name: 'error',
          description: 'Operation that throws error',
          handler: async () => {
            throw new Error('Test error');
          },
        },
        timeout: {
          name: 'timeout',
          description: 'Operation that times out',
          handler: async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return 'completed';
          },
          timeout: 1000,
        },
      },
    };

    beforeEach(async () => {
      await engine.registerProtocol(testProtocol);
    });

    it('should execute operation successfully', async () => {
      const result = await engine.executeOperation('test-protocol', 'add', {
        a: 5,
        b: 3,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(8);
      expect(result.metadata?.executionTime).toBeGreaterThan(0);
    });

    it('should validate input data', async () => {
      const result = await engine.executeOperation(
        'test-protocol',
        'add',
        { a: 'invalid', b: 3 } // Invalid input
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
    });

    it('should handle operation errors gracefully', async () => {
      const result = await engine.executeOperation(
        'test-protocol',
        'error',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should handle operation timeouts', async () => {
      const result = await engine.executeOperation(
        'test-protocol',
        'timeout',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation timeout');
    });

    it('should reject execution on non-existent protocol', async () => {
      const result = await engine.executeOperation('non-existent', 'add', {
        a: 1,
        b: 2,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Protocol not found');
    });

    it('should reject execution on non-existent operation', async () => {
      const result = await engine.executeOperation(
        'test-protocol',
        'non-existent',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Operation not found');
    });
  });

  describe('Data Validation', () => {
    const testProtocol: ProtocolDefinition = {
      id: 'validation-protocol',
      name: 'Validation Protocol',
      version: '1.0.0',
      type: 'core',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[a-zA-Z0-9-_]+$' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          age: { type: 'number', minimum: 0, maximum: 150 },
          email: { type: 'string', format: 'email' },
        },
        required: ['id', 'name'],
      },
      operations: {},
    };

    beforeEach(async () => {
      await engine.registerProtocol(testProtocol);
    });

    it('should validate correct data', async () => {
      const validData = {
        id: 'test-123',
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      };

      const isValid = await engine.validateProtocolData(
        'validation-protocol',
        validData
      );
      expect(isValid).toBe(true);
    });

    it('should reject data with missing required fields', async () => {
      const invalidData = {
        age: 25, // Missing required 'id' and 'name'
      };

      const isValid = await engine.validateProtocolData(
        'validation-protocol',
        invalidData
      );
      expect(isValid).toBe(false);
    });

    it('should reject data with invalid field types', async () => {
      const invalidData = {
        id: 'test-123',
        name: 'Test User',
        age: 'twenty-five', // Should be number
      };

      const isValid = await engine.validateProtocolData(
        'validation-protocol',
        invalidData
      );
      expect(isValid).toBe(false);
    });

    it('should reject data with invalid patterns', async () => {
      const invalidData = {
        id: 'test@123!', // Invalid pattern
        name: 'Test User',
      };

      const isValid = await engine.validateProtocolData(
        'validation-protocol',
        invalidData
      );
      expect(isValid).toBe(false);
    });
  });

  describe('Event System', () => {
    it('should publish protocol registration events', async () => {
      const eventSpy = jest.fn();
      eventBus.subscribe('protocol:registered', eventSpy as any);

      const testProtocol: ProtocolDefinition = {
        id: 'event-test-protocol',
        name: 'Event Test Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {},
      };

      await engine.registerProtocol(testProtocol);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          protocolId: 'event-test-protocol',
          protocolName: 'Event Test Protocol',
        })
      );
    });

    it('should publish operation execution events', async () => {
      const startSpy = jest.fn();
      const completedSpy = jest.fn();

      eventBus.subscribe('operation:started', startSpy as any);
      eventBus.subscribe('operation:completed', completedSpy as any);

      const testProtocol: ProtocolDefinition = {
        id: 'event-protocol',
        name: 'Event Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {
          test: {
            name: 'test',
            description: 'Test operation',
            handler: async () => 'success',
          },
        },
      };

      await engine.registerProtocol(testProtocol);
      await engine.executeOperation('event-protocol', 'test', {});

      expect(startSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          protocolId: 'event-protocol',
          operationName: 'test',
        })
      );

      expect(completedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          protocolId: 'event-protocol',
          operationName: 'test',
        })
      );
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track operation metrics', async () => {
      // 重置指标以确保测试隔离
      engine.resetMetrics();

      const testProtocol: ProtocolDefinition = {
        id: 'metrics-protocol',
        name: 'Metrics Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {
          success: {
            name: 'success',
            description: 'Successful operation',
            handler: async () => 'success',
          },
          failure: {
            name: 'failure',
            description: 'Failing operation',
            handler: async () => {
              throw new Error('Test failure');
            },
          },
        },
      };

      await engine.registerProtocol(testProtocol);

      // Execute successful operations
      await engine.executeOperation('metrics-protocol', 'success', {});
      await engine.executeOperation('metrics-protocol', 'success', {});

      // Execute failing operation
      await engine.executeOperation('metrics-protocol', 'failure', {});

      const metrics = engine.getMetrics();

      expect(metrics.totalOperations).toBe(3);
      expect(metrics.successfulOperations).toBe(2);
      expect(metrics.failedOperations).toBe(1);
      expect(metrics.averageExecutionTime).toBeGreaterThanOrEqual(0); // 允许0值，因为操作可能执行得非常快
    });

    it('should reset metrics', async () => {
      // 重置指标以确保测试隔离
      engine.resetMetrics();

      const testProtocol: ProtocolDefinition = {
        id: 'reset-protocol',
        name: 'Reset Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {
          test: {
            name: 'test',
            description: 'Test operation',
            handler: async () => 'success',
          },
        },
      };

      await engine.registerProtocol(testProtocol);
      await engine.executeOperation('reset-protocol', 'test', {});

      let metrics = engine.getMetrics();
      expect(metrics.totalOperations).toBe(1);

      engine.resetMetrics();
      metrics = engine.getMetrics();
      expect(metrics.totalOperations).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle engine not running', async () => {
      const newEngine = createDevelopmentEngine();
      // Don't start the engine

      const testProtocol: ProtocolDefinition = {
        id: 'error-protocol',
        name: 'Error Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {},
      };

      await expect(newEngine.registerProtocol(testProtocol)).rejects.toThrow(
        'Protocol engine is not running'
      );
    });

    it('should handle invalid operation context', async () => {
      const testProtocol: ProtocolDefinition = {
        id: 'context-protocol',
        name: 'Context Protocol',
        version: '1.0.0',
        type: 'core',
        schema: { type: 'object' },
        operations: {
          contextTest: {
            name: 'contextTest',
            description: 'Context test operation',
            handler: async (input: any, context: OperationContext) => {
              if (!context.protocolId) {
                throw new Error('Missing protocol ID in context');
              }
              return 'success';
            },
          },
        },
      };

      await engine.registerProtocol(testProtocol);

      const result = await engine.executeOperation(
        'context-protocol',
        'contextTest',
        {},
        { operationName: 'contextTest' } // Missing protocolId
      );

      expect(result.success).toBe(true); // 因为protocolId会被自动添加到context中
      expect(result.data).toBe('success');
    });
  });

  describe('Protocol Discovery', () => {
    beforeEach(async () => {
      const protocols: ProtocolDefinition[] = [
        {
          id: 'core-protocol-1',
          name: 'Core Protocol 1',
          version: '1.0.0',
          type: 'core',
          schema: { type: 'object' },
          operations: {},
        },
        {
          id: 'core-protocol-2',
          name: 'Core Protocol 2',
          version: '1.1.0',
          type: 'core',
          schema: { type: 'object' },
          operations: {},
        },
        {
          id: 'collab-protocol-1',
          name: 'Collab Protocol 1',
          version: '1.0.0',
          type: 'collab',
          schema: { type: 'object' },
          operations: {},
        },
      ];

      for (const protocol of protocols) {
        await engine.registerProtocol(protocol);
      }
    });

    it('should get all registered protocols', async () => {
      const protocols = engine.getRegisteredProtocols();
      expect(protocols).toHaveLength(3);
    });

    it('should get specific protocol', async () => {
      const protocol = engine.getProtocol('core-protocol-1');
      expect(protocol).toBeDefined();
      expect(protocol?.name).toBe('Core Protocol 1');
    });

    it('should return undefined for non-existent protocol', async () => {
      const protocol = engine.getProtocol('non-existent');
      expect(protocol).toBeUndefined();
    });
  });
});
