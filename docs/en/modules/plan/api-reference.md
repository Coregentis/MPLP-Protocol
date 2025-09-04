# Plan Module API Reference

**Multi-Agent Protocol Lifecycle Platform - Plan Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Plan-blue.svg)](./README.md)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](./openapi.yaml)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/plan/api-reference.md)

---

## 🎯 API Overview

The Plan Module provides comprehensive REST, GraphQL, and WebSocket APIs for intelligent planning, task orchestration, and execution monitoring. All APIs follow MPLP protocol standards and provide advanced AI-driven planning capabilities with real-time execution tracking.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/plans`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/plans`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

### **Content Types**
- **Request**: `application/json`
- **Response**: `application/json`
- **WebSocket**: `application/json` messages

---

## 🔧 REST API Reference

### **Plan Management Endpoints**

#### **Create Plan**
```http
POST /api/v1/plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "multi-agent-coordination-plan",
  "type": "collaborative",
  "context_id": "ctx-001",
  "objectives": [
    {
      "description": "Coordinate multi-agent task execution",
      "priority": "high",
      "success_criteria": [
        "all_tasks_completed",
        "execution_time_under_threshold"
      ],
      "constraints": {
        "deadline": "2025-09-03T18:00:00Z",
        "max_resources": 10,
        "quality_threshold": 0.95
      }
    }
  ],
  "tasks": [
    {
      "name": "data-analysis",
      "description": "Analyze input data and generate insights",
      "type": "analysis",
      "estimated_duration": 1800000,
      "required_capabilities": ["data_analysis", "machine_learning"],
      "dependencies": [],
      "constraints": {
        "max_agents": 2,
        "memory_requirement": "4GB"
      }
    }
  ],
  "planning_strategy": {
    "algorithm": "hierarchical_task_network",
    "optimization_goals": ["minimize_time", "maximize_quality"],
    "constraint_handling": "soft_constraints"
  }
}
```

**Response (201 Created):**
```json
{
  "plan_id": "plan-001",
  "name": "multi-agent-coordination-plan",
  "type": "collaborative",
  "status": "created",
  "context_id": "ctx-001",
  "version": "1.0.0",
  "objectives": [
    {
      "objective_id": "obj-001",
      "description": "Coordinate multi-agent task execution",
      "priority": "high",
      "success_criteria": [
        "all_tasks_completed",
        "execution_time_under_threshold"
      ],
      "status": "pending"
    }
  ],
  "tasks": [
    {
      "task_id": "task-001",
      "name": "data-analysis",
      "description": "Analyze input data and generate insights",
      "type": "analysis",
      "status": "pending",
      "estimated_duration": 1800000,
      "required_capabilities": ["data_analysis", "machine_learning"],
      "dependencies": [],
      "assigned_agents": []
    }
  ],
  "planning_metadata": {
    "algorithm_used": "hierarchical_task_network",
    "optimization_score": 0.92,
    "feasibility_score": 0.98,
    "estimated_completion_time": "2025-09-03T17:45:00Z"
  },
  "created_at": "2025-09-03T10:00:00.000Z",
  "updated_at": "2025-09-03T10:00:00.000Z"
}
```

#### **Get Plan**
```http
GET /api/v1/plans/{plan_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "plan_id": "plan-001",
  "name": "multi-agent-coordination-plan",
  "type": "collaborative",
  "status": "ready",
  "context_id": "ctx-001",
  "version": "1.0.0",
  "objectives": [
    {
      "objective_id": "obj-001",
      "description": "Coordinate multi-agent task execution",
      "priority": "high",
      "success_criteria": [
        "all_tasks_completed",
        "execution_time_under_threshold"
      ],
      "status": "active",
      "progress": 0.0
    }
  ],
  "tasks": [
    {
      "task_id": "task-001",
      "name": "data-analysis",
      "status": "ready",
      "assigned_agents": ["agent-001"],
      "estimated_start": "2025-09-03T10:15:00Z",
      "estimated_completion": "2025-09-03T10:45:00Z",
      "progress": 0.0
    }
  ],
  "execution_summary": {
    "total_tasks": 1,
    "completed_tasks": 0,
    "failed_tasks": 0,
    "overall_progress": 0.0,
    "estimated_completion": "2025-09-03T17:45:00Z"
  },
  "performance_metrics": {
    "planning_time": 2.5,
    "optimization_iterations": 15,
    "constraint_satisfaction_score": 0.98
  },
  "created_at": "2025-09-03T10:00:00.000Z",
  "updated_at": "2025-09-03T10:05:00.000Z"
}
```

#### **Execute Plan**
```http
POST /api/v1/plans/{plan_id}/execute
Content-Type: application/json
Authorization: Bearer <token>

{
  "execution_mode": "collaborative",
  "execution_options": {
    "start_immediately": true,
    "parallel_execution": true,
    "max_concurrent_tasks": 5,
    "timeout_handling": "graceful"
  },
  "resource_allocation": {
    "agent_pool": ["agent-001", "agent-002", "agent-003"],
    "resource_limits": {
      "max_memory": "16GB",
      "max_cpu_cores": 8,
      "max_execution_time": 7200000
    }
  },
  "monitoring_configuration": {
    "progress_reporting": {
      "enabled": true,
      "interval": 30000,
      "include_metrics": true
    },
    "performance_tracking": {
      "enabled": true,
      "metrics": ["execution_time", "resource_usage", "quality_score"]
    }
  }
}
```

**Response (202 Accepted):**
```json
{
  "execution_id": "exec-001",
  "plan_id": "plan-001",
  "status": "starting",
  "execution_mode": "collaborative",
  "started_at": "2025-09-03T10:15:00.000Z",
  "estimated_completion": "2025-09-03T17:45:00.000Z",
  "resource_allocation": {
    "allocated_agents": ["agent-001", "agent-002"],
    "allocated_resources": {
      "memory": "8GB",
      "cpu_cores": 4
    }
  },
  "monitoring": {
    "progress_reporting_enabled": true,
    "performance_tracking_enabled": true,
    "monitoring_url": "wss://api.mplp.dev/ws/plans/exec-001/monitor"
  }
}
```

#### **Get Execution Status**
```http
GET /api/v1/plans/{plan_id}/executions/{execution_id}/status
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "execution_id": "exec-001",
  "plan_id": "plan-001",
  "status": "running",
  "started_at": "2025-09-03T10:15:00.000Z",
  "current_time": "2025-09-03T10:25:00.000Z",
  "estimated_completion": "2025-09-03T17:30:00.000Z",
  "overall_progress": 0.15,
  "task_progress": [
    {
      "task_id": "task-001",
      "status": "running",
      "assigned_agent": "agent-001",
      "progress": 0.15,
      "started_at": "2025-09-03T10:16:00.000Z",
      "estimated_completion": "2025-09-03T10:46:00.000Z"
    }
  ],
  "resource_usage": {
    "memory_used": "3.2GB",
    "cpu_utilization": 0.65,
    "active_agents": 1
  },
  "performance_metrics": {
    "tasks_completed": 0,
    "tasks_failed": 0,
    "average_task_duration": null,
    "throughput": 0.0,
    "quality_score": null
  },
  "health": {
    "overall_health": "healthy",
    "issues": [],
    "recommendations": []
  }
}
```

### **Task Management Endpoints**

#### **Get Task Details**
```http
GET /api/v1/plans/{plan_id}/tasks/{task_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "task_id": "task-001",
  "plan_id": "plan-001",
  "name": "data-analysis",
  "description": "Analyze input data and generate insights",
  "type": "analysis",
  "status": "running",
  "priority": "high",
  "estimated_duration": 1800000,
  "actual_duration": null,
  "required_capabilities": ["data_analysis", "machine_learning"],
  "dependencies": [],
  "dependents": ["task-002"],
  "assigned_agents": [
    {
      "agent_id": "agent-001",
      "agent_type": "analysis_agent",
      "assigned_at": "2025-09-03T10:16:00.000Z",
      "status": "active"
    }
  ],
  "resource_allocation": {
    "memory_allocated": "4GB",
    "cpu_cores_allocated": 2,
    "storage_allocated": "1GB"
  },
  "execution_details": {
    "started_at": "2025-09-03T10:16:00.000Z",
    "progress": 0.15,
    "estimated_completion": "2025-09-03T10:46:00.000Z",
    "current_phase": "data_preprocessing",
    "next_milestone": "feature_extraction"
  },
  "performance_metrics": {
    "cpu_usage": 0.65,
    "memory_usage": 0.8,
    "io_operations": 1250,
    "network_usage": "15MB"
  },
  "quality_metrics": {
    "accuracy": null,
    "completeness": 0.15,
    "consistency": null
  }
}
```

#### **Update Task**
```http
PUT /api/v1/plans/{plan_id}/tasks/{task_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "priority": "critical",
  "estimated_duration": 2100000,
  "additional_constraints": {
    "quality_threshold": 0.98
  },
  "metadata": {
    "updated_reason": "increased_priority_due_to_deadline"
  }
}
```

#### **Reassign Task**
```http
POST /api/v1/plans/{plan_id}/tasks/{task_id}/reassign
Content-Type: application/json
Authorization: Bearer <token>

{
  "new_agent_id": "agent-002",
  "reassignment_reason": "agent_overload",
  "transfer_state": true,
  "notify_agents": true
}
```

### **Plan Analytics Endpoints**

#### **Get Plan Analytics**
```http
GET /api/v1/plans/{plan_id}/analytics
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "plan_id": "plan-001",
  "analytics_period": {
    "start": "2025-09-03T10:15:00.000Z",
    "end": "2025-09-03T10:25:00.000Z"
  },
  "execution_analytics": {
    "total_execution_time": 600000,
    "average_task_duration": 300000,
    "task_completion_rate": 0.0,
    "task_failure_rate": 0.0,
    "resource_utilization": {
      "cpu_average": 0.65,
      "memory_average": 0.8,
      "agent_utilization": 0.5
    }
  },
  "performance_trends": {
    "throughput_trend": "stable",
    "quality_trend": "improving",
    "resource_efficiency_trend": "stable"
  },
  "bottleneck_analysis": {
    "identified_bottlenecks": [
      {
        "type": "resource_constraint",
        "description": "Memory allocation limiting parallel execution",
        "impact": "medium",
        "recommendation": "Increase memory allocation or optimize memory usage"
      }
    ]
  },
  "optimization_suggestions": [
    {
      "type": "resource_optimization",
      "description": "Increase parallel task execution",
      "expected_improvement": "20% faster completion",
      "implementation_effort": "low"
    }
  ]
}
```

#### **Get Performance Metrics**
```http
GET /api/v1/plans/{plan_id}/metrics?start_time=2025-09-03T10:00:00Z&end_time=2025-09-03T11:00:00Z
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "plan_id": "plan-001",
  "metrics_period": {
    "start": "2025-09-03T10:00:00Z",
    "end": "2025-09-03T11:00:00Z"
  },
  "time_series_metrics": [
    {
      "timestamp": "2025-09-03T10:15:00Z",
      "overall_progress": 0.0,
      "active_tasks": 1,
      "completed_tasks": 0,
      "failed_tasks": 0,
      "cpu_utilization": 0.65,
      "memory_utilization": 0.8,
      "throughput": 0.0
    },
    {
      "timestamp": "2025-09-03T10:20:00Z",
      "overall_progress": 0.08,
      "active_tasks": 1,
      "completed_tasks": 0,
      "failed_tasks": 0,
      "cpu_utilization": 0.72,
      "memory_utilization": 0.85,
      "throughput": 0.08
    }
  ],
  "aggregated_metrics": {
    "average_cpu_utilization": 0.685,
    "peak_memory_usage": 0.85,
    "total_tasks_processed": 1,
    "average_task_duration": null,
    "overall_efficiency": 0.78
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type Plan {
  planId: ID!
  name: String!
  type: PlanType!
  status: PlanStatus!
  contextId: ID
  version: String!
  objectives: [Objective!]!
  tasks: [Task!]!
  executionSummary: ExecutionSummary
  performanceMetrics: PlanPerformanceMetrics
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  taskId: ID!
  planId: ID!
  name: String!
  description: String
  type: TaskType!
  status: TaskStatus!
  priority: Priority!
  estimatedDuration: Int
  actualDuration: Int
  requiredCapabilities: [String!]!
  dependencies: [ID!]!
  dependents: [ID!]!
  assignedAgents: [AssignedAgent!]!
  resourceAllocation: ResourceAllocation
  executionDetails: TaskExecutionDetails
  performanceMetrics: TaskPerformanceMetrics
  qualityMetrics: TaskQualityMetrics
}

type PlanExecution {
  executionId: ID!
  planId: ID!
  status: ExecutionStatus!
  executionMode: ExecutionMode!
  startedAt: DateTime
  completedAt: DateTime
  estimatedCompletion: DateTime
  overallProgress: Float!
  taskProgress: [TaskProgress!]!
  resourceUsage: ResourceUsage!
  performanceMetrics: ExecutionPerformanceMetrics!
  health: ExecutionHealth!
}

enum PlanType {
  SEQUENTIAL
  PARALLEL
  HIERARCHICAL
  COLLABORATIVE
  ADAPTIVE
}

enum PlanStatus {
  CREATED
  PLANNING
  OPTIMIZED
  READY
  EXECUTING
  PAUSED
  COMPLETED
  CANCELLED
  ERROR
}

enum TaskStatus {
  PENDING
  READY
  ASSIGNED
  RUNNING
  PAUSED
  COMPLETED
  FAILED
  CANCELLED
}

enum ExecutionStatus {
  STARTING
  RUNNING
  PAUSED
  COMPLETING
  COMPLETED
  FAILED
  CANCELLED
}
```

### **Query Operations**

#### **Get Plan with Full Details**
```graphql
query GetPlanDetails($planId: ID!) {
  plan(planId: $planId) {
    planId
    name
    type
    status
    contextId
    objectives {
      objectiveId
      description
      priority
      status
      progress
      successCriteria
    }
    tasks {
      taskId
      name
      type
      status
      priority
      estimatedDuration
      assignedAgents {
        agentId
        agentType
        assignedAt
        status
      }
      executionDetails {
        startedAt
        progress
        estimatedCompletion
        currentPhase
      }
      performanceMetrics {
        cpuUsage
        memoryUsage
        ioOperations
      }
    }
    executionSummary {
      totalTasks
      completedTasks
      failedTasks
      overallProgress
      estimatedCompletion
    }
    performanceMetrics {
      planningTime
      optimizationIterations
      constraintSatisfactionScore
    }
  }
}
```

#### **List Plans with Filtering**
```graphql
query ListPlans($filter: PlanFilter, $pagination: PaginationInput) {
  plans(filter: $filter, pagination: $pagination) {
    plans {
      planId
      name
      type
      status
      contextId
      overallProgress
      createdAt
      updatedAt
    }
    pagination {
      total
      hasMore
      nextCursor
    }
  }
}
```

### **Mutation Operations**

#### **Create Plan**
```graphql
mutation CreatePlan($input: CreatePlanInput!) {
  createPlan(input: $input) {
    plan {
      planId
      name
      type
      status
      objectives {
        objectiveId
        description
        priority
      }
      tasks {
        taskId
        name
        type
        status
        estimatedDuration
      }
      planningMetadata {
        algorithmUsed
        optimizationScore
        feasibilityScore
      }
    }
  }
}
```

#### **Execute Plan**
```graphql
mutation ExecutePlan($input: ExecutePlanInput!) {
  executePlan(input: $input) {
    execution {
      executionId
      planId
      status
      startedAt
      estimatedCompletion
      resourceAllocation {
        allocatedAgents
        allocatedResources {
          memory
          cpuCores
        }
      }
    }
  }
}
```

### **Subscription Operations**

#### **Plan Execution Updates**
```graphql
subscription PlanExecutionUpdates($executionId: ID!) {
  planExecutionUpdates(executionId: $executionId) {
    type
    executionId
    timestamp
    data
  }
}
```

#### **Task Progress Updates**
```graphql
subscription TaskProgressUpdates($planId: ID!) {
  taskProgressUpdates(planId: $planId) {
    taskId
    planId
    status
    progress
    timestamp
    performanceMetrics {
      cpuUsage
      memoryUsage
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Connection**

```javascript
const ws = new WebSocket('wss://api.mplp.dev/ws/plans');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt-token-here'
}));
```

### **Real-time Plan Monitoring**

```javascript
// Subscribe to plan execution updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'plan.exec-001.updates'
}));

// Receive execution updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'execution_update') {
    console.log('Execution update:', message.data);
  }
};
```

### **Task Progress Streaming**

```javascript
// Subscribe to task progress
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'plan.plan-001.task_progress'
}));

// Receive task progress updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'task_progress') {
    console.log('Task progress:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Plan Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: The Plan Module API is production-ready and comprehensive in Alpha release. Additional AI planning endpoints and optimization features will be added in Beta release while maintaining backward compatibility.
