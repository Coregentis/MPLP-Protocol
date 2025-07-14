/**
 * MPLP默认基准测试执行器
 *
 * 提供基准测试用例的执行、结果收集和分析功能。
 * 实现IBenchmarkRunner接口，支持单个和批量测试用例执行。
 *
 * @version v1.0.0
 * @created 2025-07-17T09:30:00+08:00
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import {
  IBenchmarkRunner,
  IBenchmarkCase,
  BenchmarkContext,
  BenchmarkResult,
  BenchmarkType,
  BenchmarkLevel,
  BenchmarkConfig
} from './interfaces';
import { BenchmarkCollector } from './benchmark-collector';
import { DefaultMetricAnalyzer } from '../analyzers/default-analyzer';

/**
 * 默认基准测试执行器
 */
export class DefaultBenchmarkRunner implements IBenchmarkRunner {
  private cases: Map<string, IBenchmarkCase> = new Map();
  private collector: BenchmarkCollector;
  private analyzer: DefaultMetricAnalyzer;

  /**
   * 创建默认基准测试执行器
   */
  constructor() {
    this.collector = new BenchmarkCollector();
    this.analyzer = new DefaultMetricAnalyzer();
  }

  /**
   * 添加测试用例
   * @param benchCase 测试用例
   */
  public addCase(benchCase: IBenchmarkCase): void {
    if (!benchCase.config || !benchCase.config.name) {
      throw new Error('测试用例必须包含有效的配置和名称');
    }

    this.cases.set(benchCase.config.name, benchCase);
  }

  /**
   * 添加多个测试用例
   * @param benchCases 测试用例数组
   */
  public addCases(benchCases: IBenchmarkCase[]): void {
    benchCases.forEach(benchCase => this.addCase(benchCase));
  }

  /**
   * 移除测试用例
   * @param caseName 测试用例名称
   * @returns 是否成功移除
   */
  public removeCase(caseName: string): boolean {
    return this.cases.delete(caseName);
  }

  /**
   * 获取所有测试用例
   * @returns 所有测试用例
   */
  public getCases(): IBenchmarkCase[] {
    return Array.from(this.cases.values());
  }

  /**
   * 获取指定测试用例
   * @param caseName 测试用例名称
   * @returns 测试用例或undefined
   */
  public getCase(caseName: string): IBenchmarkCase | undefined {
    return this.cases.get(caseName);
  }

  /**
   * 执行单个测试用例
   * @param caseName 测试用例名称
   * @returns 测试结果
   */
  public async runCase(caseName: string): Promise<BenchmarkResult> {
    const benchCase = this.cases.get(caseName);
    if (!benchCase) {
      throw new Error(`测试用例 "${caseName}" 不存在`);
    }

    return this.executeCase(benchCase);
  }

  /**
   * 执行所有测试用例
   * @returns 所有测试结果
   */
  public async runAll(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    for (const benchCase of this.cases.values()) {
      const result = await this.executeCase(benchCase);
      results.push(result);
    }
    return results;
  }

  /**
   * 执行指定标签的测试用例
   * @param tags 标签数组
   * @returns 测试结果数组
   */
  public async runByTags(tags: string[]): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    for (const benchCase of this.cases.values()) {
      if (benchCase.config.tags && benchCase.config.tags.some(tag => tags.includes(tag))) {
        const result = await this.executeCase(benchCase);
        results.push(result);
      }
    }
    return results;
  }

  /**
   * 执行指定类型的测试用例
   * @param type 测试类型
   * @returns 测试结果数组
   */
  public async runByType(type: BenchmarkType): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    for (const benchCase of this.cases.values()) {
      if (benchCase.config.type === type) {
        const result = await this.executeCase(benchCase);
        results.push(result);
      }
    }
    return results;
  }

  /**
   * 执行指定级别的测试用例
   * @param level 测试级别
   * @returns 测试结果数组
   */
  public async runByLevel(level: BenchmarkLevel): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    for (const benchCase of this.cases.values()) {
      if (benchCase.config.level === level) {
        const result = await this.executeCase(benchCase);
        results.push(result);
      }
    }
    return results;
  }

  /**
   * 执行测试用例
   * @param benchCase 测试用例
   * @returns 测试结果
   */
  private async executeCase(benchCase: IBenchmarkCase): Promise<BenchmarkResult> {
    const config = benchCase.config;
    const iterations = config.iterations || 1;
    const warmupRuns = config.warmupRuns || 0;
    
    // 创建测试上下文
    const context = this.createContext(config);
    context.status = 'running';
    
    try {
      // 设置
      if (benchCase.setup) {
        await benchCase.setup();
      }
      
      // 预热
      if (warmupRuns > 0 && benchCase.warmup) {
        for (let i = 0; i < warmupRuns; i++) {
          await benchCase.warmup();
        }
      }
      
      // 开始收集指标
      this.collector.start();
      
      // 记录开始时间
      const startTime = performance.now();
      context.startTime = startTime;
      
      // 执行测试迭代
      const durations: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const iterationStart = performance.now();
        await benchCase.execute(context);
        const iterationEnd = performance.now();
        durations.push(iterationEnd - iterationStart);
      }
      
      // 记录结束时间
      const endTime = performance.now();
      context.endTime = endTime;
      
      // 停止收集指标
      this.collector.stop();
      
      // 收集指标
      context.metrics = this.collector.collect();
      
      // 计算结果
      const totalDuration = endTime - startTime;
      const operations = iterations;
      const opsPerSecond = (operations / totalDuration) * 1000;
      
      // 分析指标
      const metricValues = durations;
      const metrics = {
        'duration': {
          min: Math.min(...metricValues),
          max: Math.max(...metricValues),
          mean: metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length,
          median: this.calculateMedian(metricValues),
          stdDev: this.calculateStdDev(metricValues),
          p95: this.calculatePercentile(metricValues, 95),
          p99: this.calculatePercentile(metricValues, 99),
          values: metricValues
        }
      };
      
      // 验证阈值
      const thresholdValidation = this.validateThresholds(metrics, config.thresholds);
      const passed = !thresholdValidation || 
        Object.values(thresholdValidation).every(validations => 
          validations.every(validation => validation.passed)
        );
      
      // 更新上下文状态
      context.status = passed ? 'completed' : 'failed';
      
      // 创建结果
      const result: BenchmarkResult = {
        config,
        context,
        passed,
        duration: totalDuration,
        iterations,
        operations,
        opsPerSecond,
        metrics,
        thresholdValidation,
        timestamp: Date.now()
      };
      
      // 自定义验证
      if (benchCase.validate) {
        const validationResult = await benchCase.validate(result);
        result.passed = validationResult;
      }
      
      // 清理
      if (benchCase.teardown) {
        await benchCase.teardown();
      }
      
      return result;
    } catch (error) {
      // 处理错误
      context.status = 'failed';
      context.error = error instanceof Error ? error : new Error(String(error));
      
      // 清理
      try {
        if (benchCase.teardown) {
          await benchCase.teardown();
        }
      } catch (teardownError) {
        console.error('测试清理过程中发生错误:', teardownError);
      }
      
      // 创建错误结果
      return {
        config,
        context,
        passed: false,
        duration: context.endTime ? context.endTime - context.startTime : 0,
        iterations: 0,
        operations: 0,
        opsPerSecond: 0,
        metrics: {},
        error: {
          message: context.error.message,
          stack: context.error.stack
        },
        timestamp: Date.now()
      };
    } finally {
      // 确保收集器停止
      this.collector.stop();
      this.collector.clear();
    }
  }

  /**
   * 创建测试上下文
   * @param config 测试配置
   * @returns 测试上下文
   */
  private createContext(config: BenchmarkConfig): BenchmarkContext {
    const cpus = os.cpus();
    
    return {
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuInfo: {
          model: cpus.length > 0 ? cpus[0].model : 'Unknown',
          speed: cpus.length > 0 ? cpus[0].speed : 0,
          cores: cpus.length
        },
        memoryInfo: {
          totalMb: Math.round(os.totalmem() / (1024 * 1024)),
          freeMb: Math.round(os.freemem() / (1024 * 1024))
        }
      },
      params: config.params || {},
      startTime: performance.now(),
      status: 'pending'
    };
  }

  /**
   * 计算中位数
   * @param values 数值数组
   * @returns 中位数
   */
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * 计算标准差
   * @param values 数值数组
   * @returns 标准差
   */
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * 计算百分位数
   * @param values 数值数组
   * @param percentile 百分位数（0-100）
   * @returns 百分位数值
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sorted[lower];
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * 验证阈值
   * @param metrics 指标数据
   * @param thresholds 阈值配置
   * @returns 验证结果
   */
  private validateThresholds(
    metrics: Record<string, any>,
    thresholds?: Record<string, any>
  ): Record<string, { passed: boolean; actual: number; threshold: number; comparison: string }[]> | undefined {
    if (!thresholds) return undefined;
    
    const result: Record<string, { passed: boolean; actual: number; threshold: number; comparison: string }[]> = {};
    
    for (const [metricName, thresholdConfig] of Object.entries(thresholds)) {
      if (!metrics[metricName]) continue;
      
      const metricData = metrics[metricName];
      const validations: { passed: boolean; actual: number; threshold: number; comparison: string }[] = [];
      
      for (const [key, threshold] of Object.entries(thresholdConfig)) {
        if (typeof metricData[key] !== 'number' || typeof threshold !== 'number') continue;
        
        const actual = metricData[key];
        let passed = false;
        let comparison = '';
        
        switch (key) {
          case 'min':
            passed = actual >= threshold;
            comparison = `${actual} >= ${threshold}`;
            break;
          case 'max':
            passed = actual <= threshold;
            comparison = `${actual} <= ${threshold}`;
            break;
          default:
            passed = actual <= threshold;
            comparison = `${actual} <= ${threshold}`;
        }
        
        validations.push({
          passed,
          actual,
          threshold,
          comparison
        });
      }
      
      if (validations.length > 0) {
        result[metricName] = validations;
      }
    }
    
    return Object.keys(result).length > 0 ? result : undefined;
  }
} 