/**
 * CircuitBreaker - 熔断器模式实现
 * 基础容错和故障恢复机制的核心组件
 * 包括：熔断器模式、重试机制、超时处理、降级策略
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../types';

// ===== 熔断器配置接口 =====

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
  fallbackEnabled: boolean;
  metricsEnabled: boolean;
  notificationEnabled: boolean;
}

// ===== 熔断器状态接口 =====

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  name: string;
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Timestamp;
  lastSuccessTime?: Timestamp;
  nextAttemptTime?: Timestamp;
  totalCalls: number;
  failureRate: number;
  averageResponseTime: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== 执行结果接口 =====

export interface ExecutionResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  executionTime: number;
  fromFallback: boolean;
  circuitBreakerState: CircuitBreakerState;
  timestamp: Timestamp;
}

// ===== 重试配置接口 =====

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  nonRetryableErrors: string[];
}

// ===== 超时配置接口 =====

export interface TimeoutConfig {
  enabled: boolean;
  timeoutMs: number;
  timeoutMessage: string;
  onTimeout?: () => void;
}

// ===== 降级策略接口 =====

export interface FallbackConfig<T> {
  enabled: boolean;
  fallbackFunction?: () => Promise<T> | T;
  fallbackValue?: T;
  fallbackTimeout?: number;
}

// ===== 监控和通知接口 =====

export interface CircuitBreakerMetrics {
  name: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  averageResponseTime: number;
  failureRate: number;
  successRate: number;
  currentState: CircuitBreakerState;
  stateTransitions: StateTransition[];
  lastMetricsReset: Timestamp;
}

export interface StateTransition {
  fromState: CircuitBreakerState;
  toState: CircuitBreakerState;
  timestamp: Timestamp;
  reason: string;
  triggerValue?: number;
}

export type CircuitBreakerEventType = 'state_change' | 'call_success' | 'call_failure' | 'call_timeout' | 'fallback_executed';

export interface CircuitBreakerEvent {
  eventId: UUID;
  type: CircuitBreakerEventType;
  circuitBreakerName: string;
  timestamp: Timestamp;
  data: Record<string, unknown>;
}

// ===== 熔断器实现 =====

export class CircuitBreaker<T = unknown> {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttemptTime?: Date;
  private totalCalls = 0;
  private responseTimes: number[] = [];
  private stateTransitions: StateTransition[] = [];
  private eventListeners: Map<CircuitBreakerEventType, ((event: CircuitBreakerEvent) => void)[]> = new Map();
  private monitoringTimer?: NodeJS.Timeout;
  private createdAt: Date;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      name: config.name || 'default',
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 3,
      timeout: config.timeout || 10000,
      resetTimeout: config.resetTimeout || 60000,
      monitoringPeriod: config.monitoringPeriod || 10000,
      halfOpenMaxCalls: config.halfOpenMaxCalls || 3,
      fallbackEnabled: config.fallbackEnabled ?? true,
      metricsEnabled: config.metricsEnabled ?? true,
      notificationEnabled: config.notificationEnabled ?? true
    };

    this.createdAt = new Date();
    this.startMonitoring();
  }

  /**
   * 执行受保护的操作
   */
  async execute<R = T>(
    operation: () => Promise<R>,
    retryConfig?: RetryConfig,
    timeoutConfig?: TimeoutConfig,
    fallbackConfig?: FallbackConfig<R>
  ): Promise<ExecutionResult<R>> {
    const startTime = Date.now();
    
    try {
      // 检查熔断器状态
      if (!this.canExecute()) {
        return await this.handleRejectedCall(fallbackConfig, startTime);
      }

      // 执行操作（带重试和超时）
      const result = await this.executeWithResilience(operation, retryConfig, timeoutConfig);
      
      // 记录成功
      this.onSuccess(Date.now() - startTime);
      
      return {
        success: true,
        result,
        executionTime: Date.now() - startTime,
        fromFallback: false,
        circuitBreakerState: this.state,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // 记录失败
      this.onFailure(error as Error, Date.now() - startTime);
      
      // 尝试降级
      if (fallbackConfig?.enabled) {
        try {
          const fallbackResult = await this.executeFallback(fallbackConfig);
          return {
            success: true,
            result: fallbackResult,
            executionTime: Date.now() - startTime,
            fromFallback: true,
            circuitBreakerState: this.state,
            timestamp: new Date().toISOString()
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: fallbackError as Error,
            executionTime: Date.now() - startTime,
            fromFallback: true,
            circuitBreakerState: this.state,
            timestamp: new Date().toISOString()
          };
        }
      }

      return {
        success: false,
        error: error as Error,
        executionTime: Date.now() - startTime,
        fromFallback: false,
        circuitBreakerState: this.state,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取熔断器状态
   */
  getStatus(): CircuitBreakerStatus {
    return {
      name: this.config.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime?.toISOString(),
      lastSuccessTime: this.lastSuccessTime?.toISOString(),
      nextAttemptTime: this.nextAttemptTime?.toISOString(),
      totalCalls: this.totalCalls,
      failureRate: this.calculateFailureRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取指标数据
   */
  getMetrics(): CircuitBreakerMetrics {
    const successfulCalls = this.totalCalls - this.failureCount;
    
    return {
      name: this.config.name,
      totalCalls: this.totalCalls,
      successfulCalls,
      failedCalls: this.failureCount,
      rejectedCalls: 0, // 简化实现
      averageResponseTime: this.calculateAverageResponseTime(),
      failureRate: this.calculateFailureRate(),
      successRate: this.totalCalls > 0 ? (successfulCalls / this.totalCalls) * 100 : 0,
      currentState: this.state,
      stateTransitions: [...this.stateTransitions],
      lastMetricsReset: this.createdAt.toISOString()
    };
  }

  /**
   * 重置熔断器
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptTime = undefined;
    this.responseTimes = [];
    
    this.emitEvent('state_change', {
      fromState: this.state,
      toState: 'CLOSED',
      reason: 'manual_reset'
    });
  }

  /**
   * 添加事件监听器
   */
  on(eventType: CircuitBreakerEventType, listener: (event: CircuitBreakerEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  off(eventType: CircuitBreakerEventType, listener: (event: CircuitBreakerEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 销毁熔断器
   */
  destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    this.eventListeners.clear();
  }

  // ===== 私有方法 =====

  private canExecute(): boolean {
    switch (this.state) {
      case 'CLOSED':
        return true;
      case 'OPEN':
        if (this.nextAttemptTime && new Date() >= this.nextAttemptTime) {
          this.transitionTo('HALF_OPEN', 'reset_timeout_expired');
          return true;
        }
        return false;
      case 'HALF_OPEN':
        return this.successCount < this.config.halfOpenMaxCalls;
      default:
        return false;
    }
  }

  private async executeWithResilience<R>(
    operation: () => Promise<R>,
    retryConfig?: RetryConfig,
    timeoutConfig?: TimeoutConfig
  ): Promise<R> {
    // 应用超时
    const timeoutPromise = timeoutConfig?.enabled
      ? this.createTimeoutPromise<R>(timeoutConfig)
      : undefined;

    // 应用重试
    if (retryConfig) {
      return await this.executeWithRetry(operation, retryConfig, timeoutPromise);
    }

    // 直接执行
    if (timeoutPromise) {
      return await Promise.race([operation(), timeoutPromise]);
    }

    return await operation();
  }

  private async executeWithRetry<R>(
    operation: () => Promise<R>,
    retryConfig: RetryConfig,
    timeoutPromise?: Promise<R>
  ): Promise<R> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const operationPromise = operation();
        const result = timeoutPromise 
          ? await Promise.race([operationPromise, timeoutPromise])
          : await operationPromise;
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // 检查是否应该重试
        if (attempt === retryConfig.maxAttempts || !this.shouldRetry(error as Error, retryConfig)) {
          throw error;
        }
        
        // 计算延迟时间
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  private createTimeoutPromise<R>(timeoutConfig: TimeoutConfig): Promise<R> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        if (timeoutConfig.onTimeout) {
          timeoutConfig.onTimeout();
        }
        reject(new Error(timeoutConfig.timeoutMessage || 'Operation timed out'));
      }, timeoutConfig.timeoutMs);
    });
  }

  private shouldRetry(error: Error, retryConfig: RetryConfig): boolean {
    const errorName = error.constructor.name;
    
    // 检查非重试错误
    if (retryConfig.nonRetryableErrors.includes(errorName)) {
      return false;
    }
    
    // 检查可重试错误
    if (retryConfig.retryableErrors.length > 0) {
      return retryConfig.retryableErrors.includes(errorName);
    }
    
    // 默认重试
    return true;
  }

  private calculateRetryDelay(attempt: number, retryConfig: RetryConfig): number {
    let delay = retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, retryConfig.maxDelay);
    
    if (retryConfig.jitter) {
      delay *= (0.5 + Math.random() * 0.5); // 添加50%的随机抖动
    }
    
    return delay;
  }

  private async executeFallback<R>(fallbackConfig: FallbackConfig<R>): Promise<R> {
    if (fallbackConfig.fallbackFunction) {
      const fallbackPromise = Promise.resolve(fallbackConfig.fallbackFunction());
      
      if (fallbackConfig.fallbackTimeout) {
        const timeoutPromise = new Promise<R>((_, reject) => {
          setTimeout(() => reject(new Error('Fallback timeout')), fallbackConfig.fallbackTimeout);
        });
        
        return await Promise.race([fallbackPromise, timeoutPromise]);
      }
      
      return await fallbackPromise;
    }
    
    if (fallbackConfig.fallbackValue !== undefined) {
      return fallbackConfig.fallbackValue;
    }
    
    throw new Error('No fallback configured');
  }

  private async handleRejectedCall<R>(
    fallbackConfig?: FallbackConfig<R>,
    startTime: number = Date.now()
  ): Promise<ExecutionResult<R>> {
    this.emitEvent('call_failure', { reason: 'circuit_breaker_open' });
    
    if (fallbackConfig?.enabled) {
      try {
        const fallbackResult = await this.executeFallback(fallbackConfig);
        this.emitEvent('fallback_executed', { success: true });
        
        return {
          success: true,
          result: fallbackResult,
          executionTime: Date.now() - startTime,
          fromFallback: true,
          circuitBreakerState: this.state,
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        this.emitEvent('fallback_executed', { success: false, error: (fallbackError as Error).message });
        
        return {
          success: false,
          error: fallbackError as Error,
          executionTime: Date.now() - startTime,
          fromFallback: true,
          circuitBreakerState: this.state,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return {
      success: false,
      error: new Error('Circuit breaker is OPEN'),
      executionTime: Date.now() - startTime,
      fromFallback: false,
      circuitBreakerState: this.state,
      timestamp: new Date().toISOString()
    };
  }

  private onSuccess(responseTime: number): void {
    this.totalCalls++;
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.responseTimes.push(responseTime);
    
    // 限制响应时间数组大小
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-50);
    }
    
    this.emitEvent('call_success', { responseTime });
    
    // 状态转换逻辑
    if (this.state === 'HALF_OPEN' && this.successCount >= this.config.successThreshold) {
      this.transitionTo('CLOSED', 'success_threshold_reached');
      this.failureCount = 0; // 重置失败计数
    }
  }

  private onFailure(error: Error, responseTime: number): void {
    this.totalCalls++;
    this.failureCount++;
    this.lastFailureTime = new Date();
    this.responseTimes.push(responseTime);
    
    this.emitEvent('call_failure', { error: error.message, responseTime });
    
    // 状态转换逻辑
    if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('OPEN', 'failure_threshold_reached');
      this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
    } else if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN', 'failure_in_half_open');
      this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
    }
  }

  private transitionTo(newState: CircuitBreakerState, reason: string): void {
    const oldState = this.state;
    this.state = newState;
    
    const transition: StateTransition = {
      fromState: oldState,
      toState: newState,
      timestamp: new Date().toISOString(),
      reason,
      triggerValue: newState === 'OPEN' ? this.failureCount : this.successCount
    };
    
    this.stateTransitions.push(transition);
    
    // 限制转换历史大小
    if (this.stateTransitions.length > 50) {
      this.stateTransitions = this.stateTransitions.slice(-25);
    }
    
    this.emitEvent('state_change', {
      fromState: transition.fromState,
      toState: transition.toState,
      timestamp: transition.timestamp,
      reason: transition.reason,
      triggerValue: transition.triggerValue
    });
    
    console.log(`Circuit breaker '${this.config.name}' transitioned from ${oldState} to ${newState}: ${reason}`);
  }

  private calculateFailureRate(): number {
    if (this.totalCalls === 0) return 0;
    return (this.failureCount / this.totalCalls) * 100;
  }

  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.responseTimes.length;
  }

  private startMonitoring(): void {
    if (!this.config.metricsEnabled) return;
    
    this.monitoringTimer = setInterval(() => {
      const metrics = this.getMetrics();
      console.log(`Circuit breaker '${this.config.name}' metrics:`, {
        state: metrics.currentState,
        totalCalls: metrics.totalCalls,
        failureRate: metrics.failureRate.toFixed(2) + '%',
        avgResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms'
      });
    }, this.config.monitoringPeriod);
  }

  private emitEvent(type: CircuitBreakerEventType, data: Record<string, unknown>): void {
    if (!this.config.notificationEnabled) return;
    
    const event: CircuitBreakerEvent = {
      eventId: this.generateUUID(),
      type,
      circuitBreakerName: this.config.name,
      timestamp: new Date().toISOString(),
      data
    };
    
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in circuit breaker event listener:`, error);
        }
      });
    }
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ===== 熔断器管理器 =====

export class CircuitBreakerManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private globalConfig: Partial<CircuitBreakerConfig>;

  constructor(globalConfig: Partial<CircuitBreakerConfig> = {}) {
    this.globalConfig = globalConfig;
  }

  /**
   * 创建或获取熔断器
   */
  getCircuitBreaker<T>(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker<T> {
    if (!this.circuitBreakers.has(name)) {
      const mergedConfig = { ...this.globalConfig, ...config, name };
      this.circuitBreakers.set(name, new CircuitBreaker<T>(mergedConfig));
    }
    
    return this.circuitBreakers.get(name)! as CircuitBreaker<T>;
  }

  /**
   * 获取所有熔断器状态
   */
  getAllStatus(): CircuitBreakerStatus[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
  }

  /**
   * 获取所有熔断器指标
   */
  getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getMetrics());
  }

  /**
   * 重置所有熔断器
   */
  resetAll(): void {
    this.circuitBreakers.forEach(cb => cb.reset());
  }

  /**
   * 销毁所有熔断器
   */
  destroy(): void {
    this.circuitBreakers.forEach(cb => cb.destroy());
    this.circuitBreakers.clear();
  }
}
