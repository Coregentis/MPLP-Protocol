/**
 * MPLP Trace模块 - 厂商中立设计验证
 * 
 * @version v1.0.1
 * @created 2025-07-12T20:30:00+08:00
 * @updated 2025-07-15T17:00:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @description 验证Trace模块的厂商中立设计原则
 */

import { expect } from '@jest/globals';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { TraceManager } from '../../../src/modules/trace/trace-manager';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { BaseTraceAdapter } from '../../../src/adapters/trace/base-trace-adapter';
import { EnhancedTraceAdapter } from '../../../src/adapters/trace/enhanced-trace-adapter';
import { TraceAdapterFactory, AdapterType } from '../../../src/adapters/trace/adapter-factory';
import fs from 'fs';
import path from 'path';

// 模拟axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  get: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('厂商中立设计验证测试', () => {
  let traceService: TraceService;
  let traceManager: TraceManager;
  let standardAdapter: ITraceAdapter;
  let enhancedAdapter: ITraceAdapter;
  let adapterFactory: TraceAdapterFactory;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 获取适配器工厂
    adapterFactory = TraceAdapterFactory.getInstance();
    
    // 创建标准适配器
    standardAdapter = adapterFactory.createAdapter(AdapterType.BASE, {
      name: 'base-trace-adapter',
      version: '1.0.1',
      batchSize: 100,
      cacheEnabled: true
    });
    
    // 创建增强型适配器
    enhancedAdapter = adapterFactory.createAdapter(AdapterType.ENHANCED, {
      name: 'enhanced-trace-adapter',
      version: '1.0.1',
      batchSize: 100,
      cacheEnabled: true,
      enableAdvancedAnalytics: true,
      enableRecoverySuggestions: true,
      enableDevelopmentIssueDetection: true
    } as any); // 使用any类型暂时解决类型问题
    
    // 初始化TraceManager和TraceService
    traceManager = new TraceManager(standardAdapter);
    traceService = new TraceService(traceManager);
  });
  
  test('核心模块不应依赖特定厂商API', () => {
    // 检查TraceService源码是否含有厂商特定名称
    const traceServicePath = path.join(__dirname, '../../../src/modules/trace/trace-service.ts');
    const traceManagerPath = path.join(__dirname, '../../../src/modules/trace/trace-manager.ts');
    
    // 读取文件内容
    const traceServiceSource = fs.readFileSync(traceServicePath, 'utf8');
    const traceManagerSource = fs.readFileSync(traceManagerPath, 'utf8');
    
    // 检查不应包含厂商特定名称
    expect(traceServiceSource).not.toContain('TracePilot');
    expect(traceServiceSource).not.toContain('tracepilot');
    expect(traceManagerSource).not.toContain('TracePilot');
    expect(traceManagerSource).not.toContain('tracepilot');
  });
  
  test('适配器应实现中立接口', () => {
    // 验证标准适配器实现了ITraceAdapter接口
    expect(standardAdapter).toBeDefined();
    expect(typeof standardAdapter.syncTraceData).toBe('function');
    expect(typeof standardAdapter.reportFailure).toBe('function');
    expect(typeof standardAdapter.checkHealth).toBe('function');
    
    // 验证增强型适配器实现了ITraceAdapter接口
    expect(enhancedAdapter).toBeDefined();
    expect(typeof enhancedAdapter.syncTraceData).toBe('function');
    expect(typeof enhancedAdapter.reportFailure).toBe('function');
    expect(typeof enhancedAdapter.checkHealth).toBe('function');
  });
  
  test('服务应能无缝切换不同适配器', async () => {
    // 使用标准适配器
    const trace1 = await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: 'ctx-123',
      source: 'test-module',
      operation_name: 'test-operation'
    });
    
    expect(trace1).toBeDefined();
    
    // 切换到增强型适配器
    traceManager.setAdapter(enhancedAdapter);
    
    // 验证使用增强型适配器能正常工作
    const trace2 = await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: 'ctx-123',
      source: 'test-module',
      operation_name: 'test-operation-2'
    });
    
    expect(trace2).toBeDefined();
  });
  
  test('增强适配器应提供向后兼容的额外功能', async () => {
    // 首先使用标准适配器
    const standardResult = await traceManager.reportError(
      new Error('Test error'),
      {
        context_id: 'ctx-123',
        operation_name: 'test-operation'
      }
    );
    
    expect(standardResult).toBeDefined();
    
    // 切换到增强型适配器
    traceManager.setAdapter(enhancedAdapter);
    
    // 使用相同的API，但增强型适配器提供更多功能
    const enhancedResult = await traceManager.reportError(
      new Error('Test error'),
      {
        context_id: 'ctx-123',
        operation_name: 'test-operation'
      }
    );
    
    expect(enhancedResult).toBeDefined();
  });
  
  test('适配器接口应符合厂商中立设计原则', async () => {
    // 确认适配器接口的方法名遵循中立原则
    const adapterMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(standardAdapter)
    ).filter(name => name !== 'constructor');
    
    // 验证适配器方法名不包含厂商特定名称
    adapterMethods.forEach(method => {
      expect(method).not.toContain('tracepilot');
      expect(method).not.toContain('TracePilot');
    });
    
    // 验证适配器参数和返回值不依赖厂商特定结构
    const timestamp = new Date().toISOString();
    const traceData = {
      trace_id: 'test-id',
      protocol_version: '1.0.1',
      timestamp: timestamp,
      context_id: 'ctx-123',
      operation_name: 'test-operation',
      start_time: timestamp,
      end_time: timestamp,
      duration_ms: 0,
      trace_type: 'operation',
      status: 'completed',
      metadata: {},
      events: [],
      performance_metrics: {
        cpu_usage: 0,
        memory_usage_mb: 0,
        network_io_bytes: 0,
        disk_io_bytes: 0
      },
      error_info: null,
      parent_trace_id: null,
      adapter_metadata: {
        agent_id: 'test',
        session_id: 'test-session',
        operation_complexity: 'low',
        expected_duration_ms: 0,
        quality_gates: {
          max_duration_ms: 0,
          max_memory_mb: 0,
          max_error_rate: 0,
          required_events: []
        }
      }
    };
    
    // 标准适配器
    const standardResult = await standardAdapter.syncTraceData(traceData as any);
    expect(standardResult).toHaveProperty('success');
    
    // 增强型适配器
    const enhancedResult = await enhancedAdapter.syncTraceData(traceData as any);
    expect(enhancedResult).toHaveProperty('success');
  });
  
  test('Plan模块不应直接引用TracePilot特定适配器', () => {
    // 检查Plan模块源码是否直接依赖TracePilot
    const planManagerPath = path.join(__dirname, '../../../src/modules/plan/plan-manager.ts');
    const failureResolverPath = path.join(__dirname, '../../../src/modules/plan/failure-resolver.ts');
    
    // 读取文件内容
    const planManagerSource = fs.readFileSync(planManagerPath, 'utf8');
    const failureResolverSource = fs.readFileSync(failureResolverPath, 'utf8');
    
    // 检查直接导入
    expect(planManagerSource).not.toMatch(/import.*TracePilot/);
    expect(planManagerSource).not.toMatch(/from ['"].*tracepilot/);
    expect(failureResolverSource).not.toMatch(/import.*TracePilot/);
    expect(failureResolverSource).not.toMatch(/from ['"].*tracepilot/);
    
    // 检查是否依赖通用接口而非具体实现
    expect(planManagerSource).toMatch(/ITraceAdapter/);
    expect(failureResolverSource).toMatch(/ITraceAdapter/);
  });
  
  test('厂商特定适配器应实现在独立目录中', () => {
    // 确认厂商特定适配器放置在正确的目录结构
    const expectedAdapterPath = path.join(__dirname, '../../../src/mcp/tracepilot-adapter.ts');
    const expectedEnhancedAdapterPath = path.join(__dirname, '../../../src/mcp/enhanced-tracepilot-adapter.ts');
    
    // 验证文件存在于正确位置
    expect(fs.existsSync(expectedAdapterPath)).toBe(true);
    expect(fs.existsSync(expectedEnhancedAdapterPath)).toBe(true);
    
    // 验证核心模块目录不包含厂商特定适配器
    const coreModulesPath = path.join(__dirname, '../../../src/modules');
    const moduleFiles = fs.readdirSync(coreModulesPath, { recursive: true });
    
    // 确认没有TracePilot特定文件在核心模块目录
    const tracePilotFiles = moduleFiles.filter((file: any) => 
      typeof file === 'string' && file.toLowerCase().includes('tracepilot')
    );
    expect(tracePilotFiles.length).toBe(0);
  });
  
  test('服务配置应支持厂商中立配置项', () => {
    // 检查配置文件是否包含厂商特定配置
    const configPath = path.join(__dirname, '../../../src/config/index.ts');
    const configSource = fs.readFileSync(configPath, 'utf8');
    
    // 确认有通用配置项
    expect(configSource).toMatch(/trace_adapter/);
    expect(configSource).toMatch(/adapter_type/);
    
    // 确认TracePilot特定配置在独立文件中
    const tracepilotConfigPath = path.join(__dirname, '../../../src/config/tracepilot.ts');
    expect(fs.existsSync(tracepilotConfigPath)).toBe(true);
  });
  
  test('应能处理多种适配器类型的错误情况', async () => {
    // 模拟标准适配器错误
    jest.spyOn(standardAdapter, 'syncTraceData').mockRejectedValueOnce(new Error('Connection failed'));
    
    // 验证服务能优雅处理错误
    await expect(
      traceManager.recordTrace({
        trace_type: 'operation',
        context_id: 'ctx-123',
        source: 'test-module',
        operation_name: 'test-operation'
      })
    ).rejects.toThrow();
    
    // 切换到增强型适配器
    traceManager.setAdapter(enhancedAdapter);
    
    // 模拟增强型适配器错误
    jest.spyOn(enhancedAdapter, 'syncTraceData').mockRejectedValueOnce(new Error('Enhanced feature error'));
    
    // 验证服务能优雅处理增强型适配器错误
    await expect(
      traceManager.recordTrace({
        trace_type: 'operation',
        context_id: 'ctx-123',
        source: 'test-module',
        operation_name: 'test-operation'
      })
    ).rejects.toThrow();
  });
}); 