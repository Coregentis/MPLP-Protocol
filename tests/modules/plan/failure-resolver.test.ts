/**
 * MPLP Plan模块故障解决器测试
 * 
 * @version v1.0.1
 * @created 2025-07-11T23:59:23Z
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 */

import { FailureResolverManager, FailureResolverConfig, FailureRecoveryResult } from '@/modules/plan/failure-resolver';
import { FailureResolver, PlanTask, TaskStatus, UUID } from '@/modules/plan/types';
import { createDefaultFailureResolver } from '@/modules/plan/utils';

describe('FailureResolverManager', () => {
  let failureResolver: FailureResolverManager;
  let mockNotificationHandler: jest.Mock;
  let mockManualInterventionHandler: jest.Mock;
  let mockPerformanceMonitor: jest.Mock;
  let config: FailureResolverConfig;
  
  // 测试用的任务对象
  const mockPlanId = 'plan-123' as UUID;
  const mockTaskId = 'task-456' as UUID;
  const mockTask: PlanTask = {
    task_id: mockTaskId,
    name: '测试任务',
    description: '用于测试故障解决器的任务',
    type: 'atomic',
    status: 'running',
    priority: 'medium',
    metadata: {
      retry_count: 0,
      max_retry_count: 3
    }
  };
  
  beforeEach(() => {
    // 创建mock函数
    mockNotificationHandler = jest.fn().mockResolvedValue(undefined);
    mockManualInterventionHandler = jest.fn().mockResolvedValue(true);
    mockPerformanceMonitor = jest.fn();
    
    // 创建配置
    config = {
      default_resolver: createDefaultFailureResolver(),
      notification_handler: mockNotificationHandler,
      manual_intervention_handler: mockManualInterventionHandler,
      performance_monitor: mockPerformanceMonitor
    };
    
    // 创建故障解决器实例
    failureResolver = new FailureResolverManager(config);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('handleTaskFailure', () => {
    it('应该在解决器禁用时返回失败', async () => {
      // 创建禁用的解决器配置
      const disabledConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          enabled: false
        },
        notification_handler: mockNotificationHandler
      };
      
      const disabledResolver = new FailureResolverManager(disabledConfig);
      
      // 处理任务失败
      const result = await disabledResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(false);
      expect(result.strategy_used).toBe('manual_intervention');
      expect(result.new_status).toBe('failed');
      expect(result.error_message).toContain('disabled');
    });
    
    it('应该应用重试策略', async () => {
      // 创建只有重试策略的解决器
      const retryConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['retry']
        }
      };
      
      const retryResolver = new FailureResolverManager(retryConfig);
      
      // 监听重试事件
      const eventHandler = jest.fn();
      retryResolver.on('task_retry_scheduled', eventHandler);
      
      // 处理任务失败
      const result = await retryResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('retry');
      expect(result.new_status).toBe('ready');
      expect(result.retry_count).toBe(1);
      
      // 验证事件
      expect(eventHandler).toHaveBeenCalled();
      const eventData = eventHandler.mock.calls[0][0];
      expect(eventData.event_type).toBe('task_retry_scheduled');
      expect(eventData.task_id).toBe(mockTaskId);
      expect(eventData.plan_id).toBe(mockPlanId);
    });
    
    it('应该在超过最大重试次数时失败', async () => {
      // 创建任务对象，已经重试3次
      const maxRetriedTask: PlanTask = {
        ...mockTask,
        metadata: {
          retry_count: 3,
          max_retry_count: 3
        }
      };
      
      // 创建只有重试策略的解决器
      const retryConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['retry'],
          retry_config: {
            max_attempts: 3,
            delay_ms: 1000,
            backoff_factor: 2,
            max_delay_ms: 30000
          }
        }
      };
      
      const retryResolver = new FailureResolverManager(retryConfig);
      
      // 处理任务失败
      const result = await retryResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        maxRetriedTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(false);
      expect(result.strategy_used).toBe('retry');
      expect(result.error_message).toContain('Maximum retry attempts');
    });
    
    it('应该应用跳过策略', async () => {
      // 创建只有跳过策略的解决器
      const skipConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['skip']
        }
      };
      
      const skipResolver = new FailureResolverManager(skipConfig);
      
      // 监听跳过事件
      const eventHandler = jest.fn();
      skipResolver.on('task_skipped', eventHandler);
      
      // 处理任务失败
      const result = await skipResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('skip');
      expect(result.new_status).toBe('skipped');
      
      // 验证事件
      expect(eventHandler).toHaveBeenCalled();
      const eventData = eventHandler.mock.calls[0][0];
      expect(eventData.event_type).toBe('task_skipped');
      expect(eventData.task_id).toBe(mockTaskId);
    });
    
    it('应该应用人工干预策略', async () => {
      // 创建只有人工干预策略的解决器
      const interventionConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['manual_intervention']
        },
        manual_intervention_handler: mockManualInterventionHandler
      };
      
      const interventionResolver = new FailureResolverManager(interventionConfig);
      
      // 监听干预请求事件
      const eventHandler = jest.fn();
      interventionResolver.on('manual_intervention_requested', eventHandler);
      
      // 处理任务失败
      const result = await interventionResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('manual_intervention');
      expect(result.new_status).toBe('ready');
      
      // 验证事件
      expect(eventHandler).toHaveBeenCalled();
      const eventData = eventHandler.mock.calls[0][0];
      expect(eventData.event_type).toBe('manual_intervention_requested');
      expect(eventData.task_id).toBe(mockTaskId);
      
      // 验证干预处理器被调用
      expect(mockManualInterventionHandler).toHaveBeenCalledWith(
        mockTaskId,
        mockPlanId,
        '任务执行失败'
      );
    });
    
    it('应该在没有干预处理器时请求干预', async () => {
      // 创建只有人工干预策略的解决器，但没有处理器
      const interventionConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['manual_intervention']
        }
      };
      
      const interventionResolver = new FailureResolverManager(interventionConfig);
      
      // 处理任务失败
      const result = await interventionResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(false);
      expect(result.strategy_used).toBe('manual_intervention');
      expect(result.intervention_required).toBe(true);
      expect(result.error_message).toContain('no handler configured');
    });
    
    it('应该尝试多个策略直到成功', async () => {
      // 创建多策略解决器，第一个策略会失败
      const multiStrategyConfig: FailureResolverConfig = {
        default_resolver: {
          ...createDefaultFailureResolver(),
          strategies: ['rollback', 'skip'] // rollback会失败，skip会成功
        }
      };
      
      const multiStrategyResolver = new FailureResolverManager(multiStrategyConfig);
      
      // 监听跳过事件
      const skipEventHandler = jest.fn();
      multiStrategyResolver.on('task_skipped', skipEventHandler);
      
      // 处理任务失败
      const result = await multiStrategyResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败'
      );
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('skip');
      expect(result.new_status).toBe('skipped');
      
      // 验证跳过事件被触发
      expect(skipEventHandler).toHaveBeenCalled();
    });
  });
  
  describe('provideManualIntervention', () => {
    it('应该处理批准的干预响应', async () => {
      // 模拟一个待处理的干预请求
      await failureResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败',
        { strategies: ['manual_intervention'] }
      );
      
      // 监听干预响应事件
      const eventHandler = jest.fn();
      failureResolver.on('manual_intervention_received', eventHandler);
      
      // 提供干预响应
      const result = await failureResolver.provideManualIntervention(
        mockTaskId,
        true, // 批准
        'retry'
      );
      
      // 验证结果
      expect(result).toBe(true);
      
      // 验证事件
      expect(eventHandler).toHaveBeenCalled();
      const eventData = eventHandler.mock.calls[0][0];
      expect(eventData.event_type).toBe('manual_intervention_received');
      expect(eventData.task_id).toBe(mockTaskId);
      expect(eventData.data.approved).toBe(true);
      expect(eventData.data.resolution).toBe('retry');
    });
    
    it('应该处理拒绝的干预响应', async () => {
      // 模拟一个待处理的干预请求
      await failureResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败',
        { strategies: ['manual_intervention'] }
      );
      
      // 监听干预响应事件
      const eventHandler = jest.fn();
      failureResolver.on('manual_intervention_received', eventHandler);
      
      // 提供干预响应
      const result = await failureResolver.provideManualIntervention(
        mockTaskId,
        false, // 拒绝
        'skip'
      );
      
      // 验证结果
      expect(result).toBe(true);
      
      // 验证事件
      expect(eventHandler).toHaveBeenCalled();
      const eventData = eventHandler.mock.calls[0][0];
      expect(eventData.event_type).toBe('manual_intervention_received');
      expect(eventData.task_id).toBe(mockTaskId);
      expect(eventData.data.approved).toBe(false);
      expect(eventData.data.resolution).toBe('skip');
    });
    
    it('应该处理不存在的干预请求', async () => {
      // 提供干预响应，但没有待处理的请求
      const result = await failureResolver.provideManualIntervention(
        'non-existent-task' as UUID,
        true,
        'retry'
      );
      
      // 验证结果
      expect(result).toBe(false);
    });
  });
  
  describe('sendNotification', () => {
    it('应该调用通知处理器', async () => {
      // 发送通知
      await failureResolver.sendNotification(
        'console',
        '测试通知',
        { test: true }
      );
      
      // 验证通知处理器被调用
      expect(mockNotificationHandler).toHaveBeenCalledWith(
        'console',
        '测试通知',
        { test: true }
      );
    });
    
    it('应该处理没有通知处理器的情况', async () => {
      // 创建没有通知处理器的解决器
      const noHandlerConfig: FailureResolverConfig = {
        default_resolver: createDefaultFailureResolver()
      };
      
      const noHandlerResolver = new FailureResolverManager(noHandlerConfig);
      
      // 发送通知不应该抛出错误
      await expect(
        noHandlerResolver.sendNotification('console', '测试通知', { test: true })
      ).resolves.not.toThrow();
    });
  });
  
  describe('统计和管理功能', () => {
    it('应该重置重试计数器', async () => {
      // 先进行一次失败处理，增加重试计数
      await failureResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败',
        { strategies: ['retry'] }
      );
      
      // 验证重试计数增加
      expect(failureResolver.getRetryCount(mockTaskId)).toBe(1);
      
      // 重置重试计数器
      failureResolver.resetRetryCounter(mockTaskId);
      
      // 验证重试计数被重置
      expect(failureResolver.getRetryCount(mockTaskId)).toBe(0);
    });
    
    it('应该获取待处理的干预请求', async () => {
      // 创建一个干预请求
      await failureResolver.handleTaskFailure(
        mockPlanId,
        mockTaskId,
        mockTask,
        '任务执行失败',
        { strategies: ['manual_intervention'] }
      );
      
      // 获取待处理的干预请求
      const pendingInterventions = failureResolver.getPendingInterventions();
      
      // 验证待处理的干预请求
      expect(pendingInterventions.size).toBe(1);
      expect(pendingInterventions.has(mockTaskId)).toBe(true);
      
      const intervention = pendingInterventions.get(mockTaskId);
      expect(intervention?.planId).toBe(mockPlanId);
      expect(intervention?.reason).toBe('任务执行失败');
    });
  });
}); 