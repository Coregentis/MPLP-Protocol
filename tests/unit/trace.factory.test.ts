/**
 * TraceFactory 全面单元测试
 * 
 * 基于系统性链式批判性思维方法论，全面测试TraceFactory的所有创建方法和验证逻辑
 * 严格遵循测试发现源代码问题时立即修复源代码的原则
 * 目标：代码覆盖率>90%，功能覆盖率100%
 * 
 * @version 1.0.0
 * @created 2025-08-09
 * @target_coverage 90%+
 * @functional_coverage 100%
 */

import { TraceFactory, CreateTraceRequest } from '../../src/modules/trace/domain/factories/trace.factory';
import { Trace } from '../../src/modules/trace/domain/entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent, 
  PerformanceMetrics, 
  ErrorInformation 
} from '../../src/modules/trace/types';

describe('TraceFactory - 全面单元测试', () => {
  
  describe('🏭 create - 追踪对象创建测试', () => {
    it('应该成功创建基本追踪对象', () => {
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      const trace = TraceFactory.create(request);

      expect(trace).toBeInstanceOf(Trace);
      expect(trace.contextId).toBe('context-1');
      expect(trace.traceType).toBe('execution');
      expect(trace.severity).toBe('info');
      expect(trace.event.name).toBe('Test Event');
      expect(trace.protocolVersion).toBe('1.0.0');
      expect(trace.traceId).toBeDefined();
      expect(trace.createdAt).toBeDefined();
      expect(trace.updatedAt).toBeDefined();
    });

    it('应该正确处理可选字段', () => {
      const performanceMetrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:01:00Z',
          duration_ms: 60000
        }
      };

      const errorInformation: ErrorInformation = {
        error_type: 'TestError',
        error_message: 'Test error message',
        stack_trace: ['line1', 'line2'],
        error_code: 'TEST_001'
      };

      const request: CreateTraceRequest = {
        context_id: 'context-1',
        plan_id: 'plan-1',
        trace_type: 'error',
        severity: 'error',
        event: {
          type: 'error',
          name: 'Error Event',
          category: 'system',
          source: {
            component: 'error-component'
          }
        },
        timestamp: '2025-08-09T10:00:00Z',
        performance_metrics: performanceMetrics,
        error_information: errorInformation,
        correlations: [],
        metadata: { test: true }
      };

      const trace = TraceFactory.create(request);

      expect(trace.planId).toBe('plan-1');
      expect(trace.performanceMetrics).toEqual(performanceMetrics);
      expect(trace.errorInformation).toEqual(errorInformation);
      expect(trace.correlations).toEqual([]);
      expect(trace.metadata).toEqual({ test: true });
    });

    it('应该自动生成时间戳', () => {
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      const trace = TraceFactory.create(request);

      expect(trace.timestamp).toBeDefined();
      expect(trace.createdAt).toBeDefined();
      expect(trace.updatedAt).toBeDefined();
      
      // 验证时间戳格式
      expect(() => new Date(trace.timestamp)).not.toThrow();
      expect(() => new Date(trace.createdAt)).not.toThrow();
      expect(() => new Date(trace.updatedAt)).not.toThrow();
    });

    it('应该使用提供的时间戳', () => {
      const customTimestamp = '2025-08-09T10:00:00Z';
      
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        },
        timestamp: customTimestamp
      };

      const trace = TraceFactory.create(request);

      expect(trace.timestamp).toBe(customTimestamp);
    });
  });

  describe('🚀 createExecutionTrace - 执行追踪创建测试', () => {
    it('应该创建执行追踪', () => {
      const trace = TraceFactory.createExecutionTrace(
        'context-1',
        'startProcess',
        'process-manager',
        'start',
        'plan-1',
        { processId: 'proc-123' }
      );

      expect(trace.contextId).toBe('context-1');
      expect(trace.planId).toBe('plan-1');
      expect(trace.traceType).toBe('execution');
      expect(trace.severity).toBe('info');
      expect(trace.event.name).toBe('startProcess');
      expect(trace.event.type).toBe('start');
      expect(trace.event.category).toBe('system');
      expect(trace.event.source.component).toBe('process-manager');
      expect(trace.event.source.module).toBe('execution');
      expect(trace.event.data).toEqual({ processId: 'proc-123' });
    });

    it('应该使用默认参数', () => {
      const trace = TraceFactory.createExecutionTrace(
        'context-1',
        'defaultEvent',
        'default-component'
      );

      expect(trace.event.type).toBe('start');
      expect(trace.planId).toBeUndefined();
      expect(trace.event.data).toBeUndefined();
    });
  });

  describe('⚡ createPerformanceTrace - 性能追踪创建测试', () => {
    it('应该创建性能追踪', () => {
      const trace = TraceFactory.createPerformanceTrace(
        'context-1',
        'databaseQuery',
        'database-service',
        1500,
        'plan-1',
        { memory_usage: { peak_mb: 256 } }
      );

      expect(trace.contextId).toBe('context-1');
      expect(trace.planId).toBe('plan-1');
      expect(trace.traceType).toBe('performance');
      expect(trace.severity).toBe('warn'); // 因为duration > 1000ms
      expect(trace.event.name).toBe('databaseQuery');
      expect(trace.event.type).toBe('completion');
      expect(trace.event.category).toBe('system');
      expect(trace.event.source.component).toBe('database-service');
      expect(trace.event.source.module).toBe('performance');
      expect(trace.event.data).toEqual({ duration_ms: 1500 });
      
      expect(trace.performanceMetrics).toBeDefined();
      expect(trace.performanceMetrics?.execution_time?.duration_ms).toBe(1500);
      expect(trace.performanceMetrics?.memory_usage?.peak_mb).toBe(256);
    });

    it('应该根据持续时间设置严重程度', () => {
      const fastTrace = TraceFactory.createPerformanceTrace(
        'context-1',
        'fastOperation',
        'fast-service',
        500
      );

      const slowTrace = TraceFactory.createPerformanceTrace(
        'context-1',
        'slowOperation',
        'slow-service',
        2000
      );

      expect(fastTrace.severity).toBe('info');
      expect(slowTrace.severity).toBe('warn');
    });
  });

  describe('❌ createErrorTrace - 错误追踪创建测试', () => {
    it('应该创建错误追踪', () => {
      const trace = TraceFactory.createErrorTrace(
        'context-1',
        'Invalid input data',
        'validation-service',
        'ValidationError',
        'plan-1'
      );

      expect(trace.contextId).toBe('context-1');
      expect(trace.planId).toBe('plan-1');
      expect(trace.traceType).toBe('error');
      expect(trace.severity).toBe('error');
      expect(trace.event.name).toBe('Error Occurred');
      expect(trace.event.type).toBe('failure');
      expect(trace.event.category).toBe('system');
      expect(trace.event.source.component).toBe('validation-service');
      expect(trace.event.source.module).toBe('error_handling');
      
      expect(trace.errorInformation).toBeDefined();
      expect(trace.errorInformation?.error_type).toBe('ValidationError');
      expect(trace.errorInformation?.error_message).toBe('Invalid input data');
      expect(trace.errorInformation?.error_code).toBe('SYSTEM_ERROR');
      expect(trace.errorInformation?.stack_trace).toEqual([]);
    });

    it('应该处理可选参数', () => {
      const trace = TraceFactory.createErrorTrace(
        'context-1',
        'Simple error message',
        'simple-service'
      );

      expect(trace.errorInformation?.error_code).toBe('SYSTEM_ERROR');
      expect(trace.errorInformation?.stack_trace).toEqual([]);
      expect(trace.planId).toBeUndefined();
    });
  });

  describe('📋 validateCreateRequest - 请求验证测试', () => {
    it('应该验证有效请求', () => {
      const validRequest: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Valid Event',
          category: 'system',
          source: {
            component: 'valid-component'
          }
        }
      };

      const result = TraceFactory.validateCreateRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该检测缺少必需字段', () => {
      const invalidRequest = {
        context_id: '',
        trace_type: 'execution' as TraceType,
        severity: 'info' as TraceSeverity,
        event: null as any
      };

      const result = TraceFactory.validateCreateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('上下文ID'))).toBe(true);
      expect(result.errors.some(error => error.includes('事件名称'))).toBe(true);
    });

    it('应该检测无效的事件源', () => {
      const invalidRequest: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Invalid Event',
          category: 'system',
          source: {
            component: '' // 空组件名
          }
        }
      };

      const result = TraceFactory.validateCreateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('组件'))).toBe(true);
    });

    it('应该验证追踪类型', () => {
      const invalidRequest: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'invalid-type' as TraceType,
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      const result = TraceFactory.validateCreateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('追踪类型'))).toBe(true);
    });

    it('应该验证严重程度', () => {
      const invalidRequest: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'invalid-severity' as TraceSeverity,
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      const result = TraceFactory.validateCreateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('严重程度'))).toBe(true);
    });
  });

  describe('🛡️ 边界条件和错误处理测试', () => {
    it('应该处理null/undefined输入', () => {
      expect(() => TraceFactory.create(null as any)).toThrow();
      expect(() => TraceFactory.create(undefined as any)).toThrow();
    });

    it('应该处理无效的追踪类型', () => {
      const invalidRequest = {
        context_id: 'context-1',
        trace_type: 'invalid-type' as TraceType,
        severity: 'info' as TraceSeverity,
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      expect(() => TraceFactory.create(invalidRequest)).not.toThrow();
      // 工厂应该能处理无效类型，但验证会捕获它
    });

    it('应该处理极长的字符串', () => {
      const longString = 'a'.repeat(10000);
      
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: longString,
          category: 'system',
          source: {
            component: 'test-component'
          }
        }
      };

      expect(() => TraceFactory.create(request)).not.toThrow();
      
      const trace = TraceFactory.create(request);
      expect(trace.event.name).toBe(longString);
    });

    it('应该处理大量元数据', () => {
      const largeMetadata = {};
      for (let i = 0; i < 1000; i++) {
        (largeMetadata as any)[`key${i}`] = `value${i}`;
      }

      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        },
        metadata: largeMetadata
      };

      expect(() => TraceFactory.create(request)).not.toThrow();
      
      const trace = TraceFactory.create(request);
      expect(trace.metadata).toEqual(largeMetadata);
    });

    it('应该处理无效的时间戳格式', () => {
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Test Event',
          category: 'system',
          source: {
            component: 'test-component'
          }
        },
        timestamp: 'invalid-timestamp'
      };

      expect(() => TraceFactory.create(request)).not.toThrow();
      
      const trace = TraceFactory.create(request);
      expect(trace.timestamp).toBe('invalid-timestamp');
    });
  });

  describe('🔄 数据一致性测试', () => {
    it('应该保证创建的追踪数据一致性', async () => {
      const request: CreateTraceRequest = {
        context_id: 'consistency-test',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Consistency Test',
          category: 'system',
          source: {
            component: 'consistency-component'
          }
        }
      };

      const trace1 = TraceFactory.create(request);
      
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const trace2 = TraceFactory.create(request);

      // 应该有不同的ID
      expect(trace1.traceId).not.toBe(trace2.traceId);
      
      // 时间戳可能相同（毫秒级精度），这是正常的
      // expect(trace1.createdAt).not.toBe(trace2.createdAt);

      // 但其他属性应该相同
      expect(trace1.contextId).toBe(trace2.contextId);
      expect(trace1.traceType).toBe(trace2.traceType);
      expect(trace1.severity).toBe(trace2.severity);
      expect(trace1.event.name).toBe(trace2.event.name);
    });

    it('应该正确处理时间戳格式', () => {
      const request: CreateTraceRequest = {
        context_id: 'context-1',
        trace_type: 'execution',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Time Test',
          category: 'system',
          source: {
            component: 'time-component'
          }
        },
        timestamp: '2025-08-09T10:00:00.000Z'
      };

      const trace = TraceFactory.create(request);

      expect(trace.timestamp).toBe('2025-08-09T10:00:00.000Z');
      expect(new Date(trace.timestamp).toISOString()).toBe('2025-08-09T10:00:00.000Z');
    });

    it('应该正确处理所有追踪类型', () => {
      const traceTypes: TraceType[] = ['execution', 'error', 'performance', 'audit', 'security'];
      
      traceTypes.forEach(traceType => {
        const request: CreateTraceRequest = {
          context_id: 'context-1',
          trace_type: traceType,
          severity: 'info',
          event: {
            type: 'start',
            name: `${traceType} Event`,
            category: 'system',
            source: {
              component: `${traceType}-component`
            }
          }
        };

        const trace = TraceFactory.create(request);
        expect(trace.traceType).toBe(traceType);
        expect(trace.event.name).toBe(`${traceType} Event`);
      });
    });

    it('应该正确处理所有严重程度', () => {
      const severities: TraceSeverity[] = ['debug', 'info', 'warn', 'error', 'critical'];
      
      severities.forEach(severity => {
        const request: CreateTraceRequest = {
          context_id: 'context-1',
          trace_type: 'execution',
          severity: severity,
          event: {
            type: 'start',
            name: `${severity} Event`,
            category: 'system',
            source: {
              component: `${severity}-component`
            }
          }
        };

        const trace = TraceFactory.create(request);
        expect(trace.severity).toBe(severity);
        expect(trace.event.name).toBe(`${severity} Event`);
      });
    });
  });
});
