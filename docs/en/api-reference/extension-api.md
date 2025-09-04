# Extension API Reference

**Plugin System and Custom Functionality - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Extension%20Module-blue.svg)](../modules/extension/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--extension.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-92%2F92%20passing-green.svg)](../modules/extension/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/extension-api.md)

---

## 🎯 Overview

The Extension API provides comprehensive plugin system and extensibility capabilities for multi-agent systems. It enables dynamic loading, lifecycle management, security isolation, and custom functionality integration. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  ExtensionController,
  ExtensionManagementService,
  CreateExtensionDto,
  UpdateExtensionDto,
  ExtensionResponseDto
} from 'mplp/modules/extension';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const extensionModule = mplp.getModule('extension');
```

## 🏗️ Core Interfaces

### **ExtensionResponseDto** (Response Interface)

```typescript
interface ExtensionResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  extensionId: string;            // Unique extension identifier
  contextId: string;              // Associated context ID
  name: string;                   // Extension name
  version: string;                // Extension version
  status: ExtensionStatus;        // Extension status
  type: ExtensionType;            // Extension type
  
  // Extension configuration
  configuration: ExtensionConfig;
  capabilities: string[];         // Extension capabilities
  dependencies: ExtensionDependency[];
  
  // Lifecycle information
  lifecycle: {
    installDate: string;
    lastActivated?: string;
    lastDeactivated?: string;
    activationCount: number;
  };
  
  // Security and permissions
  permissions: ExtensionPermission[];
  securityLevel: SecurityLevel;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateExtensionDto** (Create Request Interface)

```typescript
interface CreateExtensionDto {
  contextId: string;              // Required: Associated context ID
  name: string;                   // Required: Extension name
  version: string;                // Required: Extension version
  type: ExtensionType;            // Required: Extension type
  
  // Extension package information
  packageInfo: {
    source: string;               // Package source (URL, file path, etc.)
    checksum?: string;            // Package checksum for verification
    signature?: string;           // Digital signature
  };
  
  // Configuration
  configuration?: Partial<ExtensionConfig>;
  permissions?: ExtensionPermission[];
  
  // Dependencies
  dependencies?: ExtensionDependency[];
  
  // Metadata
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **ExtensionStatus** (Extension Status)

```typescript
enum ExtensionStatus {
  INSTALLED = 'installed',        // Installed but not active
  ACTIVE = 'active',              // Active and running
  INACTIVE = 'inactive',          // Inactive
  ERROR = 'error',                // Error state
  UPDATING = 'updating',          // Being updated
  UNINSTALLING = 'uninstalling'   // Being uninstalled
}
```

### **ExtensionType** (Extension Type)

```typescript
enum ExtensionType {
  AGENT_CAPABILITY = 'agent_capability',     // Agent capability extension
  PROTOCOL_HANDLER = 'protocol_handler',     // Protocol handler
  DATA_PROCESSOR = 'data_processor',         // Data processor
  UI_COMPONENT = 'ui_component',             // UI component
  INTEGRATION = 'integration',               // External integration
  MIDDLEWARE = 'middleware'                  // Middleware extension
}
```

## 🎮 Controller API

### **ExtensionController**

Main REST API controller providing HTTP endpoint access.

#### **Install Extension**
```typescript
async installExtension(dto: CreateExtensionDto): Promise<ExtensionOperationResult>
```

**HTTP Endpoint**: `POST /api/extensions/install`

**Request Example**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "advanced-nlp-processor",
  "version": "2.1.0",
  "type": "data_processor",
  "packageInfo": {
    "source": "https://extensions.mplp.io/nlp-processor-2.1.0.zip",
    "checksum": "sha256:abc123...",
    "signature": "sig:def456..."
  },
  "configuration": {
    "enableAdvancedFeatures": true,
    "maxProcessingThreads": 4
  },
  "permissions": [
    {
      "resource": "data.process",
      "actions": ["read", "write"],
      "scope": "context"
    }
  ]
}
```

#### **Activate Extension**
```typescript
async activateExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP Endpoint**: `POST /api/extensions/{extensionId}/activate`

#### **Deactivate Extension**
```typescript
async deactivateExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP Endpoint**: `POST /api/extensions/{extensionId}/deactivate`

#### **Uninstall Extension**
```typescript
async uninstallExtension(extensionId: string): Promise<ExtensionOperationResult>
```

**HTTP Endpoint**: `DELETE /api/extensions/{extensionId}`

#### **Get Extension**
```typescript
async getExtension(extensionId: string): Promise<ExtensionResponseDto>
```

**HTTP Endpoint**: `GET /api/extensions/{extensionId}`

#### **List Extensions**
```typescript
async listExtensions(filter?: ExtensionFilter): Promise<ExtensionResponseDto[]>
```

**HTTP Endpoint**: `GET /api/extensions`

#### **Update Extension Configuration**
```typescript
async updateExtensionConfig(extensionId: string, config: Partial<ExtensionConfig>): Promise<ExtensionOperationResult>
```

**HTTP Endpoint**: `PUT /api/extensions/{extensionId}/config`

## 🔧 Service Layer API

### **ExtensionManagementService**

Core business logic service providing extension management functionality.

#### **Main Methods**

```typescript
class ExtensionManagementService {
  // Lifecycle management
  async installExtension(request: InstallExtensionRequest): Promise<ExtensionEntity>;
  async uninstallExtension(extensionId: string): Promise<boolean>;
  async activateExtension(extensionId: string): Promise<ExtensionEntity>;
  async deactivateExtension(extensionId: string): Promise<ExtensionEntity>;
  
  // Configuration management
  async updateExtensionConfig(extensionId: string, config: Partial<ExtensionConfig>): Promise<ExtensionEntity>;
  async getExtensionConfig(extensionId: string): Promise<ExtensionConfig>;
  
  // Query and discovery
  async getExtensionById(extensionId: string): Promise<ExtensionEntity | null>;
  async listExtensions(filter?: ExtensionFilter): Promise<ExtensionEntity[]>;
  async searchExtensions(query: ExtensionSearchQuery): Promise<ExtensionSearchResult>;
  
  // Security and validation
  async validateExtension(extensionId: string): Promise<ValidationResult>;
  async checkExtensionPermissions(extensionId: string): Promise<PermissionCheckResult>;
  
  // Analytics and monitoring
  async getExtensionMetrics(extensionId: string): Promise<ExtensionMetrics>;
  async getExtensionHealth(extensionId: string): Promise<ExtensionHealth>;
}
```

## 📊 Data Structures

### **ExtensionConfig** (Extension Configuration)

```typescript
interface ExtensionConfig {
  autoStart: boolean;             // Auto-start on context activation
  maxMemoryUsage: number;         // Maximum memory usage (MB)
  maxCpuUsage: number;            // Maximum CPU usage (%)
  timeoutSettings: {
    initialization: number;       // Initialization timeout (ms)
    operation: number;            // Operation timeout (ms)
    shutdown: number;             // Shutdown timeout (ms)
  };
  customSettings: Record<string, any>; // Extension-specific settings
}
```

### **ExtensionDependency** (Extension Dependency)

```typescript
interface ExtensionDependency {
  name: string;                   // Dependency name
  version: string;                // Required version
  type: 'extension' | 'library' | 'service';
  optional: boolean;              // Is optional dependency
  source?: string;                // Dependency source
}
```

### **ExtensionPermission** (Extension Permission)

```typescript
interface ExtensionPermission {
  resource: string;               // Resource identifier
  actions: string[];              // Allowed actions
  scope: 'global' | 'context' | 'local';
  conditions?: string[];          // Permission conditions
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/extension/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/extension/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/extension/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/extension/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
