/**
 * Trace管理服务单元测试
 * 
 * @description 基于实际接口的TraceManagementService测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { TraceManagementService } from '../../../../src/modules/trace/application/services/trace-management.service';
import { TraceRepository } from '../../../../src/modules/trace/infrastructure/repositories/trace.repository';
import { TraceEntityData, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter } from '../../../../src/modules/trace/types';
import { UUID, PaginationParams } from '../../../../src/shared/types';
import { TraceTestFactory } from '../factories/trace-test.factory';

// Mock TraceRepository
jest.mock('../../../../src/modules/trace/infrastructure/repositories/trace.repository');

describe('TraceManagementService测试', () => {
  let service: TraceManagementService;
  let mockRepository: jest.Mocked<TraceRepository>;

  beforeEach(() => {
    mockRepository = new TraceRepository() as jest.Mocked<TraceRepository>;
    service = new TraceManagementService(mockRepository);
  });

  describe('createTrace功能测试', () => {
    it('应该成功创建追踪记录', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const expectedTrace = TraceTestFactory.createTraceEntityData({
        contextId: createRequest.contextId,
        traceType: createRequest.traceType,
        severity: createRequest.severity
      });
      
      mockRepository.create.mockResolvedValue(expectedTrace);

      // 🎬 Act
      const result = await service.createTrace(createRequest);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.contextId).toBe(createRequest.contextId);
      expect(result.traceType).toBe(createRequest.traceType);
      expect(result.severity).toBe(createRequest.severity);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('应该验证必需字段', async () => {
      // 📋 Arrange
      const invalidRequest = {
        // 缺少contextId
        traceType: 'execution',
        severity: 'info',
        event: { name: 'Test Event', type: 'start', category: 'system' }
      } as CreateTraceRequest;

      // 🎬 Act & Assert
      await expect(service.createTrace(invalidRequest)).rejects.toThrow('Context ID is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该验证追踪类型', async () => {
      // 📋 Arrange
      const invalidRequest = TraceTestFactory.createTraceRequest({
        traceType: undefined as any
      });

      // 🎬 Act & Assert
      await expect(service.createTrace(invalidRequest)).rejects.toThrow('Trace type is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该验证严重程度', async () => {
      // 📋 Arrange
      const invalidRequest = TraceTestFactory.createTraceRequest({
        severity: undefined as any
      });

      // 🎬 Act & Assert
      await expect(service.createTrace(invalidRequest)).rejects.toThrow('Severity is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该验证事件名称', async () => {
      // 📋 Arrange
      const invalidRequest = TraceTestFactory.createTraceRequest({
        event: {
          type: 'start',
          category: 'system',
          source: { component: 'test' }
        } as any
      });

      // 🎬 Act & Assert
      await expect(service.createTrace(invalidRequest)).rejects.toThrow('Event name is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该处理仓库错误', async () => {
      // 📋 Arrange
      const createRequest = TraceTestFactory.createTraceRequest();
      const repositoryError = new Error('Repository error');
      
      mockRepository.create.mockRejectedValue(repositoryError);

      // 🎬 Act & Assert
      await expect(service.createTrace(createRequest)).rejects.toThrow('Repository error');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTraceById功能测试', () => {
    it('应该成功获取存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'trace-test-001' as UUID;
      const expectedTrace = TraceTestFactory.createTraceEntityData({ traceId });
      
      mockRepository.findById.mockResolvedValue(expectedTrace);

      // 🎬 Act
      const result = await service.getTraceById(traceId);

      // ✅ Assert
      expect(result).toBe(expectedTrace);
      expect(mockRepository.findById).toHaveBeenCalledWith(traceId);
    });

    it('应该返回null对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-trace' as UUID;
      
      mockRepository.findById.mockResolvedValue(null);

      // 🎬 Act
      const result = await service.getTraceById(traceId);

      // ✅ Assert
      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(traceId);
    });

    it('应该处理仓库错误', async () => {
      // 📋 Arrange
      const traceId = 'trace-test-001' as UUID;
      const repositoryError = new Error('Repository error');
      
      mockRepository.findById.mockRejectedValue(repositoryError);

      // 🎬 Act & Assert
      await expect(service.getTraceById(traceId)).rejects.toThrow('Repository error');
      expect(mockRepository.findById).toHaveBeenCalledWith(traceId);
    });
  });

  describe('updateTrace功能测试', () => {
    it('应该成功更新追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'trace-test-001' as UUID;
      const updateRequest = TraceTestFactory.createUpdateTraceRequest(traceId, {
        severity: 'error'
      });
      const updatedTrace = TraceTestFactory.createTraceEntityData({
        traceId,
        severity: 'error'
      });
      
      mockRepository.update.mockResolvedValue(updatedTrace);

      // 🎬 Act
      const result = await service.updateTrace(updateRequest);

      // ✅ Assert
      expect(result).toBe(updatedTrace);
      expect(result.severity).toBe('error');
      expect(mockRepository.update).toHaveBeenCalledWith(updateRequest);
    });

    it('应该处理不存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-trace' as UUID;
      const updateRequest = TraceTestFactory.createUpdateTraceRequest(traceId);
      const repositoryError = new Error(`Trace not found: ${traceId}`);
      
      mockRepository.update.mockRejectedValue(repositoryError);

      // 🎬 Act & Assert
      await expect(service.updateTrace(updateRequest)).rejects.toThrow(`Trace not found: ${traceId}`);
      expect(mockRepository.update).toHaveBeenCalledWith(updateRequest);
    });
  });

  describe('deleteTrace功能测试', () => {
    it('应该成功删除追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'trace-test-001' as UUID;
      
      mockRepository.delete.mockResolvedValue(true);

      // 🎬 Act
      const result = await service.deleteTrace(traceId);

      // ✅ Assert
      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(traceId);
    });

    it('应该返回false对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-trace' as UUID;
      
      mockRepository.delete.mockResolvedValue(false);

      // 🎬 Act
      const result = await service.deleteTrace(traceId);

      // ✅ Assert
      expect(result).toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledWith(traceId);
    });
  });

  describe('queryTraces功能测试', () => {
    it('应该成功查询追踪记录', async () => {
      // 📋 Arrange
      const filter = TraceTestFactory.createTraceQueryFilter();
      const pagination: PaginationParams = { page: 1, limit: 10 };
      const expectedResult = {
        traces: [
          TraceTestFactory.createTraceEntityData(),
          TraceTestFactory.createTraceEntityData()
        ],
        total: 2
      };
      
      mockRepository.query.mockResolvedValue(expectedResult);

      // 🎬 Act
      const result = await service.queryTraces(filter, pagination);

      // ✅ Assert
      expect(result).toBe(expectedResult);
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockRepository.query).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该处理空结果', async () => {
      // 📋 Arrange
      const filter = TraceTestFactory.createTraceQueryFilter();
      const pagination = { page: 1, limit: 10 };
      const expectedResult = { traces: [], total: 0 };

      mockRepository.query.mockResolvedValue(expectedResult);

      // 🎬 Act
      const result = await service.queryTraces(filter, pagination);

      // ✅ Assert
      const queryResult = result as { traces: TraceEntityData[]; total: number };
      expect(queryResult.traces).toHaveLength(0);
      expect(queryResult.total).toBe(0);
      expect(mockRepository.query).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该支持不带分页的查询', async () => {
      // 📋 Arrange
      const filter = TraceTestFactory.createTraceQueryFilter();
      const pagination = { page: 1, limit: 10 };
      const expectedResult = {
        traces: [TraceTestFactory.createTraceEntityData()],
        total: 1
      };

      mockRepository.query.mockResolvedValue(expectedResult);

      // 🎬 Act
      const result = await service.queryTraces(filter, pagination);

      // ✅ Assert
      const queryResult = result as { traces: TraceEntityData[]; total: number };
      expect(queryResult.traces).toHaveLength(1);
      expect(queryResult.total).toBe(1);
      expect(mockRepository.query).toHaveBeenCalledWith(filter, pagination);
    });
  });

  describe('getTraceCount功能测试', () => {
    it('应该返回追踪记录总数', async () => {
      // 📋 Arrange
      const expectedCount = 42;
      
      mockRepository.count.mockResolvedValue(expectedCount);

      // 🎬 Act
      const result = await service.getTraceCount();

      // ✅ Assert
      expect(result).toBe(expectedCount);
      expect(mockRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('应该支持带过滤条件的计数', async () => {
      // 📋 Arrange
      const filter = { traceType: 'execution' as const };
      const expectedCount = 15;
      
      mockRepository.count.mockResolvedValue(expectedCount);

      // 🎬 Act
      const result = await service.getTraceCount(filter);

      // ✅ Assert
      expect(result).toBe(expectedCount);
      expect(mockRepository.count).toHaveBeenCalledWith(filter);
    });

    it('应该返回0当没有匹配记录时', async () => {
      // 📋 Arrange
      const filter = { traceType: 'audit' as const };
      
      mockRepository.count.mockResolvedValue(0);

      // 🎬 Act
      const result = await service.getTraceCount(filter);

      // ✅ Assert
      expect(result).toBe(0);
      expect(mockRepository.count).toHaveBeenCalledWith(filter);
    });
  });

  describe('traceExists功能测试', () => {
    it('应该返回true对于存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'trace-test-001' as UUID;
      
      mockRepository.exists.mockResolvedValue(true);

      // 🎬 Act
      const result = await service.traceExists(traceId);

      // ✅ Assert
      expect(result).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(traceId);
    });

    it('应该返回false对于不存在的追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-trace' as UUID;
      
      mockRepository.exists.mockResolvedValue(false);

      // 🎬 Act
      const result = await service.traceExists(traceId);

      // ✅ Assert
      expect(result).toBe(false);
      expect(mockRepository.exists).toHaveBeenCalledWith(traceId);
    });
  });

  describe('批量操作测试', () => {
    it('应该成功批量创建追踪记录', async () => {
      // 📋 Arrange
      const requests = [
        TraceTestFactory.createTraceRequest(),
        TraceTestFactory.createTraceRequest()
      ];
      const expectedTraces = requests.map((req, index) => 
        TraceTestFactory.createTraceEntityData({
          traceId: `trace-batch-${index}` as UUID,
          contextId: req.contextId
        })
      );
      
      mockRepository.createBatch.mockResolvedValue(expectedTraces);

      // 🎬 Act
      const result = await service.createTraceBatch(requests);

      // ✅ Assert
      expect(result).toBe(expectedTraces);
      expect(result).toHaveLength(2);
      expect(mockRepository.createBatch).toHaveBeenCalledWith(requests);
    });

    it('应该成功批量删除追踪记录', async () => {
      // 📋 Arrange
      const traceIds = ['trace-1', 'trace-2', 'trace-3'] as UUID[];
      const expectedDeletedCount = 3;
      
      mockRepository.deleteBatch.mockResolvedValue(expectedDeletedCount);

      // 🎬 Act
      const result = await service.deleteTraceBatch(traceIds);

      // ✅ Assert
      expect(result).toBe(expectedDeletedCount);
      expect(mockRepository.deleteBatch).toHaveBeenCalledWith(traceIds);
    });

    it('应该处理部分成功的批量删除', async () => {
      // 📋 Arrange
      const traceIds = ['trace-1', 'non-existent', 'trace-3'] as UUID[];
      const expectedDeletedCount = 2; // 只有2个存在
      
      mockRepository.deleteBatch.mockResolvedValue(expectedDeletedCount);

      // 🎬 Act
      const result = await service.deleteTraceBatch(traceIds);

      // ✅ Assert
      expect(result).toBe(expectedDeletedCount);
      expect(mockRepository.deleteBatch).toHaveBeenCalledWith(traceIds);
    });
  });

  describe('健康检查测试', () => {
    it('应该返回服务健康状态', async () => {
      // 📋 Arrange
      const repositoryHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: { repository: 'TraceRepository' }
      };
      
      mockRepository.getHealthStatus.mockResolvedValue(repositoryHealth);

      // 🎬 Act
      const result = await service.getHealthStatus();

      // ✅ Assert
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.details!.service).toBe('TraceManagementService');
      expect(result.details!.repository).toBe(repositoryHealth);
      expect(mockRepository.getHealthStatus).toHaveBeenCalled();
    });

    it('应该处理仓库不健康状态', async () => {
      // 📋 Arrange
      const repositoryHealth = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      };
      
      mockRepository.getHealthStatus.mockResolvedValue(repositoryHealth);

      // 🎬 Act
      const result = await service.getHealthStatus();

      // ✅ Assert
      expect(result.status).toBe('degraded'); // 服务状态降级
      expect(result.details!.repository).toBe(repositoryHealth);
      expect(mockRepository.getHealthStatus).toHaveBeenCalled();
    });
  });
});
