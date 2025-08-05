/**
 * CoreOrchestratorService单元测试
 * @description 测试CoreOrchestratorService的所有核心功能
 * @author MPLP Team
 * @version 1.0.0
 */

import {
  CoreOrchestratorService,
  IWorkflowExecutionRepository,
  WorkflowExecution,
  WorkflowStage,
  WorkflowStatus,
  ExecutionMode,
  Priority,
  StageStatus,
  IModuleAdapter,
  OperationResult,
  ModuleMetadata
} from '../../../src/modules/core';

describe('CoreOrchestratorService', () => {
  let orchestrator: CoreOrchestratorService;
  let mockRepository: jest.Mocked<IWorkflowExecutionRepository>;
  let mockAdapter: jest.Mocked<IModuleAdapter>;

  beforeEach(() => {
    // 创建Mock Repository
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByFilter: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findActiveExecutions: jest.fn(),
      countByStatus: jest.fn(),
      findByUserId: jest.fn(),
      findBySessionId: jest.fn(),
      batchUpdateStatus: jest.fn(),
      cleanupExpired: jest.fn()
    };

    // 创建Mock Adapter
    mockAdapter = {
      execute: jest.fn(),
      getStatus: jest.fn(),
      healthCheck: jest.fn(),
      getMetadata: jest.fn()
    };

    // 创建CoreOrchestrator实例
    orchestrator = new CoreOrchestratorService(mockRepository, {
      module_timeout_ms: 5000,
      max_concurrent_executions: 5,
      enable_metrics: true,
      enable_events: true
    });
  });

  describe('构造函数和初始化', () => {
    it('应该正确初始化CoreOrchestrator', () => {
      expect(orchestrator).toBeDefined();
    });

    it('应该使用默认配置', () => {
      const defaultOrchestrator = new CoreOrchestratorService(mockRepository);
      expect(defaultOrchestrator).toBeDefined();
    });
  });

  describe('模块适配器管理', () => {
    beforeEach(() => {
      mockAdapter.getMetadata.mockReturnValue({
        name: 'test-adapter',
        version: '1.0.0',
        stage: WorkflowStage.CONTEXT,
        description: 'Test adapter'
      });
    });

    it('应该能够注册模块适配器', async () => {
      await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, mockAdapter);
      
      expect(mockAdapter.getMetadata).toHaveBeenCalled();
    });

    it('应该能够获取模块状态', async () => {
      mockAdapter.getStatus.mockResolvedValue(StageStatus.PENDING);
      
      await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, mockAdapter);
      const statuses = await orchestrator.getModuleStatuses();
      
      expect(statuses).toHaveProperty(WorkflowStage.CONTEXT);
      expect(statuses[WorkflowStage.CONTEXT]).toBe(StageStatus.PENDING);
    });

    it('应该处理模块状态获取失败', async () => {
      mockAdapter.getStatus.mockRejectedValue(new Error('Status check failed'));
      
      await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, mockAdapter);
      const statuses = await orchestrator.getModuleStatuses();
      
      expect(statuses[WorkflowStage.CONTEXT]).toBe(StageStatus.FAILED);
    });
  });

  describe('工作流执行', () => {
    beforeEach(async () => {
      // 注册必要的适配器
      mockAdapter.execute.mockResolvedValue({
        success: true,
        data: { result: 'success' }
      });
      mockAdapter.getStatus.mockResolvedValue(StageStatus.PENDING);
      mockAdapter.getMetadata.mockReturnValue({
        name: 'test-adapter',
        version: '1.0.0',
        stage: WorkflowStage.CONTEXT,
        description: 'Test adapter'
      });

      await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, mockAdapter);
      
      // Mock repository方法
      mockRepository.save.mockResolvedValue();
      mockRepository.update.mockResolvedValue();
    });

    it('应该能够执行基本工作流', async () => {
      const result = await orchestrator.executeWorkflow('test-context', {
        name: 'Test Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.status).toBe(WorkflowStatus.COMPLETED);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockAdapter.execute).toHaveBeenCalled();
    });

    it('应该拒绝无效的工作流配置', async () => {
      const result = await orchestrator.executeWorkflow('test-context', {
        name: '', // 无效的空名称
        stages: [],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid workflow configuration');
    });

    it('应该处理模块执行失败', async () => {
      mockAdapter.execute.mockResolvedValue({
        success: false,
        error: 'Module execution failed'
      });

      const result = await orchestrator.executeWorkflow('test-context', {
        name: 'Failing Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Module execution failed');
    });

    it('应该处理未注册的模块', async () => {
      const result = await orchestrator.executeWorkflow('test-context', {
        name: 'Unregistered Module Workflow',
        stages: [WorkflowStage.PLAN], // 未注册的模块
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No adapter registered for stage: plan');
    });

    it('应该在达到并发限制时拒绝新工作流', async () => {
      // 设置长延迟的适配器以保持工作流活跃
      mockAdapter.execute.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 1000))
      );

      // 启动最大数量的工作流
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(orchestrator.executeWorkflow(`context-${i}`, {
          name: `Workflow ${i}`,
          stages: [WorkflowStage.CONTEXT],
          execution_mode: ExecutionMode.SEQUENTIAL
        }));
      }

      // 等待工作流开始
      await new Promise(resolve => setTimeout(resolve, 100));

      // 尝试启动超出限制的工作流
      const excessResult = await orchestrator.executeWorkflow('excess-context', {
        name: 'Excess Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(excessResult.success).toBe(false);
      expect(excessResult.error).toContain('Maximum concurrent executions reached');

      // 等待所有工作流完成
      await Promise.all(promises);
    });
  });

  describe('工作流状态管理', () => {
    let mockExecution: WorkflowExecution;

    beforeEach(() => {
      mockExecution = new WorkflowExecution(
        'test-workflow-123',
        'test-orchestrator-456',
        {
          name: 'Test Workflow',
          stages: [WorkflowStage.CONTEXT],
          execution_mode: ExecutionMode.SEQUENTIAL
        },
        {
          user_id: 'test-user',
          session_id: 'test-session'
        }
      );
    });

    it('应该能够获取工作流执行状态', async () => {
      mockRepository.findById.mockResolvedValue(mockExecution);

      const result = await orchestrator.getExecutionStatus('test-workflow-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExecution.execution_status);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-workflow-123');
    });

    it('应该处理不存在的工作流', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await orchestrator.getExecutionStatus('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found');
    });

    it('应该能够获取活跃工作流列表', async () => {
      const activeWorkflows = await orchestrator.getActiveExecutions();

      expect(Array.isArray(activeWorkflows)).toBe(true);
    });
  });

  describe('工作流控制操作', () => {
    let mockExecution: WorkflowExecution;

    beforeEach(() => {
      mockExecution = new WorkflowExecution(
        'test-workflow-123',
        'test-orchestrator-456',
        {
          name: 'Test Workflow',
          stages: [WorkflowStage.CONTEXT],
          execution_mode: ExecutionMode.SEQUENTIAL
        },
        {
          user_id: 'test-user',
          session_id: 'test-session'
        }
      );
      mockExecution.start(); // 启动工作流以便控制

      // 模拟活跃工作流
      (orchestrator as any).activeExecutions.set('test-workflow-123', mockExecution);
      mockRepository.update.mockResolvedValue();
    });

    it('应该能够暂停工作流', async () => {
      const result = await orchestrator.pauseWorkflow('test-workflow-123');

      expect(result.success).toBe(true);
      expect(mockExecution.execution_status.status).toBe(WorkflowStatus.PAUSED);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该能够恢复工作流', async () => {
      mockExecution.pause();
      
      const result = await orchestrator.resumeWorkflow('test-workflow-123');

      expect(result.success).toBe(true);
      expect(mockExecution.execution_status.status).toBe(WorkflowStatus.IN_PROGRESS);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该能够取消工作流', async () => {
      const result = await orchestrator.cancelWorkflow('test-workflow-123');

      expect(result.success).toBe(true);
      expect(mockExecution.execution_status.status).toBe(WorkflowStatus.CANCELLED);
      expect(mockRepository.update).toHaveBeenCalled();
      
      // 验证工作流从活跃列表中移除
      const activeWorkflows = await orchestrator.getActiveExecutions();
      expect(activeWorkflows).not.toContain('test-workflow-123');
    });

    it('应该处理不存在的工作流控制请求', async () => {
      const pauseResult = await orchestrator.pauseWorkflow('non-existent');
      expect(pauseResult.success).toBe(false);
      expect(pauseResult.error).toContain('Workflow not found or not active');

      const resumeResult = await orchestrator.resumeWorkflow('non-existent');
      expect(resumeResult.success).toBe(false);
      expect(resumeResult.error).toContain('Workflow not found or not active');

      const cancelResult = await orchestrator.cancelWorkflow('non-existent');
      expect(cancelResult.success).toBe(false);
      expect(cancelResult.error).toContain('Workflow not found or not active');
    });
  });

  describe('事件处理', () => {
    it('应该能够添加事件监听器', () => {
      const handler = jest.fn();
      
      orchestrator.addEventListener('workflow.started' as any, handler);
      
      // 验证监听器已添加（通过内部状态检查）
      const listeners = (orchestrator as any).eventListeners.get('workflow.started');
      expect(listeners).toBeDefined();
      expect(listeners.has(handler)).toBe(true);
    });

    it('应该能够移除事件监听器', () => {
      const handler = jest.fn();
      
      orchestrator.addEventListener('workflow.started' as any, handler);
      orchestrator.removeEventListener('workflow.started' as any, handler);
      
      // 验证监听器已移除
      const listeners = (orchestrator as any).eventListeners.get('workflow.started');
      expect(listeners.has(handler)).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理Repository错误', async () => {
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await orchestrator.executeWorkflow('test-context', {
        name: 'Test Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('应该处理模块适配器错误', async () => {
      mockAdapter.execute.mockRejectedValue(new Error('Adapter error'));
      mockAdapter.getMetadata.mockReturnValue({
        name: 'test-adapter',
        version: '1.0.0',
        stage: WorkflowStage.CONTEXT,
        description: 'Test adapter'
      });

      await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, mockAdapter);
      mockRepository.save.mockResolvedValue();
      mockRepository.update.mockResolvedValue();

      const result = await orchestrator.executeWorkflow('test-context', {
        name: 'Test Workflow',
        stages: [WorkflowStage.CONTEXT],
        execution_mode: ExecutionMode.SEQUENTIAL
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Adapter error');
    });
  });
});
