/**
 * MPLP缓存使用示例
 *
 * 展示如何使用缓存模块进行数据缓存和优化。
 * 包含不同缓存策略、多级缓存和性能监控的示例。
 *
 * @version v1.0.0
 * @created 2025-07-18T12:30:00+08:00
 */

import {
  CacheFactory,
  CacheManager,
  MemoryCacheProvider,
  CacheClient,
  CacheStrategy,
  CacheLevel
} from '../core/cache';
import { MonitorClient } from '../core/performance';

/**
 * 运行所有缓存示例
 */
async function runAllExamples() {
  console.log('开始运行缓存示例...');

  await basicCacheExample();
  await cacheStrategiesExample();
  await multiLevelCacheExample();
  await monitoredCacheExample();

  console.log('所有缓存示例完成！');
}

/**
 * 基本缓存示例
 */
async function basicCacheExample() {
  console.log('\n=== 基本缓存示例 ===');

  // 创建缓存工厂
  const factory = new CacheFactory();

  // 创建缓存管理器
  const cacheManager = factory.createCacheManager();

  // 创建内存缓存提供者
  const memoryProvider = factory.createProvider('memory', {
    name: 'memory-cache',
    defaultTtl: 60000, // 1分钟
    maxItems: 1000
  });

  // 注册缓存提供者
  cacheManager.registerProvider(memoryProvider, true);

  // 创建缓存客户端
  const cacheClient = new CacheClient(cacheManager, {
    defaultStrategy: CacheStrategy.CACHE_FIRST,
    enableLogging: true,
    logLevel: 'info'
  });

  // 使用缓存客户端
  console.log('设置缓存项...');
  await cacheClient.set('user:123', { id: 123, name: 'John Doe', email: 'john@example.com' });

  console.log('获取缓存项...');
  const user = await cacheClient.get('user:123');
  console.log('缓存项:', user);

  console.log('删除缓存项...');
  await cacheClient.delete('user:123');

  console.log('再次获取缓存项...');
  const deletedUser = await cacheClient.get('user:123');
  console.log('缓存项:', deletedUser);
}

/**
 * 缓存策略示例
 */
async function cacheStrategiesExample() {
  console.log('\n=== 缓存策略示例 ===');

  // 创建缓存客户端
  const factory = new CacheFactory();
  const cacheManager = factory.createDefaultCacheManager();
  const cacheClient = new CacheClient(cacheManager);

  // 模拟数据源
  let counter = 0;
  const fetchData = async () => {
    counter++;
    console.log(`从源获取数据 (调用次数: ${counter})`);
    return { id: 456, name: `数据 ${counter}`, timestamp: Date.now() };
  };

  // 使用不同的缓存策略
  console.log('\n1. 缓存优先策略 (CACHE_FIRST):');
  const result1 = await cacheClient.getWithStrategy(
    CacheStrategy.CACHE_FIRST,
    'data:456',
    fetchData,
    { ttl: 5000 } // 5秒过期
  );
  console.log('第一次获取结果:', result1);

  const result2 = await cacheClient.getWithStrategy(
    CacheStrategy.CACHE_FIRST,
    'data:456',
    fetchData
  );
  console.log('第二次获取结果 (应该来自缓存):', result2);

  console.log('\n2. 源优先策略 (SOURCE_FIRST):');
  const result3 = await cacheClient.getWithStrategy(
    CacheStrategy.SOURCE_FIRST,
    'data:789',
    fetchData
  );
  console.log('第一次获取结果:', result3);

  const result4 = await cacheClient.getWithStrategy(
    CacheStrategy.SOURCE_FIRST,
    'data:789',
    fetchData
  );
  console.log('第二次获取结果 (应该来自源):', result4);

  console.log('\n3. 过期重新验证策略 (STALE_WHILE_REVALIDATE):');
  const result5 = await cacheClient.getWithStrategy(
    CacheStrategy.STALE_WHILE_REVALIDATE,
    'data:101112',
    fetchData,
    { ttl: 5000 }
  );
  console.log('第一次获取结果:', result5);

  const result6 = await cacheClient.getWithStrategy(
    CacheStrategy.STALE_WHILE_REVALIDATE,
    'data:101112',
    fetchData
  );
  console.log('第二次获取结果 (应该来自缓存，但会异步更新):', result6);

  // 等待一会儿，让异步更新完成
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * 多级缓存示例
 */
async function multiLevelCacheExample() {
  console.log('\n=== 多级缓存示例 ===');

  // 创建缓存管理器
  const cacheManager = new CacheManager({
    enableMultiLevelCache: true,
    autoSyncMultiLevelCache: true
  });

  // 创建两个内存缓存提供者，模拟不同层级
  const memoryCache1 = new MemoryCacheProvider({
    name: 'fast-memory-cache',
    defaultTtl: 30000 // 30秒
  });

  const memoryCache2 = new MemoryCacheProvider({
    name: 'slow-memory-cache',
    defaultTtl: 300000 // 5分钟
  });

  // 注册缓存提供者
  cacheManager.registerProvider(memoryCache1);
  cacheManager.registerProvider(memoryCache2);

  // 创建缓存客户端
  const cacheClient = new CacheClient(cacheManager);

  // 模拟数据源
  const fetchData = async () => {
    console.log('从源获取数据');
    return { id: 789, name: 'Multi-level Data', timestamp: Date.now() };
  };

  // 使用多级缓存
  console.log('\n使用多级缓存:');
  const result1 = await cacheClient.getOrFetch('multi:data', fetchData);
  console.log('第一次获取结果:', result1);

  const result2 = await cacheClient.getOrFetch('multi:data', fetchData);
  console.log('第二次获取结果 (应该来自缓存):', result2);

  // 清除第一级缓存
  await memoryCache1.clear();
  console.log('\n清除第一级缓存后:');

  const result3 = await cacheClient.getOrFetch('multi:data', fetchData);
  console.log('第三次获取结果 (应该来自第二级缓存):', result3);
}

/**
 * 监控缓存示例
 */
async function monitoredCacheExample() {
  console.log('\n=== 监控缓存示例 ===');

  // 创建性能监控客户端
  const monitorClient = new MonitorClient();

  // 创建缓存客户端
  const factory = new CacheFactory();
  const cacheManager = factory.createDefaultCacheManager();
  const cacheClient = new CacheClient(cacheManager);

  // 模拟数据源
  const fetchData = async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟
    return { id, name: `Item ${id}`, timestamp: Date.now() };
  };

  // 创建计时器
  const timer = monitorClient.createTimer('cache.access.time');

  // 执行缓存操作并监控性能
  console.log('\n执行缓存操作并监控性能:');

  // 首次获取（缓存未命中）
  console.log('首次获取（缓存未命中）:');
  const missTimer = timer.startTimer();
  const result1 = await cacheClient.getOrFetch('monitored:item:1', () => fetchData(1));
  missTimer.stop();
  console.log('结果:', result1);
  console.log(`缓存未命中耗时: ${missTimer.getDurationMs().toFixed(2)}ms`);

  // 再次获取（缓存命中）
  console.log('\n再次获取（缓存命中）:');
  const hitTimer = timer.startTimer();
  const result2 = await cacheClient.getOrFetch('monitored:item:1', () => fetchData(1));
  hitTimer.stop();
  console.log('结果:', result2);
  console.log(`缓存命中耗时: ${hitTimer.getDurationMs().toFixed(2)}ms`);

  // 批量操作
  console.log('\n批量操作:');
  const batchTimer = timer.startTimer();

  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(cacheClient.getOrFetch(`monitored:item:${i}`, () => fetchData(i)));
  }
  await Promise.all(promises);

  batchTimer.stop();
  console.log(`批量操作耗时: ${batchTimer.getDurationMs().toFixed(2)}ms`);

  // 获取缓存统计
  const stats = await cacheClient.getStats();
  console.log('\n缓存统计:', stats);

  // 获取性能指标
  const metrics = monitorClient.getMetrics();
  console.log('\n性能指标:', metrics);
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
} 