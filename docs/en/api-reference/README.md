# MPLP v1.0 Alpha - API Reference

**Complete API documentation for the Multi-Agent Protocol Lifecycle Platform**

## 📚 **API Documentation Overview**

This section provides comprehensive API documentation for all layers of the MPLP v1.0 Alpha protocol stack. **All 10 modules are 100% complete** with enterprise-grade APIs, **2,869/2,869 tests passing**, and **zero technical debt**. The APIs are organized by layer and module for easy navigation.

## 🏗️ **API Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    L4 Agent Layer                           │
│              (Your Agent Implementation)                    │
├─────────────────────────────────────────────────────────────┤
│                 L3 Execution Layer                          │
│              CoreOrchestrator API                           │
├─────────────────────────────────────────────────────────────┤
│                L2 Coordination Layer                        │
│  Context │ Plan │ Role │ Confirm │ Trace │ Extension │...   │
├─────────────────────────────────────────────────────────────┤
│                 L1 Protocol Layer                           │
│           Schema Validation & Cross-cutting APIs            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Quick Navigation**

### **Core APIs**
- **[MPLPCore API](core-api.md)** - Main MPLP initialization and management
- **[CoreOrchestrator API](orchestrator-api.md)** - L3 workflow orchestration
- **[Schema Validation API](schema-api.md)** - L1 protocol validation

### **L2 Coordination Module APIs**

#### **Core Protocol Modules** (All Enterprise-Grade Complete)
- **[Context API](context-api.md)** - Shared state and context management ✅ **(499/499 tests)**
- **[Plan API](plan-api.md)** - Collaborative planning and goal decomposition ✅ **(170/170 tests)**
- **[Role API](role-api.md)** - Role-based access control and capabilities ✅ **(323/323 tests)**
- **[Confirm API](confirm-api.md)** - Multi-party approval and consensus ✅ **(265/265 tests)**
- **[Trace API](trace-api.md)** - Execution monitoring and performance tracking ✅ **(107/107 tests)**
- **[Extension API](extension-api.md)** - Plugin system and custom functionality ✅ **(92/92 tests)**

#### **Collaboration Modules** (All Enterprise-Grade Complete)
- **[Dialog API](dialog-api.md)** - Inter-agent communication and conversations ✅ **(121/121 tests)**
- **[Collab API](collab-api.md)** - Multi-agent collaboration and coordination ✅ **(146/146 tests)**
- **[Network API](network-api.md)** - Distributed communication and service discovery ✅ **(190/190 tests)**
- **[Core API](core-api.md)** - Central coordination and system management ✅ **(584/584 tests)**

### **Cross-Cutting Concern APIs**
- **[Event Bus API](event-bus-api.md)** - Event-driven communication
- **[Error Handling API](error-handling-api.md)** - Standardized error management
- **[Logging API](logging-api.md)** - Structured logging and tracing
- **[Caching API](caching-api.md)** - Multi-tier caching strategies
- **[Security API](security-api.md)** - Authentication and authorization

## 🚀 **Getting Started with APIs**

### **Basic API Usage Pattern**

```typescript
import { MPLPCore } from 'mplp';

// 1. Initialize MPLP
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'development'
});

await mplp.initialize();

// 2. Get module APIs
const contextAPI = mplp.getModule('context');
const planAPI = mplp.getModule('plan');
const orchestratorAPI = mplp.getCoreOrchestrator();

// 3. Use APIs
const context = await contextAPI.createContext({
  name: 'my-context',
  type: 'project'
});

const plan = await planAPI.createPlan({
  contextId: context.id,
  objectives: ['objective-1', 'objective-2']
});

const workflow = await orchestratorAPI.executeWorkflow({
  stages: ['context', 'plan', 'execute']
});
```

### **Error Handling Pattern**

```typescript
import { MPLPError, ErrorCode } from 'mplp';

try {
  const result = await mplp.context.createContext(contextData);
  return result;
} catch (error) {
  if (error instanceof MPLPError) {
    switch (error.code) {
      case ErrorCode.VALIDATION_ERROR:
        console.error('Validation failed:', error.details);
        break;
      case ErrorCode.PERMISSION_DENIED:
        console.error('Permission denied:', error.message);
        break;
      default:
        console.error('MPLP error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
  throw error;
}
```

### **Event Handling Pattern**

```typescript
// Subscribe to events
mplp.eventBus.subscribe('context.created', (event) => {
  console.log('Context created:', event.data);
});

mplp.eventBus.subscribe('workflow.completed', (event) => {
  console.log('Workflow completed:', event.data);
});

// Publish events
await mplp.eventBus.publish('custom.event', {
  source: 'my-agent',
  data: { message: 'Hello, MPLP!' }
});
```

## 📊 **API Conventions**

### **Request/Response Format**
All APIs follow consistent request/response patterns:

```typescript
// Request format
interface APIRequest<T = unknown> {
  data: T;
  metadata?: RequestMetadata;
  correlationId?: string;
}

// Response format
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata: ResponseMetadata;
  correlationId: string;
}

// Error format
interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
```

### **Common Parameters**

#### **Pagination**
```typescript
interface PaginationParams {
  page?: number;        // Page number (1-based)
  limit?: number;       // Items per page (default: 20, max: 100)
  sortBy?: string;      // Sort field
  sortOrder?: 'asc' | 'desc'; // Sort direction
}
```

#### **Filtering**
```typescript
interface FilterParams {
  filters?: Record<string, unknown>; // Field-based filters
  search?: string;                   // Text search
  dateRange?: {                      // Date range filter
    from: Date;
    to: Date;
  };
}
```

#### **Options**
```typescript
interface RequestOptions {
  timeout?: number;     // Request timeout in ms
  retries?: number;     // Number of retries
  priority?: 'low' | 'normal' | 'high'; // Request priority
}
```

## 🔒 **Authentication & Authorization**

### **API Authentication**
```typescript
// Initialize with authentication
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  auth: {
    type: 'bearer',
    token: 'your-api-token'
  }
});

// Or set authentication later
mplp.setAuthToken('your-api-token');
```

### **Role-Based Access Control**
```typescript
// Check permissions before API calls
const hasPermission = await mplp.role.checkPermission({
  userId: 'user-123',
  resource: 'context',
  action: 'create'
});

if (hasPermission) {
  const context = await mplp.context.createContext(contextData);
}
```

## 📈 **Performance & Monitoring**

### **API Metrics**
```typescript
// Get API performance metrics
const metrics = await mplp.getAPIMetrics();
console.log('API Metrics:', {
  totalRequests: metrics.totalRequests,
  averageResponseTime: metrics.averageResponseTime,
  errorRate: metrics.errorRate,
  throughput: metrics.requestsPerSecond
});
```

### **Health Checks**
```typescript
// Check API health
const health = await mplp.getAPIHealth();
console.log('API Health:', {
  status: health.status,           // 'healthy' | 'degraded' | 'unhealthy'
  uptime: health.uptime,          // Uptime in seconds
  version: health.version,        // API version
  modules: health.moduleStatus    // Individual module health
});
```

## ⚠️ **Alpha Version Notes**

### **API Stability**
- **Core APIs**: Stable, minimal changes expected
- **Module APIs**: Stable, may receive enhancements
- **Experimental APIs**: May change significantly

### **Versioning**
```typescript
// Check API version compatibility
const compatibility = await mplp.checkAPICompatibility('1.0.0-alpha');
if (!compatibility.isCompatible) {
  console.warn('API version mismatch:', compatibility.issues);
}
```

### **Migration Support**
```typescript
// Enable migration warnings
mplp.configure({
  enableMigrationWarnings: true,
  migrationWarningLevel: 'info' // 'info' | 'warn' | 'error'
});
```

## 🔗 **Related Resources**

### **Development Tools**
- **[MPLP CLI](../guides/cli-guide.md)** - Command-line interface
- **[Testing Utilities](../guides/testing-guide.md)** - API testing helpers
- **[Debug Tools](../guides/debugging-guide.md)** - API debugging utilities

### **Integration Guides**
- **[Quick Start](../guides/quick-start.md)** - Get started in 5 minutes
- **[Integration Guide](../guides/integration-guide.md)** - Integrate with existing systems
- **[Best Practices](../guides/best-practices.md)** - API usage best practices

### **Examples**
- **[Code Examples](../../examples/)** - Working code samples
- **[Use Cases](../guides/use-cases.md)** - Common usage patterns
- **[Recipes](../guides/recipes.md)** - Solution recipes

---

**📝 Documentation Status**: This API documentation is actively maintained and updated with each release. For the most current information, always refer to the latest version.

**🐛 Found an Issue?**: If you find any errors or have suggestions for improving this documentation, please [open an issue](https://github.com/your-org/mplp/issues) or contribute via [pull request](https://github.com/your-org/mplp/pulls).

**⚠️ Alpha Notice**: These APIs are part of MPLP v1.0 Alpha. While core functionality is stable, some APIs may receive enhancements based on community feedback before the stable release.
