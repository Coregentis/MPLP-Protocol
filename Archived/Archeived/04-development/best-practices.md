# MPLP v1.0 Best Practices Guide

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 📋 Overview

This guide provides best practices, patterns, and recommendations for building robust, scalable, and maintainable applications with MPLP v1.0.

## 🏗️ Architecture Best Practices

### 1. Module Organization

#### ✅ Do: Follow DDD Principles
```typescript
// Organize modules following DDD layers
src/modules/your-module/
├── api/                    # API Layer - Controllers, DTOs
├── application/           # Application Layer - Services, Commands, Queries
├── domain/                # Domain Layer - Entities, Value Objects, Services
└── infrastructure/        # Infrastructure Layer - Repositories, Adapters
```

#### ✅ Do: Separate Concerns
```typescript
// Domain Entity - Pure business logic
export class Context {
  private constructor(
    private readonly _contextId: UUID,
    private _name: string,
    private _status: ContextStatus
  ) {}

  // Business methods only
  activate(): void {
    if (this._status === 'archived') {
      throw new Error('Cannot activate archived context');
    }
    this._status = 'active';
  }
}

// Application Service - Orchestrates domain objects
export class ContextManagementService {
  constructor(private contextRepository: IContextRepository) {}

  async createContext(request: CreateContextRequest): Promise<OperationResult<Context>> {
    // Validation, orchestration, persistence
  }
}
```

#### ❌ Don't: Mix Concerns
```typescript
// Bad: Mixing database logic with business logic
export class Context {
  async save(): Promise<void> {
    // Don't put database logic in domain entities
    await database.query('INSERT INTO contexts...');
  }
}
```

### 2. Error Handling

#### ✅ Do: Use Structured Error Handling
```typescript
// Define custom error types
export class ContextNotFoundError extends Error {
  constructor(contextId: string) {
    super(`Context not found: ${contextId}`);
    this.name = 'ContextNotFoundError';
  }
}

// Use Result pattern for operations
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

// Implement comprehensive error handling
async function executeWorkflowSafely(contextId: string) {
  try {
    const result = await core.orchestrator.executeWorkflow(contextId, {
      stages: ['context', 'plan', 'trace'],
      error_handling: {
        continue_on_error: false,
        rollback_on_failure: true,
        max_retries: 3
      }
    });

    if (result.status === 'failed') {
      await handleWorkflowFailure(result);
    }

    return result;
  } catch (error) {
    logger.error('Workflow execution failed', { contextId, error });
    await notifyAdministrators(error);
    throw error;
  }
}
```

#### ✅ Do: Implement Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    if (this.failures >= 5) {
      this.state = 'open';
    }
  }
}
```

## 🚀 Performance Best Practices

### 1. Workflow Optimization

#### ✅ Do: Use Parallel Execution When Possible
```typescript
// Good: Parallel execution for independent stages
const result = await core.orchestrator.executeWorkflow(contextId, {
  stages: ['context', 'plan', 'trace'],
  parallel_execution: true, // Enable when stages are independent
  timeout_ms: 30000
});

// Good: Custom parallel workflow
const parallelWorkflow = core.workflowManager.createCustomWorkflow(
  ['context', 'trace'], // Only independent stages
  { parallel: true }
);
```

#### ✅ Do: Optimize Stage Selection
```typescript
// Good: Only include necessary stages
const minimalWorkflow = {
  stages: ['context', 'trace'], // Skip unnecessary stages
  timeout_ms: 15000
};

// Good: Use workflow templates
const fastWorkflow = core.workflowManager.getTemplate('fast');
```

#### ❌ Don't: Include Unnecessary Stages
```typescript
// Bad: Including all stages when not needed
const result = await core.orchestrator.executeWorkflow(contextId, {
  stages: ['context', 'plan', 'confirm', 'trace'], // All stages not always needed
  parallel_execution: false
});
```

### 2. Resource Management

#### ✅ Do: Implement Connection Pooling
```typescript
// Database connection pooling
const dataSource = new DataSource({
  type: 'postgres',
  // ... connection details
  poolSize: 20,
  acquireTimeout: 30000,
  timeout: 30000,
  maxQueryExecutionTime: 10000
});

// Redis connection pooling
const redis = new Redis({
  // ... connection details
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true
});
```

#### ✅ Do: Implement Caching Strategy
```typescript
// Multi-level caching
class CacheManager {
  private l1Cache = new Map(); // Memory cache
  private l2Cache: Redis; // Redis cache

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // Try L2 cache
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      const parsed = JSON.parse(l2Value);
      this.l1Cache.set(key, parsed); // Populate L1
      return parsed;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }
}
```

## 🔐 Security Best Practices

### 1. Authentication and Authorization

#### ✅ Do: Implement Proper RBAC
```typescript
// Define clear role hierarchy
const roleHierarchy = {
  admin: ['manager', 'user'],
  manager: ['user'],
  user: []
};

// Check permissions before operations
async function createPlan(userId: string, planData: any) {
  const hasPermission = await roleService.checkPermission(
    userId,
    'plan:create',
    { context_id: planData.context_id }
  );

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to create plan');
  }

  return await planService.createPlan(planData);
}
```

#### ✅ Do: Validate Input Data
```typescript
// Use schema validation
import Joi from 'joi';

const createContextSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  metadata: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

async function createContext(data: any) {
  const { error, value } = createContextSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  return await contextService.createContext(value);
}
```

### 2. Data Protection

#### ✅ Do: Encrypt Sensitive Data
```typescript
// Encrypt sensitive configuration
class ConfigManager {
  private encryptionKey: string;

  encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptSensitiveData(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## 📊 Monitoring and Observability

### 1. Comprehensive Logging

#### ✅ Do: Implement Structured Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mplp' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use correlation IDs
class CorrelationManager {
  private static correlationId: string;

  static setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  static getCorrelationId(): string {
    return this.correlationId || 'unknown';
  }
}

// Log with context
logger.info('Workflow started', {
  correlationId: CorrelationManager.getCorrelationId(),
  contextId: 'ctx-123',
  userId: 'user-456',
  action: 'workflow_start'
});
```

### 2. Metrics Collection

#### ✅ Do: Collect Business Metrics
```typescript
// Custom metrics collection
class MetricsCollector {
  private metrics = new Map<string, number>();

  increment(metric: string, value = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  gauge(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }

  timing(metric: string, duration: number): void {
    this.metrics.set(`${metric}_duration`, duration);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Usage in workflow
async function executeWorkflowWithMetrics(contextId: string) {
  const startTime = Date.now();
  metricsCollector.increment('workflow_started');

  try {
    const result = await core.orchestrator.executeWorkflow(contextId);
    
    metricsCollector.increment('workflow_completed');
    metricsCollector.timing('workflow_duration', Date.now() - startTime);
    
    return result;
  } catch (error) {
    metricsCollector.increment('workflow_failed');
    throw error;
  }
}
```

## 🧪 Testing Best Practices

### 1. Unit Testing

#### ✅ Do: Test Domain Logic Thoroughly
```typescript
// Test domain entities
describe('Context Entity', () => {
  test('should activate context when in valid state', () => {
    const context = new Context('ctx-123', 'Test Context', 'draft');
    
    context.activate();
    
    expect(context.status).toBe('active');
  });

  test('should throw error when activating archived context', () => {
    const context = new Context('ctx-123', 'Test Context', 'archived');
    
    expect(() => context.activate()).toThrow('Cannot activate archived context');
  });
});

// Test application services
describe('ContextManagementService', () => {
  let service: ContextManagementService;
  let mockRepository: jest.Mocked<IContextRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByFilter: jest.fn()
    };
    service = new ContextManagementService(mockRepository);
  });

  test('should create context successfully', async () => {
    const request = {
      name: 'Test Context',
      description: 'Test description'
    };

    mockRepository.save.mockResolvedValue(undefined);

    const result = await service.createContext(request);

    expect(result.success).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Testing

#### ✅ Do: Test Module Integration
```typescript
describe('Module Integration', () => {
  let core: any;

  beforeAll(async () => {
    // Setup test environment
    core = await initializeTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment(core);
  });

  test('should execute complete workflow', async () => {
    const result = await core.orchestrator.executeWorkflow('test-context', {
      stages: ['context', 'plan', 'trace'],
      timeout_ms: 30000
    });

    expect(result.status).toBe('completed');
    expect(result.stages).toHaveLength(3);
    expect(result.stages.every(s => s.status === 'completed')).toBe(true);
  });
});
```

## 📈 Scalability Best Practices

### 1. Horizontal Scaling

#### ✅ Do: Design for Statelessness
```typescript
// Stateless service design
export class StatelessWorkflowService {
  constructor(
    private contextService: IContextService,
    private planService: IPlanService,
    private traceService: ITraceService
  ) {}

  async executeWorkflow(workflowId: string): Promise<WorkflowResult> {
    // All state is passed in or retrieved from external storage
    // No instance variables that maintain state between requests
    const workflowData = await this.getWorkflowData(workflowId);
    return await this.processWorkflow(workflowData);
  }
}
```

#### ✅ Do: Implement Load Balancing
```typescript
// Health check for load balancer
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    modules: getModuleHealthStatus()
  };

  res.status(200).json(health);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Cleanup resources
  await cleanupResources();
  process.exit(0);
});
```

## 🔧 Configuration Management

### 1. Environment-Specific Configuration

#### ✅ Do: Use Environment Variables
```typescript
// Configuration management
export class ConfigManager {
  static getConfig() {
    return {
      database: {
        host: process.env.MPLP_DB_HOST || 'localhost',
        port: parseInt(process.env.MPLP_DB_PORT || '5432'),
        name: process.env.MPLP_DB_NAME || 'mplp',
        user: process.env.MPLP_DB_USER || 'mplp_user',
        password: process.env.MPLP_DB_PASSWORD || '',
        ssl: process.env.NODE_ENV === 'production'
      },
      redis: {
        host: process.env.MPLP_REDIS_HOST || 'localhost',
        port: parseInt(process.env.MPLP_REDIS_PORT || '6379'),
        password: process.env.MPLP_REDIS_PASSWORD
      },
      security: {
        jwtSecret: process.env.MPLP_JWT_SECRET || 'default-secret',
        encryptionKey: process.env.MPLP_ENCRYPTION_KEY || 'default-key'
      },
      performance: {
        maxConcurrentExecutions: parseInt(process.env.MPLP_MAX_CONCURRENT || '10'),
        defaultTimeout: parseInt(process.env.MPLP_DEFAULT_TIMEOUT || '300000')
      }
    };
  }

  static validateConfig(): void {
    const config = this.getConfig();
    
    if (!config.database.password && process.env.NODE_ENV === 'production') {
      throw new Error('Database password is required in production');
    }
    
    if (!config.security.jwtSecret || config.security.jwtSecret === 'default-secret') {
      throw new Error('JWT secret must be set');
    }
  }
}
```

## 📚 Documentation Best Practices

### 1. Code Documentation

#### ✅ Do: Document Public APIs
```typescript
/**
 * Creates a new project context with the specified parameters.
 * 
 * @param request - The context creation request containing name, description, and metadata
 * @returns Promise resolving to operation result with created context or error
 * 
 * @example
 * ```typescript
 * const result = await contextService.createContext({
 *   name: 'My Project',
 *   description: 'Project description',
 *   metadata: { priority: 'high' }
 * });
 * 
 * if (result.success) {
 *   console.log('Context created:', result.data.context_id);
 * }
 * ```
 * 
 * @throws {ValidationError} When request data is invalid
 * @throws {DuplicateContextError} When context with same name exists
 */
async createContext(request: CreateContextRequest): Promise<OperationResult<Context>> {
  // Implementation
}
```

---

Following these best practices will help you build robust, scalable, and maintainable applications with MPLP v1.0. Remember to adapt these practices to your specific use case and requirements.
