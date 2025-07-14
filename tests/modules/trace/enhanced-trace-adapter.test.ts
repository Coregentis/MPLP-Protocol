/**
 * 增强型追踪适配器测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T17:25:00+08:00
 * @compliance 100% Schema合规性 - 基于trace-protocol.json
 * @description 测试增强型追踪适配器的高级功能
 */

import { expect } from '@jest/globals';
import { EnhancedTraceAdapter } from '../../../src/adapters/trace/enhanced-trace-adapter';
import { MPLPTraceData } from '../../../src/types/trace';
import { FailureReport } from '../../../src/interfaces/trace-adapter.interface';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('EnhancedTraceAdapter', () => {
  let adapter: EnhancedTraceAdapter;
  
  // 创建一个有效的追踪数据
  const createValidTraceData = (): MPLPTraceData => ({
    protocol_version: '1.0.0',
    timestamp: new Date().toISOString(),
    trace_id: 'test-trace-id',
    context_id: 'test-context-id',
    operation_name: 'test-operation',
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    duration_ms: 100,
    trace_type: 'operation',
    status: 'completed',
    metadata: {},
    events: [
      {
        event_id: 'event-1',
        timestamp: new Date().toISOString(),
        event_type: 'trace_start',
        operation_name: 'test-operation',
        data: {},
        duration_ms: 0
      }
    ],
    performance_metrics: {
      cpu_usage: 10,
      memory_usage_mb: 50,
      network_io_bytes: 1024,
      disk_io_bytes: 512
    },
    error_info: null,
    parent_trace_id: null,
    adapter_metadata: {
      agent_id: 'test-agent',
      session_id: 'test-session',
      operation_complexity: 'low',
      expected_duration_ms: 100,
      quality_gates: {
        max_duration_ms: 500,
        max_memory_mb: 100,
        max_error_rate: 0.01,
        required_events: ['trace_start', 'trace_end']
      }
    }
  });
  
  // 创建一个有效的故障报告
  const createValidFailureReport = (): FailureReport => ({
    failure_id: 'test-failure-id',
    task_id: 'test-task-id',
    plan_id: 'test-plan-id',
    failure_type: 'network',
    failure_details: {
      error_message: 'Connection timeout',
      error_code: 'ETIMEDOUT',
      url: 'https://api.example.com',
      method: 'GET'
    },
    timestamp: new Date().toISOString()
  });
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 创建适配器实例
    adapter = new EnhancedTraceAdapter({
      name: 'enhanced-test-adapter',
      version: '1.0.1',
      enableAdvancedAnalytics: true,
      enableRecoverySuggestions: true,
      enableDevelopmentIssueDetection: true
    });
  });
  
  describe('getAdapterInfo', () => {
    test('应该返回正确的适配器信息', () => {
      const info = adapter.getAdapterInfo();
      expect(info.type).toBe('enhanced-trace-adapter');
      expect(info.version).toBe('1.0.1');
    });
  });
  
  describe('reportFailure', () => {
    test('应该成功报告故障并缓存以供后续分析', async () => {
      const failure = createValidFailureReport();
      const result = await adapter.reportFailure(failure);
      
      expect(result.success).toBe(true);
      expect(result.sync_id).toBeDefined();
      
      // 测试缓存是否生效（通过获取恢复建议来间接验证）
      const suggestions = await adapter.getRecoverySuggestions(failure.failure_id);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
  
  describe('getRecoverySuggestions', () => {
    test('应该返回增强型恢复建议', async () => {
      // 首先报告故障
      const failure = createValidFailureReport();
      await adapter.reportFailure(failure);
      
      // 然后获取恢复建议
      const suggestions = await adapter.getRecoverySuggestions(failure.failure_id);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // 验证增强型建议的特性
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion.suggestion_id).toBeDefined();
      expect(firstSuggestion.failure_id).toBe(failure.failure_id);
      expect(firstSuggestion.suggestion).toBeDefined();
      expect(firstSuggestion.confidence_score).toBeGreaterThan(0);
      
      // 验证建议按置信度排序
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence_score).toBeGreaterThanOrEqual(
          suggestions[i].confidence_score
        );
      }
    });
    
    test('当故障ID未知时应该回退到基本建议', async () => {
      const suggestions = await adapter.getRecoverySuggestions('unknown-failure-id');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
    
    test('当禁用增强型建议时应该回退到基本建议', async () => {
      // 创建禁用增强型建议的适配器
      const basicAdapter = new EnhancedTraceAdapter({
        enableRecoverySuggestions: false
      });
      
      const suggestions = await basicAdapter.getRecoverySuggestions('test-failure-id');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
  
  describe('getAnalytics', () => {
    test('应该返回增强型分析数据', async () => {
      // 首先同步一些追踪数据
      await adapter.syncTraceData(createValidTraceData());
      await adapter.syncTraceData(createValidTraceData());
      
      // 然后获取分析数据
      const analytics = await adapter.getAnalytics({ period: 'day' });
      
      expect(analytics).toBeDefined();
      expect(typeof analytics).toBe('object');
      
      // 验证增强型分析数据的特性
      expect(analytics.performance_trends).toBeDefined();
      expect(analytics.error_patterns).toBeDefined();
      expect(analytics.quality_score).toBeDefined();
      expect(typeof analytics.quality_score).toBe('number');
      expect(analytics.recommendations).toBeDefined();
      expect(Array.isArray(analytics.recommendations)).toBe(true);
    });
    
    test('当禁用高级分析时应该回退到基本分析', async () => {
      // 创建禁用高级分析的适配器
      const basicAdapter = new EnhancedTraceAdapter({
        enableAdvancedAnalytics: false
      });
      
      const analytics = await basicAdapter.getAnalytics({ period: 'day' });
      
      expect(analytics).toBeDefined();
      expect(typeof analytics).toBe('object');
      expect(analytics.performance_trends).toBeUndefined();
    });
  });
  
  describe('detectDevelopmentIssues', () => {
    test('应该检测追踪数据中的开发问题', async () => {
      // 创建包含错误的追踪数据
      const errorTraceData: MPLPTraceData = {
        ...createValidTraceData(),
        error_info: {
          error_type: 'timeout',
          error_message: 'Operation timed out after 5000ms',
          stack_trace: 'at processRequest (/app/src/api/client.js:45:12)',
          timestamp: new Date().toISOString()
        }
      };
      
      // 同步包含错误的追踪数据
      await adapter.syncTraceData(errorTraceData);
      
      // 检测开发问题
      const result = await adapter.detectDevelopmentIssues();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      
      // 验证问题的特性
      const firstIssue = result.issues[0];
      expect(firstIssue.id).toBeDefined();
      expect(firstIssue.type).toBeDefined();
      expect(firstIssue.severity).toBeDefined();
      expect(firstIssue.title).toBeDefined();
    });
    
    test('应该检测故障报告中的开发问题', async () => {
      // 报告包含明确错误模式的故障
      const failure: FailureReport = {
        ...createValidFailureReport(),
        failure_details: {
          error_message: 'Permission denied: cannot access resource',
          error_code: 'EACCES',
          resource: '/data/users',
          operation: 'read'
        }
      };
      
      await adapter.reportFailure(failure);
      
      // 检测开发问题
      const result = await adapter.detectDevelopmentIssues();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
    });
    
    test('当禁用问题检测时应该返回空列表', async () => {
      // 创建禁用问题检测的适配器
      const basicAdapter = new EnhancedTraceAdapter({
        enableDevelopmentIssueDetection: false
      });
      
      const result = await basicAdapter.detectDevelopmentIssues();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBe(0);
      expect(result.confidence).toBe(0);
    });
  });
}); 