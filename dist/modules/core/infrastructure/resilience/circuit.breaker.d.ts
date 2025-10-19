/**
 * CircuitBreaker - 熔断器模式实现
 * 基础容错和故障恢复机制的核心组件
 * 包括：熔断器模式、重试机制、超时处理、降级策略
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
import { UUID, Timestamp } from '../../types';
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
export interface ExecutionResult<T> {
    success: boolean;
    result?: T;
    error?: Error;
    executionTime: number;
    fromFallback: boolean;
    circuitBreakerState: CircuitBreakerState;
    timestamp: Timestamp;
}
export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
    retryableErrors: string[];
    nonRetryableErrors: string[];
}
export interface TimeoutConfig {
    enabled: boolean;
    timeoutMs: number;
    timeoutMessage: string;
    onTimeout?: () => void;
}
export interface FallbackConfig<T> {
    enabled: boolean;
    fallbackFunction?: () => Promise<T> | T;
    fallbackValue?: T;
    fallbackTimeout?: number;
}
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
export declare class CircuitBreaker<T = unknown> {
    private config;
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime?;
    private lastSuccessTime?;
    private nextAttemptTime?;
    private totalCalls;
    private responseTimes;
    private stateTransitions;
    private eventListeners;
    private monitoringTimer?;
    private createdAt;
    constructor(config?: Partial<CircuitBreakerConfig>);
    /**
     * 执行受保护的操作
     */
    execute<R = T>(operation: () => Promise<R>, retryConfig?: RetryConfig, timeoutConfig?: TimeoutConfig, fallbackConfig?: FallbackConfig<R>): Promise<ExecutionResult<R>>;
    /**
     * 获取熔断器状态
     */
    getStatus(): CircuitBreakerStatus;
    /**
     * 获取指标数据
     */
    getMetrics(): CircuitBreakerMetrics;
    /**
     * 重置熔断器
     */
    reset(): void;
    /**
     * 添加事件监听器
     */
    on(eventType: CircuitBreakerEventType, listener: (event: CircuitBreakerEvent) => void): void;
    /**
     * 移除事件监听器
     */
    off(eventType: CircuitBreakerEventType, listener: (event: CircuitBreakerEvent) => void): void;
    /**
     * 销毁熔断器
     */
    destroy(): void;
    private canExecute;
    private executeWithResilience;
    private executeWithRetry;
    private createTimeoutPromise;
    private shouldRetry;
    private calculateRetryDelay;
    private executeFallback;
    private handleRejectedCall;
    private onSuccess;
    private onFailure;
    private transitionTo;
    private calculateFailureRate;
    private calculateAverageResponseTime;
    private startMonitoring;
    private emitEvent;
    private generateUUID;
}
export declare class CircuitBreakerManager {
    private circuitBreakers;
    private globalConfig;
    constructor(globalConfig?: Partial<CircuitBreakerConfig>);
    /**
     * 创建或获取熔断器
     */
    getCircuitBreaker<T>(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker<T>;
    /**
     * 获取所有熔断器状态
     */
    getAllStatus(): CircuitBreakerStatus[];
    /**
     * 获取所有熔断器指标
     */
    getAllMetrics(): CircuitBreakerMetrics[];
    /**
     * 重置所有熔断器
     */
    resetAll(): void;
    /**
     * 销毁所有熔断器
     */
    destroy(): void;
}
//# sourceMappingURL=circuit.breaker.d.ts.map