/**
 * MPLP默认指标分析器实现
 *
 * 提供基础的指标分析能力，包括统计汇总、异常检测和趋势分析。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:50:00+08:00
 */

import { 
  IMetricAnalyzer, 
  IMetric, 
  AnalysisOptions, 
  AnalysisResult,
  AnomalyDetectionOptions,
  AnomalyResult,
  TrendOptions,
  TrendResult,
  AggregationType
} from '../interfaces';

/**
 * 默认指标分析器实现
 */
export class DefaultMetricAnalyzer implements IMetricAnalyzer {
  /**
   * 分析指标
   * @param metrics 指标列表
   * @param options 分析选项
   * @returns 分析结果
   */
  public analyze(metrics: IMetric[], options?: AnalysisOptions): AnalysisResult {
    if (metrics.length === 0) {
      return this.createEmptyResult();
    }
    
    // 提取数值
    const values = metrics.map(m => this.extractNumericValue(m)).filter(v => v !== null) as number[];
    
    if (values.length === 0) {
      return this.createEmptyResult();
    }
    
    // 计算基本统计量
    const count = values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, v) => sum + v, 0) / count;
    
    // 排序用于计算中位数和百分位数
    const sortedValues = [...values].sort((a, b) => a - b);
    const medianValue = this.calculatePercentile(sortedValues, 0.5);
    const p95Value = this.calculatePercentile(sortedValues, 0.95);
    const p99Value = this.calculatePercentile(sortedValues, 0.99);
    
    const result: AnalysisResult = {
      summary: {
        count,
        minValue,
        maxValue,
        avgValue,
        medianValue,
        p95Value,
        p99Value
      }
    };
    
    // 按标签分组
    if (options?.groupBy && options.groupBy.length > 0) {
      result.groups = this.groupByTags(metrics, options.groupBy);
    }
    
    // 与基准指标比较
    if (options?.compareWith && options.compareWith.length > 0) {
      const compareResult = this.analyze(options.compareWith);
      const baselineAvg = compareResult.summary.avgValue;
      
      result.comparison = {
        diff: avgValue - baselineAvg,
        percentage: baselineAvg !== 0 ? (avgValue - baselineAvg) / baselineAvg * 100 : 0
      };
    }
    
    return result;
  }
  
  /**
   * 检测异常
   * @param metrics 指标列表
   * @param options 异常检测选项
   * @returns 异常结果列表
   */
  public detectAnomalies(metrics: IMetric[], options?: AnomalyDetectionOptions): AnomalyResult[] {
    if (metrics.length === 0) {
      return [];
    }
    
    // 默认灵敏度
    const sensitivity = options?.sensitivity || 0.8;
    
    // 获取基准指标
    const baselineMetrics = options?.baselineMetrics || metrics;
    
    // 分析基准指标，计算均值和标准差
    const baselineValues = baselineMetrics.map(m => this.extractNumericValue(m)).filter(v => v !== null) as number[];
    
    if (baselineValues.length === 0) {
      return [];
    }
    
    const mean = baselineValues.reduce((sum, v) => sum + v, 0) / baselineValues.length;
    const variance = baselineValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / baselineValues.length;
    const stdDev = Math.sqrt(variance);
    
    // 如果标准差接近0，可能没有足够的变化来检测异常
    if (stdDev < 0.0001) {
      return [];
    }
    
    // 根据灵敏度计算阈值（Z-score）
    // 灵敏度越高，阈值越低，检测到的异常越多
    const threshold = 3 * (1 - sensitivity) + 1;
    
    // 检测异常
    const anomalies: AnomalyResult[] = [];
    
    for (const metric of metrics) {
      const value = this.extractNumericValue(metric);
      
      if (value === null) {
        continue;
      }
      
      // 计算Z-score
      const zScore = Math.abs(value - mean) / stdDev;
      
      if (zScore > threshold) {
        // 确定异常严重程度
        let severity: 'low' | 'medium' | 'high' | 'critical';
        
        if (zScore < threshold * 1.5) {
          severity = 'low';
        } else if (zScore < threshold * 2) {
          severity = 'medium';
        } else if (zScore < threshold * 3) {
          severity = 'high';
        } else {
          severity = 'critical';
        }
        
        anomalies.push({
          metricName: metric.name,
          timestamp: metric.timestamp,
          expectedValue: mean,
          actualValue: value,
          deviation: zScore,
          severity
        });
      }
    }
    
    return anomalies;
  }
  
  /**
   * 计算趋势
   * @param metrics 指标列表
   * @param options 趋势选项
   * @returns 趋势结果
   */
  public calculateTrend(metrics: IMetric[], options?: TrendOptions): TrendResult {
    if (metrics.length < 2) {
      return {
        slope: 0,
        direction: 'stable'
      };
    }
    
    // 按时间戳排序
    const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);
    
    // 提取时间和值
    const times: number[] = [];
    const values: number[] = [];
    
    for (const metric of sortedMetrics) {
      const value = this.extractNumericValue(metric);
      
      if (value !== null) {
        times.push(metric.timestamp);
        values.push(value);
      }
    }
    
    if (values.length < 2) {
      return {
        slope: 0,
        direction: 'stable'
      };
    }
    
    // 归一化时间，使其从0开始
    const minTime = Math.min(...times);
    const normalizedTimes = times.map(t => (t - minTime) / 1000); // 转换为秒
    
    // 计算趋势（简单线性回归）
    const { slope, intercept } = this.linearRegression(normalizedTimes, values);
    
    // 确定趋势方向
    let direction: 'up' | 'down' | 'stable';
    if (slope > 0.001) {
      direction = 'up';
    } else if (slope < -0.001) {
      direction = 'down';
    } else {
      direction = 'stable';
    }
    
    // 预测未来值
    let forecast: number[] | undefined;
    
    if (options?.forecastPeriods && options.forecastPeriods > 0) {
      forecast = [];
      const lastTime = normalizedTimes[normalizedTimes.length - 1];
      const timeStep = lastTime / normalizedTimes.length; // 平均时间间隔
      
      for (let i = 1; i <= options.forecastPeriods; i++) {
        const futureTime = lastTime + i * timeStep;
        const predictedValue = slope * futureTime + intercept;
        forecast.push(predictedValue);
      }
    }
    
    // 计算置信度（R²）
    const rSquared = this.calculateRSquared(normalizedTimes, values, slope, intercept);
    
    return {
      slope,
      direction,
      forecast,
      confidence: rSquared
    };
  }
  
  /**
   * 提取指标的数值
   * @param metric 指标
   * @returns 数值，如果无法提取则返回null
   */
  private extractNumericValue(metric: IMetric): number | null {
    if (typeof metric.value === 'number') {
      return metric.value;
    }
    
    if (Array.isArray(metric.value)) {
      // 对于数组，计算平均值
      const numValues = metric.value as unknown[];
      if (numValues.length > 0) {
        const numericValues = numValues
          .filter((v): v is number => typeof v === 'number');
        if (numericValues.length > 0) {
          return numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
        }
      }
    }
    
    // 尝试转换为数字
    const numValue = Number(metric.value);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    return null;
  }
  
  /**
   * 创建空的分析结果
   * @returns 空的分析结果
   */
  private createEmptyResult(): AnalysisResult {
    return {
      summary: {
        count: 0,
        minValue: 0,
        maxValue: 0,
        avgValue: 0,
        medianValue: 0,
        p95Value: 0,
        p99Value: 0
      }
    };
  }
  
  /**
   * 计算百分位数
   * @param sortedValues 已排序的值
   * @param percentile 百分位数（0-1）
   * @returns 百分位数值
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) {
      return 0;
    }
    
    if (percentile <= 0) {
      return sortedValues[0];
    }
    
    if (percentile >= 1) {
      return sortedValues[sortedValues.length - 1];
    }
    
    const index = percentile * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedValues[lower];
    }
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
  
  /**
   * 按标签分组
   * @param metrics 指标列表
   * @param groupBy 分组标签
   * @returns 分组结果
   */
  private groupByTags(metrics: IMetric[], groupBy: string[]): Record<string, AnalysisResult> {
    const groups: Record<string, IMetric[]> = {};
    
    // 按标签分组
    for (const metric of metrics) {
      if (!metric.tags) {
        continue;
      }
      
      // 构建分组键
      const groupKeys = groupBy.map(tag => {
        const value = metric.tags![tag];
        return value !== undefined ? `${tag}:${value}` : null;
      }).filter(key => key !== null);
      
      if (groupKeys.length === 0) {
        continue;
      }
      
      const groupKey = groupKeys.join(',');
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(metric);
    }
    
    // 对每个分组进行分析
    const result: Record<string, AnalysisResult> = {};
    
    for (const [key, groupMetrics] of Object.entries(groups)) {
      result[key] = this.analyze(groupMetrics);
    }
    
    return result;
  }
  
  /**
   * 线性回归
   * @param x x值（自变量）
   * @param y y值（因变量）
   * @returns 斜率和截距
   */
  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    
    // 计算均值
    const meanX = x.reduce((sum, v) => sum + v, 0) / n;
    const meanY = y.reduce((sum, v) => sum + v, 0) / n;
    
    // 计算斜率
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) * (x[i] - meanX);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    // 计算截距
    const intercept = meanY - slope * meanX;
    
    return { slope, intercept };
  }
  
  /**
   * 计算R²（决定系数）
   * @param x x值
   * @param y y值
   * @param slope 斜率
   * @param intercept 截距
   * @returns R²值
   */
  private calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
    const n = x.length;
    
    // 计算y的均值
    const meanY = y.reduce((sum, v) => sum + v, 0) / n;
    
    // 计算总平方和（SST）
    let sst = 0;
    for (let i = 0; i < n; i++) {
      sst += Math.pow(y[i] - meanY, 2);
    }
    
    // 计算残差平方和（SSE）
    let sse = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      sse += Math.pow(y[i] - predicted, 2);
    }
    
    // 计算R²
    return sst !== 0 ? 1 - sse / sst : 0;
  }
} 