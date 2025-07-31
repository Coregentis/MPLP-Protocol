/**
 * 工作流模块性能测试
 * @description 基于实际WorkflowManager实现的性能测试文件
 * @author MPLP Team
 * @version 1.0.1
 *
 * 技术栈版本：
 * - TypeScript: 5.0.4
 * - Jest: 29.5.0
 * - ts-jest: 29.1.0
 */

import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import { EventBus } from '../../src/core/event-bus';
import { WorkflowManager, WorkflowManagerConfig } from '../../src/core/workflow/workflow-manager';
import { WorkflowStageType, WorkflowStatus } from '../../src/core/workflow/workflow-types';
import { IWorkflowContext } from '../../src/core/workflow/interfaces/workflow-context.interface';

// 设置性能测试阈值（毫秒）
const PERFORMANCE_THRESHOLDS = {
  WORKFLOW_INITIALIZATION: 50,
  WORKFLOW_START: 30,
  STATUS_CHECK: 10,
  CONTEXT_UPDATE: 20,
  CONCURRENT_WORKFLOWS: 200
};

describe('工作流模块性能测试', () => {
  let workflowManager: WorkflowManager;
  let eventBus: EventBus;
  let config: WorkflowManagerConfig;

  beforeEach(() => {
    eventBus = new EventBus();

    config = {
      maxConcurrentWorkflows: 100,
      defaultTimeout: 30000,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: true
    };

    workflowManager = new WorkflowManager(config, eventBus);
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('工作流初始化性能', () => {
    it('应在性能阈值内初始化工作流', async () => {
      const context: IWorkflowContext = {
        workflow_id: 'perf-test-workflow',
        user_id: 'perf-test-user',
        session_id: 'perf-test-session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { performance: 'test' }
      };

      const startTime = performance.now();
      const result = await workflowManager.initializeWorkflow(context);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(result.workflow_id).toMatch(/^workflow_\d+_[a-z0-9]+$/);
      expect(result.status).toBe(WorkflowStatus.CREATED);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.WORKFLOW_INITIALIZATION);
    });

    it('应在批量初始化中保持性能', async () => {
      const batchSize = 50;
      const promises = [];

      const startTime = performance.now();

      for (let i = 0; i < batchSize; i++) {
        const context: IWorkflowContext = {
          workflow_id: `batch-workflow-${i}`,
          user_id: `user-${i}`,
          session_id: `session-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { batch: i }
        };

        promises.push(workflowManager.initializeWorkflow(context));
      }

      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / batchSize;

      expect(results).toHaveLength(batchSize);
      expect(results.every(r => r.workflow_id.match(/^workflow_\d+_[a-z0-9]+$/))).toBe(true);
      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.WORKFLOW_INITIALIZATION);
    });
  });

  describe('工作流启动性能', () => {
    it('应在性能阈值内启动工作流', async () => {
      const context: IWorkflowContext = {
        workflow_id: 'start-perf-test',
        user_id: 'test-user',
        session_id: 'test-session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {}
      };

      const initResult = await workflowManager.initializeWorkflow(context);

      const startTime = performance.now();
      const startResult = await workflowManager.startWorkflow(initResult.workflow_id);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(startResult.status).toBe(WorkflowStatus.IN_PROGRESS);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.WORKFLOW_START);
    });
  });

  describe('状态查询性能', () => {
    it('应在性能阈值内查询工作流状态', async () => {
      const context: IWorkflowContext = {
        workflow_id: 'status-perf-test',
        user_id: 'test-user',
        session_id: 'test-session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {}
      };

      const initResult = await workflowManager.initializeWorkflow(context);

      const startTime = performance.now();
      const status = await workflowManager.getWorkflowStatus(initResult.workflow_id);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(status).toBe(WorkflowStatus.CREATED);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.STATUS_CHECK);
    });
  });

  describe('上下文更新性能', () => {
    it('应在性能阈值内更新工作流上下文', async () => {
      const context: IWorkflowContext = {
        workflow_id: 'update-perf-test',
        user_id: 'test-user',
        session_id: 'test-session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { step: 1 }
      };

      const initResult = await workflowManager.initializeWorkflow(context);

      const startTime = performance.now();
      await workflowManager.updateWorkflowContext(initResult.workflow_id, {
        metadata: { step: 2, progress: 50 }
      });
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.CONTEXT_UPDATE);

      // 验证更新成功
      const execution = await workflowManager.getWorkflowExecution(initResult.workflow_id);
      expect(execution?.context.metadata).toEqual({ step: 2, progress: 50 });
    });
  });

  describe('阶段处理器性能', () => {
    it('应在注册大量阶段处理器时保持性能', () => {
      const handlerCount = 100;
      const handlers = [];

      const startTime = performance.now();

      for (let i = 0; i < handlerCount; i++) {
        const handler = jest.fn().mockResolvedValue({ success: true, data: `result-${i}` });
        handlers.push(handler);

        // 循环使用不同的阶段类型
        const stageTypes = Object.values(WorkflowStageType);
        const stageType = stageTypes[i % stageTypes.length];

        workflowManager.registerStageHandler(stageType, handler);
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / handlerCount;

      expect(averageDuration).toBeLessThan(1); // 每个注册应该非常快
    });
  });

  describe('指标收集性能', () => {
    it('应在频繁指标查询中保持性能', async () => {
      // 创建一些工作流以产生指标
      for (let i = 0; i < 10; i++) {
        const context: IWorkflowContext = {
          workflow_id: `metrics-test-${i}`,
          user_id: `user-${i}`,
          session_id: `session-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { index: i }
        };

        await workflowManager.initializeWorkflow(context);
      }

      const queryCount = 100;
      const startTime = performance.now();

      for (let i = 0; i < queryCount; i++) {
        const metrics = workflowManager.getMetrics();
        expect(metrics).toBeDefined();
        expect(metrics.total_executions).toBeGreaterThan(0);
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / queryCount;

      expect(averageDuration).toBeLessThan(1); // 指标查询应该非常快
    });
  });
});
