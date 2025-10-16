# Context模块实施指南

> **🌐 语言导航**: [English](../../../en/modules/context/implementation-guide.md) | [中文](implementation-guide.md)



**多智能体协议生命周期平台 - Context模块实施指南 v1.0.0-alpha**

[![实施](https://img.shields.io/badge/implementation-Production%20Ready-green.svg)](./README.md)
[![模块](https://img.shields.io/badge/module-Context-green.svg)](./protocol-specification.md)
[![示例](https://img.shields.io/badge/examples-Complete-blue.svg)](./integration-examples.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/context/implementation-guide.md)

---

## 🎯 实施概览

本指南提供Context模块的全面实施指导，包括架构模式、代码示例、最佳实践和集成策略。涵盖基础实施场景和高级企业级部署。

### **实施范围**
- **核心服务**: Context、Participant、Session和Metadata服务
- **数据层**: 存储库模式和数据持久化策略
- **集成层**: 跨模块集成和事件处理
- **性能层**: 缓存、优化和可扩展性模式
- **安全层**: 身份验证、授权和数据保护

### **目标实施**
- **独立服务**: 独立的Context模块部署
- **微服务架构**: Context模块作为MPLP生态系统的一部分
- **嵌入式集成**: Context模块嵌入到应用程序中
- **云原生部署**: Kubernetes和基于容器的部署

---

## 🏗️ 架构实施

### **核心服务实施**

#### **Context服务实施**
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
    this.logger.log(`创建上下文: ${request.name}`);

    // 验证请求
    await this.contextValidator.validateCreateRequest(request);

    // 创建上下文实体
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

    // 保存到存储库
    const context = await this.contextRepository.create(contextData);

    // 转换到活动状态
    await this.transitionContextState(context.contextId, ContextStatus.Active);

    // 发出上下文创建事件
    await this.eventEmitter.emitAsync('context.created', {
      contextId: context.contextId,
      contextType: context.type,
      createdBy: request.createdBy,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`上下文创建成功: ${context.contextId}`);
    return this.contextMapper.toResponse(context);
  }

  async getContext(contextId: string): Promise<Context | null> {
    this.logger.debug(`检索上下文: ${contextId}`);

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
    this.logger.log(`更新上下文: ${contextId}`);

    // 验证更新请求
    await this.contextValidator.validateUpdateRequest(contextId, updates);

    // 获取现有上下文
    const existingContext = await this.contextRepository.findById(contextId);
    if (!existingContext) {
      throw new Error(`上下文未找到: ${contextId}`);
    }

    // 构建更新数据
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // 执行更新
    const updatedContext = await this.contextRepository.update(contextId, updateData);

    // 发出上下文更新事件
    await this.eventEmitter.emitAsync('context.updated', {
      contextId: contextId,
      changes: Object.keys(updates),
      updatedBy: updates.updatedBy,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`上下文更新成功: ${contextId}`);
    return this.contextMapper.toResponse(updatedContext);
  }

  async deleteContext(contextId: string): Promise<void> {
    this.logger.log(`删除上下文: ${contextId}`);

    // 验证删除权限
    await this.contextValidator.validateDeleteRequest(contextId);

    // 清理相关资源
    await this.cleanupContextResources(contextId);

    // 删除上下文
    await this.contextRepository.delete(contextId);

    // 发出上下文删除事件
    await this.eventEmitter.emitAsync('context.deleted', {
      contextId: contextId,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`上下文删除成功: ${contextId}`);
  }

  private generateContextId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ctx-${timestamp}-${random}`;
  }

  private buildConfiguration(config?: ContextConfiguration): ContextConfiguration {
    return {
      maxParticipants: config?.maxParticipants || 10,
      maxSessions: config?.maxSessions || 5,
      timeoutMs: config?.timeoutMs || 3600000,
      persistenceLevel: config?.persistenceLevel || 'session',
      isolationLevel: config?.isolationLevel || 'shared',
      autoCleanup: config?.autoCleanup ?? true,
      ...config
    };
  }

  private async transitionContextState(
    contextId: string, 
    newStatus: ContextStatus
  ): Promise<void> {
    await this.contextRepository.updateStatus(contextId, newStatus);
    
    await this.eventEmitter.emitAsync('context.state_changed', {
      contextId: contextId,
      newStatus: newStatus,
      timestamp: new Date().toISOString()
    });
  }

  private async cleanupContextResources(contextId: string): Promise<void> {
    // 清理参与者
    await this.contextRepository.removeAllParticipants(contextId);
    
    // 清理会话
    await this.contextRepository.removeAllSessions(contextId);
    
    // 清理元数据
    await this.contextRepository.clearMetadata(contextId);
  }
}
```

#### **参与者管理服务实施**
```typescript
@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly contextService: ContextService,
    private readonly roleService: RoleService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async addParticipant(
    contextId: string, 
    request: AddParticipantRequest
  ): Promise<Participant> {
    this.logger.log(`添加参与者到上下文: ${contextId}`);

    // 验证上下文存在
    const context = await this.contextService.getContext(contextId);
    if (!context) {
      throw new Error(`上下文未找到: ${contextId}`);
    }

    // 验证参与者权限
    await this.validateParticipantPermissions(contextId, request);

    // 创建参与者实体
    const participantData = {
      participantId: this.generateParticipantId(),
      contextId: contextId,
      userId: request.userId,
      role: request.role,
      capabilities: request.capabilities || [],
      status: ParticipantStatus.Active,
      joinedAt: new Date(),
      lastActivityAt: new Date()
    };

    // 保存参与者
    const participant = await this.participantRepository.create(participantData);

    // 发出参与者加入事件
    await this.eventEmitter.emitAsync('participant.joined', {
      contextId: contextId,
      participantId: participant.participantId,
      userId: request.userId,
      role: request.role,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`参与者添加成功: ${participant.participantId}`);
    return participant;
  }

  async removeParticipant(
    contextId: string, 
    participantId: string
  ): Promise<void> {
    this.logger.log(`从上下文移除参与者: ${contextId}/${participantId}`);

    // 验证参与者存在
    const participant = await this.participantRepository.findById(participantId);
    if (!participant || participant.contextId !== contextId) {
      throw new Error(`参与者未找到: ${participantId}`);
    }

    // 清理参与者资源
    await this.cleanupParticipantResources(participantId);

    // 移除参与者
    await this.participantRepository.delete(participantId);

    // 发出参与者离开事件
    await this.eventEmitter.emitAsync('participant.left', {
      contextId: contextId,
      participantId: participantId,
      userId: participant.userId,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`参与者移除成功: ${participantId}`);
  }

  async updateParticipantRole(
    participantId: string, 
    newRole: string
  ): Promise<Participant> {
    this.logger.log(`更新参与者角色: ${participantId} -> ${newRole}`);

    // 验证角色权限
    await this.roleService.validateRole(newRole);

    // 更新参与者角色
    const updatedParticipant = await this.participantRepository.updateRole(
      participantId, 
      newRole
    );

    // 发出角色更新事件
    await this.eventEmitter.emitAsync('participant.role_updated', {
      participantId: participantId,
      newRole: newRole,
      timestamp: new Date().toISOString()
    });

    return updatedParticipant;
  }

  private generateParticipantId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `part-${timestamp}-${random}`;
  }

  private async validateParticipantPermissions(
    contextId: string, 
    request: AddParticipantRequest
  ): Promise<void> {
    // 检查上下文参与者限制
    const participantCount = await this.participantRepository.countByContext(contextId);
    const context = await this.contextService.getContext(contextId);
    
    if (participantCount >= context.configuration.maxParticipants) {
      throw new Error(`上下文参与者数量已达上限: ${context.configuration.maxParticipants}`);
    }

    // 验证角色权限
    if (request.role) {
      await this.roleService.validateRole(request.role);
    }

    // 检查重复参与
    const existingParticipant = await this.participantRepository.findByUserAndContext(
      request.userId, 
      contextId
    );
    if (existingParticipant) {
      throw new Error(`用户已是该上下文的参与者: ${request.userId}`);
    }
  }

  private async cleanupParticipantResources(participantId: string): Promise<void> {
    // 清理参与者的活动会话
    await this.participantRepository.clearActiveSessions(participantId);
    
    // 清理参与者的任务
    await this.participantRepository.clearTasks(participantId);
    
    // 更新最后活动时间
    await this.participantRepository.updateLastActivity(participantId, new Date());
  }
}
```

---

## 🔧 数据层实施

### **存储库模式实施**

```typescript
// Context存储库实施
@Injectable()
export class ContextRepository {
  constructor(
    @InjectRepository(ContextEntity)
    private readonly contextRepo: Repository<ContextEntity>,
    private readonly cacheService: CacheService
  ) {}

  async create(contextData: CreateContextData): Promise<ContextEntity> {
    const context = this.contextRepo.create(contextData);
    const savedContext = await this.contextRepo.save(context);
    
    // 缓存新创建的上下文
    await this.cacheService.set(
      `context:${savedContext.contextId}`, 
      savedContext, 
      3600
    );
    
    return savedContext;
  }

  async findById(contextId: string): Promise<ContextEntity | null> {
    // 首先检查缓存
    const cached = await this.cacheService.get<ContextEntity>(`context:${contextId}`);
    if (cached) {
      return cached;
    }

    // 从数据库查询
    const context = await this.contextRepo.findOne({
      where: { contextId },
      relations: ['participants', 'sessions']
    });

    if (context) {
      // 缓存查询结果
      await this.cacheService.set(`context:${contextId}`, context, 3600);
    }

    return context;
  }

  async update(contextId: string, updates: Partial<ContextEntity>): Promise<ContextEntity> {
    await this.contextRepo.update({ contextId }, updates);
    
    // 清除缓存
    await this.cacheService.delete(`context:${contextId}`);
    
    // 返回更新后的实体
    return this.findById(contextId);
  }

  async delete(contextId: string): Promise<void> {
    await this.contextRepo.delete({ contextId });
    
    // 清除缓存
    await this.cacheService.delete(`context:${contextId}`);
  }
}
```

---

## 🔗 相关文档

- [Context模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略
- [集成示例](./integration-examples.md) - 集成示例

---

**实施版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 生产就绪  

**⚠️ Alpha版本说明**: Context模块实施指南在Alpha版本中提供生产就绪的实施指导。额外的高级实施模式和优化将在Beta版本中添加。
