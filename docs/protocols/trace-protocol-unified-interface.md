# Trace协议统一标准接口设计

## 🎯 **设计目标**

### **协议统一性原则**
重新设计Trace协议的完整统一标准接口，确保：
- ✅ **只有一套标准接口**：整合事件追踪和实时同步为统一接口
- ✅ **参数化配置**：通过配置参数支持从基础日志到复杂分布式追踪的所有需求
- ✅ **厂商中立性**：接口抽象通用，不绑定特定追踪实现或存储
- ✅ **向后兼容性**：现有追踪功能通过新接口的基础配置实现

### **支持的应用场景**
通过统一接口和参数配置支持：
- **基础事件追踪**：日志记录、状态变更（现有功能）
- **实时状态同步**：状态发布、订阅机制（TracePilot需求）
- **分布式协调**：事件广播、一致性保证（TracePilot需求）
- **性能监控**：指标收集、分析报告（TracePilot需求）

## 📋 **Trace协议统一标准接口**

### **核心追踪管理接口**

```typescript
/**
 * Trace协议统一标准接口
 * 整合事件追踪和实时同步为一套完整接口
 */
export interface TraceProtocol {
  
  /**
   * 创建追踪会话
   * 支持从简单日志到复杂分布式追踪的所有类型
   */
  createTrace(request: CreateTraceRequest): Promise<TraceResponse>;
  
  /**
   * 更新追踪配置
   * 支持动态调整追踪策略和同步机制
   */
  updateTrace(request: UpdateTraceRequest): Promise<TraceResponse>;
  
  /**
   * 记录事件
   * 统一的事件记录接口，支持日志、状态、指标等
   */
  recordEvent(request: EventRecordRequest): Promise<EventResponse>;
  
  /**
   * 查询追踪数据
   * 统一的查询接口，根据配置提供不同查询能力
   */
  queryTrace(request: TraceQueryRequest): Promise<TraceQueryResponse>;
  
  /**
   * 订阅事件流
   * 统一的订阅接口，支持实时事件流和状态同步
   */
  subscribeEvents(request: EventSubscriptionRequest): Promise<EventSubscriptionResponse>;
  
  /**
   * 发布状态更新
   * 统一的发布接口，支持状态广播和分布式同步
   */
  publishStateUpdate(request: StatePublishRequest): Promise<StatePublishResponse>;
  
  /**
   * 获取追踪状态
   * 查询追踪健康度、性能指标、同步状态等
   */
  getTraceStatus(traceId: string, options?: StatusOptions): Promise<TraceStatusResponse>;
  
  /**
   * 删除追踪
   * 标准的追踪删除接口
   */
  deleteTrace(traceId: string, options?: DeleteOptions): Promise<DeleteResponse>;
  
  /**
   * 查询追踪列表
   * 支持多种过滤和排序条件
   */
  queryTraces(filter: TraceFilter): Promise<QueryTraceResponse>;
}
```

### **统一数据类型定义**

```typescript
/**
 * 追踪创建请求
 * 通过type和capabilities配置控制追踪类型和能力
 */
export interface CreateTraceRequest {
  name: string;
  description?: string;
  
  // 追踪类型 - 核心区分参数
  type: TraceType;
  
  // 追踪能力配置
  capabilities: TraceCapabilities;
  
  // 追踪范围
  scope: TraceScope;
  
  // 追踪配置
  configuration?: TraceConfiguration;
  
  metadata?: Record<string, any>;
}

/**
 * 追踪类型
 */
export type TraceType = 
  | 'logging'          // 基础日志追踪
  | 'monitoring'       // 性能监控追踪
  | 'distributed'      // 分布式追踪
  | 'real_time'        // 实时状态追踪
  | 'audit'            // 审计追踪
  | 'debug'            // 调试追踪
  | 'analytics';       // 分析追踪

/**
 * 追踪能力配置
 * 根据追踪类型提供不同的能力配置
 */
export interface TraceCapabilities {
  // 基础追踪能力（所有类型都有）
  basic: {
    eventRecording: boolean;
    timestamping: boolean;
    correlation: boolean;
    persistence: boolean;
  };
  
  // 实时同步能力（实时类型启用）
  realTimeSync?: {
    // 发布订阅
    pubsub: {
      enabled: boolean;
      topics: string[];
      qos: 'at_most_once' | 'at_least_once' | 'exactly_once';
    };
    
    // 状态同步
    stateSync: {
      enabled: boolean;
      consistency: 'eventual' | 'strong' | 'causal';
      conflictResolution: 'last_write_wins' | 'vector_clock' | 'custom';
    };
    
    // 事件广播
    broadcasting: {
      enabled: boolean;
      multicast: boolean;
      reliability: 'best_effort' | 'reliable' | 'ordered';
    };
  };
  
  // 分布式协调能力（分布式类型启用）
  distributedCoordination?: {
    // 分布式锁
    distributedLock: {
      enabled: boolean;
      algorithm: 'raft' | 'paxos' | 'zab' | 'custom';
      leaseTimeout: number;
    };
    
    // 共识机制
    consensus: {
      enabled: boolean;
      protocol: 'raft' | 'pbft' | 'pow' | 'pos';
      participants: string[];
    };
    
    // 分布式事务
    distributedTransaction: {
      enabled: boolean;
      protocol: '2pc' | '3pc' | 'saga' | 'tcc';
      timeout: number;
    };
  };
  
  // 分析能力（分析类型启用）
  analytics?: {
    // 实时分析
    realTimeAnalysis: {
      enabled: boolean;
      windowSize: number;
      aggregations: ('count' | 'sum' | 'avg' | 'min' | 'max' | 'percentile')[];
    };
    
    // 模式识别
    patternRecognition: {
      enabled: boolean;
      algorithms: ('anomaly_detection' | 'trend_analysis' | 'correlation' | 'clustering')[];
      sensitivity: number;
    };
    
    // 预测分析
    predictiveAnalysis: {
      enabled: boolean;
      models: ('linear_regression' | 'time_series' | 'neural_network')[];
      horizon: number;
    };
  };
  
  // 存储能力（可选）
  storage?: {
    retention: {
      policy: 'time_based' | 'size_based' | 'count_based';
      value: number;
      unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'bytes' | 'count';
    };
    compression: boolean;
    encryption: boolean;
    indexing: string[];
  };
}

/**
 * 追踪范围
 */
export interface TraceScope {
  // 组件范围
  components: string[];
  
  // 事件类型
  eventTypes: string[];
  
  // 采样配置
  sampling?: {
    strategy: 'all' | 'percentage' | 'rate_limited' | 'adaptive';
    rate: number;
    conditions?: SamplingCondition[];
  };
  
  // 过滤条件
  filters?: TraceFilter[];
}

/**
 * 追踪配置
 */
export interface TraceConfiguration {
  // 性能配置
  performance: {
    bufferSize: number;
    flushInterval: number;
    batchSize: number;
    compression: boolean;
  };
  
  // 网络配置
  network: {
    endpoints: string[];
    protocol: 'http' | 'grpc' | 'tcp' | 'udp';
    timeout: number;
    retryPolicy: RetryPolicy;
  };
  
  // 安全配置
  security: {
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    auditLogging: boolean;
  };
  
  // 告警配置
  alerting?: {
    enabled: boolean;
    rules: AlertRule[];
    channels: AlertChannel[];
  };
}

/**
 * 事件记录请求
 */
export interface EventRecordRequest {
  traceId: string;
  
  // 事件信息
  event: {
    type: string;
    category: 'info' | 'warning' | 'error' | 'debug' | 'metric' | 'state';
    source: string;
    timestamp?: string;
    
    // 事件数据
    data: any;
    
    // 关联信息
    correlation?: {
      traceId?: string;
      spanId?: string;
      parentSpanId?: string;
      sessionId?: string;
    };
    
    // 上下文信息
    context?: {
      userId?: string;
      requestId?: string;
      operationId?: string;
      tags?: Record<string, string>;
    };
  };
  
  // 记录选项
  options?: {
    // 同步选项
    sync?: {
      broadcast: boolean;
      targets?: string[];
      reliability?: 'best_effort' | 'reliable';
    };
    
    // 分析选项
    analysis?: {
      realTime: boolean;
      patterns: boolean;
      anomalies: boolean;
    };
  };
  
  metadata?: Record<string, any>;
}

/**
 * 事件订阅请求
 */
export interface EventSubscriptionRequest {
  traceId: string;
  subscriberId: string;
  
  // 订阅条件
  subscription: {
    // 事件过滤
    eventFilter: {
      types?: string[];
      categories?: string[];
      sources?: string[];
      tags?: Record<string, string>;
    };
    
    // 订阅模式
    mode: 'push' | 'pull' | 'stream';
    
    // 传输配置
    delivery: {
      endpoint?: string;
      protocol?: 'http' | 'websocket' | 'grpc';
      format?: 'json' | 'protobuf' | 'avro';
      compression?: boolean;
    };
  };
  
  // 订阅选项
  options?: {
    // 缓冲配置
    buffering?: {
      enabled: boolean;
      size: number;
      timeout: number;
    };
    
    // 重试配置
    retry?: {
      enabled: boolean;
      maxAttempts: number;
      backoffMs: number;
    };
  };
  
  metadata?: Record<string, any>;
}

/**
 * 状态发布请求
 */
export interface StatePublishRequest {
  traceId: string;
  publisherId: string;
  
  // 状态信息
  state: {
    type: string;
    version: string;
    data: any;
    checksum?: string;
    
    // 状态元数据
    metadata: {
      timestamp: string;
      source: string;
      operation: 'create' | 'update' | 'delete';
      causedBy?: string;
    };
  };
  
  // 发布选项
  options?: {
    // 一致性要求
    consistency?: 'eventual' | 'strong' | 'causal';
    
    // 广播范围
    scope?: {
      targets?: string[];
      regions?: string[];
      global?: boolean;
    };
    
    // 确认要求
    acknowledgment?: {
      required: boolean;
      timeout: number;
      quorum?: number;
    };
  };
  
  metadata?: Record<string, any>;
}
```

### **响应类型定义**

```typescript
/**
 * 追踪响应
 */
export interface TraceResponse {
  success: boolean;
  
  data?: {
    traceId: string;
    name: string;
    type: TraceType;
    status: TraceStatus;
    capabilities: TraceCapabilities;
    scope: TraceScope;
    createdAt: string;
    updatedAt: string;
  };
  
  error?: string;
}

/**
 * 追踪状态响应
 */
export interface TraceStatusResponse {
  success: boolean;
  
  data?: {
    traceId: string;
    status: TraceStatus;
    health: HealthStatus;
    
    // 事件统计
    eventStatistics: {
      totalEvents: number;
      eventsPerSecond: number;
      eventsByCategory: Record<string, number>;
      eventsByType: Record<string, number>;
    };
    
    // 存储状态
    storage: {
      size: number;
      usage: number;
      retention: RetentionStatus;
      indexStatus: 'building' | 'ready' | 'error';
    };
    
    // 同步状态（如果适用）
    synchronization?: {
      activeSubscriptions: number;
      publishRate: number;
      subscriptionRate: number;
      latency: LatencyMetrics;
    };
    
    // 分布式状态（如果适用）
    distributed?: {
      nodeCount: number;
      consensus: ConsensusStatus;
      partitions: PartitionInfo[];
      replication: ReplicationStatus;
    };
    
    // 性能指标
    performance: {
      throughput: number;
      latency: number;
      errorRate: number;
      availability: number;
    };
  };
  
  error?: string;
}

/**
 * 追踪查询响应
 */
export interface TraceQueryResponse {
  success: boolean;
  
  data?: {
    events: TraceEvent[];
    total: number;
    hasMore: boolean;
    searchTime: number;
    
    // 聚合结果
    aggregations?: {
      timeline: TimelineAggregation[];
      categories: Record<string, number>;
      sources: Record<string, number>;
      patterns: PatternAnalysis[];
    };
    
    // 分析结果
    analysis?: {
      anomalies: AnomalyDetection[];
      trends: TrendAnalysis[];
      correlations: CorrelationAnalysis[];
    };
  };
  
  error?: string;
}

/**
 * 事件订阅响应
 */
export interface EventSubscriptionResponse {
  success: boolean;
  
  data?: {
    subscriptionId: string;
    status: 'active' | 'pending' | 'failed';
    endpoint?: string;
    
    // 订阅统计
    statistics: {
      eventsDelivered: number;
      deliveryRate: number;
      errorRate: number;
      lastDelivery?: string;
    };
  };
  
  error?: string;
}

/**
 * 状态发布响应
 */
export interface StatePublishResponse {
  success: boolean;
  
  data?: {
    publishId: string;
    status: 'published' | 'propagating' | 'confirmed' | 'failed';
    
    // 传播统计
    propagation: {
      targetCount: number;
      confirmedCount: number;
      failedCount: number;
      averageLatency: number;
    };
    
    // 一致性状态
    consistency: {
      level: string;
      achieved: boolean;
      timestamp: string;
    };
  };
  
  error?: string;
}
```

## 🔧 **使用示例**

### **基础日志追踪示例**

```typescript
// 简单日志追踪，只需要基础记录功能
const basicTraceRequest: CreateTraceRequest = {
  name: "应用日志追踪",
  type: "logging",
  capabilities: {
    basic: {
      eventRecording: true,
      timestamping: true,
      correlation: false,
      persistence: true
    }
    // 不启用实时同步等高级功能
  },
  scope: {
    components: ["web_server", "database"],
    eventTypes: ["request", "response", "error"]
  }
};

const basicTrace = await traceProtocol.createTrace(basicTraceRequest);
```

### **TracePilot实时协调追踪示例**

```typescript
// TracePilot需要完整的实时同步和分布式协调能力
const realtimeTraceRequest: CreateTraceRequest = {
  name: "TracePilot实时协调追踪",
  type: "real_time",
  capabilities: {
    basic: {
      eventRecording: true,
      timestamping: true,
      correlation: true,
      persistence: true
    },
    realTimeSync: {
      pubsub: {
        enabled: true,
        topics: ["agent_status", "decision_events", "collaboration_updates"],
        qos: "at_least_once"
      },
      stateSync: {
        enabled: true,
        consistency: "strong",
        conflictResolution: "vector_clock"
      },
      broadcasting: {
        enabled: true,
        multicast: true,
        reliability: "reliable"
      }
    },
    distributedCoordination: {
      distributedLock: {
        enabled: true,
        algorithm: "raft",
        leaseTimeout: 30000
      },
      consensus: {
        enabled: true,
        protocol: "raft",
        participants: ["product_owner", "architect", "tech_lead"]
      }
    },
    analytics: {
      realTimeAnalysis: {
        enabled: true,
        windowSize: 60000,
        aggregations: ["count", "avg", "percentile"]
      },
      patternRecognition: {
        enabled: true,
        algorithms: ["anomaly_detection", "correlation"],
        sensitivity: 0.8
      }
    },
    storage: {
      retention: { policy: "time_based", value: 30, unit: "days" },
      compression: true,
      encryption: true,
      indexing: ["timestamp", "source", "type", "correlation_id"]
    }
  },
  scope: {
    components: ["dialog_engine", "decision_council", "knowledge_base", "agent_manager"],
    eventTypes: ["agent_created", "decision_made", "knowledge_updated", "collaboration_started"],
    sampling: { strategy: "all", rate: 1.0 }
  },
  configuration: {
    performance: { bufferSize: 10000, flushInterval: 1000, batchSize: 100, compression: true },
    network: { endpoints: ["trace-collector:9411"], protocol: "grpc", timeout: 5000, retryPolicy: { maxRetries: 3, backoffMs: 1000 } },
    security: { encryption: true, authentication: true, authorization: true, auditLogging: true }
  }
};

const realtimeTrace = await traceProtocol.createTrace(realtimeTraceRequest);
```

## 🔗 **链式影响分析**

### **直接影响的组件**
1. **Trace协议Schema** - 需要更新为统一接口的数据结构
2. **Trace协议类型定义** - 需要重新定义统一的TypeScript类型
3. **TraceController** - 需要实现统一接口的API端点
4. **TraceService** - 需要实现统一接口的业务逻辑
5. **Trace测试用例** - 需要更新为统一接口的测试

### **间接影响的协议**
1. **Core协议** - 需要支持工作流的追踪集成
2. **Dialog协议** - 需要支持对话过程的追踪
3. **Collab协议** - 需要支持协作过程的追踪
4. **Network协议** - 需要支持网络事件的追踪

## 📝 **文档更新清单**

### **必须同步更新的文档**
- [ ] `schemas/trace-protocol.json` - 更新为统一接口Schema
- [ ] `src/modules/trace/types.ts` - 更新为统一接口类型定义
- [ ] `docs/protocols/trace-protocol-specification.md` - 更新协议规范
- [ ] `docs/api/trace-api-reference.md` - 更新API文档
- [ ] `tests/trace/unified-interface.test.ts` - 新增统一接口测试

---

**设计版本**: v1.0.0  
**设计状态**: 设计完成  
**下一步**: 阶段2 Schema和类型定义链式更新  
**负责人**: MPLP协议完善团队  
**最后更新**: 2025年8月3日
