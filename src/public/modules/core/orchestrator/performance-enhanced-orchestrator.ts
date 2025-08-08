/**
 * 性能增强版调度器
 * 通过组合模式为原有CoreOrchestrator添加性能优化功能
 * 保持向后兼容性，不破坏原有功能
 * 
 * @version 1.0.0
 * @created 2025-01-29T05:00:00+08:00
 */

import { UUID } from '../../../shared/types';
import { Logger } from '../../../utils/logger';
import {
  WorkflowConfiguration,
  WorkflowExecutionResult,
  OrchestratorConfiguration,
  ModuleInterface
} from '../types/core.types';
import { CoreOrchestrator } from './core-orchestrator';
import { 
  IntelligentCacheManager, 
  BatchProcessor, 
  BusinessPerformanceMonitor 
} from '../../../performance/real-performance-optimizer';

/**
 * 性能增强版调度器
 * 使用装饰器模式为原有CoreOrchestrator添加性能优化功能
 */
export class PerformanceEnhancedOrchestrator {
  private readonly logger: Logger;
  private readonly coreOrchestrator: CoreOrchestrator;
  
  // 性能优化组件
  private readonly cache: IntelligentCacheManager;
  private readonly batchProcessor: BatchProcessor<unknown>;
  private readonly performanceMonitor: BusinessPerformanceMonitor;
  
  // 性能统计
  private stats = {
    totalExecutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageExecutionTime: 0
  };

  constructor(configuration: OrchestratorConfiguration) {
    this.logger = new Logger('PerformanceEnhancedOrchestrator');
    this.coreOrchestrator = new CoreOrchestrator(configuration);
    
    // 初始化性能优化组件
    this.cache = new IntelligentCacheManager(1000);
    this.batchProcessor = new BatchProcessor();
    this.performanceMonitor = new BusinessPerformanceMonitor();
    
    this.initializePerformanceOptimizations();
  }

  private initializePerformanceOptimizations(): void {
    // 设置批处理器
    this.batchProcessor.registerProcessor(
      'performance_metrics',
      async (metrics: unknown[]) => {
        // 批量处理性能指标
        for (const metric of metrics) {
          this.performanceMonitor.recordBusinessMetric(metric.name, metric.value, metric.metadata);
        }
      },
      10, // 批大小
      100 // 100ms刷新间隔
    );

    // 设置性能监控告警
    this.performanceMonitor.setAlertThreshold('workflow_execution_time', 1000, 2000);
    this.performanceMonitor.on('alert', (alert) => {
      this.logger.warn(`Performance alert: ${alert.level} - ${alert.metric} = ${alert.value}`);
    });
  }

  /**
   * 注册模块 - 委托给核心调度器
   */
  registerModule(module: ModuleInterface): void {
    this.coreOrchestrator.registerModule(module);
  }

  /**
   * 性能增强版工作流执行
   * 在原有功能基础上添加缓存、监控等优化
   */
  async executeWorkflow(
    contextId: UUID,
    workflowConfig?: Partial<WorkflowConfiguration>
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    this.stats.totalExecutions++;

    try {
      // 1. 缓存检查
      const cacheKey = this.generateCacheKey(contextId, workflowConfig);
      const cachedResult = await this.cache.get(cacheKey);
      
      if (cachedResult && this.isCacheResultValid(cachedResult)) {
        this.stats.cacheHits++;
        
        // 批量记录缓存命中指标
        this.batchProcessor.add('performance_metrics', {
          name: 'cache_hit',
          value: 1,
          metadata: { contextId, cached: true }
        });
        
        // 更新缓存结果的时间戳
        const result = { ...cachedResult };
        result.startedAt = new Date().toISOString();
        result.completedAt = new Date().toISOString();
        result.total_duration_ms = Date.now() - startTime;
        
        this.logger.info(`Workflow ${contextId} served from cache (${result.total_duration_ms}ms)`);
        return result;
      }

      this.stats.cacheMisses++;
      
      // 批量记录缓存未命中指标
      this.batchProcessor.add('performance_metrics', {
        name: 'cache_miss',
        value: 1,
        metadata: { contextId, cached: false }
      });

      // 2. 委托给核心调度器执行
      const result = await this.coreOrchestrator.executeWorkflow(contextId, workflowConfig);

      // 3. 缓存成功的结果
      if (result.status === 'completed') {
        await this.cache.set(cacheKey, result, 300000); // 5分钟缓存
      }

      // 4. 记录性能指标
      const executionTime = Date.now() - startTime;
      this.updatePerformanceStats(executionTime);
      
      // 批量记录执行指标
      this.batchProcessor.add('performance_metrics', {
        name: 'workflow_execution_time',
        value: executionTime,
        metadata: { 
          contextId, 
          status: result.status,
          stageCount: result.stages.length 
        }
      });

      this.logger.info(`Workflow ${contextId} executed in ${executionTime}ms`);
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updatePerformanceStats(executionTime);
      
      // 批量记录错误指标
      this.batchProcessor.add('performance_metrics', {
        name: 'workflow_error',
        value: 1,
        metadata: { 
          contextId, 
          error: error instanceof Error ? error.message : String(error),
          executionTime 
        }
      });

      this.logger.error(`Workflow execution failed for ${contextId}:`, error);
      throw error;
    }
  }

  /**
   * 获取活跃执行 - 委托给核心调度器
   */
  getActiveExecutions() {
    return this.coreOrchestrator.getActiveExecutions();
  }

  /**
   * 获取模块状态 - 委托给核心调度器
   */
  getModuleStatuses() {
    return this.coreOrchestrator.getModuleStatuses();
  }

  /**
   * 添加事件监听器 - 委托给核心调度器
   */
  addEventListener(listener: (event: unknown) => void): void {
    this.coreOrchestrator.addEventListener(listener);
  }

  /**
   * 移除事件监听器 - 委托给核心调度器
   */
  removeEventListener(listener: (event: unknown) => void): void {
    this.coreOrchestrator.removeEventListener(listener);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(contextId: UUID, config?: Partial<WorkflowConfiguration>): string {
    const configHash = config ? JSON.stringify(config) : 'default';
    return `workflow_${contextId}_${Buffer.from(configHash).toString('base64').slice(0, 10)}`;
  }

  /**
   * 检查缓存结果是否有效
   */
  private isCacheResultValid(cachedResult: unknown): boolean {
    return cachedResult && 
           cachedResult.status === 'completed' && 
           cachedResult.stages && 
           cachedResult.stages.length > 0;
  }

  /**
   * 更新性能统计
   */
  private updatePerformanceStats(executionTime: number): void {
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalExecutions - 1) + executionTime;
    this.stats.averageExecutionTime = totalTime / this.stats.totalExecutions;
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats() {
    return {
      ...this.stats,
      cacheStats: this.cache.getStats(),
      businessHealthScore: this.performanceMonitor.getBusinessHealthScore(),
      cacheHitRate: this.stats.totalExecutions > 0 ? 
        this.stats.cacheHits / this.stats.totalExecutions : 0
    };
  }

  /**
   * 预热缓存
   */
  async warmupCache(contextIds: UUID[], config?: Partial<WorkflowConfiguration>): Promise<void> {
    this.logger.info(`Starting cache warmup for ${contextIds.length} contexts`);
    
    const warmupPromises = contextIds.map(async (contextId) => {
      try {
        await this.executeWorkflow(contextId, config);
      } catch (error) {
        this.logger.warn(`Cache warmup failed for context ${contextId}:`, error);
      }
    });

    await Promise.all(warmupPromises);
    this.logger.info('Cache warmup completed');
  }

  /**
   * 清理资源
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down PerformanceEnhancedOrchestrator...');
    
    // 刷新所有批处理
    await this.batchProcessor.flushAll();
    
    // 委托给核心调度器清理
    if (typeof this.coreOrchestrator.shutdown === 'function') {
      await this.coreOrchestrator.shutdown();
    }

    this.logger.info('PerformanceEnhancedOrchestrator shutdown completed');
  }

  /**
   * 获取核心调度器实例（用于直接访问原有功能）
   */
  getCoreOrchestrator(): CoreOrchestrator {
    return this.coreOrchestrator;
  }
}
