# Context模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/context/testing-guide.md) | [中文](testing-guide.md)



**多智能体协议生命周期平台 - Context模块测试指南 v1.0.0-alpha**

[![测试](https://img.shields.io/badge/testing-Comprehensive-green.svg)](./README.md)
[![覆盖率](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![质量](https://img.shields.io/badge/quality-Enterprise%20Grade-blue.svg)](./performance-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/context/testing-guide.md)

---

## 🎯 测试概览

本综合测试指南提供了在所有级别测试Context模块的策略、模式和示例——从单元测试到端到端集成测试。涵盖测试方法论、测试数据管理、性能测试和质量保证实践。

### **测试范围**
- **单元测试**: 单个组件和服务测试
- **集成测试**: 跨服务和数据库集成测试
- **API测试**: REST、GraphQL和WebSocket API测试
- **性能测试**: 负载、压力和可扩展性测试
- **安全测试**: 身份验证、授权和数据保护测试
- **端到端测试**: 完整工作流和用户场景测试

### **测试标准**
- **覆盖率目标**: 关键路径95%+代码覆盖率
- **测试质量**: 包含边界情况的全面测试场景
- **测试自动化**: 与CI/CD集成的完全自动化测试套件
- **测试数据**: 具有适当隔离的真实测试数据
- **性能基准**: 定义的性能目标和验证

---

## 🧪 单元测试策略

### **服务层测试**

#### **Context服务单元测试**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from '../services/context.service';
import { ContextRepository } from '../repositories/context.repository';
import { ContextValidator } from '../validators/context.validator';
import { ContextMapper } from '../mappers/context.mapper';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ContextService', () => {
  let service: ContextService;
  let repository: jest.Mocked<ContextRepository>;
  let validator: jest.Mocked<ContextValidator>;
  let mapper: jest.Mocked<ContextMapper>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextService,
        {
          provide: ContextRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            incrementParticipantCount: jest.fn(),
            decrementParticipantCount: jest.fn()
          }
        },
        {
          provide: ContextValidator,
          useValue: {
            validateCreateRequest: jest.fn(),
            validateUpdateRequest: jest.fn(),
            validateDeletion: jest.fn()
          }
        },
        {
          provide: ContextMapper,
          useValue: {
            toResponse: jest.fn(),
            toEntity: jest.fn()
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<ContextService>(ContextService);
    repository = module.get(ContextRepository);
    validator = module.get(ContextValidator);
    mapper = module.get(ContextMapper);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('createContext', () => {
    it('应该成功创建上下文', async () => {
      // 准备测试数据
      const createRequest = {
        name: '测试上下文',
        type: 'collaboration',
        configuration: {
          maxParticipants: 10,
          maxSessions: 5
        },
        metadata: { project: 'test-project' },
        createdBy: 'user-123'
      };

      const mockEntity = {
        contextId: 'ctx-123',
        name: '测试上下文',
        type: 'collaboration',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse = {
        contextId: 'ctx-123',
        name: '测试上下文',
        type: 'collaboration',
        status: 'active'
      };

      // 设置模拟
      validator.validateCreateRequest.mockResolvedValue(undefined);
      repository.create.mockResolvedValue(mockEntity);
      mapper.toResponse.mockReturnValue(mockResponse);
      eventEmitter.emitAsync.mockResolvedValue([]);

      // 执行测试
      const result = await service.createContext(createRequest);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(validator.validateCreateRequest).toHaveBeenCalledWith(createRequest);
      expect(repository.create).toHaveBeenCalled();
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('context.created', expect.any(Object));
    });

    it('应该在验证失败时抛出错误', async () => {
      const createRequest = {
        name: '',
        type: 'invalid',
        createdBy: 'user-123'
      };

      validator.validateCreateRequest.mockRejectedValue(new Error('验证失败'));

      await expect(service.createContext(createRequest)).rejects.toThrow('验证失败');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      const createRequest = {
        name: '测试上下文',
        type: 'collaboration',
        createdBy: 'user-123'
      };

      validator.validateCreateRequest.mockResolvedValue(undefined);
      repository.create.mockRejectedValue(new Error('数据库错误'));

      await expect(service.createContext(createRequest)).rejects.toThrow('数据库错误');
    });
  });

  describe('getContext', () => {
    it('应该返回存在的上下文', async () => {
      const contextId = 'ctx-123';
      const mockEntity = {
        contextId: 'ctx-123',
        name: '测试上下文',
        type: 'collaboration'
      };
      const mockResponse = {
        contextId: 'ctx-123',
        name: '测试上下文',
        type: 'collaboration'
      };

      repository.findById.mockResolvedValue(mockEntity);
      mapper.toResponse.mockReturnValue(mockResponse);

      const result = await service.getContext(contextId);

      expect(result).toEqual(mockResponse);
      expect(repository.findById).toHaveBeenCalledWith(contextId);
    });

    it('应该在上下文不存在时返回null', async () => {
      const contextId = 'non-existent';

      repository.findById.mockResolvedValue(null);

      const result = await service.getContext(contextId);

      expect(result).toBeNull();
    });
  });
});
```

#### **参与者服务单元测试**
```typescript
describe('ParticipantService', () => {
  let service: ParticipantService;
  let repository: jest.Mocked<ParticipantRepository>;
  let contextService: jest.Mocked<ContextService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        {
          provide: ParticipantRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByContext: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        },
        {
          provide: ContextService,
          useValue: {
            getContext: jest.fn(),
            incrementParticipantCount: jest.fn(),
            decrementParticipantCount: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    repository = module.get(ParticipantRepository);
    contextService = module.get(ContextService);
  });

  describe('addParticipant', () => {
    it('应该成功添加参与者', async () => {
      const contextId = 'ctx-123';
      const addRequest = {
        userId: 'user-456',
        role: 'collaborator',
        capabilities: ['read', 'write']
      };

      const mockContext = {
        contextId: 'ctx-123',
        name: '测试上下文',
        configuration: { maxParticipants: 10 }
      };

      const mockParticipant = {
        participantId: 'part-789',
        contextId: 'ctx-123',
        userId: 'user-456',
        role: 'collaborator',
        status: 'active'
      };

      contextService.getContext.mockResolvedValue(mockContext);
      repository.create.mockResolvedValue(mockParticipant);
      contextService.incrementParticipantCount.mockResolvedValue(undefined);

      const result = await service.addParticipant(contextId, addRequest);

      expect(result).toEqual(mockParticipant);
      expect(contextService.getContext).toHaveBeenCalledWith(contextId);
      expect(repository.create).toHaveBeenCalled();
      expect(contextService.incrementParticipantCount).toHaveBeenCalledWith(contextId);
    });

    it('应该在上下文不存在时抛出错误', async () => {
      const contextId = 'non-existent';
      const addRequest = {
        userId: 'user-456',
        role: 'collaborator'
      };

      contextService.getContext.mockResolvedValue(null);

      await expect(service.addParticipant(contextId, addRequest)).rejects.toThrow('上下文未找到');
    });
  });
});
```

---

## 🔗 集成测试

### **数据库集成测试**

```typescript
describe('Context Database Integration', () => {
  let app: INestApplication;
  let contextService: ContextService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT || '5433'),
          username: process.env.TEST_DB_USER || 'test',
          password: process.env.TEST_DB_PASS || 'test',
          database: process.env.TEST_DB_NAME || 'context_test',
          entities: [ContextEntity, ParticipantEntity],
          synchronize: true,
          dropSchema: true
        }),
        ContextModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    contextService = app.get<ContextService>(ContextService);
    dataSource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await dataSource.query('TRUNCATE TABLE contexts CASCADE');
    await dataSource.query('TRUNCATE TABLE participants CASCADE');
  });

  it('应该创建和检索上下文', async () => {
    // 创建上下文
    const createRequest = {
      name: '集成测试上下文',
      type: 'integration_test',
      configuration: {
        maxParticipants: 5,
        maxSessions: 3
      },
      createdBy: 'test-user'
    };

    const createdContext = await contextService.createContext(createRequest);

    expect(createdContext).toBeDefined();
    expect(createdContext.name).toBe('集成测试上下文');
    expect(createdContext.type).toBe('integration_test');

    // 检索上下文
    const retrievedContext = await contextService.getContext(createdContext.contextId);

    expect(retrievedContext).toBeDefined();
    expect(retrievedContext.contextId).toBe(createdContext.contextId);
    expect(retrievedContext.name).toBe('集成测试上下文');
  });

  it('应该处理并发上下文创建', async () => {
    const createRequests = Array.from({ length: 10 }, (_, i) => ({
      name: `并发测试上下文 ${i}`,
      type: 'concurrent_test',
      createdBy: `test-user-${i}`
    }));

    // 并发创建多个上下文
    const createdContexts = await Promise.all(
      createRequests.map(request => contextService.createContext(request))
    );

    expect(createdContexts).toHaveLength(10);
    
    // 验证所有上下文都被正确创建
    for (const context of createdContexts) {
      const retrieved = await contextService.getContext(context.contextId);
      expect(retrieved).toBeDefined();
    }
  });
});
```

### **API集成测试**

```typescript
describe('Context API Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ContextModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /contexts', () => {
    it('应该创建新上下文', async () => {
      const createRequest = {
        name: 'API测试上下文',
        type: 'api_test',
        configuration: {
          maxParticipants: 8
        }
      };

      const response = await request(app.getHttpServer())
        .post('/contexts')
        .send(createRequest)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'API测试上下文',
        type: 'api_test',
        status: 'active'
      });
      expect(response.body.contextId).toBeDefined();
    });

    it('应该验证请求数据', async () => {
      const invalidRequest = {
        name: '', // 空名称
        type: 'invalid_type'
      };

      await request(app.getHttpServer())
        .post('/contexts')
        .send(invalidRequest)
        .expect(400);
    });
  });

  describe('GET /contexts/:id', () => {
    it('应该返回存在的上下文', async () => {
      // 首先创建一个上下文
      const createResponse = await request(app.getHttpServer())
        .post('/contexts')
        .send({
          name: '获取测试上下文',
          type: 'get_test'
        })
        .expect(201);

      const contextId = createResponse.body.contextId;

      // 然后获取它
      const getResponse = await request(app.getHttpServer())
        .get(`/contexts/${contextId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        contextId: contextId,
        name: '获取测试上下文',
        type: 'get_test'
      });
    });

    it('应该在上下文不存在时返回404', async () => {
      await request(app.getHttpServer())
        .get('/contexts/non-existent-id')
        .expect(404);
    });
  });
});
```

---

## ⚡ 性能测试

### **负载测试**

```typescript
describe('Context Performance Tests', () => {
  let app: INestApplication;
  let contextService: ContextService;

  beforeAll(async () => {
    // 设置性能测试环境
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ContextModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    contextService = app.get<ContextService>(ContextService);
  });

  it('应该在负载下保持性能', async () => {
    const startTime = Date.now();
    const concurrentRequests = 100;
    const requestsPerBatch = 10;

    // 创建多批并发请求
    const batches = Array.from({ length: concurrentRequests / requestsPerBatch }, (_, batchIndex) => {
      return Array.from({ length: requestsPerBatch }, (_, requestIndex) => {
        const index = batchIndex * requestsPerBatch + requestIndex;
        return contextService.createContext({
          name: `负载测试上下文 ${index}`,
          type: 'load_test',
          createdBy: `test-user-${index}`
        });
      });
    });

    // 执行所有批次
    const results = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / concurrentRequests;

    expect(results).toHaveLength(concurrentRequests);
    expect(averageTime).toBeLessThan(100); // 平均响应时间应小于100ms
    
    console.log(`负载测试结果: ${concurrentRequests}个请求在${totalTime}ms内完成，平均${averageTime}ms/请求`);
  });
});
```

---

## 🔗 相关文档

- [Context模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [集成示例](./integration-examples.md) - 集成示例

---

**测试版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 全面覆盖  

**⚠️ Alpha版本说明**: Context模块测试指南在Alpha版本中提供全面的测试策略。额外的高级测试模式和自动化功能将在Beta版本中添加。
