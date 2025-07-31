/**
 * 性能优化使用示例
 * 展示如何使用PerformanceEnhancedOrchestrator获得最佳性能
 */

import { PerformanceEnhancedOrchestrator } from 'mplp';

// 性能优化配置
const config = {
  // ... 同基础配置
};

// 创建性能增强调度器
const orchestrator = new PerformanceEnhancedOrchestrator(config);

// 注册模块 (同基础示例)
orchestrator.registerModule(exampleModule);

async function performanceOptimizedExample() {
  // 1. 预热缓存
  console.log('预热缓存...');
  await orchestrator.warmupCache(['common-context-1', 'common-context-2']);
  
  // 2. 执行工作流
  console.log('执行工作流...');
  const startTime = Date.now();
  const result = await orchestrator.executeWorkflow('example-context-id');
  const executionTime = Date.now() - startTime;
  
  console.log(`工作流执行完成，耗时: ${executionTime}ms`);
  
  // 3. 查看性能统计
  const stats = orchestrator.getPerformanceStats();
  console.log('性能统计:');
  console.log(`  缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`  平均执行时间: ${stats.averageExecutionTime.toFixed(2)}ms`);
  console.log(`  业务健康度: ${stats.businessHealthScore.toFixed(1)}`);
  
  // 4. 再次执行 (应该命中缓存)
  console.log('再次执行 (缓存测试)...');
  const cachedStartTime = Date.now();
  await orchestrator.executeWorkflow('example-context-id');
  const cachedExecutionTime = Date.now() - cachedStartTime;
  
  console.log(`缓存执行耗时: ${cachedExecutionTime}ms`);
  console.log(`性能提升: ${((executionTime - cachedExecutionTime) / executionTime * 100).toFixed(1)}%`);
}

performanceOptimizedExample().catch(console.error);
