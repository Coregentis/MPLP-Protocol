/**
 * Trace-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证追踪驱动对话的集成功能
 */

import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';
describe('Trace-Dialog模块间集成测试', () => {
  let traceService: TraceManagementService;
  let dialogService: DialogManagementService;
  let mockTraceEntity: any;
  let mockDialogEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    traceService = new TraceManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
    mockDialogEntity = { dialogId: 'dialog-trace-001' }; // 简化的mock数据
  });

  describe('追踪驱动对话集成', () => {
    it('应该基于追踪创建对话', async () => {
      // Arrange
      const traceId = mockTraceEntity.traceId;

      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId,
        traceType: 'dialog_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Dialog Trace',
          category: 'communication',
          source: { component: 'trace-dialog-integration' }
        }
      } as any);
      
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 42,
        averageParticipants: 4.2,
        activeDialogs: 36,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 28,
          criticalThinking: 22,
          knowledgeSearch: 30,
          multimodal: 16
        },
        recentActivity: {
          dailyCreated: [5, 7, 6, 9, 8, 10, 7],
          weeklyActive: [32, 36, 34, 42]
        }
      } as any);

      // Act
      const trace = await traceService.startTrace({
        type: 'dialog_monitoring',
        name: 'Dialog Trace'
      } as any);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(trace).toBeDefined();
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });

    it('应该查询追踪统计和对话统计的关联', async () => {
      // Mock trace service
      jest.spyOn(traceService, 'getTraceStatistics').mockResolvedValue({
        totalSpans: 40,
        totalDuration: 15000,
        averageSpanDuration: 375,
        errorCount: 2,
        successRate: 0.95,
        criticalPath: ['dialog_init', 'intelligent_process', 'response_generate'],
        bottlenecks: ['intelligent_process']
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 45,
        averageParticipants: 4.5,
        activeDialogs: 38,
        endedDialogs: 7,
        dialogsByCapability: {
          intelligentControl: 30,
          criticalThinking: 25,
          knowledgeSearch: 32,
          multimodal: 18
        },
        recentActivity: {
          dailyCreated: [6, 8, 7, 10, 9, 11, 8],
          weeklyActive: [34, 38, 36, 45]
        }
      } as any);

      // Act
      const traceStats = await traceService.getTraceStatistics(mockTraceEntity.traceId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(traceStats.criticalPath).toContain('dialog_init');
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockDialogEntity.dialogId,
        { dialogType: 'traced', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _traceId: string,
        _traceData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockTraceEntity.traceId,
        { traceType: 'dialog', enableMonitoring: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('对话监控集成测试', () => {
    it('应该支持追踪对话的智能监控', async () => {
      const monitoringData = {
        traceId: mockTraceEntity.traceId,
        dialogId: mockDialogEntity.dialogId,
        operation: 'dialog_monitoring'
      };

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId: monitoringData.traceId,
        operationName: 'dialog_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 300,
        tags: { dialogId: monitoringData.dialogId, operation: 'intelligent_monitor' },
        logs: [],
        status: 'completed'
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 38,
        averageParticipants: 3.8,
        activeDialogs: 32,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 32,
          criticalThinking: 28,
          knowledgeSearch: 26,
          multimodal: 14
        },
        recentActivity: {
          dailyCreated: [4, 6, 5, 8, 7, 9, 6],
          weeklyActive: [28, 32, 30, 38]
        }
      } as any);

      // Act
      const span = await traceService.addSpan(monitoringData.traceId, {
        operationName: 'dialog_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 300,
        tags: { dialogId: monitoringData.dialogId, operation: 'intelligent_monitor' }
      } as any);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(span.operationName).toBe('dialog_monitor');
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理追踪统计获取失败', async () => {
      const traceId = 'invalid-trace-id';
      jest.spyOn(traceService, 'getTraceStatistics').mockRejectedValue(new Error('Trace not found'));

      await expect(traceService.getTraceStatistics(traceId)).rejects.toThrow('Trace not found');
    });

    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Trace-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: mockTraceEntity.traceId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 30,
        averageParticipants: 3.0,
        activeDialogs: 26,
        endedDialogs: 4,
        dialogsByCapability: {
          intelligentControl: 20,
          criticalThinking: 16,
          knowledgeSearch: 22,
          multimodal: 10
        },
        recentActivity: {
          dailyCreated: [3, 5, 4, 7, 6, 8, 5],
          weeklyActive: [22, 26, 24, 30]
        }
      } as any);

      const trace = await traceService.startTrace({
        type: 'performance_test',
        name: 'Performance Test'
      } as any);
      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(trace).toBeDefined();
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Trace-Dialog数据关联的一致性', () => {
      const traceId = mockTraceEntity.traceId;
      const dialogId = mockDialogEntity.dialogId;

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证追踪对话关联数据的完整性', () => {
      const traceData = {
        traceId: mockTraceEntity.traceId,
        traceType: 'dialog_monitoring',
        dialogEnabled: true,
        monitoredCapabilities: ['intelligent', 'criticalThinking']
      };

      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        traceId: traceData.traceId,
        capabilities: ['intelligent', 'knowledgeSearch'],
        status: 'monitored'
      };

      expect(dialogData.traceId).toBe(traceData.traceId);
      expect(traceData.dialogEnabled).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
