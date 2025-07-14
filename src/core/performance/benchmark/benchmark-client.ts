/**
 * MPLP基准测试客户端
 *
 * 提供简单易用的API，用于创建和执行基准测试。
 * 封装了基准测试工厂、执行器、报告器等组件，简化基准测试的使用。
 *
 * @version v1.0.0
 * @created 2025-07-17T11:30:00+08:00
 */

import {
  BenchmarkType,
  BenchmarkLevel,
  BenchmarkConfig,
  BenchmarkResult,
  BenchmarkContext
} from './interfaces';
import { DefaultBenchmarkFactory } from './benchmark-factory';

/**
 * 基准测试客户端
 */
export class BenchmarkClient {
  private factory: DefaultBenchmarkFactory;
  private outputDir?: string;

  /**
   * 创建基准测试客户端
   * @param outputDir 报告输出目录
   */
  constructor(outputDir?: string) {
    this.factory = new DefaultBenchmarkFactory();
    this.outputDir = outputDir;
  }

  /**
   * 创建基准测试构建器
   * @param name 测试名称
   * @returns 测试构建器
   */
  public createBenchmark(name: string): BenchmarkBuilder {
    return new BenchmarkBuilder(name, this.factory, this.outputDir);
  }

  /**
   * 创建多个基准测试并执行
   * @param configs 测试配置数组
   * @returns 测试结果数组
   */
  public async runMultiple(configs: Array<{
    name: string;
    type?: BenchmarkType;
    level?: BenchmarkLevel;
    fn: (context: BenchmarkContext) => Promise<void>;
    iterations?: number;
    warmupRuns?: number;
  }>): Promise<BenchmarkResult[]> {
    const runner = this.factory.createRunner();
    
    for (const config of configs) {
      const benchmark = this.createBenchmark(config.name)
        .withType(config.type || BenchmarkType.THROUGHPUT)
        .withLevel(config.level || BenchmarkLevel.COMPONENT);
      
      if (config.iterations) {
        benchmark.withIterations(config.iterations);
      }
      
      if (config.warmupRuns) {
        benchmark.withWarmup(config.warmupRuns);
      }
      
      const benchCase = benchmark.build(config.fn);
      runner.addCase(benchCase);
    }
    
    const results = await runner.runAll();
    
    // 生成报告
    const reporter = this.factory.createReporter(this.outputDir);
    await reporter.reportMany(results);
    
    return results;
  }

  /**
   * 比较两组基准测试结果
   * @param baseline 基准测试结果
   * @param current 当前测试结果
   * @param outputFile 输出文件路径
   */
  public async compareResults(
    baseline: BenchmarkResult[],
    current: BenchmarkResult[],
    outputFile?: string
  ): Promise<string> {
    const reporter = this.factory.createReporter(this.outputDir);
    const report = await reporter.generateComparisonReport(baseline, current);
    
    if (outputFile) {
      // 导出比较报告
      const format = outputFile.endsWith('.json') ? 'json' :
                    outputFile.endsWith('.csv') ? 'csv' :
                    outputFile.endsWith('.html') ? 'html' : 'md';
      
      await reporter.exportReport([...baseline, ...current], format);
    }
    
    return report;
  }
}

/**
 * 基准测试构建器
 */
export class BenchmarkBuilder {
  private config: BenchmarkConfig;
  private factory: DefaultBenchmarkFactory;
  private outputDir?: string;

  /**
   * 创建基准测试构建器
   * @param name 测试名称
   * @param factory 测试工厂
   * @param outputDir 报告输出目录
   */
  constructor(name: string, factory: DefaultBenchmarkFactory, outputDir?: string) {
    this.config = {
      name,
      type: BenchmarkType.THROUGHPUT,
      level: BenchmarkLevel.COMPONENT,
      iterations: 10,
      warmupRuns: 2,
      concurrency: 1
    };
    this.factory = factory;
    this.outputDir = outputDir;
  }

  /**
   * 设置测试类型
   * @param type 测试类型
   * @returns 当前构建器
   */
  public withType(type: BenchmarkType): BenchmarkBuilder {
    this.config.type = type;
    return this;
  }

  /**
   * 设置测试级别
   * @param level 测试级别
   * @returns 当前构建器
   */
  public withLevel(level: BenchmarkLevel): BenchmarkBuilder {
    this.config.level = level;
    return this;
  }

  /**
   * 设置测试描述
   * @param description 测试描述
   * @returns 当前构建器
   */
  public withDescription(description: string): BenchmarkBuilder {
    this.config.description = description;
    return this;
  }

  /**
   * 设置测试标签
   * @param tags 测试标签
   * @returns 当前构建器
   */
  public withTags(tags: string[]): BenchmarkBuilder {
    this.config.tags = tags;
    return this;
  }

  /**
   * 设置测试参数
   * @param params 测试参数
   * @returns 当前构建器
   */
  public withParams(params: Record<string, any>): BenchmarkBuilder {
    this.config.params = params;
    return this;
  }

  /**
   * 设置测试迭代次数
   * @param iterations 迭代次数
   * @returns 当前构建器
   */
  public withIterations(iterations: number): BenchmarkBuilder {
    this.config.iterations = iterations;
    return this;
  }

  /**
   * 设置测试预热次数
   * @param warmupRuns 预热次数
   * @returns 当前构建器
   */
  public withWarmup(warmupRuns: number): BenchmarkBuilder {
    this.config.warmupRuns = warmupRuns;
    return this;
  }

  /**
   * 设置测试并发级别
   * @param concurrency 并发级别
   * @returns 当前构建器
   */
  public withConcurrency(concurrency: number): BenchmarkBuilder {
    this.config.concurrency = concurrency;
    return this;
  }

  /**
   * 设置测试超时时间
   * @param timeoutMs 超时时间（毫秒）
   * @returns 当前构建器
   */
  public withTimeout(timeoutMs: number): BenchmarkBuilder {
    this.config.timeoutMs = timeoutMs;
    return this;
  }

  /**
   * 设置测试阈值
   * @param thresholds 阈值配置
   * @returns 当前构建器
   */
  public withThresholds(thresholds: Record<string, any>): BenchmarkBuilder {
    this.config.thresholds = thresholds;
    return this;
  }

  /**
   * 构建测试用例
   * @param fn 测试函数
   * @returns 测试用例
   */
  public build(fn: (context: BenchmarkContext) => Promise<void>) {
    return this.factory.createCase(this.config, fn);
  }

  /**
   * 构建并执行测试
   * @param fn 测试函数
   * @returns 测试结果
   */
  public async run(fn: (context: BenchmarkContext) => Promise<void>): Promise<BenchmarkResult> {
    const benchCase = this.build(fn);
    const runner = this.factory.createRunner();
    runner.addCase(benchCase);
    
    const result = await runner.runCase(this.config.name);
    
    // 生成报告
    const reporter = this.factory.createReporter(this.outputDir);
    await reporter.report(result);
    
    return result;
  }
} 