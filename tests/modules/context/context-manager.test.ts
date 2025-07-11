/**
 * MPLP Context模块测试
 * 
 * @version v1.0.0
 * @created 2025-07-09T23:30:00+08:00
 * @compliance .cursor/rules/testing-standards.mdc - 测试规范
 * @tracepilot_integration Context模块测试覆盖率追踪
 */

import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { ContextManager } from '@/modules/context/context-manager';
import { createDefaultContextConfig } from '@/modules/context/utils';
import { TracePilotAdapter } from '@/mcp/tracepilot-adapter';
import type { ContextConfig } from '@/modules/context/types';

describe('Context模块 - ContextManager', () => {
  let contextManager: ContextManager;
  let mockTracePilotAdapter: jest.Mocked<TracePilotAdapter>;
  let config: ContextConfig;

  beforeEach(() => {
    // 创建TracePilot适配器模拟
    mockTracePilotAdapter = {
      syncTraceData: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    } as any;

    // 使用默认配置
    config = createDefaultContextConfig();
    config.auto_cleanup_enabled = false; // 测试中禁用自动清理

    // 初始化Context管理器
    contextManager = new ContextManager(config, mockTracePilotAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('📋 Context创建和管理', () => {
    it('应该成功创建新的Context', async () => {
      // Trace: 测试Context创建功能
      const result = await contextManager.createContext('user-123', 'agent-456');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.context_id).toMatch(/^ctx-/);
      expect(result.data?.user_id).toBe('user-123');
      expect(result.data?.agent_id).toBe('agent-456');
      expect(result.data?.lifecycle_stage).toBe('active');
      expect(result.operation_time_ms).toBeLessThan(5); // 性能目标: <5ms

      // 验证TracePilot同步调用
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.context_created',
          status: 'completed'
        })
      );
    });

    it('应该支持父子Context关系', async () => {
      // 创建父Context
      const parentResult = await contextManager.createContext('user-123');
      expect(parentResult.success).toBe(true);
      const parentContextId = parentResult.data!.context_id;

      // 创建子Context
      const childResult = await contextManager.createContext('user-123', undefined, parentContextId);
      expect(childResult.success).toBe(true);
      
      // 验证父子关系
      const parentContext = await contextManager.getContext(parentContextId);
      expect(parentContext.success).toBe(true);
      expect(parentContext.data!.metadata.child_context_ids).toContain(childResult.data!.context_id);
      
      expect(childResult.data!.metadata.parent_context_id).toBe(parentContextId);
    });

    it('应该正确获取已存在的Context', async () => {
      // 创建Context
      const createResult = await contextManager.createContext('user-123');
      const contextId = createResult.data!.context_id;

      // 获取Context
      const getResult = await contextManager.getContext(contextId);
      
      expect(getResult.success).toBe(true);
      expect(getResult.data?.context_id).toBe(contextId);
      expect(getResult.operation_time_ms).toBeLessThan(5); // 性能目标: <5ms
    });

    it('获取不存在的Context应该返回错误', async () => {
      const result = await contextManager.getContext('non-existent-context');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Context not found');
      expect(result.error_code).toBe('CONTEXT_NOT_FOUND');
    });
  });

  describe('🗂️ 共享状态管理', () => {
    let contextId: string;

    beforeEach(async () => {
      const result = await contextManager.createContext('user-123');
      contextId = result.data!.context_id;
    });

    it('应该成功设置共享状态', async () => {
      const result = await contextManager.setSharedState(
        contextId,
        'test_key',
        'test_value',
        'string',
        { source_module: 'test_module' }
      );

      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('test_key');
      expect(result.data?.value).toBe('test_value');
      expect(result.data?.data_type).toBe('string');
      expect(result.operation_time_ms).toBeLessThan(5); // 性能目标: <5ms

      // 验证TracePilot同步
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.shared_state_changed'
        })
      );
    });

    it('应该成功获取共享状态', async () => {
      // 设置状态
      await contextManager.setSharedState(contextId, 'test_key', 'test_value', 'string');

      // 获取单个状态
      const result = await contextManager.getSharedState(contextId, 'test_key');
      expect(result.success).toBe(true);
      expect(result.data?.value).toBe('test_value');
      expect(result.operation_time_ms).toBeLessThan(5); // 性能目标: <5ms

      // 获取所有状态
      const allResult = await contextManager.getSharedState(contextId);
      expect(allResult.success).toBe(true);
      expect(allResult.data).toHaveProperty('test_key');
    });

    it('获取不存在的共享状态键应该返回错误', async () => {
      const result = await contextManager.getSharedState(contextId, 'non_existent_key');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Shared state key not found');
      expect(result.error_code).toBe('STATE_KEY_NOT_FOUND');
    });

    it('应该支持不同数据类型的共享状态', async () => {
      // 字符串
      await contextManager.setSharedState(contextId, 'str_key', 'hello', 'string');
      
      // 数字
      await contextManager.setSharedState(contextId, 'num_key', 42, 'number');
      
      // 布尔值
      await contextManager.setSharedState(contextId, 'bool_key', true, 'boolean');
      
      // 对象
      await contextManager.setSharedState(contextId, 'obj_key', { test: 'value' }, 'object');
      
      // 数组
      await contextManager.setSharedState(contextId, 'arr_key', [1, 2, 3], 'array');

      // 验证所有状态
      const allStates = await contextManager.getSharedState(contextId);
      expect(allStates.success).toBe(true);
      expect(Object.keys(allStates.data as any)).toHaveLength(5);
    });
  });

  describe('🔄 生命周期管理', () => {
    let contextId: string;

    beforeEach(async () => {
      const result = await contextManager.createContext('user-123');
      contextId = result.data!.context_id;
    });

    it('应该成功更新生命周期阶段', async () => {
      const result = await contextManager.updateLifecycleStage(contextId, 'suspended');
      
      expect(result.success).toBe(true);
      expect(result.operation_time_ms).toBeLessThan(5); // 性能目标: <5ms

      // 验证更新后的状态
      const contextResult = await contextManager.getContext(contextId);
      expect(contextResult.data?.lifecycle_stage).toBe('suspended');

      // 验证TracePilot同步
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.context_updated'
        })
      );
    });

    it('应该正确处理生命周期状态转换', async () => {
      // active -> suspended
      await contextManager.updateLifecycleStage(contextId, 'suspended');
      
      // suspended -> active
      await contextManager.updateLifecycleStage(contextId, 'active');
      
      // active -> terminating
      await contextManager.updateLifecycleStage(contextId, 'terminating');
      
      // terminating -> terminated
      const result = await contextManager.updateLifecycleStage(contextId, 'terminated');
      expect(result.success).toBe(true);
    });
  });

  describe('📊 性能监控', () => {
    it('所有操作应该满足性能目标 (<5ms)', async () => {
      const operations = [];

      // 测试Context创建性能
      for (let i = 0; i < 10; i++) {
        const result = await contextManager.createContext(`user-${i}`);
        operations.push(result.operation_time_ms);
        expect(result.operation_time_ms).toBeLessThan(5);
      }

      // 测试状态操作性能
      const contextResult = await contextManager.createContext('perf-test-user');
      const contextId = contextResult.data!.context_id;

      for (let i = 0; i < 10; i++) {
        const setResult = await contextManager.setSharedState(contextId, `key-${i}`, `value-${i}`, 'string');
        expect(setResult.operation_time_ms).toBeLessThan(5);

        const getResult = await contextManager.getSharedState(contextId, `key-${i}`);
        expect(getResult.operation_time_ms).toBeLessThan(5);
      }

      console.log('Context操作性能统计:', {
        avg_operation_time: operations.reduce((a, b) => a + b, 0) / operations.length,
        max_operation_time: Math.max(...operations),
        min_operation_time: Math.min(...operations)
      });
    });

    it('应该正确收集和报告模块统计信息', async () => {
      // 创建多个Context
      await contextManager.createContext('user-1');
      await contextManager.createContext('user-2');
      const contextResult = await contextManager.createContext('user-3');
      
      // 添加共享状态
      await contextManager.setSharedState(contextResult.data!.context_id, 'key1', 'value1', 'string');
      await contextManager.setSharedState(contextResult.data!.context_id, 'key2', 'value2', 'string');

      const stats = contextManager.getModuleStats();
      
      expect(stats.total_contexts).toBe(3);
      expect(stats.active_contexts).toBe(3);
      expect(stats.total_sessions).toBe(3);
      expect(stats.total_shared_state_items).toBe(2);
    });
  });

  describe('🔗 TracePilot集成', () => {
    it('应该在所有关键操作中同步TracePilot数据', async () => {
      const contextResult = await contextManager.createContext('user-123');
      const contextId = contextResult.data!.context_id;

      // Context创建
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.context_created'
        })
      );

      // 共享状态操作
      await contextManager.setSharedState(contextId, 'test_key', 'test_value', 'string');
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.shared_state_changed'
        })
      );

      // 生命周期更新
      await contextManager.updateLifecycleStage(contextId, 'suspended');
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.context_updated'
        })
      );

      // 验证所有调用都包含必要的追踪信息
      const allCalls = mockTracePilotAdapter.syncTraceData.mock.calls;
      allCalls.forEach(call => {
        const traceData = call[0];
        expect(traceData).toHaveProperty('trace_id');
        expect(traceData).toHaveProperty('context_id');
        expect(traceData).toHaveProperty('performance_metrics');
        expect(traceData.tags).toHaveProperty('module', 'Context');
      });
    });

    it('TracePilot同步失败不应该影响正常功能', async () => {
      // 模拟TracePilot同步失败
      mockTracePilotAdapter.syncTraceData.mockRejectedValue(new Error('Sync failed'));

      const result = await contextManager.createContext('user-123');
      
      // 操作应该仍然成功
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('🎭 事件系统', () => {
    it('应该正确发出Context事件', (done) => {
      const eventPromises: Promise<void>[] = [];

      // 监听Context事件
      contextManager.on('context_event', (event) => {
        expect(event).toHaveProperty('event_id');
        expect(event).toHaveProperty('event_type');
        expect(event).toHaveProperty('context_id');
        expect(event).toHaveProperty('timestamp');
        expect(event.metadata.source).toBe('context_manager');

        if (event.event_type === 'context_created') {
          done();
        }
      });

      // 触发事件
      contextManager.createContext('user-123');
    });
  });

  describe('⚙️ 配置和验证', () => {
    it('应该使用正确的默认配置', () => {
      const defaultConfig = createDefaultContextConfig();
      
      expect(defaultConfig.max_shared_state_size_mb).toBe(10);
      expect(defaultConfig.session_timeout_minutes).toBe(30);
      expect(defaultConfig.auto_cleanup_enabled).toBe(true);
      expect(defaultConfig.performance_monitoring_enabled).toBe(true);
      expect(defaultConfig.tracepilot_sync_enabled).toBe(true);
      expect(defaultConfig.cache_strategy).toBe('hybrid');
    });

    it('应该正确处理禁用TracePilot的情况', async () => {
      const configWithoutTracePilot = { ...config, tracepilot_sync_enabled: false };
      const managerWithoutTracePilot = new ContextManager(configWithoutTracePilot);

      const result = await managerWithoutTracePilot.createContext('user-123');
      expect(result.success).toBe(true);
      
      // TracePilot不应该被调用
      expect(mockTracePilotAdapter.syncTraceData).not.toHaveBeenCalled();
    });
  });
});

describe('Context模块 - 工具函数测试', () => {
  describe('🔧 配置验证', () => {
    it('应该正确验证有效配置', () => {
      const { validateContextConfig } = require('@/modules/context/utils');
      
      const validConfig = {
        max_shared_state_size_mb: 50,
        session_timeout_minutes: 60,
        cache_strategy: 'memory' as const
      };

      const result = validateContextConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测无效配置', () => {
      const { validateContextConfig } = require('@/modules/context/utils');
      
      const invalidConfig = {
        max_shared_state_size_mb: -1,
        session_timeout_minutes: 2000,
        cache_strategy: 'invalid' as any
      };

      const result = validateContextConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('📈 性能报告', () => {
    it('应该正确生成性能报告', () => {
      const { createContextPerformanceReport } = require('@/modules/context/utils');
      
      const operationTimes = [1.2, 2.1, 1.8, 3.5, 2.3, 1.9, 2.7, 1.5, 2.9, 2.2];
      const report = createContextPerformanceReport(operationTimes, 'context_create');

      expect(report.operation_type).toBe('context_create');
      expect(report.total_operations).toBe(10);
      expect(report.avg_time_ms).toBeGreaterThan(0);
      expect(report.p95_time_ms).toBeGreaterThan(0);
      expect(report.target_compliance).toBe(true); // 所有操作都应该 <5ms
    });
  });
}); 