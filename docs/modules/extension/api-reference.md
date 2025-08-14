# Extension Module - API Reference

**Version**: v1.0.0
**Last Updated**: 2025-08-11 18:00:00
**Status**: L4 Intelligent Agent Operating System Production Ready ✅

---

## 📋 **API Overview**

The Extension Module provides a comprehensive REST API for extension management operations within the MPLP L4 Intelligent Agent Operating System. All endpoints follow RESTful design principles with consistent request/response patterns and comprehensive error handling.

**Base URL**: `/api/v1/extensions`

## 🔐 **Authentication**

All API endpoints require authentication. Include the authentication token in the request header:

```http
Authorization: Bearer <your-token>
Content-Type: application/json
```

## 📊 **Response Format**

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  status: number;           // HTTP status code
  success: boolean;         // Operation success indicator
  data?: T;                // Response data (if successful)
  error?: string;          // Error message (if failed)
  timestamp: string;       // ISO timestamp
  request_id: string;      // Unique request identifier
}
```

## 🚀 **Core Extension Management Endpoints**

### Create Extension

Creates a new extension in the system.

```http
POST /api/v1/extensions
```

**Request Body:**
```typescript
interface CreateExtensionRequest {
  name: string;
  version: string;
  description?: string;
  author: string;
  source: ExtensionSource;
  config?: Record<string, any>;
  dependencies?: ExtensionDependency[];
  permissions?: string[];
}

type ExtensionSource = 'npm' | 'git' | 'local' | 'marketplace';

interface ExtensionDependency {
  name: string;
  version: string;
  optional?: boolean;
}
```

**Response:**
```typescript
interface CreateExtensionResponse {
  extension_id: string;
  name: string;
  version: string;
  status: ExtensionStatus;
  created_at: string;
}
```

**Example:**
```bash
curl -X POST /api/v1/extensions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Workflow Optimizer",
    "version": "1.0.0",
    "description": "Intelligent workflow optimization extension",
    "author": "MPLP Team",
    "source": "marketplace",
    "config": {
      "optimization_level": "high",
      "ai_model": "gpt-4"
    }
  }'
```

### Activate Extension

Activates an installed extension.

```http
POST /api/v1/extensions/{extensionId}/activate
```

**Path Parameters:**
- `extensionId` (string): The unique identifier of the extension

**Response:**
```typescript
interface ActivateExtensionResponse {
  extension_id: string;
  status: ExtensionStatus;
  activated_at: string;
}
```

### Deactivate Extension

Deactivates an active extension.

```http
POST /api/v1/extensions/{extensionId}/deactivate
```

### Get Extension

Retrieves extension details by ID.

```http
GET /api/v1/extensions/{extensionId}
```

**Response:**
```typescript
interface ExtensionDetails {
  extension_id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  source: ExtensionSource;
  status: ExtensionStatus;
  config: Record<string, any>;
  dependencies: ExtensionDependency[];
  permissions: string[];
  metadata: ExtensionMetadata;
  created_at: string;
  updated_at: string;
  activated_at?: string;
}
```

### Query Extensions

Retrieves extensions with filtering and pagination.

```http
GET /api/v1/extensions
```

**Query Parameters:**
- `status` (string, optional): Filter by extension status
- `source` (string, optional): Filter by extension source
- `author` (string, optional): Filter by author
- `search` (string, optional): Search in name and description
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `sort` (string, optional): Sort field (default: 'created_at')
- `order` (string, optional): Sort order ('asc' | 'desc', default: 'desc')

**Response:**
```typescript
interface QueryExtensionsResponse {
  extensions: ExtensionDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Delete Extension

Removes an extension from the system.

```http
DELETE /api/v1/extensions/{extensionId}
```

**Response:**
```typescript
interface DeleteExtensionResponse {
  extension_id: string;
  deleted_at: string;
}
```

## 🤖 **MPLP Ecosystem Integration Endpoints**

### Get Intelligent Extension Recommendations

Retrieves AI-driven extension recommendations based on context.

```http
POST /api/v1/extensions/recommendations
```

**Request Body:**
```typescript
interface ExtensionRecommendationRequest {
  user_id?: string;
  context_id?: string;
  role_id?: string;
  current_extensions?: string[];
  requirements?: string[];
}
```

**Response:**
```typescript
interface ExtensionRecommendationResponse {
  recommendations: ExtensionRecommendation[];
  reasoning: string;
  confidence_score: number;
}

interface ExtensionRecommendation {
  extension_id: string;
  name: string;
  description: string;
  relevance_score: number;
  benefits: string[];
  installation_complexity: 'low' | 'medium' | 'high';
}
```

### Load Extensions for Role

Dynamically loads extensions based on user role.

```http
POST /api/v1/extensions/load-for-role
```

**Request Body:**
```typescript
interface LoadExtensionsForRoleRequest {
  user_id: string;
  role_id: string;
  context_id?: string;
}
```

### Request Extension Approval

Initiates enterprise approval workflow for extension installation.

```http
POST /api/v1/extensions/approval-request
```

**Request Body:**
```typescript
interface ExtensionApprovalRequest {
  extension_id: string;
  user_id: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  business_justification?: string;
}
```

## 🏢 **Enterprise-Grade Features Endpoints**

### Security Audit

Performs comprehensive security audit on an extension.

```http
POST /api/v1/extensions/{extensionId}/security-audit
```

**Response:**
```typescript
interface SecurityAuditResponse {
  audit_id: string;
  extension_id: string;
  security_score: number;
  vulnerabilities: SecurityVulnerability[];
  compliance_status: ComplianceStatus;
  recommendations: string[];
  audit_timestamp: string;
}

interface SecurityVulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  remediation: string;
}
```

### Performance Monitoring

Retrieves performance metrics for an extension.

```http
GET /api/v1/extensions/{extensionId}/performance
```

**Query Parameters:**
- `period` (string): Time period ('1h' | '24h' | '7d' | '30d')
- `metrics` (string[]): Specific metrics to retrieve

**Response:**
```typescript
interface PerformanceMetricsResponse {
  extension_id: string;
  period: string;
  metrics: {
    cpu_usage: MetricData[];
    memory_usage: MetricData[];
    execution_time: MetricData[];
    error_rate: MetricData[];
    throughput: MetricData[];
  };
  summary: PerformanceSummary;
}
```

### Lifecycle Automation

Manages automated extension lifecycle operations.

```http
POST /api/v1/extensions/{extensionId}/lifecycle-automation
```

**Request Body:**
```typescript
interface LifecycleAutomationRequest {
  action: 'auto_update' | 'auto_scale' | 'auto_restart' | 'auto_backup';
  schedule?: string; // Cron expression
  conditions?: AutomationCondition[];
  notifications?: NotificationConfig[];
}
```

## 🌐 **Distributed Network Support Endpoints**

### Distribute Extension to Network

Distributes an extension across the agent network.

```http
POST /api/v1/extensions/{extensionId}/distribute
```

**Request Body:**
```typescript
interface DistributeExtensionRequest {
  target_agents: string[];
  distribution_strategy: 'immediate' | 'progressive' | 'scheduled';
  rollback_policy: RollbackPolicy;
  validation_criteria: ValidationCriteria;
}
```

### Network Extension Status

Retrieves extension status across the network.

```http
GET /api/v1/extensions/{extensionId}/network-status
```

**Response:**
```typescript
interface NetworkExtensionStatusResponse {
  extension_id: string;
  network_deployment: {
    total_agents: number;
    deployed_agents: number;
    failed_agents: number;
    pending_agents: number;
  };
  agent_status: AgentExtensionStatus[];
  network_health: NetworkHealthMetrics;
}
```

## 💬 **Dialog-Driven Management Endpoints**

### Process Natural Language Extension Request

Processes natural language requests for extension management.

```http
POST /api/v1/extensions/dialog-request
```

**Request Body:**
```typescript
interface DialogExtensionRequest {
  user_id: string;
  message: string;
  context_id?: string;
  conversation_history?: DialogMessage[];
}
```

**Response:**
```typescript
interface DialogExtensionResponse {
  intent: ExtensionIntent;
  actions: ExtensionAction[];
  response_message: string;
  requires_confirmation: boolean;
  suggested_extensions?: ExtensionSuggestion[];
}
```

## 📊 **Status Codes and Error Handling**

### HTTP Status Codes

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., extension already exists)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Error Response Format

```typescript
interface ErrorResponse {
  status: number;
  success: false;
  error: string;
  details?: ErrorDetail[];
  timestamp: string;
  request_id: string;
}

interface ErrorDetail {
  field?: string;
  code: string;
  message: string;
}
```

## 🔧 **Rate Limiting**

API endpoints are rate-limited to ensure system stability:

- **Standard endpoints**: 100 requests per minute per user
- **Resource-intensive operations**: 10 requests per minute per user
- **Bulk operations**: 5 requests per minute per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📚 **Additional Resources**

### SDK and Libraries
- **JavaScript/TypeScript SDK**: `@mplp/extension-sdk`
- **Python SDK**: `mplp-extension-python`
- **CLI Tool**: `@mplp/extension-cli`

### Integration Examples
- [Basic Integration](./examples.md#basic-extension-management-examples)
- [MPLP Ecosystem Integration](./examples.md#mplp-ecosystem-integration-examples)
- [Enterprise Features](./examples.md#enterprise-grade-features-examples)

### Related Documentation
- [Extension Module Architecture](./architecture.md)
- [MPLP Integration Guide](./mplp-integration.md)
- [Features Documentation](./features.md)

---

**Extension Module API** - Comprehensive extension management for MPLP L4 Intelligent Agent Operating System ✨
