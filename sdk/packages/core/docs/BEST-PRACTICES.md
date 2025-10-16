# MPLP SDK Core Best Practices

This guide provides best practices for using the MPLP SDK Core effectively in production environments.

## Table of Contents

- [Application Architecture](#application-architecture)
- [Configuration Management](#configuration-management)
- [Module Design](#module-design)
- [Health Monitoring](#health-monitoring)
- [Event System](#event-system)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)

## Application Architecture

### 1. Layered Architecture

Structure your application in clear layers:

```typescript
// Good: Clear separation of concerns
src/
├── application/     # Application layer (MPLPApplication)
├── modules/        # Business logic modules
├── services/       # External service integrations
├── config/         # Configuration management
├── health/         # Health check implementations
└── events/         # Event handlers and emitters
```

### 2. Dependency Injection

Use dependency injection for better testability:

```typescript
// Good: Dependencies injected
class UserService {
  constructor(
    private database: DatabaseModule,
    private logger: Logger,
    private eventBus: EventBus
  ) {}
}

// Bad: Hard-coded dependencies
class UserService {
  private database = new DatabaseModule();
  private logger = new Logger();
}
```

### 3. Interface-Based Design

Define clear interfaces for modules:

```typescript
// Good: Interface-based design
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class DatabaseUserRepository implements IUserRepository {
  // Implementation
}

class CacheUserRepository implements IUserRepository {
  // Implementation
}
```

## Configuration Management

### 1. Environment Variables

Use environment variables for environment-specific settings:

```typescript
// Good: Environment-based configuration
const config = {
  database: {
    host: '${DB_HOST:localhost}',
    port: '${DB_PORT:5432}',
    ssl: '${DB_SSL:false}'
  },
  app: {
    secret: '${APP_SECRET}', // Required
    debug: '${DEBUG:false}'
  }
};
```

### 2. Configuration Validation

Always validate configuration:

```typescript
// Good: Comprehensive validation
config.addValidationRule('database.port', (value) => {
  const port = parseInt(value);
  return !isNaN(port) && port > 0 && port < 65536;
});

config.addValidationRule('app.secret', (value) => {
  return typeof value === 'string' && value.length >= 32;
});

const validation = config.validate();
if (!validation.isValid) {
  console.error('Configuration validation failed');
  process.exit(1);
}
```

### 3. Configuration Snapshots

Use snapshots for configuration rollback:

```typescript
// Good: Create snapshots before changes
const snapshot = config.createSnapshot();

try {
  config.applyTemplate(newTemplate);
  // Test new configuration
} catch (error) {
  config.restoreSnapshot(snapshot);
  throw error;
}
```

## Module Design

### 1. Single Responsibility

Each module should have a single, well-defined responsibility:

```typescript
// Good: Single responsibility
class DatabaseModule implements Module {
  // Only handles database connections and queries
}

class CacheModule implements Module {
  // Only handles caching operations
}

// Bad: Multiple responsibilities
class DataModule implements Module {
  // Handles database, cache, file system, etc.
}
```

### 2. Proper Lifecycle Management

Implement proper initialization and cleanup:

```typescript
// Good: Proper lifecycle management
class DatabaseModule implements Module {
  private connection: Connection;
  private healthCheck: NodeJS.Timer;

  async initialize(): Promise<void> {
    this.connection = await createConnection();
    this.healthCheck = setInterval(() => this.ping(), 30000);
  }

  async start(): Promise<void> {
    await this.connection.connect();
  }

  async stop(): Promise<void> {
    if (this.healthCheck) {
      clearInterval(this.healthCheck);
    }
    await this.connection.disconnect();
  }
}
```

### 3. Dependency Declaration

Clearly declare module dependencies:

```typescript
// Good: Clear dependency declaration
moduleManager.registerModule('api', apiModule, {
  metadata: {
    name: 'API Module',
    version: '1.0.0',
    dependencies: ['database', 'cache', 'auth']
  }
});
```

## Health Monitoring

### 1. Comprehensive Health Checks

Implement health checks for all critical components:

```typescript
// Good: Comprehensive health checks
const criticalChecks = [
  'database',
  'cache',
  'message-queue',
  'external-api'
];

criticalChecks.forEach(name => {
  healthChecker.registerHealthCheck({
    name,
    checkFunction: createHealthCheck(name),
    critical: true,
    retries: 2,
    timeout: 5000
  });
});
```

### 2. Meaningful Health Check Messages

Provide actionable information in health check results:

```typescript
// Good: Actionable messages
return {
  healthy: false,
  message: 'Database connection failed: Connection timeout after 5s. Check network connectivity and database server status.',
  details: {
    host: 'db.example.com',
    port: 5432,
    lastSuccessfulConnection: '2024-01-15T10:30:00Z'
  }
};

// Bad: Vague messages
return {
  healthy: false,
  message: 'Database error'
};
```

### 3. Health Check Performance

Keep health checks lightweight and fast:

```typescript
// Good: Lightweight health check
async checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Simple ping query
    await this.db.query('SELECT 1');
    return { healthy: true, message: 'Database OK' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}

// Bad: Heavy health check
async checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Complex query that takes time
    await this.db.query('SELECT COUNT(*) FROM large_table WHERE complex_condition');
    return { healthy: true, message: 'Database OK' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}
```

## Event System

### 1. Event Naming Conventions

Use consistent event naming:

```typescript
// Good: Consistent naming
eventBus.emit('user.created', userData);
eventBus.emit('user.updated', userData);
eventBus.emit('user.deleted', userId);
eventBus.emit('order.placed', orderData);
eventBus.emit('payment.processed', paymentData);

// Bad: Inconsistent naming
eventBus.emit('userCreated', userData);
eventBus.emit('USER_UPDATED', userData);
eventBus.emit('delete_user', userId);
```

### 2. Event Data Structure

Use consistent event data structures:

```typescript
// Good: Consistent event structure
interface EventData {
  id: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
  payload: any;
}

eventBus.emit('user.created', {
  id: generateId(),
  timestamp: new Date(),
  userId: user.id,
  payload: user
});
```

### 3. Error Handling in Event Handlers

Handle errors gracefully in event handlers:

```typescript
// Good: Proper error handling
eventBus.on('user.created', async (data) => {
  try {
    await sendWelcomeEmail(data.payload);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    // Don't throw - let other handlers continue
  }
});

// Bad: Unhandled errors
eventBus.on('user.created', async (data) => {
  await sendWelcomeEmail(data.payload); // Can crash the application
});
```

## Error Handling

### 1. Structured Error Information

Provide structured error information:

```typescript
// Good: Structured error
class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public query?: string,
    public params?: any[]
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

throw new DatabaseError(
  'Connection timeout',
  'CONNECTION_TIMEOUT',
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### 2. Error Recovery

Implement error recovery strategies:

```typescript
// Good: Error recovery with retry
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 3. Graceful Degradation

Implement graceful degradation for non-critical failures:

```typescript
// Good: Graceful degradation
async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await userService.findById(userId);
  
  let preferences;
  try {
    preferences = await preferencesService.getPreferences(userId);
  } catch (error) {
    logger.warn('Failed to load user preferences, using defaults:', error);
    preferences = getDefaultPreferences();
  }
  
  return { user, preferences };
}
```

## Performance Optimization

### 1. Connection Pooling

Use connection pooling for database and external services:

```typescript
// Good: Connection pooling
const pool = new Pool({
  host: config.get('database.host'),
  port: config.get('database.port'),
  database: config.get('database.name'),
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000
});
```

### 2. Caching Strategy

Implement appropriate caching:

```typescript
// Good: Multi-level caching
class UserService {
  private cache = new Map<string, User>();
  
  async getUser(id: string): Promise<User> {
    // L1: Memory cache
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    // L2: Redis cache
    const cached = await redis.get(`user:${id}`);
    if (cached) {
      const user = JSON.parse(cached);
      this.cache.set(id, user);
      return user;
    }
    
    // L3: Database
    const user = await this.database.findUser(id);
    if (user) {
      this.cache.set(id, user);
      await redis.setex(`user:${id}`, 300, JSON.stringify(user));
    }
    
    return user;
  }
}
```

### 3. Async Processing

Use async processing for non-blocking operations:

```typescript
// Good: Async processing
eventBus.on('order.placed', async (orderData) => {
  // Non-blocking operations
  Promise.all([
    sendOrderConfirmation(orderData),
    updateInventory(orderData),
    logOrderMetrics(orderData)
  ]).catch(error => {
    logger.error('Order processing error:', error);
  });
});
```

## Security Considerations

### 1. Input Validation

Always validate input data:

```typescript
// Good: Input validation
const userSchema = {
  email: { type: 'string', format: 'email', required: true },
  age: { type: 'number', minimum: 0, maximum: 150 },
  name: { type: 'string', minLength: 1, maxLength: 100 }
};

function validateUser(userData: any): User {
  const validation = validate(userData, userSchema);
  if (!validation.valid) {
    throw new ValidationError('Invalid user data', validation.errors);
  }
  return userData as User;
}
```

### 2. Secure Configuration

Protect sensitive configuration:

```typescript
// Good: Secure configuration handling
const sensitiveKeys = ['app.secret', 'database.password', 'api.key'];

config.on('export', (data) => {
  // Mask sensitive values in exports
  sensitiveKeys.forEach(key => {
    if (data[key]) {
      data[key] = '***MASKED***';
    }
  });
});
```

### 3. Audit Logging

Implement comprehensive audit logging:

```typescript
// Good: Audit logging
eventBus.on('user.login', (data) => {
  auditLogger.info('User login', {
    userId: data.userId,
    ip: data.ip,
    userAgent: data.userAgent,
    timestamp: new Date(),
    success: true
  });
});

eventBus.on('user.login.failed', (data) => {
  auditLogger.warn('Failed login attempt', {
    email: data.email,
    ip: data.ip,
    reason: data.reason,
    timestamp: new Date()
  });
});
```
