# MPLP SDK Core Examples

This document provides practical examples of using the MPLP SDK Core components.

## Table of Contents

- [Basic Application Setup](#basic-application-setup)
- [Configuration Management](#configuration-management)
- [Module System](#module-system)
- [Health Monitoring](#health-monitoring)
- [Event-Driven Architecture](#event-driven-architecture)
- [Complete Application Example](#complete-application-example)

## Basic Application Setup

### Simple Application

```typescript
import { MPLPApplication } from '@mplp/sdk-core';

async function main() {
  const app = new MPLPApplication({
    name: 'MyMPLPApp',
    version: '1.0.0',
    config: {
      server: {
        port: 3000,
        host: 'localhost'
      },
      logging: {
        level: 'info'
      }
    }
  });

  // Handle application events
  app.on('initialized', () => {
    console.log('Application initialized successfully');
  });

  app.on('error', (error) => {
    console.error('Application error:', error);
  });

  try {
    await app.initialize();
    await app.start();
    
    console.log('Application is running');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await app.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

main();
```

## Configuration Management

### Environment-Based Configuration

```typescript
import { ConfigManager } from '@mplp/sdk-core';

// config.json
const baseConfig = {
  database: {
    host: '${DB_HOST:localhost}',
    port: '${DB_PORT:5432}',
    name: '${DB_NAME:myapp}',
    ssl: '${DB_SSL:false}'
  },
  redis: {
    url: '${REDIS_URL:redis://localhost:6379}'
  },
  app: {
    secret: '${APP_SECRET}', // Required, no default
    debug: '${DEBUG:false}'
  }
};

const config = new ConfigManager(baseConfig);

// Add validation rules
config.addValidationRule('database.port', (value) => {
  const port = parseInt(value);
  return !isNaN(port) && port > 0 && port < 65536;
});

config.addValidationRule('app.secret', (value) => {
  return typeof value === 'string' && value.length >= 32;
});

// Validate configuration
const validation = config.validate();
if (!validation.isValid) {
  console.error('Configuration validation failed:');
  validation.errors.forEach(error => {
    console.error(`- ${error.path}: ${error.message}`);
  });
  process.exit(1);
}

// Use configuration
const dbConfig = {
  host: config.get('database.host'),
  port: parseInt(config.get('database.port')),
  database: config.get('database.name'),
  ssl: config.get('database.ssl') === 'true'
};

console.log('Database config:', dbConfig);
```

### Configuration Templates

```typescript
import { ConfigManager } from '@mplp/sdk-core';

const config = new ConfigManager();

// Define environment-specific templates
const templates = {
  development: {
    name: 'development',
    variables: {
      logLevel: 'debug',
      dbPool: '5',
      cacheEnabled: 'false'
    },
    template: {
      logging: { level: '{{logLevel}}' },
      database: { poolSize: '{{dbPool}}' },
      cache: { enabled: '{{cacheEnabled}}' }
    }
  },
  
  production: {
    name: 'production',
    variables: {
      logLevel: 'error',
      dbPool: '20',
      cacheEnabled: 'true'
    },
    template: {
      logging: { level: '{{logLevel}}' },
      database: { poolSize: '{{dbPool}}' },
      cache: { enabled: '{{cacheEnabled}}' }
    }
  }
};

// Apply template based on environment
const env = process.env.NODE_ENV || 'development';
const template = templates[env];

if (template) {
  config.applyTemplate(template);
  console.log(`Applied ${env} configuration template`);
} else {
  console.warn(`No template found for environment: ${env}`);
}

// Configuration is now ready
console.log('Final config:', config.exportConfig());
```

## Module System

### Creating Custom Modules

```typescript
import { Module, ModuleManager, Logger } from '@mplp/sdk-core';

// Database module
class DatabaseModule implements Module {
  private connection: any;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing database module...');
    // Initialize database connection
    this.connection = await createDatabaseConnection();
  }

  async start(): Promise<void> {
    this.logger.info('Starting database module...');
    await this.connection.connect();
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping database module...');
    await this.connection.disconnect();
  }

  getConnection() {
    return this.connection;
  }
}

// API module that depends on database
class ApiModule implements Module {
  private server: any;
  private database: DatabaseModule;
  private logger: Logger;

  constructor(database: DatabaseModule, logger: Logger) {
    this.database = database;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing API module...');
    this.server = createHttpServer();
    
    // Setup routes with database access
    this.server.get('/health', (req, res) => {
      res.json({ status: 'ok', database: 'connected' });
    });
  }

  async start(): Promise<void> {
    this.logger.info('Starting API module...');
    await this.server.listen(3000);
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping API module...');
    await this.server.close();
  }
}

// Module setup
async function setupModules() {
  const logger = new Logger('ModuleSystem');
  const moduleManager = new ModuleManager(logger);

  // Create module instances
  const databaseModule = new DatabaseModule(logger);
  const apiModule = new ApiModule(databaseModule, logger);

  // Register modules with dependencies
  moduleManager.registerModule('database', databaseModule, {
    metadata: {
      name: 'Database Module',
      version: '1.0.0',
      description: 'Handles database connections'
    }
  });

  moduleManager.registerModule('api', apiModule, {
    metadata: {
      name: 'API Module',
      version: '1.0.0',
      description: 'HTTP API server',
      dependencies: ['database']
    }
  });

  // Listen for module events
  moduleManager.on('moduleStarted', (name) => {
    logger.info(`Module ${name} started successfully`);
  });

  moduleManager.on('moduleError', (name, error) => {
    logger.error(`Module ${name} error:`, error);
  });

  // Start all modules (database will start first)
  await moduleManager.startAll();

  return moduleManager;
}

setupModules().catch(console.error);
```

## Health Monitoring

### Comprehensive Health Checks

```typescript
import { HealthChecker } from '@mplp/sdk-core';

async function setupHealthMonitoring() {
  const healthChecker = new HealthChecker({
    interval: 30000, // Check every 30 seconds
    timeout: 5000    // 5 second timeout per check
  });

  // Database health check
  healthChecker.registerHealthCheck({
    name: 'database',
    checkFunction: async () => {
      try {
        await database.query('SELECT 1');
        return { healthy: true, message: 'Database connection OK' };
      } catch (error) {
        return { 
          healthy: false, 
          message: `Database error: ${error.message}` 
        };
      }
    },
    critical: true,
    retries: 2,
    timeout: 3000
  });

  // Redis health check
  healthChecker.registerHealthCheck({
    name: 'redis',
    checkFunction: async () => {
      try {
        await redis.ping();
        return { healthy: true, message: 'Redis connection OK' };
      } catch (error) {
        return { 
          healthy: false, 
          message: `Redis error: ${error.message}` 
        };
      }
    },
    critical: false,
    retries: 1
  });

  // External API health check
  healthChecker.registerHealthCheck({
    name: 'external-api',
    checkFunction: async () => {
      try {
        const response = await fetch('https://api.example.com/health');
        const healthy = response.ok;
        return {
          healthy,
          message: healthy ? 'External API OK' : `API returned ${response.status}`
        };
      } catch (error) {
        return { 
          healthy: false, 
          message: `External API unreachable: ${error.message}` 
        };
      }
    },
    critical: false,
    timeout: 10000
  });

  // Listen for health events
  healthChecker.on('criticalHealthCheckFailed', async (result) => {
    console.error('CRITICAL HEALTH CHECK FAILED:', result);
    
    // Send alert to monitoring system
    await sendAlert({
      level: 'critical',
      service: result.name,
      message: result.message,
      timestamp: new Date()
    });
  });

  healthChecker.on('healthCheckFailed', (result) => {
    console.warn('Health check failed:', result);
  });

  await healthChecker.initialize();
  await healthChecker.start();

  // Expose health endpoint
  app.get('/health', async (req, res) => {
    const report = await healthChecker.getHealthReport();
    const status = report.healthy ? 200 : 503;
    
    res.status(status).json({
      healthy: report.healthy,
      timestamp: report.timestamp,
      checks: report.checks,
      systemInfo: report.systemInfo
    });
  });

  return healthChecker;
}
```
