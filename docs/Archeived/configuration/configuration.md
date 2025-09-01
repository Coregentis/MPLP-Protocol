# MPLP v1.0 Configuration Guide

## 📋 Overview

This guide covers all configuration options available in MPLP v1.0, from basic setup to advanced production configurations.

## 🚀 Quick Configuration

### Basic Setup

```typescript
import { initializeCoreModule } from 'mplp';

// Minimal configuration
const core = await initializeCoreModule(moduleServices);
```

### Environment Variables

```bash
# Basic configuration
MPLP_LOG_LEVEL=info
MPLP_PORT=3000
MPLP_HOST=localhost

# Database configuration
MPLP_DB_HOST=localhost
MPLP_DB_PORT=5432
MPLP_DB_NAME=mplp
MPLP_DB_USER=mplp_user
MPLP_DB_PASSWORD=secure_password

# Redis configuration (optional)
MPLP_REDIS_HOST=localhost
MPLP_REDIS_PORT=6379
MPLP_REDIS_PASSWORD=redis_password

# Security
MPLP_JWT_SECRET=your_jwt_secret_key
MPLP_ENCRYPTION_KEY=your_encryption_key
```

## ⚙️ Core Configuration

### Orchestrator Configuration

```typescript
interface OrchestratorConfiguration {
  default_workflow: WorkflowConfiguration;
  module_timeout_ms: number;
  max_concurrent_executions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
  lifecycle_hooks?: LifecycleHooks;
}

const coreConfig = {
  orchestrator_config: {
    module_timeout_ms: 30000,
    max_concurrent_executions: 10,
    enable_performance_monitoring: true,
    enable_event_logging: true,
    default_workflow: {
      stages: ['context', 'plan', 'confirm', 'trace'],
      parallel_execution: false,
      timeout_ms: 300000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_multiplier: 2
      }
    }
  }
};
```

### Workflow Configuration

```typescript
interface WorkflowConfiguration {
  stages: WorkflowStage[];
  parallel_execution?: boolean;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
  error_handling?: ErrorHandlingPolicy;
}

const workflowConfig = {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 300000,
  retry_policy: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2,
    retry_on_errors: ['TimeoutError', 'NetworkError']
  },
  error_handling: {
    continue_on_error: false,
    rollback_on_failure: true,
    notification_enabled: true,
    error_threshold: 5
  }
};
```

## 🗄️ Database Configuration

### PostgreSQL Setup

```typescript
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.MPLP_DB_HOST || 'localhost',
  port: parseInt(process.env.MPLP_DB_PORT || '5432'),
  username: process.env.MPLP_DB_USER || 'mplp_user',
  password: process.env.MPLP_DB_PASSWORD,
  database: process.env.MPLP_DB_NAME || 'mplp',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.MPLP_LOG_LEVEL === 'debug',
  entities: ['src/modules/*/infrastructure/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

### Redis Configuration

```typescript
import Redis from 'ioredis';

const redisConfig = {
  host: process.env.MPLP_REDIS_HOST || 'localhost',
  port: parseInt(process.env.MPLP_REDIS_PORT || '6379'),
  password: process.env.MPLP_REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'mplp:',
  db: 0
};

const redis = new Redis(redisConfig);
```

## 📦 Module Configuration

### Context Module

```typescript
const contextConfig = {
  enableCaching: true,
  enableValidation: true,
  enableAuditLogging: true,
  maxContextsPerUser: 100,
  cacheConfig: {
    ttl: 3600, // 1 hour
    maxSize: 1000
  },
  validationConfig: {
    strictMode: true,
    allowEmptyDescription: false,
    maxNameLength: 255
  }
};

const contextModule = await initializeContextModule(contextConfig);
```

### Plan Module

```typescript
const planConfig = {
  enableTaskScheduling: true,
  enableDependencyValidation: true,
  enableProgressTracking: true,
  maxTasksPerPlan: 1000,
  schedulingConfig: {
    defaultPriority: 'medium',
    autoAssignment: false,
    parallelExecution: true
  },
  validationConfig: {
    requireEstimatedDuration: false,
    maxDependencyDepth: 10,
    allowCircularDependencies: false
  }
};

const planModule = await initializePlanModule(planConfig);
```

### Trace Module

```typescript
const traceConfig = {
  enableRealTimeMonitoring: true,
  enableMetricsCollection: true,
  enableEventAggregation: true,
  retentionPeriodDays: 30,
  metricsConfig: {
    collectionInterval: 5000, // 5 seconds
    aggregationWindow: 60000, // 1 minute
    enableCustomMetrics: true
  },
  eventConfig: {
    batchSize: 100,
    flushInterval: 1000,
    enableFiltering: true
  }
};

const traceModule = await initializeTraceModule(traceConfig);
```

## 🔐 Security Configuration

### Authentication & Authorization

```typescript
const securityConfig = {
  jwt: {
    secret: process.env.MPLP_JWT_SECRET,
    expiresIn: '24h',
    issuer: 'mplp-v1.0',
    audience: 'mplp-users'
  },
  rbac: {
    enableRoleHierarchy: true,
    enablePermissionInheritance: true,
    defaultRole: 'user',
    adminRole: 'admin'
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    skipSuccessfulRequests: false
  }
};
```

### CORS Configuration

```typescript
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## 📊 Monitoring Configuration

### Logging Configuration

```typescript
import winston from 'winston';

const loggingConfig = {
  level: process.env.MPLP_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
};
```

### Metrics Configuration

```typescript
const metricsConfig = {
  prometheus: {
    enabled: true,
    port: 9090,
    endpoint: '/metrics',
    collectDefaultMetrics: true,
    prefix: 'mplp_'
  },
  customMetrics: {
    workflowExecutionTime: {
      type: 'histogram',
      help: 'Workflow execution time in milliseconds',
      buckets: [100, 500, 1000, 5000, 10000, 30000]
    },
    activeConnections: {
      type: 'gauge',
      help: 'Number of active connections'
    },
    errorRate: {
      type: 'counter',
      help: 'Total number of errors'
    }
  }
};
```

## 🚀 Performance Configuration

### Caching Strategy

```typescript
const cacheConfig = {
  levels: {
    l1: {
      type: 'memory',
      maxSize: 1000,
      ttl: 300 // 5 minutes
    },
    l2: {
      type: 'redis',
      ttl: 3600, // 1 hour
      keyPrefix: 'mplp:cache:'
    }
  },
  strategies: {
    context: 'l1+l2',
    plan: 'l2',
    trace: 'l1'
  }
};
```

### Connection Pooling

```typescript
const poolConfig = {
  database: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  redis: {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000
  }
};
```

## 🌍 Environment-Specific Configuration

### Development

```typescript
const developmentConfig = {
  debug: true,
  hotReload: true,
  verboseLogging: true,
  enableTestData: true,
  disableAuth: false, // Keep auth enabled for testing
  database: {
    synchronize: true,
    logging: true,
    dropSchema: false
  }
};
```

### Production

```typescript
const productionConfig = {
  debug: false,
  enableCompression: true,
  enableCaching: true,
  enableMetrics: true,
  database: {
    synchronize: false,
    logging: false,
    ssl: true,
    poolSize: 20
  },
  security: {
    enableHelmet: true,
    enableRateLimit: true,
    enableCors: true
  }
};
```

## 📝 Configuration Validation

### Schema Validation

```typescript
import Joi from 'joi';

const configSchema = Joi.object({
  port: Joi.number().port().default(3000),
  host: Joi.string().hostname().default('localhost'),
  database: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().port().required(),
    name: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().required()
  }).required(),
  redis: Joi.object({
    host: Joi.string().default('localhost'),
    port: Joi.number().port().default(6379),
    password: Joi.string().optional()
  }).optional(),
  security: Joi.object({
    jwtSecret: Joi.string().min(32).required(),
    encryptionKey: Joi.string().min(32).required()
  }).required()
});

// Validate configuration
const { error, value } = configSchema.validate(config);
if (error) {
  throw new Error(`Configuration validation failed: ${error.message}`);
}
```

---

This configuration guide provides comprehensive options for customizing MPLP v1.0 to meet your specific requirements, from development to production environments.
