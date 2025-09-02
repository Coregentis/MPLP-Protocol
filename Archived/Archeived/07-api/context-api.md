# Context API Reference

## 📋 Overview

The Context API provides comprehensive context management capabilities for MPLP v1.0. It enables creation, management, and lifecycle control of project contexts with full CRUD operations and advanced querying.

## 🌐 Base URL

```
https://api.mplp.com/v1/contexts
```

## 🔐 Authentication

All API endpoints require authentication via JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

## 📖 API Endpoints

### Create Context

Creates a new project context.

```http
POST /api/v1/contexts
```

**Request Body:**
```json
{
  "name": "Project Alpha",
  "description": "Main development project for Q1",
  "metadata": {
    "project_type": "web_application",
    "priority": "high",
    "estimated_duration": 2592000000,
    "budget": 50000,
    "team_size": 5
  },
  "tags": ["development", "web", "q1"],
  "parent_context_id": "ctx-parent-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
    "name": "Project Alpha",
    "description": "Main development project for Q1",
    "status": "draft",
    "metadata": {
      "project_type": "web_application",
      "priority": "high",
      "estimated_duration": 2592000000,
      "budget": 50000,
      "team_size": 5
    },
    "tags": ["development", "web", "q1"],
    "parent_context_id": "ctx-parent-123",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `201 Created` - Context created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Context with same name exists

### Get Context by ID

Retrieves a specific context by its ID.

```http
GET /api/v1/contexts/{context_id}
```

**Path Parameters:**
- `context_id` (string, required) - Unique context identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
    "name": "Project Alpha",
    "description": "Main development project for Q1",
    "status": "active",
    "metadata": {
      "project_type": "web_application",
      "priority": "high"
    },
    "tags": ["development", "web", "q1"],
    "parent_context_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Context retrieved successfully
- `404 Not Found` - Context not found
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions

### Update Context

Updates an existing context.

```http
PUT /api/v1/contexts/{context_id}
```

**Request Body:**
```json
{
  "name": "Project Alpha - Updated",
  "description": "Updated description",
  "metadata": {
    "priority": "critical",
    "budget": 75000
  },
  "tags": ["development", "web", "q1", "urgent"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context_id": "ctx-123e4567-e89b-12d3-a456-426614174000",
    "name": "Project Alpha - Updated",
    "description": "Updated description",
    "status": "active",
    "metadata": {
      "project_type": "web_application",
      "priority": "critical",
      "budget": 75000,
      "team_size": 5
    },
    "tags": ["development", "web", "q1", "urgent"],
    "updated_at": "2024-01-15T14:20:00Z"
  }
}
```

### Delete Context

Soft deletes a context (marks as archived).

```http
DELETE /api/v1/contexts/{context_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Context archived successfully"
}
```

**Status Codes:**
- `200 OK` - Context archived successfully
- `404 Not Found` - Context not found
- `409 Conflict` - Context has active dependencies

### Query Contexts

Retrieves contexts with filtering, sorting, and pagination.

```http
GET /api/v1/contexts
```

**Query Parameters:**
- `name` (string) - Filter by name (partial match)
- `status` (string) - Filter by status (`draft`, `active`, `inactive`, `completed`, `archived`, `cancelled`)
- `tags` (string) - Filter by tags (comma-separated)
- `parent_context_id` (string) - Filter by parent context
- `created_after` (string) - Filter by creation date (ISO 8601)
- `created_before` (string) - Filter by creation date (ISO 8601)
- `sort` (string) - Sort field (`name`, `created_at`, `updated_at`, `status`)
- `order` (string) - Sort order (`asc`, `desc`)
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)

**Example Request:**
```http
GET /api/v1/contexts?status=active&tags=development,web&sort=created_at&order=desc&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contexts": [
      {
        "context_id": "ctx-123",
        "name": "Project Alpha",
        "status": "active",
        "tags": ["development", "web"],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Update Context Status

Updates the status of a context.

```http
PATCH /api/v1/contexts/{context_id}/status
```

**Request Body:**
```json
{
  "status": "active",
  "reason": "Project approved and ready to start"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context_id": "ctx-123",
    "old_status": "draft",
    "new_status": "active",
    "updated_at": "2024-01-15T15:30:00Z"
  }
}
```

### Add Context Tags

Adds tags to a context.

```http
POST /api/v1/contexts/{context_id}/tags
```

**Request Body:**
```json
{
  "tags": ["urgent", "priority"]
}
```

### Remove Context Tags

Removes tags from a context.

```http
DELETE /api/v1/contexts/{context_id}/tags
```

**Request Body:**
```json
{
  "tags": ["old-tag"]
}
```

### Get Context Statistics

Retrieves statistics for contexts.

```http
GET /api/v1/contexts/statistics
```

**Query Parameters:**
- `time_range` (string) - Time range (`7d`, `30d`, `90d`, `1y`)
- `group_by` (string) - Group by field (`status`, `tags`, `created_date`)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_contexts": 150,
    "by_status": {
      "draft": 25,
      "active": 45,
      "completed": 60,
      "archived": 20
    },
    "created_this_month": 12,
    "completion_rate": 0.75,
    "average_duration_days": 45
  }
}
```

## 📊 Data Models

### Context Object

```typescript
interface Context {
  context_id: string;
  name: string;
  description?: string;
  status: ContextStatus;
  metadata: Record<string, any>;
  tags: string[];
  parent_context_id?: string;
  created_at: string;
  updated_at: string;
}

type ContextStatus = 
  | 'draft'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'archived'
  | 'cancelled';
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 🔍 Filtering and Querying

### Advanced Filtering

```http
GET /api/v1/contexts?filter={"metadata.priority":"high","status":["active","draft"]}
```

### Full-Text Search

```http
GET /api/v1/contexts?search=project alpha development
```

### Date Range Filtering

```http
GET /api/v1/contexts?created_after=2024-01-01T00:00:00Z&created_before=2024-01-31T23:59:59Z
```

## 📈 Rate Limiting

API endpoints are rate limited:
- **Standard endpoints**: 100 requests per minute
- **Query endpoints**: 50 requests per minute
- **Bulk operations**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 🚨 Error Handling

### Common Error Codes

- `CONTEXT_NOT_FOUND` - Context with specified ID not found
- `CONTEXT_NAME_EXISTS` - Context with same name already exists
- `INVALID_STATUS_TRANSITION` - Invalid status change
- `VALIDATION_ERROR` - Request validation failed
- `PERMISSION_DENIED` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "name",
      "issue": "Name is required and must be between 1 and 255 characters"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📝 Examples

### Create and Activate Context

```javascript
// Create context
const createResponse = await fetch('/api/v1/contexts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: 'New Project',
    description: 'Project description',
    metadata: { priority: 'high' }
  })
});

const context = await createResponse.json();

// Activate context
await fetch(`/api/v1/contexts/${context.data.context_id}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    status: 'active'
  })
});
```

---

The Context API provides comprehensive context management capabilities with full CRUD operations, advanced querying, and robust error handling for effective project context management.
