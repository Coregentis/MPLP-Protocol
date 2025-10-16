# @mplp/dev-tools

Development tools and utilities for MPLP applications - debugging, monitoring, and performance analysis.

## 🚀 Features

- **🐛 Debugging Tools**: Agent debugger, workflow debugger, protocol inspector, state inspector
- **📊 Performance Analysis**: Metrics collection, performance profiling, benchmarking
- **📈 Real-time Monitoring**: System health monitoring, dashboard, alerts
- **📝 Logging Management**: Structured logging, log analysis, log viewer
- **🌐 Web Dashboard**: Real-time web interface for all tools
- **⚡ CLI Tools**: Command-line interface for all development tools

## 📦 Installation

```bash
npm install @mplp/dev-tools
```

## 🎯 Quick Start

### Programmatic Usage

```typescript
import { startDevTools } from '@mplp/dev-tools';

// Start all development tools
await startDevTools({
  server: { port: 3002 },
  debug: { enabled: true },
  performance: { enabled: true },
  monitoring: { enabled: true }
});
```

### Individual Components

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
  logLevel: 'info'
});
await debugManager.start();

// Performance Analyzer
const perfAnalyzer = new PerformanceAnalyzer();
await perfAnalyzer.start();
perfAnalyzer.recordMetric('response_time', 150);

// Monitoring Dashboard
const monitor = new MonitoringDashboard({
  interval: 5000
});
await monitor.start();

// Log Manager
const logManager = new LogManager({
  level: 'info',
  outputs: [{ type: 'console', enabled: true, config: {} }],
  formatters: []
});
await logManager.start();
logManager.info('Application started', 'main');
```

## 🖥️ CLI Usage

### Global Commands

```bash
# Install globally
npm install -g @mplp/dev-tools

# Start all tools
mplp-dev-tools start-all --port 3002

# Check status
mplp-dev-tools status

# Stop all tools
mplp-dev-tools stop-all
```

### Individual Tool Commands

```bash
# Debug tools
mplp-debug --start
mplp-debug --status
mplp-debug --stop

# Performance analysis
mplp-analyze --start
mplp-analyze --metrics
mplp-analyze --stop

# Monitoring
mplp-monitor --start
mplp-monitor --dashboard
mplp-monitor --stop
```

### Server Management

```bash
# Start development server
mplp-dev-tools server --start --port 3002

# Check server status
mplp-dev-tools server --status

# Stop server
mplp-dev-tools server --stop
```

## 🌐 Web Dashboard

Access the web dashboard at `http://localhost:3002` (or your configured port) to:

- View real-time system metrics
- Monitor application performance
- Debug agents and workflows
- Analyze logs and events
- Configure alerts and notifications

## 🔧 Configuration

### Complete Configuration Example

```typescript
import { DevToolsConfig } from '@mplp/dev-tools';

const config: DevToolsConfig = {
  server: {
    port: 3002,
    host: 'localhost',
    cors: true
  },
  debug: {
    enabled: true,
    logLevel: 'info',
    breakpoints: [],
    watchExpressions: []
  },
  performance: {
    enabled: true,
    sampleInterval: 1000,
    maxSamples: 10000,
    enableSystemMetrics: true
  },
  monitoring: {
    enabled: true,
    interval: 5000,
    alerts: [
      {
        name: 'High CPU Usage',
        condition: 'cpu > 80',
        threshold: 80,
        severity: 'high',
        enabled: true
      }
    ]
  },
  logging: {
    level: 'info',
    outputs: [
      {
        type: 'console',
        enabled: true,
        config: {}
      },
      {
        type: 'file',
        enabled: true,
        config: {
          filename: 'app.log',
          maxSize: '10MB',
          maxFiles: 5
        }
      }
    ],
    formatters: [
      {
        name: 'json',
        type: 'json',
        config: {}
      }
    ]
  }
};
```

## 📊 API Reference

### DebugManager

```typescript
const debugManager = new DebugManager(config);

// Lifecycle
await debugManager.start();
await debugManager.stop();

// Session management
const session = debugManager.createSession('session-id', target);
debugManager.endSession('session-id');

// Breakpoints
debugManager.addBreakpoint('session-id', 'file.ts:10', 'condition');
debugManager.removeBreakpoint('session-id', 'breakpoint-id');

// Watch expressions
debugManager.addWatchExpression('session-id', 'variable.value');

// Statistics
const stats = debugManager.getStatistics();
```

### PerformanceAnalyzer

```typescript
const analyzer = new PerformanceAnalyzer();

// Lifecycle
await analyzer.start();
await analyzer.stop();

// Metrics
analyzer.recordMetric('metric-name', value);
const stats = analyzer.getMetricStats('metric-name');
const summary = analyzer.getPerformanceSummary();

// Clear data
analyzer.clearMetrics();
```

### MonitoringDashboard

```typescript
const dashboard = new MonitoringDashboard(config);

// Lifecycle
await dashboard.start();
await dashboard.stop();

// Dashboard data
const data = dashboard.getDashboardData();
dashboard.updatePanel('panel-id', data);
dashboard.addPanel('panel-id', 'metric', data);

// Health monitoring
const health = dashboard.getSystemHealth();
```

### LogManager

```typescript
const logManager = new LogManager(config);

// Lifecycle
await logManager.start();
await logManager.stop();

// Logging
logManager.debug('Debug message', 'source');
logManager.info('Info message', 'source');
logManager.warn('Warning message', 'source');
logManager.error('Error message', 'source', metadata, error);

// Retrieval
const entries = logManager.getAllEntries();
const filtered = logManager.getFilteredEntries(filter);
const results = logManager.searchEntries('query', filter);

// Statistics
const stats = logManager.getStatistics();
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔗 Integration

### With MPLP Applications

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { DebugManager, PerformanceAnalyzer } from '@mplp/dev-tools';

const app = new MPLPApplication({
  name: 'my-app',
  version: '1.0.0'
});

// Integrate debugging
const debugManager = new DebugManager();
await debugManager.start();

// Integrate performance monitoring
const perfAnalyzer = new PerformanceAnalyzer();
await perfAnalyzer.start();

// Monitor application events
app.on('agentCreated', (agent) => {
  debugManager.attachToAgent(agent.id);
});

app.on('workflowStarted', (workflow) => {
  debugManager.startWorkflowDebugging(workflow.id, workflow.name);
});
```

### With CI/CD Pipelines

```yaml
# .github/workflows/test.yml
- name: Run MPLP Dev Tools Analysis
  run: |
    npm install @mplp/dev-tools
    mplp-analyze --start
    npm test
    mplp-analyze --metrics > performance-report.json
    mplp-analyze --stop
```

## 📚 Examples

See the [examples directory](../../examples/) for complete usage examples:

- [Basic debugging setup](../../examples/dev-tools-basic/)
- [Performance monitoring](../../examples/dev-tools-performance/)
- [Custom dashboard](../../examples/dev-tools-dashboard/)

## 🤝 Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.mplp.dev/dev-tools)
- 🐛 [Issue Tracker](https://github.com/mplp/sdk/issues)
- 💬 [Discussions](https://github.com/mplp/sdk/discussions)
- 📧 [Email Support](mailto:support@mplp.dev)
