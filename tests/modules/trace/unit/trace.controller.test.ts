/**
 * Trace Controller单元测试
 * 
 * @description 测试Trace模块的API Controller，确保RESTful API的正确性
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @pattern 基于Context模块的IDENTICAL企业级测试模式
 */

import { TraceController } from '../../../../src/modules/trace/api/controllers/trace.controller';
import { TraceManagementService } from '../../../../src/modules/trace/application/services/trace-management.service';
import {
  CreateTraceDto,
  UpdateTraceDto,
  TraceQueryDto
} from '../../../../src/modules/trace/api/dto/trace.dto';
import { TraceTestFactory } from '../factories/trace-test.factory';
import { UUID } from '../../../../src/shared/types';

// Mock TraceManagementService
jest.mock('../../../../src/modules/trace/application/services/trace-management.service');

describe('TraceController测试', () => {
  let controller: TraceController;
  let mockService: jest.Mocked<TraceManagementService>;

  beforeEach(() => {
    // 创建mock service
    mockService = new TraceManagementService({} as any) as jest.Mocked<TraceManagementService>;
    
    // 创建controller实例
    controller = new TraceController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrace', () => {
    it('应该成功创建追踪记录', async () => {
      // 📋 Arrange
      const createDto = new CreateTraceDto();
      const testRequest = TraceTestFactory.createTraceRequest();
      Object.assign(createDto, testRequest);

      const mockTrace = TraceTestFactory.createTraceEntityData();
      mockService.createTrace.mockResolvedValue(mockTrace);

      // 🎬 Act
      const result = await controller.createTrace(createDto);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.traceId).toBe(mockTrace.traceId);
      expect(result.message).toBe('Trace created successfully');
      expect(result.data).toBeDefined();
      expect(result.data?.traceId).toBe(mockTrace.traceId);
      expect(mockService.createTrace).toHaveBeenCalledWith(createDto);
    });

    it('应该处理创建失败的情况', async () => {
      // 📋 Arrange
      const createDto = new CreateTraceDto();
      const testRequest = TraceTestFactory.createTraceRequest();
      Object.assign(createDto, testRequest);

      mockService.createTrace.mockRejectedValue(new Error('Service error'));

      // 🎬 Act
      const result = await controller.createTrace(createDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create trace');
      expect(result.error).toBe('Service error');
      expect(result.data).toBeUndefined();
    });

    it('应该验证必需字段', async () => {
      // 📋 Arrange
      const createDto = new CreateTraceDto();
      // 故意不设置必需字段

      // 🎬 Act
      const result = await controller.createTrace(createDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create trace');
      expect(result.error).toContain('required');
    });
  });

  describe('getTrace', () => {
    it('应该成功获取追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      const mockTrace = TraceTestFactory.createTraceEntityData({ traceId });
      mockService.getTraceById.mockResolvedValue(mockTrace);

      // 🎬 Act
      const result = await controller.getTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.traceId).toBe(traceId);
      expect(result.message).toBe('Trace retrieved successfully');
      expect(result.data).toBeDefined();
      expect(result.data?.traceId).toBe(traceId);
      expect(mockService.getTraceById).toHaveBeenCalledWith(traceId);
    });

    it('应该处理追踪记录不存在的情况', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-id' as UUID;
      mockService.getTraceById.mockResolvedValue(null);

      // 🎬 Act
      const result = await controller.getTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Trace not found');
      expect(result.data).toBeUndefined();
    });

    it('应该处理服务错误', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      mockService.getTraceById.mockRejectedValue(new Error('Service error'));

      // 🎬 Act
      const result = await controller.getTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve trace');
      expect(result.error).toBe('Service error');
    });
  });

  describe('updateTrace', () => {
    it('应该成功更新追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      const updateDto = new UpdateTraceDto();
      updateDto.severity = 'error';

      const mockTrace = TraceTestFactory.createTraceEntityData({ 
        traceId, 
        severity: 'error' 
      });
      mockService.updateTrace.mockResolvedValue(mockTrace);

      // 🎬 Act
      const result = await controller.updateTrace(traceId, updateDto);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.traceId).toBe(traceId);
      expect(result.message).toBe('Trace updated successfully');
      expect(result.data?.severity).toBe('error');
      expect(updateDto.traceId).toBe(traceId); // 应该设置traceId
      expect(mockService.updateTrace).toHaveBeenCalledWith(updateDto);
    });

    it('应该处理更新失败的情况', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      const updateDto = new UpdateTraceDto();
      updateDto.severity = 'error';

      mockService.updateTrace.mockRejectedValue(new Error('Update failed'));

      // 🎬 Act
      const result = await controller.updateTrace(traceId, updateDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update trace');
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteTrace', () => {
    it('应该成功删除追踪记录', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      mockService.deleteTrace.mockResolvedValue(true);

      // 🎬 Act
      const result = await controller.deleteTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.traceId).toBe(traceId);
      expect(result.message).toBe('Trace deleted successfully');
      expect(mockService.deleteTrace).toHaveBeenCalledWith(traceId);
    });

    it('应该处理追踪记录不存在的情况', async () => {
      // 📋 Arrange
      const traceId = 'non-existent-id' as UUID;
      mockService.deleteTrace.mockResolvedValue(false);

      // 🎬 Act
      const result = await controller.deleteTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Trace not found or already deleted');
    });

    it('应该处理删除失败的情况', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      mockService.deleteTrace.mockRejectedValue(new Error('Delete failed'));

      // 🎬 Act
      const result = await controller.deleteTrace(traceId);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete trace');
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('queryTraces', () => {
    it('应该成功查询追踪记录', async () => {
      // 📋 Arrange
      const queryDto = new TraceQueryDto();
      queryDto.contextId = 'test-context-id' as UUID;

      const mockTraces = [
        TraceTestFactory.createTraceEntityData(),
        TraceTestFactory.createTraceEntityData()
      ];
      const mockResult = { traces: mockTraces, total: 2 };
      mockService.queryTraces.mockResolvedValue(mockResult);

      const pagination = { page: 1, limit: 10 };

      // 🎬 Act
      const result = await controller.queryTraces(queryDto, pagination);

      // ✅ Assert
      expect(result.traces).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockService.queryTraces).toHaveBeenCalledWith(queryDto, pagination);
    });

    it('应该处理查询失败的情况', async () => {
      // 📋 Arrange
      const queryDto = new TraceQueryDto();
      mockService.queryTraces.mockRejectedValue(new Error('Query failed'));

      // 🎬 Act & Assert
      await expect(controller.queryTraces(queryDto)).rejects.toThrow('Failed to query traces: Query failed');
    });
  });

  describe('getTraceCount', () => {
    it('应该成功获取追踪记录数量', async () => {
      // 📋 Arrange
      const queryDto = new TraceQueryDto();
      mockService.getTraceCount.mockResolvedValue(42);

      // 🎬 Act
      const result = await controller.getTraceCount(queryDto);

      // ✅ Assert
      expect(result.count).toBe(42);
      expect(mockService.getTraceCount).toHaveBeenCalledWith(queryDto);
    });

    it('应该处理获取数量失败的情况', async () => {
      // 📋 Arrange
      mockService.getTraceCount.mockRejectedValue(new Error('Count failed'));

      // 🎬 Act & Assert
      await expect(controller.getTraceCount()).rejects.toThrow('Failed to get trace count: Count failed');
    });
  });

  describe('traceExists', () => {
    it('应该正确检查追踪记录是否存在', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      mockService.traceExists.mockResolvedValue(true);

      // 🎬 Act
      const result = await controller.traceExists(traceId);

      // ✅ Assert
      expect(result.exists).toBe(true);
      expect(mockService.traceExists).toHaveBeenCalledWith(traceId);
    });

    it('应该处理检查失败的情况', async () => {
      // 📋 Arrange
      const traceId = 'test-trace-id' as UUID;
      mockService.traceExists.mockRejectedValue(new Error('Check failed'));

      // 🎬 Act & Assert
      await expect(controller.traceExists(traceId)).rejects.toThrow('Failed to check trace existence: Check failed');
    });
  });

  describe('createTraceBatch', () => {
    it('应该成功批量创建追踪记录', async () => {
      // 📋 Arrange
      const createDtos = [
        Object.assign(new CreateTraceDto(), TraceTestFactory.createTraceRequest()),
        Object.assign(new CreateTraceDto(), TraceTestFactory.createTraceRequest())
      ];

      const mockTraces = [
        TraceTestFactory.createTraceEntityData(),
        TraceTestFactory.createTraceEntityData()
      ];
      mockService.createTraceBatch.mockResolvedValue(mockTraces);

      // 🎬 Act
      const result = await controller.createTraceBatch(createDtos);

      // ✅ Assert
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
      expect(mockService.createTraceBatch).toHaveBeenCalledWith(createDtos);
    });

    it('应该处理批量创建失败的情况', async () => {
      // 📋 Arrange
      const createDtos = [
        Object.assign(new CreateTraceDto(), TraceTestFactory.createTraceRequest())
      ];
      mockService.createTraceBatch.mockRejectedValue(new Error('Batch create failed'));

      // 🎬 Act
      const result = await controller.createTraceBatch(createDtos);

      // ✅ Assert
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe('Batch create failed');
    });
  });

  describe('deleteTraceBatch', () => {
    it('应该成功批量删除追踪记录', async () => {
      // 📋 Arrange
      const traceIds = ['trace-1', 'trace-2'] as UUID[];
      mockService.deleteTraceBatch.mockResolvedValue(2);

      // 🎬 Act
      const result = await controller.deleteTraceBatch(traceIds);

      // ✅ Assert
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(mockService.deleteTraceBatch).toHaveBeenCalledWith(traceIds);
    });

    it('应该处理批量删除失败的情况', async () => {
      // 📋 Arrange
      const traceIds = ['trace-1'] as UUID[];
      mockService.deleteTraceBatch.mockRejectedValue(new Error('Batch delete failed'));

      // 🎬 Act
      const result = await controller.deleteTraceBatch(traceIds);

      // ✅ Assert
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe('Batch delete failed');
    });
  });

  describe('getHealthStatus', () => {
    it('应该成功获取健康状态', async () => {
      // 📋 Arrange
      const mockHealth = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        details: {
          repository: {
            status: 'healthy',
            recordCount: 100,
            lastOperation: 'query'
          }
        }
      };
      mockService.getHealthStatus.mockResolvedValue(mockHealth);

      // 🎬 Act
      const result = await controller.getHealthStatus();

      // ✅ Assert
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.details?.service).toBe('TraceManagementService');
      expect(result.details?.version).toBe('1.0.0');
      expect(result.details?.repository.status).toBe('healthy');
    });

    it('应该处理健康检查失败的情况', async () => {
      // 📋 Arrange
      mockService.getHealthStatus.mockRejectedValue(new Error('Health check failed'));

      // 🎬 Act
      const result = await controller.getHealthStatus();

      // ✅ Assert
      expect(result.status).toBe('unhealthy');
      expect(result.details?.repository.status).toBe('error');
    });
  });
});
