# Trace Module

## 📋 Overview

The Trace Module provides comprehensive monitoring, event tracking, and observability capabilities within the MPLP ecosystem. It implements real-time tracing, metrics collection, and performance monitoring with DDD architecture for complete system visibility.

## 🏗️ Architecture

### DDD Layer Structure

```
src/modules/trace/
├── api/                    # API Layer
│   ├── controllers/        # REST controllers
│   │   └── trace.controller.ts
│   └── dto/               # Data transfer objects
├── application/           # Application Layer
│   ├── services/          # Application services
│   │   └── trace-management.service.ts
│   ├── commands/          # Command handlers
│   │   └── create-trace.command.ts
│   └── queries/           # Query handlers
│       └── get-trace-by-id.query.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain entities
│   │   ├── trace.entity.ts
│   │   └── event.entity.ts
│   ├── repositories/      # Repository interfaces
│   │   └── trace-repository.interface.ts
│   └── services/          # Domain services
│       └── event-aggregation.service.ts
├── infrastructure/        # Infrastructure Layer
│   └── repositories/      # Repository implementations
│       └── trace.repository.ts
├── module.ts             # Module integration
├── index.ts              # Public exports
└── types.ts              # Type definitions
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializeTraceModule } from 'mplp';

// Initialize the module
const traceModule = await initializeTraceModule();

// Create a trace for workflow execution
const result = await traceModule.traceManagementService.createTrace({
  context_id: 'ctx-123',
  execution_id: 'exec-456',
  trace_type: 'workflow_execution',
  name: 'Project Workflow Execution',
  metadata: {
    workflow_stages: ['context', 'plan', 'confirm'],
    estimated_duration: 300000
  }
});

if (result.success) {
  console.log('Trace created:', result.data.trace_id);
  
  // Record events during execution
  await traceModule.traceManagementService.recordEvent({
    trace_id: result.data.trace_id,
    event_type: 'stage_started',
    stage: 'context',
    timestamp: new Date(),
    data: { stage_config: {} }
  });
}
```

## 📖 API Reference

### Trace Management Service

#### createTrace()

Creates a new trace for monitoring execution.

```typescript
async createTrace(request: CreateTraceRequest): Promise<OperationResult<Trace>>
```

**Parameters:**
```typescript
interface CreateTraceRequest {
  context_id: UUID;
  execution_id?: UUID;
  trace_type: TraceType;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

type TraceType = 
  | 'workflow_execution'
  | 'module_operation'
  | 'api_request'
  | 'background_task'
  | 'custom';
```

#### recordEvent()

Records an event within a trace.

```typescript
async recordEvent(request: RecordEventRequest): Promise<OperationResult<Event>>
```

**Parameters:**
```typescript
interface RecordEventRequest {
  trace_id: UUID;
  event_type: string;
  level: EventLevel;
  message?: string;
  data?: Record<string, any>;
  timestamp?: Date;
  duration_ms?: number;
}

type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
```

#### getTraceById()

Retrieves a trace with its events.

```typescript
async getTraceById(traceId: UUID): Promise<OperationResult<TraceWithEvents>>
```

#### queryTraces()

Queries traces with filtering and aggregation.

```typescript
async queryTraces(
  filter: TraceFilter,
  aggregation?: TraceAggregation
): Promise<OperationResult<TraceQueryResult>>
```

#### getMetrics()

Retrieves performance metrics.

```typescript
async getMetrics(
  timeRange: TimeRange,
  metricTypes?: MetricType[]
): Promise<OperationResult<MetricsData>>
```

## 🎯 Domain Model

### Trace Entity

The core domain entity representing a trace session.

```typescript
class Trace {
  // Properties
  trace_id: UUID;
  context_id: UUID;
  execution_id?: UUID;
  trace_type: TraceType;
  name: string;
  description?: string;
  status: TraceStatus;
  events: Event[];
  metadata: Record<string, any>;
  tags: string[];
  started_at: Timestamp;
  completed_at?: Timestamp;
  duration_ms?: number;

  // Business Methods
  addEvent(event: Event): void;
  complete(): void;
  calculateDuration(): number;
  getEventsByType(eventType: string): Event[];
  getEventsByLevel(level: EventLevel): Event[];
  generateSummary(): TraceSummary;
}
```

### Event Entity

Individual event within a trace.

```typescript
class Event {
  // Properties
  event_id: UUID;
  trace_id: UUID;
  event_type: string;
  level: EventLevel;
  message?: string;
  data?: Record<string, any>;
  timestamp: Timestamp;
  duration_ms?: number;
  parent_event_id?: UUID;

  // Business Methods
  isError(): boolean;
  hasData(): boolean;
  getFormattedMessage(): string;
  addChildEvent(event: Event): void;
}
```

### Status Types

```typescript
type TraceStatus = 
  | 'active'     // Currently recording
  | 'completed'  // Successfully completed
  | 'failed'     // Failed with errors
  | 'cancelled'  // Manually cancelled
  | 'expired';   // Expired due to timeout

interface TraceSummary {
  total_events: number;
  events_by_level: Record<EventLevel, number>;
  total_duration: number;
  error_count: number;
  warning_count: number;
  performance_metrics: PerformanceMetrics;
}
```

## 🔧 Configuration

### Module Options

```typescript
interface TraceModuleOptions {
  dataSource?: DataSource;           // Database connection
  enableRealTimeMonitoring?: boolean; // Enable real-time monitoring
  enableMetricsCollection?: boolean;  // Enable metrics collection
  enableEventAggregation?: boolean;   // Enable event aggregation
  retentionPeriodDays?: number;       // Data retention period
  metricsConfig?: MetricsConfiguration;
  eventConfig?: EventConfiguration;
}

interface MetricsConfiguration {
  collectionInterval: number;        // Collection interval in ms
  aggregationWindow: number;         // Aggregation window in ms
  enableCustomMetrics: boolean;      // Enable custom metrics
  metricTypes: MetricType[];         // Types of metrics to collect
}
```

## 📊 Events and Metrics

### Standard Events

```typescript
// Workflow events
interface WorkflowStartedEvent {
  event_type: 'workflow_started';
  workflow_id: UUID;
  stages: string[];
  estimated_duration: number;
}

interface StageCompletedEvent {
  event_type: 'stage_completed';
  stage: string;
  duration_ms: number;
  status: 'success' | 'failure';
  output?: any;
}

// Performance events
interface PerformanceEvent {
  event_type: 'performance_metric';
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  tags?: Record<string, string>;
}
```

### Metrics Collection

```typescript
// Built-in metrics
interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: NetworkIO;
  active_connections: number;
}

interface ApplicationMetrics {
  request_count: number;
  response_time_avg: number;
  error_rate: number;
  active_traces: number;
  events_per_second: number;
}

// Custom metrics
const customMetrics = {
  workflow_success_rate: {
    type: 'gauge',
    help: 'Percentage of successful workflows',
    value: 95.5
  },
  average_execution_time: {
    type: 'histogram',
    help: 'Average workflow execution time',
    buckets: [100, 500, 1000, 5000, 10000]
  }
};
```

## 🧪 Testing

### Unit Tests

```typescript
import { Trace } from '../domain/entities/trace.entity';
import { Event } from '../domain/entities/event.entity';

describe('Trace Entity', () => {
  test('should create valid trace', () => {
    const trace = new Trace(
      'trace-123',
      'ctx-123',
      'workflow_execution',
      'Test Trace',
      'active',
      new Date().toISOString()
    );
    
    expect(trace.trace_id).toBe('trace-123');
    expect(trace.status).toBe('active');
    expect(trace.events).toHaveLength(0);
  });

  test('should add event to trace', () => {
    const trace = new Trace(/* ... */);
    const event = new Event(
      'event-123',
      'trace-123',
      'test_event',
      'info',
      new Date().toISOString()
    );
    
    trace.addEvent(event);
    expect(trace.events).toContain(event);
  });

  test('should calculate duration', () => {
    const trace = new Trace(/* ... */);
    trace.complete();
    
    const duration = trace.calculateDuration();
    expect(duration).toBeGreaterThan(0);
  });
});
```

## 🔗 Integration

### With Other Modules

The Trace Module integrates with all other modules:

- **Context Module**: Traces context lifecycle events
- **Plan Module**: Monitors plan execution and task progress
- **Confirm Module**: Tracks approval workflow events
- **Role Module**: Monitors permission and access events
- **Extension Module**: Traces extension execution and performance
- **Core Module**: Monitors overall workflow orchestration

### Real-time Monitoring

```typescript
// Set up real-time event streaming
traceModule.traceManagementService.addEventListener((event) => {
  console.log(`Real-time event: ${event.event_type}`);
  
  // Send to monitoring dashboard
  if (event.level === 'error') {
    alertingService.sendAlert({
      severity: 'high',
      message: `Error in trace ${event.trace_id}: ${event.message}`,
      timestamp: event.timestamp
    });
  }
});
```

## 📈 Performance Monitoring

### Built-in Dashboards

```typescript
// Get performance dashboard data
const dashboardData = await traceModule.traceManagementService.getDashboardData({
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  },
  metrics: ['response_time', 'error_rate', 'throughput'],
  groupBy: 'hour'
});

// Response includes:
interface DashboardData {
  summary: {
    total_traces: number;
    success_rate: number;
    average_duration: number;
    error_count: number;
  };
  timeseries: TimeseriesData[];
  top_errors: ErrorSummary[];
  performance_trends: PerformanceTrend[];
}
```

### Custom Alerts

```typescript
// Configure custom alerts
const alertConfig = {
  rules: [
    {
      name: 'High Error Rate',
      condition: 'error_rate > 5%',
      window: '5m',
      severity: 'critical',
      actions: ['email', 'slack']
    },
    {
      name: 'Slow Response Time',
      condition: 'avg_response_time > 5000ms',
      window: '10m',
      severity: 'warning',
      actions: ['email']
    }
  ]
};
```

## 🔍 Querying and Analysis

### Advanced Queries

```typescript
// Complex trace queries
const queryResult = await traceModule.traceManagementService.queryTraces({
  filter: {
    context_ids: ['ctx-123', 'ctx-456'],
    trace_types: ['workflow_execution'],
    status: ['completed', 'failed'],
    time_range: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31')
    },
    has_errors: true
  },
  aggregation: {
    group_by: ['trace_type', 'status'],
    metrics: ['count', 'avg_duration', 'error_rate'],
    time_bucket: '1h'
  },
  pagination: {
    page: 1,
    limit: 100
  }
});
```

### Export and Reporting

```typescript
// Export trace data
const exportResult = await traceModule.traceManagementService.exportTraces({
  filter: { /* query filter */ },
  format: 'json', // 'json', 'csv', 'parquet'
  compression: 'gzip',
  include_events: true,
  include_metrics: true
});
```

---

The Trace Module provides comprehensive observability and monitoring capabilities with real-time event tracking, performance metrics, and advanced analytics for complete system visibility and debugging support.
