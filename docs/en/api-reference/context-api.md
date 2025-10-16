# Context API Reference

> **🌐 Language Navigation**: [English](context-api.md) | [中文](../../zh-CN/api-reference/context-api.md)



**Shared state and context management across agents - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Context%20Module-blue.svg)](../modules/context/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--context.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/context-api.md)

---

## 🎯 Overview

The Context API provides comprehensive context management capabilities for multi-agent systems. It enables agents to share state, coordinate activities, and maintain consistent context across distributed operations. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  ContextController,
  ContextManagementService,
  CreateContextDto,
  UpdateContextDto,
  ContextResponseDto
} from 'mplp/modules/context';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const contextModule = mplp.getModule('context');
```

## 🏗️ Core Interfaces

### **ContextResponseDto** (Response Interface)

```typescript
interface ContextResponseDto {
  contextId: string;                    // Unique context identifier (UUID)
  name: string;                         // Human-readable name
  description?: string;                 // Optional description
  status: ContextStatus;                // Current status
  lifecycleStage: LifecycleStage;      // Current lifecycle stage
  protocolVersion: string;              // MPLP protocol version (1.0.0)
  timestamp: string;                    // ISO timestamp
  sharedState: SharedState;             // Shared state data
  accessControl: AccessControl;         // Access control settings
  configuration: Configuration;         // Configuration data
  auditTrail: AuditTrail;              // Audit information
  monitoringIntegration: MonitoringIntegration; // Monitoring data
  performanceMetrics: PerformanceMetrics; // Performance data
  versionHistory: VersionHistory;       // Version tracking
  searchMetadata: SearchMetadata;       // Search metadata
  cachingPolicy: CachingPolicy;         // Caching configuration
  syncConfiguration: SyncConfiguration; // Sync settings
  errorHandling: ErrorHandling;         // Error handling config
  integrationEndpoints: IntegrationEndpoints; // Integration endpoints
  eventIntegration: EventIntegration;   // Event integration
}

// Status enums (from actual implementation)
type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
type LifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';
```

### **CreateContextDto** (Request Interface)

```typescript
interface CreateContextDto {
  name: string;                         // Required: Context name
  description?: string;                 // Optional: Context description
  sharedState?: Partial<SharedState>;   // Optional: Initial shared state
  accessControl?: Partial<AccessControl>; // Optional: Access control settings
  configuration?: Partial<Configuration>; // Optional: Configuration data
}
```

### **UpdateContextDto** (Update Interface)

```typescript
interface UpdateContextDto {
  name?: string;                        // Optional: Update name
  description?: string;                 // Optional: Update description
  status?: ContextStatus;               // Optional: Update status
  lifecycleStage?: LifecycleStage;     // Optional: Update lifecycle stage
  sharedState?: Partial<SharedState>;   // Optional: Update shared state
  accessControl?: Partial<AccessControl>; // Optional: Update access control
  configuration?: Partial<Configuration>; // Optional: Update configuration
}
```

### **SharedState** (Actual Structure)

```typescript
interface SharedState {
  variables: Record<string, any>;       // Shared variables
  resources: {
    allocated: Record<string, ResourceAllocation>;
    requirements: Record<string, ResourceRequirement>;
  };
  dependencies: Dependency[];           // Context dependencies
  goals: Goal[];                        // Context goals
}

interface ResourceAllocation {
  type: string;                         // Resource type
  amount: number;                       // Allocated amount
  unit: string;                         // Unit of measurement
  status: 'available' | 'in-use' | 'reserved';
}

interface ResourceRequirement {
  minimum: number;                      // Minimum required
  optimal: number;                      // Optimal amount
  unit: string;                         // Unit of measurement
}

interface Dependency {
  id: string;                          // Dependency ID
  type: string;                        // Dependency type
  status: 'pending' | 'resolved' | 'failed';
}

interface Goal {
  id: string;                          // Goal ID
  name: string;                        // Goal name
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'defined' | 'active' | 'completed' | 'failed';
  description?: string;                // Optional description
}
```

### **AccessControl** (Security Structure)

```typescript
interface AccessControl {
  owner: {
    userId: string;                     // Owner user ID
    role: string;                       // Owner role
  };
  permissions: Permission[];            // Permission list
}

interface Permission {
  principal: string;                    // Principal ID (user/agent)
  principalType: 'user' | 'agent' | 'group';
  resource: string;                     // Resource identifier
  actions: string[];                    // Allowed actions
  conditions: Condition[];              // Access conditions
}

interface Condition {
  type: string;                         // Condition type
  value: any;                          // Condition value
}
```

## 🚀 REST API Endpoints

### **POST /contexts** - Create Context

Creates a new context with the specified configuration.

```typescript
const contextController = new ContextController(contextManagementService);

const result = await contextController.createContext({
  name: 'Multi-Agent Collaboration',
  description: 'Collaborative context for multi-agent analysis',
  sharedState: {
    variables: {
      currentPhase: 'planning',
      environment: 'production'
    },
    resources: {
      allocated: {
        cpu: { 
          type: 'compute', 
          amount: 2, 
          unit: 'cores', 
          status: 'available' 
        }
      },
      requirements: {
        memory: { 
          minimum: 1024, 
          optimal: 2048, 
          unit: 'MB' 
        }
      }
    },
    dependencies: [],
    goals: [
      {
        id: 'goal-001',
        name: 'Complete Analysis',
        priority: 'high',
        status: 'defined',
        description: 'Analyze data and provide insights'
      }
    ]
  },
  accessControl: {
    owner: {
      userId: 'user-123',
      role: 'admin'
    },
    permissions: [
      {
        principal: 'agent-001',
        principalType: 'user',
        resource: 'context',
        actions: ['read', 'write'],
        conditions: []
      }
    ]
  }
});

// Response: ContextOperationResultDto
interface ContextOperationResultDto {
  success: boolean;
  contextId?: string;
  message?: string;
  metadata?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### **GET /contexts/:id** - Get Context by ID

Retrieves a context by its unique identifier.

```typescript
const context = await contextController.getContextById('123e4567-e89b-42d3-a456-426614174000');

if (context) {
  console.log(`Context: ${context.name}`);
  console.log(`Status: ${context.status}`);
  console.log(`Lifecycle Stage: ${context.lifecycleStage}`);
}

// Returns: ContextResponseDto | null
```

### **GET /contexts/by-name/:name** - Get Context by Name

Retrieves a context by its name.

```typescript
const context = await contextController.getContextByName('Multi-Agent Collaboration');

if (context) {
  console.log(`Context ID: ${context.contextId}`);
  console.log(`Status: ${context.status}`);
}

// Returns: ContextResponseDto | null
```

### **PUT /contexts/:id** - Update Context

Updates an existing context with new data.

```typescript
const result = await contextController.updateContext('123e4567-e89b-42d3-a456-426614174000', {
  name: 'Updated Context Name',
  description: 'Updated description',
  status: 'active',
  lifecycleStage: 'executing',
  sharedState: {
    variables: {
      currentPhase: 'execution',
      environment: 'production'
    }
  }
});

// Returns: ContextOperationResultDto
```

### **DELETE /contexts/:id** - Delete Context

Removes a context from the system.

```typescript
const result = await contextController.deleteContext('123e4567-e89b-42d3-a456-426614174000');

// Returns: ContextOperationResultDto
```

### **GET /contexts** - List Contexts

Lists contexts based on optional query criteria.

```typescript
// List all active contexts
const activeContexts = await contextController.listContexts({
  status: 'active'
});

// List contexts with pagination
const contexts = await contextController.listContexts({
  status: ['active', 'suspended'],
  lifecycleStage: 'executing',
  namePattern: 'collaboration',
  page: 1,
  limit: 10
});

// Returns: PaginatedContextResponseDto
```

## 📊 Query Parameters and Pagination

### **ContextQueryDto**

```typescript
interface ContextQueryDto {
  status?: ContextStatus | ContextStatus[];           // Filter by status
  lifecycleStage?: LifecycleStage | LifecycleStage[]; // Filter by lifecycle stage
  owner?: string;                                     // Filter by owner
  createdAfter?: string;                             // Filter by creation date (ISO string)
  createdBefore?: string;                            // Filter by creation date (ISO string)
  namePattern?: string;                              // Filter by name pattern
  page?: number;                                     // Page number (default: 1)
  limit?: number;                                    // Items per page (default: 10)
}
```

### **PaginatedContextResponseDto**

```typescript
interface PaginatedContextResponseDto {
  data: ContextResponseDto[];                        // Context data array
  total: number;                                     // Total count
  page: number;                                      // Current page
  limit: number;                                     // Items per page
  totalPages: number;                                // Total pages
  hasNext: boolean;                                  // Has next page
  hasPrevious: boolean;                              // Has previous page
}
```

---

## 🔗 Related Documentation

### **Context Module Documentation**
- **[Context Module Overview](../modules/context/README.md)** - Complete module documentation
- **[Context Schema](../schemas/README.md)** - JSON Schema specification
- **[Context Types](../modules/context/types.md)** - TypeScript type definitions

### **Integration Guides**
- **[Multi-Agent Integration](../implementation/multi-agent-integration.md)** - Integration patterns
- **[State Management](../implementation/state-management.md)** - State management strategies
- **[Security Configuration](../implementation/security-configuration.md)** - Security setup

---

**Context API Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: This API reference is based on the actual MPLP v1.0 Alpha implementation. All interfaces and examples reflect the real codebase structure and have been validated against the production code.
