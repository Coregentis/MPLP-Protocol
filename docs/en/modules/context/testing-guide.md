# Context Module Testing Guide

**Multi-Agent Protocol Lifecycle Platform - Context Module Testing Guide v1.0.0-alpha**

[![Testing](https://img.shields.io/badge/testing-Comprehensive-green.svg)](./README.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![Quality](https://img.shields.io/badge/quality-Enterprise%20Grade-blue.svg)](./performance-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/context/testing-guide.md)

---

## 🎯 Testing Overview

This comprehensive testing guide provides strategies, patterns, and examples for testing the Context Module at all levels - from unit tests to end-to-end integration tests. It covers testing methodologies, test data management, performance testing, and quality assurance practices.

### **Testing Scope**
- **Unit Testing**: Individual component and service testing
- **Integration Testing**: Cross-service and database integration testing
- **API Testing**: REST, GraphQL, and WebSocket API testing
- **Performance Testing**: Load, stress, and scalability testing
- **Security Testing**: Authentication, authorization, and data protection testing
- **End-to-End Testing**: Complete workflow and user scenario testing

### **Testing Standards**
- **Coverage Target**: 95%+ code coverage for critical paths
- **Test Quality**: Comprehensive test scenarios with edge cases
- **Test Automation**: Fully automated test suites with CI/CD integration
- **Test Data**: Realistic test data with proper isolation
- **Performance Benchmarks**: Defined performance targets and validation

---

## 🧪 Unit Testing Strategy

### **Service Layer Testing**

#### **Context Service Unit Tests**
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
    it('should create context successfully', async () => {
      // Arrange
      const createRequest: CreateContextRequest = {
        name: 'test-context',
        type: ContextType.Collaborative,
        configuration: {
          maxParticipants: 10,
          timeoutMs: 3600000
        },
        createdBy: 'user-001'
      };

      const contextEntity = {
        contextId: 'ctx-001',
        name: 'test-context',
        type: ContextType.Collaborative,
        status: ContextStatus.Active,
        participantCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const contextResponse = {
        contextId: 'ctx-001',
        name: 'test-context',
        type: 'collaborative',
        status: 'active',
        participantCount: 0
      };

      validator.validateCreateRequest.mockResolvedValue(undefined);
      repository.create.mockResolvedValue(contextEntity);
      mapper.toResponse.mockReturnValue(contextResponse);
      eventEmitter.emitAsync.mockResolvedValue([]);

      // Act
      const result = await service.createContext(createRequest);

      // Assert
      expect(validator.validateCreateRequest).toHaveBeenCalledWith(createRequest);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-context',
          type: ContextType.Collaborative,
          status: ContextStatus.Creating
        })
      );
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('context.created', {
        contextId: 'ctx-001',
        contextType: ContextType.Collaborative,
        createdBy: 'user-001',
        timestamp: expect.any(String)
      });
      expect(result).toEqual(contextResponse);
    });

    it('should throw error for invalid request', async () => {
      // Arrange
      const invalidRequest: CreateContextRequest = {
        name: '',
        type: ContextType.Collaborative,
        createdBy: 'user-001'
      };

      validator.validateCreateRequest.mockRejectedValue(
        new ValidationError('Context name is required')
      );

      // Act & Assert
      await expect(service.createContext(invalidRequest))
        .rejects
        .toThrow('Context name is required');
      
      expect(repository.create).not.toHaveBeenCalled();
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const createRequest: CreateContextRequest = {
        name: 'test-context',
        type: ContextType.Collaborative,
        createdBy: 'user-001'
      };

      validator.validateCreateRequest.mockResolvedValue(undefined);
      repository.create.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.createContext(createRequest))
        .rejects
        .toThrow('Database connection failed');
      
      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe('getContext', () => {
    it('should return context when found', async () => {
      // Arrange
      const contextId = 'ctx-001';
      const contextEntity = {
        contextId: 'ctx-001',
        name: 'test-context',
        type: ContextType.Collaborative,
        status: ContextStatus.Active
      };
      const contextResponse = {
        contextId: 'ctx-001',
        name: 'test-context',
        type: 'collaborative',
        status: 'active'
      };

      repository.findById.mockResolvedValue(contextEntity);
      mapper.toResponse.mockReturnValue(contextResponse);

      // Act
      const result = await service.getContext(contextId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(contextId);
      expect(mapper.toResponse).toHaveBeenCalledWith(contextEntity);
      expect(result).toEqual(contextResponse);
    });

    it('should return null when context not found', async () => {
      // Arrange
      const contextId = 'ctx-nonexistent';
      repository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getContext(contextId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(contextId);
      expect(mapper.toResponse).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteContext', () => {
    it('should delete context successfully', async () => {
      // Arrange
      const contextId = 'ctx-001';
      
      validator.validateDeletion.mockResolvedValue(undefined);
      repository.delete.mockResolvedValue(undefined);
      eventEmitter.emitAsync.mockResolvedValue([]);

      // Act
      await service.deleteContext(contextId);

      // Assert
      expect(validator.validateDeletion).toHaveBeenCalledWith(contextId);
      expect(repository.delete).toHaveBeenCalledWith(contextId);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('context.deleted', {
        contextId,
        timestamp: expect.any(String)
      });
    });

    it('should throw error when context has active participants', async () => {
      // Arrange
      const contextId = 'ctx-001';
      
      validator.validateDeletion.mockRejectedValue(
        new ValidationError('Cannot delete context with active participants')
      );

      // Act & Assert
      await expect(service.deleteContext(contextId))
        .rejects
        .toThrow('Cannot delete context with active participants');
      
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
```

#### **Participant Service Unit Tests**
```typescript
describe('ParticipantService', () => {
  let service: ParticipantService;
  let participantRepository: jest.Mocked<ParticipantRepository>;
  let contextRepository: jest.Mocked<ContextRepository>;

  beforeEach(async () => {
    // Setup similar to ContextService
  });

  describe('addParticipant', () => {
    it('should add participant successfully', async () => {
      // Arrange
      const contextId = 'ctx-001';
      const participantRequest: AddParticipantRequest = {
        agentId: 'agent-001',
        participantType: ParticipantType.Agent,
        displayName: 'Test Agent',
        capabilities: ['planning', 'analysis'],
        roles: ['contributor']
      };

      const context = {
        contextId: 'ctx-001',
        participantCount: 2,
        configuration: { maxParticipants: 10 }
      };

      const participantEntity = {
        participantId: 'part-001',
        agentId: 'agent-001',
        contextId: 'ctx-001',
        status: ParticipantStatus.Active,
        roles: ['contributor'],
        joinedAt: new Date()
      };

      contextRepository.findById.mockResolvedValue(context);
      participantRepository.create.mockResolvedValue(participantEntity);
      contextRepository.incrementParticipantCount.mockResolvedValue(undefined);

      // Act
      const result = await service.addParticipant(contextId, participantRequest);

      // Assert
      expect(contextRepository.findById).toHaveBeenCalledWith(contextId);
      expect(participantRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-001',
          contextId: 'ctx-001',
          participantType: ParticipantType.Agent
        })
      );
      expect(contextRepository.incrementParticipantCount).toHaveBeenCalledWith(contextId);
      expect(result.participantId).toBe('part-001');
    });

    it('should throw error when context is full', async () => {
      // Arrange
      const contextId = 'ctx-001';
      const participantRequest: AddParticipantRequest = {
        agentId: 'agent-001',
        participantType: ParticipantType.Agent
      };

      const fullContext = {
        contextId: 'ctx-001',
        participantCount: 10,
        configuration: { maxParticipants: 10 }
      };

      contextRepository.findById.mockResolvedValue(fullContext);

      // Act & Assert
      await expect(service.addParticipant(contextId, participantRequest))
        .rejects
        .toThrow('Context is full');
      
      expect(participantRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

---

## 🔗 Integration Testing Strategy

### **Database Integration Tests**

#### **Context Repository Integration Tests**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextRepository } from '../repositories/context.repository';
import { ContextEntity } from '../entities/context.entity';

describe('ContextRepository Integration', () => {
  let repository: ContextRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ContextEntity],
          synchronize: true,
          logging: false
        }),
        TypeOrmModule.forFeature([ContextEntity])
      ],
      providers: [ContextRepository]
    }).compile();

    repository = module.get<ContextRepository>(ContextRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await repository.deleteAll();
  });

  describe('create and findById', () => {
    it('should create and retrieve context', async () => {
      // Arrange
      const contextData = {
        contextId: 'ctx-test-001',
        name: 'Integration Test Context',
        type: ContextType.Collaborative,
        status: ContextStatus.Active,
        participantCount: 0,
        configuration: {
          maxParticipants: 10,
          timeoutMs: 3600000
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      const created = await repository.create(contextData);
      const retrieved = await repository.findById(created.contextId);

      // Assert
      expect(created.contextId).toBe('ctx-test-001');
      expect(created.name).toBe('Integration Test Context');
      expect(retrieved).toBeTruthy();
      expect(retrieved.contextId).toBe('ctx-test-001');
      expect(retrieved.name).toBe('Integration Test Context');
    });

    it('should return null for non-existent context', async () => {
      // Act
      const result = await repository.findById('ctx-nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update context successfully', async () => {
      // Arrange
      const contextData = {
        contextId: 'ctx-test-002',
        name: 'Original Name',
        type: ContextType.Collaborative,
        status: ContextStatus.Active,
        participantCount: 0
      };

      const created = await repository.create(contextData);

      // Act
      const updated = await repository.update(created.contextId, {
        name: 'Updated Name',
        participantCount: 5
      });

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.participantCount).toBe(5);
      expect(updated.contextId).toBe('ctx-test-002');
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent context creation', async () => {
      // Arrange
      const contexts = Array.from({ length: 10 }, (_, i) => ({
        contextId: `ctx-concurrent-${i}`,
        name: `Concurrent Context ${i}`,
        type: ContextType.Collaborative,
        status: ContextStatus.Active,
        participantCount: 0
      }));

      // Act
      const results = await Promise.all(
        contexts.map(context => repository.create(context))
      );

      // Assert
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.contextId).toBe(`ctx-concurrent-${index}`);
        expect(result.name).toBe(`Concurrent Context ${index}`);
      });

      // Verify all contexts were created
      const allContexts = await repository.findAll();
      expect(allContexts).toHaveLength(10);
    });
  });
});
```

### **API Integration Tests**

#### **REST API Integration Tests**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ContextModule } from '../context.module';

describe('Context API Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ContextModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get authentication token for tests
    authToken = await getTestAuthToken();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('POST /api/v1/contexts', () => {
    it('should create context successfully', async () => {
      // Arrange
      const contextData = {
        name: 'API Test Context',
        type: 'collaborative',
        configuration: {
          max_participants: 10,
          timeout_ms: 3600000
        },
        metadata: {
          tags: ['test', 'api'],
          priority: 'normal'
        }
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/contexts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contextData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        context_id: expect.stringMatching(/^ctx-/),
        name: 'API Test Context',
        type: 'collaborative',
        status: 'active',
        participant_count: 0
      });
      expect(response.body.configuration.max_participants).toBe(10);
      expect(response.body.metadata.tags).toEqual(['test', 'api']);
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = {
        name: '', // Invalid: empty name
        type: 'invalid-type',
        configuration: {
          max_participants: -1 // Invalid: negative value
        }
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/contexts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('required')
          })
        ])
      );
    });

    it('should return 401 for unauthorized request', async () => {
      // Arrange
      const contextData = {
        name: 'Unauthorized Test',
        type: 'collaborative'
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/v1/contexts')
        .send(contextData)
        .expect(401);
    });
  });

  describe('GET /api/v1/contexts/:id', () => {
    it('should return context when found', async () => {
      // Arrange
      const context = await createTestContext({
        name: 'Get Test Context',
        type: 'collaborative'
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contexts/${context.contextId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        context_id: context.contextId,
        name: 'Get Test Context',
        type: 'collaborative',
        status: 'active'
      });
    });

    it('should return 404 for non-existent context', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/contexts/ctx-nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/contexts/:id/participants', () => {
    it('should add participant successfully', async () => {
      // Arrange
      const context = await createTestContext({
        name: 'Participant Test Context',
        type: 'collaborative'
      });

      const participantData = {
        agent_id: 'agent-test-001',
        participant_type: 'agent',
        display_name: 'Test Agent',
        capabilities: ['planning', 'analysis'],
        roles: ['contributor']
      };

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/v1/contexts/${context.contextId}/participants`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(participantData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        participant_id: expect.stringMatching(/^part-/),
        agent_id: 'agent-test-001',
        context_id: context.contextId,
        status: 'active',
        roles: ['contributor'],
        capabilities: ['planning', 'analysis']
      });
    });
  });
});
```

---

## ⚡ Performance Testing Strategy

### **Load Testing**

#### **Context Creation Load Test**
```typescript
import { performance } from 'perf_hooks';

describe('Context Performance Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup test application
    app = await setupTestApp();
    authToken = await getTestAuthToken();
  });

  describe('Context Creation Load Test', () => {
    it('should handle 100 concurrent context creations', async () => {
      // Arrange
      const concurrentRequests = 100;
      const contextRequests = Array.from({ length: concurrentRequests }, (_, i) => ({
        name: `Load Test Context ${i}`,
        type: 'collaborative',
        configuration: {
          max_participants: 10,
          timeout_ms: 3600000
        }
      }));

      // Act
      const startTime = performance.now();
      
      const results = await Promise.allSettled(
        contextRequests.map(contextData =>
          request(app.getHttpServer())
            .post('/api/v1/contexts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(contextData)
        )
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 201
      );
      const failed = results.filter(result => result.status === 'rejected');

      expect(successful.length).toBeGreaterThan(95); // 95% success rate
      expect(failed.length).toBeLessThan(5); // Less than 5% failure rate
      expect(duration).toBeLessThan(10000); // Complete within 10 seconds
      
      // Calculate throughput
      const throughput = successful.length / (duration / 1000);
      expect(throughput).toBeGreaterThan(10); // At least 10 contexts/second

      console.log(`Load Test Results:
        - Successful: ${successful.length}/${concurrentRequests}
        - Failed: ${failed.length}/${concurrentRequests}
        - Duration: ${duration.toFixed(2)}ms
        - Throughput: ${throughput.toFixed(2)} contexts/second`);
    });
  });

  describe('Participant Management Load Test', () => {
    it('should handle rapid participant additions', async () => {
      // Arrange
      const context = await createTestContext({
        name: 'Participant Load Test Context',
        type: 'collaborative',
        configuration: { max_participants: 1000 }
      });

      const participantCount = 100;
      const participantRequests = Array.from({ length: participantCount }, (_, i) => ({
        agent_id: `agent-load-${i}`,
        participant_type: 'agent',
        display_name: `Load Test Agent ${i}`,
        roles: ['contributor']
      }));

      // Act
      const startTime = performance.now();
      
      const results = await Promise.allSettled(
        participantRequests.map(participantData =>
          request(app.getHttpServer())
            .post(`/api/v1/contexts/${context.contextId}/participants`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(participantData)
        )
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.status === 201
      );

      expect(successful.length).toBeGreaterThan(95); // 95% success rate
      expect(duration).toBeLessThan(15000); // Complete within 15 seconds

      // Verify final participant count
      const finalContext = await request(app.getHttpServer())
        .get(`/api/v1/contexts/${context.contextId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalContext.body.participant_count).toBe(successful.length);
    });
  });
});
```

### **Memory and Resource Testing**

#### **Memory Leak Detection**
```typescript
describe('Memory and Resource Tests', () => {
  it('should not leak memory during context lifecycle', async () => {
    // Arrange
    const initialMemory = process.memoryUsage();
    const contextCount = 1000;

    // Act - Create and delete many contexts
    for (let i = 0; i < contextCount; i++) {
      const context = await createTestContext({
        name: `Memory Test Context ${i}`,
        type: 'collaborative'
      });

      // Add some participants
      await addTestParticipant(context.contextId, {
        agent_id: `agent-${i}`,
        participant_type: 'agent'
      });

      // Delete context
      await deleteTestContext(context.contextId);

      // Force garbage collection every 100 iterations
      if (i % 100 === 0 && global.gc) {
        global.gc();
      }
    }

    // Force final garbage collection
    if (global.gc) {
      global.gc();
    }

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Assert
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    const memoryIncreasePerContext = memoryIncrease / contextCount;

    // Memory increase should be minimal (less than 1KB per context)
    expect(memoryIncreasePerContext).toBeLessThan(1024);

    console.log(`Memory Test Results:
      - Initial Memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB
      - Final Memory: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB
      - Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB
      - Per Context: ${memoryIncreasePerContext.toFixed(2)} bytes`);
  });
});
```

---

## 🔒 Security Testing Strategy

### **Authentication and Authorization Tests**

#### **Security Test Suite**
```typescript
describe('Context Security Tests', () => {
  describe('Authentication Tests', () => {
    it('should reject requests without authentication', async () => {
      // Test all endpoints without auth token
      const endpoints = [
        { method: 'GET', path: '/api/v1/contexts' },
        { method: 'POST', path: '/api/v1/contexts' },
        { method: 'GET', path: '/api/v1/contexts/ctx-001' },
        { method: 'PUT', path: '/api/v1/contexts/ctx-001' },
        { method: 'DELETE', path: '/api/v1/contexts/ctx-001' }
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .expect(401);
      }
    });

    it('should reject requests with invalid tokens', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-jwt-token',
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid',
        '' // Empty token
      ];

      for (const token of invalidTokens) {
        await request(app.getHttpServer())
          .get('/api/v1/contexts')
          .set('Authorization', token)
          .expect(401);
      }
    });
  });

  describe('Authorization Tests', () => {
    it('should enforce role-based access control', async () => {
      // Test different user roles
      const testCases = [
        {
          role: 'viewer',
          allowedEndpoints: ['GET /api/v1/contexts'],
          forbiddenEndpoints: ['POST /api/v1/contexts', 'DELETE /api/v1/contexts/ctx-001']
        },
        {
          role: 'contributor',
          allowedEndpoints: ['GET /api/v1/contexts', 'POST /api/v1/contexts'],
          forbiddenEndpoints: ['DELETE /api/v1/contexts/ctx-001']
        },
        {
          role: 'admin',
          allowedEndpoints: ['GET /api/v1/contexts', 'POST /api/v1/contexts', 'DELETE /api/v1/contexts/ctx-001'],
          forbiddenEndpoints: []
        }
      ];

      for (const testCase of testCases) {
        const token = await getTestAuthToken(testCase.role);

        // Test allowed endpoints
        for (const endpoint of testCase.allowedEndpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).not.toBe(403);
        }

        // Test forbidden endpoints
        for (const endpoint of testCase.forbiddenEndpoints) {
          const [method, path] = endpoint.split(' ');
          await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${token}`)
            .expect(403);
        }
      }
    });
  });

  describe('Input Validation Security Tests', () => {
    it('should prevent SQL injection attacks', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE contexts; --",
        "' OR '1'='1",
        "'; INSERT INTO contexts VALUES ('malicious'); --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/contexts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            type: 'collaborative'
          });

        // Should either reject the input or sanitize it
        expect(response.status).not.toBe(500);
        
        if (response.status === 201) {
          // If accepted, ensure it was sanitized
          expect(response.body.name).not.toContain('DROP TABLE');
          expect(response.body.name).not.toContain('INSERT INTO');
        }
      }
    });

    it('should prevent XSS attacks', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/contexts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            type: 'collaborative',
            description: payload
          });

        if (response.status === 201) {
          // Ensure XSS payloads are sanitized
          expect(response.body.name).not.toContain('<script>');
          expect(response.body.description).not.toContain('<script>');
        }
      }
    });
  });
});
```

---

## 🔗 Related Documentation

- [Context Module Overview](./README.md) - Module overview and architecture
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Testing Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Coverage**: 100% comprehensive  

**⚠️ Alpha Notice**: This testing guide provides comprehensive testing strategies and examples in Alpha release. Additional testing patterns and tools will be added based on community feedback in Beta release.
