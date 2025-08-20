/**
 * 缓存策略服务测试
 */

import {
  CachingPolicyService,
  CachingPolicyConfig,
  CacheStrategy,
  CacheBackend,
  EvictionPolicy,
  CacheLevel
} from '../../../src/modules/context/application/services/caching-policy.service';
import { UUID } from '../../../src/modules/context/types';

describe('CachingPolicyService', () => {
  let service: CachingPolicyService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new CachingPolicyService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认缓存策略配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.cacheStrategy).toBe('lru');
      expect(defaultConfig.cacheLevels).toHaveLength(2);
      expect(defaultConfig.cacheLevels![0].level).toBe('L1');
      expect(defaultConfig.cacheLevels![0].backend).toBe('memory');
      expect(defaultConfig.cacheLevels![1].level).toBe('L2');
      expect(defaultConfig.cacheLevels![1].backend).toBe('redis');
      expect(defaultConfig.cacheWarming?.enabled).toBe(true);
      expect(defaultConfig.cacheWarming?.strategies).toContain('preload_frequent');
    });
  });

  describe('set and get', () => {
    it('应该成功设置和获取缓存项', async () => {
      const key = 'test-key';
      const value = { data: 'test-value', number: 42 };

      const setResult = await service.set(key, value, mockContextId);
      expect(setResult).toBe(true);

      const getResult = await service.get(key, mockContextId);
      expect(getResult.success).toBe(true);
      expect(getResult.fromCache).toBe(true);
      expect(getResult.value).toEqual(value);
      expect(getResult.level).toBe('L1');
    });

    it('应该在服务禁用时拒绝操作', async () => {
      const disabledService = new CachingPolicyService({ enabled: false });

      const setResult = await disabledService.set('key', 'value');
      expect(setResult).toBe(false);

      const getResult = await disabledService.get('key');
      expect(getResult.success).toBe(false);
      expect(getResult.error).toBe('Caching is disabled');
    });

    it('应该处理不同的数据类型', async () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 12345 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3, 'test'] },
        { key: 'object', value: { nested: { data: 'value' } } },
        { key: 'null', value: null }
      ];

      for (const testCase of testCases) {
        await service.set(testCase.key, testCase.value, mockContextId);
        const result = await service.get(testCase.key, mockContextId);
        
        expect(result.success).toBe(true);
        expect(result.value).toEqual(testCase.value);
      }
    });

    it('应该支持自定义TTL', async () => {
      const key = 'ttl-test';
      const value = 'test-value';
      const customTtl = 60; // 60秒

      await service.set(key, value, mockContextId, customTtl);
      const result = await service.get(key, mockContextId);

      expect(result.success).toBe(true);
      expect(result.value).toBe(value);
    });

    it('应该在缓存未命中时返回正确结果', async () => {
      const result = await service.get('non-existent-key', mockContextId);

      expect(result.success).toBe(false);
      expect(result.fromCache).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await service.set('test-key', 'test-value', mockContextId);
    });

    it('应该成功删除缓存项', async () => {
      const deleteResult = await service.delete('test-key', mockContextId);
      expect(deleteResult).toBe(true);

      const getResult = await service.get('test-key', mockContextId);
      expect(getResult.success).toBe(false);
    });

    it('应该处理删除不存在的键', async () => {
      const result = await service.delete('non-existent-key', mockContextId);
      expect(result).toBe(false);
    });

    it('应该在服务禁用时返回false', async () => {
      const disabledService = new CachingPolicyService({ enabled: false });
      const result = await disabledService.delete('any-key');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await service.set('key1', 'value1', mockContextId);
      await service.set('key2', 'value2', mockContextId);
      await service.set('key3', 'value3', mockContextId);
    });

    it('应该清空所有缓存', async () => {
      const result = await service.clear();
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.totalItems).toBe(0);
      expect(stats.totalSizeBytes).toBe(0);
    });

    it('应该清空指定级别的缓存', async () => {
      const result = await service.clear('L1');
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.totalItems).toBe(0);
    });
  });

  describe('warmCache', () => {
    it('应该成功预热缓存', async () => {
      const warmData = [
        { key: 'warm1', value: 'value1', contextId: mockContextId },
        { key: 'warm2', value: 'value2', contextId: mockContextId },
        { key: 'warm3', value: 'value3' }
      ];

      const warmedCount = await service.warmCache(warmData);
      expect(warmedCount).toBe(3);

      // 验证预热的数据可以获取
      for (const item of warmData) {
        const result = await service.get(item.key, item.contextId);
        expect(result.success).toBe(true);
        expect(result.value).toBe(item.value);
      }
    });

    it('应该在缓存预热禁用时返回0', async () => {
      const serviceWithoutWarming = new CachingPolicyService({
        cacheWarming: { enabled: false }
      });

      const warmData = [{ key: 'test', value: 'value' }];
      const result = await serviceWithoutWarming.warmCache(warmData);
      expect(result).toBe(0);
    });

    it('应该在服务禁用时返回0', async () => {
      const disabledService = new CachingPolicyService({ enabled: false });
      const warmData = [{ key: 'test', value: 'value' }];
      const result = await disabledService.warmCache(warmData);
      expect(result).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('应该返回正确的统计信息', async () => {
      // 添加一些缓存项
      await service.set('key1', 'value1', mockContextId);
      await service.set('key2', 'value2', mockContextId);

      // 执行一些获取操作
      await service.get('key1', mockContextId); // hit
      await service.get('key2', mockContextId); // hit
      await service.get('key3', mockContextId); // miss

      const stats = service.getStatistics();

      expect(stats.totalItems).toBe(2);
      expect(stats.hitCount).toBe(2);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2/3, 2);
      expect(stats.levelStatistics.L1).toBeDefined();
      expect(stats.levelStatistics.L1.items).toBe(2);
      expect(stats.levelStatistics.L1.hits).toBe(2);
      expect(stats.levelStatistics.L1.misses).toBe(1); // 有一次miss（key3）
    });

    it('应该正确计算命中率', async () => {
      await service.set('key1', 'value1');
      
      // 5次命中，3次未命中
      for (let i = 0; i < 5; i++) {
        await service.get('key1');
      }
      for (let i = 0; i < 3; i++) {
        await service.get('non-existent');
      }

      const stats = service.getStatistics();
      expect(stats.hitRate).toBeCloseTo(5/8, 2);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回健康状态', async () => {
      const health = service.getHealthStatus();

      expect(health.overall).toBe('healthy');
      expect(health.levels.L1).toBe('healthy');
      expect(health.issues).toHaveLength(0);
    });

    it('应该检测低命中率问题', async () => {
      // 创建大量未命中来降低命中率
      for (let i = 0; i < 150; i++) {
        await service.get(`non-existent-${i}`);
      }

      const health = service.getHealthStatus();
      expect(health.overall).toBe('unhealthy'); // 因为没有连接，所以是unhealthy
      expect(health.issues.some(issue => issue.includes('low hit rate'))).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('应该成功更新配置', async () => {
      const newConfig: Partial<CachingPolicyConfig> = {
        cacheStrategy: 'lfu',
        cacheWarming: {
          enabled: true,
          strategies: ['background_refresh']
        }
      };

      const result = await service.updateConfig(newConfig);
      expect(result).toBe(true);
    });

    it('应该在缓存级别变化时重新初始化', async () => {
      const newLevels: CacheLevel[] = [
        {
          level: 'L1',
          backend: 'memory',
          ttlSeconds: 600,
          maxSizeMb: 200
        }
      ];

      const result = await service.updateConfig({ cacheLevels: newLevels });
      expect(result).toBe(true);
    });
  });

  describe('缓存策略测试', () => {
    it('应该支持LRU策略', async () => {
      const lruService = new CachingPolicyService({
        cacheStrategy: 'lru',
        cacheLevels: [{
          level: 'L1',
          backend: 'memory',
          ttlSeconds: 3600,
          maxSizeMb: 0.001, // 很小的缓存来触发驱逐
          evictionPolicy: 'lru'
        }]
      });

      // 添加多个项目触发驱逐
      await lruService.set('key1', 'a'.repeat(100));
      await lruService.set('key2', 'b'.repeat(100));
      await lruService.set('key3', 'c'.repeat(100));
      await lruService.set('key4', 'd'.repeat(100));

      const stats = lruService.getStatistics();
      expect(stats.evictionCount).toBeGreaterThan(0);
    });

    it('应该支持不同的缓存后端', async () => {
      const backends: CacheBackend[] = ['memory', 'redis', 'memcached', 'database'];
      
      for (const backend of backends) {
        const config: CachingPolicyConfig = {
          enabled: true,
          cacheStrategy: 'lru',
          cacheLevels: [{
            level: 'test',
            backend,
            ttlSeconds: 300
          }]
        };

        const testService = new CachingPolicyService(config);
        const result = await testService.set('test-key', 'test-value');
        expect(result).toBe(true);
      }
    });

    it('应该支持不同的驱逐策略', async () => {
      const policies: EvictionPolicy[] = ['lru', 'lfu', 'random', 'ttl'];
      
      for (const policy of policies) {
        const config: CachingPolicyConfig = {
          enabled: true,
          cacheStrategy: 'lru',
          cacheLevels: [{
            level: 'test',
            backend: 'memory',
            ttlSeconds: 300,
            evictionPolicy: policy
          }]
        };

        const testService = new CachingPolicyService(config);
        const result = await testService.set('test-key', 'test-value');
        expect(result).toBe(true);
      }
    });
  });

  describe('多级缓存测试', () => {
    let multiLevelService: CachingPolicyService;

    beforeEach(() => {
      multiLevelService = new CachingPolicyService({
        enabled: true,
        cacheStrategy: 'lru',
        cacheLevels: [
          {
            level: 'L1',
            backend: 'memory',
            ttlSeconds: 300,
            maxSizeMb: 0.001, // 很小，只能存储小项目
            evictionPolicy: 'lru'
          },
          {
            level: 'L2',
            backend: 'redis',
            ttlSeconds: 3600,
            maxSizeMb: 1, // 较大，可以存储大项目
            evictionPolicy: 'lru'
          }
        ]
      });
    });

    it('应该根据大小选择合适的缓存级别', async () => {
      const smallValue = 'small';
      const largeValue = 'x'.repeat(1000);

      await multiLevelService.set('small-key', smallValue);
      await multiLevelService.set('large-key', largeValue);

      const smallResult = await multiLevelService.get('small-key');
      const largeResult = await multiLevelService.get('large-key');

      expect(smallResult.success).toBe(true);
      expect(largeResult.success).toBe(true);
    });

    it('应该在多个级别中查找缓存项', async () => {
      await multiLevelService.set('test-key', 'test-value');
      
      const result = await multiLevelService.get('test-key');
      expect(result.success).toBe(true);
      expect(result.value).toBe('test-value');
    });
  });

  describe('集成测试', () => {
    it('应该完整的缓存生命周期', async () => {
      // 1. 设置缓存项
      await service.set('lifecycle-key', 'lifecycle-value', mockContextId);
      
      // 2. 获取缓存项
      let result = await service.get('lifecycle-key', mockContextId);
      expect(result.success).toBe(true);
      expect(result.value).toBe('lifecycle-value');

      // 3. 更新缓存项
      await service.set('lifecycle-key', 'updated-value', mockContextId);
      result = await service.get('lifecycle-key', mockContextId);
      expect(result.value).toBe('updated-value');

      // 4. 删除缓存项
      await service.delete('lifecycle-key', mockContextId);
      result = await service.get('lifecycle-key', mockContextId);
      expect(result.success).toBe(false);

      // 5. 检查统计
      const stats = service.getStatistics();
      expect(stats.hitCount).toBeGreaterThan(0);
      expect(stats.missCount).toBeGreaterThan(0);
    });

    it('应该处理并发操作', async () => {
      const operations = [];
      
      // 并发设置
      for (let i = 0; i < 10; i++) {
        operations.push(service.set(`concurrent-${i}`, `value-${i}`, mockContextId));
      }
      
      await Promise.all(operations);

      // 并发获取
      const getOperations = [];
      for (let i = 0; i < 10; i++) {
        getOperations.push(service.get(`concurrent-${i}`, mockContextId));
      }

      const results = await Promise.all(getOperations);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.value).toBe(`value-${index}`);
      });
    });

    it('应该正确处理缓存预热和统计', async () => {
      const warmData = Array.from({ length: 50 }, (_, i) => ({
        key: `warm-${i}`,
        value: `value-${i}`,
        contextId: mockContextId
      }));

      const warmedCount = await service.warmCache(warmData);
      expect(warmedCount).toBe(50);

      const stats = service.getStatistics();
      expect(stats.totalItems).toBe(50);

      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');
    });
  });
});
