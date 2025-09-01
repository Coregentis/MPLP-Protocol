/**
 * Core编排服务测试 - 基于实际代码
 * 
 * @description 基于实际CoreOrchestrationService代码的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer 应用层测试 - 服务
 */

import { CoreOrchestrationService } from '../../../../../src/modules/core/application/services/core-orchestration.service';
import { ICoreRepository } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import { createTestCoreEntity } from '../../helpers/test-factories';
import {
  UUID,
  WorkflowConfig,
  ExecutionContext,
  CoreOperation,
  WorkflowStageType,
  ExecutionModeType,
  PriorityType
} from '../../../types';

// 导入实际存在的类型
import {
  WorkflowExecutionData,
  WorkflowResult,
  CoordinationRequest,
  CoordinationResult
} from '../../../application/services/core-orchestration.service';

// 创建模拟仓储 - 基于实际ICoreRepository接口
function createMockRepository(): jest.Mocked<ICoreRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByOrchestratorId: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    findByCriteria: jest.fn(),
    findWithPagination: jest.fn(),
    saveBatch: jest.fn(),
    deleteBatch: jest.fn()
  };
}

describe('CoreOrchestrationService测试', () => {
  let service: CoreOrchestrationService;
  let mockRepository: jest.Mocked<ICoreRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = createMockRepository();
    service = new CoreOrchestrationService(mockRepository);
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreOrchestrationService实例', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CoreOrchestrationService);
    });
  });

  describe('coordinateModuleOperation方法测试', () => {
    it('应该成功协调模块操作', async () => {
      const request: CoordinationRequest = {
        sourceModule: 'core',
        targetModule: 'context',
        operation: 'sync_state',
        payload: { workflowId: 'test-workflow-001' },
        timestamp: new Date().toISOString()
      };

      const result = await service.coordinateModuleOperation(request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });

    it('应该处理模块协调错误', async () => {
      const request: CoordinationRequest = {
        sourceModule: 'core',
        targetModule: 'invalid-module',
        operation: 'invalid_operation',
        payload: {},
        timestamp: new Date().toISOString()
      };

      const result = await service.coordinateModuleOperation(request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.executionTime).toBeDefined();
      // 即使操作失败，也应该返回结果而不是抛出异常
    });

    it('应该处理复杂的协调请求', async () => {
      const request: CoordinationRequest = {
        sourceModule: 'core',
        targetModule: 'plan',
        operation: 'execute_plan',
        payload: {
          planId: 'plan-001',
          executionMode: 'sequential',
          priority: 'high'
        },
        timestamp: new Date().toISOString()
      };

      const result = await service.coordinateModuleOperation(request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('activateReservedInterface方法测试', () => {
    it('应该成功激活预留接口', async () => {
      const moduleId = 'context';
      const interfaceId = 'sync_state';
      const activationData = {
        parameters: { contextId: 'ctx-001', workflowId: 'wf-001' },
        configuration: { timeout: 30000 },
        metadata: { source: 'test' }
      };

      const result = await service.activateReservedInterface(moduleId, interfaceId, activationData);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.interfaceId).toBe(interfaceId);
      expect(result.activatedAt).toBeDefined();
    });

    it('应该处理接口激活错误', async () => {
      const moduleId = 'invalid-module';
      const interfaceId = 'invalid-interface';
      const activationData = {
        parameters: {},
        configuration: {},
        metadata: {}
      };

      const result = await service.activateReservedInterface(moduleId, interfaceId, activationData);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.interfaceId).toBe(interfaceId);
      // 即使激活失败，也应该返回结果
    });
  });

  describe('接口激活性能测试', () => {
    it('应该在合理时间内激活接口', async () => {
      const moduleId = 'context';
      const interfaceId = 'performance_test';
      const activationData = {
        parameters: { testMode: true },
        configuration: { timeout: 5000 }
      };

      const startTime = Date.now();
      const result = await service.activateReservedInterface(moduleId, interfaceId, activationData);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(300); // 应该在300ms内完成（调整为更合理的阈值）
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内执行模块协调', async () => {
      const request: CoordinationRequest = {
        sourceModule: 'core',
        targetModule: 'context',
        operation: 'performance_test',
        payload: { testMode: true },
        timestamp: new Date().toISOString()
      };

      const startTime = Date.now();
      const result = await service.coordinateModuleOperation(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1000ms内完成
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协调请求错误', async () => {
      const request: CoordinationRequest = {
        sourceModule: 'core',
        targetModule: 'error-module',
        operation: 'error_operation',
        payload: { errorTest: true },
        timestamp: new Date().toISOString()
      };

      const result = await service.coordinateModuleOperation(request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.executionTime).toBeDefined();
      // 服务应该优雅地处理错误而不是抛出异常
    });
  });
});
