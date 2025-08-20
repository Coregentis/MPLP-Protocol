/**
 * 同步配置服务测试
 */

import {
  SyncConfigurationService,
  SyncConfigurationConfig,
  SyncStrategy,
  SyncTarget,
  ConflictResolution,
  ConsistencyLevel,
  SyncTargetConfig
} from '../../../src/modules/context/application/services/sync-configuration.service';
import { UUID } from '../../../src/modules/context/types';

describe('SyncConfigurationService', () => {
  let service: SyncConfigurationService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new SyncConfigurationService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认同步配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.syncStrategy).toBe('real_time');
      expect(defaultConfig.syncTargets).toHaveLength(2);
      expect(defaultConfig.syncTargets![0].targetId).toBe('primary_db');
      expect(defaultConfig.syncTargets![0].targetType).toBe('database');
      expect(defaultConfig.syncTargets![1].targetId).toBe('cache_layer');
      expect(defaultConfig.syncTargets![1].targetType).toBe('cache');
      expect(defaultConfig.conflictResolution).toBe('last_write_wins');
      expect(defaultConfig.replicationConfig?.replicationFactor).toBe(2);
      expect(defaultConfig.replicationConfig?.consistencyLevel).toBe('eventual');
      expect(defaultConfig.replicationConfig?.autoFailover).toBe(true);
    });
  });

  describe('addSyncTarget', () => {
    it('应该成功添加同步目标', async () => {
      const target: SyncTargetConfig = {
        targetId: 'test-target',
        targetType: 'database',
        endpoint: 'postgresql://localhost:5432/test',
        enabled: true,
        priority: 1
      };

      const result = await service.addSyncTarget(target);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.targetStatistics['test-target']).toBeDefined();
    });

    it('应该拒绝添加重复的目标', async () => {
      const target: SyncTargetConfig = {
        targetId: 'duplicate-target',
        targetType: 'cache',
        enabled: true,
        priority: 1
      };

      await service.addSyncTarget(target);
      const result = await service.addSyncTarget(target);
      expect(result).toBe(false);
    });

    it('应该在服务禁用时拒绝添加目标', async () => {
      const disabledService = new SyncConfigurationService({ enabled: false });
      const target: SyncTargetConfig = {
        targetId: 'test-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      };

      const result = await disabledService.addSyncTarget(target);
      expect(result).toBe(false);
    });

    it('应该支持所有目标类型', async () => {
      const targetTypes: SyncTarget[] = ['database', 'cache', 'external_service', 'module'];
      
      for (const targetType of targetTypes) {
        const target: SyncTargetConfig = {
          targetId: `${targetType}-target`,
          targetType,
          enabled: true,
          priority: 1
        };

        const result = await service.addSyncTarget(target);
        expect(result).toBe(true);
      }
    });
  });

  describe('removeSyncTarget', () => {
    beforeEach(async () => {
      await service.addSyncTarget({
        targetId: 'removable-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
    });

    it('应该成功移除同步目标', async () => {
      const result = await service.removeSyncTarget('removable-target');
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.targetStatistics['removable-target']).toBeUndefined();
    });

    it('应该处理移除不存在的目标', async () => {
      const result = await service.removeSyncTarget('non-existent-target');
      expect(result).toBe(false);
    });
  });

  describe('syncContext', () => {
    beforeEach(async () => {
      await service.addSyncTarget({
        targetId: 'sync-target-1',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
      await service.addSyncTarget({
        targetId: 'sync-target-2',
        targetType: 'cache',
        enabled: true,
        priority: 2
      });
    });

    it('应该成功执行实时同步', async () => {
      const testData = { key: 'value', number: 42 };
      
      const result = await service.syncContext(mockContextId, 'create', testData);

      expect(result.success).toBe(true);
      expect(result.operationId).toBeDefined();
      expect(Object.keys(result.targetResults)).toHaveLength(2);
      expect(result.targetResults['sync-target-1'].success).toBe(true);
      expect(result.targetResults['sync-target-2'].success).toBe(true);
    });

    it('应该支持不同的操作类型', async () => {
      const operations: Array<'create' | 'update' | 'delete'> = ['create', 'update', 'delete'];
      
      for (const operation of operations) {
        const result = await service.syncContext(mockContextId, operation, { test: 'data' });
        expect(result.success).toBe(true);
      }
    });

    it('应该在服务禁用时返回失败', async () => {
      const disabledService = new SyncConfigurationService({ enabled: false });
      
      const result = await disabledService.syncContext(mockContextId, 'create', {});
      expect(result.success).toBe(false);
    });

    it('应该支持不同的同步策略', async () => {
      const strategies: SyncStrategy[] = ['real_time', 'batch', 'event_driven', 'scheduled'];
      
      for (const strategy of strategies) {
        const strategyService = new SyncConfigurationService({ syncStrategy: strategy });
        await strategyService.addSyncTarget({
          targetId: 'strategy-target',
          targetType: 'database',
          enabled: true,
          priority: 1
        });

        const result = await strategyService.syncContext(mockContextId, 'create', { strategy });
        expect(result.operationId).toBeDefined();
      }
    });
  });

  describe('getSyncStatus', () => {
    it('应该返回同步操作状态', async () => {
      await service.addSyncTarget({
        targetId: 'status-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const result = await service.syncContext(mockContextId, 'create', { test: 'data' });
      const status = service.getSyncStatus(result.operationId);

      expect(status).toBeDefined();
      expect(status!.operationId).toBe(result.operationId);
      expect(status!.contextId).toBe(mockContextId);
      expect(status!.operation).toBe('create');
      expect(status!.status).toBe('completed');
    });

    it('应该返回null对于不存在的操作', () => {
      const status = service.getSyncStatus('non-existent-operation' as UUID);
      expect(status).toBeNull();
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      await service.addSyncTarget({
        targetId: 'stats-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
    });

    it('应该返回正确的统计信息', async () => {
      // 执行一些同步操作
      await service.syncContext(mockContextId, 'create', { data: 1 });
      await service.syncContext(mockContextId, 'update', { data: 2 });

      const stats = service.getStatistics();

      expect(stats.totalOperations).toBe(2);
      expect(stats.successfulOperations).toBe(2);
      expect(stats.failedOperations).toBe(0);
      expect(stats.pendingOperations).toBe(0);
      expect(stats.targetStatistics['stats-target']).toBeDefined();
      expect(stats.targetStatistics['stats-target'].operations).toBe(2);
      expect(stats.targetStatistics['stats-target'].successes).toBe(2);
    });

    it('应该正确计算平均同步时间', async () => {
      await service.syncContext(mockContextId, 'create', { test: 'data' });
      
      const stats = service.getStatistics();
      expect(stats.averageSyncTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回unhealthy当没有目标时', () => {
      const health = service.getHealthStatus();

      expect(health.overall).toBe('unhealthy');
      expect(health.issues).toContain('No sync targets configured');
    });

    it('应该返回healthy当所有目标正常时', async () => {
      await service.addSyncTarget({
        targetId: 'healthy-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      // 执行一些成功的同步操作
      await service.syncContext(mockContextId, 'create', { test: 'data' });

      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');
      expect(health.targets['healthy-target']).toBe('healthy');
    });

    it('应该检测目标的健康问题', async () => {
      await service.addSyncTarget({
        targetId: 'problem-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const health = service.getHealthStatus();
      expect(health.targets['problem-target']).toBe('unhealthy');
      expect(health.issues.some(issue => issue.includes('No statistics available'))).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('应该成功更新配置', async () => {
      const newConfig: Partial<SyncConfigurationConfig> = {
        syncStrategy: 'batch',
        conflictResolution: 'merge',
        replicationConfig: {
          replicationFactor: 3,
          consistencyLevel: 'strong',
          autoFailover: true,
          syncTimeout: 10000
        }
      };

      const result = await service.updateConfig(newConfig);
      expect(result).toBe(true);
    });

    it('应该支持部分配置更新', async () => {
      const partialConfig: Partial<SyncConfigurationConfig> = {
        enabled: false
      };

      const result = await service.updateConfig(partialConfig);
      expect(result).toBe(true);
    });
  });

  describe('同步策略测试', () => {
    beforeEach(async () => {
      await service.addSyncTarget({
        targetId: 'strategy-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
    });

    it('应该支持实时同步策略', async () => {
      const realtimeService = new SyncConfigurationService({ syncStrategy: 'real_time' });
      await realtimeService.addSyncTarget({
        targetId: 'realtime-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const result = await realtimeService.syncContext(mockContextId, 'create', { strategy: 'real_time' });
      expect(result.success).toBe(true);
    });

    it('应该支持批量同步策略', async () => {
      const batchService = new SyncConfigurationService({ syncStrategy: 'batch' });
      await batchService.addSyncTarget({
        targetId: 'batch-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const result = await batchService.syncContext(mockContextId, 'create', { strategy: 'batch' });
      expect(result.operationId).toBeDefined();
    });

    it('应该支持事件驱动同步策略', async () => {
      const eventService = new SyncConfigurationService({ syncStrategy: 'event_driven' });
      await eventService.addSyncTarget({
        targetId: 'event-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const result = await eventService.syncContext(mockContextId, 'create', { strategy: 'event_driven' });
      expect(result.operationId).toBeDefined();
    });

    it('应该支持定时同步策略', async () => {
      const scheduledService = new SyncConfigurationService({ syncStrategy: 'scheduled' });
      await scheduledService.addSyncTarget({
        targetId: 'scheduled-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      const result = await scheduledService.syncContext(mockContextId, 'create', { strategy: 'scheduled' });
      expect(result.operationId).toBeDefined();
    });
  });

  describe('冲突解决策略测试', () => {
    it('应该支持不同的冲突解决策略', async () => {
      const strategies: ConflictResolution[] = ['last_write_wins', 'merge', 'manual', 'versioned'];
      
      for (const strategy of strategies) {
        const conflictService = new SyncConfigurationService({ conflictResolution: strategy });
        await conflictService.addSyncTarget({
          targetId: 'conflict-target',
          targetType: 'database',
          enabled: true,
          priority: 1
        });

        const result = await conflictService.syncContext(mockContextId, 'update', { conflict: strategy });
        expect(result.operationId).toBeDefined();
      }
    });
  });

  describe('复制配置测试', () => {
    it('应该支持不同的一致性级别', async () => {
      const levels: ConsistencyLevel[] = ['eventual', 'strong', 'weak'];
      
      for (const level of levels) {
        const replicationService = new SyncConfigurationService({
          replicationConfig: {
            replicationFactor: 2,
            consistencyLevel: level,
            autoFailover: true
          }
        });

        await replicationService.addSyncTarget({
          targetId: 'replication-target',
          targetType: 'database',
          enabled: true,
          priority: 1
        });

        const result = await replicationService.syncContext(mockContextId, 'create', { consistency: level });
        expect(result.operationId).toBeDefined();
      }
    });

    it('应该支持不同的复制因子', async () => {
      const factors = [1, 2, 3, 5];
      
      for (const factor of factors) {
        const replicationService = new SyncConfigurationService({
          replicationConfig: {
            replicationFactor: factor,
            consistencyLevel: 'eventual'
          }
        });

        const defaultConfig = replicationService.getDefaultConfig();
        expect(defaultConfig.replicationConfig?.replicationFactor).toBeDefined();
      }
    });
  });

  describe('集成测试', () => {
    it('应该完整的同步生命周期', async () => {
      // 1. 添加多个同步目标
      await service.addSyncTarget({
        targetId: 'integration-db',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
      await service.addSyncTarget({
        targetId: 'integration-cache',
        targetType: 'cache',
        enabled: true,
        priority: 2
      });

      // 2. 执行同步操作
      const createResult = await service.syncContext(mockContextId, 'create', { lifecycle: 'test' });
      expect(createResult.success).toBe(true);

      // 3. 检查操作状态
      const status = service.getSyncStatus(createResult.operationId);
      expect(status?.status).toBe('completed');

      // 4. 更新数据
      const updateResult = await service.syncContext(mockContextId, 'update', { lifecycle: 'updated' });
      expect(updateResult.success).toBe(true);

      // 5. 删除数据
      const deleteResult = await service.syncContext(mockContextId, 'delete', {});
      expect(deleteResult.success).toBe(true);

      // 6. 检查统计
      const stats = service.getStatistics();
      expect(stats.totalOperations).toBe(3);
      expect(stats.successfulOperations).toBe(3);

      // 7. 健康检查
      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');
    });

    it('应该处理并发同步操作', async () => {
      await service.addSyncTarget({
        targetId: 'concurrent-target',
        targetType: 'database',
        enabled: true,
        priority: 1
      });

      // 并发执行多个同步操作
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(service.syncContext(`context-${i}` as UUID, 'create', { index: i }));
      }

      const results = await Promise.all(operations);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.operationId).toBeDefined();
      });

      const stats = service.getStatistics();
      expect(stats.totalOperations).toBe(10);
      expect(stats.successfulOperations).toBe(10);
    });

    it('应该正确处理目标优先级', async () => {
      await service.addSyncTarget({
        targetId: 'high-priority',
        targetType: 'database',
        enabled: true,
        priority: 1
      });
      await service.addSyncTarget({
        targetId: 'low-priority',
        targetType: 'cache',
        enabled: true,
        priority: 10
      });

      const result = await service.syncContext(mockContextId, 'create', { priority: 'test' });
      expect(result.success).toBe(true);
      expect(Object.keys(result.targetResults)).toHaveLength(2);
    });
  });
});
