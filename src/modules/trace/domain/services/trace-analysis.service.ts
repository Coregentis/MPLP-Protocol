/**
 * Trace分析服务
 * 
 * 提供追踪分析和关联的领域服务
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Trace } from '../entities/trace.entity';
import { 
  TraceType, 
  TraceSeverity, 
  Correlation, 
  CorrelationType,
  PerformanceMetrics 
} from '../../types';

/**
 * 分析结果
 */
export interface AnalysisResult {
  summary: {
    total_traces: number;
    error_count: number;
    warning_count: number;
    performance_issues: number;
  };
  patterns: TracePattern[];
  recommendations: string[];
}

/**
 * 追踪模式
 */
export interface TracePattern {
  pattern_type: 'error_cluster' | 'performance_degradation' | 'frequent_events' | 'correlation_chain';
  description: string;
  traces: UUID[];
  severity: TraceSeverity;
  confidence: number;
}

/**
 * 性能分析结果
 */
export interface PerformanceAnalysis {
  average_duration: number;
  median_duration: number;
  p95_duration: number;
  slowest_operations: {
    trace_id: UUID;
    duration_ms: number;
    operation: string;
  }[];
  bottlenecks: string[];
}

/**
 * Trace分析服务
 */
export class TraceAnalysisService {
  /**
   * 分析追踪集合
   */
  analyzeTraces(traces: Trace[]): AnalysisResult {
    const summary = this.generateSummary(traces);
    const patterns = this.detectPatterns(traces);
    const recommendations = this.generateRecommendations(traces, patterns);

    return {
      summary,
      patterns,
      recommendations
    };
  }

  /**
   * 检测追踪关联
   */
  detectCorrelations(trace: Trace, allTraces: Trace[]): Correlation[] {
    const correlations: Correlation[] = [];

    for (const otherTrace of allTraces) {
      if (otherTrace.traceId === trace.traceId) continue;

      // 时间关联检测
      const temporalCorrelation = this.detectTemporalCorrelation(trace, otherTrace);
      if (temporalCorrelation) {
        correlations.push(temporalCorrelation);
      }

      // 因果关联检测
      const causalCorrelation = this.detectCausalCorrelation(trace, otherTrace);
      if (causalCorrelation) {
        correlations.push(causalCorrelation);
      }

      // 逻辑关联检测
      const logicalCorrelation = this.detectLogicalCorrelation(trace, otherTrace);
      if (logicalCorrelation) {
        correlations.push(logicalCorrelation);
      }
    }

    return correlations;
  }

  /**
   * 性能分析
   */
  analyzePerformance(traces: Trace[]): PerformanceAnalysis {
    const performanceTraces = traces.filter(t => t.isPerformanceTrace());
    const durations = performanceTraces
      .map(t => t.getExecutionDuration())
      .filter(d => d !== undefined) as number[];

    if (durations.length === 0) {
      return {
        average_duration: 0,
        median_duration: 0,
        p95_duration: 0,
        slowest_operations: [],
        bottlenecks: []
      };
    }

    durations.sort((a, b) => a - b);

    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const median = durations[Math.floor(durations.length / 2)];
    const p95Index = Math.floor(durations.length * 0.95);
    const p95 = durations[p95Index];

    const slowestOperations = performanceTraces
      .filter(t => t.getExecutionDuration()! > p95)
      .map(t => ({
        trace_id: t.traceId,
        duration_ms: t.getExecutionDuration()!,
        operation: t.event.name
      }))
      .sort((a, b) => b.duration_ms - a.duration_ms)
      .slice(0, 10);

    const bottlenecks = this.identifyBottlenecks(performanceTraces);

    return {
      average_duration: average,
      median_duration: median,
      p95_duration: p95,
      slowest_operations: slowestOperations,
      bottlenecks
    };
  }

  /**
   * 生成摘要
   */
  private generateSummary(traces: Trace[]) {
    return {
      total_traces: traces.length,
      error_count: traces.filter(t => t.isError()).length,
      warning_count: traces.filter(t => t.severity === 'warn').length,
      performance_issues: traces.filter(t => this.hasPerformanceIssue(t)).length
    };
  }

  /**
   * 检测模式
   */
  private detectPatterns(traces: Trace[]): TracePattern[] {
    const patterns: TracePattern[] = [];

    // 检测错误聚集
    const errorClusters = this.detectErrorClusters(traces);
    patterns.push(...errorClusters);

    // 检测性能退化
    const performanceDegradation = this.detectPerformanceDegradation(traces);
    if (performanceDegradation) {
      patterns.push(performanceDegradation);
    }

    // 检测频繁事件
    const frequentEvents = this.detectFrequentEvents(traces);
    patterns.push(...frequentEvents);

    return patterns;
  }

  /**
   * 检测时间关联
   */
  private detectTemporalCorrelation(trace1: Trace, trace2: Trace): Correlation | null {
    const time1 = new Date(trace1.timestamp).getTime();
    const time2 = new Date(trace2.timestamp).getTime();
    const timeDiff = Math.abs(time1 - time2);

    // 如果时间差小于5秒，认为有时间关联
    if (timeDiff < 5000) {
      return {
        correlation_id: `temporal_${trace1.traceId}_${trace2.traceId}`,
        related_trace_id: trace2.traceId,
        type: 'temporal',
        strength: Math.max(0.1, 1 - timeDiff / 5000),
        description: `时间相近的追踪记录 (相差${timeDiff}ms)`
      };
    }

    return null;
  }

  /**
   * 检测因果关联
   */
  private detectCausalCorrelation(trace1: Trace, trace2: Trace): Correlation | null {
    // 简化的因果关联检测：如果一个是开始事件，另一个是完成事件
    if (trace1.event.type === 'start' && trace2.event.type === 'completion' &&
        trace1.event.source.component === trace2.event.source.component) {
      return {
        correlation_id: `causation_${trace1.traceId}_${trace2.traceId}`,
        related_trace_id: trace2.traceId,
        type: 'causation',
        strength: 0.8,
        description: '开始-完成事件对'
      };
    }

    return null;
  }

  /**
   * 检测逻辑关联
   */
  private detectLogicalCorrelation(trace1: Trace, trace2: Trace): Correlation | null {
    // 如果来自同一个组件且事件名称相似
    if (trace1.event.source.component === trace2.event.source.component &&
        this.calculateStringSimilarity(trace1.event.name, trace2.event.name) > 0.7) {
      return {
        correlation_id: `logical_${trace1.traceId}_${trace2.traceId}`,
        related_trace_id: trace2.traceId,
        type: 'logical',
        strength: 0.6,
        description: '相似的逻辑操作'
      };
    }

    return null;
  }

  /**
   * 检测错误聚集
   */
  private detectErrorClusters(traces: Trace[]): TracePattern[] {
    const errorTraces = traces.filter(t => t.isError());
    const clusters: TracePattern[] = [];

    // 按组件分组错误
    const errorsByComponent = new Map<string, Trace[]>();
    errorTraces.forEach(trace => {
      const component = trace.event.source.component;
      if (!errorsByComponent.has(component)) {
        errorsByComponent.set(component, []);
      }
      errorsByComponent.get(component)!.push(trace);
    });

    // 如果某个组件的错误数量超过阈值，认为是错误聚集
    errorsByComponent.forEach((componentErrors, component) => {
      if (componentErrors.length >= 3) {
        clusters.push({
          pattern_type: 'error_cluster',
          description: `组件 ${component} 出现错误聚集`,
          traces: componentErrors.map(t => t.traceId),
          severity: 'error',
          confidence: Math.min(1.0, componentErrors.length / 10)
        });
      }
    });

    return clusters;
  }

  /**
   * 检测性能退化
   */
  private detectPerformanceDegradation(traces: Trace[]): TracePattern | null {
    const performanceTraces = traces.filter(t => t.isPerformanceTrace());
    if (performanceTraces.length < 5) return null;

    // 简化的性能退化检测：比较前半部分和后半部分的平均执行时间
    const midPoint = Math.floor(performanceTraces.length / 2);
    const firstHalf = performanceTraces.slice(0, midPoint);
    const secondHalf = performanceTraces.slice(midPoint);

    const firstHalfAvg = this.calculateAverageDuration(firstHalf);
    const secondHalfAvg = this.calculateAverageDuration(secondHalf);

    if (secondHalfAvg > firstHalfAvg * 1.5) {
      return {
        pattern_type: 'performance_degradation',
        description: `性能退化：平均执行时间从 ${firstHalfAvg.toFixed(2)}ms 增加到 ${secondHalfAvg.toFixed(2)}ms`,
        traces: secondHalf.map(t => t.traceId),
        severity: 'warn',
        confidence: 0.7
      };
    }

    return null;
  }

  /**
   * 检测频繁事件
   */
  private detectFrequentEvents(traces: Trace[]): TracePattern[] {
    const eventCounts = new Map<string, { count: number; traces: UUID[] }>();

    traces.forEach(trace => {
      const eventKey = `${trace.event.source.component}:${trace.event.name}`;
      if (!eventCounts.has(eventKey)) {
        eventCounts.set(eventKey, { count: 0, traces: [] });
      }
      const entry = eventCounts.get(eventKey)!;
      entry.count++;
      entry.traces.push(trace.traceId);
    });

    const patterns: TracePattern[] = [];
    eventCounts.forEach((entry, eventKey) => {
      if (entry.count > 10) { // 阈值：超过10次认为是频繁事件
        patterns.push({
          pattern_type: 'frequent_events',
          description: `频繁事件：${eventKey} 出现 ${entry.count} 次`,
          traces: entry.traces,
          severity: 'info',
          confidence: Math.min(1.0, entry.count / 50)
        });
      }
    });

    return patterns;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(traces: Trace[], patterns: TracePattern[]): string[] {
    const recommendations: string[] = [];

    const errorCount = traces.filter(t => t.isError()).length;
    if (errorCount > traces.length * 0.1) {
      recommendations.push('错误率较高，建议检查系统稳定性');
    }

    const performanceIssues = traces.filter(t => this.hasPerformanceIssue(t)).length;
    if (performanceIssues > 0) {
      recommendations.push('发现性能问题，建议优化慢操作');
    }

    patterns.forEach(pattern => {
      switch (pattern.pattern_type) {
        case 'error_cluster':
          recommendations.push(`建议重点关注 ${pattern.description} 中的组件`);
          break;
        case 'performance_degradation':
          recommendations.push('建议分析性能退化原因并进行优化');
          break;
      }
    });

    return recommendations;
  }

  /**
   * 检查是否有性能问题
   */
  private hasPerformanceIssue(trace: Trace): boolean {
    const duration = trace.getExecutionDuration();
    return duration !== undefined && duration > 1000; // 超过1秒认为是性能问题
  }

  /**
   * 计算字符串相似度
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 计算平均持续时间
   */
  private calculateAverageDuration(traces: Trace[]): number {
    const durations = traces
      .map(t => t.getExecutionDuration())
      .filter(d => d !== undefined) as number[];
    
    if (durations.length === 0) return 0;
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  /**
   * 识别瓶颈
   */
  private identifyBottlenecks(traces: Trace[]): string[] {
    const componentDurations = new Map<string, number[]>();
    
    traces.forEach(trace => {
      const component = trace.event.source.component;
      const duration = trace.getExecutionDuration();
      if (duration !== undefined) {
        if (!componentDurations.has(component)) {
          componentDurations.set(component, []);
        }
        componentDurations.get(component)!.push(duration);
      }
    });

    const bottlenecks: string[] = [];
    componentDurations.forEach((durations, component) => {
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      if (avgDuration > 500) { // 平均超过500ms认为是瓶颈
        bottlenecks.push(`${component} (平均 ${avgDuration.toFixed(2)}ms)`);
      }
    });

    return bottlenecks.sort();
  }
}
