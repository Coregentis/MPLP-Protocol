/**
 * MPLP Plan模块 - 故障预防与自学习恢复测试
 * 
 * @version v1.0.1
 * @created 2025-07-11T14:30:00+08:00
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 */

import { v4 as uuidv4 } from 'uuid';
import { PlanManager } from '../plan-manager';
import { FailureResolverManager } from '../failure-resolver';
import { PlanConfiguration, PlanTask, RecoveryStrategy, ProactiveFailurePrevention, SelfLearningRecovery } from '../types';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';

// 模拟依赖
jest.mock('uuid');
jest.mock('@/utils/logger');
jest.mock('@/utils/performance');
jest.mock('@/mcp/vendor-integration-adapter');
jest.mock('../failure-resolver');

describe('故障预防与自学习恢复测试', () => {
  // 测试数据
  const mockUuid = '12345678-1234-1234-1234-123456789012';
  const mockConfig: PlanConfiguration = {
    auto_scheduling_enabled: true,
    dependency_validation_enabled: true,
    risk_monitoring_enabled: true,
    failure_recovery_enabled: true,
    performance_tracking_enabled: true,
    notification_settings: {
      enabled: true,
      channels: ['console', 'vendor_system'],
      events: ['task_failure', 'task_recovery']
    },
    optimization_settings: {
      enabled: true,
      strategy: 'balanced',
      auto_reoptimize: false
    },
    timeout_settings: {
      default_task_timeout_ms: 30000,
      plan_execution_timeout_ms: 3600000,
      dependency_resolution_timeout_ms: 10000
    },
    parallel_execution_limit: 5
  };

  // 模拟任务
  const mockTask: PlanTask = {
    task_id: mockUuid,
    name: '测试任务',
    description: '用于测试故障预防和恢复的任务',
    type: 'atomic',
    status: 'pending',
    priority: 'medium',
    plan_id: mockUuid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    progress_percentage: 0,
    metadata: {
      tags: ['test'],
      category: 'test',
      complexity_score: 3
    }
  };

  // 模拟计划
  const mockPlan = {
    plan_id: mockUuid,
    context_id: mockUuid,
    name: '测试计划',
    status: 'active',
    failure_resolver: {
      enabled: true,
      strategies: ['retry', 'skip', 'manual_intervention'],
      proactive_prevention: {
        enabled: true,
        prediction_confidence_threshold: 0.7,
        auto_prevention_enabled: true,
        prevention_strategies: ['resource_scaling', 'dependency_prefetch'],
        monitoring_interval_ms: 5000
      },
      self_learning: {
        enabled: true,
        learning_mode: 'passive',
        min_samples_required: 5,
        adaptation_rate: 0.2,
        strategy_effectiveness_metrics: ['success_rate', 'recovery_time']
      }
    }
  };

  let planManager: PlanManager;
  let mockFailureResolver: jest.Mocked<FailureResolverManager>;

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
    
    // 创建模拟的FailureResolverManager
    mockFailureResolver = new FailureResolverManager({} as any) as jest.Mocked<FailureResolverManager>;
    
    // 创建PlanManager实例
    planManager = new PlanManager(mockConfig);
  });

  describe('主动故障预防功能测试', () => {
    test('应成功执行主动故障预防', async () => {
      // 模拟预防结果
      const mockPreventionResult = {
        potential_failures: ['resource_constraint', 'dependency_complexity'],
        prevention_actions: ['preallocate_resources', 'optimize_dependency_order'],
        confidence_score: 0.85,
        execution_time_ms: 45
      };
      
      // 设置模拟
      jest.spyOn(planManager as any, 'tasks').mockReturnValue(new Map([[mockUuid, mockTask]]));
      jest.spyOn(planManager as any, 'plans').mockReturnValue(new Map([[mockUuid, mockPlan]]));
      jest.spyOn(planManager as any, 'failureResolver').mockReturnValue(mockFailureResolver);
      mockFailureResolver.preventPotentialFailure = jest.fn().mockResolvedValue(mockPreventionResult);
      jest.spyOn(planManager as any, 'syncToExternalSystem').mockImplementation(() => Promise.resolve());
      
      // 执行测试
      const result = await planManager.preventTaskFailure(mockUuid);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        potential_failures: mockPreventionResult.potential_failures,
        prevention_actions: mockPreventionResult.prevention_actions,
        confidence_score: mockPreventionResult.confidence_score
      });
      
      // 验证方法调用
      expect(mockFailureResolver.preventPotentialFailure).toHaveBeenCalledWith(
        mockUuid,
        mockUuid,
        expect.any(Object),
        expect.objectContaining({
          enabled: true,
          prediction_confidence_threshold: 0.7
        })
      );
    });

    test('无潜在故障时应返回空结果', async () => {
      // 模拟预防结果 - 无故障
      const mockPreventionResult = {
        potential_failures: [],
        prevention_actions: [],
        confidence_score: 0,
        execution_time_ms: 30
      };
      
      // 设置模拟
      jest.spyOn(planManager as any, 'tasks').mockReturnValue(new Map([[mockUuid, mockTask]]));
      jest.spyOn(planManager as any, 'plans').mockReturnValue(new Map([[mockUuid, mockPlan]]));
      jest.spyOn(planManager as any, 'failureResolver').mockReturnValue(mockFailureResolver);
      mockFailureResolver.preventPotentialFailure = jest.fn().mockResolvedValue(mockPreventionResult);
      
      // 执行测试
      const result = await planManager.preventTaskFailure(mockUuid);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.potential_failures).toHaveLength(0);
      expect(result.data?.prevention_actions).toHaveLength(0);
    });

    test('故障解决器未启用时应返回空结果', async () => {
      // 设置模拟
      jest.spyOn(planManager as any, 'tasks').mockReturnValue(new Map([[mockUuid, mockTask]]));
      jest.spyOn(planManager as any, 'plans').mockReturnValue(new Map([[mockUuid, mockPlan]]));
      jest.spyOn(planManager as any, 'failureResolver').mockReturnValue(mockFailureResolver);
      jest.spyOn(planManager as any, 'config').mockReturnValue({
        ...mockConfig,
        failure_recovery_enabled: false
      });
      
      // 执行测试
      const result = await planManager.preventTaskFailure(mockUuid);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data?.potential_failures).toHaveLength(0);
      expect(mockFailureResolver.preventPotentialFailure).not.toHaveBeenCalled();
    });
  });

  describe('自学习恢复机制测试', () => {
    test('应成功优化故障恢复策略', async () => {
      // 模拟学习结果
      const mockLearningResult = {
        recommended_strategies: ['skip', 'retry', 'manual_intervention'] as RecoveryStrategy[],
        confidence_scores: { 'skip': 0.9, 'retry': 0.7, 'manual_intervention': 0.5 },
        adaptation_applied: true,
        execution_time_ms: 85
      };
      
      // 设置模拟
      jest.spyOn(planManager as any, 'tasks').mockReturnValue(new Map([[mockUuid, mockTask]]));
      jest.spyOn(planManager as any, 'plans').mockReturnValue(new Map([[mockUuid, mockPlan]]));
      jest.spyOn(planManager as any, 'failureResolver').mockReturnValue(mockFailureResolver);
      mockFailureResolver.learnAndOptimizeRecovery = jest.fn().mockResolvedValue(mockLearningResult);
      jest.spyOn(planManager as any, 'syncToExternalSystem').mockImplementation(() => Promise.resolve());
      
      // 执行测试
      const result = await planManager.optimizeFailureRecoveryStrategies(mockUuid);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        recommended_strategies: mockLearningResult.recommended_strategies,
        confidence_scores: mockLearningResult.confidence_scores,
        adaptation_applied: mockLearningResult.adaptation_applied
      });
      
      // 验证方法调用
      expect(mockFailureResolver.learnAndOptimizeRecovery).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(String),
        expect.objectContaining({
          enabled: true,
          learning_mode: 'passive'
        })
      );
    });

    test('应成功启用主动故障预防', async () => {
      // 准备测试数据
      const preventionConfig: Partial<ProactiveFailurePrevention> = {
        enabled: true,
        auto_prevention_enabled: true,
        prediction_confidence_threshold: 0.8,
        prevention_strategies: ['early_checkpoint', 'load_balancing']
      };
      
      // 设置模拟
      const mockPlanMap = new Map([[mockUuid, { ...mockPlan }]]);
      jest.spyOn(planManager as any, 'plans').mockReturnValue(mockPlanMap);
      jest.spyOn(planManager as any, 'syncToExternalSystem').mockImplementation(() => Promise.resolve());
      
      // 执行测试
      const result = await planManager.enableProactiveFailurePrevention(mockUuid, preventionConfig);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ enabled: true, applied_config: expect.any(Object) });
      
      // 验证计划更新
      const updatedPlan = mockPlanMap.get(mockUuid);
      expect(updatedPlan?.failure_resolver.proactive_prevention).toEqual({
        ...mockPlan.failure_resolver.proactive_prevention,
        ...preventionConfig
      });
    });
  });
  
  describe('自学习策略配置测试', () => {
    test('应成功配置自学习恢复策略', async () => {
      // 准备测试数据
      const learningConfig: Partial<SelfLearningRecovery> = {
        enabled: true,
        learning_mode: 'active',
        min_samples_required: 10,
        adaptation_rate: 0.3
      };
      
      // 设置模拟
      const mockPlanMap = new Map([[mockUuid, { ...mockPlan }]]);
      jest.spyOn(planManager as any, 'plans').mockReturnValue(mockPlanMap);
      jest.spyOn(planManager as any, 'syncToExternalSystem').mockImplementation(() => Promise.resolve());
      
      // 执行测试
      const result = await planManager.enableSelfLearningRecovery(mockUuid, learningConfig);
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ enabled: true, applied_config: expect.any(Object) });
      
      // 验证计划更新
      const updatedPlan = mockPlanMap.get(mockUuid);
      expect(updatedPlan?.failure_resolver.self_learning).toEqual({
        ...mockPlan.failure_resolver.self_learning,
        ...learningConfig
      });
    });
    
    test('禁用自学习时应清除相关配置', async () => {
      // 准备测试数据
      const learningConfig: Partial<SelfLearningRecovery> = {
        enabled: false
      };
      
      // 设置模拟
      const mockPlanMap = new Map([[mockUuid, { ...mockPlan }]]);
      jest.spyOn(planManager as any, 'plans').mockReturnValue(mockPlanMap);
      jest.spyOn(planManager as any, 'syncToExternalSystem').mockImplementation(() => Promise.resolve());
      
      // 执行测试
      const result = await planManager.enableSelfLearningRecovery(mockUuid, learningConfig);
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ enabled: false });
      
      // 验证计划更新
      const updatedPlan = mockPlanMap.get(mockUuid);
      expect(updatedPlan?.failure_resolver.self_learning.enabled).toBe(false);
    });
  });
}); 