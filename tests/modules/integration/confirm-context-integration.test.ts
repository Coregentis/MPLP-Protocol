/**
 * MPLP 集成测试 - Confirm和Context模块集成
 * 
 * @version v1.0.2
 * @updated 2025-07-12T16:40:00+08:00
 * @compliance 100% Schema合规性 - 基于confirm-protocol.json和context-protocol.json
 * @description 测试Confirm模块与Context模块的集成，验证跨模块数据流和功能协作
 */

import { expect } from '@jest/globals';
import { ConfirmManager } from '../../../src/modules/confirm/confirm-manager';
import { ContextManager } from '../../../src/modules/context/context-manager';
import { CreateContextRequest } from '../../../src/modules/context/types';
import { CreateConfirmRequest } from '../../../src/modules/confirm/types';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 注意：这是一个集成测试，我们不会模拟ConfirmService和ContextService
// 而是使用实际的服务实例，但我们会模拟它们的数据库和外部依赖

describe('Confirm-Context Integration', () => {
  let confirmManager: ConfirmManager;
  let contextManager: ContextManager;
  let testContextId: string;
  
  beforeAll(async () => {
    // 初始化管理器
    confirmManager = new ConfirmManager({ autoInitialize: true });
    contextManager = new ContextManager();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  beforeEach(async () => {
    // 创建测试上下文
    const contextRequest: CreateContextRequest = {
      name: 'Test Integration Context',
      description: 'Context for integration testing',
      initialState: {
        environment: 'test',
        integration_test: true
      }
    };
    
    const contextResult = await contextManager.createContext(contextRequest);
    expect(contextResult.success).toBe(true);
    expect(contextResult.data).toBeDefined();
    
    testContextId = contextResult.data!.context_id;
  });
  
  afterAll(async () => {
    // 关闭管理器
    await confirmManager.shutdown();
  });
  
  test('应该能够基于Context创建Confirmation', async () => {
    // 准备
    const confirmRequest: CreateConfirmRequest = {
      context_id: testContextId,
      confirmation_type: 'plan_approval',
      priority: 'medium',
      subject: {
        title: 'Integration Test Confirmation',
        description: 'This is a confirmation for integration testing',
        impact_assessment: {
          scope: 'project',
          business_impact: 'medium',
          technical_impact: 'low'
        }
      }
    };
    
    // 执行
    const result = await confirmManager.createConfirmation(confirmRequest);
    
    // 验证
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.context_id).toBe(testContextId);
    expect(result.data?.confirmation_type).toBe('plan_approval');
    
    // 验证上下文状态是否更新
    const contextResult = await contextManager.getContext(testContextId);
    expect(contextResult.success).toBe(true);
    expect(contextResult.data).toBeDefined();
    
    // 验证上下文中是否包含确认信息
    // 注意：这取决于实际实现，可能需要调整
    expect(contextResult.data?.shared_state).toBeDefined();
    const sharedState = contextResult.data?.shared_state as Record<string, any>;
    expect(sharedState.confirmations).toBeDefined();
    expect(Array.isArray(sharedState.confirmations)).toBe(true);
    expect(sharedState.confirmations.length).toBeGreaterThan(0);
    expect(sharedState.confirmations[0].confirm_id).toBe(result.data?.confirm_id);
  });
  
  test('应该在Context被删除时拒绝创建Confirmation', async () => {
    // 准备 - 删除上下文
    await contextManager.deleteContext(testContextId);
    
    // 准备确认请求
    const confirmRequest: CreateConfirmRequest = {
      context_id: testContextId,
      confirmation_type: 'plan_approval',
      priority: 'medium'
    };
    
    // 执行和验证
    await expect(confirmManager.createConfirmation(confirmRequest))
      .rejects.toThrow(/Context not found/);
  });
  
  test('应该能够在确认状态变更时更新Context', async () => {
    // 准备 - 创建确认
    const confirmRequest: CreateConfirmRequest = {
      context_id: testContextId,
      confirmation_type: 'plan_approval',
      priority: 'high'
    };
    
    const createResult = await confirmManager.createConfirmation(confirmRequest);
    expect(createResult.success).toBe(true);
    const confirmId = createResult.data!.confirm_id;
    
    // 执行 - 更新确认状态
    const updateResult = await confirmManager.updateConfirmation(confirmId, {
      status: 'approved'
    });
    
    // 验证 - 确认已更新
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.status).toBe('approved');
    
    // 验证 - 上下文状态已更新
    const contextResult = await contextManager.getContext(testContextId);
    expect(contextResult.success).toBe(true);
    
    // 验证上下文中的确认状态是否更新
    // 注意：这取决于实际实现，可能需要调整
    const sharedState = contextResult.data?.shared_state as Record<string, any>;
    const confirmations = sharedState.confirmations || [];
    const updatedConfirm = confirmations.find((c: any) => c.confirm_id === confirmId);
    expect(updatedConfirm).toBeDefined();
    expect(updatedConfirm.status).toBe('approved');
  });
}); 