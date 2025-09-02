# Plan Module API Reference

## 🚀 **Overview**

The Plan Module provides a comprehensive REST API for intelligent task planning, coordination, and execution management. All AI operations are handled by external AI services through pluggable adapters. All endpoints follow RESTful conventions and return JSON responses.

**Base URL**: `/api/v1/plans`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (when security is enabled)

## 📋 **API Endpoints**

### **Plan Management**

#### **Create Plan**
```http
POST /api/v1/plans
```

**Request Body**:
```typescript
{
  contextId: string;           // UUID of the associated context
  name: string;               // Plan name (required)
  description?: string;       // Optional plan description
  priority?: 'critical' | 'high' | 'medium' | 'low';
  tasks?: Array<{
    name: string;
    description?: string;
    type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
    priority?: 'critical' | 'high' | 'medium' | 'low';
  }>;
  milestones?: Array<{
    name: string;
    targetDate: Date;
    criteria: string[];
  }>;
  resources?: Array<{
    resourceId: string;
    type: 'human' | 'material' | 'financial' | 'technical';
    allocatedAmount: number;
  }>;
  risks?: Array<{
    name: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: number;
  }>;
}
```

**Response**:
```typescript
{
  success: boolean;
  planId?: string;
  message: string;
  metadata?: {
    name: string;
    status: string;
    priority: string;
    taskCount: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Example**:
```bash
curl -X POST /api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "contextId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Software Development Plan",
    "description": "Complete development lifecycle plan",
    "priority": "high",
    "tasks": [
      {
        "name": "Requirements Analysis",
        "type": "milestone",
        "priority": "critical"
      }
    ]
  }'
```

#### **Get Plan by ID**
```http
GET /api/v1/plans/{planId}
```

**Parameters**:
- `planId` (path): UUID of the plan

**Response**:
```typescript
{
  planId: string;
  contextId: string;
  name: string;
  description?: string;
  status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  protocolVersion: string;
  timestamp: string;
  
  // Core Components
  tasks: Array<{
    taskId: string;
    name: string;
    type: 'atomic' | 'composite' | 'milestone' | 'review';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedDuration?: number;
    actualDuration?: number;
    dependencies?: Array<{
      taskId: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    }>;
  }>;
  
  milestones: Array<{
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    targetDate: string;
    actualDate?: string;
    criteria: string[];
  }>;
  
  resources: Array<{
    resourceId: string;
    resourceName: string;
    type: 'human' | 'material' | 'financial' | 'technical';
    allocatedAmount: number;
    totalCapacity: number;
  }>;
  
  risks: Array<{
    id: string;
    name: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'occurred';
    probability: number;
    impact: number;
  }>;
  
  // Metadata
  auditTrail: {
    enabled: boolean;
    retentionDays: number;
  };
  monitoringIntegration: object;
  performanceMetrics: object;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
```

#### **Update Plan**
```http
PUT /api/v1/plans/{planId}
```

**Parameters**:
- `planId` (path): UUID of the plan

**Request Body**:
```typescript
{
  planId: string;
  name?: string;
  description?: string;
  status?: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority?: 'critical' | 'high' | 'medium' | 'low';
}
```

**Response**: Same as Create Plan response

#### **Delete Plan**
```http
DELETE /api/v1/plans/{planId}
```

**Parameters**:
- `planId` (path): UUID of the plan

**Response**:
```typescript
{
  success: boolean;
  planId: string;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}
```

### **Plan Operations**

#### **Execute Plan**
```http
POST /api/v1/plans/{planId}/execute
```

**Request Body**:
```typescript
{
  executionMode?: 'sequential' | 'parallel' | 'hybrid';
  dryRun?: boolean;
  skipValidation?: boolean;
  notifyOnCompletion?: boolean;
  customConfig?: object;
}
```

**Response**:
```typescript
{
  success: boolean;
  planId: string;
  message: string;
  metadata?: {
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    totalTasks: number;
    completedTasks: number;
    failedTasks?: number;
    executionTime?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### **Optimize Plan**
```http
POST /api/v1/plans/{planId}/optimize
```

**Request Body**:
```typescript
{
  targets?: Array<'time' | 'cost' | 'quality' | 'risk'>;
  constraints?: {
    maxDuration?: number;
    maxCost?: number;
    minQuality?: number;
    maxRisk?: number;
  };
  algorithm?: 'genetic' | 'simulated_annealing' | 'particle_swarm' | 'greedy';
  iterations?: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  planId: string;
  message: string;
  metadata?: {
    originalScore: number;
    optimizedScore: number;
    improvements: string[];
    optimizationTime: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### **Validate Plan**
```http
POST /api/v1/plans/{planId}/validate
```

**Request Body**:
```typescript
{
  validationLevel?: 'basic' | 'standard' | 'comprehensive';
  includeWarnings?: boolean;
  customRules?: Array<{
    ruleId: string;
    name: string;
    description: string;
    type: 'structural' | 'business' | 'performance' | 'security';
    severity: 'info' | 'warning' | 'error' | 'critical';
    condition: string;
    message: string;
    enabled: boolean;
  }>;
  skipRuleIds?: string[];
}
```

**Response**:
```typescript
{
  success: boolean;
  planId: string;
  message: string;
  metadata?: {
    isValid: boolean;
    violationCount: number;
    warningCount?: number;
    recommendationCount: number;
    validationTime: number;
  };
  violations?: Array<{
    ruleId: string;
    severity: string;
    message: string;
    field?: string;
  }>;
  recommendations?: string[];
  error?: {
    code: string;
    message: string;
  };
}
```

### **Plan Queries**

#### **Query Plans**
```http
GET /api/v1/plans
```

**Query Parameters**:
```typescript
{
  status?: string | string[];           // Filter by status
  priority?: 'critical' | 'high' | 'medium' | 'low';
  contextId?: string;                   // Filter by context
  namePattern?: string;                 // Name pattern matching
  assignedTo?: string;                  // Filter by assignee
  createdAfter?: string;               // ISO date string
  createdBefore?: string;              // ISO date string
  page?: number;                       // Page number (default: 1)
  limit?: number;                      // Items per page (default: 10)
  sortBy?: 'name' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  success: boolean;
  data: PlanResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

## 🔧 **Task Management**

### **Add Task to Plan**
```http
POST /api/v1/plans/{planId}/tasks
```

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration?: number;
  durationUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  assignedTo?: string[];
  dependencies?: Array<{
    taskId: string;
    type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    lag?: number;
    lagUnit?: 'minutes' | 'hours' | 'days';
  }>;
  tags?: string[];
  metadata?: object;
}
```

### **Update Task**
```http
PUT /api/v1/plans/{planId}/tasks/{taskId}
```

**Request Body**:
```typescript
{
  taskId: string;
  name?: string;
  description?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  completionPercentage?: number;
  actualDuration?: number;
  startDate?: string;
  endDate?: string;
}
```

## 🎯 **Milestone Management**

### **Add Milestone**
```http
POST /api/v1/plans/{planId}/milestones
```

**Request Body**:
```typescript
{
  name: string;
  description?: string;
  targetDate: Date;
  criteria: string[];
  dependencies?: string[];
  deliverables?: string[];
}
```

### **Update Milestone**
```http
PUT /api/v1/plans/{planId}/milestones/{milestoneId}
```

**Request Body**:
```typescript
{
  id: string;
  name?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  targetDate?: Date;
  actualDate?: Date;
}
```

## 📊 **Error Codes**

| Code | Description |
|------|-------------|
| `PLAN_CREATION_FAILED` | Plan creation failed due to validation or system error |
| `PLAN_NOT_FOUND` | Plan with specified ID does not exist |
| `PLAN_UPDATE_FAILED` | Plan update failed due to validation or system error |
| `PLAN_DELETION_FAILED` | Plan deletion failed due to constraints or system error |
| `PLAN_EXECUTION_FAILED` | Plan execution failed due to runtime error |
| `PLAN_OPTIMIZATION_FAILED` | Plan optimization failed due to algorithm or data error |
| `PLAN_VALIDATION_FAILED` | Plan validation failed due to rule violations |
| `PLAN_QUERY_FAILED` | Plan query failed due to invalid parameters or system error |
| `INVALID_PLAN_ID` | Invalid plan ID format |
| `INVALID_CONTEXT_ID` | Invalid context ID format |
| `UNAUTHORIZED_ACCESS` | Insufficient permissions for the requested operation |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |

## 🔒 **Authentication & Authorization**

### **Bearer Token Authentication**
```http
Authorization: Bearer <your-jwt-token>
```

### **Required Permissions**
- `plan:read` - View plans
- `plan:write` - Create and update plans
- `plan:delete` - Delete plans
- `plan:execute` - Execute plans
- `plan:optimize` - Optimize plans
- `plan:validate` - Validate plans

## 📈 **Rate Limits**

| Endpoint | Rate Limit |
|----------|------------|
| GET endpoints | 1000 requests/hour |
| POST/PUT endpoints | 500 requests/hour |
| DELETE endpoints | 100 requests/hour |
| Execute operations | 50 requests/hour |

## 🔧 **SDK Examples**

### **JavaScript/TypeScript**
```typescript
import { PlanClient } from '@mplp/plan-client';

const client = new PlanClient({
  baseUrl: 'https://api.mplp.dev',
  apiKey: 'your-api-key'
});

// Create a plan
const plan = await client.createPlan({
  contextId: 'ctx-123',
  name: 'My Plan',
  priority: 'high'
});

// Execute the plan
const result = await client.executePlan(plan.planId);
```

### **Python**
```python
from mplp_client import PlanClient

client = PlanClient(
    base_url='https://api.mplp.dev',
    api_key='your-api-key'
)

# Create a plan
plan = client.create_plan({
    'contextId': 'ctx-123',
    'name': 'My Plan',
    'priority': 'high'
})

# Execute the plan
result = client.execute_plan(plan['planId'])
```

## 🌐 **WebSocket API (Real-time)**

### **Connection**
```javascript
const ws = new WebSocket('wss://api.mplp.dev/ws/plans');
```

### **Subscribe to Plan Updates**
```json
{
  "action": "subscribe",
  "planId": "550e8400-e29b-41d4-a716-446655440000",
  "events": ["status_change", "task_update", "milestone_reached"]
}
```

### **Real-time Events**
```json
{
  "event": "plan_status_changed",
  "planId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "oldStatus": "active",
    "newStatus": "completed",
    "timestamp": "2025-08-26T10:30:00Z"
  }
}
```

## 📝 **Request/Response Examples**

### **Complete Plan Creation Example**
```bash
curl -X POST /api/v1/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "contextId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "E-commerce Platform Development",
    "description": "Complete development of e-commerce platform with microservices architecture",
    "priority": "high",
    "tasks": [
      {
        "name": "Requirements Gathering",
        "description": "Collect and analyze business requirements",
        "type": "milestone",
        "priority": "critical"
      },
      {
        "name": "System Architecture Design",
        "description": "Design microservices architecture",
        "type": "composite",
        "priority": "high"
      },
      {
        "name": "Database Schema Design",
        "description": "Design database schema for all services",
        "type": "atomic",
        "priority": "high"
      },
      {
        "name": "API Development",
        "description": "Develop REST APIs for all services",
        "type": "composite",
        "priority": "medium"
      }
    ],
    "milestones": [
      {
        "name": "Architecture Review",
        "targetDate": "2025-09-15T00:00:00Z",
        "criteria": [
          "Architecture document approved",
          "Technical review completed",
          "Stakeholder sign-off received"
        ]
      },
      {
        "name": "MVP Release",
        "targetDate": "2025-12-01T00:00:00Z",
        "criteria": [
          "Core features implemented",
          "Testing completed",
          "Performance benchmarks met"
        ]
      }
    ],
    "resources": [
      {
        "resourceId": "dev-team-001",
        "type": "human",
        "allocatedAmount": 5
      },
      {
        "resourceId": "aws-infrastructure",
        "type": "technical",
        "allocatedAmount": 1000
      }
    ],
    "risks": [
      {
        "name": "Third-party API Dependencies",
        "level": "medium",
        "probability": 0.3,
        "impact": 0.7
      },
      {
        "name": "Team Availability",
        "level": "low",
        "probability": 0.2,
        "impact": 0.5
      }
    ]
  }'
```

### **Response**
```json
{
  "success": true,
  "planId": "plan-550e8400-e29b-41d4-a716-446655440001",
  "message": "Plan created successfully",
  "metadata": {
    "name": "E-commerce Platform Development",
    "status": "draft",
    "priority": "high",
    "taskCount": 4,
    "milestoneCount": 2,
    "resourceCount": 2,
    "riskCount": 2
  }
}
```

## 🔍 **Advanced Query Examples**

### **Complex Plan Query**
```bash
curl -G /api/v1/plans \
  -d "status=active,paused" \
  -d "priority=high" \
  -d "createdAfter=2025-08-01T00:00:00Z" \
  -d "sortBy=priority" \
  -d "sortOrder=desc" \
  -d "page=1" \
  -d "limit=20"
```

### **Plan Optimization with Custom Parameters**
```bash
curl -X POST /api/v1/plans/plan-123/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "targets": ["time", "cost", "quality"],
    "constraints": {
      "maxDuration": 90,
      "maxCost": 100000,
      "minQuality": 0.9
    },
    "algorithm": "genetic",
    "iterations": 1000
  }'
```

## 🚨 **Error Response Format**

### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "PLAN_VALIDATION_FAILED",
    "message": "Plan validation failed due to missing required fields",
    "details": {
      "field": "contextId",
      "reason": "Context ID is required and must be a valid UUID",
      "provided": "",
      "expected": "UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)"
    },
    "timestamp": "2025-08-26T10:30:00Z",
    "requestId": "req-123456789"
  }
}
```

### **Validation Error Response**
```json
{
  "success": false,
  "error": {
    "code": "PLAN_VALIDATION_FAILED",
    "message": "Multiple validation errors found",
    "details": {
      "errors": [
        {
          "field": "name",
          "message": "Plan name is required and cannot be empty"
        },
        {
          "field": "tasks[0].type",
          "message": "Task type must be one of: atomic, composite, milestone, checkpoint"
        },
        {
          "field": "priority",
          "message": "Priority must be one of: critical, high, medium, low"
        }
      ]
    }
  }
}
```

## 📊 **Performance Metrics**

### **Response Time Benchmarks**
| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Create Plan | 45ms | 85ms | 120ms |
| Get Plan | 15ms | 35ms | 50ms |
| Update Plan | 35ms | 65ms | 90ms |
| Delete Plan | 25ms | 45ms | 70ms |
| Execute Plan | 150ms | 300ms | 500ms |
| Optimize Plan | 800ms | 1500ms | 2500ms |
| Validate Plan | 100ms | 200ms | 350ms |
| Query Plans | 50ms | 100ms | 150ms |

### **Throughput Limits**
- **Concurrent Requests**: 1,000 per second
- **Plan Operations**: 500 per second
- **Query Operations**: 2,000 per second
- **WebSocket Connections**: 10,000 concurrent

---

**API Version**: v1.0.0
**Last Updated**: 2025-08-30
**OpenAPI Specification**: [Available here](./openapi.yaml)
**Postman Collection**: [Available here](./postman-collection.json)
