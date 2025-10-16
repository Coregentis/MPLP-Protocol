# Context Module API Reference

> **🌐 Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/context/api-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Context Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Context-green.svg)](./README.md)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](./openapi.yaml)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/context/api-reference.md)

---

## 🎯 API Overview

The Context Module provides comprehensive REST, GraphQL, and WebSocket APIs for managing execution contexts, participants, sessions, and metadata. All APIs follow MPLP protocol standards and provide consistent error handling, authentication, and performance characteristics.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/contexts`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/contexts`

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

### **Context Management Endpoints**

#### **Create Context**
```http
POST /api/v1/contexts
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "collaborative-planning",
  "type": "collaborative",
  "description": "Multi-agent planning session",
  "configuration": {
    "max_participants": 10,
    "timeout_ms": 3600000,
    "persistence_level": "durable",
    "isolation_level": "shared",
    "auto_cleanup": true
  },
  "metadata": {
    "tags": ["planning", "collaborative"],
    "priority": "high",
    "custom_data": {
      "project_id": "proj-001"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "context_id": "ctx-001",
  "name": "collaborative-planning",
  "type": "collaborative",
  "status": "active",
  "version": "1.0.0",
  "participant_count": 0,
  "session_count": 0,
  "created_at": "2025-09-03T10:00:00.000Z",
  "updated_at": "2025-09-03T10:00:00.000Z",
  "expires_at": "2025-09-03T11:00:00.000Z",
  "configuration": {
    "max_participants": 10,
    "timeout_ms": 3600000,
    "persistence_level": "durable",
    "isolation_level": "shared",
    "auto_cleanup": true
  },
  "access_info": {
    "context_url": "mplp://contexts/ctx-001",
    "permissions": ["read", "write", "manage_participants"]
  }
}
```

#### **Get Context**
```http
GET /api/v1/contexts/{context_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "context_id": "ctx-001",
  "name": "collaborative-planning",
  "type": "collaborative",
  "status": "active",
  "version": "1.0.0",
  "participant_count": 3,
  "session_count": 1,
  "created_at": "2025-09-03T10:00:00.000Z",
  "updated_at": "2025-09-03T10:15:00.000Z",
  "last_activity_at": "2025-09-03T10:14:30.000Z",
  "expires_at": "2025-09-03T11:00:00.000Z",
  "configuration": {
    "max_participants": 10,
    "timeout_ms": 3600000,
    "persistence_level": "durable",
    "isolation_level": "shared",
    "auto_cleanup": true
  },
  "metadata": {
    "tags": ["planning", "collaborative"],
    "priority": "high",
    "custom_data": {
      "project_id": "proj-001"
    }
  },
  "health": {
    "overall_health": "healthy",
    "performance": {
      "avg_response_time": 45,
      "throughput": 150,
      "error_rate": 0.001
    }
  }
}
```

#### **Update Context**
```http
PUT /api/v1/contexts/{context_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "updated-planning-session",
  "configuration": {
    "max_participants": 15,
    "timeout_ms": 7200000
  },
  "metadata": {
    "tags": ["planning", "collaborative", "extended"],
    "priority": "critical"
  }
}
```

#### **Delete Context**
```http
DELETE /api/v1/contexts/{context_id}
Authorization: Bearer <token>
```

**Response (204 No Content)**

#### **List Contexts**
```http
GET /api/v1/contexts?type=collaborative&status=active&limit=20&offset=0
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "contexts": [
    {
      "context_id": "ctx-001",
      "name": "collaborative-planning",
      "type": "collaborative",
      "status": "active",
      "participant_count": 3,
      "created_at": "2025-09-03T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

### **Participant Management Endpoints**

#### **Add Participant**
```http
POST /api/v1/contexts/{context_id}/participants
Content-Type: application/json
Authorization: Bearer <token>

{
  "participant_id": "part-001",
  "agent_id": "agent-001",
  "participant_type": "agent",
  "display_name": "Planning Agent Alpha",
  "capabilities": ["strategic_planning", "resource_allocation"],
  "roles": ["contributor", "analyst"],
  "configuration": {
    "max_concurrent_tasks": 5,
    "timeout_ms": 300000,
    "notification_preferences": {
      "email": true,
      "push": false,
      "in_app": true
    }
  },
  "metadata": {
    "department": "engineering",
    "expertise_level": "senior"
  }
}
```

**Response (201 Created):**
```json
{
  "participant_id": "part-001",
  "agent_id": "agent-001",
  "context_id": "ctx-001",
  "participant_type": "agent",
  "display_name": "Planning Agent Alpha",
  "status": "active",
  "roles": ["contributor", "analyst"],
  "capabilities": ["strategic_planning", "resource_allocation"],
  "permissions": ["read", "write", "comment"],
  "joined_at": "2025-09-03T10:05:00.000Z",
  "last_activity_at": "2025-09-03T10:05:00.000Z",
  "activity": {
    "total_tasks": 0,
    "completed_tasks": 0,
    "failed_tasks": 0,
    "average_response_time": 0
  }
}
```

#### **Get Participant**
```http
GET /api/v1/contexts/{context_id}/participants/{participant_id}
Authorization: Bearer <token>
```

#### **Update Participant**
```http
PUT /api/v1/contexts/{context_id}/participants/{participant_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "roles": ["contributor", "analyst", "reviewer"],
  "configuration": {
    "max_concurrent_tasks": 8,
    "timeout_ms": 600000
  }
}
```

#### **Remove Participant**
```http
DELETE /api/v1/contexts/{context_id}/participants/{participant_id}
Authorization: Bearer <token>
```

#### **List Participants**
```http
GET /api/v1/contexts/{context_id}/participants?role=contributor&status=active
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "participants": [
    {
      "participant_id": "part-001",
      "agent_id": "agent-001",
      "display_name": "Planning Agent Alpha",
      "status": "active",
      "roles": ["contributor", "analyst"],
      "joined_at": "2025-09-03T10:05:00.000Z",
      "last_activity_at": "2025-09-03T10:14:30.000Z"
    }
  ],
  "total": 1
}
```

### **Session Management Endpoints**

#### **Create Session**
```http
POST /api/v1/contexts/{context_id}/sessions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "planning-session-1",
  "type": "collaborative",
  "configuration": {
    "max_duration": 3600000,
    "persist_state": true,
    "isolation_level": "shared",
    "auto_save": true
  },
  "participants": ["part-001", "part-002"],
  "metadata": {
    "description": "Initial planning session",
    "tags": ["planning", "initial"]
  }
}
```

#### **Get Session**
```http
GET /api/v1/contexts/{context_id}/sessions/{session_id}
Authorization: Bearer <token>
```

#### **List Sessions**
```http
GET /api/v1/contexts/{context_id}/sessions?status=active
Authorization: Bearer <token>
```

### **Metadata Management Endpoints**

#### **Set Metadata**
```http
PUT /api/v1/contexts/{context_id}/metadata/{key}
Content-Type: application/json
Authorization: Bearer <token>

{
  "value": "high",
  "type": "string",
  "description": "Context priority level",
  "access_level": "public"
}
```

#### **Get Metadata**
```http
GET /api/v1/contexts/{context_id}/metadata/{key}
Authorization: Bearer <token>
```

#### **Delete Metadata**
```http
DELETE /api/v1/contexts/{context_id}/metadata/{key}
Authorization: Bearer <token>
```

#### **List Metadata**
```http
GET /api/v1/contexts/{context_id}/metadata?pattern=priority*
Authorization: Bearer <token>
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type Context {
  contextId: ID!
  name: String!
  type: ContextType!
  status: ContextStatus!
  version: String!
  participantCount: Int!
  sessionCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastActivityAt: DateTime
  expiresAt: DateTime
  configuration: ContextConfiguration!
  metadata: ContextMetadata
  participants: [Participant!]!
  sessions: [Session!]!
  health: ContextHealth
}

type Participant {
  participantId: ID!
  agentId: String!
  contextId: ID!
  participantType: ParticipantType!
  displayName: String
  status: ParticipantStatus!
  roles: [String!]!
  capabilities: [String!]!
  permissions: [String!]!
  joinedAt: DateTime!
  lastActivityAt: DateTime
  activity: ParticipantActivity
  configuration: ParticipantConfiguration
  metadata: ParticipantMetadata
}

type Session {
  sessionId: ID!
  contextId: ID!
  name: String!
  type: SessionType!
  status: SessionStatus!
  participants: [String!]!
  activeParticipants: [String!]!
  createdAt: DateTime!
  startedAt: DateTime
  completedAt: DateTime
  lastActivityAt: DateTime!
  configuration: SessionConfiguration!
  metrics: SessionMetrics
  metadata: SessionMetadata
}

enum ContextType {
  COLLABORATIVE
  SEQUENTIAL
  PARALLEL
  HIERARCHICAL
  PEER_TO_PEER
  BROADCAST
  PIPELINE
}

enum ContextStatus {
  CREATING
  ACTIVE
  PAUSED
  TERMINATING
  TERMINATED
}

enum ParticipantType {
  AGENT
  HUMAN
  SERVICE
  SYSTEM
}

enum ParticipantStatus {
  JOINING
  ACTIVE
  INACTIVE
  LEAVING
  LEFT
}
```

### **Query Operations**

#### **Get Context**
```graphql
query GetContext($contextId: ID!) {
  context(contextId: $contextId) {
    contextId
    name
    type
    status
    participantCount
    sessionCount
    createdAt
    updatedAt
    configuration {
      maxParticipants
      timeoutMs
      persistenceLevel
      isolationLevel
      autoCleanup
    }
    participants {
      participantId
      agentId
      displayName
      status
      roles
      capabilities
      joinedAt
      lastActivityAt
    }
    health {
      overallHealth
      performance {
        avgResponseTime
        throughput
        errorRate
      }
    }
  }
}
```

#### **List Contexts**
```graphql
query ListContexts($filter: ContextFilter, $pagination: PaginationInput) {
  contexts(filter: $filter, pagination: $pagination) {
    contexts {
      contextId
      name
      type
      status
      participantCount
      createdAt
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

#### **Create Context**
```graphql
mutation CreateContext($input: CreateContextInput!) {
  createContext(input: $input) {
    context {
      contextId
      name
      type
      status
      createdAt
      configuration {
        maxParticipants
        timeoutMs
      }
    }
    accessInfo {
      contextUrl
      permissions
    }
  }
}
```

#### **Add Participant**
```graphql
mutation AddParticipant($input: AddParticipantInput!) {
  addParticipant(input: $input) {
    participant {
      participantId
      agentId
      contextId
      status
      roles
      capabilities
      joinedAt
    }
    contextInfo {
      participantCount
      availableRoles
    }
  }
}
```

### **Subscription Operations**

#### **Context Updates**
```graphql
subscription ContextUpdates($contextId: ID!) {
  contextUpdates(contextId: $contextId) {
    type
    contextId
    timestamp
    data
  }
}
```

#### **Participant Activities**
```graphql
subscription ParticipantActivities($contextId: ID!) {
  participantActivities(contextId: $contextId) {
    type
    participantId
    contextId
    timestamp
    activity
  }
}
```

---

## 🔌 WebSocket API Reference

### **Connection**

```javascript
const ws = new WebSocket('wss://api.mplp.dev/ws/contexts');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt-token-here'
}));
```

### **Message Format**

```json
{
  "type": "message_type",
  "id": "unique-message-id",
  "timestamp": "2025-09-03T10:00:00.000Z",
  "data": {
    // Message-specific data
  }
}
```

### **Subscribe to Context Events**

```javascript
// Subscribe to context events
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'context.ctx-001.events'
}));

// Receive events
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event') {
    console.log('Context event:', message.data);
  }
};
```

### **Real-time State Updates**

```javascript
// Subscribe to state updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'context.ctx-001.state'
}));

// Receive state updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'state_update') {
    console.log('State update:', message.data);
  }
};
```

---

## 📊 Response Codes and Error Handling

### **HTTP Status Codes**

#### **Success Codes**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned
- `206 Partial Content` - Partial content returned (pagination)

#### **Client Error Codes**
- `400 Bad Request` - Invalid request format or parameters
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., context full)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded

#### **Server Error Codes**
- `500 Internal Server Error` - Internal server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily unavailable
- `504 Gateway Timeout` - Request timeout

### **Error Response Format**

```json
{
  "error": {
    "code": "CONTEXT_NOT_FOUND",
    "message": "The specified context does not exist",
    "details": {
      "context_id": "ctx-001",
      "timestamp": "2025-09-03T10:00:00.000Z"
    },
    "help_url": "https://docs.mplp.dev/errors/CONTEXT_NOT_FOUND"
  }
}
```

---

## 🔗 Related Documentation

- [Context Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [OpenAPI Specification](./openapi.yaml) - Complete OpenAPI 3.0 specification

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: The Context Module API is production-ready and stable in Alpha release. Additional endpoints and optimizations may be added in Beta release while maintaining backward compatibility.
