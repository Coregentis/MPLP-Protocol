# Context模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/context/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Context模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Complete-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![模式](https://img.shields.io/badge/patterns-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/context/integration-examples.md)

---

## 🎯 集成概览

本文档提供Context模块的全面集成示例，展示真实世界的使用模式、跨模块集成场景，以及使用MPLP Context模块构建生产应用程序的最佳实践。

### **集成场景**
- **基础上下文管理**: 简单的上下文创建和参与者管理
- **跨模块集成**: 与Plan、Role、Trace和其他MPLP模块的集成
- **事件驱动架构**: 基于事件的通信和协调
- **实时协作**: 基于WebSocket的实时上下文同步
- **企业集成**: 与外部系统和服务的集成
- **微服务架构**: 分布式系统中的Context模块

### **示例应用**
- **协作规划系统**: 多智能体规划和协调
- **任务管理平台**: 上下文感知的任务分配和跟踪
- **实时分析仪表板**: 基于上下文的数据聚合和可视化
- **IoT设备协调**: 基于上下文的设备管理和控制
- **教育平台**: 上下文感知的学习和协作

---

## 🚀 基础集成示例

### **1. 简单上下文管理应用**

#### **Express.js集成**
```typescript
import express from 'express';
import { ContextModule } from '@mplp/context';
import { ContextService } from '@mplp/context/services';

// 初始化Express应用
const app = express();
app.use(express.json());

// 初始化Context模块
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

// 获取Context服务实例
const contextService = contextModule.getContextService();

// 基础CRUD操作
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
      return res.status(404).json({ error: '上下文未找到' });
    }

    res.json(context);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/contexts/:id/participants', async (req, res) => {
  try {
    const participant = await contextService.addParticipant(req.params.id, {
      userId: req.body.userId,
      role: req.body.role,
      capabilities: req.body.capabilities
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/contexts/:contextId/participants/:participantId', async (req, res) => {
  try {
    await contextService.removeParticipant(
      req.params.contextId, 
      req.params.participantId
    );

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Context服务器运行在端口 ${PORT}`);
});
```

### **2. 跨模块集成示例**

#### **与Plan模块集成**
```typescript
import { ContextModule } from '@mplp/context';
import { PlanModule } from '@mplp/plan';
import { EventEmitter2 } from '@nestjs/event-emitter';

// 初始化模块
const contextModule = new ContextModule(contextConfig);
const planModule = new PlanModule(planConfig);
const eventEmitter = new EventEmitter2();

// 设置跨模块事件监听
contextModule.on('context.created', async (event) => {
  console.log('上下文创建事件:', event);
  
  // 为新上下文创建默认计划
  const defaultPlan = await planModule.createPlan({
    planName: `${event.contextType}默认计划`,
    contextId: event.contextId,
    planType: 'context_initialization',
    createdBy: event.createdBy
  });
  
  // 将计划关联到上下文
  await contextModule.updateContextMetadata(event.contextId, {
    defaultPlanId: defaultPlan.planId,
    planningEnabled: true
  });
});

contextModule.on('participant.joined', async (event) => {
  console.log('参与者加入事件:', event);
  
  // 为新参与者分配计划任务
  const contextPlans = await planModule.getPlansByContext(event.contextId);
  
  for (const plan of contextPlans) {
    await planModule.assignParticipantToPlan(plan.planId, {
      participantId: event.participantId,
      role: event.role,
      assignedAt: new Date()
    });
  }
});

// 监听计划完成事件
planModule.on('plan.completed', async (event) => {
  // 更新上下文状态
  await contextModule.updateContextStatus(event.contextId, {
    status: 'plan_completed',
    completedAt: new Date(),
    completionMetadata: {
      planId: event.planId,
      completionRate: event.completionRate
    }
  });
});
```

#### **与Role模块集成**
```typescript
import { RoleModule } from '@mplp/role';

// 初始化Role模块
const roleModule = new RoleModule(roleConfig);

// 扩展Context服务以支持角色验证
class EnhancedContextService extends ContextService {
  constructor(
    contextRepository: ContextRepository,
    private roleModule: RoleModule
  ) {
    super(contextRepository);
  }

  async addParticipantWithRoleValidation(
    contextId: string,
    request: AddParticipantRequest
  ): Promise<Participant> {
    // 验证用户角色权限
    const hasPermission = await this.roleModule.checkPermission(
      request.userId,
      'context:participate',
      { contextId }
    );

    if (!hasPermission) {
      throw new Error('用户没有参与此上下文的权限');
    }

    // 验证角色有效性
    if (request.role) {
      const roleExists = await this.roleModule.roleExists(request.role);
      if (!roleExists) {
        throw new Error(`角色不存在: ${request.role}`);
      }
    }

    // 添加参与者
    return super.addParticipant(contextId, request);
  }

  async updateParticipantRoleWithValidation(
    participantId: string,
    newRole: string,
    updatedBy: string
  ): Promise<Participant> {
    // 验证更新者权限
    const hasPermission = await this.roleModule.checkPermission(
      updatedBy,
      'context:manage_participants'
    );

    if (!hasPermission) {
      throw new Error('没有管理参与者的权限');
    }

    // 验证新角色
    const roleExists = await this.roleModule.roleExists(newRole);
    if (!roleExists) {
      throw new Error(`角色不存在: ${newRole}`);
    }

    // 更新角色
    return super.updateParticipantRole(participantId, newRole);
  }
}
```

### **3. 实时协作集成**

#### **WebSocket实时同步**
```typescript
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

// 创建HTTP服务器和Socket.IO服务器
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Context实时同步服务
class ContextRealtimeService {
  constructor(
    private contextService: ContextService,
    private io: SocketIOServer
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // 监听上下文事件
    this.contextService.on('context.updated', (event) => {
      this.io.to(`context:${event.contextId}`).emit('context_updated', {
        contextId: event.contextId,
        changes: event.changes,
        timestamp: event.timestamp
      });
    });

    this.contextService.on('participant.joined', (event) => {
      this.io.to(`context:${event.contextId}`).emit('participant_joined', {
        contextId: event.contextId,
        participant: event.participant,
        timestamp: event.timestamp
      });
    });

    this.contextService.on('participant.left', (event) => {
      this.io.to(`context:${event.contextId}`).emit('participant_left', {
        contextId: event.contextId,
        participantId: event.participantId,
        timestamp: event.timestamp
      });
    });
  }

  handleConnection(socket: any) {
    console.log('客户端连接:', socket.id);

    // 加入上下文房间
    socket.on('join_context', async (data: { contextId: string, userId: string }) => {
      try {
        // 验证用户权限
        const hasAccess = await this.contextService.checkContextAccess(
          data.contextId, 
          data.userId
        );

        if (hasAccess) {
          socket.join(`context:${data.contextId}`);
          socket.emit('joined_context', { contextId: data.contextId });
          
          // 发送当前上下文状态
          const context = await this.contextService.getContext(data.contextId);
          socket.emit('context_state', context);
        } else {
          socket.emit('access_denied', { contextId: data.contextId });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // 离开上下文房间
    socket.on('leave_context', (data: { contextId: string }) => {
      socket.leave(`context:${data.contextId}`);
      socket.emit('left_context', { contextId: data.contextId });
    });

    // 实时上下文更新
    socket.on('update_context', async (data: { contextId: string, updates: any }) => {
      try {
        const updatedContext = await this.contextService.updateContext(
          data.contextId, 
          data.updates
        );
        
        // 广播更新到所有房间成员
        this.io.to(`context:${data.contextId}`).emit('context_updated', {
          contextId: data.contextId,
          updates: data.updates,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('客户端断开连接:', socket.id);
    });
  }
}

// 初始化实时服务
const realtimeService = new ContextRealtimeService(contextService, io);

// 处理Socket.IO连接
io.on('connection', (socket) => {
  realtimeService.handleConnection(socket);
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`实时Context服务器运行在端口 ${PORT}`);
});
```

### **4. 企业级集成示例**

#### **与外部系统集成**
```typescript
// 企业级Context管理器
class EnterpriseContextManager {
  constructor(
    private contextService: ContextService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}

  async createEnterpriseContext(request: CreateEnterpriseContextRequest): Promise<Context> {
    // 审计日志
    await this.auditService.logAction({
      action: 'context.create',
      userId: request.createdBy,
      resource: 'context',
      details: {
        contextName: request.name,
        contextType: request.type
      }
    });

    // 创建上下文
    const context = await this.contextService.createContext(request);

    // 发送通知
    await this.notificationService.sendNotification({
      type: 'context_created',
      recipients: request.stakeholders || [],
      data: {
        contextId: context.contextId,
        contextName: context.name,
        createdBy: request.createdBy
      }
    });

    // 记录分析数据
    await this.analyticsService.trackEvent({
      event: 'context_created',
      properties: {
        contextId: context.contextId,
        contextType: context.type,
        participantCount: 0,
        createdAt: context.createdAt
      }
    });

    return context;
  }

  async addEnterpriseParticipant(
    contextId: string,
    request: AddEnterpriseParticipantRequest
  ): Promise<Participant> {
    // 企业级权限验证
    await this.validateEnterprisePermissions(contextId, request);

    // 添加参与者
    const participant = await this.contextService.addParticipant(contextId, request);

    // 同步到外部系统
    await this.syncToExternalSystems(contextId, participant);

    return participant;
  }

  private async validateEnterprisePermissions(
    contextId: string,
    request: AddEnterpriseParticipantRequest
  ): Promise<void> {
    // 检查企业策略
    const policyCheck = await this.checkEnterprisePolicy(contextId, request);
    if (!policyCheck.allowed) {
      throw new Error(`企业策略违规: ${policyCheck.reason}`);
    }

    // 检查合规要求
    const complianceCheck = await this.checkComplianceRequirements(request);
    if (!complianceCheck.compliant) {
      throw new Error(`合规检查失败: ${complianceCheck.violations.join(', ')}`);
    }
  }

  private async syncToExternalSystems(
    contextId: string,
    participant: Participant
  ): Promise<void> {
    // 同步到CRM系统
    await this.syncToCRM(contextId, participant);
    
    // 同步到HR系统
    await this.syncToHR(participant);
    
    // 同步到项目管理系统
    await this.syncToProjectManagement(contextId, participant);
  }
}
```

---

## 🔗 相关文档

- [Context模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 生产就绪  

**⚠️ Alpha版本说明**: Context模块集成示例在Alpha版本中提供完整的集成模式。额外的高级集成模式和最佳实践将在Beta版本中添加。
