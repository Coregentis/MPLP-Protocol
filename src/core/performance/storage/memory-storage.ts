/**
 * MPLP内存指标存储实现
 *
 * 提供内存中的指标存储功能，适用于开发环境或小规模应用。
 *
 * @version v1.0.0
 * @created 2025-07-16T12:30:00+08:00
 */

import { 
  IMetricStorage, 
  IMetric, 
  MetricQueryFilter, 
  HistoryOptions,
  AggregationType
} from '../interfaces';

/**
 * 内存存储配置
 */
interface MemoryStorageOptions {
  maxEntries?: number;         // 每个指标最多存储的条目数
  maxMetrics?: number;         // 最多存储的指标数
  pruneInterval?: number;      // 清理过期数据的间隔（毫秒）
  retentionPeriodMs?: number;  // 数据保留时长（毫秒）
}

/**
 * 内存指标存储实现
 */
export class MemoryMetricStorage implements IMetricStorage {
  private metrics: Map<string, IMetric[]> = new Map();
  private pruneTimer: NodeJS.Timeout | null = null;
  
  private readonly options: MemoryStorageOptions;
  
  /**
   * 创建内存指标存储
   * @param options 存储配置
   */
  constructor(options?: MemoryStorageOptions) {
    this.options = {
      maxEntries: options?.maxEntries || 1000,
      maxMetrics: options?.maxMetrics || 100,
      pruneInterval: options?.pruneInterval || 60000, // 默认每分钟清理一次
      retentionPeriodMs: options?.retentionPeriodMs || 24 * 60 * 60 * 1000 // 默认保留24小时
    };
    
    // 启动定时清理
    this.startPruneTimer();
  }
  
  /**
   * 存储单个指标
   * @param metric 指标
   */
  public async store(metric: IMetric): Promise<void> {
    const name = metric.name;
    
    // 获取或创建该指标的历史数据数组
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
      
      // 如果超过最大指标数，删除最旧的指标
      if (this.metrics.size > this.options.maxMetrics!) {
        let oldestMetricName = '';
        let oldestTimestamp = Date.now();
        
        for (const [metricName, metricValues] of this.metrics.entries()) {
          if (metricValues.length > 0) {
            const firstTimestamp = metricValues[0].timestamp;
            if (firstTimestamp < oldestTimestamp) {
              oldestTimestamp = firstTimestamp;
              oldestMetricName = metricName;
            }
          }
        }
        
        if (oldestMetricName && oldestMetricName !== name) {
          this.metrics.delete(oldestMetricName);
        }
      }
    }
    
    // 添加指标
    const metricValues = this.metrics.get(name)!;
    metricValues.push({ ...metric });
    
    // 限制每个指标的历史数据量
    if (metricValues.length > this.options.maxEntries!) {
      metricValues.shift(); // 删除最旧的
    }
  }
  
  /**
   * 批量存储指标
   * @param metrics 指标数组
   */
  public async storeMany(metrics: IMetric[]): Promise<void> {
    for (const metric of metrics) {
      await this.store(metric);
    }
  }
  
  /**
   * 查询指标
   * @param filter 查询过滤器
   * @returns 符合条件的指标
   */
  public async query(filter: MetricQueryFilter): Promise<IMetric[]> {
    const results: IMetric[] = [];
    
    // 确定要查询的指标名称
    let metricNames: string[];
    if (filter.names && filter.names.length > 0) {
      metricNames = filter.names.filter(name => this.metrics.has(name));
    } else {
      metricNames = Array.from(this.metrics.keys());
    }
    
    // 查询每个指标
    for (const name of metricNames) {
      const metricValues = this.metrics.get(name) || [];
      
      // 应用过滤条件
      const filteredValues = metricValues.filter(metric => {
        // 类型过滤
        if (filter.types && filter.types.length > 0 && !filter.types.includes(metric.type)) {
          return false;
        }
        
        // 时间戳过滤
        if (filter.fromTimestamp && metric.timestamp < filter.fromTimestamp) {
          return false;
        }
        if (filter.toTimestamp && metric.timestamp > filter.toTimestamp) {
          return false;
        }
        
        // 标签过滤
        if (filter.tags && Object.keys(filter.tags).length > 0) {
          if (!metric.tags) return false;
          
          for (const [key, value] of Object.entries(filter.tags)) {
            if (metric.tags[key] !== value) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      results.push(...filteredValues);
    }
    
    // 排序
    if (filter.sortBy) {
      results.sort((a, b) => {
        const aValue = filter.sortBy === 'timestamp' ? a.timestamp : Number(a.value);
        const bValue = filter.sortBy === 'timestamp' ? b.timestamp : Number(b.value);
        
        return filter.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }
    
    // 限制返回数量
    if (filter.limit && filter.limit > 0 && results.length > filter.limit) {
      return results.slice(0, filter.limit);
    }
    
    return results;
  }
  
  /**
   * 获取指定指标的最新值
   * @param metricName 指标名称
   * @returns 最新的指标值，如果不存在则返回null
   */
  public async getLatest(metricName: string): Promise<IMetric | null> {
    const metricValues = this.metrics.get(metricName);
    
    if (!metricValues || metricValues.length === 0) {
      return null;
    }
    
    // 返回最新的指标（时间戳最大的）
    return metricValues.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }
  
  /**
   * 获取指标历史数据
   * @param metricName 指标名称
   * @param options 查询选项
   * @returns 历史数据
   */
  public async getHistory(metricName: string, options: HistoryOptions): Promise<IMetric[]> {
    const metricValues = this.metrics.get(metricName);
    
    if (!metricValues || metricValues.length === 0) {
      return [];
    }
    
    // 应用时间范围过滤
    let filtered = metricValues;
    
    if (options.fromTimestamp) {
      filtered = filtered.filter(m => m.timestamp >= options.fromTimestamp!);
    }
    
    if (options.toTimestamp) {
      filtered = filtered.filter(m => m.timestamp <= options.toTimestamp!);
    }
    
    // 如果需要聚合，按时间间隔分组
    if (options.aggregation && options.aggregation !== AggregationType.NONE && options.interval) {
      return this.aggregateMetrics(filtered, options);
    }
    
    // 限制返回数量
    if (options.limit && filtered.length > options.limit) {
      // 返回最新的n条
      return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, options.limit);
    }
    
    // 按时间戳排序
    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  /**
   * 根据时间间隔聚合指标
   * @param metrics 指标列表
   * @param options 聚合选项
   * @returns 聚合后的指标
   */
  private aggregateMetrics(metrics: IMetric[], options: HistoryOptions): IMetric[] {
    if (!options.interval || metrics.length === 0) {
      return metrics;
    }
    
    // 按时间间隔分组
    const groups: Map<number, IMetric[]> = new Map();
    const interval = options.interval;
    
    // 找到最小时间戳，作为基准
    const minTimestamp = metrics.reduce(
      (min, m) => Math.min(min, m.timestamp), 
      metrics[0].timestamp
    );
    
    // 分组
    for (const metric of metrics) {
      const timeOffset = metric.timestamp - minTimestamp;
      const groupKey = Math.floor(timeOffset / interval) * interval + minTimestamp;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      
      groups.get(groupKey)!.push(metric);
    }
    
    // 聚合每个分组
    const results: IMetric[] = [];
    
    for (const [groupTimestamp, groupMetrics] of groups.entries()) {
      // 计算聚合值
      const aggregatedValue = this.calculateAggregation(
        groupMetrics, 
        options.aggregation || AggregationType.AVG
      );
      
      // 创建聚合后的指标
      if (aggregatedValue !== null) {
        const first = groupMetrics[0];
        results.push({
          ...first,
          value: aggregatedValue,
          timestamp: groupTimestamp
        });
      }
    }
    
    // 按时间戳排序
    results.sort((a, b) => a.timestamp - b.timestamp);
    
    // 限制返回数量
    if (options.limit && results.length > options.limit) {
      return results.slice(0, options.limit);
    }
    
    return results;
  }
  
  /**
   * 计算指标的聚合值
   * @param metrics 指标列表
   * @param aggregationType 聚合类型
   * @returns 聚合值
   */
  private calculateAggregation(metrics: IMetric[], aggregationType: AggregationType): number | null {
    if (metrics.length === 0) {
      return null;
    }
    
    // 提取数值
    const values = metrics.map(m => {
      if (Array.isArray(m.value)) {
        return m.value as number[];
      }
      return [Number(m.value)];
    }).flat();
    
    // 根据聚合类型计算
    switch (aggregationType) {
      case AggregationType.SUM:
        return values.reduce((sum, v) => sum + v, 0);
      
      case AggregationType.AVG:
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      
      case AggregationType.MIN:
        return Math.min(...values);
      
      case AggregationType.MAX:
        return Math.max(...values);
      
      case AggregationType.COUNT:
        return values.length;
      
      case AggregationType.MEDIAN:
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        return values.length % 2 === 0 
          ? (values[mid - 1] + values[mid]) / 2 
          : values[mid];
      
      case AggregationType.P95:
        values.sort((a, b) => a - b);
        const p95Index = Math.ceil(values.length * 0.95) - 1;
        return values[p95Index];
      
      case AggregationType.P99:
        values.sort((a, b) => a - b);
        const p99Index = Math.ceil(values.length * 0.99) - 1;
        return values[p99Index];
      
      default:
        return values[values.length - 1]; // 默认返回最后一个值
    }
  }
  
  /**
   * 启动定时清理任务
   */
  private startPruneTimer(): void {
    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
    }
    
    this.pruneTimer = setInterval(() => {
      this.pruneExpiredData();
    }, this.options.pruneInterval);
  }
  
  /**
   * 清理过期数据
   */
  private pruneExpiredData(): void {
    const cutoff = Date.now() - this.options.retentionPeriodMs!;
    
    for (const [name, values] of this.metrics.entries()) {
      const newValues = values.filter(m => m.timestamp >= cutoff);
      
      if (newValues.length === 0) {
        this.metrics.delete(name);
      } else if (newValues.length < values.length) {
        this.metrics.set(name, newValues);
      }
    }
  }
} 