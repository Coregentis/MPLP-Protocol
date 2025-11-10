"use strict";
/**
 * CircuitBreaker - 熔断器模式实现
 * 基础容错和故障恢复机制的核心组件
 * 包括：熔断器模式、重试机制、超时处理、降级策略
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerManager = exports.CircuitBreaker = void 0;
// ===== 熔断器实现 =====
class CircuitBreaker {
    constructor(config = {}) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.totalCalls = 0;
        this.responseTimes = [];
        this.stateTransitions = [];
        this.eventListeners = new Map();
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
    async execute(operation, retryConfig, timeoutConfig, fallbackConfig) {
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
        }
        catch (error) {
            // 记录失败
            this.onFailure(error, Date.now() - startTime);
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
                }
                catch (fallbackError) {
                    return {
                        success: false,
                        error: fallbackError,
                        executionTime: Date.now() - startTime,
                        fromFallback: true,
                        circuitBreakerState: this.state,
                        timestamp: new Date().toISOString()
                    };
                }
            }
            return {
                success: false,
                error: error,
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
    getStatus() {
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
    getMetrics() {
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
    reset() {
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
    on(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.push(listener);
        }
    }
    /**
     * 移除事件监听器
     */
    off(eventType, listener) {
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
    destroy() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = undefined;
        }
        this.eventListeners.clear();
    }
    // ===== 私有方法 =====
    canExecute() {
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
    async executeWithResilience(operation, retryConfig, timeoutConfig) {
        // 应用超时
        const timeoutPromise = timeoutConfig?.enabled
            ? this.createTimeoutPromise(timeoutConfig)
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
    async executeWithRetry(operation, retryConfig, timeoutPromise) {
        let lastError;
        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                const operationPromise = operation();
                const result = timeoutPromise
                    ? await Promise.race([operationPromise, timeoutPromise])
                    : await operationPromise;
                return result;
            }
            catch (error) {
                lastError = error;
                // 检查是否应该重试
                if (attempt === retryConfig.maxAttempts || !this.shouldRetry(error, retryConfig)) {
                    throw error;
                }
                // 计算延迟时间
                const delay = this.calculateRetryDelay(attempt, retryConfig);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // 这个分支理论上不会到达，但为了类型安全
        throw lastError || new Error('Retry failed with unknown error');
    }
    createTimeoutPromise(timeoutConfig) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                if (timeoutConfig.onTimeout) {
                    timeoutConfig.onTimeout();
                }
                reject(new Error(timeoutConfig.timeoutMessage || 'Operation timed out'));
            }, timeoutConfig.timeoutMs);
        });
    }
    shouldRetry(error, retryConfig) {
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
    calculateRetryDelay(attempt, retryConfig) {
        let delay = retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
        delay = Math.min(delay, retryConfig.maxDelay);
        if (retryConfig.jitter) {
            delay *= (0.5 + Math.random() * 0.5); // 添加50%的随机抖动
        }
        return delay;
    }
    async executeFallback(fallbackConfig) {
        if (fallbackConfig.fallbackFunction) {
            const fallbackPromise = Promise.resolve(fallbackConfig.fallbackFunction());
            if (fallbackConfig.fallbackTimeout) {
                const timeoutPromise = new Promise((_, reject) => {
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
    async handleRejectedCall(fallbackConfig, startTime = Date.now()) {
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
            }
            catch (fallbackError) {
                this.emitEvent('fallback_executed', { success: false, error: fallbackError.message });
                return {
                    success: false,
                    error: fallbackError,
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
    onSuccess(responseTime) {
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
    onFailure(error, responseTime) {
        this.totalCalls++;
        this.failureCount++;
        this.lastFailureTime = new Date();
        this.responseTimes.push(responseTime);
        this.emitEvent('call_failure', { error: error.message, responseTime });
        // 状态转换逻辑
        if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
            this.transitionTo('OPEN', 'failure_threshold_reached');
            this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
        }
        else if (this.state === 'HALF_OPEN') {
            this.transitionTo('OPEN', 'failure_in_half_open');
            this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
        }
    }
    transitionTo(newState, reason) {
        const oldState = this.state;
        this.state = newState;
        const transition = {
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
    calculateFailureRate() {
        if (this.totalCalls === 0)
            return 0;
        return (this.failureCount / this.totalCalls) * 100;
    }
    calculateAverageResponseTime() {
        if (this.responseTimes.length === 0)
            return 0;
        const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
        return sum / this.responseTimes.length;
    }
    startMonitoring() {
        if (!this.config.metricsEnabled)
            return;
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
    emitEvent(type, data) {
        if (!this.config.notificationEnabled)
            return;
        const event = {
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
                }
                catch (error) {
                    console.error(`Error in circuit breaker event listener:`, error);
                }
            });
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.CircuitBreaker = CircuitBreaker;
// ===== 熔断器管理器 =====
class CircuitBreakerManager {
    constructor(globalConfig = {}) {
        this.circuitBreakers = new Map();
        this.globalConfig = globalConfig;
    }
    /**
     * 创建或获取熔断器
     */
    getCircuitBreaker(name, config) {
        if (!this.circuitBreakers.has(name)) {
            const mergedConfig = { ...this.globalConfig, ...config, name };
            this.circuitBreakers.set(name, new CircuitBreaker(mergedConfig));
        }
        const circuitBreaker = this.circuitBreakers.get(name);
        if (!circuitBreaker) {
            throw new Error(`Circuit breaker ${name} not found`);
        }
        return circuitBreaker;
    }
    /**
     * 获取所有熔断器状态
     */
    getAllStatus() {
        return Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
    }
    /**
     * 获取所有熔断器指标
     */
    getAllMetrics() {
        return Array.from(this.circuitBreakers.values()).map(cb => cb.getMetrics());
    }
    /**
     * 重置所有熔断器
     */
    resetAll() {
        this.circuitBreakers.forEach(cb => cb.reset());
    }
    /**
     * 销毁所有熔断器
     */
    destroy() {
        this.circuitBreakers.forEach(cb => cb.destroy());
        this.circuitBreakers.clear();
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
//# sourceMappingURL=circuit.breaker.js.map