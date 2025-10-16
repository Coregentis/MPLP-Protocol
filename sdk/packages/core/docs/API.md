# MPLP SDK Core API Reference

## Overview

The MPLP SDK Core provides the foundational components for building multi-agent protocol lifecycle platforms. This document provides comprehensive API reference for all core modules.

## Table of Contents

- [MPLPApplication](#mplpapplication)
- [ConfigManager](#configmanager)
- [ModuleManager](#modulemanager)
- [HealthChecker](#healthchecker)
- [EventBus](#eventbus)
- [Logger](#logger)

## MPLPApplication

The main application class that orchestrates all core components.

### Constructor

```typescript
constructor(config?: Partial<MPLPApplicationConfig>)
```

**Parameters:**
- `config` (optional): Application configuration object

### Methods

#### `initialize(): Promise<void>`

Initializes the application and all its components.

**Returns:** Promise that resolves when initialization is complete.

#### `start(): Promise<void>`

Starts the application and begins health monitoring.

**Returns:** Promise that resolves when the application is started.

#### `stop(): Promise<void>`

Stops the application and cleans up resources.

**Returns:** Promise that resolves when the application is stopped.

#### `getStatus(): ApplicationStatus`

Gets the current application status.

**Returns:** Current application status object.

### Events

- `initialized` - Emitted when application is initialized
- `started` - Emitted when application is started
- `stopped` - Emitted when application is stopped
- `error` - Emitted when an error occurs

### Example

```typescript
import { MPLPApplication } from '@mplp/sdk-core';

const app = new MPLPApplication({
  name: 'MyApp',
  version: '1.0.0',
  config: {
    database: {
      host: 'localhost',
      port: 5432
    }
  }
});

await app.initialize();
await app.start();

// Application is now running
console.log('Application status:', app.getStatus());

// Stop when done
await app.stop();
```

## ConfigManager

Advanced configuration management with environment variables, templates, and hot reload.

### Constructor

```typescript
constructor(initialConfig?: Record<string, any>, options?: ConfigManagerOptions)
```

**Parameters:**
- `initialConfig` (optional): Initial configuration object
- `options` (optional): Configuration manager options

### Methods

#### `get<T>(path: string, defaultValue?: T): T`

Gets a configuration value using dot notation.

**Parameters:**
- `path`: Dot-separated path to the configuration value
- `defaultValue` (optional): Default value if path doesn't exist

**Returns:** Configuration value or default value.

#### `set(path: string, value: any): void`

Sets a configuration value using dot notation.

**Parameters:**
- `path`: Dot-separated path to set
- `value`: Value to set

#### `has(path: string): boolean`

Checks if a configuration path exists.

**Parameters:**
- `path`: Dot-separated path to check

**Returns:** True if path exists, false otherwise.

#### `validate(): ValidationResult`

Validates the entire configuration against registered rules.

**Returns:** Validation result object.

#### `addValidationRule(path: string, rule: ValidationRule): void`

Adds a validation rule for a configuration path.

**Parameters:**
- `path`: Configuration path to validate
- `rule`: Validation rule function

#### `applyTemplate(template: ConfigTemplate): void`

Applies a configuration template with variable substitution.

**Parameters:**
- `template`: Template object with variables and values

#### `createSnapshot(): ConfigSnapshot`

Creates a snapshot of the current configuration.

**Returns:** Configuration snapshot object.

#### `restoreSnapshot(snapshot: ConfigSnapshot): void`

Restores configuration from a snapshot.

**Parameters:**
- `snapshot`: Previously created snapshot

#### `exportConfig(includeDefaults?: boolean): string`

Exports configuration as JSON string.

**Parameters:**
- `includeDefaults` (optional): Whether to include default values

**Returns:** JSON string representation of configuration.

#### `destroy(): void`

Cleans up resources and stops file watchers.

### Events

- `changed` - Emitted when configuration changes
- `validated` - Emitted after validation
- `templateApplied` - Emitted when template is applied
- `destroyed` - Emitted when manager is destroyed

### Example

```typescript
import { ConfigManager } from '@mplp/sdk-core';

const config = new ConfigManager({
  database: {
    host: '${DB_HOST:localhost}',
    port: 5432
  }
});

// Environment variable substitution
console.log(config.get('database.host')); // Uses DB_HOST env var or 'localhost'

// Validation
config.addValidationRule('database.port', (value) => {
  return typeof value === 'number' && value > 0;
});

const result = config.validate();
if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}

// Templates
config.applyTemplate({
  name: 'production',
  variables: {
    environment: 'prod',
    logLevel: 'error'
  },
  template: {
    app: {
      env: '{{environment}}',
      logging: {
        level: '{{logLevel}}'
      }
    }
  }
});
```

## ModuleManager

Enterprise-grade module management with dependency resolution and lifecycle control.

### Constructor

```typescript
constructor(logger?: Logger)
```

**Parameters:**
- `logger` (optional): Logger instance for module operations

### Methods

#### `registerModule(name: string, module: Module, options?: ModuleOptions): void`

Registers a module with the manager.

**Parameters:**
- `name`: Unique module name
- `module`: Module instance
- `options` (optional): Module registration options

#### `unregisterModule(name: string): void`

Unregisters a module.

**Parameters:**
- `name`: Module name to unregister

#### `startModule(name: string): Promise<void>`

Starts a specific module and its dependencies.

**Parameters:**
- `name`: Module name to start

**Returns:** Promise that resolves when module is started.

#### `stopModule(name: string): Promise<void>`

Stops a specific module and dependents.

**Parameters:**
- `name`: Module name to stop

**Returns:** Promise that resolves when module is stopped.

#### `startAll(): Promise<void>`

Starts all registered modules in dependency order.

**Returns:** Promise that resolves when all modules are started.

#### `stopAll(): Promise<void>`

Stops all modules in reverse dependency order.

**Returns:** Promise that resolves when all modules are stopped.

#### `getModuleStatus(name: string): ModuleStatus`

Gets the status of a specific module.

**Parameters:**
- `name`: Module name

**Returns:** Module status object.

#### `getAllModuleStatuses(): Record<string, ModuleStatus>`

Gets status of all registered modules.

**Returns:** Object mapping module names to their statuses.

#### `getDependencyGraph(): DependencyGraph`

Gets the module dependency graph.

**Returns:** Dependency graph object.

### Events

- `moduleRegistered` - Emitted when a module is registered
- `moduleUnregistered` - Emitted when a module is unregistered
- `moduleStarted` - Emitted when a module starts
- `moduleStopped` - Emitted when a module stops
- `moduleError` - Emitted when a module error occurs

### Example

```typescript
import { ModuleManager, Module } from '@mplp/sdk-core';

class DatabaseModule implements Module {
  async initialize(): Promise<void> {
    // Initialize database connection
  }
  
  async start(): Promise<void> {
    // Start database operations
  }
  
  async stop(): Promise<void> {
    // Close database connection
  }
}

const moduleManager = new ModuleManager();

// Register modules with dependencies
moduleManager.registerModule('database', new DatabaseModule());
moduleManager.registerModule('api', new ApiModule(), {
  metadata: {
    name: 'API Module',
    version: '1.0.0',
    dependencies: ['database']
  }
});

// Start all modules (database will start first due to dependency)
await moduleManager.startAll();

// Check status
const status = moduleManager.getModuleStatus('api');
console.log('API module status:', status);

// Stop all modules
await moduleManager.stopAll();
```

## HealthChecker

Enterprise-grade health monitoring system with custom checks, metrics, and retry mechanisms.

### Constructor

```typescript
constructor(options?: HealthCheckerOptions, logger?: Logger)
```

**Parameters:**
- `options` (optional): Health checker configuration options
- `logger` (optional): Logger instance

### Methods

#### `registerHealthCheck(config: HealthCheckConfig): void`

Registers a custom health check.

**Parameters:**
- `config`: Health check configuration object

#### `unregisterHealthCheck(name: string): void`

Unregisters a health check.

**Parameters:**
- `name`: Health check name to remove

#### `getHealthReport(): Promise<HealthReport>`

Gets a comprehensive health report.

**Returns:** Promise that resolves to health report.

#### `getLastHealthReport(): HealthReport | null`

Gets the last cached health report.

**Returns:** Last health report or null if none available.

#### `getHealthMetrics(): Record<string, HealthMetrics>`

Gets health metrics for all checks.

**Returns:** Object mapping check names to their metrics.

#### `initialize(): Promise<void>`

Initializes the health checker and performs initial checks.

**Returns:** Promise that resolves when initialization is complete.

#### `start(): Promise<void>`

Starts periodic health monitoring.

**Returns:** Promise that resolves when monitoring starts.

#### `stop(): Promise<void>`

Stops health monitoring.

**Returns:** Promise that resolves when monitoring stops.

### Events

- `healthCheckPassed` - Emitted when a health check passes
- `healthCheckFailed` - Emitted when a health check fails
- `criticalHealthCheckFailed` - Emitted when a critical check fails
- `initialized` - Emitted when health checker is initialized

### Example

```typescript
import { HealthChecker } from '@mplp/sdk-core';

const healthChecker = new HealthChecker({
  interval: 30000, // Check every 30 seconds
  timeout: 5000    // 5 second timeout per check
});

// Register custom health check
healthChecker.registerHealthCheck({
  name: 'database-connection',
  checkFunction: async () => {
    const isConnected = await database.ping();
    return {
      healthy: isConnected,
      message: isConnected ? 'Database connected' : 'Database unreachable'
    };
  },
  critical: true,
  retries: 2,
  timeout: 3000
});

// Listen for critical failures
healthChecker.on('criticalHealthCheckFailed', (result) => {
  console.error('Critical health check failed:', result);
  // Implement alerting logic
});

await healthChecker.initialize();
await healthChecker.start();

// Get health report
const report = await healthChecker.getHealthReport();
console.log('Overall health:', report.healthy);
console.log('System info:', report.systemInfo);
```

## EventBus

Advanced event system with filtering, middleware, async processing, and persistence.

### Constructor

```typescript
constructor(options?: EventBusOptions, logger?: Logger)
```

**Parameters:**
- `options` (optional): Event bus configuration options
- `logger` (optional): Logger instance

### Methods

#### `use(middleware: EventMiddleware): void`

Adds middleware to the event processing pipeline.

**Parameters:**
- `middleware`: Middleware function

#### `addFilter(event: string, filter: EventFilter): void`

Adds an event filter.

**Parameters:**
- `event`: Event name to filter
- `filter`: Filter function

#### `removeFilter(event: string, filter: EventFilter): void`

Removes an event filter.

**Parameters:**
- `event`: Event name
- `filter`: Filter function to remove

#### `subscribe(event: string, handler: EventHandler, options?: SubscriptionOptions): () => void`

Subscribes to an event with advanced options.

**Parameters:**
- `event`: Event name
- `handler`: Event handler function
- `options` (optional): Subscription options

**Returns:** Unsubscribe function.

#### `emitAsync(event: string, ...args: any[]): Promise<void>`

Emits an event asynchronously with middleware processing.

**Parameters:**
- `event`: Event name
- `args`: Event arguments

**Returns:** Promise that resolves when event processing is complete.

#### `getEventHistory(): EventMetadata[]`

Gets the event history.

**Returns:** Array of event metadata objects.

#### `getEventStats(): EventStats`

Gets event processing statistics.

**Returns:** Event statistics object.

#### `replayEvents(filter?: (event: EventMetadata) => boolean): Promise<number>`

Replays events from history or persistence.

**Parameters:**
- `filter` (optional): Filter function for events to replay

**Returns:** Promise that resolves to number of replayed events.

#### `setPersistence(persistence: EventPersistence): void`

Sets event persistence provider.

**Parameters:**
- `persistence`: Persistence provider implementation

#### `clearHistory(): void`

Clears the event history.

### Events

All standard EventEmitter events plus:
- `middlewareError` - Emitted when middleware processing fails
- `filterError` - Emitted when event filtering fails

### Example

```typescript
import { EventBus } from '@mplp/sdk-core';

const eventBus = new EventBus({
  enableHistory: true,
  historyLimit: 1000,
  enableRetry: true
});

// Add middleware
eventBus.use(async (event, data, next) => {
  console.log(`Processing event: ${event}`);
  const start = Date.now();
  await next();
  console.log(`Event ${event} processed in ${Date.now() - start}ms`);
});

// Add event filter
eventBus.addFilter('user-action', (event, data) => {
  return data.userId && data.action;
});

// Subscribe with options
const unsubscribe = eventBus.subscribe('user-action', (data) => {
  console.log('User action:', data);
}, {
  filter: (event, data) => data.action === 'login',
  once: false
});

// Emit events
await eventBus.emitAsync('user-action', {
  userId: '123',
  action: 'login',
  timestamp: new Date()
});

// Get statistics
const stats = eventBus.getEventStats();
console.log('Events processed:', stats.processedEvents);
console.log('Average processing time:', stats.averageProcessingTime);
```
