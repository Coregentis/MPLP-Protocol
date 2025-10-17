"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancer = void 0;
class LoadBalancer {
    config;
    instances = new Map();
    roundRobinCounters = new Map();
    circuitBreakers = new Map();
    stickySessions = new Map();
    routingRules = [];
    healthCheckInterval = null;
    constructor(config = {}) {
        this.config = {
            strategy: 'round_robin',
            healthCheckEnabled: true,
            healthCheckInterval: 30000,
            healthCheckTimeout: 5000,
            failoverEnabled: true,
            maxRetries: 3,
            retryDelay: 1000,
            circuitBreakerEnabled: true,
            circuitBreakerThreshold: 5,
            circuitBreakerTimeout: 60000,
            stickySessionEnabled: false,
            stickySessionTtl: 3600000,
            ...config
        };
        this.startHealthChecking();
    }
    registerInstance(instance) {
        this.instances.set(instance.instanceId, instance);
        if (this.config.circuitBreakerEnabled) {
            this.circuitBreakers.set(instance.instanceId, {
                instanceId: instance.instanceId,
                state: 'closed',
                failureCount: 0,
                successCount: 0
            });
        }
        console.log(`Instance registered: ${instance.serviceName}@${instance.address}:${instance.port}`);
    }
    unregisterInstance(instanceId) {
        this.instances.delete(instanceId);
        this.circuitBreakers.delete(instanceId);
        for (const [sessionId, session] of this.stickySessions.entries()) {
            if (session.instanceId === instanceId) {
                this.stickySessions.delete(sessionId);
            }
        }
        console.log(`Instance unregistered: ${instanceId}`);
    }
    addRoutingRule(rule) {
        this.routingRules.push(rule);
        this.routingRules.sort((a, b) => b.priority - a.priority);
    }
    async routeRequest(request) {
        const startTime = Date.now();
        const attempts = [];
        try {
            const matchedRule = this.findMatchingRule(request);
            if (matchedRule && this.shouldBlockRequest(matchedRule)) {
                return {
                    requestId: request.requestId,
                    selectedInstance: null,
                    routingRule: matchedRule,
                    strategy: this.config.strategy,
                    attempts,
                    totalTime: Date.now() - startTime,
                    success: false,
                    error: 'Request blocked by routing rule'
                };
            }
            const availableInstances = this.getAvailableInstances(request.path);
            if (availableInstances.length === 0) {
                return {
                    requestId: request.requestId,
                    selectedInstance: null,
                    strategy: this.config.strategy,
                    attempts,
                    totalTime: Date.now() - startTime,
                    success: false,
                    error: 'No available instances'
                };
            }
            let selectedInstance = null;
            let lastError;
            for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
                const instance = this.selectInstance(availableInstances, request);
                if (!instance)
                    break;
                const attemptStart = Date.now();
                const attemptResult = {
                    instanceId: instance.instanceId,
                    startTime: new Date(attemptStart).toISOString(),
                    success: false
                };
                try {
                    if (this.config.circuitBreakerEnabled && this.isCircuitBreakerOpen(instance.instanceId)) {
                        attemptResult.error = 'Circuit breaker is open';
                        attempts.push(attemptResult);
                        continue;
                    }
                    const success = await this.processRequest(instance, request);
                    const responseTime = Date.now() - attemptStart;
                    attemptResult.endTime = new Date().toISOString();
                    attemptResult.responseTime = responseTime;
                    attemptResult.success = success;
                    attempts.push(attemptResult);
                    if (success) {
                        selectedInstance = instance;
                        this.updateInstanceMetrics(instance, true, responseTime);
                        this.updateCircuitBreaker(instance.instanceId, true);
                        break;
                    }
                    else {
                        this.updateInstanceMetrics(instance, false, responseTime);
                        this.updateCircuitBreaker(instance.instanceId, false);
                        lastError = 'Request processing failed';
                    }
                }
                catch (error) {
                    attemptResult.error = error instanceof Error ? error.message : 'Unknown error';
                    this.updateInstanceMetrics(instance, false, Date.now() - attemptStart);
                    this.updateCircuitBreaker(instance.instanceId, false);
                    lastError = attemptResult.error;
                }
                attempts.push(attemptResult);
                if (attempt < this.config.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
            if (selectedInstance && this.config.stickySessionEnabled && request.sessionId) {
                this.updateStickySession(request.sessionId, selectedInstance.instanceId);
            }
            return {
                requestId: request.requestId,
                selectedInstance,
                routingRule: matchedRule,
                strategy: this.config.strategy,
                attempts,
                totalTime: Date.now() - startTime,
                success: selectedInstance !== null,
                error: selectedInstance ? undefined : lastError
            };
        }
        catch (error) {
            return {
                requestId: request.requestId,
                selectedInstance: null,
                strategy: this.config.strategy,
                attempts,
                totalTime: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    selectInstance(instances, request) {
        if (instances.length === 0)
            return null;
        if (this.config.stickySessionEnabled && request.sessionId) {
            const stickySession = this.stickySessions.get(request.sessionId);
            if (stickySession && new Date(stickySession.expiresAt) > new Date()) {
                const stickyInstance = instances.find(i => i.instanceId === stickySession.instanceId);
                if (stickyInstance && stickyInstance.healthStatus.isHealthy) {
                    return stickyInstance;
                }
            }
        }
        const healthyInstances = this.config.healthCheckEnabled
            ? instances.filter(i => i.healthStatus.isHealthy && !this.isCircuitBreakerOpen(i.instanceId))
            : instances;
        if (healthyInstances.length === 0) {
            return this.config.failoverEnabled ? instances[0] : null;
        }
        switch (this.config.strategy) {
            case 'round_robin':
                return this.roundRobinSelect(healthyInstances);
            case 'weighted_round_robin':
                return this.weightedRoundRobinSelect(healthyInstances);
            case 'least_connections':
                return this.leastConnectionsSelect(healthyInstances);
            case 'weighted_least_connections':
                return this.weightedLeastConnectionsSelect(healthyInstances);
            case 'response_time':
                return this.responseTimeSelect(healthyInstances);
            case 'random':
                return this.randomSelect(healthyInstances);
            case 'consistent_hash':
                return this.consistentHashSelect(healthyInstances, request);
            case 'ip_hash':
                return this.ipHashSelect(healthyInstances, request);
            default:
                return healthyInstances[0];
        }
    }
    roundRobinSelect(instances) {
        const serviceName = instances[0].serviceName;
        const counter = this.roundRobinCounters.get(serviceName) || 0;
        const selectedIndex = counter % instances.length;
        this.roundRobinCounters.set(serviceName, counter + 1);
        return instances[selectedIndex];
    }
    weightedRoundRobinSelect(instances) {
        const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (const instance of instances) {
            currentWeight += instance.weight;
            if (random <= currentWeight) {
                return instance;
            }
        }
        return instances[0];
    }
    leastConnectionsSelect(instances) {
        return instances.reduce((min, instance) => instance.metrics.activeConnections < min.metrics.activeConnections ? instance : min);
    }
    weightedLeastConnectionsSelect(instances) {
        return instances.reduce((min, instance) => {
            const minRatio = min.metrics.activeConnections / min.weight;
            const instanceRatio = instance.metrics.activeConnections / instance.weight;
            return instanceRatio < minRatio ? instance : min;
        });
    }
    responseTimeSelect(instances) {
        return instances.reduce((min, instance) => instance.metrics.averageResponseTime < min.metrics.averageResponseTime ? instance : min);
    }
    randomSelect(instances) {
        const randomIndex = Math.floor(Math.random() * instances.length);
        return instances[randomIndex];
    }
    consistentHashSelect(instances, request) {
        const hash = this.hashString(request.path + request.clientIp);
        const index = hash % instances.length;
        return instances[index];
    }
    ipHashSelect(instances, request) {
        const hash = this.hashString(request.clientIp);
        const index = hash % instances.length;
        return instances[index];
    }
    getAvailableInstances(_path) {
        return Array.from(this.instances.values())
            .filter(instance => instance.status === 'active')
            .sort((a, b) => a.port - b.port);
    }
    findMatchingRule(request) {
        return this.routingRules.find(rule => rule.enabled && this.matchesConditions(request, rule.conditions));
    }
    matchesConditions(request, conditions) {
        return conditions.every(condition => this.matchesCondition(request, condition));
    }
    matchesCondition(request, condition) {
        let value;
        let compareValue;
        switch (condition.type) {
            case 'path':
                value = request.path;
                compareValue = condition.value;
                break;
            case 'method':
                value = request.method;
                compareValue = condition.value;
                break;
            case 'ip':
                value = request.clientIp;
                compareValue = condition.value;
                break;
            case 'user_agent':
                value = request.userAgent;
                compareValue = condition.value;
                break;
            case 'header':
                value = request.headers[condition.value] || '';
                compareValue = condition.expectedValue || condition.value;
                break;
            case 'query':
                value = request.query[condition.value] || '';
                compareValue = condition.expectedValue || condition.value;
                break;
            default:
                return false;
        }
        if (!condition.caseSensitive) {
            value = value.toLowerCase();
        }
        const targetValue = condition.caseSensitive
            ? compareValue
            : (typeof compareValue === 'string' ? compareValue.toLowerCase() : compareValue);
        switch (condition.operator) {
            case 'equals':
                return value === targetValue;
            case 'contains':
                return typeof targetValue === 'string' && value.includes(targetValue);
            case 'starts_with':
                return typeof targetValue === 'string' && value.startsWith(targetValue);
            case 'ends_with':
                return typeof targetValue === 'string' && value.endsWith(targetValue);
            case 'regex':
                return typeof targetValue === 'string' && new RegExp(targetValue).test(value);
            case 'in':
                return Array.isArray(targetValue) && targetValue.includes(value);
            default:
                return false;
        }
    }
    shouldBlockRequest(rule) {
        return rule.actions.some(action => action.type === 'block');
    }
    async processRequest(_instance, _request) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        return Math.random() > 0.05;
    }
    updateInstanceMetrics(instance, success, responseTime) {
        const metrics = instance.metrics;
        metrics.totalRequests++;
        metrics.lastRequestTime = new Date().toISOString();
        if (success) {
            metrics.successfulRequests++;
        }
        else {
            metrics.failedRequests++;
        }
        const totalResponseTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime;
        metrics.averageResponseTime = totalResponseTime / metrics.totalRequests;
    }
    isCircuitBreakerOpen(instanceId) {
        const breaker = this.circuitBreakers.get(instanceId);
        if (!breaker)
            return false;
        if (breaker.state === 'open') {
            if (breaker.nextRetryTime && new Date() > new Date(breaker.nextRetryTime)) {
                breaker.state = 'half_open';
                return false;
            }
            return true;
        }
        return false;
    }
    updateCircuitBreaker(instanceId, success) {
        const breaker = this.circuitBreakers.get(instanceId);
        if (!breaker)
            return;
        if (success) {
            breaker.successCount++;
            breaker.failureCount = 0;
            if (breaker.state === 'half_open' && breaker.successCount >= 3) {
                breaker.state = 'closed';
            }
        }
        else {
            breaker.failureCount++;
            breaker.successCount = 0;
            breaker.lastFailureTime = new Date().toISOString();
            if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
                breaker.state = 'open';
                breaker.nextRetryTime = new Date(Date.now() + this.config.circuitBreakerTimeout).toISOString();
            }
        }
    }
    updateStickySession(sessionId, instanceId) {
        const session = this.stickySessions.get(sessionId);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.config.stickySessionTtl);
        if (session) {
            session.instanceId = instanceId;
            session.expiresAt = expiresAt.toISOString();
            session.requestCount++;
        }
        else {
            this.stickySessions.set(sessionId, {
                sessionId,
                instanceId,
                createdAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
                requestCount: 1
            });
        }
    }
    startHealthChecking() {
        if (!this.config.healthCheckEnabled)
            return;
        this.healthCheckInterval = setInterval(async () => {
            for (const instance of this.instances.values()) {
                try {
                    const isHealthy = await this.performHealthCheck(instance);
                    this.updateHealthStatus(instance, isHealthy);
                }
                catch (error) {
                    this.updateHealthStatus(instance, false, error instanceof Error ? error.message : 'Health check failed');
                }
            }
        }, this.config.healthCheckInterval);
    }
    async performHealthCheck(_instance) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        return Math.random() > 0.1;
    }
    updateHealthStatus(instance, isHealthy, errorMessage) {
        const health = instance.healthStatus;
        health.isHealthy = isHealthy;
        health.lastCheck = new Date().toISOString();
        if (isHealthy) {
            health.consecutiveFailures = 0;
            health.consecutiveSuccesses++;
        }
        else {
            health.consecutiveFailures++;
            health.consecutiveSuccesses = 0;
            health.errorMessage = errorMessage;
        }
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    getStatistics() {
        const instances = Array.from(this.instances.values());
        const healthyInstances = instances.filter(i => i.healthStatus.isHealthy);
        const totalRequests = instances.reduce((sum, i) => sum + i.metrics.totalRequests, 0);
        const successfulRequests = instances.reduce((sum, i) => sum + i.metrics.successfulRequests, 0);
        return {
            totalInstances: instances.length,
            healthyInstances: healthyInstances.length,
            totalRequests,
            successfulRequests,
            successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100,
            averageResponseTime: instances.reduce((sum, i) => sum + i.metrics.averageResponseTime, 0) / instances.length || 0,
            activeCircuitBreakers: Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open').length,
            activeSessions: this.stickySessions.size
        };
    }
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.instances.clear();
        this.roundRobinCounters.clear();
        this.circuitBreakers.clear();
        this.stickySessions.clear();
        this.routingRules.length = 0;
    }
}
exports.LoadBalancer = LoadBalancer;
