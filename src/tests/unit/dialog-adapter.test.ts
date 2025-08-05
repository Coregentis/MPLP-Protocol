/**
 * MPLP Dialog Module Adapter Unit Tests
 *
 * @version v1.0.0
 * @created 2025-08-05T16:45:00+08:00
 * @description Dialog模块适配器单元测试，基于实际实现
 */

import { DialogModuleAdapter } from '../../modules/dialog/infrastructure/adapters/dialog-module.adapter';
import { DialogService } from '../../modules/dialog/application/services/dialog.service';
import { MemoryDialogRepository, MemoryMessageRepository } from '../../modules/dialog/infrastructure/repositories/memory-dialog.repository';
import { EventBus } from '../../core/event-bus';

describe('DialogModuleAdapter - Unit Tests', () => {
  let adapter: DialogModuleAdapter;
  let dialogService: DialogService;
  let dialogRepository: MemoryDialogRepository;
  let messageRepository: MemoryMessageRepository;
  let eventBus: EventBus;

  beforeEach(() => {
    // 使用真实的实现，不使用Mock
    eventBus = new EventBus();
    dialogRepository = new MemoryDialogRepository();
    messageRepository = new MemoryMessageRepository();
    dialogService = new DialogService(dialogRepository, messageRepository, eventBus);
    adapter = new DialogModuleAdapter(dialogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Interface Implementation', () => {
    it('should have correct module name', () => {
      expect(adapter.module_name).toBe('dialog');
    });

    it('should initialize successfully', async () => {
      await expect(adapter.initialize()).resolves.toBeUndefined();
      
      const status = adapter.getStatus();
      expect(status.module_name).toBe('dialog');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    it('should cleanup successfully', async () => {
      await adapter.initialize();
      await expect(adapter.cleanup()).resolves.toBeUndefined();
      
      const status = adapter.getStatus();
      expect(status.status).toBe('idle');
    });
  });

  describe('executeStage', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should execute stage with valid context', async () => {
      // 使用简化的上下文，避免复杂的类型匹配
      const mockContext = {
        execution_id: 'exec-123',
        context_id: 'test-context-123',
        current_stage: 'dialog',
        data_store: {
          dialog: {
            title: 'Test Dialog',
            participants: ['agent1', 'agent2']
          }
        }
      };

      const result = await adapter.executeStage(mockContext as any);

      expect(result.stage).toBe('dialog');
      expect(result.status).toBe('completed');
      expect(result.result).toBeDefined();
      expect(result.duration_ms).toBeGreaterThanOrEqual(0);
      expect(result.started_at).toBeDefined();
      expect(result.completed_at).toBeDefined();
    });

    it('should handle stage execution errors', async () => {
      const errorContext = {
        execution_id: 'exec-error',
        context_id: null, // 触发错误
        current_stage: 'dialog'
      };

      const result = await adapter.executeStage(errorContext as any);

      expect(result.stage).toBe('dialog');
      expect(result.status).toBe('failed');
      expect(result.result).toHaveProperty('error');
    });
  });

  describe('executeBusinessCoordination', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should execute business coordination successfully', async () => {
      const mockRequest = {
        coordination_id: 'coord-123',
        context_id: 'context-123',
        module: 'dialog',
        coordination_type: 'dialog_coordination',
        input_data: {
          data_type: 'dialog_data',
          data_version: '1.0.0',
          payload: {
            turn_strategy: 'adaptive',
            min_turns: 1,
            max_turns: 5,
            exit_criteria: 'goal_achieved'
          }
        }
      };

      const result = await adapter.executeBusinessCoordination(mockRequest as any);

      expect(result.coordination_id).toBe('coord-123');
      expect(result.module).toBe('dialog');
      expect(result.status).toBe('completed');
      expect(result.output_data).toBeDefined();
      expect(result.output_data.data_type).toBe('dialog_data');
      expect(result.execution_metrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle coordination errors', async () => {
      const errorRequest = {
        coordination_id: null, // 触发错误
        context_id: 'context-123',
        module: 'dialog'
      };

      const result = await adapter.executeBusinessCoordination(errorRequest as any);

      expect(result.module).toBe('dialog');
      expect(result.status).toBe('failed');
      expect(result.output_data.payload).toHaveProperty('error');
    });
  });

  describe('validateInput', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should validate valid input successfully', async () => {
      const validInput = {
        participants: ['agent1', 'agent2'],
        context: 'test-context'
      };

      const result = await adapter.validateInput(validInput);

      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should reject invalid input type', async () => {
      const result = await adapter.validateInput(null);

      expect(result.is_valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error_code).toBe('INVALID_TYPE');
    });

    it('should reject missing required fields', async () => {
      const invalidInput = {
        participants: ['agent1']
        // missing context
      };

      const result = await adapter.validateInput(invalidInput);

      expect(result.is_valid).toBe(false);
      expect(result.errors.some(e => e.error_code === 'MISSING_FIELDS')).toBe(true);
    });

    it('should reject invalid participants', async () => {
      const invalidInput = {
        participants: [], // empty array
        context: 'test-context'
      };

      const result = await adapter.validateInput(invalidInput);

      expect(result.is_valid).toBe(false);
      expect(result.errors.some(e => e.error_code === 'INVALID_PARTICIPANTS')).toBe(true);
    });
  });

  describe('handleError', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('should handle timeout errors with retry', async () => {
      const mockError = {
        error_id: 'error-123',
        error_type: 'timeout_error',
        error_code: 'TIMEOUT_ERROR',
        error_message: 'Operation timed out',
        source_module: 'dialog',
        context_data: {
          module: 'dialog',
          operation: 'test_operation'
        },
        recovery_suggestions: [],
        timestamp: new Date().toISOString()
      };

      const mockContext = {
        context_id: 'context-123',
        operation_type: 'dialog_coordination',
        execution_state: {
          status: 'running',
          completed_stages: ['context', 'plan'],
          failed_stages: [],
          pending_stages: ['confirm'],
          current_stage_status: 'in_progress',
          error_count: 0,
          retry_count: 0
        },
        metadata: {},
        timestamp: new Date().toISOString()
      };

      const result = await adapter.handleError(mockError as any, mockContext as any);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('retry');
    });

    it('should handle validation errors with skip', async () => {
      const validationError = {
        error_id: 'error-123',
        error_type: 'validation_error',
        error_code: 'VALIDATION_ERROR',
        error_message: 'Validation failed',
        source_module: 'dialog',
        context_data: {},
        recovery_suggestions: [],
        timestamp: new Date().toISOString()
      };

      const mockContext = {
        context_id: 'context-123',
        operation_type: 'dialog_coordination',
        execution_state: {
          status: 'running',
          completed_stages: [],
          failed_stages: [],
          pending_stages: [],
          current_stage_status: 'in_progress',
          error_count: 0,
          retry_count: 0
        },
        metadata: {},
        timestamp: new Date().toISOString()
      };

      const result = await adapter.handleError(validationError as any, mockContext as any);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('skip');
    });
  });

  describe('getStatus', () => {
    it('should return current module status', () => {
      const status = adapter.getStatus();

      expect(status.module_name).toBe('dialog');
      expect(status.status).toBe('idle');
      expect(status.error_count).toBe(0);
    });

    it('should return updated status after operations', async () => {
      await adapter.initialize();
      
      const status = adapter.getStatus();
      expect(status.status).toBe('initialized');
    });

    it('should track error counts correctly', async () => {
      await adapter.initialize();

      // 初始错误计数
      let status = adapter.getStatus();
      expect(status.error_count).toBe(0);

      // 执行错误操作
      const errorContext = {
        execution_id: 'exec-error',
        context_id: null, // 触发错误
        current_stage: 'dialog'
      };

      await adapter.executeStage(errorContext as any);

      // 验证错误计数增加
      status = adapter.getStatus();
      expect(status.error_count).toBe(1);
    });
  });
});
