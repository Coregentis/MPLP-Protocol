/**
 * MPLP Plan模块 - 厂商中立适配器设计测试
 * 
 * @version v1.0.2
 * @created 2025-07-12T15:00:00+08:00
 * @updated 2025-07-15T18:00:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 单元测试规范
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 */

import { v4 as uuidv4 } from 'uuid';
import { FailureResolverManager, FailureResolverConfig } from '../failure-resolver';
import { PlanManager } from '../plan-manager';
import { PlanConfiguration, PlanTask, TaskStatus, RecoveryStrategy } from '../types';
import { MockTraceAdapter, MockTraceAdapterConfig } from './mock-trace-adapter';
import { FailureReport, RecoverySuggestion, AdapterType } from '../../../interfaces/trace-adapter.interface';

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

describe('厂商中立适配器设计测试', () => {
  // 测试数据和设置
  let failureResolver: FailureResolverManager;
  let planManager: PlanManager;
  let basicAdapter: MockTraceAdapter;
  let enhancedAdapter: MockTraceAdapter;
  let mockConfig: FailureResolverConfig;
  const mockUUID = '00000000-0000-0000-0000-000000000000';
  
  // 创建模拟任务
  const createMockTask = (override = {}): PlanTask => ({
    task_id: mockUUID,
    name: '测试任务',
    type: 'atomic',
    status: 'pending',
    priority: 'medium',
    ...override
  });
  
  beforeEach(() => {
    // 创建基础适配器和增强型适配器
    basicAdapter = new MockTraceAdapter({
      name: 'basic-adapter',
      version: '1.0.0',
      type: AdapterType.BASE,
      enhancedFeatures: false,
      simulateLatency: false,
      simulateErrors: false
    });
    
    enhancedAdapter = new MockTraceAdapter({
      name: 'enhanced-adapter',
      version: '1.0.1',
      type: AdapterType.ENHANCED,
      enhancedFeatures: true,
      simulateLatency: false,
      simulateErrors: false
    });
    
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
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    basicAdapter.clearCollectedData();
    enhancedAdapter.clearCollectedData();
  });
  
  describe('适配器设置和检测', () => {
    test('FailureResolverManager应接受任何实现ITraceAdapter的适配器', () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 验证适配器已设置
      expect((failureResolver as any).traceAdapter).toBe(basicAdapter);
      
      // 更换为增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 验证适配器已更新
      expect((failureResolver as any).traceAdapter).toBe(enhancedAdapter);
    });
    
    test('PlanManager应接受任何实现ITraceAdapter的适配器', () => {
      // 设置基础适配器
      planManager.setTraceAdapter(basicAdapter);
      
      // 验证适配器已设置
      expect((planManager as any).traceAdapter).toBe(basicAdapter);
      
      // 更换为增强型适配器
      planManager.setTraceAdapter(enhancedAdapter);
      
      // 验证适配器已更新
      expect((planManager as any).traceAdapter).toBe(enhancedAdapter);
    });
    
    test('应正确检测适配器类型并启用相应功能', () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 验证没有启用智能诊断
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeFalsy();
      
      // 更换为增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 验证已启用智能诊断
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeTruthy();
    });
    
    test('适配器应返回正确的类型和能力信息', () => {
      // 检查基础适配器信息
      const basicInfo = basicAdapter.getAdapterInfo();
      expect(basicInfo.type).toBe(AdapterType.BASE);
      expect(basicInfo.version).toBe('1.0.0');
      expect(basicInfo.capabilities).toContain('basic_tracing');
      expect(basicInfo.capabilities).not.toContain('development_issues');
      
      // 检查增强型适配器信息
      const enhancedInfo = enhancedAdapter.getAdapterInfo();
      expect(enhancedInfo.type).toBe(AdapterType.ENHANCED);
      expect(enhancedInfo.version).toBe('1.0.1');
      expect(enhancedInfo.capabilities).toContain('basic_tracing');
      expect(enhancedInfo.capabilities).toContain('development_issues');
      expect(enhancedInfo.capabilities).toContain('analytics');
    });
  });
  
  describe('故障同步', () => {
    test('应通过适配器同步故障信息', async () => {
      // 设置适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' });
      const errorMsg = 'Test error message';
      
      // 模拟内部方法以避免实际执行恢复策略
      jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready',
        execution_time_ms: 10
      });
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证故障已同步到适配器
      const failureReports = basicAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBe(1);
      expect(failureReports[0].failure_id).toBeDefined();
      expect(failureReports[0].task_id).toBe(mockUUID);
      expect(failureReports[0].plan_id).toBe(mockUUID);
      expect(failureReports[0].failure_details).toHaveProperty('error_message', errorMsg);
    });
  });
  
  describe('恢复建议', () => {
    test('应从增强型适配器获取恢复建议', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加模拟恢复建议
      const mockSuggestion: RecoverySuggestion = {
        suggestion_id: 'sugg-1',
        failure_id: mockUUID,
        suggestion: 'Try increasing timeout value',
        confidence_score: 0.85,
        estimated_effort: 'low'
      };
      enhancedAdapter.addRecoverySuggestion(mockUUID, mockSuggestion);
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证建议
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toBe('Try increasing timeout value');
    });
    
    test('基础适配器应返回空恢复建议', async () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证返回空数组
      expect(suggestions).toHaveLength(0);
    });
  });
  
  describe('开发问题检测', () => {
    test('应从增强型适配器获取开发问题', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加模拟开发问题
      enhancedAdapter.addDevelopmentIssue({
        id: 'issue-1',
        type: 'performance',
        severity: 'medium',
        title: 'Inefficient database query',
        file_path: 'src/modules/plan/plan-manager.ts'
      });
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证问题
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].title).toBe('Inefficient database query');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    test('基础适配器应返回空开发问题', async () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证返回空数组
      expect(result.issues).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });
}); 