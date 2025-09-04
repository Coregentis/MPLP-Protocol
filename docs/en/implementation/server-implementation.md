# MPLP Server Implementation Guide

**Multi-Agent Protocol Lifecycle Platform - Server Implementation Guide v1.0.0-alpha**

[![Server](https://img.shields.io/badge/server-Enterprise%20Complete-brightgreen.svg)](./README.md)
[![Framework](https://img.shields.io/badge/framework-10%20Modules%20Ready-brightgreen.svg)](./client-implementation.md)
[![Implementation](https://img.shields.io/badge/implementation-100%25%20Complete-brightgreen.svg)](./deployment-models.md)
[![Quality](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./performance-requirements.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/implementation/server-implementation.md)

---

## 🎯 Server Implementation Overview

This guide provides comprehensive instructions for implementing MPLP server-side applications based on the **fully completed** MPLP v1.0 Alpha. With all 10 enterprise-grade modules complete and 100% test coverage, this guide covers production-ready backend services, protocol servers, and enterprise infrastructure.

### **Complete Server Implementation Scope**
- **Complete L1-L3 Protocol Stack**: All 10 modules (Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab, Core, Network)
- **Enterprise Backend Services**: RESTful APIs, GraphQL, gRPC services with full MPLP integration
- **Production Database Integration**: PostgreSQL, MongoDB, Redis with optimized schemas
- **Enterprise Message Queues**: RabbitMQ, Apache Kafka, Redis Pub/Sub with MPLP protocols
- **Microservices Architecture**: Distributed service architecture with CoreOrchestrator
- **Enterprise Features**: Complete RBAC, audit logging, monitoring, scalability, security

### **Proven Server Architecture Patterns**
- **Unified DDD Architecture**: Identical DDD architecture across all 10 modules (proven in production)
- **Microservices Architecture**: Scalable service decomposition with CoreOrchestrator coordination
- **Event-Driven Architecture**: Asynchronous event processing with Trace module monitoring
- **CQRS Pattern**: Command Query Responsibility Segregation with Plan module optimization
- **Hexagonal Architecture**: Clean architecture principles with Extension module flexibility

---

## 🏗️ Core Server Implementation

### **Express.js Implementation**

#### **MPLP Express Server Setup**
```typescript
// src/server.ts
import express from 'express';
import { MPLPServer } from '@mplp/server';
import { DatabaseModule } from '@mplp/database';
import { SecurityModule } from '@mplp/security';
import { MonitoringModule } from '@mplp/monitoring';

// Initialize Express application
const app = express();

// Initialize MPLP server
const mplpServer = new MPLPServer({
  // Core configuration
  core: {
    protocolVersion: '1.0.0-alpha',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0'
  },
  
  // Database configuration
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mplp',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production',
    poolSize: 20,
    connectionTimeout: 30000
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'mplp:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  
  // Module configuration
  modules: {
    context: {
      enabled: true,
      config: {
        maxContextsPerUser: 1000,
        contextTimeoutHours: 24,
        enableContextSharing: true
      }
    },
    plan: {
      enabled: true,
      config: {
        maxPlansPerContext: 100,
        planExecutionTimeoutMinutes: 60,
        enablePlanOptimization: true
      }
    },
    role: {
      enabled: true,
      config: {
        enableRoleHierarchy: true,
        maxRolesPerUser: 50,
        roleInheritanceDepth: 5
      }
    },
    confirm: {
      enabled: true,
      config: {
        approvalTimeoutHours: 48,
        maxApproversPerRequest: 10,
        enableEscalation: true
      }
    },
    trace: {
      enabled: true,
      config: {
        traceRetentionDays: 30,
        enableDistributedTracing: true,
        samplingRate: 0.1
      }
    },
    extension: {
      enabled: true,
      config: {
        maxExtensionsPerModule: 20,
        enableHotReload: false,
        sandboxMode: true
      }
    },
    dialog: {
      enabled: true,
      config: {
        maxMessagesPerDialog: 10000,
        messageRetentionDays: 90,
        enableRealTimeUpdates: true
      }
    },
    collab: {
      enabled: true,
      config: {
        maxParticipantsPerCollaboration: 100,
        collaborationTimeoutHours: 168,
        enableAICoordination: true
      }
    },
    network: {
      enabled: true,
      config: {
        maxNodesPerTopology: 1000,
        networkOptimizationEnabled: true,
        enableIntelligentRouting: true
      }
    },
    core: {
      enabled: true,
      config: {
        orchestrationMode: 'intelligent',
        resourceOptimization: true,
        enablePredictiveScaling: true
      }
    }
  },
  
  // Security configuration
  security: {
    authentication: {
      jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
        issuer: 'mplp-server',
        audience: 'mplp-clients'
      },
      oauth2: {
        enabled: true,
        providers: ['google', 'github', 'microsoft']
      }
    },
    authorization: {
      rbac: {
        enabled: true,
        defaultRole: 'user',
        adminRole: 'admin'
      }
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
      skipSuccessfulRequests: false
    }
  },
  
  // Monitoring configuration
  monitoring: {
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      collectDefaultMetrics: true
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      transports: ['console', 'file']
    },
    tracing: {
      enabled: true,
      jaegerEndpoint: process.env.JAEGER_ENDPOINT,
      serviceName: 'mplp-server'
    },
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      timeout: 5000
    }
  }
});

// Apply middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply MPLP middleware
app.use(mplpServer.middleware.cors());
app.use(mplpServer.middleware.security());
app.use(mplpServer.middleware.rateLimit());
app.use(mplpServer.middleware.authentication());
app.use(mplpServer.middleware.logging());

// Mount MPLP routes
app.use('/api/v1', mplpServer.routes);

// Error handling middleware
app.use(mplpServer.middleware.errorHandler());

// Start server
async function startServer() {
  try {
    await mplpServer.initialize();
    
    const server = app.listen(mplpServer.config.core.port, mplpServer.config.core.host, () => {
      console.log(`MPLP Server running on ${mplpServer.config.core.host}:${mplpServer.config.core.port}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await mplpServer.shutdown();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start MPLP server:', error);
    process.exit(1);
  }
}

startServer();
```

#### **Module Service Implementation**
```typescript
// src/modules/context/services/context.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextEntity } from '../entities/context.entity';
import { CreateContextRequest, UpdateContextRequest } from '../dto/context.dto';
import { ContextMapper } from '../mappers/context.mapper';
import { CacheService } from '@mplp/cache';
import { EventEmitter } from '@mplp/events';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    @InjectRepository(ContextEntity)
    private readonly contextRepository: Repository<ContextEntity>,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter
  ) {}

  async createContext(request: CreateContextRequest): Promise<ContextEntity> {
    this.logger.log(`Creating context: ${request.contextId}`);
    
    try {
      // Validate request
      await this.validateCreateRequest(request);
      
      // Map request to entity
      const contextEntity = ContextMapper.fromCreateRequest(request);
      
      // Save to database
      const savedContext = await this.contextRepository.save(contextEntity);
      
      // Cache the context
      await this.cacheService.set(
        `context:${savedContext.contextId}`,
        savedContext,
        3600 // 1 hour TTL
      );
      
      // Emit event
      this.eventEmitter.emit('context.created', {
        contextId: savedContext.contextId,
        contextType: savedContext.contextType,
        createdBy: savedContext.createdBy,
        timestamp: savedContext.createdAt
      });
      
      this.logger.log(`Context created successfully: ${savedContext.contextId}`);
      return savedContext;
      
    } catch (error) {
      this.logger.error(`Failed to create context: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getContext(contextId: string): Promise<ContextEntity | null> {
    this.logger.debug(`Getting context: ${contextId}`);
    
    try {
      // Try cache first
      const cached = await this.cacheService.get<ContextEntity>(`context:${contextId}`);
      if (cached) {
        this.logger.debug(`Context found in cache: ${contextId}`);
        return cached;
      }
      
      // Query database
      const context = await this.contextRepository.findOne({
        where: { contextId },
        relations: ['contextData', 'contextMetadata']
      });
      
      if (context) {
        // Cache for future requests
        await this.cacheService.set(`context:${contextId}`, context, 3600);
      }
      
      return context;
      
    } catch (error) {
      this.logger.error(`Failed to get context: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateContext(contextId: string, request: UpdateContextRequest): Promise<ContextEntity> {
    this.logger.log(`Updating context: ${contextId}`);
    
    try {
      // Get existing context
      const existingContext = await this.getContext(contextId);
      if (!existingContext) {
        throw new Error(`Context not found: ${contextId}`);
      }
      
      // Apply updates
      const updatedContext = ContextMapper.applyUpdate(existingContext, request);
      
      // Save to database
      const savedContext = await this.contextRepository.save(updatedContext);
      
      // Update cache
      await this.cacheService.set(`context:${contextId}`, savedContext, 3600);
      
      // Emit event
      this.eventEmitter.emit('context.updated', {
        contextId: savedContext.contextId,
        updatedFields: Object.keys(request),
        updatedBy: request.updatedBy,
        timestamp: savedContext.updatedAt
      });
      
      this.logger.log(`Context updated successfully: ${contextId}`);
      return savedContext;
      
    } catch (error) {
      this.logger.error(`Failed to update context: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteContext(contextId: string): Promise<void> {
    this.logger.log(`Deleting context: ${contextId}`);
    
    try {
      // Check if context exists
      const context = await this.getContext(contextId);
      if (!context) {
        throw new Error(`Context not found: ${contextId}`);
      }
      
      // Delete from database
      await this.contextRepository.delete({ contextId });
      
      // Remove from cache
      await this.cacheService.delete(`context:${contextId}`);
      
      // Emit event
      this.eventEmitter.emit('context.deleted', {
        contextId: contextId,
        deletedAt: new Date()
      });
      
      this.logger.log(`Context deleted successfully: ${contextId}`);
      
    } catch (error) {
      this.logger.error(`Failed to delete context: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async validateCreateRequest(request: CreateContextRequest): Promise<void> {
    // Validate context ID format
    if (!/^ctx-[a-zA-Z0-9-]+$/.test(request.contextId)) {
      throw new Error('Invalid context ID format');
    }
    
    // Check for duplicate context ID
    const existing = await this.contextRepository.findOne({
      where: { contextId: request.contextId }
    });
    
    if (existing) {
      throw new Error(`Context already exists: ${request.contextId}`);
    }
    
    // Validate context type
    const validTypes = ['user_session', 'agent_interaction', 'workflow_execution', 'system_operation'];
    if (!validTypes.includes(request.contextType)) {
      throw new Error(`Invalid context type: ${request.contextType}`);
    }
  }
}
```

### **NestJS Implementation**

#### **MPLP NestJS Module**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MPLPModule } from '@mplp/nestjs';

// Import all MPLP modules
import { ContextModule } from './modules/context/context.module';
import { PlanModule } from './modules/plan/plan.module';
import { RoleModule } from './modules/role/role.module';
import { ConfirmModule } from './modules/confirm/confirm.module';
import { TraceModule } from './modules/trace/trace.module';
import { ExtensionModule } from './modules/extension/extension.module';
import { DialogModule } from './modules/dialog/dialog.module';
import { CollabModule } from './modules/collab/collab.module';
import { NetworkModule } from './modules/network/network.module';
import { CoreModule } from './modules/core/core.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production',
        extra: {
          max: 20,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    
    // MPLP Core
    MPLPModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        protocolVersion: '1.0.0-alpha',
        environment: configService.get('NODE_ENV'),
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        security: {
          jwtSecret: configService.get('JWT_SECRET'),
          encryptionKey: configService.get('ENCRYPTION_KEY'),
        },
        monitoring: {
          enabled: true,
          jaegerEndpoint: configService.get('JAEGER_ENDPOINT'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // MPLP Modules
    ContextModule,
    PlanModule,
    RoleModule,
    ConfirmModule,
    TraceModule,
    ExtensionModule,
    DialogModule,
    CollabModule,
    NetworkModule,
    CoreModule,
  ],
})
export class AppModule {}
```

### **Microservices Implementation**

#### **gRPC Service Implementation**
```typescript
// src/grpc/context.service.ts
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ContextService } from '../modules/context/services/context.service';
import { 
  CreateContextRequest, 
  CreateContextResponse,
  GetContextRequest,
  GetContextResponse,
  ContextUpdateStream
} from './proto/context';

@Controller()
export class ContextGrpcService {
  constructor(private readonly contextService: ContextService) {}

  @GrpcMethod('ContextService', 'CreateContext')
  async createContext(request: CreateContextRequest): Promise<CreateContextResponse> {
    const context = await this.contextService.createContext({
      contextId: request.contextId,
      contextType: request.contextType,
      contextData: request.contextData,
      createdBy: request.createdBy
    });

    return {
      success: true,
      context: {
        contextId: context.contextId,
        contextType: context.contextType,
        contextStatus: context.contextStatus,
        createdAt: context.createdAt.toISOString(),
        createdBy: context.createdBy
      }
    };
  }

  @GrpcMethod('ContextService', 'GetContext')
  async getContext(request: GetContextRequest): Promise<GetContextResponse> {
    const context = await this.contextService.getContext(request.contextId);
    
    if (!context) {
      return {
        success: false,
        error: 'Context not found'
      };
    }

    return {
      success: true,
      context: {
        contextId: context.contextId,
        contextType: context.contextType,
        contextStatus: context.contextStatus,
        contextData: context.contextData,
        createdAt: context.createdAt.toISOString(),
        updatedAt: context.updatedAt?.toISOString(),
        createdBy: context.createdBy
      }
    };
  }

  @GrpcStreamMethod('ContextService', 'StreamContextUpdates')
  streamContextUpdates(request: Observable<{ contextId: string }>): Observable<ContextUpdateStream> {
    const subject = new Subject<ContextUpdateStream>();
    
    request.subscribe(({ contextId }) => {
      // Subscribe to context updates
      this.contextService.subscribeToUpdates(contextId, (update) => {
        subject.next({
          contextId: update.contextId,
          updateType: update.updateType,
          updateData: update.updateData,
          timestamp: update.timestamp.toISOString()
        });
      });
    });

    return subject.asObservable();
  }
}
```

---

## 🔗 Related Documentation

- [Implementation Overview](./README.md) - Implementation guide overview
- [Client Implementation](./client-implementation.md) - Frontend implementation
- [Multi-Language Support](./multi-language-support.md) - Cross-language implementation
- [Performance Requirements](./performance-requirements.md) - Performance standards
- [Security Requirements](./security-requirements.md) - Security implementation
- [Deployment Models](./deployment-models.md) - Deployment strategies

---

**Server Implementation Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: This server implementation guide provides production-ready patterns for MPLP v1.0 Alpha backend services. Additional server frameworks and advanced features will be added in Beta release based on community feedback.
