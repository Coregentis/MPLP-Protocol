/**
 * ServiceDiscovery测试用例
 * 验证服务发现机制的核心功能
 */

import { ServiceDiscovery, ServiceDiscoveryConfig, LoadBalancer } from '../../../../../src/modules/core/infrastructure/discovery/service.discovery';

describe('ServiceDiscovery测试', () => {
  let serviceDiscovery: ServiceDiscovery;

  beforeEach(() => {
    const config: ServiceDiscoveryConfig = {
      provider: 'memory',
      endpoints: ['localhost:8500'],
      timeout: 5000,
      retryAttempts: 3,
      healthCheckInterval: 10000,
      ttl: 30000
    };

    serviceDiscovery = new ServiceDiscovery(config);
  });

  afterEach(() => {
    serviceDiscovery.destroy();
  });

  describe('服务注册测试', () => {
    it('应该成功注册服务', async () => {
      const registration = {
        serviceName: 'test-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'http' as const,
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http' as const,
          endpoint: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test', 'api']
      };

      const result = await serviceDiscovery.registerService(registration);

      expect(result.serviceId).toBeDefined();
      expect(result.serviceName).toBe('test-service');
      expect(result.address).toBe('127.0.0.1');
      expect(result.port).toBe(3000);
      expect(result.registeredAt).toBeDefined();
      expect(result.lastHeartbeat).toBeDefined();
    });

    it('应该成功注销服务', async () => {
      const registration = {
        serviceName: 'test-service-2',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3001,
        protocol: 'http' as const,
        metadata: {
          moduleId: 'test-module-2',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http' as const,
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test']
      };

      const result = await serviceDiscovery.registerService(registration);
      expect(result.serviceId).toBeDefined();

      // 注销服务
      await serviceDiscovery.deregisterService(result.serviceId);

      // 验证服务已注销（通过发现服务验证）
      const instances = await serviceDiscovery.discoverServices({ serviceName: 'test-service-2' });
      expect(instances).toHaveLength(0);
    });

    it('应该拒绝注销不存在的服务', async () => {
      await expect(serviceDiscovery.deregisterService('non-existent-id'))
        .rejects.toThrow('Service not found: non-existent-id');
    });
  });

  describe('服务发现测试', () => {
    beforeEach(async () => {
      // 注册测试服务
      const services = [
        {
          serviceName: 'api-service',
          version: '1.0.0',
          address: '127.0.0.1',
          port: 3000,
          protocol: 'http' as const,
          metadata: {
            moduleId: 'api-module',
            capabilities: ['api'],
            dependencies: [],
            environment: 'test',
            region: 'us-east-1',
            zone: 'us-east-1a',
            weight: 2,
            priority: 1
          },
          healthCheck: {
            type: 'http' as const,
            interval: 30000,
            timeout: 5000,
            retries: 3,
            deregisterAfter: 60000
          },
          tags: ['api', 'v1']
        },
        {
          serviceName: 'api-service',
          version: '1.0.0',
          address: '127.0.0.1',
          port: 3001,
          protocol: 'http' as const,
          metadata: {
            moduleId: 'api-module',
            capabilities: ['api'],
            dependencies: [],
            environment: 'test',
            region: 'us-east-1',
            zone: 'us-east-1b',
            weight: 1,
            priority: 2
          },
          healthCheck: {
            type: 'http' as const,
            interval: 30000,
            timeout: 5000,
            retries: 3,
            deregisterAfter: 60000
          },
          tags: ['api', 'v1']
        },
        {
          serviceName: 'db-service',
          version: '2.0.0',
          address: '127.0.0.1',
          port: 5432,
          protocol: 'tcp' as const,
          metadata: {
            moduleId: 'db-module',
            capabilities: ['database'],
            dependencies: [],
            environment: 'test',
            weight: 1,
            priority: 1
          },
          healthCheck: {
            type: 'tcp' as const,
            interval: 30000,
            timeout: 5000,
            retries: 3,
            deregisterAfter: 60000
          },
          tags: ['database', 'postgres']
        }
      ];

      for (const service of services) {
        await serviceDiscovery.registerService(service);
      }
    });

    it('应该发现所有服务', async () => {
      const instances = await serviceDiscovery.discoverServices();
      expect(instances.length).toBeGreaterThanOrEqual(3);
    });

    it('应该根据服务名称发现服务', async () => {
      const instances = await serviceDiscovery.discoverServices({ serviceName: 'api-service' });
      expect(instances).toHaveLength(2);
      expect(instances.every(i => i.serviceName === 'api-service')).toBe(true);
    });

    it('应该根据区域过滤服务', async () => {
      const instances = await serviceDiscovery.discoverServices({ 
        serviceName: 'api-service',
        region: 'us-east-1'
      });
      expect(instances).toHaveLength(2);
      expect(instances.every(i => i.metadata.region === 'us-east-1')).toBe(true);
    });

    it('应该只返回健康的服务实例', async () => {
      const instances = await serviceDiscovery.discoverServices({ 
        serviceName: 'api-service',
        healthyOnly: true
      });
      expect(instances.every(i => i.healthStatus.status === 'healthy')).toBe(true);
    });

    it('应该获取单个服务实例（负载均衡）', async () => {
      const instance = await serviceDiscovery.getServiceInstance('api-service');
      expect(instance).not.toBeNull();
      expect(instance!.serviceName).toBe('api-service');
    });

    it('应该处理不存在的服务', async () => {
      const instances = await serviceDiscovery.discoverServices({ serviceName: 'non-existent-service' });
      expect(instances).toHaveLength(0);

      const instance = await serviceDiscovery.getServiceInstance('non-existent-service');
      expect(instance).toBeNull();
    });
  });

  describe('健康检查测试', () => {
    it('应该执行HTTP健康检查', async () => {
      const registration = {
        serviceId: 'test-service-id',
        serviceName: 'http-test-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'http' as const,
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http' as const,
          endpoint: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test'],
        registeredAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString()
      };

      const healthStatus = await serviceDiscovery.performHealthCheck(registration);

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.lastCheck).toBeDefined();
      expect(healthStatus.responseTime).toBeGreaterThan(0);
      expect(healthStatus.consecutiveFailures).toBe(0);
    });

    it('应该执行TCP健康检查', async () => {
      const registration = {
        serviceId: 'tcp-test-service-id',
        serviceName: 'tcp-test-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 5432,
        protocol: 'tcp' as const,
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'tcp' as const,
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test'],
        registeredAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString()
      };

      const healthStatus = await serviceDiscovery.performHealthCheck(registration);

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.responseTime).toBeGreaterThan(0);
    });

    it('应该执行TTL健康检查', async () => {
      const registration = {
        serviceId: 'ttl-test-service-id',
        serviceName: 'ttl-test-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'http' as const,
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'ttl' as const,
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test'],
        registeredAt: new Date().toISOString(),
        lastHeartbeat: new Date().toISOString() // 最近的心跳
      };

      const healthStatus = await serviceDiscovery.performHealthCheck(registration);

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.message).toBe('TTL valid');
    });

    it('应该检测过期的TTL', async () => {
      const registration = {
        serviceId: 'expired-ttl-service-id',
        serviceName: 'expired-ttl-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'http' as const,
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'ttl' as const,
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test'],
        registeredAt: new Date().toISOString(),
        lastHeartbeat: new Date(Date.now() - 60000).toISOString() // 1分钟前的心跳
      };

      // 创建一个TTL很短的服务发现实例
      const shortTtlConfig: ServiceDiscoveryConfig = {
        provider: 'memory',
        endpoints: ['localhost:8500'],
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 10000,
        ttl: 30000 // 30秒TTL
      };

      const shortTtlDiscovery = new ServiceDiscovery(shortTtlConfig);

      try {
        const healthStatus = await shortTtlDiscovery.performHealthCheck(registration);

        expect(healthStatus.status).toBe('unhealthy');
        expect(healthStatus.message).toBe('TTL expired');
        expect(healthStatus.consecutiveFailures).toBe(1);
      } finally {
        shortTtlDiscovery.destroy();
      }
    });

    it('应该更新服务健康状态', async () => {
      const registration = await serviceDiscovery.registerService({
        serviceName: 'health-update-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 3000,
        protocol: 'http',
        metadata: {
          moduleId: 'test-module',
          capabilities: ['test'],
          dependencies: [],
          environment: 'test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http',
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['test']
      });

      const newHealthStatus = {
        status: 'unhealthy' as const,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: 1,
        message: 'Service is down'
      };

      await serviceDiscovery.updateHealthStatus(registration.serviceId, newHealthStatus);

      // 验证健康状态已更新（通过发现服务验证）
      const instances = await serviceDiscovery.discoverServices({ 
        serviceName: 'health-update-service',
        healthyOnly: false
      });
      
      expect(instances).toHaveLength(1);
      expect(instances[0].healthStatus.status).toBe('unhealthy');
    });
  });

  describe('负载均衡测试', () => {
    let loadBalancer: LoadBalancer;

    beforeEach(() => {
      loadBalancer = new LoadBalancer({
        strategy: 'round_robin',
        healthCheckEnabled: true,
        failoverEnabled: true,
        maxRetries: 3
      });
    });

    it('应该使用轮询策略选择实例', () => {
      const instances = [
        {
          instanceId: 'instance-1',
          serviceId: 'service-1',
          serviceName: 'test-service',
          address: '127.0.0.1',
          port: 3000,
          protocol: 'http',
          status: 'active' as const,
          metadata: { moduleId: 'test', capabilities: [], dependencies: [], environment: 'test', weight: 1, priority: 1 },
          healthStatus: { status: 'healthy' as const, lastCheck: new Date().toISOString(), consecutiveFailures: 0 },
          lastSeen: new Date().toISOString()
        },
        {
          instanceId: 'instance-2',
          serviceId: 'service-2',
          serviceName: 'test-service',
          address: '127.0.0.1',
          port: 3001,
          protocol: 'http',
          status: 'active' as const,
          metadata: { moduleId: 'test', capabilities: [], dependencies: [], environment: 'test', weight: 1, priority: 1 },
          healthStatus: { status: 'healthy' as const, lastCheck: new Date().toISOString(), consecutiveFailures: 0 },
          lastSeen: new Date().toISOString()
        }
      ];

      const selected1 = loadBalancer.selectInstance(instances);
      const selected2 = loadBalancer.selectInstance(instances);
      const selected3 = loadBalancer.selectInstance(instances);

      expect(selected1).not.toBeNull();
      expect(selected2).not.toBeNull();
      expect(selected3).not.toBeNull();

      // 轮询应该选择不同的实例
      expect(selected1!.instanceId).toBe('instance-1');
      expect(selected2!.instanceId).toBe('instance-2');
      expect(selected3!.instanceId).toBe('instance-1'); // 回到第一个
    });

    it('应该过滤不健康的实例', () => {
      const instances = [
        {
          instanceId: 'healthy-instance',
          serviceId: 'service-1',
          serviceName: 'test-service',
          address: '127.0.0.1',
          port: 3000,
          protocol: 'http',
          status: 'active' as const,
          metadata: { moduleId: 'test', capabilities: [], dependencies: [], environment: 'test', weight: 1, priority: 1 },
          healthStatus: { status: 'healthy' as const, lastCheck: new Date().toISOString(), consecutiveFailures: 0 },
          lastSeen: new Date().toISOString()
        },
        {
          instanceId: 'unhealthy-instance',
          serviceId: 'service-2',
          serviceName: 'test-service',
          address: '127.0.0.1',
          port: 3001,
          protocol: 'http',
          status: 'active' as const,
          metadata: { moduleId: 'test', capabilities: [], dependencies: [], environment: 'test', weight: 1, priority: 1 },
          healthStatus: { status: 'unhealthy' as const, lastCheck: new Date().toISOString(), consecutiveFailures: 1 },
          lastSeen: new Date().toISOString()
        }
      ];

      const selected = loadBalancer.selectInstance(instances);

      expect(selected).not.toBeNull();
      expect(selected!.instanceId).toBe('healthy-instance');
    });

    it('应该处理没有实例的情况', () => {
      const selected = loadBalancer.selectInstance([]);
      expect(selected).toBeNull();
    });

    it('应该在没有健康实例时启用故障转移', () => {
      const instances = [
        {
          instanceId: 'unhealthy-instance',
          serviceId: 'service-1',
          serviceName: 'test-service',
          address: '127.0.0.1',
          port: 3000,
          protocol: 'http',
          status: 'active' as const,
          metadata: { moduleId: 'test', capabilities: [], dependencies: [], environment: 'test', weight: 1, priority: 1 },
          healthStatus: { status: 'unhealthy' as const, lastCheck: new Date().toISOString(), consecutiveFailures: 1 },
          lastSeen: new Date().toISOString()
        }
      ];

      const selected = loadBalancer.selectInstance(instances);

      // 故障转移应该返回不健康的实例
      expect(selected).not.toBeNull();
      expect(selected!.instanceId).toBe('unhealthy-instance');
    });
  });

  describe('多提供商支持测试', () => {
    it('应该支持Consul提供商', () => {
      const consulConfig: ServiceDiscoveryConfig = {
        provider: 'consul',
        endpoints: ['localhost:8500'],
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 10000,
        ttl: 30000
      };

      const consulDiscovery = new ServiceDiscovery(consulConfig);
      expect(consulDiscovery).toBeDefined();
      consulDiscovery.destroy();
    });

    it('应该支持Etcd提供商', () => {
      const etcdConfig: ServiceDiscoveryConfig = {
        provider: 'etcd',
        endpoints: ['localhost:2379'],
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 10000,
        ttl: 30000
      };

      const etcdDiscovery = new ServiceDiscovery(etcdConfig);
      expect(etcdDiscovery).toBeDefined();
      etcdDiscovery.destroy();
    });

    it('应该支持Zookeeper提供商', () => {
      const zkConfig: ServiceDiscoveryConfig = {
        provider: 'zookeeper',
        endpoints: ['localhost:2181'],
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 10000,
        ttl: 30000
      };

      const zkDiscovery = new ServiceDiscovery(zkConfig);
      expect(zkDiscovery).toBeDefined();
      zkDiscovery.destroy();
    });
  });
});
