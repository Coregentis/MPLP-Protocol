# MPLP SDK Core API Reference

> **📚 Version**: v1.1.0  
> **🎯 Goal**: Complete SDK Core API Documentation  
> **🌐 Language**: English | [中文](../../docs-sdk/api-reference/sdk-core.md)

---

## 📋 **Table of Contents**

- [MPLP Class](#mplp-class)
- [Factory Functions](#factory-functions)
- [Configuration Interface](#configuration-interface)
- [Module Management](#module-management)
- [Version Information](#version-information)
- [Type Definitions](#type-definitions)

---

## 🏗️ **MPLP Class**

The MPLP main class is the core entry point of the SDK, providing a unified API to initialize and use all MPLP functionality.

### **Constructor**

```typescript
constructor(config?: MPLPConfig)
```

**Parameters**:
- `config` (optional): MPLP configuration object

**Example**:
```typescript
import { MPLP } from 'mplp';

// Use default configuration
const mplp = new MPLP();

// Use custom configuration
const mplp = new MPLP({
  environment: 'production',
  logLevel: 'warn',
  modules: ['context', 'plan', 'role']
});
```

---

### **initialize()**

Initialize the MPLP instance and load all configured modules.

```typescript
async initialize(): Promise<void>
```

**Returns**: `Promise<void>`

**Throws**:
- `Error` if already initialized
- `Error` if module loading fails

**Example**:
```typescript
const mplp = new MPLP();
await mplp.initialize();
console.log('MPLP initialized successfully');
```

---

### **getModule()**

Get a loaded module instance.

```typescript
getModule<T = any>(moduleName: string): T | undefined
```

**Parameters**:
- `moduleName`: Module name ('context' | 'plan' | 'role' | 'confirm' | 'trace' | 'extension' | 'dialog' | 'collab' | 'core' | 'network')

**Returns**: Module instance or `undefined` if module not loaded

**Example**:
```typescript
// Get Context module
const contextModule = mplp.getModule('context');
if (contextModule) {
  // Use Context module
  console.log('Context module loaded');
}

// Get Plan module
const planModule = mplp.getModule('plan');
```

---

### **getVersion()**

Get MPLP version information.

```typescript
getVersion(): string
```

**Returns**: Version string (e.g., "1.1.0")

**Example**:
```typescript
const version = mplp.getVersion();
console.log('MPLP Version:', version); // "1.1.0"
```

---

### **getLoadedModules()**

Get list of loaded modules.

```typescript
getLoadedModules(): string[]
```

**Returns**: Array of module names

**Example**:
```typescript
const modules = mplp.getLoadedModules();
console.log('Loaded modules:', modules);
// ['context', 'plan', 'role']
```

---

### **isInitialized()**

Check if MPLP is initialized.

```typescript
isInitialized(): boolean
```

**Returns**: `true` if initialized, otherwise `false`

**Example**:
```typescript
if (mplp.isInitialized()) {
  console.log('MPLP is ready');
} else {
  await mplp.initialize();
}
```

---

### **getConfig()**

Get current configuration.

```typescript
getConfig(): Readonly<MPLPConfig>
```

**Returns**: Read-only configuration object

**Example**:
```typescript
const config = mplp.getConfig();
console.log('Environment:', config.environment);
console.log('Log Level:', config.logLevel);
```

---

## 🏭 **Factory Functions**

The SDK provides convenient factory functions to quickly create MPLP instances.

### **createMPLP()**

Create and initialize an MPLP instance.

```typescript
async function createMPLP(config?: MPLPConfig): Promise<MPLP>
```

**Parameters**:
- `config` (optional): MPLP configuration object

**Returns**: Initialized MPLP instance

**Example**:
```typescript
import { createMPLP } from 'mplp';

// Create and initialize
const mplp = await createMPLP({
  environment: 'development',
  modules: ['context', 'plan']
});

// Ready to use immediately
const contextModule = mplp.getModule('context');
```

---

### **quickStart()**

Quick start MPLP with default configuration loading all modules.

```typescript
async function quickStart(): Promise<MPLP>
```

**Returns**: Initialized MPLP instance (all 10 modules loaded)

**Example**:
```typescript
import { quickStart } from 'mplp';

// One-line startup
const mplp = await quickStart();

// All modules loaded
console.log('Loaded modules:', mplp.getLoadedModules());
// ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'core', 'network']
```

---

### **createProductionMPLP()**

Create production-optimized MPLP instance.

```typescript
async function createProductionMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>
```

**Parameters**:
- `config` (optional): Additional configuration options

**Returns**: Initialized MPLP instance

**Features**:
- Environment set to `production`
- Log level set to `warn`
- Performance-optimized configuration

**Example**:
```typescript
import { createProductionMPLP } from 'mplp';

const mplp = await createProductionMPLP({
  modules: ['context', 'plan', 'role', 'core']
});
```

---

### **createTestMPLP()**

Create test environment MPLP instance.

```typescript
async function createTestMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>
```

**Parameters**:
- `config` (optional): Additional configuration options

**Returns**: Initialized MPLP instance

**Features**:
- Environment set to `test`
- Log level set to `debug`
- Test-friendly configuration

**Example**:
```typescript
import { createTestMPLP } from 'mplp';

// Use in tests
describe('My Agent Tests', () => {
  let mplp: MPLP;

  beforeEach(async () => {
    mplp = await createTestMPLP();
  });

  it('should work correctly', () => {
    expect(mplp.isInitialized()).toBe(true);
  });
});
```

---

## ⚙️ **Configuration Interface**

### **MPLPConfig**

MPLP configuration interface definition.

```typescript
interface MPLPConfig {
  // Protocol version
  protocolVersion?: string;
  
  // Runtime environment
  environment?: 'development' | 'production' | 'test';
  
  // Log level
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // Modules to load
  modules?: ModuleName[];
  
  // Custom configuration
  customConfig?: Record<string, any>;
}
```

**Field Description**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `protocolVersion` | `string` | `'1.1.0'` | MPLP protocol version |
| `environment` | `'development' \| 'production' \| 'test'` | `'development'` | Runtime environment |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | Log level |
| `modules` | `ModuleName[]` | All modules | Modules to load |
| `customConfig` | `Record<string, any>` | `{}` | Custom configuration object |

**Example**:
```typescript
const config: MPLPConfig = {
  protocolVersion: '1.1.0',
  environment: 'production',
  logLevel: 'warn',
  modules: ['context', 'plan', 'role', 'core'],
  customConfig: {
    appName: 'MyApp',
    features: ['feature1', 'feature2']
  }
};
```

---

## 📦 **Module Management**

### **Available Modules**

MPLP provides 10 core modules:

```typescript
type ModuleName = 
  | 'context'    // Context management
  | 'plan'       // Plan orchestration
  | 'role'       // Role permissions
  | 'confirm'    // Confirmation approval
  | 'trace'      // Execution tracing
  | 'extension'  // Extension management
  | 'dialog'     // Dialog management
  | 'collab'     // Collaboration management
  | 'core'       // Core orchestration
  | 'network';   // Network communication
```

### **Module Loading Example**

```typescript
// Load specific modules
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// Check if module is loaded
const hasContext = mplp.getLoadedModules().includes('context');

// Get module instances
const contextModule = mplp.getModule('context');
const planModule = mplp.getModule('plan');
const roleModule = mplp.getModule('role');
```

---

## 📊 **Version Information**

### **MPLP_VERSION**

Current MPLP version constant.

```typescript
const MPLP_VERSION: string = "1.1.0";
```

**Example**:
```typescript
import { MPLP_VERSION } from 'mplp';
console.log('MPLP Version:', MPLP_VERSION);
```

---

### **MPLP_INFO**

Complete MPLP project information.

```typescript
const MPLP_INFO: {
  readonly name: "MPLP";
  readonly version: "1.1.0";
  readonly fullName: "Multi-Agent Protocol Lifecycle Platform";
  readonly description: string;
  readonly architecture: "L1-L3 Layered Architecture";
  readonly status: "Production Ready";
  readonly modules: readonly ModuleName[];
  readonly capabilities: string[];
  readonly license: "MIT";
  readonly repository: string;
  readonly documentation: string;
}
```

**Example**:
```typescript
import { MPLP_INFO } from 'mplp';

console.log('Project:', MPLP_INFO.fullName);
console.log('Version:', MPLP_INFO.version);
console.log('Modules:', MPLP_INFO.modules);
console.log('Status:', MPLP_INFO.status);
```

---

## 🔧 **Complete Usage Examples**

### **Basic Usage**

```typescript
import { MPLP } from 'mplp';

async function basicExample() {
  // Create instance
  const mplp = new MPLP({
    environment: 'development',
    logLevel: 'info',
    modules: ['context', 'plan', 'role']
  });

  // Initialize
  await mplp.initialize();

  // Get version
  console.log('Version:', mplp.getVersion());

  // Get modules
  const contextModule = mplp.getModule('context');
  const planModule = mplp.getModule('plan');

  // Use modules...
}
```

### **Quick Start**

```typescript
import { quickStart } from 'mplp';

async function quickExample() {
  // One-line startup
  const mplp = await quickStart();

  // Use immediately
  console.log('Loaded:', mplp.getLoadedModules());
}
```

### **Production Environment**

```typescript
import { createProductionMPLP } from 'mplp';

async function productionExample() {
  const mplp = await createProductionMPLP({
    modules: ['context', 'plan', 'role', 'core']
  });

  // Production-optimized configuration applied
  console.log('Environment:', mplp.getConfig().environment); // 'production'
  console.log('Log Level:', mplp.getConfig().logLevel);     // 'warn'
}
```

---

## 📚 **Related Documentation**

- [First Agent Tutorial](../getting-started/first-agent.md)
- [Module API Reference](../../docs/en/api-reference/)
- [Best Practices Guide](../guides/best-practices.md)
- [Complete Examples](../examples/)

---

**Version**: v1.1.0  
**Last Updated**: 2025-10-22  
**Maintainer**: MPLP Team

