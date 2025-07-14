/**
 * MPLP基准测试工厂
 *
 * 提供创建基准测试用例、执行器、报告器和收集器的工厂方法。
 * 实现IBenchmarkFactory接口，用于简化基准测试组件的创建。
 *
 * @version v1.0.0
 * @created 2025-07-17T10:30:00+08:00
 */

import {
  IBenchmarkFactory,
  IBenchmarkCase,
  IBenchmarkRunner,
  IBenchmarkReporter,
  IBenchmarkCollector,
  BenchmarkConfig,
  BenchmarkContext
} from './interfaces';
import { DefaultBenchmarkRunner } from './default-runner';
import { DefaultBenchmarkReporter } from './default-reporter';
import { BenchmarkCollector } from './benchmark-collector';

/**
 * 默认基准测试用例实现
 */
class DefaultBenchmarkCase implements IBenchmarkCase {
  public config: BenchmarkConfig;
  private executeFn: (context: BenchmarkContext) => Promise<void>;
  private setupFn?: () => Promise<void>;
  private warmupFn?: () => Promise<void>;
  private teardownFn?: () => Promise<void>;
  private validateFn?: (result: any) => Promise<boolean>;

  /**
   * 创建默认基准测试用例
   * @param config 测试配置
   * @param executeFn 执行函数
   */
  constructor(
    config: BenchmarkConfig,
    executeFn: (context: BenchmarkContext) => Promise<void>
  ) {
    this.config = config;
    this.executeFn = executeFn;
  }

  /**
   * 设置测试设置函数
   * @param setupFn 设置函数
   * @returns 当前实例
   */
  public withSetup(setupFn: () => Promise<void>): DefaultBenchmarkCase {
    this.setupFn = setupFn;
    return this;
  }

  /**
   * 设置测试预热函数
   * @param warmupFn 预热函数
   * @returns 当前实例
   */
  public withWarmup(warmupFn: () => Promise<void>): DefaultBenchmarkCase {
    this.warmupFn = warmupFn;
    return this;
  }

  /**
   * 设置测试清理函数
   * @param teardownFn 清理函数
   * @returns 当前实例
   */
  public withTeardown(teardownFn: () => Promise<void>): DefaultBenchmarkCase {
    this.teardownFn = teardownFn;
    return this;
  }

  /**
   * 设置测试验证函数
   * @param validateFn 验证函数
   * @returns 当前实例
   */
  public withValidate(validateFn: (result: any) => Promise<boolean>): DefaultBenchmarkCase {
    this.validateFn = validateFn;
    return this;
  }

  /**
   * 测试设置
   */
  public async setup(): Promise<void> {
    if (this.setupFn) {
      await this.setupFn();
    }
  }

  /**
   * 测试预热
   */
  public async warmup(): Promise<void> {
    if (this.warmupFn) {
      await this.warmupFn();
    }
  }

  /**
   * 测试执行
   * @param context 测试上下文
   */
  public async execute(context: BenchmarkContext): Promise<void> {
    await this.executeFn(context);
  }

  /**
   * 测试清理
   */
  public async teardown(): Promise<void> {
    if (this.teardownFn) {
      await this.teardownFn();
    }
  }

  /**
   * 测试验证
   * @param result 测试结果
   * @returns 是否通过验证
   */
  public async validate(result: any): Promise<boolean> {
    if (this.validateFn) {
      return this.validateFn(result);
    }
    return true;
  }
}

/**
 * 默认基准测试工厂
 */
export class DefaultBenchmarkFactory implements IBenchmarkFactory {
  /**
   * 创建测试用例
   * @param config 测试配置
   * @param executeFn 执行函数
   * @returns 测试用例
   */
  public createCase(
    config: BenchmarkConfig,
    executeFn: (context: BenchmarkContext) => Promise<void>
  ): IBenchmarkCase {
    return new DefaultBenchmarkCase(config, executeFn);
  }

  /**
   * 创建测试执行器
   * @returns 测试执行器
   */
  public createRunner(): IBenchmarkRunner {
    return new DefaultBenchmarkRunner();
  }

  /**
   * 创建测试报告器
   * @param outputDir 输出目录
   * @returns 测试报告器
   */
  public createReporter(outputDir?: string): IBenchmarkReporter {
    return new DefaultBenchmarkReporter(outputDir);
  }

  /**
   * 创建测试收集器
   * @returns 测试收集器
   */
  public createCollector(): IBenchmarkCollector {
    return new BenchmarkCollector();
  }
} 