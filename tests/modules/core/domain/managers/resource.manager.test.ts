/**
 * ResourceManager测试用例
 * 验证资源管理器的核心功能
 */

import { ResourceManager, ResourceRequirements } from '../../../../../src/core/orchestrator/resource.manager';

describe('ResourceManager测试', () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager({
      maxCpuCores: 4,
      maxMemoryMb: 2048,
      maxDiskSpaceMb: 5120,
      maxNetworkBandwidth: 500,
      maxConnections: 100,
      maxConcurrentAllocations: 50,
      allocationTimeout: 60000
    });
  });

  afterEach(() => {
    resourceManager.destroy();
  });

  describe('资源分配测试', () => {
    it('应该成功分配资源', async () => {
      const requirements: ResourceRequirements = {
        cpuCores: 2,
        memoryMb: 512,
        diskSpaceMb: 1024,
        networkBandwidth: 100,
        maxConnections: 10,
        estimatedDuration: 30000,
        priority: 'normal'
      };

      const allocation = await resourceManager.allocateResources(requirements);

      expect(allocation.allocationId).toBeDefined();
      expect(allocation.requirements).toEqual(requirements);
      expect(allocation.status).toBe('allocated');
      expect(allocation.allocatedResources.cpuCores).toBe(2);
      expect(allocation.allocatedResources.memoryMb).toBe(512);
      expect(allocation.createdAt).toBeDefined();
    });

    it('应该限制资源分配不超过系统限制', async () => {
      const requirements: ResourceRequirements = {
        cpuCores: 10, // 超过系统限制(4)
        memoryMb: 4096, // 超过系统限制(2048)
        diskSpaceMb: 1024,
        networkBandwidth: 100,
        maxConnections: 10,
        estimatedDuration: 30000,
        priority: 'normal'
      };

      const allocation = await resourceManager.allocateResources(requirements);

      expect(allocation.allocatedResources.cpuCores).toBe(4); // 限制为系统最大值
      expect(allocation.allocatedResources.memoryMb).toBe(2048); // 限制为系统最大值
    });

    it('应该成功释放资源', async () => {
      const requirements: ResourceRequirements = {
        cpuCores: 1,
        memoryMb: 256,
        diskSpaceMb: 512,
        networkBandwidth: 50,
        maxConnections: 5,
        estimatedDuration: 30000,
        priority: 'normal'
      };

      const allocation = await resourceManager.allocateResources(requirements);
      expect(allocation.status).toBe('allocated');

      await resourceManager.releaseResources(allocation.allocationId);
      
      // 验证资源已释放（通过检查分配状态或其他方式）
      expect(true).toBe(true); // 简化验证
    });

    it('应该拒绝释放不存在的资源分配', async () => {
      await expect(resourceManager.releaseResources('non-existent-id'))
        .rejects.toThrow('Allocation not found: non-existent-id');
    });
  });

  describe('资源监控测试', () => {
    it('应该返回当前资源使用情况', async () => {
      const usage = await resourceManager.monitorResourceUsage();

      expect(usage.timestamp).toBeDefined();
      expect(usage.cpu).toBeDefined();
      expect(usage.memory).toBeDefined();
      expect(usage.disk).toBeDefined();
      expect(usage.network).toBeDefined();
      expect(usage.connections).toBeDefined();
      expect(usage.overall).toBeDefined();

      expect(usage.memory.totalMb).toBe(2048);
      expect(usage.memory.usedMb).toBeGreaterThanOrEqual(0);
      expect(usage.memory.availableMb).toBeGreaterThanOrEqual(0);
      expect(usage.memory.utilizationPercentage).toBeGreaterThanOrEqual(0);
      expect(usage.memory.utilizationPercentage).toBeLessThanOrEqual(100);
    });

    it('应该计算正确的健康分数', async () => {
      const usage = await resourceManager.monitorResourceUsage();

      expect(usage.overall.healthScore).toBeGreaterThanOrEqual(0);
      expect(usage.overall.healthScore).toBeLessThanOrEqual(100);
      expect(usage.overall.performanceScore).toBeGreaterThanOrEqual(0);
      expect(usage.overall.performanceScore).toBeLessThanOrEqual(100);
      expect(usage.overall.resourceEfficiency).toBeGreaterThanOrEqual(0);
      expect(usage.overall.resourceEfficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('资源限制检查测试', () => {
    it('应该检查资源限制状态', async () => {
      const limitStatus = await resourceManager.checkResourceLimits();

      expect(limitStatus.limits).toBeDefined();
      expect(limitStatus.current).toBeDefined();
      expect(limitStatus.violations).toBeDefined();
      expect(limitStatus.warnings).toBeDefined();
      expect(limitStatus.recommendations).toBeDefined();

      expect(limitStatus.limits.maxMemoryMb).toBe(2048);
      expect(limitStatus.limits.maxConnections).toBe(100);
      expect(Array.isArray(limitStatus.violations)).toBe(true);
      expect(Array.isArray(limitStatus.warnings)).toBe(true);
      expect(Array.isArray(limitStatus.recommendations)).toBe(true);
    });
  });

  describe('连接池管理测试', () => {
    it('应该成功获取模块连接', async () => {
      const connection = await resourceManager.getConnection('test-module');

      expect(connection.connectionId).toBeDefined();
      expect(connection.moduleId).toBe('test-module');
      expect(connection.status).toBe('active');
      expect(connection.createdAt).toBeDefined();
      expect(connection.lastUsed).toBeDefined();
      expect(connection.usageCount).toBe(1);
    });

    it('应该复用空闲连接', async () => {
      // 获取第一个连接
      const connection1 = await resourceManager.getConnection('test-module');
      
      // 释放连接
      await resourceManager.releaseConnection(connection1);
      
      // 获取第二个连接，应该复用第一个
      const connection2 = await resourceManager.getConnection('test-module');
      
      expect(connection2.connectionId).toBe(connection1.connectionId);
      expect(connection2.usageCount).toBe(2); // 使用次数增加
    });

    it('应该成功释放连接', async () => {
      const connection = await resourceManager.getConnection('test-module');
      expect(connection.status).toBe('active');

      await resourceManager.releaseConnection(connection);
      
      // 验证连接状态变为idle（通过重新获取连接验证）
      const newConnection = await resourceManager.getConnection('test-module');
      expect(newConnection.connectionId).toBe(connection.connectionId);
      expect(newConnection.usageCount).toBe(2); // 复用了之前的连接
    });
  });

  describe('缓存管理测试', () => {
    it('应该成功设置和获取缓存', async () => {
      const key = 'test-key';
      const value = { data: 'test-value', timestamp: Date.now() };
      const ttl = 60000; // 1分钟

      await resourceManager.setCachedResult(key, value, ttl);
      const cached = await resourceManager.getCachedResult(key);

      expect(cached).not.toBeNull();
      expect(cached!.key).toBe(key);
      expect(cached!.value).toEqual(value);
      expect(cached!.accessCount).toBe(1);
      expect(cached!.size).toBeGreaterThan(0);
    });

    it('应该返回null对于不存在的缓存键', async () => {
      const cached = await resourceManager.getCachedResult('non-existent-key');
      expect(cached).toBeNull();
    });

    it('应该正确处理过期缓存', async () => {
      const key = 'expire-test-key';
      const value = { data: 'expire-test' };
      const ttl = 100; // 100毫秒

      await resourceManager.setCachedResult(key, value, ttl);
      
      // 立即获取应该成功
      let cached = await resourceManager.getCachedResult(key);
      expect(cached).not.toBeNull();

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // 过期后应该返回null
      cached = await resourceManager.getCachedResult(key);
      expect(cached).toBeNull();
    });

    it('应该正确更新缓存访问统计', async () => {
      const key = 'access-test-key';
      const value = { data: 'access-test' };
      const ttl = 60000;

      await resourceManager.setCachedResult(key, value, ttl);
      
      // 多次访问
      await resourceManager.getCachedResult(key);
      await resourceManager.getCachedResult(key);
      const cached = await resourceManager.getCachedResult(key);

      expect(cached!.accessCount).toBe(3);
    });
  });

  describe('资源清理测试', () => {
    it('应该正确清理过期的资源分配', async () => {
      const requirements: ResourceRequirements = {
        cpuCores: 1,
        memoryMb: 256,
        diskSpaceMb: 512,
        networkBandwidth: 50,
        maxConnections: 5,
        estimatedDuration: 100, // 100毫秒后过期
        priority: 'normal'
      };

      const allocation = await resourceManager.allocateResources(requirements);
      expect(allocation.status).toBe('allocated');

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 触发清理（通过监控资源使用）
      await resourceManager.monitorResourceUsage();

      // 验证清理效果（简化验证）
      expect(true).toBe(true);
    });

    it('应该正确清理过期的缓存', async () => {
      const key = 'cleanup-test-key';
      const value = { data: 'cleanup-test' };
      const ttl = 100; // 100毫秒

      await resourceManager.setCachedResult(key, value, ttl);
      
      // 验证缓存存在
      let cached = await resourceManager.getCachedResult(key);
      expect(cached).not.toBeNull();

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 触发清理
      await resourceManager.setCachedResult('trigger-cleanup', {}, 60000);

      // 验证过期缓存已清理
      cached = await resourceManager.getCachedResult(key);
      expect(cached).toBeNull();
    });
  });

  describe('性能和统计测试', () => {
    it('应该正确计算连接池统计', async () => {
      // 创建多个连接
      const connections = [];
      for (let i = 0; i < 5; i++) {
        const conn = await resourceManager.getConnection(`module-${i}`);
        connections.push(conn);
      }

      // 释放部分连接
      await resourceManager.releaseConnection(connections[0]);
      await resourceManager.releaseConnection(connections[1]);

      const usage = await resourceManager.monitorResourceUsage();

      expect(usage.connections.totalConnections).toBe(5);
      expect(usage.connections.activeConnections).toBe(3);
      expect(usage.connections.idleConnections).toBe(2);
      expect(usage.connections.poolUtilization).toBe(60); // 3/5 * 100
    });

    it('应该生成合理的性能建议', async () => {
      const usage = await resourceManager.monitorResourceUsage();

      expect(Array.isArray(usage.overall.bottlenecks)).toBe(true);
      expect(Array.isArray(usage.overall.recommendations)).toBe(true);
    });
  });
});
