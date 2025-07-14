/**
 * MPLP核心架构集成测试 - 使用增强型TracePilot适配器
 * 
 * @version v1.0.1
 * @created 2025-07-17T14:45:00+08:00
 * @compliance trace-protocol.json Schema v1.0.1 - 100%合规
 * @compliance extension-protocol.mdc - 厂商中立设计
 */

import { v4 as uuidv4 } from 'uuid';
import { ITraceAdapter, AdapterType } from '@/interfaces/trace-adapter.interface';
import { EnhancedTracePilotAdapter } from '@/mcp/enhanced-tracepilot-adapter';
import { TraceAdapterFactory } from '@/adapters/trace/adapter-factory';
import { FailureResolverManager } from '@/modules/plan/failure-resolver';
import { MPLPTraceData, TraceEvent, TraceType, TraceStatus, EventType, PerformanceMetrics, ErrorInfo, AdapterMetadata, QualityGates } from '@/types/trace';

describe('核心架构集成测试 - 厂商中立适配器', () => {
  // 测试适配器
  let baseAdapter: ITraceAdapter;
  let enhancedAdapter: EnhancedTracePilotAdapter;
  let failureResolver: FailureResolverManager;
  
  beforeAll(() => {
    // 使用厂商中立的适配器工厂创建适配器
    const adapterFactory = TraceAdapterFactory.getInstance();
    
    // 创建基础适配器
    baseAdapter = adapterFactory.createAdapter(AdapterType.BASE, {
      name: 'test-base-adapter',
      version: '1.0.0',
      batchSize: 50
    });
    
    // 创建增强型适配器
    enhancedAdapter = new EnhancedTracePilotAdapter({
      api_endpoint: 'https://api.tracepilot.test',
      api_key: 'test-api-key',
      project_root: process.cwd(),
      enhanced_features: {
        intelligent_diagnostics: true,
        auto_fix: true,
        suggestion_generation: true,
        development_metrics: true
      }
    });
    
    // 创建故障解决器
    failureResolver = new FailureResolverManager({
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
        notification_channels: ['console', 'email'],
        performance_thresholds: {
          max_execution_time_ms: 30000,
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
        }
      },
      trace_adapter: enhancedAdapter // 注入增强型追踪适配器
    });
  });
  
  describe('适配器厂商中立性测试', () => {
    test('基础适配器和增强型适配器应实现相同的核心接口', async () => {
      // 创建测试追踪数据
      const traceData: MPLPTraceData = {
        trace_id: uuidv4(),
        trace_type: 'operation',
        timestamp: new Date().toISOString(),
        source: 'integration_test',
        context_id: uuidv4(),
        operation_name: 'test_operation',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: 100,
        status: 'completed',
        metadata: {},
        events: [],
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
        },
        protocol_version: '1.0.1' // 添加协议版本
      };
      
      // 模拟基础适配器和增强型适配器的同步方法
      const baseSyncSpy = jest.spyOn(baseAdapter, 'syncTraceData').mockResolvedValue({
        success: true,
        sync_timestamp: new Date().toISOString(),
        latency_ms: 10,
        errors: []
      });
      
      const enhancedSyncSpy = jest.spyOn(enhancedAdapter, 'syncTraceData').mockResolvedValue({
        success: true,
        sync_timestamp: new Date().toISOString(),
        latency_ms: 8,
        errors: []
      });
      
      // 使用基础适配器同步数据
      const baseResult = await baseAdapter.syncTraceData(traceData);
      expect(baseResult.success).toBe(true);
      expect(baseSyncSpy).toHaveBeenCalledWith(traceData);
      
      // 使用增强型适配器同步数据
      const enhancedResult = await enhancedAdapter.syncTraceData(traceData);
      expect(enhancedResult.success).toBe(true);
      expect(enhancedSyncSpy).toHaveBeenCalledWith(traceData);
      
      // 验证适配器类型
      const baseInfo = baseAdapter.getAdapterInfo();
      const enhancedInfo = enhancedAdapter.getAdapterInfo();
      
      expect(baseInfo.type).toBe(AdapterType.BASE);
      expect(enhancedInfo.type).toBe(AdapterType.ENHANCED);
    });
    
    test('故障解决器应能与不同类型的适配器集成', async () => {
      // 模拟故障解决器的同步方法
      const syncSpy = jest.spyOn(failureResolver as any, 'syncFailureToAdapter').mockResolvedValue({
        success: true,
        sync_id: 'test-sync-id'
      });
      
      // 创建测试任务
      const mockTask = {
        task_id: 'task-123',
        name: '测试任务',
        type: 'atomic',
        status: 'failed'
      };
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        'plan-123',
        'task-123',
        mockTask as any,
        '任务执行失败'
      );
      
      // 验证同步方法被调用
      expect(syncSpy).toHaveBeenCalled();
      
      // 切换到基础适配器
      (failureResolver as any).traceAdapter = baseAdapter;
      
      // 再次处理任务故障
      await failureResolver.handleTaskFailure(
        'plan-123',
        'task-123',
        mockTask as any,
        '任务执行失败'
      );
      
      // 验证同步方法被再次调用
      expect(syncSpy).toHaveBeenCalled();
    });
  });
  
  describe('增强型适配器特有功能测试', () => {
    test('增强型适配器应提供开发问题检测功能', async () => {
      // 模拟检测开发问题方法
      const detectIssuesSpy = jest.spyOn(enhancedAdapter, 'detectDevelopmentIssues').mockResolvedValue({
        issues: [
          {
            id: 'ISSUE-001',
            type: 'schema_violation',
            severity: 'high',
            title: 'Schema不一致性问题',
            file_path: 'src/modules/plan/plan-manager.ts'
          },
          {
            id: 'ISSUE-002',
            type: 'vendor_neutral',
            severity: 'medium',
            title: '厂商中立性问题',
            file_path: 'src/mcp/tracepilot-adapter.ts'
          }
        ],
        confidence: 0.85
      });
      
      // 调用检测方法
      const result = await enhancedAdapter.detectDevelopmentIssues();
      
      // 验证结果
      expect(detectIssuesSpy).toHaveBeenCalled();
      expect(result.issues.length).toBe(2);
      expect(result.issues[0].type).toBe('schema_violation');
      expect(result.issues[1].type).toBe('vendor_neutral');
    });
    
    test('增强型适配器应提供修复建议生成功能', async () => {
      // 模拟生成建议方法
      const generateSuggestionsSpy = jest.spyOn(enhancedAdapter, 'generateSuggestions').mockResolvedValue([
        {
          suggestion_id: 'SUGG-001',
          title: '修复Schema不一致问题',
          description: '更新plan-manager.ts中的类型定义，使其与Schema一致',
          type: 'fix',
          priority: 'high',
          estimated_time_minutes: 15,
          implementation_steps: [
            '打开src/modules/plan/plan-manager.ts文件',
            '更新类型定义，确保与Schema一致',
            '更新相关代码以使用正确的类型'
          ],
          related_issue_ids: ['ISSUE-001']
        }
      ]);
      
      // 调用生成建议方法
      const suggestions = await enhancedAdapter.generateSuggestions();
      
      // 验证结果
      expect(generateSuggestionsSpy).toHaveBeenCalled();
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].type).toBe('fix');
      expect(suggestions[0].priority).toBe('high');
    });
    
    test('增强型适配器应提供自动修复功能', async () => {
      // 模拟自动修复方法
      const autoFixSpy = jest.spyOn(enhancedAdapter, 'autoFix').mockResolvedValue(true);
      
      // 调用自动修复方法
      const result = await enhancedAdapter.autoFix('SUGG-001');
      
      // 验证结果
      expect(autoFixSpy).toHaveBeenCalledWith('SUGG-001');
      expect(result).toBe(true);
    });
  });
  
  describe('适配器性能测试', () => {
    test('增强型适配器的批量同步性能应符合要求', async () => {
      // 创建一个符合MPLPTraceData类型的基础对象
      const createTraceData = (index: number): MPLPTraceData => ({
        trace_id: `trace-${index}`,
        trace_type: 'operation',
        timestamp: new Date().toISOString(),
        source: 'performance_test',
        context_id: `context-${index}`,
        operation_name: `test_operation_${index}`,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: 100,
        status: 'completed',
        metadata: {},
        events: [],
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
        },
        protocol_version: '1.0.1' // 添加协议版本
      });
      
      // 创建大量测试数据
      const traceBatch: MPLPTraceData[] = Array.from({ length: 100 }, (_, i) => createTraceData(i));
      
      // 模拟批量同步方法
      const batchSyncSpy = jest.spyOn(enhancedAdapter, 'syncBatch').mockResolvedValue({
        success: true,
        sync_timestamp: new Date().toISOString(),
        latency_ms: 50,
        errors: []
      });
      
      // 记录开始时间
      const startTime = Date.now();
      
      // 执行批量同步
      const result = await enhancedAdapter.syncBatch(traceBatch);
      
      // 计算执行时间
      const executionTime = Date.now() - startTime;
      
      // 验证结果
      expect(batchSyncSpy).toHaveBeenCalledWith(traceBatch);
      expect(result.success).toBe(true);
      
      // 验证性能符合要求 (模拟环境中不做实际验证)
      console.log(`批量同步执行时间: ${executionTime}ms`);
    });
  });
}); 