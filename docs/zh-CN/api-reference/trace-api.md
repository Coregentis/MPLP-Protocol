# Trace API 参考

**执行监控和性能跟踪 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Trace%20模块-blue.svg)](../modules/trace/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--trace.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-107%2F107%20通过-green.svg)](../modules/trace/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/trace-api.md)

---

## 🎯 概述

Trace API为多智能体系统提供全面的执行监控、性能跟踪和调试功能。它支持详细的操作跟踪、决策日志记录、错误跟踪和性能分析。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  TraceController,
  TraceManagementService,
  CreateTraceDto,
  UpdateTraceDto,
  TraceResponseDto
} from 'mplp/modules/trace';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const traceModule = mplp.getModule('trace');
```

## 🏗️ 核心接口

### **TraceResponseDto** (响应接口)

```typescript
interface TraceResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  traceId: string;                // 唯一跟踪标识符
  contextId: string;              // 关联的上下文ID
  planId?: string;                // 关联的计划ID（可选）
  taskId?: string;                // 关联的任务ID（可选）
  traceType: TraceType;           // 跟踪类型
  severity: Severity;             // 严重程度
  traceOperation: TraceOperation; // 跟踪操作
  
  // 事件信息
  event: {
    type: EventType;
    name: string;
    category: EventCategory;
    source: {
      component: string;
      version?: string;
      instance?: string;
    };
    tags?: Record<string, string>;
  };
  
  // 可选详细信息
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  traceDetails?: TraceDetails;
}
```

### **CreateTraceDto** (创建请求接口)

```typescript
interface CreateTraceDto {
  contextId: string;              // 必需：关联的上下文ID
  planId?: string;                // 可选：关联的计划ID
  taskId?: string;                // 可选：关联的任务ID
  traceType: TraceType;           // 必需：跟踪类型
  severity: Severity;             // 必需：严重程度
  traceOperation: TraceOperation; // 必需：跟踪操作
  
  // 事件详情
  event: {
    type: EventType;
    name: string;
    category: EventCategory;
    source: {
      component: string;
      version?: string;
      instance?: string;
    };
    tags?: Record<string, string>;
  };
  
  // 可选详细信息
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  traceDetails?: TraceDetails;
}
```

### **UpdateTraceDto** (更新请求接口)

```typescript
interface UpdateTraceDto {
  traceId: string;                // 必需：要更新的跟踪ID
  severity?: Severity;            // 可选：更新严重程度
  
  // 部分更新
  event?: Partial<{
    type: EventType;
    name: string;
    category: EventCategory;
    tags: Record<string, string>;
  }>;
  
  contextSnapshot?: Partial<ContextSnapshot>;
  errorInformation?: Partial<ErrorInformation>;
  decisionLog?: Partial<DecisionLog>;
  traceDetails?: Partial<TraceDetails>;
}
```

## 🔧 核心枚举类型

### **TraceType** (跟踪类型)

```typescript
enum TraceType {
  EXECUTION = 'execution',        // 执行跟踪
  PERFORMANCE = 'performance',    // 性能跟踪
  ERROR = 'error',                // 错误跟踪
  DECISION = 'decision',          // 决策跟踪
  COMMUNICATION = 'communication', // 通信跟踪
  RESOURCE = 'resource'           // 资源跟踪
}
```

### **Severity** (严重程度)

```typescript
enum Severity {
  DEBUG = 'debug',                // 调试级别
  INFO = 'info',                  // 信息级别
  WARN = 'warn',                  // 警告级别
  ERROR = 'error',                // 错误级别
  CRITICAL = 'critical'           // 关键级别
}
```

### **TraceOperation** (跟踪操作)

```typescript
enum TraceOperation {
  START = 'start',                // 开始操作
  UPDATE = 'update',              // 更新操作
  END = 'end',                    // 结束操作
  CHECKPOINT = 'checkpoint',      // 检查点操作
  ROLLBACK = 'rollback'           // 回滚操作
}
```

### **EventType** (事件类型)

```typescript
enum EventType {
  SYSTEM = 'system',              // 系统事件
  USER = 'user',                  // 用户事件
  AGENT = 'agent',                // 智能体事件
  EXTERNAL = 'external'           // 外部事件
}
```

## 🎮 控制器API

### **TraceController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建跟踪**
```typescript
async createTrace(dto: CreateTraceDto): Promise<TraceOperationResultDto>
```

**HTTP端点**: `POST /api/traces`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "planId": "plan-87654321-wxyz-1234",
  "traceType": "execution",
  "severity": "info",
  "traceOperation": "start",
  "event": {
    "type": "system",
    "name": "task_execution_started",
    "category": "execution",
    "source": {
      "component": "task_executor",
      "version": "1.0.0",
      "instance": "executor-001"
    },
    "tags": {
      "environment": "production",
      "priority": "high"
    }
  },
  "contextSnapshot": {
    "variables": {
      "current_step": 1,
      "total_steps": 5
    },
    "resources": {
      "cpu_usage": 45.2,
      "memory_usage": 1024
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "traceId": "trace-abcd1234-efgh-5678",
  "message": "跟踪创建成功",
  "data": {
    "traceId": "trace-abcd1234-efgh-5678",
    "contextId": "ctx-12345678-abcd-efgh",
    "traceType": "execution",
    "severity": "info",
    "timestamp": "2025-09-04T10:30:00.000Z",
    "protocolVersion": "1.0.0"
  }
}
```

#### **获取跟踪**
```typescript
async getTrace(traceId: string): Promise<TraceResponseDto | null>
```

**HTTP端点**: `GET /api/traces/{traceId}`

#### **更新跟踪**
```typescript
async updateTrace(traceId: string, dto: UpdateTraceDto): Promise<TraceOperationResultDto>
```

**HTTP端点**: `PUT /api/traces/{traceId}`

#### **删除跟踪**
```typescript
async deleteTrace(traceId: string): Promise<TraceOperationResultDto>
```

**HTTP端点**: `DELETE /api/traces/{traceId}`

#### **查询跟踪**
```typescript
async queryTraces(queryDto: TraceQueryDto, pagination?: PaginationParams): Promise<TraceQueryResultDto>
```

**HTTP端点**: `GET /api/traces`

**查询参数**:
- `contextId`: 按上下文ID过滤
- `planId`: 按计划ID过滤
- `traceType`: 按跟踪类型过滤
- `severity`: 按严重程度过滤
- `eventCategory`: 按事件类别过滤
- `createdAfter`: 按创建日期过滤（之后）
- `createdBefore`: 按创建日期过滤（之前）
- `hasErrors`: 过滤有错误的跟踪
- `hasDecisions`: 过滤有决策的跟踪
- `limit`: 限制结果数量
- `offset`: 分页偏移量

#### **批量创建跟踪**
```typescript
async createTraceBatch(dtos: CreateTraceDto[]): Promise<BatchOperationResultDto>
```

**HTTP端点**: `POST /api/traces/batch`

#### **开始跟踪**
```typescript
async startTrace(data: StartTraceData): Promise<TraceResponseDto>
```

**HTTP端点**: `POST /api/traces/start`

#### **结束跟踪**
```typescript
async endTrace(traceId: string, endData?: EndTraceData): Promise<TraceResponseDto>
```

**HTTP端点**: `POST /api/traces/{traceId}/end`

#### **添加跨度**
```typescript
async addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>
```

**HTTP端点**: `POST /api/traces/{traceId}/spans`

## 🔧 服务层API

### **TraceManagementService**

核心业务逻辑服务，提供跟踪管理功能。

#### **主要方法**

```typescript
class TraceManagementService {
  // 基础CRUD操作
  async createTrace(request: CreateTraceRequest): Promise<TraceEntityData>;
  async getTraceById(traceId: string): Promise<TraceEntityData | null>;
  async updateTrace(traceId: string, request: UpdateTraceRequest): Promise<TraceEntityData>;
  async deleteTrace(traceId: string): Promise<boolean>;
  
  // 高级跟踪操作
  async startTrace(data: StartTraceData): Promise<TraceEntity>;
  async endTrace(traceId: string, endData?: EndTraceData): Promise<TraceEntity>;
  async addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>;
  
  // 批量操作
  async createTraceBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
  async deleteTraceBatch(traceIds: string[]): Promise<number>;
  
  // 查询和分析
  async queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{ traces: TraceEntityData[]; total: number }>;
  async getTraceStatistics(): Promise<TraceStatistics>;
  async analyzeTrace(traceId: string): Promise<TraceAnalysisResult>;
  
  // 验证和健康检查
  async validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
  async getHealthStatus(): Promise<HealthStatus>;
}
```

## 📊 数据结构

### **ContextSnapshot** (上下文快照)

```typescript
interface ContextSnapshot {
  variables: Record<string, any>;     // 上下文变量
  resources: Record<string, number>;  // 资源使用情况
  state: Record<string, any>;         // 当前状态
  metadata?: Record<string, any>;     // 附加元数据
}
```

### **ErrorInformation** (错误信息)

```typescript
interface ErrorInformation {
  errorCode: string;                  // 错误代码
  errorMessage: string;               // 错误消息
  stackTrace?: string;                // 堆栈跟踪
  errorCategory: 'system' | 'user' | 'network' | 'data' | 'business';
  severity: Severity;                 // 错误严重程度
  recoverable: boolean;               // 是否可恢复
  retryCount?: number;                // 重试次数
  relatedTraceIds?: string[];         // 相关跟踪ID
}
```

### **DecisionLog** (决策日志)

```typescript
interface DecisionLog {
  decisionPoint: string;              // 决策点标识符
  optionsConsidered: Array<{
    option: string;
    score: number;
    rationale?: string;
    riskFactors?: string[];
  }>;
  selectedOption: string;             // 选择的选项
  decisionCriteria?: Array<{
    criterion: string;
    weight: number;
    evaluation: string;
  }>;
  confidenceLevel?: number;           // 置信度（0-1）
}
```

### **SpanData** (跨度数据)

```typescript
interface SpanData {
  parentSpanId?: string;              // 父跨度ID
  operationName: string;              // 操作名称
  startTime?: Date;                   // 开始时间
  endTime?: Date;                     // 结束时间
  duration?: number;                  // 持续时间（毫秒）
  tags?: Record<string, string>;      // 跨度标签
  logs?: Array<{
    timestamp: Date;
    message: string;
    level: string;
  }>;
  status?: 'active' | 'completed' | 'error';
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/trace/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/trace/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/trace/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/trace/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
