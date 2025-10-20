# MPLP v1.0 Alpha 性能基准测试套件

> 🚀 **企业级性能验证** - 全面的性能基准测试和监控体系

## 📋 测试概述

这是MPLP v1.0 Alpha版本的完整性能基准测试套件，涵盖单机性能、分布式性能、并发负载、内存和CPU使用等多个维度的性能验证。

### 🎯 测试目标

- **建立性能基准** - 为MPLP平台建立标准性能基准
- **验证扩展性** - 验证系统在不同负载下的扩展能力
- **识别瓶颈** - 发现系统性能瓶颈和优化机会
- **监控指标** - 建立完整的性能监控指标体系
- **回归测试** - 确保性能不会随版本更新而退化

### 📊 测试维度

1. **单机性能测试**
   - CoreOrchestrator执行性能
   - 模块间通信性能
   - 内存使用效率
   - CPU利用率

2. **并发负载测试**
   - 多工作流并发执行
   - 高并发场景下的稳定性
   - 资源竞争处理
   - 负载均衡效果

3. **分布式性能测试**
   - 多节点协作性能
   - 网络通信延迟
   - 数据一致性开销
   - 故障恢复时间

4. **压力测试**
   - 极限负载测试
   - 内存泄漏检测
   - 长时间运行稳定性
   - 资源耗尽恢复

## 🏗️ 测试架构

```
┌─────────────────────────────────────────┐
│           性能测试控制台                 │
│      (Metrics Dashboard)               │
├─────────────────────────────────────────┤
│          测试执行层                     │
│  LoadGenerator | MetricsCollector     │
│  TestOrchestrator | ReportGenerator   │
├─────────────────────────────────────────┤
│          被测系统                       │
│         MPLP v1.0 Alpha                │
│    (CoreOrchestrator + Modules)        │
├─────────────────────────────────────────┤
│          监控基础设施                   │
│  Prometheus | Grafana | InfluxDB      │
└─────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Docker >= 20.0.0
- 至少8GB RAM
- 多核CPU（推荐4核以上）

### 安装和运行

```bash
# 1. 进入性能测试目录
cd tests/performance

# 2. 安装测试依赖
npm install

# 3. 启动监控基础设施
docker-compose up -d

# 4. 运行基准测试套件
npm run test:benchmark

# 5. 运行特定测试
npm run test:single-node     # 单机性能测试
npm run test:concurrent      # 并发负载测试
npm run test:distributed     # 分布式性能测试
npm run test:stress          # 压力测试

# 6. 查看测试报告
npm run report:generate
npm run report:serve         # 启动报告服务器
```

### 配置说明

```yaml
# performance-config.yml
benchmark:
  duration: 300s              # 测试持续时间
  warmup: 30s                # 预热时间
  cooldown: 10s              # 冷却时间
  
single_node:
  max_workflows: 1000        # 最大工作流数量
  concurrent_limit: 50       # 并发限制
  ramp_up_time: 60s         # 负载递增时间
  
concurrent:
  max_concurrent: 200        # 最大并发数
  workflow_complexity: medium # 工作流复杂度
  resource_constraints: normal
  
distributed:
  node_count: 3              # 节点数量
  network_latency: 10ms      # 模拟网络延迟
  partition_tolerance: true   # 分区容错测试
  
stress:
  memory_limit: 4GB          # 内存限制
  cpu_limit: 80%             # CPU限制
  duration: 3600s            # 压力测试时长
  
monitoring:
  metrics_interval: 5s       # 指标收集间隔
  retention_period: 7d       # 数据保留期
  alert_thresholds:
    response_time: 1000ms    # 响应时间告警阈值
    error_rate: 5%           # 错误率告警阈值
    memory_usage: 80%        # 内存使用告警阈值
```

## 📊 性能基准

### 单机性能基准

| 指标 | 目标值 | 优秀 | 良好 | 需改进 |
|------|--------|------|------|--------|
| 工作流执行时间 | < 100ms | < 50ms | < 100ms | > 200ms |
| 并发工作流数 | > 50 | > 100 | > 50 | < 25 |
| 内存使用 | < 512MB | < 256MB | < 512MB | > 1GB |
| CPU使用率 | < 70% | < 50% | < 70% | > 90% |
| 吞吐量 | > 100 req/s | > 200 req/s | > 100 req/s | < 50 req/s |

### 并发性能基准

| 场景 | 并发数 | 响应时间(P95) | 吞吐量 | 错误率 |
|------|--------|---------------|--------|--------|
| 轻量工作流 | 100 | < 200ms | > 500 req/s | < 1% |
| 中等工作流 | 50 | < 500ms | > 200 req/s | < 2% |
| 复杂工作流 | 20 | < 1000ms | > 50 req/s | < 5% |
| 混合负载 | 100 | < 300ms | > 300 req/s | < 3% |

### 分布式性能基准

| 配置 | 节点数 | 网络延迟 | 一致性延迟 | 故障恢复时间 |
|------|--------|----------|------------|-------------|
| 本地集群 | 3 | < 1ms | < 10ms | < 5s |
| 区域集群 | 3 | < 50ms | < 100ms | < 30s |
| 跨区域集群 | 3 | < 200ms | < 500ms | < 60s |

## 🧪 测试用例

### 1. 单机性能测试

#### 基础工作流执行测试
```typescript
describe('单机性能基准测试', () => {
  test('基础工作流执行性能', async () => {
    const testConfig = {
      workflowCount: 1000,
      concurrency: 1,
      timeout: 300000
    };
    
    const results = await performanceTest.runBasicWorkflowTest(testConfig);
    
    expect(results.averageExecutionTime).toBeLessThan(100); // < 100ms
    expect(results.p95ExecutionTime).toBeLessThan(200);     // P95 < 200ms
    expect(results.errorRate).toBeLessThan(0.01);           // < 1%
    expect(results.memoryUsage.peak).toBeLessThan(512 * 1024 * 1024); // < 512MB
  });

  test('模块间通信性能', async () => {
    const results = await performanceTest.runModuleCommunicationTest({
      moduleCount: 10,
      messageCount: 10000,
      messageSize: 1024
    });
    
    expect(results.averageLatency).toBeLessThan(5);         // < 5ms
    expect(results.throughput).toBeGreaterThan(1000);      // > 1000 msg/s
  });
});
```

#### 内存使用效率测试
```typescript
describe('内存使用效率测试', () => {
  test('长时间运行内存稳定性', async () => {
    const memoryMonitor = new MemoryMonitor();
    memoryMonitor.start();
    
    // 运行30分钟的连续工作流
    await performanceTest.runContinuousWorkflows({
      duration: 30 * 60 * 1000,
      workflowRate: 10 // 每秒10个工作流
    });
    
    const memoryStats = memoryMonitor.getStats();
    
    // 检查内存泄漏
    expect(memoryStats.memoryGrowthRate).toBeLessThan(0.1); // < 10% 增长
    expect(memoryStats.gcEfficiency).toBeGreaterThan(0.9);  // > 90% GC效率
  });
});
```

### 2. 并发负载测试

#### 高并发工作流执行
```typescript
describe('并发负载测试', () => {
  test('高并发工作流执行', async () => {
    const loadTest = new ConcurrentLoadTest({
      maxConcurrency: 100,
      rampUpTime: 60000,
      sustainTime: 300000,
      rampDownTime: 60000
    });
    
    const results = await loadTest.execute();
    
    expect(results.averageResponseTime).toBeLessThan(500);  // < 500ms
    expect(results.p95ResponseTime).toBeLessThan(1000);     // P95 < 1s
    expect(results.throughput).toBeGreaterThan(100);        // > 100 req/s
    expect(results.errorRate).toBeLessThan(0.05);           // < 5%
  });

  test('资源竞争处理', async () => {
    const resourceTest = new ResourceContentionTest({
      concurrentWorkflows: 50,
      sharedResources: ['database', 'cache', 'queue'],
      contentionLevel: 'high'
    });
    
    const results = await resourceTest.execute();
    
    expect(results.deadlockCount).toBe(0);                  // 无死锁
    expect(results.resourceUtilization).toBeLessThan(0.9);  // < 90% 利用率
    expect(results.fairnessIndex).toBeGreaterThan(0.8);     // > 80% 公平性
  });
});
```

### 3. 分布式性能测试

#### 多节点协作性能
```typescript
describe('分布式性能测试', () => {
  test('多节点工作流协作', async () => {
    const distributedTest = new DistributedPerformanceTest({
      nodeCount: 3,
      workflowDistribution: 'round-robin',
      networkLatency: 10 // 10ms
    });
    
    const results = await distributedTest.execute();
    
    expect(results.crossNodeLatency).toBeLessThan(50);      // < 50ms
    expect(results.dataConsistencyTime).toBeLessThan(100);  // < 100ms
    expect(results.loadBalanceEfficiency).toBeGreaterThan(0.8); // > 80%
  });

  test('网络分区容错', async () => {
    const partitionTest = new NetworkPartitionTest({
      partitionDuration: 30000,
      partitionType: 'split-brain',
      recoveryStrategy: 'automatic'
    });
    
    const results = await partitionTest.execute();
    
    expect(results.dataLoss).toBe(0);                       // 无数据丢失
    expect(results.recoveryTime).toBeLessThan(60000);       // < 60s 恢复
    expect(results.serviceAvailability).toBeGreaterThan(0.99); // > 99% 可用性
  });
});
```

### 4. 压力测试

#### 极限负载测试
```typescript
describe('压力测试', () => {
  test('极限负载处理', async () => {
    const stressTest = new StressTest({
      loadMultiplier: 10,        // 10倍正常负载
      duration: 3600000,         // 1小时
      resourceLimits: {
        memory: '4GB',
        cpu: '80%'
      }
    });
    
    const results = await stressTest.execute();
    
    expect(results.systemStability).toBe('stable');        // 系统稳定
    expect(results.performanceDegradation).toBeLessThan(0.3); // < 30% 性能下降
    expect(results.recoveryTime).toBeLessThan(300000);      // < 5分钟恢复
  });
});
```

## 📈 监控和报告

### 实时监控指标

- **系统指标**: CPU、内存、磁盘、网络使用率
- **应用指标**: 工作流执行时间、吞吐量、错误率
- **业务指标**: 任务完成率、用户响应时间
- **基础设施指标**: 数据库连接、缓存命中率

### 性能报告

测试完成后自动生成详细的性能报告：

- **执行摘要**: 测试概况和关键指标
- **性能趋势**: 历史性能对比和趋势分析
- **瓶颈分析**: 性能瓶颈识别和优化建议
- **基准对比**: 与性能基准的对比分析
- **改进建议**: 具体的性能优化建议

### 报告格式

- **HTML报告**: 交互式Web报告
- **PDF报告**: 可打印的详细报告
- **JSON数据**: 机器可读的测试数据
- **CSV导出**: 用于进一步分析的数据

## 🔧 自定义测试

### 创建自定义性能测试

```typescript
// 示例：创建自定义性能测试
export class CustomPerformanceTest extends BasePerformanceTest {
  async execute(config: CustomTestConfig): Promise<TestResult> {
    // 1. 初始化测试环境
    await this.setupTestEnvironment(config);
    
    // 2. 执行测试逻辑
    const results = await this.runTestScenario(config);
    
    // 3. 收集性能指标
    const metrics = await this.collectMetrics();
    
    // 4. 生成测试报告
    return this.generateReport(results, metrics);
  }
}
```

### 扩展监控指标

```typescript
// 示例：添加自定义监控指标
export class CustomMetricsCollector implements MetricsCollector {
  async collectMetrics(): Promise<Metrics> {
    return {
      customMetric1: await this.getCustomMetric1(),
      customMetric2: await this.getCustomMetric2(),
      timestamp: Date.now()
    };
  }
}
```

## 🎯 最佳实践

1. **测试环境隔离** - 使用独立的测试环境
2. **基准数据管理** - 维护历史基准数据
3. **自动化执行** - 集成到CI/CD流水线
4. **结果分析** - 定期分析性能趋势
5. **优化迭代** - 基于测试结果持续优化

---

**🚀 开始建立您的性能基准测试体系！**
