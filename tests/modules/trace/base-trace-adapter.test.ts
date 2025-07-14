/**
 * 基础追踪适配器测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T17:15:00+08:00
 * @compliance 100% Schema合规性 - 基于trace-protocol.json
 * @description 测试基础追踪适配器的核心功能
 */

import { expect } from '@jest/globals';
import { BaseTraceAdapter } from '../../../src/adapters/trace/base-trace-adapter';
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

describe('BaseTraceAdapter', () => {
  let adapter: BaseTraceAdapter;
  
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
    adapter = new BaseTraceAdapter({
      name: 'test-adapter',
      version: '1.0.0'
    });
  });
  
  describe('getAdapterInfo', () => {
    test('应该返回正确的适配器信息', () => {
      const info = adapter.getAdapterInfo();
      expect(info.type).toBe('test-adapter');
      expect(info.version).toBe('1.0.0');
    });
  });
  
  describe('syncTraceData', () => {
    test('应该成功同步有效的追踪数据', async () => {
      const traceData = createValidTraceData();
      const result = await adapter.syncTraceData(traceData);
      
      expect(result.success).toBe(true);
      expect(result.sync_id).toBeDefined();
      expect(result.sync_timestamp).toBeDefined();
      expect(result.latency_ms).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });
    
    test('应该拒绝无效的追踪数据', async () => {
      // 创建一个无效的追踪数据（没有trace_id）
      const invalidTraceData: MPLPTraceData = {
        ...createValidTraceData(),
        trace_id: '' // 空字符串而不是undefined
      };
      
      const result = await adapter.syncTraceData(invalidTraceData);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Trace ID');
    });
  });
  
  describe('syncBatch', () => {
    test('应该成功批量同步有效的追踪数据', async () => {
      const traceBatch = [
        createValidTraceData(),
        createValidTraceData(),
        createValidTraceData()
      ];
      
      const result = await adapter.syncBatch(traceBatch);
      
      expect(result.success).toBe(true);
      expect(result.sync_id).toBeDefined();
      expect(result.sync_timestamp).toBeDefined();
      expect(result.latency_ms).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });
    
    test('应该部分成功并报告错误', async () => {
      const validTrace = createValidTraceData();
      // 创建一个无效的追踪数据（没有trace_id）
      const invalidTrace: MPLPTraceData = {
        ...createValidTraceData(),
        trace_id: '' // 空字符串而不是undefined
      };
      
      const traceBatch = [
        validTrace,
        invalidTrace,
        validTrace
      ];
      
      const result = await adapter.syncBatch(traceBatch);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Trace');
    });
  });
  
  describe('reportFailure', () => {
    test('应该成功报告有效的故障', async () => {
      const failure = createValidFailureReport();
      const result = await adapter.reportFailure(failure);
      
      expect(result.success).toBe(true);
      expect(result.sync_id).toBeDefined();
      expect(result.sync_timestamp).toBeDefined();
      expect(result.latency_ms).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });
    
    test('应该拒绝无效的故障报告', async () => {
      // 创建一个无效的故障报告（没有failure_id）
      const invalidFailure: FailureReport = {
        ...createValidFailureReport(),
        failure_id: '' // 空字符串而不是undefined
      };
      
      const result = await adapter.reportFailure(invalidFailure);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failure ID');
    });
  });
  
  describe('checkHealth', () => {
    test('应该返回健康状态', async () => {
      const health = await adapter.checkHealth();
      
      expect(health.status).toBeDefined();
      expect(health.last_check).toBeDefined();
      expect(health.metrics).toBeDefined();
      expect(health.metrics.avg_latency_ms).toBeGreaterThanOrEqual(0);
      expect(health.metrics.success_rate).toBeGreaterThanOrEqual(0);
      expect(health.metrics.error_rate).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('getRecoverySuggestions', () => {
    test('应该返回恢复建议', async () => {
      const suggestions = await adapter.getRecoverySuggestions('test-failure-id');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion.suggestion_id).toBeDefined();
      expect(firstSuggestion.failure_id).toBe('test-failure-id');
      expect(firstSuggestion.suggestion).toBeDefined();
      expect(firstSuggestion.confidence_score).toBeGreaterThan(0);
      expect(firstSuggestion.confidence_score).toBeLessThanOrEqual(1);
      expect(firstSuggestion.estimated_effort).toBeDefined();
    });
  });
  
  describe('getAnalytics', () => {
    test('应该返回分析数据', async () => {
      const analytics = await adapter.getAnalytics({ period: 'day' });
      
      expect(analytics).toBeDefined();
      expect(typeof analytics).toBe('object');
    });
  });
  
  describe('detectDevelopmentIssues', () => {
    test('应该返回开发问题列表', async () => {
      const result = await adapter.detectDevelopmentIssues();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
}); 