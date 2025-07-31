# MPLP API 参考

## 核心类

### CoreOrchestrator

基础的工作流调度器，提供完整的多智能体协作功能。

```typescript
import { CoreOrchestrator } from 'mplp';

const orchestrator = new CoreOrchestrator(config);
await orchestrator.executeWorkflow(contextId);
```


### PerformanceEnhancedOrchestrator

性能增强版调度器，在基础功能上添加了缓存、批处理等优化。

```typescript
import { PerformanceEnhancedOrchestrator } from 'mplp';

const orchestrator = new PerformanceEnhancedOrchestrator(config);
await orchestrator.executeWorkflow(contextId);

// 查看性能统计
const stats = orchestrator.getPerformanceStats();
```

#### 性能优化功能

- **智能缓存**: 自动缓存工作流结果，缓存命中时性能提升57%+
- **批处理**: 自动批量处理I/O操作，减少系统开销
- **性能监控**: 实时监控性能指标，支持告警
- **资源管理**: 智能的连接池和资源管理

### 性能工具包

#### IntelligentCacheManager
智能缓存管理器，支持LFU+LRU混合淘汰策略。

#### BatchProcessor
批处理器，自动批量处理操作以提升性能。

#### BusinessPerformanceMonitor
业务性能监控器，提供实时性能指标和告警。


## 配置选项

### OrchestratorConfiguration

```typescript
interface OrchestratorConfiguration {
  default_workflow: WorkflowConfiguration;
  module_timeout_ms: number;
  max_concurrent_executions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
}
```

#### 配置参数说明

- **default_workflow**: 默认工作流配置
- **module_timeout_ms**: 模块执行超时时间（毫秒）
- **max_concurrent_executions**: 最大并发执行数
- **enable_performance_monitoring**: 是否启用性能监控
- **enable_event_logging**: 是否启用事件日志

### WorkflowConfiguration

```typescript
interface WorkflowConfiguration {
  stages: WorkflowStage[];
  parallel_execution?: boolean;
  timeout_ms: number;
  retry_policy?: RetryPolicy;
  error_handling?: ErrorHandling;
}
```

### ModuleInterface

```typescript
interface ModuleInterface {
  module_name: string;
  initialize(): Promise<void>;
  execute(context: ExecutionContext): Promise<ExecutionResult>;
  cleanup(): Promise<void>;
  getStatus(): ModuleStatus;
}
```

## 方法参考

### CoreOrchestrator 方法

#### executeWorkflow(contextId, config?)

执行工作流。

**参数:**
- `contextId: string` - 上下文ID
- `config?: Partial<WorkflowConfiguration>` - 可选的工作流配置

**返回值:**
- `Promise<WorkflowExecutionResult>` - 执行结果

**示例:**
```typescript
const result = await orchestrator.executeWorkflow('ctx-001', {
  timeout_ms: 15000
});
```

#### registerModule(module)

注册模块。

**参数:**
- `module: ModuleInterface` - 要注册的模块

**示例:**
```typescript
orchestrator.registerModule({
  module_name: 'context',
  async initialize() { /* ... */ },
  async execute(context) { /* ... */ },
  async cleanup() { /* ... */ },
  getStatus() { /* ... */ }
});
```

#### getActiveExecutions()

获取当前活跃的执行。

**返回值:**
- `ExecutionContext[]` - 活跃执行列表

#### addEventListener(listener)

添加事件监听器。

**参数:**
- `listener: (event: CoordinationEvent) => void` - 事件监听函数

### PerformanceEnhancedOrchestrator 额外方法

#### getPerformanceStats()

获取性能统计信息。

**返回值:**
- `PerformanceStats` - 性能统计数据

```typescript
interface PerformanceStats {
  totalExecutions: number;
  cacheHits: number;
  cacheMisses: number;
  averageExecutionTime: number;
  cacheHitRate: number;
}
```

#### warmupCache(contextIds)

预热缓存。

**参数:**
- `contextIds: string[]` - 要预热的上下文ID列表

**示例:**
```typescript
await orchestrator.warmupCache(['ctx-001', 'ctx-002']);
```

## 性能基准

基于真实业务逻辑的性能测试结果：

| 指标 | CoreOrchestrator | PerformanceEnhancedOrchestrator |
|------|------------------|--------------------------------|
| 平均响应时间 | 347ms | 347ms (首次) / 148ms (缓存) |
| 吞吐量 | 37 ops/sec | 37+ ops/sec |
| 缓存优化 | - | 57%性能提升 |
| 内存效率 | 良好 | 优秀 |
