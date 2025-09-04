# Plan API Reference

**Collaborative Planning and Goal Decomposition - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Plan%20Module-blue.svg)](../modules/plan/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--plan.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-170%2F170%20passing-green.svg)](../modules/plan/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/plan-api.md)

---

## 🎯 Overview

The Plan API provides comprehensive planning and task orchestration capabilities for multi-agent systems. It enables agents to create collaborative plans, decompose complex goals into manageable tasks, and coordinate execution across distributed environments. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  PlanController,
  PlanManagementService,
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto
} from 'mplp/modules/plan';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const planModule = mplp.getModule('plan');
```

## 🏗️ Core Interfaces

### **PlanResponseDto** (Response Interface)

```typescript
interface PlanResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  planId: string;                 // Unique plan identifier
  contextId: string;              // Associated context ID
  name: string;                   // Plan name
  description?: string;           // Plan description
  status: PlanStatus;             // Plan status
  priority: Priority;             // Plan priority
  
  // Core functionality fields
  tasks: Task[];                  // Task list
  milestones?: Milestone[];       // Milestone definitions
  resources?: ResourceAllocation[]; // Resource allocations
  risks?: RiskItem[];             // Risk assessments
  executionConfig?: ExecutionConfig; // Execution configuration
  optimizationConfig?: OptimizationConfig; // Optimization settings
  
  // Enterprise features
  auditTrail: AuditTrail;        // Audit trail information
  monitoringIntegration: Record<string, unknown>; // Monitoring integration
  performanceMetrics: Record<string, unknown>;   // Performance metrics
  versionHistory?: Record<string, unknown>;      // Version history
  
  // Metadata
  metadata?: Record<string, any>; // Custom metadata
  createdAt?: string;            // Creation timestamp
  updatedAt?: string;            // Last update timestamp
}
```

### **CreatePlanDto** (Create Request Interface)

```typescript
interface CreatePlanDto {
  contextId: string;              // Required: Associated context ID
  name: string;                   // Required: Plan name
  description?: string;           // Optional: Plan description
  priority?: Priority;            // Optional: Plan priority
  
  // Task and milestone definitions
  tasks?: Partial<Task>[];        // Initial task list
  milestones?: Partial<Milestone>[]; // Milestone definitions
  
  // Configuration
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
  
  // Metadata
  metadata?: Record<string, any>;
}
```

### **UpdatePlanDto** (Update Request Interface)

```typescript
interface UpdatePlanDto {
  name?: string;                  // Optional: Update name
  description?: string;           // Optional: Update description
  status?: PlanStatus;            // Optional: Update status
  priority?: Priority;            // Optional: Update priority
  
  // Partial updates
  tasks?: Partial<Task>[];
  milestones?: Partial<Milestone>[];
  executionConfig?: Partial<ExecutionConfig>;
  optimizationConfig?: Partial<OptimizationConfig>;
  
  // Metadata updates
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **PlanStatus** (Plan Status)

```typescript
enum PlanStatus {
  DRAFT = 'draft',                // Draft status
  ACTIVE = 'active',              // Active status
  EXECUTING = 'executing',        // Executing status
  COMPLETED = 'completed',        // Completed status
  FAILED = 'failed',              // Failed status
  SUSPENDED = 'suspended',        // Suspended status
  ARCHIVED = 'archived'           // Archived status
}
```

### **TaskType** (Task Type)

```typescript
enum TaskType {
  ATOMIC = 'atomic',              // Atomic task
  COMPOSITE = 'composite',        // Composite task
  MILESTONE = 'milestone',        // Milestone task
  CHECKPOINT = 'checkpoint'       // Checkpoint task
}
```

### **Priority** (Priority Level)

```typescript
enum Priority {
  LOW = 'low',                    // Low priority
  MEDIUM = 'medium',              // Medium priority
  HIGH = 'high',                  // High priority
  CRITICAL = 'critical'           // Critical priority
}
```

## 🎮 Controller API

### **PlanController**

Main REST API controller providing HTTP endpoint access.

#### **Create Plan**
```typescript
async createPlan(dto: CreatePlanDto): Promise<PlanOperationResultDto>
```

**HTTP Endpoint**: `POST /api/plans`

**Request Example**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "Multi-Agent Collaboration Plan",
  "description": "Comprehensive plan for AI agent collaboration",
  "priority": "high",
  "tasks": [
    {
      "name": "Initialize Context",
      "description": "Set up collaboration context",
      "type": "atomic",
      "priority": "critical"
    },
    {
      "name": "Assign Roles",
      "description": "Assign roles to participating agents",
      "type": "composite",
      "priority": "high"
    }
  ]
}
```

**Response Example**:
```json
{
  "success": true,
  "planId": "plan-87654321-wxyz-1234",
  "message": "Plan created successfully",
  "metadata": {
    "name": "Multi-Agent Collaboration Plan",
    "status": "draft",
    "priority": "high",
    "taskCount": 2
  }
}
```

#### **Get Plan**
```typescript
async getPlan(planId: string): Promise<PlanResponseDto | null>
```

**HTTP Endpoint**: `GET /api/plans/{planId}`

#### **Update Plan**
```typescript
async updatePlan(planId: string, dto: UpdatePlanDto): Promise<PlanOperationResultDto>
```

**HTTP Endpoint**: `PUT /api/plans/{planId}`

#### **Delete Plan**
```typescript
async deletePlan(planId: string): Promise<void>
```

**HTTP Endpoint**: `DELETE /api/plans/{planId}`

#### **Execute Plan**
```typescript
async executePlan(planId: string, dto?: PlanExecutionDto): Promise<PlanOperationResultDto>
```

**HTTP Endpoint**: `POST /api/plans/{planId}/execute`

**Request Example**:
```json
{
  "strategy": "balanced",
  "dryRun": false,
  "validateDependencies": true
}
```

#### **Optimize Plan**
```typescript
async optimizePlan(planId: string, dto?: PlanOptimizationDto): Promise<PlanOperationResultDto>
```

**HTTP Endpoint**: `POST /api/plans/{planId}/optimize`

**Request Example**:
```json
{
  "targets": ["time", "resource", "quality"],
  "constraints": {
    "maxDuration": 3600,
    "resourceLimits": {
      "cpu": 80,
      "memory": 4096
    }
  },
  "algorithm": "genetic",
  "iterations": 100
}
```

#### **Query Plans**
```typescript
async queryPlans(query: PlanQueryDto, pagination?: PaginationParams): Promise<PaginatedPlanResponseDto>
```

**HTTP Endpoint**: `GET /api/plans`

**Query Parameters**:
- `status`: Filter by status
- `priority`: Filter by priority
- `contextId`: Filter by context ID
- `createdAfter`: Filter by creation date
- `limit`: Limit results
- `offset`: Pagination offset

## 🔧 Service Layer API

### **PlanManagementService**

Core business logic service providing plan management functionality.

#### **Main Methods**

```typescript
class PlanManagementService {
  // Basic CRUD operations
  async createPlan(params: PlanCreationParams): Promise<PlanEntityData>;
  async getPlan(planId: string): Promise<PlanEntityData | null>;
  async updatePlan(params: UpdatePlanParams): Promise<PlanEntityData>;
  async deletePlan(planId: string): Promise<boolean>;
  
  // Advanced operations
  async executePlan(planId: string, options?: PlanExecutionOptions): Promise<ExecutionResult>;
  async optimizePlan(planId: string, params?: PlanOptimizationParams): Promise<OptimizationResult>;
  async validatePlan(planId: string): Promise<ValidationResult>;
  
  // Task management
  async addTask(planId: string, task: Partial<Task>): Promise<Task>;
  async updateTask(planId: string, taskId: string, updates: Partial<Task>): Promise<Task>;
  async removeTask(planId: string, taskId: string): Promise<void>;
  
  // Milestone management
  async addMilestone(planId: string, milestone: Partial<Milestone>): Promise<Milestone>;
  async updateMilestone(planId: string, milestoneId: string, updates: Partial<Milestone>): Promise<Milestone>;
  
  // Analytics and monitoring
  async getPlanMetrics(planId: string): Promise<PlanMetrics>;
  async getPlanHealth(planId: string): Promise<PlanHealth>;
}
```

## 📊 Data Structures

### **Task** (Task Definition)

```typescript
interface Task {
  taskId: string;                 // Unique task identifier
  name: string;                   // Task name
  description?: string;           // Task description
  type: TaskType;                 // Task type
  status: TaskStatus;             // Task status
  priority: Priority;             // Task priority
  dependencies?: string[];        // Task dependencies
  estimatedDuration?: number;     // Estimated duration (minutes)
  assignedTo?: string;           // Assigned agent/user
  resources?: ResourceRequirement[]; // Resource requirements
}
```

### **Milestone** (Milestone Definition)

```typescript
interface Milestone {
  milestoneId: string;           // Unique milestone identifier
  name: string;                  // Milestone name
  description?: string;          // Milestone description
  targetDate?: string;           // Target completion date
  status: MilestoneStatus;       // Milestone status
  criteria: string[];            // Completion criteria
  dependencies?: string[];       // Milestone dependencies
}
```

### **ExecutionConfig** (Execution Configuration)

```typescript
interface ExecutionConfig {
  strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
  parallelism: {
    enabled: boolean;
    maxConcurrentTasks: number;
  };
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  timeout: {
    taskTimeout: number;        // Task timeout (seconds)
    planTimeout: number;        // Overall plan timeout (seconds)
  };
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/plan/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/plan/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/plan/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/plan/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
