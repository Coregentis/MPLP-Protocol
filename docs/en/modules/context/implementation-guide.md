# Context Module Implementation Guide

**Multi-Agent Protocol Lifecycle Platform - Context Module Implementation Guide v1.0.0-alpha**

[![Implementation](https://img.shields.io/badge/implementation-Production%20Ready-green.svg)](./README.md)
[![Module](https://img.shields.io/badge/module-Context-green.svg)](./protocol-specification.md)
[![Examples](https://img.shields.io/badge/examples-Complete-blue.svg)](./integration-examples.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/context/implementation-guide.md)

---

## 🎯 Implementation Overview

This guide provides comprehensive implementation guidance for the Context Module, including architecture patterns, code examples, best practices, and integration strategies. It covers both basic implementation scenarios and advanced enterprise-grade deployments.

### **Implementation Scope**
- **Core Services**: Context, Participant, Session, and Metadata services
- **Data Layer**: Repository patterns and data persistence strategies
- **Integration Layer**: Cross-module integration and event handling
- **Performance Layer**: Caching, optimization, and scalability patterns
- **Security Layer**: Authentication, authorization, and data protection

### **Target Implementations**
- **Standalone Service**: Independent Context Module deployment
- **Microservices Architecture**: Context Module as part of MPLP ecosystem
- **Embedded Integration**: Context Module embedded in applications
- **Cloud-Native Deployment**: Kubernetes and container-based deployment

---

## 🏗️ Architecture Implementation

### **Core Service Implementation**

#### **Context Service Implementation**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContextRepository } from './repositories/context.repository';
import { ContextValidator } from './validators/context.validator';
import { ContextMapper } from './mappers/context.mapper';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private readonly contextRepository: ContextRepository,
    private readonly contextValidator: ContextValidator,
    private readonly contextMapper: ContextMapper,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createContext(request: CreateContextRequest): Promise<Context> {
    this.logger.log(`Creating context: ${request.name}`);

    // Validate request
    await this.contextValidator.validateCreateRequest(request);

    // Create context entity
    const contextData = {
      contextId: this.generateContextId(),
      name: request.name,
      type: request.type,
      status: ContextStatus.Creating,
      configuration: this.buildConfiguration(request.configuration),
      metadata: request.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to repository
    const context = await this.contextRepository.create(contextData);

    // Transition to active state
    await this.transitionContextState(context.contextId, ContextStatus.Active);

    // Emit context created event
    await this.eventEmitter.emitAsync('context.created', {
      contextId: context.contextId,
      contextType: context.type,
      createdBy: request.createdBy,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Context created successfully: ${context.contextId}`);
    return this.contextMapper.toResponse(context);
  }

  async getContext(contextId: string): Promise<Context | null> {
    this.logger.debug(`Retrieving context: ${contextId}`);

    const context = await this.contextRepository.findById(contextId);
    if (!context) {
      return null;
    }

    return this.contextMapper.toResponse(context);
  }

  async updateContext(
    contextId: string, 
    updates: UpdateContextRequest
  ): Promise<Context> {
    this.logger.log(`Updating context: ${contextId}`);

    // Validate updates
    await this.contextValidator.validateUpdateRequest(contextId, updates);

    // Get current context
    const currentContext = await this.contextRepository.findById(contextId);
    if (!currentContext) {
      throw new ContextNotFoundError(contextId);
    }

    // Apply updates
    const updatedData = {
      ...currentContext,
      ...updates,
      updatedAt: new Date()
    };

    // Save updates
    const updatedContext = await this.contextRepository.update(contextId, updatedData);

    // Emit context updated event
    await this.eventEmitter.emitAsync('context.updated', {
      contextId,
      changes: updates,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Context updated successfully: ${contextId}`);
    return this.contextMapper.toResponse(updatedContext);
  }

  async deleteContext(contextId: string): Promise<void> {
    this.logger.log(`Deleting context: ${contextId}`);

    // Validate deletion
    await this.contextValidator.validateDeletion(contextId);

    // Transition to terminating state
    await this.transitionContextState(contextId, ContextStatus.Terminating);

    // Clean up participants and sessions
    await this.cleanupContextResources(contextId);

    // Delete from repository
    await this.contextRepository.delete(contextId);

    // Emit context deleted event
    await this.eventEmitter.emitAsync('context.deleted', {
      contextId,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Context deleted successfully: ${contextId}`);
  }

  private generateContextId(): string {
    return `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildConfiguration(config: Partial<ContextConfiguration>): ContextConfiguration {
    return {
      maxParticipants: config.maxParticipants || 10,
      maxSessions: config.maxSessions || 5,
      timeoutMs: config.timeoutMs || 3600000,
      persistenceLevel: config.persistenceLevel || 'session',
      isolationLevel: config.isolationLevel || 'shared',
      autoCleanup: config.autoCleanup ?? true,
      cleanupDelayMs: config.cleanupDelayMs || 300000
    };
  }

  private async transitionContextState(
    contextId: string, 
    newStatus: ContextStatus
  ): Promise<void> {
    await this.contextRepository.updateStatus(contextId, newStatus);
    
    await this.eventEmitter.emitAsync('context.state.changed', {
      contextId,
      newStatus,
      timestamp: new Date().toISOString()
    });
  }

  private async cleanupContextResources(contextId: string): Promise<void> {
    // Remove all participants
    await this.contextRepository.removeAllParticipants(contextId);
    
    // Clean up all sessions
    await this.contextRepository.removeAllSessions(contextId);
    
    // Clear metadata
    await this.contextRepository.clearMetadata(contextId);
  }
}
```

#### **Participant Service Implementation**
```typescript
@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly contextRepository: ContextRepository,
    private readonly participantValidator: ParticipantValidator,
    private readonly participantMapper: ParticipantMapper,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async addParticipant(
    contextId: string,
    participantRequest: AddParticipantRequest
  ): Promise<Participant> {
    this.logger.log(`Adding participant to context: ${contextId}`);

    // Validate request
    await this.participantValidator.validateAddRequest(contextId, participantRequest);

    // Check context capacity
    await this.validateContextCapacity(contextId);

    // Create participant entity
    const participantData = {
      participantId: this.generateParticipantId(),
      agentId: participantRequest.agentId,
      contextId,
      participantType: participantRequest.participantType,
      displayName: participantRequest.displayName,
      status: ParticipantStatus.Joining,
      roles: participantRequest.roles || [],
      capabilities: participantRequest.capabilities || [],
      permissions: this.calculatePermissions(participantRequest.roles),
      configuration: this.buildParticipantConfiguration(participantRequest.configuration),
      metadata: participantRequest.metadata || {},
      joinedAt: new Date(),
      lastActivityAt: new Date()
    };

    // Save participant
    const participant = await this.participantRepository.create(participantData);

    // Update context participant count
    await this.contextRepository.incrementParticipantCount(contextId);

    // Transition to active state
    await this.transitionParticipantState(
      contextId, 
      participant.participantId, 
      ParticipantStatus.Active
    );

    // Emit participant joined event
    await this.eventEmitter.emitAsync('context.participant.joined', {
      contextId,
      participantId: participant.participantId,
      agentId: participant.agentId,
      participantType: participant.participantType,
      roles: participant.roles,
      capabilities: participant.capabilities,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Participant added successfully: ${participant.participantId}`);
    return this.participantMapper.toResponse(participant);
  }

  async removeParticipant(
    contextId: string,
    participantId: string,
    reason: RemovalReason = RemovalReason.UserRequest
  ): Promise<void> {
    this.logger.log(`Removing participant from context: ${contextId}/${participantId}`);

    // Validate removal
    await this.participantValidator.validateRemoval(contextId, participantId, reason);

    // Get participant
    const participant = await this.participantRepository.findById(contextId, participantId);
    if (!participant) {
      throw new ParticipantNotFoundError(contextId, participantId);
    }

    // Transition to leaving state
    await this.transitionParticipantState(
      contextId, 
      participantId, 
      ParticipantStatus.Leaving
    );

    // Handle ongoing activities
    await this.handleOngoingActivities(contextId, participantId);

    // Remove participant
    await this.participantRepository.delete(contextId, participantId);

    // Update context participant count
    await this.contextRepository.decrementParticipantCount(contextId);

    // Emit participant left event
    await this.eventEmitter.emitAsync('context.participant.left', {
      contextId,
      participantId,
      agentId: participant.agentId,
      reason,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`Participant removed successfully: ${participantId}`);
  }

  private generateParticipantId(): string {
    return `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePermissions(roles: string[]): string[] {
    const rolePermissions = {
      'contributor': ['read', 'write', 'comment'],
      'reviewer': ['read', 'comment', 'approve'],
      'admin': ['read', 'write', 'comment', 'approve', 'manage'],
      'viewer': ['read']
    };

    const permissions = new Set<string>();
    roles.forEach(role => {
      const rolePerms = rolePermissions[role] || [];
      rolePerms.forEach(perm => permissions.add(perm));
    });

    return Array.from(permissions);
  }

  private async validateContextCapacity(contextId: string): Promise<void> {
    const context = await this.contextRepository.findById(contextId);
    if (!context) {
      throw new ContextNotFoundError(contextId);
    }

    if (context.participantCount >= context.configuration.maxParticipants) {
      throw new ContextFullError(contextId);
    }
  }

  private async transitionParticipantState(
    contextId: string,
    participantId: string,
    newStatus: ParticipantStatus
  ): Promise<void> {
    await this.participantRepository.updateStatus(contextId, participantId, newStatus);
    
    await this.eventEmitter.emitAsync('participant.state.changed', {
      contextId,
      participantId,
      newStatus,
      timestamp: new Date().toISOString()
    });
  }

  private async handleOngoingActivities(
    contextId: string,
    participantId: string
  ): Promise<void> {
    // Cancel ongoing tasks
    await this.eventEmitter.emitAsync('participant.tasks.cancel', {
      contextId,
      participantId,
      timestamp: new Date().toISOString()
    });

    // Transfer ownership of shared resources
    await this.eventEmitter.emitAsync('participant.resources.transfer', {
      contextId,
      participantId,
      timestamp: new Date().toISOString()
    });
  }
}
```

### **Data Layer Implementation**

#### **Context Repository Implementation**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextEntity } from './entities/context.entity';

@Injectable()
export class ContextRepository {
  constructor(
    @InjectRepository(ContextEntity)
    private readonly repository: Repository<ContextEntity>
  ) {}

  async create(contextData: Partial<ContextEntity>): Promise<ContextEntity> {
    const context = this.repository.create(contextData);
    return await this.repository.save(context);
  }

  async findById(contextId: string): Promise<ContextEntity | null> {
    return await this.repository.findOne({
      where: { contextId },
      relations: ['participants', 'sessions']
    });
  }

  async findByType(type: ContextType): Promise<ContextEntity[]> {
    return await this.repository.find({
      where: { type },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: ContextStatus): Promise<ContextEntity[]> {
    return await this.repository.find({
      where: { status },
      order: { updatedAt: 'DESC' }
    });
  }

  async update(
    contextId: string, 
    updates: Partial<ContextEntity>
  ): Promise<ContextEntity> {
    await this.repository.update({ contextId }, updates);
    return await this.findById(contextId);
  }

  async updateStatus(contextId: string, status: ContextStatus): Promise<void> {
    await this.repository.update(
      { contextId }, 
      { status, updatedAt: new Date() }
    );
  }

  async delete(contextId: string): Promise<void> {
    await this.repository.delete({ contextId });
  }

  async incrementParticipantCount(contextId: string): Promise<void> {
    await this.repository.increment(
      { contextId }, 
      'participantCount', 
      1
    );
  }

  async decrementParticipantCount(contextId: string): Promise<void> {
    await this.repository.decrement(
      { contextId }, 
      'participantCount', 
      1
    );
  }

  async findExpiredContexts(): Promise<ContextEntity[]> {
    return await this.repository
      .createQueryBuilder('context')
      .where('context.expiresAt < :now', { now: new Date() })
      .andWhere('context.status != :terminated', { terminated: ContextStatus.Terminated })
      .getMany();
  }

  async getContextHealth(contextId: string): Promise<ContextHealth> {
    const context = await this.findById(contextId);
    if (!context) {
      throw new ContextNotFoundError(contextId);
    }

    // Calculate health metrics
    const health: ContextHealth = {
      contextId,
      timestamp: new Date().toISOString(),
      overallHealth: this.calculateOverallHealth(context),
      components: {
        contextService: await this.getComponentHealth('context'),
        participantService: await this.getComponentHealth('participant'),
        sessionService: await this.getComponentHealth('session'),
        metadataService: await this.getComponentHealth('metadata')
      },
      performance: await this.getPerformanceMetrics(contextId),
      capacity: this.getCapacityMetrics(context),
      issues: await this.getHealthIssues(contextId),
      alerts: await this.getActiveAlerts(contextId),
      recommendations: await this.getRecommendations(contextId)
    };

    return health;
  }

  private calculateOverallHealth(context: ContextEntity): HealthStatus {
    // Implement health calculation logic
    if (context.status === ContextStatus.Active && context.participantCount > 0) {
      return HealthStatus.Healthy;
    } else if (context.status === ContextStatus.Paused) {
      return HealthStatus.Degraded;
    } else {
      return HealthStatus.Unhealthy;
    }
  }
}
```

### **Caching Implementation**

#### **Context Cache Service**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@nestjs-modules/ioredis';

@Injectable()
export class ContextCacheService {
  private readonly logger = new Logger(ContextCacheService.name);
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(private readonly redisService: RedisService) {}

  async getContext(contextId: string): Promise<Context | null> {
    try {
      const cached = await this.redisService.get(`context:${contextId}`);
      if (cached) {
        this.logger.debug(`Cache hit for context: ${contextId}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for context ${contextId}:`, error);
      return null;
    }
  }

  async setContext(context: Context, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await this.redisService.setex(
        `context:${context.contextId}`,
        ttl,
        JSON.stringify(context)
      );
      this.logger.debug(`Context cached: ${context.contextId}`);
    } catch (error) {
      this.logger.error(`Cache set error for context ${context.contextId}:`, error);
    }
  }

  async invalidateContext(contextId: string): Promise<void> {
    try {
      await this.redisService.del(`context:${contextId}`);
      this.logger.debug(`Context cache invalidated: ${contextId}`);
    } catch (error) {
      this.logger.error(`Cache invalidation error for context ${contextId}:`, error);
    }
  }

  async getParticipants(contextId: string): Promise<Participant[] | null> {
    try {
      const cached = await this.redisService.get(`participants:${contextId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for participants ${contextId}:`, error);
      return null;
    }
  }

  async setParticipants(
    contextId: string, 
    participants: Participant[], 
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      await this.redisService.setex(
        `participants:${contextId}`,
        ttl,
        JSON.stringify(participants)
      );
    } catch (error) {
      this.logger.error(`Cache set error for participants ${contextId}:`, error);
    }
  }

  async invalidateParticipants(contextId: string): Promise<void> {
    try {
      await this.redisService.del(`participants:${contextId}`);
    } catch (error) {
      this.logger.error(`Cache invalidation error for participants ${contextId}:`, error);
    }
  }
}
```

---

## 🔌 Integration Implementation

### **Event-Driven Integration**

#### **Event Handler Implementation**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ContextEventHandler {
  private readonly logger = new Logger(ContextEventHandler.name);

  @OnEvent('context.created')
  async handleContextCreated(event: ContextCreatedEvent): Promise<void> {
    this.logger.log(`Handling context created event: ${event.contextId}`);

    // Integrate with Plan Module
    await this.createDefaultPlan(event);

    // Integrate with Role Module
    await this.initializeContextRoles(event);

    // Integrate with Trace Module
    await this.setupContextMonitoring(event);
  }

  @OnEvent('context.participant.joined')
  async handleParticipantJoined(event: ParticipantJoinedEvent): Promise<void> {
    this.logger.log(`Handling participant joined event: ${event.participantId}`);

    // Assign default roles based on capabilities
    await this.assignDefaultRoles(event);

    // Create participant workspace
    await this.createParticipantWorkspace(event);

    // Send welcome notification
    await this.sendWelcomeNotification(event);
  }

  @OnEvent('context.deleted')
  async handleContextDeleted(event: ContextDeletedEvent): Promise<void> {
    this.logger.log(`Handling context deleted event: ${event.contextId}`);

    // Clean up related plans
    await this.cleanupContextPlans(event);

    // Remove role assignments
    await this.cleanupContextRoles(event);

    // Stop monitoring
    await this.stopContextMonitoring(event);
  }

  private async createDefaultPlan(event: ContextCreatedEvent): Promise<void> {
    // Integration with Plan Module
    // Implementation depends on Plan Module API
  }

  private async initializeContextRoles(event: ContextCreatedEvent): Promise<void> {
    // Integration with Role Module
    // Implementation depends on Role Module API
  }

  private async setupContextMonitoring(event: ContextCreatedEvent): Promise<void> {
    // Integration with Trace Module
    // Implementation depends on Trace Module API
  }
}
```

---

## 🔗 Related Documentation

- [Context Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Implementation Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: This implementation guide provides production-ready patterns and examples in Alpha release. Additional implementation patterns and optimizations will be added based on community feedback in Beta release.
