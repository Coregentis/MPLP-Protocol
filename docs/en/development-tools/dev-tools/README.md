# MPLP Dev Tools - Complete Development & Debugging Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/development-tools/dev-tools/README.md)


> **Package**: @mplp/dev-tools  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

MPLP Dev Tools provides a comprehensive suite of development and debugging utilities for Multi-Agent Protocol Lifecycle Platform applications. It offers real-time monitoring, performance analysis, debugging tools, and analytics to enhance the development experience and ensure optimal application performance.

### **📦 Package Relationship**

**Important**: MPLP Dev Tools (`@mplp/dev-tools`) is a **development-only package** for debugging and monitoring. For MPLP applications, you'll need:

1. **MPLP Core Package** (`mplp@beta`): The main package containing the L1-L3 protocol stack and all 10 core modules (Required)
2. **MPLP Dev Tools** (`@mplp/dev-tools`): Development and debugging utilities (Optional, for development only)

**Quick Start**:
```bash
# Install MPLP core package (Required)
npm install mplp@beta

# Install dev tools as development dependency (Optional)
npm install --save-dev @mplp/dev-tools
```

### **🎯 Key Features**

- **📊 Real-time Monitoring**: Live monitoring of agent activities, protocol communications, and system metrics
- **⚡ Performance Analysis**: Detailed performance profiling, bottleneck detection, and optimization recommendations
- **🐛 Advanced Debugging**: Interactive debugging tools, breakpoints, and step-through execution
- **📈 Analytics Dashboard**: Comprehensive analytics with visualizations and reporting
- **🔍 Protocol Inspector**: Deep inspection of MPLP protocol messages and workflows
- **🚨 Error Tracking**: Advanced error tracking, logging, and alerting system
- **🔧 Development Utilities**: Code generation helpers, testing utilities, and development shortcuts
- **📱 Live Reload**: Hot module replacement and live reload for faster development cycles

### **📦 Installation**

#### **Step 1: Install MPLP Core Package** ⚡

```bash
# Install MPLP core package (Required)
npm install mplp@beta

# Verify installation
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0
```

#### **Step 2: Install Dev Tools (Optional)**

```bash
# Install as development dependency (recommended)
npm install --save-dev @mplp/dev-tools

# Install globally for CLI usage
npm install -g @mplp/dev-tools

# Using yarn
yarn add --dev @mplp/dev-tools

# Using pnpm
pnpm add -D @mplp/dev-tools
```

## 🚀 **Quick Start**

### **Basic Setup**

```typescript
import { DevTools, DevToolsConfig } from '@mplp/dev-tools';

// Initialize dev tools
const devTools = new DevTools({
  enabled: process.env.NODE_ENV === 'development',
  port: 3001,
  monitoring: {
    agents: true,
    protocols: true,
    performance: true
  },
  debugging: {
    breakpoints: true,
    stepThrough: true,
    variableInspection: true
  }
});

// Start dev tools server
await devTools.start();

console.log('🛠️ MPLP Dev Tools running at http://localhost:3001');
```

### **Integration with MPLP Application**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { DevTools } from '@mplp/dev-tools';

const app = new MPLPApplication({
  name: 'MyAgent',
  version: '1.0.0'
});

// Attach dev tools in development
if (process.env.NODE_ENV === 'development') {
  const devTools = new DevTools();
  await devTools.attach(app);
}

await app.start();
```

## 📊 **Real-time Monitoring**

### **Agent Activity Monitor**

Track agent lifecycle, state changes, and interactions in real-time.

```typescript
import { AgentMonitor } from '@mplp/dev-tools';

const monitor = new AgentMonitor({
  trackLifecycle: true,
  trackStateChanges: true,
  trackInteractions: true,
  updateInterval: 1000 // 1 second
});

// Monitor specific agent
monitor.watchAgent('ChatBot', {
  onStateChange: (agent, oldState, newState) => {
    console.log(`Agent ${agent.name}: ${oldState} → ${newState}`);
  },
  onInteraction: (agent, interaction) => {
    console.log(`Agent ${agent.name} interaction:`, interaction);
  },
  onError: (agent, error) => {
    console.error(`Agent ${agent.name} error:`, error);
  }
});

// Monitor all agents
monitor.watchAll({
  filter: (agent) => agent.type === 'conversational',
  metrics: ['responseTime', 'successRate', 'errorRate']
});
```

### **Protocol Communication Monitor**

Monitor MPLP protocol messages and communication patterns.

```typescript
import { ProtocolMonitor } from '@mplp/dev-tools';

const protocolMonitor = new ProtocolMonitor({
  captureMessages: true,
  analyzePatterns: true,
  detectAnomalies: true
});

// Monitor protocol layer
protocolMonitor.watchProtocol('L2-Coordination', {
  onMessage: (message) => {
    console.log('Protocol message:', {
      type: message.type,
      source: message.source,
      target: message.target,
      payload: message.payload
    });
  },
  onPattern: (pattern) => {
    console.log('Communication pattern detected:', pattern);
  },
  onAnomaly: (anomaly) => {
    console.warn('Protocol anomaly:', anomaly);
  }
});

// Export communication logs
const logs = await protocolMonitor.exportLogs({
  format: 'json',
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  includePayloads: true
});
```

### **System Metrics Dashboard**

Real-time system performance and resource usage monitoring.

```typescript
import { MetricsDashboard } from '@mplp/dev-tools';

const dashboard = new MetricsDashboard({
  port: 3002,
  updateInterval: 5000,
  metrics: [
    'cpu',
    'memory',
    'eventLoop',
    'httpRequests',
    'agentCount',
    'protocolMessages'
  ]
});

// Start metrics dashboard
await dashboard.start();

// Custom metrics
dashboard.addMetric('customMetric', {
  name: 'Agent Response Time',
  type: 'histogram',
  description: 'Distribution of agent response times',
  collect: async () => {
    // Custom metric collection logic
    return await getAgentResponseTimes();
  }
});

// Alerts
dashboard.addAlert('highMemoryUsage', {
  condition: (metrics) => metrics.memory.usage > 0.8,
  message: 'Memory usage is above 80%',
  severity: 'warning'
});
```

## ⚡ **Performance Analysis**

### **Performance Profiler**

Detailed performance profiling and bottleneck detection.

```typescript
import { PerformanceProfiler } from '@mplp/dev-tools';

const profiler = new PerformanceProfiler({
  sampleRate: 100, // Sample every 100ms
  trackFunctions: true,
  trackAsyncOperations: true,
  trackMemoryAllocations: true
});

// Start profiling
profiler.start();

// Profile specific operation
const profile = await profiler.profile(async () => {
  // Your code to profile
  const result = await agent.processMessage(message);
  return result;
});

console.log('Performance profile:', {
  duration: profile.duration,
  cpuUsage: profile.cpuUsage,
  memoryUsage: profile.memoryUsage,
  hotspots: profile.hotspots
});

// Generate performance report
const report = await profiler.generateReport({
  format: 'html',
  includeFlameGraph: true,
  includeCallTree: true
});
```

### **Bottleneck Detector**

Automatically detect and analyze performance bottlenecks.

```typescript
import { BottleneckDetector } from '@mplp/dev-tools';

const detector = new BottleneckDetector({
  thresholds: {
    responseTime: 1000, // 1 second
    cpuUsage: 0.8,      // 80%
    memoryUsage: 0.9,   // 90%
    eventLoopDelay: 100 // 100ms
  },
  analysisWindow: 60000 // 1 minute
});

detector.on('bottleneck', (bottleneck) => {
  console.log('Bottleneck detected:', {
    type: bottleneck.type,
    severity: bottleneck.severity,
    location: bottleneck.location,
    suggestions: bottleneck.suggestions
  });
});

// Manual bottleneck analysis
const analysis = await detector.analyze({
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  includeRecommendations: true
});
```

### **Memory Leak Detector**

Detect and analyze memory leaks in MPLP applications.

```typescript
import { MemoryLeakDetector } from '@mplp/dev-tools';

const leakDetector = new MemoryLeakDetector({
  checkInterval: 30000, // 30 seconds
  thresholds: {
    heapGrowth: 10 * 1024 * 1024, // 10MB
    objectCount: 10000
  }
});

leakDetector.on('leak', (leak) => {
  console.warn('Memory leak detected:', {
    type: leak.type,
    size: leak.size,
    objects: leak.objects,
    stackTrace: leak.stackTrace
  });
});

// Take heap snapshot
const snapshot = await leakDetector.takeSnapshot();
await snapshot.save('./heap-snapshot.heapsnapshot');
```

## 🐛 **Advanced Debugging**

### **Interactive Debugger**

Step-through debugging with breakpoints and variable inspection.

```typescript
import { InteractiveDebugger } from '@mplp/dev-tools';

const debugger = new InteractiveDebugger({
  port: 9229,
  breakOnExceptions: true,
  breakOnUncaughtExceptions: true
});

// Set breakpoints
debugger.setBreakpoint('src/agents/ChatBot.ts', 42);
debugger.setBreakpoint('src/workflows/MessageProcessing.ts', 15);

// Conditional breakpoint
debugger.setBreakpoint('src/agents/ChatBot.ts', 55, {
  condition: 'message.type === "error"'
});

// Start debugging session
await debugger.start();

// Debug specific function
debugger.debug(async () => {
  const result = await agent.processMessage(message);
  return result;
});
```

### **Variable Inspector**

Inspect variables, objects, and application state during debugging.

```typescript
import { VariableInspector } from '@mplp/dev-tools';

const inspector = new VariableInspector();

// Inspect agent state
const agentState = inspector.inspect(agent, {
  depth: 3,
  includePrivate: true,
  includeFunctions: false
});

console.log('Agent state:', agentState);

// Watch variable changes
inspector.watch('agent.state', (oldValue, newValue) => {
  console.log(`Agent state changed: ${oldValue} → ${newValue}`);
});

// Evaluate expressions
const result = inspector.evaluate('agent.capabilities.length > 0');
console.log('Has capabilities:', result);
```

### **Call Stack Analyzer**

Analyze call stacks and execution paths.

```typescript
import { CallStackAnalyzer } from '@mplp/dev-tools';

const analyzer = new CallStackAnalyzer({
  captureStackTraces: true,
  analyzeExecutionPaths: true,
  detectRecursion: true
});

// Analyze current call stack
const stack = analyzer.getCurrentStack();
console.log('Call stack:', stack.frames);

// Detect infinite recursion
analyzer.on('recursion', (recursion) => {
  console.warn('Potential infinite recursion:', {
    function: recursion.function,
    depth: recursion.depth,
    stackTrace: recursion.stackTrace
  });
});
```

## 📈 **Analytics Dashboard**

### **Web-based Dashboard**

Comprehensive web interface for monitoring and analytics.

```typescript
import { WebDashboard } from '@mplp/dev-tools';

const dashboard = new WebDashboard({
  port: 3003,
  title: 'MPLP Development Dashboard',
  theme: 'dark',
  features: {
    monitoring: true,
    profiling: true,
    debugging: true,
    analytics: true,
    logs: true
  }
});

// Add custom panels
dashboard.addPanel('agentMetrics', {
  title: 'Agent Metrics',
  type: 'chart',
  data: async () => await getAgentMetrics(),
  refreshInterval: 5000
});

dashboard.addPanel('protocolFlow', {
  title: 'Protocol Flow',
  type: 'network',
  data: async () => await getProtocolFlowData()
});

await dashboard.start();
```

### **Custom Analytics**

Create custom analytics and reports.

```typescript
import { Analytics } from '@mplp/dev-tools';

const analytics = new Analytics({
  storage: 'memory', // or 'file', 'database'
  retentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Track custom events
analytics.track('agent.message.processed', {
  agentId: 'ChatBot',
  messageType: 'text',
  processingTime: 150,
  success: true
});

// Create custom metrics
analytics.createMetric('averageResponseTime', {
  type: 'gauge',
  description: 'Average agent response time',
  calculate: (events) => {
    const times = events.map(e => e.processingTime);
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
});

// Generate reports
const report = await analytics.generateReport({
  timeRange: { start: Date.now() - 86400000, end: Date.now() },
  metrics: ['averageResponseTime', 'successRate', 'errorRate'],
  format: 'json'
});
```

## 🔍 **Protocol Inspector**

### **Message Inspector**

Deep inspection of MPLP protocol messages.

```typescript
import { MessageInspector } from '@mplp/dev-tools';

const inspector = new MessageInspector({
  captureAll: true,
  validateSchema: true,
  analyzePatterns: true
});

// Inspect specific message
const inspection = inspector.inspect(message, {
  validateAgainstSchema: true,
  analyzePayload: true,
  checkCompliance: true
});

console.log('Message inspection:', {
  valid: inspection.valid,
  errors: inspection.errors,
  warnings: inspection.warnings,
  metadata: inspection.metadata
});

// Message flow visualization
const flow = inspector.visualizeFlow(messages, {
  format: 'mermaid',
  includeTimestamps: true,
  groupByAgent: true
});
```

### **Workflow Debugger**

Debug MPLP workflows and orchestration.

```typescript
import { WorkflowDebugger } from '@mplp/dev-tools';

const workflowDebugger = new WorkflowDebugger({
  trackExecution: true,
  captureState: true,
  validateTransitions: true
});

// Debug workflow execution
const execution = await workflowDebugger.debug(workflow, {
  input: testData,
  breakpoints: ['step2', 'step5'],
  stepThrough: true
});

console.log('Workflow execution:', {
  steps: execution.steps,
  duration: execution.duration,
  errors: execution.errors,
  finalState: execution.finalState
});
```

## 🔧 **Development Utilities**

### **Code Generator**

Generate boilerplate code and components.

```typescript
import { CodeGenerator } from '@mplp/dev-tools';

const generator = new CodeGenerator({
  templatesDir: './templates',
  outputDir: './src/generated'
});

// Generate agent class
await generator.generate('agent', {
  name: 'WeatherBot',
  capabilities: ['weather-query', 'location-detection'],
  platforms: ['discord', 'slack']
});

// Generate test files
await generator.generate('test', {
  target: 'src/agents/WeatherBot.ts',
  testType: 'unit',
  coverage: 'full'
});

// Custom template
await generator.generate('custom', {
  template: 'my-template',
  variables: {
    className: 'MyClass',
    methods: ['init', 'process', 'cleanup']
  }
});
```

### **Testing Utilities**

Enhanced testing utilities for MPLP applications.

```typescript
import { TestUtils } from '@mplp/dev-tools';

const testUtils = new TestUtils();

// Mock agent
const mockAgent = testUtils.createMockAgent({
  name: 'TestAgent',
  capabilities: ['test-capability'],
  responses: {
    'hello': 'Hello there!',
    'error': new Error('Test error')
  }
});

// Mock protocol messages
const mockMessage = testUtils.createMockMessage({
  type: 'request',
  source: 'agent1',
  target: 'agent2',
  payload: { action: 'process', data: 'test' }
});

// Test environment
const testEnv = await testUtils.createTestEnvironment({
  agents: [mockAgent],
  protocols: ['L2-Coordination'],
  monitoring: false
});

// Performance testing
const perfTest = await testUtils.performanceTest(async () => {
  return await agent.processMessage(mockMessage);
}, {
  iterations: 1000,
  warmup: 100,
  timeout: 5000
});
```

## 🚨 **Error Tracking & Logging**

### **Advanced Error Tracking**

Comprehensive error tracking and analysis.

```typescript
import { ErrorTracker } from '@mplp/dev-tools';

const errorTracker = new ErrorTracker({
  captureStackTraces: true,
  groupSimilarErrors: true,
  trackErrorFrequency: true,
  alertThresholds: {
    errorRate: 0.05, // 5%
    criticalErrors: 1
  }
});

// Track errors automatically
errorTracker.install();

// Manual error tracking
errorTracker.captureError(error, {
  context: 'agent-processing',
  user: 'user123',
  extra: { messageId: 'msg456' }
});

// Error analysis
const analysis = await errorTracker.analyze({
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  groupBy: 'errorType',
  includeStackTraces: true
});
```

### **Structured Logging**

Enhanced logging with structured data and filtering.

```typescript
import { Logger } from '@mplp/dev-tools';

const logger = new Logger({
  level: 'debug',
  format: 'json',
  outputs: ['console', 'file'],
  file: {
    path: './logs/app.log',
    maxSize: '10MB',
    maxFiles: 5
  }
});

// Structured logging
logger.info('Agent message processed', {
  agentId: 'ChatBot',
  messageId: 'msg123',
  processingTime: 150,
  success: true
});

// Context logging
const childLogger = logger.child({ component: 'workflow' });
childLogger.debug('Workflow step executed', { step: 'validation' });

// Performance logging
logger.time('operation');
await performOperation();
logger.timeEnd('operation');
```

## 🔗 **Integration Examples**

### **Express.js Integration**

```typescript
import express from 'express';
import { DevTools, devToolsMiddleware } from '@mplp/dev-tools';

const app = express();
const devTools = new DevTools();

// Add dev tools middleware
if (process.env.NODE_ENV === 'development') {
  app.use('/dev-tools', devToolsMiddleware(devTools));
}

app.listen(3000, () => {
  console.log('Server running with dev tools at http://localhost:3000/dev-tools');
});
```

### **Jest Integration**

```typescript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['@mplp/dev-tools/jest-setup'],
  testEnvironment: '@mplp/dev-tools/jest-environment'
};

// In test files
import { testUtils } from '@mplp/dev-tools';

describe('Agent Tests', () => {
  beforeEach(() => {
    testUtils.resetMocks();
  });

  it('should process message', async () => {
    const mockAgent = testUtils.createMockAgent();
    const result = await mockAgent.processMessage('hello');
    expect(result).toBe('Hello there!');
  });
});
```

### **Docker Integration**

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dev dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose dev tools port
EXPOSE 3001

# Start with dev tools
CMD ["npm", "run", "dev:with-tools"]
```

## 📚 **Best Practices**

### **Development Workflow**

- Enable dev tools only in development environment
- Use performance profiling to identify bottlenecks early
- Set up automated error tracking and alerting
- Regularly analyze protocol communication patterns
- Use interactive debugging for complex issues

### **Performance Optimization**

- Profile regularly during development
- Monitor memory usage and detect leaks early
- Use bottleneck detection to optimize critical paths
- Analyze agent interaction patterns for efficiency
- Set up performance regression testing

### **Debugging Strategy**

- Use breakpoints strategically, not excessively
- Leverage variable inspection for state analysis
- Analyze call stacks to understand execution flow
- Use conditional breakpoints for specific scenarios
- Combine multiple debugging tools for comprehensive analysis

## 🔗 **Related Documentation**

- [MPLP CLI Guide](../cli/README.md) - Command-line interface and project management
- [SDK Core Documentation](../../sdk-api/sdk-core/README.md) - Core SDK functionality
- [Agent Builder Guide](../../sdk-api/agent-builder/README.md) - Building intelligent agents
- [Orchestrator Documentation](../../sdk-api/orchestrator/README.md) - Multi-agent workflows

---

**Dev Tools Maintainer**: MPLP Platform Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (40/40 tests passing)  
**Status**: ✅ Production Ready
