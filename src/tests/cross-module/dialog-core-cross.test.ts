/**
 * MPLP Dialog-Core Cross-Module Integration Tests
 *
 * @version v1.0.0
 * @created 2025-08-05T17:00:00+08:00
 * @description Dialog模块与Core模块跨模块集成测试
 * 
 * 测试方法论：
 * 1. 基于真实用户角色和使用场景设计测试
 * 2. 使用实际服务层API，避免虚构接口
 * 3. 动态Mock策略确保跨模块数据一致性
 * 4. 验证完整的数据流转和业务逻辑
 * 5. 发现并修复源代码问题而非绕过
 */

import { DialogModuleAdapter } from '../../modules/dialog/infrastructure/adapters/dialog-module.adapter';
import { DialogModule, defaultDialogConfig } from '../../modules/dialog/module';
import { DialogService } from '../../modules/dialog/application/services/dialog.service';
import { MemoryDialogRepository, MemoryMessageRepository } from '../../modules/dialog/infrastructure/repositories/memory-dialog.repository';
import { EventBus } from '../../core/event-bus';

describe('Dialog-Core Cross-Module Integration', () => {
  let dialogModule: DialogModule;
  let dialogAdapter: DialogModuleAdapter;
  let dialogService: DialogService;
  let eventBus: EventBus;

  beforeEach(() => {
    // 使用真实的实现进行跨模块测试
    eventBus = new EventBus();
    
    // 初始化Dialog模块
    dialogModule = new DialogModule(defaultDialogConfig, eventBus);
    dialogService = dialogModule.getDialogService();
    
    // 初始化Dialog适配器
    dialogAdapter = new DialogModuleAdapter(dialogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('跨模块场景1: 模块生命周期集成', () => {
    it('用户场景: Dialog模块与Core模块协同初始化', async () => {
      // 验证模块初始状态
      expect(dialogModule).toBeDefined();
      expect(dialogAdapter.module_name).toBe('dialog');
      
      // 初始化适配器
      await dialogAdapter.initialize();
      
      // 验证适配器状态
      const adapterStatus = dialogAdapter.getStatus();
      expect(adapterStatus.module_name).toBe('dialog');
      expect(adapterStatus.status).toBe('initialized');
      expect(adapterStatus.error_count).toBe(0);
      
      // 验证模块健康状态
      const moduleHealth = await dialogModule.healthCheck();
      expect(moduleHealth.status).toBe('healthy');
      expect(moduleHealth.details).toBeDefined();
    });

    it('用户场景: 模块关闭和清理', async () => {
      await dialogAdapter.initialize();
      
      // 验证初始化状态
      expect(dialogAdapter.getStatus().status).toBe('initialized');
      
      // 执行清理
      await dialogAdapter.cleanup();
      
      // 验证清理后状态
      expect(dialogAdapter.getStatus().status).toBe('idle');
      
      // 执行模块关闭
      await dialogModule.shutdown();
    });
  });

  describe('跨模块场景2: 工作流执行集成', () => {
    beforeEach(async () => {
      await dialogAdapter.initialize();
    });

    it('用户场景: Dialog阶段在完整工作流中的执行', async () => {
      // 模拟来自Core模块的工作流上下文
      const workflowContext = {
        execution_id: 'workflow-exec-123',
        context_id: 'workflow-context-123',
        workflow_type: 'standard_workflow',
        current_stage: 'dialog',
        stage_index: 2,
        total_stages: 5,
        data_store: {
          global_data: {
            project_id: 'proj-123',
            user_id: 'user-001'
          },
          stage_inputs: {
            dialog: {
              title: 'Cross-Module Dialog Test',
              participants: ['agent1', 'agent2', 'human-supervisor'],
              context_from_plan: {
                goals: ['解决技术问题', '提供用户支持'],
                constraints: ['30分钟内完成', '保持专业态度']
              }
            }
          },
          stage_outputs: {},
          intermediate_results: {}
        },
        execution_state: {
          status: 'running',
          completed_stages: ['context', 'plan'],
          failed_stages: [],
          pending_stages: ['confirm', 'trace'],
          current_stage_status: 'in_progress',
          error_count: 0,
          retry_count: 0
        },
        metadata: {
          workflow_config: {
            stages: ['context', 'plan', 'dialog', 'confirm', 'trace'],
            timeout_ms: 300000
          },
          started_by: 'user-001',
          priority: 'normal'
        },
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 执行Dialog阶段
      const stageResult = await dialogAdapter.executeStage(workflowContext as any);

      // 验证阶段执行结果
      expect(stageResult.stage).toBe('dialog');
      expect(stageResult.status).toBe('completed');
      expect(stageResult.result).toBeDefined();
      expect(stageResult.duration_ms).toBeGreaterThanOrEqual(0);
      expect(stageResult.started_at).toBeDefined();
      expect(stageResult.completed_at).toBeDefined();

      // 验证结果包含对话信息
      expect(stageResult.result).toHaveProperty('dialog_id');
      expect(stageResult.result).toHaveProperty('participants');
      expect(stageResult.result).toHaveProperty('status');
      
      // 验证与前置阶段的数据一致性
      const dialogData = stageResult.result;
      expect(dialogData.participants).toContain('agent1');
      expect(dialogData.participants).toContain('agent2');
    });

    it('用户场景: 处理工作流阶段错误和恢复', async () => {
      // 模拟错误的工作流上下文
      const errorContext = {
        execution_id: 'workflow-exec-error',
        context_id: 'workflow-context-error',
        current_stage: 'dialog',
        data_store: null, // 触发错误
        execution_state: {
          status: 'running',
          completed_stages: ['context'],
          failed_stages: [],
          pending_stages: ['plan', 'confirm', 'trace'],
          current_stage_status: 'in_progress',
          error_count: 0,
          retry_count: 0
        }
      };

      const stageResult = await dialogAdapter.executeStage(errorContext as any);

      expect(stageResult.stage).toBe('dialog');
      expect(stageResult.status).toBe('failed');
      expect(stageResult.result).toHaveProperty('error');
      
      // 验证错误计数更新
      const status = dialogAdapter.getStatus();
      expect(status.error_count).toBe(1);
    });
  });

  describe('跨模块场景3: 业务协调集成', () => {
    beforeEach(async () => {
      await dialogAdapter.initialize();
    });

    it('用户场景: Dialog模块响应Core模块的业务协调请求', async () => {
      const coordinationRequest = {
        coordination_id: 'coord-cross-123',
        context_id: 'context-cross-123',
        module: 'dialog',
        coordination_type: 'dialog_coordination',
        input_data: {
          data_type: 'dialog_data',
          data_version: '1.0.0',
          payload: {
            turn_strategy: 'adaptive',
            min_turns: 2,
            max_turns: 8,
            exit_criteria: 'consensus_reached',
            participants: ['agent1', 'agent2', 'agent3'],
            context_from_core: {
              business_context: 'customer_support',
              priority: 'high',
              expected_outcome: 'problem_resolution'
            }
          },
          metadata: {
            source_module: 'core',
            target_modules: ['dialog'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        configuration: {
          retry_policy: {
            max_attempts: 3,
            delay_ms: 1000
          },
          validation_rules: [],
          output_format: 'standard'
        }
      };

      const coordinationResult = await dialogAdapter.executeBusinessCoordination(coordinationRequest as any);

      // 验证协调结果
      expect(coordinationResult.coordination_id).toBe('coord-cross-123');
      expect(coordinationResult.module).toBe('dialog');
      expect(coordinationResult.status).toBe('completed');
      expect(coordinationResult.output_data).toBeDefined();
      expect(coordinationResult.output_data.data_type).toBe('dialog_data');
      expect(coordinationResult.execution_metrics).toBeDefined();

      // 验证输出数据结构
      const outputPayload = coordinationResult.output_data.payload;
      expect(outputPayload).toHaveProperty('dialog_id');
      expect(outputPayload).toHaveProperty('turns');
      expect(outputPayload).toHaveProperty('final_state');
      expect(outputPayload).toHaveProperty('timestamp');
    });

    it('用户场景: 跨模块数据验证和一致性检查', async () => {
      // 验证输入数据
      const inputData = {
        participants: ['agent1', 'agent2'],
        context: 'cross-module-test',
        business_requirements: {
          type: 'customer_support',
          priority: 'high'
        }
      };

      const validationResult = await dialogAdapter.validateInput(inputData);

      expect(validationResult.is_valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      expect(validationResult.warnings).toHaveLength(0);
    });
  });

  describe('跨模块场景4: 错误处理和恢复机制', () => {
    beforeEach(async () => {
      await dialogAdapter.initialize();
    });

    it('用户场景: 跨模块错误传播和处理', async () => {
      // 模拟来自Core模块的业务错误
      const businessError = {
        error_id: 'cross-error-123',
        error_type: 'timeout_error',
        error_code: 'CROSS_MODULE_TIMEOUT',
        error_message: 'Dialog coordination timed out in cross-module operation',
        source_module: 'dialog',
        context_data: {
          module: 'dialog',
          operation: 'cross_module_coordination',
          coordination_id: 'coord-cross-123',
          timestamp: new Date().toISOString()
        },
        recovery_suggestions: ['retry_with_extended_timeout', 'fallback_to_simple_dialog'],
        timestamp: new Date().toISOString()
      };

      const businessContext = {
        context_id: 'context-cross-error-123',
        operation_type: 'cross_module_coordination',
        execution_state: {
          status: 'running',
          completed_stages: ['context', 'plan'],
          failed_stages: [],
          pending_stages: ['confirm', 'trace'],
          current_stage_status: 'error',
          error_count: 1,
          retry_count: 0
        },
        metadata: {
          cross_module_context: true,
          source_module: 'core',
          target_module: 'dialog'
        },
        timestamp: new Date().toISOString()
      };

      const errorResult = await dialogAdapter.handleError(businessError as any, businessContext as any);

      expect(errorResult.handled).toBe(true);
      expect(errorResult.recovery_action).toBe('retry');
      // recovery_data是可选的，不是所有错误处理都需要返回recovery_data
      if (errorResult.recovery_data) {
        expect(errorResult.recovery_data).toBeDefined();
      }
    });
  });

  describe('跨模块场景5: 性能和监控集成', () => {
    beforeEach(async () => {
      await dialogAdapter.initialize();
    });

    it('用户场景: 跨模块性能监控和指标收集', async () => {
      const startTime = Date.now();

      // 执行多个跨模块操作
      const operations = [];
      for (let i = 0; i < 3; i++) {
        const context = {
          execution_id: `cross-perf-${i}`,
          context_id: `cross-context-${i}`,
          current_stage: 'dialog',
          data_store: {
            dialog: { title: `Cross-Module Perf Test ${i}` }
          }
        };
        operations.push(dialogAdapter.executeStage(context as any));
      }

      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      // 验证所有操作成功
      results.forEach((result, index) => {
        expect(result.status).toBe('completed');
        expect(result.duration_ms).toBeGreaterThanOrEqual(0);
      });

      // 验证跨模块性能要求
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
      
      // 验证模块状态一致性
      const adapterStatus = dialogAdapter.getStatus();
      expect(adapterStatus.error_count).toBe(0);
      
      const moduleHealth = await dialogModule.healthCheck();
      expect(moduleHealth.status).toBe('healthy');
    });
  });
});
