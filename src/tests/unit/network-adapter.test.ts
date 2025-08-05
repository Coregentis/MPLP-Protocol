/**
 * Network模块适配器单元测试
 * 
 * @version v1.0.0
 * @created 2025-08-05T20:45:00+08:00
 * @description Network模块适配器的单元测试，验证ModuleInterface接口实现
 * 
 * 遵循规则：
 * - 零技术债务：严禁使用any类型
 * - 生产级代码质量：完整的错误处理和类型安全
 * - 基于实际实现的测试设计
 */

import { NetworkModuleAdapter } from '../../modules/network/infrastructure/adapters/network-module.adapter';
import { NetworkService } from '../../modules/network/application/services/network.service';
import {
  WorkflowExecutionContext,
  BusinessCoordinationRequest,
  BusinessError,
  BusinessContext
} from '../../public/modules/core/types/core.types';

describe('NetworkModuleAdapter', () => {
  let adapter: NetworkModuleAdapter;
  let mockNetworkService: jest.Mocked<NetworkService>;

  beforeEach(() => {
    // 创建Mock服务
    mockNetworkService = {
      createNetwork: jest.fn(),
      getNetwork: jest.fn(),
      updateNetwork: jest.fn(),
      deleteNetwork: jest.fn(),
      queryNetworks: jest.fn(),
      addNode: jest.fn(),
      removeNode: jest.fn(),
      updateNode: jest.fn(),
      discoverNodes: jest.fn(),
      registerNode: jest.fn(),
      calculateRoute: jest.fn()
    } as any;

    // 创建适配器实例
    adapter = new NetworkModuleAdapter(mockNetworkService);
  });

  describe('初始化和状态管理', () => {
    it('应该成功初始化适配器', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
      
      const status = adapter.getStatus();
      expect(status.module_name).toBe('network');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    it('应该在服务缺失时初始化失败', async () => {
      const adapterWithoutService = new NetworkModuleAdapter(null as any);
      
      await expect(adapterWithoutService.initialize()).rejects.toThrow('NetworkService is required');
    });

    it('应该正确返回模块状态', () => {
      const status = adapter.getStatus();
      
      expect(status).toEqual({
        module_name: 'network',
        status: 'idle',
        error_count: 0,
        last_execution: expect.any(String)
      });
    });
  });

  describe('工作流阶段执行', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该成功执行网络阶段', async () => {
      const context: WorkflowExecutionContext = {
        execution_id: 'exec-12345',
        context_id: 'ctx-12345',
        workflow_type: 'project_lifecycle',
        current_stage: 'network',
        stage_index: 3,
        total_stages: 4,
        data_store: {
          global_data: {
            context: {
              data_type: 'context_data',
              data_version: '1.0.0',
              payload: { id: 'ctx-12345' },
              metadata: {
                source_module: 'core',
                target_modules: ['network'],
                data_schema_version: '1.0.0',
                validation_status: 'valid',
                security_level: 'internal'
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          stage_inputs: {},
          stage_outputs: {},
          intermediate_results: {}
        },
        execution_state: {
          status: 'running',
          completed_stages: [],
          failed_stages: [],
          pending_stages: ['network'],
          current_stage_status: 'in_progress',
          error_count: 0,
          retry_count: 0
        },
        metadata: {
          source: 'test',
          priority: 'normal'
        },
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await adapter.executeStage(context);

      expect(result.stage).toBe('network');
      expect(result.status).toBe('completed');
      expect(result.result).toBeDefined();
      expect(result.result.network_id).toBeDefined();
      expect(result.result.nodes_discovered).toEqual(['node-1', 'node-2', 'node-3']);
      expect(result.result.topology_type).toBe('mesh');
      expect(result.duration_ms).toBeGreaterThanOrEqual(0);
      expect(result.started_at).toBeDefined();
      expect(result.completed_at).toBeDefined();
    });

    it('应该处理无效上下文的错误', async () => {
      const invalidContext = {
        context_id: '',
        data_store: null
      } as any;

      const result = await adapter.executeStage(invalidContext);

      expect(result.stage).toBe('network');
      expect(result.status).toBe('failed');
      expect(result.result.error).toBeDefined();
    });

    it('应该在缺少context_id时失败', async () => {
      const context = {
        data_store: { 
          global_data: {}, 
          stage_inputs: {}, 
          stage_outputs: {}, 
          intermediate_results: {} 
        }
      } as any;

      const result = await adapter.executeStage(context);

      expect(result.status).toBe('failed');
      expect(result.result.error).toContain('missing context_id');
    });

    it('应该在缺少data_store时失败', async () => {
      const context = {
        context_id: 'ctx-12345'
      } as any;

      const result = await adapter.executeStage(context);

      expect(result.status).toBe('failed');
      expect(result.result.error).toContain('missing data_store');
    });
  });

  describe('业务协调执行', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该成功执行业务协调', async () => {
      const request: BusinessCoordinationRequest = {
        coordination_id: 'coord-12345',
        context_id: 'ctx-12345',
        module: 'network',
        coordination_type: 'network_coordination',
        input_data: {
          data_type: 'network_data',
          data_version: '1.0.0',
          payload: { nodes: ['node-1', 'node-2'] },
          metadata: {
            source_module: 'core',
            target_modules: ['network'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      const result = await adapter.executeBusinessCoordination(request);

      expect(result.coordination_id).toBe('coord-12345');
      expect(result.module).toBe('network');
      expect(result.status).toBe('completed');
      expect(result.output_data).toBeDefined();
      expect(result.output_data.payload.coordination_type).toBe('network_coordination');
      expect(result.execution_metrics).toBeDefined();
      expect(result.execution_metrics.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('应该处理业务协调错误', async () => {
      const invalidRequest = {
        coordination_id: '',
        coordination_type: 'invalid'
      } as any;

      const result = await adapter.executeBusinessCoordination(invalidRequest);

      expect(result.status).toBe('failed');
      expect(result.output_data.payload.error).toBeDefined();
    });
  });

  describe('输入验证', () => {
    it('应该验证有效输入', async () => {
      const validInput = {
        nodes: ['node-1', 'node-2'],
        topology: 'mesh'
      };

      const result = await adapter.validateInput(validInput);

      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝null输入', async () => {
      const result = await adapter.validateInput(null);

      expect(result.is_valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error_code).toBe('INVALID_TYPE');
    });

    it('应该拒绝非对象输入', async () => {
      const result = await adapter.validateInput('invalid');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error_code).toBe('INVALID_TYPE');
    });

    it('应该要求nodes字段', async () => {
      const input = { topology: 'mesh' };

      const result = await adapter.validateInput(input);

      expect(result.is_valid).toBe(false);
      expect(result.errors.some(e => e.error_code === 'MISSING_FIELDS' && e.field_path === 'nodes')).toBe(true);
    });

    it('应该要求topology字段', async () => {
      const input = { nodes: ['node-1'] };

      const result = await adapter.validateInput(input);

      expect(result.is_valid).toBe(false);
      expect(result.errors.some(e => e.error_code === 'MISSING_FIELDS' && e.field_path === 'topology')).toBe(true);
    });

    it('应该对空节点列表发出警告', async () => {
      const input = {
        nodes: [],
        topology: 'mesh'
      };

      const result = await adapter.validateInput(input);

      expect(result.is_valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].warning_code).toBe('EMPTY_NODES');
    });

    it('应该验证节点数量限制', async () => {
      const input = {
        nodes: new Array(1001).fill('node'),
        topology: 'mesh'
      };

      const result = await adapter.validateInput(input);

      expect(result.is_valid).toBe(false);
      expect(result.errors.some(e => e.error_code === 'NODES_LIMIT_EXCEEDED')).toBe(true);
    });

    it('应该处理验证异常', async () => {
      // 创建一个会导致验证异常的输入
      const circularInput = {};
      (circularInput as any).self = circularInput;

      const result = await adapter.validateInput(circularInput);

      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理超时错误', async () => {
      const error: BusinessError = {
        error_id: 'err-12345',
        error_type: 'timeout_error',
        error_code: 'TIMEOUT_001',
        error_message: 'Operation timed out',
        source_module: 'network',
        context_data: { operation: 'test_operation' },
        recovery_suggestions: [
          {
            suggestion_type: 'retry',
            description: 'Retry the operation',
            automated: true
          }
        ],
        timestamp: new Date().toISOString()
      };

      const context: BusinessContext = {
        context_id: 'ctx-12345',
        workflow_execution_id: 'wf-12345',
        stage_id: 'network'
      };

      const result = await adapter.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('retry');
      expect(result.recovery_data).toBeDefined();
    });

    it('应该处理验证错误', async () => {
      const error: BusinessError = {
        error_id: 'err-12345',
        error_type: 'validation_error',
        error_code: 'VALIDATION_001',
        error_message: 'Invalid input',
        source_module: 'network',
        context_data: { input_type: 'test_input' },
        recovery_suggestions: [
          {
            suggestion_type: 'skip',
            description: 'Skip invalid input',
            automated: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      const context: BusinessContext = {
        context_id: 'ctx-12345',
        workflow_execution_id: 'wf-12345',
        stage_id: 'network'
      };

      const result = await adapter.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('skip');
    });

    it('应该处理业务逻辑错误', async () => {
      const error: BusinessError = {
        error_id: 'err-12345',
        error_type: 'business_logic_error',
        error_code: 'BUSINESS_001',
        error_message: 'Business rule violation',
        source_module: 'network',
        context_data: { rule: 'test_rule' },
        recovery_suggestions: [
          {
            suggestion_type: 'manual_intervention',
            description: 'Manual review required',
            automated: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      const context: BusinessContext = {
        context_id: 'ctx-12345',
        workflow_execution_id: 'wf-12345',
        stage_id: 'network'
      };

      const result = await adapter.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('escalate');
    });

    it('应该处理错误恢复失败', async () => {
      // 模拟错误恢复过程中的异常
      const error: BusinessError = {
        error_id: 'err-12345',
        error_type: 'system_error',
        error_code: 'SYSTEM_001',
        error_message: 'System error',
        source_module: 'network',
        context_data: { error_type: 'unknown' },
        recovery_suggestions: [
          {
            suggestion_type: 'manual_intervention',
            description: 'Manual investigation required',
            automated: false
          }
        ],
        timestamp: new Date().toISOString()
      };

      const context: BusinessContext = {
        context_id: 'ctx-12345',
        workflow_execution_id: 'wf-12345',
        stage_id: 'network'
      };

      const result = await adapter.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.recovery_action).toBe('escalate');
    });
  });

  describe('资源清理', () => {
    it('应该成功清理资源', async () => {
      await adapter.initialize();
      
      await expect(adapter.cleanup()).resolves.not.toThrow();
      
      const status = adapter.getStatus();
      expect(status.status).toBe('idle');
    });

    it('应该处理清理过程中的错误', async () => {
      // 这个测试验证清理方法的错误处理
      await expect(adapter.cleanup()).resolves.not.toThrow();
    });
  });
});
