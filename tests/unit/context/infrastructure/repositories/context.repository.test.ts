/**
 * Context Repository v2.0 测试
 * 
 * 验证Repository的完整功能
 * 支持14个功能域的查询和操作
 */

import { ContextRepository } from '../../../../../src/modules/context/infrastructure/repositories/context.repository';
import { Context } from '../../../../../src/modules/context/domain/entities/context.entity';
import { ContextEntityData } from '../../../../../src/modules/context/api/mappers/context.mapper';

describe('ContextRepository测试', () => {
  let repository: ContextRepository;
  let sampleContextData: ContextEntityData;

  beforeEach(() => {
    repository = new ContextRepository();
    
    // 创建示例数据
    sampleContextData = {
      protocolVersion: '1.0.0',
      timestamp: new Date('2025-08-14T10:00:00Z'),
      contextId: '123e4567-e89b-42d3-a456-426614174000',
      name: '测试上下文',
      description: '测试描述',
      status: 'active',
      lifecycleStage: 'planning',
      
      sharedState: {
        variables: { env: 'test' },
        resources: {
          allocated: {
            memory: { type: 'ram', amount: 1024, unit: 'mb', status: 'available' }
          },
          requirements: {
            storage: { minimum: 5, optimal: 10, maximum: 20, unit: 'gb' }
          }
        },
        dependencies: [],
        goals: []
      },
      
      accessControl: {
        owner: { userId: 'user-123', role: 'owner' },
        permissions: []
      },
      
      configuration: {
        timeoutSettings: { defaultTimeout: 300, maxTimeout: 3600 },
        persistence: { enabled: true, storageBackend: 'database' }
      },
      
      auditTrail: {
        enabled: true,
        retentionDays: 30,
        auditEvents: []
      },
      
      monitoringIntegration: {
        enabled: true,
        supportedProviders: ['prometheus'],
        exportFormats: ['prometheus']
      },
      
      performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60
      },
      
      versionHistory: {
        enabled: true,
        maxVersions: 50,
        versions: []
      },
      
      searchMetadata: {
        enabled: true,
        indexingStrategy: 'full_text',
        searchableFields: ['context_name'],
        searchIndexes: []
      },
      
      cachingPolicy: {
        enabled: true,
        cacheStrategy: 'lru',
        cacheLevels: []
      },
      
      syncConfiguration: {
        enabled: true,
        syncStrategy: 'real_time',
        syncTargets: []
      },
      
      errorHandling: {
        enabled: true,
        errorPolicies: []
      },
      
      integrationEndpoints: {
        enabled: true,
        webhooks: [],
        apiEndpoints: []
      },
      
      eventIntegration: {
        enabled: true,
        publishedEvents: ['context_created'],
        subscribedEvents: ['plan_executed']
      }
    };
  });

  describe('基础CRUD操作', () => {
    it('应该能保存和查找Context', async () => {
      const context = new Context(sampleContextData);
      
      // 保存
      await repository.save(context);
      
      // 查找
      const found = await repository.findById(context.contextId);
      
      expect(found).not.toBeNull();
      expect(found!.contextId).toBe(context.contextId);
      expect(found!.name).toBe(context.name);
    });

    it('应该能删除Context', async () => {
      const context = new Context(sampleContextData);
      
      // 保存
      await repository.save(context);
      
      // 验证存在
      expect(await repository.exists(context.contextId)).toBe(true);
      
      // 删除
      await repository.delete(context.contextId);
      
      // 验证不存在
      expect(await repository.exists(context.contextId)).toBe(false);
      expect(await repository.findById(context.contextId)).toBeNull();
    });

    it('应该能通过名称查找Context', async () => {
      const context = new Context(sampleContextData);
      
      await repository.save(context);
      
      const found = await repository.findByName(context.name);
      
      expect(found).not.toBeNull();
      expect(found!.contextId).toBe(context.contextId);
    });
  });

  describe('功能域特定查询', () => {
    beforeEach(async () => {
      // 创建多个测试Context
      const contexts = [
        new Context({
          ...sampleContextData,
          contextId: 'context-1',
          name: 'Context 1',
          accessControl: {
            owner: { userId: 'user-123', role: 'owner' },
            permissions: []
          }
        }),
        new Context({
          ...sampleContextData,
          contextId: 'context-2',
          name: 'Context 2',
          accessControl: {
            owner: { userId: 'user-456', role: 'owner' },
            permissions: []
          }
        })
      ];
      
      for (const context of contexts) {
        await repository.save(context);
      }
    });

    it('应该能按共享状态查找Context', async () => {
      const results = await repository.findBySharedState({ env: 'test' });
      
      expect(results).toHaveLength(2);
      expect(results.every(c => c.sharedState.variables.env === 'test')).toBe(true);
    });

    it('应该能按所有者查找Context', async () => {
      const results = await repository.findByOwner('user-123');
      
      expect(results).toHaveLength(1);
      expect(results[0].accessControl.owner.userId).toBe('user-123');
    });

    it('应该能按配置查找Context', async () => {
      const results = await repository.findByConfiguration('database');
      
      expect(results).toHaveLength(2);
      expect(results.every(c => c.configuration.persistence.storageBackend === 'database')).toBe(true);
    });

    it('应该能查找启用审计的Context', async () => {
      const results = await repository.findWithAuditEnabled();
      
      expect(results).toHaveLength(2);
      expect(results.every(c => c.auditTrail.enabled)).toBe(true);
    });

    it('应该能查找启用监控的Context', async () => {
      const results = await repository.findWithMonitoringEnabled();
      
      expect(results).toHaveLength(2);
      expect(results.every(c => c.monitoringIntegration.enabled)).toBe(true);
    });
  });

  describe('分页和排序', () => {
    beforeEach(async () => {
      // 创建多个测试Context
      for (let i = 1; i <= 5; i++) {
        const context = new Context({
          ...sampleContextData,
          contextId: `context-${i}`,
          name: `Context ${i}`,
          timestamp: new Date(`2025-08-${10 + i}T10:00:00Z`)
        });
        await repository.save(context);
      }
    });

    it('应该支持分页查询', async () => {
      const page1 = await repository.findMany(undefined, { page: 1, limit: 2 });
      const page2 = await repository.findMany(undefined, { page: 2, limit: 2 });
      
      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.totalPages).toBe(3);
      
      expect(page2.items).toHaveLength(2);
      expect(page2.page).toBe(2);
    });

    it('应该支持按名称排序', async () => {
      const result = await repository.findMany(undefined, {
        page: 1,
        limit: 10,
        sortField: 'name',
        sortOrder: 'asc'
      });
      
      expect(result.items).toHaveLength(5);
      
      // 验证排序
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i-1].name <= result.items[i].name).toBe(true);
      }
    });
  });

  describe('聚合查询', () => {
    beforeEach(async () => {
      // 创建不同状态的Context
      const contexts = [
        new Context({ ...sampleContextData, contextId: 'c1', status: 'active' }),
        new Context({ ...sampleContextData, contextId: 'c2', status: 'active' }),
        new Context({ ...sampleContextData, contextId: 'c3', status: 'inactive' })
      ];
      
      for (const context of contexts) {
        await repository.save(context);
      }
    });

    it('应该能获取状态统计', async () => {
      const stats = await repository.getStatusStatistics();
      
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
    });

    it('应该能获取功能域启用统计', async () => {
      const stats = await repository.getFeatureDomainStatistics();
      
      expect(stats.auditEnabled).toBe(3);
      expect(stats.monitoringEnabled).toBe(3);
      expect(stats.performanceEnabled).toBe(3);
    });

    it('应该能获取配置分布统计', async () => {
      const stats = await repository.getConfigurationStatistics();
      
      expect(stats.storageBackends.database).toBe(3);
      expect(stats.cacheStrategies.lru).toBe(3);
      expect(stats.syncStrategies.real_time).toBe(3);
    });
  });

  describe('批量操作', () => {
    it('应该支持批量保存', async () => {
      const contexts = [
        new Context({ ...sampleContextData, contextId: 'batch-1', name: 'Batch 1' }),
        new Context({ ...sampleContextData, contextId: 'batch-2', name: 'Batch 2' })
      ];
      
      await repository.saveMany(contexts);
      
      const count = await repository.count();
      expect(count).toBe(2);
    });

    it('应该支持批量删除', async () => {
      const contexts = [
        new Context({ ...sampleContextData, contextId: 'delete-1', name: 'Delete 1' }),
        new Context({ ...sampleContextData, contextId: 'delete-2', name: 'Delete 2' })
      ];
      
      await repository.saveMany(contexts);
      
      await repository.deleteMany(['delete-1', 'delete-2']);
      
      const count = await repository.count();
      expect(count).toBe(0);
    });
  });
});
