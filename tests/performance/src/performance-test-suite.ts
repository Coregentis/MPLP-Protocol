/**
 * MPLP v1.0 Alpha 性能基准测试套件
 * 
 * 全面的性能测试框架，包括单机性能、并发负载、分布式性能和压力测试
 */

import { CoreOrchestrator, WorkflowExecutionRequest } from '../../../src/core/orchestrator/core.orchestrator';
import { MLPPOrchestrationManager } from '../../../src/core/protocols/cross-cutting-concerns/orchestration-manager';
import { MLPPStateSyncManager } from '../../../src/core/protocols/cross-cutting-concerns/state-sync-manager';
import { MLPPTransactionManager } from '../../../src/core/protocols/cross-cutting-concerns/transaction-manager';
import { MLPPProtocolVersionManager } from '../../../src/core/protocols/cross-cutting-concerns/protocol-version-manager';

/**
 * 性能测试配置接口
 */
export interface PerformanceTestConfig {
  duration: number;           // 测试持续时间（毫秒）
  warmupTime: number;         // 预热时间（毫秒）
  cooldownTime: number;       // 冷却时间（毫秒）
  maxConcurrency: number;     // 最大并发数
  workflowComplexity: 'simple' | 'medium' | 'complex';
  resourceLimits: {
    memory: string;           // 内存限制
    cpu: string;              // CPU限制
  };
}

/**
 * 性能测试结果接口
 */
export interface PerformanceTestResult {
  testName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  
  // 执行指标
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  
  // 性能指标
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  
  // 吞吐量指标
  requestsPerSecond: number;
  throughput: number;
  
  // 资源使用指标
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    average: number;
  };
  cpuUsage: {
    average: number;
    peak: number;
  };
  
  // 详细统计
  responseTimeDistribution: number[];
  errorDetails: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private responseTimes: number[] = [];
  private errors: Map<string, number> = new Map();
  private memorySnapshots: number[] = [];
  private cpuSnapshots: number[] = [];
  private monitoringInterval?: NodeJS.Timeout;

  start(): void {
    this.startTime = Date.now();
    this.responseTimes = [];
    this.errors.clear();
    this.memorySnapshots = [];
    this.cpuSnapshots = [];

    // 每秒收集一次系统指标
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 1000);
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
  }

  recordError(error: string): void {
    const count = this.errors.get(error) || 0;
    this.errors.set(error, count + 1);
  }

  private collectSystemMetrics(): void {
    // 收集内存使用情况
    const memoryUsage = process.memoryUsage();
    this.memorySnapshots.push(memoryUsage.heapUsed);

    // 收集CPU使用情况（简化实现）
    const cpuUsage = process.cpuUsage();
    this.cpuSnapshots.push(cpuUsage.user + cpuUsage.system);
  }

  generateReport(testName: string): PerformanceTestResult {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const totalRequests = this.responseTimes.length;
    const failedRequests = Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0);
    const successfulRequests = totalRequests - failedRequests;

    // 计算响应时间统计
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const averageResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    const p50ResponseTime = this.getPercentile(sortedResponseTimes, 0.5);
    const p95ResponseTime = this.getPercentile(sortedResponseTimes, 0.95);
    const p99ResponseTime = this.getPercentile(sortedResponseTimes, 0.99);

    // 计算内存使用统计
    const memoryUsage = {
      initial: this.memorySnapshots[0] || 0,
      peak: Math.max(...this.memorySnapshots),
      final: this.memorySnapshots[this.memorySnapshots.length - 1] || 0,
      average: this.memorySnapshots.reduce((sum, mem) => sum + mem, 0) / this.memorySnapshots.length
    };

    // 计算CPU使用统计
    const cpuUsage = {
      average: this.cpuSnapshots.reduce((sum, cpu) => sum + cpu, 0) / this.cpuSnapshots.length,
      peak: Math.max(...this.cpuSnapshots)
    };

    // 生成错误详情
    const errorDetails = Array.from(this.errors.entries()).map(([error, count]) => ({
      error,
      count,
      percentage: (count / totalRequests) * 100
    }));

    return {
      testName,
      startTime: new Date(this.startTime),
      endTime: new Date(endTime),
      duration,
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate: failedRequests / totalRequests,
      averageResponseTime,
      p50ResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      minResponseTime: Math.min(...sortedResponseTimes),
      maxResponseTime: Math.max(...sortedResponseTimes),
      requestsPerSecond: totalRequests / (duration / 1000),
      throughput: successfulRequests / (duration / 1000),
      memoryUsage,
      cpuUsage,
      responseTimeDistribution: this.generateDistribution(sortedResponseTimes),
      errorDetails
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[index] || 0;
  }

  private generateDistribution(sortedResponseTimes: number[]): number[] {
    const buckets = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    const distribution = new Array(buckets.length + 1).fill(0);

    for (const time of sortedResponseTimes) {
      let bucketIndex = buckets.findIndex(bucket => time <= bucket);
      if (bucketIndex === -1) bucketIndex = buckets.length;
      distribution[bucketIndex]++;
    }

    return distribution;
  }
}

/**
 * 工作流生成器
 */
export class WorkflowGenerator {
  static generateSimpleWorkflow(id: string): WorkflowExecutionRequest {
    return {
      contextId: `perf-test-${id}`,
      workflowConfig: {
        workflowId: `simple-workflow-${id}`,
        stages: [
          {
            stageId: 'simple-context',
            moduleName: 'context',
            stageType: 'sequential',
            configuration: {
              operation: 'create',
              data: { testId: id, complexity: 'simple' }
            }
          }
        ]
      },
      metadata: {
        source: 'performance-test',
        timestamp: new Date().toISOString(),
        priority: 'normal'
      }
    };
  }

  static generateMediumWorkflow(id: string): WorkflowExecutionRequest {
    return {
      contextId: `perf-test-${id}`,
      workflowConfig: {
        workflowId: `medium-workflow-${id}`,
        stages: [
          {
            stageId: 'context-stage',
            moduleName: 'context',
            stageType: 'sequential',
            configuration: {
              operation: 'create',
              data: { testId: id, complexity: 'medium' }
            }
          },
          {
            stageId: 'plan-stage',
            moduleName: 'plan',
            stageType: 'sequential',
            configuration: {
              operation: 'create',
              data: { planType: 'performance-test', objectives: ['测试性能'] }
            }
          },
          {
            stageId: 'role-stage',
            moduleName: 'role',
            stageType: 'sequential',
            configuration: {
              operation: 'assign',
              data: { roleType: 'test-executor' }
            }
          }
        ]
      },
      metadata: {
        source: 'performance-test',
        timestamp: new Date().toISOString(),
        priority: 'normal'
      }
    };
  }

  static generateComplexWorkflow(id: string): WorkflowExecutionRequest {
    return {
      contextId: `perf-test-${id}`,
      workflowConfig: {
        workflowId: `complex-workflow-${id}`,
        stages: [
          {
            stageId: 'context-stage',
            moduleName: 'context',
            stageType: 'sequential',
            configuration: {
              operation: 'create',
              data: { testId: id, complexity: 'complex' }
            }
          },
          {
            stageId: 'plan-stage',
            moduleName: 'plan',
            stageType: 'sequential',
            configuration: {
              operation: 'create',
              data: { planType: 'complex-performance-test', objectives: ['测试复杂性能', '验证扩展性'] }
            }
          },
          {
            stageId: 'role-stage',
            moduleName: 'role',
            stageType: 'sequential',
            configuration: {
              operation: 'assign',
              data: { roleType: 'complex-test-executor' }
            }
          },
          {
            stageId: 'confirm-stage',
            moduleName: 'confirm',
            stageType: 'sequential',
            configuration: {
              operation: 'request',
              data: { approvalType: 'performance-validation' }
            }
          },
          {
            stageId: 'trace-stage',
            moduleName: 'trace',
            stageType: 'sequential',
            configuration: {
              operation: 'monitor',
              data: { monitoringType: 'performance-tracking' }
            }
          }
        ]
      },
      metadata: {
        source: 'performance-test',
        timestamp: new Date().toISOString(),
        priority: 'high'
      }
    };
  }
}

/**
 * 性能测试套件主类
 */
export class PerformanceTestSuite {
  private coreOrchestrator: CoreOrchestrator;
  private monitor: PerformanceMonitor;

  constructor() {
    this.coreOrchestrator = this.initializeCoreOrchestrator();
    this.monitor = new PerformanceMonitor();
  }

  /**
   * 单机性能测试
   */
  async runSingleNodePerformanceTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    console.log('🚀 开始单机性能测试...');
    
    this.monitor.start();
    
    try {
      // 预热阶段
      await this.warmup(config.warmupTime);
      
      // 主测试阶段
      const promises: Promise<void>[] = [];
      const startTime = Date.now();
      let requestCount = 0;
      
      while (Date.now() - startTime < config.duration) {
        if (promises.length < config.maxConcurrency) {
          const workflowId = `single-node-${requestCount++}`;
          const workflow = this.generateWorkflow(workflowId, config.workflowComplexity);
          
          const promise = this.executeWorkflowWithTiming(workflow);
          promises.push(promise);
          
          // 移除已完成的Promise
          promise.finally(() => {
            const index = promises.indexOf(promise);
            if (index > -1) {
              promises.splice(index, 1);
            }
          });
        }
        
        // 短暂等待以避免过度消耗CPU
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      // 等待所有请求完成
      await Promise.allSettled(promises);
      
      // 冷却阶段
      await this.cooldown(config.cooldownTime);
      
    } finally {
      this.monitor.stop();
    }
    
    return this.monitor.generateReport('单机性能测试');
  }

  /**
   * 并发负载测试
   */
  async runConcurrentLoadTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    console.log('🔄 开始并发负载测试...');
    
    this.monitor.start();
    
    try {
      // 预热
      await this.warmup(config.warmupTime);
      
      // 并发执行
      const promises: Promise<void>[] = [];
      
      for (let i = 0; i < config.maxConcurrency; i++) {
        const workflowId = `concurrent-${i}`;
        const workflow = this.generateWorkflow(workflowId, config.workflowComplexity);
        promises.push(this.executeWorkflowWithTiming(workflow));
      }
      
      await Promise.allSettled(promises);
      
      // 冷却
      await this.cooldown(config.cooldownTime);
      
    } finally {
      this.monitor.stop();
    }
    
    return this.monitor.generateReport('并发负载测试');
  }

  /**
   * 压力测试
   */
  async runStressTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    console.log('💪 开始压力测试...');
    
    this.monitor.start();
    
    try {
      const startTime = Date.now();
      let requestCount = 0;
      
      // 持续增加负载直到系统极限
      while (Date.now() - startTime < config.duration) {
        const concurrency = Math.min(requestCount / 100 + 1, config.maxConcurrency * 2);
        const promises: Promise<void>[] = [];
        
        for (let i = 0; i < concurrency; i++) {
          const workflowId = `stress-${requestCount++}`;
          const workflow = this.generateWorkflow(workflowId, config.workflowComplexity);
          promises.push(this.executeWorkflowWithTiming(workflow));
        }
        
        await Promise.allSettled(promises);
        
        // 短暂休息
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } finally {
      this.monitor.stop();
    }
    
    return this.monitor.generateReport('压力测试');
  }

  private async executeWorkflowWithTiming(workflow: WorkflowExecutionRequest): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.coreOrchestrator.executeWorkflow(workflow);
      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.monitor.recordResponseTime(responseTime);
      this.monitor.recordError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private generateWorkflow(id: string, complexity: string): WorkflowExecutionRequest {
    switch (complexity) {
      case 'simple':
        return WorkflowGenerator.generateSimpleWorkflow(id);
      case 'medium':
        return WorkflowGenerator.generateMediumWorkflow(id);
      case 'complex':
        return WorkflowGenerator.generateComplexWorkflow(id);
      default:
        return WorkflowGenerator.generateSimpleWorkflow(id);
    }
  }

  private async warmup(duration: number): Promise<void> {
    console.log(`🔥 预热阶段 (${duration}ms)...`);
    const warmupWorkflow = WorkflowGenerator.generateSimpleWorkflow('warmup');
    await this.coreOrchestrator.executeWorkflow(warmupWorkflow);
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  private async cooldown(duration: number): Promise<void> {
    console.log(`❄️ 冷却阶段 (${duration}ms)...`);
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  private initializeCoreOrchestrator(): CoreOrchestrator {
    // 创建核心管理器
    const orchestrationManager = new MLPPOrchestrationManager();
    const stateSyncManager = new MLPPStateSyncManager();
    const transactionManager = new MLPPTransactionManager();
    const protocolVersionManager = new MLPPProtocolVersionManager();

    // 创建Mock服务（性能测试用）
    const mockOrchestrationService = {} as any;
    const mockResourceService = {
      allocateResources: async () => ({ allocationId: 'perf-test-resource', status: 'allocated' })
    } as any;
    const mockMonitoringService = {} as any;
    const mockSecurityManager = {
      validateWorkflowExecution: async () => Promise.resolve()
    } as any;
    const mockPerformanceMonitor = {
      startTimer: () => ({ stop: () => Math.random() * 100 })
    } as any;
    const mockEventBusManager = {
      publish: async () => {},
      subscribe: () => {},
      unsubscribe: () => {}
    } as any;
    const mockErrorHandler = {
      handleError: () => {},
      createError: (message: string) => new Error(message)
    } as any;
    const mockCoordinationManager = {
      coordinateModules: async () => ({ success: true, results: {} })
    } as any;

    return new CoreOrchestrator(
      mockOrchestrationService,
      mockResourceService,
      mockMonitoringService,
      mockSecurityManager,
      mockPerformanceMonitor,
      mockEventBusManager,
      mockErrorHandler,
      mockCoordinationManager,
      orchestrationManager,
      stateSyncManager,
      transactionManager,
      protocolVersionManager
    );
  }
}
