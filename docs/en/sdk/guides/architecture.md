# MPLP Architecture Guide

> **🎯 Goal**: Deep understanding of MPLP architecture design  
> **📚 Audience**: Architects, Senior Developers  
> **🌐 Language**: English | [中文](../../docs-sdk/guides/architecture.md)

---

## 📋 **Table of Contents**

1. [Overall Architecture](#overall-architecture)
2. [L1-L3 Protocol Stack](#l1-l3-protocol-stack)
3. [10 Core Modules](#10-core-modules)
4. [SDK Architecture](#sdk-architecture)
5. [Design Principles](#design-principles)

---

## 🏗️ **Overall Architecture**

### **1.1 Four-Layer Architecture**

```
┌─────────────────────────────────────────┐
│  L4: Agent Layer (Application Layer)    │
│  - Specific Agent implementations       │
│  - Business logic                       │
│  - AI decision and learning             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L3: Execution Layer                    │
│  - CoreOrchestrator (Central Coord.)    │
│  - Workflow orchestration               │
│  - Resource management                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L2: Coordination Layer                 │
│  - 10 core modules                      │
│  - Inter-module collaboration           │
│  - Reserved interfaces                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L1: Protocol Layer                     │
│  - 9 cross-cutting concerns             │
│  - Schema definitions                   │
│  - Interface specifications             │
└─────────────────────────────────────────┘
```

### **1.2 Architecture Positioning**

**What MPLP Is**:
- ✅ Intelligent Agent Construction Framework Protocol
- ✅ L1-L3 protocol stack provides standardized infrastructure
- ✅ "Building blocks" supporting Agent composition and collaboration

**What MPLP Is Not**:
- ❌ Not intelligent Agents with AI brains
- ❌ Does not implement AI decision algorithms
- ❌ Does not include machine learning models

---

## 🔧 **L1-L3 Protocol Stack**

### **2.1 L1: Protocol Layer**

**9 Cross-Cutting Concerns**:

1. **Schema Definition** - JSON Schema standards
2. **Type System** - TypeScript type definitions
3. **Error Handling** - Unified error mechanism
4. **Logging** - Structured logging
5. **Performance Monitoring** - Performance metrics collection
6. **Security Audit** - Security event recording
7. **Configuration Management** - Config loading and validation
8. **Event System** - Event publish-subscribe
9. **Data Validation** - Schema validation

**Design Principles**:
- Vendor neutral
- Standardized interfaces
- Extensibility

### **2.2 L2: Coordination Layer**

**10 Core Modules**:

```
┌──────────────┬──────────────┬──────────────┐
│   Context    │     Plan     │     Role     │
│  Context Mgmt│  Planning    │  Role Perms  │
├──────────────┼──────────────┼──────────────┤
│   Confirm    │    Trace     │  Extension   │
│  Approval    │  Execution   │  Extension   │
│              │  Tracking    │  Management  │
├──────────────┼──────────────┼──────────────┤
│   Dialog     │    Collab    │   Network    │
│  Dialog Mgmt │  Collab      │  Network     │
│              │  Decision    │  Comm.       │
├──────────────┴──────────────┴──────────────┤
│         Core (Core Coordination)           │
│          CoreOrchestrator                  │
└────────────────────────────────────────────┘
```

**Module Responsibilities**:

1. **Context** - Context lifecycle management
   - Create, update, query contexts
   - Multi-session state management
   - Context sync and search

2. **Plan** - AI-driven planning algorithms
   - Task decomposition and prioritization
   - Resource allocation
   - Execution plan generation

3. **Role** - Enterprise RBAC security center
   - Role definition and permission management
   - Access control
   - Security audit

4. **Confirm** - Enterprise approval workflow
   - Multi-level approval processes
   - Approval policy management
   - Approval history tracking

5. **Trace** - Execution monitoring system
   - Execution tracking
   - Performance monitoring
   - Problem diagnosis

6. **Extension** - Extension management system
   - Extension loading and unloading
   - Lifecycle management
   - Dependency resolution

7. **Dialog** - Intelligent dialog management
   - Dialog flow control
   - Context preservation
   - Multi-turn conversations

8. **Collab** - Multi-Agent collaboration
   - Collaborative decision-making
   - Task distribution
   - Result aggregation

9. **Network** - Distributed communication
   - Node discovery
   - Message routing
   - Network resilience

10. **Core** - Central coordination
    - Module coordination
    - Resource management
    - Error handling

### **2.3 L3: Execution Layer**

**CoreOrchestrator Responsibilities**:

```typescript
class CoreOrchestrator {
  // Module coordination
  async coordinateModules(scenario: string): Promise<void>
  
  // Resource management
  async allocateResources(request: ResourceRequest): Promise<void>
  
  // Workflow orchestration
  async orchestrateWorkflow(workflow: Workflow): Promise<void>
  
  // Error recovery
  async handleError(error: Error): Promise<void>
}
```

**Coordination Scenarios**:
1. Module initialization coordination
2. Cross-module transaction management
3. Resource allocation and scheduling
4. Error propagation and recovery
5. Performance monitoring and optimization

---

## 📦 **10 Core Modules**

### **3.1 Module Architecture Pattern**

All modules follow unified DDD architecture:

```
module/
├── domain/              # Domain layer
│   ├── entities/        # Entities
│   ├── value-objects/   # Value objects
│   └── repositories/    # Repository interfaces
├── application/         # Application layer
│   ├── services/        # Application services
│   └── use-cases/       # Use cases
├── infrastructure/      # Infrastructure layer
│   ├── persistence/     # Persistence
│   └── adapters/        # Adapters
└── interfaces/          # Interface layer
    ├── api/             # API interfaces
    └── events/          # Event interfaces
```

### **3.2 Inter-Module Collaboration**

**Reserved Interface Pattern**:
```typescript
// Module method signature
async method(
  param1: Type1,
  param2: Type2,
  _coreOrchestrator?: CoreOrchestrator  // Reserved parameter
): Promise<Result>
```

**Event-Driven Collaboration**:
```typescript
// Publish event
eventBus.emit('context.created', { contextId });

// Subscribe to event
eventBus.on('context.created', async (data) => {
  // Other modules respond
});
```

---

## 🎯 **SDK Architecture**

### **4.1 SDK Core Components**

```
SDK
├── MPLP Class (Main entry)
│   ├── initialize()
│   ├── getModule()
│   └── getVersion()
├── Factory Functions
│   ├── createMPLP()
│   ├── quickStart()
│   ├── createProductionMPLP()
│   └── createTestMPLP()
└── Configuration Interface
    └── MPLPConfig
```

### **4.2 Module Loading Mechanism**

```typescript
// On-demand loading
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// Dynamic loading
const contextModule = mplp.getModule('context');
```

---

## 🔑 **Design Principles**

### **5.1 SOLID Principles**

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### **5.2 Vendor Neutrality Principle**

```typescript
// ✅ Correct: Generic interface
interface IStorage {
  save(data: any): Promise<void>;
  load(id: string): Promise<any>;
}

// ❌ Wrong: Binding to specific vendor
class MongoDBStorage { }
```

### **5.3 Protocol-Agent Separation**

```
Protocol (MPLP L1-L3)
  ↓ Provides infrastructure
Agent (L4)
  ↓ Implements business logic
Application
```

---

## 📊 **Performance Architecture**

### **6.1 Performance Targets**

| Operation | Target | Actual |
|-----------|--------|--------|
| Module Init | <100ms | ~50ms |
| API Call | <10ms | ~5ms |
| Protocol Parse | <10ms | ~3ms |
| Permission Check | <10ms | ~2ms |

### **6.2 Optimization Strategies**

- Module lazy loading
- Result caching
- Connection pooling
- Batch operations

---

## 🔗 **Related Resources**

- [Best Practices](best-practices.md)
- [Testing Guide](testing.md)
- [Deployment Guide](deployment.md)
- [API Reference](../api-reference/sdk-core.md)

---

**Version**: v1.1.0-beta  
**Last Updated**: 2025-10-22  
**Maintainer**: MPLP Team

