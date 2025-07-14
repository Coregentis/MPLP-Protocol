/**
 * 失败解决器集成测试
 * 
 * @version v1.0.0
 * @created 2025-07-12T10:45:00+08:00
 * @compliance test-style.mdc - 集成测试规范
 */

import { v4 as uuidv4 } from 'uuid';
import { FailureResolverManager, FailureResolverConfig, FailureRecoveryResult } from '../failure-resolver';
import { PlanManager } from '../plan-manager';
import { PlanTask, PlanConfiguration, RecoveryStrategy, TaskStatus } from '../types';
import { ITraceAdapter } from '@/interfaces/trace-adapter.interface';

// 模拟UUID以确保测试一致性
jest.mock('uuid');
(uuidv4 as jest.Mock).mockReturnValue('00000000-0000-0000-0000-000000000000');

// 模拟日志以避免测试输出
jest.mock('@/utils/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}));

describe('FailureResolver集成测试', () => {
  let failureResolver: FailureResolverManager;
  let planManager: PlanManager;
  let mockConfig: FailureResolverConfig;
  let mockEnhancedAdapter: jest.Mocked<ITraceAdapter>;
  const mockUUID = '00000000-0000-0000-0000-000000000000';
  
  // 创建模拟任务
  const createMockTask = (override = {}): PlanTask => ({
    task_id: mockUUID,
    name: 'Test Task',
    description: 'Test Description',
    type: 'atomic',
    status: 'failed',
    priority: 'medium',
    ...override
  });
  
  beforeEach(() => {
    // 创建模拟增强型追踪适配器
    mockEnhancedAdapter = {
      getAdapterInfo: jest.fn().mockReturnValue({ type: 'enhanced-trace', version: '1.0.1' }),
      syncTraceData: jest.fn().mockResolvedValue({ success: true }),
      reportFailure: jest.fn().mockResolvedValue({ success: true }),
      checkHealth: jest.fn().mockResolvedValue({ status: 'healthy', last_check: new Date().toISOString(), metrics: { avg_latency_ms: 10, success_rate: 0.99, error_rate: 0.01 } }),
      syncBatch: jest.fn().mockResolvedValue({ success: true }),
      getAnalytics: jest.fn().mockResolvedValue({})
    } as unknown as jest.Mocked<ITraceAdapter>;
    
    // 创建模拟配置
    mockConfig = {
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'manual_intervention', 'skip'],
        retry_config: {
          max_attempts: 3,
          delay_ms: 1000,
          backoff_factor: 2,
          max_delay_ms: 10000
        },
        manual_intervention_config: {
          timeout_ms: 60000,
          escalation_levels: ['team_lead', 'manager'],
          approval_required: true
        },
        notification_channels: ['console', 'email'],
        performance_thresholds: {
          max_execution_time_ms: 100,
          max_memory_usage_mb: 50,
          max_cpu_usage_percent: 80
        },
        vendor_integration: {
      enabled: true,
          sync_frequency_ms: 5000,
      data_retention_days: 30,
      sync_detailed_diagnostics: true,
      receive_suggestions: true,
      auto_apply_suggestions: false
        }
      },
      notification_handler: jest.fn(),
      manual_intervention_handler: jest.fn().mockResolvedValue(true),
      performance_monitor: jest.fn()
    };
    
    // 创建失败解决器实例
    failureResolver = new FailureResolverManager(mockConfig);
    
    // 创建Plan Manager实例
    planManager = new PlanManager({
      auto_scheduling_enabled: true,
      dependency_validation_enabled: true,
      risk_monitoring_enabled: true,
      failure_recovery_enabled: true,
      performance_tracking_enabled: true,
      notification_settings: {
      enabled: true,
        channels: ['console'],
        events: ['task_failure', 'task_retry']
      },
      optimization_settings: {
        enabled: true,
        strategy: 'balanced',
        auto_reoptimize: true
      },
      timeout_settings: {
        default_task_timeout_ms: 30000,
        plan_execution_timeout_ms: 3600000,
        dependency_resolution_timeout_ms: 5000
      },
      parallel_execution_limit: 5
    } as PlanConfiguration);
    
    // 注入Mock适配器
    (planManager as any).traceAdapter = mockEnhancedAdapter;
  });
  
  describe('与增强型追踪适配器集成', () => {
    test('故障恢复过程应同步追踪数据到追踪适配器', async () => {
      // 模拟故障解决器的同步方法
      const syncSpy = jest.spyOn(failureResolver as any, 'syncFailureToVendor').mockResolvedValue({
        success: true,
        sync_id: mockUUID
      });
      
      // 创建测试任务
      const mockTask = createMockTask();
      const errorMsg = 'Test integration error';
      
      // 设置重试策略
      mockConfig.default_resolver.strategies = ['retry'];
      
      // 执行故障处理
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证追踪同步被调用
      expect(syncSpy).toHaveBeenCalled();
      expect(syncSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_id: mockUUID,
          task_id: mockUUID,
          error_message: errorMsg
        }),
        expect.any(Object)
      );
    });
    
    test('应从追踪适配器接收恢复建议并应用', async () => {
      // 开启自动应用建议
      mockConfig.default_resolver.vendor_integration!.auto_apply_suggestions = true;
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 模拟从追踪适配器接收建议的方法
      const receiveSuggestionsSpy = jest.spyOn(failureResolver as any, 'receiveVendorSuggestions').mockResolvedValue({
        has_suggestions: true,
        suggested_strategies: ['skip'],
        confidence_score: 0.9,
        suggestion_id: mockUUID
      });
      
      // 替换策略应用方法
      const applySkipSpy = jest.spyOn(failureResolver as any, 'applySkipStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'skip' as RecoveryStrategy,
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'skipped' as TaskStatus,
        execution_time_ms: 15
      } as FailureRecoveryResult);
      
      // 创建测试任务
      const mockTask = createMockTask();
      const errorMsg = 'Test suggestion error';
      
      // 执行故障处理
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证接收建议和应用建议的方法被调用
      expect(receiveSuggestionsSpy).toHaveBeenCalled();
      expect(applySkipSpy).toHaveBeenCalled();
    });
  });
  
  describe('与PlanManager集成', () => {
    test('PlanManager应正确调用FailureResolver处理任务失败', async () => {
      // 模拟Plan Manager中的updateTaskStatus方法
      const updateTaskSpy = jest.spyOn(planManager as any, 'updateTaskStatus');
      
      // 替换handleTaskFailure方法
      const handleFailureSpy = jest.spyOn(failureResolver, 'handleTaskFailure').mockResolvedValue({
        success: true,
        strategy_used: 'retry' as RecoveryStrategy,
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        retry_count: 1,
        execution_time_ms: 15
      } as FailureRecoveryResult);
      
      // 注入FailureResolver到PlanManager
      (planManager as any).failureResolver = failureResolver;
      
      // 创建测试任务
      const mockTask = createMockTask();
      
      // 通过PlanManager更新任务状态为失败
      await (planManager as any).handleTaskError(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        'Task execution failed in plan manager'
      );
      
      // 验证FailureResolver被调用
      expect(handleFailureSpy).toHaveBeenCalled();
    });
    
    test('故障恢复成功后应正确更新任务状态', async () => {
      // 创建成功的恢复结果
      const successfulRecovery: FailureRecoveryResult = {
        success: true,
        strategy_used: 'retry' as RecoveryStrategy,
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        retry_count: 1,
        execution_time_ms: 15
      };
      
      // 替换handleTaskFailure方法
      jest.spyOn(failureResolver, 'handleTaskFailure').mockResolvedValue(successfulRecovery);
      
      // 注入FailureResolver到PlanManager
      (planManager as any).failureResolver = failureResolver;
      
      // 模拟任务和错误
      const mockTask = createMockTask();
      const errorMsg = 'Task failed but recovered';
      
      // 模拟emitPlanEvent方法
      const emitEventSpy = jest.spyOn(planManager as any, 'emitPlanEvent');
      
      // 处理任务错误
      await (planManager as any).handleTaskError(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证事件是否正确发出
      expect(emitEventSpy).toHaveBeenCalledWith(
        'task_failure_resolved',
        mockUUID,
        expect.objectContaining({
          task_id: mockUUID,
          new_status: 'ready',
          strategy_used: 'retry'
        }),
        mockUUID
      );
    });
    });
    
  describe('完整的失败-恢复-追踪流程', () => {
    test('应执行完整的故障处理流程并同步到追踪适配器', async () => {
      // 设置智能诊断配置
      mockConfig.default_resolver.intelligent_diagnostics = {
          enabled: true,
        min_confidence_score: 0.7,
        analysis_depth: 'detailed',
        pattern_recognition: true,
        historical_analysis: true,
        max_related_failures: 5
      };
      
      // 重新创建实例
      failureResolver = new FailureResolverManager(mockConfig);
      
      // 注入适配器
      (failureResolver as any).traceAdapter = mockEnhancedAdapter;
      
      // 监听事件
      const eventHandler = jest.fn();
      failureResolver.on('recovery_completed', eventHandler);
      
      // 模拟诊断方法
      jest.spyOn(failureResolver as any, 'diagnoseFaiure').mockResolvedValue({
        diagnostic_id: mockUUID,
        failure_type: 'network_error',
        root_cause: 'connection_timeout',
        suggested_strategies: ['retry'],
        confidence_score: 0.85,
        analysis_time_ms: 45
      });
      
      // 模拟重试策略成功
      jest.spyOn(failureResolver as any, 'applyRetryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry' as RecoveryStrategy,
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        retry_count: 1,
        execution_time_ms: 15
      });
      
      // 创建测试任务
      const mockTask = createMockTask();
      const errorMsg = 'Connection timeout error';
      
      // 执行故障处理
      const result = await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.strategy_used).toBe('retry');
      expect(result.new_status).toBe('ready');
      
      // 验证事件被触发
      expect(eventHandler).toHaveBeenCalled();
      
      // 验证追踪同步
      expect(mockEnhancedAdapter.reportFailure).toHaveBeenCalled();
    });
  });
}); 