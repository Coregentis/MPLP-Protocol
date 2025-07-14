/**
 * MPLP性能监控框架接口定义
 *
 * 定义性能监控所需的核心接口，包括性能指标、收集器、存储和分析器。
 * 遵循厂商中立原则，提供标准化的接口以支持不同的监控工具和实现。
 *
 * @version v1.0.0
 * @created 2025-07-16T09:00:00+08:00
 */

/**
 * 性能指标类型枚举
 */
export enum MetricType {
  COUNTER = 'counter',     // 计数器，值只增不减
  GAUGE = 'gauge',         // 度量，可增可减的值
  HISTOGRAM = 'histogram', // 直方图，值的分布情况
  TIMER = 'timer',         // 计时器，专门用于时间测量
  METER = 'meter'          // 吞吐率，单位时间内的事件数量
}

/**
 * 指标标签类型
 * 用于给指标添加额外维度以便分析和过滤
 */
export interface MetricTags {
  [key: string]: string | number | boolean;
}

/**
 * 基础性能指标接口
 */
export interface IMetric<T = number> {
  name: string;                // 指标名称
  type: MetricType;            // 指标类型
  description?: string;        // 指标描述
  tags?: MetricTags;           // 指标标签
  unit?: string;               // 指标单位
  value: T;                    // 指标当前值
  timestamp: number;           // 指标最后更新时间戳
}

/**
 * 计数器指标接口
 */
export interface ICounterMetric extends IMetric<number> {
  type: MetricType.COUNTER;
  increment(value?: number): void;   // 增加计数
  reset(): void;                     // 重置计数
}

/**
 * 度量指标接口
 */
export interface IGaugeMetric extends IMetric<number> {
  type: MetricType.GAUGE;
  update(value: number): void;       // 更新当前值
  increment(value?: number): void;   // 增加值
  decrement(value?: number): void;   // 减少值
}

/**
 * 直方图指标接口
 */
export interface IHistogramMetric extends IMetric<number[]> {
  type: MetricType.HISTOGRAM;
  update(value: number): void;       // 添加观测值
  getPercentile(p: number): number;  // 获取指定百分位数的值
  getMean(): number;                 // 获取平均值
  getMedian(): number;               // 获取中位数
  getMax(): number;                  // 获取最大值
  getMin(): number;                  // 获取最小值
}

/**
 * 计时器指标基础接口（不包括类型）
 * 解决接口继承冲突
 */
export interface ITimerMetricBase {
  startTimer(): () => void;          // 开始计时，返回停止计时函数
  recordTime(timeInMs: number): void; // 记录耗时
}

/**
 * 计时器指标接口
 * 扩展基础指标接口并结合直方图的功能，但使用Timer类型
 */
export interface ITimerMetric extends Omit<IHistogramMetric, 'type'>, ITimerMetricBase {
  type: MetricType.TIMER;
}

/**
 * 吞吐率指标接口
 */
export interface IMeterMetric extends IMetric<number> {
  type: MetricType.METER;
  mark(value?: number): void;        // 记录事件发生
  get1MinuteRate(): number;          // 获取1分钟吞吐率
  get5MinuteRate(): number;          // 获取5分钟吞吐率
  get15MinuteRate(): number;         // 获取15分钟吞吐率
}

/**
 * 指标创建选项
 */
export interface MetricOptions {
  description?: string;
  tags?: MetricTags;
  unit?: string;
}

/**
 * 指标注册表接口
 */
export interface IMetricRegistry {
  counter(name: string, options?: MetricOptions): ICounterMetric;
  gauge(name: string, options?: MetricOptions): IGaugeMetric;
  histogram(name: string, options?: MetricOptions): IHistogramMetric;
  timer(name: string, options?: MetricOptions): ITimerMetric;
  meter(name: string, options?: MetricOptions): IMeterMetric;
  
  getMetric(name: string): IMetric | undefined;
  getAllMetrics(): IMetric[];
  removeMetric(name: string): boolean;
  clear(): void;
}

/**
 * 指标收集器接口
 */
export interface IMetricCollector {
  collect(): IMetric[];
  startCollection(intervalMs: number): void;
  stopCollection(): void;
  isCollecting(): boolean;
}

/**
 * 监控数据存储接口
 */
export interface IMetricStorage {
  store(metric: IMetric): Promise<void>;
  storeMany(metrics: IMetric[]): Promise<void>;
  query(filter: MetricQueryFilter): Promise<IMetric[]>;
  getLatest(metricName: string): Promise<IMetric | null>;
  getHistory(metricName: string, options: HistoryOptions): Promise<IMetric[]>;
}

/**
 * 指标查询过滤器
 */
export interface MetricQueryFilter {
  names?: string[];               // 指标名称列表
  types?: MetricType[];           // 指标类型列表
  tags?: Partial<MetricTags>;     // 标签过滤
  fromTimestamp?: number;         // 开始时间戳
  toTimestamp?: number;           // 结束时间戳
  limit?: number;                 // 限制返回数量
  sortBy?: 'timestamp' | 'value'; // 排序字段
  sortOrder?: 'asc' | 'desc';     // 排序顺序
}

/**
 * 历史数据查询选项
 */
export interface HistoryOptions {
  fromTimestamp?: number;         // 开始时间戳
  toTimestamp?: number;           // 结束时间戳
  limit?: number;                 // 限制返回数量
  aggregation?: AggregationType;  // 聚合类型
  interval?: number;              // 聚合间隔（毫秒）
}

/**
 * 聚合类型枚举
 */
export enum AggregationType {
  NONE = 'none',       // 不聚合
  SUM = 'sum',         // 求和
  AVG = 'avg',         // 平均值
  MIN = 'min',         // 最小值
  MAX = 'max',         // 最大值
  COUNT = 'count',     // 计数
  MEDIAN = 'median',   // 中位数
  P95 = 'p95',         // 95百分位数
  P99 = 'p99'          // 99百分位数
}

/**
 * 性能分析器接口
 */
export interface IMetricAnalyzer {
  analyze(metrics: IMetric[], options?: AnalysisOptions): AnalysisResult;
  detectAnomalies(metrics: IMetric[], options?: AnomalyDetectionOptions): AnomalyResult[];
  calculateTrend(metrics: IMetric[], options?: TrendOptions): TrendResult;
}

/**
 * 分析选项
 */
export interface AnalysisOptions {
  aggregation?: AggregationType;
  groupBy?: string[];        // 按标签分组
  compareWith?: IMetric[];   // 用于比较的基准指标
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  summary: {
    count: number;
    minValue: number;
    maxValue: number;
    avgValue: number;
    medianValue: number;
    p95Value: number;
    p99Value: number;
  };
  groups?: {
    [key: string]: AnalysisResult;
  };
  comparison?: {
    diff: number;
    percentage: number;
  };
}

/**
 * 异常检测选项
 */
export interface AnomalyDetectionOptions {
  sensitivity?: number;      // 灵敏度 (0-1)
  baselineMetrics?: IMetric[]; // 基准指标
  algorithm?: string;        // 检测算法
}

/**
 * 异常结果
 */
export interface AnomalyResult {
  metricName: string;
  timestamp: number;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 趋势分析选项
 */
export interface TrendOptions {
  window?: number;           // 滑动窗口大小
  forecastPeriods?: number;  // 预测周期数
}

/**
 * 趋势分析结果
 */
export interface TrendResult {
  slope: number;               // 斜率
  direction: 'up' | 'down' | 'stable';
  forecast?: number[];         // 预测值
  confidence?: number;         // 置信度 (0-1)
}

/**
 * 指标报告器接口
 */
export interface IMetricReporter {
  report(metrics: IMetric[]): void;
  scheduleReporting(intervalMs: number, filter?: MetricQueryFilter): void;
  stopReporting(): void;
}

/**
 * 指标格式化器接口
 */
export interface IMetricFormatter<T = any> {
  format(metric: IMetric): T;
  formatMany(metrics: IMetric[]): T[];
}

/**
 * 性能监控框架配置
 */
export interface PerformanceMonitorConfig {
  defaultCollectionIntervalMs?: number;
  defaultReportingIntervalMs?: number;
  enabledMetricTypes?: MetricType[];
  storage?: {
    type: 'memory' | 'file' | 'database' | 'custom';
    options?: Record<string, any>;
  };
  reporters?: {
    type: string;
    options?: Record<string, any>;
  }[];
}

/**
 * 性能监控服务接口
 */
export interface IPerformanceMonitorService {
  registry: IMetricRegistry;
  collector: IMetricCollector;
  storage: IMetricStorage;
  analyzer: IMetricAnalyzer;
  
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  
  addReporter(reporter: IMetricReporter): void;
  removeReporter(reporter: IMetricReporter): void;
  
  createTimer(name: string, options?: MetricOptions): ITimerMetric;
  time<T>(name: string, fn: () => T, options?: MetricOptions): T;
  timeAsync<T>(name: string, fn: () => Promise<T>, options?: MetricOptions): Promise<T>;
} 