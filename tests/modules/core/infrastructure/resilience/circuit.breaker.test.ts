/**
 * CircuitBreaker测试用例
 * 验证熔断器模式和容错机制的核心功能
 */

import { CircuitBreaker, CircuitBreakerManager, CircuitBreakerConfig, RetryConfig, TimeoutConfig, FallbackConfig } from '../../../../../src/modules/core/infrastructure/resilience/circuit.breaker';

describe('CircuitBreaker测试', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    const config: Partial<CircuitBreakerConfig> = {
      name: 'test-circuit-breaker',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      resetTimeout: 5000,
      monitoringPeriod: 1000,
      halfOpenMaxCalls: 2,
      fallbackEnabled: true,
      metricsEnabled: true,
      notificationEnabled: true
    };

    circuitBreaker = new CircuitBreaker(config);
  });

  afterEach(() => {
    circuitBreaker.destroy();
  });

  describe('基础功能测试', () => {
    it('应该创建熔断器并返回初始状态', () => {
      const status = circuitBreaker.getStatus();
      
      expect(status.name).toBe('test-circuit-breaker');
      expect(status.state).toBe('CLOSED');
      expect(status.failureCount).toBe(0);
      expect(status.successCount).toBe(0);
      expect(status.totalCalls).toBe(0);
      expect(status.failureRate).toBe(0);
    });

    it('应该成功执行正常操作', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockOperation);
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.fromFallback).toBe(false);
      expect(result.circuitBreakerState).toBe('CLOSED');
      expect(mockOperation).toHaveBeenCalledTimes(1);

      const status = circuitBreaker.getStatus();
      expect(status.totalCalls).toBe(1);
      expect(status.successCount).toBe(1);
      expect(status.failureCount).toBe(0);
    });

    it('应该处理操作失败', async () => {
      const mockError = new Error('Operation failed');
      const mockOperation = jest.fn().mockRejectedValue(mockError);
      
      const result = await circuitBreaker.execute(mockOperation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
      expect(result.fromFallback).toBe(false);
      expect(result.circuitBreakerState).toBe('CLOSED');

      const status = circuitBreaker.getStatus();
      expect(status.totalCalls).toBe(1);
      expect(status.failureCount).toBe(1);
      expect(status.successCount).toBe(0);
    });
  });

  describe('熔断器状态转换测试', () => {
    it('应该在达到失败阈值时转换到OPEN状态', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // 执行3次失败操作（达到失败阈值）
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockOperation);
      }
      
      const status = circuitBreaker.getStatus();
      expect(status.state).toBe('OPEN');
      expect(status.failureCount).toBe(3);
      expect(status.nextAttemptTime).toBeDefined();
    });

    it('应该在OPEN状态下拒绝调用', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // 先触发熔断
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockOperation);
      }
      
      expect(circuitBreaker.getStatus().state).toBe('OPEN');
      
      // 重置mock以验证不会被调用
      mockOperation.mockClear();
      mockOperation.mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockOperation);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Circuit breaker is OPEN');
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('应该在重置超时后转换到HALF_OPEN状态', async () => {
      // 创建一个重置超时很短的熔断器
      const shortTimeoutBreaker = new CircuitBreaker({
        name: 'short-timeout-breaker',
        failureThreshold: 2,
        resetTimeout: 100, // 100ms
        successThreshold: 1
      });

      try {
        const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
        
        // 触发熔断
        for (let i = 0; i < 2; i++) {
          await shortTimeoutBreaker.execute(mockOperation);
        }
        
        expect(shortTimeoutBreaker.getStatus().state).toBe('OPEN');
        
        // 等待重置超时
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // 下次调用应该转换到HALF_OPEN
        mockOperation.mockResolvedValue('success');
        const result = await shortTimeoutBreaker.execute(mockOperation);
        
        expect(result.success).toBe(true);
        expect(shortTimeoutBreaker.getStatus().state).toBe('CLOSED'); // 成功后应该关闭
        
      } finally {
        shortTimeoutBreaker.destroy();
      }
    });

    it('应该在HALF_OPEN状态成功后转换到CLOSED状态', async () => {
      const shortTimeoutBreaker = new CircuitBreaker({
        name: 'half-open-test-breaker',
        failureThreshold: 2,
        resetTimeout: 50,
        successThreshold: 1
      });

      try {
        const mockOperation = jest.fn();
        
        // 触发熔断
        mockOperation.mockRejectedValue(new Error('Failed'));
        for (let i = 0; i < 2; i++) {
          await shortTimeoutBreaker.execute(mockOperation);
        }
        
        // 等待重置
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 成功调用
        mockOperation.mockResolvedValue('success');
        const result = await shortTimeoutBreaker.execute(mockOperation);
        
        expect(result.success).toBe(true);
        expect(shortTimeoutBreaker.getStatus().state).toBe('CLOSED');
        
      } finally {
        shortTimeoutBreaker.destroy();
      }
    });
  });

  describe('重试机制测试', () => {
    it('应该根据重试配置重试失败的操作', async () => {
      const retryConfig: RetryConfig = {
        maxAttempts: 3,
        initialDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2,
        jitter: false,
        retryableErrors: ['Error'],
        nonRetryableErrors: []
      };

      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Retry 1'))
        .mockRejectedValueOnce(new Error('Retry 2'))
        .mockResolvedValue('success');

      const result = await circuitBreaker.execute(mockOperation, retryConfig);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('应该在达到最大重试次数后失败', async () => {
      const retryConfig: RetryConfig = {
        maxAttempts: 2,
        initialDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2,
        jitter: false,
        retryableErrors: ['Error'],
        nonRetryableErrors: []
      };

      const mockOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      const result = await circuitBreaker.execute(mockOperation, retryConfig);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Always fails');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('应该不重试非重试错误', async () => {
      const retryConfig: RetryConfig = {
        maxAttempts: 3,
        initialDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2,
        jitter: false,
        retryableErrors: [],
        nonRetryableErrors: ['TypeError']
      };

      const mockOperation = jest.fn().mockRejectedValue(new TypeError('Non-retryable error'));

      const result = await circuitBreaker.execute(mockOperation, retryConfig);

      expect(result.success).toBe(false);
      expect(mockOperation).toHaveBeenCalledTimes(1); // 不应该重试
    });
  });

  describe('超时处理测试', () => {
    it('应该在超时时中断操作', async () => {
      const timeoutConfig: TimeoutConfig = {
        enabled: true,
        timeoutMs: 100,
        timeoutMessage: 'Operation timed out'
      };

      const mockOperation = jest.fn(() => new Promise(resolve => setTimeout(resolve, 200)));

      const result = await circuitBreaker.execute(mockOperation, undefined, timeoutConfig);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Operation timed out');
    });

    it('应该在超时前完成正常操作', async () => {
      const timeoutConfig: TimeoutConfig = {
        enabled: true,
        timeoutMs: 200,
        timeoutMessage: 'Operation timed out'
      };

      const mockOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 50))
      );

      const result = await circuitBreaker.execute(mockOperation, undefined, timeoutConfig);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
    });
  });

  describe('降级策略测试', () => {
    it('应该在操作失败时执行降级函数', async () => {
      const fallbackConfig: FallbackConfig<string> = {
        enabled: true,
        fallbackFunction: () => 'fallback result'
      };

      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      const result = await circuitBreaker.execute(mockOperation, undefined, undefined, fallbackConfig);

      expect(result.success).toBe(true);
      expect(result.result).toBe('fallback result');
      expect(result.fromFallback).toBe(true);
    });

    it('应该在熔断器OPEN时执行降级', async () => {
      const fallbackConfig: FallbackConfig<string> = {
        enabled: true,
        fallbackValue: 'fallback value'
      };

      // 先触发熔断
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockOperation);
      }

      expect(circuitBreaker.getStatus().state).toBe('OPEN');

      // 执行降级
      const result = await circuitBreaker.execute(mockOperation, undefined, undefined, fallbackConfig);

      expect(result.success).toBe(true);
      expect(result.result).toBe('fallback value');
      expect(result.fromFallback).toBe(true);
    });

    it('应该处理降级函数失败', async () => {
      const fallbackConfig: FallbackConfig<string> = {
        enabled: true,
        fallbackFunction: () => { throw new Error('Fallback failed'); }
      };

      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));

      const result = await circuitBreaker.execute(mockOperation, undefined, undefined, fallbackConfig);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Fallback failed');
      expect(result.fromFallback).toBe(true);
    });
  });

  describe('指标和监控测试', () => {
    it('应该收集正确的指标数据', async () => {
      const mockOperation = jest.fn();
      
      // 执行一些成功和失败的操作
      mockOperation.mockResolvedValue('success');
      await circuitBreaker.execute(mockOperation);
      await circuitBreaker.execute(mockOperation);
      
      mockOperation.mockRejectedValue(new Error('Failed'));
      await circuitBreaker.execute(mockOperation);

      const metrics = circuitBreaker.getMetrics();

      expect(metrics.name).toBe('test-circuit-breaker');
      expect(metrics.totalCalls).toBe(3);
      expect(metrics.successfulCalls).toBe(2);
      expect(metrics.failedCalls).toBe(1);
      expect(metrics.successRate).toBeCloseTo(66.67, 1);
      expect(metrics.failureRate).toBeCloseTo(33.33, 1);
      expect(metrics.currentState).toBe('CLOSED');
    });

    it('应该记录状态转换', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // 触发状态转换
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockOperation);
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.stateTransitions).toHaveLength(1);
      expect(metrics.stateTransitions[0].fromState).toBe('CLOSED');
      expect(metrics.stateTransitions[0].toState).toBe('OPEN');
      expect(metrics.stateTransitions[0].reason).toBe('failure_threshold_reached');
    });
  });

  describe('事件监听测试', () => {
    it('应该触发状态变化事件', async () => {
      const stateChangeEvents: any[] = [];
      
      circuitBreaker.on('state_change', (event) => {
        stateChangeEvents.push(event);
      });

      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // 触发状态变化
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(mockOperation);
      }

      expect(stateChangeEvents).toHaveLength(1);
      expect(stateChangeEvents[0].type).toBe('state_change');
      expect(stateChangeEvents[0].circuitBreakerName).toBe('test-circuit-breaker');
    });

    it('应该触发调用成功和失败事件', async () => {
      const events: any[] = [];
      
      circuitBreaker.on('call_success', (event) => events.push(event));
      circuitBreaker.on('call_failure', (event) => events.push(event));

      const mockOperation = jest.fn();
      
      // 成功调用
      mockOperation.mockResolvedValue('success');
      await circuitBreaker.execute(mockOperation);
      
      // 失败调用
      mockOperation.mockRejectedValue(new Error('Failed'));
      await circuitBreaker.execute(mockOperation);

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('call_success');
      expect(events[1].type).toBe('call_failure');
    });
  });

  describe('重置功能测试', () => {
    it('应该重置熔断器状态', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      // 触发一些失败
      for (let i = 0; i < 2; i++) {
        await circuitBreaker.execute(mockOperation);
      }

      let status = circuitBreaker.getStatus();
      expect(status.failureCount).toBe(2);
      expect(status.totalCalls).toBe(2);

      // 重置
      circuitBreaker.reset();

      status = circuitBreaker.getStatus();
      expect(status.state).toBe('CLOSED');
      expect(status.failureCount).toBe(0);
      expect(status.successCount).toBe(0);
      expect(status.lastFailureTime).toBeUndefined();
      expect(status.lastSuccessTime).toBeUndefined();
    });
  });
});

describe('CircuitBreakerManager测试', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = new CircuitBreakerManager({
      failureThreshold: 3,
      resetTimeout: 5000
    });
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('熔断器管理测试', () => {
    it('应该创建和获取熔断器', () => {
      const cb1 = manager.getCircuitBreaker('service1');
      const cb2 = manager.getCircuitBreaker('service1'); // 应该返回同一个实例
      const cb3 = manager.getCircuitBreaker('service2');

      expect(cb1).toBe(cb2);
      expect(cb1).not.toBe(cb3);
      expect(cb1.getStatus().name).toBe('service1');
      expect(cb3.getStatus().name).toBe('service2');
    });

    it('应该获取所有熔断器状态', async () => {
      const cb1 = manager.getCircuitBreaker('service1');
      const cb2 = manager.getCircuitBreaker('service2');

      // 执行一些操作
      await cb1.execute(() => Promise.resolve('success'));
      await cb2.execute(() => Promise.reject(new Error('failed')));

      const allStatus = manager.getAllStatus();
      expect(allStatus).toHaveLength(2);
      expect(allStatus.find(s => s.name === 'service1')?.successCount).toBe(1);
      expect(allStatus.find(s => s.name === 'service2')?.failureCount).toBe(1);
    });

    it('应该获取所有熔断器指标', async () => {
      const cb1 = manager.getCircuitBreaker('service1');
      await cb1.execute(() => Promise.resolve('success'));

      const allMetrics = manager.getAllMetrics();
      expect(allMetrics).toHaveLength(1);
      expect(allMetrics[0].name).toBe('service1');
      expect(allMetrics[0].totalCalls).toBe(1);
    });

    it('应该重置所有熔断器', async () => {
      const cb1 = manager.getCircuitBreaker('service1');
      const cb2 = manager.getCircuitBreaker('service2');

      // 执行一些操作
      await cb1.execute(() => Promise.resolve('success'));
      await cb2.execute(() => Promise.reject(new Error('failed')));

      // 重置所有
      manager.resetAll();

      const allStatus = manager.getAllStatus();
      allStatus.forEach(status => {
        expect(status.state).toBe('CLOSED');
        expect(status.failureCount).toBe(0);
        expect(status.successCount).toBe(0);
      });
    });
  });
});
