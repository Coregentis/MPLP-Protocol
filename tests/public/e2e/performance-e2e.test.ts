/**
 * MPLP性能端到端测试
 * 
 * 测试系统在真实负载下的性能表现
 * 验证吞吐量、响应时间、资源使用等关键性能指标
 * 
 * @version 1.0.0
 * @created 2025-01-28T23:00:00+08:00
 */

import { CoreOrchestrator } from '../../../src/public/modules/core/orchestrator/core-orchestrator';
import { WorkflowManager } from '../../../src/public/modules/core/workflow/workflow-manager';
import {
  WorkflowStage,
  OrchestratorConfiguration,
  ModuleInterface,
  ExecutionContext,
  ModuleStatus,
  WorkflowExecutionResult
} from '../../../src/public/modules/core/types/core.types';
import { TestDataFactory } from '../test-utils/test-data-factory';
import { TestHelpers } from '../test-utils/test-helpers';

describe('MPLP性能端到端测试', () => {
  let orchestrator: CoreOrchestrator;
  let performanceMetrics: {
    executionTimes: number[];
    memoryUsage: number[];
    cpuUsage: number[];
    throughput: number[];
  } = {
    executionTimes: [],
    memoryUsage: [],
    cpuUsage: [],
    throughput: []
  };

  beforeAll(async () => {
    // 创建高性能配置
    const config: OrchestratorConfiguration = {
      default_workflow: {
        stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 60000,
        retry_policy: {
          max_attempts: 2,
          delay_ms: 500,
          backoff_multiplier: 1.5,
          max_delay_ms: 5000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: false, // 关闭回滚以提高性能
          notification_enabled: false // 关闭通知以提高性能
        }
      },
      module_timeout_ms: 30000,
      max_concurrent_executions: 20, // 支持更高并发
      enable_performance_monitoring: true,
      enable_event_logging: false // 关闭事件日志以提高性能
    };

    orchestrator = new CoreOrchestrator(config);
    await registerOptimizedModules();
  });

  afterAll(async () => {
    await TestDataFactory.Manager.cleanup();
    
    // 输出性能统计
    console.log('\n=== 性能测试统计 ===');
    console.log(`平均执行时间: ${calculateAverage(performanceMetrics.executionTimes).toFixed(2)}ms`);
    console.log(`最快执行时间: ${Math.min(...performanceMetrics.executionTimes).toFixed(2)}ms`);
    console.log(`最慢执行时间: ${Math.max(...performanceMetrics.executionTimes).toFixed(2)}ms`);
    console.log(`执行时间标准差: ${calculateStandardDeviation(performanceMetrics.executionTimes).toFixed(2)}ms`);
    
    if (performanceMetrics.throughput.length > 0) {
      console.log(`平均吞吐量: ${calculateAverage(performanceMetrics.throughput).toFixed(2)} ops/sec`);
      console.log(`峰值吞吐量: ${Math.max(...performanceMetrics.throughput).toFixed(2)} ops/sec`);
    }
  });

  async function registerOptimizedModules() {
    // 优化的Context模块
    const contextModule: ModuleInterface = {
      module_name: 'context',
      initialize: async () => {
        await TestHelpers.Async.wait(10); // 减少初始化时间
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 模拟轻量级上下文处理
        await TestHelpers.Async.wait(50);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return { 
          success: true, 
          data: {
            context_id: context.context_id,
            name: `Context-${context.context_id.slice(0, 8)}`,
            type: 'performance_test',
            status: 'active'
          },
          metrics: {
            execution_time_ms: executionTime,
            memory_usage_mb: 5,
            cpu_usage_percent: 2
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(5);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'context',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 50,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 优化的Plan模块
    const planModule: ModuleInterface = {
      module_name: 'plan',
      initialize: async () => {
        await TestHelpers.Async.wait(15);
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 模拟轻量级计划生成
        await TestHelpers.Async.wait(80);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return { 
          success: true, 
          data: {
            plan_id: TestDataFactory.Base.generateUUID(),
            context_id: context.context_id,
            name: `Plan-${context.context_id.slice(0, 8)}`,
            steps: [
              { id: '1', name: 'Step 1', duration: '10min' },
              { id: '2', name: 'Step 2', duration: '15min' }
            ]
          },
          metrics: {
            execution_time_ms: executionTime,
            memory_usage_mb: 8,
            cpu_usage_percent: 5
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(8);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'plan',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 80,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 优化的Confirm模块
    const confirmModule: ModuleInterface = {
      module_name: 'confirm',
      initialize: async () => {
        await TestHelpers.Async.wait(8);
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 模拟快速确认
        await TestHelpers.Async.wait(30);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return { 
          success: true, 
          data: {
            confirm_id: TestDataFactory.Base.generateUUID(),
            context_id: context.context_id,
            status: 'approved',
            approved_at: new Date().toISOString()
          },
          metrics: {
            execution_time_ms: executionTime,
            memory_usage_mb: 6,
            cpu_usage_percent: 3
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(5);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'confirm',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 30,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 优化的Trace模块
    const traceModule: ModuleInterface = {
      module_name: 'trace',
      initialize: async () => {
        await TestHelpers.Async.wait(5);
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 模拟轻量级追踪
        await TestHelpers.Async.wait(20);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return { 
          success: true, 
          data: {
            trace_id: TestDataFactory.Base.generateUUID(),
            context_id: context.context_id,
            event_type: 'performance_test_completed',
            timestamp: new Date().toISOString()
          },
          metrics: {
            execution_time_ms: executionTime,
            memory_usage_mb: 4,
            cpu_usage_percent: 2
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(3);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'trace',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 20,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 注册所有优化模块
    orchestrator.registerModule(contextModule);
    orchestrator.registerModule(planModule);
    orchestrator.registerModule(confirmModule);
    orchestrator.registerModule(traceModule);
  }

  function calculateAverage(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  function calculateStandardDeviation(numbers: number[]): number {
    const avg = calculateAverage(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquaredDiff = calculateAverage(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  describe('响应时间性能测试', () => {
    it('应该在合理时间内完成单个工作流执行', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const startTime = performance.now();

      const result = await orchestrator.executeWorkflow(contextId);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 记录性能指标
      performanceMetrics.executionTimes.push(executionTime);

      // 验证执行成功
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(4);

      // 验证性能要求
      expect(executionTime).toBeLessThan(500); // 应该在500ms内完成
      expect(result.total_duration_ms).toBeLessThan(300); // 工作流本身应该在300ms内完成
    });

    it('应该保持一致的响应时间', async () => {
      const iterations = 10;
      const executionTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const contextId = TestDataFactory.Base.generateUUID();
        const startTime = performance.now();

        const result = await orchestrator.executeWorkflow(contextId);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        executionTimes.push(executionTime);
        performanceMetrics.executionTimes.push(executionTime);

        expect(result.status).toBe('completed');
      }

      // 验证响应时间一致性
      const avgTime = calculateAverage(executionTimes);
      const stdDev = calculateStandardDeviation(executionTimes);
      
      expect(avgTime).toBeLessThan(400); // 平均响应时间应该小于400ms
      expect(stdDev).toBeLessThan(100); // 标准差应该小于100ms，表示响应时间稳定
    });
  });

  describe('吞吐量性能测试', () => {
    it('应该支持高并发工作流执行', async () => {
      const concurrentExecutions = 10;
      const contextIds = Array.from({ length: concurrentExecutions }, () => 
        TestDataFactory.Base.generateUUID()
      );

      const startTime = performance.now();

      // 并发执行
      const promises = contextIds.map(contextId => 
        orchestrator.executeWorkflow(contextId)
      );

      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const throughput = (concurrentExecutions / totalTime) * 1000; // ops/sec

      // 记录吞吐量
      performanceMetrics.throughput.push(throughput);

      // 验证所有执行成功
      expect(results).toHaveLength(concurrentExecutions);
      results.forEach(result => {
        expect(result.status).toBe('completed');
        expect(result.stages).toHaveLength(4);
      });

      // 验证吞吐量要求
      expect(throughput).toBeGreaterThan(5); // 应该支持至少5 ops/sec
      expect(totalTime).toBeLessThan(5000); // 10个并发执行应该在5秒内完成
    });

    it('应该在负载下保持稳定性', async () => {
      const batchSize = 5;
      const batchCount = 3;
      const allResults: WorkflowExecutionResult[] = [];

      for (let batch = 0; batch < batchCount; batch++) {
        const contextIds = Array.from({ length: batchSize }, () => 
          TestDataFactory.Base.generateUUID()
        );

        const batchStartTime = performance.now();

        const promises = contextIds.map(contextId => 
          orchestrator.executeWorkflow(contextId)
        );

        const batchResults = await Promise.all(promises);
        
        const batchEndTime = performance.now();
        const batchTime = batchEndTime - batchStartTime;
        const batchThroughput = (batchSize / batchTime) * 1000;

        performanceMetrics.throughput.push(batchThroughput);
        allResults.push(...batchResults);

        // 验证批次执行成功
        expect(batchResults).toHaveLength(batchSize);
        batchResults.forEach(result => {
          expect(result.status).toBe('completed');
        });

        // 批次间短暂休息
        await TestHelpers.Async.wait(100);
      }

      // 验证总体稳定性
      expect(allResults).toHaveLength(batchSize * batchCount);
      
      // 验证吞吐量稳定性
      const throughputStdDev = calculateStandardDeviation(performanceMetrics.throughput);
      expect(throughputStdDev).toBeLessThan(15); // 吞吐量变化应该小于15 ops/sec（考虑到测试环境的变化）
    });
  });
});
