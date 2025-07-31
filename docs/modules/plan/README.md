# Plan Module

## 📋 Overview

The Plan Module manages task planning, workflow orchestration, and resource allocation within the MPLP ecosystem. It provides comprehensive planning capabilities with DDD architecture for complex multi-agent project management.

## 🏗️ Architecture

### DDD Layer Structure

```
src/modules/plan/
├── api/                    # API Layer
│   ├── controllers/        # REST controllers
│   │   └── plan.controller.ts
│   └── dto/               # Data transfer objects
├── application/           # Application Layer
│   ├── services/          # Application services
│   │   └── plan-management.service.ts
│   ├── commands/          # Command handlers
│   │   └── create-plan.command.ts
│   └── queries/           # Query handlers
│       └── get-plan-by-id.query.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain entities
│   │   ├── plan.entity.ts
│   │   └── task.entity.ts
│   ├── repositories/      # Repository interfaces
│   │   └── plan-repository.interface.ts
│   └── services/          # Domain services
│       └── plan-validation.service.ts
├── infrastructure/        # Infrastructure Layer
│   └── repositories/      # Repository implementations
│       └── plan.repository.ts
├── module.ts             # Module integration
├── index.ts              # Public exports
└── types.ts              # Type definitions
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializePlanModule } from 'mplp';

// Initialize the module
const planModule = await initializePlanModule();

// Create a new plan
const result = await planModule.planManagementService.createPlan({
  context_id: 'ctx-123',
  name: 'Project Development Plan',
  description: 'Comprehensive development plan',
  tasks: [
    {
      name: 'Setup Environment',
      description: 'Configure development environment',
      priority: 'high',
      estimated_duration: 3600000 // 1 hour in ms
    },
    {
      name: 'Implement Features',
      description: 'Core feature implementation',
      priority: 'medium',
      estimated_duration: 7200000 // 2 hours in ms
    }
  ]
});

if (result.success) {
  console.log('Plan created:', result.data.plan_id);
}
```

## 📖 API Reference

### Plan Management Service

#### createPlan()

Creates a new project plan with tasks.

```typescript
async createPlan(request: CreatePlanRequest): Promise<OperationResult<Plan>>
```

**Parameters:**
```typescript
interface CreatePlanRequest {
  context_id: UUID;
  name: string;
  description?: string;
  tasks: CreateTaskRequest[];
  metadata?: Record<string, any>;
}

interface CreateTaskRequest {
  name: string;
  description?: string;
  priority: TaskPriority;
  estimated_duration?: number;
  dependencies?: UUID[];
  assigned_to?: string;
}
```

#### getPlanById()

Retrieves a plan by its ID.

```typescript
async getPlanById(planId: UUID): Promise<OperationResult<Plan>>
```

#### updatePlan()

Updates an existing plan.

```typescript
async updatePlan(planId: UUID, updates: Partial<UpdatePlanRequest>): Promise<OperationResult<Plan>>
```

#### addTask()

Adds a new task to an existing plan.

```typescript
async addTask(planId: UUID, task: CreateTaskRequest): Promise<OperationResult<Task>>
```

#### updateTaskStatus()

Updates the status of a specific task.

```typescript
async updateTaskStatus(taskId: UUID, status: TaskStatus): Promise<OperationResult<Task>>
```

## 🎯 Domain Model

### Plan Entity

The core domain entity representing a project plan.

```typescript
class Plan {
  // Properties
  plan_id: UUID;
  context_id: UUID;
  name: string;
  description?: string;
  status: PlanStatus;
  tasks: Task[];
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;

  // Business Methods
  addTask(task: Task): void;
  removeTask(taskId: UUID): void;
  updateStatus(status: PlanStatus): void;
  calculateTotalDuration(): number;
  getTasksByStatus(status: TaskStatus): Task[];
  validateTaskDependencies(): boolean;
}
```

### Task Entity

Individual task within a plan.

```typescript
class Task {
  // Properties
  task_id: UUID;
  plan_id: UUID;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_duration?: number;
  actual_duration?: number;
  dependencies: UUID[];
  assigned_to?: string;
  created_at: Timestamp;
  updated_at: Timestamp;

  // Business Methods
  start(): void;
  complete(): void;
  pause(): void;
  addDependency(taskId: UUID): void;
  removeDependency(taskId: UUID): void;
  canStart(): boolean;
}
```

### Status Types

```typescript
type PlanStatus = 
  | 'draft'      // Initial state
  | 'active'     // Currently executing
  | 'paused'     // Temporarily paused
  | 'completed'  // Successfully completed
  | 'cancelled'; // Cancelled/aborted

type TaskStatus = 
  | 'pending'    // Not started
  | 'in_progress'// Currently executing
  | 'completed'  // Successfully completed
  | 'blocked'    // Blocked by dependencies
  | 'cancelled'; // Cancelled

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
```

## 🔧 Configuration

### Module Options

```typescript
interface PlanModuleOptions {
  dataSource?: DataSource;           // Database connection
  enableTaskScheduling?: boolean;    // Enable automatic task scheduling
  enableDependencyValidation?: boolean; // Validate task dependencies
  enableProgressTracking?: boolean;  // Track task progress
  maxTasksPerPlan?: number;         // Limit tasks per plan
}
```

## 📊 Events

The Plan Module emits domain events for integration:

```typescript
interface PlanCreatedEvent {
  event_type: 'plan_created';
  plan_id: UUID;
  context_id: UUID;
  plan_name: string;
  task_count: number;
  created_by: string;
  timestamp: Timestamp;
}

interface TaskStatusChangedEvent {
  event_type: 'task_status_changed';
  task_id: UUID;
  plan_id: UUID;
  old_status: TaskStatus;
  new_status: TaskStatus;
  changed_by: string;
  timestamp: Timestamp;
}

interface PlanCompletedEvent {
  event_type: 'plan_completed';
  plan_id: UUID;
  context_id: UUID;
  total_duration: number;
  completed_tasks: number;
  timestamp: Timestamp;
}
```

## 🧪 Testing

### Unit Tests

```typescript
import { Plan } from '../domain/entities/plan.entity';
import { Task } from '../domain/entities/task.entity';

describe('Plan Entity', () => {
  test('should create valid plan', () => {
    const plan = new Plan(
      'plan-123',
      'ctx-123',
      'Test Plan',
      'draft',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    expect(plan.plan_id).toBe('plan-123');
    expect(plan.name).toBe('Test Plan');
    expect(plan.status).toBe('draft');
  });

  test('should add task to plan', () => {
    const plan = new Plan(/* ... */);
    const task = new Task(/* ... */);
    
    plan.addTask(task);
    expect(plan.tasks).toContain(task);
  });
});
```

## 🔗 Integration

### With Other Modules

The Plan Module integrates with:

- **Context Module**: Plans are created within contexts
- **Confirm Module**: Plans require approval before execution
- **Trace Module**: Plan execution is monitored and traced
- **Role Module**: Task assignments respect role permissions
- **Extension Module**: Custom planning algorithms can be added

### Workflow Integration

```typescript
// Create context and plan together
const contextResult = await contextService.createContext(contextRequest);
if (contextResult.success) {
  const planResult = await planService.createPlan({
    context_id: contextResult.data.context_id,
    name: 'Implementation Plan',
    tasks: [/* task definitions */]
  });
}
```

---

The Plan Module provides sophisticated planning capabilities with task management, dependency tracking, and progress monitoring for complex multi-agent projects.
