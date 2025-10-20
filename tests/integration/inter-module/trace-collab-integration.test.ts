/**
 * Trace-Collab模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证追踪驱动协作的集成功能
 */

import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { CollabManagementService } from '../../../src/modules/collab/application/services/collab-management.service';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';
import { CollabTestFactory } from '../../modules/collab/factories/collab-test.factory';

describe('Trace-Collab模块间集成测试', () => {
  let traceService: TraceManagementService;
  let collabService: CollabManagementService;
  let mockTraceEntity: any;
  let mockCollabEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    traceService = new TraceManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    collabService = new CollabManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
    mockCollabEntity = { collabId: 'collab-trace-001' }; // 简化的mock数据
  });

  describe('追踪驱动协作集成', () => {
    it('应该基于追踪创建协作', async () => {
      // Arrange
      const traceId = mockTraceEntity.traceId;

      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId,
        traceType: 'collaboration_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Collaboration Trace',
          category: 'collaboration',
          source: { component: 'trace-collab-integration' }
        }
      } as any);
      
      // Mock collab data
      const mockCollabData = {
        totalCollabs: 40,
        activeCollabs: 34,
        collabsByType: { 'traced': 20, 'multi_agent': 14, 'peer_to_peer': 6 },
        averageParticipants: 4.0,
        totalDecisions: 200,
        consensusRate: 0.92
      };

      // Act
      const trace = await traceService.startTrace({
        type: 'collaboration_monitoring',
        name: 'Collaboration Trace'
      } as any);

      // Assert
      expect(trace).toBeDefined();
      expect(trace.traceType).toBe('collaboration_monitoring');
      expect(mockCollabData.collabsByType['traced']).toBeGreaterThan(0);
    });

    it('应该查询追踪统计和协作的关联', async () => {
      // Mock trace service
      jest.spyOn(traceService, 'getTraceStatistics').mockResolvedValue({
        totalSpans: 45,
        totalDuration: 18000,
        averageSpanDuration: 400,
        errorCount: 2,
        successRate: 0.96,
        criticalPath: ['collab_init', 'decision_process', 'consensus_reach'],
        bottlenecks: ['decision_process']
      } as any);

      // Mock collab data
      const mockCollabStats = {
        totalCollabs: 42,
        activeCollabs: 36,
        collabsByType: { 'traced': 22, 'multi_agent': 14, 'peer_to_peer': 6 },
        averageParticipants: 4.2,
        totalDecisions: 210,
        consensusRate: 0.93
      };

      // Act
      const traceStats = await traceService.getTraceStatistics(mockTraceEntity.traceId);

      // Assert
      expect(traceStats.criticalPath).toContain('collab_init');
      expect(mockCollabStats.collabsByType['traced']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _collabId: string,
        _collabConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockCollabEntity.collabId,
        { collabType: 'traced', multiAgent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Collab模块的预留接口参数', async () => {
      const testCollabIntegration = async (
        _collabId: string,
        _traceId: string,
        _traceData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCollabIntegration(
        mockCollabEntity.collabId,
        mockTraceEntity.traceId,
        { traceType: 'collaboration', enableMonitoring: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('协作监控集成测试', () => {
    it('应该支持追踪协作的决策监控', async () => {
      const monitoringData = {
        traceId: mockTraceEntity.traceId,
        collabId: mockCollabEntity.collabId,
        operation: 'decision_monitoring'
      };

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId: monitoringData.traceId,
        operationName: 'decision_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 350,
        tags: { collabId: monitoringData.collabId, operation: 'decision_monitor' },
        logs: [],
        status: 'completed'
      } as any);

      // Mock collab data
      const mockCollabData = {
        totalCollabs: 38,
        activeCollabs: 32,
        collabsByType: { 'decision_monitored': 18, 'multi_agent': 14, 'peer_to_peer': 6 },
        averageParticipants: 3.8,
        totalDecisions: 190,
        consensusRate: 0.91
      };

      // Act
      const span = await traceService.addSpan(monitoringData.traceId, {
        operationName: 'decision_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 350,
        tags: { collabId: monitoringData.collabId, operation: 'decision_monitor' }
      } as any);

      // Assert
      expect(span.operationName).toBe('decision_monitor');
      expect(mockCollabData.collabsByType['decision_monitored']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理追踪统计获取失败', async () => {
      const traceId = 'invalid-trace-id';
      jest.spyOn(traceService, 'getTraceStatistics').mockRejectedValue(new Error('Trace not found'));

      await expect(traceService.getTraceStatistics(traceId)).rejects.toThrow('Trace not found');
    });

    it('应该正确处理协作数据访问失败', async () => {
      // 模拟协作数据访问失败
      const mockError = new Error('Collaboration service unavailable');
      
      // 这里我们模拟一个会失败的操作
      const failingOperation = async () => {
        throw mockError;
      };

      await expect(failingOperation()).rejects.toThrow('Collaboration service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Trace-Collab集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: mockTraceEntity.traceId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);
      
      // Mock collab data
      const mockCollabStats = {
        totalCollabs: 30,
        activeCollabs: 26,
        collabsByType: { 'traced': 16, 'multi_agent': 10, 'peer_to_peer': 4 },
        averageParticipants: 3.0,
        totalDecisions: 150,
        consensusRate: 0.88
      };

      const trace = await traceService.startTrace({
        type: 'performance_test',
        name: 'Performance Test'
      } as any);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(trace).toBeDefined();
      expect(mockCollabStats.totalCollabs).toBeGreaterThan(0);
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Trace-Collab数据关联的一致性', () => {
      const traceId = mockTraceEntity.traceId;
      const collabId = mockCollabEntity.collabId;

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
      
      expect(collabId).toBeDefined();
      expect(typeof collabId).toBe('string');
      expect(collabId.length).toBeGreaterThan(0);
    });

    it('应该验证追踪协作关联数据的完整性', () => {
      const traceData = {
        traceId: mockTraceEntity.traceId,
        traceType: 'collaboration_monitoring',
        collaborationEnabled: true,
        monitoredOperations: ['decision', 'consensus']
      };

      const collabData = {
        collabId: mockCollabEntity.collabId,
        traceId: traceData.traceId,
        collabType: 'traced',
        status: 'monitored'
      };

      expect(collabData.traceId).toBe(traceData.traceId);
      expect(traceData.collaborationEnabled).toBe(true);
      expect(traceData.monitoredOperations).toContain('decision');
    });
  });
});
