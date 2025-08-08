# Context Module - Examples and Best Practices

**Version**: v1.0.0  
**Last Updated**: 2025-08-08 15:52:52  
**Status**: Protocol-Grade Standard ✅ 🏆  
**Module**: Context (Context Management and State Protocol)

---

## 📋 **Overview**

This document provides practical examples and best practices for using the Context Module in real-world scenarios, including enterprise-grade features and protocol-level implementations.

## 🚀 **Quick Start Examples**

### **1. Basic Context Creation**

#### **Simple Shared Context**
```typescript
import { ContextService, SessionService, StateService } from 'mplp/context';

// Initialize services
const contextService = new ContextService();
const sessionService = new SessionService();
const stateService = new StateService();

// Create a basic shared context
const context = await contextService.createContext({
  name: "Team Collaboration Context",
  description: "Shared workspace for team collaboration",
  type: ContextType.SHARED,
  scope: ContextScope.PROJECT,
  maxSessions: 20,
  persistenceMode: PersistenceMode.DURABLE
});

console.log(`Context created: ${context.contextId}`);
```

#### **Adding Sessions to Context**
```typescript
// Add multiple sessions to the context
const sessions = [
  {
    agentId: "agent-001",
    sessionType: SessionType.INTERACTIVE,
    role: SessionRole.ADMIN,
    permissions: [Permission.READ, Permission.WRITE, Permission.MANAGE]
  },
  {
    agentId: "agent-002", 
    sessionType: SessionType.INTERACTIVE,
    role: SessionRole.CONTRIBUTOR,
    permissions: [Permission.READ, Permission.WRITE]
  },
  {
    agentId: "agent-003",
    sessionType: SessionType.BACKGROUND,
    role: SessionRole.OBSERVER,
    permissions: [Permission.READ]
  }
];

for (const sessionData of sessions) {
  const session = await sessionService.createSession({
    contextId: context.contextId,
    ...sessionData
  });
  console.log(`Session created: ${session.sessionId} for ${sessionData.agentId}`);
}
```

### **2. Shared State Management**

#### **Creating and Managing Shared State**
```typescript
// Create shared state for project tracking
const projectState = await stateService.createSharedState({
  contextId: context.contextId,
  key: "project_status",
  value: {
    phase: "planning",
    progress: 25,
    milestones: [
      { name: "Requirements", completed: true },
      { name: "Design", completed: false },
      { name: "Development", completed: false },
      { name: "Testing", completed: false }
    ],
    lastUpdate: new Date(),
    updatedBy: "agent-001"
  },
  accessLevel: AccessLevel.READ_WRITE,
  syncMode: SyncMode.REAL_TIME
});

// Update shared state
await stateService.updateSharedState(projectState.stateId, {
  value: {
    ...projectState.value,
    progress: 40,
    milestones: [
      { name: "Requirements", completed: true },
      { name: "Design", completed: true },
      { name: "Development", completed: false },
      { name: "Testing", completed: false }
    ],
    lastUpdate: new Date(),
    updatedBy: "agent-002"
  }
});
```

#### **Real-time State Synchronization**
```typescript
// Subscribe to state changes
const subscription = await stateService.subscribeToStateChanges(context.contextId, {
  keys: ["project_status", "team_assignments"],
  callback: (change) => {
    console.log(`State changed: ${change.key}`);
    console.log(`New value:`, change.newValue);
    console.log(`Changed by: ${change.updatedBy}`);
    
    // Notify other systems
    notificationService.broadcast({
      type: "state_change",
      contextId: context.contextId,
      change: change
    });
  }
});
```

## 🏢 **Enterprise Examples**

### **1. Multi-Team Enterprise Context**

#### **Large-Scale Distributed Context**
```typescript
// Create enterprise-scale context with advanced features
const enterpriseContext = await contextService.createContext({
  name: "Enterprise Digital Transformation",
  description: "Company-wide digital transformation initiative",
  type: ContextType.ENTERPRISE,
  scope: ContextScope.ORGANIZATION,
  maxSessions: 500,
  persistenceMode: PersistenceMode.DISTRIBUTED,
  replicationStrategy: ReplicationStrategy.MULTI_MASTER,
  securityLevel: SecurityLevel.ENTERPRISE
});

// Configure enterprise features
await contextService.configureEnterpriseFeatures(enterpriseContext.contextId, {
  performanceMonitoring: {
    enabled: true,
    metricsInterval: "30s",
    alertThresholds: {
      responseTime: 200,
      memoryUsage: 80,
      sessionCount: 400
    }
  },
  dependencyResolution: {
    enabled: true,
    autoResolve: true,
    conflictStrategy: ConflictStrategy.PRIORITY_BASED
  },
  synchronization: {
    enabled: true,
    nodes: ["us-east", "us-west", "eu-central", "asia-pacific"],
    consistencyLevel: ConsistencyLevel.STRONG
  }
});
```

#### **Department-Specific Contexts**
```typescript
// Create department-specific sub-contexts
const departments = [
  { name: "Engineering", teams: ["Backend", "Frontend", "DevOps", "QA"] },
  { name: "Product", teams: ["Product Management", "UX Design", "Analytics"] },
  { name: "Marketing", teams: ["Digital Marketing", "Content", "Brand"] },
  { name: "Sales", teams: ["Enterprise Sales", "SMB Sales", "Customer Success"] }
];

for (const dept of departments) {
  const deptContext = await contextService.createSubContext({
    parentContextId: enterpriseContext.contextId,
    name: `${dept.name} Department Context`,
    type: ContextType.DEPARTMENTAL,
    scope: ContextScope.DEPARTMENT,
    maxSessions: 100,
    inheritPermissions: true
  });

  // Create team-specific contexts within department
  for (const team of dept.teams) {
    const teamContext = await contextService.createSubContext({
      parentContextId: deptContext.contextId,
      name: `${team} Team Context`,
      type: ContextType.TEAM,
      scope: ContextScope.TEAM,
      maxSessions: 20
    });
    
    console.log(`Created team context: ${teamContext.contextId} for ${team}`);
  }
}
```

### **2. Real-time Collaboration Context**

#### **Live Document Collaboration**
```typescript
// Create context for real-time document collaboration
const collaborationContext = await contextService.createContext({
  name: "Product Requirements Document",
  description: "Real-time collaborative editing of PRD",
  type: ContextType.COLLABORATIVE,
  scope: ContextScope.DOCUMENT,
  maxSessions: 50,
  features: {
    operationalTransform: true,
    conflictResolution: true,
    versionControl: true,
    realTimeSync: true
  }
});

// Configure operational transformation for real-time editing
await stateService.configureOperationalTransform(collaborationContext.contextId, {
  documentId: "prd-v2.0",
  transformationEngine: "ot.js",
  conflictResolution: ConflictResolution.OPERATIONAL_TRANSFORM,
  snapshotInterval: "5m"
});

// Handle real-time document operations
const documentOperations = [
  { type: "insert", position: 100, content: "New requirement: " },
  { type: "delete", position: 200, length: 10 },
  { type: "format", position: 150, length: 20, style: "bold" }
];

for (const operation of documentOperations) {
  await stateService.applyOperation(collaborationContext.contextId, {
    documentId: "prd-v2.0",
    operation: operation,
    authorId: "user-001",
    timestamp: new Date()
  });
}
```

## 🏆 **Enterprise Feature Examples**

### **1. Context Performance Monitoring**

#### **Real-time Performance Dashboard**
```typescript
import { ContextPerformanceMonitorService } from 'mplp/context/enterprise';

const performanceMonitor = new ContextPerformanceMonitorService();

// Enable comprehensive performance monitoring
await performanceMonitor.enableMonitoring(context.contextId, {
  metrics: [
    "response_time",
    "throughput", 
    "memory_usage",
    "session_count",
    "state_changes_per_second",
    "sync_latency"
  ],
  alertThresholds: {
    response_time: { warning: 200, critical: 500 },
    memory_usage: { warning: 70, critical: 85 },
    session_count: { warning: 80, critical: 95 },
    sync_latency: { warning: 100, critical: 300 }
  },
  reportingInterval: "1m",
  dashboardEnabled: true
});

// Get real-time performance metrics
const metrics = await performanceMonitor.getMetrics(context.contextId, {
  timeRange: { start: new Date(Date.now() - 3600000), end: new Date() },
  granularity: "1m",
  includeAggregations: true
});

console.log(`Average response time: ${metrics.responseTime.avg}ms`);
console.log(`Peak memory usage: ${metrics.memoryUsage.max}%`);
console.log(`Current session count: ${metrics.sessionCount.current}`);

// Configure intelligent alerting
await performanceMonitor.configureAlerts(context.contextId, {
  channels: ["slack", "email", "webhook"],
  escalationPolicy: {
    warning: { delay: "5m", channels: ["slack"] },
    critical: { delay: "1m", channels: ["slack", "email"] }
  },
  customRules: [
    {
      name: "sustained_high_latency",
      condition: "avg(response_time, 5m) > 300",
      severity: "warning",
      message: "Sustained high latency detected in context"
    }
  ]
});
```

### **2. Dependency Resolution Service**

#### **Complex Multi-Agent Dependencies**
```typescript
import { DependencyResolutionService } from 'mplp/context/enterprise';

const dependencyResolver = new DependencyResolutionService();

// Define complex agent and resource dependencies
const dependencies = [
  {
    id: "data-processing-agent",
    type: "agent",
    dependencies: [
      { id: "database-connection", type: "resource" },
      { id: "ml-model-service", type: "service" }
    ],
    requirements: {
      memory: "4GB",
      cpu: "2 cores",
      network: "high-bandwidth"
    }
  },
  {
    id: "ml-model-service", 
    type: "service",
    dependencies: [
      { id: "gpu-cluster", type: "resource" },
      { id: "model-storage", type: "storage" }
    ],
    requirements: {
      gpu: "V100 or better",
      storage: "100GB SSD"
    }
  },
  {
    id: "reporting-agent",
    type: "agent", 
    dependencies: [
      { id: "data-processing-agent", type: "agent" },
      { id: "visualization-service", type: "service" }
    ]
  }
];

// Register dependencies
for (const dep of dependencies) {
  await dependencyResolver.registerDependency(context.contextId, dep);
}

// Resolve dependency graph
const resolution = await dependencyResolver.resolveDependencies(context.contextId, {
  optimizationGoals: ["minimize_latency", "maximize_reliability"],
  constraints: {
    maxCost: 1000,
    maxLatency: 500,
    availabilityRequirement: 0.99
  }
});

console.log(`Dependency resolution order:`, resolution.executionOrder);
console.log(`Estimated cost: $${resolution.estimatedCost}`);
console.log(`Estimated latency: ${resolution.estimatedLatency}ms`);

// Handle dependency conflicts
if (resolution.conflicts.length > 0) {
  for (const conflict of resolution.conflicts) {
    console.log(`Conflict detected: ${conflict.description}`);
    
    // Apply automatic resolution
    const conflictResolution = await dependencyResolver.resolveConflict(
      context.contextId, 
      conflict.conflictId,
      { strategy: ConflictResolution.PRIORITY_BASED }
    );
    
    console.log(`Conflict resolved: ${conflictResolution.resolution}`);
  }
}
```

### **3. Context Synchronization Service**

#### **Multi-Region Distributed Synchronization**
```typescript
import { ContextSynchronizationService } from 'mplp/context/enterprise';

const syncService = new ContextSynchronizationService();

// Configure multi-region synchronization
await syncService.configureDistributedSync(context.contextId, {
  regions: [
    { id: "us-east-1", priority: 1, role: "primary" },
    { id: "us-west-2", priority: 2, role: "secondary" },
    { id: "eu-central-1", priority: 3, role: "secondary" },
    { id: "ap-southeast-1", priority: 4, role: "secondary" }
  ],
  syncMode: SyncMode.EVENTUAL_CONSISTENCY,
  conflictResolution: ConflictResolution.VECTOR_CLOCK,
  heartbeatInterval: "30s",
  maxSyncDelay: "5s"
});

// Configure event-driven synchronization
await syncService.configureEventSync(context.contextId, {
  eventTypes: [
    "state_changed",
    "session_joined", 
    "session_left",
    "permission_updated"
  ],
  batchSize: 100,
  batchTimeout: "1s",
  retryPolicy: {
    maxRetries: 3,
    backoffStrategy: "exponential",
    maxBackoffDelay: "30s"
  }
});

// Monitor synchronization health
const syncHealth = await syncService.getSyncHealth(context.contextId);
console.log(`Sync status:`, syncHealth.status);
console.log(`Lag by region:`, syncHealth.lagByRegion);
console.log(`Conflict rate:`, syncHealth.conflictRate);

// Handle sync conflicts
syncService.onConflict(context.contextId, async (conflict) => {
  console.log(`Sync conflict detected:`, conflict);
  
  // Apply custom conflict resolution logic
  const resolution = await syncService.resolveConflict(conflict.conflictId, {
    strategy: ConflictResolution.CUSTOM,
    resolver: async (localState, remoteState, metadata) => {
      // Custom business logic for conflict resolution
      if (metadata.priority === "high") {
        return remoteState; // Remote wins for high priority
      } else {
        return localState; // Local wins for normal priority
      }
    }
  });
  
  console.log(`Conflict resolved:`, resolution);
});
```

## 🔄 **Integration Examples**

### **1. Plan Module Integration**

#### **Context-Aware Planning**
```typescript
import { PlanService } from 'mplp/plan';
import { ContextService } from 'mplp/context';

// Create context for plan execution
const planContext = await contextService.createContext({
  name: "Project Alpha Execution Context",
  description: "Shared context for Project Alpha execution",
  type: ContextType.PROJECT,
  scope: ContextScope.PROJECT
});

// Create plan with context association
const plan = await planService.createPlan({
  name: "Project Alpha",
  description: "Strategic initiative for Q4",
  contextId: planContext.contextId, // Associate with context
  priority: PlanPriority.HIGH
});

// Share plan state in context
await stateService.createSharedState({
  contextId: planContext.contextId,
  key: "plan_execution",
  value: {
    planId: plan.planId,
    status: plan.status,
    progress: 0,
    currentPhase: "initiation",
    nextMilestone: "requirements_complete"
  }
});

// Update context when plan progresses
planService.onPlanUpdate(plan.planId, async (update) => {
  await stateService.updateSharedState(planContext.contextId, "plan_execution", {
    ...update,
    lastUpdate: new Date()
  });
});
```

### **2. External System Integration**

#### **CRM Integration**
```typescript
import { CRMIntegration } from 'mplp/context/integrations';

const crmIntegration = new CRMIntegration({
  provider: 'salesforce',
  apiEndpoint: 'https://company.salesforce.com/api',
  credentials: {
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    refreshToken: process.env.SALESFORCE_REFRESH_TOKEN
  }
});

// Sync customer context with CRM
await crmIntegration.syncCustomerContext(context.contextId, {
  customerId: "customer-001",
  syncDirection: "bidirectional",
  syncFrequency: "real-time",
  fieldMapping: {
    "customer.name": "account.name",
    "customer.status": "account.status",
    "customer.lastActivity": "account.last_activity_date"
  }
});
```

## 🎯 **Best Practices**

### **1. Context Design Patterns**
- **Hierarchical Contexts**: Use parent-child relationships for organizational structure
- **Scoped Contexts**: Define appropriate scope for context lifecycle
- **Access Control**: Implement role-based access control from the start
- **State Management**: Design shared state schema carefully for future extensibility

### **2. Performance Optimization**
- **Lazy Loading**: Load context data only when needed
- **Caching Strategy**: Implement intelligent caching for frequently accessed contexts
- **Batch Operations**: Use batch operations for bulk context updates
- **Resource Monitoring**: Monitor resource usage and optimize accordingly

### **3. Security Best Practices**
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Data Encryption**: Encrypt sensitive context data at rest and in transit
- **Audit Logging**: Maintain comprehensive audit logs for compliance
- **Regular Security Reviews**: Conduct regular security assessments

---

**Documentation Version**: v1.0.0  
**Last Updated**: 2025-08-08 15:52:52  
**Module Status**: Protocol-Grade Standard ✅ 🏆  
**Quality Standard**: MPLP Protocol Grade
