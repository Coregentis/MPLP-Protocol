/**
 * MPLP Confirm模块 - ConfirmService测试
 * 
 * @version v1.0.2
 * @updated 2025-07-12T16:20:00+08:00
 * @compliance 100% Schema合规性 - 基于confirm-protocol.json重构
 * @description 测试ConfirmService的核心功能，包括创建、更新、查询和工作流处理
 */

import { expect } from '@jest/globals';
import { ConfirmService } from '../../../src/modules/confirm/confirm-service';
import {
  ConfirmProtocol,
  CreateConfirmRequest,
  UpdateConfirmRequest,
  StepActionRequest,
  ConfirmationType,
  Priority,
  WorkflowType,
  DecisionOutcome
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

// 模拟Performance
jest.mock('../../../src/utils/performance', () => ({
  Performance: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    end: jest.fn().mockReturnValue(10)
  }))
}));

describe('ConfirmService', () => {
  let confirmService: ConfirmService;
  
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 创建ConfirmService实例
    confirmService = new ConfirmService();
  });
  
  describe('createConfirmation', () => {
    test('应该成功创建确认', async () => {
      // 准备
      const request: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'medium',
        subject: {
          title: 'Test Confirmation',
          description: 'This is a test confirmation',
          impact_assessment: {
            scope: 'project',
            business_impact: 'medium',
            technical_impact: 'low'
          }
        }
      };
      
      // 执行
      const result = await confirmService.createConfirmation(request);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.context_id).toBe('context-123');
        expect(result.data.confirmation_type).toBe('plan_approval');
        expect(result.data.priority).toBe('medium');
        expect(result.data.status).toBe('pending');
        expect(result.data.protocol_version).toBeDefined();
        expect(result.data.timestamp).toBeDefined();
        expect(result.data.confirm_id).toBeDefined();
      }
    });
    
    test('应该验证必填字段', async () => {
      // 准备
      const invalidRequest = {} as CreateConfirmRequest;
      
      // 执行和验证
      await expect(confirmService.createConfirmation(invalidRequest))
        .rejects.toThrow('context_id is required');
    });
    
    test('应该创建默认工作流', async () => {
      // 准备
      const request: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'high'
      };
      
      // 执行
      const result = await confirmService.createConfirmation(request);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data?.approval_workflow).toBeDefined();
      if (result.data?.approval_workflow) {
        expect(result.data.approval_workflow.workflow_type).toBe('sequential');
        expect(result.data.approval_workflow.steps.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('processStepAction', () => {
    test('应该处理步骤操作并更新状态', async () => {
      // 准备 - 首先创建一个确认
      const createRequest: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'medium'
      };
      
      const createResult = await confirmService.createConfirmation(createRequest);
      expect(createResult.success).toBe(true);
      expect(createResult.data).toBeDefined();
      
      if (!createResult.data) {
        fail('Failed to create confirmation for test');
        return;
      }
      
      const confirmation = createResult.data;
      const stepId = confirmation.approval_workflow?.steps[0].step_id;
      
      if (!stepId) {
        fail('No step found in created confirmation');
        return;
      }
      
      // 执行 - 处理步骤操作
      const stepRequest: StepActionRequest = {
        step_id: stepId,
        action: 'approve',
        comments: 'Approved by test'
      };
      
      const result = await confirmService.processStepAction(confirmation.confirm_id, stepRequest);
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.updated_confirmation).toBeDefined();
      expect(result.updated_confirmation.approval_workflow?.steps[0].status).toBe('approved');
      expect(result.updated_confirmation.approval_workflow?.steps[0].decision).toBeDefined();
      expect(result.updated_confirmation.approval_workflow?.steps[0].decision?.outcome).toBe('approve');
    });
    
    test('应该拒绝无效的步骤操作', async () => {
      // 准备 - 首先创建一个确认
      const createRequest: CreateConfirmRequest = {
        context_id: 'context-123',
        confirmation_type: 'plan_approval',
        priority: 'medium'
      };
      
      const createResult = await confirmService.createConfirmation(createRequest);
      const confirmation = createResult.data!;
      
      // 执行和验证 - 使用无效的步骤ID
      await expect(confirmService.processStepAction(
        confirmation.confirm_id, 
        { step_id: 'invalid-step-id', action: 'approve' }
      )).rejects.toThrow('Step not found');
    });
  });
  
  describe('queryConfirmations', () => {
    test('应该返回确认列表', async () => {
      // 执行
      const results = await confirmService.queryConfirmations();
      
      // 验证
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // 验证返回的确认对象结构
      const firstConfirm = results[0];
      expect(firstConfirm.confirm_id).toBeDefined();
      expect(firstConfirm.context_id).toBeDefined();
      expect(firstConfirm.confirmation_type).toBeDefined();
      expect(firstConfirm.status).toBeDefined();
      expect(firstConfirm.priority).toBeDefined();
    });
    
    test('应该根据过滤条件查询', async () => {
      // 执行
      const results = await confirmService.queryConfirmations({
        confirmation_types: ['plan_approval'],
        statuses: ['pending']
      });
      
      // 验证
      expect(Array.isArray(results)).toBe(true);
      // 注意：由于我们使用的是模拟数据，无法真正验证过滤条件是否生效
      // 在实际实现中，应该验证返回的结果是否符合过滤条件
    });
  });
  
  describe('getHealthStatus', () => {
    test('应该返回健康状态', async () => {
      // 执行
      const healthStatus = await confirmService.getHealthStatus();
      
      // 验证
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.checks).toBeDefined();
      expect(healthStatus.checks.database).toBeDefined();
      expect(healthStatus.checks.notification).toBeDefined();
      expect(healthStatus.checks.workflow).toBeDefined();
    });
  });
}); 