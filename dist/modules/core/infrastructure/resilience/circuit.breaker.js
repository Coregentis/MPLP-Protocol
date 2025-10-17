"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerManager = exports.CircuitBreaker = void 0;
class CircuitBreaker {
    config;
    state = 'CLOSED';
    failureCount = 0;
    successCount = 0;
    lastFailureTime;
    lastSuccessTime;
    nextAttemptTime;
    totalCalls = 0;
    responseTimes = [];
    stateTransitions = [];
    eventListeners = new Map();
    monitoringTimer;
    createdAt;
    constructor(config = {}) {
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
    async execute(operation, retryConfig, timeoutConfig, fallbackConfig) {
        const startTime = Date.now();
        try {
            if (!this.canExecute()) {
                return await this.handleRejectedCall(fallbackConfig, startTime);
            }
            const result = await this.executeWithResilience(operation, retryConfig, timeoutConfig);
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
            this.onFailure(error, Date.now() - startTime);
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
    getMetrics() {
        const successfulCalls = this.totalCalls - this.failureCount;
        return {
            name: this.config.name,
            totalCalls: this.totalCalls,
            successfulCalls,
            failedCalls: this.failureCount,
            rejectedCalls: 0,
            averageResponseTime: this.calculateAverageResponseTime(),
            failureRate: this.calculateFailureRate(),
            successRate: this.totalCalls > 0 ? (successfulCalls / this.totalCalls) * 100 : 0,
            currentState: this.state,
            stateTransitions: [...this.stateTransitions],
            lastMetricsReset: this.createdAt.toISOString()
        };
    }
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
    on(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(listener);
    }
    off(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    destroy() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = undefined;
        }
        this.eventListeners.clear();
    }
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
        const timeoutPromise = timeoutConfig?.enabled
            ? this.createTimeoutPromise(timeoutConfig)
            : undefined;
        if (retryConfig) {
            return await this.executeWithRetry(operation, retryConfig, timeoutPromise);
        }
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
                if (attempt === retryConfig.maxAttempts || !this.shouldRetry(error, retryConfig)) {
                    throw error;
                }
                const delay = this.calculateRetryDelay(attempt, retryConfig);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
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
        if (retryConfig.nonRetryableErrors.includes(errorName)) {
            return false;
        }
        if (retryConfig.retryableErrors.length > 0) {
            return retryConfig.retryableErrors.includes(errorName);
        }
        return true;
    }
    calculateRetryDelay(attempt, retryConfig) {
        let delay = retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
        delay = Math.min(delay, retryConfig.maxDelay);
        if (retryConfig.jitter) {
            delay *= (0.5 + Math.random() * 0.5);
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
        if (this.responseTimes.length > 100) {
            this.responseTimes = this.responseTimes.slice(-50);
        }
        this.emitEvent('call_success', { responseTime });
        if (this.state === 'HALF_OPEN' && this.successCount >= this.config.successThreshold) {
            this.transitionTo('CLOSED', 'success_threshold_reached');
            this.failureCount = 0;
        }
    }
    onFailure(error, responseTime) {
        this.totalCalls++;
        this.failureCount++;
        this.lastFailureTime = new Date();
        this.responseTimes.push(responseTime);
        this.emitEvent('call_failure', { error: error.message, responseTime });
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
class CircuitBreakerManager {
    circuitBreakers = new Map();
    globalConfig;
    constructor(globalConfig = {}) {
        this.globalConfig = globalConfig;
    }
    getCircuitBreaker(name, config) {
        if (!this.circuitBreakers.has(name)) {
            const mergedConfig = { ...this.globalConfig, ...config, name };
            this.circuitBreakers.set(name, new CircuitBreaker(mergedConfig));
        }
        return this.circuitBreakers.get(name);
    }
    getAllStatus() {
        return Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
    }
    getAllMetrics() {
        return Array.from(this.circuitBreakers.values()).map(cb => cb.getMetrics());
    }
    resetAll() {
        this.circuitBreakers.forEach(cb => cb.reset());
    }
    destroy() {
        this.circuitBreakers.forEach(cb => cb.destroy());
        this.circuitBreakers.clear();
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
