/**
 * Trace Entity 全面单元测试
 * 
 * 基于系统性链式批判性思维方法论，全面测试Trace实体的所有业务方法和边缘情况
 * 严格遵循测试发现源代码问题时立即修复源代码的原则
 * 目标：代码覆盖率>90%，功能覆盖率100%
 * 
 * @version 1.0.0
 * @created 2025-08-09
 * @target_coverage 90%+
 * @functional_coverage 100%
 */

import { Trace } from '../../src/modules/trace/domain/entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent, 
  PerformanceMetrics, 
  ErrorInformation,
  Correlation,
  TraceMetadata,
  ContextSnapshot,
  DecisionLog
} from '../../src/modules/trace/types';

describe('Trace Entity - 全面单元测试', () => {
  
  describe('🏗️ 构造函数和基本属性测试', () => {
    it('应该正确创建Trace实体', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      const trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );

      expect(trace.traceId).toBe('trace-1');
      expect(trace.contextId).toBe('context-1');
      expect(trace.protocolVersion).toBe('1.0.0');
      expect(trace.traceType).toBe('execution');
      expect(trace.severity).toBe('info');
      expect(trace.event).toEqual(event);
      expect(trace.timestamp).toBe('2025-08-09T10:00:00Z');
      expect(trace.createdAt).toBe('2025-08-09T10:00:00Z');
      expect(trace.updatedAt).toBe('2025-08-09T10:00:00Z');
    });

    it('应该正确处理所有可选参数', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      const performanceMetrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:01:00Z',
          duration_ms: 60000
        }
      };

      const errorInformation: ErrorInformation = {
        error_type: 'TestError',
        error_message: 'Test error',
        stack_trace: ['line1'],
        error_code: 'TEST_001'
      };

      const correlations: Correlation[] = [{
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Test correlation'
      }];

      const metadata: TraceMetadata = {
        tags: ['test'],
        custom_fields: { test: true }
      };

      const contextSnapshot: ContextSnapshot = {
        variables: { var1: 'value1' },
        environment: {
          os: 'linux',
          platform: 'x64',
          runtime_version: 'v18.0.0',
          environment_variables: { NODE_ENV: 'test' }
        }
      };

      const decisionLog: DecisionLog = {
        decisions: [{
          decision_id: 'dec-1',
          timestamp: '2025-08-09T10:00:00Z',
          decision_type: 'routing',
          input_data: { request: 'test' },
          output_data: { response: 'ok' },
          reasoning: 'Test decision'
        }]
      };

      const trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'error',
        'error',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        'plan-1',
        performanceMetrics,
        errorInformation,
        correlations,
        metadata,
        contextSnapshot,
        decisionLog
      );

      expect(trace.planId).toBe('plan-1');
      expect(trace.performanceMetrics).toEqual(performanceMetrics);
      expect(trace.errorInformation).toEqual(errorInformation);
      expect(trace.correlations).toEqual(correlations);
      expect(trace.metadata).toEqual(metadata);
      expect(trace.contextSnapshot).toEqual(contextSnapshot);
      expect(trace.decisionLog).toEqual(decisionLog);
    });

    it('应该正确处理taskId属性', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Task Event',
        category: 'system',
        source: {
          component: 'task-component'
        }
      };

      const trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );

      // 初始taskId应该为undefined
      expect(trace.taskId).toBeUndefined();

      // 设置taskId
      trace.taskId = 'task-123';
      expect(trace.taskId).toBe('task-123');
    });
  });

  describe('🔗 关联管理测试', () => {
    let trace: Trace;

    beforeEach(() => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );
    });

    it('应该正确添加关联', () => {
      const correlation: Correlation = {
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Test correlation'
      };

      trace.addCorrelation(correlation);

      expect(trace.correlations).toHaveLength(1);
      expect(trace.correlations[0]).toEqual(correlation);
    });

    it('应该正确添加多个关联', () => {
      const correlation1: Correlation = {
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Temporal correlation'
      };

      const correlation2: Correlation = {
        related_trace_id: 'trace-3',
        correlation_type: 'causal',
        strength: 0.9,
        description: 'Causal correlation'
      };

      trace.addCorrelation(correlation1);
      trace.addCorrelation(correlation2);

      expect(trace.correlations).toHaveLength(2);
      expect(trace.correlations).toContain(correlation1);
      expect(trace.correlations).toContain(correlation2);
    });

    it('应该正确移除关联', () => {
      const correlation1: Correlation = {
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Correlation 1'
      };

      const correlation2: Correlation = {
        related_trace_id: 'trace-3',
        correlation_type: 'causal',
        strength: 0.9,
        description: 'Correlation 2'
      };

      trace.addCorrelation(correlation1);
      trace.addCorrelation(correlation2);

      trace.removeCorrelation('trace-2');

      expect(trace.correlations).toHaveLength(1);
      expect(trace.correlations[0].related_trace_id).toBe('trace-3');
    });

    it('应该处理移除不存在的关联', () => {
      const correlation: Correlation = {
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Test correlation'
      };

      trace.addCorrelation(correlation);
      trace.removeCorrelation('non-existent');

      expect(trace.correlations).toHaveLength(1);
      expect(trace.correlations[0]).toEqual(correlation);
    });

    it('应该返回关联的副本以防止外部修改', () => {
      const correlation: Correlation = {
        related_trace_id: 'trace-2',
        correlation_type: 'temporal',
        strength: 0.8,
        description: 'Test correlation'
      };

      trace.addCorrelation(correlation);
      
      const correlations = trace.correlations;
      correlations.push({
        related_trace_id: 'trace-3',
        correlation_type: 'causal',
        strength: 0.9,
        description: 'External modification'
      });

      // 原始关联数组不应该被修改
      expect(trace.correlations).toHaveLength(1);
    });
  });

  describe('📊 性能指标管理测试', () => {
    let trace: Trace;

    beforeEach(() => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Performance Test',
        category: 'system',
        source: {
          component: 'perf-component'
        }
      };

      trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'performance',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );
    });

    it('应该正确更新性能指标', async () => {
      const metrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:01:00Z',
          duration_ms: 60000
        },
        memory_usage: {
          peak_mb: 256,
          average_mb: 128
        }
      };

      const originalUpdatedAt = trace.updatedAt;
      
      // 等待一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      trace.updatePerformanceMetrics(metrics);

      expect(trace.performanceMetrics).toEqual(metrics);
      expect(trace.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('应该正确获取执行持续时间', () => {
      const metrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:01:00Z',
          duration_ms: 60000
        }
      };

      trace.updatePerformanceMetrics(metrics);

      expect(trace.getExecutionDuration()).toBe(60000);
    });

    it('应该处理没有性能指标的情况', () => {
      expect(trace.getExecutionDuration()).toBeUndefined();
    });

    it('应该处理没有执行时间的性能指标', () => {
      const metrics: PerformanceMetrics = {
        memory_usage: {
          peak_mb: 256,
          average_mb: 128
        }
      };

      trace.updatePerformanceMetrics(metrics);

      expect(trace.getExecutionDuration()).toBeUndefined();
    });

    it('应该正确识别性能追踪', () => {
      // 基于trace_type
      expect(trace.isPerformanceTrace()).toBe(true);

      // 基于performance_metrics存在
      const executionTrace = new Trace(
        'trace-2',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        {
          type: 'start',
          name: 'Execution Event',
          category: 'system',
          source: { component: 'exec-component' }
        },
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );

      expect(executionTrace.isPerformanceTrace()).toBe(false);

      const metrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:01:00Z',
          duration_ms: 1000
        }
      };

      executionTrace.updatePerformanceMetrics(metrics);
      expect(executionTrace.isPerformanceTrace()).toBe(true);
    });
  });

  describe('❌ 错误信息管理测试', () => {
    let trace: Trace;

    beforeEach(() => {
      const event: TraceEvent = {
        type: 'error',
        name: 'Error Test',
        category: 'system',
        source: {
          component: 'error-component'
        }
      };

      trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'error',
        'info', // 初始为info级别
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );
    });

    it('应该正确设置错误信息并自动调整严重程度', async () => {
      const errorInfo: ErrorInformation = {
        error_type: 'ValidationError',
        error_message: 'Invalid input',
        stack_trace: ['line1', 'line2'],
        error_code: 'VAL_001'
      };

      const originalUpdatedAt = trace.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      trace.setErrorInformation(errorInfo);

      expect(trace.errorInformation).toEqual(errorInfo);
      expect(trace.severity).toBe('error'); // 应该自动设置为error
      expect(trace.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('应该正确识别错误追踪', () => {
      // 基于trace_type - 当前trace的trace_type是'error'，所以应该返回true
      expect(trace.isError()).toBe(true); // trace_type是'error'

      // 设置错误信息后仍然是错误追踪
      const errorInfo: ErrorInformation = {
        error_type: 'TestError',
        error_message: 'Test error',
        stack_trace: [],
        error_code: 'TEST_001'
      };

      trace.setErrorInformation(errorInfo);
      expect(trace.isError()).toBe(true);
    });

    it('应该基于严重程度识别错误追踪', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Critical Event',
        category: 'system',
        source: {
          component: 'critical-component'
        }
      };

      const criticalTrace = new Trace(
        'trace-2',
        'context-1',
        '1.0.0',
        'execution',
        'critical', // critical级别
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );

      expect(criticalTrace.isError()).toBe(true);
    });
  });

  describe('📝 元数据管理测试', () => {
    let trace: Trace;

    beforeEach(() => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Metadata Test',
        category: 'system',
        source: {
          component: 'metadata-component'
        }
      };

      trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );
    });

    it('应该正确更新元数据', async () => {
      const metadata: TraceMetadata = {
        tags: ['test', 'unit'],
        custom_fields: {
          environment: 'test',
          version: '1.0.0'
        }
      };

      const originalUpdatedAt = trace.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1));
      
      trace.updateMetadata(metadata);

      expect(trace.metadata).toEqual(metadata);
      expect(trace.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('应该正确管理标签通过元数据', () => {
      const newMetadata = {
        tags: ['new-tag']
      };
      trace.updateMetadata(newMetadata);

      expect(trace.metadata?.tags).toContain('new-tag');
    });

    it('应该处理重复标签通过元数据', () => {
      const metadataWithDuplicates = {
        tags: ['duplicate-tag', 'duplicate-tag', 'unique-tag']
      };
      trace.updateMetadata(metadataWithDuplicates);

      const tags = trace.metadata?.tags || [];
      expect(tags).toEqual(['duplicate-tag', 'duplicate-tag', 'unique-tag']);
    });

    it('应该正确更新标签通过元数据', () => {
      // 先添加一些标签
      trace.updateMetadata({ tags: ['tag-to-remove', 'tag-to-keep'] });

      // 然后更新为新的标签列表
      trace.updateMetadata({ tags: ['tag-to-keep', 'new-tag'] });

      expect(trace.metadata?.tags).not.toContain('tag-to-remove');
      expect(trace.metadata?.tags).toContain('tag-to-keep');
      expect(trace.metadata?.tags).toContain('new-tag');
    });
  });

  describe('🛡️ 边界条件和错误处理测试', () => {
    it('应该处理null/undefined输入', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      // 应该抛出错误，因为trace_id是必需的
      expect(() => {
        new Trace(
          null as any,
          'context-1',
          '1.0.0',
          'execution',
          'info',
          event,
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z'
        );
      }).toThrow('追踪ID不能为空');

      // 应该抛出错误，因为context_id是必需的
      expect(() => {
        new Trace(
          'trace-1',
          null as any,
          '1.0.0',
          'execution',
          'info',
          event,
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z'
        );
      }).toThrow('上下文ID不能为空');
    });

    it('应该处理无效的时间戳', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      expect(() => {
        new Trace(
          'trace-1',
          'context-1',
          '1.0.0',
          'execution',
          'info',
          event,
          'invalid-timestamp',
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z'
        );
      }).not.toThrow();
    });

    it('应该处理极长的字符串', () => {
      const longString = 'a'.repeat(10000);
      
      const event: TraceEvent = {
        type: 'start',
        name: longString,
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      expect(() => {
        new Trace(
          'trace-1',
          'context-1',
          '1.0.0',
          'execution',
          'info',
          event,
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z',
          '2025-08-09T10:00:00Z'
        );
      }).not.toThrow();
    });

    it('应该处理大量关联', () => {
      const event: TraceEvent = {
        type: 'start',
        name: 'Test Event',
        category: 'system',
        source: {
          component: 'test-component'
        }
      };

      const trace = new Trace(
        'trace-1',
        'context-1',
        '1.0.0',
        'execution',
        'info',
        event,
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z',
        '2025-08-09T10:00:00Z'
      );

      // 添加大量关联
      for (let i = 0; i < 1000; i++) {
        trace.addCorrelation({
          related_trace_id: `trace-${i}`,
          correlation_type: 'temporal',
          strength: 0.5,
          description: `Correlation ${i}`
        });
      }

      expect(trace.correlations).toHaveLength(1000);
    });
  });
});
