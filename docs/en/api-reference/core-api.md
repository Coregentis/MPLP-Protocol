# MPLPCore API Reference

**Main MPLP initialization and management API**

## 🎯 **Overview**

The `MPLPCore` class is the main entry point for the MPLP v1.0 Alpha protocol stack. It provides initialization, configuration, and access to all L1-L3 layer components.

## 📦 **Import**

```typescript
import { MPLPCore, MPLPConfig } from 'mplp';
```

## 🏗️ **Constructor**

### `new MPLPCore(config?: MPLPConfig)`

Creates a new MPLP instance with optional configuration.

```typescript
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'development',
  logLevel: 'info'
});
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `MPLPConfig` | No | Configuration options |

#### **MPLPConfig Interface**

```typescript
interface MPLPConfig {
  // Core settings
  version?: string;                    // MPLP version (default: '1.0.0-alpha')
  environment?: 'development' | 'testing' | 'production'; // Environment
  logLevel?: 'debug' | 'info' | 'warn' | 'error';        // Log level
  
  // Authentication
  auth?: {
    type: 'bearer' | 'basic' | 'custom';
    token?: string;
    credentials?: Record<string, unknown>;
  };
  
  // Module configuration
  modules?: {
    [moduleName: string]: ModuleConfig;
  };
  
  // Performance settings
  performance?: {
    enableMetrics?: boolean;           // Enable performance metrics
    enableTracing?: boolean;           // Enable distributed tracing
    cacheSize?: number;               // Cache size in MB
    maxConcurrentOperations?: number; // Max concurrent operations
  };
  
  // Network settings
  network?: {
    timeout?: number;                 // Request timeout in ms
    retries?: number;                 // Number of retries
    baseUrl?: string;                // Base URL for remote services
  };
}
```

## 🚀 **Core Methods**

### `initialize(): Promise<void>`

Initializes the MPLP protocol stack and all configured modules.

```typescript
await mplp.initialize();
console.log('MPLP initialized successfully');
```

**Returns**: `Promise<void>`

**Throws**: 
- `MPLPError` - If initialization fails
- `ValidationError` - If configuration is invalid

### `shutdown(): Promise<void>`

Gracefully shuts down the MPLP instance and all modules.

```typescript
await mplp.shutdown();
console.log('MPLP shut down successfully');
```

**Returns**: `Promise<void>`

### `isInitialized(): boolean`

Checks if the MPLP instance is initialized.

```typescript
if (mplp.isInitialized()) {
  console.log('MPLP is ready to use');
}
```

**Returns**: `boolean`

## 🔧 **Module Access**

### `getModule<T>(moduleName: string): T`

Gets a reference to a specific L2 coordination module.

```typescript
const contextModule = mplp.getModule('context');
const planModule = mplp.getModule('plan');
const roleModule = mplp.getModule('role');
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `moduleName` | `string` | Yes | Name of the module to retrieve |

#### **Available Modules**

| Module Name | Type | Description |
|-------------|------|-------------|
| `'context'` | `ContextModule` | Context management |
| `'plan'` | `PlanModule` | Planning and orchestration |
| `'role'` | `RoleModule` | Role-based access control |
| `'confirm'` | `ConfirmModule` | Approval workflows |
| `'trace'` | `TraceModule` | Monitoring and tracing |
| `'extension'` | `ExtensionModule` | Plugin system |
| `'dialog'` | `DialogModule` | Inter-agent communication |
| `'collab'` | `CollabModule` | Multi-agent collaboration |
| `'network'` | `NetworkModule` | Distributed communication |
| `'core'` | `CoreModule` | Central coordination |

**Returns**: Module instance of type `T`

**Throws**: 
- `ModuleNotFoundError` - If module doesn't exist
- `ModuleNotInitializedError` - If module isn't initialized

### `getCoreOrchestrator(): CoreOrchestrator`

Gets a reference to the L3 CoreOrchestrator.

```typescript
const orchestrator = mplp.getCoreOrchestrator();
const workflow = await orchestrator.executeWorkflow(workflowDef);
```

**Returns**: `CoreOrchestrator` instance

### `listModules(): string[]`

Lists all available module names.

```typescript
const modules = mplp.listModules();
console.log('Available modules:', modules);
// Output: ['context', 'plan', 'role', 'confirm', 'trace', ...]
```

**Returns**: `string[]` - Array of module names

## 📊 **System Information**

### `getVersion(): string`

Gets the current MPLP version.

```typescript
const version = mplp.getVersion();
console.log('MPLP version:', version); // "1.0.0-alpha"
```

**Returns**: `string` - Version string

### `getSystemHealth(): Promise<SystemHealth>`

Gets comprehensive system health information.

```typescript
const health = await mplp.getSystemHealth();
console.log('System health:', health.status);
```

#### **SystemHealth Interface**

```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;                    // Uptime in seconds
  version: string;                   // MPLP version
  environment: string;               // Current environment
  modules: {
    [moduleName: string]: ModuleHealth;
  };
  performance: {
    cpuUsage: number;               // CPU usage percentage
    memoryUsage: number;            // Memory usage in MB
    activeConnections: number;      // Active connections
  };
  lastHealthCheck: Date;
}

interface ModuleHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;             // Response time in ms
  errorRate: number;                // Error rate percentage
  details?: Record<string, unknown>;
}
```

**Returns**: `Promise<SystemHealth>`

### `getPerformanceMetrics(): Promise<PerformanceMetrics>`

Gets system performance metrics.

```typescript
const metrics = await mplp.getPerformanceMetrics();
console.log('Performance metrics:', metrics);
```

#### **PerformanceMetrics Interface**

```typescript
interface PerformanceMetrics {
  // Request metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;      // Average response time in ms
  requestsPerSecond: number;        // Current RPS
  
  // System metrics
  cpuUsage: number;                 // CPU usage percentage
  memoryUsage: number;              // Memory usage in MB
  diskUsage: number;                // Disk usage in MB
  networkLatency: number;           // Network latency in ms
  
  // Module metrics
  moduleMetrics: {
    [moduleName: string]: ModuleMetrics;
  };
  
  // Time range
  collectionPeriod: {
    start: Date;
    end: Date;
  };
}

interface ModuleMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate?: number;
}
```

**Returns**: `Promise<PerformanceMetrics>`

## 🔧 **Configuration Management**

### `updateConfig(config: Partial<MPLPConfig>): Promise<void>`

Updates the MPLP configuration at runtime.

```typescript
await mplp.updateConfig({
  logLevel: 'debug',
  performance: {
    enableMetrics: true,
    enableTracing: true
  }
});
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `Partial<MPLPConfig>` | Yes | Configuration updates |

**Returns**: `Promise<void>`

**Throws**: 
- `ValidationError` - If configuration is invalid
- `ConfigurationError` - If update fails

### `getConfig(): MPLPConfig`

Gets the current MPLP configuration.

```typescript
const config = mplp.getConfig();
console.log('Current config:', config);
```

**Returns**: `MPLPConfig` - Current configuration

## 🔒 **Authentication**

### `setAuthToken(token: string): void`

Sets the authentication token for API requests.

```typescript
mplp.setAuthToken('your-api-token');
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | `string` | Yes | Authentication token |

### `clearAuth(): void`

Clears the current authentication.

```typescript
mplp.clearAuth();
```

## 📡 **Event System**

### `on(event: string, handler: EventHandler): void`

Subscribes to system events.

```typescript
mplp.on('module.initialized', (event) => {
  console.log('Module initialized:', event.data.moduleName);
});

mplp.on('error', (event) => {
  console.error('System error:', event.data.error);
});
```

#### **System Events**

| Event | Description | Data |
|-------|-------------|------|
| `'initialized'` | MPLP initialization complete | `{ version: string }` |
| `'shutdown'` | MPLP shutdown initiated | `{ reason: string }` |
| `'module.initialized'` | Module initialization complete | `{ moduleName: string }` |
| `'module.error'` | Module error occurred | `{ moduleName: string, error: Error }` |
| `'performance.alert'` | Performance threshold exceeded | `{ metric: string, value: number }` |
| `'error'` | System error occurred | `{ error: Error, context: object }` |

### `off(event: string, handler: EventHandler): void`

Unsubscribes from system events.

```typescript
const handler = (event) => console.log(event);
mplp.on('initialized', handler);
mplp.off('initialized', handler);
```

### `emit(event: string, data: unknown): void`

Emits a custom system event.

```typescript
mplp.emit('custom.event', { message: 'Hello, MPLP!' });
```

## 🔍 **Debugging & Diagnostics**

### `enableDebugMode(): void`

Enables debug mode with verbose logging.

```typescript
mplp.enableDebugMode();
```

### `disableDebugMode(): void`

Disables debug mode.

```typescript
mplp.disableDebugMode();
```

### `getDiagnostics(): Promise<SystemDiagnostics>`

Gets comprehensive system diagnostics.

```typescript
const diagnostics = await mplp.getDiagnostics();
console.log('System diagnostics:', diagnostics);
```

## 💡 **Usage Examples**

### **Basic Initialization**

```typescript
import { MPLPCore } from 'mplp';

const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'development',
  logLevel: 'info'
});

await mplp.initialize();
console.log('MPLP is ready!');
```

### **Production Configuration**

```typescript
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'production',
  logLevel: 'warn',
  performance: {
    enableMetrics: true,
    enableTracing: true,
    maxConcurrentOperations: 1000
  },
  network: {
    timeout: 30000,
    retries: 3
  }
});
```

### **Module Usage**

```typescript
await mplp.initialize();

// Use modules
const context = await mplp.getModule('context').createContext({
  name: 'my-context',
  type: 'project'
});

const plan = await mplp.getModule('plan').createPlan({
  contextId: context.id,
  objectives: ['obj1', 'obj2']
});

// Use orchestrator
const workflow = await mplp.getCoreOrchestrator().executeWorkflow({
  stages: ['context', 'plan', 'execute']
});
```

## 🔗 **Related APIs**

- **[CoreOrchestrator API](orchestrator-api.md)** - L3 workflow orchestration
- **[Context API](context-api.md)** - Context management
- **[Plan API](plan-api.md)** - Planning and orchestration
- **[Error Handling API](error-handling-api.md)** - Error management

---

**⚠️ Alpha Notice**: This API is part of MPLP v1.0 Alpha. While the core functionality is stable, some methods may receive enhancements based on community feedback before the stable release.
