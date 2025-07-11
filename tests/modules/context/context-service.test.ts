/**
 * Context服务单元测试
 * 
 * @version v1.0.0
 * @created 2025-07-10T00:05:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 测试规范
 */

import { DataSource } from 'typeorm';
import { ContextService } from '@/modules/context/context-service';
import { ContextEntity } from '@/modules/context/entities/context.entity';
import { SharedStateEntity } from '@/modules/context/entities/shared-state.entity';
import { ContextSessionEntity } from '@/modules/context/entities/context-session.entity';
import { createDefaultContextConfig } from '@/modules/context/context-factory';

describe('ContextService', () => {
  let dataSource: DataSource;
  let contextService: ContextService;

  beforeAll(async () => {
    // 创建测试数据库连接
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [ContextEntity, SharedStateEntity, ContextSessionEntity],
      synchronize: true,
      logging: false
    });

    await dataSource.initialize();

    // 初始化Context服务
    const config = createDefaultContextConfig();
    contextService = new ContextService(dataSource, config);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // 清理测试数据
    await dataSource.getRepository(ContextSessionEntity).clear();
    await dataSource.getRepository(SharedStateEntity).clear();
    await dataSource.getRepository(ContextEntity).clear();
  });

  describe('createContext', () => {
    it('应该成功创建Context', async () => {
      const result = await contextService.createContext(
        'user-123',
        'Test Context',
        'Test Description'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe('Test Context');
      expect(result.data!.user_id).toBe('user-123');
      expect(result.data!.lifecycle_stage).toBe('planning');
      expect(result.operation_time_ms).toBeGreaterThan(0);
    });

    it('应该支持初始共享状态', async () => {
      const initialState = {
        key1: 'value1',
        key2: { nested: 'value' },
        key3: 123
      };

      const result = await contextService.createContext(
        'user-123',
        'Test Context',
        'Test Description',
        undefined,
        initialState
      );

      expect(result.success).toBe(true);
      expect(Object.keys(result.data!.shared_state)).toHaveLength(3);
      expect(result.data!.shared_state.key1.value).toBe('value1');
      expect(result.data!.shared_state.key2.value).toEqual({ nested: 'value' });
      expect(result.data!.shared_state.key3.value).toBe(123);
    });

    it('应该支持父子Context关系', async () => {
      // 创建父Context
      const parentResult = await contextService.createContext(
        'user-123',
        'Parent Context'
      );

      // 创建子Context
      const childResult = await contextService.createContext(
        'user-123',
        'Child Context',
        'Child Description',
        parentResult.data!.context_id
      );

      expect(childResult.success).toBe(true);
      expect(childResult.data!.metadata.parent_context_id).toBe(parentResult.data!.context_id);
    });

    it('应该验证父Context存在性', async () => {
      const result = await contextService.createContext(
        'user-123',
        'Test Context',
        'Test Description',
        'non-existent-parent'
      );

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('PARENT_CONTEXT_NOT_FOUND');
    });
  });

  describe('getContext', () => {
    it('应该成功获取存在的Context', async () => {
      // 先创建Context
      const createResult = await contextService.createContext(
        'user-123',
        'Test Context'
      );

      // 获取Context
      const getResult = await contextService.getContext(createResult.data!.context_id);

      expect(getResult.success).toBe(true);
      expect(getResult.data!.context_id).toBe(createResult.data!.context_id);
      expect(getResult.data!.name).toBe('Test Context');
    });

    it('应该返回错误当Context不存在', async () => {
      const result = await contextService.getContext('non-existent-context');

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('CONTEXT_NOT_FOUND');
    });
  });

  describe('updateLifecycleStage', () => {
    it('应该成功更新生命周期状态', async () => {
      // 创建Context
      const createResult = await contextService.createContext(
        'user-123',
        'Test Context'
      );

      // 更新生命周期
      const updateResult = await contextService.updateLifecycleStage(
        createResult.data!.context_id,
        'active',
        { reason: 'test update' }
      );

      expect(updateResult.success).toBe(true);

      // 验证更新
      const getResult = await contextService.getContext(createResult.data!.context_id);
      expect(getResult.data!.lifecycle_stage).toBe('active');
    });

    it('应该返回错误当Context不存在', async () => {
      const result = await contextService.updateLifecycleStage(
        'non-existent-context',
        'active'
      );

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('CONTEXT_NOT_FOUND');
    });
  });

  describe('setSharedState', () => {
    let contextId: string;

    beforeEach(async () => {
      const result = await contextService.createContext('user-123', 'Test Context');
      contextId = result.data!.context_id;
    });

    it('应该成功设置共享状态', async () => {
      const result = await contextService.setSharedState(
        contextId,
        'test-key',
        'test-value',
        {
          source_module: 'test',
          access_level: 'public',
          encryption_required: false,
          sync_priority: 'medium',
          tags: ['test']
        }
      );

      expect(result.success).toBe(true);
      expect(result.data!.key).toBe('test-key');
      expect(result.data!.value).toBe('test-value');
      expect(result.data!.data_type).toBe('string');
    });

    it('应该支持不同数据类型', async () => {
      const testCases = [
        { key: 'string-key', value: 'string-value', expectedType: 'string' },
        { key: 'number-key', value: 123, expectedType: 'number' },
        { key: 'boolean-key', value: true, expectedType: 'boolean' },
        { key: 'object-key', value: { nested: 'value' }, expectedType: 'object' },
        { key: 'array-key', value: [1, 2, 3], expectedType: 'array' }
      ];

      for (const testCase of testCases) {
        const result = await contextService.setSharedState(
          contextId,
          testCase.key,
          testCase.value,
          { source_module: 'test' }
        );

        expect(result.success).toBe(true);
        expect(result.data!.data_type).toBe(testCase.expectedType);
        expect(result.data!.value).toEqual(testCase.value);
      }
    });

    it('应该返回错误当Context不存在', async () => {
      const result = await contextService.setSharedState(
        'non-existent-context',
        'test-key',
        'test-value',
        { source_module: 'test' }
      );

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('CONTEXT_NOT_FOUND');
    });
  });

  describe('queryContexts', () => {
    beforeEach(async () => {
      // 创建测试数据
      await contextService.createContext('user-1', 'Context 1');
      await contextService.createContext('user-2', 'Context 2');
      await contextService.createContext('user-1', 'Context 3');
    });

    it('应该支持按用户ID查询', async () => {
      const result = await contextService.queryContexts({
        user_ids: ['user-1']
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data!.every(ctx => ctx.user_id === 'user-1')).toBe(true);
    });

    it('应该支持按生命周期阶段查询', async () => {
      const result = await contextService.queryContexts({
        lifecycle_stages: ['planning']
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data!.every(ctx => ctx.lifecycle_stage === 'planning')).toBe(true);
    });

    it('应该支持分页', async () => {
      const result = await contextService.queryContexts({}, 2, 0);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('性能测试', () => {
    it('Context创建应该在5ms内完成', async () => {
      const startTime = performance.now();
      
      const result = await contextService.createContext(
        'user-123',
        'Performance Test Context'
      );
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(operationTime).toBeLessThan(5);
    });

    it('Context获取应该在5ms内完成', async () => {
      // 先创建Context
      const createResult = await contextService.createContext(
        'user-123',
        'Performance Test Context'
      );

      const startTime = performance.now();
      
      const result = await contextService.getContext(createResult.data!.context_id);
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(operationTime).toBeLessThan(5);
    });

    it('共享状态设置应该在10ms内完成', async () => {
      // 先创建Context
      const createResult = await contextService.createContext(
        'user-123',
        'Performance Test Context'
      );

      const startTime = performance.now();
      
      const result = await contextService.setSharedState(
        createResult.data!.context_id,
        'performance-key',
        'performance-value',
        { source_module: 'test' }
      );
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(operationTime).toBeLessThan(10);
    });
  });
}); 