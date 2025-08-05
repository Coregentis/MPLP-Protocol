/**
 * WorkflowExecution实体单元测试
 * @description 测试WorkflowExecution实体的所有方法和状态管理
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  WorkflowExecution,
  WorkflowConfig,
  ExecutionContext,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  StageStatus
} from '../../../src/modules/core';

describe('WorkflowExecution Entity', () => {
  let workflowExecution: WorkflowExecution;
  let mockConfig: WorkflowConfig;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    mockConfig = {
      name: 'Test Workflow',
      stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM],
      execution_mode: ExecutionMode.SEQUENTIAL,
      timeout_ms: 30000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000
      }
    };

    mockContext = {
      user_id: 'test-user',
      session_id: 'test-session-123',
      priority: Priority.MEDIUM,
      metadata: {
        test: true
      }
    };

    workflowExecution = new WorkflowExecution(
      'workflow-123',
      'orchestrator-456',
      mockConfig,
      mockContext
    );
  });

  describe('构造函数和基本属性', () => {
    it('应该正确初始化工作流执行实体', () => {
      expect(workflowExecution.workflow_id).toBe('workflow-123');
      expect(workflowExecution.orchestrator_id).toBe('orchestrator-456');
      expect(workflowExecution.workflow_config).toEqual(mockConfig);
      expect(workflowExecution.execution_context).toEqual(mockContext);
      expect(workflowExecution.execution_status.status).toBe(WorkflowStatus.CREATED);
      expect(workflowExecution.created_at).toBeDefined();
      expect(workflowExecution.updated_at).toBeDefined();
    });

    it('应该初始化空的阶段结果', () => {
      const status = workflowExecution.execution_status;
      expect(status.completed_stages).toEqual([]);
      expect(status.stage_results).toEqual({});
      expect(status.retry_count).toBe(0);
    });
  });

  describe('工作流状态管理', () => {
    it('应该能够开始工作流执行', () => {
      workflowExecution.start();
      
      const status = workflowExecution.execution_status;
      expect(status.status).toBe(WorkflowStatus.IN_PROGRESS);
      expect(status.start_time).toBeDefined();
    });

    it('应该拒绝在非CREATED状态下开始工作流', () => {
      workflowExecution.start();
      
      expect(() => workflowExecution.start()).toThrow(
        'Cannot start workflow in status: in_progress'
      );
    });

    it('应该能够暂停正在进行的工作流', () => {
      workflowExecution.start();
      workflowExecution.pause();
      
      expect(workflowExecution.execution_status.status).toBe(WorkflowStatus.PAUSED);
    });

    it('应该拒绝暂停非进行中的工作流', () => {
      expect(() => workflowExecution.pause()).toThrow(
        'Cannot pause workflow in status: created'
      );
    });

    it('应该能够恢复暂停的工作流', () => {
      workflowExecution.start();
      workflowExecution.pause();
      workflowExecution.resume();
      
      expect(workflowExecution.execution_status.status).toBe(WorkflowStatus.IN_PROGRESS);
    });

    it('应该拒绝恢复非暂停的工作流', () => {
      workflowExecution.start();
      
      expect(() => workflowExecution.resume()).toThrow(
        'Cannot resume workflow in status: in_progress'
      );
    });

    it('应该能够完成工作流并计算执行时间', async () => {
      workflowExecution.start();

      // 等待一小段时间以确保有执行时间
      await new Promise(resolve => setTimeout(resolve, 10));

      workflowExecution.complete();

      const status = workflowExecution.execution_status;
      expect(status.status).toBe(WorkflowStatus.COMPLETED);
      expect(status.end_time).toBeDefined();
      expect(status.duration_ms).toBeGreaterThan(0);
    });

    it('应该能够标记工作流失败', () => {
      workflowExecution.start();
      
      const error = {
        code: 'TEST_ERROR',
        message: 'Test failure'
      };
      
      workflowExecution.fail(error);
      
      const status = workflowExecution.execution_status;
      expect(status.status).toBe(WorkflowStatus.FAILED);
      expect(status.end_time).toBeDefined();
    });

    it('应该能够取消工作流', () => {
      workflowExecution.start();
      workflowExecution.cancel();
      
      const status = workflowExecution.execution_status;
      expect(status.status).toBe(WorkflowStatus.CANCELLED);
      expect(status.end_time).toBeDefined();
    });

    it('应该拒绝取消已完成的工作流', () => {
      workflowExecution.start();
      workflowExecution.complete();
      
      expect(() => workflowExecution.cancel()).toThrow(
        'Cannot cancel workflow in status: completed'
      );
    });
  });

  describe('阶段管理', () => {
    beforeEach(() => {
      workflowExecution.start();
    });

    it('应该能够开始执行阶段', () => {
      workflowExecution.startStage(WorkflowStage.CONTEXT);
      
      const stageResult = workflowExecution.execution_status.stage_results![WorkflowStage.CONTEXT];
      expect(stageResult.status).toBe(StageStatus.RUNNING);
      expect(stageResult.start_time).toBeDefined();
      expect(workflowExecution.execution_status.current_stage).toBe(WorkflowStage.CONTEXT);
    });

    it('应该拒绝开始未配置的阶段', () => {
      expect(() => workflowExecution.startStage(WorkflowStage.TRACE)).toThrow(
        'Stage trace is not configured in this workflow'
      );
    });

    it('应该能够完成阶段执行', () => {
      workflowExecution.startStage(WorkflowStage.CONTEXT);
      
      const result = { context_id: 'ctx-123' };
      workflowExecution.completeStage(WorkflowStage.CONTEXT, result);
      
      const stageResult = workflowExecution.execution_status.stage_results![WorkflowStage.CONTEXT];
      expect(stageResult.status).toBe(StageStatus.COMPLETED);
      expect(stageResult.end_time).toBeDefined();
      expect(stageResult.result).toEqual(result);
      expect(workflowExecution.execution_status.completed_stages).toContain(WorkflowStage.CONTEXT);
    });

    it('应该能够标记阶段失败', () => {
      workflowExecution.startStage(WorkflowStage.CONTEXT);
      
      const error = {
        code: 'STAGE_ERROR',
        message: 'Stage execution failed'
      };
      
      workflowExecution.failStage(WorkflowStage.CONTEXT, error);
      
      const stageResult = workflowExecution.execution_status.stage_results![WorkflowStage.CONTEXT];
      expect(stageResult.status).toBe(StageStatus.FAILED);
      expect(stageResult.error).toEqual(error);
    });

    it('应该能够跳过阶段执行', () => {
      const reason = 'Not applicable for this workflow';
      workflowExecution.skipStage(WorkflowStage.CONTEXT, reason);
      
      const stageResult = workflowExecution.execution_status.stage_results![WorkflowStage.CONTEXT];
      expect(stageResult.status).toBe(StageStatus.SKIPPED);
      expect(stageResult.result?.skip_reason).toBe(reason);
    });

    it('应该拒绝完成未开始的阶段', () => {
      expect(() => workflowExecution.completeStage(WorkflowStage.CONTEXT)).toThrow(
        'Stage context was not started'
      );
    });

    it('应该拒绝完成非运行中的阶段', () => {
      workflowExecution.startStage(WorkflowStage.CONTEXT);
      workflowExecution.completeStage(WorkflowStage.CONTEXT);
      
      expect(() => workflowExecution.completeStage(WorkflowStage.CONTEXT)).toThrow(
        'Stage context is not running'
      );
    });
  });

  describe('重试管理', () => {
    it('应该能够增加重试次数', () => {
      expect(workflowExecution.execution_status.retry_count).toBe(0);
      
      workflowExecution.incrementRetryCount();
      expect(workflowExecution.execution_status.retry_count).toBe(1);
      
      workflowExecution.incrementRetryCount();
      expect(workflowExecution.execution_status.retry_count).toBe(2);
    });

    it('应该正确判断是否可以重试', () => {
      // 默认最大重试3次
      expect(workflowExecution.canRetry()).toBe(true);
      
      workflowExecution.incrementRetryCount();
      workflowExecution.incrementRetryCount();
      workflowExecution.incrementRetryCount();
      expect(workflowExecution.canRetry()).toBe(false);
    });

    it('应该在没有重试策略时不允许重试', () => {
      const configWithoutRetry: WorkflowConfig = {
        name: 'No Retry Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      };
      
      const noRetryExecution = new WorkflowExecution(
        'no-retry-123',
        'orchestrator-456',
        configWithoutRetry,
        mockContext
      );
      
      expect(noRetryExecution.canRetry()).toBe(false);
    });
  });

  describe('验证和状态检查', () => {
    it('应该验证有效的工作流配置', () => {
      expect(workflowExecution.validateConfig()).toBe(true);
    });

    it('应该拒绝无效的工作流配置', () => {
      const invalidConfig: WorkflowConfig = {
        name: '', // 空名称
        stages: [], // 空阶段
        execution_mode: ExecutionMode.SEQUENTIAL
      };
      
      const invalidExecution = new WorkflowExecution(
        'invalid-123',
        'orchestrator-456',
        invalidConfig,
        mockContext
      );
      
      expect(invalidExecution.validateConfig()).toBe(false);
    });

    it('应该正确判断工作流是否已完成', () => {
      expect(workflowExecution.isCompleted()).toBe(false);
      
      workflowExecution.start();
      expect(workflowExecution.isCompleted()).toBe(false);
      
      workflowExecution.complete();
      expect(workflowExecution.isCompleted()).toBe(true);
    });

    it('应该正确判断工作流是否正在运行', () => {
      expect(workflowExecution.isRunning()).toBe(false);
      
      workflowExecution.start();
      expect(workflowExecution.isRunning()).toBe(true);
      
      workflowExecution.complete();
      expect(workflowExecution.isRunning()).toBe(false);
    });

    it('应该正确获取下一个要执行的阶段', () => {
      workflowExecution.start();
      
      // 初始状态应该返回第一个阶段
      expect(workflowExecution.getNextStage()).toBe(WorkflowStage.CONTEXT);
      
      // 完成第一个阶段后应该返回第二个阶段
      workflowExecution.startStage(WorkflowStage.CONTEXT);
      workflowExecution.completeStage(WorkflowStage.CONTEXT);
      expect(workflowExecution.getNextStage()).toBe(WorkflowStage.PLAN);
      
      // 完成所有阶段后应该返回null
      workflowExecution.startStage(WorkflowStage.PLAN);
      workflowExecution.completeStage(WorkflowStage.PLAN);
      workflowExecution.startStage(WorkflowStage.CONFIRM);
      workflowExecution.completeStage(WorkflowStage.CONFIRM);
      expect(workflowExecution.getNextStage()).toBe(null);
    });
  });

  describe('Core协议转换', () => {
    it('应该能够转换为Core协议格式', () => {
      const coreProtocol = workflowExecution.toCoreProtocol();
      
      expect(coreProtocol.protocol_version).toBe('1.0.0');
      expect(coreProtocol.workflow_id).toBe('workflow-123');
      expect(coreProtocol.orchestrator_id).toBe('orchestrator-456');
      expect(coreProtocol.workflow_config).toEqual(mockConfig);
      expect(coreProtocol.execution_context).toEqual(mockContext);
      expect(coreProtocol.execution_status).toEqual(workflowExecution.execution_status);
      expect(coreProtocol.timestamp).toBeDefined();
    });
  });
});
