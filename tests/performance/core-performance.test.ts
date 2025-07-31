/**
 * 核心模块性能测试
 * @description 基于实际Core模块实现的性能测试文件
 * @author MPLP Team
 * @version 1.0.1
 *
 * 技术栈版本：
 * - TypeScript: 5.0.4
 * - Jest: 29.5.0
 * - ts-jest: 29.1.0
 */

import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import { EventBus } from '../../src/core/event-bus';
import { DependencyContainer, createInterfaceToken } from '../../src/core/dependency-container';
import { CacheManager } from '../../src/core/cache/cache-manager';
import { CacheClient } from '../../src/core/cache/cache-client';
import { SchemaValidator } from '../../src/core/schema/schema-validator';
import { WorkflowManager } from '../../src/core/workflow/workflow-manager';

// 设置性能测试阈值（毫秒）
const PERFORMANCE_THRESHOLDS = {
  SCHEMA_VALIDATION: 50,
  EVENT_EMISSION: 10,
  DEPENDENCY_RESOLUTION: 20,
  CACHE_OPERATION: 5,
  WORKFLOW_INITIALIZATION: 100
};

describe('核心模块性能测试', () => {
  let eventBus: EventBus;
  let dependencyContainer: DependencyContainer;
  let cacheManager: CacheManager;
  let cacheClient: CacheClient;
  let schemaValidator: SchemaValidator;
  let workflowManager: WorkflowManager;

  beforeEach(() => {
    eventBus = new EventBus();
    dependencyContainer = new DependencyContainer();

    cacheManager = new CacheManager({
      defaultTTL: 300,
      maxSize: 1000,
      storageBackend: 'memory',
      enableMetrics: true,
      enableEvents: false,
      cleanupInterval: 60
    });

    cacheClient = new CacheClient(cacheManager, { namespace: 'perf-test' });

    schemaValidator = new SchemaValidator({
      mode: 'strict',
      enableCaching: true,
      cacheSize: 100,
      enableMetrics: true
    });

    workflowManager = new WorkflowManager({
      maxConcurrentWorkflows: 50,
      defaultTimeout: 30000,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: true
    }, eventBus);
  });

  afterEach(() => {
    eventBus.clear();
    cacheManager.destroy();
  });

  describe('Schema验证性能', () => {
    it('应在性能阈值内验证简单Schema', async () => {
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['id', 'name']
      };

      const data = {
        id: 'test-123',
        name: 'Test User',
        age: 30
      };

      const startTime = performance.now();
      const result = await schemaValidator.validate(schema, data);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SCHEMA_VALIDATION);
    });

    it('应在批量验证中保持性能', async () => {
      const schema = { type: 'string', minLength: 1 };
      const validations = [];

      for (let i = 0; i < 100; i++) {
        validations.push({
          schema,
          data: `test-string-${i}`,
          id: `validation-${i}`
        });
      }

      const startTime = performance.now();
      const results = await schemaValidator.validateBatch(validations);
      const endTime = performance.now();

      const duration = endTime - startTime;
      const averageDuration = duration / validations.length;

      expect(results).toHaveLength(100);
      expect(results.every(r => r.valid)).toBe(true);
      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.SCHEMA_VALIDATION / 10);
    });
  });

  describe('事件总线性能', () => {
    it('应在性能阈值内发布事件', () => {
      const handler = jest.fn();
      eventBus.subscribe('perf-test-event', handler as any);

      const startTime = performance.now();
      eventBus.publish('perf-test-event', { data: 'test' });
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(handler).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.EVENT_EMISSION);
    });

    it('应在多订阅者情况下保持性能', () => {
      const handlers = [];
      const subscriberCount = 100;

      // 创建多个订阅者
      for (let i = 0; i < subscriberCount; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventBus.subscribe('multi-subscriber-event', handler as any);
      }

      const startTime = performance.now();
      const handlerCount = eventBus.publish('multi-subscriber-event', { data: 'test' });
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(handlerCount).toBe(subscriberCount);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.EVENT_EMISSION * 10);
    });
  });

  describe('依赖注入性能', () => {
    it('应在性能阈值内解析服务', () => {
      interface ITestService {
        getName(): string;
      }

      const serviceToken = createInterfaceToken<ITestService>('TestService');
      const service: ITestService = {
        getName: () => 'Test Service'
      };

      dependencyContainer.register(serviceToken, service);

      const startTime = performance.now();
      const resolved = dependencyContainer.resolve(serviceToken);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(resolved).toBe(service);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.DEPENDENCY_RESOLUTION);
    });
  });

  describe('缓存系统性能', () => {
    it('应在性能阈值内执行缓存操作', async () => {
      const key = 'perf-test-key';
      const value = { data: 'performance test value' };

      // 测试设置性能
      const setStartTime = performance.now();
      await cacheManager.set(key, value);
      const setEndTime = performance.now();

      // 测试获取性能
      const getStartTime = performance.now();
      const retrieved = await cacheManager.get(key);
      const getEndTime = performance.now();

      const setDuration = setEndTime - setStartTime;
      const getDuration = getEndTime - getStartTime;

      expect(retrieved).toEqual(value);
      expect(setDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.CACHE_OPERATION);
      expect(getDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.CACHE_OPERATION);
    });
  });

  describe('工作流管理性能', () => {
    it('应在性能阈值内初始化工作流', async () => {
      const context = {
        workflow_id: 'perf-test-workflow',
        user_id: 'perf-test-user',
        session_id: 'perf-test-session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { performance: 'test' }
      };

      const startTime = performance.now();
      const result = await workflowManager.initializeWorkflow(context);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(result.workflow_id).toMatch(/^workflow_\d+_[a-z0-9]+$/);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.WORKFLOW_INITIALIZATION);
    });
  });
});
