/**
 * Trace仓库单元测试
 * 
 * @description 基于实际接口的TraceRepository测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { TraceRepository } from '../../../../src/modules/trace/infrastructure/repositories/trace.repository';
import { TraceEntityData, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter } from '../../../../src/modules/trace/types';
import { UUID, PaginationParams } from '../../../../src/shared/types';
import { TraceTestFactory } from '../factories/trace-test.factory';

describe('TraceRepository测试', () => {
  let repository: TraceRepository;

  beforeEach(() => {
    repository = new TraceRepository();
  });

  describe('create功能测试', () => {
    it('应该成功创建追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();

      // 🎬 Act
      const result = await repository.create(createRequest);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.traceId).toBeDefined();
      expect(result.contextId).toBe(createRequest.contextId);
      expect(result.traceType).toBe(createRequest.traceType);
      expect(result.severity).toBe(createRequest.severity);
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });

    it('应该验证必需字段', async () => {
      // 📋 Arrange
      const invalidRequest = {
        // 缺少必需字段
      } as CreateTraceRequest;

      // 🎬 Act & Assert
      await expect(repository.create(invalidRequest)).rejects.toThrow('Context ID is required');
    });

    it('应该验证事件名称', async () => {
      // 📋 Arrange
      const requestWithoutEventName = TraceTestFactory.createTraceRequest({
        event: {
          type: 'start',
          category: 'system',
          source: { component: 'test' }
        }
      });

      // 🎬 Act & Assert
      await expect(repository.create(requestWithoutEventName)).rejects.toThrow('Event name is required');
    });

    it('应该生成唯一的追踪ID', async () => {
      // 📋 Arrange
      const request1 = TraceTestFactory.createTraceRequest();
      const request2 = TraceTestFactory.createTraceRequest();

      // 🎬 Act
      const result1 = await repository.create(request1);
      const result2 = await repository.create(request2);

      // ✅ Assert
      expect(result1.traceId).not.toBe(result2.traceId);
    });

    it('应该设置默认值', async () => {
      // 📋 Arrange
      const minimalRequest = TraceTestFactory.createTraceRequest({
        traceOperation: undefined
      });

      // 🎬 Act
      const result = await repository.create(minimalRequest);

      // ✅ Assert
      expect(result.traceOperation).toBe('start');
      expect(result.auditTrail).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();
      expect(result.monitoringIntegration).toBeDefined();
    });
  });

  describe('findById功能测试', () => {
    it('应该找到存在的追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const created = await repository.create(createRequest);

      // 🎬 Act
      const result = await repository.findById(created.traceId);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.traceId).toBe(created.traceId);
      expect(result!.contextId).toBe(created.contextId);
    });

    it('应该返回null对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const nonExistentId = 'non-existent-trace' as UUID;

      // 🎬 Act
      const result = await repository.findById(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('update功能测试', () => {
    it('应该成功更新存在的追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const created = await repository.create(createRequest);

      // 等待1毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      const updateRequest = TraceTestFactory.createUpdateTraceRequest(created.traceId, {
        severity: 'error'
      });

      // 🎬 Act
      const result = await repository.update(updateRequest);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.traceId).toBe(created.traceId);
      expect(result.severity).toBe('error');
      expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(created.timestamp).getTime()); // 时间戳应该更新或保持
    });

    it('应该抛出错误对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const nonExistentId = 'non-existent-trace' as UUID;
      const updateRequest = TraceTestFactory.createUpdateTraceRequest(nonExistentId);

      // 🎬 Act & Assert
      await expect(repository.update(updateRequest)).rejects.toThrow(`Trace not found: ${nonExistentId}`);
    });

    it('应该只更新提供的字段', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const created = await repository.create(createRequest);
      const originalSeverity = created.severity;
      const updateRequest = TraceTestFactory.createUpdateTraceRequest(created.traceId, {
        severity: undefined, // 明确设置为undefined，不更新severity
        event: {
          type: 'progress',
          name: 'Updated Event',
          category: 'user'
        }
      });

      // 🎬 Act
      const result = await repository.update(updateRequest);

      // ✅ Assert
      expect(result.severity).toBe(originalSeverity); // 未更新的字段保持不变
      expect(result.event.name).toBe('Updated Event'); // 更新的字段改变
    });
  });

  describe('delete功能测试', () => {
    it('应该成功删除存在的追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const created = await repository.create(createRequest);

      // 🎬 Act
      const result = await repository.delete(created.traceId);

      // ✅ Assert
      expect(result).toBe(true);
      
      // 验证记录已被删除
      const found = await repository.findById(created.traceId);
      expect(found).toBeNull();
    });

    it('应该返回false对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const nonExistentId = 'non-existent-trace' as UUID;

      // 🎬 Act
      const result = await repository.delete(nonExistentId);

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('exists功能测试', () => {
    it('应该返回true对于存在的追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const created = await repository.create(createRequest);

      // 🎬 Act
      const result = await repository.exists(created.traceId);

      // ✅ Assert
      expect(result).toBe(true);
    });

    it('应该返回false对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const nonExistentId = 'non-existent-trace' as UUID;

      // 🎬 Act
      const result = await repository.exists(nonExistentId);

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('query功能测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      await repository.create(TraceTestFactory.createTraceRequest({
        contextId: 'ctx-001' as UUID,
        traceType: 'execution',
        severity: 'info'
      }));
      await repository.create(TraceTestFactory.createTraceRequest({
        contextId: 'ctx-002' as UUID,
        traceType: 'monitoring',
        severity: 'warn'
      }));
      await repository.create(TraceTestFactory.createTraceRequest({
        contextId: 'ctx-001' as UUID,
        traceType: 'execution',
        severity: 'error'
      }));
    });

    it('应该返回所有记录当没有过滤条件时', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {};

      // 🎬 Act
      const result = await repository.query(filter);

      // ✅ Assert
      expect(result.traces).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('应该按上下文ID过滤', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {
        contextId: 'ctx-001' as UUID
      };

      // 🎬 Act
      const result = await repository.query(filter);

      // ✅ Assert
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.traces.every(t => t.contextId === 'ctx-001')).toBe(true);
    });

    it('应该按追踪类型过滤', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {
        traceType: 'execution'
      };

      // 🎬 Act
      const result = await repository.query(filter);

      // ✅ Assert
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.traces.every(t => t.traceType === 'execution')).toBe(true);
    });

    it('应该按严重程度数组过滤', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {
        severity: ['info', 'warn']
      };

      // 🎬 Act
      const result = await repository.query(filter);

      // ✅ Assert
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.traces.every(t => ['info', 'warn'].includes(t.severity))).toBe(true);
    });

    it('应该支持分页', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {};
      const pagination: PaginationParams = { page: 1, limit: 2 };

      // 🎬 Act
      const result = await repository.query(filter, pagination);

      // ✅ Assert
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(3); // 总数不变
    });

    it('应该支持第二页分页', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {};
      const pagination: PaginationParams = { page: 2, limit: 2 };

      // 🎬 Act
      const result = await repository.query(filter, pagination);

      // ✅ Assert
      expect(result.traces).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('应该组合多个过滤条件', async () => {
      // 📋 Arrange
      const filter: TraceQueryFilter = {
        contextId: 'ctx-001' as UUID,
        traceType: 'execution',
        severity: 'info'
      };

      // 🎬 Act
      const result = await repository.query(filter);

      // ✅ Assert
      expect(result.traces).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.traces[0].contextId).toBe('ctx-001');
      expect(result.traces[0].traceType).toBe('execution');
      expect(result.traces[0].severity).toBe('info');
    });
  });

  describe('count功能测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      await repository.create(TraceTestFactory.createTraceRequest({
        traceType: 'execution',
        severity: 'info'
      }));
      await repository.create(TraceTestFactory.createTraceRequest({
        traceType: 'monitoring',
        severity: 'warn'
      }));
    });

    it('应该返回总数当没有过滤条件时', async () => {
      // 🎬 Act
      const result = await repository.count();

      // ✅ Assert
      expect(result).toBe(2);
    });

    it('应该返回过滤后的数量', async () => {
      // 📋 Arrange
      const filter = { traceType: 'execution' as const };

      // 🎬 Act
      const result = await repository.count(filter);

      // ✅ Assert
      expect(result).toBe(1);
    });

    it('应该返回0当没有匹配的记录时', async () => {
      // 📋 Arrange
      const filter = { traceType: 'audit' as const };

      // 🎬 Act
      const result = await repository.count(filter);

      // ✅ Assert
      expect(result).toBe(0);
    });
  });

  describe('批量操作测试', () => {
    it('应该成功批量创建追踪记录', async () => {
      // 📋 Arrange
      const requests = [
        TraceTestFactory.createTraceRequest(),
        TraceTestFactory.createTraceRequest(),
        TraceTestFactory.createTraceRequest()
      ];

      // 🎬 Act
      const result = await repository.createBatch(requests);

      // ✅ Assert
      expect(result).toHaveLength(3);
      expect(result.every(r => r.traceId)).toBe(true);
      
      // 验证所有记录都被创建
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('应该成功批量删除追踪记录', async () => {
      // 📋 Arrange
      const requests = [
        TraceTestFactory.createTraceRequest(),
        TraceTestFactory.createTraceRequest(),
        TraceTestFactory.createTraceRequest()
      ];
      const created = await repository.createBatch(requests);
      const traceIds = created.map(t => t.traceId);

      // 🎬 Act
      const deletedCount = await repository.deleteBatch(traceIds);

      // ✅ Assert
      expect(deletedCount).toBe(3);
      
      // 验证所有记录都被删除
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('应该处理部分存在的记录批量删除', async () => {
      // 📋 Arrange
      const request = TraceTestFactory.createTraceRequest();
      const created = await repository.create(request);
      const traceIds = [created.traceId, 'non-existent' as UUID];

      // 🎬 Act
      const deletedCount = await repository.deleteBatch(traceIds);

      // ✅ Assert
      expect(deletedCount).toBe(1); // 只删除了存在的记录
    });
  });

  describe('健康检查测试', () => {
    it('应该返回健康状态', async () => {
      // 🎬 Act
      const result = await repository.getHealthStatus();

      // ✅ Assert
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.details!.repository).toBe('TraceRepository');
      expect(result.details!.version).toBe('1.0.0');
      expect(typeof result.details!.tracesCount).toBe('number');
    });

    it('应该包含配置信息', async () => {
      // 📋 Arrange
      const config = { enableCaching: true, maxCacheSize: 500 };
      const repositoryWithConfig = new TraceRepository(config);

      // 🎬 Act
      const result = await repositoryWithConfig.getHealthStatus();

      // ✅ Assert
      expect(result.details!.config).toBeDefined();
      expect((result.details!.config as any).enableCaching).toBe(true);
      expect((result.details!.config as any).maxCacheSize).toBe(500);
    });
  });
});
