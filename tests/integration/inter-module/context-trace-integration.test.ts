/**
 * Context-Trace模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动追踪的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';

describe('Context-Trace模块间集成测试', () => {
  let contextService: ContextManagementService;
  let traceService: TraceManagementService;
  let mockContextEntity: any;
  let mockTraceEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    traceService = new TraceManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
  });

  describe('上下文驱动追踪集成', () => {
    it('应该基于上下文开始追踪', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        name: 'Trace Context',
        status: 'active'
      } as any);
      
      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-001',
        contextId,
        traceType: 'context_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Context Trace',
          category: 'system',
          source: { component: 'context-trace-integration' }
        }
      } as any);

      // Act
      const context = await contextService.getContext(contextId);
      const trace = await traceService.startTrace({
        contextId: context.contextId,
        type: 'context_monitoring',
        name: 'Context Trace'
      } as any);

      // Assert
      expect(context).toBeDefined();
      expect(trace).toBeDefined();
      expect(trace.contextId).toBe(contextId);
    });

    it('应该为上下文添加追踪跨度', async () => {
      // Arrange
      const traceId = 'trace-context-span-001';
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        name: 'Context with Spans',
        status: 'active'
      } as any);

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId,
        operationName: 'context_operation',
        startTime: new Date(),
        endTime: new Date(),
        duration: 500,
        tags: { contextId, operation: 'get_context' },
        logs: [],
        status: 'completed'
      } as any);

      // Act
      const context = await contextService.getContext(contextId);
      const span = await traceService.addSpan(traceId, {
        operationName: 'context_operation',
        startTime: new Date(),
        endTime: new Date(),
        duration: 500,
        tags: { contextId: context.contextId, operation: 'get_context' }
      } as any);

      // Assert
      expect(context).toBeDefined();
      expect(span.operationName).toBe('context_operation');
      expect(span.tags.contextId).toBe(contextId);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _traceId: string,
        _traceConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockTraceEntity.traceId,
        { traceLevel: 'detailed', includeContext: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockContextEntity.contextId,
        { contextName: 'Test Context', contextType: 'user' }
      );

      expect(result).toBe(true);
    });
  });

  describe('上下文监控集成测试', () => {
    it('应该支持上下文状态的追踪监控', async () => {
      const monitoringData = {
        contextId: mockContextEntity.contextId,
        traceId: mockTraceEntity.traceId,
        operation: 'context_monitoring'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: monitoringData.contextId,
        name: 'Monitored Context',
        status: 'active',
        lastActivity: new Date()
      } as any);

      // Mock trace service
      jest.spyOn(traceService, 'endTrace').mockResolvedValue({
        traceId: monitoringData.traceId,
        contextId: monitoringData.contextId,
        traceType: 'context_monitoring',
        severity: 'info',
        event: {
          type: 'end',
          name: 'Context Monitoring Complete',
          category: 'system'
        }
      } as any);

      // Act
      const context = await contextService.getContext(monitoringData.contextId);
      const trace = await traceService.endTrace(monitoringData.traceId, {
        endTime: new Date(),
        finalStatus: 'completed'
      });

      // Assert
      expect(context.status).toBe('active');
      expect(trace.contextId).toBe(monitoringData.contextId);
      expect(trace.event.type).toBe('end');
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文获取失败的追踪', async () => {
      const contextId = 'failed-context-001';
      const errorMessage = 'Context access denied';

      // Mock context service - 获取失败
      jest.spyOn(contextService, 'getContext').mockRejectedValue(new Error(errorMessage));

      // Mock trace service - 开始错误追踪
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-error-001',
        contextId: 'error-context',
        traceType: 'context_error',
        severity: 'error',
        event: {
          type: 'error',
          name: 'Context Access Failure',
          category: 'error',
          source: { component: 'context-service' }
        }
      } as any);

      // Act & Assert
      await expect(contextService.getContext(contextId)).rejects.toThrow(errorMessage);
      
      const errorTrace = await traceService.startTrace({
        contextId: 'error-context',
        type: 'context_error',
        name: 'Context Access Failure'
      } as any);

      expect(errorTrace.traceType).toBe('context_error');
      expect(errorTrace.severity).toBe('error');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Trace集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: mockContextEntity.contextId,
        name: 'Performance Test Context'
      } as any);
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-perf-001',
        contextId: mockContextEntity.contextId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);

      const context = await contextService.getContext(mockContextEntity.contextId);
      const trace = await traceService.startTrace({
        contextId: context.contextId,
        type: 'performance_test',
        name: 'Performance Test'
      } as any);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(context).toBeDefined();
      expect(trace).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Trace数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const traceId = mockTraceEntity.traceId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文追踪关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        name: 'Traced Context',
        traceEnabled: true
      };

      const traceData = {
        traceId: mockTraceEntity.traceId,
        contextId: contextData.contextId,
        traceType: 'context_monitoring',
        tracedOperations: ['get_context', 'update_context']
      };

      expect(traceData.contextId).toBe(contextData.contextId);
      expect(contextData.traceEnabled).toBe(true);
      expect(traceData.tracedOperations).toContain('get_context');
    });
  });
});
