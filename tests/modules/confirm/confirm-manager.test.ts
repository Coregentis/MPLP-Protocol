/**
 * MPLP Confirm模块 - ConfirmManager测试
 * 
 * @version v1.0.2
 * @updated 2025-07-12T16:30:00+08:00
 * @compliance 100% Schema合规性 - 基于confirm-protocol.json重构
 * @description 测试ConfirmManager的核心功能，包括初始化、创建确认、更新确认和健康检查
 */

import { expect } from '@jest/globals';
import { ConfirmManager } from '../../../src/modules/confirm/confirm-manager';
import { 
  CreateConfirmRequest,
  UpdateConfirmRequest,
  StepActionRequest,
  ConfirmProtocol,
  ConfirmResponse,
  WorkflowActionResponse
} from '../../../src/modules/confirm/types';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 模拟ConfirmService
jest.mock('../../../src/modules/confirm/confirm-service', () => {
  return {
    ConfirmService: jest.fn().mockImplementation(() => ({
      createConfirmation: jest.fn().mockImplementation(async (request) => {
        if (!request.context_id) {
          throw new Error('context_id is required');
        }
        
        return {
          success: true,
          data: {
            protocol_version: '1.0.1',
            timestamp: new Date().toISOString(),
            confirm_id: 'mock-confirm-id',
            context_id: request.context_id,
            confirmation_type: request.confirmation_type || 'plan_approval',
            status: 'pending',
            priority: request.priority || 'medium',
            subject: request.subject,
            approval_workflow: {
              workflow_type: 'sequential',
              steps: [
                {
                  step_id: 'mock-step-id',
                  step_order: 1,
                  approver: {
                    user_id: 'mock-user',
                    role: 'manager',
                    is_required: true
                  },
                  status: 'pending'
                }
              ]
            }
          },
          metadata: {
            request_id: 'mock-request-id',
            processing_time_ms: 5,
            trace_id: 'mock-trace-id'
          }
        };
      }),
      
      updateConfirmation: jest.fn().mockImplementation(async (confirmId, request) => {
        return {
          success: true,
          data: {
            protocol_version: '1.0.1',
            timestamp: new Date().toISOString(),
            confirm_id: confirmId,
            context_id: 'mock-context-id',
            confirmation_type: 'plan_approval',
            status: request.status || 'pending',
            priority: request.priority || 'medium',
            subject: request.subject
          }
        };
      }),
      
      processStepAction: jest.fn().mockImplementation(async (confirmId, request) => {
        if (request.step_id === 'invalid-step-id') {
          throw new Error('Step not found');
        }
        
        return {
          success: true,
          updated_confirmation: {
            protocol_version: '1.0.1',
            timestamp: new Date().toISOString(),
            confirm_id: confirmId,
            context_id: 'mock-context-id',
            confirmation_type: 'plan_approval',
            status: 'pending',
            priority: 'medium',
            approval_workflow: {
              workflow_type: 'sequential',
              steps: [
                {
                  step_id: request.step_id,
                  step_order: 1,
                  approver: {
                    user_id: 'mock-user',
                    role: 'manager',
                    is_required: true
                  },
                  status: request.action === 'approve' ? 'approved' : 'pending',
                  decision: {
                    outcome: request.action,
                    comments: request.comments,
                    timestamp: new Date().toISOString()
                  }
                }
              ]
            }
          },
          next_steps: [],
          workflow_completed: request.action === 'approve'
        };
      }),
      
      queryConfirmations: jest.fn().mockImplementation(async (filter) => {
        return [
          {
            protocol_version: '1.0.1',
            timestamp: new Date().toISOString(),
            confirm_id: 'mock-confirm-id-1',
            context_id: 'mock-context-id',
            confirmation_type: 'plan_approval',
            status: 'pending',
            priority: 'medium'
          },
          {
            protocol_version: '1.0.1',
            timestamp: new Date().toISOString(),
            confirm_id: 'mock-confirm-id-2',
            context_id: 'mock-context-id',
            confirmation_type: 'task_approval',
            status: 'approved',
            priority: 'high'
          }
        ];
      }),
      
      getHealthStatus: jest.fn().mockImplementation(async () => {
        return {
          status: 'healthy',
          checks: {
            database: 'pass',
            notification: 'pass',
            workflow: 'pass'
          }
        };
      })
    }))
  };
});

describe('ConfirmManager', () => {
  let confirmManager: ConfirmManager;
  
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 创建ConfirmManager实例
    confirmManager = new ConfirmManager({ autoInitialize: false });
  });
  
  describe('initialize', () => {
    test('应该成功初始化管理器', async () => {
      // 执行
      await confirmManager.initialize();
      
      // 验证
      expect(confirmManager.getStatus().initialized).toBe(true);
    });
  });
  
  describe('createConfirmation', () => {
    test('应该成功创建确认', async () => {
      // 准备
      await confirmManager.initialize();
      
      const request: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'medium'
      };
      
      // 执行
      const result = await confirmManager.createConfirmation(request);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.confirm_id).toBe('mock-confirm-id');
      expect(result.data?.context_id).toBe('context-123');
    });
    
    test('应该在未初始化时抛出错误', async () => {
      // 准备
      const request: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'medium'
      };
      
      // 执行和验证
      await expect(confirmManager.createConfirmation(request))
        .rejects.toThrow('ConfirmManager is not initialized');
    });
  });
  
  describe('updateConfirmation', () => {
    test('应该成功更新确认', async () => {
      // 准备
      await confirmManager.initialize();
      
      const updates: Partial<UpdateConfirmRequest> = {
        status: 'approved',
        priority: 'high'
      };
      
      // 执行
      const result = await confirmManager.updateConfirmation('mock-confirm-id', updates);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('approved');
      expect(result.data?.priority).toBe('high');
    });
  });
  
  describe('processStepAction', () => {
    test('应该成功处理步骤操作', async () => {
      // 准备
      await confirmManager.initialize();
      
      const action: StepActionRequest = {
        step_id: 'mock-step-id',
        action: 'approve',
        comments: 'Approved by test'
      };
      
      // 执行
      const result = await confirmManager.processStepAction('mock-confirm-id', action);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.updated_confirmation).toBeDefined();
      expect(result.updated_confirmation.approval_workflow?.steps[0].status).toBe('approved');
      expect(result.workflow_completed).toBe(true);
    });
    
    test('应该拒绝无效的步骤操作', async () => {
      // 准备
      await confirmManager.initialize();
      
      const action: StepActionRequest = {
        step_id: 'invalid-step-id',
        action: 'approve'
      };
      
      // 执行和验证
      await expect(confirmManager.processStepAction('mock-confirm-id', action))
        .rejects.toThrow('Step not found');
    });
  });
  
  describe('queryConfirmations', () => {
    test('应该返回确认列表', async () => {
      // 准备
      await confirmManager.initialize();
      
      // 执行
      const results = await confirmManager.queryConfirmations();
      
      // 验证
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0].confirm_id).toBe('mock-confirm-id-1');
      expect(results[1].confirm_id).toBe('mock-confirm-id-2');
    });
  });
  
  describe('createSimpleConfirmation', () => {
    test('应该创建简单确认', async () => {
      // 准备
      await confirmManager.initialize();
      
      // 执行
      const result = await confirmManager.createSimpleConfirmation(
        'context-123',
        'plan_approval',
        'medium',
        'Simple Confirmation',
        'This is a simple confirmation'
      );
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.context_id).toBe('context-123');
      expect(result.data?.confirmation_type).toBe('plan_approval');
      expect(result.data?.priority).toBe('medium');
    });
  });
  
  describe('healthCheck', () => {
    test('应该返回健康状态', async () => {
      // 准备
      await confirmManager.initialize();
      
      // 执行
      const healthStatus = await confirmManager.healthCheck();
      
      // 验证
      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.service.status).toBe('healthy');
    });
  });
  
  describe('shutdown', () => {
    test('应该成功关闭管理器', async () => {
      // 准备
      await confirmManager.initialize();
      expect(confirmManager.getStatus().initialized).toBe(true);
      
      // 执行
      await confirmManager.shutdown();
      
      // 验证
      expect(confirmManager.getStatus().initialized).toBe(false);
    });
  });
}); 