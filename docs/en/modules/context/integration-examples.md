# Context Module Integration Examples

> **🌐 Language Navigation**: [English](integration-examples.md) | [中文](../../../zh-CN/modules/context/integration-examples.md)



**Multi-Agent Protocol Lifecycle Platform - Context Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Complete-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Patterns](https://img.shields.io/badge/patterns-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/context/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Context Module, demonstrating real-world usage patterns, cross-module integration scenarios, and best practices for building production applications with MPLP Context Module.

### **Integration Scenarios**
- **Basic Context Management**: Simple context creation and participant management
- **Cross-Module Integration**: Integration with Plan, Role, Trace, and other MPLP modules
- **Event-Driven Architecture**: Event-based communication and coordination
- **Real-Time Collaboration**: WebSocket-based real-time context synchronization
- **Enterprise Integration**: Integration with external systems and services
- **Microservices Architecture**: Context Module in distributed systems

### **Example Applications**
- **Collaborative Planning System**: Multi-agent planning and coordination
- **Task Management Platform**: Context-aware task assignment and tracking
- **Real-Time Analytics Dashboard**: Context-based data aggregation and visualization
- **IoT Device Coordination**: Context-based device management and control
- **Educational Platform**: Context-aware learning and collaboration

---

## 🚀 Basic Integration Examples

### **1. Simple Context Management Application**

#### **Express.js Integration**
```typescript
import express from 'express';
import { ContextModule } from '@mplp/context';
import { ContextService } from '@mplp/context/services';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Context Module
const contextModule = new ContextModule({
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  },
  cache: {
    type: 'redis',
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Get Context Service instance
const contextService = contextModule.getContextService();

// Basic CRUD operations
app.post('/contexts', async (req, res) => {
  try {
    const context = await contextService.createContext({
      name: req.body.name,
      type: req.body.type,
      configuration: req.body.configuration,
      metadata: req.body.metadata,
      createdBy: req.user?.id || 'anonymous'
    });

    res.status(201).json(context);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/contexts/:id', async (req, res) => {
  try {
    const context = await contextService.getContext(req.params.id);
    
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    res.json(context);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/contexts/:id/participants', async (req, res) => {
  try {
    const participant = await contextService.addParticipant(req.params.id, {
      agentId: req.body.agent_id,
      participantType: req.body.participant_type,
      displayName: req.body.display_name,
      capabilities: req.body.capabilities,
      roles: req.body.roles,
      configuration: req.body.configuration
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Context API server running on port ${PORT}`);
});
```

#### **NestJS Integration**
```typescript
// context.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { ContextEntity } from './entities/context.entity';
import { ParticipantEntity } from './entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContextEntity, ParticipantEntity])
  ],
  controllers: [ContextController],
  providers: [ContextService],
  exports: [ContextService]
})
export class ContextModule {}

// context.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContextService } from './context.service';
import { CreateContextDto, UpdateContextDto, AddParticipantDto } from './dto';

@ApiTags('contexts')
@Controller('api/v1/contexts')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new context' })
  @ApiResponse({ status: 201, description: 'Context created successfully' })
  async createContext(@Body() createContextDto: CreateContextDto) {
    return await this.contextService.createContext(createContextDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get context by ID' })
  @ApiResponse({ status: 200, description: 'Context retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Context not found' })
  async getContext(@Param('id') contextId: string) {
    return await this.contextService.getContext(contextId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update context' })
  @ApiResponse({ status: 200, description: 'Context updated successfully' })
  async updateContext(
    @Param('id') contextId: string,
    @Body() updateContextDto: UpdateContextDto
  ) {
    return await this.contextService.updateContext(contextId, updateContextDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete context' })
  @ApiResponse({ status: 204, description: 'Context deleted successfully' })
  async deleteContext(@Param('id') contextId: string) {
    await this.contextService.deleteContext(contextId);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to context' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  async addParticipant(
    @Param('id') contextId: string,
    @Body() addParticipantDto: AddParticipantDto
  ) {
    return await this.contextService.addParticipant(contextId, addParticipantDto);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'List context participants' })
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  async listParticipants(
    @Param('id') contextId: string,
    @Query('role') role?: string,
    @Query('status') status?: string
  ) {
    return await this.contextService.listParticipants(contextId, { role, status });
  }
}
```

### **2. Real-Time Context Synchronization**

#### **WebSocket Integration**
```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ContextService } from './context.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/contexts'
})
export class ContextGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private contextSubscriptions = new Map<string, Set<string>>(); // contextId -> Set of socketIds

  constructor(private readonly contextService: ContextService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Authenticate client
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return;
    }

    // Validate token and get user info
    try {
      const user = await this.validateToken(token);
      client.data.user = user;
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all context subscriptions
    for (const [contextId, subscribers] of this.contextSubscriptions.entries()) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.contextSubscriptions.delete(contextId);
      }
    }
  }

  @SubscribeMessage('subscribe_context')
  async handleSubscribeContext(client: Socket, data: { contextId: string }) {
    const { contextId } = data;
    
    // Verify user has access to context
    const hasAccess = await this.verifyContextAccess(client.data.user.id, contextId);
    if (!hasAccess) {
      client.emit('error', { message: 'Access denied to context' });
      return;
    }

    // Add client to context subscription
    if (!this.contextSubscriptions.has(contextId)) {
      this.contextSubscriptions.set(contextId, new Set());
    }
    this.contextSubscriptions.get(contextId)!.add(client.id);

    // Join socket room
    client.join(`context:${contextId}`);

    // Send current context state
    const context = await this.contextService.getContext(contextId);
    client.emit('context_state', context);

    console.log(`Client ${client.id} subscribed to context ${contextId}`);
  }

  @SubscribeMessage('unsubscribe_context')
  async handleUnsubscribeContext(client: Socket, data: { contextId: string }) {
    const { contextId } = data;
    
    // Remove client from context subscription
    const subscribers = this.contextSubscriptions.get(contextId);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.contextSubscriptions.delete(contextId);
      }
    }

    // Leave socket room
    client.leave(`context:${contextId}`);

    console.log(`Client ${client.id} unsubscribed from context ${contextId}`);
  }

  @SubscribeMessage('context_update')
  async handleContextUpdate(client: Socket, data: { contextId: string, updates: any }) {
    const { contextId, updates } = data;
    
    // Verify user has write access to context
    const hasWriteAccess = await this.verifyContextWriteAccess(client.data.user.id, contextId);
    if (!hasWriteAccess) {
      client.emit('error', { message: 'Write access denied to context' });
      return;
    }

    try {
      // Update context
      const updatedContext = await this.contextService.updateContext(contextId, updates);
      
      // Broadcast update to all subscribers
      this.server.to(`context:${contextId}`).emit('context_updated', {
        contextId,
        updates,
        updatedBy: client.data.user.id,
        timestamp: new Date().toISOString(),
        context: updatedContext
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('participant_activity')
  async handleParticipantActivity(client: Socket, data: { contextId: string, activity: any }) {
    const { contextId, activity } = data;
    
    // Verify user is participant in context
    const isParticipant = await this.verifyParticipantAccess(client.data.user.id, contextId);
    if (!isParticipant) {
      client.emit('error', { message: 'Not a participant in context' });
      return;
    }

    // Broadcast activity to other participants
    client.to(`context:${contextId}`).emit('participant_activity', {
      contextId,
      participantId: client.data.user.id,
      activity,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast context events to subscribers
  async broadcastContextEvent(contextId: string, event: string, data: any) {
    this.server.to(`context:${contextId}`).emit(event, {
      contextId,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  private async validateToken(token: string): Promise<any> {
    // Implement token validation logic
    // Return user object if valid, throw error if invalid
  }

  private async verifyContextAccess(userId: string, contextId: string): Promise<boolean> {
    // Implement access verification logic
    return true; // Placeholder
  }

  private async verifyContextWriteAccess(userId: string, contextId: string): Promise<boolean> {
    // Implement write access verification logic
    return true; // Placeholder
  }

  private async verifyParticipantAccess(userId: string, contextId: string): Promise<boolean> {
    // Implement participant verification logic
    return true; // Placeholder
  }
}
```

---

## 🔗 Cross-Module Integration Examples

### **1. Context + Plan Module Integration**

#### **Collaborative Planning System**
```typescript
import { ContextService } from '@mplp/context';
import { PlanService } from '@mplp/plan';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CollaborativePlanningService {
  constructor(
    private readonly contextService: ContextService,
    private readonly planService: PlanService,
    private readonly eventEmitter: EventEmitter2
  ) {
    // Set up event listeners for cross-module coordination
    this.setupEventListeners();
  }

  async createPlanningSession(request: CreatePlanningSessionRequest): Promise<PlanningSession> {
    // 1. Create context for planning session
    const context = await this.contextService.createContext({
      name: `Planning Session: ${request.name}`,
      type: 'collaborative',
      configuration: {
        maxParticipants: request.maxParticipants || 10,
        timeoutMs: request.durationMs || 7200000, // 2 hours default
        persistenceLevel: 'durable',
        isolationLevel: 'shared'
      },
      metadata: {
        tags: ['planning', 'collaborative'],
        category: 'planning-session',
        priority: request.priority || 'normal',
        customData: {
          planningType: request.planningType,
          objectives: request.objectives
        }
      },
      createdBy: request.createdBy
    });

    // 2. Create plan associated with context
    const plan = await this.planService.createPlan({
      name: request.name,
      contextId: context.contextId,
      type: 'collaborative',
      objectives: request.objectives.map(obj => ({
        description: obj.description,
        priority: obj.priority || 'normal',
        successCriteria: obj.successCriteria || []
      })),
      constraints: {
        deadline: request.deadline,
        maxConcurrentTasks: request.maxConcurrentTasks || 5,
        resourceLimits: request.resourceLimits
      },
      createdBy: request.createdBy
    });

    // 3. Add planning agents as participants
    const participants = [];
    for (const agent of request.planningAgents) {
      const participant = await this.contextService.addParticipant(context.contextId, {
        agentId: agent.agentId,
        participantType: 'agent',
        displayName: agent.displayName,
        capabilities: agent.capabilities,
        roles: ['planner', 'contributor'],
        configuration: {
          maxConcurrentTasks: agent.maxConcurrentTasks || 3,
          timeoutMs: 600000, // 10 minutes
          notificationPreferences: {
            email: false,
            push: true,
            inApp: true
          }
        }
      });
      participants.push(participant);
    }

    // 4. Set up plan execution context
    await this.planService.setExecutionContext(plan.planId, {
      contextId: context.contextId,
      participantIds: participants.map(p => p.participantId),
      coordinationMode: 'collaborative',
      conflictResolution: 'consensus'
    });

    // 5. Create planning session object
    const planningSession: PlanningSession = {
      sessionId: this.generateSessionId(),
      contextId: context.contextId,
      planId: plan.planId,
      name: request.name,
      status: 'active',
      participants: participants.map(p => ({
        participantId: p.participantId,
        agentId: p.agentId,
        displayName: p.displayName,
        roles: p.roles,
        status: p.status
      })),
      objectives: request.objectives,
      createdAt: new Date(),
      startedAt: new Date(),
      configuration: {
        maxParticipants: request.maxParticipants || 10,
        durationMs: request.durationMs || 7200000,
        planningType: request.planningType,
        collaborationMode: 'real-time'
      }
    };

    // 6. Emit planning session created event
    await this.eventEmitter.emitAsync('planning.session.created', {
      sessionId: planningSession.sessionId,
      contextId: context.contextId,
      planId: plan.planId,
      participantCount: participants.length,
      createdBy: request.createdBy,
      timestamp: new Date().toISOString()
    });

    return planningSession;
  }

  async executePlanningSession(sessionId: string): Promise<PlanningExecution> {
    const session = await this.getPlanningSession(sessionId);
    if (!session) {
      throw new PlanningSessionNotFoundError(sessionId);
    }

    // 1. Start plan execution
    const execution = await this.planService.executePlan(session.planId, {
      executionMode: 'collaborative',
      contextId: session.contextId,
      monitoringEnabled: true,
      progressReporting: {
        interval: 30000, // 30 seconds
        includeMetrics: true,
        notifyParticipants: true
      }
    });

    // 2. Set up real-time coordination
    await this.setupRealTimeCoordination(session);

    // 3. Monitor planning progress
    this.monitorPlanningProgress(session, execution);

    return {
      executionId: execution.executionId,
      sessionId: session.sessionId,
      status: 'running',
      startedAt: new Date(),
      estimatedCompletion: this.calculateEstimatedCompletion(session),
      participants: session.participants,
      progress: {
        completedObjectives: 0,
        totalObjectives: session.objectives.length,
        currentPhase: 'planning',
        nextMilestone: session.objectives[0]?.description
      }
    };
  }

  private setupEventListeners(): void {
    // Listen for context events
    this.eventEmitter.on('context.participant.joined', async (event) => {
      await this.handleParticipantJoined(event);
    });

    this.eventEmitter.on('context.participant.left', async (event) => {
      await this.handleParticipantLeft(event);
    });

    // Listen for plan events
    this.eventEmitter.on('plan.execution.started', async (event) => {
      await this.handlePlanExecutionStarted(event);
    });

    this.eventEmitter.on('plan.task.completed', async (event) => {
      await this.handlePlanTaskCompleted(event);
    });

    this.eventEmitter.on('plan.execution.completed', async (event) => {
      await this.handlePlanExecutionCompleted(event);
    });
  }

  private async handleParticipantJoined(event: any): Promise<void> {
    // Update planning session when new participant joins
    const session = await this.findPlanningSessionByContextId(event.contextId);
    if (session) {
      // Notify other participants
      await this.eventEmitter.emitAsync('planning.participant.joined', {
        sessionId: session.sessionId,
        participantId: event.participantId,
        agentId: event.agentId,
        timestamp: event.timestamp
      });

      // Update plan with new participant
      await this.planService.addPlanParticipant(session.planId, {
        participantId: event.participantId,
        roles: event.roles,
        capabilities: event.capabilities
      });
    }
  }

  private async handlePlanTaskCompleted(event: any): Promise<void> {
    // Update context when plan task is completed
    const plan = await this.planService.getPlan(event.planId);
    if (plan && plan.contextId) {
      // Notify context participants
      await this.eventEmitter.emitAsync('context.task.completed', {
        contextId: plan.contextId,
        taskId: event.taskId,
        completedBy: event.completedBy,
        timestamp: event.timestamp
      });

      // Update context metadata
      await this.contextService.updateMetadata(plan.contextId, 'lastTaskCompleted', {
        taskId: event.taskId,
        completedBy: event.completedBy,
        completedAt: event.timestamp
      });
    }
  }
}
```

### **2. Context + Role Module Integration**

#### **Role-Based Context Access Control**
```typescript
import { ContextService } from '@mplp/context';
import { RoleService } from '@mplp/role';

@Injectable()
export class ContextAccessControlService {
  constructor(
    private readonly contextService: ContextService,
    private readonly roleService: RoleService
  ) {}

  async createContextWithRoles(request: CreateContextWithRolesRequest): Promise<Context> {
    // 1. Create context
    const context = await this.contextService.createContext({
      name: request.name,
      type: request.type,
      configuration: request.configuration,
      metadata: {
        ...request.metadata,
        accessControl: {
          enabled: true,
          defaultRole: request.defaultRole || 'viewer',
          requiresApproval: request.requiresApproval || false
        }
      },
      createdBy: request.createdBy
    });

    // 2. Set up context roles
    for (const roleDefinition of request.roles) {
      await this.roleService.createContextRole({
        contextId: context.contextId,
        roleName: roleDefinition.name,
        permissions: roleDefinition.permissions,
        description: roleDefinition.description,
        isDefault: roleDefinition.isDefault || false,
        autoAssign: roleDefinition.autoAssign || false
      });
    }

    // 3. Assign initial roles to creator
    await this.roleService.assignUserRole({
      userId: request.createdBy,
      contextId: context.contextId,
      roleName: 'admin',
      assignedBy: 'system',
      expiresAt: null // Permanent assignment
    });

    return context;
  }

  async addParticipantWithRoleValidation(
    contextId: string,
    participantRequest: AddParticipantRequest,
    requestedBy: string
  ): Promise<Participant> {
    // 1. Validate requester has permission to add participants
    const hasPermission = await this.roleService.checkPermission({
      userId: requestedBy,
      contextId,
      permission: 'participants:add'
    });

    if (!hasPermission) {
      throw new InsufficientPermissionsError('Cannot add participants to context');
    }

    // 2. Determine appropriate roles for participant
    const participantRoles = await this.determineParticipantRoles(
      contextId,
      participantRequest.capabilities,
      participantRequest.participantType
    );

    // 3. Add participant to context
    const participant = await this.contextService.addParticipant(contextId, {
      ...participantRequest,
      roles: participantRoles
    });

    // 4. Assign roles in role module
    for (const roleName of participantRoles) {
      await this.roleService.assignUserRole({
        userId: participant.agentId,
        contextId,
        roleName,
        assignedBy: requestedBy,
        expiresAt: null
      });
    }

    return participant;
  }

  private async determineParticipantRoles(
    contextId: string,
    capabilities: string[],
    participantType: string
  ): Promise<string[]> {
    // Get available roles for context
    const contextRoles = await this.roleService.getContextRoles(contextId);
    
    // Role assignment logic based on capabilities and type
    const assignedRoles: string[] = [];

    // Default role assignment
    const defaultRole = contextRoles.find(role => role.isDefault);
    if (defaultRole) {
      assignedRoles.push(defaultRole.name);
    }

    // Capability-based role assignment
    if (capabilities.includes('planning')) {
      const plannerRole = contextRoles.find(role => role.name === 'planner');
      if (plannerRole) {
        assignedRoles.push('planner');
      }
    }

    if (capabilities.includes('analysis')) {
      const analystRole = contextRoles.find(role => role.name === 'analyst');
      if (analystRole) {
        assignedRoles.push('analyst');
      }
    }

    // Type-based role assignment
    if (participantType === 'agent') {
      assignedRoles.push('contributor');
    } else if (participantType === 'human') {
      assignedRoles.push('reviewer');
    }

    return [...new Set(assignedRoles)]; // Remove duplicates
  }
}
```

---

## 🔗 Related Documentation

- [Context Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Integration Examples Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Examples**: Production Ready  

**⚠️ Alpha Notice**: These integration examples are production-ready and comprehensive in Alpha release. Additional integration patterns and examples will be added based on community feedback and real-world usage in Beta release.
