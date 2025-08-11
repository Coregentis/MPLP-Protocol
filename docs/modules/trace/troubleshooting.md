# Trace Module - Troubleshooting Guide

**Version**: v1.0.0  
**Last Updated**: 2025-08-09  
**Status**: Production Ready ✅

---

## 📋 **故障排查概述**

本指南提供Trace模块常见问题的诊断和解决方案，基于生产环境的实际经验和100%测试验证的解决方法。

## 🚨 **常见问题分类**

### **1. 追踪创建问题**

#### **问题**: 追踪创建失败
```
错误信息: "追踪ID不能为空" 或 "上下文ID不能为空"
```

**原因分析**:
- 必需字段缺失或为null/undefined
- 字段格式不正确

**解决方案**:
```typescript
// ❌ 错误的创建方式
const result = await traceManagementService.createTrace({
  context_id: null, // 错误：不能为null
  trace_type: 'execution',
  severity: 'info',
  event: {
    type: 'test',
    name: 'Test Event',
    category: 'system',
    source: { component: 'test' }
  }
});

// ✅ 正确的创建方式
const result = await traceManagementService.createTrace({
  context_id: 'valid-context-id', // 必须提供有效的UUID
  trace_type: 'execution',
  severity: 'info',
  event: {
    type: 'test',
    name: 'Test Event',
    category: 'system',
    source: { component: 'test' }
  }
});
```

**验证方法**:
```typescript
// 验证字段完整性
function validateTraceRequest(request: CreateTraceRequest): string[] {
  const errors: string[] = [];
  
  if (!request.context_id) {
    errors.push('context_id is required');
  }
  
  if (!request.trace_type) {
    errors.push('trace_type is required');
  }
  
  if (!request.event || !request.event.name) {
    errors.push('event.name is required');
  }
  
  return errors;
}
```

#### **问题**: 字段映射错误
```
错误信息: "字段格式不匹配" 或 TypeScript编译错误
```

**原因分析**:
- Schema层(snake_case)和TypeScript层(camelCase)字段混用
- 映射函数使用不当

**解决方案**:
```typescript
// ❌ 错误：混用命名约定
const trace = {
  traceId: 'trace-123',        // camelCase
  context_id: 'ctx-456',       // snake_case - 混用！
  protocolVersion: '1.0.0'     // camelCase
};

// ✅ 正确：使用统一的命名约定
// Schema层 (API接口)
const schemaTrace = {
  trace_id: 'trace-123',
  context_id: 'ctx-456',
  protocol_version: '1.0.0'
};

// TypeScript层 (内部实现)
const tsTrace = {
  traceId: 'trace-123',
  contextId: 'ctx-456',
  protocolVersion: '1.0.0'
};

// 使用映射函数转换
const converted = TraceMapper.fromSchema(schemaTrace);
```

### **2. 性能问题**

#### **问题**: 追踪查询缓慢
```
症状: 查询响应时间 > 5秒
```

**诊断步骤**:
```typescript
// 1. 检查查询参数
async function diagnoseSlowQuery() {
  const startTime = Date.now();
  
  const result = await traceManagementService.queryTraces({
    time_range: {
      start: new Date('2025-01-01'), // 时间范围过大？
      end: new Date('2025-12-31')
    },
    limit: 10000 // 限制过大？
  });
  
  const duration = Date.now() - startTime;
  console.log(`Query took ${duration}ms`);
  
  if (duration > 5000) {
    console.log('🐌 Slow query detected');
    // 分析查询参数
    analyzeQueryParameters();
  }
}

function analyzeQueryParameters() {
  console.log('📊 Query optimization suggestions:');
  console.log('- Reduce time range to < 30 days');
  console.log('- Limit results to < 1000');
  console.log('- Add specific filters (context_ids, trace_types)');
  console.log('- Use pagination for large result sets');
}
```

**优化方案**:
```typescript
// ✅ 优化的查询
const optimizedResult = await traceManagementService.queryTraces({
  time_range: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
    end: new Date()
  },
  context_ids: ['specific-context'], // 具体的上下文
  trace_types: ['execution'],         // 具体的类型
  limit: 100,                        // 合理的限制
  offset: 0                          // 分页
});
```

#### **问题**: 内存使用过高
```
症状: 内存使用持续增长，可能的内存泄漏
```

**诊断方法**:
```typescript
// 内存使用监控
class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryUsageHistory: number[] = [];
  
  static getInstance(): MemoryMonitor {
    if (!this.instance) {
      this.instance = new MemoryMonitor();
    }
    return this.instance;
  }
  
  startMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      
      this.memoryUsageHistory.push(heapUsedMB);
      
      // 保留最近100个记录
      if (this.memoryUsageHistory.length > 100) {
        this.memoryUsageHistory.shift();
      }
      
      // 检查内存增长趋势
      if (this.detectMemoryLeak()) {
        console.log('🚨 Potential memory leak detected');
        this.generateMemoryReport();
      }
    }, 10000); // 每10秒检查一次
  }
  
  private detectMemoryLeak(): boolean {
    if (this.memoryUsageHistory.length < 10) return false;
    
    const recent = this.memoryUsageHistory.slice(-10);
    const trend = this.calculateTrend(recent);
    
    // 如果内存使用持续增长超过阈值
    return trend > 5; // 每次检查增长5MB
  }
  
  private calculateTrend(data: number[]): number {
    // 简单的线性趋势计算
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
  
  private generateMemoryReport() {
    const usage = process.memoryUsage();
    console.log('📊 Memory Usage Report:');
    console.log(`Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
    console.log(`Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
    console.log(`External: ${Math.round(usage.external / 1024 / 1024)}MB`);
    console.log(`RSS: ${Math.round(usage.rss / 1024 / 1024)}MB`);
  }
}
```

**解决方案**:
```typescript
// 内存优化策略
class TraceMemoryOptimizer {
  // 1. 使用对象池
  private tracePool: Trace[] = [];
  
  getTrace(): Trace {
    return this.tracePool.pop() || this.createNewTrace();
  }
  
  releaseTrace(trace: Trace) {
    // 清理trace对象
    trace.reset();
    this.tracePool.push(trace);
  }
  
  // 2. 批量处理优化
  async processBatchOptimized(traces: Trace[]) {
    const batchSize = 100;
    
    for (let i = 0; i < traces.length; i += batchSize) {
      const batch = traces.slice(i, i + batchSize);
      await this.processBatch(batch);
      
      // 强制垃圾回收（仅在开发环境）
      if (process.env.NODE_ENV === 'development' && global.gc) {
        global.gc();
      }
    }
  }
  
  // 3. 缓存清理
  private cleanupCache() {
    // 定期清理缓存
    setInterval(() => {
      this.clearExpiredCacheEntries();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }
}
```

### **3. 分析问题**

#### **问题**: 关联检测不准确
```
症状: 检测到的关联关系不符合预期
```

**诊断方法**:
```typescript
// 关联检测调试
async function debugCorrelationDetection(traces: Trace[]) {
  console.log('🔍 Debugging correlation detection...');
  
  // 1. 检查输入数据质量
  const dataQuality = analyzeDataQuality(traces);
  console.log('Data Quality:', dataQuality);
  
  // 2. 逐步执行关联检测
  const analysisService = new TraceAnalysisService();
  
  // 时间关联
  const temporalCorrelations = await analysisService.detectTemporalCorrelations(traces);
  console.log('Temporal correlations:', temporalCorrelations.length);
  
  // 因果关联
  const causalCorrelations = await analysisService.detectCausalCorrelations(traces);
  console.log('Causal correlations:', causalCorrelations.length);
  
  // 3. 验证关联强度
  temporalCorrelations.forEach(corr => {
    if (corr.strength < 0.5) {
      console.log(`⚠️ Weak temporal correlation: ${corr.source_id} -> ${corr.target_id} (${corr.strength})`);
    }
  });
}

function analyzeDataQuality(traces: Trace[]) {
  return {
    totalTraces: traces.length,
    tracesWithTimestamp: traces.filter(t => t.timestamp).length,
    tracesWithCorrelations: traces.filter(t => t.correlations.length > 0).length,
    uniqueContexts: new Set(traces.map(t => t.contextId)).size,
    timeSpan: {
      start: Math.min(...traces.map(t => new Date(t.timestamp).getTime())),
      end: Math.max(...traces.map(t => new Date(t.timestamp).getTime()))
    }
  };
}
```

**调优方案**:
```typescript
// 关联检测参数调优
const correlationConfig = {
  temporal: {
    maxTimeDifference: 5000,    // 5秒内的事件考虑时间关联
    minStrength: 0.6,           // 最小关联强度
    windowSize: 100             // 时间窗口大小
  },
  causal: {
    minStrength: 0.7,           // 因果关联最小强度
    maxDepth: 3,                // 最大关联深度
    contextWeight: 0.8          // 上下文权重
  }
};

// 应用配置
analysisService.configureCorrelationDetection(correlationConfig);
```

### **4. 集成问题**

#### **问题**: 模块适配器初始化失败
```
错误信息: "Module initialization failed"
```

**诊断步骤**:
```typescript
// 模块初始化诊断
async function diagnoseModuleInitialization() {
  const adapter = new TraceModuleAdapter();
  
  try {
    // 1. 检查配置
    const config = validateModuleConfig();
    console.log('✅ Configuration valid');
    
    // 2. 检查依赖
    await checkDependencies();
    console.log('✅ Dependencies available');
    
    // 3. 初始化模块
    await adapter.initialize(config);
    console.log('✅ Module initialized successfully');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    await generateDiagnosticReport(error);
  }
}

function validateModuleConfig() {
  const config = {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    },
    cache: {
      host: process.env.CACHE_HOST,
      port: process.env.CACHE_PORT
    }
  };
  
  // 验证必需的配置项
  const requiredFields = ['database.host', 'database.port', 'database.database'];
  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    return !value;
  });
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration: ${missingFields.join(', ')}`);
  }
  
  return config;
}

async function checkDependencies() {
  const dependencies = [
    { name: 'Database', check: () => checkDatabaseConnection() },
    { name: 'Cache', check: () => checkCacheConnection() },
    { name: 'Event Bus', check: () => checkEventBusConnection() }
  ];
  
  for (const dep of dependencies) {
    try {
      await dep.check();
      console.log(`✅ ${dep.name} available`);
    } catch (error) {
      throw new Error(`${dep.name} unavailable: ${error.message}`);
    }
  }
}
```

## 🔧 **性能调优指南**

### **查询优化**
```typescript
// 查询性能优化清单
const queryOptimizationChecklist = {
  timeRange: {
    recommended: '< 30 days',
    maximum: '< 90 days',
    tip: 'Use specific time ranges to improve query performance'
  },
  resultLimit: {
    recommended: '< 1000',
    maximum: '< 5000',
    tip: 'Use pagination for large result sets'
  },
  filters: {
    recommended: 'Use specific context_ids and trace_types',
    tip: 'More specific filters = better performance'
  },
  indexing: {
    required: ['timestamp', 'context_id', 'trace_type'],
    tip: 'Ensure proper database indexing'
  }
};
```

### **内存管理**
```typescript
// 内存管理最佳实践
const memoryManagementTips = {
  batchProcessing: {
    batchSize: 100,
    tip: 'Process traces in small batches to avoid memory spikes'
  },
  caching: {
    maxSize: 1000,
    ttl: 300000, // 5分钟
    tip: 'Use LRU cache with appropriate size limits'
  },
  cleanup: {
    interval: 300000, // 5分钟
    tip: 'Regular cleanup of expired objects'
  }
};
```

## 📊 **监控和告警**

### **关键指标监控**
```typescript
// 监控指标定义
const monitoringMetrics = {
  performance: {
    traceCreationTime: { threshold: 100, unit: 'ms' },
    queryResponseTime: { threshold: 1000, unit: 'ms' },
    analysisTime: { threshold: 5000, unit: 'ms' }
  },
  reliability: {
    errorRate: { threshold: 1, unit: '%' },
    successRate: { threshold: 99, unit: '%' }
  },
  resource: {
    memoryUsage: { threshold: 512, unit: 'MB' },
    cpuUsage: { threshold: 80, unit: '%' }
  }
};

// 告警配置
const alertConfig = {
  channels: ['email', 'slack', 'webhook'],
  escalation: {
    warning: { delay: 300, retries: 3 },
    critical: { delay: 60, retries: 5 }
  }
};
```

## 🆘 **紧急故障处理**

### **服务降级策略**
```typescript
// 紧急情况下的服务降级
class EmergencyFallback {
  private isEmergencyMode = false;
  
  enableEmergencyMode() {
    this.isEmergencyMode = true;
    console.log('🚨 Emergency mode enabled');
  }
  
  async createTrace(request: CreateTraceRequest) {
    if (this.isEmergencyMode) {
      // 降级：只记录关键信息
      return this.createMinimalTrace(request);
    }
    
    return this.createFullTrace(request);
  }
  
  private async createMinimalTrace(request: CreateTraceRequest) {
    // 最小化的追踪创建，只保留核心字段
    return {
      trace_id: generateId(),
      context_id: request.context_id,
      timestamp: new Date().toISOString(),
      event: {
        type: request.event.type,
        name: request.event.name
      }
    };
  }
}
```

### **数据恢复**
```typescript
// 数据恢复程序
async function recoverCorruptedTraces() {
  console.log('🔧 Starting trace data recovery...');
  
  // 1. 识别损坏的数据
  const corruptedTraces = await identifyCorruptedTraces();
  console.log(`Found ${corruptedTraces.length} corrupted traces`);
  
  // 2. 尝试修复
  const recoveredTraces = [];
  for (const trace of corruptedTraces) {
    try {
      const recovered = await repairTrace(trace);
      recoveredTraces.push(recovered);
    } catch (error) {
      console.error(`Failed to recover trace ${trace.id}:`, error);
    }
  }
  
  console.log(`✅ Recovered ${recoveredTraces.length} traces`);
  return recoveredTraces;
}
```

---

**通过这个故障排查指南，您可以快速诊断和解决Trace模块的常见问题，确保系统的稳定运行和最佳性能。** 🚀
