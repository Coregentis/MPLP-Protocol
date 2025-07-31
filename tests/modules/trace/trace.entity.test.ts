/**
 * Trace实体单元测试
 * 
 * 基于Schema驱动测试原则，测试Trace实体的所有领域行为
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T17:30:00+08:00
 */

import { Trace } from '../../../src/modules/trace/domain/entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent, 
  PerformanceMetrics, 
  ErrorInformation, 
  Correlation, 
  TraceMetadata 
} from '../../../src/modules/trace/types';
import { UUID, Timestamp } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Trace Entity', () => {
  // 辅助函数：创建有效的TraceEvent
  const createValidEvent = (event_name: string = 'test_event'): TraceEvent => ({
    type: 'start',
    name: event_name,
    description: 'Test event description',
    category: 'system',
    source: {
      component: 'test_component',
      module: 'test_module',
      function: 'test_function',
      line_number: 123
    },
    data: { test: true }
  });

  // 辅助函数：创建有效的PerformanceMetrics
  const createValidMetrics = (): PerformanceMetrics => ({
    execution_time: {
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: 150
    },
    resource_usage: {
      cpu: {
        utilization_percent: 50.5,
        instructions: 1000000,
        cache_misses: 100
      },
      memory: {
        peak_usage_mb: 256,
        average_usage_mb: 200,
        allocations: 1000,
        deallocations: 900
      }
    },
    custom_metrics: {
      test_metric: {
        value: 42,
        unit: 'count',
        type: 'counter'
      }
    }
  });

  // 辅助函数：创建有效的ErrorInformation
  const createValidError = (): ErrorInformation => ({
    error_code: 'TEST_ERROR',
    error_message: 'Test error message',
    error_type: 'validation',
    stack_trace: [
      {
        file: 'test.ts',
        function: 'testFunction',
        line: 123,
        column: 45
      }
    ],
    recovery_actions: [
      {
        action: 'retry',
        description: 'Retry the operation',
        parameters: { max_retries: 3 }
      }
    ]
  });

  // 辅助函数：创建有效的Correlation
  const createValidCorrelation = (): Correlation => ({
    correlation_id: TestDataFactory.Base.generateUUID(),
    type: 'causation',
    related_trace_id: TestDataFactory.Base.generateUUID(),
    strength: 0.8,
    description: 'Test correlation'
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Trace实例', async () => {
      // 基于实际Schema创建测试数据
      const traceParams = {
        trace_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0',
        trace_type: 'execution' as TraceType,
        severity: 'info' as TraceSeverity,
        event: createValidEvent('test_event'),
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan_id: TestDataFactory.Base.generateUUID(),
        performance_metrics: createValidMetrics(),
        error_information: createValidError(),
        correlations: [createValidCorrelation()],
        metadata: { test: true }
      };

      // 执行测试
      const trace = await TestHelpers.Performance.expectExecutionTime(
        () => new Trace(
          traceParams.trace_id,
          traceParams.context_id,
          traceParams.protocol_version,
          traceParams.trace_type,
          traceParams.severity,
          traceParams.event,
          traceParams.timestamp,
          traceParams.created_at,
          traceParams.updated_at,
          traceParams.plan_id,
          traceParams.performance_metrics,
          traceParams.error_information,
          traceParams.correlations,
          traceParams.metadata
        ),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果 - 基于实际getter方法
      expect(trace.trace_id).toBe(traceParams.trace_id);
      expect(trace.context_id).toBe(traceParams.context_id);
      expect(trace.plan_id).toBe(traceParams.plan_id);
      expect(trace.protocol_version).toBe(traceParams.protocol_version);
      expect(trace.trace_type).toBe(traceParams.trace_type);
      expect(trace.severity).toBe(traceParams.severity);
      expect(trace.event).toEqual(traceParams.event);
      expect(trace.timestamp).toBe(traceParams.timestamp);
      expect(trace.performance_metrics).toEqual(traceParams.performance_metrics);
      expect(trace.error_information).toEqual(traceParams.error_information);
      expect(trace.correlations).toEqual(traceParams.correlations);
      expect(trace.metadata).toEqual(traceParams.metadata);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '最小必需参数',
          input: {
            trace_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0',
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent(),
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expectedError: undefined
        },
        {
          name: '空字符串协议版本',
          input: {
            trace_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '',
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent(),
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expectedError: undefined
        },
        {
          name: '空关联数组',
          input: {
            trace_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0',
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent(),
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            correlations: []
          },
          expectedError: undefined
        }
      ];

      for (const test of boundaryTests) {
        const trace = new Trace(
          test.input.trace_id,
          test.input.context_id,
          test.input.protocol_version,
          test.input.trace_type,
          test.input.severity,
          test.input.event,
          test.input.timestamp,
          test.input.created_at,
          test.input.updated_at,
          undefined,
          undefined,
          undefined,
          test.input.correlations || [],
          undefined
        );

        expect(trace.trace_id).toBe(test.input.trace_id);
        expect(trace.context_id).toBe(test.input.context_id);
        expect(trace.protocol_version).toBe(test.input.protocol_version);
        expect(trace.trace_type).toBe(test.input.trace_type);
        expect(trace.severity).toBe(test.input.severity);
      }
    });
  });

  describe('addCorrelation', () => {
    it('应该成功添加新关联', async () => {
      // 准备测试数据
      const trace = new Trace(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        [],
        undefined
      );

      const newCorrelation = createValidCorrelation();
      const originalUpdatedAt = trace.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      trace.addCorrelation(newCorrelation);

      // 验证结果
      expect(trace.correlations).toContain(newCorrelation);
      expect(trace.correlations.length).toBe(1);
      expect(new Date(trace.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('应该不添加重复的关联', () => {
      // 准备测试数据
      const existingCorrelation = createValidCorrelation();
      const trace = new Trace(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        [existingCorrelation],
        undefined
      );

      // 执行测试
      trace.addCorrelation(existingCorrelation);

      // 验证结果
      expect(trace.correlations).toContain(existingCorrelation);
      expect(trace.correlations.length).toBe(1);
    });
  });

  describe('removeCorrelation', () => {
    it('应该成功移除存在的关联', async () => {
      // 准备测试数据
      const correlationToRemove = createValidCorrelation();
      const otherCorrelation = createValidCorrelation();
      const trace = new Trace(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        [correlationToRemove, otherCorrelation],
        undefined
      );

      const originalUpdatedAt = trace.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      trace.removeCorrelation(correlationToRemove.related_trace_id, correlationToRemove.type);

      // 验证结果
      expect(trace.correlations).not.toContain(correlationToRemove);
      expect(trace.correlations.length).toBe(1);
      expect(new Date(trace.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('应该处理移除不存在的关联', () => {
      // 准备测试数据
      const existingCorrelation = createValidCorrelation();
      const nonExistentId = TestDataFactory.Base.generateUUID();
      const trace = new Trace(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        [existingCorrelation],
        undefined
      );

      // 执行测试
      const originalLength = trace.correlations.length;
      trace.removeCorrelation(nonExistentId, 'causation');

      // 验证结果
      expect(trace.correlations.length).toBe(originalLength);
      expect(trace.correlations).toContain(existingCorrelation);
    });
  });

  describe('updateMetadata', () => {
    it('应该成功更新元数据', async () => {
      // 准备测试数据
      const trace = new Trace(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        [],
        { existing: 'value' }
      );

      const newMetadata = { new: 'metadata', updated: true };
      const originalUpdatedAt = trace.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      trace.updateMetadata(newMetadata);

      // 验证结果
      expect(trace.metadata).toEqual({ existing: 'value', ...newMetadata });
      expect(new Date(trace.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('getter方法', () => {
    it('应该正确返回所有属性', () => {
      // 准备测试数据
      const traceParams = {
        trace_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0',
        trace_type: 'execution' as TraceType,
        severity: 'info' as TraceSeverity,
        event: createValidEvent(),
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan_id: TestDataFactory.Base.generateUUID(),
        performance_metrics: createValidMetrics(),
        error_information: createValidError(),
        correlations: [createValidCorrelation()],
        metadata: { test: true }
      };

      const trace = new Trace(
        traceParams.trace_id,
        traceParams.context_id,
        traceParams.protocol_version,
        traceParams.trace_type,
        traceParams.severity,
        traceParams.event,
        traceParams.timestamp,
        traceParams.created_at,
        traceParams.updated_at,
        traceParams.plan_id,
        traceParams.performance_metrics,
        traceParams.error_information,
        traceParams.correlations,
        traceParams.metadata
      );

      // 验证所有getter方法
      expect(trace.trace_id).toBe(traceParams.trace_id);
      expect(trace.context_id).toBe(traceParams.context_id);
      expect(trace.plan_id).toBe(traceParams.plan_id);
      expect(trace.protocol_version).toBe(traceParams.protocol_version);
      expect(trace.trace_type).toBe(traceParams.trace_type);
      expect(trace.severity).toBe(traceParams.severity);
      expect(trace.event).toEqual(traceParams.event);
      expect(trace.timestamp).toBe(traceParams.timestamp);
      expect(trace.performance_metrics).toEqual(traceParams.performance_metrics);
      expect(trace.error_information).toEqual(traceParams.error_information);
      expect(trace.correlations).toEqual(traceParams.correlations);
      expect(trace.metadata).toEqual(traceParams.metadata);
    });
  });
});
