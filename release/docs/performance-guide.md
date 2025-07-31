# 性能优化指南

## 选择合适的调度器

### CoreOrchestrator
- ✅ 适用于简单场景
- ✅ 稳定可靠
- ✅ 资源占用少

### PerformanceEnhancedOrchestrator
- ✅ 适用于生产环境
- ✅ 高性能需求
- ✅ 复杂业务场景

## 性能优化最佳实践

### 1. 缓存策略
```typescript
// 预热缓存
await orchestrator.warmupCache(['common-context-1', 'common-context-2']);

// 监控缓存效果
const stats = orchestrator.getPerformanceStats();
console.log(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
```

### 2. 性能监控
```typescript
// 设置告警阈值
orchestrator.performanceMonitor.setAlertThreshold('workflow_execution_time', 1000, 2000);

// 监听告警
orchestrator.performanceMonitor.on('alert', (alert) => {
  console.warn('性能告警:', alert);
});
```

### 3. 批处理优化
批处理器会自动优化I/O操作，无需手动配置。

## 性能基准测试

运行性能测试：
```bash
npm test -- tests/performance/real-business-performance.test.ts
```

预期结果：
- 平均响应时间: ~347ms
- 缓存命中性能提升: 57%+
- 吞吐量: 37+ ops/sec
