# Plan API Reference

## 📋 Overview

The Plan API provides comprehensive planning and task management capabilities for MPLP v1.0. It enables creation, management, and execution of project plans with tasks, dependencies, and resource allocation.

## 🌐 Base URL

```
https://api.mplp.com/v1/plans
```

## 📖 API Endpoints

### Create Plan

Creates a new project plan with tasks.

```http
POST /api/v1/plans
```

**Request Body:**
```json
{
  "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
  "name": "Development Plan Q1",
  "description": "Comprehensive development plan for Q1 deliverables",
  "tasks": [
    {
      "name": "Setup Development Environment",
      "description": "Configure development tools and environment",
      "priority": "high",
      "estimated_duration": 3600000,
      "assigned_to": "dev-team-lead",
      "dependencies": []
    },
    {
      "name": "Implement Core Features",
      "description": "Develop main application features",
      "priority": "medium",
      "estimated_duration": 14400000,
      "assigned_to": "dev-team",
      "dependencies": ["task-1"]
    }
  ],
  "metadata": {
    "methodology": "agile",
    "sprint_duration": 14,
    "total_budget": 100000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan_id": "plan-123e4567-e89b-12d3-a456-426614174000",
    "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
    "name": "Development Plan Q1",
    "description": "Comprehensive development plan for Q1 deliverables",
    "status": "draft",
    "tasks": [
      {
        "task_id": "task-123",
        "name": "Setup Development Environment",
        "status": "pending",
        "priority": "high",
        "estimated_duration": 3600000,
        "assigned_to": "dev-team-lead",
        "dependencies": [],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "metadata": {
      "methodology": "agile",
      "sprint_duration": 14,
      "total_budget": 100000
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Plan by ID

Retrieves a specific plan with all tasks.

```http
GET /api/v1/plans/{plan_id}
```

**Query Parameters:**
- `include_tasks` (boolean) - Include task details (default: true)
- `include_dependencies` (boolean) - Include task dependencies (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "plan_id": "plan-123",
    "context_id": "ctx-123",
    "name": "Development Plan Q1",
    "status": "active",
    "tasks": [
      {
        "task_id": "task-123",
        "name": "Setup Development Environment",
        "status": "completed",
        "priority": "high",
        "estimated_duration": 3600000,
        "actual_duration": 3200000,
        "assigned_to": "dev-team-lead",
        "dependencies": [],
        "started_at": "2024-01-15T11:00:00Z",
        "completed_at": "2024-01-15T11:53:20Z"
      }
    ],
    "progress": {
      "total_tasks": 5,
      "completed_tasks": 2,
      "in_progress_tasks": 1,
      "pending_tasks": 2,
      "completion_percentage": 40
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
  }
}
```

### Update Plan

Updates an existing plan.

```http
PUT /api/v1/plans/{plan_id}
```

**Request Body:**
```json
{
  "name": "Updated Development Plan Q1",
  "description": "Updated plan description",
  "metadata": {
    "total_budget": 120000,
    "deadline": "2024-03-31T23:59:59Z"
  }
}
```

### Delete Plan

Soft deletes a plan and all associated tasks.

```http
DELETE /api/v1/plans/{plan_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Plan and associated tasks deleted successfully"
}
```

### Query Plans

Retrieves plans with filtering and pagination.

```http
GET /api/v1/plans
```

**Query Parameters:**
- `context_id` (string) - Filter by context ID
- `status` (string) - Filter by status
- `assigned_to` (string) - Filter by assignee
- `priority` (string) - Filter by priority
- `created_after` (string) - Filter by creation date
- `sort` (string) - Sort field
- `order` (string) - Sort order
- `page` (number) - Page number
- `limit` (number) - Items per page

### Add Task to Plan

Adds a new task to an existing plan.

```http
POST /api/v1/plans/{plan_id}/tasks
```

**Request Body:**
```json
{
  "name": "Code Review",
  "description": "Review implemented features",
  "priority": "medium",
  "estimated_duration": 7200000,
  "assigned_to": "senior-dev",
  "dependencies": ["task-456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-789",
    "plan_id": "plan-123",
    "name": "Code Review",
    "status": "pending",
    "priority": "medium",
    "estimated_duration": 7200000,
    "assigned_to": "senior-dev",
    "dependencies": ["task-456"],
    "created_at": "2024-01-15T15:30:00Z"
  }
}
```

### Update Task Status

Updates the status of a specific task.

```http
PATCH /api/v1/plans/{plan_id}/tasks/{task_id}/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Started working on task",
  "actual_start_time": "2024-01-15T16:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-123",
    "old_status": "pending",
    "new_status": "in_progress",
    "started_at": "2024-01-15T16:00:00Z",
    "updated_at": "2024-01-15T16:00:00Z"
  }
}
```

### Get Task Dependencies

Retrieves task dependency graph.

```http
GET /api/v1/plans/{plan_id}/tasks/{task_id}/dependencies
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_id": "task-123",
    "dependencies": [
      {
        "task_id": "task-456",
        "name": "Setup Environment",
        "status": "completed",
        "dependency_type": "finish_to_start"
      }
    ],
    "dependents": [
      {
        "task_id": "task-789",
        "name": "Code Review",
        "status": "pending",
        "dependency_type": "finish_to_start"
      }
    ],
    "can_start": true,
    "blocking_dependencies": []
  }
}
```

### Execute Plan

Starts execution of a plan.

```http
POST /api/v1/plans/{plan_id}/execute
```

**Request Body:**
```json
{
  "execution_mode": "sequential",
  "auto_start_tasks": true,
  "notification_settings": {
    "notify_on_completion": true,
    "notify_on_errors": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "execution_id": "exec-123",
    "plan_id": "plan-123",
    "status": "running",
    "started_at": "2024-01-15T17:00:00Z",
    "estimated_completion": "2024-01-20T17:00:00Z"
  }
}
```

### Get Plan Progress

Retrieves detailed progress information for a plan.

```http
GET /api/v1/plans/{plan_id}/progress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan_id": "plan-123",
    "overall_progress": {
      "completion_percentage": 65,
      "total_tasks": 10,
      "completed_tasks": 6,
      "in_progress_tasks": 2,
      "pending_tasks": 2,
      "blocked_tasks": 0
    },
    "time_progress": {
      "estimated_total_duration": 36000000,
      "actual_duration_so_far": 18000000,
      "remaining_estimated_duration": 12000000,
      "efficiency_ratio": 1.2
    },
    "task_breakdown": [
      {
        "task_id": "task-123",
        "name": "Setup Environment",
        "status": "completed",
        "progress_percentage": 100,
        "estimated_duration": 3600000,
        "actual_duration": 3200000
      }
    ],
    "milestones": [
      {
        "name": "Phase 1 Complete",
        "target_date": "2024-01-20T00:00:00Z",
        "completion_percentage": 80,
        "status": "on_track"
      }
    ]
  }
}
```

### Get Plan Analytics

Retrieves analytics and insights for plan performance.

```http
GET /api/v1/plans/{plan_id}/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "performance_metrics": {
      "velocity": 2.5,
      "efficiency_score": 0.85,
      "quality_score": 0.92,
      "on_time_delivery_rate": 0.78
    },
    "resource_utilization": {
      "team_utilization": 0.87,
      "budget_utilization": 0.65,
      "time_utilization": 0.72
    },
    "risk_indicators": [
      {
        "type": "schedule_risk",
        "level": "medium",
        "description": "2 tasks are behind schedule",
        "impact": "May delay milestone by 2 days"
      }
    ],
    "recommendations": [
      "Consider reallocating resources to critical path tasks",
      "Review task dependencies for optimization opportunities"
    ]
  }
}
```

## 📊 Data Models

### Plan Object

```typescript
interface Plan {
  plan_id: string;
  context_id: string;
  name: string;
  description?: string;
  status: PlanStatus;
  tasks: Task[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
```

### Task Object

```typescript
interface Task {
  task_id: string;
  plan_id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_duration?: number;
  actual_duration?: number;
  dependencies: string[];
  assigned_to?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
```

## 🔍 Advanced Features

### Bulk Task Operations

```http
PATCH /api/v1/plans/{plan_id}/tasks/bulk
```

**Request Body:**
```json
{
  "operation": "update_status",
  "task_ids": ["task-123", "task-456", "task-789"],
  "data": {
    "status": "in_progress"
  }
}
```

### Plan Templates

```http
GET /api/v1/plans/templates
POST /api/v1/plans/templates
POST /api/v1/plans/from-template/{template_id}
```

### Resource Allocation

```http
GET /api/v1/plans/{plan_id}/resources
POST /api/v1/plans/{plan_id}/resources/allocate
```

---

The Plan API provides comprehensive planning and task management capabilities with advanced features for project execution, progress tracking, and performance analytics.
