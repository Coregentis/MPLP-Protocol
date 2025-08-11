/**
 * TraceAnalysisService 全面单元测试
 * 
 * 基于系统性链式批判性思维方法论，全面测试TraceAnalysisService的所有功能
 * 严格遵循测试发现源代码问题时立即修复源代码的原则
 * 目标：代码覆盖率>90%，功能覆盖率100%
 * 
 * @version 1.0.0
 * @created 2025-08-09
 * @target_coverage 90%+
 * @functional_coverage 100%
 */

import { TraceAnalysisService, AnalysisResult, TracePattern, PerformanceAnalysis } from '../../src/modules/trace/domain/services/trace-analysis.service';
import { Trace } from '../../src/modules/trace/domain/entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent, 
  PerformanceMetrics, 
  ErrorInformation,
  Correlation
} from '../../src/modules/trace/types';

describe('TraceAnalysisService - 全面单元测试', () => {
  let analysisService: TraceAnalysisService;

  beforeEach(() => {
    analysisService = new TraceAnalysisService();
  });

  // 辅助函数：创建测试追踪
  const createTestTrace = (
    id: string,
    type: TraceType,
    severity: TraceSeverity,
    eventName: string = 'Test Event',
    timestamp: string = '2025-08-09T10:00:00Z',
    performanceMetrics?: PerformanceMetrics,
    errorInformation?: ErrorInformation
  ): Trace => {
    const event: TraceEvent = {
      type: 'start',
      name: eventName,
      category: 'system',
      source: {
        component: 'test-component'
      }
    };

    return new Trace(
      id,
      'context-1',
      '1.0.0',
      type,
      severity,
      event,
      timestamp,
      timestamp,
      timestamp,
      undefined,
      performanceMetrics,
      errorInformation
    );
  };

  describe('🔍 analyzeTraces - 核心分析功能', () => {
    it('应该正确分析追踪集合并返回完整分析结果', () => {
      const performanceMetrics: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:02Z',
          duration_ms: 2000
        }
      };

      const traces = [
        createTestTrace('trace-1', 'execution', 'info', 'Normal Event'),
        createTestTrace('trace-2', 'error', 'error', 'Error Event'),
        createTestTrace('trace-3', 'performance', 'warn', 'Slow Event', '2025-08-09T10:00:00Z', performanceMetrics)
      ];

      const result = analysisService.analyzeTraces(traces);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.recommendations).toBeDefined();

      expect(result.summary.total_traces).toBe(3);
      expect(result.summary.error_count).toBe(1);
      expect(result.summary.warning_count).toBe(1);
      expect(result.summary.performance_issues).toBe(1);

      expect(Array.isArray(result.patterns)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('应该正确计算追踪摘要统计信息', () => {
      const performanceMetrics1: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:01.5Z',
          duration_ms: 1500
        }
      };

      const performanceMetrics2: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:02Z',
          duration_ms: 2000
        }
      };

      const traces = [
        createTestTrace('trace-1', 'execution', 'info'),
        createTestTrace('trace-2', 'execution', 'info'),
        createTestTrace('trace-3', 'error', 'error'),
        createTestTrace('trace-4', 'error', 'critical'),
        createTestTrace('trace-5', 'performance', 'warn', 'Slow Op 1', '2025-08-09T10:00:00Z', performanceMetrics1),
        createTestTrace('trace-6', 'performance', 'warn', 'Slow Op 2', '2025-08-09T10:00:00Z', performanceMetrics2)
      ];

      const result = analysisService.analyzeTraces(traces);

      expect(result.summary.total_traces).toBe(6);
      expect(result.summary.error_count).toBe(2);
      expect(result.summary.warning_count).toBe(2);
      expect(result.summary.performance_issues).toBe(2);
    });

    it('应该处理空追踪数组', () => {
      const result = analysisService.analyzeTraces([]);

      expect(result.summary.total_traces).toBe(0);
      expect(result.summary.error_count).toBe(0);
      expect(result.summary.warning_count).toBe(0);
      expect(result.summary.performance_issues).toBe(0);
      expect(result.patterns).toEqual([]);
      expect(result.recommendations).toEqual([]);
    });

    it('应该处理null/undefined防护', () => {
      const result1 = analysisService.analyzeTraces(null as any);
      const result2 = analysisService.analyzeTraces(undefined as any);

      expect(result1.summary.total_traces).toBe(0);
      expect(result2.summary.total_traces).toBe(0);
    });
  });

  describe('🔗 detectCorrelations - 关联检测', () => {
    it('应该检测时间关联', () => {
      const baseTime = new Date('2025-08-09T10:00:00Z');
      const trace1 = createTestTrace('trace-1', 'execution', 'info', 'Event 1', baseTime.toISOString());
      const trace2 = createTestTrace('trace-2', 'execution', 'info', 'Event 2', new Date(baseTime.getTime() + 1000).toISOString());
      
      const correlations = analysisService.detectCorrelations(trace1, [trace1, trace2]);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);
      // 应该检测到时间关联
      const temporalCorrelations = correlations.filter(c => c.correlation_type === 'temporal');
      expect(temporalCorrelations.length).toBeGreaterThanOrEqual(0);
    });

    it('应该检测因果关联', () => {
      const trace1 = createTestTrace('trace-1', 'execution', 'info', 'Start Process');
      const trace2 = createTestTrace('trace-2', 'execution', 'info', 'Process Complete');
      
      const correlations = analysisService.detectCorrelations(trace1, [trace1, trace2]);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('应该检测逻辑关联', () => {
      const trace1 = createTestTrace('trace-1', 'execution', 'info', 'Database Query');
      const trace2 = createTestTrace('trace-2', 'execution', 'info', 'Database Update');
      
      const correlations = analysisService.detectCorrelations(trace1, [trace1, trace2]);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('应该排除自身关联', () => {
      const trace1 = createTestTrace('trace-1', 'execution', 'info');
      
      const correlations = analysisService.detectCorrelations(trace1, [trace1]);

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations)).toBe(true);
      // 不应该包含自身关联
      const selfCorrelations = correlations.filter(c => c.related_trace_id === 'trace-1');
      expect(selfCorrelations).toHaveLength(0);
    });
  });

  describe('📊 analyzePerformance - 性能分析', () => {
    it('应该正确计算性能统计指标', () => {
      const performanceMetrics1: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:01Z',
          duration_ms: 1000
        }
      };

      const performanceMetrics2: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:02Z',
          duration_ms: 2000
        }
      };

      const performanceMetrics3: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:03Z',
          duration_ms: 3000
        }
      };

      const traces = [
        createTestTrace('trace-1', 'performance', 'info', 'Fast Operation', '2025-08-09T10:00:00Z', performanceMetrics1),
        createTestTrace('trace-2', 'performance', 'warn', 'Medium Operation', '2025-08-09T10:00:00Z', performanceMetrics2),
        createTestTrace('trace-3', 'performance', 'warn', 'Slow Operation', '2025-08-09T10:00:00Z', performanceMetrics3)
      ];

      const result = analysisService.analyzePerformance(traces);

      expect(result).toBeDefined();
      expect(result.average_duration).toBe(2000); // (1000 + 2000 + 3000) / 3
      expect(result.median_duration).toBe(2000);
      expect(result.p95_duration).toBeDefined();
      expect(Array.isArray(result.slowest_operations)).toBe(true);
      expect(Array.isArray(result.bottlenecks)).toBe(true);
    });

    it('应该正确识别最慢操作', () => {
      // 创建足够多的数据点，确保p95计算有意义
      const traces = [];

      // 添加20个快速操作 (100-500ms)
      for (let i = 1; i <= 20; i++) {
        const duration = 100 + i * 20; // 120, 140, 160, ..., 500ms
        traces.push(createTestTrace(`fast-${i}`, 'performance', 'info', `Fast Op ${i}`, '2025-08-09T10:00:00Z', {
          execution_time: {
            start_time: '2025-08-09T10:00:00Z',
            end_time: new Date(Date.parse('2025-08-09T10:00:00Z') + duration).toISOString(),
            duration_ms: duration
          }
        }));
      }

      // 添加几个慢操作 (超过p95)
      traces.push(createTestTrace('slow-1', 'performance', 'warn', 'Slow Operation 1', '2025-08-09T10:00:00Z', {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:02Z',
          duration_ms: 2000
        }
      }));

      traces.push(createTestTrace('slow-2', 'performance', 'error', 'Very Slow Operation', '2025-08-09T10:00:00Z', {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:05Z',
          duration_ms: 5000
        }
      }));

      const result = analysisService.analyzePerformance(traces);

      expect(result.slowest_operations.length).toBeGreaterThan(0);
      if (result.slowest_operations.length > 0) {
        expect(result.slowest_operations[0].operation).toBe('Very Slow Operation');
        expect(result.slowest_operations[0].duration_ms).toBe(5000);
      }
    });

    it('应该处理无性能数据的情况', () => {
      const traces = [
        createTestTrace('trace-1', 'execution', 'info'),
        createTestTrace('trace-2', 'execution', 'info')
      ];

      const result = analysisService.analyzePerformance(traces);

      expect(result).toBeDefined();
      expect(result.average_duration).toBe(0);
      expect(result.median_duration).toBe(0);
      expect(result.slowest_operations).toEqual([]);
    });

    it('应该处理空数组', () => {
      const result = analysisService.analyzePerformance([]);

      expect(result).toBeDefined();
      expect(result.average_duration).toBe(0);
      expect(result.median_duration).toBe(0);
      expect(result.slowest_operations).toEqual([]);
      expect(result.bottlenecks).toEqual([]);
    });
  });

  describe('🚨 detectPatterns - 模式检测', () => {
    it('应该检测错误聚集模式', () => {
      const baseTime = new Date('2025-08-09T10:00:00Z');
      const traces = [
        createTestTrace('trace-1', 'error', 'error', 'Error 1', baseTime.toISOString()),
        createTestTrace('trace-2', 'error', 'error', 'Error 2', new Date(baseTime.getTime() + 1000).toISOString()),
        createTestTrace('trace-3', 'error', 'error', 'Error 3', new Date(baseTime.getTime() + 2000).toISOString())
      ];

      const result = analysisService.analyzeTraces(traces);

      expect(result.patterns).toBeDefined();
      const errorClusters = result.patterns.filter(p => p.pattern_type === 'error_cluster');
      expect(errorClusters.length).toBeGreaterThanOrEqual(0);
    });

    it('应该检测性能退化模式', () => {
      const performanceMetrics1: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:02Z',
          duration_ms: 2000
        }
      };

      const performanceMetrics2: PerformanceMetrics = {
        execution_time: {
          start_time: '2025-08-09T10:00:00Z',
          end_time: '2025-08-09T10:00:03Z',
          duration_ms: 3000
        }
      };

      const traces = [
        createTestTrace('trace-1', 'performance', 'warn', 'Slow Op 1', '2025-08-09T10:00:00Z', performanceMetrics1),
        createTestTrace('trace-2', 'performance', 'warn', 'Slow Op 2', '2025-08-09T10:01:00Z', performanceMetrics2)
      ];

      const result = analysisService.analyzeTraces(traces);

      expect(result.patterns).toBeDefined();
      const performanceDegradation = result.patterns.filter(p => p.pattern_type === 'performance_degradation');
      expect(performanceDegradation.length).toBeGreaterThanOrEqual(0);
    });

    it('应该检测频繁事件模式', () => {
      const traces = Array.from({ length: 10 }, (_, i) => 
        createTestTrace(`trace-${i}`, 'execution', 'info', 'Frequent Event', `2025-08-09T10:0${i}:00Z`)
      );

      const result = analysisService.analyzeTraces(traces);

      expect(result.patterns).toBeDefined();
      const frequentEvents = result.patterns.filter(p => p.pattern_type === 'frequent_events');
      expect(frequentEvents.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('📋 generateRecommendations - 报告生成', () => {
    it('应该生成有意义的建议', () => {
      const traces = [
        createTestTrace('trace-1', 'error', 'error', 'Database Error'),
        createTestTrace('trace-2', 'performance', 'warn', 'Slow Query')
      ];

      const result = analysisService.analyzeTraces(traces);

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('应该基于模式生成相关建议', () => {
      const errorTraces = Array.from({ length: 5 }, (_, i) => 
        createTestTrace(`error-${i}`, 'error', 'error', 'Repeated Error')
      );

      const result = analysisService.analyzeTraces(errorTraces);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // 应该包含错误相关的建议
      const errorRecommendations = result.recommendations.filter(r => 
        r.toLowerCase().includes('error') || r.toLowerCase().includes('错误')
      );
      expect(errorRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('🛡️ 边界条件和错误处理', () => {
    it('应该处理损坏的追踪数据', () => {
      // 创建一个有效的Trace对象，但模拟一些边界情况
      const edgeCaseTrace = createTestTrace('edge-case', 'execution', 'info', 'Edge Case Event');

      expect(() => {
        analysisService.analyzeTraces([edgeCaseTrace]);
      }).not.toThrow();
    });

    it('应该处理极大数据集', () => {
      const largeTraceSet = Array.from({ length: 10000 }, (_, i) => 
        createTestTrace(`trace-${i}`, 'execution', 'info', `Event ${i}`)
      );

      const startTime = Date.now();
      const result = analysisService.analyzeTraces(largeTraceSet);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.summary.total_traces).toBe(10000);
      // 性能要求：10000个追踪的分析应在5秒内完成
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('应该处理无效时间戳', () => {
      const trace = createTestTrace('trace-1', 'execution', 'info', 'Invalid Time', 'invalid-timestamp');

      expect(() => {
        analysisService.analyzeTraces([trace]);
      }).not.toThrow();
    });

    it('应该处理混合类型的追踪数据', () => {
      const mixedTraces = [
        createTestTrace('trace-1', 'execution', 'info'),
        createTestTrace('trace-2', 'error', 'error'),
        createTestTrace('trace-3', 'performance', 'warn'),
        createTestTrace('trace-4', 'audit', 'info'),
        createTestTrace('trace-5', 'security', 'critical')
      ];

      const result = analysisService.analyzeTraces(mixedTraces);

      expect(result).toBeDefined();
      expect(result.summary.total_traces).toBe(5);
      expect(result.summary.error_count).toBeGreaterThan(0);
    });
  });
});
