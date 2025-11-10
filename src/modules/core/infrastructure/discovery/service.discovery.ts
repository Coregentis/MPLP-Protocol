/**
 * ServiceDiscovery - 服务发现机制
 * 支持多种发现方式：Consul、Etcd、Zookeeper
 * 包括服务注册、健康检查、服务发现和负载均衡
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../types';

// ===== 服务发现配置接口 =====

export interface ServiceDiscoveryConfig {
  provider: ServiceDiscoveryProvider;
  endpoints: string[];
  timeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
  ttl: number;
  authentication?: AuthenticationConfig;
}

export type ServiceDiscoveryProvider = 'consul' | 'etcd' | 'zookeeper' | 'memory';

export interface AuthenticationConfig {
  type: 'token' | 'basic' | 'certificate';
  credentials: Record<string, string>;
}

// ===== 服务注册接口 =====

export interface ServiceRegistration {
  serviceId: UUID;
  serviceName: string;
  version: string;
  address: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp' | 'grpc';
  metadata: ServiceMetadata;
  healthCheck: HealthCheckConfig;
  tags: string[];
  registeredAt: Timestamp;
  lastHeartbeat: Timestamp;
}

export interface ServiceMetadata {
  moduleId: string;
  capabilities: string[];
  dependencies: string[];
  environment: string;
  region?: string;
  zone?: string;
  weight: number;
  priority: number;
}

export interface HealthCheckConfig {
  type: 'http' | 'tcp' | 'script' | 'ttl';
  endpoint?: string;
  interval: number;
  timeout: number;
  retries: number;
  deregisterAfter: number;
}

// ===== 服务发现接口 =====

export interface ServiceInstance {
  instanceId: UUID;
  serviceId: UUID;
  serviceName: string;
  version: string;
  address: string;
  port: number;
  protocol: string;
  status: ServiceStatus;
  metadata: ServiceMetadata;
  healthStatus: HealthStatus;
  lastSeen: Timestamp;
}

export type ServiceStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  lastCheck: Timestamp;
  consecutiveFailures: number;
  message?: string;
  responseTime?: number;
}

export interface ServiceQuery {
  serviceName?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  healthyOnly?: boolean;
  region?: string;
  zone?: string;
}

// ===== 负载均衡接口 =====

export interface LoadBalancingStrategy {
  name: string;
  selectInstance(instances: ServiceInstance[]): ServiceInstance | null;
}

export interface LoadBalancingConfig {
  strategy: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'random' | 'consistent_hash';
  healthCheckEnabled: boolean;
  failoverEnabled: boolean;
  maxRetries: number;
}

// ===== 服务发现实现 =====

export class ServiceDiscovery {
  private config: ServiceDiscoveryConfig;
  private registeredServices = new Map<UUID, ServiceRegistration>();
  private serviceInstances = new Map<string, ServiceInstance[]>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private loadBalancer: LoadBalancer;

  constructor(config: ServiceDiscoveryConfig) {
    this.config = config;
    this.loadBalancer = new LoadBalancer({
      strategy: 'round_robin',
      healthCheckEnabled: true,
      failoverEnabled: true,
      maxRetries: 3
    });

    this.startHealthChecking();
  }

  /**
   * 注册服务
   */
  async registerService(registration: Omit<ServiceRegistration, 'serviceId' | 'registeredAt' | 'lastHeartbeat'>): Promise<ServiceRegistration> {
    const serviceRegistration: ServiceRegistration = {
      serviceId: this.generateUUID(),
      registeredAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      ...registration
    };

    // 根据提供商注册服务
    switch (this.config.provider) {
      case 'consul':
        await this.registerWithConsul(serviceRegistration);
        break;
      case 'etcd':
        await this.registerWithEtcd(serviceRegistration);
        break;
      case 'zookeeper':
        await this.registerWithZookeeper(serviceRegistration);
        break;
      case 'memory':
        await this.registerInMemory(serviceRegistration);
        break;
    }

    this.registeredServices.set(serviceRegistration.serviceId, serviceRegistration);

    console.log(`Service registered: ${serviceRegistration.serviceName} (${serviceRegistration.serviceId})`);
    return serviceRegistration;
  }

  /**
   * 注销服务
   */
  async deregisterService(serviceId: UUID): Promise<void> {
    const registration = this.registeredServices.get(serviceId);
    if (!registration) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    // 根据提供商注销服务
    switch (this.config.provider) {
      case 'consul':
        await this.deregisterFromConsul(serviceId);
        break;
      case 'etcd':
        await this.deregisterFromEtcd(serviceId);
        break;
      case 'zookeeper':
        await this.deregisterFromZookeeper(serviceId);
        break;
      case 'memory':
        await this.deregisterFromMemory(serviceId);
        break;
    }

    this.registeredServices.delete(serviceId);
    console.log(`Service deregistered: ${registration.serviceName} (${serviceId})`);
  }

  /**
   * 发现服务
   */
  async discoverServices(query: ServiceQuery = {}): Promise<ServiceInstance[]> {
    let instances: ServiceInstance[] = [];

    // 根据提供商发现服务
    switch (this.config.provider) {
      case 'consul':
        instances = await this.discoverFromConsul(query);
        break;
      case 'etcd':
        instances = await this.discoverFromEtcd(query);
        break;
      case 'zookeeper':
        instances = await this.discoverFromZookeeper(query);
        break;
      case 'memory':
        instances = await this.discoverFromMemory(query);
        break;
    }

    // 过滤健康的实例
    if (query.healthyOnly) {
      instances = instances.filter(instance => instance.healthStatus.status === 'healthy');
    }

    return instances;
  }

  /**
   * 获取服务实例（带负载均衡）
   */
  async getServiceInstance(serviceName: string, query: ServiceQuery = {}): Promise<ServiceInstance | null> {
    const instances = await this.discoverServices({ ...query, serviceName });
    return this.loadBalancer.selectInstance(instances);
  }

  /**
   * 更新服务健康状态
   */
  async updateHealthStatus(serviceId: UUID, status: HealthStatus): Promise<void> {
    const registration = this.registeredServices.get(serviceId);
    if (!registration) {
      return;
    }

    // 更新本地缓存
    const serviceName = registration.serviceName;
    const instances = this.serviceInstances.get(serviceName) || [];
    const instance = instances.find(i => i.serviceId === serviceId);
    
    if (instance) {
      instance.healthStatus = status;
      instance.lastSeen = new Date().toISOString();
    }

    // 根据提供商更新健康状态
    switch (this.config.provider) {
      case 'consul':
        await this.updateConsulHealth(serviceId, status);
        break;
      case 'etcd':
        await this.updateEtcdHealth(serviceId, status);
        break;
      case 'zookeeper':
        await this.updateZookeeperHealth(serviceId, status);
        break;
      case 'memory':
        await this.updateMemoryHealth(serviceId, status);
        break;
    }
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck(registration: ServiceRegistration): Promise<HealthStatus> {
    const { healthCheck } = registration;
    const startTime = Date.now();

    try {
      switch (healthCheck.type) {
        case 'http':
          return await this.performHttpHealthCheck(registration, startTime);
        case 'tcp':
          return await this.performTcpHealthCheck(registration, startTime);
        case 'ttl':
          return await this.performTtlHealthCheck(registration, startTime);
        default:
          return {
            status: 'unknown',
            lastCheck: new Date().toISOString(),
            consecutiveFailures: 0,
            message: 'Unsupported health check type'
          };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        consecutiveFailures: 1,
        message: error instanceof Error ? error.message : 'Health check failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  // ===== 提供商特定实现 =====

  private async registerWithConsul(registration: ServiceRegistration): Promise<void> {
    // 简化实现：模拟Consul注册
    console.log(`Registering with Consul: ${registration.serviceName}`);
    await this.simulateNetworkCall();
  }

  private async registerWithEtcd(registration: ServiceRegistration): Promise<void> {
    // 简化实现：模拟Etcd注册
    console.log(`Registering with Etcd: ${registration.serviceName}`);
    await this.simulateNetworkCall();
  }

  private async registerWithZookeeper(registration: ServiceRegistration): Promise<void> {
    // 简化实现：模拟Zookeeper注册
    console.log(`Registering with Zookeeper: ${registration.serviceName}`);
    await this.simulateNetworkCall();
  }

  private async registerInMemory(registration: ServiceRegistration): Promise<void> {
    // 内存实现：直接存储
    const instance: ServiceInstance = {
      instanceId: this.generateUUID(),
      serviceId: registration.serviceId,
      serviceName: registration.serviceName,
      version: registration.version,
      address: registration.address,
      port: registration.port,
      protocol: registration.protocol,
      status: 'active',
      metadata: registration.metadata,
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        consecutiveFailures: 0
      },
      lastSeen: new Date().toISOString()
    };

    const instances = this.serviceInstances.get(registration.serviceName) || [];
    instances.push(instance);
    this.serviceInstances.set(registration.serviceName, instances);
  }

  private async deregisterFromConsul(serviceId: UUID): Promise<void> {
    console.log(`Deregistering from Consul: ${serviceId}`);
    await this.simulateNetworkCall();
  }

  private async deregisterFromEtcd(serviceId: UUID): Promise<void> {
    console.log(`Deregistering from Etcd: ${serviceId}`);
    await this.simulateNetworkCall();
  }

  private async deregisterFromZookeeper(serviceId: UUID): Promise<void> {
    console.log(`Deregistering from Zookeeper: ${serviceId}`);
    await this.simulateNetworkCall();
  }

  private async deregisterFromMemory(serviceId: UUID): Promise<void> {
    for (const [serviceName, instances] of this.serviceInstances.entries()) {
      const filteredInstances = instances.filter(i => i.serviceId !== serviceId);
      if (filteredInstances.length !== instances.length) {
        this.serviceInstances.set(serviceName, filteredInstances);
      }
    }
  }

  private async discoverFromConsul(query: ServiceQuery): Promise<ServiceInstance[]> {
    console.log(`Discovering from Consul:`, query);
    await this.simulateNetworkCall();
    return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
  }

  private async discoverFromEtcd(query: ServiceQuery): Promise<ServiceInstance[]> {
    console.log(`Discovering from Etcd:`, query);
    await this.simulateNetworkCall();
    return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
  }

  private async discoverFromZookeeper(query: ServiceQuery): Promise<ServiceInstance[]> {
    console.log(`Discovering from Zookeeper:`, query);
    await this.simulateNetworkCall();
    return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
  }

  private async discoverFromMemory(query: ServiceQuery): Promise<ServiceInstance[]> {
    const allInstances = Array.from(this.serviceInstances.values()).flat();
    return this.filterInstances(allInstances, query);
  }

  // ===== 健康检查实现 =====

  private async performHttpHealthCheck(_registration: ServiceRegistration, startTime: number): Promise<HealthStatus> {
    // 简化实现：模拟HTTP健康检查
    await this.simulateNetworkCall(100);
    
    return {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      consecutiveFailures: 0,
      responseTime: Date.now() - startTime
    };
  }

  private async performTcpHealthCheck(_registration: ServiceRegistration, startTime: number): Promise<HealthStatus> {
    // 简化实现：模拟TCP健康检查
    await this.simulateNetworkCall(50);
    
    return {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      consecutiveFailures: 0,
      responseTime: Date.now() - startTime
    };
  }

  private async performTtlHealthCheck(registration: ServiceRegistration, startTime: number): Promise<HealthStatus> {
    // TTL健康检查：检查最后心跳时间
    const lastHeartbeat = new Date(registration.lastHeartbeat);
    const now = new Date();
    const timeSinceHeartbeat = now.getTime() - lastHeartbeat.getTime();
    
    const isHealthy = timeSinceHeartbeat < this.config.ttl;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date().toISOString(),
      consecutiveFailures: isHealthy ? 0 : 1,
      message: isHealthy ? 'TTL valid' : 'TTL expired',
      responseTime: Date.now() - startTime
    };
  }

  private async updateConsulHealth(serviceId: UUID, status: HealthStatus): Promise<void> {
    console.log(`Updating Consul health for ${serviceId}:`, status.status);
    await this.simulateNetworkCall();
  }

  private async updateEtcdHealth(serviceId: UUID, status: HealthStatus): Promise<void> {
    console.log(`Updating Etcd health for ${serviceId}:`, status.status);
    await this.simulateNetworkCall();
  }

  private async updateZookeeperHealth(serviceId: UUID, status: HealthStatus): Promise<void> {
    console.log(`Updating Zookeeper health for ${serviceId}:`, status.status);
    await this.simulateNetworkCall();
  }

  private async updateMemoryHealth(serviceId: UUID, status: HealthStatus): Promise<void> {
    // 内存实现：直接更新
    for (const instances of this.serviceInstances.values()) {
      const instance = instances.find(i => i.serviceId === serviceId);
      if (instance) {
        instance.healthStatus = status;
        instance.lastSeen = new Date().toISOString();
      }
    }
  }

  // ===== 辅助方法 =====

  private filterInstances(instances: ServiceInstance[], query: ServiceQuery): ServiceInstance[] {
    return instances.filter(instance => {
      if (query.serviceName && instance.serviceName !== query.serviceName) {
        return false;
      }
      
      if (query.tags && query.tags.length > 0) {
        // 简化实现：假设实例有tags属性
        return true;
      }
      
      if (query.healthyOnly && instance.healthStatus.status !== 'healthy') {
        return false;
      }
      
      if (query.region && instance.metadata.region !== query.region) {
        return false;
      }
      
      if (query.zone && instance.metadata.zone !== query.zone) {
        return false;
      }
      
      return true;
    });
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const registration of this.registeredServices.values()) {
        try {
          const healthStatus = await this.performHealthCheck(registration);
          await this.updateHealthStatus(registration.serviceId, healthStatus);
        } catch (error) {
          console.error(`Health check failed for ${registration.serviceName}:`, error);
        }
      }
    }, this.config.healthCheckInterval);
  }

  private async simulateNetworkCall(delay: number = 50): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 清理服务发现
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.registeredServices.clear();
    this.serviceInstances.clear();
  }
}

// ===== 负载均衡器实现 =====

export class LoadBalancer {
  private config: LoadBalancingConfig;
  private roundRobinCounters = new Map<string, number>();

  constructor(config: LoadBalancingConfig) {
    this.config = config;
  }

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) {
      return null;
    }

    // 过滤健康的实例
    const healthyInstances = this.config.healthCheckEnabled
      ? instances.filter(i => i.healthStatus.status === 'healthy')
      : instances;

    if (healthyInstances.length === 0) {
      return this.config.failoverEnabled ? (instances[0] ?? null) : null;
    }

    switch (this.config.strategy) {
      case 'round_robin':
        return this.roundRobinSelect(healthyInstances);
      case 'weighted_round_robin':
        return this.weightedRoundRobinSelect(healthyInstances);
      case 'random':
        return this.randomSelect(healthyInstances);
      case 'least_connections':
        return this.leastConnectionsSelect(healthyInstances);
      default:
        return healthyInstances[0] ?? null;
    }
  }

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
    // 简化实现：基于权重选择
    const totalWeight = instances.reduce((sum, instance) => sum + instance.metadata.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const instance of instances) {
      currentWeight += instance.metadata.weight;
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

  private randomSelect(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    const selectedInstance = instances[randomIndex];
    if (!selectedInstance) {
      throw new Error(`Instance at index ${randomIndex} not found`);
    }
    return selectedInstance;
  }

  private leastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    // 简化实现：返回第一个实例
    const firstInstance = instances[0];
    if (!firstInstance) {
      throw new Error('No instances available for least connections selection');
    }
    return firstInstance;
  }
}
