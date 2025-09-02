/**
 * 分布式基础设施集成测试
 * 验证服务发现、负载均衡、配置管理、消息队列、分布式锁的集成功能
 * 目标：完整的分布式基础设施协同工作验证
 */

import { ServiceDiscovery, ServiceDiscoveryConfig } from '../../../../src/modules/core/infrastructure/discovery/service.discovery';
import { LoadBalancer, ServiceInstance, RoutingRequest } from '../../../../src/modules/core/infrastructure/routing/load.balancer';
import { ConfigManager, ConfigManagerConfig } from '../../../../src/modules/core/infrastructure/config/config.manager';
import { MessageQueueManager, MessageQueueConfig } from '../../../../src/modules/core/infrastructure/messaging/message.queue';
import { DistributedLockManager, DistributedLockConfig, LockRequest } from '../../../../src/modules/core/infrastructure/locking/distributed.lock';

describe('分布式基础设施集成测试', () => {
  let serviceDiscovery: ServiceDiscovery;
  let loadBalancer: LoadBalancer;
  let configManager: ConfigManager;
  let messageQueue: MessageQueueManager;
  let lockManager: DistributedLockManager;

  beforeEach(async () => {
    // 初始化服务发现
    const discoveryConfig: ServiceDiscoveryConfig = {
      provider: 'memory',
      endpoints: ['localhost:8500'],
      timeout: 5000,
      retryAttempts: 3,
      healthCheckInterval: 10000,
      ttl: 30000
    };
    serviceDiscovery = new ServiceDiscovery(discoveryConfig);

    // 初始化负载均衡器
    loadBalancer = new LoadBalancer({
      strategy: 'round_robin',
      healthCheckEnabled: true,
      failoverEnabled: true,
      maxRetries: 3
    });

    // 初始化配置管理器
    const configConfig: ConfigManagerConfig = {
      provider: 'memory',
      environment: 'integration-test',
      encryptionEnabled: true,
      auditEnabled: true,
      cacheEnabled: true,
      cacheTtl: 60000,
      watchEnabled: true,
      backupEnabled: false
    };
    configManager = new ConfigManager(configConfig);

    // 初始化消息队列
    const queueConfig: MessageQueueConfig = {
      provider: 'memory',
      connectionString: 'memory://localhost',
      options: {},
      retryPolicy: { maxRetries: 3, initialDelay: 100, maxDelay: 5000, backoffMultiplier: 2, jitter: false },
      deadLetterQueue: false,
      persistence: false,
      compression: false,
      encryption: false,
      batchSize: 100,
      maxConcurrency: 10
    };
    messageQueue = new MessageQueueManager(queueConfig);

    // 初始化分布式锁
    const lockConfig: DistributedLockConfig = {
      provider: 'memory',
      connectionString: 'memory://localhost',
      defaultTtl: 30000,
      renewalInterval: 10000,
      maxRetries: 3,
      retryDelay: 100,
      deadlockDetection: false,
      deadlockTimeout: 60000,
      lockTimeout: 5000,
      options: {}
    };
    lockManager = new DistributedLockManager(lockConfig);

    // 连接所有组件
    await messageQueue.connect();
    await lockManager.connect();
  });

  afterEach(async () => {
    serviceDiscovery.destroy();
    loadBalancer.destroy();
    configManager.destroy();
    await messageQueue.disconnect();
    await lockManager.disconnect();
  });

  describe('服务发现与负载均衡集成测试', () => {
    it('应该实现完整的服务注册、发现和负载均衡流程', async () => {
      // 1. 注册多个服务实例
      const services = [];
      for (let i = 1; i <= 3; i++) {
        const service = await serviceDiscovery.registerService({
          serviceName: 'api-service',
          version: '1.0.0',
          address: '127.0.0.1',
          port: 3000 + i,
          protocol: 'http',
          metadata: {
            moduleId: 'api-module',
            capabilities: ['api'],
            dependencies: [],
            environment: 'integration-test',
            weight: i,
            priority: 1
          },
          healthCheck: {
            type: 'http',
            endpoint: '/health',
            interval: 30000,
            timeout: 5000,
            retries: 3,
            deregisterAfter: 60000
          },
          tags: ['api', 'v1']
        });
        services.push(service);
      }

      // 2. 发现服务实例
      const discoveredInstances = await serviceDiscovery.discoverServices({
        serviceName: 'api-service'
      });

      expect(discoveredInstances).toHaveLength(3);

      // 3. 将发现的实例注册到负载均衡器
      for (const instance of discoveredInstances) {
        const serviceInstance: ServiceInstance = {
          instanceId: instance.instanceId,
          serviceName: instance.serviceName,
          address: instance.address,
          port: instance.port,
          protocol: instance.protocol,
          weight: instance.metadata.weight,
          priority: instance.metadata.priority,
          status: 'active',
          healthStatus: {
            isHealthy: true,
            lastCheck: new Date().toISOString(),
            consecutiveFailures: 0,
            consecutiveSuccesses: 1,
            responseTime: 100
          },
          metrics: {
            activeConnections: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 100,
            lastRequestTime: new Date().toISOString(),
            cpuUsage: 50,
            memoryUsage: 60
          },
          metadata: {
            version: instance.metadata.version || '1.0.0',
            capabilities: instance.metadata.capabilities,
            tags: { env: 'integration-test' }
          },
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };

        loadBalancer.registerInstance(serviceInstance);
      }

      // 4. 测试负载均衡路由
      const requests = [];
      for (let i = 0; i < 6; i++) {
        const request: RoutingRequest = {
          requestId: `req-${i}`,
          method: 'GET',
          path: '/api/test',
          headers: {},
          query: {},
          clientIp: '192.168.1.1',
          userAgent: 'integration-test',
          timestamp: new Date().toISOString()
        };
        requests.push(loadBalancer.routeRequest(request));
      }

      const results = await Promise.all(requests);

      // 验证轮询负载均衡
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.selectedInstance !== null)).toBe(true);

      // 验证不同实例被选择
      const selectedPorts = results.map(r => r.selectedInstance!.port);
      const uniquePorts = new Set(selectedPorts);
      expect(uniquePorts.size).toBe(3); // 应该轮询到所有3个实例
    });
  });

  describe('配置管理与服务发现集成测试', () => {
    it('应该支持基于配置的服务发现', async () => {
      const testUserId = 'integration-test-user';
      
      // 设置用户权限
      configManager.setPermission({
        userId: testUserId,
        role: 'admin',
        permissions: ['read', 'write'],
        environments: ['integration-test'],
        keyPatterns: ['*'],
        createdAt: new Date().toISOString()
      });

      // 1. 配置服务发现参数
      await configManager.setConfig('service.discovery.provider', 'memory', testUserId);
      await configManager.setConfig('service.discovery.healthCheckInterval', 30000, testUserId);
      await configManager.setConfig('service.discovery.ttl', 60000, testUserId);

      // 2. 配置负载均衡策略
      await configManager.setConfig('loadbalancer.strategy', 'weighted_round_robin', testUserId);
      await configManager.setConfig('loadbalancer.healthCheckEnabled', true, testUserId);

      // 3. 验证配置读取
      const provider = await configManager.getConfig<string>('service.discovery.provider', testUserId);
      const strategy = await configManager.getConfig<string>('loadbalancer.strategy', testUserId);

      expect(provider).toBe('memory');
      expect(strategy).toBe('weighted_round_robin');

      // 4. 基于配置注册服务
      const healthCheckInterval = await configManager.getConfig<number>('service.discovery.healthCheckInterval', testUserId);
      
      const service = await serviceDiscovery.registerService({
        serviceName: 'config-driven-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 4000,
        protocol: 'http',
        metadata: {
          moduleId: 'config-module',
          capabilities: ['config'],
          dependencies: [],
          environment: 'integration-test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: healthCheckInterval!,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['config-driven']
      });

      expect(service.serviceName).toBe('config-driven-service');
    });
  });

  describe('消息队列与分布式锁集成测试', () => {
    it('应该实现基于锁的消息处理', async () => {
      const processedMessages: any[] = [];
      const lockResourceId = 'message-processing-lock';

      // 1. 订阅消息
      const subscriptionId = await messageQueue.subscribe({
        topic: 'locked-processing',
        messageHandler: async (message) => {
          // 2. 获取分布式锁
          const lockRequest: LockRequest = {
            resourceId: lockResourceId,
            ownerId: `processor-${Date.now()}`,
            lockType: 'exclusive',
            ttl: 10000
          };

          const lockResult = await lockManager.acquireLock(lockRequest);
          
          if (lockResult.success) {
            try {
              // 3. 处理消息（模拟处理时间）
              await new Promise(resolve => setTimeout(resolve, 50));
              processedMessages.push({
                messageId: message.messageId,
                lockId: lockResult.lockInfo!.lockId,
                processedAt: new Date().toISOString()
              });

            } finally {
              // 4. 释放锁
              await lockManager.releaseLock(lockResult.lockInfo!.lockId);
            }
          } else {
            console.log('Failed to acquire lock, skipping message processing');
          }
        }
      });

      // 5. 发布多条消息
      const messageCount = 5;
      for (let i = 0; i < messageCount; i++) {
        await messageQueue.publish(
          { index: i, data: `message-${i}` },
          { topic: 'locked-processing' }
        );
      }

      // 6. 等待消息处理
      await new Promise(resolve => setTimeout(resolve, 500));

      // 7. 验证结果
      expect(processedMessages.length).toBeGreaterThan(0);
      expect(processedMessages.length).toBeLessThanOrEqual(messageCount);

      // 验证每条消息都有对应的锁ID
      processedMessages.forEach(msg => {
        expect(msg.lockId).toBeDefined();
        expect(msg.processedAt).toBeDefined();
      });

      await messageQueue.unsubscribe(subscriptionId);
    });
  });

  describe('完整工作流集成测试', () => {
    it('应该实现完整的分布式服务协调工作流', async () => {
      const testUserId = 'workflow-test-user';
      const workflowId = 'integration-workflow-001';

      // 设置配置管理权限
      configManager.setPermission({
        userId: testUserId,
        role: 'admin',
        permissions: ['read', 'write'],
        environments: ['integration-test'],
        keyPatterns: ['*'],
        createdAt: new Date().toISOString()
      });

      // 1. 配置工作流参数
      await configManager.setConfig(`workflow.${workflowId}.maxConcurrency`, 3, testUserId);
      await configManager.setConfig(`workflow.${workflowId}.timeout`, 30000, testUserId);

      // 2. 注册工作流服务
      const workflowService = await serviceDiscovery.registerService({
        serviceName: 'workflow-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 5000,
        protocol: 'http',
        metadata: {
          moduleId: 'workflow-module',
          capabilities: ['workflow', 'orchestration'],
          dependencies: [],
          environment: 'integration-test',
          weight: 1,
          priority: 1
        },
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 60000
        },
        tags: ['workflow', 'orchestration']
      });

      // 3. 获取工作流锁
      const workflowLockRequest: LockRequest = {
        resourceId: `workflow-${workflowId}`,
        ownerId: 'workflow-orchestrator',
        lockType: 'exclusive',
        ttl: 60000
      };

      const lockResult = await lockManager.acquireLock(workflowLockRequest);
      expect(lockResult.success).toBe(true);

      try {
        // 4. 发布工作流开始事件
        const startEventId = await messageQueue.publish(
          {
            workflowId,
            event: 'workflow_started',
            timestamp: new Date().toISOString(),
            serviceId: workflowService.serviceId
          },
          { topic: 'workflow-events' }
        );

        expect(startEventId).toBeDefined();

        // 5. 模拟工作流执行步骤
        const steps = ['step1', 'step2', 'step3'];
        for (const step of steps) {
          // 获取步骤配置
          const stepTimeout = await configManager.getConfig<number>(`workflow.${workflowId}.timeout`, testUserId);
          
          // 发布步骤事件
          await messageQueue.publish(
            {
              workflowId,
              step,
              event: 'step_started',
              timeout: stepTimeout,
              timestamp: new Date().toISOString()
            },
            { topic: 'workflow-steps' }
          );

          // 模拟步骤处理时间
          await new Promise(resolve => setTimeout(resolve, 10));

          // 发布步骤完成事件
          await messageQueue.publish(
            {
              workflowId,
              step,
              event: 'step_completed',
              timestamp: new Date().toISOString()
            },
            { topic: 'workflow-steps' }
          );
        }

        // 6. 发布工作流完成事件
        await messageQueue.publish(
          {
            workflowId,
            event: 'workflow_completed',
            timestamp: new Date().toISOString(),
            totalSteps: steps.length
          },
          { topic: 'workflow-events' }
        );

        // 7. 验证服务发现状态
        const discoveredServices = await serviceDiscovery.discoverServices({
          serviceName: 'workflow-service'
        });

        expect(discoveredServices).toHaveLength(1);
        expect(discoveredServices[0].serviceName).toBe('workflow-service');

        // 8. 验证消息队列统计
        const queueStats = messageQueue.getStatistics();
        expect(queueStats.totalPublished).toBeGreaterThan(0);

        // 9. 验证锁管理统计
        const lockStats = lockManager.getStatistics();
        expect(lockStats.activeLocks).toBe(1);
        expect(lockStats.successfulAcquisitions).toBe(1);

      } finally {
        // 10. 释放工作流锁
        await lockManager.releaseLock(lockResult.lockInfo!.lockId);
      }

      // 11. 验证最终状态
      const finalLockStats = lockManager.getStatistics();
      expect(finalLockStats.activeLocks).toBe(0);
    });
  });

  describe('故障恢复集成测试', () => {
    it('应该处理组件故障和恢复', async () => {
      const testUserId = 'failover-test-user';

      // 设置权限
      configManager.setPermission({
        userId: testUserId,
        role: 'admin',
        permissions: ['read', 'write'],
        environments: ['integration-test'],
        keyPatterns: ['*'],
        createdAt: new Date().toISOString()
      });

      // 1. 注册主服务和备份服务
      const primaryService = await serviceDiscovery.registerService({
        serviceName: 'failover-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 6000,
        protocol: 'http',
        metadata: {
          moduleId: 'primary-module',
          capabilities: ['primary'],
          dependencies: [],
          environment: 'integration-test',
          weight: 10, // 高权重
          priority: 1
        },
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: 10000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 30000
        },
        tags: ['primary', 'failover']
      });

      const backupService = await serviceDiscovery.registerService({
        serviceName: 'failover-service',
        version: '1.0.0',
        address: '127.0.0.1',
        port: 6001,
        protocol: 'http',
        metadata: {
          moduleId: 'backup-module',
          capabilities: ['backup'],
          dependencies: [],
          environment: 'integration-test',
          weight: 1, // 低权重
          priority: 2
        },
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: 10000,
          timeout: 5000,
          retries: 3,
          deregisterAfter: 30000
        },
        tags: ['backup', 'failover']
      });

      // 2. 配置故障转移策略
      await configManager.setConfig('failover.strategy', 'weighted_priority', testUserId);
      await configManager.setConfig('failover.healthCheckEnabled', true, testUserId);

      // 3. 发现服务实例
      const instances = await serviceDiscovery.discoverServices({
        serviceName: 'failover-service'
      });

      expect(instances).toHaveLength(2);

      // 4. 注册到负载均衡器
      const lbInstances: ServiceInstance[] = instances.map(instance => ({
        instanceId: instance.instanceId,
        serviceName: instance.serviceName,
        address: instance.address,
        port: instance.port,
        protocol: instance.protocol,
        weight: instance.metadata.weight,
        priority: instance.metadata.priority,
        status: 'active',
        healthStatus: {
          isHealthy: true,
          lastCheck: new Date().toISOString(),
          consecutiveFailures: 0,
          consecutiveSuccesses: 1,
          responseTime: 100
        },
        metrics: {
          activeConnections: 0,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 100,
          lastRequestTime: new Date().toISOString(),
          cpuUsage: 50,
          memoryUsage: 60
        },
        metadata: {
          version: '1.0.0',
          capabilities: instance.metadata.capabilities,
          tags: { env: 'integration-test' }
        },
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      }));

      // 使用加权负载均衡器
      const failoverBalancer = new LoadBalancer({
        strategy: 'weighted_round_robin',
        healthCheckEnabled: true,
        failoverEnabled: true,
        maxRetries: 3
      });

      lbInstances.forEach(instance => {
        failoverBalancer.registerInstance(instance);
      });

      // 5. 测试正常路由（应该主要路由到高权重实例）
      const normalRequests = [];
      for (let i = 0; i < 10; i++) {
        const request: RoutingRequest = {
          requestId: `failover-req-${i}`,
          method: 'GET',
          path: '/api/test',
          headers: {},
          query: {},
          clientIp: '192.168.1.1',
          userAgent: 'failover-test',
          timestamp: new Date().toISOString()
        };
        normalRequests.push(failoverBalancer.routeRequest(request));
      }

      const normalResults = await Promise.all(normalRequests);
      expect(normalResults.every(r => r.success)).toBe(true);

      // 6. 模拟主服务故障（标记为不健康）
      const primaryInstance = lbInstances.find(i => i.port === 6000);
      if (primaryInstance) {
        primaryInstance.healthStatus.isHealthy = false;
        primaryInstance.status = 'inactive';
      }

      // 7. 测试故障转移路由
      const failoverRequests = [];
      for (let i = 0; i < 5; i++) {
        const request: RoutingRequest = {
          requestId: `failover-after-${i}`,
          method: 'GET',
          path: '/api/test',
          headers: {},
          query: {},
          clientIp: '192.168.1.1',
          userAgent: 'failover-test',
          timestamp: new Date().toISOString()
        };
        failoverRequests.push(failoverBalancer.routeRequest(request));
      }

      const failoverResults = await Promise.all(failoverRequests);
      expect(failoverResults.every(r => r.success)).toBe(true);

      // 8. 验证统计信息
      const lbStats = failoverBalancer.getStatistics();
      expect(lbStats.totalInstances).toBe(2);
      expect(lbStats.healthyInstances).toBe(1); // 只有备份服务健康

      failoverBalancer.destroy();
    });
  });

  describe('性能集成测试', () => {
    it('应该在高负载下保持性能', async () => {
      const testUserId = 'performance-test-user';
      const serviceCount = 5;
      const requestCount = 100;

      // 设置权限
      configManager.setPermission({
        userId: testUserId,
        role: 'admin',
        permissions: ['read', 'write'],
        environments: ['integration-test'],
        keyPatterns: ['*'],
        createdAt: new Date().toISOString()
      });

      // 1. 注册多个服务实例
      const services = [];
      for (let i = 0; i < serviceCount; i++) {
        const service = await serviceDiscovery.registerService({
          serviceName: 'performance-service',
          version: '1.0.0',
          address: '127.0.0.1',
          port: 7000 + i,
          protocol: 'http',
          metadata: {
            moduleId: `perf-module-${i}`,
            capabilities: ['performance'],
            dependencies: [],
            environment: 'integration-test',
            weight: 1,
            priority: 1
          },
          healthCheck: {
            type: 'http',
            endpoint: '/health',
            interval: 30000,
            timeout: 5000,
            retries: 3,
            deregisterAfter: 60000
          },
          tags: ['performance']
        });
        services.push(service);
      }

      // 2. 配置性能参数
      await configManager.setConfig('performance.maxConcurrency', requestCount, testUserId);
      await configManager.setConfig('performance.timeout', 10000, testUserId);

      // 3. 发现服务并注册到负载均衡器
      const instances = await serviceDiscovery.discoverServices({
        serviceName: 'performance-service'
      });

      expect(instances).toHaveLength(serviceCount);

      instances.forEach(instance => {
        const serviceInstance: ServiceInstance = {
          instanceId: instance.instanceId,
          serviceName: instance.serviceName,
          address: instance.address,
          port: instance.port,
          protocol: instance.protocol,
          weight: 1,
          priority: 1,
          status: 'active',
          healthStatus: {
            isHealthy: true,
            lastCheck: new Date().toISOString(),
            consecutiveFailures: 0,
            consecutiveSuccesses: 1,
            responseTime: 50
          },
          metrics: {
            activeConnections: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 50,
            lastRequestTime: new Date().toISOString(),
            cpuUsage: 30,
            memoryUsage: 40
          },
          metadata: {
            version: '1.0.0',
            capabilities: ['performance'],
            tags: { env: 'integration-test' }
          },
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };

        loadBalancer.registerInstance(serviceInstance);
      });

      // 4. 执行高负载测试
      const startTime = Date.now();
      const requests = [];

      for (let i = 0; i < requestCount; i++) {
        const request: RoutingRequest = {
          requestId: `perf-req-${i}`,
          method: 'GET',
          path: '/api/performance',
          headers: {},
          query: {},
          clientIp: '192.168.1.1',
          userAgent: 'performance-test',
          timestamp: new Date().toISOString()
        };
        requests.push(loadBalancer.routeRequest(request));
      }

      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // 5. 验证性能结果
      const successfulRequests = results.filter(r => r.success).length;
      const successRate = (successfulRequests / requestCount) * 100;

      expect(successRate).toBeGreaterThan(80); // 至少80%成功率
      expect(totalTime).toBeLessThan(10000); // 应该在10秒内完成

      // 6. 验证负载分布
      const portCounts = new Map<number, number>();
      results.forEach(result => {
        if (result.selectedInstance) {
          const port = result.selectedInstance.port;
          portCounts.set(port, (portCounts.get(port) || 0) + 1);
        }
      });

      // 负载应该相对均匀分布
      expect(portCounts.size).toBeGreaterThan(1);

      console.log(`Performance test completed: ${successfulRequests}/${requestCount} requests successful in ${totalTime}ms`);
      console.log('Load distribution:', Object.fromEntries(portCounts));
    });
  });
});
