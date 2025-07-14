/**
 * 性能监控客户端测试
 * 
 * 验证MonitorClient的基本功能。
 *
 * @version v1.0.0
 * @created 2025-07-16T14:20:00+08:00
 */

import { MonitorClient } from '../../core/performance/monitor-client';
import { 
  ICounterMetric,
  IGaugeMetric,
  IHistogramMetric,
  ITimerMetric,
  IMeterMetric
} from '../../core/performance/interfaces';

describe('MonitorClient', () => {
  let monitor: MonitorClient;
  
  beforeEach(async () => {
    // 创建监控客户端
    monitor = new MonitorClient({
      defaultCollectionIntervalMs: 1000, // 更短的收集间隔，便于测试
      storage: {
        type: 'memory',
        options: { maxEntries: 100 }
      }
    });
    
    // 初始化监控
    await monitor.init();
  });
  
  afterEach(async () => {
    // 停止监控
    await monitor.stop();
  });
  
  describe('基本指标操作', () => {
    test('应该创建并使用计数器', () => {
      // 创建计数器
      const counter: ICounterMetric = monitor.counter('test.counter', {
        description: '测试计数器',
        unit: 'count'
      });
      
      // 使用计数器
      counter.increment();
      counter.increment(5);
      
      // 验证计数器值
      expect(counter.value).toBe(6);
      expect(counter.name).toBe('test.counter');
      expect(counter.description).toBe('测试计数器');
      expect(counter.unit).toBe('count');
    });
    
    test('应该创建并使用度量', () => {
      // 创建度量
      const gauge: IGaugeMetric = monitor.gauge('test.gauge');
      
      // 使用度量
      gauge.update(10);
      expect(gauge.value).toBe(10);
      
      gauge.increment();
      expect(gauge.value).toBe(11);
      
      gauge.increment(5);
      expect(gauge.value).toBe(16);
      
      gauge.decrement(6);
      expect(gauge.value).toBe(10);
    });
    
    test('应该创建并使用直方图', () => {
      // 创建直方图
      const histogram: IHistogramMetric = monitor.histogram('test.histogram');
      
      // 添加观测值
      histogram.update(10);
      histogram.update(20);
      histogram.update(30);
      histogram.update(40);
      histogram.update(50);
      
      // 验证统计
      expect(histogram.getMean()).toBe(30);
      expect(histogram.getMedian()).toBe(30);
      expect(histogram.getMin()).toBe(10);
      expect(histogram.getMax()).toBe(50);
    });
    
    test('应该创建并使用计时器', () => {
      // 创建计时器
      const timer: ITimerMetric = monitor.timer('test.timer');
      
      // 记录时间
      timer.recordTime(100);
      timer.recordTime(200);
      timer.recordTime(300);
      
      // 验证统计
      expect(timer.getMean()).toBe(200);
      expect(timer.getMedian()).toBe(200);
      expect(timer.getMin()).toBe(100);
      expect(timer.getMax()).toBe(300);
    });
    
    test('应该创建并使用吞吐率', () => {
      // 创建吞吐率
      const meter: IMeterMetric = monitor.meter('test.meter');
      
      // 标记事件
      meter.mark(10);
      
      // 验证值
      expect(meter.value).toBe(10);
    });
  });
  
  describe('辅助方法', () => {
    test('time方法应该计时同步函数执行', () => {
      // 使用time方法包装同步函数
      const result = monitor.time('test.sync_fn', () => {
        // 模拟同步操作
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });
      
      // 验证返回结果
      expect(result).toBe(499500);
      
      // 检查创建的计时器
      const timer = monitor.timer('test.sync_fn');
      expect(timer.value.length).toBe(1);
    });
    
    test('timeAsync方法应该计时异步函数执行', async () => {
      // 使用timeAsync方法包装异步函数
      const result = await monitor.timeAsync('test.async_fn', async () => {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'done';
      });
      
      // 验证返回结果
      expect(result).toBe('done');
      
      // 检查创建的计时器
      const timer = monitor.timer('test.async_fn');
      expect(timer.value.length).toBe(1);
      expect(timer.value[0]).toBeGreaterThanOrEqual(40); // 允许一点误差
    });
  });
  
  describe('生命周期管理', () => {
    test('start方法应该启动监控', async () => {
      // 停止当前监控
      await monitor.stop();
      
      // 重新启动
      await monitor.start();
      
      // 创建并使用计数器
      const counter = monitor.counter('lifecycle.counter');
      counter.increment();
      
      // 验证计数器值
      expect(counter.value).toBe(1);
    });
    
    test('stop方法应该停止监控', async () => {
      // 先启动
      await monitor.start();
      
      // 然后停止
      await monitor.stop();
      
      // 创建并使用计数器
      const counter = monitor.counter('post_stop.counter');
      counter.increment();
      
      // 计数器仍然可以工作
      expect(counter.value).toBe(1);
    });
  });
  
  describe('Express中间件', () => {
    test('apiMetricsMiddleware应该返回中间件函数', () => {
      const middleware = monitor.apiMetricsMiddleware();
      expect(typeof middleware).toBe('function');
    });
    
    test('中间件应该监控请求和响应', () => {
      const middleware = monitor.apiMetricsMiddleware();
      
      // 模拟请求和响应对象
      const req = {};
      const res = {
        end: jest.fn()
      };
      const next = jest.fn();
      
      // 调用中间件
      middleware(req, res, next);
      
      // 验证next被调用
      expect(next).toHaveBeenCalled();
      
      // 验证响应end方法被修改
      expect(typeof res.end).toBe('function');
      expect(res.end).not.toBe(jest.fn());
      
      // 验证计数器和度量被创建
      const requestCounter = monitor.counter('api.requests');
      const activeRequests = monitor.gauge('api.active_requests');
      
      expect(requestCounter.value).toBe(1);
      expect(activeRequests.value).toBe(1);
      
      // 模拟请求结束
      res.end();
      
      // 验证活跃请求减少
      expect(activeRequests.value).toBe(0);
    });
  });
}); 