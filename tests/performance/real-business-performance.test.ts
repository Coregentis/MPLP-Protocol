/**
 * 真实业务场景性能测试
 * 基于实际业务逻辑和异步处理的性能优化验证
 * 
 * @version 1.0.0
 * @created 2025-01-29T04:00:00+08:00
 */

import { performance } from 'perf_hooks';
import { CoreOrchestrator } from '../../src/modules/core/orchestrator/core-orchestrator';
import {
  WorkflowStage,
  OrchestratorConfiguration,
  ModuleInterface,
  ExecutionContext,
  ModuleStatus
} from '../../src/modules/core/types/core.types';
import { TestDataFactory } from '../test-utils/test-data-factory';
import { 
  IntelligentCacheManager, 
  BatchProcessor, 
  BusinessPerformanceMonitor 
} from '../../src/core/performance/real-performance-optimizer';

describe('真实业务场景性能测试', () => {
  let orchestrator: CoreOrchestrator;
  let cache: IntelligentCacheManager;
  let batchProcessor: BatchProcessor<any>;
  let performanceMonitor: BusinessPerformanceMonitor;
  
  let performanceMetrics: {
    responseTimes: number[];
    throughputTests: number[];
    cacheHitRates: number[];
    memoryUsage: number[];
  } = {
    responseTimes: [],
    throughputTests: [],
    cacheHitRates: [],
    memoryUsage: []
  };

  beforeAll(async () => {
    // 初始化性能优化组件
    cache = new IntelligentCacheManager(1000);
    batchProcessor = new BatchProcessor();
    performanceMonitor = new BusinessPerformanceMonitor();

    // 设置批处理器
    batchProcessor.registerProcessor(
      'database_operations',
      async (operations: any[]) => {
        // 模拟批量数据库操作
        await simulateAsyncOperation(operations.length * 2); // 每个操作2ms
      },
      5, // 批大小
      20 // 20ms刷新间隔
    );

    // 创建真实的高性能配置
    const config: OrchestratorConfiguration = {
      default_workflow: {
        stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 30000,
        retry_policy: {
          max_attempts: 2,
          delay_ms: 100,
          backoff_multiplier: 1.5,
          max_delay_ms: 1000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: true,
          notification_enabled: true
        }
      },
      module_timeout_ms: 10000,
      max_concurrent_executions: 50, // 现实的并发数
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    orchestrator = new CoreOrchestrator(config);
    await registerOptimizedBusinessModules();
  });

  afterAll(async () => {
    await TestDataFactory.Manager.cleanup();
    await batchProcessor.flushAll();
    
    console.log('\n=== 真实业务性能测试结果 ===');
    if (performanceMetrics.responseTimes.length > 0) {
      console.log(`平均响应时间: ${calculateAverage(performanceMetrics.responseTimes).toFixed(2)}ms`);
      console.log(`最快响应时间: ${Math.min(...performanceMetrics.responseTimes).toFixed(2)}ms`);
      console.log(`最慢响应时间: ${Math.max(...performanceMetrics.responseTimes).toFixed(2)}ms`);
      console.log(`响应时间标准差: ${calculateStandardDeviation(performanceMetrics.responseTimes).toFixed(2)}ms`);
    }
    
    if (performanceMetrics.throughputTests.length > 0) {
      console.log(`平均吞吐量: ${calculateAverage(performanceMetrics.throughputTests).toFixed(2)} ops/sec`);
      console.log(`峰值吞吐量: ${Math.max(...performanceMetrics.throughputTests).toFixed(2)} ops/sec`);
    }

    if (performanceMetrics.cacheHitRates.length > 0) {
      console.log(`平均缓存命中率: ${(calculateAverage(performanceMetrics.cacheHitRates) * 100).toFixed(1)}%`);
    }

    console.log(`缓存统计: ${JSON.stringify(cache.getStats())}`);
  });

  async function registerOptimizedBusinessModules() {
    // 真实的Context模块 - 包含数据库查询、缓存优化、业务逻辑
    const contextModule: ModuleInterface = {
      module_name: 'context',
      initialize: async () => {
        await simulateAsyncOperation(30); // 数据库连接初始化
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 1. 缓存检查
        const cacheKey = `context_${context.context_id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
          performanceMonitor.recordBusinessMetric('context_cache_hit', 1);
          return {
            success: true,
            data: cached,
            metrics: {
              execution_time_ms: performance.now() - startTime,
              memory_usage_mb: 2,
              cpu_usage_percent: 1,
              cache_hit: true
            }
          };
        }

        performanceMonitor.recordBusinessMetric('context_cache_miss', 1);

        // 2. 模拟真实的数据库查询
        await simulateAsyncOperation(25); // 数据库查询延迟
        
        // 3. 模拟业务逻辑处理
        const contextData = {
          context_id: context.context_id,
          name: `BusinessContext-${context.context_id.slice(0, 8)}`,
          type: 'multi_agent_collaboration',
          status: 'active',
          created_at: new Date().toISOString(),
          agents: await getAgentConfiguration(), // 异步获取智能体配置
          resources: await checkResourceAvailability(), // 异步资源检查
          metadata: {
            processing_time: performance.now() - startTime,
            optimization_level: 'high'
          }
        };

        // 4. 缓存结果
        await cache.set(cacheKey, contextData, 300000); // 5分钟缓存

        // 5. 批量数据库操作
        batchProcessor.add('database_operations', {
          type: 'context_created',
          contextId: context.context_id,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          data: contextData,
          metrics: {
            execution_time_ms: performance.now() - startTime,
            memory_usage_mb: 6,
            cpu_usage_percent: 4,
            cache_hit: false
          }
        };
      },
      cleanup: async () => {
        await simulateAsyncOperation(10);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'context',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 45,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 真实的Plan模块 - 包含AI服务调用、复杂计算、资源优化
    const planModule: ModuleInterface = {
      module_name: 'plan',
      initialize: async () => {
        await simulateAsyncOperation(40); // AI服务连接初始化
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 1. 缓存检查
        const cacheKey = `plan_${context.context_id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
          performanceMonitor.recordBusinessMetric('plan_cache_hit', 1);
          return {
            success: true,
            data: cached,
            metrics: {
              execution_time_ms: performance.now() - startTime,
              memory_usage_mb: 3,
              cpu_usage_percent: 2,
              cache_hit: true
            }
          };
        }

        performanceMonitor.recordBusinessMetric('plan_cache_miss', 1);

        // 2. 模拟AI服务调用
        const aiPlanningResult = await simulateAIPlanning(context); // 60ms AI调用
        
        // 3. 模拟资源优化计算
        const resourceOptimization = await simulateResourceOptimization(); // 35ms计算
        
        // 4. 模拟依赖分析
        const dependencyAnalysis = await simulateDependencyAnalysis(); // 25ms分析

        const planData = {
          plan_id: generateId(),
          context_id: context.context_id,
          name: `OptimizedPlan-${context.context_id.slice(0, 8)}`,
          description: 'AI-optimized execution plan with resource allocation',
          steps: aiPlanningResult.steps,
          total_estimated_duration: aiPlanningResult.estimatedDuration,
          resource_requirements: resourceOptimization.requirements,
          dependencies: dependencyAnalysis.dependencies,
          optimization_score: aiPlanningResult.optimizationScore,
          ai_confidence: aiPlanningResult.confidence
        };

        // 5. 缓存结果
        await cache.set(cacheKey, planData, 600000); // 10分钟缓存

        // 6. 批量操作
        batchProcessor.add('database_operations', {
          type: 'plan_created',
          planId: planData.plan_id,
          contextId: context.context_id,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          data: planData,
          metrics: {
            execution_time_ms: performance.now() - startTime,
            memory_usage_mb: 12,
            cpu_usage_percent: 8,
            cache_hit: false
          }
        };
      },
      cleanup: async () => {
        await simulateAsyncOperation(15);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'plan',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 120,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 真实的Confirm模块 - 包含审批流程、通知系统、权限检查
    const confirmModule: ModuleInterface = {
      module_name: 'confirm',
      initialize: async () => {
        await simulateAsyncOperation(20);
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 1. 权限检查
        const permissionCheck = await simulatePermissionCheck(context); // 20ms
        
        // 2. 审批规则验证
        const approvalValidation = await simulateApprovalValidation(); // 30ms
        
        // 3. 通知系统调用
        await simulateNotificationSystem(); // 15ms

        const confirmData = {
          confirm_id: generateId(),
          context_id: context.context_id,
          subject: {
            type: 'execution_approval',
            title: 'Multi-Agent Execution Approval',
            description: 'Approval for optimized execution plan'
          },
          approval_workflow: {
            steps: approvalValidation.steps,
            final_status: permissionCheck.approved ? 'approved' : 'pending',
            approved_at: permissionCheck.approved ? new Date().toISOString() : null,
            approver: permissionCheck.approver
          },
          permissions: permissionCheck.permissions,
          notifications_sent: true
        };

        // 4. 批量操作
        batchProcessor.add('database_operations', {
          type: 'approval_processed',
          confirmId: confirmData.confirm_id,
          contextId: context.context_id,
          status: confirmData.approval_workflow.final_status,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          data: confirmData,
          metrics: {
            execution_time_ms: performance.now() - startTime,
            memory_usage_mb: 5,
            cpu_usage_percent: 3,
            cache_hit: false
          }
        };
      },
      cleanup: async () => {
        await simulateAsyncOperation(8);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'confirm',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 65,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 真实的Trace模块 - 包含监控数据收集、日志聚合、分析处理
    const traceModule: ModuleInterface = {
      module_name: 'trace',
      initialize: async () => {
        await simulateAsyncOperation(15);
      },
      execute: async (context: ExecutionContext) => {
        const startTime = performance.now();
        
        // 1. 监控数据收集
        const monitoringData = await simulateMonitoringDataCollection(); // 25ms
        
        // 2. 日志聚合处理
        const logAggregation = await simulateLogAggregation(context); // 20ms
        
        // 3. 性能分析
        const performanceAnalysis = await simulatePerformanceAnalysis(); // 30ms

        const traceData = {
          trace_id: generateId(),
          context_id: context.context_id,
          event: {
            event_type: 'workflow_execution_traced',
            source: {
              module: 'mplp_orchestrator',
              component: 'optimized_workflow_engine',
              version: '1.1.0'
            },
            data: {
              workflow_id: context.execution_id,
              monitoring: monitoringData,
              logs: logAggregation.summary,
              performance: performanceAnalysis.metrics
            },
            severity: 'info'
          },
          performance_metrics: performanceAnalysis.metrics,
          correlations: logAggregation.correlations,
          insights: performanceAnalysis.insights
        };

        // 4. 批量操作
        batchProcessor.add('database_operations', {
          type: 'trace_recorded',
          traceId: traceData.trace_id,
          contextId: context.context_id,
          timestamp: new Date().toISOString()
        });

        return {
          success: true,
          data: traceData,
          metrics: {
            execution_time_ms: performance.now() - startTime,
            memory_usage_mb: 8,
            cpu_usage_percent: 5,
            cache_hit: false
          }
        };
      },
      cleanup: async () => {
        await simulateAsyncOperation(12);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'trace',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 75,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    orchestrator.registerModule(contextModule);
    orchestrator.registerModule(planModule);
    orchestrator.registerModule(confirmModule);
    orchestrator.registerModule(traceModule);
  }

  // 辅助函数 - 模拟真实的异步业务操作
  async function simulateAsyncOperation(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getAgentConfiguration(): Promise<any[]> {
    await simulateAsyncOperation(20);
    return [
      { id: 'agent-1', role: 'coordinator', capabilities: ['planning', 'coordination'], status: 'ready' },
      { id: 'agent-2', role: 'executor', capabilities: ['execution', 'monitoring'], status: 'ready' },
      { id: 'agent-3', role: 'validator', capabilities: ['validation', 'quality_assurance'], status: 'ready' }
    ];
  }

  async function checkResourceAvailability(): Promise<any> {
    await simulateAsyncOperation(15);
    return {
      cpu: { available: 8, required: 4, utilization: 0.5 },
      memory: { available: 16, required: 8, utilization: 0.6 },
      storage: { available: 100, required: 20, utilization: 0.3 }
    };
  }

  async function simulateAIPlanning(context: ExecutionContext): Promise<any> {
    await simulateAsyncOperation(60); // AI服务调用延迟
    return {
      steps: [
        { id: '1', name: 'Agent Initialization', duration: '5min', complexity: 'low' },
        { id: '2', name: 'Task Distribution', duration: '15min', complexity: 'medium' },
        { id: '3', name: 'Parallel Execution', duration: '30min', complexity: 'high' },
        { id: '4', name: 'Result Aggregation', duration: '10min', complexity: 'medium' }
      ],
      estimatedDuration: '1hour',
      optimizationScore: 0.87,
      confidence: 0.92
    };
  }

  async function simulateResourceOptimization(): Promise<any> {
    await simulateAsyncOperation(35);
    return {
      requirements: {
        cpu_cores: 4,
        memory_gb: 8,
        storage_gb: 20,
        network_bandwidth: '1Gbps',
        optimization_level: 'high'
      }
    };
  }

  async function simulateDependencyAnalysis(): Promise<any> {
    await simulateAsyncOperation(25);
    return {
      dependencies: [
        { from: 'step-1', to: 'step-2', type: 'sequential' },
        { from: 'step-2', to: 'step-3', type: 'parallel' },
        { from: 'step-3', to: 'step-4', type: 'sequential' }
      ]
    };
  }

  async function simulatePermissionCheck(context: ExecutionContext): Promise<any> {
    await simulateAsyncOperation(20);
    return {
      approved: true,
      approver: 'system_auto_approver',
      permissions: ['execute', 'monitor', 'modify'],
      reason: 'All security and resource checks passed'
    };
  }

  async function simulateApprovalValidation(): Promise<any> {
    await simulateAsyncOperation(30);
    return {
      steps: [
        { rule: 'resource_availability', status: 'passed', score: 0.95 },
        { rule: 'security_compliance', status: 'passed', score: 0.98 },
        { rule: 'business_rules', status: 'passed', score: 0.89 }
      ]
    };
  }

  async function simulateNotificationSystem(): Promise<void> {
    await simulateAsyncOperation(15);
  }

  async function simulateMonitoringDataCollection(): Promise<any> {
    await simulateAsyncOperation(25);
    return {
      system_metrics: {
        cpu_usage: 0.45,
        memory_usage: 0.62,
        disk_io: 156,
        network_io: 89
      },
      application_metrics: {
        response_time: 245,
        throughput: 23.5,
        error_rate: 0.001,
        active_connections: 12
      }
    };
  }

  async function simulateLogAggregation(context: ExecutionContext): Promise<any> {
    await simulateAsyncOperation(20);
    return {
      summary: {
        total_entries: 156,
        error_entries: 1,
        warning_entries: 8,
        info_entries: 147
      },
      correlations: [
        { correlation_id: context.context_id, type: 'workflow_correlation', strength: 1.0 }
      ]
    };
  }

  async function simulatePerformanceAnalysis(): Promise<any> {
    await simulateAsyncOperation(30);
    return {
      metrics: {
        overall_performance_score: 0.89,
        bottlenecks: ['network_latency'],
        optimization_opportunities: ['cache_tuning', 'connection_pooling']
      },
      insights: [
        'System performing within expected parameters',
        'Minor network latency detected in external service calls',
        'Cache hit rate could be improved with better key strategies'
      ]
    };
  }

  function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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

  describe('真实业务性能基准测试', () => {
    it('应该在合理时间内完成包含完整业务逻辑的工作流', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const startTime = performance.now();

      const result = await orchestrator.executeWorkflow(contextId);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      performanceMetrics.responseTimes.push(executionTime);

      // 验证执行成功
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(4);

      // 验证真实的性能目标
      expect(executionTime).toBeLessThan(800); // 800ms是包含所有业务逻辑的合理目标
      expect(result.total_duration_ms).toBeLessThan(600); // 工作流内部时间

      console.log(`完整业务工作流执行时间: ${executionTime.toFixed(2)}ms`);
      console.log(`工作流内部时间: ${result.total_duration_ms.toFixed(2)}ms`);
    });

    it('应该通过缓存显著提升重复执行性能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      // 第一次执行 - 无缓存
      const firstStart = performance.now();
      const firstResult = await orchestrator.executeWorkflow(contextId);
      const firstTime = performance.now() - firstStart;

      // 第二次执行 - 有缓存
      const secondStart = performance.now();
      const secondResult = await orchestrator.executeWorkflow(contextId);
      const secondTime = performance.now() - secondStart;

      performanceMetrics.responseTimes.push(firstTime, secondTime);
      
      const cacheHitRate = secondTime < firstTime * 0.5 ? 1 : 0;
      performanceMetrics.cacheHitRates.push(cacheHitRate);

      // 验证缓存效果
      expect(secondTime).toBeLessThan(firstTime * 0.6); // 缓存应该提升40%+性能
      expect(firstResult.status).toBe('completed');
      expect(secondResult.status).toBe('completed');

      console.log(`首次执行: ${firstTime.toFixed(2)}ms, 缓存执行: ${secondTime.toFixed(2)}ms`);
      console.log(`缓存性能提升: ${((firstTime - secondTime) / firstTime * 100).toFixed(1)}%`);
    });

    it('应该支持现实的并发处理能力', async () => {
      const concurrentExecutions = 15; // 现实的并发数
      const contextIds = Array.from({ length: concurrentExecutions }, () => 
        TestDataFactory.Base.generateUUID()
      );

      const startTime = performance.now();

      const promises = contextIds.map(contextId => 
        orchestrator.executeWorkflow(contextId)
      );

      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const throughput = (concurrentExecutions / totalTime) * 1000;

      performanceMetrics.throughputTests.push(throughput);

      // 验证所有执行成功
      expect(results).toHaveLength(concurrentExecutions);
      results.forEach(result => {
        expect(result.status).toBe('completed');
        expect(result.stages).toHaveLength(4);
      });

      // 验证现实的并发性能目标
      expect(throughput).toBeGreaterThan(8); // 8 ops/sec是现实的目标
      expect(totalTime).toBeLessThan(15000); // 15个并发应该在15秒内完成

      console.log(`${concurrentExecutions}并发执行: ${totalTime.toFixed(0)}ms, 吞吐量: ${throughput.toFixed(2)} ops/sec`);
    });

    it('应该展示批处理优化的效果', async () => {
      const iterations = 10;
      const startTime = performance.now();

      // 连续执行多个工作流，触发批处理
      for (let i = 0; i < iterations; i++) {
        const contextId = TestDataFactory.Base.generateUUID();
        const result = await orchestrator.executeWorkflow(contextId);
        expect(result.status).toBe('completed');
      }

      // 等待批处理完成
      await batchProcessor.flushAll();
      
      const totalTime = performance.now() - startTime;
      const avgTime = totalTime / iterations;

      performanceMetrics.responseTimes.push(avgTime);

      // 验证批处理效果
      expect(avgTime).toBeLessThan(500); // 平均每个工作流500ms
      expect(totalTime).toBeLessThan(8000); // 总时间8秒内

      console.log(`批处理测试: ${iterations}次执行, 总时间: ${totalTime.toFixed(0)}ms, 平均: ${avgTime.toFixed(2)}ms`);
    });

    it('应该在内存使用上保持高效', async () => {
      const initialMemory = process.memoryUsage();
      
      // 执行多个工作流测试内存使用
      const iterations = 20;
      for (let i = 0; i < iterations; i++) {
        const contextId = TestDataFactory.Base.generateUUID();
        const result = await orchestrator.executeWorkflow(contextId);
        expect(result.status).toBe('completed');

        // 每5次检查一次内存使用
        if (i % 5 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = (currentMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
          performanceMetrics.memoryUsage.push(memoryIncrease);
          
          // 验证内存使用合理
          expect(memoryIncrease).toBeLessThan(50); // 内存增长应该小于50MB
        }
      }

      const finalMemory = process.memoryUsage();
      const totalMemoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

      console.log(`${iterations}次执行后内存增长: ${totalMemoryIncrease.toFixed(2)}MB`);
      expect(totalMemoryIncrease).toBeLessThan(100); // 总内存增长应该小于100MB
    });
  });
});
