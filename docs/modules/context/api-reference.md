# Context Module API Reference v2.0.0 (Refactored)

## 🚀 **重构后API概览**

Context Module v2.0.0 提供基于**IMLPPProtocol标准**的统一API接口，支持**6种基础操作**，集成**3个核心服务**和**9个横切关注点**。

**协议版本**: `2.0.0`
**接口标准**: `IMLPPProtocol`
**支持操作**: 6种基础操作
**响应时间**: <50ms
**吞吐量**: >2000 ops/sec

## 📋 **IMLPPProtocol标准接口**

### **统一协议接口**
```typescript
interface IMLPPProtocol {
  executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
  getProtocolMetadata(): ProtocolMetadata;
  healthCheck(): Promise<HealthStatus>;
}
```

### **标准请求格式**
```typescript
interface MLPPRequest {
  protocolVersion: string;    // "2.0.0"
  timestamp: string;          // ISO 8601 timestamp
  requestId: string;          // Unique request identifier
  operation: string;          // Operation name (17 supported)
  payload: Record<string, unknown>; // Operation-specific data
  metadata?: Record<string, unknown>; // Optional metadata
}
```

### **标准响应格式**
```typescript
interface MLPPResponse {
  protocolVersion: string;    // "2.0.0"
  timestamp: string;          // ISO 8601 timestamp
  requestId: string;          // Request identifier
  status: 'success' | 'error' | 'pending';
  result?: Record<string, unknown>; // Operation result
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>; // Response metadata
}
```

## 🔧 **3个核心服务API**

### **1. ContextManagementService API (7种操作)**

#### **创建上下文**
```typescript
// Operation: create_context
const request: MLPPRequest = {
  protocolVersion: "2.0.0",
  operation: "create_context",
  payload: {
    name: "My Context",
    description: "Context description"
  },
  requestId: "req-001",
  timestamp: new Date().toISOString()
};
```

#### **获取上下文**
```typescript
// Operation: get_context
const request: MLPPRequest = {
  protocolVersion: "2.0.0",
  operation: "get_context",
  payload: {
    contextId: "context-001"
  },
  requestId: "req-002",
  timestamp: new Date().toISOString()
};
```

#### **更新上下文**
```typescript
// Operation: update_context
const request: MLPPRequest = {
  protocolVersion: "2.0.0",
  operation: "update_context",
  payload: {
    contextId: "context-001",
    data: {
      description: "Updated description",
      status: "active"
    }
  },
  requestId: "req-003",
  timestamp: new Date().toISOString()
};
```

#### **生命周期转换 (新增功能)**
```typescript
// Operation: transition_lifecycle
const request: MLPPRequest = {
  protocolVersion: "2.0.0",
  operation: "transition_lifecycle",
  payload: {
    contextId: "context-001",
    newStage: "executing"
  },
  requestId: "req-004",
  timestamp: new Date().toISOString()
};
```

#### **状态同步 (新增功能)**
```typescript
// Operation: sync_state
const request: MLPPRequest = {
  protocolVersion: "2.0.0",
  operation: "sync_state",
  payload: {
    contextId: "context-001",
    stateUpdates: {
      variables: { phase: "development" },
      goals: ["Complete MVP"]
    }
  },
  requestId: "req-005",
  timestamp: new Date().toISOString()
};
```
  timestamp: string;
  context?: ContextEntityData;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Example**:
```bash
curl -X POST /api/v1/context \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Project Alpha Context",
    "description": "Context for Project Alpha development",
    "lifecycleStage": "planning",
    "sharedState": {
      "variables": {
        "projectPhase": "initial",
        "budget": 100000
      },
      "goals": [
        "Complete requirements analysis",
        "Design system architecture"
      ]
    },
    "accessControl": {
      "owner": {
        "userId": "user-123",
        "role": "admin"
      }
    }
  }'
```

#### **Get Context by ID**
```http
GET /api/v1/context/{contextId}
```

**Parameters**:
- `contextId` (path): Context UUID

**Response**:
```typescript
interface GetContextResponse {
  success: boolean;
  context?: ContextEntityData;
  message: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}
```

**Example**:
```bash
curl -X GET /api/v1/context/ctx-123-456-789 \
  -H "Authorization: Bearer <token>"
```

#### **Update Context**
```http
PUT /api/v1/context/{contextId}
```

**Parameters**:
- `contextId` (path): Context UUID

**Request Body**:
```typescript
interface UpdateContextRequest {
  name?: string;
  description?: string;
  status?: ContextStatus;
  lifecycleStage?: LifecycleStage;
  sharedState?: Partial<SharedState>;
  configuration?: Partial<ContextConfiguration>;
}
```

**Response**:
```typescript
interface UpdateContextResponse {
  success: boolean;
  context?: ContextEntityData;
  message: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}
```

#### **Delete Context**
```http
DELETE /api/v1/context/{contextId}
```

**Parameters**:
- `contextId` (path): Context UUID

**Response**:
```typescript
interface DeleteContextResponse {
  success: boolean;
  message: string;
  timestamp: string;
  metadata?: {
    deleted: boolean;
    contextId: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### **Context Queries**

#### **List Contexts**
```http
GET /api/v1/context
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by status
- `lifecycleStage` (string): Filter by lifecycle stage
- `ownerId` (string): Filter by owner ID
- `search` (string): Search in name and description

**Response**:
```typescript
interface ListContextsResponse {
  success: boolean;
  data: ContextEntityData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}
```

**Example**:
```bash
curl -X GET "/api/v1/context?page=1&limit=10&status=active" \
  -H "Authorization: Bearer <token>"
```

#### **Search Contexts**
```http
POST /api/v1/context/search
```

**Request Body**:
```typescript
interface SearchContextsRequest {
  filters: {
    status?: ContextStatus | ContextStatus[];
    lifecycleStage?: LifecycleStage | LifecycleStage[];
    ownerId?: string;
    createdAfter?: string;
    createdBefore?: string;
    tags?: string[];
  };
  search?: {
    query: string;
    fields: ('name' | 'description')[];
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}
```

### **Context Statistics**

#### **Get Context Statistics**
```http
GET /api/v1/context/statistics
```

**Response**:
```typescript
interface ContextStatisticsResponse {
  success: boolean;
  statistics: {
    total: number;
    byStatus: Record<ContextStatus, number>;
    byLifecycleStage: Record<LifecycleStage, number>;
    byOwner: Array<{
      ownerId: string;
      count: number;
    }>;
    recentActivity: Array<{
      date: string;
      created: number;
      updated: number;
      deleted: number;
    }>;
  };
  message: string;
  timestamp: string;
}
```

### **Health and Monitoring**

#### **Health Check**
```http
GET /api/v1/context/health
```

**Response**:
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }>;
  metadata?: {
    version: string;
    uptime: number;
    environment: string;
  };
}
```

#### **Get Metrics**
```http
GET /api/v1/context/metrics
```

**Response**:
```typescript
interface MetricsResponse {
  success: boolean;
  metrics: {
    performance: {
      averageResponseTime: number;
      p95ResponseTime: number;
      p99ResponseTime: number;
      requestsPerSecond: number;
    };
    usage: {
      totalContexts: number;
      activeContexts: number;
      requestsToday: number;
      errorsToday: number;
    };
    resources: {
      memoryUsage: number;
      cpuUsage: number;
      cacheHitRate: number;
    };
  };
  timestamp: string;
}
```

## 📊 **Data Types**

### **Core Types**
```typescript
type UUID = string;
type Timestamp = string;

type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';
type UserRole = 'admin' | 'user' | 'viewer' | 'developer' | 'manager';

interface ContextEntityData {
  protocolVersion: string;
  timestamp: Timestamp;
  contextId: UUID;
  name: string;
  description?: string;
  status: ContextStatus;
  lifecycleStage: LifecycleStage;
  sharedState: SharedState;
  accessControl: AccessControl;
  configuration: ContextConfiguration;
  auditTrail: AuditTrail;
  monitoringIntegration: MonitoringIntegration;
  performanceMetrics: PerformanceMetrics;
  versionHistory: VersionHistory;
  searchMetadata: SearchMetadata;
  cachingPolicy: CachingPolicy;
  syncConfiguration: SyncConfiguration;
  errorHandling: ErrorHandling;
  integrationEndpoints: IntegrationEndpoints;
  eventIntegration: EventIntegration;
}
```

### **Shared State**
```typescript
interface SharedState {
  variables: Record<string, any>;
  resources: ResourceAllocation;
  dependencies: string[];
  goals: string[];
}

interface ResourceAllocation {
  allocated: Record<string, any>;
  requirements: Record<string, any>;
}
```

### **Access Control**
```typescript
interface AccessControl {
  owner: {
    userId: UUID;
    role: UserRole;
  };
  permissions: Permission[];
}

interface Permission {
  userId: UUID;
  role: UserRole;
  permissions: string[];
  grantedAt?: Timestamp;
  expiresAt?: Timestamp;
}
```

## 🔒 **Authentication & Authorization**

### **Authentication**
```http
Authorization: Bearer <jwt-token>
```

### **Required Permissions**
- `context:create` - Create new contexts
- `context:read` - Read context data
- `context:update` - Update context data
- `context:delete` - Delete contexts
- `context:list` - List contexts
- `context:statistics` - View statistics
- `context:admin` - Administrative operations

### **Role-Based Access**
- **Admin**: Full access to all operations
- **Manager**: Create, read, update contexts they own
- **Developer**: Read, update contexts they have access to
- **Viewer**: Read-only access to permitted contexts

## ⚠️ **Error Handling**

### **Error Response Format**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}
```

### **Error Codes**
- `CONTEXT_NOT_FOUND` - Context does not exist
- `CONTEXT_CREATION_FAILED` - Failed to create context
- `CONTEXT_UPDATE_FAILED` - Failed to update context
- `CONTEXT_DELETE_FAILED` - Failed to delete context
- `VALIDATION_ERROR` - Request validation failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Unexpected server error

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📈 **Rate Limiting**

### **Default Limits**
- **Authenticated Users**: 1000 requests/hour
- **Anonymous Users**: 100 requests/hour
- **Admin Users**: 5000 requests/hour

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643723400
```

## 🔄 **Versioning**

### **API Versioning**
- **Current Version**: v1
- **Version Header**: `API-Version: v1`
- **URL Versioning**: `/api/v1/context`

### **Backward Compatibility**
- v1 API is stable and backward compatible
- Deprecated features will be marked with warnings
- Breaking changes will result in new API version

---

**API Version**: 1.0.0  
**Last Updated**: 2025-01-25  
**Status**: Production Ready
