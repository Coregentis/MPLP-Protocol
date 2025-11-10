/**
 * LoadBalancer - 智能负载均衡和路由管理
 * 支持多种算法：轮询、加权轮询、最少连接、响应时间优先
 * 包括健康检查和故障转移
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../types';

// ===== 负载均衡配置接口 =====

export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy;
  healthCheckEnabled: boolean;
  healthCheckInterval: number;
  healthCheckTimeout: number;
  failoverEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  circuitBreakerEnabled: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  stickySessionEnabled: boolean;
  stickySessionTtl: number;
}

export type LoadBalancingStrategy = 
  | 'round_robin' 
  | 'weighted_round_robin' 
  | 'least_connections' 
  | 'weighted_least_connections'
  | 'response_time' 
  | 'random' 
  | 'consistent_hash'
  | 'ip_hash';

// ===== 服务实例接口 =====

export interface ServiceInstance {
  instanceId: UUID;
  serviceName: string;
  address: string;
  port: number;
  protocol: string;
  weight: number;
  priority: number;
  status: InstanceStatus;
  healthStatus: HealthStatus;
  metrics: InstanceMetrics;
  metadata: InstanceMetadata;
  createdAt: Timestamp;
  lastSeen: Timestamp;
}

export type InstanceStatus = 'active' | 'inactive' | 'draining' | 'maintenance';

export interface HealthStatus {
  isHealthy: boolean;
  lastCheck: Timestamp;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  responseTime: number;
  errorMessage?: string;
}

export interface InstanceMetrics {
  activeConnections: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Timestamp;
  cpuUsage: number;
  memoryUsage: number;
}

export interface InstanceMetadata {
  region?: string;
  zone?: string;
  version: string;
  capabilities: string[];
  tags: Record<string, string>;
}

// ===== 路由规则接口 =====

export interface RoutingRule {
  ruleId: UUID;
  name: string;
  priority: number;
  conditions: RoutingCondition[];
  actions: RoutingAction[];
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoutingCondition {
  type: 'path' | 'header' | 'query' | 'method' | 'ip' | 'user_agent';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'in';
  value: string | string[];
  expectedValue?: string; // 用于header和query类型的期望值
  caseSensitive?: boolean;
}

export interface RoutingAction {
  type: 'route' | 'redirect' | 'rewrite' | 'block' | 'rate_limit';
  target?: string;
  parameters?: Record<string, unknown>;
}

// ===== 请求路由接口 =====

export interface RoutingRequest {
  requestId: UUID;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  clientIp: string;
  userAgent: string;
  timestamp: Timestamp;
  sessionId?: string;
}

export interface RoutingResult {
  requestId: UUID;
  selectedInstance: ServiceInstance | null;
  routingRule?: RoutingRule;
  strategy: LoadBalancingStrategy;
  attempts: RoutingAttempt[];
  totalTime: number;
  success: boolean;
  error?: string;
}

export interface RoutingAttempt {
  instanceId: UUID;
  startTime: Timestamp;
  endTime?: Timestamp;
  responseTime?: number;
  success: boolean;
  error?: string;
}

// ===== 熔断器接口 =====

export interface CircuitBreakerState {
  instanceId: UUID;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  successCount: number;
  lastFailureTime?: Timestamp;
  nextRetryTime?: Timestamp;
}

// ===== 会话粘性接口 =====

export interface StickySession {
  sessionId: string;
  instanceId: UUID;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  requestCount: number;
}

// ===== 负载均衡器实现 =====

export class LoadBalancer {
  private config: LoadBalancerConfig;
  private instances = new Map<UUID, ServiceInstance>();
  private roundRobinCounters = new Map<string, number>();
  private circuitBreakers = new Map<UUID, CircuitBreakerState>();
  private stickySessions = new Map<string, StickySession>();
  private routingRules: RoutingRule[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
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

  /**
   * 注册服务实例
   */
  registerInstance(instance: ServiceInstance): void {
    this.instances.set(instance.instanceId, instance);
    
    // 初始化熔断器状态
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

  /**
   * 注销服务实例
   */
  unregisterInstance(instanceId: UUID): void {
    this.instances.delete(instanceId);
    this.circuitBreakers.delete(instanceId);
    
    // 清理相关的粘性会话
    for (const [sessionId, session] of this.stickySessions.entries()) {
      if (session.instanceId === instanceId) {
        this.stickySessions.delete(sessionId);
      }
    }

    console.log(`Instance unregistered: ${instanceId}`);
  }

  /**
   * 添加路由规则
   */
  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.push(rule);
    this.routingRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 路由请求
   */
  async routeRequest(request: RoutingRequest): Promise<RoutingResult> {
    const startTime = Date.now();
    const attempts: RoutingAttempt[] = [];

    try {
      // 1. 应用路由规则
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

      // 2. 获取可用实例
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

      // 3. 选择实例
      let selectedInstance: ServiceInstance | null = null;
      let lastError: string | undefined;

      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        const instance = this.selectInstance(availableInstances, request);
        if (!instance) break;

        const attemptStart = Date.now();
        const attemptResult: RoutingAttempt = {
          instanceId: instance.instanceId,
          startTime: new Date(attemptStart).toISOString(),
          success: false
        };

        try {
          // 检查熔断器状态
          if (this.config.circuitBreakerEnabled && this.isCircuitBreakerOpen(instance.instanceId)) {
            attemptResult.error = 'Circuit breaker is open';
            attempts.push(attemptResult);
            continue;
          }

          // 模拟请求处理
          const success = await this.processRequest(instance, request);
          const responseTime = Date.now() - attemptStart;

          attemptResult.endTime = new Date().toISOString();
          attemptResult.responseTime = responseTime;
          attemptResult.success = success;

          // 记录尝试结果
          attempts.push(attemptResult);

          if (success) {
            selectedInstance = instance;
            this.updateInstanceMetrics(instance, true, responseTime);
            this.updateCircuitBreaker(instance.instanceId, true);
            break;
          } else {
            this.updateInstanceMetrics(instance, false, responseTime);
            this.updateCircuitBreaker(instance.instanceId, false);
            lastError = 'Request processing failed';
          }
        } catch (error) {
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

      // 4. 更新粘性会话
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

    } catch (error) {
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

  /**
   * 选择实例
   */
  private selectInstance(instances: ServiceInstance[], request: RoutingRequest): ServiceInstance | null {
    if (instances.length === 0) return null;

    // 检查粘性会话
    if (this.config.stickySessionEnabled && request.sessionId) {
      const stickySession = this.stickySessions.get(request.sessionId);
      if (stickySession && new Date(stickySession.expiresAt) > new Date()) {
        const stickyInstance = instances.find(i => i.instanceId === stickySession.instanceId);
        if (stickyInstance && stickyInstance.healthStatus.isHealthy) {
          return stickyInstance;
        }
      }
    }

    // 过滤健康的实例
    const healthyInstances = this.config.healthCheckEnabled
      ? instances.filter(i => i.healthStatus.isHealthy && !this.isCircuitBreakerOpen(i.instanceId))
      : instances;

    if (healthyInstances.length === 0) {
      return this.config.failoverEnabled ? (instances[0] ?? null) : null;
    }

    // 根据策略选择实例
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
        return healthyInstances[0] ?? null;
    }
  }

  // ===== 负载均衡算法实现 =====

  private roundRobinSelect(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('Cannot select from empty instances array');
    }
    const firstInstance = instances[0];
    if (!firstInstance) {
      throw new Error('Cannot select from empty instances array');
    }
    const serviceName = firstInstance.serviceName;
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedIndex = counter % instances.length;
    this.roundRobinCounters.set(serviceName, counter + 1);
    const selectedInstance = instances[selectedIndex];
    if (!selectedInstance) {
      throw new Error(`Instance at index ${selectedIndex} not found`);
    }
    return selectedInstance;
  }

  private weightedRoundRobinSelect(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const instance of instances) {
      currentWeight += instance.weight;
      if (random <= currentWeight) {
        return instance;
      }
    }

    // Fallback: 返回第一个实例
    const firstInstance = instances[0];
    if (!firstInstance) {
      throw new Error('No instances available for weighted selection');
    }
    return firstInstance;
  }

  private leastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) =>
      instance.metrics.activeConnections < min.metrics.activeConnections ? instance : min
    );
  }

  private weightedLeastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => {
      const minRatio = min.metrics.activeConnections / min.weight;
      const instanceRatio = instance.metrics.activeConnections / instance.weight;
      return instanceRatio < minRatio ? instance : min;
    });
  }

  private responseTimeSelect(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) =>
      instance.metrics.averageResponseTime < min.metrics.averageResponseTime ? instance : min
    );
  }

  private randomSelect(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    const selectedInstance = instances[randomIndex];
    if (!selectedInstance) {
      throw new Error(`Instance at index ${randomIndex} not found`);
    }
    return selectedInstance;
  }

  private consistentHashSelect(instances: ServiceInstance[], request: RoutingRequest): ServiceInstance {
    // 简化的一致性哈希实现
    const hash = this.hashString(request.path + request.clientIp);
    const index = hash % instances.length;
    const selectedInstance = instances[index];
    if (!selectedInstance) {
      throw new Error(`Instance at index ${index} not found`);
    }
    return selectedInstance;
  }

  private ipHashSelect(instances: ServiceInstance[], request: RoutingRequest): ServiceInstance {
    const hash = this.hashString(request.clientIp);
    const index = hash % instances.length;
    const selectedInstance = instances[index];
    if (!selectedInstance) {
      throw new Error(`Instance at index ${index} not found`);
    }
    return selectedInstance;
  }

  // ===== 辅助方法 =====

  private getAvailableInstances(_path: string): ServiceInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.status === 'active')
      .sort((a, b) => a.port - b.port); // 确保实例按端口排序，保证轮询的一致性
  }

  private findMatchingRule(request: RoutingRequest): RoutingRule | undefined {
    return this.routingRules.find(rule => 
      rule.enabled && this.matchesConditions(request, rule.conditions)
    );
  }

  private matchesConditions(request: RoutingRequest, conditions: RoutingCondition[]): boolean {
    return conditions.every(condition => this.matchesCondition(request, condition));
  }

  private matchesCondition(request: RoutingRequest, condition: RoutingCondition): boolean {
    let value: string;
    let compareValue: string | string[];

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
        value = request.headers[condition.value as string] || '';
        compareValue = condition.expectedValue || condition.value;
        break;
      case 'query':
        value = request.query[condition.value as string] || '';
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

  private shouldBlockRequest(rule: RoutingRule): boolean {
    return rule.actions.some(action => action.type === 'block');
  }

  private async processRequest(_instance: ServiceInstance, _request: RoutingRequest): Promise<boolean> {
    // 模拟请求处理
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    // 模拟成功率（95%成功率）
    return Math.random() > 0.05;
  }

  private updateInstanceMetrics(instance: ServiceInstance, success: boolean, responseTime: number): void {
    const metrics = instance.metrics;
    
    metrics.totalRequests++;
    metrics.lastRequestTime = new Date().toISOString();
    
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    
    // 更新平均响应时间
    const totalResponseTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime;
    metrics.averageResponseTime = totalResponseTime / metrics.totalRequests;
  }

  private isCircuitBreakerOpen(instanceId: UUID): boolean {
    const breaker = this.circuitBreakers.get(instanceId);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      if (breaker.nextRetryTime && new Date() > new Date(breaker.nextRetryTime)) {
        breaker.state = 'half_open';
        return false;
      }
      return true;
    }

    return false;
  }

  private updateCircuitBreaker(instanceId: UUID, success: boolean): void {
    const breaker = this.circuitBreakers.get(instanceId);
    if (!breaker) return;

    if (success) {
      breaker.successCount++;
      breaker.failureCount = 0;
      
      if (breaker.state === 'half_open' && breaker.successCount >= 3) {
        breaker.state = 'closed';
      }
    } else {
      breaker.failureCount++;
      breaker.successCount = 0;
      breaker.lastFailureTime = new Date().toISOString();
      
      if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
        breaker.state = 'open';
        breaker.nextRetryTime = new Date(Date.now() + this.config.circuitBreakerTimeout).toISOString();
      }
    }
  }

  private updateStickySession(sessionId: string, instanceId: UUID): void {
    const session = this.stickySessions.get(sessionId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.stickySessionTtl);

    if (session) {
      session.instanceId = instanceId;
      session.expiresAt = expiresAt.toISOString();
      session.requestCount++;
    } else {
      this.stickySessions.set(sessionId, {
        sessionId,
        instanceId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        requestCount: 1
      });
    }
  }

  private startHealthChecking(): void {
    if (!this.config.healthCheckEnabled) return;

    this.healthCheckInterval = setInterval(async () => {
      for (const instance of this.instances.values()) {
        try {
          const isHealthy = await this.performHealthCheck(instance);
          this.updateHealthStatus(instance, isHealthy);
        } catch (error) {
          this.updateHealthStatus(instance, false, error instanceof Error ? error.message : 'Health check failed');
        }
      }
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(_instance: ServiceInstance): Promise<boolean> {
    // 模拟健康检查
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    return Math.random() > 0.1; // 90%健康率
  }

  private updateHealthStatus(instance: ServiceInstance, isHealthy: boolean, errorMessage?: string): void {
    const health = instance.healthStatus;
    
    health.isHealthy = isHealthy;
    health.lastCheck = new Date().toISOString();
    
    if (isHealthy) {
      health.consecutiveFailures = 0;
      health.consecutiveSuccesses++;
    } else {
      health.consecutiveFailures++;
      health.consecutiveSuccesses = 0;
      health.errorMessage = errorMessage;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 获取负载均衡统计信息
   */
  getStatistics(): LoadBalancerStatistics {
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

  /**
   * 清理负载均衡器
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.instances.clear();
    this.roundRobinCounters.clear(); // 清理轮询计数器
    this.circuitBreakers.clear();
    this.stickySessions.clear();
    this.routingRules.length = 0;
  }
}

// ===== 统计信息接口 =====

export interface LoadBalancerStatistics {
  totalInstances: number;
  healthyInstances: number;
  totalRequests: number;
  successfulRequests: number;
  successRate: number;
  averageResponseTime: number;
  activeCircuitBreakers: number;
  activeSessions: number;
}
