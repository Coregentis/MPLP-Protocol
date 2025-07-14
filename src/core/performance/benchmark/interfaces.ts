/**
 * MPLP性能基准测试接口定义
 *
 * 定义性能基准测试所需的核心接口，包括测试用例、执行器、报告器等。
 * 遵循厂商中立原则，提供标准化的接口以支持不同的测试工具和实现。
 *
 * @version v1.0.0
 * @created 2025-07-17T09:00:00+08:00
 */

import { IMetric } from '../interfaces';

/**
 * 基准测试类型枚举
 */
export enum BenchmarkType {
  THROUGHPUT = 'throughput',    // 吞吐量测试
  LATENCY = 'latency',          // 延迟测试
  RESOURCE = 'resource',        // 资源使用测试
  SCALABILITY = 'scalability',  // 可扩展性测试
  ENDURANCE = 'endurance'       // 持久性测试
}

/**
 * 基准测试级别枚举
 */
export enum BenchmarkLevel {
  UNIT = 'unit',              // 单元级别
  COMPONENT = 'component',    // 组件级别
  INTEGRATION = 'integration',// 集成级别
  SYSTEM = 'system',          // 系统级别
  E2E = 'e2e'                 // 端到端级别
}

/**
 * 基准测试上下文
 */
export interface BenchmarkContext {
  // 测试环境信息
  environment: {
    nodeVersion: string;
    platform: string;
    cpuInfo: {
      model: string;
      speed: number;
      cores: number;
    };
    memoryInfo: {
      totalMb: number;
      freeMb: number;
    };
  };
  
  // 测试参数
  params: Record<string, any>;
  
  // 测试开始时间
  startTime: number;
  
  // 测试结束时间
  endTime?: number;
  
  // 测试过程中收集的指标
  metrics?: IMetric[];
  
  // 测试状态
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // 错误信息（如果有）
  error?: Error;
}

/**
 * 基准测试配置
 */
export interface BenchmarkConfig {
  // 测试名称
  name: string;
  
  // 测试描述
  description?: string;
  
  // 测试类型
  type: BenchmarkType;
  
  // 测试级别
  level: BenchmarkLevel;
  
  // 测试标签
  tags?: string[];
  
  // 测试参数
  params?: Record<string, any>;
  
  // 测试超时时间（毫秒）
  timeoutMs?: number;
  
  // 测试重试次数
  retries?: number;
  
  // 测试预热次数
  warmupRuns?: number;
  
  // 测试迭代次数
  iterations?: number;
  
  // 并发级别
  concurrency?: number;
  
  // 性能阈值
  thresholds?: {
    [metricName: string]: {
      min?: number;
      max?: number;
      mean?: number;
      p95?: number;
      p99?: number;
    };
  };
}

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  // 测试配置
  config: BenchmarkConfig;
  
  // 测试上下文
  context: BenchmarkContext;
  
  // 测试是否通过
  passed: boolean;
  
  // 测试执行时间（毫秒）
  duration: number;
  
  // 测试迭代次数
  iterations: number;
  
  // 测试操作数
  operations: number;
  
  // 每秒操作数
  opsPerSecond: number;
  
  // 测试指标
  metrics: {
    [name: string]: {
      min: number;
      max: number;
      mean: number;
      median: number;
      stdDev: number;
      p95: number;
      p99: number;
      values: number[];
    };
  };
  
  // 阈值验证结果
  thresholdValidation?: {
    [metricName: string]: {
      passed: boolean;
      actual: number;
      threshold: number;
      comparison: string;
    }[];
  };
  
  // 错误信息（如果有）
  error?: {
    message: string;
    stack?: string;
  };
  
  // 测试完成时间
  timestamp: number;
}

/**
 * 基准测试用例
 */
export interface IBenchmarkCase {
  // 测试配置
  config: BenchmarkConfig;
  
  // 测试设置
  setup?(): Promise<void>;
  
  // 测试预热
  warmup?(): Promise<void>;
  
  // 测试执行
  execute(context: BenchmarkContext): Promise<void>;
  
  // 测试清理
  teardown?(): Promise<void>;
  
  // 测试验证
  validate?(result: BenchmarkResult): Promise<boolean>;
}

/**
 * 基准测试执行器
 */
export interface IBenchmarkRunner {
  // 添加测试用例
  addCase(benchCase: IBenchmarkCase): void;
  
  // 添加多个测试用例
  addCases(benchCases: IBenchmarkCase[]): void;
  
  // 移除测试用例
  removeCase(caseName: string): boolean;
  
  // 获取所有测试用例
  getCases(): IBenchmarkCase[];
  
  // 获取指定测试用例
  getCase(caseName: string): IBenchmarkCase | undefined;
  
  // 执行单个测试用例
  runCase(caseName: string): Promise<BenchmarkResult>;
  
  // 执行所有测试用例
  runAll(): Promise<BenchmarkResult[]>;
  
  // 执行指定标签的测试用例
  runByTags(tags: string[]): Promise<BenchmarkResult[]>;
  
  // 执行指定类型的测试用例
  runByType(type: BenchmarkType): Promise<BenchmarkResult[]>;
  
  // 执行指定级别的测试用例
  runByLevel(level: BenchmarkLevel): Promise<BenchmarkResult[]>;
}

/**
 * 基准测试报告器
 */
export interface IBenchmarkReporter {
  // 报告单个测试结果
  report(result: BenchmarkResult): Promise<void>;
  
  // 报告多个测试结果
  reportMany(results: BenchmarkResult[]): Promise<void>;
  
  // 生成摘要报告
  generateSummary(results: BenchmarkResult[]): Promise<string>;
  
  // 生成详细报告
  generateDetailedReport(results: BenchmarkResult[]): Promise<string>;
  
  // 生成比较报告
  generateComparisonReport(baseline: BenchmarkResult[], current: BenchmarkResult[]): Promise<string>;
  
  // 导出报告
  exportReport(results: BenchmarkResult[], format: 'json' | 'csv' | 'html' | 'md'): Promise<string>;
}

/**
 * 基准测试收集器
 */
export interface IBenchmarkCollector {
  // 开始收集指标
  start(): void;
  
  // 停止收集指标
  stop(): void;
  
  // 收集指标
  collect(): IMetric[];
  
  // 清除收集的指标
  clear(): void;
}

/**
 * 基准测试工厂
 */
export interface IBenchmarkFactory {
  // 创建测试用例
  createCase(config: BenchmarkConfig, executeFn: (context: BenchmarkContext) => Promise<void>): IBenchmarkCase;
  
  // 创建测试执行器
  createRunner(): IBenchmarkRunner;
  
  // 创建测试报告器
  createReporter(): IBenchmarkReporter;
  
  // 创建测试收集器
  createCollector(): IBenchmarkCollector;
} 