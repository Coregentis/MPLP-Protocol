/**
 * MPLP Plan模块 - 故障解决器测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T12:00:00+08:00
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/test-style.mdc - 单元测试
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import { 
  MPLPTraceData,
  TraceType, 
  TraceStatus
} from '@/types/trace';
import {
  PlanTask,
  TaskStatus,
  RecoveryStrategy
} from '../types';
import { FailureResolverManager, FailureResolverConfig } from '../failure-resolver';

// 模拟依赖
jest.mock('@/utils/logger');
jest.mock('@/utils/performance');
jest.mock('uuid');

describe('FailureResolverManager', () => {
  // 测试数据和设置
  const mockUUID = '12345678-1234-4321-abcd-1234567890ab';
  let failureResolver: FailureResolverManager;
  let mockConfig: FailureResolverConfig;
  
  // 模拟task数据
  const createMockTask = (override = {}): PlanTask => ({
    task_id: mockUUID,
    name: '测试任务',
    type: 'atomic',
    status: 'pending',
    priority: 'medium',
    ...override
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    // 模拟UUID生成
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
    
    // 设置基础配置
    mockConfig = {
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
        retry_config: {
          max_attempts: 3,
          delay_ms: 100,
          backoff_factor: 2,
          max_delay_ms: 5000
        },
        rollback_config: {
          enabled: true,
          checkpoint_frequency: 5,
          max_rollback_depth: 10
        },
        manual_intervention_config: {
          timeout_ms: 30000,
          escalation_levels: ['developer', 'team_lead', 'manager'],
          approval_required: true
        },
        notification_channels: ['email', 'slack'],
        performance_thresholds: {
          max_execution_time_ms: 5000,
          max_memory_usage_mb: 512,
          max_cpu_usage_percent: 80
        }
      },
      notification_handler: jest.fn(),
      manual_intervention_handler: jest.fn(),
      performance_monitor: jest.fn()
    };
    
    // 创建测试实例
    failureResolver = new FailureResolverManager(mockConfig);
  });
  
  describe('初始化', () => {
    test('应该正确初始化FailureResolverManager', () => {
      expect(failureResolver).toBeDefined();
      expect(Logger).toHaveBeenCalled();
    });
    
    test('当解决器禁用时，handleTaskFailure应返回失败', async () => {
      const disabledConfig = {
        ...mockConfig,
        default_resolver: {
          ...mockConfig.default_resolver,
          enabled: false
        }
      };
      
      const disabledResolver = new FailureResolverManager(disabledConfig);
      const mockTask = createMockTask();
      
      const result = await disabledResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        'Test error'
      );
      
      expect(result.success).toBe(false);
      expect(result.strategy_used).toBe('manual_intervention');
    });
  });
  
  describe('恢复策略：重试', () => {
    test('应该成功应用重试策略', async () => {
      // 设置配置只启用重试策略
      mockConfig.default_resolver.strategies = ['retry'];
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 监听事件
      const eventHandler = jest.fn();
      failureResolver.on('task_retry_scheduled', eventHandler);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 替换内部方法
      const applyRetrySpy = jest.spyOn(failureResolver as any, 'applyRetryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready',
        retry_count: 1
      });
      
      const result = await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('retry');
      expect(result.retry_count).toBe(1);
      expect(applyRetrySpy).toHaveBeenCalledWith(
        expect.anything(),
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg,
        expect.anything(),
        undefined
      );
      expect(eventHandler).toHaveBeenCalled();
    });
    
    test('超过最大重试次数时应该失败', async () => {
      // 设置最大重试次数为1
      mockConfig.default_resolver.retry_config!.max_attempts = 1;
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 模拟已经有一次重试记录
      (failureResolver as any).taskRetryCounters.set(mockUUID, 1);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 模拟应用重试策略
      const applyRetrySpy = jest.spyOn(failureResolver as any, 'applyRetryStrategy');
      const applyNextStrategySpy = jest.spyOn(failureResolver as any, 'applyRollbackStrategy').mockResolvedValue({
        success: false,
        strategy_used: 'rollback',
        error_message: 'Rollback failed'
      });
      
      const result = await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      // 应该跳过重试，尝试下一个策略（回滚）
      expect(applyRetrySpy).not.toHaveBeenCalled();
      expect(applyNextStrategySpy).toHaveBeenCalled();
    });
  });
  
  describe('恢复策略：回滚', () => {
    test('应该成功应用回滚策略', async () => {
      // 设置配置只启用回滚策略
      mockConfig.default_resolver.strategies = ['rollback'];
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 监听事件
      const eventHandler = jest.fn();
      failureResolver.on('task_rollback_started', eventHandler);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 替换内部方法
      const applyRollbackSpy = jest.spyOn(failureResolver as any, 'applyRollbackStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'rollback',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready'
      });
      
      const result = await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('rollback');
      expect(applyRollbackSpy).toHaveBeenCalledWith(
        expect.anything(),
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg,
        expect.anything(),
        undefined
      );
      expect(eventHandler).toHaveBeenCalled();
    });
  });
  
  describe('恢复策略：跳过', () => {
    test('应该成功应用跳过策略', async () => {
      // 设置配置只启用跳过策略
      mockConfig.default_resolver.strategies = ['skip'];
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 监听事件
      const eventHandler = jest.fn();
      failureResolver.on('task_skipped', eventHandler);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 替换内部方法
      const applySkipSpy = jest.spyOn(failureResolver as any, 'applySkipStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'skip',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'skipped'
      });
      
      const result = await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('skip');
      expect(applySkipSpy).toHaveBeenCalledWith(
        expect.anything(),
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg,
        expect.anything(),
        undefined
      );
      expect(eventHandler).toHaveBeenCalled();
    });
  });
  
  describe('恢复策略：人工干预', () => {
    test('应该正确请求人工干预', async () => {
      // 设置配置只启用人工干预策略
      mockConfig.default_resolver.strategies = ['manual_intervention'];
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 监听事件
      const eventHandler = jest.fn();
      failureResolver.on('manual_intervention_requested', eventHandler);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 替换内部方法
      const applyManualSpy = jest.spyOn(failureResolver as any, 'applyManualInterventionStrategy').mockResolvedValue({
        success: false,
        strategy_used: 'manual_intervention',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'failed',
        intervention_required: true,
        error_message: 'Waiting for manual intervention'
      });
      
      const result = await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      expect(result.success).toBe(false);
      expect(result.intervention_required).toBe(true);
      expect(result.strategy_used).toBe('manual_intervention');
      expect(applyManualSpy).toHaveBeenCalledWith(
        expect.anything(),
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg,
        expect.anything(),
        undefined
      );
      expect(eventHandler).toHaveBeenCalled();
    });
  });
  
  describe('智能诊断', () => {
    test('启用智能诊断时应该进行故障诊断', async () => {
      // 设置智能诊断配置
      mockConfig.default_resolver.intelligent_diagnostics = {
        enabled: true,
        min_confidence_score: 0.7,
        analysis_depth: 'comprehensive',
        pattern_recognition: true,
        historical_analysis: true,
        max_related_failures: 5
      };
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Test error';
      
      // 替换内部方法
      const diagnoseSpy = jest.spyOn(failureResolver as any, 'diagnoseFaiure').mockResolvedValue({
        diagnostic_id: mockUUID,
        failure_type: 'resource_exhaustion',
        root_cause: 'memory_limit_exceeded',
        suggested_strategies: ['retry', 'skip'],
        confidence_score: 0.8,
        analysis_time_ms: 50
      });
      
      const applyRetrySpy = jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready'
      });
      
      await failureResolver.handleTaskFailure(
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg
      );
      
      expect(diagnoseSpy).toHaveBeenCalled();
      expect(applyRetrySpy).toHaveBeenCalledWith(
        'retry',
        mockUUID,
        mockUUID,
        mockTask,
        errorMsg,
        expect.anything(),
        expect.anything()
      );
    });
  });
}); 