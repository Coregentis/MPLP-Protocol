/**
 * MPLP Plan模块 - 故障诊断和恢复建议功能测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T18:00:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 单元测试规范
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 */

import { v4 as uuidv4 } from 'uuid';
import { FailureResolverManager, FailureResolverConfig } from '../failure-resolver';
import { PlanTask, TaskStatus } from '../types';
import { ITraceAdapter, RecoverySuggestion, AdapterType } from '../../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../types/trace';

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

// 创建模拟适配器
class MockTraceAdapter implements ITraceAdapter {
  private isEnhanced: boolean;
  private recoverySuggestions: Map<string, RecoverySuggestion[]> = new Map();
  private developmentIssues: any[] = [];
  private traceData: MPLPTraceData[] = [];
  private failureReports: any[] = [];
  private eventHandlers: Record<string, Function[]> = {};
  
  constructor(isEnhanced: boolean = false) {
    this.isEnhanced = isEnhanced;
  }
  
  getAdapterInfo(): { type: AdapterType; version: string; capabilities?: string[] } {
    return {
      type: this.isEnhanced ? AdapterType.ENHANCED : AdapterType.BASE,
      version: this.isEnhanced ? '2.0.0' : '1.0.0',
      capabilities: this.isEnhanced ? 
        ['basic_tracing', 'failure_resolution', 'development_issues'] : 
        ['basic_tracing']
    };
  }
  
  async syncTraceData(traceData: MPLPTraceData): Promise<any> {
    this.traceData.push(traceData);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5,
      errors: []
    };
  }
  
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<any> {
    this.traceData.push(...traceBatch);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 10,
      errors: []
    };
  }
  
  async reportFailure(failure: any): Promise<any> {
    this.failureReports.push(failure);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 8,
      errors: []
    };
  }
  
  async checkHealth(): Promise<any> {
    return {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 5,
        success_rate: 1.0,
        error_rate: 0.0
      }
    };
  }
  
  // 增强型适配器方法
  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return this.recoverySuggestions.get(failureId) || [];
  }
  
  async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    if (!this.isEnhanced) {
      return {
        issues: [],
        confidence: 0
      };
    }
    
    return {
      issues: this.developmentIssues,
      confidence: 0.9
    };
  }
  
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return {
      total_traces: this.traceData.length,
      total_failures: this.failureReports.length,
      avg_latency_ms: 15,
      success_rate: 0.95
    };
  }
  
  // 事件处理
  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }
  
  // 测试辅助方法
  addRecoverySuggestion(failureId: string, suggestion: RecoverySuggestion): void {
    if (!this.recoverySuggestions.has(failureId)) {
      this.recoverySuggestions.set(failureId, []);
    }
    
    this.recoverySuggestions.get(failureId)!.push(suggestion);
  }
  
  addDevelopmentIssue(issue: any): void {
    this.developmentIssues.push(issue);
  }
  
  getCollectedTraceData(): MPLPTraceData[] {
    return this.traceData;
  }
  
  getCollectedFailureReports(): any[] {
    return this.failureReports;
  }
  
  clearCollectedData(): void {
    this.traceData = [];
    this.failureReports = [];
    this.recoverySuggestions.clear();
    this.developmentIssues = [];
  }
}

describe('故障诊断和恢复建议功能测试', () => {
  // 测试数据和设置
  let failureResolver: FailureResolverManager;
  let basicAdapter: MockTraceAdapter;
  let enhancedAdapter: MockTraceAdapter;
  let mockConfig: FailureResolverConfig;
  const mockUUID = '00000000-0000-0000-0000-000000000000';
  
  // 创建模拟任务
  const createMockTask = (override = {}): PlanTask => ({
    task_id: mockUUID,
    name: '测试任务',
    type: 'atomic',
    status: 'pending' as TaskStatus,
    priority: 'medium',
    ...override
  });
  
  beforeEach(() => {
    // 创建基础适配器和增强型适配器
    basicAdapter = new MockTraceAdapter(false);
    enhancedAdapter = new MockTraceAdapter(true);
    
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
        },
        intelligent_diagnostics: {
          enabled: true,
          min_confidence_score: 0.7,
          analysis_depth: 'detailed',
          pattern_recognition: true,
          historical_analysis: true,
          max_related_failures: 5
        },
        vendor_integration: {
          enabled: true,
          sync_frequency_ms: 5000,
          data_retention_days: 30,
          sync_detailed_diagnostics: true,
          receive_suggestions: true,
          auto_apply_suggestions: false
        },
        proactive_prevention: {
          enabled: true,
          prediction_confidence_threshold: 0.7,
          auto_prevention_enabled: true,
          prevention_strategies: ['resource_scaling', 'dependency_prefetch', 'task_reordering'],
          monitoring_interval_ms: 5000
        },
        self_learning: {
          enabled: true,
          learning_mode: 'hybrid',
          min_samples_required: 10,
          adaptation_rate: 0.5,
          strategy_effectiveness_metrics: ['success_rate', 'execution_time']
        }
      }
    };
    
    // 创建失败解决器实例
    failureResolver = new FailureResolverManager(mockConfig);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    basicAdapter.clearCollectedData();
    enhancedAdapter.clearCollectedData();
  });
  
  describe('适配器类型检测', () => {
    test('应正确检测基础适配器类型', () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 验证智能诊断未启用
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeFalsy();
    });
    
    test('应正确检测增强型适配器类型', () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 验证智能诊断已启用
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeTruthy();
    });
    
    test('适配器更新应正确更新智能诊断状态', () => {
      // 先设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeFalsy();
      
      // 更新为增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeTruthy();
      
      // 再次更新为基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      expect((failureResolver as any).intelligentDiagnosticsEnabled).toBeFalsy();
    });
  });
  
  describe('故障诊断功能', () => {
    test('应使用增强型适配器进行故障诊断', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 模拟内部方法以避免实际执行恢复策略
      jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        execution_time_ms: 10
      });
      
      // 添加模拟开发问题
      enhancedAdapter.addDevelopmentIssue({
        id: 'issue-1',
        type: 'performance',
        severity: 'medium',
        title: 'Database query optimization needed',
        file_path: 'src/modules/plan/plan-manager.ts'
      });
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证故障诊断功能被调用
      const failureReports = enhancedAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBe(1);
      expect(failureReports[0].failure_details).toHaveProperty('error_message', errorMsg);
      expect(failureReports[0].failure_details).toHaveProperty('diagnostics');
    });
    
    test('应在故障诊断中包含开发问题信息', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Database connection timeout';
      
      // 模拟内部方法以避免实际执行恢复策略
      jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        execution_time_ms: 10
      });
      
      // 添加相关的模拟开发问题
      enhancedAdapter.addDevelopmentIssue({
        id: 'issue-db-1',
        type: 'performance',
        severity: 'high',
        title: 'Database connection pool configuration issue',
        file_path: 'src/modules/database/connection.ts'
      });
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证故障报告包含开发问题信息
      const failureReports = enhancedAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBe(1);
      expect(failureReports[0].failure_details.diagnostics).toHaveProperty('related_issues');
      expect(failureReports[0].failure_details.diagnostics.related_issues.length).toBeGreaterThan(0);
      expect(failureReports[0].failure_details.diagnostics.related_issues[0].title).toContain('Database');
    });
    
    test('基础适配器应提供基本故障诊断', async () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 模拟内部方法以避免实际执行恢复策略
      jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        execution_time_ms: 10
      });
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      // 验证基本故障诊断
      const failureReports = basicAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBe(1);
      expect(failureReports[0].failure_details).toHaveProperty('error_message', errorMsg);
      // 基础适配器不应包含高级诊断信息
      expect(failureReports[0].failure_details).not.toHaveProperty('diagnostics.ai_analysis');
    });
  });
  
  describe('恢复建议功能', () => {
    test('应从增强型适配器获取恢复建议', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加模拟恢复建议
      const mockSuggestion: RecoverySuggestion = {
        suggestion_id: 'sugg-1',
        failure_id: mockUUID,
        suggestion: 'Increase database connection timeout',
        confidence_score: 0.85,
        estimated_effort: 'low'
      };
      enhancedAdapter.addRecoverySuggestion(mockUUID, mockSuggestion);
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证建议
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toBe('Increase database connection timeout');
    });
    
    test('应处理多个恢复建议', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加多个模拟恢复建议
      const mockSuggestions: RecoverySuggestion[] = [
        {
          suggestion_id: 'sugg-1',
          failure_id: mockUUID,
          suggestion: 'Increase database connection timeout',
          confidence_score: 0.85,
          estimated_effort: 'low'
        },
        {
          suggestion_id: 'sugg-2',
          failure_id: mockUUID,
          suggestion: 'Add retry logic for database operations',
          confidence_score: 0.75,
          estimated_effort: 'medium'
        },
        {
          suggestion_id: 'sugg-3',
          failure_id: mockUUID,
          suggestion: 'Implement circuit breaker pattern',
          confidence_score: 0.65,
          estimated_effort: 'high'
        }
      ];
      
      mockSuggestions.forEach(suggestion => {
        enhancedAdapter.addRecoverySuggestion(mockUUID, suggestion);
      });
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证建议
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Increase database connection timeout');
      expect(suggestions[1]).toBe('Add retry logic for database operations');
      expect(suggestions[2]).toBe('Implement circuit breaker pattern');
    });
    
    test('基础适配器应返回空恢复建议', async () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证返回空数组
      expect(suggestions).toHaveLength(0);
    });
    
    test('恢复建议应按置信度排序', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加多个模拟恢复建议（故意乱序）
      const mockSuggestions: RecoverySuggestion[] = [
        {
          suggestion_id: 'sugg-1',
          failure_id: mockUUID,
          suggestion: 'Medium confidence suggestion',
          confidence_score: 0.75,
          estimated_effort: 'medium'
        },
        {
          suggestion_id: 'sugg-2',
          failure_id: mockUUID,
          suggestion: 'Highest confidence suggestion',
          confidence_score: 0.95,
          estimated_effort: 'low'
        },
        {
          suggestion_id: 'sugg-3',
          failure_id: mockUUID,
          suggestion: 'Low confidence suggestion',
          confidence_score: 0.55,
          estimated_effort: 'high'
        }
      ];
      
      mockSuggestions.forEach(suggestion => {
        enhancedAdapter.addRecoverySuggestion(mockUUID, suggestion);
      });
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      // 验证建议按置信度排序
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Highest confidence suggestion');
      expect(suggestions[1]).toBe('Medium confidence suggestion');
      expect(suggestions[2]).toBe('Low confidence suggestion');
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
        title: 'Database query optimization needed',
        file_path: 'src/modules/plan/plan-manager.ts'
      });
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证问题
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('performance');
      expect(result.issues[0].title).toBe('Database query optimization needed');
      expect(result.issues[0].file_path).toBe('src/modules/plan/plan-manager.ts');
      expect(result.issues[0].severity).toBe('medium');
      expect(result.issues[0].id).toBe('issue-1');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    test('应处理多个开发问题', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加多个模拟开发问题
      const mockIssues = [
        {
          id: 'issue-1',
          type: 'performance',
          severity: 'medium',
          title: 'Database query optimization needed',
          file_path: 'src/modules/plan/plan-manager.ts'
        },
        {
          id: 'issue-2',
          type: 'security',
          severity: 'high',
          title: 'SQL injection vulnerability',
          file_path: 'src/modules/plan/plan-repository.ts'
        },
        {
          id: 'issue-3',
          type: 'reliability',
          severity: 'low',
          title: 'Missing error handling',
          file_path: 'src/modules/plan/plan-service.ts'
        }
      ];
      
      mockIssues.forEach(issue => {
        enhancedAdapter.addDevelopmentIssue(issue);
      });
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证问题
      expect(result.issues).toHaveLength(3);
      expect(result.issues[0].type).toBe('performance');
      expect(result.issues[1].type).toBe('security');
      expect(result.issues[2].type).toBe('reliability');
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    test('基础适配器应返回空开发问题列表', async () => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证返回空数组
      expect(result.issues).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
    
    test('开发问题应按严重程度排序', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加多个模拟开发问题（故意乱序）
      const mockIssues = [
        {
          id: 'issue-1',
          type: 'maintainability',
          severity: 'low',
          title: 'Code duplication',
          file_path: 'src/modules/plan/plan-utils.ts'
        },
        {
          id: 'issue-2',
          type: 'security',
          severity: 'critical',
          title: 'Authentication bypass vulnerability',
          file_path: 'src/modules/auth/auth-service.ts'
        },
        {
          id: 'issue-3',
          type: 'performance',
          severity: 'medium',
          title: 'Inefficient algorithm',
          file_path: 'src/modules/plan/plan-scheduler.ts'
        },
        {
          id: 'issue-4',
          type: 'reliability',
          severity: 'high',
          title: 'Race condition in concurrent operations',
          file_path: 'src/modules/plan/plan-executor.ts'
        }
      ];
      
      mockIssues.forEach(issue => {
        enhancedAdapter.addDevelopmentIssue(issue);
      });
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      // 验证问题按严重程度排序
      expect(result.issues).toHaveLength(4);
      expect(result.issues[0].severity).toBe('critical');
      expect(result.issues[1].severity).toBe('high');
      expect(result.issues[2].severity).toBe('medium');
      expect(result.issues[3].severity).toBe('low');
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
  
  describe('性能要求', () => {
    test('故障诊断应在10ms内完成', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 模拟内部方法以避免实际执行恢复策略
      jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
        success: true,
        strategy_used: 'retry',
        task_id: mockUUID,
        plan_id: mockUUID,
        new_status: 'ready' as TaskStatus,
        execution_time_ms: 5
      });
      
      // 测量执行时间
      const startTime = Date.now();
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      const duration = Date.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(10);
    });
    
    test('恢复建议获取应在5ms内完成', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加模拟恢复建议
      enhancedAdapter.addRecoverySuggestion(mockUUID, {
        suggestion_id: 'sugg-1',
        failure_id: mockUUID,
        suggestion: 'Test suggestion',
        confidence_score: 0.85,
        estimated_effort: 'low'
      });
      
      // 测量执行时间
      const startTime = Date.now();
      
      // 获取恢复建议
      await failureResolver.getRecoverySuggestions(mockUUID);
      
      const duration = Date.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
    });
    
    test('开发问题检测应在5ms内完成', async () => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加模拟开发问题
      enhancedAdapter.addDevelopmentIssue({
        id: 'issue-1',
        type: 'performance',
        severity: 'medium',
        title: 'Test issue',
        file_path: 'src/test.ts'
      });
      
      // 测量执行时间
      const startTime = Date.now();
      
      // 检测开发问题
      await failureResolver.detectDevelopmentIssues();
      
      const duration = Date.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
    });
  });
}); 