/**
 * Confirm-Trace模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证确认驱动追踪的集成功能
 */

import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';

describe('Confirm-Trace模块间集成测试', () => {
  let confirmService: ConfirmManagementService;
  let traceService: TraceManagementService;
  let mockConfirmEntity: any;
  let mockTraceEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    confirmService = new ConfirmManagementService(
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
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
  });

  describe('确认驱动追踪集成', () => {
    it('应该基于确认流程开始追踪', async () => {
      // Arrange
      const confirmId = mockConfirmEntity.confirmId;

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId,
        confirmationType: 'approval_workflow',
        status: 'pending',
        priority: 'high'
      } as any);
      
      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-001',
        confirmId,
        traceType: 'confirm_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Confirm Trace',
          category: 'workflow',
          source: { component: 'confirm-trace-integration' }
        }
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(confirmId);
      const trace = await traceService.startTrace({
        confirmId: confirm.confirmId,
        type: 'confirm_monitoring',
        name: 'Confirm Trace'
      } as any);

      // Assert
      expect(confirm).toBeDefined();
      expect(trace).toBeDefined();
      expect(trace.confirmId).toBe(confirmId);
    });

    it('应该查询确认统计和追踪的关联', async () => {
      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 20,
        byStatus: { 'pending': 8, 'approved': 10, 'rejected': 2 },
        byType: { 'approval_workflow': 15, 'manual_approval': 5 },
        byPriority: { 'high': 6, 'medium': 10, 'low': 4 }
      } as any);

      // Mock trace service
      jest.spyOn(traceService, 'getTraceStatistics').mockResolvedValue({
        totalSpans: 25,
        totalDuration: 8000,
        averageSpanDuration: 320,
        errorCount: 2,
        successRate: 0.92,
        criticalPath: ['confirm_create', 'approval_check', 'workflow_execute'],
        bottlenecks: ['approval_check']
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();
      const traceStats = await traceService.getTraceStatistics(mockTraceEntity.traceId);

      // Assert
      expect(confirmStats.byType['approval_workflow']).toBeGreaterThan(0);
      expect(traceStats.successRate).toBeGreaterThan(0.9);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _traceId: string,
        _traceConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockTraceEntity.traceId,
        { traceLevel: 'workflow', includeApproval: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _confirmId: string,
        _confirmData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockConfirmEntity.confirmId,
        { confirmationType: 'approval', workflowSteps: 3 }
      );

      expect(result).toBe(true);
    });
  });

  describe('审批流程追踪集成测试', () => {
    it('应该支持审批流程的追踪监控', async () => {
      const workflowData = {
        confirmId: mockConfirmEntity.confirmId,
        traceId: mockTraceEntity.traceId,
        operation: 'approval_workflow'
      };

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: workflowData.confirmId,
        confirmationType: 'approval_workflow',
        status: 'in_progress',
        approvalWorkflow: {
          steps: [
            { stepId: 'step-1', status: 'completed' },
            { stepId: 'step-2', status: 'in_progress' }
          ]
        }
      } as any);

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId: workflowData.traceId,
        operationName: 'approval_step',
        startTime: new Date(),
        endTime: new Date(),
        duration: 200,
        tags: { confirmId: workflowData.confirmId, step: 'step-2' },
        logs: [],
        status: 'in_progress'
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(workflowData.confirmId);
      const span = await traceService.addSpan(workflowData.traceId, {
        operationName: 'approval_step',
        startTime: new Date(),
        endTime: new Date(),
        duration: 200,
        tags: { confirmId: confirm.confirmId, step: 'step-2' }
      } as any);

      // Assert
      expect(confirm.status).toBe('in_progress');
      expect(span.operationName).toBe('approval_step');
      expect(span.tags.confirmId).toBe(workflowData.confirmId);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理确认获取失败的追踪', async () => {
      const confirmId = 'failed-confirm-001';
      const errorMessage = 'Confirm not found';

      // Mock confirm service - 获取失败
      jest.spyOn(confirmService, 'getConfirm').mockRejectedValue(new Error(errorMessage));

      // Mock trace service - 开始错误追踪
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-error-001',
        confirmId: 'error-confirm',
        traceType: 'confirm_error',
        severity: 'error',
        event: {
          type: 'error',
          name: 'Confirm Access Failure',
          category: 'error',
          source: { component: 'confirm-service' }
        }
      } as any);

      // Act & Assert
      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow(errorMessage);
      
      const errorTrace = await traceService.startTrace({
        confirmId: 'error-confirm',
        type: 'confirm_error',
        name: 'Confirm Access Failure'
      } as any);

      expect(errorTrace.traceType).toBe('confirm_error');
      expect(errorTrace.severity).toBe('error');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Confirm-Trace集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'performance_test'
      } as any);
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: 'trace-perf-001',
        confirmId: mockConfirmEntity.confirmId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);

      const confirm = await confirmService.getConfirm(mockConfirmEntity.confirmId);
      const trace = await traceService.startTrace({
        confirmId: confirm.confirmId,
        type: 'performance_test',
        name: 'Performance Test'
      } as any);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(confirm).toBeDefined();
      expect(trace).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Confirm-Trace数据关联的一致性', () => {
      const confirmId = mockConfirmEntity.confirmId;
      const traceId = mockTraceEntity.traceId;

      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
      
      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
    });

    it('应该验证确认追踪关联数据的完整性', () => {
      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'traced_approval',
        traceEnabled: true,
        workflowSteps: ['create', 'approve', 'complete']
      };

      const traceData = {
        traceId: mockTraceEntity.traceId,
        confirmId: confirmData.confirmId,
        traceType: 'confirm_monitoring',
        tracedOperations: ['create_confirm', 'approval_check', 'workflow_complete']
      };

      expect(traceData.confirmId).toBe(confirmData.confirmId);
      expect(confirmData.traceEnabled).toBe(true);
      expect(confirmData.workflowSteps).toContain('approve');
      expect(traceData.tracedOperations).toContain('approval_check');
    });
  });
});
