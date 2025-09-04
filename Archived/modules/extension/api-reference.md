# Extension Module API Reference

## 📋 **Overview**

This document provides comprehensive API documentation for the Extension Module, including all endpoints, request/response formats, and usage examples.

**Base URL**: `/api/v1/extensions`  
**Authentication**: Bearer Token Required  
**Content Type**: `application/json`  
**API Version**: 1.0.0

## 🔗 **Endpoints**

### **1. Create Extension**

**Endpoint**: `POST /extensions`  
**Description**: Creates a new extension in the system  
**Authentication**: Required  
**Permissions**: `extension:create`

#### **Request Body**
```typescript
{
  contextId: string;           // Context ID for the extension
  name: string;               // Unique extension name
  displayName: string;        // Human-readable display name
  description: string;        // Extension description
  version: string;           // Semantic version (e.g., "1.0.0")
  extensionType: ExtensionType; // Extension type
  compatibility: {
    mplpVersion: string;      // Compatible MPLP version
    requiredModules: string[]; // Required MPLP modules
    dependencies: Dependency[]; // Extension dependencies
    conflicts: string[];       // Conflicting extensions
  };
  configuration: {
    schema: object;           // Configuration schema
    currentConfig: object;    // Current configuration
    defaultConfig: object;    // Default configuration
    validationRules: ValidationRule[]; // Validation rules
  };
  extensionPoints: ExtensionPoint[]; // Extension points
  apiExtensions: ApiExtension[];     // API extensions
  eventSubscriptions: EventSubscription[]; // Event subscriptions
  security: ExtensionSecurity;       // Security configuration
  metadata: ExtensionMetadata;       // Extension metadata
}
```

#### **Response**
```typescript
{
  extensionId: string;        // Generated extension ID
  contextId: string;          // Context ID
  name: string;              // Extension name
  displayName: string;       // Display name
  description: string;       // Description
  version: string;          // Version
  extensionType: ExtensionType; // Extension type
  status: ExtensionStatus;   // Current status
  protocolVersion: string;   // MPLP protocol version
  timestamp: string;         // Creation timestamp
  // ... additional fields
}
```

#### **Example**
```bash
curl -X POST /api/v1/extensions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contextId": "ctx-project-001",
    "name": "my-plugin",
    "displayName": "My Custom Plugin",
    "description": "A custom plugin for enhanced functionality",
    "version": "1.0.0",
    "extensionType": "plugin",
    "compatibility": {
      "mplpVersion": "1.0.0",
      "requiredModules": ["context"],
      "dependencies": [],
      "conflicts": []
    },
    "configuration": {
      "schema": {"type": "object"},
      "currentConfig": {"enabled": true},
      "defaultConfig": {"enabled": false},
      "validationRules": []
    },
    "extensionPoints": [],
    "apiExtensions": [],
    "eventSubscriptions": [],
    "security": {
      "sandboxEnabled": true,
      "resourceLimits": {
        "maxMemory": 104857600,
        "maxCpu": 50,
        "maxFileSize": 10485760,
        "maxNetworkConnections": 10,
        "allowedDomains": [],
        "blockedDomains": []
      },
      "codeSigning": {
        "required": false,
        "trustedSigners": []
      },
      "permissions": {
        "fileSystem": {"read": [], "write": [], "execute": []},
        "network": {"allowedHosts": [], "allowedPorts": [], "protocols": []},
        "database": {"read": [], "write": [], "admin": []},
        "api": {"endpoints": [], "methods": [], "rateLimit": 100}
      }
    },
    "metadata": {
      "author": {"name": "Developer Name"},
      "license": {"type": "MIT"},
      "keywords": ["plugin"],
      "category": "utility",
      "screenshots": []
    }
  }'
```

### **2. Get Extension**

**Endpoint**: `GET /extensions/{extensionId}`  
**Description**: Retrieves a specific extension by ID  
**Authentication**: Required  
**Permissions**: `extension:read`

#### **Path Parameters**
- `extensionId` (string, required): The extension ID

#### **Response**
```typescript
{
  extensionId: string;
  contextId: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  extensionType: ExtensionType;
  status: ExtensionStatus;
  protocolVersion: string;
  timestamp: string;
  compatibility: ExtensionCompatibility;
  configuration: ExtensionConfiguration;
  extensionPoints: ExtensionPoint[];
  apiExtensions: ApiExtension[];
  eventSubscriptions: EventSubscription[];
  lifecycle: ExtensionLifecycle;
  security: ExtensionSecurity;
  metadata: ExtensionMetadata;
  auditTrail: AuditTrail;
  performanceMetrics: ExtensionPerformanceMetrics;
  monitoringIntegration: MonitoringIntegration;
  versionHistory: VersionHistory;
  searchMetadata: SearchMetadata;
  eventIntegration: EventIntegration;
}
```

#### **Example**
```bash
curl -X GET /api/v1/extensions/ext-12345 \
  -H "Authorization: Bearer <token>"
```

### **3. Update Extension**

**Endpoint**: `PUT /extensions/{extensionId}`  
**Description**: Updates an existing extension  
**Authentication**: Required  
**Permissions**: `extension:update`

#### **Path Parameters**
- `extensionId` (string, required): The extension ID

#### **Request Body**
```typescript
{
  displayName?: string;        // Updated display name
  description?: string;        // Updated description
  configuration?: object;      // Updated configuration
  extensionPoints?: ExtensionPoint[]; // Updated extension points
  apiExtensions?: ApiExtension[];     // Updated API extensions
  eventSubscriptions?: EventSubscription[]; // Updated event subscriptions
  metadata?: Partial<ExtensionMetadata>; // Updated metadata
}
```

#### **Example**
```bash
curl -X PUT /api/v1/extensions/ext-12345 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Plugin Name",
    "description": "Updated description",
    "configuration": {"enabled": false}
  }'
```

### **4. Delete Extension**

**Endpoint**: `DELETE /extensions/{extensionId}`  
**Description**: Deletes an extension  
**Authentication**: Required  
**Permissions**: `extension:delete`

#### **Path Parameters**
- `extensionId` (string, required): The extension ID

#### **Response**
```typescript
{
  success: boolean;
  message: string;
}
```

#### **Example**
```bash
curl -X DELETE /api/v1/extensions/ext-12345 \
  -H "Authorization: Bearer <token>"
```

### **5. Activate Extension**

**Endpoint**: `POST /extensions/{extensionId}/activate`  
**Description**: Activates an extension  
**Authentication**: Required  
**Permissions**: `extension:activate`

#### **Path Parameters**
- `extensionId` (string, required): The extension ID

#### **Request Body**
```typescript
{
  userId: string; // User ID performing the activation
}
```

#### **Response**
```typescript
{
  success: boolean;
  message: string;
  extensionId: string;
  status: ExtensionStatus;
}
```

#### **Example**
```bash
curl -X POST /api/v1/extensions/ext-12345/activate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-001"}'
```

### **6. Deactivate Extension**

**Endpoint**: `POST /extensions/{extensionId}/deactivate`  
**Description**: Deactivates an extension  
**Authentication**: Required  
**Permissions**: `extension:deactivate`

#### **Path Parameters**
- `extensionId` (string, required): The extension ID

#### **Request Body**
```typescript
{
  userId: string; // User ID performing the deactivation
}
```

#### **Example**
```bash
curl -X POST /api/v1/extensions/ext-12345/deactivate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-001"}'
```

### **7. Query Extensions**

**Endpoint**: `GET /extensions`  
**Description**: Queries extensions with filtering, pagination, and sorting  
**Authentication**: Required  
**Permissions**: `extension:read`

#### **Query Parameters**
- `contextId` (string, optional): Filter by context ID
- `extensionType` (string, optional): Filter by extension type
- `status` (string, optional): Filter by status
- `name` (string, optional): Filter by name (partial match)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sortBy` (string, optional): Sort field (default: 'name')
- `sortOrder` (string, optional): Sort order ('asc' or 'desc', default: 'asc')

#### **Response**
```typescript
{
  extensions: ExtensionResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

#### **Example**
```bash
curl -X GET "/api/v1/extensions?contextId=ctx-project-001&status=active&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### **8. Get Health Status**

**Endpoint**: `GET /extensions/health`  
**Description**: Gets the health status of the Extension module  
**Authentication**: Required  
**Permissions**: `extension:health`

#### **Response**
```typescript
{
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  details: {
    service: string;
    version: string;
    repository: {
      status: string;
      extensionCount: number;
      activeExtensions: number;
      lastOperation: string;
    };
    performance: {
      averageResponseTime: number;
      totalExtensions: number;
      errorRate: number;
    };
  };
}
```

#### **Example**
```bash
curl -X GET /api/v1/extensions/health \
  -H "Authorization: Bearer <token>"
```

## 📊 **Data Types**

### **ExtensionType**
```typescript
type ExtensionType = 
  | 'plugin'
  | 'adapter'
  | 'connector'
  | 'middleware'
  | 'hook'
  | 'transformer';
```

### **ExtensionStatus**
```typescript
type ExtensionStatus = 
  | 'installed'
  | 'active'
  | 'inactive'
  | 'disabled'
  | 'error'
  | 'updating'
  | 'uninstalling';
```

### **ExtensionPoint**
```typescript
interface ExtensionPoint {
  id: string;
  name: string;
  type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
  description: string;
  parameters: Parameter[];
  returnType: string;
  async: boolean;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  conditionalExecution?: ConditionalExecution;
  executionOrder: number;
}
```

### **ApiExtension**
```typescript
interface ApiExtension {
  endpoint: string;
  method: HttpMethod;
  handler: string;
  middleware: string[];
  authentication: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  validation: ValidationConfig;
  documentation: ApiDocumentation;
}
```

### **EventSubscription**
```typescript
interface EventSubscription {
  eventPattern: string;
  handler: string;
  filterConditions: FilterCondition[];
  deliveryGuarantee: 'at_most_once' | 'at_least_once' | 'exactly_once';
  deadLetterQueue: DeadLetterQueueConfig;
  retryPolicy: RetryPolicy;
  batchProcessing: BatchProcessingConfig;
}
```

## ⚠️ **Error Responses**

### **Common Error Codes**
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Extension not found
- `409` - Conflict: Extension name already exists
- `422` - Unprocessable Entity: Validation errors
- `500` - Internal Server Error: Server error

### **Error Response Format**
```typescript
{
  error: {
    code: string;
    message: string;
    details?: object;
    timestamp: string;
    requestId: string;
  }
}
```

## 🔒 **Authentication & Authorization**

### **Authentication**
All API endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### **Permissions**
- `extension:create` - Create extensions
- `extension:read` - Read extensions
- `extension:update` - Update extensions
- `extension:delete` - Delete extensions
- `extension:activate` - Activate extensions
- `extension:deactivate` - Deactivate extensions
- `extension:health` - View health status

## 📈 **Rate Limits**

- **Standard Operations**: 1000 requests/hour
- **Bulk Operations**: 100 requests/hour
- **Health Checks**: 10000 requests/hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-31
**Maintainer**: MPLP Development Team
