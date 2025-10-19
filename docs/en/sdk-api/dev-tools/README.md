# @mplp/dev-tools API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/dev-tools/README.md)


> **Package**: @mplp/dev-tools  
> **Version**: v1.1.0-beta  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/dev-tools` package provides comprehensive development tools and utilities for MPLP applications, including debugging, monitoring, performance analysis, and logging management. It offers both programmatic APIs and CLI tools for enhanced development experience.

### **📦 Package Relationship**

**Important**: MPLP Dev Tools (`@mplp/dev-tools`) is a **development-only package**. For MPLP applications, you'll need:

1. **MPLP Core Package** (`mplp@beta`): The main package with L1-L3 protocol stack (Required)
2. **MPLP Dev Tools** (`@mplp/dev-tools`): Development and debugging utilities (Optional)

### **🎯 Key Features**

- **🐛 Debugging Tools**: Agent debugger, workflow debugger, protocol inspector, state inspector
- **📊 Performance Analysis**: Metrics collection, performance profiling, benchmarking, bottleneck detection
- **📈 Real-time Monitoring**: System health monitoring, dashboard, alerts, resource tracking
- **📝 Logging Management**: Structured logging, log analysis, log viewer, search capabilities
- **🌐 Web Dashboard**: Real-time web interface for all development tools
- **⚡ CLI Tools**: Command-line interface for debugging, monitoring, and analysis
- **🔧 Integration**: Seamless integration with MPLP applications and CI/CD pipelines

### **📦 Installation**

#### **Step 1: Install MPLP Core Package** ⚡

```bash
# Install MPLP core package (Required)
npm install mplp@beta

# Verify installation
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0-beta
```

#### **Step 2: Install Dev Tools (Optional)**

```bash
# Local installation (recommended)
npm install @mplp/dev-tools

# Global installation for CLI tools
npm install -g @mplp/dev-tools

# Verify dev tools installation
mplp-debug --version
```

### **🏗️ Architecture**

```
┌─────────────────────────────────────────┐
│           @mplp/dev-tools               │
│      (Development Tools Suite)         │
├─────────────────────────────────────────┤
│  DebugManager | PerformanceAnalyzer    │
│  MonitoringDashboard | LogManager      │
├─────────────────────────────────────────┤
│         Specialized Tools               │
│  AgentDebugger | WorkflowDebugger      │
│  ProtocolInspector | StateInspector    │
├─────────────────────────────────────────┤
│         CLI & Web Interface             │
│  mplp-debug | mplp-monitor | Dashboard │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **All-in-One Setup**

```typescript
import { startDevTools } from '@mplp/dev-tools';

// Start all development tools
await startDevTools({
  server: { port: 3002 },
  debug: { enabled: true, logLevel: 'info' },
  performance: { enabled: true, interval: 5000 },
  monitoring: { enabled: true, dashboard: true },
  logging: { enabled: true, structured: true }
});

console.log('🛠️ All development tools started on http://localhost:3002');
```

### **Individual Tool Usage**

```typescript
import { 
  DebugManager, 
  PerformanceAnalyzer, 
  MonitoringDashboard,
  LogManager 
} from '@mplp/dev-tools';

// Debug Manager
const debugManager = new DebugManager({
  enabled: true,
  logLevel: 'info',
  breakpoints: ['agent:created', 'workflow:started']
});
await debugManager.start();

// Performance Analyzer
const perfAnalyzer = new PerformanceAnalyzer();
await perfAnalyzer.start();
perfAnalyzer.recordMetric('response_time', 150);

// Monitoring Dashboard
const monitor = new MonitoringDashboard({
  interval: 5000,
  alerts: true
});
await monitor.start();

// Log Manager
const logManager = new LogManager({
  structured: true,
  level: 'info'
});
await logManager.start();
```

## 📋 **Core Classes**

### **DebugManager**

Central debugging coordinator that manages all debugging activities.

#### **Constructor**

```typescript
constructor(config?: DebugConfig)
```

**Configuration Options:**
```typescript
interface DebugConfig {
  enabled?: boolean;           // Enable debugging (default: true)
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  breakpoints?: string[];      // Initial breakpoints
  watchExpressions?: string[]; // Watch expressions
  sessionTimeout?: number;     // Session timeout in ms
}
```

#### **Core Methods**

##### `start(): Promise<void>`

Starts the debugging session and all sub-debuggers.

```typescript
const debugManager = new DebugManager({
  enabled: true,
  logLevel: 'info'
});

await debugManager.start();
console.log('🐛 Debugging started');
```

##### `stop(): Promise<void>`

Stops the debugging session and cleans up resources.

```typescript
await debugManager.stop();
console.log('🐛 Debugging stopped');
```

##### `createSession(sessionId: string, target: any): DebugSession`

Creates a new debugging session for a specific target.

```typescript
const session = debugManager.createSession('agent-123', myAgent);
console.log(`Debug session created: ${session.id}`);
```

##### `attachToAgent(agentId: string): Promise<void>`

Attaches debugger to a specific agent.

```typescript
await debugManager.attachToAgent('my-agent-id');
console.log('Debugger attached to agent');
```

##### `startWorkflowDebugging(workflowId: string, workflowName: string): Promise<void>`

Starts debugging a specific workflow.

```typescript
await debugManager.startWorkflowDebugging('workflow-123', 'DataProcessing');
console.log('Workflow debugging started');
```

#### **Breakpoint Management**

##### `addBreakpoint(sessionId: string, location: string, condition?: string): void`

Adds a breakpoint to a debugging session.

```typescript
debugManager.addBreakpoint('session-1', 'agent:message:received', 'message.type === "urgent"');
```

##### `removeBreakpoint(sessionId: string, breakpointId: string): void`

Removes a specific breakpoint.

```typescript
debugManager.removeBreakpoint('session-1', 'bp_1234567890');
```

#### **Events**

```typescript
debugManager.on('started', () => {
  console.log('Debug manager started');
});

debugManager.on('sessionCreated', (session) => {
  console.log(`New debug session: ${session.id}`);
});

debugManager.on('breakpointHit', (event) => {
  console.log(`Breakpoint hit: ${event.location}`);
});

debugManager.on('error', (error) => {
  console.error('Debug error:', error);
});
```

### **PerformanceAnalyzer**

Comprehensive performance monitoring and analysis tool.

#### **Constructor**

```typescript
constructor(config?: PerformanceConfig)
```

#### **Core Methods**

##### `start(): Promise<void>`

Starts performance monitoring.

```typescript
const perfAnalyzer = new PerformanceAnalyzer({
  interval: 1000,
  metrics: ['cpu', 'memory', 'response_time']
});

await perfAnalyzer.start();
```

##### `recordMetric(name: string, value: number, tags?: Record<string, string>): void`

Records a performance metric.

```typescript
perfAnalyzer.recordMetric('api_response_time', 245, {
  endpoint: '/api/agents',
  method: 'GET'
});
```

##### `getMetrics(name?: string): PerformanceMetric[]`

Retrieves performance metrics.

```typescript
// Get all metrics
const allMetrics = perfAnalyzer.getMetrics();

// Get specific metric
const responseTimeMetrics = perfAnalyzer.getMetrics('api_response_time');
```

##### `generateReport(): PerformanceReport`

Generates a comprehensive performance report.

```typescript
const report = perfAnalyzer.generateReport();
console.log(`Overall score: ${report.overallScore}`);
console.log(`Bottlenecks: ${report.bottlenecks.length}`);
```

#### **Profiling Methods**

##### `startProfiling(name: string): string`

Starts a performance profiling session.

```typescript
const profileId = perfAnalyzer.startProfiling('workflow_execution');
// ... execute workflow
const duration = perfAnalyzer.endProfiling(profileId);
console.log(`Workflow took ${duration}ms`);
```

##### `benchmark(name: string, fn: () => Promise<any>, iterations?: number): Promise<BenchmarkResult>`

Runs a benchmark test.

```typescript
const result = await perfAnalyzer.benchmark('agent_creation', async () => {
  return new MyAgent();
}, 100);

console.log(`Average time: ${result.averageTime}ms`);
console.log(`Min/Max: ${result.minTime}ms / ${result.maxTime}ms`);
```

### **MonitoringDashboard**

Real-time system monitoring and alerting.

#### **Constructor**

```typescript
constructor(config?: MonitoringConfig)
```

#### **Core Methods**

##### `start(): Promise<void>`

Starts the monitoring dashboard.

```typescript
const monitor = new MonitoringDashboard({
  interval: 5000,
  alerts: {
    enabled: true,
    thresholds: {
      cpu: 80,
      memory: 90,
      responseTime: 1000
    }
  }
});

await monitor.start();
```

##### `addAlert(name: string, condition: AlertCondition): void`

Adds a custom alert condition.

```typescript
monitor.addAlert('high_error_rate', {
  metric: 'error_rate',
  threshold: 5,
  operator: '>',
  duration: 60000 // 1 minute
});
```

##### `getSystemHealth(): SystemHealthStatus`

Gets current system health status.

```typescript
const health = monitor.getSystemHealth();
console.log(`System status: ${health.status}`);
console.log(`CPU: ${health.cpu}%, Memory: ${health.memory}%`);
```

### **LogManager**

Advanced logging management with structured logging and analysis.

#### **Constructor**

```typescript
constructor(config?: LogConfig)
```

#### **Core Methods**

##### `start(): Promise<void>`

Starts the log manager.

```typescript
const logManager = new LogManager({
  structured: true,
  level: 'info',
  outputs: ['console', 'file'],
  rotation: {
    enabled: true,
    maxSize: '10MB',
    maxFiles: 5
  }
});

await logManager.start();
```

##### Logging Methods

```typescript
// Different log levels
logManager.debug('Debug message', 'module-name', { userId: '123' });
logManager.info('Info message', 'module-name', { action: 'user_login' });
logManager.warn('Warning message', 'module-name', { warning: 'deprecated_api' });
logManager.error('Error message', 'module-name', { error: 'connection_failed' }, error);
```

##### `searchEntries(query: string, filter?: LogFilter): LogEntry[]`

Searches log entries with advanced filtering.

```typescript
const results = logManager.searchEntries('error', {
  level: 'error',
  timeRange: {
    start: new Date(Date.now() - 3600000), // Last hour
    end: new Date()
  },
  source: 'agent-manager'
});
```

##### `getStatistics(): LogStatistics`

Gets logging statistics and analytics.

```typescript
const stats = logManager.getStatistics();
console.log(`Total entries: ${stats.totalEntries}`);
console.log(`Error rate: ${stats.errorRate}%`);
```

## ⚡ **CLI Tools**

### **Global Commands**

```bash
# Install CLI tools globally
npm install -g @mplp/dev-tools

# Start all development tools
mplp-dev-tools start-all --port 3002

# Check status of all tools
mplp-dev-tools status

# Stop all tools
mplp-dev-tools stop-all
```

### **Debug CLI (mplp-debug)**

```bash
# Start debugging
mplp-debug --start

# Connect to application
mplp-debug connect localhost:3000

# Set breakpoints
mplp-debug breakpoint add "agent:created"
mplp-debug breakpoint add "workflow:started" --condition "workflow.priority > 5"

# Inspect objects
mplp-debug inspect agent <agentId>
mplp-debug inspect workflow <workflowId>
mplp-debug inspect context <contextId>

# View debug sessions
mplp-debug sessions list
mplp-debug sessions attach <sessionId>
```

### **Performance CLI (mplp-analyze)**

```bash
# Start performance analysis
mplp-analyze --start

# Record custom metrics
mplp-analyze metric record "custom_metric" 123.45

# Generate performance report
mplp-analyze report --format json --output performance-report.json

# Run benchmarks
mplp-analyze benchmark --name "agent_creation" --iterations 100

# Profile application
mplp-analyze profile start --name "workflow_execution"
mplp-analyze profile stop --name "workflow_execution"
```

### **Monitoring CLI (mplp-monitor)**

```bash
# Start monitoring
mplp-monitor --start

# View system health
mplp-monitor health

# Set up alerts
mplp-monitor alert add --name "high_cpu" --metric "cpu" --threshold 80

# View dashboard
mplp-monitor dashboard --open

# Export metrics
mplp-monitor export --format prometheus --output metrics.txt
```

## 🎯 **Advanced Usage Examples**

### **Complete Development Setup**

```typescript
import { 
  startDevTools, 
  DebugManager, 
  PerformanceAnalyzer, 
  MonitoringDashboard 
} from '@mplp/dev-tools';
import { MPLPApplication } from '@mplp/sdk-core';

// Create MPLP application
const app = new MPLPApplication({
  name: 'my-enterprise-app',
  version: '1.0.0'
});

// Start comprehensive development tools
await startDevTools({
  server: { 
    port: 3002,
    cors: true,
    authentication: false // Enable for production
  },
  debug: { 
    enabled: true,
    logLevel: 'info',
    breakpoints: ['agent:error', 'workflow:timeout']
  },
  performance: { 
    enabled: true,
    interval: 1000,
    metrics: ['cpu', 'memory', 'response_time', 'throughput']
  },
  monitoring: { 
    enabled: true,
    dashboard: true,
    alerts: {
      cpu: 80,
      memory: 90,
      errorRate: 5
    }
  }
});

// Integrate with application events
app.on('agentCreated', (agent) => {
  console.log(`🤖 Agent created: ${agent.id}`);
});

app.on('workflowStarted', (workflow) => {
  console.log(`🔄 Workflow started: ${workflow.id}`);
});

console.log('🛠️ Development environment ready at http://localhost:3002');
```

### **CI/CD Integration**

```yaml
# .github/workflows/performance-analysis.yml
name: Performance Analysis

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm install
          npm install -g @mplp/dev-tools
          
      - name: Run performance analysis
        run: |
          mplp-analyze --start
          npm test
          mplp-analyze report --format json --output performance-report.json
          mplp-analyze --stop
          
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.json
```

### **Production Monitoring Setup**

```typescript
import { MonitoringDashboard, LogManager } from '@mplp/dev-tools';

// Production monitoring configuration
const monitor = new MonitoringDashboard({
  interval: 30000, // 30 seconds
  alerts: {
    enabled: true,
    thresholds: {
      cpu: 70,
      memory: 85,
      responseTime: 2000,
      errorRate: 1
    },
    notifications: {
      email: ['ops@company.com'],
      slack: '#alerts',
      webhook: 'https://hooks.company.com/alerts'
    }
  },
  retention: {
    metrics: '7d',
    logs: '30d'
  }
});

// Production logging
const logManager = new LogManager({
  structured: true,
  level: 'warn', // Only warnings and errors in production
  outputs: ['file', 'elasticsearch'],
  elasticsearch: {
    host: 'elasticsearch.company.com',
    index: 'mplp-logs'
  },
  rotation: {
    enabled: true,
    maxSize: '100MB',
    maxFiles: 10
  }
});

await Promise.all([
  monitor.start(),
  logManager.start()
]);

console.log('📊 Production monitoring active');
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle management
- [Agent Builder API](../agent-builder/README.md) - Building and managing intelligent agents
- [Orchestrator API](../orchestrator/README.md) - Multi-agent workflow orchestration
- [CLI Tools](../cli/README.md) - Development and deployment utilities

---

**Package Maintainer**: MPLP Dev Tools Team  
**Last Review**: 2025-09-20  
**Node.js Requirement**: >=18.0.0  
**Status**: ✅ Production Ready
