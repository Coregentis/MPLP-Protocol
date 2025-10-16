# Trace API Reference

> **🌐 Language Navigation**: [English](trace-api.md) | [中文](../../zh-CN/api-reference/trace-api.md)



**Execution Monitoring and Performance Tracking - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Trace%20Module-blue.svg)](../modules/trace/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--trace.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-107%2F107%20passing-green.svg)](../modules/trace/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/trace-api.md)

---

## 🎯 Overview

The Trace API provides comprehensive execution monitoring, performance tracking, and debugging capabilities for multi-agent systems. It enables detailed tracing of operations, decision logging, error tracking, and performance analysis. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  TraceController,
  TraceManagementService,
  CreateTraceDto,
  UpdateTraceDto,
  TraceResponseDto
} from 'mplp/modules/trace';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const traceModule = mplp.getModule('trace');
```

## 🏗️ Core Interfaces

### **TraceResponseDto** (Response Interface)

```typescript
interface TraceResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  traceId: string;                // Unique trace identifier
  contextId: string;              // Associated context ID
  planId?: string;                // Associated plan ID (optional)
  taskId?: string;                // Associated task ID (optional)
  traceType: TraceType;           // Trace type
  severity: Severity;             // Severity level
  traceOperation: TraceOperation; // Trace operation
  
  // Event information
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
  
  // Optional detailed information
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  traceDetails?: TraceDetails;
}
```

### **CreateTraceDto** (Create Request Interface)

```typescript
interface CreateTraceDto {
  contextId: string;              // Required: Associated context ID
  planId?: string;                // Optional: Associated plan ID
  taskId?: string;                // Optional: Associated task ID
  traceType: TraceType;           // Required: Trace type
  severity: Severity;             // Required: Severity level
  traceOperation: TraceOperation; // Required: Trace operation
  
  // Event details
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
  
  // Optional detailed information
  contextSnapshot?: ContextSnapshot;
  errorInformation?: ErrorInformation;
  decisionLog?: DecisionLog;
  traceDetails?: TraceDetails;
}
```

### **UpdateTraceDto** (Update Request Interface)

```typescript
interface UpdateTraceDto {
  traceId: string;                // Required: Trace ID to update
  severity?: Severity;            // Optional: Update severity
  
  // Partial updates
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

## 🔧 Core Enums

### **TraceType** (Trace Type)

```typescript
enum TraceType {
  EXECUTION = 'execution',        // Execution trace
  PERFORMANCE = 'performance',    // Performance trace
  ERROR = 'error',                // Error trace
  DECISION = 'decision',          // Decision trace
  COMMUNICATION = 'communication', // Communication trace
  RESOURCE = 'resource'           // Resource trace
}
```

### **Severity** (Severity Level)

```typescript
enum Severity {
  DEBUG = 'debug',                // Debug level
  INFO = 'info',                  // Information level
  WARN = 'warn',                  // Warning level
  ERROR = 'error',                // Error level
  CRITICAL = 'critical'           // Critical level
}
```

### **TraceOperation** (Trace Operation)

```typescript
enum TraceOperation {
  START = 'start',                // Start operation
  UPDATE = 'update',              // Update operation
  END = 'end',                    // End operation
  CHECKPOINT = 'checkpoint',      // Checkpoint operation
  ROLLBACK = 'rollback'           // Rollback operation
}
```

### **EventType** (Event Type)

```typescript
enum EventType {
  SYSTEM = 'system',              // System event
  USER = 'user',                  // User event
  AGENT = 'agent',                // Agent event
  EXTERNAL = 'external'           // External event
}
```

## 🎮 Controller API

### **TraceController**

Main REST API controller providing HTTP endpoint access.

#### **Create Trace**
```typescript
async createTrace(dto: CreateTraceDto): Promise<TraceOperationResultDto>
```

**HTTP Endpoint**: `POST /api/traces`

**Request Example**:
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

**Response Example**:
```json
{
  "success": true,
  "traceId": "trace-abcd1234-efgh-5678",
  "message": "Trace created successfully",
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

#### **Get Trace**
```typescript
async getTrace(traceId: string): Promise<TraceResponseDto | null>
```

**HTTP Endpoint**: `GET /api/traces/{traceId}`

#### **Update Trace**
```typescript
async updateTrace(traceId: string, dto: UpdateTraceDto): Promise<TraceOperationResultDto>
```

**HTTP Endpoint**: `PUT /api/traces/{traceId}`

#### **Delete Trace**
```typescript
async deleteTrace(traceId: string): Promise<TraceOperationResultDto>
```

**HTTP Endpoint**: `DELETE /api/traces/{traceId}`

#### **Query Traces**
```typescript
async queryTraces(queryDto: TraceQueryDto, pagination?: PaginationParams): Promise<TraceQueryResultDto>
```

**HTTP Endpoint**: `GET /api/traces`

**Query Parameters**:
- `contextId`: Filter by context ID
- `planId`: Filter by plan ID
- `traceType`: Filter by trace type
- `severity`: Filter by severity level
- `eventCategory`: Filter by event category
- `createdAfter`: Filter by creation date (after)
- `createdBefore`: Filter by creation date (before)
- `hasErrors`: Filter traces with errors
- `hasDecisions`: Filter traces with decisions
- `limit`: Limit results
- `offset`: Pagination offset

#### **Create Trace Batch**
```typescript
async createTraceBatch(dtos: CreateTraceDto[]): Promise<BatchOperationResultDto>
```

**HTTP Endpoint**: `POST /api/traces/batch`

#### **Start Trace**
```typescript
async startTrace(data: StartTraceData): Promise<TraceResponseDto>
```

**HTTP Endpoint**: `POST /api/traces/start`

#### **End Trace**
```typescript
async endTrace(traceId: string, endData?: EndTraceData): Promise<TraceResponseDto>
```

**HTTP Endpoint**: `POST /api/traces/{traceId}/end`

#### **Add Span**
```typescript
async addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>
```

**HTTP Endpoint**: `POST /api/traces/{traceId}/spans`

## 🔧 Service Layer API

### **TraceManagementService**

Core business logic service providing trace management functionality.

#### **Main Methods**

```typescript
class TraceManagementService {
  // Basic CRUD operations
  async createTrace(request: CreateTraceRequest): Promise<TraceEntityData>;
  async getTraceById(traceId: string): Promise<TraceEntityData | null>;
  async updateTrace(traceId: string, request: UpdateTraceRequest): Promise<TraceEntityData>;
  async deleteTrace(traceId: string): Promise<boolean>;
  
  // Advanced tracing operations
  async startTrace(data: StartTraceData): Promise<TraceEntity>;
  async endTrace(traceId: string, endData?: EndTraceData): Promise<TraceEntity>;
  async addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>;
  
  // Batch operations
  async createTraceBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
  async deleteTraceBatch(traceIds: string[]): Promise<number>;
  
  // Query and analytics
  async queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{ traces: TraceEntityData[]; total: number }>;
  async getTraceStatistics(): Promise<TraceStatistics>;
  async analyzeTrace(traceId: string): Promise<TraceAnalysisResult>;
  
  // Validation and health
  async validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
  async getHealthStatus(): Promise<HealthStatus>;
}
```

## 📊 Data Structures

### **ContextSnapshot** (Context Snapshot)

```typescript
interface ContextSnapshot {
  variables: Record<string, any>;     // Context variables
  resources: Record<string, number>;  // Resource usage
  state: Record<string, any>;         // Current state
  metadata?: Record<string, any>;     // Additional metadata
}
```

### **ErrorInformation** (Error Information)

```typescript
interface ErrorInformation {
  errorCode: string;                  // Error code
  errorMessage: string;               // Error message
  stackTrace?: string;                // Stack trace
  errorCategory: 'system' | 'user' | 'network' | 'data' | 'business';
  severity: Severity;                 // Error severity
  recoverable: boolean;               // Is recoverable
  retryCount?: number;                // Retry attempts
  relatedTraceIds?: string[];         // Related traces
}
```

### **DecisionLog** (Decision Log)

```typescript
interface DecisionLog {
  decisionPoint: string;              // Decision point identifier
  optionsConsidered: Array<{
    option: string;
    score: number;
    rationale?: string;
    riskFactors?: string[];
  }>;
  selectedOption: string;             // Selected option
  decisionCriteria?: Array<{
    criterion: string;
    weight: number;
    evaluation: string;
  }>;
  confidenceLevel?: number;           // Confidence level (0-1)
}
```

### **SpanData** (Span Data)

```typescript
interface SpanData {
  parentSpanId?: string;              // Parent span ID
  operationName: string;              // Operation name
  startTime?: Date;                   // Start time
  endTime?: Date;                     // End time
  duration?: number;                  // Duration in milliseconds
  tags?: Record<string, string>;      // Span tags
  logs?: Array<{
    timestamp: Date;
    message: string;
    level: string;
  }>;
  status?: 'active' | 'completed' | 'error';
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/trace/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/trace/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/trace/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/trace/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
